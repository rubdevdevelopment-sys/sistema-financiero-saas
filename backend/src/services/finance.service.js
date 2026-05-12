import { query } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";

function resolveCompanyId(data, requestUser) {
  if (requestUser.role === "super_admin" && data.company_id) {
    return data.company_id;
  }

  return requestUser.companyId;
}

async function assertCategoryBelongsToCompany(categoryId, companyId, expectedType) {
  const { rows } = await query(
    `
      select id
      from categories
      where id = $1 and company_id = $2 and type = $3
      limit 1
    `,
    [categoryId, companyId, expectedType]
  );

  if (!rows[0]) {
    throw new ApiError(400, "La categoria no pertenece a la empresa o modulo actual");
  }
}

async function getMovementById(table, id) {
  const { rows } = await query(`select * from ${table} where id = $1 limit 1`, [id]);
  return rows[0] ?? null;
}

export async function listMovements(table, requestUser, filters) {
  const params = [requestUser.companyId];
  let index = 2;
  const clauses = [`m.company_id = $1`];

  if (filters.status) {
    clauses.push(`m.status = $${index++}`);
    params.push(filters.status);
  }

  if (filters.category_id) {
    clauses.push(`m.category_id = $${index++}`);
    params.push(filters.category_id);
  }

  if (filters.search) {
    clauses.push(`(m.title ilike $${index} or coalesce(m.description, '') ilike $${index})`);
    params.push(`%${filters.search}%`);
    index += 1;
  }

  const { rows } = await query(
    `
      select m.*,
             c.name as category_name,
             c.type as category_type
      from ${table} m
      join categories c on c.id = m.category_id
      where ${clauses.join(" and ")}
      order by m.movement_date desc, m.created_at desc
    `,
    params
  );

  return rows;
}

export async function createMovement(table, data, requestUser) {
  const companyId = resolveCompanyId(data, requestUser);
  const expectedType = table === "incomes" ? "income" : "expense";

  await assertCategoryBelongsToCompany(data.category_id, companyId, expectedType);

  const { rows } = await query(
    `
      insert into ${table} (
        company_id,
        category_id,
        title,
        description,
        amount,
        movement_date,
        payment_method,
        status,
        attachment_url,
        notes,
        responsible,
        created_by
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      returning *
    `,
    [
      companyId,
      data.category_id,
      data.title,
      data.description ?? null,
      data.amount,
      data.movement_date,
      data.payment_method,
      data.status,
      data.attachment_url ?? null,
      data.notes ?? null,
      data.responsible ?? null,
      requestUser.id
    ]
  );

  return rows[0];
}

export async function updateMovement(table, id, data, requestUser) {
  const existing = await getMovementById(table, id);

  if (!existing) {
    throw new ApiError(404, "Movimiento no encontrado");
  }

  if (requestUser.role !== "super_admin" && existing.company_id !== requestUser.companyId) {
    throw new ApiError(403, "No puedes editar movimientos de otra empresa");
  }

  const companyId = resolveCompanyId(data, requestUser);
  const expectedType = table === "incomes" ? "income" : "expense";

  await assertCategoryBelongsToCompany(data.category_id, companyId, expectedType);

  const { rows } = await query(
    `
      update ${table}
      set company_id = $2,
          category_id = $3,
          title = $4,
          description = $5,
          amount = $6,
          movement_date = $7,
          payment_method = $8,
          status = $9,
          attachment_url = $10,
          notes = $11,
          responsible = $12,
          updated_at = now()
      where id = $1
      returning *
    `,
    [
      id,
      companyId,
      data.category_id,
      data.title,
      data.description ?? null,
      data.amount,
      data.movement_date,
      data.payment_method,
      data.status,
      data.attachment_url ?? null,
      data.notes ?? null,
      data.responsible ?? null
    ]
  );

  return rows[0];
}

export async function deleteMovement(table, id, requestUser) {
  const existing = await getMovementById(table, id);

  if (!existing) {
    throw new ApiError(404, "Movimiento no encontrado");
  }

  if (requestUser.role !== "super_admin" && existing.company_id !== requestUser.companyId) {
    throw new ApiError(403, "No puedes eliminar movimientos de otra empresa");
  }

  const { rows } = await query(
    `delete from ${table} where id = $1 returning id, company_id`,
    [id]
  );

  return rows[0];
}
