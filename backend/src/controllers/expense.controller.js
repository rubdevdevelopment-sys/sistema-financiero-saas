import { sendSuccess } from "../utils/response.js";
import {
  createMovement,
  deleteMovement,
  listMovements,
  updateMovement
} from "../services/finance.service.js";

const TABLE = "expenses";

export async function getExpenses(req, res) {
  const items = await listMovements(TABLE, req.user, req.query);
  return sendSuccess(res, items, "Egresos obtenidos");
}

export async function createExpense(req, res) {
  const item = await createMovement(TABLE, req.validated.body, req.user);
  return sendSuccess(res, item, "Egreso creado", 201);
}

export async function updateExpense(req, res) {
  const item = await updateMovement(
    TABLE,
    req.validated.params.id,
    req.validated.body,
    req.user
  );
  return sendSuccess(res, item, "Egreso actualizado");
}

export async function deleteExpense(req, res) {
  const item = await deleteMovement(TABLE, req.params.id, req.user);
  return sendSuccess(res, item, "Egreso eliminado");
}
