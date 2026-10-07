
// ==========================================================
// PATIENT TREND CHART
// UI + WEEK PERIOD SELECTION
// Uses shared API service
// ==========================================================

import { useEffect, useState } from "react";
import { Activity, TrendingUp } from "lucide-react";
import api from "../services/api";

export default function PatientTrendChart() {
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState("this_week");
  const [loading, setLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [error, setError] = useState("");

  // ==========================================================
  // FETCH TREND DATA
  // ==========================================================

  useEffect(() => {
    let isActive = true;

    const fetchTrends = async () => {
      setLoading(true);
      setError("");
      setHoveredPoint(null);

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Please log in to view patient trends.");
        }

        const response = await api.get("/dashboard/patient-trends", {
          params: { period },
        });

        if (!isActive) return;

        const trends = response.data?.trends;

        setData(Array.isArray(trends) ? trends : []);
      } catch (err) {
        if (!isActive) return;

        console.error("Failed to load patient trends:", err);
        setData([]);
        setError(
          err.response?.data?.error ||
            err.message ||
            "Failed to load patient trends."
        );
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchTrends();

    return () => {
      isActive = false;
    };
  }, [period]);

  // ==========================================================
  // HEADER
  // ==========================================================

  const renderHeader = () => (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-bold tracking-tight text-slate-900">
            Patient Activity & Consultation Volume
          </h2>

          <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-[#08679f]">
            Live
          </span>
        </div>

        <p className="mt-1 text-[10px] text-slate-400">
          Weekly scheduled appointments and patient traffic
        </p>
      </div>

      <div
        className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1"
        aria-label="Select chart period"
      >
        <button
          type="button"
          onClick={() => setPeriod("this_week")}
          aria-pressed={period === "this_week"}
          className={`rounded-lg px-3 py-1.5 text-[9px] font-bold transition-all duration-200 ${
            period === "this_week"
              ? "bg-white text-[#08679f] shadow-sm"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          This Week
        </button>

        <button
          type="button"
          onClick={() => setPeriod("last_week")}
          aria-pressed={period === "last_week"}
          className={`rounded-lg px-3 py-1.5 text-[9px] font-bold transition-all duration-200 ${
            period === "last_week"
              ? "bg-white text-[#08679f] shadow-sm"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Last Week
        </button>
      </div>
    </div>
  );

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div
        className="h-80 animate-pulse p-5 sm:p-6"
        aria-label="Loading patient trends"
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-44 rounded bg-slate-200" />
            <div className="h-3 w-60 rounded bg-slate-100" />
          </div>

          <div className="h-9 w-28 rounded-xl bg-slate-100" />
        </div>

        <div className="h-55 rounded-2xl bg-slate-50" />
      </div>
    );
  }

  // ==========================================================
  // ERROR OR EMPTY STATE
  // ==========================================================

  const hasData =
    data.length > 0 &&
    data.some((item) => Number(item.count) > 0);

  if (error || !hasData) {
    return (
      <div className="p-5 sm:p-6">
        {renderHeader()}

        <div className="flex h-55 flex-col items-center justify-center px-4 text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-300">
            <Activity className="h-5 w-5" />
          </div>

          <p className="text-xs font-semibold text-slate-500">
            {error
              ? "Unable to load patient trends"
              : "No appointment data available"}
          </p>

          <p className="mt-1 text-[10px] text-slate-400">
            {error ||
              `There are no scheduled appointments for ${
                period === "this_week" ? "this week" : "last week"
              }.`}
          </p>

          {error && (
            <button
              type="button"
              onClick={() => {
                setPeriod((current) => current);
                // Retry using the current period.
                setLoading(true);
                setError("");
              }}
              className="mt-3 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[#08679f] hover:bg-slate-50"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  // ==========================================================
  // CHART CALCULATIONS
  // ==========================================================

  const maxCount = Math.max(
    ...data.map((item) => Number(item.count) || 0),
    5
  );

  const maxVal = Math.ceil(maxCount / 5) * 5;

  const chartHeight = 180;
  const chartWidth = 700;
  const paddingX = 45;
  const paddingY = 20;

  const points = data.map((item, index) => {
    const x =
      paddingX +
      (index * (chartWidth - paddingX * 2)) /
        Math.max(data.length - 1, 1);

    const y =
      chartHeight -
      paddingY -
      ((Number(item.count) || 0) / maxVal) *
        (chartHeight - paddingY * 2);

    return {
      ...item,
      x,
      y,
    };
  });

  const linePath = points.reduce(
    (path, point, index) =>
      index === 0
        ? `M ${point.x} ${point.y}`
        : `${path} L ${point.x} ${point.y}`,
    ""
  );

  const areaPath =
    points.length > 0
      ? `${linePath}
         L ${points[points.length - 1].x} ${chartHeight - paddingY}
         L ${points[0].x} ${chartHeight - paddingY}
         Z`
      : "";

  // ==========================================================
  // CHART UI
  // ==========================================================

  return (
    <div className="p-5 sm:p-6">
      {renderHeader()}

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="h-57.5 w-full overflow-visible"
          preserveAspectRatio="none"
          role="img"
          aria-label="Patient appointment trend chart"
        >
          <defs>
            <linearGradient
              id="patientTrendGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#1685c1"
                stopOpacity="0.22"
              />
              <stop
                offset="100%"
                stopColor="#1685c1"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          {/* GRID */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const value = Math.round(maxVal * ratio);

            const y =
              chartHeight -
              paddingY -
              (value / maxVal) *
                (chartHeight - paddingY * 2);

            return (
              <g key={ratio}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="#e8eef4"
                  strokeWidth="1"
                  strokeDasharray="3 5"
                />

                <text
                  x={paddingX - 10}
                  y={y + 3}
                  fontSize="9"
                  fill="#94a3b8"
                  textAnchor="end"
                >
                  {value}
                </text>
              </g>
            );
          })}

          {/* AREA */}
          <path d={areaPath} fill="url(#patientTrendGradient)" />

          {/* LINE */}
          <path
            d={linePath}
            fill="none"
            stroke="#0877b3"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* DATA POINTS */}
          {points.map((point, index) => (
            <g key={`${point.day}-${index}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r={hoveredPoint === index ? 6 : 4}
                fill="#0877b3"
                stroke="white"
                strokeWidth="3"
                className="transition-all duration-200"
              />

              <circle
                cx={point.x}
                cy={point.y}
                r="18"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(index)}
                onMouseLeave={() => setHoveredPoint(null)}
                onFocus={() => setHoveredPoint(index)}
                onBlur={() => setHoveredPoint(null)}
                tabIndex={0}
                role="button"
                aria-label={`${point.day}: ${point.count} appointments`}
              />

              <text
                x={point.x}
                y={chartHeight - 2}
                fontSize="9"
                fill="#64748b"
                textAnchor="middle"
                fontWeight="600"
              >
                {point.day}
              </text>
            </g>
          ))}
        </svg>

        {/* TOOLTIP */}
        {hoveredPoint !== null && points[hoveredPoint] && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-[10px] text-white shadow-xl"
            style={{
              left: `${(points[hoveredPoint].x / chartWidth) * 100}%`,
              top: `${(points[hoveredPoint].y / chartHeight) * 100 - 7}%`,
            }}
          >
            <div className="mb-0.5 flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3 text-cyan-300" />
              <span className="font-bold">
                {points[hoveredPoint].day}
              </span>
            </div>

            <span className="text-slate-300">
              {points[hoveredPoint].count} appointments
            </span>
          </div>
        )}
      </div>

      {/* LEGEND */}
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-3">
        <div className="flex items-center gap-1.5 text-[9px] font-medium text-slate-500">
          <span className="h-2 w-2 rounded-full bg-[#0877b3]" />
          Patient Appointments
        </div>

        <div className="flex items-center gap-1.5 text-[9px] font-medium text-slate-500">
          <span className="h-2 w-2 rounded-full bg-cyan-300" />
          Clinical Flow
        </div>

        <span className="ml-auto hidden text-[9px] text-slate-400 sm:inline">
          {period === "this_week"
            ? "This week's data"
            : "Last week's data"}
        </span>
      </div>
    </div>
  );
}

