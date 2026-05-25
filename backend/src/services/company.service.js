import { query } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";

async function ensurePublicSlugAvailable(publicSlug, companyId = null) {
  if (!publicSlug) {
    return;
  }

  const values = [publicSlug];
  let sql = `
    select id
    from companies
    where public_slug = $1
  `;

  if (companyId) {
    values.push(companyId);
    sql += " and id <> $2";
  }

  sql += " limit 1";

  const { rows } = await query(sql, values);

  if (rows[0]) {
    throw new ApiError(409, "El slug publico ya esta en uso por otra empresa");
  }
}

export async function listCompanies() {
  const { rows } = await query(
    `
      select c.*,
             count(distinct u.id) as users_count,
             count(distinct case when cm.enabled then cm.module_key end) as active_modules
      from companies c
      left join app_users u on u.company_id = c.id
      left join company_modules cm on cm.company_id = c.id
      group by c.id
      order by c.created_at desc
    `
  );

  return rows;
}

export async function createCompany(data) {
  await ensurePublicSlugAvailable(data.public_slug ?? null);

  const { rows } = await query(
    `
      insert into companies (
        name,
        slug,
        nit,
        email,
        phone,
        currency,
        timezone,
        business_model,
        valor_objetivo_emaus,
        active,
        public_dashboard_enabled,
        public_slug
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      returning *
    `,
    [
      data.name,
      data.slug,
      data.nit ?? null,
      data.email ?? null,
      data.phone ?? null,
      data.currency,
      data.timezone,
      data.business_model,
      data.valor_objetivo_emaus,
      data.active,
      data.public_dashboard_enabled ?? false,
      data.public_slug ?? null
    ]
  );

  const company = rows[0];

  const modules = ["dashboard", "participants", "incomes", "expenses", "admin"];
  if (data.business_model !== "standard") {
    modules.push("cooperative_fund");
  }

  for (const moduleKey of modules) {
    await query(
      `
        insert into company_modules (company_id, module_key, enabled)
        values ($1, $2, true)
      `,
      [company.id, moduleKey]
    );
  }

  return company;
}

export async function updateCompany(id, data) {
  const currentResult = await query(
    `
      select *
      from companies
      where id = $1
      limit 1
    `,
    [id]
  );

  const current = currentResult.rows[0];

  if (!current) {
    throw new ApiError(404, "Empresa no encontrada");
  }

  const nextPublicSlug =
    data.public_slug !== undefined
      ? data.public_slug
      : current.public_slug;

  await ensurePublicSlugAvailable(nextPublicSlug ?? null, id);

  const { rows } = await query(
    `
      update companies
      set name = $2,
          nit = $3,
          email = $4,
          phone = $5,
          currency = $6,
          timezone = $7,
          business_model = $8,
          valor_objetivo_emaus = $9,
          active = $10,
          public_dashboard_enabled = $11,
          public_slug = $12,
          updated_at = now()
      where id = $1
      returning *
    `,
    [
      id,
      data.name ?? current.name,
      data.nit !== undefined ? data.nit : current.nit,
      data.email !== undefined ? data.email : current.email,
      data.phone !== undefined ? data.phone : current.phone,
      data.currency ?? current.currency,
      data.timezone ?? current.timezone,
      data.business_model ?? current.business_model,
      data.valor_objetivo_emaus ?? current.valor_objetivo_emaus,
      data.active ?? current.active,
      data.public_dashboard_enabled ?? current.public_dashboard_enabled,
      nextPublicSlug ?? null
    ]
  );

  const company = rows[0];

  if (company.business_model !== "standard") {
    await query(
      `
        insert into company_modules (company_id, module_key, enabled)
        values ($1, 'cooperative_fund', true)
        on conflict (company_id, module_key)
        do update set enabled = true
      `,
      [company.id]
    );
  }

  return company;
}

export async function getCurrentCompany(requestUser, filters = {}) {
  const companyId =
    requestUser.role === "super_admin" && filters.company_id
      ? filters.company_id
      : requestUser.companyId;

  if (requestUser.role === "super_admin" && !filters.company_id) {
    throw new ApiError(400, "Selecciona una empresa para ver su configuracion");
  }

  const { rows } = await query(
    `
      select *
      from companies
      where id = $1
      limit 1
    `,
    [companyId]
  );

  if (!rows[0]) {
    throw new ApiError(404, "Empresa no encontrada");
  }

  return rows[0];
}

export async function updateCurrentCompany(requestUser, data, filters = {}) {
  const current = await getCurrentCompany(requestUser, filters);
  const nextPublicSlug =
    data.public_slug !== undefined
      ? data.public_slug
      : current.public_slug;

  await ensurePublicSlugAvailable(nextPublicSlug ?? null, current.id);

  const { rows } = await query(
    `
      update companies
      set name = $2,
          phone = $3,
          email = $4,
          valor_objetivo_emaus = $5,
          public_dashboard_enabled = $6,
          public_slug = $7,
          updated_at = now()
      where id = $1
      returning *
    `,
    [
      current.id,
      data.name ?? current.name,
      data.phone !== undefined ? data.phone : current.phone,
      data.email !== undefined ? data.email : current.email,
      data.valor_objetivo_emaus ?? current.valor_objetivo_emaus,
      data.public_dashboard_enabled ?? current.public_dashboard_enabled,
      nextPublicSlug ?? null
    ]
  );

  return rows[0];
}
