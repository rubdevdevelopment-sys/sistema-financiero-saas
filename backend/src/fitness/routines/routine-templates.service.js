import { query } from "../../config/db.js";

function normalizeNullableString(value) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function normalizeBooleanFilter(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  return null;
}

function normalizePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function isRelationMissingError(error) {
  return error?.code === "42P01";
}

function normalizeRoutineTemplateRow(row) {
  return {
    id: row?.id ?? null,
    company_id: row?.company_id ?? null,
    name: normalizeNullableString(row?.name),
    description: normalizeNullableString(row?.description),
    level: normalizeNullableString(row?.level),
    goal: normalizeNullableString(row?.goal),
    duration_weeks: row?.duration_weeks ?? null,
    is_active: Boolean(row?.is_active),
    created_by: row?.created_by ?? null,
    updated_by: row?.updated_by ?? null,
    created_at: row?.created_at ?? null,
    updated_at: row?.updated_at ?? null,
    deleted_at: row?.deleted_at ?? null
  };
}

function normalizeRoutineTemplateExerciseRow(row) {
  return {
    id: row?.id ?? null,
    company_id: row?.company_id ?? null,
    routine_template_day_id: row?.routine_template_day_id ?? null,
    exercise_id: row?.exercise_id ?? null,
    sort_order: row?.sort_order ?? null,
    sets: row?.sets ?? null,
    reps: normalizeNullableString(row?.reps),
    rest_seconds: row?.rest_seconds ?? null,
    notes: normalizeNullableString(row?.notes),
    created_by: row?.created_by ?? null,
    updated_by: row?.updated_by ?? null,
    created_at: row?.created_at ?? null,
    updated_at: row?.updated_at ?? null,
    deleted_at: row?.deleted_at ?? null,
    exercise: {
      id: row?.exercise_id ?? null,
      name: normalizeNullableString(row?.exercise_name),
      category: normalizeNullableString(row?.exercise_category),
      muscle_group: normalizeNullableString(row?.exercise_muscle_group),
      equipment: normalizeNullableString(row?.exercise_equipment),
      difficulty: normalizeNullableString(row?.exercise_difficulty),
      is_active: typeof row?.exercise_is_active === "boolean" ? row.exercise_is_active : null
    }
  };
}

function buildListOptions(filters = {}) {
  const params = [];
  const where = ["company_id = $1", "deleted_at is null"];
  const normalizedSearch = normalizeNullableString(filters.search);
  const normalizedLevel = normalizeNullableString(filters.level);
  const normalizedGoal = normalizeNullableString(filters.goal);
  const normalizedIsActive = normalizeBooleanFilter(filters.isActive);
  const limit = Math.min(normalizePositiveInteger(filters.limit, 50), 100);

  params.push(filters.companyId);

  if (normalizedLevel) {
    params.push(normalizedLevel);
    where.push(`level = $${params.length}`);
  }

  if (normalizedGoal) {
    params.push(normalizedGoal);
    where.push(`goal = $${params.length}`);
  }

  if (normalizedIsActive !== null) {
    params.push(normalizedIsActive);
    where.push(`is_active = $${params.length}`);
  }

  if (normalizedSearch) {
    params.push(`%${normalizedSearch.toLowerCase()}%`);
    where.push(
      `(lower(name) like $${params.length} or lower(coalesce(description, '')) like $${params.length} or lower(coalesce(goal, '')) like $${params.length})`
    );
  }

  params.push(limit);

  return {
    text: `
      select *
      from routine_templates
      where ${where.join(" and ")}
      order by name asc, created_at asc
      limit $${params.length}
    `,
    params
  };
}

export async function listRoutineTemplates(companyId, filters = {}) {
  if (!companyId) {
    return [];
  }

  const statement = buildListOptions({ ...filters, companyId });

  try {
    const { rows } = await query(statement.text, statement.params);
    return rows.map(normalizeRoutineTemplateRow);
  } catch (error) {
    if (isRelationMissingError(error)) {
      return [];
    }

    throw error;
  }
}

