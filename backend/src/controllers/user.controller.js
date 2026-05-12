import { sendSuccess } from "../utils/response.js";
import { createUser, listUsers, updateUser } from "../services/user.service.js";

export async function getUsers(req, res) {
  const users = await listUsers(req.user);
  return sendSuccess(res, users, "Usuarios obtenidos");
}

export async function createUserAction(req, res) {
  const user = await createUser(req.validated.body, req.user);
  return sendSuccess(res, user, "Usuario creado", 201);
}

export async function updateUserAction(req, res) {
  const user = await updateUser(req.validated.params.id, req.validated.body, req.user);
  return sendSuccess(res, user, "Usuario actualizado");
}
