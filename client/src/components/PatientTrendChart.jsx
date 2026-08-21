import { useState, useEffect } from "react";
import axios from "axios";

export default function PatientTrendChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/dashboard/patient-trends", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.trends) {
          setData(res.data.trends);
        }
      } catch (err) {
        console.error("Failed to load patient trends:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm h-64 flex items-center justify-center">
        <p className="text-xs text-gray-400 animate-pulse">Loading trend data...</p>
      </div>
    );
  }

  // Fallback if no data is returned
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm h-64 flex items-center justify-center">
        <p className="text-xs text-gray-400">No trend data available for this week.</p>
      </div>
    );
  }

  // Dynamically scale Y-axis according to max count
  const maxCount = Math.max(...data.map((d) => d.count), 5);
  const maxVal = Math.ceil(maxCount / 5) * 5; // Rounds up to nearest multiple of 5

  const chartHeight = 150;
  const chartWidth = 500;
  const paddingX = 40;
  const paddingY = 20;

  // Calculate coordinates for SVG points
  const points = data.map((item, index) => {
    const x = paddingX + (index * (chartWidth - paddingX * 2)) / (data.length - 1);
    const y = chartHeight - paddingY - (item.count / maxVal) * (chartHeight - paddingY * 2);
    return { ...item, x, y };
  });

  const linePath = points.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ""
  );

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Patient Traffic Trends</h2>
          <p className="text-xs text-gray-500">Weekly scheduled appointments</p>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-48 overflow-visible">
          <defs>
            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const val = Math.round(maxVal * ratio);
            const y = chartHeight - paddingY - (val / maxVal) * (chartHeight - paddingY * 2);
            return (
              <g key={ratio}>
                <line x1={paddingX} y1={y} x2={chartWidth - paddingX} y2={y} stroke="#f3f4f6" strokeWidth="1" />
                <text x={paddingX - 10} y={y + 3} fontSize="10" fill="#9ca3af" textAnchor="end">
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaPath} fill="url(#blueGradient)" />

          {/* Smooth Line */}
          <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points */}
          {points.map((pt, i) => (
            <g key={i} className="cursor-pointer">
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredPoint === i ? "6" : "4"}
                className="fill-blue-600 stroke-white stroke-2 transition-all duration-150"
              />
              <circle
                cx={pt.x}
                cy={pt.y}
                r="15"
                fill="transparent"
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              <text x={pt.x} y={chartHeight - 2} fontSize="11" fill="#6b7280" textAnchor="middle" fontWeight="500">
                {pt.day}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint !== null && (
          <div
            className="absolute bg-gray-900 text-white text-[11px] py-1 px-2.5 rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all"
            style={{
              left: `${(points[hoveredPoint].x / chartWidth) * 100}%`,
              top: `${(points[hoveredPoint].y / chartHeight) * 100 - 10}%`,
            }}
          >
            <span className="font-semibold">{points[hoveredPoint].day}:</span> {points[hoveredPoint].count} appts
          </div>
        )}
      </div>
    </div>
  );
}