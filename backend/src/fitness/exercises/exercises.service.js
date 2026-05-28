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

function normalizeExerciseRow(row) {
  return {
    id: row?.id ?? null,
    company_id: row?.company_id ?? null,
    name: normalizeNullableString(row?.name),
    description: normalizeNullableString(row?.description),
    category: normalizeNullableString(row?.category),
    muscle_group: normalizeNullableString(row?.muscle_group),
    equipment: normalizeNullableString(row?.equipment),
    difficulty: normalizeNullableString(row?.difficulty),
    video_url: normalizeNullableString(row?.video_url),
    image_url: normalizeNullableString(row?.image_url),
    is_active: Boolean(row?.is_active),
    created_by: row?.created_by ?? null,
    updated_by: row?.updated_by ?? null,
    created_at: row?.created_at ?? null,
    updated_at: row?.updated_at ?? null,
    deleted_at: row?.deleted_at ?? null
  };
}

function buildListOptions(filters = {}) {
  const params = [];
  const where = ["company_id = $1", "deleted_at is null"];
  const normalizedSearch = normalizeNullableString(filters.search);
  const normalizedCategory = normalizeNullableString(filters.category);
  const normalizedMuscleGroup = normalizeNullableString(filters.muscleGroup);
  const normalizedDifficulty = normalizeNullableString(filters.difficulty);
  const normalizedIsActive = normalizeBooleanFilter(filters.isActive);
  const limit = Math.min(normalizePositiveInteger(filters.limit, 100), 200);

  params.push(filters.companyId);

  if (normalizedCategory) {
    params.push(normalizedCategory);
    where.push(`category = $${params.length}`);
  }

  if (normalizedMuscleGroup) {
    params.push(normalizedMuscleGroup);
    where.push(`muscle_group = $${params.length}`);
  }

  if (normalizedDifficulty) {
    params.push(normalizedDifficulty);
    where.push(`difficulty = $${params.length}`);
  }

  if (normalizedIsActive !== null) {
    params.push(normalizedIsActive);
    where.push(`is_active = $${params.length}`);
  }

  if (normalizedSearch) {
    params.push(`%${normalizedSearch.toLowerCase()}%`);
    where.push(
      `(lower(name) like $${params.length} or lower(coalesce(description, '')) like $${params.length} or lower(coalesce(category, '')) like $${params.length} or lower(coalesce(muscle_group, '')) like $${params.length})`
    );
  }

  params.push(limit);

  return {
    text: `
      select *
      from exercises
      where ${where.join(" and ")}
      order by name asc, created_at asc
      limit $${params.length}
    `,
    params
  };
}

export async function listExercises(companyId, filters = {}) {
  if (!companyId) {
    return [];
  }

  const statement = buildListOptions({ ...filters, companyId });

  try {
    const { rows } = await query(statement.text, statement.params);
    return rows.map(normalizeExerciseRow);
  } catch (error) {
    if (isRelationMissingError(error)) {
      return [];
    }

    throw error;
  }
}

export async function getExerciseById(companyId, exerciseId) {
  if (!companyId || !exerciseId) {
    return null;
  }

  try {
    const { rows } = await query(
      `
        select *
        from exercises
        where company_id = $1
          and id = $2
          and deleted_at is null
        limit 1
      `,
      [companyId, exerciseId]
    );

    return rows[0] ? normalizeExerciseRow(rows[0]) : null;
  } catch (error) {
    if (isRelationMissingError(error)) {
      return null;
    }

    throw error;
  }
}
