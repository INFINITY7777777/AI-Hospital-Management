import { useEffect, useState } from "react";
import axios from "axios";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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
          alert(err.response?.data?.error || "Failed to load active users.");
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
      alert("Role updated successfully!");
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
      alert("User deactivated successfully!");
      refreshUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to deactivate user.");
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Loading active users...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">User & Role Management</h1>
        <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
          Total Active: {users.length}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Department</th>
              <th className="p-4">Role</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition">
                <td className="p-4 font-medium text-slate-900">{user.full_name}</td>
                <td className="p-4 text-slate-600">{user.email}</td>
                <td className="p-4 text-slate-600">{user.department || "N/A"}</td>
                <td className="p-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="border border-slate-300 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium text-slate-700 capitalize"
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
                    className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-md text-xs font-semibold transition"
                  >
                    Deactivate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManagement;