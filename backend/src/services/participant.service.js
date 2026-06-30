import { query } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";

function resolveCompanyId(data, requestUser) {
  if (requestUser.role === "super_admin") {
    if (data?.company_id) {
      return data.company_id;
    }

    throw new ApiError(400, "Selecciona una empresa para operar como soporte");
  }

  return requestUser.companyId;
}

async function getParticipantById(id) {
  const { rows } = await query(
    `
      select *
      from participants
      where id = $1
      limit 1
    `,
    [id]
  );

  return rows[0] ?? null;
}

async function assertParticipantAccess(participant, requestUser) {
  if (!participant || participant.deleted_at) {
    throw new ApiError(404, "Participante no encontrado");
  }

  if (requestUser.role !== "super_admin" && participant.company_id !== requestUser.companyId) {
    throw new ApiError(403, "No puedes acceder a participantes de otra empresa");
  }
}

async function getCompanyGoal(companyId) {
  const { rows } = await query(
    `
      select valor_objetivo_emaus
      from companies
      where id = $1
      limit 1
    `,
    [companyId]
  );

  if (!rows[0]) {
    throw new ApiError(404, "Empresa no encontrada");
  }

  return Number(rows[0].valor_objetivo_emaus);
}

async function assertUniqueDocument(companyId, documentNumber, excludeId) {
  const params = [companyId, documentNumber.trim()];
  let exclude = "";

  if (excludeId) {
    params.push(excludeId);
    exclude = "and id <> $3";
  }

  const { rows } = await query(
    `
      select id
      from participants
      where company_id = $1
        and document_number = $2
        and deleted_at is null
        ${exclude}
      limit 1
    `,
    params
  );

  if (rows[0]) {
    throw new ApiError(409, "Ya existe un participante con ese documento");
  }
}

export async function listParticipants(requestUser, filters) {
  const companyId = resolveCompanyId(filters, requestUser);
  const params = [companyId];
  let index = 2;
  const where = ["p.company_id = $1", "p.deleted_at is null"];

  if (filters.search) {
    where.push(
      `(p.full_name ilike $${index} or p.document_number ilike $${index} or coalesce(p.phone, '') ilike $${index})`
    );
    params.push(`%${filters.search}%`);
    index += 1;
  }

  if (filters.payment_status) {
    where.push(`p.payment_status = $${index++}`);
    params.push(filters.payment_status);
  }

  if (filters.active) {
    where.push(`p.active = $${index++}`);
    params.push(filters.active === "true");
  }

  const page = Number(filters.page ?? 1);
  const pageSize = Number(filters.page_size ?? 10);
  const offset = (page - 1) * pageSize;
  const baseParams = [...params];
  const pageParams = [...baseParams, pageSize, offset];
  const limitPlaceholder = baseParams.length + 1;
  const offsetPlaceholder = baseParams.length + 2;
  const whereClause = where.join(" and ");

  const [itemsResult, countResult, totalsResult] = await Promise.all([
    query(
      `
        select
          p.*,
          coalesce(
            (
              select sum(i.amount)
              from incomes i
              where i.participant_id = p.id
                and i.income_type = 'participant_payment'
                and i.status = 'pending'
                and i.deleted_at is null
            ),
            0
          ) as pending_income_amount
        from participants p
        where ${whereClause}
        order by case p.payment_status
                   when 'pending' then 1
                   when 'partial' then 2
                   when 'completed' then 3
                   else 4
                 end,
                 p.pending_balance desc,
                 p.full_name asc
        limit $${limitPlaceholder} offset $${offsetPlaceholder}
      `,
      pageParams
    ),
    query(
      `
        select count(*)::int as total
        from participants p
        where ${whereClause}
      `,
      baseParams
    ),
    query(
      `
        select
          count(*)::int as total_participants,
          count(*) filter (where payment_status = 'completed')::int as completed_participants,
          count(*) filter (where payment_status = 'partial')::int as partial_participants,
          count(*) filter (where payment_status = 'pending')::int as pending_participants,
          coalesce(sum(target_amount), 0) as total_target,
          coalesce(sum(total_paid), 0) as total_paid,
          coalesce(sum(pending_balance), 0) as total_pending,
          coalesce(
            (
              select sum(i.amount)
              from incomes i
              join participants linked_participant on linked_participant.id = i.participant_id
              where linked_participant.company_id = $1
                and linked_participant.deleted_at is null
                and i.income_type = 'participant_payment'
                and i.status = 'pending'
                and i.deleted_at is null
            ),
            0
          ) as pending_income_amount
        from participants
        where company_id = $1 and deleted_at is null
      `,
      [companyId]
    )
  ]);

  const total = Number(countResult.rows[0].total);

  return {
    items: itemsResult.rows.map((item) => ({
      ...item,
      target_amount: Number(item.target_amount),
      total_paid: Number(item.total_paid),
      pending_balance: Number(item.pending_balance),
      pending_income_amount: Number(item.pending_income_amount)
    })),
    pagination: {
      page,
      page_size: pageSize,
      total,
      total_pages: Math.max(1, Math.ceil(total / pageSize))
    },
    summary: {
      total_participants: Number(totalsResult.rows[0].total_participants),
      completed_participants: Number(totalsResult.rows[0].completed_participants),
      partial_participants: Number(totalsResult.rows[0].partial_participants),
      pending_participants: Number(totalsResult.rows[0].pending_participants),
      total_target: Number(totalsResult.rows[0].total_target),
      total_paid: Number(totalsResult.rows[0].total_paid),
      total_pending: Number(totalsResult.rows[0].total_pending),
      pending_income_amount: Number(totalsResult.rows[0].pending_income_amount)
    }
  };
}

