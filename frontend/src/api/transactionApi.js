import { TRANSACTION_API_URL } from "./config";
import { apiFetch } from "./fetch";

export async function fetchTransactions({ type, start_date, end_date } = {}) {
  const params = new URLSearchParams();
  if (type)       params.append("type", type);
  if (start_date) params.append("start_date", start_date);
  if (end_date)   params.append("end_date", end_date);

  const res = await apiFetch(`${TRANSACTION_API_URL}/transactions/?${params}`);
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
}

export async function createTransaction(formData) {
  const res = await apiFetch(`${TRANSACTION_API_URL}/transactions/`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to create transaction");
  return res.json();
}

export async function updateTransaction(id, data) {
  const res = await apiFetch(`${TRANSACTION_API_URL}/transactions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update transaction");
  return res.json();
}

export async function deleteTransaction(id) {
  const res = await apiFetch(`${TRANSACTION_API_URL}/transactions/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete transaction");
  return res.json();
}

export async function fetchSummary() {
  const res = await apiFetch(`${TRANSACTION_API_URL}/transactions/summary`);
  if (!res.ok) throw new Error("Failed to fetch summary");
  return res.json();
}
