import { sendSuccess } from "../utils/response.js";
import {
  createMovement,
  deleteMovement,
  listMovements,
  updateMovement
} from "../services/finance.service.js";

const TABLE = "incomes";

export async function getIncomes(req, res) {

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
    "Ingresos obtenidos"
  );
}

export async function createIncome(req, res) {

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
    "Ingreso creado",
    201
  );
}

export async function updateIncome(req, res) {

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
    "Ingreso actualizado"
  );
}

export async function deleteIncome(req, res) {

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
    "Ingreso eliminado"
  );
}