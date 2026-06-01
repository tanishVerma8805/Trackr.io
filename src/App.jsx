import { useState, useEffect } from "react";
import {
  Plus,
  Calendar,
  Mail,
  Trash2,
  Briefcase,
  ChevronDown,
  X,
  CheckCircle2,
  Search,
  LogOut,
  Info,
} from "lucide-react";

// ─── Google-style brand colors for known companies ───────────────────────────
const BRAND_ICONS = {
  google: {
    bg: "bg-white border border-gray-200",
    letters: [
      { char: "G", color: "#4285F4" },
      { char: "o", color: "#EA4335" },
      { char: "o", color: "#FBBC05" },
      { char: "g", color: "#4285F4" },
      { char: "l", color: "#34A853" },
      { char: "e", color: "#EA4335" },
    ],
  },
  microsoft: { bg: "bg-white border border-gray-200", grid: true },
  meta: { bg: "bg-white border border-gray-200", metaLogo: true },
  amazon: { bg: "bg-amber-400", abbr: "A", textColor: "text-white" },
  apple: { bg: "bg-gray-900", abbr: "⌘", textColor: "text-white" },
  netflix: { bg: "bg-red-600", abbr: "N", textColor: "text-white" },
  uber: { bg: "bg-black", abbr: "U", textColor: "text-white" },
  default: { bg: "bg-indigo-100", abbr: null, textColor: "text-indigo-700" },
};

