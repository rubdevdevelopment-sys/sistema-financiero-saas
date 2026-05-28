import axios from "axios";

function normalizeBaseUrl(url) {
  return url?.trim().replace(/\/+$/, "");
}

function resolveApiBaseUrl() {
  const viteEnv = import.meta.env ?? {};
  const configuredUrl = normalizeBaseUrl(viteEnv.VITE_API_URL);

  if (configuredUrl) {
    return configuredUrl;
  }

  if (viteEnv.DEV) {
    return "http://localhost:4000/api";
  }

  console.error(
    "VITE_API_URL no esta configurada. Define la URL publica del backend, por ejemplo: https://tu-backend.up.railway.app/api"
  );

  return "/api";
}

export const api = axios.create({
  baseURL: resolveApiBaseUrl()
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export default api;
