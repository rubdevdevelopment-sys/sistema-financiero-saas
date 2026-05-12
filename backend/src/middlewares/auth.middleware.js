import { verifyAccessToken } from "../utils/jwt.js";
import { ApiError } from "../utils/ApiError.js";

export function authMiddleware(req, _res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new ApiError(401, "No autorizado"));
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch (_error) {
    return next(new ApiError(401, "Token invalido o expirado"));
  }
}
