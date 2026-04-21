import { API_BASE_URL } from "./config";
import { apiFetch } from "./fetch";

// Public endpoints — no token refresh needed
export async function loginUser(payload) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function registerUser(payload) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

// Protected endpoint — goes through apiFetch for 401 handling
export async function fetchCurrentUser() {
  const res = await apiFetch(`${API_BASE_URL}/users/me`);
  return handleResponse(res);
}

async function handleResponse(res) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    // Always throw so callers can handle the error in their own catch block.
    // Never silently redirect — that causes a dashboard flash before the redirect.
    throw new Error(errorData.detail || "Something went wrong");
  }

  return res.json();
}