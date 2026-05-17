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

export async function saveFundCycle(payload, id) {
  const response = id
    ? await api.put(`/funds/cycles/${id}`, payload)
    : await api.post("/funds/cycles", payload);
  return response.data.data;
}

export async function getFundMembers(companyId) {
  const response = await api.get("/funds/members", {
    params: companyParams(companyId)
  });
  return response.data.data;
}

export async function saveFundMember(payload, id) {
  const response = id
    ? await api.put(`/funds/members/${id}`, payload)
    : await api.post("/funds/members", payload);
  return response.data.data;
}

export async function updateFundMemberStatus(id, payload) {
  const response = await api.patch(`/funds/members/${id}/status`, payload);
  return response.data.data;
}

export async function getFundQuotas(companyId, cycleId) {
  const response = await api.get("/funds/quotas", {
    params: {
      ...companyParams(companyId),
      cycle_id: cycleId || undefined
    }
  });
  return response.data.data;
}

export async function saveFundQuota(payload, id) {
  const response = id
    ? await api.put(`/funds/quotas/${id}`, payload)
    : await api.post("/funds/quotas", payload);
  return response.data.data;
}

export async function getFundContributions(companyId, filters = {}) {
  const response = await api.get("/funds/contributions", {
    params: {
      ...companyParams(companyId),
      ...filters
    }
  });
  return response.data.data;
}

export async function generateFundContributions(payload) {
  const response = await api.post("/funds/contributions/generate", payload);
  return response.data.data;
}

export async function registerFundContributionPayment(id, payload) {
  const response = await api.put(`/funds/contributions/${id}/payment`, payload);
  return response.data.data;
}

export async function getFundPenalties(companyId) {
  const response = await api.get("/funds/penalties", {
    params: companyParams(companyId)
  });
  return response.data.data;
}

export async function saveFundPenalty(payload) {
  const response = await api.post("/funds/penalties", payload);
  return response.data.data;
}
