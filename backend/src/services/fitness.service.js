import { query } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";

function resolveCompanyId(data = {}, requestUser) {
  if (requestUser.role === "super_admin") {
    if (data.company_id) return data.company_id;
    throw new ApiError(400, "Selecciona una empresa fitness para operar");
  }

  return requestUser.companyId;
}

function pageParams(filters) {
  const page = Number(filters.page ?? 1);
  const pageSize = Number(filters.page_size ?? 20);
  return { page, pageSize, offset: (page - 1) * pageSize };
}

async function getClientScope(requestUser, filters = {}) {
  if (requestUser.role !== "client") {
    return filters.client_id ?? null;
  }

  const { rows } = await query(
    `
      select id
      from fitness_clients
      where user_id = $1
        and company_id = $2
        and deleted_at is null
      limit 1
    `,
    [requestUser.id, requestUser.companyId]
  );

  if (!rows[0]) {
    throw new ApiError(403, "No tienes un perfil fitness asociado");
  }

  if (filters.client_id && filters.client_id !== rows[0].id) {
    throw new ApiError(403, "No puedes acceder al progreso de otro deportista");
  }

  return rows[0].id;
}

async function assertCompanyRecord(table, id, requestUser) {
  const { rows } = await query(`select * from ${table} where id = $1 limit 1`, [id]);
  const record = rows[0];

  if (!record || record.deleted_at) {
    throw new ApiError(404, "Registro fitness no encontrado");
  }

  if (requestUser.role !== "super_admin" && record.company_id !== requestUser.companyId) {
    throw new ApiError(403, "No puedes acceder a informacion de otra empresa");
  }

  return record;
}

export async function getFitnessDashboard(requestUser, filters = {}) {
  const companyId = resolveCompanyId(filters, requestUser);
  const scopedClientId = await getClientScope(requestUser, filters);
  const clientFilter = scopedClientId ? "and fc.id = $2" : "";
  const clientParams = scopedClientId ? [companyId, scopedClientId] : [companyId];

  const [cards, recentLogs, compliance, records] = await Promise.all([
    query(
      `
        select
          count(distinct fc.id)::int as active_clients,
          count(distinct wp.id)::int as active_programs,
          count(wl.id)::int as workouts_30d,
          count(wl.id) filter (where wl.status = 'partial')::int as partial_workouts
        from fitness_clients fc
        left join workout_programs wp on wp.fitness_client_id = fc.id
          and wp.deleted_at is null
          and wp.status = 'active'
        left join workout_logs wl on wl.fitness_client_id = fc.id
          and wl.deleted_at is null
          and wl.performed_on >= current_date - interval '30 days'
        where fc.company_id = $1
          and fc.deleted_at is null
          and fc.status = 'active'
          ${clientFilter}
      `,
      clientParams
    ),
    query(
      `
        select wl.*, fc.full_name as client_name, e.name as exercise_name, e.muscle_group
        from workout_logs wl
        join fitness_clients fc on fc.id = wl.fitness_client_id
        left join exercises e on e.id = wl.exercise_id
        where wl.company_id = $1
          and wl.deleted_at is null
          ${scopedClientId ? "and wl.fitness_client_id = $2" : ""}
        order by wl.performed_on desc, wl.created_at desc
        limit 8
      `,
      clientParams
    ),
    query(
      `
        select
          to_char(day::date, 'Dy') as label,
          coalesce(count(wl.id), 0)::int as workouts
        from generate_series(current_date - interval '6 days', current_date, interval '1 day') as day
        left join workout_logs wl on wl.performed_on = day::date
          and wl.company_id = $1
          and wl.deleted_at is null
          ${scopedClientId ? "and wl.fitness_client_id = $2" : ""}
        group by day
        order by day
      `,
      clientParams
    ),
    query(
      `
        select e.name as exercise_name, max(wl.weight_used) as max_weight
        from workout_logs wl
        join exercises e on e.id = wl.exercise_id
        where wl.company_id = $1
          and wl.deleted_at is null
          and wl.weight_used is not null
          ${scopedClientId ? "and wl.fitness_client_id = $2" : ""}
        group by e.name
        order by max_weight desc
        limit 6
      `,
      clientParams
    )
  ]);

  const card = cards.rows[0] ?? {};
  const workouts = Number(card.workouts_30d ?? 0);
  const partial = Number(card.partial_workouts ?? 0);
  const completion = workouts > 0 ? Math.round(((workouts - partial) / workouts) * 100) : 0;

  return {
    cards: {
      activeClients: Number(card.active_clients ?? 0),
      activePrograms: Number(card.active_programs ?? 0),
      workouts30d: workouts,
      completion
    },
    recentLogs: recentLogs.rows.map((row) => ({
      ...row,
      sets_completed: Number(row.sets_completed),
      reps_completed: Number(row.reps_completed),
      weight_used: row.weight_used === null ? null : Number(row.weight_used),
      rir: row.rir === null ? null : Number(row.rir),
      rpe: row.rpe === null ? null : Number(row.rpe)
    })),
    weeklyCompliance: compliance.rows.map((row) => ({ ...row, workouts: Number(row.workouts) })),
    personalRecords: records.rows.map((row) => ({
      exercise_name: row.exercise_name,
      max_weight: Number(row.max_weight)
    }))
  };
}

