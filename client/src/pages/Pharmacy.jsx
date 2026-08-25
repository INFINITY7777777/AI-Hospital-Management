import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function Pharmacy() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    category: "General",
    stock_quantity: 0,
    unit_price: 0,
    expiry_date: "",
  });

  // Wrap fetchMedicines in useCallback so it can safely be called anywhere
  const fetchMedicines = useCallback(async () => {
    try {
      const res = await api.get("/pharmacy");
      setMedicines(res.data.medicines || []);
    } catch (err) {
      console.error("[Pharmacy Fetch Error]:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
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
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/pharmacy", form);
      setForm({ name: "", category: "General", stock_quantity: 0, unit_price: 0, expiry_date: "" });
      fetchMedicines();
    } catch (err) {
      console.error("[Pharmacy Submit Error]:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this medicine item?")) return;
    try {
      await api.delete(`/pharmacy/${id}`);
      fetchMedicines();
    } catch (err) {
      console.error("[Pharmacy Delete Error]:", err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">💊 Pharmacy Inventory</h1>
              <p className="text-xs text-gray-500">Manage medicine stock, pricing, and expiry records</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-3">
            <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="p-2 border rounded-xl text-xs" />
            <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="p-2 border rounded-xl text-xs" />
            <input required type="number" placeholder="Stock Quantity" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} className="p-2 border rounded-xl text-xs" />
            <input required type="number" step="0.01" placeholder="Unit Price ($)" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} className="p-2 border rounded-xl text-xs" />
            <button type="submit" className="bg-blue-600 text-white rounded-xl text-xs font-semibold py-2 hover:bg-blue-700">Add Item</button>
          </form>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <p className="p-5 text-xs text-gray-400">Loading inventory...</p>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 border-b border-gray-100">
                    <th className="p-4">Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Price</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map((m) => (
                    <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-4 font-semibold text-gray-800">{m.name}</td>
                      <td className="p-4 text-gray-500">{m.category}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${m.stock_quantity < 10 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {m.stock_quantity} units
                        </span>
                      </td>
                      <td className="p-4 font-mono">${Number(m.unit_price).toFixed(2)}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDelete(m.id)} className="text-rose-600 font-semibold hover:underline">Remove</button>
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