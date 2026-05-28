import { query } from "../../config/db.js";

function normalizeNullableString(value) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function normalizePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function isRelationMissingError(error) {
  return error?.code === "42P01";
}

function normalizeTrainerRow(row) {
  return {
    id: row?.id ?? null,
    company_id: row?.company_id ?? null,
    name: normalizeNullableString(row?.name),
    email: normalizeNullableString(row?.email),
    phone: normalizeNullableString(row?.phone),
    specialization: normalizeNullableString(row?.specialization),
    status: normalizeNullableString(row?.status),
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
  const normalizedStatus = normalizeNullableString(filters.status);
  const normalizedSpecialization = normalizeNullableString(filters.specialization);
  const limit = Math.min(normalizePositiveInteger(filters.limit, 50), 100);

  params.push(filters.companyId);

  if (normalizedStatus) {
    params.push(normalizedStatus);
    where.push(`status = $${params.length}`);
  }

  if (normalizedSpecialization) {
    params.push(normalizedSpecialization);
    where.push(`specialization = $${params.length}`);
  }

  if (normalizedSearch) {
    params.push(`%${normalizedSearch.toLowerCase()}%`);
    where.push(
      `(lower(name) like $${params.length} or lower(coalesce(email, '')) like $${params.length} or lower(coalesce(specialization, '')) like $${params.length})`
    );
  }

  params.push(limit);

  return {
    text: `
      select *
      from trainers
      where ${where.join(" and ")}
      order by name asc, created_at asc
      limit $${params.length}
    `,
    params
  };
}

export async function listTrainers(companyId, filters = {}) {
  if (!companyId) {
    return [];
  }

  const statement = buildListOptions({ ...filters, companyId });

  try {
    const { rows } = await query(statement.text, statement.params);
    return rows.map(normalizeTrainerRow);
  } catch (error) {
    if (isRelationMissingError(error)) {
      return [];
    }

    throw error;
  }
}

export async function getTrainerById(companyId, trainerId) {
  if (!companyId || !trainerId) {
    return null;
  }

  try {
    const { rows } = await query(
      `
        select *
        from trainers
        where company_id = $1
          and id = $2
          and deleted_at is null
        limit 1
      `,
      [companyId, trainerId]
    );

    return rows[0] ? normalizeTrainerRow(rows[0]) : null;
  } catch (error) {
    if (isRelationMissingError(error)) {
      return null;
    }

    throw error;
  }
}
