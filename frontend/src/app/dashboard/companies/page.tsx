"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Pencil, Trash2, Building2, Phone, MapPin, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CompaniesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    name: "", npwp: "", address: "", city: "", phone: "", email: "",
    industry: "", admin_email: "", admin_password: "", admin_name: ""
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "super_admin")) {
      router.push("/dashboard");
      return;
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === "super_admin") {
      api.get("/companies").then(({ data }) => { setCompanies(data); setLoading(false); }).catch(() => setLoading(false));
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = editing
      ? { name: form.name, npwp: form.npwp, address: form.address, city: form.city, phone: form.phone, email: form.email, industry: form.industry }
      : form;
    if (editing) await api.put(`/companies/${editing.id}`, payload);
    else await api.post("/companies", payload);
    setShowForm(false); setEditing(null);
    setForm({ name: "", npwp: "", address: "", city: "", phone: "", email: "", industry: "", admin_email: "", admin_password: "", admin_name: "" });
    api.get("/companies").then(({ data }) => setCompanies(data));
  };

  const handleEdit = (c: any) => {
    setForm({ name: c.name, npwp: c.npwp || "", address: c.address || "", city: c.city || "", phone: c.phone || "", email: c.email || "", industry: c.industry || "", admin_email: "", admin_password: "", admin_name: "" });
    setEditing(c); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Yakin hapus perusahaan ini?")) {
      await api.delete(`/companies/${id}`);
      api.get("/companies").then(({ data }) => setCompanies(data));
    }
  };

  if (authLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;
  if (!user || user.role !== "super_admin") return null;

  const statusBadge = (status: string) =>
    status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Perusahaan</h1>
        <button onClick={() => { setEditing(null); setForm({ name: "", npwp: "", address: "", city: "", phone: "", email: "", industry: "", admin_email: "", admin_password: "", admin_name: "" }); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors">
          <Plus size={16} /> Tambah Perusahaan
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold">{editing ? "Edit Perusahaan" : "Tambah Perusahaan"}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-700 text-xl">&times;</button>
            </div>
            <form onSubmit={handleSave} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Perusahaan</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">NPWP</label>
                <input value={form.npwp} onChange={e => setForm({ ...form, npwp: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Industri</label>
                <input value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kota</label>
                <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telepon</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Perusahaan</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Alamat</label>
                <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              {!editing && (
                <>
                  <div className="md:col-span-2 border-t border-slate-200 pt-4 mt-2">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Akun Admin Perusahaan</h4>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nama Admin</label>
                    <input value={form.admin_name} onChange={e => setForm({ ...form, admin_name: e.target.value })} required={!editing} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Admin</label>
                    <input type="email" value={form.admin_email} onChange={e => setForm({ ...form, admin_email: e.target.value })} required={!editing} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password Admin</label>
                    <input type="password" value={form.admin_password} onChange={e => setForm({ ...form, admin_password: e.target.value })} required={!editing} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </>
              )}
              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
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
                <th className="text-left px-4 py-3 font-medium text-slate-600">Nama</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">NPWP</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Kota</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={5} className="text-center py-8 text-slate-400">Memuat...</td></tr> :
                companies.length === 0 ? <tr><td colSpan={5} className="text-center py-8 text-slate-400">Tidak ada data</td></tr> :
                  companies.map((c: any) => (
                    <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 size={14} className="text-slate-400" />
                          {c.name}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <Mail size={10} /> {c.email || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{c.npwp || "-"}</td>
                      <td className="px-4 py-3 flex items-center gap-1"><MapPin size={12} className="text-slate-400" />{c.city || "-"}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(c.status || "active")}`}>{c.status || "active"}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => handleEdit(c)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Pencil size={14} /></button>
                          <button onClick={() => handleDelete(c.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
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
