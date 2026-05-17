import { query } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";

const FUND_MODULES = [
  { key: "cycles", title: "Ciclos", description: "Periodos anuales del fondo y valor de cupo." },
  { key: "memberships", title: "Miembros", description: "Personas vinculadas al fondo solidario." },
  { key: "shares", title: "Cupos", description: "Asignacion de cupos por miembro y ciclo." },
  { key: "loans", title: "Prestamos", description: "Preparado para cartera interna." },
  { key: "penalties", title: "Multas", description: "Mora y sanciones basicas." },
  { key: "settlements", title: "Cierre anual", description: "Preparado para liquidacion anual." },
  { key: "distributions", title: "Reparto", description: "Preparado para reparto proporcional." }
];

function resolveCompanyId(data = {}, requestUser) {
  if (requestUser.role === "super_admin") {
    if (data.company_id) return data.company_id;
    throw new ApiError(400, "Selecciona una empresa para operar el fondo");
  }

  return requestUser.companyId;
}

function number(value) {
  return Number(value ?? 0);
}

function contributionStatus(expected, paid, dueDate) {
  const pending = Math.max(expected - paid, 0);
  const today = new Date();
  const normalizedDueDate = dueDate ? new Date(dueDate) : today;

  if (pending <= 0) return { pending, status: "paid" };
  if (paid > 0) return { pending, status: "partial" };
  if (normalizedDueDate < today) return { pending, status: "overdue" };
  return { pending, status: "pending" };
}

function ordinaryDueDate(year, month) {
  return `${year}-${String(month).padStart(2, "0")}-10`;
}

function monthName(month) {
  const names = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre"
  ];

  return names[Number(month) - 1] ?? `Mes ${month}`;
}

async function refreshOverdueContributions(companyId) {
  await query(
    `
      update fund_contributions
      set status = 'overdue',
          updated_at = now()
      where company_id = $1
        and deleted_at is null
        and status = 'pending'
        and pending_amount > 0
        and due_date < current_date
    `,
    [companyId]
  );
}

async function getCycle(id, requestUser) {
  const { rows } = await query(`select * from fund_cycles where id = $1 limit 1`, [id]);
  const cycle = rows[0];

  if (!cycle || cycle.deleted_at) {
    throw new ApiError(404, "Ciclo no encontrado");
  }

  if (requestUser.role !== "super_admin" && cycle.company_id !== requestUser.companyId) {
    throw new ApiError(403, "No puedes acceder a ciclos de otra empresa");
  }

  return cycle;
}

async function getMember(id, requestUser) {
  const { rows } = await query(`select * from fund_members where id = $1 limit 1`, [id]);
  const member = rows[0];

  if (!member || member.deleted_at) {
    throw new ApiError(404, "Miembro no encontrado");
  }

  if (requestUser.role !== "super_admin" && member.company_id !== requestUser.companyId) {
    throw new ApiError(403, "No puedes acceder a miembros de otra empresa");
  }

  return member;
}

async function getQuota(id, requestUser) {
  const { rows } = await query(`select * from fund_member_quotas where id = $1 limit 1`, [id]);
  const quota = rows[0];

  if (!quota || quota.deleted_at) {
    throw new ApiError(404, "Asignacion de cupos no encontrada");
  }

  if (requestUser.role !== "super_admin" && quota.company_id !== requestUser.companyId) {
    throw new ApiError(403, "No puedes acceder a cupos de otra empresa");
  }

  return quota;
}

async function assertCycleYearAvailable(companyId, year, excludeId) {
  const params = [companyId, year];
  let exclude = "";
  if (excludeId) {
    params.push(excludeId);
    exclude = "and id <> $3";
  }

  const { rows } = await query(
    `
      select id from fund_cycles
      where company_id = $1 and year = $2 and deleted_at is null ${exclude}
      limit 1
    `,
    params
  );

  if (rows[0]) throw new ApiError(409, "Ya existe un ciclo para ese anio");
}

async function assertOneActiveCycle(companyId, isActive, excludeId) {
  if (!isActive) return;

  const params = [companyId];
  let exclude = "";
  if (excludeId) {
    params.push(excludeId);
    exclude = "and id <> $2";
  }

  const { rows } = await query(
    `
      select id from fund_cycles
      where company_id = $1 and is_active = true and deleted_at is null ${exclude}
      limit 1
    `,
    params
  );

  if (rows[0]) throw new ApiError(409, "Solo puede existir un ciclo activo por empresa");
}

