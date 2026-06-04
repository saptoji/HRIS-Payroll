"use client";
import { useState } from "react";
import { BookOpen, X, ChevronRight, ArrowRight, Users, Receipt, FileText, Building2, ShieldCheck, BarChart3, Clock, Settings } from "lucide-react";

interface GuideItem {
  title: string;
  icon: React.ElementType;
  steps: string[];
}

const superAdminGuide: GuideItem[] = [
  {
    title: "Kelola Tenant Perusahaan",
    icon: Building2,
    steps: ["Buka menu Perusahaan di sidebar", "Klik Tambah Perusahaan untuk mendaftarkan tenant baru", "Isi data perusahaan dan akun admin", "Kelola status aktif/nonaktif tenant"],
  },
  {
    title: "Kelola Pengguna",
    icon: Settings,
    steps: ["Buka menu Pengguna untuk melihat semua user", "Tambah user baru dengan role yang sesuai", "Super Admin bisa melihat semua data lintas tenant"],
  },
  {
    title: "Konfigurasi Pajak & BPJS",
    icon: ShieldCheck,
    steps: ["Buka menu Pajak & BPJS", "Klik Seed Defaults untuk mengisi tarif default PPh 21 dan BPJS", "Sesuaikan tarif sesuai peraturan terbaru"],
  },
  {
    title: "Laporan & Audit",
    icon: BarChart3,
    steps: ["Buka menu Laporan untuk melihat ringkasan payroll, headcount, PPh 21, dan BPJS", "Buka menu Audit untuk melihat log aktivitas semua user"],
  },
];

const companyAdminGuide: GuideItem[] = [
  {
    title: "Tambah Data Karyawan",
    icon: Users,
    steps: ["Buka menu Karyawan dari sidebar", "Klik Tambah Karyawan untuk membuka form", "Isi data pribadi, jabatan, departemen, gaji, NPWP, dan BPJS", "Klik Simpan — karyawan langsung aktif"],
  },
  {
    title: "Proses Payroll Bulanan",
    icon: Receipt,
    steps: ["Buka menu Payroll dan pilih tab Payroll Processing", "Klik Buat Payroll Baru — pilih periode yang tersedia", "Klik Hitung untuk kalkulasi otomatis PPh 21, BPJS, dan gaji bersih", "Review hasil, lalu klik Setujui", "Setelah pembayaran, klik Sudah Dibayar"],
  },
  {
    title: "Generate Slip Gaji",
    icon: FileText,
    steps: ["Slip gaji otomatis dibuat setelah payroll ditandai Sudah Dibayar", "Buka menu Slip Gaji untuk melihat semua slip", "Klik slip untuk melihat detail lengkap (gaji kotor, potongan, THP)"],
  },
  {
    title: "Atur Departemen & Struktur",
    icon: Building2,
    steps: ["Buka menu Departemen dari sidebar", "Tambah/edit departemen dan sub-departemen", "Assign karyawan ke departemen yang sesuai"],
  },
  {
    title: "Kelola Cuti & Kehadiran",
    icon: Clock,
    steps: ["Buka menu Cuti untuk mengelola tipe cuti dan permintaan cuti", "Setujui/tolak permintaan cuti karyawan", "Buka menu Kehadiran untuk melihat dan input data kehadiran"],
  },
  {
    title: "Laporan & Kepatuhan",
    icon: BarChart3,
    steps: ["Buka menu Laporan untuk melihat ringkasan payroll dan headcount", "Gunakan filter tanggal untuk rentang laporan tertentu", "Buka menu Pajak & BPJS untuk memastikan konfigurasi kepatuhan"],
  },
];

export default function GuidePanel({ role }: { role: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const guides = role === "super_admin" ? superAdminGuide : companyAdminGuide;
  const roleLabel = role === "super_admin" ? "Super Admin" : "HR / Company Admin";

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3.5 shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 group"
        title="Panduan Penggunaan"
      >
        <BookOpen size={22} className="group-hover:scale-110 transition-transform" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative ml-auto w-full max-w-lg bg-white shadow-2xl h-full overflow-y-auto animate-slide-in">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-5 flex items-center justify-between z-10">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <BookOpen size={20} className="text-indigo-600" />
                  Panduan Penggunaan
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">Role: {roleLabel}</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">
              {guides.map((guide, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-5 hover:border-indigo-200 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      <guide.icon size={18} className="text-indigo-600" />
                    </div>
                    <h3 className="font-semibold text-slate-800">{guide.title}</h3>
                  </div>
                  <ol className="space-y-2">
                    {guide.steps.map((step, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-medium flex items-center justify-center mt-0.5">
                          {j + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}

              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-5">
                <div className="flex items-center gap-2 text-indigo-700 font-medium text-sm mb-1">
                  <ArrowRight size={16} />
                  Tips Cepat
                </div>
                <ul className="text-sm text-indigo-600/80 space-y-1">
                  <li>&bull; Gunakan tombol <strong>Panduan</strong> kapan saja untuk melihat bantuan ini</li>
                  <li>&bull; Semua data disimpan otomatis — tidak perlu khawatir kehilangan data</li>
                  <li>&bull; Gunakan kolom pencarian di setiap tabel untuk filter cepat</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
      `}</style>
    </>
  );
}
