import { query } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";

export async function listCategories(requestUser, type) {
  const params = [requestUser.companyId];
  let extraWhere = "";

  if (type) {
    params.push(type);
    extraWhere = "and type = $2";
  }

  const { rows } = await query(
    `
      select *
      from categories
      where company_id = $1
      ${extraWhere}
      order by type, name
    `,
    params
  );

  return rows;
}

export async function createCategory(data, requestUser) {
  if (requestUser.role !== "super_admin" && data.company_id !== requestUser.companyId) {
    throw new ApiError(403, "No puedes crear categorias para otra empresa");
  }

  const { rows } = await query(
    `
      insert into categories (company_id, type, name, color, active)
      values ($1, $2, $3, $4, $5)
      returning *
    `,
    [data.company_id, data.type, data.name, data.color ?? null, data.active]
  );

  return rows[0];
}
