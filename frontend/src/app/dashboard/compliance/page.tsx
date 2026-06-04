"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Plus, Pencil, Trash2, Database, ShieldCheck } from "lucide-react";

export default function CompliancePage() {
  const [tab, setTab] = useState<"tax" | "bpjs">("tax");

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Pajak & BPJS</h1>
        <div className="flex bg-slate-100 rounded-lg p-1 text-sm">
          <button onClick={() => setTab("tax")} className={`px-4 py-2 rounded-md transition-colors ${tab === "tax" ? "bg-white shadow-sm font-medium text-slate-800" : "text-slate-500 hover:text-slate-700"}`}>PPh 21</button>
          <button onClick={() => setTab("bpjs")} className={`px-4 py-2 rounded-md transition-colors ${tab === "bpjs" ? "bg-white shadow-sm font-medium text-slate-800" : "text-slate-500 hover:text-slate-700"}`}>BPJS</button>
        </div>
      </div>

      {tab === "tax" ? <TaxConfig /> : <BpjsConfig />}
    </div>
  );
}

function TaxConfig() {
  const [taxConfigs, setTaxConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    year: new Date().getFullYear(), ptkp_category: "", ptkp_amount: 0,
    bracket_min: 0, bracket_max: 0, rate: 0, type: "ptkp"
  });
  const [seeding, setSeeding] = useState(false);

  const fetchConfigs = async () => {
    setLoading(true);
    const { data } = await api.get("/compliance/tax-configs");
    setTaxConfigs(data);
    setLoading(false);
  };

  useEffect(() => { fetchConfigs(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) await api.put(`/compliance/tax-configs/${editing.id}`, form);
    else await api.post("/compliance/tax-configs", form);
    setShowForm(false); setEditing(null);
    setForm({ year: new Date().getFullYear(), ptkp_category: "", ptkp_amount: 0, bracket_min: 0, bracket_max: 0, rate: 0, type: "ptkp" });
    fetchConfigs();
  };

  const handleEdit = (c: any) => {
    setForm({
      year: c.year, ptkp_category: c.ptkp_category || "", ptkp_amount: c.ptkp_amount || 0,
      bracket_min: c.bracket_min || 0, bracket_max: c.bracket_max || 0, rate: c.rate || 0, type: c.type || "ptkp"
    });
    setEditing(c); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Yakin hapus konfigurasi ini?")) { await api.delete(`/compliance/tax-configs/${id}`); fetchConfigs(); }
  };

  const handleSeedDefaults = async () => {
    setSeeding(true);
    await api.post("/compliance/seed-defaults");
    setSeeding(false);
    fetchConfigs();
  };

  const formatCurrency = (n: number) => `Rp ${Number(n).toLocaleString("id-ID")}`;

  const ptkpConfigs = taxConfigs.filter((c: any) => c.type === "ptkp");
  const bracketConfigs = taxConfigs.filter((c: any) => c.type !== "ptkp");

  return (
    <div>
      <div className="flex justify-end gap-2 mb-4">
        <button onClick={handleSeedDefaults} disabled={seeding} className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors disabled:opacity-50">
          <Database size={16} /> {seeding ? "Memuat..." : "Seed Defaults"}
        </button>
        <button onClick={() => { setEditing(null); setForm({ year: new Date().getFullYear(), ptkp_category: "", ptkp_amount: 0, bracket_min: 0, bracket_max: 0, rate: 0, type: "ptkp" }); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors">
          <Plus size={16} /> Tambah Konfigurasi
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold">{editing ? "Edit" : "Tambah"} Konfigurasi PPh 21</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-700 text-xl">&times;</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipe</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none">
                  <option value="ptkp">PTKP</option>
                  <option value="bracket">Tarif Progresif</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tahun</label>
                <input type="number" value={form.year} onChange={e => setForm({ ...form, year: Number(e.target.value) })} required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              {form.type === "ptkp" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kategori PTKP</label>
                    <select value={form.ptkp_category} onChange={e => setForm({ ...form, ptkp_category: e.target.value })} required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none">
                      <option value="">Pilih</option>
                      <option value="TK0">TK/0</option><option value="TK1">TK/1</option><option value="TK2">TK/2</option>
                      <option value="K0">K/0</option><option value="K1">K/1</option><option value="K2">K/2</option><option value="K3">K/3</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nilai PTKP</label>
                    <input type="number" value={form.ptkp_amount} onChange={e => setForm({ ...form, ptkp_amount: Number(e.target.value) })} required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Batas Bawah</label>
                      <input type="number" value={form.bracket_min} onChange={e => setForm({ ...form, bracket_min: Number(e.target.value) })} required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Batas Atas</label>
                      <input type="number" value={form.bracket_max} onChange={e => setForm({ ...form, bracket_max: Number(e.target.value) })} required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tarif (%)</label>
                    <input type="number" step="0.01" value={form.rate} onChange={e => setForm({ ...form, rate: Number(e.target.value) })} required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none" />
                  </div>
                </>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {ptkpConfigs.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-600 mb-2">Nilai PTKP</h3>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Tahun</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Kategori</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Nilai</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {ptkpConfigs.map((c: any) => (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">{c.year}</td>
                    <td className="px-4 py-3 font-medium">{c.ptkp_category}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(c.ptkp_amount)}</td>
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
      )}

      {bracketConfigs.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-600 mb-2">Tarif Progresif</h3>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Tahun</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Batas Bawah</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Batas Atas</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Tarif (%)</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {bracketConfigs.map((c: any) => (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">{c.year}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(c.bracket_min)}</td>
                    <td className="px-4 py-3 text-right">{c.bracket_max === 0 ? "Tak terbatas" : formatCurrency(c.bracket_max)}</td>
                    <td className="px-4 py-3 text-right font-medium">{(c.rate * 100).toFixed(0)}%</td>
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
      )}

      {!loading && ptkpConfigs.length === 0 && bracketConfigs.length === 0 && (
        <div className="text-center py-12 text-slate-400">Belum ada konfigurasi. Klik &quot;Seed Defaults&quot; untuk menambahkan data standar.</div>
      )}
    </div>
  );
}

