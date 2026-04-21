// Central fetch wrapper.
// - Proactively refreshes the access token if it gets a 401.
// - On second 401 (refresh also failed), calls the global logout handler.
// Usage: import { apiFetch } from "../api/fetch" and use exactly like fetch().

import { API_BASE_URL } from "./config";

let _onUnauthorized = null;

/** AuthContext registers its logout fn here so apiFetch can call it. */
export function registerUnauthorizedHandler(fn) {
  _onUnauthorized = fn;
}

async function tryRefresh() {
  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  return res.ok;
}

export async function apiFetch(url, options = {}) {
  const opts = { credentials: "include", ...options };

  let res = await fetch(url, opts);

  if (res.status === 401) {
    // Try to silently refresh the access token once
    const refreshed = await tryRefresh();
    if (refreshed) {
      // Retry original request with the new cookie
      res = await fetch(url, opts);
    }
    // If refresh failed or retry still 401, force logout
    if (res.status === 401) {
      _onUnauthorized?.();
      throw new Error("Session expired");
    }
  }

  return res;
}