async function assertMemberDocumentAvailable(companyId, documentNumber, excludeId) {
  const params = [companyId, documentNumber.trim()];
  let exclude = "";
  if (excludeId) {
    params.push(excludeId);
    exclude = "and id <> $3";
  }

  const { rows } = await query(
    `
      select id from fund_members
      where company_id = $1 and document_number = $2 and deleted_at is null ${exclude}
      limit 1
    `,
    params
  );

  if (rows[0]) throw new ApiError(409, "Ya existe un miembro con ese documento");
}

async function getCycleContribution(cycleId) {
  const { rows } = await query(
    `select monthly_contribution from fund_cycles where id = $1 limit 1`,
    [cycleId]
  );

  if (!rows[0]) throw new ApiError(404, "Ciclo no encontrado");
  return {
    monthlyContribution: number(rows[0].monthly_contribution)
  };
}

async function generateOrdinaryContributionsForQuota(quota) {
  const { rows } = await query(
    `
      select year, monthly_contribution
      from fund_cycles
      where id = $1 and deleted_at is null
      limit 1
    `,
    [quota.cycle_id]
  );

  const cycle = rows[0];
  if (!cycle) return 0;

  let created = 0;
  const quotaCount = number(quota.quota_count);
  const valuePerQuota = number(cycle.monthly_contribution);
  const expected = quotaCount * valuePerQuota;

  for (let month = 1; month <= 11; month += 1) {
    const result = await query(
      `
        insert into fund_contributions (
          company_id, member_id, cycle_id, quota_assignment_id,
          contribution_type, title, month, year, installment_order, due_date,
          quota_value_snapshot, expected_amount, paid_amount, pending_amount,
          status, generated_automatically
        )
        values (
          $1, $2, $3, $4,
          'ordinary', $5, $6, $7, $6, $8,
          $9, $10, 0, $10,
          case when $8::date < current_date then 'overdue' else 'pending' end,
          true
        )
        on conflict (quota_assignment_id, contribution_type, installment_order, year)
        where deleted_at is null
        do update set expected_amount = excluded.expected_amount,
                      pending_amount = greatest(excluded.expected_amount - fund_contributions.paid_amount, 0),
                      quota_value_snapshot = excluded.quota_value_snapshot,
                      due_date = excluded.due_date,
                      title = excluded.title,
                      status = case
                        when fund_contributions.paid_amount >= excluded.expected_amount then 'paid'
                        when fund_contributions.paid_amount > 0 then 'partial'
                        when excluded.due_date < current_date then 'overdue'
                        else 'pending'
                      end,
                      updated_at = now()
      `,
      [
        quota.company_id,
        quota.member_id,
        quota.cycle_id,
        quota.id,
        `Cuota ordinaria ${monthName(month)}`,
        month,
        number(cycle.year),
        ordinaryDueDate(cycle.year, month),
        valuePerQuota,
        expected
      ]
    );
    created += result.rowCount ?? 0;
  }

  return created;
}

