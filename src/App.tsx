import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Award,
  CheckCircle,
  Download,
  FileSpreadsheet,
  FileText,
  KeyRound,
  Layers,
  MapPin,
  RefreshCw,
  Shield,
  Smartphone,
  Sparkles,
  Users,
  Vote,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { ActivityLogDrawer } from './components/ActivityLogDrawer';
import { ExcelImportModal } from './components/ExcelImportModal';
import { LoginModal } from './components/LoginModal';
import { Navbar } from './components/Navbar';
import { PWAInstallGuideModal } from './components/PWAInstallGuideModal';
import { RegionalMap } from './components/RegionalMap';
import { SecuritySyncModal } from './components/SecuritySyncModal';
import { StatCards } from './components/StatCards';
import { VoteCharts } from './components/VoteCharts';
import { VoterTable } from './components/VoterTable';
import { AppProvider, useApp } from './context/AppContext';
import { exportToExcel, exportToPDF } from './utils/exportUtils';

function MainContent() {
  const {
    currentUser,
    voters,
    tpsStats,
    resetData,
    isSyncing,
    syncNow,
  } = useApp();

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isActivityLogsOpen, setIsActivityLogsOpen] = useState(false);
  const [isSecuritySyncOpen, setIsSecuritySyncOpen] = useState(false);
  const [isPWAInstallOpen, setIsPWAInstallOpen] = useState(false);
  const [isExcelImportOpen, setIsExcelImportOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<'all' | 'map' | 'charts' | 'voters'>('all');

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenActivityLogs={() => setIsActivityLogsOpen(true)}
        onOpenSecuritySync={() => setIsSecuritySyncOpen(true)}
        onOpenPWAInstall={() => setIsPWAInstallOpen(true)}
        onOpenExcelImport={() => setIsExcelImportOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Welcome & Role Status Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl overflow-hidden ring-2 ring-emerald-500/50 shadow-md shadow-emerald-900/25 flex-shrink-0 bg-slate-900 flex items-center justify-center">
              <img
                src="/logo_usman.jpg"
                alt="Logo Paman Usman"
                className="w-full h-full object-cover object-top"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Posko Pemenangan PAMAN USMAN
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  Desa Tracap (3 TPS & RT 01 - 28)
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Calon: <strong className="text-slate-900">Ahmad Latif Usman</strong> | Pemantauan Suara Real-Time Lawan: <span className="text-orange-700 font-semibold">Munjilin</span>, <span className="text-sky-700 font-semibold">Makful</span>, <span className="text-purple-700 font-semibold">Sigit</span>
              </p>
            </div>
          </div>

          {/* Quick Tab Filters & User Status */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                id="tab-view-all"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'all'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Tampilan
              </button>
              <button
                id="tab-view-charts"
                onClick={() => setActiveTab('charts')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'charts'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Grafik & Evaluasi
              </button>
              <button
                id="tab-view-map"
                onClick={() => setActiveTab('map')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'map'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Peta Wilayah
              </button>
              <button
                id="tab-view-voters"
                onClick={() => setActiveTab('voters')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'voters'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Daftar Pemilih (28 RT)
              </button>
            </div>

            {currentUser.role === 'admin' && (
              <button
                onClick={() => {
                  if (confirm('Kembalikan basis data pemilih ke set data awal default Desa Tracap?')) {
                    resetData();
                  }
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold transition"
                title="Reset ke data bawaan simulasi DPT"
              >
                Reset Awal
              </button>
            )}
          </div>
        </div>

        {/* Section 1: KPI Stat Cards */}
        <StatCards />

        {/* Section 2: Charts & Quick Evaluation */}
        {(activeTab === 'all' || activeTab === 'charts') && (
          <section id="section-charts">
            <VoteCharts />
          </section>
        )}

        {/* Section 3: Interactive Regional Mapping */}
        {(activeTab === 'all' || activeTab === 'map') && (
          <section id="section-map">
            <RegionalMap />
          </section>
        )}

        {/* Section 4: Voter Registry Table with RT & RW details */}
        {(activeTab === 'all' || activeTab === 'voters') && (
          <section id="section-voters">
            <VoterTable />
          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-xs mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <div className="font-bold text-slate-200">
              Sistem Basis Data & Rekapitulasi Suara Desa Tracap
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Dukungan Pemenangan PAMAN USMAN (Ahmad Latif Usman) • Terenkripsi & Sinkronisasi Multi-Perangkat
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => exportToExcel(voters, tpsStats, 'Desa Tracap')}
              className="hover:text-emerald-400 transition flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ekspor Excel (.xlsx)</span>
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => exportToPDF(voters, tpsStats, 'Desa Tracap')}
              className="hover:text-rose-400 transition flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5 text-rose-400" />
              <span>Ekspor PDF (.pdf)</span>
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => setIsPWAInstallOpen(true)}
              className="hover:text-blue-400 transition flex items-center gap-1"
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              <span>Aplikasi APK / EXE</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <ActivityLogDrawer isOpen={isActivityLogsOpen} onClose={() => setIsActivityLogsOpen(false)} />
      <SecuritySyncModal isOpen={isSecuritySyncOpen} onClose={() => setIsSecuritySyncOpen(false)} />
      <PWAInstallGuideModal isOpen={isPWAInstallOpen} onClose={() => setIsPWAInstallOpen(false)} />
      <ExcelImportModal isOpen={isExcelImportOpen} onClose={() => setIsExcelImportOpen(false)} />

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
