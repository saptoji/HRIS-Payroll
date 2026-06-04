"use client";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Plus, Pencil, Trash2, Calculator, CheckCircle, DollarSign, Calendar,
  X, Download, Mail, Printer, ChevronRight, TrendingUp, TrendingDown,
  Wallet, Shield, FileText, Receipt, Users, Clock4,
} from "lucide-react";

export default function PayrollPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"schedules" | "processing">("processing");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payroll</h1>
          <p className="text-sm text-slate-500 mt-0.5">Kelola jadwal, proses penggajian, dan lihat slip gaji</p>
        </div>
        <div className="flex bg-slate-100 rounded-lg p-1 text-sm">
          <button onClick={() => setTab("processing")} className={`px-4 py-2 rounded-md transition-all duration-150 ${tab === "processing" ? "bg-white shadow-sm font-semibold text-slate-800" : "text-slate-500 hover:text-slate-700"}`}>Proses Payroll</button>
          <button onClick={() => setTab("schedules")} className={`px-4 py-2 rounded-md transition-all duration-150 ${tab === "schedules" ? "bg-white shadow-sm font-semibold text-slate-800" : "text-slate-500 hover:text-slate-700"}`}>Jadwal Gaji</button>
        </div>
      </div>

      {tab === "schedules" ? <PaySchedules /> : <PayrollProcessing />}
    </div>
  );
}

