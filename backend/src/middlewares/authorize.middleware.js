import { ApiError } from "../utils/ApiError.js";

export function authorize(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "No autorizado"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, "No tienes permisos para esta accion"));
    }

    return next();
  };
}
