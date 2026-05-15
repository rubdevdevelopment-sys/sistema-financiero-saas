import { sendSuccess } from "../utils/response.js";
import {
  createMovement,
  deleteMovement,
  listMovements,
  updateMovement
} from "../services/finance.service.js";

const TABLE = "expenses";

export async function getExpenses(req, res) {

  const query =
    req.validated?.query ||
    req.query ||
    {};

  const items = await listMovements(
    TABLE,
    req.user,
    query
  );

  return sendSuccess(
    res,
    items,
    "Egresos obtenidos"
  );
}

export async function createExpense(req, res) {

  const body =
    req.validated?.body ||
    req.body;

  const item = await createMovement(
    TABLE,
    body,
    req.user
  );

  return sendSuccess(
    res,
    item,
    "Egreso creado",
    201
  );
}

export async function updateExpense(req, res) {

  const body =
    req.validated?.body ||
    req.body;

  const id =
    req.validated?.params?.id ||
    req.params.id;

  const item = await updateMovement(
    TABLE,
    id,
    body,
    req.user
  );

  return sendSuccess(
    res,
    item,
    "Egreso actualizado"
  );
}

export async function deleteExpense(req, res) {

  const id =
    req.validated?.params?.id ||
    req.params.id;

  const item = await deleteMovement(
    TABLE,
    id,
    req.user
  );

  return sendSuccess(
    res,
    item,
    "Egreso eliminado"
  );
}