function PaySchedules() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", frequency: "monthly", pay_day: "", cutoff_day: "" });

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get("/pay-schedules"); setSchedules(data); } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchSchedules(); }, [fetchSchedules]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) await api.put(`/pay-schedules/${editing.id}`, form);
    else await api.post("/pay-schedules", form);
    setShowForm(false); setEditing(null);
    setForm({ name: "", frequency: "monthly", pay_day: "", cutoff_day: "" });
    fetchSchedules();
  };

  const freqLabel = (f: string) => ({ monthly: "Bulanan", "bi-weekly": "Dua Mingguan", weekly: "Mingguan" }[f] || f);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/20">
          <Plus size={16} /> Tambah Jadwal
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">{editing ? "Edit Jadwal Gaji" : "Tambah Jadwal Gaji"}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><X size={18} className="text-slate-500" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Jadwal</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="contoh: Gaji Bulanan" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Frekuensi</label>
                <select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                  <option value="monthly">Bulanan</option>
                  <option value="bi-weekly">Dua Mingguan</option>
                  <option value="weekly">Mingguan</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tanggal Bayar</label>
                  <input type="number" min="1" max="31" value={form.pay_day} onChange={e => setForm({ ...form, pay_day: e.target.value })} required className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tanggal Cutoff</label>
                  <input type="number" min="1" max="31" value={form.cutoff_day} onChange={e => setForm({ ...form, cutoff_day: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">Batal</button>
                <button type="submit" className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-500/20">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Jadwal</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Frekuensi</th>
                <th className="text-center px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tgl Bayar</th>
                <th className="text-center px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tgl Cutoff</th>
                <th className="text-center px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-16"><div className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto" /><p className="text-xs text-slate-400 mt-3">Memuat...</p></td></tr>
              ) : schedules.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-16">
                  <div className="w-12 h-12 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-3"><Calendar size={22} className="text-slate-400" /></div>
                  <p className="text-sm text-slate-500">Belum ada jadwal gaji</p>
                  <p className="text-xs text-slate-400 mt-1">Buat jadwal pertama untuk memulai proses payroll</p>
                </td></tr>
              ) : schedules.map((s: any, i: number) => (
                <tr key={s.id} className={`border-b border-slate-100 hover:bg-indigo-50/30 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                  <td className="px-6 py-4 font-medium text-slate-800">{s.name}</td>
                  <td className="px-6 py-4 text-slate-600">{freqLabel(s.frequency)}</td>
                  <td className="px-6 py-4 text-center font-medium text-slate-700">Setiap tgl <span className="text-indigo-600">{s.pay_day}</span></td>
                  <td className="px-6 py-4 text-center text-slate-600">{s.cutoff_day ? `Tgl ${s.cutoff_day}` : "-"}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => { setForm({ name: s.name, frequency: s.frequency, pay_day: String(s.pay_day), cutoff_day: String(s.cutoff_day || "") }); setEditing(s); setShowForm(true); }} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                      <button onClick={async () => { if (confirm("Hapus jadwal ini?")) { await api.delete(`/pay-schedules/${s.id}`); fetchSchedules(); } }} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
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

function PayrollProcessing() {
  const { user } = useAuth();
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<any>(null);
  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ pay_period_id: "", period_start: "", period_end: "", schedule_id: "" });
  const [schedules, setSchedules] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);

  const fetchPayrolls = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get("/payrolls"); setPayrolls(data); } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchPayrolls(); api.get("/pay-schedules").then(r => setSchedules(r.data)).catch(() => {}); }, [fetchPayrolls]);

  const formatCurrency = (n: number) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      draft: "bg-slate-100 text-slate-600 border-slate-200",
      calculated: "bg-indigo-50 text-indigo-700 border-indigo-200",
      approved: "bg-amber-50 text-amber-700 border-amber-200",
      paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
    return map[status] || "bg-slate-100 text-slate-600 border-slate-200";
  };

  const statusLabel = (status: string) => {
    const map: Record<string, string> = { draft: "Draft", calculated: "Terkalkulasi", approved: "Disetujui", paid: "Dibayar" };
    return map[status] || status;
  };

  const statusIcon = (status: string) => {
    const map: Record<string, any> = { draft: Clock4, calculated: Calculator, approved: CheckCircle, paid: DollarSign };
    return map[status] || Clock4;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/payrolls", { pay_period_id: createForm.pay_period_id });
    setShowCreate(false);
    fetchPayrolls();
  };

  const handleAction = async (id: string, action: "calculate" | "approve" | "paid", e?: React.MouseEvent) => {
    e?.stopPropagation();
    const labels = { calculate: "Hitung", approve: "Setujui", paid: "Tandai Dibayar" };
    if (!confirm(`Yakin ${labels[action]} payroll ini?`)) return;
    const endpoints = { calculate: "calculate", approve: "approve", paid: "paid" };
    await api.post(`/payrolls/${id}/${endpoints[action]}`);
    await fetchPayrolls();
    if (selectedPayroll?.id === id) {
      const { data } = await api.get(`/payrolls/${id}`);
      setSelectedPayroll(data);
    }
  };

  const openPayslipDrawer = async (payroll: any) => {
    setDrawerOpen(true);
    setSelectedPayroll(payroll);
    try {
      const { data: full } = await api.get(`/payrolls/${payroll.id}`);
      setSelectedPayroll(full);
    } catch {}
  };

  const selectEmployeeDetail = (d: any) => setSelectedDetail(d);

  const StatusIcon = statusIcon(selectedPayroll?.status || "draft");

  return (
    <div>
      {/* Header actions */}
      <div className="flex justify-end mb-6">
        <button onClick={() => setShowCreate(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/20">
          <Plus size={16} /> Buat Payroll Baru
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Buat Payroll Baru</h3>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><X size={18} className="text-slate-500" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Jadwal Gaji</label>
                <select value={createForm.schedule_id} onChange={e => setCreateForm({ ...createForm, schedule_id: e.target.value })} required className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                  <option value="">Pilih Jadwal</option>
                  {schedules.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Periode Mulai</label>
                <input type="date" value={createForm.period_start} onChange={e => setCreateForm({ ...createForm, period_start: e.target.value })} required className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Periode Selesai</label>
                <input type="date" value={createForm.period_end} onChange={e => setCreateForm({ ...createForm, period_end: e.target.value })} required className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">Batal</button>
                <button type="submit" className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-500/20">Buat</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payroll table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Periode</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Karyawan</th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Kotor</th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Bersih</th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">PPh 21</th>
                <th className="text-center px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-16"><div className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto" /><p className="text-xs text-slate-400 mt-3">Memuat...</p></td></tr>
              ) : payrolls.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16">
                  <div className="w-12 h-12 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-3"><Receipt className="text-slate-400" size={22} /></div>
                  <p className="text-sm text-slate-500">Belum ada payroll</p>
                  <p className="text-xs text-slate-400 mt-1">Buat payroll pertama untuk mulai mengelola penggajian</p>
                </td></tr>
              ) : payrolls.map((p: any, i: number) => (
                <tr
                  key={p.id}
                  onClick={() => openPayslipDrawer(p)}
                  className={`border-b border-slate-100 hover:bg-indigo-50/30 cursor-pointer transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-800">{p.pay_period ? new Date(p.pay_period.end_date).toLocaleDateString("id-ID", { month: "long", year: "numeric" }) : "-"}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{p.pay_period ? `${new Date(p.pay_period.start_date).toLocaleDateString("id-ID", { day: "numeric" })} - ${new Date(p.pay_period.end_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}` : "-"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge(p.status)}`}>
                      {(() => { const I = statusIcon(p.status); return <I size={12} />; })()}
                      {statusLabel(p.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-700 font-mono">{p.total_employees || 0}</td>
                  <td className="px-6 py-4 text-right text-slate-600 font-mono">{formatCurrency(p.gross_total)}</td>
                  <td className="px-6 py-4 text-right font-semibold text-emerald-600 font-mono">{formatCurrency(p.net_total)}</td>
                  <td className="px-6 py-4 text-right text-rose-600 font-mono">{formatCurrency(p.pph21_total)}</td>
                  <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-center gap-1.5">
                      {p.status === "draft" && (
                        <button onClick={(e) => handleAction(p.id, "calculate", e)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors">
                          <Calculator size={12} /> Hitung
                        </button>
                      )}
                      {p.status === "calculated" && (
                        <button onClick={(e) => handleAction(p.id, "approve", e)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-medium hover:bg-amber-100 transition-colors">
                          <CheckCircle size={12} /> Setujui
                        </button>
                      )}
                      {p.status === "approved" && (
                        <button onClick={(e) => handleAction(p.id, "paid", e)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors">
                          <DollarSign size={12} /> Dibayar
                        </button>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); openPayslipDrawer(p); }} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Lihat detail">
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payslip Preview Drawer */}
      {drawerOpen && selectedPayroll && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => { setDrawerOpen(false); setSelectedDetail(null); }} />
          <div className="relative ml-auto w-full max-w-xl bg-white shadow-2xl h-full overflow-y-auto animate-slide-in">
            {/* Drawer header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-5 flex items-center justify-between z-10">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <FileText size={20} className="text-indigo-600" />
                  Detail Payroll
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedPayroll.pay_period ? new Date(selectedPayroll.pay_period.end_date).toLocaleDateString("id-ID", { month: "long", year: "numeric" }) : "-"}
                </p>
              </div>
              <button onClick={() => { setDrawerOpen(false); setSelectedDetail(null); }} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Summary cards */}
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusBadge(selectedPayroll.status)}`}>
                  <StatusIcon size={13} /> {statusLabel(selectedPayroll.status)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Total Kotor", value: formatCurrency(selectedPayroll.gross_total), color: "text-slate-700", icon: TrendingUp },
                  { label: "Total Potongan", value: formatCurrency(selectedPayroll.deduction_total), color: "text-rose-600", icon: TrendingDown },
                  { label: "Total Bersih", value: formatCurrency(selectedPayroll.net_total), color: "text-emerald-600", icon: Wallet },
                ].map(s => (
                  <div key={s.label} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                    <p className={`text-sm font-bold font-mono ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Employee list */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Users size={15} className="text-indigo-600" />
                  Rincian per Karyawan ({selectedPayroll.total_employees || 0})
                </h3>
                <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                  {(!selectedPayroll.details || selectedPayroll.details.length === 0) ? (
                    <p className="text-sm text-slate-400 text-center py-8">Klik &quot;Hitung&quot; untuk melihat rincian karyawan</p>
                  ) : selectedPayroll.details.map((d: any) => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDetail(d)}
                      className={`w-full text-left flex items-center justify-between p-3 rounded-xl border transition-all duration-150 ${selectedDetail?.id === d.id ? "border-indigo-300 bg-indigo-50 shadow-sm" : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-700">
                          {d.employee?.first_name?.[0]}{d.employee?.last_name?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{d.employee?.first_name} {d.employee?.last_name}</p>
                          <p className="text-xs text-slate-400">{d.employee?.job_title} &middot; {d.employee?.department?.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-emerald-600 font-mono">{formatCurrency(d.net_pay)}</p>
                        <p className="text-[10px] text-slate-400">Take Home Pay</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Individual payslip mockup */}
              {selectedDetail && (
                <PayslipMockup detail={selectedDetail} payroll={selectedPayroll} onClose={() => setSelectedDetail(null)} />
              )}

              {/* Action buttons */}
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                {selectedPayroll.status === "draft" && (
                  <button onClick={(e) => handleAction(selectedPayroll.id, "calculate", e)} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-500/20">
                    <Calculator size={15} /> Hitung Payroll
                  </button>
                )}
                {selectedPayroll.status === "calculated" && (
                  <button onClick={(e) => handleAction(selectedPayroll.id, "approve", e)} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 transition-all hover:shadow-lg hover:shadow-amber-500/20">
                    <CheckCircle size={15} /> Setujui Payroll
                  </button>
                )}
                {selectedPayroll.status === "approved" && (
                  <button onClick={(e) => handleAction(selectedPayroll.id, "paid", e)} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-all hover:shadow-lg hover:shadow-emerald-500/20">
                    <DollarSign size={15} /> Tandai Dibayar
                  </button>
                )}
                <button className="px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors inline-flex items-center gap-2">
                  <Printer size={15} /> Cetak
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slide-in { animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}

function PayslipMockup({ detail, payroll, onClose }: { detail: any; payroll: any; onClose: () => void }) {
  const fmt = (n: number) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
  const periodLabel = payroll.pay_period
    ? `${new Date(payroll.pay_period.start_date).toLocaleDateString("id-ID", { day: "numeric", month: "long" })} - ${new Date(payroll.pay_period.end_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`
    : "-";

  const LineItem = ({ label, value, negative }: { label: string; value: string; negative?: boolean }) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`text-sm font-medium font-mono ${negative ? "text-rose-600" : "text-slate-700"}`}>{negative ? `- ${value}` : value}</span>
    </div>
  );

  return (
    <div className="bg-white border-2 border-indigo-100 rounded-2xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield size={16} />
            <span className="text-xs font-medium opacity-90">SLIP GAJI RESMI</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors"><X size={16} /></button>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold">
            {detail.employee?.first_name?.[0]}{detail.employee?.last_name?.[0]}
          </div>
          <div>
            <h3 className="text-xl font-bold">{detail.employee?.first_name} {detail.employee?.last_name}</h3>
            <p className="text-sm opacity-80">{detail.employee?.job_title}</p>
            <p className="text-xs opacity-60">NIP: {detail.employee?.employee_number}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-5">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div><span className="text-slate-400">Periode</span><p className="font-medium text-slate-700 mt-0.5">{periodLabel}</p></div>
          <div><span className="text-slate-400">Departemen</span><p className="font-medium text-slate-700 mt-0.5">{detail.employee?.department?.name || "-"}</p></div>
          <div><span className="text-slate-400">No NPWP</span><p className="font-medium text-slate-700 mt-0.5">{detail.employee?.npwp || "-"}</p></div>
          <div><span className="text-slate-400">Status PTKP</span><p className="font-medium text-slate-700 mt-0.5">{detail.employee?.ptkp_category || "-"}</p></div>
        </div>

        {/* Earnings */}
        <div>
          <h4 className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Penghasilan
          </h4>
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 space-y-1">
            <LineItem label="Gaji Pokok" value={fmt(detail.base_salary)} />
            <LineItem label="Tunjangan" value={fmt(detail.total_allowances)} />
            <LineItem label="Lembur" value={fmt(detail.total_overtime)} />
            {Number(detail.bonus) > 0 && <LineItem label="Bonus" value={fmt(detail.bonus)} />}
            {Number(detail.thr_amount) > 0 && <LineItem label="THR" value={fmt(detail.thr_amount)} />}
            <div className="flex items-center justify-between pt-2 mt-1 border-t border-emerald-200">
              <span className="text-sm font-semibold text-emerald-700">Total Penghasilan</span>
              <span className="text-sm font-bold text-emerald-700 font-mono">{fmt(detail.gross_income)}</span>
            </div>
          </div>
        </div>

        {/* Deductions */}
        <div>
          <h4 className="text-xs font-semibold text-rose-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Potongan
          </h4>
          <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 space-y-1">
            <LineItem label="PPh 21" value={fmt(detail.pph21_amount)} negative />
            <LineItem label="BPJS TK - JHT (Karyawan)" value={fmt(detail.bpjs_tk_jht_employee)} negative />
            <LineItem label="BPJS TK - JP (Karyawan)" value={fmt(detail.bpjs_tk_jp_employee)} negative />
            <LineItem label="BPJS Kesehatan (Karyawan)" value={fmt(detail.bpjs_kes_employee)} negative />
            {Number(detail.other_deductions) > 0 && <LineItem label="Potongan Lain" value={fmt(detail.other_deductions)} negative />}
            <div className="flex items-center justify-between pt-2 mt-1 border-t border-rose-200">
              <span className="text-sm font-semibold text-rose-700">Total Potongan</span>
              <span className="text-sm font-bold text-rose-700 font-mono">
                {fmt(Number(detail.bpjs_tk_jht_employee) + Number(detail.bpjs_tk_jp_employee) + Number(detail.bpjs_kes_employee) + Number(detail.pph21_amount) + Number(detail.other_deductions))}
              </span>
            </div>
          </div>
        </div>

        {/* Employer contributions */}
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Kontribusi Perusahaan (BPJS)
          </h4>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-1">
            <LineItem label="BPJS TK - JKK" value={fmt(detail.bpjs_tk_jkk)} />
            <LineItem label="BPJS TK - JKM" value={fmt(detail.bpjs_tk_jkm)} />
            <LineItem label="BPJS TK - JHT (Perusahaan)" value={fmt(detail.bpjs_tk_jht_employer)} />
            <LineItem label="BPJS TK - JP (Perusahaan)" value={fmt(detail.bpjs_tk_jp_employer)} />
            <LineItem label="BPJS Kesehatan (Perusahaan)" value={fmt(detail.bpjs_kes_employer)} />
          </div>
        </div>

        {/* Take Home Pay */}
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Take Home Pay</p>
              <p className="text-[10px] text-emerald-500 mt-0.5">Gaji bersih yang diterima karyawan</p>
            </div>
            <span className="text-2xl font-bold text-emerald-700 font-mono">{fmt(detail.net_pay)}</span>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="border-t border-slate-100 p-4 flex gap-3">
        <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-500/20">
          <Download size={15} /> Download PDF
        </button>
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-indigo-300 text-indigo-700 rounded-xl text-sm font-medium hover:bg-indigo-50 transition-colors">
          <Mail size={15} /> Email
        </button>
      </div>
    </div>
  );
}
