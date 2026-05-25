import { query } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";

function number(value) {
  return Number(value ?? 0);
}

function isFundLikeBusinessModel(model) {
  return ["cooperative_fund", "investment_fund", "rotating_capital", "lending_group"].includes(model);
}

async function getTraditionalPublicMetrics(companyId) {
  const metricsResult = await query(
    `
      with current_month as (
        select
          date_trunc('month', current_date)::date as month_start,
          (date_trunc('month', current_date) + interval '1 month')::date as next_month_start
      ),
      participant_totals as (
        select
          count(*)::int as total_participants,
          count(*) filter (where payment_status = 'completed')::int as participants_completed,
          count(*) filter (where payment_status <> 'completed')::int as participants_pending,
          coalesce(sum(target_amount), 0) as total_target_amount,
          coalesce(sum(total_paid), 0) as total_collected,
          coalesce(sum(pending_balance), 0) as total_pending_amount
        from participants
        where company_id = $1
          and deleted_at is null
      ),
      income_totals as (
        select
          coalesce(sum(amount) filter (
            where status = 'completed'
              and income_type = 'participant_payment'
          ), 0) as participant_contributions,
          coalesce(sum(amount) filter (
            where status = 'completed'
              and income_type <> 'participant_payment'
          ), 0) as other_incomes,
          coalesce(sum(amount) filter (
            where status = 'completed'
          ), 0) as total_income,
          coalesce(sum(amount) filter (
            where status = 'completed'
              and movement_date >= (select month_start from current_month)
              and movement_date < (select next_month_start from current_month)
          ), 0) as month_income
        from incomes
        where company_id = $1
          and deleted_at is null
      ),
      expense_totals as (
        select
          coalesce(sum(amount) filter (
            where status = 'completed'
          ), 0) as total_expense
        from expenses
        where company_id = $1
          and deleted_at is null
      ),
      activity as (
        select greatest(
          coalesce((select max(updated_at) from companies where id = $1), 'epoch'::timestamptz),
          coalesce((select max(updated_at) from participants where company_id = $1 and deleted_at is null), 'epoch'::timestamptz),
          coalesce((select max(updated_at) from incomes where company_id = $1 and deleted_at is null), 'epoch'::timestamptz),
          coalesce((select max(updated_at) from expenses where company_id = $1 and deleted_at is null), 'epoch'::timestamptz)
        ) as last_updated_at
      )
      select
        pt.total_participants,
        pt.participants_completed,
        pt.participants_pending,
        pt.total_target_amount,
        pt.total_collected,
        pt.total_pending_amount,
        it.participant_contributions,
        it.other_incomes,
        it.total_income,
        it.month_income,
        et.total_expense,
        (it.total_income - et.total_expense) as current_cash_balance,
        case
          when pt.total_target_amount > 0
            then round((pt.total_collected / pt.total_target_amount) * 100, 2)
          else 0
        end as target_completion_percentage,
        activity.last_updated_at
      from participant_totals pt
      cross join income_totals it
      cross join expense_totals et
      cross join activity
    `,
    [companyId]
  );

  const metrics = metricsResult.rows[0] ?? {};

  return {
    dashboardType: "traditional",
    updatedAt: metrics.last_updated_at,
    cards: {
      aportesParticipantes: number(metrics.participant_contributions),
      otrosIngresos: number(metrics.other_incomes),
      totalIngresosGenerales: number(metrics.total_income),
      totalGastos: number(metrics.total_expense),
      totalRecaudado: number(metrics.total_collected),
      saldoActualCaja: number(metrics.current_cash_balance),
      porcentajeCumplimiento: number(metrics.target_completion_percentage),
      recaudoDelMes: number(metrics.month_income),
      totalParticipantes: number(metrics.total_participants),
      participantesCompletos: number(metrics.participants_completed),
      participantesPendientes: number(metrics.participants_pending),
      aportesPendientes: number(metrics.total_pending_amount)
    }
  };
}