export async function listFitnessClients(requestUser, filters = {}) {
  const companyId = resolveCompanyId(filters, requestUser);
  const params = [companyId];
  const where = ["company_id = $1", "deleted_at is null"];
  let index = 2;
  const scopedClientId = await getClientScope(requestUser, filters);

  if (scopedClientId) {
    where.push(`id = $${index++}`);
    params.push(scopedClientId);
  }

  if (filters.search) {
    where.push(`(full_name ilike $${index} or coalesce(email, '') ilike $${index} or coalesce(phone, '') ilike $${index})`);
    params.push(`%${filters.search}%`);
    index += 1;
  }

  if (filters.status) {
    where.push(`status = $${index++}`);
    params.push(filters.status);
  }

  const { page, pageSize, offset } = pageParams(filters);
  const base = [...params];
  const { rows } = await query(
    `
      select *
      from fitness_clients
      where ${where.join(" and ")}
      order by status asc, full_name asc
      limit $${base.length + 1} offset $${base.length + 2}
    `,
    [...base, pageSize, offset]
  );
  const count = await query(`select count(*)::int as total from fitness_clients where ${where.join(" and ")}`, base);

  return { items: rows, pagination: { page, page_size: pageSize, total: Number(count.rows[0].total) } };
}

export async function createFitnessClient(data, requestUser) {
  const companyId = resolveCompanyId(data, requestUser);
  const { rows } = await query(
    `
      insert into fitness_clients
        (company_id, user_id, full_name, email, phone, weight_kg, height_cm, goal, experience_level, injuries, status, notes)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      returning *
    `,
    [
      companyId,
      data.user_id ?? null,
      data.full_name,
      data.email || null,
      data.phone ?? null,
      data.weight_kg ?? null,
      data.height_cm ?? null,
      data.goal ?? null,
      data.experience_level ?? "beginner",
      data.injuries ?? null,
      data.status ?? "active",
      data.notes ?? null
    ]
  );
  return rows[0];
}

export async function updateFitnessClient(id, data, requestUser) {
  const current = await assertCompanyRecord("fitness_clients", id, requestUser);
  const companyId = data.company_id ? resolveCompanyId(data, requestUser) : current.company_id;
  const { rows } = await query(
    `
      update fitness_clients
      set company_id=$2, user_id=$3, full_name=$4, email=$5, phone=$6, weight_kg=$7, height_cm=$8,
          goal=$9, experience_level=$10, injuries=$11, status=$12, notes=$13, updated_at=now()
      where id=$1
      returning *
    `,
    [
      id,
      companyId,
      data.user_id !== undefined ? data.user_id : current.user_id,
      data.full_name ?? current.full_name,
      data.email !== undefined ? data.email || null : current.email,
      data.phone !== undefined ? data.phone : current.phone,
      data.weight_kg !== undefined ? data.weight_kg : current.weight_kg,
      data.height_cm !== undefined ? data.height_cm : current.height_cm,
      data.goal !== undefined ? data.goal : current.goal,
      data.experience_level ?? current.experience_level,
      data.injuries !== undefined ? data.injuries : current.injuries,
      data.status ?? current.status,
      data.notes !== undefined ? data.notes : current.notes
    ]
  );
  return rows[0];
}

export async function deleteFitnessClient(id, requestUser) {
  await assertCompanyRecord("fitness_clients", id, requestUser);
  const { rows } = await query(
    `update fitness_clients set status='inactive', deleted_at=now(), updated_at=now() where id=$1 returning id`,
    [id]
  );
  return rows[0];
}

