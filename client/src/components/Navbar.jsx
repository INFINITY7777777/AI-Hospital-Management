// ==========================================================
// NAVBAR
// UI REDESIGN ONLY
// ==========================================================

import { Link, useNavigate } from "react-router-dom";

import {
  Search,
  Settings,
  LogOut,
} from "lucide-react";

import NotificationBell from "./NotificationBell";

function Navbar({ onOpenSearch }) {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const role = user.role
    ? String(user.role).toLowerCase().trim()
    : "";

  const displayName =
    user.full_name ||
    user.name ||
    user.username ||
    "Staff Member";

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav
      className="
        sticky
        top-0
        z-30
        flex
        h-16
        shrink-0
        items-center
        justify-between
        border-b
        border-slate-200/70
        bg-white/80
        px-4
        backdrop-blur-xl
        sm:px-5
        lg:px-6
      "
    >

      {/* ======================================================
          SEARCH
      ====================================================== */}

      <div className="flex min-w-0 flex-1 items-center">

        <button
          onClick={onOpenSearch}
          className="
            group
            flex
            h-10
            w-full
            max-w-125
            items-center
            justify-between
            rounded-xl
            border
            border-slate-200
            bg-slate-50/80
            px-3.5
            text-xs
            text-slate-400
            transition-all
            duration-200
            hover:border-slate-300
            hover:bg-white
            hover:shadow-sm
          "
        >

          <span className="flex items-center gap-2">

            <Search className="h-4 w-4 text-slate-400 transition-colors group-hover:text-[#08679f]" />

            <span className="hidden sm:inline">
              Search patients, doctors, records...
            </span>

            <span className="sm:hidden">
              Search...
            </span>

          </span>

          <kbd
            className="
              hidden
              rounded-md
              border
              border-slate-200
              bg-white
              px-1.5
              py-0.5
              font-mono
              text-[9px]
              text-slate-400
              shadow-sm
              md:inline-block
            "
          >
            ⌘K
          </kbd>

        </button>

      </div>

      {/* ======================================================
          RIGHT SIDE
      ====================================================== */}

      <div className="ml-3 flex items-center gap-2 sm:gap-3">

        {/* ADMIN USER MANAGEMENT */}

        {role === "admin" && (
          <Link
            to="/users"
            title="User Management"
            className="
              hidden
              items-center
              gap-1.5
              rounded-xl
              border
              border-slate-200
              bg-white
              px-3
              py-2
              text-[10px]
              font-bold
              text-slate-600
              transition-all
              hover:border-blue-200
              hover:bg-blue-50
              hover:text-[#08679f]
              md:inline-flex
            "
          >
            <Settings className="h-3.5 w-3.5" />
            Users
          </Link>
        )}

        {/* NOTIFICATIONS */}

        <div
          className="
            rounded-xl
            border
            border-transparent
            p-2
            transition-all
            hover:border-slate-200
            hover:bg-slate-50
          "
        >
          <NotificationBell />
        </div>

        <div className="hidden h-7 w-px bg-slate-200 sm:block" />

        {/* USER */}

        <div className="flex items-center gap-2.5">

          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-[#e7f4fb]
              text-sm
              font-bold
              uppercase
              text-[#08679f]
              ring-1
              ring-blue-100
            "
          >
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

        {/* LOGOUT */}

        <button
          onClick={handleLogout}
          title="Logout"
          className="
            rounded-xl
            border
            border-slate-200
            bg-white
            p-2
            text-slate-400
            transition-all
            duration-200
            hover:border-rose-200
            hover:bg-rose-50
            hover:text-rose-600
            active:scale-95
          "
        >
          <LogOut className="h-4 w-4" />
        </button>

      </div>

    </nav>
  );
}

export default Navbar;