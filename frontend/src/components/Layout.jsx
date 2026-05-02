import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect y="3"  width="20" height="2" rx="1" fill="currentColor" />
      <rect y="9"  width="20" height="2" rx="1" fill="currentColor" />
      <rect y="15" width="20" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}

function ChevronUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15"/>
    </svg>
  );
}

const NAV_ITEMS = [
  { label: "Overview",     icon: "▣",  path: "/dashboard"    },
  { label: "Transactions", icon: "⇄",  path: "/transactions" },
  { label: "Budgets",      icon: "◎",  path: "/budgets"      },
  { label: "Charts",       icon: "📈", path: "/charts"       },
  { label: "Calendar",     icon: "▦",  path: "/calendar"     },
  { label: "Export",       icon: "↑",  path: "/export"       },
  { label: "AI Report",    icon: "✦",  path: "/ai-report"    },
];

export default function Layout({ children }) {
  const [open, setOpen]           = useState(true);
  const [popoverOpen, setPopover] = useState(false);
  const { logout, user }          = useAuth();
  const { dark, toggle }          = useTheme();
  const navigate                  = useNavigate();
  const { pathname }              = useLocation();
  const popoverRef                = useRef(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setPopover(false);
      }
    }
    if (popoverOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [popoverOpen]);

  const email    = user?.email ?? "";
  const initial  = email ? email[0].toUpperCase() : "?";
  // Show just the part before @ if sidebar is open, or just initial if collapsed
  const username = email.split("@")[0];

  function handleLogout() {
    setPopover(false);
    logout();
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950 transition-colors duration-200">

      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <aside
        className="flex flex-col flex-shrink-0 transition-all duration-300 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
        style={{ width: open ? "200px" : "60px", height: "100vh", position: "sticky", top: 0 }}
      >
        {/* Hamburger + app name */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setOpen(!open)}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-100 flex-shrink-0 transition-colors"
            title="Toggle sidebar"
          >
            <MenuIcon />
          </button>
          {open && (
            <span className="text-base font-bold text-gray-800 dark:text-gray-100 tracking-tight whitespace-nowrap">
              Batua
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 flex flex-col gap-0.5 text-sm">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                title={item.label}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-colors text-left ${
                  active
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-50 font-semibold"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <span className="flex-shrink-0 text-base w-5 text-center">{item.icon}</span>
                {open && <span className="text-sm">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* ── User card (Resend-style) ─────────────────────────────────── */}
        <div className="relative px-2 pb-3 border-t border-gray-100 dark:border-gray-800 pt-2" ref={popoverRef}>

          {/* Popover — appears above the user card */}
          {popoverOpen && (
            <div className="absolute bottom-full left-2 right-2 mb-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50">
              {/* User header in popover */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{email}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Free plan</p>
              </div>

              {/* Actions */}
              <div className="py-1">
                <button
                  onClick={() => { setPopover(false); navigate("/profile"); }}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors text-left"
                >
                  <span>👤</span>
                  <span>Profile &amp; settings</span>
                </button>
                <button
                  onClick={() => { toggle(); setPopover(false); }}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors text-left"
                >
                  <span>{dark ? "☀️" : "🌙"}</span>
                  <span>{dark ? "Light mode" : "Dark mode"}</span>
                </button>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 py-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors text-left"
                >
                  <span>⏻</span>
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}

          {/* Clickable user card */}
          <button
            onClick={() => setPopover(v => !v)}
            title={email}
            className={`flex items-center gap-2.5 w-full px-2 py-2 rounded-lg transition-colors text-left ${
              popoverOpen
                ? "bg-gray-100 dark:bg-gray-800"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {/* Avatar */}
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 flex items-center justify-center text-xs font-bold">
              {initial}
            </span>

            {open && (
              <>
                <span className="flex-1 min-w-0">
                  <span className="block text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                    {username}
                  </span>
                </span>
                <span className="flex-shrink-0 text-gray-400 dark:text-gray-600">
                  <ChevronUpIcon />
                </span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ── Page content ──────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