export async function listExercises(requestUser, filters = {}) {
  const companyId = resolveCompanyId(filters, requestUser);
  const params = [companyId];
  let index = 2;
  const where = ["company_id = $1", "deleted_at is null"];

  if (filters.search) {
    where.push(`(name ilike $${index} or muscle_group ilike $${index} or coalesce(equipment, '') ilike $${index})`);
    params.push(`%${filters.search}%`);
    index += 1;
  }

  const { page, pageSize, offset } = pageParams(filters);
  const base = [...params];
  const items = await query(
    `select * from exercises where ${where.join(" and ")} order by muscle_group asc, name asc limit $${base.length + 1} offset $${base.length + 2}`,
    [...base, pageSize, offset]
  );
  const count = await query(`select count(*)::int as total from exercises where ${where.join(" and ")}`, base);
  return { items: items.rows, pagination: { page, page_size: pageSize, total: Number(count.rows[0].total) } };
}

export async function createExercise(data, requestUser) {
  const companyId = resolveCompanyId(data, requestUser);
  const { rows } = await query(
    `
      insert into exercises (company_id, name, muscle_group, instructions, equipment, video_url, active)
      values ($1,$2,$3,$4,$5,$6,$7)
      returning *
    `,
    [companyId, data.name, data.muscle_group, data.instructions ?? null, data.equipment ?? null, data.video_url ?? null, data.active ?? true]
  );
  return rows[0];
}

export async function updateExercise(id, data, requestUser) {
  const current = await assertCompanyRecord("exercises", id, requestUser);
  const { rows } = await query(
    `
      update exercises
      set name=$2, muscle_group=$3, instructions=$4, equipment=$5, video_url=$6, active=$7, updated_at=now()
      where id=$1
      returning *
    `,
    [
      id,
      data.name ?? current.name,
      data.muscle_group ?? current.muscle_group,
      data.instructions !== undefined ? data.instructions : current.instructions,
      data.equipment !== undefined ? data.equipment : current.equipment,
      data.video_url !== undefined ? data.video_url : current.video_url,
      data.active ?? current.active
    ]
  );
  return rows[0];
}

export async function deleteExercise(id, requestUser) {
  await assertCompanyRecord("exercises", id, requestUser);
  const { rows } = await query(
    `update exercises set active=false, deleted_at=now(), updated_at=now() where id=$1 returning id`,
    [id]
  );
  return rows[0];
}

export async function listPrograms(requestUser, filters = {}) {
  const companyId = resolveCompanyId(filters, requestUser);
  const params = [companyId];
  const where = ["wp.company_id = $1", "wp.deleted_at is null"];
  let index = 2;
  const scopedClientId = await getClientScope(requestUser, filters);

  if (scopedClientId) {
    where.push(`wp.fitness_client_id = $${index++}`);
    params.push(scopedClientId);
  }
  if (filters.search) {
    where.push(`(wp.name ilike $${index} or coalesce(fc.full_name, '') ilike $${index})`);
    params.push(`%${filters.search}%`);
  }

  const { page, pageSize, offset } = pageParams(filters);
  const base = [...params];
  const items = await query(
    `
      select wp.*, fc.full_name as client_name,
             count(distinct ww.id)::int as weeks_count,
             count(distinct wd.id)::int as days_count
      from workout_programs wp
      left join fitness_clients fc on fc.id = wp.fitness_client_id
      left join workout_weeks ww on ww.program_id = wp.id and ww.deleted_at is null
      left join workout_days wd on wd.week_id = ww.id and wd.deleted_at is null
      where ${where.join(" and ")}
      group by wp.id, fc.full_name
      order by wp.created_at desc
      limit $${base.length + 1} offset $${base.length + 2}
    `,
    [...base, pageSize, offset]
  );
  const count = await query(`select count(*)::int as total from workout_programs wp left join fitness_clients fc on fc.id = wp.fitness_client_id where ${where.join(" and ")}`, base);
  return { items: items.rows, pagination: { page, page_size: pageSize, total: Number(count.rows[0].total) } };
}

