import React, { useState } from 'react';
import {
  CheckCircle,
  Eye,
  Info,
  Map,
  MapPin,
  Maximize2,
  Navigation,
  Sparkles,
  Users,
} from 'lucide-react';
import { CANDIDATES } from '../data/candidates';
import { useApp } from '../context/AppContext';
import { TPSStat } from '../types';

export const RegionalMap: React.FC = () => {
  const { tpsStats, selectedTPSFilter, setSelectedTPSFilter } = useApp();
  const [hoveredTPS, setHoveredTPS] = useState<string | null>(null);

  const activeTPS = hoveredTPS || (selectedTPSFilter !== 'all' ? selectedTPSFilter : 'TPS 01');
  const activeStat = tpsStats.find(t => t.tps === activeTPS) || tpsStats[0];

  // Geometries for SVG map representing Desa Tracap (3 TPS Zones)
  // TPS 01: Dusun Krajan (RT 01 - RT 10)
  // TPS 02: Dusun Tracap Kulon (RT 11 - RT 19)
  // TPS 03: Dusun Tracap Wetan (RT 20 - RT 28)
  const tpsPolygons = [
    {
      id: 'TPS 01',
      dusun: 'Dusun Krajan',
      rtRange: 'RT 01 - RT 10',
      points: '40,40 250,40 240,320 40,320',
      center: { x: 140, y: 175 },
      label: 'TPS 01',
    },
    {
      id: 'TPS 02',
      dusun: 'Dusun Tracap Kulon',
      rtRange: 'RT 11 - RT 19',
      points: '250,40 480,40 470,180 245,180',
      center: { x: 360, y: 105 },
      label: 'TPS 02',
    },
    {
      id: 'TPS 03',
      dusun: 'Dusun Tracap Wetan',
      rtRange: 'RT 20 - RT 28',
      points: '245,180 470,180 460,320 240,320',
      center: { x: 360, y: 250 },
      label: 'TPS 03',
    },
  ];

  const getStatusFill = (stat?: TPSStat) => {
    if (!stat || stat.totalDpt === 0) return '#cbd5e1'; // slate-300
    if (stat.statusBasis === 'Kuat Usman') return '#22c55e'; // green-500
    if (stat.statusBasis === 'Bersaing') return '#f59e0b'; // amber-500
    return '#f43f5e'; // rose-500
  };

  const activeTotal = activeStat
    ? activeStat.usman + activeStat.munjilin + activeStat.makful + activeStat.sigit + activeStat.undecided
    : 0;
  const activeUsmanPct = activeTotal > 0 ? ((activeStat.usman / activeTotal) * 100).toFixed(1) : '0';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
            <Map className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              Pemetaan Wilayah Basis Suara Desa Tracap
            </h3>
            <p className="text-xs text-slate-500">
              Peta geospasial TPS & zonasi kekuatan suara Paman Usman vs Lawan
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50 p-2 rounded-xl border border-slate-200">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs" />
            <span className="text-slate-700 font-medium">Basis Kuat Usman (&gt;50%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-xs" />
            <span className="text-slate-700 font-medium">Bersaing / Swing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 shadow-xs" />
            <span className="text-slate-700 font-medium">Basis Lawan</span>
          </div>
        </div>
      </div>

      {/* Map Layout & Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        
        {/* SVG Map Canvas (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950 rounded-2xl p-4 border border-slate-800 shadow-inner relative overflow-hidden">
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-700/70 text-[11px] text-slate-300 font-mono">
            <Navigation className="w-3 h-3 text-blue-400" />
            <span>Peta Digital Desa Tracap (3 TPS & RT 01 - 28)</span>
          </div>

          <div className="absolute top-3 right-3 z-10 text-[10px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
            Klik bidang wilayah untuk filter tabel
          </div>

          <svg
            viewBox="0 0 520 360"
            className="w-full h-auto max-h-[340px] drop-shadow-lg select-none"
          >
            {/* Background grid lines for precision look */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="520" height="360" fill="url(#grid)" />

            {/* Polygon Zones */}
            {tpsPolygons.map(poly => {
              const stat = tpsStats.find(t => t.tps === poly.id);
              const isSelected = selectedTPSFilter === poly.id;
              const isHovered = hoveredTPS === poly.id;
              const fillColor = getStatusFill(stat);

              return (
                <g
                  key={poly.id}
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => {
                    setSelectedTPSFilter(selectedTPSFilter === poly.id ? 'all' : poly.id);
                  }}
                  onMouseEnter={() => setHoveredTPS(poly.id)}
                  onMouseLeave={() => setHoveredTPS(null)}
                >
                  <polygon
                    points={poly.points}
                    fill={fillColor}
                    fillOpacity={isHovered || isSelected ? 0.9 : 0.65}
                    stroke={isSelected ? '#ffffff' : '#0f172a'}
                    strokeWidth={isSelected ? 3.5 : 2}
                    className="transition-all duration-200"
                  />
                  {/* TPS Center Marker & Label */}
                  <circle
                    cx={poly.center.x}
                    cy={poly.center.y - 6}
                    r={isSelected ? 14 : 11}
                    fill="#0f172a"
                    stroke="#ffffff"
                    strokeWidth={1.5}
                  />
                  <text
                    x={poly.center.x}
                    y={poly.center.y - 2}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={isSelected ? '10' : '9'}
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    {poly.id.replace('TPS ', '')}
                  </text>
                  <text
                    x={poly.center.x}
                    y={poly.center.y + 14}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="600"
                    className="pointer-events-none drop-shadow"
                  >
                    {stat ? `${((stat.usman / (stat.totalDpt || 1)) * 100).toFixed(0)}%` : '0%'}
                  </text>
                </g>
              );
            })}

            {/* River / Road separator styling for realistic village look */}
            <path
              d="M 30,120 Q 150,140 230,130 T 490,135"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeDasharray="4 2"
              opacity="0.4"
            />
            <path
              d="M 230,30 Q 220,180 235,340"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="1.5"
              strokeDasharray="6 3"
              opacity="0.3"
            />
          </svg>

          {/* Map Footer Bar */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Wilayah: Desa Tracap, Kec. Kaliwiro, Wonosobo</span>
            </span>
            <span>
              Status Filter: <strong className="text-white">{selectedTPSFilter === 'all' ? 'Semua TPS' : selectedTPSFilter}</strong>
            </span>
          </div>
        </div>

        {/* Selected / Hovered TPS Detail Card (5 cols) */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Detail Geospasial Wilayah
                </span>
                <h4 className="text-lg font-black text-slate-900 leading-tight">
                  {activeStat?.tps} — {activeStat?.dusun}
                </h4>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  activeStat?.statusBasis === 'Kuat Usman'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : activeStat?.statusBasis === 'Bersaing'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {activeStat?.statusBasis}
              </span>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500">DPT Wilayah</span>
                <div className="text-lg font-extrabold text-slate-900">{activeStat?.totalDpt} Pemilih</div>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[11px] text-emerald-800 font-medium">Suara Paman Usman</span>
                <div className="text-lg font-extrabold text-emerald-700">
                  {activeStat?.usman} <span className="text-xs font-semibold">({activeUsmanPct}%)</span>
                </div>
              </div>
            </div>

            {/* Opponent Votes in this TPS */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                <span className="text-orange-800 font-semibold">Munjilin</span>
                <span className="font-bold text-slate-800">{activeStat?.munjilin} suara</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                <span className="text-sky-800 font-semibold">Makful</span>
                <span className="font-bold text-slate-800">{activeStat?.makful} suara</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                <span className="text-purple-800 font-semibold">Sigit</span>
                <span className="font-bold text-slate-800">{activeStat?.sigit} suara</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-600 font-semibold">Swing / Belum Menentukan</span>
                <span className="font-bold text-slate-800">{activeStat?.undecided} suara</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
            <button
              id="filter-tps-map-btn"
              onClick={() => setSelectedTPSFilter(activeStat?.tps || 'all')}
              className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition text-center"
            >
              Lihat Daftar Pemilih {activeStat?.tps}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