export async function getRoutineTemplateById(companyId, templateId) {
  if (!companyId || !templateId) {
    return null;
  }

  try {
    const { rows } = await query(
      `
        select *
        from routine_templates
        where company_id = $1
          and id = $2
          and deleted_at is null
        limit 1
      `,
      [companyId, templateId]
    );

    return rows[0] ? normalizeRoutineTemplateRow(rows[0]) : null;
  } catch (error) {
    if (isRelationMissingError(error)) {
      return null;
    }

    throw error;
  }
}

export async function getRoutineTemplateStructure(companyId, templateId) {
  if (!companyId || !templateId) {
    return null;
  }

  try {
    const template = await getRoutineTemplateById(companyId, templateId);

    if (!template) {
      return null;
    }

    const weeksResult = await query(
      `
        select *
        from routine_template_weeks
        where company_id = $1
          and routine_template_id = $2
          and deleted_at is null
        order by week_number asc, created_at asc
      `,
      [companyId, templateId]
    );

    const weekIds = weeksResult.rows.map((row) => row.id);
    const daysResult = weekIds.length
      ? await query(
          `
            select *
            from routine_template_days
            where company_id = $1
              and routine_template_week_id = any($2::uuid[])
              and deleted_at is null
            order by day_number asc, created_at asc
          `,
          [companyId, weekIds]
        )
      : { rows: [] };

    const dayIds = daysResult.rows.map((row) => row.id);
    const exercisesResult = dayIds.length
      ? await query(
          `
            select
              rte.*,
              e.name as exercise_name,
              e.category as exercise_category,
              e.muscle_group as exercise_muscle_group,
              e.equipment as exercise_equipment,
              e.difficulty as exercise_difficulty,
              e.is_active as exercise_is_active
            from routine_template_exercises rte
            left join exercises e
              on e.id = rte.exercise_id
             and e.company_id = rte.company_id
             and e.deleted_at is null
            where rte.company_id = $1
              and rte.routine_template_day_id = any($2::uuid[])
              and rte.deleted_at is null
            order by rte.sort_order asc, rte.created_at asc
          `,
          [companyId, dayIds]
        )
      : { rows: [] };

    const exercisesByDayId = exercisesResult.rows.reduce((accumulator, row) => {
      const key = row.routine_template_day_id;
      if (!accumulator[key]) {
        accumulator[key] = [];
      }

      accumulator[key].push(normalizeRoutineTemplateExerciseRow(row));
      return accumulator;
    }, {});

    const daysByWeekId = daysResult.rows.reduce((accumulator, row) => {
      const key = row.routine_template_week_id;
      if (!accumulator[key]) {
        accumulator[key] = [];
      }

      accumulator[key].push({
        id: row.id,
        company_id: row.company_id,
        routine_template_week_id: row.routine_template_week_id,
        day_number: row.day_number,
        name: normalizeNullableString(row.name),
        description: normalizeNullableString(row.description),
        created_by: row.created_by ?? null,
        updated_by: row.updated_by ?? null,
        created_at: row.created_at ?? null,
        updated_at: row.updated_at ?? null,
        deleted_at: row.deleted_at ?? null,
        exercises: exercisesByDayId[row.id] ?? []
      });
      return accumulator;
    }, {});

    const weeks = weeksResult.rows.map((row) => ({
      id: row.id,
      company_id: row.company_id,
      routine_template_id: row.routine_template_id,
      week_number: row.week_number,
      name: normalizeNullableString(row.name),
      description: normalizeNullableString(row.description),
      created_by: row.created_by ?? null,
      updated_by: row.updated_by ?? null,
      created_at: row.created_at ?? null,
      updated_at: row.updated_at ?? null,
      deleted_at: row.deleted_at ?? null,
      days: daysByWeekId[row.id] ?? []
    }));

    return {
      ...template,
      weeks
    };
  } catch (error) {
    if (isRelationMissingError(error)) {
      return null;
    }

    throw error;
  }
}
