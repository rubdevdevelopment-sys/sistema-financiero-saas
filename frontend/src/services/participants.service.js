import api from "./api";

export async function getParticipants(params = {}) {
  const { data } = await api.get("/participants", {
    params
  });

  return data;
}