export async function getFundOverview(requestUser, filters = {}) {
  const companyId = resolveCompanyId(filters, requestUser);
  await refreshOverdueContributions(companyId);

  const [companyResult, cardsResult, cycleResult, memberResult, quotaResult, contributionResult, penaltyResult, memberStatusResult] =
    await Promise.all([
      query(`select id, name, slug, business_model from companies where id = $1 limit 1`, [companyId]),
      query(
        `
          select
            coalesce(sum(paid_amount), 0) as capital_total,
            coalesce(sum(paid_amount) filter (where month = extract(month from current_date)::int and year = extract(year from current_date)::int), 0) as month_contributions,
            coalesce(sum(pending_amount), 0) as pending_portfolio,
            coalesce(sum(paid_amount), 0) as available_cash,
            coalesce(sum(expected_amount) filter (where contribution_type = 'extraordinary'), 0) as extraordinary_expected,
            coalesce(sum(pending_amount) filter (where status = 'overdue'), 0) as overdue_amount,
            count(*) filter (where status <> 'paid')::int as pending_count,
            count(*) filter (where status = 'overdue')::int as overdue_count
          from fund_contributions
          where company_id = $1 and deleted_at is null
        `,
        [companyId]
      ),
      query(`select count(*) filter (where is_active = true)::int as active_cycles from fund_cycles where company_id = $1 and deleted_at is null`, [companyId]),
      query(`select count(*) filter (where status = 'active')::int as active_members from fund_members where company_id = $1 and deleted_at is null`, [companyId]),
      query(`select coalesce(sum(quota_count), 0) as total_quotas from fund_member_quotas where company_id = $1 and status = 'active' and deleted_at is null`, [companyId]),
      query(`select coalesce(sum(pending_amount) filter (where status = 'overdue'), 0) as overdue_amount from fund_contributions where company_id = $1 and deleted_at is null`, [companyId]),
      query(`select coalesce(sum(amount) filter (where status = 'pending'), 0) as pending_penalties from fund_penalties where company_id = $1 and deleted_at is null`, [companyId]),
      query(
        `
          select
            count(distinct m.id) filter (where overdue.member_id is null)::int as members_current,
            count(distinct overdue.member_id)::int as members_overdue
          from fund_members m
          left join (
            select distinct member_id
            from fund_contributions
            where company_id = $1 and deleted_at is null and status = 'overdue'
          ) overdue on overdue.member_id = m.id
          where m.company_id = $1 and m.deleted_at is null and m.status = 'active'
        `,
        [companyId]
      )
    ]);

  if (!companyResult.rows[0]) throw new ApiError(404, "Empresa no encontrada");

  const cards = cardsResult.rows[0] ?? {};
  const penalties = penaltyResult.rows[0] ?? {};

  return {
    company: companyResult.rows[0],
    modules: FUND_MODULES,
    cards: {
      capitalRecaudado: number(cards.capital_total),
      aportesDelMes: number(cards.month_contributions),
      carteraPendiente: number(cards.pending_portfolio),
      cuotasPendientes: number(cards.pending_count),
      cuotasVencidas: number(cards.overdue_count),
      extraordinarias: number(cards.extraordinary_expected),
      miembrosActivos: number(memberResult.rows[0]?.active_members),
      miembrosAlDia: number(memberStatusResult.rows[0]?.members_current),
      miembrosEnMora: number(memberStatusResult.rows[0]?.members_overdue),
      totalCupos: number(quotaResult.rows[0]?.total_quotas),
      mora: number(contributionResult.rows[0]?.overdue_amount) + number(penalties.pending_penalties),
      cajaDisponible: number(cards.available_cash),
      ciclosActivos: number(cycleResult.rows[0]?.active_cycles),
      prestamosActivos: 0,
      rendimientoAnual: 0,
      valorCupo: 0,
      proyeccionCierre: number(cards.capital_total)
    }
  };
}

export async function listFundCycles(requestUser, filters = {}) {
  const companyId = resolveCompanyId(filters, requestUser);
  const { rows } = await query(
    `
      select id, company_id, year, name, quota_value, monthly_contribution,
             start_date, end_date, status, is_active, notes, created_at
      from fund_cycles
      where company_id = $1 and deleted_at is null
      order by year desc, created_at desc
    `,
    [companyId]
  );

  return rows.map((item) => ({
    ...item,
    quota_value: number(item.quota_value),
    monthly_contribution: number(item.monthly_contribution)
  }));
}

export async function createFundCycle(data, requestUser) {
  const companyId = resolveCompanyId(data, requestUser);
  await assertCycleYearAvailable(companyId, data.year);
  await assertOneActiveCycle(companyId, data.is_active || data.status === "active");

  const isActive = Boolean(data.is_active || data.status === "active");
  const status = isActive ? "active" : data.status;

  const { rows } = await query(
    `
      insert into fund_cycles (
        company_id, year, cycle_year, name, quota_value, share_value,
        monthly_contribution, monthly_contribution_per_share,
        start_date, starts_on, end_date, ends_on, status, is_active, notes
      )
      values ($1, $2, $2, $3, $4, $4, $5, $5, $6, $6, $7, $7, $8, $9, $10)
      returning *
    `,
    [
      companyId,
      data.year,
      data.name.trim(),
      data.quota_value,
      data.monthly_contribution,
      data.start_date,
      data.end_date,
      status,
      isActive,
      data.notes ?? null
    ]
  );

  return rows[0];
}