async function getFundLikePublicMetrics(companyId) {
  const metricsResult = await query(
    `
      with contribution_totals as (
        select
          coalesce(sum(paid_amount), 0) as capital_total,
          coalesce(sum(paid_amount) filter (
            where year = extract(year from current_date)::int
              and month = extract(month from current_date)::int
          ), 0) as month_contributions,
          coalesce(sum(pending_amount), 0) as pending_portfolio,
          coalesce(sum(paid_amount), 0) as available_cash,
          count(*) filter (where status <> 'paid')::int as pending_count,
          count(*) filter (where status = 'paid')::int as paid_count,
          count(*) filter (where status in ('pending', 'partial', 'overdue'))::int as open_count
        from fund_contributions
        where company_id = $1
          and deleted_at is null
      ),
      member_totals as (
        select
          count(*) filter (where status = 'active')::int as active_members,
          count(*) filter (where status <> 'active')::int as inactive_members
        from fund_members
        where company_id = $1
          and deleted_at is null
      ),
      loan_totals as (
        select
          coalesce(sum(outstanding_balance) filter (where status in ('approved', 'active', 'overdue')), 0) as active_portfolio,
          coalesce(sum(total_interest), 0) as generated_interest,
          count(*) filter (where status in ('approved', 'active', 'overdue'))::int as active_loans
        from fund_loans
        where company_id = $1
          and deleted_at is null
      ),
      activity as (
        select greatest(
          coalesce((select max(updated_at) from companies where id = $1), 'epoch'::timestamptz),
          coalesce((select max(updated_at) from fund_members where company_id = $1 and deleted_at is null), 'epoch'::timestamptz),
          coalesce((select max(updated_at) from fund_contributions where company_id = $1 and deleted_at is null), 'epoch'::timestamptz),
          coalesce((select max(updated_at) from fund_loans where company_id = $1 and deleted_at is null), 'epoch'::timestamptz)
        ) as last_updated_at
      )
      select
        ct.capital_total,
        ct.month_contributions,
        ct.pending_portfolio,
        ct.available_cash,
        ct.pending_count,
        ct.paid_count,
        ct.open_count,
        mt.active_members,
        mt.inactive_members,
        lt.active_portfolio,
        lt.generated_interest,
        lt.active_loans,
        case
          when (ct.capital_total + ct.pending_portfolio) > 0
            then round((ct.capital_total / (ct.capital_total + ct.pending_portfolio)) * 100, 2)
          else 0
        end as portfolio_completion_percentage,
        activity.last_updated_at
      from contribution_totals ct
      cross join member_totals mt
      cross join loan_totals lt
      cross join activity
    `,
    [companyId]
  );

  const metrics = metricsResult.rows[0] ?? {};
  const capitalRecaudado = number(metrics.capital_total);
  const intereses = number(metrics.generated_interest);
  const carteraPendiente = number(metrics.pending_portfolio) + number(metrics.active_portfolio);
  const totalConsolidado = capitalRecaudado + intereses;

  return {
    dashboardType: "fund_like",
    updatedAt: metrics.last_updated_at,
    cards: {
      capitalRecaudado,
      carteraPendiente,
      cuotasPendientes: number(metrics.pending_count),
      cuotasPagadas: number(metrics.paid_count),
      cuotasAbiertas: number(metrics.open_count),
      cajaDisponible: number(metrics.available_cash),
      interesesPrestamos: intereses,
      totalCapitalMasIntereses: totalConsolidado,
      prestamosActivos: number(metrics.active_loans),
      miembrosActivos: number(metrics.active_members),
      porcentajeCumplimiento: number(metrics.portfolio_completion_percentage),
      recaudoDelMes: number(metrics.month_contributions),
      totalGastos: 0
    }
  };
}

export async function getPublicCompanyDashboardBySlug(slug) {
  const companyResult = await query(
    `
      select
        id,
        name,
        slug,
        business_model,
        public_slug,
        public_dashboard_enabled,
        currency,
        updated_at,
        coalesce((
          select json_agg(cm.module_key order by cm.module_key)
          from company_modules cm
          where cm.company_id = companies.id
            and cm.enabled = true
        ), '[]'::json) as active_modules
      from companies
      where public_slug = $1
      limit 1
    `,
    [slug]
  );

  const company = companyResult.rows[0];

  if (!company) {
    throw new ApiError(404, "Portal publico no encontrado");
  }

  if (!company.public_dashboard_enabled) {
    throw new ApiError(404, "El portal publico no esta disponible para esta empresa");
  }

  const activeModules = Array.isArray(company.active_modules)
    ? company.active_modules
    : [];
  const useFundLikeMetrics =
    isFundLikeBusinessModel(company.business_model) || activeModules.includes("cooperative_fund");
  const dashboardType = useFundLikeMetrics ? "fund_like" : "traditional";

  console.log(company.business_model);
  console.log(activeModules);
  console.log(dashboardType);

  const metrics = useFundLikeMetrics
    ? await getFundLikePublicMetrics(company.id)
    : await getTraditionalPublicMetrics(company.id);

  return {
    company: {
      name: company.name,
      slug: company.public_slug ?? company.slug,
      currency: company.currency,
      businessModel: company.business_model
    },
    dashboardType: metrics.dashboardType,
    updatedAt: metrics.updatedAt ?? company.updated_at,
    cards: metrics.cards
  };
}
