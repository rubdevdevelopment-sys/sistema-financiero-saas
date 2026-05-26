import { query } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";

const MEMBERSHIP_LABELS = {
  daily: "Diaria",
  weekly: "Semanal",
  monthly: "Mensual",
  quarterly: "Trimestral",
  semiannual: "Semestral",
  annual: "Anual",
  custom: "Personalizada"
};

function number(value) {
  return value === null || value === undefined ? 0 : Number(value);
}

function nullableNumber(value) {
  return value === null || value === undefined ? null : Number(value);
}

function resolveCompanyId(data = {}, requestUser) {
  if (requestUser.role === "super_admin") {
    if (data.company_id) {
      return data.company_id;
    }
    throw new ApiError(400, "Selecciona una empresa fitness para operar");
  }

  return requestUser.companyId;
}

function pageParams(filters) {
  const page = Number(filters.page ?? 1);
  const pageSize = Number(filters.page_size ?? 20);
  return { page, pageSize, offset: (page - 1) * pageSize };
}

function normalizeMembership(client) {
  const membershipLabel =
    client.membership_type === "custom"
      ? client.custom_membership_label || MEMBERSHIP_LABELS.custom
      : MEMBERSHIP_LABELS[client.membership_type] || client.membership_type;
  const membershipExpired =
    Boolean(client.membership_ends_on) &&
    new Date(client.membership_ends_on) < new Date(new Date().toISOString().slice(0, 10));

  return {
    ...client,
    weight_kg: nullableNumber(client.weight_kg),
    height_cm: nullableNumber(client.height_cm),
    body_fat_percentage: nullableNumber(client.body_fat_percentage),
    muscle_mass_kg: nullableNumber(client.muscle_mass_kg),
    bmi: nullableNumber(client.bmi),
    membership_label: membershipLabel,
    membership_expired: membershipExpired
  };
}

function mapLog(row) {
  return {
    ...row,
    sets_completed: number(row.sets_completed),
    reps_completed: number(row.reps_completed),
    weight_used: nullableNumber(row.weight_used),
    rir: nullableNumber(row.rir),
    rpe: nullableNumber(row.rpe)
  };
}

async function getClientProfileForUser(requestUser) {
  const { rows } = await query(
    `
      select *
      from fitness_clients
      where user_id = $1
        and company_id = $2
        and deleted_at is null
      limit 1
    `,
    [requestUser.id, requestUser.companyId]
  );

  return rows[0] ? normalizeMembership(rows[0]) : null;
}

async function getClientScope(requestUser, filters = {}) {
  if (requestUser.role !== "client") {
    return filters.client_id ?? null;
  }

  const profile = await getClientProfileForUser(requestUser);

  if (!profile) {
    throw new ApiError(403, "No tienes un perfil fitness asociado");
  }

  if (filters.client_id && filters.client_id !== profile.id) {
    throw new ApiError(403, "No puedes acceder al progreso de otro deportista");
  }

  return profile.id;
}

async function assertCompanyRecord(table, id, requestUser, alias = "*") {
  const { rows } = await query(`select ${alias} from ${table} where id = $1 limit 1`, [id]);
  const record = rows[0];

  if (!record || record.deleted_at) {
    throw new ApiError(404, "Registro fitness no encontrado");
  }

  if (requestUser.role !== "super_admin" && record.company_id !== requestUser.companyId) {
    throw new ApiError(403, "No puedes acceder a informacion de otra empresa");
  }

  return record;
}

async function assertClientBelongsToCompany(clientId, requestUser, companyId = requestUser.companyId) {
  const { rows } = await query(
    `
      select *
      from fitness_clients
      where id = $1
        and company_id = $2
        and deleted_at is null
      limit 1
    `,
    [clientId, companyId]
  );

  if (!rows[0]) {
    throw new ApiError(404, "Cliente fitness no encontrado");
  }

  return normalizeMembership(rows[0]);
}

async function assertOptionalScopedRecord(table, id, requestUser, companyId) {
  if (!id) {
    return null;
  }

  const record = await assertCompanyRecord(table, id, requestUser);
  if (companyId && record.company_id !== companyId) {
    throw new ApiError(400, "El recurso seleccionado no pertenece al cliente o empresa activa");
  }
  return record;
}

function buildDateRange(filters, field, params, startIndex) {
  const clauses = [];
  let nextIndex = startIndex;

  if (filters.date_from) {
    clauses.push(`${field} >= $${nextIndex++}`);
    params.push(filters.date_from);
  }

  if (filters.date_to) {
    clauses.push(`${field} <= $${nextIndex++}`);
    params.push(filters.date_to);
  }

  return { clauses, nextIndex };
}

