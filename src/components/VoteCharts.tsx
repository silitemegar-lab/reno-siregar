import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpDown,
  BarChart3,
  CheckCircle2,
  Compass,
  Filter,
  Lock,
  Search,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { CANDIDATES } from '../data/candidates';
import { useApp } from '../context/AppContext';
import { RTStat } from '../types';

export const VoteCharts: React.FC = () => {
  const {
    rtStats,
    totalDpt,
    totalUsman,
    totalMunjilin,
    totalMakful,
    totalSigit,
    totalUndecided,
    currentUser,
    selectedRtFilter,
    setSelectedRtFilter,
  } = useApp();

  // TPS Filter inside RT comparison view: 'all' | 'TPS 01' | 'TPS 02' | 'TPS 03'
  const [activeTpsGroup, setActiveTpsGroup] = useState<string>('all');
  const [rtSearchQuery, setRtSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<'number' | 'usman_desc' | 'usman_pct' | 'critical'>('number');

  // Candidate vote items for progress stack
  const candidateItems = [
    { ...CANDIDATES.usman, votes: totalUsman, barClass: 'bg-emerald-500' },
    { ...CANDIDATES.munjilin, votes: totalMunjilin, barClass: 'bg-orange-500' },
    { ...CANDIDATES.makful, votes: totalMakful, barClass: 'bg-sky-500' },
    { ...CANDIDATES.sigit, votes: totalSigit, barClass: 'bg-purple-500' },
    { ...CANDIDATES.undecided, votes: totalUndecided, barClass: 'bg-slate-400' },
  ];

  // Filter and Sort RT stats
  const filteredRtStats = useMemo(() => {
    let list = [...rtStats];

    // Filter by TPS group
    if (activeTpsGroup !== 'all') {
      list = list.filter(r => r.tps === activeTpsGroup);
    }

    // Search query (e.g. "01", "RT 05", "Krajan", etc.)
    if (rtSearchQuery.trim()) {
      const q = rtSearchQuery.toLowerCase();
      list = list.filter(
        r =>
          r.rt.includes(q) ||
          `rt ${r.rt}`.includes(q) ||
          r.dusun.toLowerCase().includes(q) ||
          r.tps.toLowerCase().includes(q)
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortOption === 'number') {
        return parseInt(a.rt, 10) - parseInt(b.rt, 10);
      }
      if (sortOption === 'usman_desc') {
        return b.usman - a.usman;
      }
      if (sortOption === 'usman_pct') {
        const aPct = a.totalDpt > 0 ? a.usman / a.totalDpt : 0;
        const bPct = b.totalDpt > 0 ? b.usman / b.totalDpt : 0;
        return bPct - aPct;
      }
      if (sortOption === 'critical') {
        // Critical: highest swing or dominant opponent
        const aScore = a.undecided + (a.munjilin + a.makful + a.sigit);
        const bScore = b.undecided + (b.munjilin + b.makful + b.sigit);
        return bScore - aScore;
      }
      return 0;
    });

    return list;
  }, [rtStats, activeTpsGroup, rtSearchQuery, sortOption]);

  // Evaluasi Taktis Per RT
  const strongestRT = useMemo(() => {
    return [...rtStats].sort((a, b) => {
      const aPct = a.totalDpt > 0 ? a.usman / a.totalDpt : 0;
      const bPct = b.totalDpt > 0 ? b.usman / b.totalDpt : 0;
      if (bPct !== aPct) return bPct - aPct;
      return b.usman - a.usman;
    })[0];
  }, [rtStats]);

  const criticalRTList = useMemo(() => {
    return rtStats
      .filter(r => r.statusBasis === 'Bersaing' || r.statusBasis === 'Dominan Lawan')
      .sort((a, b) => (b.undecided + b.munjilin + b.makful + b.sigit) - (a.undecided + a.munjilin + a.makful + a.sigit));
  }, [rtStats]);

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      
      {/* Kolom Kiri: Akumulasi Suara & Distribusi (5 cols) */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  Akumulasi Suara Real-Time
                </h3>
                <p className="text-xs text-slate-500">Perolehan suara Desa Tracap (3 TPS & 28 RT)</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
              Live Sync
            </span>
          </div>

          {/* Stacked Progress Bar */}
          <div className="mb-6">
            <div className="h-6 w-full rounded-xl overflow-hidden flex bg-slate-100 p-0.5 border border-slate-200 shadow-inner">
              {candidateItems.map(c => {
                const pct = totalDpt > 0 ? (c.votes / totalDpt) * 100 : 0;
                if (pct <= 0) return null;
                return (
                  <div
                    key={c.id}
                    style={{ width: `${pct}%` }}
                    className={`${c.barClass} h-full transition-all duration-500 first:rounded-l-[9px] last:rounded-r-[9px] relative group cursor-pointer`}
                    title={`${c.shortName}: ${c.votes} suara (${pct.toFixed(1)}%)`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 mt-1.5 px-0.5">
              <span>0%</span>
              <span>Total: {totalDpt} Pemilih Terdaftar</span>
              <span>100%</span>
            </div>
          </div>

          {/* Candidate Breakdown List */}
          <div className="space-y-2.5">
            {candidateItems.map(c => {
              const pct = totalDpt > 0 ? ((c.votes / totalDpt) * 100).toFixed(1) : '0';
              return (
                <div
                  key={c.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                    c.isMainCandidate
                      ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-200'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-3.5 h-3.5 rounded-md ${c.barClass} flex-shrink-0`} />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">
                        {c.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {c.isMainCandidate ? 'Calon Unggulan (Paman Usman)' : 'Kandidat Pesaing'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-extrabold text-slate-900">{c.votes}</span>
                    <span className="text-xs font-semibold text-slate-500 ml-1">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Insight Card */}
        <div className="mt-5 p-3.5 rounded-xl bg-blue-50/90 border border-blue-200 text-xs text-blue-900">
          <div className="font-bold flex items-center gap-1.5 text-blue-950 mb-1">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>Kondisi Elektoral 3 TPS Desa Tracap</span>
          </div>
          <p className="text-[11px] leading-relaxed text-blue-800">
            Ahmad Latif Usman (Paman Usman) mengantongi elektabilitas <span className="font-bold">{((totalUsman / (totalDpt || 1)) * 100).toFixed(1)}%</span>. Kunci kemenangan mutlak adalah merebut <span className="font-bold">{totalUndecided} pemilih swing</span> yang tersebar di 28 RT basis seimbang.
          </p>
        </div>

      </div>

      {/* Kolom Kanan: Analisis Perbandingan Per-RT (7 cols) */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          {/* Header & Controls */}
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight flex items-center gap-2">
                  <Compass className="w-5 h-5 text-blue-600" />
                  <span>Analisis Perbandingan Per-RT (28 RT)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Pemantauan peta perolehan suara per Rukun Tetangga di bawah 3 TPS Desa Tracap
                </p>
              </div>

              {selectedRtFilter !== 'all' && (
                <button
                  onClick={() => setSelectedRtFilter('all')}
                  className="self-start sm:self-auto text-[11px] px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold flex items-center gap-1 transition"
                  title="Hapus filter RT aktif"
                >
                  <span>Filter Aktif: RT {selectedRtFilter}</span>
                  <span className="text-blue-600 font-extrabold">✕</span>
                </button>
              )}
            </div>

            {/* Filter Tabs by TPS (3 TPS Desa Tracap) */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
              <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-semibold overflow-x-auto max-w-full">
                <button
                  id="filter-all-rt"
                  onClick={() => setActiveTpsGroup('all')}
                  className={`px-3 py-1 rounded-lg transition whitespace-nowrap ${
                    activeTpsGroup === 'all'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua (28 RT)
                </button>
                <button
                  id="filter-tps01-rt"
                  onClick={() => setActiveTpsGroup('TPS 01')}
                  className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                    activeTpsGroup === 'TPS 01'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  TPS 01 (RT 01-10)
                </button>
                <button
                  id="filter-tps02-rt"
                  onClick={() => setActiveTpsGroup('TPS 02')}
                  className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                    activeTpsGroup === 'TPS 02'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  TPS 02 (RT 11-19)
                </button>
                <button
                  id="filter-tps03-rt"
                  onClick={() => setActiveTpsGroup('TPS 03')}
                  className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                    activeTpsGroup === 'TPS 03'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  TPS 03 (RT 20-28)
                </button>
              </div>

              {/* Sorting & Search */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-36">
                  <input
                    type="text"
                    value={rtSearchQuery}
                    onChange={e => setRtSearchQuery(e.target.value)}
                    placeholder="Cari RT..."
                    className="w-full pl-7 pr-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                </div>

                <select
                  value={sortOption}
                  onChange={e => setSortOption(e.target.value as any)}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="number">Nomor RT (01-28)</option>
                  <option value="usman_desc">Suara Usman Terbanyak</option>
                  <option value="usman_pct">% Usman Tertinggi</option>
                  <option value="critical">Paling Rawan / Bersaing</option>
                </select>
              </div>
            </div>
          </div>

          {/* List Per-RT Comparison Items */}
          <div className="space-y-2.5 overflow-y-auto max-h-[360px] pr-1">
            {filteredRtStats.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                Tidak ada data RT yang cocok dengan filter pencarian.
              </div>
            ) : (
              filteredRtStats.map(stat => {
                const total = stat.usman + stat.munjilin + stat.makful + stat.sigit + stat.undecided;
                const usmanPct = total > 0 ? (stat.usman / total) * 100 : 0;
                const isSelected = selectedRtFilter === stat.rt;

                return (
                  <div
                    key={stat.rt}
                    onClick={() => {
                      if (selectedRtFilter === stat.rt) {
                        setSelectedRtFilter('all');
                      } else {
                        setSelectedRtFilter(stat.rt);
                      }
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-400/50 shadow-xs'
                        : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/20'
                    }`}
                    title={`Klik untuk memfilter pemilih RT ${stat.rt} di tabel bawah`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                          RT {stat.rt}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {stat.tps} • {stat.dusun.replace('Dusun ', '')}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            stat.statusBasis === 'Kuat Usman'
                              ? 'bg-emerald-100 text-emerald-800'
                              : stat.statusBasis === 'Bersaing'
                              ? 'bg-amber-100 text-amber-800'
                              : stat.statusBasis === 'Dominan Lawan'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {stat.statusBasis}
                        </span>
                      </div>

                      <div className="font-bold text-emerald-700">
                        Usman: {stat.usman} ({usmanPct.toFixed(0)}%)
                      </div>
                    </div>

                    {/* Progress Bar of this RT */}
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${usmanPct}%` }}
                        className="bg-emerald-500 h-full"
                        title={`Usman: ${stat.usman}`}
                      />
                      <div
                        style={{ width: `${total > 0 ? (stat.munjilin / total) * 100 : 0}%` }}
                        className="bg-orange-500 h-full"
                        title={`Munjilin: ${stat.munjilin}`}
                      />
                      <div
                        style={{ width: `${total > 0 ? (stat.makful / total) * 100 : 0}%` }}
                        className="bg-sky-500 h-full"
                        title={`Makful: ${stat.makful}`}
                      />
                      <div
                        style={{ width: `${total > 0 ? (stat.sigit / total) * 100 : 0}%` }}
                        className="bg-purple-500 h-full"
                        title={`Sigit: ${stat.sigit}`}
                      />
                      <div
                        style={{ width: `${total > 0 ? (stat.undecided / total) * 100 : 0}%` }}
                        className="bg-slate-300 h-full"
                        title={`Swing: ${stat.undecided}`}
                      />
                    </div>

                    {/* Detail Breakdown */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 font-mono flex-wrap gap-y-1">
                      <span>DPT: {stat.totalDpt}</span>
                      <span className="text-orange-600">Munjilin: {stat.munjilin}</span>
                      <span className="text-sky-600">Makful: {stat.makful}</span>
                      <span className="text-purple-600">Sigit: {stat.sigit}</span>
                      <span className="text-slate-600">Swing: {stat.undecided}</span>
                      {isAdmin && stat.totalTembakKunci > 0 && (
                        <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                          <Lock className="w-3 h-3" /> {stat.totalTembakKunci} Dikunci
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Strategic Evaluation Recommendations per RT */}
        <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
            <div className="font-bold flex items-center gap-1 text-emerald-950 mb-0.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>RT Lumbung Suara Utama</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-snug">
              {strongestRT ? (
                <>
                  <strong className="font-bold">RT {strongestRT.rt}</strong> ({strongestRT.tps} - {strongestRT.dusun}) unggul tertinggi dengan <strong className="font-bold">{strongestRT.usman} suara ({strongestRT.totalDpt > 0 ? ((strongestRT.usman / strongestRT.totalDpt) * 100).toFixed(0) : 0}%)</strong>. Pertahankan posko saksi.
                </>
              ) : (
                'Memuat data evaluasi...'
              )}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
            <div className="font-bold flex items-center gap-1 text-amber-950 mb-0.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>RT Prioritas Penetrasi Relawan</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-snug">
              {criticalRTList.length > 0 ? (
                <>
                  <strong className="font-bold">{criticalRTList.slice(0, 3).map(r => `RT ${r.rt}`).join(', ')}</strong> memiliki pemilih swing & persaingan ketat. Kerahkan door-to-door untuk mengunci suara.
                </>
              ) : (
                'Seluruh 28 RT berada dalam zona aman dominasi Paman Usman.'
              )}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
