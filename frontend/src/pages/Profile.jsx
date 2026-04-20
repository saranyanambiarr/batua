import { useEffect, useState } from "react";
import { fetchCurrentUser } from "../api/userApi";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api/config";

function Section({ title, subtitle, children }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
      <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide w-32 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium text-right">{value || "—"}</span>
    </div>
  );
}

export default function Profile() {
  const [user, setUser]                   = useState(null);
  const [error, setError]                 = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput]     = useState("");
  const [deleting, setDeleting]           = useState(false);
  const [deleteError, setDeleteError]     = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .catch(() => setError("Could not load profile."));
  }, []);

  async function handleDeleteAccount() {
    if (deleteInput !== "DELETE") {
      setDeleteError('Type "DELETE" to confirm.');
      return;
    }
    setDeleting(true);
    try {
      await fetch(`${API_BASE_URL}/users/me`, {
        method: "DELETE",
        credentials: "include",
      });
      await logout();
      navigate("/");
    } catch {
      setDeleteError("Failed to delete account. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  const joined = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  return (
    <div className="min-h-full p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-6">

        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Profile</h2>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Manage your account details and preferences</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* ── Account details ─────────────────────────────────────────── */}
        <Section title="Account details" subtitle="Information about your Batua account">
          {user ? (
            <>
              <Row label="Email"  value={user.email} />
              <Row label="Joined" value={joined} />
              <Row label="Plan"   value="Free" />
            </>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500">Loading…</p>
          )}
        </Section>

        {/* ── Delete account ──────────────────────────────────────────── */}
        <Section title="Delete account" subtitle="Permanently remove your account and all associated data">
          {!deleteConfirm ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                This action is irreversible. All your transactions, budgets, and data will be permanently deleted.
              </p>
              <button
                onClick={() => setDeleteConfirm(true)}
                className="flex-shrink-0 ml-4 text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950 px-4 py-2 rounded-lg transition-colors"
              >
                Delete account
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 rounded-lg px-4 py-3">
                <p className="text-sm text-red-700 dark:text-red-400 font-medium">This cannot be undone.</p>
                <p className="text-xs text-red-500 dark:text-red-500 mt-0.5">
                  All your data will be permanently deleted immediately.
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                  Type <span className="font-bold text-gray-700 dark:text-gray-300">DELETE</span> to confirm
                </label>
                <input
                  value={deleteInput}
                  onChange={e => { setDeleteInput(e.target.value); setDeleteError(""); }}
                  placeholder="DELETE"
                  className="w-full border border-red-200 dark:border-red-900 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-800 transition"
                />
                {deleteError && <p className="text-xs text-red-500 mt-1">{deleteError}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setDeleteConfirm(false); setDeleteInput(""); setDeleteError(""); }}
                  className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
                >
                  {deleting ? "Deleting…" : "Permanently delete"}
                </button>
              </div>
            </div>
          )}
        </Section>

      </div>
    </div>
  );
}
