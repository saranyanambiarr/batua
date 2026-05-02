import { AGENT_API_URL } from "./config";
import { apiFetch } from "./fetch";

export async function generateReport({ start_date, end_date }) {
  const res = await apiFetch(`${AGENT_API_URL}/report/generate`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ start_date, end_date }),
  });
  if (res.status === 404) throw new Error("No transactions found in this period.");
  if (!res.ok) throw new Error("Failed to generate report.");
  return res.json();
}
