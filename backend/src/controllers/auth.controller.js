import { sendSuccess } from "../utils/response.js";
import {
  createPasswordResetToken,
  loginUser,
  resetPassword
} from "../services/auth.service.js";

export async function login(req, res) {
  const result = await loginUser(req.validated.body);
  return sendSuccess(res, result, "Login exitoso");
}

export async function me(req, res) {
  return sendSuccess(res, req.user, "Perfil actual");
}

export async function forgotPassword(req, res) {
  const result = await createPasswordResetToken(req.validated.body.email);
  return sendSuccess(
    res,
    result,
    "Solicitud procesada. En esta fase inicial el token se devuelve para pruebas."
  );
}

export async function resetPasswordAction(req, res) {
  const result = await resetPassword(req.validated.body);
  return sendSuccess(res, result, "Contrasena actualizada");
}
