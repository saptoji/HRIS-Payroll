"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Activity, ChevronLeft, ChevronRight } from "lucide-react";

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const entityTypes = [
    { value: "", label: "Semua" },
    { value: "employee", label: "Karyawan" },
    { value: "department", label: "Departemen" },
    { value: "company", label: "Perusahaan" },
    { value: "user", label: "Pengguna" },
    { value: "payroll", label: "Payroll" },
    { value: "attendance", label: "Kehadiran" },
    { value: "leave", label: "Cuti" },
    { value: "tax_config", label: "Pajak" },
    { value: "bpjs_config", label: "BPJS" },
  ];

  const fetchLogs = async () => {
    setLoading(true);
    const params: any = { page, limit };
    if (entityFilter) params.entity_type = entityFilter;
    const { data } = await api.get("/audit-logs", { params });
    setLogs(data.data || data);
    setTotalPages(data.totalPages || data.meta?.totalPages || 1);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, [page, entityFilter]);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const actionBadge = (action: string) => {
    const map: Record<string, string> = {
      create: "bg-green-100 text-green-700",
      update: "bg-blue-100 text-blue-700",
      delete: "bg-red-100 text-red-700",
      login: "bg-purple-100 text-purple-700",
      logout: "bg-gray-100 text-gray-700",
      approve: "bg-yellow-100 text-yellow-700",
      reject: "bg-orange-100 text-orange-700",
    };
    return map[action?.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Audit Log</h1>
        <select value={entityFilter} onChange={e => { setEntityFilter(e.target.value); setPage(1); }} className="border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none">
          {entityTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600 w-44">Timestamp</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">User</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Aksi</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Entitas</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Entity ID</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Deskripsi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="text-center py-8 text-slate-400">Memuat...</td></tr> :
                logs.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-slate-400">Tidak ada data</td></tr> :
                  logs.map((log: any) => (
                    <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-xs font-mono whitespace-nowrap">{formatDate(log.created_at)}</td>
                      <td className="px-4 py-3 font-medium">{log.user?.full_name || log.user_name || "-"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${actionBadge(log.action)}`}>{log.action}</span>
                      </td>
                      <td className="px-4 py-3 text-xs">{log.entity_type || "-"}</td>
                      <td className="px-4 py-3 font-mono text-xs">{log.entity_id || "-"}</td>
                      <td className="px-4 py-3 text-xs max-w-xs truncate">{log.description || "-"}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-slate-500">Halaman {page} dari {totalPages}</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
