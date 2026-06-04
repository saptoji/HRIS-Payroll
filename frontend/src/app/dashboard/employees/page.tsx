"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import api from "@/lib/api";
import {
  Search, Plus, Pencil, Trash2, X, Filter, SlidersHorizontal,
  Users, Building2, Briefcase, DollarSign, ChevronDown,
} from "lucide-react";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "", job_title: "",
    department_id: "", base_salary: 0, employment_type: "permanent",
    gender: "male", marital_status: "single", ptkp_category: "TK0",
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { limit: 200 };
      if (search) params.search = search;
      if (deptFilter) params.department_id = deptFilter;
      const { data } = await api.get("/employees", { params });
      setEmployees(data);
    } catch { setEmployees([]); }
    setLoading(false);
  }, [search, deptFilter]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);
  useEffect(() => { api.get("/departments").then(r => setDepartments(r.data)).catch(() => {}); }, []);

  const filteredEmployees = useMemo(() => {
    let data = employees;
    if (statusFilter) data = data.filter(e => e.employment_status === statusFilter);
    if (typeFilter) data = data.filter(e => e.employment_type === typeFilter);
    return data;
  }, [employees, statusFilter, typeFilter]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) await api.put(`/employees/${editing.id}`, form);
    else await api.post("/employees", form);
    setShowForm(false); setEditing(null);
    setForm({ first_name: "", last_name: "", email: "", phone: "", job_title: "", department_id: "", base_salary: 0, employment_type: "permanent", gender: "male", marital_status: "single", ptkp_category: "TK0" });
    fetchEmployees();
  };

  const handleEdit = (emp: any) => { setForm(emp); setEditing(emp); setShowForm(true); };
  const handleDelete = async (id: string) => {
    if (confirm("Yakin hapus data karyawan ini?")) { await api.delete(`/employees/${id}`); fetchEmployees(); }
  };

  const activeFilterCount = [statusFilter, typeFilter].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Direktori Karyawan</h1>
          <p className="text-sm text-slate-500 mt-0.5">{employees.length} karyawan terdaftar</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/20"
        >
          <Plus size={16} /> Tambah Karyawan
        </button>
      </div>

      {/* Filter Bar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        deptFilter={deptFilter}
        onDeptFilterChange={setDeptFilter}
        departments={departments}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        activeFilterCount={activeFilterCount}
      />

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <TableSkeleton />
        ) : filteredEmployees.length === 0 ? (
          <EmptyState hasSearch={!!search || !!deptFilter || !!statusFilter || !!typeFilter} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Karyawan</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">NIP</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Jabatan</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Departemen</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Tipe</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Gaji Pokok</th>
                  <th className="text-center px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-20">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp: any, i: number) => (
                  <EmployeeRow
                    key={emp.id}
                    employee={emp}
                    onEdit={() => handleEdit(emp)}
                    onDelete={() => handleDelete(emp.id)}
                    index={i}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Remaining slot: quick stats footer */}
      {!loading && filteredEmployees.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Menampilkan {filteredEmployees.length} dari {employees.length} karyawan</span>
          {activeFilterCount > 0 && (
            <button onClick={() => { setStatusFilter(""); setTypeFilter(""); }} className="text-indigo-600 hover:text-indigo-700 font-medium">Hapus filter</button>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <EmployeeFormModal
          editing={editing}
          form={form}
          setForm={setForm}
          departments={departments}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

/* ── Filter Bar ── */
function FilterBar({
  search, onSearchChange, deptFilter, onDeptFilterChange, departments,
  statusFilter, onStatusFilterChange, typeFilter, onTypeFilterChange,
  showFilters, onToggleFilters, activeFilterCount,
}: {
  search: string; onSearchChange: (v: string) => void;
  deptFilter: string; onDeptFilterChange: (v: string) => void;
  departments: any[];
  statusFilter: string; onStatusFilterChange: (v: string) => void;
  typeFilter: string; onTypeFilterChange: (v: string) => void;
  showFilters: boolean; onToggleFilters: () => void;
  activeFilterCount: number;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Cari nama, email, atau NIP karyawan..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={deptFilter}
            onChange={e => onDeptFilterChange(e.target.value)}
            className="border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-slate-600 min-w-[160px]"
          >
            <option value="">Semua Departemen</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <button
            onClick={onToggleFilters}
            className={`relative inline-flex items-center gap-1.5 px-3 py-2.5 border rounded-xl text-sm font-medium transition-colors ${
              showFilters
                ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                : "border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <SlidersHorizontal size={15} />
            <span className="hidden sm:inline">Filter</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-100">
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={onStatusFilterChange}
            options={[
              { value: "", label: "Semua Status" },
              { value: "active", label: "Aktif", color: "bg-emerald-100 text-emerald-700" },
              { value: "inactive", label: "Nonaktif", color: "bg-rose-100 text-rose-700" },
            ]}
          />
          <FilterDropdown
            label="Tipe Karyawan"
            value={typeFilter}
            onChange={onTypeFilterChange}
            options={[
              { value: "", label: "Semua Tipe" },
              { value: "permanent", label: "Tetap", color: "bg-indigo-100 text-indigo-700" },
              { value: "contract", label: "Kontrak", color: "bg-amber-100 text-amber-700" },
              { value: "intern", label: "Magang", color: "bg-purple-100 text-purple-700" },
              { value: "freelance", label: "Freelance", color: "bg-slate-100 text-slate-700" },
            ]}
          />
        </div>
      )}
    </div>
  );
}

function FilterDropdown({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string; color?: string }[];
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-slate-500">{label}:</span>
      <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
              value === opt.value
                ? "bg-white shadow-sm text-slate-800"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Employee Row ── */
function EmployeeRow({ employee: emp, onEdit, onDelete, index }: {
  employee: any; onEdit: () => void; onDelete: () => void; index: number;
}) {
  const initials = `${emp.first_name?.[0] || ""}${emp.last_name?.[0] || ""}`.toUpperCase();
  const name = `${emp.first_name || ""} ${emp.last_name || ""}`.trim();
  const email = emp.email || "-";

  const deptColor = getDeptColor(emp.department?.name || "");
  const typeBadge = getTypeBadge(emp.employment_type);
  const statusBadge = getStatusBadge(emp.employment_status);

  const fmt = (n: number) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

  return (
    <tr className={`border-b border-slate-100 transition-colors hover:bg-indigo-50/30 group ${index % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
      {/* Name + Email stacked */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-sm font-bold text-indigo-700 flex-shrink-0 ring-2 ring-white shadow-sm">
            {initials || "?"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
            <p className="text-xs text-slate-400 truncate">{email}</p>
          </div>
        </div>
      </td>

      {/* NIP */}
      <td className="px-6 py-4 hidden md:table-cell">
        <code className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">{emp.employee_number}</code>
      </td>

      {/* Jabatan */}
      <td className="px-6 py-4 hidden lg:table-cell">
        <span className="text-sm text-slate-600">{emp.job_title || "-"}</span>
      </td>

      {/* Department tag */}
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${deptColor}`}>
          <Building2 size={12} /> {emp.department?.name || "-"}
        </span>
      </td>

      {/* Employment type tag */}
      <td className="px-6 py-4 hidden sm:table-cell">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${typeBadge.color}`}>
          {typeBadge.label}
        </span>
      </td>

      {/* Status dot + label */}
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${statusBadge.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
          {statusBadge.label}
        </span>
      </td>

      {/* Salary */}
      <td className="px-6 py-4 text-right hidden lg:table-cell">
        <span className="text-sm font-medium text-slate-700 font-mono">{fmt(emp.base_salary)}</span>
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
            <Pencil size={15} />
          </button>
          <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Hapus">
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ── Helpers ── */
function getDeptColor(name: string): string {
  const index = name.length % 6;
  const palette = [
    "bg-indigo-50 text-indigo-700",
    "bg-emerald-50 text-emerald-700",
    "bg-amber-50 text-amber-700",
    "bg-sky-50 text-sky-700",
    "bg-violet-50 text-violet-700",
    "bg-rose-50 text-rose-700",
  ];
  return palette[index];
}

function getTypeBadge(t: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    permanent: { label: "Tetap", color: "bg-indigo-50 text-indigo-700 border border-indigo-200" },
    contract: { label: "Kontrak", color: "bg-amber-50 text-amber-700 border border-amber-200" },
    intern: { label: "Magang", color: "bg-purple-50 text-purple-700 border border-purple-200" },
    freelance: { label: "Freelance", color: "bg-slate-100 text-slate-600 border border-slate-200" },
  };
  return map[t] || { label: t, color: "bg-slate-100 text-slate-600 border border-slate-200" };
}

function getStatusBadge(s: string): { label: string; color: string; dot: string } {
  const map: Record<string, { label: string; color: string; dot: string }> = {
    active: { label: "Aktif", color: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" },
    inactive: { label: "Nonaktif", color: "bg-rose-50 text-rose-600 border border-rose-200", dot: "bg-rose-400" },
    terminated: { label: "Terminasi", color: "bg-slate-100 text-slate-500 border border-slate-200", dot: "bg-slate-400" },
  };
  return map[s] || { label: s, color: "bg-slate-100 text-slate-600 border border-slate-200", dot: "bg-slate-400" };
}

/* ── Loading Skeleton ── */
function TableSkeleton() {
  return (
    <div className="p-6 space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-slate-200 rounded w-1/3" />
            <div className="h-2.5 bg-slate-100 rounded w-1/2" />
          </div>
          <div className="h-6 bg-slate-200 rounded w-16 hidden md:block" />
          <div className="h-6 bg-slate-200 rounded w-20" />
          <div className="h-6 bg-slate-200 rounded w-16 hidden sm:block" />
          <div className="h-6 bg-slate-200 rounded w-14" />
        </div>
      ))}
    </div>
  );
}

/* ── Empty State ── */
function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="py-16 text-center px-4">
      <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
        <Users size={28} className="text-slate-400" />
      </div>
      {hasSearch ? (
        <>
          <p className="text-sm font-medium text-slate-600">Tidak ada hasil</p>
          <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci atau filter pencarian</p>
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-slate-600">Belum ada karyawan</p>
          <p className="text-xs text-slate-400 mt-1">Klik &quot;Tambah Karyawan&quot; untuk memulai</p>
        </>
      )}
    </div>
  );
}

/* ── Add / Edit Modal ── */
function EmployeeFormModal({
  editing, form, setForm, departments, onClose, onSave,
}: {
  editing: any; form: any; setForm: (f: any) => void;
  departments: any[]; onClose: () => void; onSave: (e: React.FormEvent) => void;
}) {
  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );

  const input = (key: string, required = false, placeholder = "") => (
    <input
      value={form[key] || ""}
      onChange={e => setForm({ ...form, [key]: e.target.value })}
      required={required}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400"
    />
  );

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{editing ? "Edit Karyawan" : "Tambah Karyawan"}</h3>
            {editing && <p className="text-xs text-slate-400 mt-0.5">{editing.employee_number} &middot; {editing.first_name} {editing.last_name}</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><X size={18} className="text-slate-500" /></button>
        </div>

        <form onSubmit={onSave} className="p-6">
          <div className="space-y-5">
            {/* Basic Info */}
            <SectionLabel icon={Users} label="Informasi Dasar" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nama Depan *">{input("first_name", true, "Nama depan")}</Field>
              <Field label="Nama Belakang">{input("last_name", false, "Nama belakang")}</Field>
              <Field label="Email">{input("email", false, "email@perusahaan.com")}</Field>
              <Field label="Telepon">{input("phone", false, "08xxxxxxxxxx")}</Field>
              <Field label="Jabatan">{input("job_title", false, "Software Engineer")}</Field>
              <Field label="Departemen">
                <select
                  value={form.department_id || ""}
                  onChange={e => setForm({ ...form, department_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="">Pilih Departemen</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </Field>
            </div>

            {/* Employment Info */}
            <SectionLabel icon={Briefcase} label="Informasi Kepegawaian" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Tipe Karyawan">
                <select value={form.employment_type} onChange={e => setForm({ ...form, employment_type: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none">
                  <option value="permanent">Tetap</option>
                  <option value="contract">Kontrak</option>
                  <option value="intern">Magang</option>
                  <option value="freelance">Freelance</option>
                </select>
              </Field>
              <Field label="Gaji Pokok">
                <input type="number" value={form.base_salary || 0} onChange={e => setForm({ ...form, base_salary: Number(e.target.value) })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none font-mono" />
              </Field>
              <Field label="Status PTKP">
                <select value={form.ptkp_category} onChange={e => setForm({ ...form, ptkp_category: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none">
                  <option value="TK0">TK/0</option><option value="TK1">TK/1</option><option value="TK2">TK/2</option>
                  <option value="K0">K/0</option><option value="K1">K/1</option><option value="K2">K/2</option><option value="K3">K/3</option>
                </select>
              </Field>
              <Field label="Status Kawin">
                <select value={form.marital_status} onChange={e => setForm({ ...form, marital_status: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none">
                  <option value="single">Belum Kawin</option><option value="married">Kawin</option><option value="divorced">Cerai</option>
                </select>
              </Field>
            </div>

            {/* Tax & BPJS */}
            <SectionLabel icon={DollarSign} label="Pajak & BPJS" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="No. NPWP">{input("npwp")}</Field>
              <Field label="No. BPJS TK">{input("bpjs_tk_no")}</Field>
              <Field label="No. BPJS Kesehatan">{input("bpjs_kes_no")}</Field>
              <Field label="Nama Bank">{input("bank_name")}</Field>
              <Field label="No. Rekening">{input("bank_account")}</Field>
              <Field label="Nama Pemilik Rekening">{input("bank_holder")}</Field>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">Batal</button>
            <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all hover:shadow-lg hover:shadow-indigo-500/20">
              {editing ? "Simpan Perubahan" : "Tambah Karyawan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SectionLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
      <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
        <Icon size={14} className="text-indigo-600" />
      </div>
      <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">{label}</span>
    </div>
  );
}
