import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar.jsx";
import MedicalPlusBackground from "../components/MedicalPlusBackground";

export default function Pharmacy() {
  // ==========================================================
  // STATE MANAGEMENT
  // ==========================================================
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Track inline row editing state per item
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    stock_quantity: "",
    unit_price: "",
  });

  // New item entry form state
  const [form, setForm] = useState({
    name: "",
    category: "General",
    stock_quantity: "",
    unit_price: "",
    expiry_date: "",
  });

  // ==========================================================
  // 3D TILT & SPOTLIGHT HOVER ANIMATION STATES (FIXED SYNC)
  // ==========================================================
  // Form Card Hover
  const formCardRef = useRef(null);
  const [formMousePos, setFormMousePos] = useState({ x: 0, y: 0 });
  const [formCardRotate, setFormCardRotate] = useState({ x: 0, y: 0 });
  const [isFormHovered, setIsFormHovered] = useState(false);

  const handleMouseMoveFormCard = (e) => {
    if (!formCardRef.current) return;
    const rect = formCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Accurate spotlight mouse coordinates
    setFormMousePos({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // Align tilt directly with cursor position without inverting mouse Y
    const rotateX = ((y - centerY) / centerY) * 3;
    const rotateY = ((x - centerX) / centerX) * 3;
    setFormCardRotate({ x: rotateX, y: rotateY });
  };

  // Table Card Hover
  const tableCardRef = useRef(null);
  const [tableMousePos, setTableMousePos] = useState({ x: 0, y: 0 });
  const [tableCardRotate, setTableCardRotate] = useState({ x: 0, y: 0 });
  const [isTableHovered, setIsTableHovered] = useState(false);

  const handleMouseMoveTableCard = (e) => {
    if (!tableCardRef.current) return;
    const rect = tableCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Accurate spotlight mouse coordinates
    setTableMousePos({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // Align tilt directly with cursor position without inverting mouse Y
    const rotateX = ((y - centerY) / centerY) * 2;
    const rotateY = ((x - centerX) / centerX) * 2;
    setTableCardRotate({ x: rotateX, y: rotateY });
  };

  // ==========================================================
  // FETCH MEDICINES
  // ==========================================================
  const loadMedicines = async () => {
    try {
      const res = await api.get("/pharmacy");
      setMedicines(res.data.medicines || []);
    } catch (err) {
      console.error("[Pharmacy Fetch Error]:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        const res = await api.get("/pharmacy");
        if (isMounted) {
          setMedicines(res.data.medicines || []);
        }
      } catch (err) {
        console.error("[Pharmacy Load Error]:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  // ==========================================================
  // ADD / UPDATE MEDICINE HANDLER
  // ==========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const addedQty = parseInt(form.stock_quantity, 10) || 0;
    const addedPrice = parseFloat(form.unit_price) || 0.0;

    // Check if an item with the same name and expiry date already exists
    const existingItem = medicines.find(
      (m) =>
        m.name.trim().toLowerCase() === form.name.trim().toLowerCase() &&
        (m.expiry_date ? m.expiry_date.split("T")[0] : "") === form.expiry_date
    );

    try {
      if (existingItem) {
        // Update existing record: Add to quantity & update price
        const updatedPayload = {
          ...existingItem,
          stock_quantity:
            (parseInt(existingItem.stock_quantity, 10) || 0) + addedQty,
          unit_price: addedPrice > 0 ? addedPrice : existingItem.unit_price,
        };
        await api.put(`/pharmacy/${existingItem.id}`, updatedPayload);
      } else {
        // Add as new record
        const payload = {
          ...form,
          stock_quantity: addedQty,
          unit_price: addedPrice,
        };
        await api.post("/pharmacy", payload);
      }

      setForm({
        name: "",
        category: "General",
        stock_quantity: "",
        unit_price: "",
        expiry_date: "",
      });
      await loadMedicines();
    } catch (err) {
      console.error("[Pharmacy Submit Error]:", err);
      alert("Failed to add or update medicine.");
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================
  // DELETE MEDICINE HANDLER
  // ==========================================================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this medicine item?")) return;
    try {
      await api.delete(`/pharmacy/${id}`);
      await loadMedicines();
    } catch (err) {
      console.error("[Pharmacy Delete Error]:", err);
    }
  };

  // ==========================================================
  // INLINE EDITING HANDLERS
  // ==========================================================
  const startEditing = (medicine) => {
    setEditingId(medicine.id);
    setEditForm({
      stock_quantity: medicine.stock_quantity,
      unit_price: medicine.unit_price,
    });
  };

  const handleSaveEdit = async (medicine) => {
    try {
      const payload = {
        ...medicine,
        stock_quantity: parseInt(editForm.stock_quantity, 10) || 0,
        unit_price: parseFloat(editForm.unit_price) || 0.0,
      };
      await api.put(`/pharmacy/${medicine.id}`, payload);
      setEditingId(null);
      await loadMedicines();
    } catch (err) {
      console.error("[Pharmacy Edit Error]:", err);
      alert("Failed to save changes.");
    }
  };

  // ==========================================================
  // FILTER MEDICINES
  // ==========================================================
  const filteredMedicines = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.category &&
        m.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F6F8FC] font-sans antialiased text-slate-900">
      {/* =====================================================
          VERTICALLY CENTERED CIRCULAR MENU OVERRIDE CONTAINER
          Overrides the floating button position & shape without
          modifying any code inside Sidebar.jsx
      ====================================================== */}
      <div className="[&>button]:fixed! [&>button]:top-1/2! [&>button]:left-2! [&>button]:-translate-y-1/2! [&>button]:z-99! [&>button]:h-12! [&>button]:w-12! [&>button]:p-0! [&>button]:justify-center! [&>button]:rounded-full! [&>button]:shadow-xl! [&>button]:bg-[#0b1b32]! [&>button_span]:hidden!">
        <Sidebar />
      </div>

      {/* Interactive Medical + Canvas Hover Background */}
      <MedicalPlusBackground />

      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#08679F]/10 blur-3xl" />
        <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-br from-white/70 via-[#F6F8FC]/60 to-[#F8FAFC]/80" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* =====================================================
            BACK TO DASHBOARD
        ====================================================== */}
        <div>
          <Link
            to="/dashboard"
            className="
              inline-flex items-center gap-2 h-9 px-3.5 rounded-xl
              bg-white/80 border border-slate-200 text-[#08679F] hover:bg-slate-50 hover:border-slate-300
              text-xs font-semibold shadow-xs backdrop-blur-md transition-all duration-150
              active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-slate-200
            "
          >
            <svg
              className="h-4 w-4 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* =====================================================
            HEADER & SEARCH
        ====================================================== */}
        <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Pharmacy Inventory
            </h1>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Manage medicine stock levels, pricing, and expiry schedules.
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full sm:w-72">
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search medicine or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="
                  w-full rounded-xl border border-slate-200 bg-white/80 backdrop-blur-md
                  pl-9 pr-3.5 py-2 text-xs font-medium text-slate-900
                  placeholder:text-slate-400 shadow-sm transition-all duration-150
                  focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10
                "
              />
            </div>
          </div>
        </div>

        {/* =====================================================
            ADD NEW MEDICINE FORM CARD
        ====================================================== */}
        <div className="perspective-[1000px]">
          <form
            ref={formCardRef}
            onMouseMove={handleMouseMoveFormCard}
            onMouseEnter={() => setIsFormHovered(true)}
            onMouseLeave={() => {
              setIsFormHovered(false);
              setFormCardRotate({ x: 0, y: 0 });
            }}
            style={{
              transform: isFormHovered
                ? `rotateX(${formCardRotate.x}deg) rotateY(${formCardRotate.y}deg)`
                : "rotateX(0deg) rotateY(0deg)",
              transition: isFormHovered
                ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
                : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
            }}
            onSubmit={handleSubmit}
            className="relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-colors duration-200 hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)]"
          >
            {/* Dynamic Spotlight Glow effect inside form card */}
            <div
              className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
              style={{
                opacity: isFormHovered ? 1 : 0,
                background: `radial-gradient(500px circle at ${formMousePos.x}px ${formMousePos.y}px, rgba(8, 103, 159, 0.08), transparent 80%)`,
              }}
            />

            <div className="relative z-10 mb-4">
              <h2 className="text-sm font-bold text-slate-900">Add New Inventory Item</h2>
              <p className="text-[11px] font-medium text-slate-400">
                Enter medicine details below. Duplicate items with same expiry will auto-merge stock.
              </p>
            </div>

            <div className="relative z-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6 items-end">
              {/* MEDICINE NAME */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-700">
                  Medicine Name <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  placeholder="e.g. Paracetamol"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="
                    rounded-xl border border-slate-200 bg-white px-3 py-2
                    text-xs font-medium text-slate-900 placeholder:text-slate-400
                    shadow-sm transition-all duration-150
                    focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10
                  "
                />
              </div>

              {/* CATEGORY */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-700">
                  Category
                </label>
                <input
                  placeholder="e.g. Analgesic"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="
                    rounded-xl border border-slate-200 bg-white px-3 py-2
                    text-xs font-medium text-slate-900 placeholder:text-slate-400
                    shadow-sm transition-all duration-150
                    focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10
                  "
                />
              </div>

              {/* STOCK QTY */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-700">
                  Stock Qty <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.stock_quantity}
                  onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                  className="
                    rounded-xl border border-slate-200 bg-white px-3 py-2
                    text-xs font-medium text-slate-900 placeholder:text-slate-400
                    shadow-sm transition-all duration-150
                    focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10
                  "
                />
              </div>

              {/* UNIT PRICE */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-700">
                  Unit Price (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="₹ 0.00"
                  value={form.unit_price}
                  onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
                  className="
                    rounded-xl border border-slate-200 bg-white px-3 py-2
                    text-xs font-medium text-slate-900 placeholder:text-slate-400
                    shadow-sm transition-all duration-150
                    focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10
                  "
                />
              </div>

              {/* EXPIRY DATE */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-700">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={form.expiry_date}
                  onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                  className="
                    rounded-xl border border-slate-200 bg-white px-3 py-2
                    text-xs font-medium text-slate-900
                    shadow-sm transition-all duration-150
                    focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10
                  "
                />
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={submitting}
                className="
                  group relative overflow-hidden inline-flex h-9 items-center justify-center rounded-xl
                  bg-[#08679F] px-4 text-xs font-semibold text-white
                  shadow-md shadow-[#08679F]/20 transition-all duration-300 ease-out
                  hover:-translate-y-0.5 hover:bg-[#07557F] hover:shadow-[0_10px_25px_-5px_rgba(8,103,159,0.4)]
                  active:translate-y-0 active:scale-[0.99]
                  disabled:cursor-not-allowed disabled:opacity-50
                  focus:outline-none focus:ring-4 focus:ring-[#08679F]/20
                "
              >
                <span className="relative z-10">{submitting ? "Processing..." : "Add Item"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* =====================================================
            INVENTORY TABLE CARD
        ====================================================== */}
        <div className="perspective-[1000px]">
          <div
            ref={tableCardRef}
            onMouseMove={handleMouseMoveTableCard}
            onMouseEnter={() => setIsTableHovered(true)}
            onMouseLeave={() => {
              setIsTableHovered(false);
              setTableCardRotate({ x: 0, y: 0 });
            }}
            style={{
              transform: isTableHovered
                ? `rotateX(${tableCardRotate.x}deg) rotateY(${tableCardRotate.y}deg)`
                : "rotateX(0deg) rotateY(0deg)",
              transition: isTableHovered
                ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
                : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
            }}
            className="relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-colors duration-200 hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)]"
          >
            {/* Dynamic Spotlight Glow effect inside table card - perfectly synced */}
            <div
              className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
              style={{
                opacity: isTableHovered ? 1 : 0,
                background: `radial-gradient(600px circle at ${tableMousePos.x}px ${tableMousePos.y}px, rgba(8, 103, 159, 0.08), transparent 80%)`,
              }}
            />

            <div className="relative z-10">
              {loading ? (
                <div className="p-8 text-center text-xs font-medium text-slate-400">
                  Loading pharmacy inventory...
                </div>
              ) : filteredMedicines.length === 0 ? (
                <div className="p-12 text-center text-xs font-medium text-slate-400">
                  {searchQuery
                    ? "No medicines match your search query."
                    : "No medicines found in inventory. Add one using the form above!"}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
                        <th className="py-3.5 px-5">Name</th>
                        <th className="py-3.5 px-5">Category</th>
                        <th className="py-3.5 px-5">Stock</th>
                        <th className="py-3.5 px-5">Price (INR)</th>
                        <th className="py-3.5 px-5">Expiry Date</th>
                        <th className="py-3.5 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredMedicines.map((m) => (
                        <tr
                          key={m.id}
                          className="transition-colors hover:bg-slate-50/60"
                        >
                          <td className="py-3.5 px-5 font-bold text-slate-900">
                            {m.name}
                          </td>
                          <td className="py-3.5 px-5 font-medium text-slate-500">
                            {m.category || "General"}
                          </td>

                          {/* Editable Stock */}
                          <td className="py-3.5 px-5">
                            {editingId === m.id ? (
                              <input
                                type="number"
                                min="0"
                                value={editForm.stock_quantity}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    stock_quantity: e.target.value,
                                  })
                                }
                                className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-900 focus:border-[#08679F] focus:outline-none"
                              />
                            ) : (
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
                                  m.stock_quantity < 10
                                    ? "border-rose-200/80 bg-rose-50 text-rose-700"
                                    : "border-emerald-200/80 bg-emerald-50 text-emerald-700"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    m.stock_quantity < 10
                                      ? "bg-rose-500"
                                      : "bg-emerald-500"
                                  }`}
                                />
                                {m.stock_quantity} units
                              </span>
                            )}
                          </td>

                          {/* Editable Unit Price */}
                          <td className="py-3.5 px-5 font-mono text-xs font-semibold text-slate-800">
                            {editingId === m.id ? (
                              <div className="flex items-center gap-1">
                                <span className="text-slate-400">₹</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={editForm.unit_price}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      unit_price: e.target.value,
                                    })
                                  }
                                  className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-900 focus:border-[#08679F] focus:outline-none"
                                />
                              </div>
                            ) : (
                              `₹${Number(m.unit_price || 0).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            )}
                          </td>

                          <td className="py-3.5 px-5 font-medium text-slate-500">
                            {m.expiry_date
                              ? new Date(m.expiry_date).toLocaleDateString("en-IN")
                              : "N/A"}
                          </td>

                          {/* Row Action Buttons */}
                          <td className="py-3.5 px-5 text-right font-semibold space-x-2">
                            {editingId === m.id ? (
                              <>
                                <button
                                  onClick={() => handleSaveEdit(m)}
                                  className="text-emerald-600 hover:text-emerald-700 hover:underline"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="text-slate-400 hover:text-slate-600 hover:underline"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEditing(m)}
                                  className="text-[#08679F] hover:text-[#07557F] hover:underline"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(m.id)}
                                  className="text-rose-600 hover:text-rose-700 hover:underline"
                                >
                                  Remove
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}