export async function getProgramDetail(id, requestUser) {
  const program = await assertCompanyRecord("workout_programs", id, requestUser);
  const scopedClientId = await getClientScope(requestUser, { client_id: program.fitness_client_id });

  if (scopedClientId && program.fitness_client_id !== scopedClientId) {
    throw new ApiError(403, "No puedes acceder a esta rutina");
  }

  const { rows } = await query(
    `
      select
        ww.id as week_id, ww.week_number, ww.focus, ww.notes as week_notes,
        wd.id as day_id, wd.day_number, wd.name as day_name, wd.notes as day_notes,
        wde.id as day_exercise_id, wde.exercise_order, wde.planned_sets, wde.planned_reps,
        wde.planned_weight, wde.target_rir, wde.target_rpe, wde.rest_seconds, wde.notes as exercise_notes,
        e.id as exercise_id, e.name as exercise_name, e.muscle_group, e.equipment
      from workout_weeks ww
      left join workout_days wd on wd.week_id = ww.id and wd.deleted_at is null
      left join workout_day_exercises wde on wde.workout_day_id = wd.id and wde.deleted_at is null
      left join exercises e on e.id = wde.exercise_id
      where ww.program_id = $1 and ww.deleted_at is null
      order by ww.week_number, wd.day_number, wde.exercise_order
    `,
    [id]
  );

  return { ...program, structure: rows };
}

export async function createProgram(data, requestUser) {
  const companyId = resolveCompanyId(data, requestUser);
  const { rows } = await query(
    `
      insert into workout_programs (company_id, fitness_client_id, name, objective, status, starts_on, ends_on, created_by)
      values ($1,$2,$3,$4,$5,$6,$7,$8)
      returning *
    `,
    [companyId, data.fitness_client_id ?? null, data.name, data.objective ?? null, data.status ?? "draft", data.starts_on ?? null, data.ends_on ?? null, requestUser.id]
  );
  const program = rows[0];

  await createProgramStructure(companyId, program.id, data.weeks ?? []);

  return getProgramDetail(program.id, requestUser);
}

async function createProgramStructure(companyId, programId, weeks) {
  for (const week of weeks) {
    const weekResult = await query(
      `insert into workout_weeks (company_id, program_id, week_number, focus, notes) values ($1,$2,$3,$4,$5) returning *`,
      [companyId, programId, week.week_number, week.focus ?? null, week.notes ?? null]
    );
    for (const day of week.days ?? []) {
      const dayResult = await query(
        `insert into workout_days (company_id, week_id, day_number, name, notes) values ($1,$2,$3,$4,$5) returning *`,
        [companyId, weekResult.rows[0].id, day.day_number, day.name, day.notes ?? null]
      );
      for (const item of day.exercises ?? []) {
        await query(
          `
            insert into workout_day_exercises
              (company_id, workout_day_id, exercise_id, exercise_order, planned_sets, planned_reps, planned_weight, target_rir, target_rpe, rest_seconds, notes)
            values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
          `,
          [companyId, dayResult.rows[0].id, item.exercise_id, item.exercise_order, item.planned_sets, item.planned_reps, item.planned_weight ?? null, item.target_rir ?? null, item.target_rpe ?? null, item.rest_seconds ?? null, item.notes ?? null]
        );
      }
    }
  }
}

export async function updateProgram(id, data, requestUser) {
  const current = await assertCompanyRecord("workout_programs", id, requestUser);
  const { rows } = await query(
    `
      update workout_programs
      set fitness_client_id=$2, name=$3, objective=$4, status=$5, starts_on=$6, ends_on=$7, updated_at=now()
      where id=$1
      returning *
    `,
    [
      id,
      data.fitness_client_id !== undefined ? data.fitness_client_id : current.fitness_client_id,
      data.name ?? current.name,
      data.objective !== undefined ? data.objective : current.objective,
      data.status ?? current.status,
      data.starts_on !== undefined ? data.starts_on : current.starts_on,
      data.ends_on !== undefined ? data.ends_on : current.ends_on
    ]
  );

  if (Array.isArray(data.weeks)) {
    await query(
      `
        update workout_day_exercises
        set deleted_at = now(), updated_at = now()
        where workout_day_id in (
          select wd.id
          from workout_days wd
          join workout_weeks ww on ww.id = wd.week_id
          where ww.program_id = $1
        )
          and deleted_at is null
      `,
      [id]
    );
    await query(
      `
        update workout_days
        set deleted_at = now(), updated_at = now()
        where week_id in (select id from workout_weeks where program_id = $1)
          and deleted_at is null
      `,
      [id]
    );
    await query(
      `
        update workout_weeks
        set deleted_at = now(), updated_at = now()
        where program_id = $1
          and deleted_at is null
      `,
      [id]
    );
    await createProgramStructure(current.company_id, id, data.weeks);
    return getProgramDetail(id, requestUser);
  }

  return rows[0];
}

