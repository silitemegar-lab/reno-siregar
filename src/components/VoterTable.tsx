import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Coins,
  Crosshair,
  Edit2,
  Eye,
  FileSpreadsheet,
  Filter,
  Layers,
  Lock,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  UserCheck,
  Users,
  Vote,
  X,
} from 'lucide-react';
import { ExcelImportModal } from './ExcelImportModal';
import { CANDIDATES, DUSUN_LIST, RT_LIST, TPS_LIST } from '../data/candidates';
import { useApp } from '../context/AppContext';
import { CandidateKey, Voter } from '../types';
import { maskNIK } from '../utils/crypto';

export const VoterTable: React.FC = () => {
  const {
    voters,
    currentUser,
    isEncryptedView,
    selectedTPSFilter,
    selectedCandidateFilter,
    selectedRtFilter,
    searchQuery,
    setSelectedTPSFilter,
    setSelectedCandidateFilter,
    setSelectedRtFilter,
    setSearchQuery,
    addVoter,
    updateVoter,
    deleteVoter,
    quickSetVote,
    quickToggleAttendance,
    generateBulkData,
    updateTembakKunci,
  } = useApp();

  const isAdmin = currentUser.role === 'admin';

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExcelImportOpen, setIsExcelImportOpen] = useState(false);
  const [editingVoter, setEditingVoter] = useState<Voter | null>(null);
  const [selectedDetailVoter, setSelectedDetailVoter] = useState<Voter | null>(null);
  const [kunciModalVoter, setKunciModalVoter] = useState<Voter | null>(null);

  // Kunci Filter (Khusus Admin)
  const [selectedKunciFilter, setSelectedKunciFilter] = useState<'all' | 'locked' | 'unlocked'>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filtered Voters
  const filteredVoters = useMemo(() => {
    return voters.filter(v => {
      // Search (Nama, NIK, Dusun, RT - RW dihapus)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = v.nama.toLowerCase().includes(q);
        const matchNIK = v.nik.includes(q);
        const matchDusun = v.dusun.toLowerCase().includes(q);
        const matchRT = v.rt.includes(q);
        if (!matchName && !matchNIK && !matchDusun && !matchRT) return false;
      }

      // TPS filter (3 TPS)
      if (selectedTPSFilter !== 'all' && v.tps !== selectedTPSFilter) return false;

      // RT filter (RT 01 - RT 28)
      if (selectedRtFilter !== 'all') {
        const normVoterRt = `0${v.rt}`.slice(-2);
        if (normVoterRt !== selectedRtFilter) return false;
      }

      // Candidate filter
      if (selectedCandidateFilter !== 'all' && v.pilihan !== selectedCandidateFilter) return false;

      // Kunci filter (Hanya admin yang bisa memfilter status kunci)
      if (isAdmin && selectedKunciFilter !== 'all') {
        if (selectedKunciFilter === 'locked' && !v.statusTembakKunci) return false;
        if (selectedKunciFilter === 'unlocked' && v.statusTembakKunci) return false;
      }

      return true;
    });
  }, [voters, searchQuery, selectedTPSFilter, selectedRtFilter, selectedCandidateFilter, selectedKunciFilter, isAdmin]);

  const totalPages = Math.ceil(filteredVoters.length / itemsPerPage) || 1;
  const paginatedVoters = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVoters.slice(start, start + itemsPerPage);
  }, [filteredVoters, currentPage]);

  const handleDelete = (id: string, nama: string) => {
    if (!isAdmin) return;
    if (confirm(`Yakin ingin menghapus data pemilih '${nama}'?`)) {
      deleteVoter(id);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      
      {/* Top Controls & Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 leading-tight">
              Daftar Pemilih Tetap (DPT) Desa Tracap
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold font-mono">
              {filteredVoters.length} Pemilih
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Basis data pemilih dengan detail RT (RT 01 - 28), 3 TPS (TPS 01 - 03), dan status pilihan suara
          </p>
        </div>

        {/* Action Buttons for Admin */}
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin ? (
            <>
              <button
                id="open-add-voter-btn"
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Pemilih Manual</span>
              </button>

              <button
                id="table-import-excel-btn"
                onClick={() => setIsExcelImportOpen(true)}
                title="Import data pemilih dari Excel (.xlsx)"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
              >
                <Upload className="w-4 h-4" />
                <span>Import dari Excel</span>
              </button>

              <button
                id="generate-auto-btn"
                onClick={() => generateBulkData(20)}
                title="Tambahkan 20 data DPT Desa Tracap secara otomatis"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-slate-200 text-xs font-semibold transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>+20 Data Otomatis</span>
              </button>
            </>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-500" />
              <span>Mode Akses User: Hanya Melihat Data (Read-Only)</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
        
        {/* Search */}
        <div className="sm:col-span-12 md:col-span-3 relative">
          <input
            type="text"
            id="voter-search-input"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari nama, NIK, RT..."
            className="w-full pl-9 pr-4 py-2 bg-white rounded-lg border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* TPS Filter (3 TPS Desa Tracap) */}
        <div className="sm:col-span-6 md:col-span-2">
          <select
            id="filter-tps-select"
            value={selectedTPSFilter}
            onChange={e => {
              setSelectedTPSFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-2.5 py-2 bg-white rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua TPS (3 TPS)</option>
            {TPS_LIST.map(tps => (
              <option key={tps} value={tps}>
                {tps}
              </option>
            ))}
          </select>
        </div>

        {/* RT Filter (28 RT Desa Tracap) */}
        <div className="sm:col-span-6 md:col-span-2">
          <select
            id="filter-rt-select"
            value={selectedRtFilter}
            onChange={e => {
              setSelectedRtFilter(e.target.value);
              setCurrentPage(1);
            }}
            className={`w-full px-2.5 py-2 rounded-lg border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              selectedRtFilter !== 'all'
                ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                : 'bg-white border-slate-300 text-slate-700'
            }`}
          >
            <option value="all">Semua RT (28 RT)</option>
            {RT_LIST.map(rt => (
              <option key={rt} value={rt}>
                RT {rt}
              </option>
            ))}
          </select>
        </div>

        {/* Candidate Filter */}
        <div className={isAdmin ? 'sm:col-span-6 md:col-span-3' : 'sm:col-span-12 md:col-span-5'}>
          <select
            id="filter-candidate-select"
            value={selectedCandidateFilter}
            onChange={e => {
              setSelectedCandidateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-2.5 py-2 bg-white rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Pilihan Suara</option>
            <option value="usman">Paman Usman (Ahmad Latif Usman)</option>
            <option value="munjilin">Munjilin</option>
            <option value="makful">Makful</option>
            <option value="sigit">Sigit</option>
            <option value="undecided">Belum Menentukan / Swing</option>
          </select>
        </div>

        {/* Kunci Filter (Hanya Terlihat dan Bisa Digunakan oleh Admin) */}
        {isAdmin && (
          <div className="sm:col-span-6 md:col-span-2">
            <select
              id="filter-kunci-select"
              value={selectedKunciFilter}
              onChange={e => {
                setSelectedKunciFilter(e.target.value as 'all' | 'locked' | 'unlocked');
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 bg-amber-50 rounded-lg border border-amber-300 text-xs font-bold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">Status Kunci (Semua)</option>
              <option value="locked">🔒 Ditembak & Dikunci</option>
              <option value="unlocked">Belum Dikunci</option>
            </select>
          </div>
        )}

      </div>

      {/* Active Filter Indicators */}
      {(selectedRtFilter !== 'all' || selectedTPSFilter !== 'all' || selectedCandidateFilter !== 'all' || (isAdmin && selectedKunciFilter !== 'all') || searchQuery) && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3 px-1">
          <span className="text-[11px] font-semibold text-slate-400">Filter Aktif:</span>
          {selectedRtFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-[11px]">
              <span>RT {selectedRtFilter}</span>
              <button
                onClick={() => setSelectedRtFilter('all')}
                className="text-blue-600 hover:text-blue-900 ml-0.5"
                title="Hapus filter RT"
              >
                ✕
              </button>
            </span>
          )}
          {selectedTPSFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 font-bold text-[11px]">
              <span>{selectedTPSFilter}</span>
              <button
                onClick={() => setSelectedTPSFilter('all')}
                className="text-slate-600 hover:text-slate-900 ml-0.5"
                title="Hapus filter TPS"
              >
                ✕
              </button>
            </span>
          )}
          {selectedCandidateFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px]">
              <span>{CANDIDATES[selectedCandidateFilter as CandidateKey]?.shortName || selectedCandidateFilter}</span>
              <button
                onClick={() => setSelectedCandidateFilter('all')}
                className="text-emerald-600 hover:text-emerald-900 ml-0.5"
              >
                ✕
              </button>
            </span>
          )}
          {isAdmin && selectedKunciFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[11px]">
              <span>{selectedKunciFilter === 'locked' ? '🔒 Ditembak & Dikunci' : 'Belum Dikunci'}</span>
              <button
                onClick={() => setSelectedKunciFilter('all')}
                className="text-amber-700 hover:text-amber-900 ml-0.5"
              >
                ✕
              </button>
            </span>
          )}
          <button
            onClick={() => {
              setSelectedRtFilter('all');
              setSelectedTPSFilter('all');
              setSelectedCandidateFilter('all');
              setSelectedKunciFilter('all');
              setSearchQuery('');
            }}
            className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold ml-2 underline"
          >
            Reset Semua Filter
          </button>
        </div>
      )}

      {/* Main Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-3">Nama Pemilih</th>
              <th className="py-3 px-3">RT</th>
              <th className="py-3 px-3">TPS / Dusun</th>
              <th className="py-3 px-3">NIK</th>
              <th className="py-3 px-3">Pilihan Suara</th>
              <th className="py-3 px-3">Kehadiran</th>
              {isAdmin && (
                <th className="py-3 px-3 bg-amber-100/60 text-amber-950 border-l border-amber-200">
                  <div className="flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Tembak & Kunci</span>
                  </div>
                </th>
              )}
              <th className="py-3 px-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            {paginatedVoters.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 8 : 7} className="py-8 text-center text-slate-400">
                  <p className="text-sm font-semibold">Tidak ada data pemilih yang sesuai kriteria.</p>
                  <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian atau filter TPS.</p>
                </td>
              </tr>
            ) : (
              paginatedVoters.map(voter => {
                const candidate = CANDIDATES[voter.pilihan];
                return (
                  <tr
                    key={voter.id}
                    className="hover:bg-slate-50/80 transition group cursor-pointer"
                    onClick={() => setSelectedDetailVoter(voter)}
                  >
                    {/* Nama Pemilih */}
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{voter.nama}</span>
                        {voter.pilihan === 'usman' && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" title="Pendukung Paman Usman" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {voter.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}, {voter.usia} th
                      </div>
                    </td>

                    {/* RT (RT 01 - 28, RW Dihapus) */}
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-200 font-bold font-mono text-[11px]">
                        RT {voter.rt}
                      </span>
                    </td>

                    {/* TPS & Dusun */}
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-800">{voter.tps}</div>
                      <div className="text-[10px] text-slate-500">{voter.dusun}</div>
                    </td>

                    {/* NIK (Terkontrol Enkripsi) */}
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {maskNIK(voter.nik, isEncryptedView)}
                    </td>

                    {/* Pilihan Suara */}
                    <td className="py-2.5 px-3" onClick={e => e.stopPropagation()}>
                      {isAdmin ? (
                        <select
                          value={voter.pilihan}
                          onChange={e => quickSetVote(voter.id, e.target.value as CandidateKey)}
                          className={`text-xs font-bold px-2 py-1 rounded-lg border focus:outline-none ${candidate.bgColor}`}
                        >
                          <option value="usman">Paman Usman</option>
                          <option value="munjilin">Munjilin</option>
                          <option value="makful">Makful</option>
                          <option value="sigit">Sigit</option>
                          <option value="undecided">Swing / Ragu</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border ${candidate.bgColor}`}>
                          {candidate.shortName}
                        </span>
                      )}
                    </td>

                    {/* Kehadiran */}
                    <td className="py-2.5 px-3" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => isAdmin && quickToggleAttendance(voter.id)}
                        disabled={!isAdmin}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition ${
                          voter.statusKehadiran === 'hadir'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-slate-100 text-slate-500 border-slate-300'
                        }`}
                      >
                        {voter.statusKehadiran === 'hadir' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Hadir</span>
                          </>
                        ) : (
                          <span>Belum</span>
                        )}
                      </button>
                    </td>

                    {/* Tembak & Kunci (HANYA BISA DILIHAT & DIEDIT ADMIN) */}
                    {isAdmin && (
                      <td className="py-2.5 px-3 bg-amber-50/40 border-l border-amber-100" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          {voter.statusTembakKunci ? (
                            <button
                              onClick={() => setKunciModalVoter(voter)}
                              title="Klik untuk ubah nominal atau catatan kunci suara"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-300 font-bold text-[11px] transition shadow-2xs group"
                            >
                              <Lock className="w-3.5 h-3.5 text-emerald-700 group-hover:scale-110 transition-transform" />
                              <span>Rp {(voter.nominalTembak || 0).toLocaleString('id-ID')}</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setKunciModalVoter(voter)}
                              title="Klik untuk menembak & mengunci pemilih ini"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-500 hover:text-amber-900 border border-slate-200 hover:border-amber-300 text-[10px] font-semibold transition"
                            >
                              <Crosshair className="w-3 h-3 text-slate-400" />
                              <span>+ Kunci</span>
                            </button>
                          )}
                        </div>
                      </td>
                    )}

                    {/* Aksi */}
                    <td className="py-2.5 px-3 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedDetailVoter(voter)}
                          title="Lihat Detail Pemilih"
                          className="p-1 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {isAdmin && (
                          <>
                            <button
                              onClick={() => setEditingVoter(voter)}
                              title="Edit Data Pemilih"
                              className="p-1 rounded-md text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(voter.id, voter.nama)}
                              title="Hapus Pemilih"
                              className="p-1 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
        <div>
          Menampilkan {paginatedVoters.length} dari {filteredVoters.length} pemilih (Halaman {currentPage} dari {totalPages})
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-mono font-bold text-slate-700">{currentPage}</span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Detail Voter Modal (Shows Nama, RT, RW, NIK, etc.) */}
      {selectedDetailVoter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400">
                  Detail Data Pemilih Desa Tracap
                </span>
                <h4 className="text-lg font-black">{selectedDetailVoter.nama}</h4>
              </div>
              <button
                onClick={() => setSelectedDetailVoter(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              
              {/* Highlight Box: RT and TPS (RW Dihapus) */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 text-center">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 uppercase">Rukun Tetangga</span>
                  <div className="text-xl font-extrabold text-blue-950">RT {selectedDetailVoter.rt}</div>
                  <span className="text-[10px] text-blue-600">Wilayah RT 01 - 28</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-blue-700 uppercase">Tempat Pemungutan</span>
                  <div className="text-xl font-extrabold text-blue-950">{selectedDetailVoter.tps}</div>
                  <span className="text-[10px] text-blue-600">{selectedDetailVoter.dusun}</span>
                </div>
              </div>

              {/* Status Tembak & Kunci Suara (HANYA BISA DILIHAT OLEH ADMIN) */}
              {isAdmin && (
                <div className="p-3.5 bg-gradient-to-r from-amber-50 to-emerald-50 rounded-xl border border-amber-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-700" />
                      <span className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                        Status Kunci Suara (Khusus Admin)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setKunciModalVoter(selectedDetailVoter);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold transition shadow-2xs"
                    >
                      Ubah Status / Nominal
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-white/80 rounded-lg border border-amber-200">
                      <div className="text-[10px] text-slate-500 font-semibold">Status Operasi</div>
                      <div className="font-extrabold mt-0.5 flex items-center gap-1.5">
                        {selectedDetailVoter.statusTembakKunci ? (
                          <span className="text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> SUDAH DIKUNCI
                          </span>
                        ) : (
                          <span className="text-slate-500">BELUM DIKUNCI</span>
                        )}
                      </div>
                    </div>
                    <div className="p-2 bg-white/80 rounded-lg border border-amber-200">
                      <div className="text-[10px] text-slate-500 font-semibold">Nominal Amunisi</div>
                      <div className="font-extrabold text-emerald-800 text-sm mt-0.5">
                        {selectedDetailVoter.statusTembakKunci
                          ? `Rp ${(selectedDetailVoter.nominalTembak || 0).toLocaleString('id-ID')}`
                          : '-'}
                      </div>
                    </div>
                  </div>
                  {selectedDetailVoter.catatanKunci && (
                    <div className="mt-2 text-[11px] text-amber-900 bg-white/70 p-2 rounded-lg border border-amber-200">
                      <span className="font-bold">Catatan Kunci: </span>
                      <span>{selectedDetailVoter.catatanKunci}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Detail fields */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500">Nomor Induk Kependudukan (NIK)</span>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">
                    {maskNIK(selectedDetailVoter.nik, isEncryptedView)}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500">Dusun / Wilayah</span>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedDetailVoter.dusun}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500">Usia & Jenis Kelamin</span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {selectedDetailVoter.usia} Tahun ({selectedDetailVoter.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'})
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500">Status Pilihan Suara</span>
                  <div className="font-bold mt-0.5 flex items-center gap-1.5">
                    {selectedDetailVoter.pilihan === 'usman' && (
                      <img
                        src="/logo_usman.jpg"
                        alt="Usman"
                        className="w-5 h-5 rounded-full object-cover object-top border border-emerald-500"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${CANDIDATES[selectedDetailVoter.pilihan].bgColor}`}>
                      {CANDIDATES[selectedDetailVoter.pilihan].name}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500">Status Kehadiran TPS</span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {selectedDetailVoter.statusKehadiran === 'hadir' ? '✓ Sudah Hadir / Mencoblos' : 'Belum Hadir di TPS'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500">Kategori Pemilih</span>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedDetailVoter.kategoriPemilih}</div>
                </div>
              </div>

              {/* Notes & Audit */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500">Catatan Khusus Tim Sukses:</span>
                <p className="font-medium text-slate-800 mt-0.5 italic">
                  {selectedDetailVoter.catatan || 'Belum ada catatan khusus.'}
                </p>
              </div>

              <div className="text-[11px] text-slate-400 flex justify-between border-t border-slate-200 pt-3">
                <span>Diinput oleh: {selectedDetailVoter.petugasInput}</span>
                <span>Waktu: {selectedDetailVoter.waktuInput}</span>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedDetailVoter(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold"
                >
                  Tutup Rincian
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tembak & Kunci Suara (Khusus Admin) */}
      {isAdmin && kunciModalVoter && (
        <KunciSuaraModal
          isOpen={!!kunciModalVoter}
          onClose={() => setKunciModalVoter(null)}
          voter={kunciModalVoter}
        />
      )}

      {/* Add / Edit Voter Modal Form */}
      {(isAddModalOpen || editingVoter) && (
        <VoterFormModal
          isOpen={isAddModalOpen || !!editingVoter}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingVoter(null);
          }}
          initialData={editingVoter}
        />
      )}

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={isExcelImportOpen}
        onClose={() => setIsExcelImportOpen(false)}
      />

    </div>
  );
};

// Extracted Subcomponent: KunciSuaraModal (HANYA BISA DIAKSES & DIEDIT OLEH ADMIN)
interface KunciSuaraModalProps {
  isOpen: boolean;
  onClose: () => void;
  voter: Voter | null;
}

const KunciSuaraModal: React.FC<KunciSuaraModalProps> = ({ isOpen, onClose, voter }) => {
  const { updateTembakKunci } = useApp();
  const [status, setStatus] = useState<boolean>(voter?.statusTembakKunci ?? true);
  const [nominal, setNominal] = useState<number>(voter?.nominalTembak || 100000);
  const [catatan, setCatatan] = useState<string>(voter?.catatanKunci || '');

  React.useEffect(() => {
    if (voter) {
      setStatus(voter.statusTembakKunci ?? true);
      setNominal(voter.nominalTembak || 100000);
      setCatatan(voter.catatanKunci || '');
    }
  }, [voter]);

  if (!isOpen || !voter) return null;

  const quickNominals = [50000, 75000, 100000, 150000, 200000];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTembakKunci(voter.id, status, status ? Number(nominal) : 0, catatan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                Akses Terbatas: Hanya Admin
              </div>
              <h4 className="text-base font-bold text-white leading-tight">
                Operasi Tembak & Kunci Suara
              </h4>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          {/* Target Info */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[11px] text-slate-500 font-semibold">Nama Pemilih Target:</div>
            <div className="text-base font-extrabold text-slate-900">{voter.nama}</div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 font-mono">
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">RT {voter.rt}</span>
              <span>•</span>
              <span className="font-semibold text-slate-700">{voter.tps} ({voter.dusun})</span>
            </div>
          </div>

          {/* Status Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Status Tembak & Kunci *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus(true)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  status
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>SUDAH DIKUNCI</span>
              </button>
              <button
                type="button"
                onClick={() => setStatus(false)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  !status
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>BELUM DIKUNCI</span>
              </button>
            </div>
          </div>

          {/* Nominal Input & Quick Buttons (Visible only if status == true) */}
          {status && (
            <div className="space-y-2 p-3.5 bg-amber-50/70 rounded-xl border border-amber-200">
              <label className="block text-xs font-bold text-amber-950">
                Nominal Amunisi / Logistik (Rp) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-500">Rp</span>
                <input
                  type="number"
                  value={nominal}
                  onChange={e => setNominal(Number(e.target.value))}
                  min={0}
                  step={5000}
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm font-bold text-slate-900 bg-white rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              {/* Quick Nominal Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {quickNominals.map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNominal(n)}
                    className={`px-2 py-1 rounded-md text-[11px] font-bold border transition ${
                      nominal === n
                        ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400'
                    }`}
                  >
                    Rp {(n / 1000).toLocaleString('id-ID')}rb
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Catatan Kunci */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan Khusus Kunci Suara
            </label>
            <input
              type="text"
              value={catatan}
              onChange={e => setCatatan(e.target.value)}
              placeholder="Contoh: Titip amplop via Korlap RT 04 / Tokoh Pemuda"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Kunci Suara</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Extracted Subcomponent: VoterFormModal
interface VoterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Voter | null;
}

const VoterFormModal: React.FC<VoterFormModalProps> = ({ isOpen, onClose, initialData }) => {
  const { addVoter, updateVoter, currentUser } = useApp();
  const isAdmin = currentUser.role === 'admin';

  const [nama, setNama] = useState(initialData?.nama || '');
  const [nik, setNik] = useState(initialData?.nik || '330704');
  const [rt, setRt] = useState(initialData?.rt || '01');
  const [tps, setTps] = useState(initialData?.tps || 'TPS 01');
  const [dusun, setDusun] = useState(initialData?.dusun || 'Dusun Krajan');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>(initialData?.jenisKelamin || 'L');
  const [usia, setUsia] = useState<number>(initialData?.usia || 35);
  const [pilihan, setPilihan] = useState<CandidateKey>(initialData?.pilihan || 'usman');
  const [statusKehadiran, setStatusKehadiran] = useState<'hadir' | 'belum_hadir'>(
    initialData?.statusKehadiran || 'belum_hadir'
  );
  const [kategoriPemilih, setKategoriPemilih] = useState<Voter['kategoriPemilih']>(
    initialData?.kategoriPemilih || 'Pasti'
  );
  const [catatan, setCatatan] = useState(initialData?.catatan || '');

  // Tembak & Kunci fields (Khusus Admin)
  const [statusTembakKunci, setStatusTembakKunci] = useState<boolean>(initialData?.statusTembakKunci ?? false);
  const [nominalTembak, setNominalTembak] = useState<number>(initialData?.nominalTembak || 100000);
  const [catatanKunci, setCatatanKunci] = useState<string>(initialData?.catatanKunci || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      alert('Nama pemilih wajib diisi!');
      return;
    }

    const payload = {
      nama,
      nik,
      rt: `0${rt}`.slice(-2),
      tps,
      dusun,
      jenisKelamin,
      usia: Number(usia),
      pilihan,
      statusKehadiran,
      kategoriPemilih,
      catatan,
      ...(isAdmin
        ? {
            statusTembakKunci,
            nominalTembak: statusTembakKunci ? Number(nominalTembak) : 0,
            catatanKunci: statusTembakKunci ? catatanKunci : '',
          }
        : {}),
    };

    if (initialData) {
      updateVoter(initialData.id, payload);
    } else {
      addVoter(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Vote className="w-5 h-5 text-emerald-400" />
            <h4 className="text-base font-bold">
              {initialData ? 'Ubah Data Pemilih' : 'Input Manual Pemilih Baru Desa Tracap'}
            </h4>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 max-h-[85vh] overflow-y-auto">
          
          {/* Nama Pemilih */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Lengkap Pemilih *
            </label>
            <input
              type="text"
              id="form-voter-nama"
              value={nama}
              onChange={e => setNama(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              required
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          {/* RT Selection (RT 01 - 28) - RW Dihapus */}
          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-blue-900">
                Pilih Rukun Tetangga (RT 01 - 28) *
              </label>
              <span className="text-[10px] text-blue-700 font-semibold">
                Auto TPS & Dusun
              </span>
            </div>
            <select
              id="form-voter-rt"
              value={rt}
              onChange={e => {
                const selectedRt = e.target.value;
                setRt(selectedRt);
                const rtNum = parseInt(selectedRt, 10);
                if (rtNum >= 1 && rtNum <= 10) {
                  setTps('TPS 01');
                  setDusun('Dusun Krajan');
                } else if (rtNum >= 11 && rtNum <= 19) {
                  setTps('TPS 02');
                  setDusun('Dusun Tracap Kulon');
                } else if (rtNum >= 20 && rtNum <= 28) {
                  setTps('TPS 03');
                  setDusun('Dusun Tracap Wetan');
                }
              }}
              className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold font-mono"
            >
              {RT_LIST.map(rtNum => (
                <option key={rtNum} value={rtNum}>
                  RT {rtNum} (
                  {parseInt(rtNum, 10) <= 10
                    ? 'TPS 01 - Krajan'
                    : parseInt(rtNum, 10) <= 19
                    ? 'TPS 02 - Kulon'
                    : 'TPS 03 - Wetan'}
                  )
                </option>
              ))}
            </select>
          </div>

          {/* TPS & Dusun */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">TPS (3 TPS) *</label>
              <select
                id="form-voter-tps"
                value={tps}
                onChange={e => setTps(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TPS_LIST.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Dusun / Wilayah *</label>
              <select
                id="form-voter-dusun"
                value={dusun}
                onChange={e => setDusun(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DUSUN_LIST.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* NIK & Usia */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">NIK (16 Digit)</label>
              <input
                type="text"
                id="form-voter-nik"
                value={nik}
                onChange={e => setNik(e.target.value)}
                maxLength={16}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Usia & Kelamin</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  id="form-voter-usia"
                  value={usia}
                  onChange={e => setUsia(Number(e.target.value))}
                  min={17}
                  max={110}
                  className="w-20 px-2 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none font-mono text-center"
                />
                <select
                  id="form-voter-jk"
                  value={jenisKelamin}
                  onChange={e => setJenisKelamin(e.target.value as 'L' | 'P')}
                  className="flex-1 px-2 py-2 text-xs rounded-xl border border-slate-300 font-semibold"
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pilihan Suara (Paman Usman vs Lawan) */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Pilihan Suara Kandidat *
            </label>
            <select
              id="form-voter-pilihan"
              value={pilihan}
              onChange={e => setPilihan(e.target.value as CandidateKey)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="usman">✓ PAMAN USMAN (Ahmad Latif Usman)</option>
              <option value="munjilin">Munjilin</option>
              <option value="makful">Makful</option>
              <option value="sigit">Sigit</option>
              <option value="undecided">Belum Menentukan (Swing)</option>
            </select>
          </div>

          {/* Admin-Only: Tembak & Kunci Fields */}
          {isAdmin && (
            <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-300 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-bold text-amber-950 uppercase">
                    Operasi Kunci Suara (Khusus Admin)
                  </span>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={statusTembakKunci}
                    onChange={e => setStatusTembakKunci(e.target.checked)}
                    className="rounded border-amber-400 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span className="text-xs font-bold text-slate-800">Kunci Pemilih</span>
                </label>
              </div>

              {statusTembakKunci && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Nominal Amunisi (Rp)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-slate-500">Rp</span>
                      <input
                        type="number"
                        value={nominalTembak}
                        onChange={e => setNominalTembak(Number(e.target.value))}
                        min={0}
                        step={5000}
                        className="w-full pl-9 pr-3 py-1.5 text-xs font-bold rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Catatan Kunci Suara
                    </label>
                    <input
                      type="text"
                      value={catatanKunci}
                      onChange={e => setCatatanKunci(e.target.value)}
                      placeholder="Contoh: Aman, komitmen hadir TPS"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-amber-300 focus:outline-none"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Status Kehadiran & Kategori */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status Kehadiran</label>
              <select
                id="form-voter-hadir"
                value={statusKehadiran}
                onChange={e => setStatusKehadiran(e.target.value as 'hadir' | 'belum_hadir')}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-semibold"
              >
                <option value="belum_hadir">Belum Hadir</option>
                <option value="hadir">Sudah Hadir / Mencoblos</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Pemilih</label>
              <select
                id="form-voter-kategori"
                value={kategoriPemilih}
                onChange={e => setKategoriPemilih(e.target.value as Voter['kategoriPemilih'])}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-semibold"
              >
                <option value="Pasti">Pasti (Militan)</option>
                <option value="Potensial">Potensial</option>
                <option value="Ragu-ragu">Ragu-ragu</option>
                <option value="Lawan">Lawan</option>
              </select>
            </div>
          </div>

          {/* Catatan Tim Sukses */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan Tim Sukses Paman Usman
            </label>
            <input
              type="text"
              id="form-voter-catatan"
              value={catatan}
              onChange={e => setCatatan(e.target.value)}
              placeholder="Contoh: Tokoh pemuda RT 02, siap kawal TPS"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              id="save-voter-submit-btn"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition"
            >
              {initialData ? 'Simpan Perubahan' : 'Simpan Data Pemilih'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
