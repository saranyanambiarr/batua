import { apiFetch } from "./fetch";
import { BUDGET_API_URL } from "./config";

export async function fetchBudgets() {
  const res = await apiFetch(`${BUDGET_API_URL}/budgets/`);
  if (!res.ok) throw new Error("Failed to fetch budgets");
  return res.json();
}

export async function createBudget(data) {
  const res = await apiFetch(`${BUDGET_API_URL}/budgets/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create budget");
  }
  return res.json();
}

export async function updateBudget(id, data) {
  const res = await apiFetch(`${BUDGET_API_URL}/budgets/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update budget");
  return res.json();
}

export async function deleteBudget(id) {
  const res = await apiFetch(`${BUDGET_API_URL}/budgets/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete budget");
  return res.json();
}
