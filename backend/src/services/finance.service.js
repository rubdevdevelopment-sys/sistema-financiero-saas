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

async function assertCategoryBelongsToCompany(categoryId, companyId, expectedType) {
  const { rows } = await query(
    `
      select id
      from categories
      where id = $1 and company_id = $2 and type = $3 and deleted_at is null
      limit 1
    `,
    [categoryId, companyId, expectedType]
  );

  if (!rows[0]) {
    throw new ApiError(400, "La categoria no pertenece a la empresa o modulo actual");
  }
}

async function assertParticipantBelongsToCompany(participantId, companyId) {
  const { rows } = await query(
    `
      select id
      from participants
      where id = $1 and company_id = $2 and deleted_at is null
      limit 1
    `,
    [participantId, companyId]
  );

  if (!rows[0]) {
    throw new ApiError(400, "El participante no pertenece a la empresa actual");
  }
}

async function getMovementById(table, id) {
  const { rows } = await query(`select * from ${table} where id = $1 limit 1`, [id]);
  return rows[0] ?? null;
}

function buildMovementScope(tableAlias, requestUser, companyId) {
  const clauses = [`${tableAlias}.company_id = $1`, `${tableAlias}.deleted_at is null`];
  const params = [companyId];

  return { clauses, params };
}

function parseListFilters(filters) {
  return {
    page: Number(filters.page ?? 1),
    pageSize: Number(filters.page_size ?? 10),
    search: filters.search?.trim(),
    status: filters.status,
    categoryId: filters.category_id,
    incomeType: filters.income_type,
    participantId: filters.participant_id,
    dateFrom: filters.date_from,
    dateTo: filters.date_to,
    sortBy: filters.sort_by ?? "movement_date",
    sortOrder: filters.sort_order ?? "desc"
  };
}

