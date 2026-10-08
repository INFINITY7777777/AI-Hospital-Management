// ==========================================================
// DASHBOARD CARD
// UI REDESIGN WITH 3D TILT & SPOTLIGHT EFFECT
// ==========================================================

import { useRef, useState } from "react";

function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  onClick,
  color = "blue",
}) {
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cardRotate, setCardRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    setCardRotate({ x: rotateX, y: rotateY });
  };

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

  const activeTheme = colorStyles[color] || colorStyles.blue;

  return (
    <div className="perspective-[1000px]">
      <div
        ref={cardRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setCardRotate({ x: 0, y: 0 });
        }}
        style={{
          transform: isHovered
            ? `rotateX(${cardRotate.x}deg) rotateY(${cardRotate.y}deg) translateZ(8px)`
            : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
          transition: isHovered
            ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
            : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
        }}
        className={`
          group
          relative
          overflow-hidden
          rounded-[20px]
          border
          border-slate-200/80
          bg-white/80
          p-4
          shadow-[0_8px_30px_rgba(15,23,42,0.06)]
          backdrop-blur-xl
          transition-all
          duration-300
          hover:border-[#08679F]/40
          hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)]
          ${activeTheme.glow}
          ${onClick ? "cursor-pointer active:scale-[0.99]" : ""}
        `}
      >
        {/* Dynamic Spotlight Glow Effect */}
        <div
          className="pointer-events-none absolute -inset-px rounded-[20px] opacity-0 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, rgba(8, 103, 159, 0.08), transparent 80%)`,
          }}
        />

        {/* Card Border Light Highlight */}
        <div
          className="pointer-events-none absolute -inset-px rounded-[20px] opacity-0 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(200px circle at ${mousePos.x}px ${mousePos.y}px, rgba(8, 103, 159, 0.25), transparent 100%)`,
            maskImage: "linear-gradient(#black, #black) content-box, linear-gradient(#black, #black)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
            padding: "1px",
          }}
        />

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

        <div className="relative z-10 flex items-start justify-between gap-3">
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
    </div>
  );
}

export default DashboardCard;