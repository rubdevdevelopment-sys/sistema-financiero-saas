import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(
    __dirname,
    "../../.env"
  )
});

function required(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

export const env = {
  NODE_ENV:
    process.env.NODE_ENV ??
    "development",

  PORT: Number(
    process.env.PORT ?? 4000
  ),

  DATABASE_URL:
    required("DATABASE_URL"),

  JWT_SECRET:
    required("JWT_SECRET"),

  JWT_EXPIRES_IN:
    process.env.JWT_EXPIRES_IN ??
    "8h",

  CORS_ORIGIN:
    process.env.CORS_ORIGIN ??
    "http://localhost:5173",

  APP_NAME:
    process.env.APP_NAME ??
    "Sistema Financiero SaaS"
};