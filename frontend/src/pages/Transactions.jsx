import { useState, useRef } from "react";
import { TRANSACTIONS } from "../data/mockData";

const EMPTY_FORM = {
  amount: "",
  type: "expense",
  category: "",
  date: "",
  note: "",
  proof: null,      // File object
  proofPreview: "", // data URL for image preview
};

function UploadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

export default function Transactions() {
  const [transactions, setTransactions] = useState(TRANSACTIONS);
  const [form, setForm]   = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter]     = useState("all");
  const [viewProof, setViewProof] = useState(null); // proof URL to show in lightbox
  const fileRef = useRef();

  const filtered = transactions.filter(t => filter === "all" || t.type === filter);

  function setField(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Only accept images and PDFs
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      alert("Only images (JPG, PNG, WEBP) and PDFs are accepted.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File must be under 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm(f => ({ ...f, proof: file, proofPreview: ev.target.result }));
    };
    reader.readAsDataURL(file);
  }

  function removeProof() {
    setForm(f => ({ ...f, proof: null, proofPreview: "" }));
    if (fileRef.current) fileRef.current.value = "";
  }

  function addTransaction() {
    if (!form.amount || !form.category || !form.date) return;

    // TODO: when backend is ready, use FormData + multipart upload here:
    // const fd = new FormData();
    // fd.append("amount", form.amount); ...
    // fd.append("proof", form.proof);
    // await fetch("/api/transactions", { method: "POST", body: fd, credentials: "include" });

    setTransactions([
      {
        id: Date.now(),
        type: form.type,
        category: form.category,
        amount: Number(form.amount),
        date: form.date,
        note: form.note,
        proofPreview: form.proofPreview,
        proofName: form.proof?.name || null,
      },
      ...transactions,
    ]);
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  function cancelForm() {
    setShowForm(false);
    setForm(EMPTY_FORM);
  }

  return (
    <>
      {/* Proof lightbox */}
      {viewProof && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setViewProof(null)}
        >
          <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setViewProof(null)}
              className="absolute -top-3 -right-3 bg-white rounded-full w-7 h-7 flex items-center justify-center shadow text-gray-600 hover:text-gray-900"
            >
              <XIcon />
            </button>
            <img src={viewProof} alt="Expense proof" className="w-full rounded-2xl shadow-xl" />
          </div>
        </div>
      )}

      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Transactions</h2>
            <p className="text-sm text-gray-400 mt-0.5">All your income and expenses</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Add Transaction
          </button>
        </div>

        {/* ── Add form ────────────────────────────────────────────────── */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h3 className="font-semibold text-gray-700">New Transaction</h3>

            {/* Row 1: amount, type, category, date */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="0"
                  value={form.amount}
                  onChange={e => setField("amount", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={e => setField("type", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                <input
                  placeholder="e.g. Food"
                  value={form.category}
                  onChange={e => setField("category", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setField("date", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>

            {/* Row 2: note */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Note (optional)</label>
              <input
                placeholder="Add a short description"
                value={form.note}
                onChange={e => setField("note", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            {/* Row 3: expense proof upload (only shown for expenses) */}
            {form.type === "expense" && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">
                  Expense Proof{" "}
                  <span className="text-gray-400 font-normal">(receipt, invoice or photo — JPG, PNG, PDF · max 5 MB)</span>
                </label>

                {!form.proofPreview ? (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-2 border-2 border-dashed border-gray-200 rounded-xl px-5 py-4 text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors w-full justify-center"
                  >
                    <UploadIcon />
                    Click to attach a file
                  </button>
                ) : (
                  <div className="flex items-start gap-4">
                    {/* Image preview or PDF label */}
                    {form.proof?.type?.startsWith("image/") ? (
                      <img
                        src={form.proofPreview}
                        alt="proof preview"
                        className="w-24 h-24 object-cover rounded-xl border border-gray-100 shadow-sm cursor-pointer"
                        onClick={() => setViewProof(form.proofPreview)}
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-gray-400 text-xs gap-1">
                        <span className="text-2xl">📄</span>
                        PDF
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{form.proof?.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {(form.proof?.size / 1024).toFixed(1)} KB
                      </p>
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => fileRef.current?.click()}
                          className="text-xs text-indigo-500 hover:underline"
                        >
                          Replace
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          type="button"
                          onClick={removeProof}
                          className="text-xs text-red-400 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={addTransaction}
                className="bg-indigo-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={cancelForm}
                className="text-sm px-5 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Filter tabs ─────────────────────────────────────────────── */}
        <div className="flex gap-2">
          {["all", "income", "expense"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-sm px-4 py-1.5 rounded-full capitalize transition-colors ${
                filter === f
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* ── Transaction list ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-12">No transactions yet.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map(t => (
                <div key={t.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{t.type === "income" ? "💰" : "💸"}</span>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{t.category}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{t.date}</p>
                        {t.note && (
                          <p className="text-gray-500 text-xs mt-0.5 italic">{t.note}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Proof thumbnail */}
                      {t.proofPreview && t.proof?.type?.startsWith("image/") && (
                        <button onClick={() => setViewProof(t.proofPreview)} title="View proof">
                          <img
                            src={t.proofPreview}
                            alt="proof"
                            className="w-10 h-10 object-cover rounded-lg border border-gray-100 shadow-sm hover:opacity-80 transition-opacity"
                          />
                        </button>
                      )}
                      {t.proofPreview && t.proof?.type === "application/pdf" && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">📄 PDF</span>
                      )}
                      {t.proofName && !t.proofPreview && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">📎 {t.proofName}</span>
                      )}
                      <div className="text-right">
                        <p className={`font-semibold text-sm ${t.type === "income" ? "text-green-600" : "text-red-500"}`}>
                          {t.type === "income" ? "+" : "−"}₹{t.amount.toLocaleString()}
                        </p>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
                          style={{
                            background: t.type === "income" ? "#dcfce7" : "#fee2e2",
                            color:      t.type === "income" ? "#15803d" : "#b91c1c",
                          }}
                        >
                          {t.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
