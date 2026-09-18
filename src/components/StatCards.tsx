import React from 'react';
import {
  AlertCircle,
  Award,
  BarChart3,
  CheckCircle,
  Clock,
  Coins,
  Flame,
  Lock,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
  Vote,
} from 'lucide-react';
import { CANDIDATES } from '../data/candidates';
import { useApp } from '../context/AppContext';

export const StatCards: React.FC = () => {
  const {
    currentUser,
    totalDpt,
    totalUsman,
    totalMunjilin,
    totalMakful,
    totalSigit,
    totalUndecided,
    totalHadir,
    totalTembakKunci,
    totalNominalTembak,
  } = useApp();

  const usmanPercent = totalDpt > 0 ? ((totalUsman / totalDpt) * 100).toFixed(1) : '0';
  const munjilinPercent = totalDpt > 0 ? ((totalMunjilin / totalDpt) * 100).toFixed(1) : '0';
  const makfulPercent = totalDpt > 0 ? ((totalMakful / totalDpt) * 100).toFixed(1) : '0';
  const sigitPercent = totalDpt > 0 ? ((totalSigit / totalDpt) * 100).toFixed(1) : '0';
  const undecidedPercent = totalDpt > 0 ? ((totalUndecided / totalDpt) * 100).toFixed(1) : '0';
  const hadirPercent = totalDpt > 0 ? ((totalHadir / totalDpt) * 100).toFixed(1) : '0';
  const dikunciPercent = totalDpt > 0 ? ((totalTembakKunci / totalDpt) * 100).toFixed(1) : '0';

  // Lawan terkuat
  const opponents = [
    { name: 'Munjilin', votes: totalMunjilin, pct: munjilinPercent, color: 'text-orange-600' },
    { name: 'Makful', votes: totalMakful, pct: makfulPercent, color: 'text-sky-600' },
    { name: 'Sigit', votes: totalSigit, pct: sigitPercent, color: 'text-purple-600' },
  ].sort((a, b) => b.votes - a.votes);

  const topOpponent = opponents[0];
  const marginToLead = totalUsman - topOpponent.votes;

  return (
    <div className="space-y-4">
      
      {/* Top Banner Alert / Target Kemenangan */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-blue-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mt-0.5">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 uppercase tracking-wider font-mono">
                Peringkat 1
              </span>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                Basis Suara Ahmad Latif Usman (PAMAN USMAN)
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Memimpin dengan <span className="font-bold text-emerald-300">{totalUsman} suara ({usmanPercent}%)</span> di Desa Tracap. Unggul <span className="font-bold text-amber-300">+{marginToLead} suara</span> dari lawan terdekat ({topOpponent.name}: {topOpponent.votes} suara).
            </p>
          </div>
        </div>

        {/* Progress to 60% Victory Target */}
        <div className="w-full md:w-64 bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
          <div className="flex justify-between items-center text-xs mb-1.5 font-semibold">
            <span className="text-slate-300 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> Target Kemenangan
            </span>
            <span className="text-emerald-400 font-bold">{usmanPercent}% / 60%</span>
          </div>
          <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-green-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (Number(usmanPercent) / 60) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1 text-right">
            {Number(usmanPercent) >= 60 ? '✓ Target 60% tercapai' : `Butuh ${Math.max(0, Math.ceil(totalDpt * 0.6) - totalUsman)} suara lagi`}
          </p>
        </div>
      </div>

      {/* KHUSUS ADMIN: Tactical Panel Tembak & Kunci Suara (HANYA DILIHAT ADMIN) */}
      {currentUser.role === 'admin' && (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 rounded-2xl p-4 sm:p-5 border border-emerald-500/50 shadow-md text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                    Rahasia Tim Inti (Khusus Admin)
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" /> Akses Terproteksi
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  Rekapitulasi Suara Ditembak & Dikunci (3 TPS Desa Tracap)
                </h3>
                <p className="text-xs text-slate-300">
                  Data pemilih yang telah dikunci amunisi secara door-to-door. Nilai nominal dapat diubah oleh Admin.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
              <div className="bg-slate-800/80 px-4 py-2.5 rounded-xl border border-emerald-500/30 text-center">
                <span className="text-[11px] text-slate-400 block font-medium">Pemilih Terkunci</span>
                <div className="flex items-baseline justify-center gap-1.5 mt-0.5">
                  <span className="text-lg font-black text-emerald-400">{totalTembakKunci}</span>
                  <span className="text-xs text-slate-400">/ {totalDpt} ({dikunciPercent}%)</span>
                </div>
              </div>
              <div className="bg-slate-800/80 px-4 py-2.5 rounded-xl border border-amber-500/30 text-center">
                <span className="text-[11px] text-slate-400 block font-medium">Total Amunisi / Nominal</span>
                <span className="text-lg font-black text-amber-400 block mt-0.5">
                  Rp {totalNominalTembak.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Main KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Card 1: PAMAN USMAN */}
        <div className="col-span-2 lg:col-span-1 bg-gradient-to-b from-emerald-50 to-white border-2 border-emerald-500/80 rounded-2xl p-4 shadow-xs relative overflow-hidden">
          <div className="absolute -right-3 -top-3 w-16 h-16 bg-emerald-100 rounded-full opacity-50 blur-sm pointer-events-none" />
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Kandidat Utama</span>
            <Vote className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-base font-extrabold text-slate-900 truncate">
            Paman Usman
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">
              {totalUsman}
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md">
              {usmanPercent}%
            </span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-800 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Target Basis Aman</span>
          </div>
        </div>

        {/* Card 2: Munjilin (Lawan 1) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-orange-300 transition">
          <div className="flex items-center justify-between text-orange-700 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Lawan 1</span>
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          </div>
          <div className="text-sm font-bold text-slate-800 truncate">
            Munjilin
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-orange-600">
              {totalMunjilin}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              ({munjilinPercent}%)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 truncate">
            Selisih: -{totalUsman - totalMunjilin} suara
          </div>
        </div>

        {/* Card 3: Makful (Lawan 2) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-sky-300 transition">
          <div className="flex items-center justify-between text-sky-700 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Lawan 2</span>
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
          </div>
          <div className="text-sm font-bold text-slate-800 truncate">
            Makful
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-sky-600">
              {totalMakful}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              ({makfulPercent}%)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 truncate">
            Selisih: -{totalUsman - totalMakful} suara
          </div>
        </div>

        {/* Card 4: Sigit (Lawan 3) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-purple-300 transition">
          <div className="flex items-center justify-between text-purple-700 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Lawan 3</span>
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          </div>
          <div className="text-sm font-bold text-slate-800 truncate">
            Sigit
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-purple-600">
              {totalSigit}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              ({sigitPercent}%)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 truncate">
            Selisih: -{totalUsman - totalSigit} suara
          </div>
        </div>

        {/* Card 5: Swing / Undecided & Total DPT */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-slate-400 transition">
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Swing / Ragu</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-sm font-bold text-slate-800 truncate">
            Belum Menentukan
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-slate-700">
              {totalUndecided}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              ({undecidedPercent}%)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-blue-700 font-medium truncate">
            Total DPT: {totalDpt} Pemilih
          </div>
        </div>

      </div>
    </div>
  );
};