export async function listMovements(table, requestUser, filters) {
  const companyId = resolveCompanyId(filters, requestUser);
  const parsed = parseListFilters(filters);
  const { clauses, params } = buildMovementScope("m", requestUser, companyId);
  let index = 2;

  if (parsed.status) {
    clauses.push(`m.status = $${index++}`);
    params.push(parsed.status);
  }

  if (parsed.categoryId) {
    clauses.push(`m.category_id = $${index++}`);
    params.push(parsed.categoryId);
  }

  if (table === "incomes" && parsed.incomeType) {
    clauses.push(`m.income_type = $${index++}`);
    params.push(parsed.incomeType);
  }

  if (table === "incomes" && parsed.participantId) {
    clauses.push(`m.participant_id = $${index++}`);
    params.push(parsed.participantId);
  }

  if (parsed.dateFrom) {
    clauses.push(`m.movement_date >= $${index++}`);
    params.push(parsed.dateFrom);
  }

  if (parsed.dateTo) {
    clauses.push(`m.movement_date <= $${index++}`);
    params.push(parsed.dateTo);
  }

  if (parsed.search) {
    const searchClauses = ["m.title ilike $" + index, "coalesce(m.description, '') ilike $" + index];

    if (table === "incomes") {
      searchClauses.push("coalesce(m.receipt_number, '') ilike $" + index);
    }

    if (table === "expenses") {
      searchClauses.push("coalesce(m.authorized_by, '') ilike $" + index);
      searchClauses.push("coalesce(m.receipt_reference, '') ilike $" + index);
    }

    clauses.push(`(${searchClauses.join(" or ")})`);
    params.push(`%${parsed.search}%`);
    index += 1;
  }

  const allowedSortBy = {
    movement_date: "m.movement_date",
    amount: "m.amount",
    title: "m.title",
    created_at: "m.created_at"
  };
  const sortBy = allowedSortBy[parsed.sortBy] ?? allowedSortBy.movement_date;
  const sortOrder = parsed.sortOrder === "asc" ? "asc" : "desc";

  const baseParams = [...params];
  const page = parsed.page;
  const pageSize = parsed.pageSize;
  const offset = (page - 1) * pageSize;
  const pageParams = [...baseParams, pageSize, offset];
  const limitPlaceholder = baseParams.length + 1;
  const offsetPlaceholder = baseParams.length + 2;
  const whereClause = clauses.join(" and ");
  const participantSelect =
    table === "incomes"
      ? `,
               m.income_type,
               p.full_name as participant_name,
               p.document_number as participant_document`
      : "";
  const participantJoin =
    table === "incomes"
      ? "\n        left join participants p on p.id = m.participant_id and p.deleted_at is null"
      : "";

  const [itemsResult, countResult, totalsResult] = await Promise.all([
    query(
      `
        select m.*,
               c.name as category_name,
               c.type as category_type,
               c.color as category_color
               ${participantSelect}
        from ${table} m
        join categories c on c.id = m.category_id and c.deleted_at is null
        ${participantJoin}
        where ${whereClause}
        order by ${sortBy} ${sortOrder}, m.created_at desc
        limit $${limitPlaceholder} offset $${offsetPlaceholder}
      `,
      pageParams
    ),
    query(
      `
        select count(*)::int as total
        from ${table} m
        join categories c on c.id = m.category_id and c.deleted_at is null
        where ${whereClause}
      `,
      baseParams
    ),
    query(
      `
        select
          coalesce(sum(m.amount), 0) as total_amount,
          coalesce(sum(m.amount) filter (where m.status = 'completed'), 0) as completed_amount,
          coalesce(sum(m.amount) filter (where m.status = 'pending'), 0) as pending_amount,
          count(*) filter (where m.status = 'pending')::int as pending_count,
          count(*) filter (where m.status = 'completed')::int as completed_count,
          count(*) filter (where m.status = 'cancelled')::int as cancelled_count
        from ${table} m
        join categories c on c.id = m.category_id and c.deleted_at is null
        where ${whereClause}
      `,
      baseParams
    )
  ]);

  const total = countResult.rows[0].total;

  return {
    items: itemsResult.rows,
    pagination: {
      page,
      page_size: pageSize,
      total,
      total_pages: Math.max(1, Math.ceil(total / pageSize))
    },
    totals: {
      total_amount: Number(totalsResult.rows[0].total_amount),
      completed_amount: Number(totalsResult.rows[0].completed_amount),
      pending_amount: Number(totalsResult.rows[0].pending_amount),
      pending_count: Number(totalsResult.rows[0].pending_count),
      completed_count: Number(totalsResult.rows[0].completed_count),
      cancelled_count: Number(totalsResult.rows[0].cancelled_count)
    }
  };
}

export async function createMovement(table, data, requestUser) {
  const companyId = resolveCompanyId(data, requestUser);
  const expectedType = table === "incomes" ? "income" : "expense";

  await assertCategoryBelongsToCompany(data.category_id, companyId, expectedType);

  if (table === "incomes") {
    const incomeType = data.income_type ?? "participant_payment";

    if (incomeType === "participant_payment" && !data.participant_id) {
      throw new ApiError(400, "El participante es obligatorio para registrar aportes");
    }

    if (incomeType === "participant_payment") {
      await assertParticipantBelongsToCompany(data.participant_id, companyId);
    }
  }

  const statement =
    table === "incomes"
      ? {
          text: `
            insert into incomes (
              company_id,
              category_id,
              income_type,
              participant_id,
              title,
              description,
              amount,
              movement_date,
              payment_method,
              status,
              installment_number,
              receipt_number,
              attachment_url,
              notes,
              responsible,
              created_by
            )
            values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            returning *
          `,
          params: [
            companyId,
            data.category_id,
            data.income_type ?? "participant_payment",
            data.income_type === "participant_payment" ? data.participant_id : null,
            data.title,
            data.description ?? null,
            data.amount,
            data.movement_date,
            data.payment_method,
            data.status,
            data.installment_number ?? null,
            data.receipt_number ?? null,
            data.attachment_url ?? null,
            data.notes ?? null,
            data.responsible ?? null,
            requestUser.id
          ]
        }
      : {
          text: `
            insert into expenses (
              company_id,
              category_id,
              title,
              description,
              amount,
              movement_date,
              payment_method,
              status,
              attachment_url,
              notes,
              responsible,
              authorized_by,
              receipt_reference,
              created_by
            )
            values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            returning *
          `,
          params: [
            companyId,
            data.category_id,
            data.title,
            data.description ?? null,
            data.amount,
            data.movement_date,
            data.payment_method,
            data.status,
            data.attachment_url ?? null,
            data.notes ?? null,
            data.responsible ?? null,
            data.authorized_by ?? null,
            data.receipt_reference ?? null,
            requestUser.id
          ]
        };

  const { rows } = await query(statement.text, statement.params);

  return rows[0];
}