const STATUS_CONFIG = {
  Applied:      { bg: "bg-blue-100",   text: "text-blue-700",   border: "border-blue-200" },
  "Online Test":{ bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200" },
  Interview:    { bg: "bg-green-100",  text: "text-green-700",  border: "border-green-200" },
  Offered:      { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
  "Offer Extended": { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
  Rejected:     { bg: "bg-red-100",    text: "text-red-700",    border: "border-red-200" },
};

const STATUSES = ["Applied", "Online Test", "Interview", "Offered", "Rejected"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 10);

function getBrandKey(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("google")) return "google";
  if (n.includes("microsoft")) return "microsoft";
  if (n.includes("meta") || n.includes("facebook")) return "meta";
  if (n.includes("amazon")) return "amazon";
  if (n.includes("apple")) return "apple";
  if (n.includes("netflix")) return "netflix";
  if (n.includes("uber")) return "uber";
  return "default";
}

function CompanyIcon({ name, size = "md" }) {
  const key = getBrandKey(name);
  const brand = BRAND_ICONS[key];
  const dim = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";

  if (key === "google") {
    return (
      <div className={`${dim} rounded-lg ${brand.bg} flex items-center justify-center overflow-hidden shrink-0`}>
        <span className="font-black text-lg leading-none">
          {brand.letters.map((l, i) => (
            <span key={i} style={{ color: l.color }}>{l.char}</span>
          ))}
        </span>
      </div>
    );
  }

  if (key === "microsoft") {
    return (
      <div className={`${dim} rounded-lg ${brand.bg} flex items-center justify-center shrink-0`}>
        <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
          <div className="bg-red-500 rounded-sm" />
          <div className="bg-green-500 rounded-sm" />
          <div className="bg-blue-500 rounded-sm" />
          <div className="bg-yellow-400 rounded-sm" />
        </div>
      </div>
    );
  }

  if (key === "meta") {
    return (
      <div className={`${dim} rounded-lg ${brand.bg} flex items-center justify-center shrink-0`}>
        <svg viewBox="0 0 40 24" className="w-7 h-4" fill="none">
          <path
            d="M4 12C4 7.5 6.5 4 10 4C12.5 4 14.5 6 16 9L20 17L24 9C25.5 6 27.5 4 30 4C33.5 4 36 7.5 36 12C36 16.5 33.5 20 30 20C27.5 20 25.5 18 24 15L20 7L16 15C14.5 18 12.5 20 10 20C6.5 20 4 16.5 4 12Z"
            fill="url(#metaGrad)"
          />
          <defs>
            <linearGradient id="metaGrad" x1="4" y1="4" x2="36" y2="20" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0081FB" />
              <stop offset="1" stopColor="#0064E0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // Default: initials
  const abbr = brand.abbr || (name ? name.charAt(0).toUpperCase() : "?");
  const bgColors = [
    "bg-violet-100 text-violet-700",
    "bg-rose-100 text-rose-700",
    "bg-emerald-100 text-emerald-700",
    "bg-orange-100 text-orange-700",
    "bg-cyan-100 text-cyan-700",
    "bg-pink-100 text-pink-700",
  ];
  const colorIdx = (name || "").charCodeAt(0) % bgColors.length;
  const colorCls = brand.bg === "bg-indigo-100"
    ? bgColors[colorIdx]
    : `${brand.bg} ${brand.textColor}`;

  return (
    <div className={`${dim} rounded-lg ${colorCls} flex items-center justify-center font-black shrink-0`}>
      {abbr}
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["Applied"];
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border} whitespace-nowrap`}>
      {status}
    </span>
  );
}

function AppCard({ app, onDelete }) {
  const handleScanMail = () => {
    window.open(
      `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(app.company)}`,
      "_blank"
    );
  };

  const toGCalDate = (date, time) => {
    if (!date) return "";
    const d = new Date(`${date}T${time || "00:00"}:00`);
    const pad = (n) => String(n).padStart(2, "0");
    return (
      d.getFullYear() +
      pad(d.getMonth() + 1) +
      pad(d.getDate()) +
      "T" +
      pad(d.getHours()) +
      pad(d.getMinutes()) +
      "00"
    );
  };

  const handlePushCal = () => {
    const title = encodeURIComponent(`${app.company} – ${app.role}`);
    const details = encodeURIComponent(app.notes || "");
    const dt = toGCalDate(app.date, app.time);
    window.open(
      `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dt}/${dt}&details=${details}`,
      "_blank"
    );
  };

  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
      {/* Card Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <CompanyIcon name={app.company} />
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 text-base leading-tight truncate">{app.company}</h3>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <StatusBadge status={app.status} />
            <button
              onClick={() => onDelete(app.id)}
              className="p-1 text-gray-300 hover:text-red-400 transition-colors rounded"
              title="Delete"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Role + Date row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <p className="text-sm font-semibold text-gray-700 truncate">{app.role || "—"}</p>
          {formatDate(app.date) && (
            <p className="text-sm text-gray-400 shrink-0">{formatDate(app.date)}</p>
          )}
        </div>

        {/* Notes */}
        {app.notes && (
          <div>
            <p className="text-xs font-bold text-gray-800 mb-1">Structured Notes</p>
            <pre className="text-xs text-gray-500 whitespace-pre-wrap font-sans leading-relaxed line-clamp-4">
              {app.notes}
            </pre>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-auto border-t border-gray-100">
        <button
          onClick={handleScanMail}
          className="w-full flex items-center justify-between px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100 group"
        >
          <span className="tracking-wide">SEARCH GMAIL</span>
          <Mail size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
        </button>
        <button
          onClick={handlePushCal}
          className="w-full flex items-center justify-between px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors group"
        >
          <span className="tracking-wide">ADD TO CALENDAR</span>
          <Calendar size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
        </button>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  company: "",
  role: "",
  status: "Applied",
  date: "",
  time: "",
  notes: "",
};

export default function App() {
  const [apps, setApps] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("trackr_apps_v2") || "[]");
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState(EMPTY_FORM);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem("trackr_apps_v2", JSON.stringify(apps));
  }, [apps]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleAdd = () => {
    if (!form.company.trim()) {
      setToast({ type: "error", msg: "Company name is required." });
      return;
    }
    setApps((prev) => [{ id: uid(), ...form, createdAt: Date.now() }, ...prev]);
    setForm(EMPTY_FORM);
    setToast({ type: "success", msg: `${form.company} added.` });
  };

  const handleDelete = (id) => setApps((prev) => prev.filter((a) => a.id !== id));

  const inputCls =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white";

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* ── Top Nav Bar ── */}
      <header className="bg-slate-700 text-white px-6 py-3 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-base font-black tracking-wider uppercase">
            PLACEMENT HUB - APPLICATION TRACKER
          </h1>
          <span className="bg-gray-300 text-gray-800 text-xs font-bold px-3 py-1 rounded-full">
            Total Applications: {apps.length}
          </span>
        </div>
        <button className="p-1.5 rounded hover:bg-slate-600 transition-colors">
          <LogOut size={18} />
        </button>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT: Form Panel ── */}
        <aside className="w-80 shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
          <div className="p-6 flex flex-col gap-5">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
              LOG NEW APPLICATION
            </h2>

            {/* Company Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Company Name</label>
              <input
                className={inputCls}
                placeholder="Example: Google"
                value={form.company}
                onChange={setField("company")}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>

            {/* Role */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Role / Position</label>
              <input
                className={inputCls}
                placeholder="Example: SWE Intern"
                value={form.role}
                onChange={setField("role")}
              />
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Application Status</label>
              <div className="relative">
                <select
                  className={`${inputCls} appearance-none pr-8 cursor-pointer`}
                  value={form.status}
                  onChange={setField("status")}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Date (Optional)</label>
              <input
                type="date"
                className={`${inputCls} [color-scheme:light]`}
                value={form.date}
                onChange={setField("date")}
              />
            </div>

            {/* Time */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Time (Optional)</label>
              <input
                type="time"
                className={`${inputCls} [color-scheme:light]`}
                value={form.time}
                onChange={setField("time")}
              />
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Structured Notes</label>
              <textarea
                className={`${inputCls} resize-y leading-relaxed`}
                rows={7}
                placeholder={"- Practice arrays & strings\n- Review system design basics\n- Check mock interviews\n- Link: (Mock interview platform URL)"}
                value={form.notes}
                onChange={setField("notes")}
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleAdd}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold text-sm rounded-xl tracking-widest uppercase transition-colors shadow-md"
            >
              SAVE APPLICATION NOTE
            </button>

            {apps.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm("Clear all entries?")) setApps([]);
                }}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors text-center"
              >
                Clear all entries
              </button>
            )}
          </div>
        </aside>

        {/* ── RIGHT: Feed ── */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">
              ACTIVE TRACKING FEED
            </h2>
            <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
              <Info size={18} />
            </button>
          </div>

          {apps.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mb-4">
                <Briefcase size={28} className="text-gray-400" />
              </div>
              <p className="font-bold text-gray-500">No applications logged yet</p>
              <p className="text-sm text-gray-400 mt-1">Fill in the form on the left to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {apps.map((app) => (
                <AppCard key={app.id} app={app} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold border ${
              toast.type === "success"
                ? "bg-white border-green-200 text-green-700"
                : "bg-white border-red-200 text-red-600"
            }`}
          >
            {toast.type === "success" ? <CheckCircle2 size={15} /> : <X size={15} />}
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}