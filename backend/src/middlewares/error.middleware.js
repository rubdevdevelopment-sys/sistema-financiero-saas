import { ZodError } from "zod";
import { logger } from "../config/logger.js";

export function errorHandler(err, _req, res, _next) {
  logger.error(err.message, {
    stack: err.stack,
    details: err.details ?? null
  });

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Datos invalidos",
      errors: err.flatten()
    });
  }

  const statusCode = err.statusCode ?? 500;

  return res.status(statusCode).json({
    success: false,
    message: err.message ?? "Error interno del servidor",
    details: err.details ?? null
  });
}
