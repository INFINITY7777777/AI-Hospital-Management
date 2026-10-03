import { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  ShieldCheck,
  Trash2,
  Building,
  Mail,
  User,
  RefreshCw,
  AlertCircle
} from "lucide-react";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const token = localStorage.getItem("token");

  // Fetch logic directly in useEffect to satisfy React's strict effect rules
  useEffect(() => {
    let isMounted = true;

    const getUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (isMounted) {
          setUsers(res.data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error(err);
          setErrorMsg(err.response?.data?.error || "Failed to load active users.");
          setLoading(false);
        }
      }
    };

    getUsers();

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Helper for manual re-fetching after actions
  const refreshUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/admin/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      refreshUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to update role.");
    }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm("Are you sure you want to deactivate this user account?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      refreshUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to deactivate user.");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.04)] max-w-6xl mx-auto my-6">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#08679F] border-t-transparent"></div>
        <p className="mt-2 text-xs font-medium text-slate-500">Loading active users...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#08679F]" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              User & Role Management
            </h1>
          </div>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Manage active medical staff, system authorizations, and account states
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshUsers}
            type="button"
            className="p-2 bg-slate-100 hover:bg-slate-200/80 text-slate-600 rounded-xl transition-all active:scale-95"
            title="Refresh List"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <span className="inline-flex items-center gap-1.5 bg-sky-50 text-[#08679F] border border-sky-100 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs">
            <ShieldCheck className="h-4 w-4" />
            Total Active: {users.length}
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-4 bg-rose-50 text-rose-800 text-xs font-semibold rounded-xl border border-rose-200/80 shadow-sm">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-4">User Details</th>
                <th className="p-4">Email</th>
                <th className="p-4">Department</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-[#08679F]">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{user.full_name}</p>
                        <p className="text-[10px] font-medium text-slate-400">ID: #{user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span>{user.email}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5 text-slate-400" />
                      <span>{user.department || "N/A"}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="h-8 border border-slate-300 rounded-lg px-2.5 text-xs font-semibold text-slate-700 bg-white focus:border-[#08679F] focus:outline-none focus:ring-1 focus:ring-[#08679F] capitalize cursor-pointer"
                    >
                      <option value="admin">Admin</option>
                      <option value="doctor">Doctor</option>
                      <option value="nurse">Nurse</option>
                      <option value="staff">Staff</option>
                      <option value="support staff">Support Staff</option>
                    </select>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleDeactivate(user.id)}
                      className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Deactivate</span>
                    </button>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-medium text-xs">
                    No active user accounts found in system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;