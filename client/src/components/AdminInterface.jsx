import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import axios from "axios";

const roles = ["Admin", "Teacher", "Student"];

export default function AdminInterface() {
  const { user, token, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Student", classId: "" });
  const [classForm, setClassForm] = useState({ name: "", subject: "", teacherId: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      axios.get("https://school-management-theta-brown.vercel.app/api/auth/users", { headers: { Authorization: `Bearer ${token}` } }),
      axios.get("https://school-management-theta-brown.vercel.app/api/classes", { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(([userRes, classRes]) => {
        setUsers(userRes.data);
        setClasses(classRes.data);
      })
      .finally(() => setLoading(false));
  }, [user, token]);

  const openUserForm = (u = null) => {
    setEditUser(u);
    setShowUserForm(true);
    setForm(
      u
        ? { name: u.name, email: u.email, password: "", role: u.role, classId: u.classId || "" }
        : { name: "", email: "", password: "", role: "Student", classId: "" }
    );
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      if (editUser) {
        await axios.put(
          `https://school-management-theta-brown.vercel.app/api/auth/users/${editUser._id}`,
          { ...form },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage("User updated!");
      } else {
        await axios.post(
          "https://school-management-theta-brown.vercel.app/api/auth/register",
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage("User created!");
      }
      setShowUserForm(false);
      const res = await axios.get("https://school-management-theta-brown.vercel.app/api/auth/users", { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
    } catch (err) {
      setMessage(err.response?.data?.error || "Error saving user.");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    setMessage("");
    try {
      await axios.delete(`https://school-management-theta-brown.vercel.app/api/auth/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setMessage("User deleted!");
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      setMessage(err.response?.data?.error || "Error deleting user.");
    }
  };

  const handleClassSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await axios.post(
        "https://school-management-theta-brown.vercel.app/api/classes",
        classForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Class created!");
      setClassForm({ name: "", subject: "", teacherId: "" });
      const res = await axios.get("https://school-management-theta-brown.vercel.app/api/classes", { headers: { Authorization: `Bearer ${token}` } });
      setClasses(res.data);
    } catch (err) {
      setMessage(err.response?.data?.error || "Error creating class.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-pink-100 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-8 mt-8 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-yellow-700 mb-1">Welcome, {user?.name}!</h1>
            <div className="text-gray-500">Admin Interface</div>
          </div>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold shadow transition-transform hover:scale-105"
          >
            Logout
          </button>
        </div>
        {loading ? (
          <div className="text-center text-yellow-600 animate-pulse">Loading...</div>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold text-pink-700">Users</h2>
                <button
                  onClick={() => openUserForm()}
                  className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-bold shadow transition-transform hover:scale-105"
                >
                  + Add User
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded-lg shadow">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border-b">Name</th>
                      <th className="px-4 py-2 border-b">Email</th>
                      <th className="px-4 py-2 border-b">Role</th>
                      <th className="px-4 py-2 border-b">Class</th>
                      <th className="px-4 py-2 border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-yellow-50 transition">
                        <td className="px-4 py-2 border-b">{u.name}</td>
                        <td className="px-4 py-2 border-b">{u.email}</td>
                        <td className={`px-4 py-2 border-b ${
                          u.role === "Admin" ? "text-red-600 font-semibold" :
                          u.role === "Teacher" ? "text-purple-600 font-semibold" :
                          u.role === "Student" ? "text-green-600 font-semibold" : ""
                        }`}>
                          {u.role}
                        </td>
                        <td className="px-4 py-2 border-b">
                          {classes.find((c) => c._id === u.classId)?.name || ""}
                        </td>
                        <td className="px-4 py-2 border-b">
                          <button
                            onClick={() => openUserForm(u)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {showUserForm && (
              <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <form
                  onSubmit={handleUserSubmit}
                  className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md animate-freaky-pop"
                >
                  <h2 className="text-2xl font-bold mb-4 text-pink-700">
                    {editUser ? "Edit User" : "Add User"}
                  </h2>
                  <div className="mb-2">
                    <label className="block font-semibold">Name</label>
                    <input
                      className="w-full px-3 py-2 border rounded"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block font-semibold">Email</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border rounded"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                  {!editUser && (
                    <div className="mb-2">
                      <label className="block font-semibold">Password</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border rounded"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required
                      />
                    </div>
                  )}
                  <div className="mb-2">
                    <label className="block font-semibold">Role</label>
                    <select
                      className="w-full px-3 py-2 border rounded"
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  {form.role === "Student" && (
                    <div className="mb-2">
                      <label className="block font-semibold">Class</label>
                      <select
                        className="w-full px-3 py-2 border rounded"
                        value={form.classId}
                        onChange={(e) => setForm({ ...form, classId: e.target.value })}
                      >
                        <option value="">None</option>
                        {classes.map((c) => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <button
                      type="submit"
                      className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded font-bold"
                    >
                      {editUser ? "Update" : "Create"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUserForm(false)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
                <style>
                  {`
                    .animate-freaky-pop {
                      animation: freaky-pop 0.7s cubic-bezier(.68,-0.55,.27,1.55);
                    }
                    @keyframes freaky-pop {
                      0% { transform: scale(0.2) rotate(-10deg); opacity: 0;}
                      60% { transform: scale(1.1) rotate(3deg);}
                      80% { transform: scale(0.95) rotate(-2deg);}
                      100% { transform: scale(1) rotate(0); opacity: 1;}
                    }
                  `}
                </style>
              </div>
            )}
            <div className="mb-8 mt-12">
              <h2 className="text-xl font-semibold mb-2 text-yellow-700">Classes</h2>
              <form
                onSubmit={handleClassSubmit}
                className="flex flex-wrap gap-2 items-end mb-4"
              >
                <input
                  className="px-3 py-2 border rounded"
                  placeholder="Class Name"
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  required
                />
                <input
                  className="px-3 py-2 border rounded"
                  placeholder="Subject"
                  value={classForm.subject}
                  onChange={(e) => setClassForm({ ...classForm, subject: e.target.value })}
                  required
                />
                <select
                  className="px-3 py-2 border rounded"
                  value={classForm.teacherId}
                  onChange={(e) => setClassForm({ ...classForm, teacherId: e.target.value })}
                  required
                >
                  <option value="">Select Teacher</option>
                  {users.filter((u) => u.role === "Teacher").map((t) => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded font-bold"
                >
                  + Add Class
                </button>
              </form>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded-lg shadow">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border-b">Name</th>
                      <th className="px-4 py-2 border-b">Subject</th>
                      <th className="px-4 py-2 border-b">Teacher</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((c) => (
                      <tr key={c._id} className="hover:bg-pink-50 transition">
                        <td className="px-4 py-2 border-b">{c.name}</td>
                        <td className="px-4 py-2 border-b">{c.subject}</td>
                        <td className="px-4 py-2 border-b">
                          {users.find((u) => u._id === c.teacherId)?.name || ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {message && (
              <div className="mt-4 text-center text-lg font-bold text-pink-700 animate-bounce">
                {message}
              </div>
            )}
          </>
        )}
      </div>
      <style>
        {`
          .animate-fade-in {
            animation: fade-in 1s;
          }
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(40px);}
            to { opacity: 1; transform: translateY(0);}
          }
        `}
      </style>
    </div>
  );
}
