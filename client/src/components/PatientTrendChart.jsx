// ==========================================================
// PATIENT TREND CHART
// UI + WEEK PERIOD SELECTION
// Existing API endpoint preserved
// ==========================================================

import { useEffect, useState } from "react";
import axios from "axios";

import {
  Activity,
  TrendingUp,
} from "lucide-react";

export default function PatientTrendChart() {
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState("this_week");
  const [loading, setLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // ==========================================================
  // FETCH TREND DATA
  // ==========================================================

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        setHoveredPoint(null);

        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:5000/api/dashboard/patient-trends",
          {
            params: {
              period,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.trends) {
          setData(res.data.trends);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error(
          "Failed to load patient trends:",
          err
        );

        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, [period]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="h-80 animate-pulse p-5 sm:p-6">
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
  // EMPTY
  // ==========================================================

  const hasData =
    data &&
    data.some(
      (item) => Number(item.count) > 0
    );

  if (!hasData) {
    return (
      <div className="p-5 sm:p-6">
        {/* HEADER */}

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

          {/* PERIOD SELECTOR */}

          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setPeriod("this_week")}
              className={`
                rounded-lg
                px-3
                py-1.5
                text-[9px]
                font-bold
                transition-all
                duration-200
                ${
                  period === "this_week"
                    ? "bg-white text-[#08679f] shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }
              `}
            >
              This Week
            </button>

            <button
              type="button"
              onClick={() => setPeriod("last_week")}
              className={`
                rounded-lg
                px-3
                py-1.5
                text-[9px]
                font-bold
                transition-all
                duration-200
                ${
                  period === "last_week"
                    ? "bg-white text-[#08679f] shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }
              `}
            >
              Last Week
            </button>
          </div>
        </div>

        {/* EMPTY STATE */}

        <div className="flex h-55 flex-col items-center justify-center text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-300">
            <Activity className="h-5 w-5" />
          </div>

          <p className="text-xs font-semibold text-slate-500">
            No appointment data available
          </p>

          <p className="mt-1 text-[10px] text-slate-400">
            There are no scheduled appointments for{" "}
            {period === "this_week"
              ? "this week"
              : "last week"}.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // CHART CALCULATIONS
  // ==========================================================

  const maxCount = Math.max(
    ...data.map((d) => Number(d.count) || 0),
    5
  );

  const maxVal =
    Math.ceil(maxCount / 5) * 5;

  const chartHeight = 180;
  const chartWidth = 700;

  const paddingX = 45;
  const paddingY = 20;

  const points = data.map((item, index) => {
    const x =
      paddingX +
      (index *
        (chartWidth - paddingX * 2)) /
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
    (acc, pt, i) =>
      i === 0
        ? `M ${pt.x} ${pt.y}`
        : `${acc} L ${pt.x} ${pt.y}`,
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
  // UI
  // ==========================================================

  return (
    <div className="p-5 sm:p-6">

      {/* HEADER */}

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

        {/* PERIOD SELECTOR */}

        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">

          <button
            type="button"
            onClick={() => setPeriod("this_week")}
            className={`
              rounded-lg
              px-3
              py-1.5
              text-[9px]
              font-bold
              transition-all
              duration-200
              ${
                period === "this_week"
                  ? "bg-white text-[#08679f] shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }
            `}
          >
            This Week
          </button>

          <button
            type="button"
            onClick={() => setPeriod("last_week")}
            className={`
              rounded-lg
              px-3
              py-1.5
              text-[9px]
              font-bold
              transition-all
              duration-200
              ${
                period === "last_week"
                  ? "bg-white text-[#08679f] shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }
            `}
          >
            Last Week
          </button>

        </div>

      </div>

      {/* CHART */}

      <div className="relative w-full overflow-hidden">

        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="h-57.5 w-full overflow-visible"
          preserveAspectRatio="none"
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

          {[0, 0.25, 0.5, 0.75, 1].map(
            (ratio) => {

              const val = Math.round(
                maxVal * ratio
              );

              const y =
                chartHeight -
                paddingY -
                (val / maxVal) *
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
                    {val}
                  </text>

                </g>
              );
            }
          )}

          {/* AREA */}

          <path
            d={areaPath}
            fill="url(#patientTrendGradient)"
          />

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

          {points.map((pt, i) => (

            <g
              key={i}
              className="cursor-pointer"
            >

              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredPoint === i ? 6 : 4}
                fill="#0877b3"
                stroke="white"
                strokeWidth="3"
                className="transition-all duration-200"
              />

              <circle
                cx={pt.x}
                cy={pt.y}
                r="18"
                fill="transparent"
                onMouseEnter={() =>
                  setHoveredPoint(i)
                }
                onMouseLeave={() =>
                  setHoveredPoint(null)
                }
              />

              <text
                x={pt.x}
                y={chartHeight - 2}
                fontSize="9"
                fill="#64748b"
                textAnchor="middle"
                fontWeight="600"
              >
                {pt.day}
              </text>

            </g>

          ))}

        </svg>

        {/* TOOLTIP */}

        {hoveredPoint !== null && (
          <div
            className="
              pointer-events-none
              absolute
              z-10
              -translate-x-1/2
              -translate-y-full
              rounded-xl
              border
              border-slate-700
              bg-slate-900
              px-3
              py-2
              text-[10px]
              text-white
              shadow-xl
            "
            style={{
              left: `${
                (points[hoveredPoint].x /
                  chartWidth) *
                100
              }%`,
              top: `${
                (points[hoveredPoint].y /
                  chartHeight) *
                  100 -
                7
              }%`,
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