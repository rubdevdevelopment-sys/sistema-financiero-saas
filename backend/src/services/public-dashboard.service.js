import { query } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";

function number(value) {
  return Number(value ?? 0);
}

function isFundLikeBusinessModel(model) {
  return ["cooperative_fund", "investment_fund", "rotating_capital", "lending_group"].includes(model);
}

async function getFitnessPublicMetrics(companyId, company) {
  const fitnessSettings = company.fitness_settings ?? {};
  const metricsResult = await query(
    `
      with clients as (
        select
          count(*)::int as total_clients,
          count(*) filter (where status = 'active')::int as active_clients,
          count(*) filter (
            where membership_ends_on is not null
              and membership_ends_on >= current_date
              and membership_ends_on <= current_date + interval '7 days'
          )::int as expiring_memberships
        from fitness_clients
        where company_id = $1
          and deleted_at is null
      ),
      programs as (
        select count(*)::int as active_programs
        from workout_programs
        where company_id = $1
          and deleted_at is null
          and status = 'active'
      ),
      logs as (
        select
          count(*)::int as workouts_month,
          coalesce(sum(weight_used), 0) as total_load_month
        from workout_logs
        where company_id = $1
          and deleted_at is null
          and performed_on >= date_trunc('month', current_date)::date
      ),
      activity as (
        select greatest(
          coalesce((select max(updated_at) from companies where id = $1), 'epoch'::timestamptz),
          coalesce((select max(updated_at) from fitness_clients where company_id = $1 and deleted_at is null), 'epoch'::timestamptz),
          coalesce((select max(updated_at) from workout_programs where company_id = $1 and deleted_at is null), 'epoch'::timestamptz),
          coalesce((select max(updated_at) from workout_logs where company_id = $1 and deleted_at is null), 'epoch'::timestamptz)
        ) as last_updated_at
      )
      select
        clients.total_clients,
        clients.active_clients,
        clients.expiring_memberships,
        programs.active_programs,
        logs.workouts_month,
        logs.total_load_month,
        activity.last_updated_at
      from clients
      cross join programs
      cross join logs
      cross join activity
    `,
    [companyId]
  );

  const metrics = metricsResult.rows[0] ?? {};

  return {
    dashboardType: "fitness",
    updatedAt: metrics.last_updated_at,
    cards: {
      totalClientes: number(metrics.total_clients),
      clientesActivos: number(metrics.active_clients),
      rutinasActivas: number(metrics.active_programs),
      entrenamientosMes: number(metrics.workouts_month),
      cargaMensualKg: number(metrics.total_load_month),
      membresiasPorVencer: number(metrics.expiring_memberships)
    },
    portal: {
      gym_name: fitnessSettings.gym_name || company.name,
      logo_url: fitnessSettings.logo_url ?? null,
      hero_title: fitnessSettings.hero_title || "Rendimiento, disciplina y progreso medible.",
      hero_subtitle:
        fitnessSettings.hero_subtitle ||
        "Entrenamiento premium con seguimiento individual, planes activos y una experiencia deportiva moderna.",
      accent_color: fitnessSettings.accent_color || "#84cc16",
      secondary_color: fitnessSettings.secondary_color || "#0f172a",
      contact_phone: fitnessSettings.contact_phone || company.phone,
      contact_email: fitnessSettings.contact_email || company.email,
      whatsapp: fitnessSettings.whatsapp ?? null,
      instagram: fitnessSettings.instagram ?? null,
      facebook: fitnessSettings.facebook ?? null,
      tiktok: fitnessSettings.tiktok ?? null,
      address: fitnessSettings.address ?? null,
      hours_summary: fitnessSettings.hours_summary || "Lunes a sabado · 5:00 a.m. - 10:00 p.m.",
      portal_cta_text: fitnessSettings.portal_cta_text || "Agenda tu evaluacion",
      portal_cta_url: fitnessSettings.portal_cta_url ?? null,
      trainers: Array.isArray(fitnessSettings.trainers) ? fitnessSettings.trainers : [],
      testimonials: Array.isArray(fitnessSettings.testimonials) ? fitnessSettings.testimonials : [],
      plans: Array.isArray(fitnessSettings.plans) ? fitnessSettings.plans : []
    }
  };
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
        fitness_settings,
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

  const metrics =
    company.business_model === "fitness" || activeModules.includes("fitness")
      ? await getFitnessPublicMetrics(company.id, company)
      : useFundLikeMetrics
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
    cards: metrics.cards,
    portal: metrics.portal ?? null
  };
}
