"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Users, Building2, Briefcase, Calendar, Clock, FileText,
  Receipt, ShieldCheck, BarChart3, Activity, Settings, LogOut, Menu, X,
  ChevronDown, Bell, Search, HelpCircle,
} from "lucide-react";
import { useState, useEffect, ReactNode } from "react";
import GuidePanel from "@/components/GuidePanel";

const navGroups = [
  {
    label: "Utama",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "HR & Data",
    items: [
      { href: "/dashboard/employees", label: "Karyawan", icon: Users },
      { href: "/dashboard/departments", label: "Departemen", icon: Building2 },
      { href: "/dashboard/attendance", label: "Kehadiran", icon: Clock },
      { href: "/dashboard/leave", label: "Cuti", icon: Calendar },
    ],
  },
  {
    label: "Payroll",
    items: [
      { href: "/dashboard/payroll", label: "Payroll", icon: Receipt },
      { href: "/dashboard/payslips", label: "Slip Gaji", icon: FileText },
      { href: "/dashboard/compliance", label: "Pajak & BPJS", icon: ShieldCheck },
    ],
  },
  {
    label: "Analitik",
    items: [
      { href: "/dashboard/reports", label: "Laporan", icon: BarChart3 },
      { href: "/dashboard/audit", label: "Audit", icon: Activity },
    ],
  },
  {
    label: "Admin",
    items: [
      { href: "/dashboard/companies", label: "Perusahaan", icon: Briefcase },
      { href: "/dashboard/users", label: "Pengguna", icon: Settings },
    ],
  },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-10 w-10 border-[3px] border-indigo-600 border-t-transparent rounded-full" />
          <p className="text-sm text-slate-500">Memuat...</p>
        </div>
      </div>
    );
  }
  if (!user) return null;

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const roleBadge = (role: string) => {
    const map: Record<string, { color: string; label: string }> = {
      super_admin: { color: "bg-rose-100 text-rose-700", label: "Super Admin" },
      company_admin: { color: "bg-indigo-100 text-indigo-700", label: "Company Admin" },
      hr_admin: { color: "bg-emerald-100 text-emerald-700", label: "HR Admin" },
      payroll_admin: { color: "bg-amber-100 text-amber-700", label: "Payroll Admin" },
      finance_admin: { color: "bg-cyan-100 text-cyan-700", label: "Finance Admin" },
    };
    return map[role] || { color: "bg-slate-100 text-slate-700", label: role };
  };
  const badge = roleBadge(user.role);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <LayoutDashboard size={20} />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-base tracking-tight">HRIS Payroll</h1>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${badge.color}`}>{badge.label}</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto"><X size={18} /></button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href, (item as any).exact);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 group relative ${
                        active
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-medium"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      <item.icon size={18} className={`flex-shrink-0 ${active ? "" : "group-hover:text-slate-300"}`} />
                      <span className="truncate">{item.label}</span>
                      {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-slate-800 p-3">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Menu size={20} className="text-slate-600" />
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-sm text-slate-500">
              <Search size={15} />
              <span className="text-slate-400">Cari apa pun... (Ctrl+K)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell size={19} className="text-slate-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            </button>
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-sm font-medium shadow-sm">
                  {user.full_name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <span className="text-sm font-medium text-slate-700 hidden md:block">{user.full_name}</span>
                <ChevronDown size={14} className="text-slate-400 hidden md:block" />
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1.5">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-800">{user.full_name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <LogOut size={15} /> Keluar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
            {children}
          </div>
        </div>
      </div>

      {/* Guide Panel FAB */}
      <GuidePanel role={user.role} />
    </div>
  );
}