async function getActiveProgramForClient(companyId, clientId) {
  const { rows } = await query(
    `
      select wp.*, count(distinct ww.id)::int as weeks_count, count(distinct wd.id)::int as days_count
      from workout_programs wp
      left join workout_weeks ww on ww.program_id = wp.id and ww.deleted_at is null
      left join workout_days wd on wd.week_id = ww.id and wd.deleted_at is null
      where wp.company_id = $1
        and wp.fitness_client_id = $2
        and wp.deleted_at is null
        and wp.status in ('active', 'paused')
      group by wp.id
      order by case when wp.status = 'active' then 0 else 1 end, coalesce(wp.starts_on, current_date) desc, wp.created_at desc
      limit 1
    `,
    [companyId, clientId]
  );

  return rows[0] ?? null;
}

async function getStructuredProgram(programId) {
  const { rows } = await query(
    `
      select
        ww.id as week_id,
        ww.week_number,
        ww.focus,
        ww.notes as week_notes,
        wd.id as day_id,
        wd.day_number,
        wd.name as day_name,
        wd.notes as day_notes,
        wde.id as day_exercise_id,
        wde.exercise_order,
        wde.block_name,
        wde.block_type,
        wde.superset_group,
        wde.planned_sets,
        wde.planned_reps,
        wde.planned_weight,
        wde.target_rir,
        wde.target_rpe,
        wde.rest_seconds,
        wde.notes as exercise_notes,
        e.id as exercise_id,
        e.name as exercise_name,
        e.muscle_group,
        e.category,
        e.difficulty,
        e.equipment,
        e.video_url,
        e.thumbnail_url
      from workout_weeks ww
      left join workout_days wd on wd.week_id = ww.id and wd.deleted_at is null
      left join workout_day_exercises wde on wde.workout_day_id = wd.id and wde.deleted_at is null
      left join exercises e on e.id = wde.exercise_id and e.deleted_at is null
      where ww.program_id = $1
        and ww.deleted_at is null
      order by ww.week_number, wd.day_number, wde.exercise_order
    `,
    [programId]
  );

  const weeks = [];
  const weekMap = new Map();
  const dayMap = new Map();

  for (const row of rows) {
    if (!weekMap.has(row.week_id)) {
      const week = {
        id: row.week_id,
        week_number: row.week_number,
        focus: row.focus,
        notes: row.week_notes,
        days: []
      };
      weekMap.set(row.week_id, week);
      weeks.push(week);
    }

    if (row.day_id && !dayMap.has(row.day_id)) {
      const day = {
        id: row.day_id,
        day_number: row.day_number,
        name: row.day_name,
        notes: row.day_notes,
        exercises: []
      };
      dayMap.set(row.day_id, day);
      weekMap.get(row.week_id).days.push(day);
    }

    if (row.day_exercise_id && row.day_id) {
      dayMap.get(row.day_id).exercises.push({
        id: row.day_exercise_id,
        exercise_order: row.exercise_order,
        block_name: row.block_name,
        block_type: row.block_type,
        superset_group: row.superset_group,
        planned_sets: number(row.planned_sets),
        planned_reps: row.planned_reps,
        planned_weight: nullableNumber(row.planned_weight),
        target_rir: nullableNumber(row.target_rir),
        target_rpe: nullableNumber(row.target_rpe),
        rest_seconds: row.rest_seconds === null ? null : Number(row.rest_seconds),
        notes: row.exercise_notes,
        exercise: row.exercise_id
          ? {
              id: row.exercise_id,
              name: row.exercise_name,
              muscle_group: row.muscle_group,
              category: row.category,
              difficulty: row.difficulty,
              equipment: row.equipment,
              video_url: row.video_url,
              thumbnail_url: row.thumbnail_url
            }
          : null
      });
    }
  }

  return weeks;
}

async function createProgramStructure(companyId, programId, weeks, requestUser) {
  for (const week of weeks) {
    const weekResult = await query(
      `
        insert into workout_weeks (company_id, program_id, week_number, focus, notes)
        values ($1, $2, $3, $4, $5)
        returning id
      `,
      [companyId, programId, week.week_number, week.focus ?? null, week.notes ?? null]
    );

    for (const day of week.days ?? []) {
      const dayResult = await query(
        `
          insert into workout_days (company_id, week_id, day_number, name, notes)
          values ($1, $2, $3, $4, $5)
          returning id
        `,
        [companyId, weekResult.rows[0].id, day.day_number, day.name, day.notes ?? null]
      );

      for (const item of day.exercises ?? []) {
        await assertOptionalScopedRecord("exercises", item.exercise_id, requestUser, companyId);
        await query(
          `
            insert into workout_day_exercises
              (
                company_id, workout_day_id, exercise_id, exercise_order, block_name, block_type, superset_group,
                planned_sets, planned_reps, planned_weight, target_rir, target_rpe, rest_seconds, notes
              )
            values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
          `,
          [
            companyId,
            dayResult.rows[0].id,
            item.exercise_id,
            item.exercise_order,
            item.block_name ?? null,
            item.block_type ?? "straight",
            item.superset_group ?? null,
            item.planned_sets,
            item.planned_reps,
            item.planned_weight ?? null,
            item.target_rir ?? null,
            item.target_rpe ?? null,
            item.rest_seconds ?? null,
            item.notes ?? null
          ]
        );
      }
    }
  }
}

