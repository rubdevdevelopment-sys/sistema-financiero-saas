import { query } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";

export async function getPublicCompanyDashboardBySlug(slug) {
  const companyResult = await query(
    `
      select
        id,
        name,
        slug,
        public_slug,
        public_dashboard_enabled,
        currency,
        updated_at
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
    [company.id]
  );

  const metrics = metricsResult.rows[0] ?? {};

  return {
    company: {
      id: company.id,
      name: company.name,
      slug: company.public_slug ?? company.slug,
      currency: company.currency
    },
    updatedAt: metrics.last_updated_at ?? company.updated_at,
    cards: {
      aportesParticipantes: Number(metrics.participant_contributions ?? 0),
      otrosIngresos: Number(metrics.other_incomes ?? 0),
      totalIngresosGenerales: Number(metrics.total_income ?? 0),
      totalGastos: Number(metrics.total_expense ?? 0),
      totalRecaudado: Number(metrics.total_collected ?? 0),
      saldoActualCaja: Number(metrics.current_cash_balance ?? 0),
      porcentajeCumplimiento: Number(metrics.target_completion_percentage ?? 0),
      recaudoDelMes: Number(metrics.month_income ?? 0),
      totalParticipantes: Number(metrics.total_participants ?? 0),
      participantesCompletos: Number(metrics.participants_completed ?? 0),
      participantesPendientes: Number(metrics.participants_pending ?? 0),
      aportesPendientes: Number(metrics.total_pending_amount ?? 0)
    }
  };
}
