import { query } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";

const FUND_MODULES = [
  {
    key: "cycles",
    title: "Ciclos anuales",
    description: "Periodos por anio, temporada o cierre operativo del fondo."
  },
  {
    key: "memberships",
    title: "Miembros y cupos",
    description: "Participantes del fondo, cupos asignados y aportes mensuales."
  },
  {
    key: "shares",
    title: "Gestion de cupos",
    description: "Cupos por miembro, valor historico y aporte mensual esperado."
  },
  {
    key: "loans",
    title: "Prestamos internos",
    description: "Cuentas de prestamo, saldo pendiente, intereses y plan de cuotas."
  },
  {
    key: "penalties",
    title: "Multas y mora",
    description: "Multas fijas, porcentuales e intereses por mora."
  },
  {
    key: "settlements",
    title: "Cierre anual",
    description: "Capital, utilidad, cartera, caja y estado del cierre."
  },
  {
    key: "distributions",
    title: "Reparto proporcional",
    description: "Simulacion y registro de distribuciones por cantidad de cupos."
  }
];

function resolveCompanyId(requestUser, filters = {}) {
  if (requestUser.role === "super_admin" && filters.company_id) {
    return filters.company_id;
  }

  if (requestUser.role === "super_admin") {
    throw new ApiError(400, "Selecciona una empresa para ver el modulo de fondos");
  }

  return requestUser.companyId;
}

function number(value) {
  return Number(value ?? 0);
}

export async function getFundOverview(requestUser, filters = {}) {
  const companyId = resolveCompanyId(requestUser, filters);

  const [
    companyResult,
    cycleSummary,
    memberSummary,
    shareSummary,
    loanSummary,
    penaltySummary,
    settlementSummary,
    recentCycles,
    recentLoans
  ] = await Promise.all([
    query(
      `
        select id, name, slug, business_model
        from companies
        where id = $1
        limit 1
      `,
      [companyId]
    ),
    query(
      `
        select
          count(*)::int as total_cycles,
          count(*) filter (where status = 'active')::int as active_cycles,
          max(cycle_year) as current_year
        from fund_cycles
        where company_id = $1 and deleted_at is null
      `,
      [companyId]
    ),
    query(
      `
        select
          count(*)::int as total_members,
          count(*) filter (where status = 'active')::int as active_members
        from fund_memberships
        where company_id = $1 and deleted_at is null
      `,
      [companyId]
    ),
    query(
      `
        select
          coalesce(sum(shares_count), 0) as total_shares,
          coalesce(sum(monthly_contribution), 0) as monthly_expected
        from fund_shares
        where company_id = $1 and status = 'active' and deleted_at is null
      `,
      [companyId]
    ),
    query(
      `
        select
          count(*) filter (where status = 'active')::int as active_loans,
          coalesce(sum(outstanding_balance) filter (where status = 'active'), 0) as active_portfolio,
          coalesce(sum(principal_amount), 0) as placed_capital
        from loan_accounts
        where company_id = $1 and deleted_at is null
      `,
      [companyId]
    ),
    query(
      `
        select
          count(*) filter (where status = 'pending')::int as pending_penalties,
          coalesce(sum(penalty_amount) filter (where status = 'pending'), 0) as pending_penalty_amount
        from penalties
        where company_id = $1 and deleted_at is null
      `,
      [companyId]
    ),
    query(
      `
        select
          coalesce(sum(total_capital), 0) as total_capital,
          coalesce(sum(total_yields), 0) as total_yields,
          coalesce(sum(available_cash), 0) as available_cash
        from settlements
        where company_id = $1 and deleted_at is null
      `,
      [companyId]
    ),
    query(
      `
        select id, name, cycle_year, status, share_value, monthly_contribution_per_share, starts_on, ends_on
        from fund_cycles
        where company_id = $1 and deleted_at is null
        order by cycle_year desc, created_at desc
        limit 5
      `,
      [companyId]
    ),
    query(
      `
        select
          la.id,
          la.code,
          la.principal_amount,
          la.outstanding_balance,
          la.monthly_interest_rate,
          la.status,
          fm.full_name as member_name
        from loan_accounts la
        left join fund_memberships fm on fm.id = la.membership_id
        where la.company_id = $1 and la.deleted_at is null
        order by la.created_at desc
        limit 5
      `,
      [companyId]
    )
  ]);

  if (!companyResult.rows[0]) {
    throw new ApiError(404, "Empresa no encontrada");
  }

  const cycles = cycleSummary.rows[0] ?? {};
  const members = memberSummary.rows[0] ?? {};
  const shares = shareSummary.rows[0] ?? {};
  const loans = loanSummary.rows[0] ?? {};
  const penalties = penaltySummary.rows[0] ?? {};
  const settlements = settlementSummary.rows[0] ?? {};

  return {
    company: companyResult.rows[0],
    modules: FUND_MODULES,
    cards: {
      capitalRecaudado: number(settlements.total_capital),
      carteraActiva: number(loans.active_portfolio),
      interesesGenerados: number(settlements.total_yields),
      mora: number(penalties.pending_penalty_amount),
      multasPendientes: number(penalties.pending_penalties),
      prestamosActivos: number(loans.active_loans),
      cajaDisponible: number(settlements.available_cash),
      valorCupo: number(recentCycles.rows[0]?.share_value),
      rendimientoAnual: 0,
      proyeccionCierre: number(settlements.total_capital) + number(settlements.total_yields),
      totalCupos: number(shares.total_shares),
      aporteMensualEsperado: number(shares.monthly_expected),
      miembrosActivos: number(members.active_members),
      ciclosActivos: number(cycles.active_cycles)
    },
    recentCycles: recentCycles.rows.map((item) => ({
      ...item,
      share_value: number(item.share_value),
      monthly_contribution_per_share: number(item.monthly_contribution_per_share)
    })),
    recentLoans: recentLoans.rows.map((item) => ({
      ...item,
      principal_amount: number(item.principal_amount),
      outstanding_balance: number(item.outstanding_balance),
      monthly_interest_rate: number(item.monthly_interest_rate)
    }))
  };
}

export async function listFundCycles(requestUser, filters = {}) {
  const companyId = resolveCompanyId(requestUser, filters);
  const { rows } = await query(
    `
      select id, name, cycle_year, starts_on, ends_on, share_value,
             monthly_contribution_per_share, status, settings, created_at
      from fund_cycles
      where company_id = $1 and deleted_at is null
      order by cycle_year desc, created_at desc
    `,
    [companyId]
  );

  return rows.map((item) => ({
    ...item,
    share_value: number(item.share_value),
    monthly_contribution_per_share: number(item.monthly_contribution_per_share)
  }));
}

export async function listFundMembers(requestUser, filters = {}) {
  const companyId = resolveCompanyId(requestUser, filters);
  const { rows } = await query(
    `
      select
        fm.id,
        fm.member_code,
        fm.full_name,
        fm.document_number,
        fm.phone,
        fm.email,
        fm.status,
        fm.joined_on,
        coalesce(sum(fs.shares_count) filter (where fs.status = 'active' and fs.deleted_at is null), 0) as active_shares,
        coalesce(sum(fs.monthly_contribution) filter (where fs.status = 'active' and fs.deleted_at is null), 0) as monthly_contribution
      from fund_memberships fm
      left join fund_shares fs on fs.membership_id = fm.id
      where fm.company_id = $1 and fm.deleted_at is null
      group by fm.id
      order by fm.full_name asc
    `,
    [companyId]
  );

  return rows.map((item) => ({
    ...item,
    active_shares: number(item.active_shares),
    monthly_contribution: number(item.monthly_contribution)
  }));
}