async function getClientProgressSummary(companyId, clientId) {
  const [historyResult, recordsResult, statsResult] = await Promise.all([
    query(
      `
        select
          performed_on,
          coalesce(sum(weight_used), 0) as total_weight,
          count(*)::int as workouts,
          max(weight_used) as top_weight
        from workout_logs
        where company_id = $1
          and fitness_client_id = $2
          and deleted_at is null
        group by performed_on
        order by performed_on desc
        limit 30
      `,
      [companyId, clientId]
    ),
    query(
      `
        select e.name as exercise_name, max(wl.weight_used) as max_weight
        from workout_logs wl
        join exercises e on e.id = wl.exercise_id
        where wl.company_id = $1
          and wl.fitness_client_id = $2
          and wl.deleted_at is null
          and wl.weight_used is not null
        group by e.name
        order by max_weight desc
        limit 8
      `,
      [companyId, clientId]
    ),
    query(
      `
        select
          count(*)::int as total_logs,
          count(*) filter (where status = 'completed')::int as completed_logs,
          count(*) filter (where status = 'partial')::int as partial_logs,
          count(*) filter (where status = 'skipped')::int as skipped_logs,
          coalesce(sum(weight_used), 0) as total_load
        from workout_logs
        where company_id = $1
          and fitness_client_id = $2
          and deleted_at is null
      `,
      [companyId, clientId]
    )
  ]);

  return {
    history: historyResult.rows.map((row) => ({
      performed_on: row.performed_on,
      workouts: number(row.workouts),
      total_weight: number(row.total_weight),
      top_weight: nullableNumber(row.top_weight)
    })),
    personal_records: recordsResult.rows.map((row) => ({
      exercise_name: row.exercise_name,
      max_weight: number(row.max_weight)
    })),
    stats: {
      total_logs: number(statsResult.rows[0]?.total_logs),
      completed_logs: number(statsResult.rows[0]?.completed_logs),
      partial_logs: number(statsResult.rows[0]?.partial_logs),
      skipped_logs: number(statsResult.rows[0]?.skipped_logs),
      total_load: number(statsResult.rows[0]?.total_load)
    }
  };
}

