import { query } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { hashPassword } from "../utils/password.js";

export async function listUsers(requestUser) {
  const params = [];
  let where = "";

  if (requestUser.role !== "super_admin") {
    params.push(requestUser.companyId);
    where = `where u.company_id = $1`;
  }

  const { rows } = await query(
    `
      select u.id, u.company_id, u.full_name, u.email, u.role, u.active, u.created_at,
             c.name as company_name
      from app_users u
      join companies c on c.id = u.company_id
      ${where}
      order by u.created_at desc
    `,
    params
  );

  return rows;
}

export async function createUser(data, requestUser) {
  if (requestUser.role !== "super_admin" && requestUser.companyId !== data.company_id) {
    throw new ApiError(403, "No puedes crear usuarios para otra empresa");
  }

  const passwordHash = await hashPassword(data.password);

  const { rows } = await query(
    `
      insert into app_users (company_id, full_name, email, password_hash, role, active)
      values ($1, $2, lower($3), $4, $5, $6)
      returning id, company_id, full_name, email, role, active, created_at
    `,
    [
      data.company_id,
      data.full_name,
      data.email,
      passwordHash,
      data.role,
      data.active
    ]
  );

  return rows[0];
}

export async function updateUser(id, data, requestUser) {
  const { rows: existingRows } = await query(
    `select id, company_id from app_users where id = $1 limit 1`,
    [id]
  );

  const existingUser = existingRows[0];

  if (!existingUser) {
    throw new ApiError(404, "Usuario no encontrado");
  }

  if (
    requestUser.role !== "super_admin" &&
    existingUser.company_id !== requestUser.companyId
  ) {
    throw new ApiError(403, "No puedes editar usuarios de otra empresa");
  }

  const { rows } = await query(
    `
      update app_users
      set full_name = $2,
          role = $3,
          active = $4,
          updated_at = now()
      where id = $1
      returning id, company_id, full_name, email, role, active, created_at
    `,
    [id, data.full_name, data.role, data.active]
  );

  return rows[0];
}