export async function getParticipantDetail(id, requestUser) {
  const participant = await getParticipantById(id);
  await assertParticipantAccess(participant, requestUser);

  const [paymentsResult, statsResult] = await Promise.all([
    query(
      `
        select
          i.*,
          c.name as category_name,
          c.color as category_color
        from incomes i
        join categories c on c.id = i.category_id and c.deleted_at is null
        where i.participant_id = $1 and i.deleted_at is null
        order by i.movement_date desc, i.created_at desc
      `,
      [id]
    ),
    query(
      `
        select
          count(*)::int as total_aportes,
          max(movement_date) as ultimo_aporte,
          coalesce(
            sum(amount) filter (
              where income_type = 'participant_payment'
                and status = 'pending'
            ),
            0
          ) as pending_income_amount
        from incomes
        where participant_id = $1 and deleted_at is null
      `,
      [id]
    )
  ]);

  return {
    participant: {
      ...participant,
      target_amount: Number(participant.target_amount),
      total_paid: Number(participant.total_paid),
      pending_balance: Number(participant.pending_balance)
    },
    aportes: paymentsResult.rows.map((item) => ({
      ...item,
      amount: Number(item.amount)
    })),
    metrics: {
      total_aportes: Number(statsResult.rows[0].total_aportes),
      ultimo_aporte: statsResult.rows[0].ultimo_aporte,
      pending_income_amount: Number(statsResult.rows[0].pending_income_amount)
    }
  };
}

export async function createParticipant(data, requestUser) {
  const companyId = resolveCompanyId(data, requestUser);

  if (requestUser.role !== "super_admin" && companyId !== requestUser.companyId) {
    throw new ApiError(403, "No puedes crear participantes para otra empresa");
  }

  await assertUniqueDocument(companyId, data.document_number);
  const targetAmount = data.target_amount ?? (await getCompanyGoal(companyId));

  const { rows } = await query(
    `
      insert into participants (
        company_id,
        document_number,
        full_name,
        phone,
        email,
        target_amount,
        pending_balance,
        observations,
        active
      )
      values ($1, $2, $3, $4, $5, $6, $6, $7, $8)
      returning *
    `,
    [
      companyId,
      data.document_number.trim(),
      data.full_name.trim(),
      data.phone?.trim() || null,
      data.email?.trim() || null,
      targetAmount,
      data.observations ?? null,
      data.active
    ]
  );

  return {
    ...rows[0],
    target_amount: Number(rows[0].target_amount),
    total_paid: Number(rows[0].total_paid),
    pending_balance: Number(rows[0].pending_balance)
  };
}

export async function updateParticipant(id, data, requestUser) {
  const existing = await getParticipantById(id);
  await assertParticipantAccess(existing, requestUser);

  const companyId = resolveCompanyId(data, requestUser);

  if (requestUser.role !== "super_admin" && companyId !== requestUser.companyId) {
    throw new ApiError(403, "No puedes mover participantes a otra empresa");
  }

  await assertUniqueDocument(companyId, data.document_number, id);

  const { rows } = await query(
    `
      update participants
      set company_id = $2,
          document_number = $3,
          full_name = $4,
          phone = $5,
          email = $6,
          target_amount = $7,
          observations = $8,
          active = $9,
          updated_at = now()
      where id = $1
      returning *
    `,
    [
      id,
      companyId,
      data.document_number.trim(),
      data.full_name.trim(),
      data.phone?.trim() || null,
      data.email?.trim() || null,
      data.target_amount,
      data.observations ?? null,
      data.active
    ]
  );

  await query(`select recalculate_participant_totals($1)`, [id]);
  const refreshed = await getParticipantById(id);

  return {
    ...refreshed,
    target_amount: Number(refreshed.target_amount),
    total_paid: Number(refreshed.total_paid),
    pending_balance: Number(refreshed.pending_balance)
  };
}

export async function deleteParticipant(id, requestUser) {
  const existing = await getParticipantById(id);
  await assertParticipantAccess(existing, requestUser);

  const payments = await query(
    `
      select count(*)::int as total
      from incomes
      where participant_id = $1 and deleted_at is null
    `,
    [id]
  );

  if (Number(payments.rows[0].total) > 0) {
    throw new ApiError(
      409,
      "No puedes eliminar un participante con aportes registrados. Puedes desactivarlo."
    );
  }

  const { rows } = await query(
    `
      update participants
      set active = false,
          deleted_at = now(),
          updated_at = now()
      where id = $1
      returning id, company_id, deleted_at
    `,
    [id]
  );

  return rows[0];
}

export async function exportParticipantsCsv(requestUser, filters) {
  const result = await listParticipants(requestUser, {
    ...filters,
    page: 1,
    page_size: 1000
  });

  const header = [
    "Documento",
    "Nombre completo",
    "Telefono",
    "Correo",
    "Meta",
    "Pagado",
    "Pendiente",
    "Estado",
    "Activo"
  ];

  const rows = result.items.map((item) => [
    item.document_number,
    item.full_name,
    item.phone ?? "",
    item.email ?? "",
    item.target_amount,
    item.total_paid,
    item.pending_balance,
    item.payment_status,
    item.active ? "Si" : "No"
  ]);

  return [header, ...rows]
    .map((line) => line.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n");
}