export async function getFitnessDashboard(requestUser, filters = {}) {
  const companyId = resolveCompanyId(filters, requestUser);
  const scopedClientId = await getClientScope(requestUser, filters);
  const params = [companyId];
  let index = 2;
  const clientFilter = scopedClientId ? `and fc.id = $${index++}` : "";
  if (scopedClientId) {
    params.push(scopedClientId);
  }
  const logClientFilter = scopedClientId ? `and wl.fitness_client_id = $2` : "";

  const [cardsResult, weeklyResult, recentLogsResult, recordsResult, membershipResult, inactiveResult] = await Promise.all([
    query(
      `
        with active_clients as (
          select *
          from fitness_clients fc
          where fc.company_id = $1
            and fc.deleted_at is null
            ${clientFilter}
        ),
        active_programs as (
          select count(distinct wp.id)::int as total
          from workout_programs wp
          join active_clients fc on fc.id = wp.fitness_client_id or wp.fitness_client_id is null
          where wp.company_id = $1
            and wp.deleted_at is null
            and wp.status = 'active'
        ),
        logs_30d as (
          select
            count(*)::int as total,
            count(*) filter (where status = 'completed')::int as completed,
            count(*) filter (where status = 'partial')::int as partial,
            count(*) filter (where status = 'skipped')::int as skipped,
            coalesce(sum(weight_used), 0) as total_load
          from workout_logs wl
          where wl.company_id = $1
            and wl.deleted_at is null
            ${scopedClientId ? "and wl.fitness_client_id = $2" : ""}
            and wl.performed_on >= current_date - interval '30 days'
        )
        select
          (select count(*)::int from active_clients where status = 'active') as active_clients,
          (select total from active_programs) as active_programs,
          logs_30d.total as workouts_30d,
          logs_30d.completed as completed_30d,
          logs_30d.partial as partial_30d,
          logs_30d.skipped as skipped_30d,
          logs_30d.total_load as total_load_30d
        from logs_30d
      `,
      params
    ),
    query(
      `
        select
          to_char(day::date, 'Dy') as label,
          day::date as day,
          coalesce(count(wl.id), 0)::int as workouts,
          coalesce(sum(wl.weight_used), 0) as total_load
        from generate_series(current_date - interval '6 days', current_date, interval '1 day') as day
        left join workout_logs wl on wl.performed_on = day::date
          and wl.company_id = $1
          and wl.deleted_at is null
          ${scopedClientId ? "and wl.fitness_client_id = $2" : ""}
        group by day
        order by day
      `,
      params
    ),
    query(
      `
        select wl.*, fc.full_name as client_name, e.name as exercise_name, e.category, e.muscle_group
        from workout_logs wl
        join fitness_clients fc on fc.id = wl.fitness_client_id
        left join exercises e on e.id = wl.exercise_id
        where wl.company_id = $1
          and wl.deleted_at is null
          ${scopedClientId ? "and wl.fitness_client_id = $2" : ""}
        order by wl.performed_on desc, wl.created_at desc
        limit 8
      `,
      params
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
      params
    ),
    scopedClientId
      ? Promise.resolve({ rows: [] })
      : query(
          `
            select id, full_name, membership_type, custom_membership_label, membership_ends_on, status
            from fitness_clients
            where company_id = $1
              and deleted_at is null
              and membership_ends_on is not null
              and membership_ends_on <= current_date + interval '7 days'
            order by membership_ends_on asc
            limit 6
          `,
          [companyId]
        ),
    scopedClientId
      ? Promise.resolve({ rows: [] })
      : query(
          `
            select id, full_name, status, membership_ends_on
            from fitness_clients
            where company_id = $1
              and deleted_at is null
              and (
                status <> 'active'
                or membership_ends_on < current_date
                or not exists (
                  select 1
                  from workout_logs wl
                  where wl.fitness_client_id = fitness_clients.id
                    and wl.deleted_at is null
                    and wl.performed_on >= current_date - interval '21 days'
                )
              )
            order by updated_at desc
            limit 6
          `,
          [companyId]
        )
  ]);

  const cards = cardsResult.rows[0] ?? {};
  const workouts = number(cards.workouts_30d);
  const completion = workouts > 0 ? Math.round((number(cards.completed_30d) / workouts) * 100) : 0;
  const profile = scopedClientId ? await assertClientBelongsToCompany(scopedClientId, requestUser, companyId) : null;
  const activeProgram = scopedClientId ? await getActiveProgramForClient(companyId, scopedClientId) : null;
  const todayProgram = activeProgram ? await getProgramDetail(activeProgram.id, requestUser) : null;

  return {
    role: requestUser.role,
    profile,
    cards: {
      activeClients: number(cards.active_clients),
      activePrograms: number(cards.active_programs),
      workouts30d: workouts,
      completion,
      totalLoad30d: number(cards.total_load_30d),
      partial30d: number(cards.partial_30d),
      skipped30d: number(cards.skipped_30d)
    },
    activeProgram: todayProgram,
    weeklyCompliance: weeklyResult.rows.map((row) => ({
      label: row.label,
      day: row.day,
      workouts: number(row.workouts),
      total_load: number(row.total_load)
    })),
    recentLogs: recentLogsResult.rows.map(mapLog),
    personalRecords: recordsResult.rows.map((row) => ({
      exercise_name: row.exercise_name,
      max_weight: number(row.max_weight)
    })),
    expiringMemberships: membershipResult.rows.map((row) => normalizeMembership(row)),
    inactiveClients: inactiveResult.rows.map((row) => normalizeMembership(row))
  };
}

export async function listFitnessClients(requestUser, filters = {}) {
  const companyId = resolveCompanyId(filters, requestUser);
  const scopedClientId = await getClientScope(requestUser, filters);
  const params = [companyId];
  let index = 2;
  const where = ["company_id = $1", "deleted_at is null"];

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

  if (filters.membership_type) {
    where.push(`membership_type = $${index++}`);
    params.push(filters.membership_type);
  }

  const { page, pageSize, offset } = pageParams(filters);
  const baseParams = [...params];
  const itemsResult = await query(
    `
      select *,
        (
          select max(performed_on)
          from workout_logs wl
          where wl.fitness_client_id = fitness_clients.id
            and wl.deleted_at is null
        ) as last_workout_on
      from fitness_clients
      where ${where.join(" and ")}
      order by
        case when membership_ends_on is null then 1 else 0 end,
        membership_ends_on asc nulls last,
        full_name asc
      limit $${baseParams.length + 1} offset $${baseParams.length + 2}
    `,
    [...baseParams, pageSize, offset]
  );
  const countResult = await query(
    `select count(*)::int as total from fitness_clients where ${where.join(" and ")}`,
    baseParams
  );

  return {
    items: itemsResult.rows.map((row) => normalizeMembership(row)),
    pagination: { page, page_size: pageSize, total: number(countResult.rows[0]?.total) }
  };
}

