import { query } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";

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
  const { rows } = await query(
    `
      insert into companies (name, slug, nit, email, phone, currency, timezone, valor_objetivo_emaus, active)
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
      data.valor_objetivo_emaus,
      data.active
    ]
  );

  const company = rows[0];

  const modules = ["dashboard", "participants", "incomes", "expenses", "admin"];
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
  const { rows } = await query(
    `
      update companies
      set name = $2,
          nit = $3,
          email = $4,
          phone = $5,
          currency = $6,
          timezone = $7,
          valor_objetivo_emaus = $8,
          active = $9,
          updated_at = now()
      where id = $1
      returning *
    `,
    [
      id,
      data.name,
      data.nit ?? null,
      data.email ?? null,
      data.phone ?? null,
      data.currency,
      data.timezone,
      data.valor_objetivo_emaus,
      data.active
    ]
  );

  if (!rows[0]) {
    throw new ApiError(404, "Empresa no encontrada");
  }

  return rows[0];
}

export async function getCurrentCompany(requestUser) {
  const { rows } = await query(
    `
      select *
      from companies
      where id = $1
      limit 1
    `,
    [requestUser.companyId]
  );

  if (!rows[0]) {
    throw new ApiError(404, "Empresa no encontrada");
  }

  return rows[0];
}

export async function updateCurrentCompany(requestUser, data) {
  const current = await getCurrentCompany(requestUser);

  const { rows } = await query(
    `
      update companies
      set name = $2,
          phone = $3,
          email = $4,
          valor_objetivo_emaus = $5,
          updated_at = now()
      where id = $1
      returning *
    `,
    [
      current.id,
      data.name ?? current.name,
      data.phone ?? current.phone,
      data.email ?? current.email,
      data.valor_objetivo_emaus
    ]
  );

  return rows[0];
}
