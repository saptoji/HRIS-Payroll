"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Pencil, Trash2, Shield } from "lucide-react";

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ email: "", password: "", full_name: "", role: "employee" });

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await api.get("/users");
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) await api.put(`/users/${editing.id}`, { email: form.email, full_name: form.full_name, role: form.role });
    else await api.post("/users", form);
    setShowForm(false); setEditing(null);
    setForm({ email: "", password: "", full_name: "", role: "employee" });
    fetchUsers();
  };

  const handleEdit = (u: any) => {
    setForm({ email: u.email, password: "", full_name: u.full_name, role: u.role });
    setEditing(u); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Yakin hapus pengguna ini?")) { await api.delete(`/users/${id}`); fetchUsers(); }
  };

  const roleBadge = (role: string) => {
    const map: Record<string, string> = {
      super_admin: "bg-purple-100 text-purple-700",
      company_admin: "bg-blue-100 text-blue-700",
      manager: "bg-green-100 text-green-700",
      employee: "bg-gray-100 text-gray-700",
    };
    return map[role] || "bg-gray-100 text-gray-700";
  };

  const roleLabel = (role: string) => {
    const map: Record<string, string> = {
      super_admin: "Super Admin",
      company_admin: "Admin",
      manager: "Manager",
      employee: "Karyawan",
    };
    return map[role] || role;
  };

  const formatDate = (d: string | null) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Pengguna</h1>
        <button onClick={() => { setEditing(null); setForm({ email: "", password: "", full_name: "", role: "employee" }); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors">
          <Plus size={16} /> Tambah Pengguna
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold">{editing ? "Edit Pengguna" : "Tambah Pengguna"}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-700 text-xl">&times;</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              {!editing && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none">
                  <option value="employee">Karyawan</option>
                  <option value="manager">Manager</option>
                  <option value="company_admin">Admin</option>
                  {currentUser?.role === "super_admin" && <option value="super_admin">Super Admin</option>}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Nama</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Role</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Perusahaan</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Login Terakhir</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="text-center py-8 text-slate-400">Memuat...</td></tr> :
                users.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-slate-400">Tidak ada data</td></tr> :
                  users.map((u: any) => (
                    <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{u.email}</td>
                      <td className="px-4 py-3">{u.full_name}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleBadge(u.role)}`}>{roleLabel(u.role)}</span></td>
                      <td className="px-4 py-3">{u.company?.name || "-"}</td>
                      <td className="px-4 py-3 text-xs">{formatDate(u.last_login)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.is_active !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {u.is_active !== false ? "Aktif" : "Nonaktif"}
                          </span>
                          <div className="flex gap-1">
                            <button onClick={() => handleEdit(u)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Pencil size={12} /></button>
                            <button onClick={() => handleDelete(u.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={12} /></button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