export async function deleteProgram(id, requestUser) {
  await assertCompanyRecord("workout_programs", id, requestUser);
  const { rows } = await query(`update workout_programs set status='archived', deleted_at=now(), updated_at=now() where id=$1 returning id`, [id]);
  return rows[0];
}

export async function listWorkoutLogs(requestUser, filters = {}) {
  const companyId = resolveCompanyId(filters, requestUser);
  const params = [companyId];
  const where = ["wl.company_id = $1", "wl.deleted_at is null"];
  let index = 2;
  const scopedClientId = await getClientScope(requestUser, filters);

  if (scopedClientId) {
    where.push(`wl.fitness_client_id = $${index++}`);
    params.push(scopedClientId);
  }

  const { page, pageSize, offset } = pageParams(filters);
  const base = [...params];
  const items = await query(
    `
      select wl.*, fc.full_name as client_name, e.name as exercise_name, e.muscle_group
      from workout_logs wl
      join fitness_clients fc on fc.id = wl.fitness_client_id
      left join exercises e on e.id = wl.exercise_id
      where ${where.join(" and ")}
      order by wl.performed_on desc, wl.created_at desc
      limit $${base.length + 1} offset $${base.length + 2}
    `,
    [...base, pageSize, offset]
  );
  const count = await query(`select count(*)::int as total from workout_logs wl where ${where.join(" and ")}`, base);
  return { items: items.rows, pagination: { page, page_size: pageSize, total: Number(count.rows[0].total) } };
}

export async function createWorkoutLog(data, requestUser) {
  const companyId = resolveCompanyId(data, requestUser);
  const scopedClientId = await getClientScope(requestUser, { client_id: data.fitness_client_id });
  const fitnessClientId = scopedClientId ?? data.fitness_client_id;
  const { rows } = await query(
    `
      insert into workout_logs
        (company_id, fitness_client_id, program_id, workout_day_id, workout_day_exercise_id, exercise_id, performed_on, status,
         sets_completed, reps_completed, weight_used, rir, rpe, observations, created_by)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      returning *
    `,
    [
      companyId,
      fitnessClientId,
      data.program_id ?? null,
      data.workout_day_id ?? null,
      data.workout_day_exercise_id ?? null,
      data.exercise_id ?? null,
      data.performed_on,
      data.status ?? "completed",
      data.sets_completed ?? 0,
      data.reps_completed ?? 0,
      data.weight_used ?? null,
      data.rir ?? null,
      data.rpe ?? null,
      data.observations ?? null,
      requestUser.id
    ]
  );
  return rows[0];
}

export async function updateWorkoutLog(id, data, requestUser) {
  const current = await assertCompanyRecord("workout_logs", id, requestUser);
  await getClientScope(requestUser, { client_id: current.fitness_client_id });
  const { rows } = await query(
    `
      update workout_logs
      set fitness_client_id=$2, program_id=$3, workout_day_id=$4, workout_day_exercise_id=$5, exercise_id=$6,
          performed_on=$7, status=$8, sets_completed=$9, reps_completed=$10, weight_used=$11,
          rir=$12, rpe=$13, observations=$14, updated_at=now()
      where id=$1
      returning *
    `,
    [
      id,
      data.fitness_client_id ?? current.fitness_client_id,
      data.program_id !== undefined ? data.program_id : current.program_id,
      data.workout_day_id !== undefined ? data.workout_day_id : current.workout_day_id,
      data.workout_day_exercise_id !== undefined ? data.workout_day_exercise_id : current.workout_day_exercise_id,
      data.exercise_id !== undefined ? data.exercise_id : current.exercise_id,
      data.performed_on ?? current.performed_on,
      data.status ?? current.status,
      data.sets_completed ?? current.sets_completed,
      data.reps_completed ?? current.reps_completed,
      data.weight_used !== undefined ? data.weight_used : current.weight_used,
      data.rir !== undefined ? data.rir : current.rir,
      data.rpe !== undefined ? data.rpe : current.rpe,
      data.observations !== undefined ? data.observations : current.observations
    ]
  );
  return rows[0];
}

export async function deleteWorkoutLog(id, requestUser) {
  const current = await assertCompanyRecord("workout_logs", id, requestUser);
  await getClientScope(requestUser, { client_id: current.fitness_client_id });
  const { rows } = await query(`update workout_logs set deleted_at=now(), updated_at=now() where id=$1 returning id`, [id]);
  return rows[0];
}
