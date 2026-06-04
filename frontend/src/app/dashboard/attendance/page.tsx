"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Plus, Pencil, Trash2, Upload, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function AttendancePage() {
  const [tab, setTab] = useState<"shifts" | "records">("shifts");

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Kehadiran</h1>
        <div className="flex bg-slate-100 rounded-lg p-1 text-sm">
          <button onClick={() => setTab("shifts")} className={`px-4 py-2 rounded-md transition-colors ${tab === "shifts" ? "bg-white shadow-sm font-medium text-slate-800" : "text-slate-500 hover:text-slate-700"}`}>Shift</button>
          <button onClick={() => setTab("records")} className={`px-4 py-2 rounded-md transition-colors ${tab === "records" ? "bg-white shadow-sm font-medium text-slate-800" : "text-slate-500 hover:text-slate-700"}`}>Kehadiran</button>
        </div>
      </div>

      {tab === "shifts" ? <ShiftsTab /> : <AttendanceTab />}
    </div>
  );
}

function ShiftsTab() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", start_time: "", end_time: "", is_overnight: false });

  const fetchShifts = async () => {
    setLoading(true);
    const { data } = await api.get("/shifts");
    setShifts(data);
    setLoading(false);
  };

  useEffect(() => { fetchShifts(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) await api.put(`/shifts/${editing.id}`, form);
    else await api.post("/shifts", form);
    setShowForm(false); setEditing(null);
    setForm({ name: "", start_time: "", end_time: "", is_overnight: false });
    fetchShifts();
  };

  const handleEdit = (s: any) => {
    setForm({ name: s.name, start_time: s.start_time, end_time: s.end_time, is_overnight: s.is_overnight || false });
    setEditing(s); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Yakin hapus shift ini?")) { await api.delete(`/shifts/${id}`); fetchShifts(); }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => { setEditing(null); setForm({ name: "", start_time: "", end_time: "", is_overnight: false }); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors">
          <Plus size={16} /> Tambah Shift
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold">{editing ? "Edit Shift" : "Tambah Shift"}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-700 text-xl">&times;</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Shift</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jam Mulai</label>
                <input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jam Selesai</label>
                <input type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="is_overnight" checked={form.is_overnight} onChange={e => setForm({ ...form, is_overnight: e.target.checked })} className="rounded border-slate-300" />
                <label htmlFor="is_overnight" className="text-sm text-slate-700">Lintas Hari (Overnight)</label>
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
                <th className="text-left px-4 py-3 font-medium text-slate-600">Jam Mulai</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Jam Selesai</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Lintas Hari</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={5} className="text-center py-8 text-slate-400">Memuat...</td></tr> :
                shifts.length === 0 ? <tr><td colSpan={5} className="text-center py-8 text-slate-400">Tidak ada data</td></tr> :
                  shifts.map((s: any) => (
                    <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{s.name}</td>
                      <td className="px-4 py-3 font-mono">{s.start_time}</td>
                      <td className="px-4 py-3 font-mono">{s.end_time}</td>
                      <td className="px-4 py-3">{s.is_overnight ? <span className="text-blue-600 text-xs">Ya</span> : "Tidak"}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => handleEdit(s)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Pencil size={14} /></button>
                          <button onClick={() => handleDelete(s.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
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

function AttendanceTab() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [bulkEntries, setBulkEntries] = useState<any[]>([{ employee_id: "", date: "", check_in: "", check_out: "", status: "present" }]);

  const fetchRecords = async () => {
    setLoading(true);
    const { data } = await api.get("/attendance");
    setRecords(data);
    setLoading(false);
  };

  useEffect(() => { fetchRecords(); }, []);

  const addBulkRow = () => {
    setBulkEntries([...bulkEntries, { employee_id: "", date: "", check_in: "", check_out: "", status: "present" }]);
  };

  const removeBulkRow = (idx: number) => {
    setBulkEntries(bulkEntries.filter((_, i) => i !== idx));
  };

  const updateBulkRow = (idx: number, field: string, value: string) => {
    const updated = [...bulkEntries];
    updated[idx] = { ...updated[idx], [field]: value };
    setBulkEntries(updated);
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/attendance/bulk", { records: bulkEntries });
    setShowUpload(false);
    setBulkEntries([{ employee_id: "", date: "", check_in: "", check_out: "", status: "present" }]);
    fetchRecords();
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { cls: string; icon: any; label: string }> = {
      present: { cls: "bg-green-100 text-green-700", icon: CheckCircle, label: "Hadir" },
      late: { cls: "bg-yellow-100 text-yellow-700", icon: AlertCircle, label: "Terlambat" },
      absent: { cls: "bg-red-100 text-red-700", icon: XCircle, label: "Tidak Hadir" },
      half_day: { cls: "bg-orange-100 text-orange-700", icon: Clock, label: "Setengah Hari" },
    };
    const s = map[status] || map.present;
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span>;
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowUpload(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors">
          <Upload size={16} /> Upload Bulk
        </button>
      </div>

      {showUpload && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold">Upload Bulk Kehadiran</h3>
              <button onClick={() => setShowUpload(false)} className="text-slate-500 hover:text-slate-700 text-xl">&times;</button>
            </div>
            <form onSubmit={handleBulkUpload} className="p-6">
              <div className="space-y-3 mb-4">
                {bulkEntries.map((entry, idx) => (
                  <div key={idx} className="grid grid-cols-5 gap-2 items-center bg-slate-50 p-3 rounded-lg">
                    <input placeholder="Employee ID" value={entry.employee_id} onChange={e => updateBulkRow(idx, "employee_id", e.target.value)} required className="px-2 py-1.5 border border-slate-300 rounded text-sm outline-none" />
                    <input type="date" value={entry.date} onChange={e => updateBulkRow(idx, "date", e.target.value)} required className="px-2 py-1.5 border border-slate-300 rounded text-sm outline-none" />
                    <input type="time" value={entry.check_in} onChange={e => updateBulkRow(idx, "check_in", e.target.value)} className="px-2 py-1.5 border border-slate-300 rounded text-sm outline-none" />
                    <input type="time" value={entry.check_out} onChange={e => updateBulkRow(idx, "check_out", e.target.value)} className="px-2 py-1.5 border border-slate-300 rounded text-sm outline-none" />
                    <div className="flex gap-1">
                      <select value={entry.status} onChange={e => updateBulkRow(idx, "status", e.target.value)} className="px-2 py-1.5 border border-slate-300 rounded text-sm outline-none flex-1">
                        <option value="present">Hadir</option>
                        <option value="late">Terlambat</option>
                        <option value="absent">Tidak Hadir</option>
                        <option value="half_day">Setengah Hari</option>
                      </select>
                      {bulkEntries.length > 1 && (
                        <button type="button" onClick={() => removeBulkRow(idx)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addBulkRow} className="text-blue-600 text-sm hover:text-blue-700 mb-4">+ Tambah Baris</button>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowUpload(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Upload</button>
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
                <th className="text-left px-4 py-3 font-medium text-slate-600">Tanggal</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Karyawan</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Check In</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Check Out</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Lembur</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="text-center py-8 text-slate-400">Memuat...</td></tr> :
                records.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-slate-400">Tidak ada data</td></tr> :
                  records.map((r: any) => (
                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">{r.date}</td>
                      <td className="px-4 py-3 font-medium">{r.employee?.first_name} {r.employee?.last_name}</td>
                      <td className="px-4 py-3 font-mono">{r.check_in || "-"}</td>
                      <td className="px-4 py-3 font-mono">{r.check_out || "-"}</td>
                      <td className="px-4 py-3">{statusBadge(r.status)}</td>
                      <td className="px-4 py-3">{r.overtime_hours ? `${r.overtime_hours} jam` : "-"}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
