
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ShieldCheck,
  Trash2,
  Building,
  Mail,
  User,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import api from "../services/api";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [deactivatingUserId, setDeactivatingUserId] = useState(null);

  const navigate = useNavigate();

  const getErrorMessage = (error, fallback) =>
    error.response?.data?.error ||
    error.response?.data?.message ||
    fallback;

  const fetchUsers = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setRefreshing(true);
    }

    setErrorMsg("");

    try {
      const response = await api.get("/admin/users");

      if (!Array.isArray(response.data)) {
        throw new Error("Unexpected response received while loading users.");
      }

      setUsers(response.data);
    } catch (error) {
      console.error("Failed to load users:", error);
      setErrorMsg(
        getErrorMessage(error, "Failed to load active users.")
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
  const timeoutId = setTimeout(() => {
    fetchUsers();
  }, 0);

  return () => clearTimeout(timeoutId);
}, [fetchUsers]);

  const refreshUsers = () => {
    fetchUsers(true);
  };

  const handleRoleChange = async (userId, newRole) => {
    const currentUser = users.find((user) => user.id === userId);

    if (!currentUser || currentUser.role === newRole) {
      return;
    }

    setUpdatingUserId(userId);
    setErrorMsg("");

    try {
      await api.patch(`/admin/users/${userId}/role`, {
        role: newRole,
      });

      await fetchUsers();
    } catch (error) {
      console.error("Failed to update user role:", error);

      setErrorMsg(
        getErrorMessage(error, "Failed to update role.")
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeactivate = async (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this user account?"
    );

    if (!confirmed) {
      return;
    }

    setDeactivatingUserId(userId);
    setErrorMsg("");

    try {
      await api.delete(`/admin/users/${userId}`);

      await fetchUsers();
    } catch (error) {
      console.error("Failed to deactivate user:", error);

      setErrorMsg(
        getErrorMessage(error, "Failed to deactivate user.")
      );
    } finally {
      setDeactivatingUserId(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto my-6 max-w-6xl rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#08679F] border-t-transparent" />
        <p className="mt-2 text-xs font-medium text-slate-500">
          Loading active users...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 font-sans">
      {/* Back to dashboard */}
      <div>
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 rounded-xl bg-[#08679F] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-[#07557F] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-[#08679F]/20"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
      </div>

      {/* Page header */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#08679F]" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              User &amp; Role Management
            </h1>
          </div>

          <p className="mt-1 text-xs font-medium text-slate-500">
            Manage active medical staff, system authorizations, and account
            states
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshUsers}
            type="button"
            disabled={refreshing}
            className="rounded-xl bg-slate-100 p-2 text-slate-600 transition-all hover:bg-slate-200/80 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            title="Refresh List"
            aria-label="Refresh users"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-sky-50 px-3.5 py-1.5 text-xs font-bold text-[#08679F] shadow-sm">
            <ShieldCheck className="h-4 w-4" />
            Total Active: {users.length}
          </span>
        </div>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-rose-200/80 bg-rose-50 p-4 text-xs font-semibold text-rose-800 shadow-sm"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={() => setErrorMsg("")}
            className="ml-auto text-rose-700 underline underline-offset-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Users table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="p-4">User Details</th>
                <th className="p-4">Email</th>
                <th className="p-4">Department</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="transition-colors hover:bg-slate-50/80"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-100 bg-sky-50 text-[#08679F]">
                        <User className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="font-bold text-slate-900">
                          {user.full_name}
                        </p>
                        <p className="text-[10px] font-medium text-slate-400">
                          ID: #{user.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 font-medium text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span>{user.email}</span>
                    </div>
                  </td>

                  <td className="p-4 font-medium text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5 text-slate-400" />
                      <span>{user.department || "N/A"}</span>
                    </div>
                  </td>

                  <td className="p-4">
                    <select
                      value={user.role}
                      disabled={
                        updatingUserId === user.id ||
                        deactivatingUserId === user.id
                      }
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      aria-label={`Role for ${user.full_name}`}
                      className="h-8 cursor-pointer rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-semibold capitalize text-slate-700 focus:border-[#08679F] focus:outline-none focus:ring-1 focus:ring-[#08679F] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="admin">Admin</option>
                      <option value="doctor">Doctor</option>
                      <option value="nurse">Nurse</option>
                      <option value="staff">Staff</option>
                      <option value="support staff">Support Staff</option>
                    </select>

                    {updatingUserId === user.id && (
                      <span className="ml-2 text-[10px] text-slate-500">
                        Saving...
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-center">
                    <button
                      type="button"
                      disabled={
                        deactivatingUserId === user.id ||
                        updatingUserId === user.id
                      }
                      onClick={() => handleDeactivate(user.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200/80 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 transition-all hover:bg-rose-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>
                        {deactivatingUserId === user.id
                          ? "Deactivating..."
                          : "Deactivate"}
                      </span>
                    </button>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-xs font-medium text-slate-400"
                  >
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

