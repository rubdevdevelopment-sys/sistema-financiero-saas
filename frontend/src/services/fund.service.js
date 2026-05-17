import { api } from "./api.js";

function companyParams(companyId) {
  return companyId ? { company_id: companyId } : undefined;
}

export async function getFundOverview(companyId) {
  const response = await api.get("/funds/overview", {
    params: companyParams(companyId)
  });
  return response.data.data;
}

export async function getFundCycles(companyId) {
  const response = await api.get("/funds/cycles", {
    params: companyParams(companyId)
  });
  return response.data.data;
}

export async function getFundMembers(companyId) {
  const response = await api.get("/funds/members", {
    params: companyParams(companyId)
  });
  return response.data.data;
}
