import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Settings } from "lucide-react";
import NotificationBell from "./NotificationBell";

function Navbar({ onOpenSearch }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role ? String(user.role).toLowerCase().trim() : "";
  const displayName = user.full_name || user.name || user.username || "Staff Member";

  // Navbar Spotlight & Hover state
  const navRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!navRef.current) return;
    const rect = navRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <nav
      ref={navRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-xl transition-all duration-300 hover:border-[#08679F]/30 hover:shadow-[0_10px_30px_rgba(8,103,159,0.06)] sm:px-5 lg:px-6"
    >
      {/* Dynamic Spotlight Glow effect inside navbar */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(8, 103, 159, 0.08), transparent 80%)`,
        }}
      />

      {/* Border Light Highlight */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(8, 103, 159, 0.25), transparent 100%)`,
          maskImage: "linear-gradient(#black, #black) content-box, linear-gradient(#black, #black)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1px",
        }}
      />

      {/* SEARCH CONTAINER WITH LEFT OFFSET FOR FLOATING MENU BUTTON */}
      <div className="relative z-10 flex min-w-0 flex-1 items-center pl-24">
        <button
          onClick={onOpenSearch}
          className="group relative flex h-10 w-full max-w-md items-center justify-between overflow-hidden rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 text-xs text-slate-400 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#08679f]/40 hover:bg-white hover:shadow-md active:translate-y-0"
        >
          <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

          <span className="flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-400 transition-colors group-hover:text-[#08679f]" />
            <span className="hidden sm:inline">Search patients, doctors, records...</span>
            <span className="sm:hidden">Search...</span>
          </span>

          <kbd className="hidden rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[9px] text-slate-400 shadow-sm md:inline-block">
            Ctrl + K / ⌘ K
          </kbd>
        </button>
      </div>

      {/* RIGHT SIDE USER ACTIONS */}
      <div className="relative z-10 ml-3 flex items-center gap-2 sm:gap-3">
        {role === "admin" && (
          <Link
            to="/users"
            title="User Management"
            className="group relative hidden items-center gap-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-[10px] font-bold text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-[#08679f] hover:shadow-sm active:translate-y-0 md:inline-flex"
          >
            <Settings className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-45" />
            Users
          </Link>
        )}

        <div className="rounded-xl transition-all">
          <NotificationBell />
        </div>

        <div className="hidden h-7 w-px bg-slate-200 sm:block" />

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[#e7f4fb] to-blue-50 text-sm font-bold uppercase text-[#08679f] ring-1 ring-blue-100/80 shadow-xs transition-transform duration-200 hover:scale-105">
            {displayName.charAt(0)}
          </div>

          <div className="hidden leading-tight lg:block">
            <p className="max-w-32.5 truncate text-[11px] font-bold capitalize text-slate-800">
              {displayName}
            </p>
            <p className="text-[9px] font-medium capitalize text-slate-400">
              {role || "User"}
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;