export async function getFitnessClientDetail(id, requestUser) {
  const current = await assertCompanyRecord("fitness_clients", id, requestUser);
  await getClientScope(requestUser, { client_id: id });

  const [progress, activeProgram, logsResult] = await Promise.all([
    getClientProgressSummary(current.company_id, id),
    getActiveProgramForClient(current.company_id, id),
    query(
      `
        select wl.*, e.name as exercise_name, e.category, e.muscle_group
        from workout_logs wl
        left join exercises e on e.id = wl.exercise_id
        where wl.fitness_client_id = $1
          and wl.deleted_at is null
        order by wl.performed_on desc, wl.created_at desc
        limit 12
      `,
      [id]
    )
  ]);

  return {
    client: normalizeMembership(current),
    active_program: activeProgram ? await getProgramDetail(activeProgram.id, requestUser) : null,
    progress,
    recent_logs: logsResult.rows.map(mapLog)
  };
}

export async function createFitnessClient(data, requestUser) {
  const companyId = resolveCompanyId(data, requestUser);

  if (data.user_id) {
    await assertOptionalScopedRecord("app_users", data.user_id, requestUser, companyId).catch(async () => {
      const { rows } = await query(`select id, company_id, role from app_users where id = $1 limit 1`, [data.user_id]);
      const user = rows[0];
      if (!user || user.company_id !== companyId) {
        throw new ApiError(400, "El usuario asignado no pertenece a la empresa activa");
      }
    });
  }

  const { rows } = await query(
    `
      insert into fitness_clients
        (
          company_id, user_id, full_name, email, phone, avatar_url, weight_kg, height_cm, goal, experience_level,
          injuries, status, notes, membership_type, custom_membership_label, membership_starts_on, membership_ends_on,
          birth_date, gender, body_fat_percentage, muscle_mass_kg, bmi, medical_notes, fitness_objectives
        )
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
      returning *
    `,
    [
      companyId,
      data.user_id ?? null,
      data.full_name,
      data.email || null,
      data.phone ?? null,
      data.avatar_url ?? null,
      data.weight_kg ?? null,
      data.height_cm ?? null,
      data.goal ?? null,
      data.experience_level ?? "beginner",
      data.injuries ?? null,
      data.status ?? "active",
      data.notes ?? null,
      data.membership_type ?? "monthly",
      data.custom_membership_label ?? null,
      data.membership_starts_on ?? null,
      data.membership_ends_on ?? null,
      data.birth_date ?? null,
      data.gender ?? null,
      data.body_fat_percentage ?? null,
      data.muscle_mass_kg ?? null,
      data.bmi ?? null,
      data.medical_notes ?? null,
      data.fitness_objectives ?? null
    ]
  );

  return normalizeMembership(rows[0]);
}

