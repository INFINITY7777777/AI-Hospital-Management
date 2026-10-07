// ==========================================================
// SIDEBAR
// UI REDESIGN ONLY
// ==========================================================

import { Link, useLocation } from "react-router-dom";

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
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const userRole =
    user?.role?.toLowerCase() || "";

  const isAdmin = userRole === "admin";

  const navigation = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Doctors",
      path: "/doctors",
      icon: Stethoscope,
    },
    {
      name: "Patients",
      path: "/patients",
      icon: Users,
    },
    {
      name: "Appointments",
      path: "/appointments",
      icon: Calendar,
    },
    {
      name: "Pharmacy",
      path: "/pharmacy",
      icon: Pill,
    },
    {
      name: "Beds",
      path: "/beds",
      icon: BedDouble,
    },
    {
      name: "Admissions",
      path: "/admissions",
      icon: UserCheck,
    },
  ];

  const adminNav = [
    {
      name: "Prompt Management",
      path: "/prompts",
      icon: FileText,
    },
  ];

  return (
    <aside
      className="
        flex
        min-h-screen
        w-59.5
        shrink-0
        flex-col
        justify-between
        border-r
        border-slate-800
        bg-[#0b1b32]
        font-sans
        text-slate-300
        shadow-[8px_0_30px_rgba(15,23,42,0.08)]
      "
    >

      {/* ======================================================
          TOP
      ====================================================== */}

      <div>

        {/* BRAND */}

        <div className="border-b border-white/5 px-5 py-5">

          <div className="flex items-center gap-3">

            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-cyan-400/10
                bg-[#102844]
                text-cyan-400
                shadow-[0_0_25px_rgba(34,211,238,0.08)]
              "
            >
              <Activity className="h-5 w-5" />
            </div>

            <div className="min-w-0">

              <div className="flex items-center gap-1.5">

                <h1 className="truncate text-[13px] font-bold tracking-tight text-white">
                  Hospital Management
                </h1>

                <span
                  className="
                    shrink-0
                    rounded-full
                    border
                    border-blue-400/20
                    bg-blue-500/10
                    px-1.5
                    py-0.5
                    text-[8px]
                    font-bold
                    text-blue-300
                  "
                >
                  v2.0
                </span>

              </div>

              <p className="mt-0.5 text-[9px] font-medium uppercase tracking-wider text-slate-500">
                HMS Portal
              </p>

            </div>

          </div>

        </div>

        {/* NAVIGATION */}

        <nav className="px-3 py-4">

          <div className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
            Clinical Navigation
          </div>

          <div className="space-y-1">

            {navigation.map((item) => {

              const Icon = item.icon;

              const isActive =
                location.pathname === item.path;

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`
                    group
                    relative
                    flex
                    items-center
                    justify-between
                    rounded-xl
                    px-3
                    py-2.5
                    text-[11px]
                    font-semibold
                    transition-all
                    duration-200
                    ${
                      isActive
                        ? `
                          bg-[#08679f]
                          text-white
                          shadow-[0_8px_20px_rgba(8,103,159,0.22)]
                        `
                        : `
                          text-slate-400
                          hover:bg-white/5
                          hover:text-white
                        `
                    }
                  `}
                >

                  <div className="flex items-center gap-3">

                    <Icon
                      className={`
                        h-4 w-4
                        transition-all
                        duration-200
                        ${
                          isActive
                            ? "text-white"
                            : "text-slate-500 group-hover:text-cyan-400"
                        }
                      `}
                    />

                    <span>
                      {item.name}
                    </span>

                  </div>

                  {isActive && (
                    <ChevronRight
                      className="
                        h-3.5
                        w-3.5
                        text-white/70
                      "
                    />
                  )}

                </Link>
              );
            })}

          </div>

          {/* ADMIN */}

          {isAdmin && (
            <div className="mt-5 border-t border-white/5 pt-4">

              <div className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
                Administration
              </div>

              <div className="space-y-1">

                {adminNav.map((item) => {

                  const Icon = item.icon;

                  const isActive =
                    location.pathname === item.path;

                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`
                        group
                        flex
                        items-center
                        justify-between
                        rounded-xl
                        px-3
                        py-2.5
                        text-[11px]
                        font-semibold
                        transition-all
                        duration-200
                        ${
                          isActive
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                        }
                      `}
                    >

                      <div className="flex items-center gap-3">

                        <Icon
                          className={`
                            h-4 w-4
                            ${
                              isActive
                                ? "text-white"
                                : "text-indigo-400 group-hover:text-indigo-300"
                            }
                          `}
                        />

                        <span>
                          {item.name}
                        </span>

                      </div>

                    </Link>
                  );
                })}

              </div>

            </div>
          )}

        </nav>

      </div>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div className="border-t border-white/5 p-3">

        <Link
          to="/settings"
          className={`
            flex
            items-center
            gap-3
            rounded-xl
            px-3
            py-2.5
            text-[11px]
            font-semibold
            transition-all
            duration-200
            ${
              location.pathname === "/settings"
                ? "bg-white/10 text-white"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }
          `}
        >

          <Settings className="h-4 w-4 text-slate-500" />

          <span>
            Hospital Settings
          </span>

        </Link>

        <div className="mt-3 rounded-xl border border-emerald-400/10 bg-emerald-400/5 px-3 py-2.5">

          <div className="flex items-center gap-2">

            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

            <span className="text-[9px] font-bold text-emerald-400">
              System Operational
            </span>

          </div>

          <p className="mt-1 text-[8px] leading-4 text-slate-500">
            Hospital services and clinical modules are running.
          </p>

        </div>

      </div>

    </aside>
  );
}