import api from "./api";

export async function getIncomes(params = {}) {
  const { data } = await api.get("/incomes", {
    params
  });

  return data;
}

export async function createIncome(payload) {
  const { data } = await api.post("/incomes", payload);
  return data;
}

export async function updateIncome(id, payload) {
  const { data } = await api.put(`/incomes/${id}`, payload);
  return data;
}

export async function deleteIncome(id) {
  const { data } = await api.delete(`/incomes/${id}`);
  return data;
}

export async function getIncomeCategories(params = {}) {
  const { data } = await api.get("/categories", {
    params: {
      type: "income",
      ...params
    }
  });

  return data;
}