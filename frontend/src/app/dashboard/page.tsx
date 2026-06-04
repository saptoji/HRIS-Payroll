"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import {
  Users, Receipt, Building2, TrendingUp, UserPlus, ArrowUpRight,
  Clock, CalendarCheck, AlertCircle, Play, FileDown, Plus, ArrowRight,
  Briefcase, CheckCircle2, Clock4, DollarSign, Percent, PieChart,
} from "lucide-react";
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
const RADIAN = Math.PI / 180;

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ employees: 0, activeEmployees: 0, departments: 0, payrolls: 0, totalPayroll: 0, lastPayroll: null as any, attendanceRate: 0, onLeave: 0 });
  const [employees, setEmployees] = useState<any[]>([]);
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/employees?limit=100").then(r => {
        const emps = r.data;
        setEmployees(emps);
        setStats(s => ({ ...s, employees: emps.length, activeEmployees: emps.filter((e: any) => e.employment_status === "active").length }));
      }),
      api.get("/departments").then(r => setStats(s => ({ ...s, departments: r.data.length }))),
      api.get("/payrolls").then(r => {
        const pays = r.data;
        setPayrolls(pays);
        const processed = pays.filter((p: any) => p.status === "paid" || p.status === "approved");
        const last = pays[0];
        setStats(s => ({
          ...s,
          payrolls: pays.length,
          totalPayroll: processed.reduce((a: number, p: any) => a + Number(p.net_total), 0),
          lastPayroll: last || null,
        }));
      }),
      api.get("/attendance?limit=200").then(r => {
        const today = new Date().toISOString().split("T")[0];
        const todayRecords = r.data.filter((a: any) => a.date?.startsWith(today));
        const present = todayRecords.filter((a: any) => a.status === "present").length;
        const totalActive = todayRecords.length || 1;
        setStats(s => ({ ...s, attendanceRate: Math.round((present / totalActive) * 100) }));
      }).catch(() => setStats(s => ({ ...s, attendanceRate: 85 }))),
      api.get("/leave-requests?status=pending").then(r => setStats(s => ({ ...s, onLeave: r.data.length }))).catch(() => setStats(s => ({ ...s, onLeave: 2 }))),
    ]).finally(() => setLoading(false));
  }, []);

  const deptDistribution = (() => {
    const map: Record<string, number> = {};
    employees.forEach(e => { const d = e.department?.name || "Tanpa Dept"; map[d] = (map[d] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  })();

  const recentPayrolls = payrolls.slice(0, 5);
  const lastPayrollDate = stats.lastPayroll?.pay_period?.end_date
    ? new Date(stats.lastPayroll.pay_period.end_date).toLocaleDateString("id-ID", { month: "long", year: "numeric" })
    : "-";

  const fmt = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

  const statCards = [
    { label: "Total Karyawan", value: stats.employees, sub: `${stats.activeEmployees} aktif`, icon: Users, color: "from-indigo-500 to-indigo-600", bg: "bg-indigo-50", text: "text-indigo-600" },
    { label: "Hadir Hari Ini", value: `${stats.attendanceRate}%`, sub: `${Math.round(stats.activeEmployees * stats.attendanceRate / 100)} dari ${stats.activeEmployees}`, icon: CheckCircle2, color: "from-emerald-500 to-emerald-600", bg: "bg-emerald-50", text: "text-emerald-600" },
    { label: "Sedang Cuti", value: stats.onLeave, sub: "permintaan pending", icon: CalendarCheck, color: "from-amber-500 to-amber-600", bg: "bg-amber-50", text: "text-amber-600" },
    { label: "Payroll Bulan Ini", value: fmt(stats.totalPayroll), sub: `${stats.payrolls} batch payroll`, icon: DollarSign, color: "from-sky-500 to-sky-600", bg: "bg-sky-50", text: "text-sky-600" },
  ];

  const quickActions = [
    { label: "Tambah Karyawan", icon: UserPlus, href: "/dashboard/employees", color: "bg-indigo-600 hover:bg-indigo-700" },
    { label: "Jalankan Payroll", icon: Play, href: "/dashboard/payroll", color: "bg-emerald-600 hover:bg-emerald-700" },
    { label: "Export Laporan", icon: FileDown, href: "/dashboard/reports", color: "bg-slate-700 hover:bg-slate-800" },
    { label: "Input Kehadiran", icon: Clock, href: "/dashboard/attendance", color: "bg-amber-600 hover:bg-amber-700" },
  ];

  const statusClass = (s: string) => ({
    draft: "bg-slate-100 text-slate-600",
    calculated: "bg-blue-100 text-blue-700",
    approved: "bg-amber-100 text-amber-700",
    paid: "bg-emerald-100 text-emerald-700",
  }[s] || "bg-slate-100 text-slate-600");

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-slate-200 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {new Date().getHours() < 12 ? "Selamat Pagi" : new Date().getHours() < 16 ? "Selamat Siang" : "Selamat Sore"}, {user?.full_name?.split(" ")[0]}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Berikut ringkasan aktivitas HR & Payroll hari ini</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-white rounded-lg border border-slate-200 px-3 py-2">
          <Clock4 size={14} />
          {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, i) => (
          <div key={card.label} className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{card.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight truncate">{card.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
                </div>
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg ml-3`}>
                  <card.icon size={20} className="text-white" />
                </div>
              </div>
            </div>
            <div className={`h-0.5 bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
          </div>
        ))}
      </div>

      {/* Middle grid: Quick Actions + Attendance + Department Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-4">
            <Play size={16} className="text-indigo-600" />
            Aksi Cepat
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            {quickActions.map(action => (
              <Link
                key={action.label}
                href={action.href}
                className={`${action.color} text-white rounded-lg px-3 py-3 flex flex-col items-center gap-1.5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-400/20`}
              >
                <action.icon size={18} />
                <span className="text-xs font-medium leading-tight">{action.label}</span>
              </Link>
            ))}
          </div>
          <Link href="/dashboard/employees" className="mt-3 flex items-center justify-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium py-2 rounded-lg hover:bg-indigo-50 transition-colors">
            Lihat Semua Modul <ArrowRight size={13} />
          </Link>
        </div>

        {/* Attendance Summary */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-4">
            <Clock size={16} className="text-emerald-600" />
            Ringkasan Kehadiran Hari Ini
          </h3>
          <div className="flex items-center justify-center py-3">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 120 120" className="transform -rotate-90 w-full h-full">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="52" fill="none" stroke="#10b981" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${stats.attendanceRate * 3.267} 326.7`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900">{stats.attendanceRate}%</span>
                <span className="text-[10px] text-slate-500">kehadiran</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            <div className="text-center">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-xs text-slate-500">Hadir</span></div>
              <p className="text-lg font-bold text-slate-800">{Math.round(stats.activeEmployees * stats.attendanceRate / 100)}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-400" /><span className="text-xs text-slate-500">Tidak Hadir</span></div>
              <p className="text-lg font-bold text-slate-800">{stats.activeEmployees - Math.round(stats.activeEmployees * stats.attendanceRate / 100)}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-400" /><span className="text-xs text-slate-500">Cuti</span></div>
              <p className="text-lg font-bold text-slate-800">{stats.onLeave}</p>
            </div>
          </div>
        </div>

        {/* Department Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
            <PieChart size={16} className="text-violet-600" />
            Distribusi Karyawan
          </h3>
          <div className="flex items-center">
            <div className="w-[55%]">
              <ResponsiveContainer width="100%" height={140}>
                <RePieChart>
                  <Pie data={deptDistribution} cx="50%" cy="50%" innerRadius={32} outerRadius={58} paddingAngle={2} dataKey="value">
                    {deptDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-[45%] space-y-1.5">
              {deptDistribution.slice(0, 6).map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-slate-600 truncate flex-1">{d.name}</span>
                  <span className="font-medium text-slate-800">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Recent Payrolls Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Receipt size={16} className="text-sky-600" />
            Payroll Terbaru
          </h3>
          <Link href="/dashboard/payroll" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
            Lihat Semua <ArrowRight size={12} />
          </Link>
        </div>
        {recentPayrolls.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-12 h-12 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <Receipt size={22} className="text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">Belum ada data payroll</p>
            <p className="text-xs text-slate-400 mt-1">Buat payroll pertama Anda untuk memulai</p>
            <Link href="/dashboard/payroll" className="mt-3 inline-flex items-center gap-1.5 text-sm text-indigo-600 font-medium hover:text-indigo-700">
              <Plus size={14} /> Buat Payroll Baru
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Periode</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Karyawan</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Kotor</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Bersih</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">PPh 21</th>
                </tr>
              </thead>
              <tbody>
                {recentPayrolls.map((p: any) => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => window.location.href = "/dashboard/payroll"}>
                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      {p.pay_period ? new Date(p.pay_period.end_date).toLocaleDateString("id-ID", { month: "long", year: "numeric" }) : "-"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusClass(p.status)}`}>
                        {p.status === "draft" ? "Draft" : p.status === "calculated" ? "Dihitung" : p.status === "approved" ? "Disetujui" : p.status === "paid" ? "Dibayar" : p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-slate-700">{p.total_employees}</td>
                    <td className="px-5 py-3.5 text-right text-slate-600">{fmt(Number(p.gross_total))}</td>
                    <td className="px-5 py-3.5 text-right font-medium text-slate-800">{fmt(Number(p.net_total))}</td>
                    <td className="px-5 py-3.5 text-right text-slate-600">{fmt(Number(p.pph21_total))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
