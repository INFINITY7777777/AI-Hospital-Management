import { useState, useEffect, useRef } from "react";
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

  // 3D Tilt & Interactive Spotlight State
  const sidebarRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cardRotate, setCardRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!sidebarRef.current) return;
    const rect = sidebarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;

    setCardRotate({ x: rotateX, y: rotateY });
  };

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

            {/* 3D Perspective Wrapper - Controlled overflow */}
            <div className="fixed top-0 left-0 bottom-0 z-100 w-64 overflow-hidden pointer-events-none perspective-[1000px]">
              <motion.aside
                ref={sidebarRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => {
                  setIsHovered(false);
                  setCardRotate({ x: 0, y: 0 });
                }}
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.35, ease }}
                style={{
                  transform: isHovered
                    ? `rotateX(${cardRotate.x}deg) rotateY(${cardRotate.y}deg) translateZ(10px)`
                    : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
                  transition: isHovered
                    ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
                    : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
                }}
                className="pointer-events-auto animate-login-card relative h-full w-full overflow-x-hidden overflow-y-auto bg-[#0b1b32]/95 border-r border-slate-700/80 p-0 shadow-[10px_0_40px_rgba(0,0,0,0.5)] backdrop-blur-xl flex flex-col justify-between font-sans text-slate-300 hover:border-cyan-400/30 hover:shadow-[15px_0_40px_rgba(34,211,238,0.1)] no-scrollbar"
              >
                {/* SUBTLE CONTROLLED CURSOR SPOTLIGHT */}
                <div
                  className="pointer-events-none absolute -inset-px rounded-r-3xl opacity-0 transition-opacity duration-300 z-0"
                  style={{
                    opacity: isHovered ? 1 : 0,
                    background: `radial-gradient(180px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.06), transparent 80%)`,
                  }}
                />

                {/* SMALL BORDER HIGHLIGHT */}
                <div
                  className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 z-0"
                  style={{
                    opacity: isHovered ? 1 : 0,
                    background: `radial-gradient(150px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.2), transparent 100%)`,
                    maskImage: "linear-gradient(#black, #black) content-box, linear-gradient(#black, #black)",
                    maskComposite: "exclude",
                    WebkitMaskComposite: "xor",
                    padding: "1px",
                  }}
                />

                {/* BACKGROUND BLUR SPHERES */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
                  <div className="absolute -left-20 -top-20 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />
                  <div className="absolute -right-20 bottom-1/3 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
                </div>

                {/* TOP BRANDING & NAVIGATION */}
                <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar">
                  <div className="border-b border-white/10 px-5 py-4 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-[#102844] text-cyan-400 shadow-sm">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          {/* Updated Text Below */}
                          <h1 className="truncate text-xs font-bold tracking-tight text-white">
                            Hospital Management System
                          </h1>
                          
                        </div>
                        <p className="mt-0.5 text-[9px] font-medium uppercase tracking-wider text-slate-400">
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
                    <div className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
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
                              className={`group relative flex items-center justify-between overflow-hidden rounded-xl px-3 py-2.5 text-[11px] font-semibold transition-all duration-200 ${
                                isActive
                                  ? "text-white shadow-sm"
                                  : "text-slate-300 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              {isActive && (
                                <motion.div
                                  layoutId="sidebar-spotlight"
                                  className="absolute inset-0 pointer-events-none"
                                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                >
                                  <div className="absolute inset-0 bg-white/10 backdrop-blur-xs" />
                                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.8)]" />
                                  <div
                                    className="absolute inset-0 opacity-60"
                                    style={{
                                      background:
                                        "radial-gradient(ellipse 90% 100% at 0% 50%, rgba(255, 255, 255, 0.15) 0%, rgba(34, 211, 238, 0.08) 50%, transparent 100%)",
                                    }}
                                  />
                                </motion.div>
                              )}

                              <div className="relative z-10 flex items-center gap-3">
                                <Icon
                                  className={`h-4 w-4 transition-colors duration-200 ${
                                    isActive
                                      ? "text-cyan-300 drop-shadow-[0_0_5px_rgba(103,232,249,0.5)]"
                                      : "text-slate-400 group-hover:text-cyan-300"
                                  }`}
                                />
                                <span>{item.name}</span>
                              </div>

                              {isActive && (
                                <ChevronRight className="relative z-10 h-3.5 w-3.5 text-cyan-300/90" />
                              )}
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>

                    {isAdmin && (
                      <div className="mt-5 border-t border-white/10 pt-4">
                        <div className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
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
                                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                                }`}
                              >
                                {isActive && (
                                  <motion.div
                                    layoutId="sidebar-spotlight"
                                    className="absolute inset-0 pointer-events-none"
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                  >
                                    <div className="absolute inset-0 bg-white/10 backdrop-blur-xs" />
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-indigo-300 shadow-[0_0_8px_rgba(165,180,252,0.8)]" />
                                    <div
                                      className="absolute inset-0 opacity-60"
                                      style={{
                                        background:
                                          "radial-gradient(ellipse 90% 100% at 0% 50%, rgba(255, 255, 255, 0.15) 0%, rgba(129, 140, 248, 0.08) 50%, transparent 100%)",
                                      }}
                                    />
                                  </motion.div>
                                )}

                                <div className="relative z-10 flex items-center gap-3">
                                  <Icon
                                    className={`h-4 w-4 ${
                                      isActive
                                        ? "text-indigo-300 drop-shadow-[0_0_5px_rgba(165,180,252,0.5)]"
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
                <div className="relative z-10 shrink-0 border-t border-white/10 p-3 bg-[#081527]/80 backdrop-blur-md">
                  <Link
                    to="/settings"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[11px] font-semibold transition-all duration-200 ${
                      location.pathname === "/settings"
                        ? "bg-white/10 text-white"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    <span>Settings</span>
                  </Link>

                  <div className="mt-2.5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                      <span className="text-[9px] font-bold text-emerald-400">
                        System Operational
                      </span>
                    </div>
                  </div>
                </div>
              </motion.aside>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Embedded Styles to Hide Scrollbars cleanly */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes loginCardIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-login-card {
          animation: loginCardIn 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-login-card {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}