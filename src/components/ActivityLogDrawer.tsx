import React, { useState } from 'react';
import {
  Activity,
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock,
  Filter,
  PlusCircle,
  RefreshCw,
  Trash2,
  User,
  Vote,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivityLog } from '../types';

interface ActivityLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityLogDrawer: React.FC<ActivityLogDrawerProps> = ({ isOpen, onClose }) => {
  const { activityLogs, markLogsAsRead } = useApp();
  const [filterAction, setFilterAction] = useState<string>('all');

  if (!isOpen) return null;

  const filteredLogs = activityLogs.filter(log => {
    if (filterAction === 'all') return true;
    return log.action === filterAction;
  });

  const getActionBadge = (action: ActivityLog['action']) => {
    switch (action) {
      case 'TAMBAH':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            TAMBAH
          </span>
        );
      case 'EDIT':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
            EDIT
          </span>
        );
      case 'STATUS_SUARA':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
            SUARA
          </span>
        );
      case 'HAPUS':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
            HAPUS
          </span>
        );
      case 'SYNC':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            SYNC
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
            OTOMATIS
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Log Aktivitas Real-Time</h3>
              <p className="text-xs text-slate-400">Pemantauan riwayat perubahan data pemilih</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter and Clear */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
          <select
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
            className="px-2.5 py-1.5 bg-white rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">Semua Jenis Aktivitas</option>
            <option value="TAMBAH">Input Pemilih</option>
            <option value="STATUS_SUARA">Pilihan Suara</option>
            <option value="EDIT">Ubah Data</option>
            <option value="HAPUS">Penghapusan</option>
            <option value="SYNC">Sinkronisasi</option>
          </select>

          <button
            onClick={() => markLogsAsRead()}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Tandai Terbaca</span>
          </button>
        </div>

        {/* List of activity items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Belum ada riwayat aktivitas yang sesuai filter.
            </div>
          ) : (
            filteredLogs.map(log => (
              <div key={log.id} className="pt-3 first:pt-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    {getActionBadge(log.action)}
                    <span className="font-bold text-xs text-slate-800 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      {log.user}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {log.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-700 pl-1 leading-relaxed">
                  {log.details}
                </p>
                {log.tps && (
                  <span className="inline-block mt-1 ml-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                    Lokasi: {log.tps}
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
          Tercatat otomatis secara real-time pada setiap perubahan basis data
        </div>

      </div>
    </div>
  );
};
