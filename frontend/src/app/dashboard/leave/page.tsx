"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Plus, Pencil, Trash2, CheckCircle, XCircle, Calendar, Clock } from "lucide-react";

export default function LeavePage() {
  const [tab, setTab] = useState<"types" | "requests">("types");

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Cuti</h1>
        <div className="flex bg-slate-100 rounded-lg p-1 text-sm">
          <button onClick={() => setTab("types")} className={`px-4 py-2 rounded-md transition-colors ${tab === "types" ? "bg-white shadow-sm font-medium text-slate-800" : "text-slate-500 hover:text-slate-700"}`}>Jenis Cuti</button>
          <button onClick={() => setTab("requests")} className={`px-4 py-2 rounded-md transition-colors ${tab === "requests" ? "bg-white shadow-sm font-medium text-slate-800" : "text-slate-500 hover:text-slate-700"}`}>Permintaan Cuti</button>
        </div>
      </div>

      {tab === "types" ? <LeaveTypesTab /> : <LeaveRequestsTab />}
    </div>
  );
}

function LeaveTypesTab() {
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", default_quota: 12, is_paid: true });

  const fetchTypes = async () => {
    setLoading(true);
    const { data } = await api.get("/leave-types");
    setTypes(data);
    setLoading(false);
  };

  useEffect(() => { fetchTypes(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) await api.put(`/leave-types/${editing.id}`, form);
    else await api.post("/leave-types", form);
    setShowForm(false); setEditing(null);
    setForm({ name: "", default_quota: 12, is_paid: true });
    fetchTypes();
  };

  const handleEdit = (t: any) => {
    setForm({ name: t.name, default_quota: t.default_quota, is_paid: t.is_paid !== false });
    setEditing(t); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Yakin hapus jenis cuti ini?")) { await api.delete(`/leave-types/${id}`); fetchTypes(); }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => { setEditing(null); setForm({ name: "", default_quota: 12, is_paid: true }); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors">
          <Plus size={16} /> Tambah Jenis Cuti
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold">{editing ? "Edit Jenis Cuti" : "Tambah Jenis Cuti"}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-700 text-xl">&times;</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kuota Default (hari)</label>
                <input type="number" min="1" value={form.default_quota} onChange={e => setForm({ ...form, default_quota: Number(e.target.value) })} required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="is_paid" checked={form.is_paid} onChange={e => setForm({ ...form, is_paid: e.target.checked })} className="rounded border-slate-300" />
                <label htmlFor="is_paid" className="text-sm text-slate-700">Cuti Berbayar</label>
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
                <th className="text-left px-4 py-3 font-medium text-slate-600">Nama</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Kuota Default</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Berbayar</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={4} className="text-center py-8 text-slate-400">Memuat...</td></tr> :
                types.length === 0 ? <tr><td colSpan={4} className="text-center py-8 text-slate-400">Tidak ada data</td></tr> :
                  types.map((t: any) => (
                    <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{t.name}</td>
                      <td className="px-4 py-3 text-center">{t.default_quota} hari</td>
                      <td className="px-4 py-3 text-center">{t.is_paid !== false ? <span className="text-green-600">Ya</span> : <span className="text-red-600">Tidak</span>}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => handleEdit(t)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Pencil size={14} /></button>
                          <button onClick={() => handleDelete(t.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
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

function LeaveRequestsTab() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    const { data } = await api.get("/leave-requests");
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleApprove = async (id: string) => {
    await api.post(`/leave-requests/${id}/approve`);
    fetchRequests();
  };

  const handleReject = async (id: string) => {
    await api.post(`/leave-requests/${id}/reject`);
    fetchRequests();
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    };
    return `${map[status] || "bg-gray-100 text-gray-700"} px-2 py-0.5 rounded-full text-xs font-medium`;
  };

  const statusLabel = (status: string) => {
    const map: Record<string, string> = { pending: "Menunggu", approved: "Disetujui", rejected: "Ditolak" };
    return map[status] || status;
  };

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Karyawan</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Jenis Cuti</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Tanggal</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Durasi</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="text-center py-8 text-slate-400">Memuat...</td></tr> :
                requests.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-slate-400">Tidak ada data</td></tr> :
                  requests.map((r: any) => (
                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{r.employee?.first_name} {r.employee?.last_name}</td>
                      <td className="px-4 py-3">{r.leave_type?.name || "-"}</td>
                      <td className="px-4 py-3 text-xs">{r.start_date} s/d {r.end_date}</td>
                      <td className="px-4 py-3 text-center">{r.duration || 0} hari</td>
                      <td className="px-4 py-3"><span className={statusBadge(r.status)}>{statusLabel(r.status)}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          {r.status === "pending" && (
                            <>
                              <button onClick={() => handleApprove(r.id)} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs flex items-center gap-1 hover:bg-green-200"><CheckCircle size={12} /> Setujui</button>
                              <button onClick={() => handleReject(r.id)} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs flex items-center gap-1 hover:bg-red-200"><XCircle size={12} /> Tolak</button>
                            </>
                          )}
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
