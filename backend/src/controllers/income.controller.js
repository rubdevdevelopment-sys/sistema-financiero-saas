import { sendSuccess } from "../utils/response.js";
import {
  createMovement,
  deleteMovement,
  listMovements,
  updateMovement
} from "../services/finance.service.js";

const TABLE = "incomes";

export async function getIncomes(req, res) {
  const items = await listMovements(TABLE, req.user, req.query);
  return sendSuccess(res, items, "Ingresos obtenidos");
}

export async function createIncome(req, res) {
  const item = await createMovement(TABLE, req.validated.body, req.user);
  return sendSuccess(res, item, "Ingreso creado", 201);
}

export async function updateIncome(req, res) {
  const item = await updateMovement(
    TABLE,
    req.validated.params.id,
    req.validated.body,
    req.user
  );
  return sendSuccess(res, item, "Ingreso actualizado");
}

export async function deleteIncome(req, res) {
  const item = await deleteMovement(TABLE, req.params.id, req.user);
  return sendSuccess(res, item, "Ingreso eliminado");
}