export async function updateFundCycle(id, data, requestUser) {
  const existing = await getCycle(id, requestUser);
  const companyId = resolveCompanyId(data, requestUser);

  if (requestUser.role !== "super_admin" && companyId !== requestUser.companyId) {
    throw new ApiError(403, "No puedes mover ciclos a otra empresa");
  }

  await assertCycleYearAvailable(companyId, data.year, id);
  await assertOneActiveCycle(companyId, data.is_active || data.status === "active", id);

  const isActive = Boolean(data.is_active || data.status === "active");
  const status = isActive ? "active" : data.status;

  const { rows } = await query(
    `
      update fund_cycles
      set company_id = $2,
          year = $3,
          cycle_year = $3,
          name = $4,
          quota_value = $5,
          share_value = $5,
          monthly_contribution = $6,
          monthly_contribution_per_share = $6,
          start_date = $7,
          starts_on = $7,
          end_date = $8,
          ends_on = $8,
          status = $9,
          is_active = $10,
          notes = $11,
          updated_at = now()
      where id = $1
      returning *
    `,
    [
      existing.id,
      companyId,
      data.year,
      data.name.trim(),
      data.quota_value,
      data.monthly_contribution,
      data.start_date,
      data.end_date,
      status,
      isActive,
      data.notes ?? null
    ]
  );

  return rows[0];
}

export async function listFundMembers(requestUser, filters = {}) {
  const companyId = resolveCompanyId(filters, requestUser);
  const params = [companyId];
  const where = ["m.company_id = $1", "m.deleted_at is null"];

  if (filters.search) {
    params.push(`%${filters.search}%`);
    where.push(`(m.full_name ilike $2 or m.document_number ilike $2 or coalesce(m.phone, '') ilike $2)`);
  }

  const { rows } = await query(
    `
      select
        m.*,
        coalesce(sum(q.quota_count) filter (where q.status = 'active' and q.deleted_at is null), 0) as quota_count,
        coalesce(sum(q.monthly_payment) filter (where q.status = 'active' and q.deleted_at is null), 0) as monthly_payment
      from fund_members m
      left join fund_member_quotas q on q.member_id = m.id
      where ${where.join(" and ")}
      group by m.id
      order by m.full_name asc
    `,
    params
  );

  return rows.map((item) => ({
    ...item,
    quota_count: number(item.quota_count),
    monthly_payment: number(item.monthly_payment)
  }));
}

export async function createFundMember(data, requestUser) {
  const companyId = resolveCompanyId(data, requestUser);
  await assertMemberDocumentAvailable(companyId, data.document_number);

  const { rows } = await query(
    `
      insert into fund_members (company_id, full_name, document_number, phone, email, address, status, notes)
      values ($1, $2, $3, $4, $5, $6, $7, $8)
      returning *
    `,
    [
      companyId,
      data.full_name.trim(),
      data.document_number.trim(),
      data.phone ?? null,
      data.email ?? null,
      data.address ?? null,
      data.status,
      data.notes ?? null
    ]
  );

  return rows[0];
}

export async function updateFundMember(id, data, requestUser) {
  const existing = await getMember(id, requestUser);
  const companyId = resolveCompanyId(data, requestUser);
  await assertMemberDocumentAvailable(companyId, data.document_number, id);

  const { rows } = await query(
    `
      update fund_members
      set company_id = $2,
          full_name = $3,
          document_number = $4,
          phone = $5,
          email = $6,
          address = $7,
          status = $8,
          notes = $9,
          updated_at = now()
      where id = $1
      returning *
    `,
    [
      existing.id,
      companyId,
      data.full_name.trim(),
      data.document_number.trim(),
      data.phone ?? null,
      data.email ?? null,
      data.address ?? null,
      data.status,
      data.notes ?? null
    ]
  );

  return rows[0];
}

export async function updateFundMemberStatus(id, data, requestUser) {
  const existing = await getMember(id, requestUser);
  const { rows } = await query(
    `
      update fund_members
      set status = $2, updated_at = now()
      where id = $1
      returning *
    `,
    [existing.id, data.status]
  );

  return rows[0];
}

