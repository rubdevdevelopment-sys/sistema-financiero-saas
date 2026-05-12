import crypto from "crypto";
import { query } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { signAccessToken } from "../utils/jwt.js";

export async function loginUser({ email, password }) {
  const { rows } = await query(
    `
      select u.id, u.company_id, u.full_name, u.email, u.password_hash, u.role, u.active,
             c.name as company_name, c.slug as company_slug, c.active as company_active
      from app_users u
      join companies c on c.id = u.company_id
      where lower(u.email) = lower($1)
      limit 1
    `,
    [email]
  );

  const user = rows[0];

  if (!user) {
    throw new ApiError(401, "Credenciales invalidas");
  }

  if (!user.active || !user.company_active) {
    throw new ApiError(403, "Usuario o empresa inactiva");
  }

  const isValid = await comparePassword(password, user.password_hash);

  if (!isValid) {
    throw new ApiError(401, "Credenciales invalidas");
  }

  const token = signAccessToken({
    id: user.id,
    companyId: user.company_id,
    role: user.role,
    email: user.email
  });

  return {
    token,
    user: {
      id: user.id,
      company_id: user.company_id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      company_name: user.company_name,
      company_slug: user.company_slug
    }
  };
}

export async function createPasswordResetToken(email) {
  const { rows } = await query(
    `select id from app_users where lower(email) = lower($1) limit 1`,
    [email]
  );

  const user = rows[0];

  if (!user) {
    return {
      sent: true
    };
  }

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await query(
    `
      insert into password_resets (user_id, token, expires_at)
      values ($1, $2, $3)
    `,
    [user.id, token, expiresAt]
  );

  return {
    sent: true,
    token
  };
}

export async function resetPassword({ token, password }) {
  const { rows } = await query(
    `
      select pr.id, pr.user_id
      from password_resets pr
      where pr.token = $1 and pr.used_at is null and pr.expires_at > now()
      limit 1
    `,
    [token]
  );

  const resetRecord = rows[0];

  if (!resetRecord) {
    throw new ApiError(400, "Token de recuperacion invalido o vencido");
  }

  const newHash = await hashPassword(password);

  await query(`update app_users set password_hash = $1 where id = $2`, [
    newHash,
    resetRecord.user_id
  ]);

  await query(`update password_resets set used_at = now() where id = $1`, [
    resetRecord.id
  ]);

  return {
    updated: true
  };
}