function BpjsConfig() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    year: new Date().getFullYear(), type: "", component: "",
    employer_rate: 0, employee_rate: 0, max_salary_cap: 0
  });
  const [seeding, setSeeding] = useState(false);

  const fetchConfigs = async () => {
    setLoading(true);
    const { data } = await api.get("/compliance/bpjs-configs");
    setConfigs(data);
    setLoading(false);
  };

  useEffect(() => { fetchConfigs(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) await api.put(`/compliance/bpjs-configs/${editing.id}`, form);
    else await api.post("/compliance/bpjs-configs", form);
    setShowForm(false); setEditing(null);
    setForm({ year: new Date().getFullYear(), type: "", component: "", employer_rate: 0, employee_rate: 0, max_salary_cap: 0 });
    fetchConfigs();
  };

  const handleEdit = (c: any) => {
    setForm({
      year: c.year, type: c.type, component: c.component,
      employer_rate: c.employer_rate, employee_rate: c.employee_rate, max_salary_cap: c.max_salary_cap || 0
    });
    setEditing(c); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Yakin hapus konfigurasi ini?")) { await api.delete(`/compliance/bpjs-configs/${id}`); fetchConfigs(); }
  };

  const handleSeedDefaults = async () => {
    setSeeding(true);
    await api.post("/compliance/seed-defaults");
    setSeeding(false);
    fetchConfigs();
  };

  const formatCurrency = (n: number) => `Rp ${Number(n).toLocaleString("id-ID")}`;

  return (
    <div>
      <div className="flex justify-end gap-2 mb-4">
        <button onClick={handleSeedDefaults} disabled={seeding} className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors disabled:opacity-50">
          <Database size={16} /> {seeding ? "Memuat..." : "Seed Defaults"}
        </button>
        <button onClick={() => { setEditing(null); setForm({ year: new Date().getFullYear(), type: "", component: "", employer_rate: 0, employee_rate: 0, max_salary_cap: 0 }); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors">
          <Plus size={16} /> Tambah Konfigurasi
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold">{editing ? "Edit" : "Tambah"} Konfigurasi BPJS</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-700 text-xl">&times;</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tahun</label>
                <input type="number" value={form.year} onChange={e => setForm({ ...form, year: Number(e.target.value) })} required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipe BPJS</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none">
                  <option value="">Pilih</option>
                  <option value="ketenagakerjaan">BPJS Ketenagakerjaan</option>
                  <option value="kesehatan">BPJS Kesehatan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Komponen</label>
                <select value={form.component} onChange={e => setForm({ ...form, component: e.target.value })} required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none">
                  <option value="">Pilih</option>
                  <option value="jht">JHT</option>
                  <option value="jkk">JKK</option>
                  <option value="jkm">JKM</option>
                  <option value="jpk">JPK</option>
                  <option value="jp">JP</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rate Pemberi Kerja (%)</label>
                  <input type="number" step="0.01" value={form.employer_rate} onChange={e => setForm({ ...form, employer_rate: Number(e.target.value) })} required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rate Karyawan (%)</label>
                  <input type="number" step="0.01" value={form.employee_rate} onChange={e => setForm({ ...form, employee_rate: Number(e.target.value) })} required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Batas Gaji Maksimal</label>
                <input type="number" value={form.max_salary_cap} onChange={e => setForm({ ...form, max_salary_cap: Number(e.target.value) })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none" />
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
                <th className="text-left px-4 py-3 font-medium text-slate-600">Tahun</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Tipe</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Komponen</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Rate Perusahaan</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Rate Karyawan</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Batas Maks</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={7} className="text-center py-8 text-slate-400">Memuat...</td></tr> :
                configs.length === 0 ? <tr><td colSpan={7} className="text-center py-8 text-slate-400">Tidak ada data</td></tr> :
                  configs.map((c: any) => (
                    <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">{c.year}</td>
                      <td className="px-4 py-3">{c.type === "ketenagakerjaan" ? "TK" : "Kesehatan"}</td>
                      <td className="px-4 py-3 font-medium uppercase">{c.component}</td>
                      <td className="px-4 py-3 text-right">{c.employer_rate}%</td>
                      <td className="px-4 py-3 text-right">{c.employee_rate}%</td>
                      <td className="px-4 py-3 text-right">{c.max_salary_cap > 0 ? formatCurrency(c.max_salary_cap) : "-"}</td>
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
