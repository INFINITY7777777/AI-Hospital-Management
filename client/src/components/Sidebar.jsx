import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  Calendar,
  Pill,
  BedDouble,
  UserCheck,
  FileText,
  Settings,
  Activity,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1];

export default function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user?.role?.toLowerCase() || "";
  const isAdmin = userRole === "admin";

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navigation = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Doctors", path: "/doctors", icon: Stethoscope },
    { name: "Patients", path: "/patients", icon: Users },
    { name: "Appointments", path: "/appointments", icon: Calendar },
    { name: "Pharmacy", path: "/pharmacy", icon: Pill },
    { name: "Beds", path: "/beds", icon: BedDouble },
    { name: "Admissions", path: "/admissions", icon: UserCheck },
  ];

  const adminNav = [
    { name: "Prompt Management", path: "/prompts", icon: FileText },
  ];

  return (
    <>
      {/* =========================================================
          COMPACT FLOATING MENU BUTTON
      ========================================================= */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Navigation Menu"
        className="fixed top-3 left-4 z-90 flex items-center gap-2 h-9 px-3 rounded-xl bg-[#0b1b32] border border-slate-700/80 text-white shadow-md hover:border-cyan-400/40 transition-all duration-200 focus:outline-none active:scale-95"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="relative w-4 h-4 flex items-center justify-center text-cyan-400">
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Menu className="w-4 h-4 stroke-[2.5]" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <span className="text-[11px] font-bold tracking-tight text-slate-200">
          {isOpen ? "Close" : "Menu"}
        </span>
      </motion.button>

      {/* =========================================================
          ANIMATED SIDEBAR DRAWER & BACKDROP OVERLAY
      ========================================================= */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-95"
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease }}
              className="fixed top-0 left-0 bottom-0 z-100 w-64 bg-[#0b1b32] border-r border-slate-800 shadow-[10px_0_40px_rgba(0,0,0,0.5)] flex flex-col justify-between font-sans text-slate-300 overflow-hidden"
            >
              {/* TOP BRANDING & NAVIGATION */}
              <div className="overflow-y-auto">
                <div className="border-b border-white/5 px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-[#102844] text-cyan-400">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h1 className="truncate text-xs font-bold tracking-tight text-white">
                          Hospital System
                        </h1>
                        <span className="shrink-0 rounded-full border border-blue-400/20 bg-blue-500/10 px-1.5 py-0.5 text-[8px] font-bold text-blue-300">
                          v2.0
                        </span>
                      </div>
                      <p className="mt-0.5 text-[9px] font-medium uppercase tracking-wider text-slate-500">
                        HMS Portal
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsOpen(false)}
                    type="button"
                    className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <nav className="px-3 py-4">
                  <div className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    Clinical Navigation
                  </div>

                  <div className="space-y-1">
                    {navigation.map((item, index) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;

                      return (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.03 * index, duration: 0.2, ease }}
                        >
                          <Link
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className={`group relative flex items-center justify-between overflow-hidden rounded-xl px-3 py-2.5 text-[11px] font-semibold transition-colors duration-200 ${
                              isActive
                                ? "text-white"
                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            {/* HORIZONTAL SPOTLIGHT EFFECT FOR ACTIVE ITEM */}
                            {isActive && (
                              <motion.div
                                layoutId="sidebar-spotlight"
                                className="absolute inset-0 pointer-events-none"
                                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                              >
                                {/* Background fill */}
                                <div className="absolute inset-0 bg-[#08679f]/30 backdrop-blur-xs" />

                                {/* Left cap light strip */}
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.75 rounded-r-full bg-cyan-300 shadow-[0_0_12px_#22d3ee]" />

                                {/* Horizontal spotlight cone beam emitting from the left strip */}
                                <div
                                  className="absolute inset-0 opacity-80"
                                  style={{
                                    background:
                                      "radial-gradient(ellipse 100% 120% at 0% 50%, rgba(34, 211, 238, 0.35) 0%, rgba(8, 103, 159, 0.15) 50%, transparent 100%)",
                                  }}
                                />
                              </motion.div>
                            )}

                            <div className="relative z-10 flex items-center gap-3">
                              <Icon
                                className={`h-4 w-4 transition-colors duration-200 ${
                                  isActive
                                    ? "text-cyan-300 drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]"
                                    : "text-slate-500 group-hover:text-cyan-400"
                                }`}
                              />
                              <span>{item.name}</span>
                            </div>

                            {isActive && (
                              <ChevronRight className="relative z-10 h-3.5 w-3.5 text-cyan-300/80" />
                            )}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>

                  {isAdmin && (
                    <div className="mt-5 border-t border-white/5 pt-4">
                      <div className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
                        Administration
                      </div>

                      <div className="space-y-1">
                        {adminNav.map((item) => {
                          const Icon = item.icon;
                          const isActive = location.pathname === item.path;

                          return (
                            <Link
                              key={item.name}
                              to={item.path}
                              onClick={() => setIsOpen(false)}
                              className={`group relative flex items-center justify-between overflow-hidden rounded-xl px-3 py-2.5 text-[11px] font-semibold transition-colors duration-200 ${
                                isActive
                                  ? "text-white"
                                  : "text-slate-400 hover:bg-white/5 hover:text-white"
                              }`}
                            >
                              {isActive && (
                                <motion.div
                                  layoutId="sidebar-spotlight"
                                  className="absolute inset-0 pointer-events-none"
                                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                >
                                  <div className="absolute inset-0 bg-indigo-600/30 backdrop-blur-xs" />
                                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.75 rounded-r-full bg-indigo-300 shadow-[0_0_12px_#818cf8]" />
                                  <div
                                    className="absolute inset-0 opacity-80"
                                    style={{
                                      background:
                                        "radial-gradient(ellipse 100% 120% at 0% 50%, rgba(129, 140, 248, 0.35) 0%, rgba(79, 70, 229, 0.15) 50%, transparent 100%)",
                                    }}
                                  />
                                </motion.div>
                              )}

                              <div className="relative z-10 flex items-center gap-3">
                                <Icon
                                  className={`h-4 w-4 ${
                                    isActive
                                      ? "text-indigo-300 drop-shadow-[0_0_6px_rgba(129,140,248,0.6)]"
                                      : "text-indigo-400 group-hover:text-indigo-300"
                                  }`}
                                />
                                <span>{item.name}</span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </nav>
              </div>

              {/* CLEAN FOOTER */}
              <div className="border-t border-white/5 p-3 bg-[#081527]">
                <Link
                  to="/settings"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[11px] font-semibold transition-all duration-200 ${
                    location.pathname === "/settings"
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Settings className="h-4 w-4 text-slate-500" />
                  <span>Hospital Settings</span>
                </Link>

                <div className="mt-2.5 rounded-xl border border-emerald-400/10 bg-emerald-400/5 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    <span className="text-[9px] font-bold text-emerald-400">
                      System Operational
                    </span>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}