export async function updateFitnessClient(id, data, requestUser) {
  const current = await assertCompanyRecord("fitness_clients", id, requestUser);
  const companyId = data.company_id ? resolveCompanyId(data, requestUser) : current.company_id;

  if (data.user_id) {
    const { rows: userRows } = await query(`select id, company_id from app_users where id = $1 limit 1`, [data.user_id]);
    if (!userRows[0] || userRows[0].company_id !== companyId) {
      throw new ApiError(400, "El usuario asignado no pertenece a la empresa activa");
    }
  }

  const { rows } = await query(
    `
      update fitness_clients
      set
        company_id = $2,
        user_id = $3,
        full_name = $4,
        email = $5,
        phone = $6,
        avatar_url = $7,
        weight_kg = $8,
        height_cm = $9,
        goal = $10,
        experience_level = $11,
        injuries = $12,
        status = $13,
        notes = $14,
        membership_type = $15,
        custom_membership_label = $16,
        membership_starts_on = $17,
        membership_ends_on = $18,
        birth_date = $19,
        gender = $20,
        body_fat_percentage = $21,
        muscle_mass_kg = $22,
        bmi = $23,
        medical_notes = $24,
        fitness_objectives = $25,
        updated_at = now()
      where id = $1
      returning *
    `,
    [
      id,
      companyId,
      data.user_id !== undefined ? data.user_id : current.user_id,
      data.full_name ?? current.full_name,
      data.email !== undefined ? data.email || null : current.email,
      data.phone !== undefined ? data.phone : current.phone,
      data.avatar_url !== undefined ? data.avatar_url : current.avatar_url,
      data.weight_kg !== undefined ? data.weight_kg : current.weight_kg,
      data.height_cm !== undefined ? data.height_cm : current.height_cm,
      data.goal !== undefined ? data.goal : current.goal,
      data.experience_level ?? current.experience_level,
      data.injuries !== undefined ? data.injuries : current.injuries,
      data.status ?? current.status,
      data.notes !== undefined ? data.notes : current.notes,
      data.membership_type ?? current.membership_type,
      data.custom_membership_label !== undefined ? data.custom_membership_label : current.custom_membership_label,
      data.membership_starts_on !== undefined ? data.membership_starts_on : current.membership_starts_on,
      data.membership_ends_on !== undefined ? data.membership_ends_on : current.membership_ends_on,
      data.birth_date !== undefined ? data.birth_date : current.birth_date,
      data.gender !== undefined ? data.gender : current.gender,
      data.body_fat_percentage !== undefined ? data.body_fat_percentage : current.body_fat_percentage,
      data.muscle_mass_kg !== undefined ? data.muscle_mass_kg : current.muscle_mass_kg,
      data.bmi !== undefined ? data.bmi : current.bmi,
      data.medical_notes !== undefined ? data.medical_notes : current.medical_notes,
      data.fitness_objectives !== undefined ? data.fitness_objectives : current.fitness_objectives
    ]
  );

  return normalizeMembership(rows[0]);
}

export async function deleteFitnessClient(id, requestUser) {
  await assertCompanyRecord("fitness_clients", id, requestUser);
  const { rows } = await query(
    `
      update fitness_clients
      set status = 'inactive', deleted_at = now(), updated_at = now()
      where id = $1
      returning id
    `,
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
    where.push(`(name ilike $${index} or muscle_group ilike $${index} or category ilike $${index} or coalesce(equipment, '') ilike $${index})`);
    params.push(`%${filters.search}%`);
    index += 1;
  }

  if (filters.category) {
    where.push(`category = $${index++}`);
    params.push(filters.category);
  }

  if (filters.difficulty) {
    where.push(`difficulty = $${index++}`);
    params.push(filters.difficulty);
  }

  if (filters.active !== undefined) {
    where.push(`active = $${index++}`);
    params.push(filters.active);
  }

  const { page, pageSize, offset } = pageParams(filters);
  const itemsResult = await query(
    `
      select *
      from exercises
      where ${where.join(" and ")}
      order by category asc, muscle_group asc, name asc
      limit $${params.length + 1} offset $${params.length + 2}
    `,
    [...params, pageSize, offset]
  );
  const countResult = await query(
    `select count(*)::int as total from exercises where ${where.join(" and ")}`,
    params
  );

  return {
    items: itemsResult.rows,
    pagination: { page, page_size: pageSize, total: number(countResult.rows[0]?.total) }
  };
}

export async function createExercise(data, requestUser) {
  const companyId = resolveCompanyId(data, requestUser);
  const { rows } = await query(
    `
      insert into exercises
        (company_id, name, muscle_group, category, difficulty, instructions, equipment, video_url, thumbnail_url, active)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      returning *
    `,
    [
      companyId,
      data.name,
      data.muscle_group,
      data.category,
      data.difficulty ?? "intermediate",
      data.instructions ?? null,
      data.equipment ?? null,
      data.video_url ?? null,
      data.thumbnail_url ?? null,
      data.active ?? true
    ]
  );

  return rows[0];
}

export async function updateExercise(id, data, requestUser) {
  const current = await assertCompanyRecord("exercises", id, requestUser);
  const { rows } = await query(
    `
      update exercises
      set
        name = $2,
        muscle_group = $3,
        category = $4,
        difficulty = $5,
        instructions = $6,
        equipment = $7,
        video_url = $8,
        thumbnail_url = $9,
        active = $10,
        updated_at = now()
      where id = $1
      returning *
    `,
    [
      id,
      data.name ?? current.name,
      data.muscle_group ?? current.muscle_group,
      data.category ?? current.category,
      data.difficulty ?? current.difficulty,
      data.instructions !== undefined ? data.instructions : current.instructions,
      data.equipment !== undefined ? data.equipment : current.equipment,
      data.video_url !== undefined ? data.video_url : current.video_url,
      data.thumbnail_url !== undefined ? data.thumbnail_url : current.thumbnail_url,
      data.active ?? current.active
    ]
  );

  return rows[0];
}

