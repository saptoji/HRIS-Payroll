"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { BarChart3, Users, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

export default function ReportsPage() {
  const [tab, setTab] = useState<"payroll" | "headcount" | "pph21" | "bpjs">("payroll");

  const tabs = [
    { key: "payroll" as const, label: "Ringkasan Payroll", icon: DollarSign },
    { key: "headcount" as const, label: "Headcount", icon: Users },
    { key: "pph21" as const, label: "PPh 21", icon: TrendingUp },
    { key: "bpjs" as const, label: "BPJS", icon: BarChart3 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Laporan</h1>
      <div className="flex gap-1 mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 whitespace-nowrap transition-colors ${tab === t.key ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "payroll" && <PayrollSummary />}
      {tab === "headcount" && <HeadcountReport />}
      {tab === "pph21" && <Pph21Report />}
      {tab === "bpjs" && <BpjsReport />}
    </div>
  );
}

function PayrollSummary() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const formatCurrency = (n: number) => `Rp ${Number(n).toLocaleString("id-ID")}`;

  const fetchData = async () => {
    setLoading(true);
    const params: any = {};
    if (dateRange.start) params.start_date = dateRange.start;
    if (dateRange.end) params.end_date = dateRange.end;
    const { data } = await api.get("/reports/payroll-summary", { params });
    setData(data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const totals = data.reduce(
    (acc, d) => ({
      gross: acc.gross + (d.gross_total || 0),
      deductions: acc.deductions + (d.total_deductions || 0),
      net: acc.net + (d.net_total || 0),
      pph21: acc.pph21 + (d.pph21_total || 0),
      bpjs: acc.bpjs + (d.bpjs_total || 0),
    }),
    { gross: 0, deductions: 0, net: 0, pph21: 0, bpjs: 0 }
  );

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex flex-col sm:flex-row gap-3 items-end">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Tanggal Mulai</label>
          <input type="date" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none" />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Tanggal Selesai</label>
          <input type="date" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none" />
        </div>
        <button onClick={fetchData} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Filter</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: "Total Gross", value: formatCurrency(totals.gross), color: "text-blue-600" },
          { label: "Total Potongan", value: formatCurrency(totals.deductions), color: "text-red-600" },
          { label: "Total Net", value: formatCurrency(totals.net), color: "text-green-600" },
          { label: "Total PPh 21", value: formatCurrency(totals.pph21), color: "text-orange-600" },
          { label: "Total BPJS", value: formatCurrency(totals.bpjs), color: "text-purple-600" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="text-xs text-slate-500 mb-1">{s.label}</div>
            <div className={`font-bold text-sm ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Periode</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Gross</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Potongan</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Net</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">PPh 21</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">BPJS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="text-center py-8 text-slate-400">Memuat...</td></tr> :
                data.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-slate-400">Tidak ada data</td></tr> :
                  data.map((d: any, i: number) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{d.period}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(d.gross_total || 0)}</td>
                      <td className="px-4 py-3 text-right text-red-600">{formatCurrency(d.total_deductions || 0)}</td>
                      <td className="px-4 py-3 text-right font-medium text-green-600">{formatCurrency(d.net_total || 0)}</td>
                      <td className="px-4 py-3 text-right text-orange-600">{formatCurrency(d.pph21_total || 0)}</td>
                      <td className="px-4 py-3 text-right text-purple-600">{formatCurrency(d.bpjs_total || 0)}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function HeadcountReport() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/reports/headcount").then(({ data }) => { setData(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-8 text-slate-400">Memuat...</div>;
  if (!data) return <div className="text-center py-8 text-slate-400">Tidak ada data</div>;

  const byDept = data.by_department || [];
  const byType = data.by_employment_type || [];
  const byStatus = data.by_status || [];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
          <div className="text-xs text-slate-500 mb-1">Total Karyawan</div>
          <div className="text-3xl font-bold text-blue-600">{data.total || 0}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
          <div className="text-xs text-slate-500 mb-1">Aktif</div>
          <div className="text-3xl font-bold text-green-600">{data.active || 0}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
          <div className="text-xs text-slate-500 mb-1">Non-Aktif</div>
          <div className="text-3xl font-bold text-red-600">{data.inactive || 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {byDept.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-600 mb-4">Berdasarkan Departemen</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={byDept} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }: any) => `${name}: ${value}`}>
                  {byDept.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        {byType.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-600 mb-4">Berdasarkan Tipe Karyawan</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {byStatus.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
          <h3 className="text-sm font-semibold text-slate-600 p-4 border-b border-slate-200">Berdasarkan Status</h3>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {byStatus.map((s: any, i: number) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-right">{s.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Pph21Report() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  const formatCurrency = (n: number) => `Rp ${Number(n).toLocaleString("id-ID")}`;

  const fetchData = async () => {
    setLoading(true);
    const { data } = await api.get("/reports/pph21", { params: { year } });
    setData(data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const totalGross = data.reduce((s, d) => s + (d.gross_income || 0), 0);
  const totalPph21 = data.reduce((s, d) => s + (d.pph21_amount || 0), 0);

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex items-center gap-3">
        <label className="text-sm text-slate-600">Tahun:</label>
        <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none w-24" />
        <button onClick={fetchData} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Filter</button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="text-xs text-slate-500 mb-1">Total Penghasilan Bruto</div>
          <div className="font-bold text-lg text-blue-600">{formatCurrency(totalGross)}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="text-xs text-slate-500 mb-1">Total PPh 21 Terutang</div>
          <div className="font-bold text-lg text-orange-600">{formatCurrency(totalPph21)}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Karyawan</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">NIP</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">PTKP</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Penghasilan Bruto</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">PPh 21</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={5} className="text-center py-8 text-slate-400">Memuat...</td></tr> :
                data.length === 0 ? <tr><td colSpan={5} className="text-center py-8 text-slate-400">Tidak ada data</td></tr> :
                  data.map((d: any, i: number) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{d.employee_name}</td>
                      <td className="px-4 py-3 font-mono text-xs">{d.employee_number || "-"}</td>
                      <td className="px-4 py-3">{d.ptkp_category || "-"}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(d.gross_income || 0)}</td>
                      <td className="px-4 py-3 text-right font-medium text-orange-600">{formatCurrency(d.pph21_amount || 0)}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BpjsReport() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (n: number) => `Rp ${Number(n).toLocaleString("id-ID")}`;

  useEffect(() => {
    api.get("/reports/bpjs").then(({ data }) => { setData(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Karyawan</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">NIP</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">JHT (P)</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">JHT (K)</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">JKK</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">JKM</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">JP (P)</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">JP (K)</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Kesehatan (P)</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Kesehatan (K)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={10} className="text-center py-8 text-slate-400">Memuat...</td></tr> :
                data.length === 0 ? <tr><td colSpan={10} className="text-center py-8 text-slate-400">Tidak ada data</td></tr> :
                  data.map((d: any, i: number) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{d.employee_name}</td>
                      <td className="px-4 py-3 font-mono text-xs">{d.employee_number || "-"}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(d.jht_employer || 0)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(d.jht_employee || 0)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(d.jkk || 0)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(d.jkm || 0)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(d.jp_employer || 0)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(d.jp_employee || 0)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(d.kes_employer || 0)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(d.kes_employee || 0)}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
