import { query } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";

export async function getDashboardMetrics(requestUser, filters = {}) {
  const companyId =
    requestUser.role === "super_admin" && filters.company_id
      ? filters.company_id
      : requestUser.companyId;

  if (requestUser.role === "super_admin" && !filters.company_id) {
    throw new ApiError(400, "Selecciona una empresa para ver el dashboard financiero");
  }

  const [
    monthlyKpis,
    recentMovementsResult,
    monthlySummary,
    statusBreakdown,
    categoryBreakdown,
    incomeTypeBreakdown,
    participantSummary,
    participantsCompleted,
    participantsPending,
    recentExpenses,
    recentContributions,
    participantProgress
  ] =
    await Promise.all([
      query(
        `
          with current_month as (
            select
              date_trunc('month', current_date)::date as month_start,
              (date_trunc('month', current_date) + interval '1 month')::date as next_month_start
          ),
          month_income as (
            select coalesce(sum(amount), 0) as total
            from incomes, current_month cm
            where company_id = $1
              and status = 'completed'
              and deleted_at is null
              and movement_date >= cm.month_start
              and movement_date < cm.next_month_start
          ),
          month_expense as (
            select coalesce(sum(amount), 0) as total
            from expenses, current_month cm
            where company_id = $1
              and status = 'completed'
              and deleted_at is null
              and movement_date >= cm.month_start
              and movement_date < cm.next_month_start
          ),
          total_expense as (
            select coalesce(sum(amount), 0) as total
            from expenses
            where company_id = $1
              and status = 'completed'
              and deleted_at is null
          )
          select
            (select total from month_income) as month_income,
            (select total from month_expense) as month_expense,
            (select total from total_expense) as total_expense,
            (
              select count(*)::int
              from (
                select id from incomes
                where company_id = $1 and status = 'pending' and deleted_at is null
                union all
                select id from expenses
                where company_id = $1 and status = 'pending' and deleted_at is null
              ) pending_movements
            ) as pending_movements
        `,
        [companyId]
      ),
      query(
        `
          select *
          from (
            select
              i.id,
              i.title,
              i.amount,
              i.movement_date,
              i.status,
              i.created_at,
              i.income_type,
              c.name as category_name,
              c.color as category_color,
              p.full_name as participant_name,
              'income' as type
            from incomes i
            join categories c on c.id = i.category_id
            left join participants p on p.id = i.participant_id and p.deleted_at is null
            where i.company_id = $1 and i.deleted_at is null and c.deleted_at is null
            union all
            select
              e.id,
              e.title,
              e.amount,
              e.movement_date,
              e.status,
              e.created_at,
              null as income_type,
              c.name as category_name,
              c.color as category_color,
              e.authorized_by as participant_name,
              'expense' as type
            from expenses e
            join categories c on c.id = e.category_id
            where e.company_id = $1 and e.deleted_at is null and c.deleted_at is null
          ) movements
          order by movement_date desc, created_at desc
          limit 8
        `,
        [companyId]
      ),
      query(
        `
          with months as (
            select generate_series(
              date_trunc('month', current_date) - interval '5 months',
              date_trunc('month', current_date),
              interval '1 month'
            ) as month
          )
          select
            to_char(m.month, 'YYYY-MM') as period,
            to_char(m.month, 'Mon YYYY') as label,
            coalesce(i.total, 0) as incomes,
            coalesce(e.total, 0) as expenses
          from months m
          left join (
            select date_trunc('month', movement_date) as month, sum(amount) as total
            from incomes
            where company_id = $1 and status = 'completed' and deleted_at is null
            group by 1
          ) i on i.month = m.month
          left join (
            select date_trunc('month', movement_date) as month, sum(amount) as total
            from expenses
            where company_id = $1 and status = 'completed' and deleted_at is null
            group by 1
          ) e on e.month = m.month
          order by m.month
        `,
        [companyId]
      ),
      query(
        `
          select status, count(*)::int as total
          from (
            select status from incomes where company_id = $1 and deleted_at is null
            union all
            select status from expenses where company_id = $1 and deleted_at is null
          ) movements
          group by status
        `,
        [companyId]
      ),
      query(
        `
          select *
          from (
            select
              c.name as category_name,
              c.color as category_color,
              sum(i.amount) as total_amount,
              'income' as type
            from incomes i
            join categories c on c.id = i.category_id
            where i.company_id = $1
              and i.status = 'completed'
              and i.deleted_at is null
              and c.deleted_at is null
            group by c.id, c.name, c.color
            union all
            select
              c.name as category_name,
              c.color as category_color,
              sum(e.amount) as total_amount,
              'expense' as type
            from expenses e
            join categories c on c.id = e.category_id
            where e.company_id = $1
              and e.status = 'completed'
              and e.deleted_at is null
              and c.deleted_at is null
            group by c.id, c.name, c.color
          ) category_totals
          order by total_amount desc
          limit 10
        `,
        [companyId]
      ),
      query(
        `
          select
            income_type,
            coalesce(sum(amount), 0) as total_amount
          from incomes
          where company_id = $1
            and status = 'completed'
            and deleted_at is null
          group by income_type
          order by total_amount desc
        `,
        [companyId]
      ),
      query(
        `
          select
            count(*)::int as total_participants,
            count(*) filter (where payment_status = 'completed')::int as participants_completed,
            count(*) filter (where payment_status <> 'completed')::int as participants_pending,
            coalesce(sum(target_amount), 0) as total_meta,
            coalesce(sum(total_paid), 0) as total_recaudado
          from participants
          where company_id = $1 and deleted_at is null
        `,
        [companyId]
      ),
      query(
        `
          select id, full_name, document_number, total_paid, target_amount, pending_balance, payment_status
          from participants
          where company_id = $1 and deleted_at is null and payment_status = 'completed'
          order by updated_at desc
          limit 6
        `,
        [companyId]
      ),
      query(
        `
          select id, full_name, document_number, total_paid, target_amount, pending_balance, payment_status
          from participants
          where company_id = $1 and deleted_at is null and payment_status <> 'completed'
          order by pending_balance desc, full_name asc
          limit 6
        `,
        [companyId]
      ),
      query(
        `
          select id, title, amount, movement_date, status, authorized_by, receipt_reference
          from expenses
          where company_id = $1 and deleted_at is null
          order by movement_date desc, created_at desc
          limit 6
        `,
        [companyId]
      ),
      query(
        `
          select
            i.id,
            i.title,
            i.amount,
            i.movement_date,
            i.status,
            i.income_type,
            i.installment_number,
            i.receipt_number,
            p.full_name as participant_name
          from incomes i
          join participants p on p.id = i.participant_id and p.deleted_at is null
          where i.company_id = $1 and i.deleted_at is null
            and i.income_type = 'participant_payment'
          order by i.movement_date desc, i.created_at desc
          limit 6
        `,
        [companyId]
      ),
      query(
        `
          select
            id,
            full_name,
            total_paid,
            target_amount,
            pending_balance,
            payment_status
          from participants
          where company_id = $1 and deleted_at is null and active = true
          order by case payment_status
                     when 'pending' then 1
                     when 'partial' then 2
                     when 'completed' then 3
                     else 4
                   end,
                   total_paid desc,
                   full_name asc
          limit 12
        `,
        [companyId]
      )
    ]);

  const monthIncome = Number(monthlyKpis.rows[0]?.month_income ?? 0);
  const monthExpense = Number(monthlyKpis.rows[0]?.month_expense ?? 0);
  const totalExpense = Number(monthlyKpis.rows[0]?.total_expense ?? 0);
  const totalMeta = Number(participantSummary.rows[0]?.total_meta ?? 0);
  const aportesParticipantes = incomeTypeBreakdown.rows
    .filter((item) => item.income_type === "participant_payment")
    .reduce((acc, item) => acc + Number(item.total_amount), 0);
  const otrosIngresos = incomeTypeBreakdown.rows
    .filter((item) => item.income_type !== "participant_payment")
    .reduce((acc, item) => acc + Number(item.total_amount), 0);
  const totalIngresosGenerales = aportesParticipantes + otrosIngresos;
  const porcentajeCumplimiento =
    totalMeta > 0
      ? (aportesParticipantes / totalMeta) * 100
      : 0;

  return {
    cards: {
      aportesParticipantes,
      otrosIngresos,
      totalIngresosGenerales,
      totalRecaudado: totalIngresosGenerales,
      totalGastos: totalExpense,
      saldoActualCaja: totalIngresosGenerales - totalExpense,
      porcentajeCumplimiento,
      totalParticipantes: Number(participantSummary.rows[0]?.total_participants ?? 0),
      participantesCompletos: Number(participantSummary.rows[0]?.participants_completed ?? 0),
      participantesPendientes: Number(participantSummary.rows[0]?.participants_pending ?? 0),
      movimientosPendientes: Number(monthlyKpis.rows[0]?.pending_movements ?? 0),
      recaudoDelMes: monthIncome
    },
    recentMovements: recentMovementsResult.rows.map((item) => ({
      ...item,
      amount: Number(item.amount)
    })),
    monthlySummary: monthlySummary.rows.map((item) => ({
      ...item,
      incomes: Number(item.incomes),
      expenses: Number(item.expenses),
      net: Number(item.incomes) - Number(item.expenses)
    })),
    statusBreakdown: statusBreakdown.rows.map((item) => ({
      status: item.status,
      total: Number(item.total)
    })),
    categoryBreakdown: categoryBreakdown.rows.map((item) => ({
      ...item,
      total_amount: Number(item.total_amount)
    })),
    incomeTypeBreakdown: incomeTypeBreakdown.rows.map((item) => ({
      income_type: item.income_type,
      total_amount: Number(item.total_amount)
    })),
    participantesAlDia: participantsCompleted.rows.map((item) => ({
      ...item,
      total_paid: Number(item.total_paid),
      target_amount: Number(item.target_amount),
      pending_balance: Number(item.pending_balance)
    })),
    participantesPendientes: participantsPending.rows.map((item) => ({
      ...item,
      total_paid: Number(item.total_paid),
      target_amount: Number(item.target_amount),
      pending_balance: Number(item.pending_balance)
    })),
    ultimosGastos: recentExpenses.rows.map((item) => ({
      ...item,
      amount: Number(item.amount)
    })),
    ultimosAportes: recentContributions.rows.map((item) => ({
      ...item,
      amount: Number(item.amount)
    })),
    progresoParticipantes: participantProgress.rows.map((item) => ({
      ...item,
      total_paid: Number(item.total_paid),
      target_amount: Number(item.target_amount),
      pending_balance: Number(item.pending_balance),
      progress_percentage:
        Number(item.target_amount) > 0
          ? Math.min((Number(item.total_paid) / Number(item.target_amount)) * 100, 100)
          : 0
    }))
  };
}
