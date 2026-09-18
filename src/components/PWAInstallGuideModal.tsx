import React from 'react';
import {
  Check,
  CheckCircle2,
  Download,
  HelpCircle,
  Laptop,
  Monitor,
  Share2,
  ShieldCheck,
  Smartphone,
  WifiOff,
  X,
  Zap,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallGuideModal: React.FC<PWAInstallGuideModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install, isIOS } = usePWAInstall();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                Instalasi Aplikasi (Format APK HP & EXE Laptop)
              </h3>
              <p className="text-xs text-slate-400">
                PWA Standalone — Berjalan Cepat, Ringan & Mendukung Akses Offline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          
          {/* Quick 1-Click Install Button if supported by browser */}
          {isInstallable && (
            <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-emerald-900 uppercase">
                  Perangkat Siap Pasang Langsung
                </span>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Klik tombol di samping untuk memasang langsung ke sistem tanpa unduh manual.
                </p>
              </div>
              <button
                id="pwa-direct-install-btn"
                onClick={async () => {
                  await install();
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 flex-shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Pasang Sekarang</span>
              </button>
            </div>
          )}

          {/* Advantages Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
              <Zap className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900">Sangat Ringan</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Ukuran &lt; 2 MB, tidak membebani memori HP Android maupun Laptop.
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
              <WifiOff className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900">Mendukung Offline</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Saksi tetap bisa membuka data pemilih di TPS walau sinyal minim.
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900">Aman & Terenkripsi</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Data pemilih tersimpan aman di perangkat masing-masing tim.
                </div>
              </div>
            </div>
          </div>

          {/* Step by step for Laptop (EXE Desktop App) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-2">
              <Monitor className="w-5 h-5 text-blue-600" />
              <span>Cara Pasang di Laptop / Komputer (Aplikasi Desktop .EXE)</span>
            </div>
            <ol className="list-decimal list-inside text-xs text-slate-700 space-y-1.5 ml-1">
              <li>Buka aplikasi ini di browser Chrome atau Edge di Laptop Anda.</li>
              <li>
                Lihat di ujung kanan bilah alamat (address bar), klik ikon <strong>Install / Pasang Aplikasi</strong> <span className="font-mono bg-slate-200 px-1.5 py-0.5 rounded text-[10px]">⊕</span>.
              </li>
              <li>
                Pilih <strong>Install "Paman Usman - Pemilih Desa Tracap"</strong>.
              </li>
              <li>
                Ikon aplikasi akan otomatis muncul di Desktop & Menu Start Windows seperti file .exe mandiri tanpa bilah browser.
              </li>
            </ol>
          </div>

          {/* Step by step for Mobile (Android APK) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-2">
              <Smartphone className="w-5 h-5 text-emerald-600" />
              <span>Cara Pasang di HP Android (Aplikasi Mandiri .APK)</span>
            </div>
            <ol className="list-decimal list-inside text-xs text-slate-700 space-y-1.5 ml-1">
              <li>Buka tautan ini di browser Google Chrome pada HP Android Anda.</li>
              <li>
                Tekan tombol titik tiga <strong>(⋮)</strong> di sudut kanan atas browser.
              </li>
              <li>
                Pilih menu <strong>"Tambahkan ke Layar Utama"</strong> atau <strong>"Instal Aplikasi"</strong>.
              </li>
              <li>
                Tekan <strong>Install</strong>. Aplikasi akan terpasang di daftar aplikasi HP Android Anda dan dapat dibuka kapan saja.
              </li>
            </ol>
          </div>

          {/* iOS Safari Fallback */}
          {isIOS && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
              <div className="font-bold flex items-center gap-1.5 text-blue-950 mb-1">
                <Share2 className="w-4 h-4 text-blue-600" />
                <span>Pengguna iPhone / iPad (Safari)</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Tekan tombol <strong>Share</strong> (ikon kotak dengan panah ke atas) di bilah bawah Safari, lalu gulir ke bawah dan pilih <strong>"Add to Home Screen" (Tambahkan ke Layar Utama)</strong>.
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold"
          >
            Tutup Panduan
          </button>
        </div>

      </div>
    </div>
  );
};
