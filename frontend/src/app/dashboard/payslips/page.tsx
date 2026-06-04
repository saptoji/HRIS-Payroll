"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Search, ArrowLeft, Download, FileText } from "lucide-react";

export default function PayslipsPage() {
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const formatCurrency = (n: number) => `Rp ${Number(n).toLocaleString("id-ID")}`;

  const fetchPayslips = async () => {
    setLoading(true);
    const params: any = { limit: 100 };
    if (search) params.employee_id = search;
    const { data } = await api.get("/payslips", { params });
    setPayslips(data);
    setLoading(false);
  };

  useEffect(() => { fetchPayslips(); }, [search]);

  const viewDetail = async (ps: any) => {
    setSelected(ps);
    setDetailLoading(true);
    try {
      const { data } = await api.get(`/payslips/${ps.id}`);
      setSelected(data);
    } catch {}
    setDetailLoading(false);
  };

  return (
    <div>
      {!selected ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Slip Gaji</h1>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input placeholder="Cari berdasarkan ID Karyawan..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">No. Slip</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Karyawan</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Periode</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Gross</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Potongan</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Net</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? <tr><td colSpan={7} className="text-center py-8 text-slate-400">Memuat...</td></tr> :
                    payslips.length === 0 ? <tr><td colSpan={7} className="text-center py-8 text-slate-400">Tidak ada data</td></tr> :
                      payslips.map((ps: any) => (
                        <tr key={ps.id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => viewDetail(ps)}>
                          <td className="px-4 py-3 font-mono text-xs">{ps.payslip_number}</td>
                          <td className="px-4 py-3 font-medium">{ps.employee?.first_name} {ps.employee?.last_name}</td>
                          <td className="px-4 py-3">{ps.period}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(ps.gross_amount || 0)}</td>
                          <td className="px-4 py-3 text-right text-red-600">{formatCurrency(ps.total_deductions || 0)}</td>
                          <td className="px-4 py-3 text-right font-medium text-green-600">{formatCurrency(ps.net_amount || 0)}</td>
                          <td className="px-4 py-3 text-xs">{ps.created_at ? new Date(ps.created_at).toLocaleDateString("id-ID") : "-"}</td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div>
          <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft size={16} /> Kembali
          </button>
          {detailLoading ? (
            <div className="text-center py-8 text-slate-400">Memuat...</div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 max-w-2xl mx-auto">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-lg font-bold">Detail Slip Gaji</h3>
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Download size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-slate-500">No. Slip</span><p className="font-mono font-medium">{selected.payslip_number}</p></div>
                  <div><span className="text-slate-500">Periode</span><p className="font-medium">{selected.period}</p></div>
                  <div><span className="text-slate-500">Karyawan</span><p className="font-medium">{selected.employee?.first_name} {selected.employee?.last_name}</p></div>
                  <div><span className="text-slate-500">NIP</span><p className="font-mono text-xs">{selected.employee?.employee_number || "-"}</p></div>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <h4 className="font-medium text-sm text-slate-700 mb-2">Pendapatan</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Gaji Pokok</span><span>{formatCurrency(selected.base_salary || 0)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Tunjangan</span><span>{formatCurrency(selected.allowances || 0)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Lembur</span><span>{formatCurrency(selected.overtime_amount || 0)}</span></div>
                    <div className="flex justify-between border-t border-slate-100 pt-1 font-medium"><span>Gross</span><span>{formatCurrency(selected.gross_amount || 0)}</span></div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <h4 className="font-medium text-sm text-slate-700 mb-2">Potongan</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">PPh 21</span><span className="text-red-600">-{formatCurrency(selected.pph21_amount || 0)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">BPJS</span><span className="text-red-600">-{formatCurrency(selected.bpjs_amount || 0)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Lainnya</span><span className="text-red-600">-{formatCurrency(selected.other_deductions || 0)}</span></div>
                    <div className="flex justify-between border-t border-slate-100 pt-1 font-medium"><span>Total Potongan</span><span className="text-red-600">{formatCurrency(selected.total_deductions || 0)}</span></div>
                  </div>
                </div>

                <div className="border-t-2 border-slate-300 pt-4 flex justify-between text-lg font-bold text-green-600">
                  <span>Take Home Pay</span>
                  <span>{formatCurrency(selected.net_amount || 0)}</span>
                </div>

                <div className="border-t border-slate-200 pt-4 grid grid-cols-2 gap-4 text-sm">
                  {selected.bpjs_tk && <div><span className="text-slate-500">BPJS TK</span><p>{selected.bpjs_tk}</p></div>}
                  {selected.bpjs_kes && <div><span className="text-slate-500">BPJS Kesehatan</span><p>{selected.bpjs_kes}</p></div>}
                  {selected.npwp && <div><span className="text-slate-500">NPWP</span><p className="font-mono text-xs">{selected.npwp}</p></div>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
