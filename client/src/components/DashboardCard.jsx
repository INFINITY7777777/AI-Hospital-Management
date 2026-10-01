// ==========================================================
// DASHBOARD CARD
// UI REDESIGN ONLY
// ==========================================================

function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  onClick,
  color = "blue",
}) {
  const colorStyles = {
    blue: {
      iconBg: "bg-blue-50",
      iconText: "text-[#08679f]",
      iconBorder: "border-blue-100",
      glow: "group-hover:shadow-blue-100/60",
    },

    amber: {
      iconBg: "bg-amber-50",
      iconText: "text-amber-600",
      iconBorder: "border-amber-100",
      glow: "group-hover:shadow-amber-100/60",
    },

    rose: {
      iconBg: "bg-rose-50",
      iconText: "text-rose-600",
      iconBorder: "border-rose-100",
      glow: "group-hover:shadow-rose-100/60",
    },

    emerald: {
      iconBg: "bg-emerald-50",
      iconText: "text-emerald-600",
      iconBorder: "border-emerald-100",
      glow: "group-hover:shadow-emerald-100/60",
    },

    indigo: {
      iconBg: "bg-indigo-50",
      iconText: "text-indigo-600",
      iconBorder: "border-indigo-100",
      glow: "group-hover:shadow-indigo-100/60",
    },
  };

  const activeTheme =
    colorStyles[color] || colorStyles.blue;

  return (
    <div
      onClick={onClick}
      className={`
        group
        relative
        overflow-hidden
        rounded-[20px]
        border
        border-slate-200/80
        bg-white
        p-4
        shadow-[0_6px_25px_rgba(15,23,42,0.035)]
        transition-all
        duration-300
        ${activeTheme.glow}
        ${
          onClick
            ? "cursor-pointer hover:-translate-y-1 hover:shadow-lg active:translate-y-0"
            : "hover:-translate-y-0.5 hover:shadow-md"
        }
      `}
    >

      {/* Subtle decorative glow */}

      <div
        className={`
          pointer-events-none
          absolute
          -right-8
          -top-8
          h-20
          w-20
          rounded-full
          opacity-0
          blur-2xl
          transition-opacity
          duration-300
          group-hover:opacity-100
          ${activeTheme.iconBg}
        `}
      />

      <div className="relative flex items-start justify-between gap-3">

        {/* TEXT */}

        <div className="min-w-0 flex-1">

          <p className="mb-2 truncate text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
            {title}
          </p>

          <h2 className="truncate text-[25px] font-black tracking-[-0.04em] text-slate-900">
            {value}
          </h2>

          {subtitle && (
            <p className="mt-1.5 truncate text-[9px] font-medium text-slate-400">
              {subtitle}
            </p>
          )}

        </div>

        {/* ICON */}

        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            ${activeTheme.iconBg}
            ${activeTheme.iconText}
            ${activeTheme.iconBorder}
            transition-all
            duration-300
            group-hover:scale-105
            group-hover:rotate-1
          `}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}

export default DashboardCard;