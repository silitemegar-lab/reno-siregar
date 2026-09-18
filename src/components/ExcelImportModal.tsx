import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileUp,
  Info,
  Loader2,
  Table,
  Upload,
  Users,
  Vote,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CANDIDATES } from '../data/candidates';
import { downloadExcelTemplate, parseExcelFile } from '../utils/exportUtils';
import { Voter } from '../types';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({ isOpen, onClose }) => {
  const { importVoters, currentUser } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedVoters, setParsedVoters] = useState<Voter[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      setErrorMessage('Format file tidak didukung. Harap unggah file Excel (.xlsx, .xls) atau .csv.');
      return;
    }

    setSelectedFile(file);
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await parseExcelFile(file, currentUser.displayName || 'Admin Tim Inti');
      if (result.voters.length === 0) {
        setErrorMessage('Tidak ada baris data pemilih yang valid ditemukan dalam file Excel ini. Pastikan ada kolom nama pemilih.');
        setParsedVoters([]);
      } else {
        setParsedVoters(result.voters);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal membaca file Excel.';
      setErrorMessage(`Terjadi kesalahan saat memproses file Excel: ${msg}`);
      setParsedVoters([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (parsedVoters.length === 0) return;
    importVoters(parsedVoters);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setParsedVoters([]);
      setSelectedFile(null);
      onClose();
    }, 1500);
  };

  const resetSelection = () => {
    setSelectedFile(null);
    setParsedVoters([]);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Quick summary of parsed voters
  const usmanVotes = parsedVoters.filter(v => v.pilihan === 'usman').length;
  const tps1Votes = parsedVoters.filter(v => v.tps === 'TPS 01').length;
  const tps2Votes = parsedVoters.filter(v => v.tps === 'TPS 02').length;
  const tps3Votes = parsedVoters.filter(v => v.tps === 'TPS 03').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600/30 text-emerald-400 border border-emerald-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold">Import Data Pemilih dari Excel (.xlsx)</h4>
              <p className="text-xs text-slate-400">
                Otomatis mapping RT 01-28, TPS 01-03, dan pilihan suara Paman Usman
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {/* Action to download standard template */}
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="text-xs text-blue-900">
                <span className="font-bold">Belum punya format Excel?</span> Unduh template resmi DPT Desa Tracap (Lengkap dengan kolom RT 01-28 dan 3 TPS).
              </div>
            </div>
            <button
              onClick={downloadExcelTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex-shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Format Excel</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          {!selectedFile ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
                isDragOver ? 'border-emerald-500 bg-emerald-50/60' : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <FileUp className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                Pilih atau seret file Excel ke sini
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Mendukung file Microsoft Excel (.xlsx, .xls) atau CSV
              </p>
              <span className="inline-block mt-3 px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-[11px] font-semibold">
                Klik untuk Jelajahi File
              </span>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-emerald-600 text-white flex-shrink-0">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{selectedFile.name}</p>
                    <p className="text-[11px] text-slate-500">
                      Ukuran: {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetSelection}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
                  title="Ganti file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isLoading && (
                <div className="flex items-center justify-center gap-2 py-4 text-slate-600 text-xs font-medium">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Sedang membaca dan memvalidasi baris Excel...</span>
                </div>
              )}

              {parsedVoters.length > 0 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    <div className="p-2 bg-white rounded-lg border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-500 block">Total Baris</span>
                      <strong className="text-sm font-bold text-slate-900">{parsedVoters.length}</strong>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
                      <span className="text-[10px] text-emerald-700 block">Paman Usman</span>
                      <strong className="text-sm font-bold text-emerald-800">{usmanVotes}</strong>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg border border-blue-200 text-center">
                      <span className="text-[10px] text-blue-700 block">Distribusi TPS</span>
                      <strong className="text-xs font-bold text-blue-900">
                        01:{tps1Votes} | 02:{tps2Votes} | 03:{tps3Votes}
                      </strong>
                    </div>
                    <div className="p-2 bg-purple-50 rounded-lg border border-purple-200 text-center">
                      <span className="text-[10px] text-purple-700 block">Cakupan RT</span>
                      <strong className="text-xs font-bold text-purple-900">RT 01 - 28</strong>
                    </div>
                  </div>

                  {/* Preview Table (First 5 rows) */}
                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-1.5">
                      Pratinjau Data (5 dari {parsedVoters.length} pemilih):
                    </span>
                    <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-40">
                      <table className="w-full text-[11px] text-left">
                        <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                          <tr>
                            <th className="py-1.5 px-2">Nama</th>
                            <th className="py-1.5 px-2">RT</th>
                            <th className="py-1.5 px-2">TPS</th>
                            <th className="py-1.5 px-2">Pilihan</th>
                            <th className="py-1.5 px-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {parsedVoters.slice(0, 5).map((v, i) => (
                            <tr key={i}>
                              <td className="py-1 px-2 font-medium text-slate-900">{v.nama}</td>
                              <td className="py-1 px-2 text-slate-600 font-mono font-semibold">RT {v.rt}</td>
                              <td className="py-1 px-2 text-slate-700 font-semibold">{v.tps}</td>
                              <td className="py-1 px-2">
                                <span className={`font-bold ${v.pilihan === 'usman' ? 'text-emerald-700' : 'text-slate-600'}`}>
                                  {CANDIDATES[v.pilihan].shortName}
                                </span>
                              </td>
                              <td className="py-1 px-2 text-slate-500">{v.statusKehadiran}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-800 text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Berhasil mengimpor {parsedVoters.length} pemilih ke basis data Desa Tracap!</span>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
          >
            Tutup
          </button>

          <button
            id="confirm-import-excel-btn"
            onClick={handleConfirmImport}
            disabled={parsedVoters.length === 0 || isLoading || isSuccess}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs transition"
          >
            <Upload className="w-4 h-4" />
            <span>Impor {parsedVoters.length > 0 ? `${parsedVoters.length} Pemilih` : 'Data Excel'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
