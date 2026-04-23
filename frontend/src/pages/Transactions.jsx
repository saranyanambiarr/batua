import { useState, useRef, useEffect } from "react";
import { fetchTransactions, createTransaction, updateTransaction, deleteTransaction } from "../api/transactionApi";

const EXPENSE_CATEGORIES = [
  "Food", "Groceries", "Shopping", "Transport", "Entertainment", "Movie",
  "Netflix", "Amazon Prime", "Claude", "ChatGPT", "Cursor", "Gemini", "Google 1",
  "Utilities", "WiFi", "Water", "Electricity", "Gas", "Rent", "Home Loan EMI",
  "Edu Loan EMI", "Personal Loan EMI", "Other EMI", "Land tax", "Health", "Salon",
  "Gym", "Yoga", "Education", "SIP", "Stocks", "Investments", "Travel",
  "Repairs", "Gifts", "Other",
];

const CATEGORY_KEYWORDS = [
  ["Netflix",           ["netflix"]],
  ["Amazon Prime",      ["amazon prime", "prime video", "primevideo"]],
  ["Claude",            ["claude", "anthropic"]],
  ["ChatGPT",           ["chatgpt", "openai"]],
  ["Cursor",            ["cursor"]],
  ["Gemini",            ["gemini"]],
  ["Google 1",          ["google one", "google 1"]],
  ["Movie",             ["movie", "cinema", "theatre", "theater", "pvr", "inox"]],
  ["Entertainment",     ["entertainment", "concert", "show", "event", "spotify", "youtube premium"]],
  ["Groceries",         ["grocery", "groceries", "supermarket", "dmart", "bigbasket", "blinkit", "zepto", "swiggy instamart"]],
  ["Food",              ["food", "restaurant", "swiggy", "zomato", "lunch", "dinner", "breakfast", "cafe", "coffee", "eat", "meal", "pizza", "burger", "biryani"]],
  ["Transport",         ["uber", "ola", "auto", "metro", "bus", "train", "fuel", "petrol", "diesel", "cab", "transport", "rapido"]],
  ["Shopping",          ["shopping", "amazon", "flipkart", "myntra", "ajio", "clothes", "shoes", "fashion"]],
  ["WiFi",              ["wifi", "broadband", "internet", "jio fiber", "airtel fiber"]],
  ["Electricity",       ["electricity", "electric", "power bill", "bescom", "mseb"]],
  ["Water",             ["water bill", "water board"]],
  ["Gas",               ["gas", "cylinder", "lpg", "indane", "bharat gas"]],
  ["Utilities",         ["utility", "utilities", "bill"]],
  ["Home Loan EMI",     ["home loan", "housing loan", "mortgage"]],
  ["Edu Loan EMI",      ["edu loan", "education loan", "student loan"]],
  ["Personal Loan EMI", ["personal loan"]],
  ["Other EMI",         ["emi", "loan"]],
  ["Rent",              ["rent", "pg", "hostel", "lease"]],
  ["Land tax",          ["land tax", "property tax"]],
  ["Gym",               ["gym", "fitness", "cult.fit", "cultfit"]],
  ["Yoga",              ["yoga"]],
  ["Salon",             ["salon", "haircut", "barber", "spa", "parlour", "parlor"]],
  ["Health",            ["health", "doctor", "hospital", "medicine", "pharmacy", "medical", "clinic", "apollo", "1mg"]],
  ["Education",         ["education", "course", "tuition", "coaching", "udemy", "coursera", "school", "college", "fee"]],
  ["SIP",               ["sip", "mutual fund", "mf"]],
  ["Stocks",            ["stock", "shares", "zerodha", "groww", "nse", "bse"]],
  ["Investments",       ["invest", "fd", "ppf", "nps", "gold bond"]],
  ["Travel",            ["travel", "flight", "hotel", "holiday", "trip", "makemytrip", "goibibo", "irctc", "booking"]],
  ["Repairs",           ["repair", "maintenance", "fix", "service"]],
  ["Gifts",             ["gift", "present", "donation"]],
];