export async function deleteExercise(id, requestUser) {
  await assertCompanyRecord("exercises", id, requestUser);
  const { rows } = await query(
    `
      update exercises
      set active = false, deleted_at = now(), updated_at = now()
      where id = $1
      returning id
    `,
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
    index += 1;
  }

  if (filters.status) {
    where.push(`wp.status = $${index++}`);
    params.push(filters.status);
  }

  const { page, pageSize, offset } = pageParams(filters);
  const itemsResult = await query(
    `
      select
        wp.*,
        fc.full_name as client_name,
        fc.avatar_url as client_avatar_url,
        count(distinct ww.id)::int as weeks_count,
        count(distinct wd.id)::int as days_count,
        count(distinct wde.id)::int as exercises_count
      from workout_programs wp
      left join fitness_clients fc on fc.id = wp.fitness_client_id
      left join workout_weeks ww on ww.program_id = wp.id and ww.deleted_at is null
      left join workout_days wd on wd.week_id = ww.id and wd.deleted_at is null
      left join workout_day_exercises wde on wde.workout_day_id = wd.id and wde.deleted_at is null
      where ${where.join(" and ")}
      group by wp.id, fc.full_name, fc.avatar_url
      order by
        case wp.status when 'active' then 0 when 'draft' then 1 when 'paused' then 2 else 3 end,
        coalesce(wp.starts_on, current_date) desc,
        wp.created_at desc
      limit $${params.length + 1} offset $${params.length + 2}
    `,
    [...params, pageSize, offset]
  );
  const countResult = await query(
    `
      select count(*)::int as total
      from workout_programs wp
      left join fitness_clients fc on fc.id = wp.fitness_client_id
      where ${where.join(" and ")}
    `,
    params
  );

  return {
    items: itemsResult.rows,
    pagination: { page, page_size: pageSize, total: number(countResult.rows[0]?.total) }
  };
}

export async function getProgramDetail(id, requestUser) {
  const program = await assertCompanyRecord("workout_programs", id, requestUser);
  await getClientScope(requestUser, { client_id: program.fitness_client_id });

  const [structure, clientResult] = await Promise.all([
    getStructuredProgram(id),
    program.fitness_client_id
      ? query(`select id, full_name, avatar_url, status from fitness_clients where id = $1 limit 1`, [program.fitness_client_id])
      : Promise.resolve({ rows: [] })
  ]);

  return {
    ...program,
    client: clientResult.rows[0] ?? null,
    structure
  };
}

export async function createProgram(data, requestUser) {
  const companyId = resolveCompanyId(data, requestUser);
  if (data.fitness_client_id) {
    await assertClientBelongsToCompany(data.fitness_client_id, requestUser, companyId);
  }

  const { rows } = await query(
    `
      insert into workout_programs (company_id, fitness_client_id, name, objective, status, starts_on, ends_on, created_by)
      values ($1,$2,$3,$4,$5,$6,$7,$8)
      returning *
    `,
    [
      companyId,
      data.fitness_client_id ?? null,
      data.name,
      data.objective ?? null,
      data.status ?? "draft",
      data.starts_on ?? null,
      data.ends_on ?? null,
      requestUser.id
    ]
  );

  if (Array.isArray(data.weeks) && data.weeks.length > 0) {
    await createProgramStructure(companyId, rows[0].id, data.weeks, requestUser);
  }

  return getProgramDetail(rows[0].id, requestUser);
}

