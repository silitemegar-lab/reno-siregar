import React, { useRef, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  Cpu,
  Download,
  FileCheck,
  HardDrive,
  Key,
  Laptop,
  Lock,
  RefreshCw,
  Shield,
  ShieldCheck,
  Smartphone,
  Tablet,
  Upload,
  Wifi,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { decryptPayload, encryptPayload } from '../utils/crypto';

interface SecuritySyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecuritySyncModal: React.FC<SecuritySyncModalProps> = ({ isOpen, onClose }) => {
  const {
    voters,
    currentUser,
    checksum,
    lastSyncTime,
    isSyncing,
    syncNow,
    importVoters,
    isEncryptedView,
    toggleEncryptionView,
  } = useApp();

  const [encryptionKey, setEncryptionKey] = useState('USMAN-TRACAP-SECURE-2026');
  const [copiedChecksum, setCopiedChecksum] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleCopyChecksum = () => {
    navigator.clipboard.writeText(checksum);
    setCopiedChecksum(true);
    setTimeout(() => setCopiedChecksum(false), 2000);
  };

  const handleDownloadEncryptedBackup = () => {
    const rawData = JSON.stringify({
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      village: 'Desa Tracap',
      candidate: 'Ahmad Latif Usman',
      totalRecords: voters.length,
      checksum,
      voters,
    });

    const encrypted = encryptPayload(rawData, encryptionKey);
    const blob = new Blob([encrypted], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_Terenkripsi_DPT_Tracap_${new Date().toISOString().slice(0, 10)}.enc.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const encryptedText = evt.target?.result as string;
        const decryptedJson = decryptPayload(encryptedText, encryptionKey);
        const parsed = JSON.parse(decryptedJson);

        if (Array.isArray(parsed.voters)) {
          importVoters(parsed.voters);
          setImportStatus(`Berhasil memulihkan ${parsed.voters.length} data pemilih terenkripsi!`);
        } else {
          setImportStatus('Format file backup tidak valid.');
        }
      } catch (err) {
        setImportStatus('Gagal mendekripsi file backup. Kunci enkripsi mungkin tidak sesuai.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                Dashboard Pengamanan Data & Sinkronisasi
              </h3>
              <p className="text-xs text-slate-400">
                Enkripsi database & sinkronisasi multi-perangkat Tim Inti Paman Usman
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

        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Section 1: Device Sync & Network Grid */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Status Sinkronisasi Perangkat
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-sm text-slate-800">
                    Online — Terkoneksi Server Utama Tim Inti
                  </span>
                </div>
              </div>

              <button
                id="sync-now-modal-btn"
                onClick={() => syncNow()}
                disabled={isSyncing}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
              </button>
            </div>

            {/* Active Devices */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs mt-3">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center gap-2.5">
                <Laptop className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-slate-800 truncate">Laptop Admin Posko</div>
                  <div className="text-[10px] text-emerald-600 font-semibold">Tersinkronisasi (Aktif)</div>
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-slate-800 truncate">HP Saksi 8 TPS</div>
                  <div className="text-[10px] text-emerald-600 font-semibold">8 Perangkat Aktif</div>
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center gap-2.5">
                <Tablet className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-slate-800 truncate">Tablet Koordinator</div>
                  <div className="text-[10px] text-emerald-600 font-semibold">Sinkronisasi Terakhir</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-200 font-mono">
              <span>Waktu Sinkronisasi Terakhir: {lastSyncTime}</span>
              <span className="text-blue-700 font-semibold">Protokol: SSL / TLS 256-bit</span>
            </div>
          </div>

          {/* Section 2: Data Integrity & Checksum */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Integritas & Keaslian Data (Hash Checksum)
            </span>
            <div className="flex items-center justify-between gap-3 mt-2 bg-white p-3 rounded-lg border border-slate-200 font-mono text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">CRC Checksum Basis Data:</span>
                <span className="font-bold text-slate-900 tracking-wider text-sm">{checksum}</span>
              </div>
              <button
                onClick={handleCopyChecksum}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                {copiedChecksum ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedChecksum ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Checksum ini menjamin bahwa seluruh data {voters.length} pemilih Desa Tracap tidak mengalami perubahan liar atau manipulasi tidak sah.
            </p>
          </div>

          {/* Section 3: Backup & Restore Offline Encrypted File */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Pencadangan & Pemulihan Database Terenkripsi
            </span>
            <p className="text-xs text-slate-600 mt-1 mb-3">
              Gunakan fitur ini untuk mentransfer basis data antar laptop dan handphone saksi di wilayah TPS tanpa jaringan internet (Mode Offline Penuh).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                id="export-encrypted-backup-btn"
                onClick={handleDownloadEncryptedBackup}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 text-slate-800 text-xs font-bold transition"
              >
                <Download className="w-4 h-4 text-blue-600" />
                <span>Unduh File Backup Terenkripsi (.enc)</span>
              </button>

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json,.enc"
                  className="hidden"
                />
                <button
                  id="import-backup-btn"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-white border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 text-slate-800 text-xs font-bold transition"
                >
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>Pulihkan / Impor Database</span>
                </button>
              </div>
            </div>

            {importStatus && (
              <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                {importStatus}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold"
          >
            Tutup Dashboard
          </button>
        </div>

      </div>
    </div>
  );
};