function detectCategory(text) {
  if (!text) return "";
  const lower = text.toLowerCase();
  for (const [category, keywords] of CATEGORY_KEYWORDS) {
    if (keywords.some(kw => lower.includes(kw))) return category;
  }
  return "";
}

const today = new Date().toISOString().split("T")[0];

const EMPTY_FORM = {
  amount: "", type: "expense", description: "", comment: "",
  category: "", categoryLocked: false, date: today, proof: null, proofPreview: "",
};

const inp = "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white dark:bg-gray-800";

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  );
}

// ── Transaction modal (Resend-style) ──────────────────────────────────────────
function TransactionModal({ form, setForm, onSave, onCancel, saving, error, editId }) {
  const fileRef = useRef();

  function handleDescriptionChange(e) {
    const description = e.target.value;
    setForm(f => ({
      ...f, description,
      category: f.categoryLocked ? f.category : (detectCategory(description) || f.category),
    }));
  }

  function handleCategoryOverride(cat) {
    setForm(f => ({ ...f, category: cat, categoryLocked: true }));
  }

  function handleTypeChange(e) {
    setForm(f => ({ ...f, type: e.target.value, category: "", categoryLocked: false }));
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      alert("Only images (JPG, PNG, WEBP) and PDFs are accepted."); return;
    }
    if (file.size > 5 * 1024 * 1024) { alert("File must be under 5 MB."); return; }
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, proof: file, proofPreview: ev.target.result }));
    reader.readAsDataURL(file);
  }

  function removeProof() {
    setForm(f => ({ ...f, proof: null, proofPreview: "" }));
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    // Backdrop — click outside to cancel
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-gray-800 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {editId ? "Edit Transaction" : "New Transaction"}
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <XIcon />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">

          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 text-red-500 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Amount (₹)</label>
              <input type="number" min="1" placeholder="0" value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Type</label>
              <select value={form.type} onChange={handleTypeChange} className={inp}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Date</label>
              <input type="date" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inp} />
            </div>
          </div>

          {/* What's it for */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              What's it for?
              {form.type === "expense" && <span className="text-gray-400 font-normal"> — category auto-detected as you type</span>}
            </label>
            <input
              placeholder={form.type === "expense" ? "e.g. Swiggy, Netflix, Uber, Gym…" : "e.g. Salary, Freelance payment…"}
              value={form.description} onChange={handleDescriptionChange} className={inp}
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Comment <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Any additional notes…"
              value={form.comment}
              onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
              className={inp + " resize-none"}
            />
          </div>

          {/* Category — expense only */}
          {form.type === "expense" && (
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Category</label>
              {form.category ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-sm font-medium px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-800">
                    {form.category}
                    <button onClick={() => setForm(f => ({ ...f, category: "", categoryLocked: false }))}
                      className="text-indigo-400 hover:text-indigo-600"><XIcon /></button>
                  </span>
                  <span className="text-xs text-gray-400">{form.categoryLocked ? "manually set" : "auto-detected"}</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">Wrong?</span>
                  <div className="flex flex-wrap gap-1.5">
                    {EXPENSE_CATEGORIES.filter(c => c !== form.category).slice(0, 6).map(c => (
                      <button key={c} onClick={() => handleCategoryOverride(c)}
                        className="text-xs px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-indigo-300 hover:text-indigo-600 transition-colors bg-white dark:bg-gray-800">
                        {c}
                      </button>
                    ))}
                    <select value="" onChange={e => e.target.value && handleCategoryOverride(e.target.value)}
                      className="text-xs px-2 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 bg-white dark:bg-gray-800 focus:outline-none">
                      <option value="">More…</option>
                      {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-400 italic">
                    {form.description ? "No match — pick manually:" : "Start typing above to auto-detect, or pick manually:"}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {EXPENSE_CATEGORIES.slice(0, 6).map(c => (
                      <button key={c} onClick={() => handleCategoryOverride(c)}
                        className="text-xs px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-indigo-300 hover:text-indigo-600 transition-colors bg-white dark:bg-gray-800">
                        {c}
                      </button>
                    ))}
                    <select value="" onChange={e => e.target.value && handleCategoryOverride(e.target.value)}
                      className="text-xs px-2 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 bg-white dark:bg-gray-800 focus:outline-none">
                      <option value="">More…</option>
                      {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Proof upload — expense only, hidden in edit mode since backend doesn't re-upload */}
          {form.type === "expense" && !editId && (
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Expense Proof <span className="text-gray-400 font-normal">(JPG, PNG, PDF · max 5 MB)</span>
              </label>
              {!form.proofPreview ? (
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl px-5 py-4 text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors w-full justify-center">
                  <UploadIcon /> Click to attach a file
                </button>
              ) : (
                <div className="flex items-start gap-4">
                  {form.proof?.type?.startsWith("image/") ? (
                    <img src={form.proofPreview} alt="proof preview"
                      className="w-20 h-20 object-cover rounded-xl border border-gray-100 shadow-sm" />
                  ) : (
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 text-xs gap-1">
                      <span className="text-2xl">📄</span>PDF
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{form.proof?.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{(form.proof?.size / 1024).toFixed(1)} KB</p>
                    <div className="flex gap-2 mt-2">
                      <button type="button" onClick={() => fileRef.current?.click()} className="text-xs text-indigo-500 hover:underline">Replace</button>
                      <span className="text-gray-300">|</span>
                      <button type="button" onClick={removeProof} className="text-xs text-red-400 hover:underline">Remove</button>
                    </div>
                  </div>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden" onChange={handleFileChange} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <button onClick={onCancel}
            className="text-sm px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            Cancel
          </button>
          <button onClick={onSave} disabled={saving}
            className="text-sm px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors font-medium">
            {saving ? "Saving…" : editId ? "Save changes" : "Add transaction"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [modalError, setModalError] = useState("");
  const [form, setForm]             = useState(EMPTY_FORM);
  const [showModal, setShowModal]   = useState(false);
  const [editId, setEditId]         = useState(null);   // null = create, number = edit
  const [saving, setSaving]         = useState(false);
  const [viewProof, setViewProof]   = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [filterType, setFilterType]         = useState("all");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStart, setFilterStart]       = useState("");
  const [filterEnd, setFilterEnd]           = useState("");

  useEffect(() => {
    fetchTransactions()
      .then(setTransactions)
      .catch(() => setError("Failed to load transactions."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = transactions.filter(t => {
    if (filterType !== "all" && t.type !== filterType) return false;
    if (filterCategory && t.category !== filterCategory) return false;
    if (filterStart && t.date < filterStart) return false;
    if (filterEnd   && t.date > filterEnd)   return false;
    return true;
  });

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditId(null);
    setModalError("");
    setShowModal(true);
  }

  function openEdit(t) {
    setForm({
      amount: String(t.amount),
      type: t.type,
      description: t.note || "",
      comment: t.comment || "",
      category: t.category || "",
      categoryLocked: !!t.category,
      date: t.date,
      proof: null,
      proofPreview: "",
    });
    setEditId(t.id);
    setModalError("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setForm(EMPTY_FORM);
    setEditId(null);
    setModalError("");
  }

  async function handleSave() {
    if (!form.amount)  { setModalError("Please enter an amount."); return; }
    if (!form.date)    { setModalError("Please select a date."); return; }
    if (form.type === "expense" && !form.category) {
      setModalError("Could not detect category — type a keyword or pick one manually."); return;
    }
    setSaving(true);
    setModalError("");
    try {
      if (editId) {
        // Edit — JSON PUT (no file re-upload)
        const updated = await updateTransaction(editId, {
          amount:   Number(form.amount),
          type:     form.type,
          category: form.category,
          date:     form.date,
          note:     form.description,
          comment:  form.comment,
        });
        setTransactions(prev => prev.map(t => t.id === editId ? updated : t));
      } else {
        // Create — FormData POST (supports file)
        const fd = new FormData();
        fd.append("amount", form.amount);
        fd.append("type",   form.type);
        fd.append("date",   form.date);
        if (form.category)    fd.append("category", form.category);
        if (form.description) fd.append("note",     form.description);
        if (form.comment)     fd.append("comment",  form.comment);
        if (form.proof)       fd.append("proof",    form.proof);
        const created = await createTransaction(fd);
        setTransactions(prev => [created, ...prev]);
      }
      closeModal();
    } catch {
      setModalError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this transaction?")) return;
    setDeletingId(id);
    try {
      await deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch {
      setError("Failed to delete transaction.");
    } finally {
      setDeletingId(null);
    }
  }

  function clearFilters() {
    setFilterType("all"); setFilterCategory(""); setFilterStart(""); setFilterEnd("");
  }

  const hasActiveFilters = filterType !== "all" || filterCategory || filterStart || filterEnd;

  return (
    <>
      {/* Proof lightbox */}
      {viewProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setViewProof(null)}>
          <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewProof(null)}
              className="absolute -top-3 -right-3 bg-white rounded-full w-7 h-7 flex items-center justify-center shadow text-gray-600 hover:text-gray-900">
              <XIcon />
            </button>
            <img src={viewProof} alt="Expense proof" className="w-full rounded-2xl shadow-xl" />
          </div>
        </div>
      )}

      {/* Transaction modal */}
      {showModal && (
        <TransactionModal
          form={form} setForm={setForm}
          onSave={handleSave} onCancel={closeModal}
          saving={saving} error={modalError} editId={editId}
        />
      )}

      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Transactions</h2>
            <p className="text-sm text-gray-400 mt-0.5">All your income and expenses</p>
          </div>
          <button onClick={openCreate}
            className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            + Add Transaction
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
              <div className="flex gap-1.5">
                {["all", "income", "expense"].map(f => (
                  <button key={f} onClick={() => setFilterType(f)}
                    className={`text-sm px-3 py-1.5 rounded-full capitalize transition-colors ${
                      filterType === f ? "bg-indigo-600 text-white" : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300">
                <option value="">All categories</option>
                {[...new Set(transactions.map(t => t.category).filter(Boolean))].sort().map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
              <input type="date" value={filterStart} onChange={e => setFilterStart(e.target.value)}
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
              <input type="date" value={filterEnd} onChange={e => setFilterEnd(e.target.value)}
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-sm text-indigo-500 hover:underline self-end pb-1.5">
                Clear filters
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            {filtered.length} transaction{filtered.length !== 1 ? "s" : ""} shown{hasActiveFilters && " (filtered)"}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 text-red-500 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Transaction list */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          {loading ? (
            <p className="text-center text-gray-400 text-sm py-12">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-12">No transactions found.</p>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.map(t => (
                <div key={t.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{t.type === "income" ? "💰" : "💸"}</span>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{t.category || "Income"}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{t.date}</p>
                        {t.note    && <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 italic">{t.note}</p>}
                        {t.comment && <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">💬 {t.comment}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {t.receipt_url && (
                        <button onClick={() => setViewProof(t.receipt_url)} title="View proof">
                          <img src={t.receipt_url} alt="proof" className="w-10 h-10 object-cover rounded-lg border border-gray-100 shadow-sm hover:opacity-80 transition-opacity" />
                        </button>
                      )}
                      <div className="text-right">
                        <p className={`font-semibold text-sm ${t.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                          {t.type === "income" ? "+" : "−"}₹{t.amount.toLocaleString()}
                        </p>
                        <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
                          style={{ background: t.type === "income" ? "#dcfce7" : "#fee2e2", color: t.type === "income" ? "#15803d" : "#b91c1c" }}>
                          {t.type}
                        </span>
                      </div>
                      <button onClick={() => openEdit(t)} title="Edit transaction"
                        className="p-1.5 rounded-lg text-gray-300 hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors">
                        <EditIcon />
                      </button>
                      <button onClick={() => handleDelete(t.id)} disabled={deletingId === t.id} title="Delete transaction"
                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-30 transition-colors">
                        <TrashIcon />
                      </button>
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
