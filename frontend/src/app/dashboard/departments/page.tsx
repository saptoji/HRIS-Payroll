"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", code: "", parent_id: "", description: "" });
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const fetchDepartments = async () => {
    setLoading(true);
    const { data } = await api.get("/departments");
    setDepartments(data);
    setLoading(false);
  };

  useEffect(() => { fetchDepartments(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, parent_id: form.parent_id || null };
    if (editing) await api.put(`/departments/${editing.id}`, payload);
    else await api.post("/departments", payload);
    setShowForm(false);
    setEditing(null);
    setForm({ name: "", code: "", parent_id: "", description: "" });
    fetchDepartments();
  };

  const handleEdit = (dept: any) => {
    setForm({ name: dept.name, code: dept.code, parent_id: dept.parent_id || "", description: dept.description || "" });
    setEditing(dept);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Yakin hapus departemen ini?")) {
      await api.delete(`/departments/${id}`);
      fetchDepartments();
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const parentOptions = departments.filter(d => (editing ? d.id !== editing.id : true));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Departemen</h1>
        <button onClick={() => { setEditing(null); setForm({ name: "", code: "", parent_id: "", description: "" }); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors">
          <Plus size={16} /> Tambah Departemen
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold">{editing ? "Edit Departemen" : "Tambah Departemen"}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-700 text-xl">&times;</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kode</label>
                <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Departemen Induk</label>
                <select value={form.parent_id} onChange={e => setForm({ ...form, parent_id: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none">
                  <option value="">Tidak Ada</option>
                  {parentOptions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
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
                <th className="text-left px-4 py-3 font-medium text-slate-600 w-10"></th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Nama</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Kode</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Departemen Induk</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="text-center py-8 text-slate-400">Memuat...</td></tr> :
                departments.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-slate-400">Tidak ada data</td></tr> :
                  departments.map((dept: any) => (
                    <tr key={dept.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <button onClick={() => toggleExpand(dept.id)} className="text-slate-400 hover:text-slate-600">
                          {expandedRows.has(dept.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-medium">{dept.name}</td>
                      <td className="px-4 py-3 font-mono text-xs">{dept.code}</td>
                      <td className="px-4 py-3">{dept.parent?.name || "-"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${dept.is_active !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {dept.is_active !== false ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => handleEdit(dept)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Pencil size={14} /></button>
                          <button onClick={() => handleDelete(dept.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
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