export async function updateMovement(table, id, data, requestUser) {
  const existing = await getMovementById(table, id);

  if (!existing || existing.deleted_at) {
    throw new ApiError(404, "Movimiento no encontrado");
  }

  if (requestUser.role !== "super_admin" && existing.company_id !== requestUser.companyId) {
    throw new ApiError(403, "No puedes editar movimientos de otra empresa");
  }

  const companyId = resolveCompanyId(data, requestUser);
  const expectedType = table === "incomes" ? "income" : "expense";

  await assertCategoryBelongsToCompany(data.category_id, companyId, expectedType);

  if (table === "incomes") {
    const incomeType = data.income_type ?? "participant_payment";

    if (incomeType === "participant_payment" && !data.participant_id) {
      throw new ApiError(400, "El participante es obligatorio para registrar aportes");
    }

    if (incomeType === "participant_payment") {
      await assertParticipantBelongsToCompany(data.participant_id, companyId);
    }
  }

  const statement =
    table === "incomes"
      ? {
          text: `
            update incomes
            set company_id = $2,
                category_id = $3,
                income_type = $4,
                participant_id = $5,
                title = $6,
                description = $7,
                amount = $8,
                movement_date = $9,
                payment_method = $10,
                status = $11,
                installment_number = $12,
                receipt_number = $13,
                attachment_url = $14,
                notes = $15,
                responsible = $16,
                updated_at = now()
            where id = $1
            returning *
          `,
          params: [
            id,
            companyId,
            data.category_id,
            data.income_type ?? "participant_payment",
            data.income_type === "participant_payment" ? data.participant_id : null,
            data.title,
            data.description ?? null,
            data.amount,
            data.movement_date,
            data.payment_method,
            data.status,
            data.installment_number ?? null,
            data.receipt_number ?? null,
            data.attachment_url ?? null,
            data.notes ?? null,
            data.responsible ?? null
          ]
        }
      : {
          text: `
            update expenses
            set company_id = $2,
                category_id = $3,
                title = $4,
                description = $5,
                amount = $6,
                movement_date = $7,
                payment_method = $8,
                status = $9,
                attachment_url = $10,
                notes = $11,
                responsible = $12,
                authorized_by = $13,
                receipt_reference = $14,
                updated_at = now()
            where id = $1
            returning *
          `,
          params: [
            id,
            companyId,
            data.category_id,
            data.title,
            data.description ?? null,
            data.amount,
            data.movement_date,
            data.payment_method,
            data.status,
            data.attachment_url ?? null,
            data.notes ?? null,
            data.responsible ?? null,
            data.authorized_by ?? null,
            data.receipt_reference ?? null
          ]
        };

  const { rows } = await query(statement.text, statement.params);

  return rows[0];
}

export async function deleteMovement(table, id, requestUser) {
  const existing = await getMovementById(table, id);

  if (!existing || existing.deleted_at) {
    throw new ApiError(404, "Movimiento no encontrado");
  }

  if (requestUser.role !== "super_admin" && existing.company_id !== requestUser.companyId) {
    throw new ApiError(403, "No puedes eliminar movimientos de otra empresa");
  }

  const { rows } = await query(
    `
      update ${table}
      set deleted_at = now(),
          deleted_by = $2,
          updated_at = now()
      where id = $1
      returning id, company_id, deleted_at
    `,
    [id, requestUser.id]
  );

  return rows[0];
}