export async function listFundQuotas(requestUser, filters = {}) {
  const companyId = resolveCompanyId(filters, requestUser);
  const params = [companyId];
  const where = ["q.company_id = $1", "q.deleted_at is null"];

  if (filters.cycle_id) {
    params.push(filters.cycle_id);
    where.push(`q.cycle_id = $${params.length}`);
  }

  const { rows } = await query(
    `
      select q.*, m.full_name as member_name, m.document_number, c.name as cycle_name, c.year
      from fund_member_quotas q
      join fund_members m on m.id = q.member_id and m.deleted_at is null
      join fund_cycles c on c.id = q.cycle_id and c.deleted_at is null
      where ${where.join(" and ")}
      order by c.year desc, m.full_name asc
    `,
    params
  );

  return rows.map((item) => ({
    ...item,
    monthly_payment: number(item.monthly_payment),
    total_expected: number(item.total_expected)
  }));
}

export async function createFundQuota(data, requestUser) {
  const companyId = resolveCompanyId(data, requestUser);
  const member = await getMember(data.member_id, requestUser);
  const cycle = await getCycle(data.cycle_id, requestUser);

  if (member.company_id !== companyId || cycle.company_id !== companyId) {
    throw new ApiError(400, "Miembro y ciclo deben pertenecer a la empresa seleccionada");
  }

  const cycleInfo = await getCycleContribution(data.cycle_id);
  const monthlyPayment = data.quota_count * cycleInfo.monthlyContribution;
  const totalExpected = monthlyPayment * 11;

  const { rows } = await query(
    `
      insert into fund_member_quotas (
        company_id, member_id, cycle_id, quota_count, monthly_payment, total_expected, status
      )
      values ($1, $2, $3, $4, $5, $6, $7)
      on conflict (member_id, cycle_id)
      do update set quota_count = excluded.quota_count,
                    monthly_payment = excluded.monthly_payment,
                    total_expected = excluded.total_expected,
                    status = excluded.status,
                    updated_at = now(),
                    deleted_at = null
      returning *
    `,
    [companyId, data.member_id, data.cycle_id, data.quota_count, monthlyPayment, totalExpected, data.status]
  );

  await generateOrdinaryContributionsForQuota(rows[0]);
  return rows[0];
}

export async function updateFundQuota(id, data, requestUser) {
  const existing = await getQuota(id, requestUser);
  const cycleInfo = await getCycleContribution(data.cycle_id);
  const monthlyPayment = data.quota_count * cycleInfo.monthlyContribution;
  const totalExpected = monthlyPayment * 11;

  const { rows } = await query(
    `
      update fund_member_quotas
      set member_id = $2,
          cycle_id = $3,
          quota_count = $4,
          monthly_payment = $5,
          total_expected = $6,
          status = $7,
          updated_at = now()
      where id = $1
      returning *
    `,
    [existing.id, data.member_id, data.cycle_id, data.quota_count, monthlyPayment, totalExpected, data.status]
  );

  await generateOrdinaryContributionsForQuota(rows[0]);
  return rows[0];
}

export async function listFundContributions(requestUser, filters = {}) {
  const companyId = resolveCompanyId(filters, requestUser);
  await refreshOverdueContributions(companyId);
  const params = [companyId];
  const where = ["fc.company_id = $1", "fc.deleted_at is null"];

  for (const key of ["cycle_id", "member_id", "status", "year", "month", "contribution_type"]) {
    if (filters[key]) {
      params.push(filters[key]);
      where.push(`fc.${key} = $${params.length}`);
    }
  }

  const { rows } = await query(
    `
      select fc.*, m.full_name as member_name, c.name as cycle_name
            , q.quota_count
      from fund_contributions fc
      join fund_members m on m.id = fc.member_id
      join fund_cycles c on c.id = fc.cycle_id
      join fund_member_quotas q on q.id = fc.quota_assignment_id
      where ${where.join(" and ")}
      order by fc.year desc, fc.installment_order asc, m.full_name asc
    `,
    params
  );

  return rows.map((item) => ({
    ...item,
    expected_amount: number(item.expected_amount),
    paid_amount: number(item.paid_amount),
    pending_amount: number(item.pending_amount),
    quota_value_snapshot: number(item.quota_value_snapshot),
    quota_count: number(item.quota_count)
  }));
}

