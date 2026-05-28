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

function normalizeFitnessClientRow(row) {
  return {
    id: row?.id ?? null,
    company_id: row?.company_id ?? null,
    name: normalizeNullableString(row?.name),
    email: normalizeNullableString(row?.email),
    phone: normalizeNullableString(row?.phone),
    goal: normalizeNullableString(row?.goal),
    status: normalizeNullableString(row?.status),
    assigned_trainer_id: row?.assigned_trainer_id ?? null,
    assigned_trainer_name: normalizeNullableString(row?.assigned_trainer_name),
    created_by: row?.created_by ?? null,
    updated_by: row?.updated_by ?? null,
    created_at: row?.created_at ?? null,
    updated_at: row?.updated_at ?? null,
    deleted_at: row?.deleted_at ?? null
  };
}

function buildListOptions(filters = {}) {
  const params = [];
  const where = ["fc.company_id = $1", "fc.deleted_at is null"];
  const normalizedSearch = normalizeNullableString(filters.search);
  const normalizedStatus = normalizeNullableString(filters.status);
  const normalizedTrainerId = normalizeNullableString(filters.assignedTrainerId);
  const limit = Math.min(normalizePositiveInteger(filters.limit, 50), 100);

  params.push(filters.companyId);

  if (normalizedStatus) {
    params.push(normalizedStatus);
    where.push(`fc.status = $${params.length}`);
  }

  if (normalizedTrainerId) {
    params.push(normalizedTrainerId);
    where.push(`fc.assigned_trainer_id = $${params.length}`);
  }

  if (normalizedSearch) {
    params.push(`%${normalizedSearch.toLowerCase()}%`);
    where.push(
      `(lower(fc.name) like $${params.length} or lower(coalesce(fc.email, '')) like $${params.length} or lower(coalesce(fc.goal, '')) like $${params.length})`
    );
  }

  params.push(limit);

  return {
    text: `
      select
        fc.*,
        t.name as assigned_trainer_name
      from fitness_clients fc
      left join trainers t
        on t.id = fc.assigned_trainer_id
       and t.company_id = fc.company_id
       and t.deleted_at is null
      where ${where.join(" and ")}
      order by fc.name asc, fc.created_at asc
      limit $${params.length}
    `,
    params
  };
}

export async function listFitnessClients(companyId, filters = {}) {
  if (!companyId) {
    return [];
  }

  const statement = buildListOptions({ ...filters, companyId });

  try {
    const { rows } = await query(statement.text, statement.params);
    return rows.map(normalizeFitnessClientRow);
  } catch (error) {
    if (isRelationMissingError(error)) {
      return [];
    }

    throw error;
  }
}

export async function getFitnessClientById(companyId, clientId) {
  if (!companyId || !clientId) {
    return null;
  }

  try {
    const { rows } = await query(
      `
        select
          fc.*,
          t.name as assigned_trainer_name
        from fitness_clients fc
        left join trainers t
          on t.id = fc.assigned_trainer_id
         and t.company_id = fc.company_id
         and t.deleted_at is null
        where fc.company_id = $1
          and fc.id = $2
          and fc.deleted_at is null
        limit 1
      `,
      [companyId, clientId]
    );

    return rows[0] ? normalizeFitnessClientRow(rows[0]) : null;
  } catch (error) {
    if (isRelationMissingError(error)) {
      return null;
    }

    throw error;
  }
}
