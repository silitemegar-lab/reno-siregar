import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  FileUp,
  Lock,
  RefreshCw,
  Shield,
  Smartphone,
  Unlock,
  Upload,
  User,
  Vote,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';

interface NavbarProps {
  onOpenLogin: () => void;
  onOpenActivityLogs: () => void;
  onOpenSecuritySync: () => void;
  onOpenPWAInstall: () => void;
  onOpenExcelImport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenLogin,
  onOpenActivityLogs,
  onOpenSecuritySync,
  onOpenPWAInstall,
  onOpenExcelImport,
}) => {
  const {
    currentUser,
    voters,
    tpsStats,
    isSyncing,
    syncNow,
    unreadLogsCount,
    isEncryptedView,
    toggleEncryptionView,
  } = useApp();

  const { isInstallable, isInstalled } = usePWAInstall();
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  const handleExportExcel = () => {
    exportToExcel(voters, tpsStats, 'Desa Tracap', currentUser.role === 'admin');
    setExportDropdownOpen(false);
  };

  const handleExportPDF = () => {
    exportToPDF(voters, tpsStats, 'Desa Tracap', currentUser.role === 'admin');
    setExportDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand & Candidate Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-11 w-11 rounded-xl overflow-hidden ring-2 ring-emerald-500/60 shadow-lg shadow-emerald-950/50 flex-shrink-0 bg-slate-800 flex items-center justify-center group relative">
              <img
                src="/logo_usman.jpg"
                alt="Logo Paman Usman"
                className="h-full w-full object-cover object-top transition duration-300 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white truncate">
                  PAMAN USMAN
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  AHMAD LATIF USMAN
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate flex items-center gap-1.5">
                <span>Daftar Pemilih & Rekap Suara</span>
                <span className="w-1 h-1 rounded-full bg-slate-500" />
                <span className="text-blue-400 font-medium">Desa Tracap (3 TPS & 28 RT)</span>
              </p>
            </div>
          </div>

          {/* Quick Actions & Status */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            
            {/* Sync button */}
            <button
              id="sync-button"
              onClick={() => syncNow()}
              disabled={isSyncing}
              title="Sinkronisasi Perangkat & Database Server"
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition flex items-center gap-1.5 text-xs font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
              <span className="hidden md:inline">{isSyncing ? 'Sinkron...' : 'Sinkron'}</span>
            </button>

            {/* Encryption Mode Toggle */}
            <button
              id="encryption-toggle-btn"
              onClick={toggleEncryptionView}
              title={isEncryptedView ? 'Mode Sensor NIK Aktif (Klik untuk buka tampilan)' : 'Mode Terbuka Aktif'}
              className={`p-2 rounded-lg border transition flex items-center gap-1 text-xs font-medium ${
                isEncryptedView
                  ? 'bg-blue-950/60 text-blue-300 border-blue-800/60 hover:bg-blue-900/60'
                  : 'bg-amber-950/60 text-amber-300 border-amber-800/60 hover:bg-amber-900/60'
              }`}
            >
              {isEncryptedView ? <Lock className="w-4 h-4 text-blue-400" /> : <Unlock className="w-4 h-4 text-amber-400" />}
              <span className="hidden lg:inline">{isEncryptedView ? 'Enkripsi NIK' : 'Tampil NIK'}</span>
            </button>

            {/* Security & Sync Center */}
            <button
              id="security-center-btn"
              onClick={onOpenSecuritySync}
              title="Dashboard Pengamanan & Sinkronisasi"
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition relative"
            >
              <Shield className="w-4 h-4 text-emerald-400" />
            </button>

            {/* Notification Bell / Activity Log */}
            <button
              id="activity-bell-btn"
              onClick={onOpenActivityLogs}
              title="Notifikasi Aktivitas Perubahan Data"
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition relative"
            >
              <Bell className="w-4 h-4" />
              {unreadLogsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                  {unreadLogsCount > 9 ? '9+' : unreadLogsCount}
                </span>
              )}
            </button>

            {/* Export & Import Data Group */}
            <div className="flex items-center gap-1.5">
              {currentUser.role === 'admin' && (
                <button
                  id="navbar-import-excel-btn"
                  onClick={onOpenExcelImport}
                  title="Import Daftar Pemilih dari File Excel (.xlsx)"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Import Excel</span>
                </button>
              )}

              {/* Export Dropdown (Excel / PDF) */}
              <div className="relative">
                <button
                  id="export-dropdown-btn"
                  onClick={() => setExportDropdownOpen(prev => !prev)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ekspor</span>
                </button>

                {exportDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setExportDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-52 rounded-xl bg-slate-800 border border-slate-700 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Rekapitulasi Laporan
                      </div>
                      <button
                        id="export-excel-btn"
                        onClick={handleExportExcel}
                        className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-700/80 flex items-center gap-2.5 transition"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                        <span>Ekspor Format Excel (.xlsx)</span>
                      </button>
                      <button
                        id="export-pdf-btn"
                        onClick={handleExportPDF}
                        className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-700/80 flex items-center gap-2.5 transition"
                      >
                        <FileText className="w-4 h-4 text-rose-400" />
                        <span>Ekspor Format PDF (.pdf)</span>
                      </button>
                      {currentUser.role === 'admin' && (
                        <>
                          <div className="my-1 border-t border-slate-700/80" />
                          <button
                            id="dropdown-import-excel-btn"
                            onClick={() => {
                              setExportDropdownOpen(false);
                              onOpenExcelImport();
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-emerald-300 hover:bg-slate-700/80 flex items-center gap-2.5 transition"
                          >
                            <Upload className="w-4 h-4 text-emerald-400" />
                            <span>Import dari Excel (.xlsx)</span>
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Install PWA / Mobile APK / Laptop EXE button */}
            <button
              id="install-pwa-btn"
              onClick={onOpenPWAInstall}
              title="Pasang di Laptop (EXE) atau HP Android (APK)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{isInstalled ? 'Aplikasi Terpasang' : 'Install APK / EXE'}</span>
              <span className="md:hidden">App</span>
            </button>

            {/* Current User Role Badge & Switch User */}
            <button
              id="user-profile-btn"
              onClick={onOpenLogin}
              title="Klik untuk ganti user atau login admin"
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs transition ${
                currentUser.role === 'admin'
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  currentUser.role === 'admin' ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'
                }`}
              />
              <div className="text-left hidden sm:block">
                <div className="text-[11px] font-bold leading-tight flex items-center gap-1">
                  <span>{currentUser.role === 'admin' ? 'Admin' : 'Saksi/User'}</span>
                  {currentUser.role === 'admin' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[110px]">
                  {currentUser.displayName || currentUser.username}
                </div>
              </div>
              <User className="w-4 h-4 text-slate-400 sm:hidden" />
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
