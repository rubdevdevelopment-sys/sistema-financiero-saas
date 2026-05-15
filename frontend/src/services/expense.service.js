import api from "./api";

export async function getExpenses(params = {}) {
  const { data } = await api.get("/expenses", {
    params
  });

  return data;
}

export async function createExpense(payload) {
  const { data } = await api.post("/expenses", payload);
  return data;
}

export async function updateExpense(id, payload) {
  const { data } = await api.put(`/expenses/${id}`, payload);
  return data;
}

export async function deleteExpense(id) {
  const { data } = await api.delete(`/expenses/${id}`);
  return data;
}

export async function getExpenseCategories(params = {}) {
  const { data } = await api.get("/categories", {
    params: {
      type: "expense",
      ...params
    }
  });

  return data;
}