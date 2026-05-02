//export const API_BASE_URL = "http://localhost:8000";

export const API_BASE_URL        = import.meta.env.VITE_API_BASE_URL;
export const TRANSACTION_API_URL = import.meta.env.VITE_TRANSACTION_API_URL;
export const BUDGET_API_URL      = import.meta.env.VITE_BUDGET_API_URL;
export const AGENT_API_URL       = import.meta.env.VITE_AGENT_API_URL ?? "http://localhost:8003";