import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function Pharmacy() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Track editing state per item
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ stock_quantity: "", unit_price: "" });

  const [form, setForm] = useState({
    name: "",
    category: "General",
    stock_quantity: "",
    unit_price: "",
    expiry_date: "",
  });

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
          stock_quantity: (parseInt(existingItem.stock_quantity, 10) || 0) + addedQty,
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

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this medicine item?")) return;
    try {
      await api.delete(`/pharmacy/${id}`);
      await loadMedicines();
    } catch (err) {
      console.error("[Pharmacy Delete Error]:", err);
    }
  };

  // Start row editing
  const startEditing = (medicine) => {
    setEditingId(medicine.id);
    setEditForm({
      stock_quantity: medicine.stock_quantity,
      unit_price: medicine.unit_price,
    });
  };

  // Save inline edit
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

  // Filter medicines by search query
  const filteredMedicines = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.category && m.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-2xl border border-gray-100 shadow-sm gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">💊 Pharmacy Inventory</h1>
              <p className="text-xs text-gray-500 mt-1">
                Manage medicine stock, pricing, and expiry records
              </p>
            </div>

            {/* Search Bar */}
            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="🔍 Search medicine or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 items-end"
          >
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Medicine Name
              </label>
              <input
                required
                placeholder="e.g. Paracetamol"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="p-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Category
              </label>
              <input
                placeholder="e.g. Analgesic"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="p-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Stock Qty
              </label>
              <input
                required
                type="number"
                min="0"
                placeholder="0"
                value={form.stock_quantity}
                onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                className="p-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Unit Price (₹)
              </label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                placeholder="₹ 0.00"
                value={form.unit_price}
                onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
                className="p-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                <span>📅 Expiry Date</span>
              </label>
              <input
                type="date"
                value={form.expiry_date}
                onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                className="p-2 border border-blue-200 bg-blue-50/30 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold h-9 transition flex items-center justify-center"
            >
              {submitting ? "Processing..." : "Add Item"}
            </button>
          </form>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <p className="p-5 text-xs text-gray-400">Loading inventory...</p>
            ) : filteredMedicines.length === 0 ? (
              <p className="p-8 text-center text-xs text-gray-400">
                {searchQuery ? "No medicines match your search." : "No medicines found in inventory. Add one above!"}
              </p>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 border-b border-gray-100">
                    <th className="p-4">Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Price (INR)</th>
                    <th className="p-4">Expiry Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMedicines.map((m) => (
                    <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="p-4 font-semibold text-gray-800">{m.name}</td>
                      <td className="p-4 text-gray-500">{m.category || "General"}</td>
                      
                      {/* Editable Stock */}
                      <td className="p-4">
                        {editingId === m.id ? (
                          <input
                            type="number"
                            min="0"
                            value={editForm.stock_quantity}
                            onChange={(e) => setEditForm({ ...editForm, stock_quantity: e.target.value })}
                            className="w-20 p-1 border border-gray-300 rounded text-xs"
                          />
                        ) : (
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${
                              m.stock_quantity < 10
                                ? "bg-rose-100 text-rose-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {m.stock_quantity} units
                          </span>
                        )}
                      </td>

                      {/* Editable Unit Price */}
                      <td className="p-4 font-mono text-gray-700 font-medium">
                        {editingId === m.id ? (
                          <div className="flex items-center gap-1">
                            <span>₹</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editForm.unit_price}
                              onChange={(e) => setEditForm({ ...editForm, unit_price: e.target.value })}
                              className="w-20 p-1 border border-gray-300 rounded text-xs"
                            />
                          </div>
                        ) : (
                          `₹${Number(m.unit_price || 0).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        )}
                      </td>

                      <td className="p-4 text-gray-500">
                        {m.expiry_date
                          ? new Date(m.expiry_date).toLocaleDateString("en-IN")
                          : "N/A"}
                      </td>

                      {/* Row Action Buttons */}
                      <td className="p-4 text-right space-x-2">
                        {editingId === m.id ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(m)}
                              className="text-emerald-600 font-semibold hover:underline"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-gray-400 font-semibold hover:underline"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(m)}
                              className="text-blue-600 font-semibold hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(m.id)}
                              className="text-rose-600 font-semibold hover:underline"
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
            )}
          </div>
        </main>
      </div>
    </div>
  );
}