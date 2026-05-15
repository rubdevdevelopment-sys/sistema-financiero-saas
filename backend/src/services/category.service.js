import { query } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";

function resolveCompanyId(data, requestUser) {
  if (requestUser.role === "super_admin" && data?.company_id) {
    return data.company_id;
  }

  return requestUser.companyId;
}

async function getCategoryById(id) {
  const { rows } = await query(
    `
      select *
      from categories
      where id = $1
      limit 1
    `,
    [id]
  );

  return rows[0] ?? null;
}

async function assertCategoryOwnership(category, requestUser) {
  if (!category || category.deleted_at) {
    throw new ApiError(404, "Categoria no encontrada");
  }

  if (requestUser.role !== "super_admin" && category.company_id !== requestUser.companyId) {
    throw new ApiError(403, "No puedes acceder a categorias de otra empresa");
  }
}

async function assertCategoryNameAvailable({ companyId, type, name, excludeId }) {
  const params = [companyId, type, name.trim().toLowerCase()];
  let extraWhere = "";

  if (excludeId) {
    params.push(excludeId);
    extraWhere = "and id <> $4";
  }

  const { rows } = await query(
    `
      select id
      from categories
      where company_id = $1
        and type = $2
        and lower(name) = $3
        and deleted_at is null
        ${extraWhere}
      limit 1
    `,
    params
  );

  if (rows[0]) {
    throw new ApiError(409, "Ya existe una categoria con ese nombre para la empresa");
  }
}

async function countRelatedMovements(categoryId) {
  const [incomeResult, expenseResult] = await Promise.all([
    query(
      `
        select count(*)::int as total
        from incomes
        where category_id = $1 and deleted_at is null
      `,
      [categoryId]
    ),
    query(
      `
        select count(*)::int as total
        from expenses
        where category_id = $1 and deleted_at is null
      `,
      [categoryId]
    )
  ]);

  return Number(incomeResult.rows[0].total) + Number(expenseResult.rows[0].total);
}

export async function listCategories(requestUser, filters) {
  const companyId = resolveCompanyId(filters, requestUser);
  const params = [companyId];
  let index = 2;
  const where = ["company_id = $1", "deleted_at is null"];

  if (filters.type) {
    where.push(`type = $${index++}`);
    params.push(filters.type);
  }

  if (filters.active) {
    where.push(`active = $${index++}`);
    params.push(filters.active === "true");
  }

  if (filters.search) {
    where.push(`name ilike $${index++}`);
    params.push(`%${filters.search}%`);
  }

  const page = filters.page ?? 1;
  const pageSize = filters.page_size ?? 12;
  const offset = (page - 1) * pageSize;
  params.push(pageSize, offset);
  const filterParams = params.slice(0, -2);

  const [itemsResult, countResult, totalsResult] = await Promise.all([
    query(
      `
        select *
        from categories
        where ${where.join(" and ")}
        order by type, active desc, name asc
        limit $${index++} offset $${index}
      `,
      params
    ),
    query(
      `
        select count(*)::int as total
        from categories
        where ${where.join(" and ")}
      `,
      filterParams
    ),
    query(
      `
        select
          count(*) filter (where type = 'income')::int as income_count,
          count(*) filter (where type = 'expense')::int as expense_count,
          count(*) filter (where active = true)::int as active_count
        from categories
        where company_id = $1 and deleted_at is null
      `,
      [companyId]
    )
  ]);

  return {
    items: itemsResult.rows,
    pagination: {
      page,
      page_size: pageSize,
      total: countResult.rows[0].total,
      total_pages: Math.max(1, Math.ceil(countResult.rows[0].total / pageSize))
    },
    summary: {
      income_count: Number(totalsResult.rows[0].income_count),
      expense_count: Number(totalsResult.rows[0].expense_count),
      active_count: Number(totalsResult.rows[0].active_count)
    }
  };
}

export async function createCategory(data, requestUser) {
  const companyId = resolveCompanyId(data, requestUser);

  if (requestUser.role !== "super_admin" && companyId !== requestUser.companyId) {
    throw new ApiError(403, "No puedes crear categorias para otra empresa");
  }

  await assertCategoryNameAvailable({
    companyId,
    type: data.type,
    name: data.name
  });

  const { rows } = await query(
    `
      insert into categories (company_id, type, name, color, active)
      values ($1, $2, $3, $4, $5)
      returning *
    `,
    [companyId, data.type, data.name.trim(), data.color ?? null, data.active]
  );

  return rows[0];
}

export async function updateCategory(id, data, requestUser) {
  const existing = await getCategoryById(id);
  await assertCategoryOwnership(existing, requestUser);

  const companyId = resolveCompanyId(data, requestUser);

  if (requestUser.role !== "super_admin" && companyId !== requestUser.companyId) {
    throw new ApiError(403, "No puedes mover categorias a otra empresa");
  }

  await assertCategoryNameAvailable({
    companyId,
    type: data.type,
    name: data.name,
    excludeId: id
  });

  const { rows } = await query(
    `
      update categories
      set company_id = $2,
          type = $3,
          name = $4,
          color = $5,
          active = $6,
          updated_at = now()
      where id = $1
      returning *
    `,
    [id, companyId, data.type, data.name.trim(), data.color ?? null, data.active]
  );

  return rows[0];
}

export async function deleteCategory(id, requestUser) {
  const existing = await getCategoryById(id);
  await assertCategoryOwnership(existing, requestUser);

  const relatedMovements = await countRelatedMovements(id);

  if (relatedMovements > 0) {
    throw new ApiError(
      409,
      "No puedes eliminar una categoria con movimientos asociados. Puedes desactivarla."
    );
  }

  const { rows } = await query(
    `
      update categories
      set deleted_at = now(),
          deleted_by = $2,
          active = false,
          updated_at = now()
      where id = $1
      returning id, company_id, deleted_at
    `,
    [id, requestUser.id]
  );

  return rows[0];
}