export async function updateProgram(id, data, requestUser) {
  const current = await assertCompanyRecord("workout_programs", id, requestUser);
  if (data.fitness_client_id) {
    await assertClientBelongsToCompany(data.fitness_client_id, requestUser, current.company_id);
  }

  const { rows } = await query(
    `
      update workout_programs
      set
        fitness_client_id = $2,
        name = $3,
        objective = $4,
        status = $5,
        starts_on = $6,
        ends_on = $7,
        updated_at = now()
      where id = $1
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
    await createProgramStructure(current.company_id, id, data.weeks, requestUser);
  }

  return getProgramDetail(rows[0].id, requestUser);
}

export async function deleteProgram(id, requestUser) {
  await assertCompanyRecord("workout_programs", id, requestUser);
  const { rows } = await query(
    `
      update workout_programs
      set status = 'archived', deleted_at = now(), updated_at = now()
      where id = $1
      returning id
    `,
    [id]
  );
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

  if (filters.status) {
    where.push(`wl.status = $${index++}`);
    params.push(filters.status);
  }

  const range = buildDateRange(filters, "wl.performed_on", params, index);
  where.push(...range.clauses);
  index = range.nextIndex;

  const { page, pageSize, offset } = pageParams(filters);
  const itemsResult = await query(
    `
      select
        wl.*,
        fc.full_name as client_name,
        fc.avatar_url as client_avatar_url,
        e.name as exercise_name,
        e.category,
        e.muscle_group
      from workout_logs wl
      join fitness_clients fc on fc.id = wl.fitness_client_id
      left join exercises e on e.id = wl.exercise_id
      where ${where.join(" and ")}
      order by wl.performed_on desc, wl.created_at desc
      limit $${params.length + 1} offset $${params.length + 2}
    `,
    [...params, pageSize, offset]
  );
  const countResult = await query(
    `select count(*)::int as total from workout_logs wl where ${where.join(" and ")}`,
    params
  );
  const statsResult = await query(
    `
      select
        count(*)::int as total,
        count(*) filter (where wl.status = 'completed')::int as completed,
        count(*) filter (where wl.status = 'partial')::int as partial,
        count(*) filter (where wl.status = 'skipped')::int as skipped,
        coalesce(sum(wl.weight_used), 0) as total_load
      from workout_logs wl
      where ${where.join(" and ")}
    `,
    params
  );

  return {
    items: itemsResult.rows.map(mapLog),
    stats: {
      total: number(statsResult.rows[0]?.total),
      completed: number(statsResult.rows[0]?.completed),
      partial: number(statsResult.rows[0]?.partial),
      skipped: number(statsResult.rows[0]?.skipped),
      total_load: number(statsResult.rows[0]?.total_load)
    },
    pagination: { page, page_size: pageSize, total: number(countResult.rows[0]?.total) }
  };
}

export async function createWorkoutLog(data, requestUser) {
  const companyId = resolveCompanyId(data, requestUser);
  const scopedClientId = await getClientScope(requestUser, { client_id: data.fitness_client_id });
  const fitnessClientId = scopedClientId ?? data.fitness_client_id;

  await assertClientBelongsToCompany(fitnessClientId, requestUser, companyId);
  await assertOptionalScopedRecord("workout_programs", data.program_id, requestUser, companyId);
  await assertOptionalScopedRecord("workout_days", data.workout_day_id, requestUser, companyId);
  await assertOptionalScopedRecord("workout_day_exercises", data.workout_day_exercise_id, requestUser, companyId);
  await assertOptionalScopedRecord("exercises", data.exercise_id, requestUser, companyId);

  const { rows } = await query(
    `
      insert into workout_logs
        (
          company_id, fitness_client_id, program_id, workout_day_id, workout_day_exercise_id, exercise_id,
          performed_on, status, sets_completed, reps_completed, weight_used, rir, rpe, progress_photo_url,
          observations, created_by
        )
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
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
      data.progress_photo_url ?? null,
      data.observations ?? null,
      requestUser.id
    ]
  );

  return mapLog(rows[0]);
}

export async function updateWorkoutLog(id, data, requestUser) {
  const current = await assertCompanyRecord("workout_logs", id, requestUser);
  await getClientScope(requestUser, { client_id: current.fitness_client_id });
  const nextClientId = data.fitness_client_id ?? current.fitness_client_id;

  await assertClientBelongsToCompany(nextClientId, requestUser, current.company_id);
  await assertOptionalScopedRecord("workout_programs", data.program_id ?? current.program_id, requestUser, current.company_id);
  await assertOptionalScopedRecord("workout_days", data.workout_day_id ?? current.workout_day_id, requestUser, current.company_id);
  await assertOptionalScopedRecord("workout_day_exercises", data.workout_day_exercise_id ?? current.workout_day_exercise_id, requestUser, current.company_id);
  await assertOptionalScopedRecord("exercises", data.exercise_id ?? current.exercise_id, requestUser, current.company_id);

  const { rows } = await query(
    `
      update workout_logs
      set
        fitness_client_id = $2,
        program_id = $3,
        workout_day_id = $4,
        workout_day_exercise_id = $5,
        exercise_id = $6,
        performed_on = $7,
        status = $8,
        sets_completed = $9,
        reps_completed = $10,
        weight_used = $11,
        rir = $12,
        rpe = $13,
        progress_photo_url = $14,
        observations = $15,
        updated_at = now()
      where id = $1
      returning *
    `,
    [
      id,
      nextClientId,
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
      data.progress_photo_url !== undefined ? data.progress_photo_url : current.progress_photo_url,
      data.observations !== undefined ? data.observations : current.observations
    ]
  );

  return mapLog(rows[0]);
}

export async function deleteWorkoutLog(id, requestUser) {
  const current = await assertCompanyRecord("workout_logs", id, requestUser);
  await getClientScope(requestUser, { client_id: current.fitness_client_id });
  const { rows } = await query(
    `
      update workout_logs
      set deleted_at = now(), updated_at = now()
      where id = $1
      returning id
    `,
    [id]
  );
  return rows[0];
}
