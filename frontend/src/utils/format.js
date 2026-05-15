export function currency(value = 0) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0
  }).format(Number(value) || 0);
}

export function formatCurrency(value = 0) {
  return currency(value);
}

export function integer(value = 0) {
  return new Intl.NumberFormat("es-CO").format(Number(value) || 0);
}

export function percent(value = 0) {
  return `${Number(value || 0).toFixed(1)}%`;
}

export function incomeTypeLabel(type) {
  const labels = {
    participant_payment: "Aporte participante",
    extra_income: "Ingreso extra",
    donation: "Donación",
    raffle: "Rifa"
  };

  return labels[type] || type || "-";
}

export function expenseTypeLabel(type) {
  const labels = {
    operating: "Operativo",
    administrative: "Administrativo",
    logistics: "Logística",
    payroll: "Nómina"
  };

  return labels[type] || type || "-";
}

export function statusLabel(status) {
  const labels = {
    completed: "Completado",
    pending: "Pendiente",
    cancelled: "Cancelado"
  };

  return labels[status] || status || "-";
}

export function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}