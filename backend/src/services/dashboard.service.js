import { query } from "../config/db.js";

export async function getDashboardMetrics(requestUser) {
  const companyId = requestUser.companyId;

  const [incomeTotals, expenseTotals, recentIncome, recentExpense] = await Promise.all([
    query(
      `
        select
          coalesce(sum(amount), 0) as total,
          count(*) as count
        from incomes
        where company_id = $1 and status = 'completed'
      `,
      [companyId]
    ),
    query(
      `
        select
          coalesce(sum(amount), 0) as total,
          count(*) as count
        from expenses
        where company_id = $1 and status = 'completed'
      `,
      [companyId]
    ),
    query(
      `
        select id, title, amount, movement_date, status, 'income' as type
        from incomes
        where company_id = $1
        order by movement_date desc, created_at desc
        limit 5
      `,
      [companyId]
    ),
    query(
      `
        select id, title, amount, movement_date, status, 'expense' as type
        from expenses
        where company_id = $1
        order by movement_date desc, created_at desc
        limit 5
      `,
      [companyId]
    )
  ]);

  const totalIncome = Number(incomeTotals.rows[0].total);
  const totalExpense = Number(expenseTotals.rows[0].total);
  const balance = totalIncome - totalExpense;

  const recentMovements = [...recentIncome.rows, ...recentExpense.rows]
    .sort((a, b) => new Date(b.movement_date) - new Date(a.movement_date))
    .slice(0, 8);

  const monthlySummary = await query(
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
        coalesce(i.total, 0) as incomes,
        coalesce(e.total, 0) as expenses
      from months m
      left join (
        select date_trunc('month', movement_date) as month, sum(amount) as total
        from incomes
        where company_id = $1 and status = 'completed'
        group by 1
      ) i on i.month = m.month
      left join (
        select date_trunc('month', movement_date) as month, sum(amount) as total
        from expenses
        where company_id = $1 and status = 'completed'
        group by 1
      ) e on e.month = m.month
      order by m.month
    `,
    [companyId]
  );

  return {
    cards: {
      totalIncome,
      totalExpense,
      balance,
      availableCash: balance
    },
    kpis: {
      incomeCount: Number(incomeTotals.rows[0].count),
      expenseCount: Number(expenseTotals.rows[0].count)
    },
    recentMovements,
    monthlySummary: monthlySummary.rows.map((item) => ({
      ...item,
      incomes: Number(item.incomes),
      expenses: Number(item.expenses)
    }))
  };
}