export async function generateFundContributions(data, requestUser) {
  const companyId = resolveCompanyId(data, requestUser);
  const cycle = await getCycle(data.cycle_id, requestUser);
  const quotas = await query(
    `
      select *
      from fund_member_quotas
      where company_id = $1 and cycle_id = $2 and status = 'active' and deleted_at is null
    `,
    [companyId, data.cycle_id]
  );

  let created = 0;

  if (data.value_per_quota) {
    const dueDate = new Date(data.due_date);
    const month = dueDate.getMonth() + 1;
    const year = dueDate.getFullYear();
    const order = 100 + month;

    for (const quota of quotas.rows) {
      const valuePerQuota = number(data.value_per_quota);
      const expected = number(quota.quota_count) * valuePerQuota;
      const result = await query(
        `
          insert into fund_contributions (
            company_id, member_id, cycle_id, quota_assignment_id,
            contribution_type, title, month, year, installment_order, due_date,
            quota_value_snapshot, expected_amount, paid_amount, pending_amount,
            status, generated_automatically
          )
          values (
            $1, $2, $3, $4,
            'extraordinary', $5, $6, $7, $8, $9,
            $10, $11, 0, $11,
            case when $9::date < current_date then 'overdue' else 'pending' end,
            true
          )
          on conflict (quota_assignment_id, contribution_type, installment_order, year)
          where deleted_at is null
          do nothing
        `,
        [
          companyId,
          quota.member_id,
          quota.cycle_id,
          quota.id,
          data.title,
          month,
          year,
          order,
          data.due_date,
          valuePerQuota,
          expected
        ]
      );
      created += result.rowCount ?? 0;
    }

    return { generated: created, type: "extraordinary" };
  }

  for (const quota of quotas.rows) {
    created += await generateOrdinaryContributionsForQuota({
      ...quota,
      company_id: companyId,
      cycle_id: cycle.id
    });
  }

  return { generated: created, type: "ordinary" };
}

export async function registerFundContributionPayment(id, data, requestUser) {
  const { rows } = await query(`select * from fund_contributions where id = $1 limit 1`, [id]);
  const contribution = rows[0];

  if (!contribution || contribution.deleted_at) throw new ApiError(404, "Aporte no encontrado");
  if (requestUser.role !== "super_admin" && contribution.company_id !== requestUser.companyId) {
    throw new ApiError(403, "No puedes registrar pagos de otra empresa");
  }

  const paid = data.paid_amount;
  const { pending, status } = contributionStatus(
    number(contribution.expected_amount),
    paid,
    contribution.due_date
  );

  const result = await query(
    `
      update fund_contributions
      set paid_amount = $2,
          pending_amount = $3,
          status = $4,
          payment_date = $5,
          payment_method = $6,
          notes = $7,
          updated_at = now()
      where id = $1
      returning *
    `,
    [id, paid, pending, status, data.payment_date || null, data.payment_method ?? null, data.notes ?? null]
  );

  return result.rows[0];
}

export async function listFundPenalties(requestUser, filters = {}) {
  const companyId = resolveCompanyId(filters, requestUser);
  const { rows } = await query(
    `
      select p.*, m.full_name as member_name
      from fund_penalties p
      join fund_members m on m.id = p.member_id
      where p.company_id = $1 and p.deleted_at is null
      order by p.created_at desc
    `,
    [companyId]
  );

  return rows.map((item) => ({ ...item, amount: number(item.amount) }));
}

export async function createFundPenalty(data, requestUser) {
  const companyId = resolveCompanyId(data, requestUser);
  const member = await getMember(data.member_id, requestUser);

  if (member.company_id !== companyId) throw new ApiError(400, "Miembro invalido para la empresa");

  const { rows } = await query(
    `
      insert into fund_penalties (company_id, member_id, contribution_id, amount, reason, status)
      values ($1, $2, $3, $4, $5, $6)
      returning *
    `,
    [companyId, data.member_id, data.contribution_id ?? null, data.amount, data.reason, data.status]
  );

  return rows[0];
}
