import crypto from "crypto";
import { query } from "../config/db.js";
import { logger } from "../config/logger.js";

export async function getSuperAdminDashboard() {
  const [
    companyStats,
    userStats,
    recentCompanies,
    recentUsers
  ] = await Promise.all([
    query(
      `
        select
          count(*)::int as total_companies,
          count(*) filter (where active = true)::int as active_companies
        from companies
      `
    ),
    query(
      `
        select count(*)::int as registered_users
        from app_users
      `
    ),
    query(
      `
        select id, name, slug, active, created_at
        from companies
        order by created_at desc
        limit 6
      `
    ),
    query(
      `
        select u.id, u.full_name, u.email, u.role, u.created_at, c.name as company_name
        from app_users u
        join companies c on c.id = u.company_id
        order by u.created_at desc
        limit 6
      `
    )
  ]);

  const stats = companyStats.rows[0] ?? {};
  const users = userStats.rows[0] ?? {};

  return {
    cards: {
      activeCompanies: stats.active_companies ?? 0,
      totalCompanies: stats.total_companies ?? 0,
      registeredUsers: users.registered_users ?? 0,
      platformRevenue: 0
    },
    recentCompanies: recentCompanies.rows,
    systemStatus: [
      { label: "API Render", status: "Operativa" },
      { label: "Frontend Vercel", status: "Operativa" },
      { label: "Supabase PostgreSQL", status: "Operativa" },
      { label: "Aislamiento tenant", status: "Activo" }
    ],
    recentActivity: [
      ...recentCompanies.rows.map((company) => ({
        id: `company-${company.id}`,
        title: "Empresa creada",
        description: company.name,
        created_at: company.created_at
      })),
      ...recentUsers.rows.map((user) => ({
        id: `user-${user.id}`,
        title: "Usuario registrado",
        description: `${user.full_name} | ${user.company_name} | ${user.role}`,
        created_at: user.created_at
      }))
    ]
      .sort((left, right) => new Date(right.created_at) - new Date(left.created_at))
      .slice(0, 8)
  };
}

export async function registerSupportSession(requestUser, data) {
  const session = {
    id: crypto.randomUUID(),
    company_id: data.company_id,
    reason: data.reason,
    started_at: new Date().toISOString(),
    support_user_id: requestUser.id,
    support_user_email: requestUser.email
  };

  logger.info("Super admin support session started", session);

  return session;
}
