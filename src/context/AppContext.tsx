import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CANDIDATES, DUSUN_LIST, RT_LIST, TPS_LIST } from '../data/candidates';
import { generateVoterDataset, INITIAL_ACTIVITY_LOGS } from '../data/initialData';
import { ActivityLog, CandidateKey, DusunStat, RTStat, TPSStat, UserSession, Voter } from '../types';
import { generateChecksum } from '../utils/crypto';

interface AppContextType {
  voters: Voter[];
  currentUser: UserSession;
  isEncryptedView: boolean;
  isSyncing: boolean;
  lastSyncTime: string;
  checksum: string;
  activityLogs: ActivityLog[];
  unreadLogsCount: number;
  selectedTPSFilter: string;
  selectedCandidateFilter: string;
  selectedRtFilter: string;
  searchQuery: string;
  setSelectedTPSFilter: (tps: string) => void;
  setSelectedCandidateFilter: (candidate: string) => void;
  setSelectedRtFilter: (rt: string) => void;
  setSearchQuery: (query: string) => void;
  toggleEncryptionView: () => void;
  markLogsAsRead: () => void;
  login: (role: 'admin' | 'user', username: string, displayName?: string) => boolean;
  logout: () => void;
  addVoter: (voterData: Omit<Voter, 'id' | 'waktuInput' | 'petugasInput'>) => boolean;
  updateVoter: (id: string, updates: Partial<Voter>) => boolean;
  deleteVoter: (id: string) => boolean;
  quickSetVote: (id: string, pilihan: CandidateKey) => void;
  quickToggleAttendance: (id: string) => void;
  updateTembakKunci: (id: string, statusTembakKunci: boolean, nominalTembak?: number, catatanKunci?: string) => void;
  generateBulkData: (count: number) => void;
  importVoters: (imported: Voter[]) => void;
  syncNow: () => Promise<void>;
  resetData: () => void;
  tpsStats: TPSStat[];
  dusunStats: DusunStat[];
  rtStats: RTStat[];
  totalDpt: number;
  totalUsman: number;
  totalMunjilin: number;
  totalMakful: number;
  totalSigit: number;
  totalUndecided: number;
  totalHadir: number;
  totalTembakKunci: number;
  totalNominalTembak: number;
}

const STORAGE_KEY_VOTERS = 'paman_usman_voters_v1';
const STORAGE_KEY_LOGS = 'paman_usman_logs_v1';
const STORAGE_KEY_USER = 'paman_usman_user_v1';

const defaultAdminUser: UserSession = {
  username: 'admin',
  displayName: 'Koordinator Admin Tim Usman',
  role: 'admin',
  loginTime: new Date().toLocaleTimeString('id-ID'),
  token: 'AUTH_ADMIN_SECURE_TOKEN',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [voters, setVoters] = useState<Voter[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VOTERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load voters from localStorage', e);
    }
    return generateVoterDataset(85);
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load logs', e);
    }
    return INITIAL_ACTIVITY_LOGS;
  });

  const [currentUser, setCurrentUser] = useState<UserSession>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return defaultAdminUser;
  });

  const [isEncryptedView, setIsEncryptedView] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => new Date().toLocaleTimeString('id-ID'));
  const [unreadLogsCount, setUnreadLogsCount] = useState<number>(1);

  // Filters
  const [selectedTPSFilter, setSelectedTPSFilter] = useState<string>('all');
  const [selectedCandidateFilter, setSelectedCandidateFilter] = useState<string>('all');
  const [selectedRtFilter, setSelectedRtFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Persist voters
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_VOTERS, JSON.stringify(voters));
    } catch (e) {
      console.warn('Storage quota reached or disabled', e);
    }
  }, [voters]);

  // Persist logs
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(activityLogs));
    } catch (e) {
      console.warn('Storage quota for logs reached', e);
    }
  }, [activityLogs]);

  // Persist user
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
    } catch {
      // ignore
    }
  }, [currentUser]);

  const checksum = useMemo(() => generateChecksum(voters), [voters]);

  const addLog = (action: ActivityLog['action'], details: string, tps?: string) => {
    const newLog: ActivityLog = {
      id: 'ACT-' + Date.now().toString(36),
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      user: currentUser.displayName || currentUser.username,
      role: currentUser.role,
      action,
      details,
      tps,
    };
    setActivityLogs(prev => [newLog, ...prev.slice(0, 99)]);
    setUnreadLogsCount(prev => prev + 1);
  };

  const markLogsAsRead = () => {
    setUnreadLogsCount(0);
  };

  const toggleEncryptionView = () => {
    setIsEncryptedView(prev => !prev);
  };

  const login = (role: 'admin' | 'user', username: string, displayName?: string): boolean => {
    const session: UserSession = {
      username,
      displayName: displayName || (role === 'admin' ? 'Admin Tim Inti' : `Saksi Relawan (${username})`),
      role,
      loginTime: new Date().toLocaleTimeString('id-ID'),
      token: `SEC_${role.toUpperCase()}_${Date.now()}`,
    };
    setCurrentUser(session);
    addLog('SYNC', `Pengguna '${session.displayName}' (${role.toUpperCase()}) berhasil masuk sistem`);
    return true;
  };

  const logout = () => {
    const guestUser: UserSession = {
      username: 'user',
      displayName: 'Saksi / Relawan Pengamat',
      role: 'user',
      loginTime: new Date().toLocaleTimeString('id-ID'),
      token: `SEC_USER_GUEST`,
    };
    setCurrentUser(guestUser);
    addLog('SYNC', `Sesi keluar. Dialihkan ke mode Akses Publik/User (Lihat Data Saja)`);
  };

  const addVoter = (voterData: Omit<Voter, 'id' | 'waktuInput' | 'petugasInput'>): boolean => {
    if (currentUser.role !== 'admin') {
      alert('Akses Ditolak: Hanya Admin yang memiliki wewenang menambah data pemilih.');
      return false;
    }

    const newVoter: Voter = {
      ...voterData,
      id: `VOTER-${Date.now().toString().slice(-6)}`,
      waktuInput: new Date().toISOString().slice(0, 16).replace('T', ' '),
      petugasInput: currentUser.displayName || 'Admin Tim Inti',
    };

    setVoters(prev => [newVoter, ...prev]);
    addLog(
      'TAMBAH',
      `Menambahkan pemilih '${newVoter.nama}' di RT ${newVoter.rt} (${newVoter.tps}) - Pilihan: ${CANDIDATES[newVoter.pilihan].shortName}`,
      newVoter.tps
    );
    return true;
  };

  const updateVoter = (id: string, updates: Partial<Voter>): boolean => {
    if (currentUser.role !== 'admin') {
      alert('Akses Ditolak: Hanya Admin yang dapat memodifikasi data.');
      return false;
    }

    setVoters(prev =>
      prev.map(v => {
        if (v.id === id) {
          const updated = { ...v, ...updates };
          addLog(
            'EDIT',
            `Memperbarui data '${updated.nama}' di RT ${updated.rt} (${updated.tps})`,
            updated.tps
          );
          return updated;
        }
        return v;
      })
    );
    return true;
  };

  const deleteVoter = (id: string): boolean => {
    if (currentUser.role !== 'admin') {
      alert('Akses Ditolak: Hanya Admin yang dapat menghapus data pemilih.');
      return false;
    }

    const target = voters.find(v => v.id === id);
    if (!target) return false;

    setVoters(prev => prev.filter(v => v.id !== id));
    addLog('HAPUS', `Menghapus data pemilih '${target.nama}' (RT ${target.rt}, ${target.tps})`, target.tps);
    return true;
  };

  const quickSetVote = (id: string, pilihan: CandidateKey) => {
    if (currentUser.role !== 'admin') {
      alert('Akses Terbatas: Hanya Admin yang dapat mengubah pilihan suara langsung.');
      return;
    }
    setVoters(prev =>
      prev.map(v => {
        if (v.id === id) {
          const updated = { ...v, pilihan };
          addLog(
            'STATUS_SUARA',
            `Update pilihan suara '${v.nama}' (RT ${v.rt}) ke: ${CANDIDATES[pilihan].shortName}`,
            v.tps
          );
          return updated;
        }
        return v;
      })
    );
  };

  const quickToggleAttendance = (id: string) => {
    if (currentUser.role !== 'admin') {
      alert('Akses Terbatas: Hanya Admin yang dapat memperbarui absensi kehadiran.');
      return;
    }
    setVoters(prev =>
      prev.map(v => {
        if (v.id === id) {
          const newStatus = v.statusKehadiran === 'hadir' ? 'belum_hadir' : 'hadir';
          addLog(
            'STATUS_SUARA',
            `Status kehadiran '${v.nama}' diubah menjadi: ${newStatus === 'hadir' ? 'HADIR' : 'BELUM HADIR'}`,
            v.tps
          );
          return { ...v, statusKehadiran: newStatus };
        }
        return v;
      })
    );
  };

  const updateTembakKunci = (
    id: string,
    statusTembakKunci: boolean,
    nominalTembak?: number,
    catatanKunci?: string
  ) => {
    if (currentUser.role !== 'admin') {
      alert('Akses Ditolak: Fitur Tembak & Kunci hanya dapat diakses dan diubah oleh Admin.');
      return;
    }

    setVoters(prev =>
      prev.map(v => {
        if (v.id === id) {
          const assignedNominal = statusTembakKunci
            ? (nominalTembak !== undefined ? nominalTembak : (v.nominalTembak || 100000))
            : undefined;
          const assignedNote = statusTembakKunci
            ? (catatanKunci !== undefined ? catatanKunci : (v.catatanKunci || 'Terkunci rapat'))
            : undefined;

          const updated: Voter = {
            ...v,
            statusTembakKunci,
            nominalTembak: assignedNominal,
            catatanKunci: assignedNote,
          };

          addLog(
            'KUNCI_SUARA',
            `Status tembak & kunci pemilih '${v.nama}' (RT ${v.rt}): ${statusTembakKunci ? 'DIKUNCI' : 'DILEPAS'} | Nominal: Rp ${(assignedNominal || 0).toLocaleString('id-ID')}`,
            v.tps
          );
          return updated;
        }
        return v;
      })
    );
  };

  const generateBulkData = (count: number) => {
    if (currentUser.role !== 'admin') return;
    const startIndex = voters.length;
    const additional: Voter[] = [];
    for (let i = 0; i < count; i++) {
      additional.push({
        ...generateVoterDataset(1)[0],
        id: `VOTER-${2000 + startIndex + i}`,
        nama: `Warga Tracap ${startIndex + i + 1}`,
      });
    }
    setVoters(prev => [...additional, ...prev]);
    addLog('GENERATE', `Otomatis mengenerate ${count} data DPT simulasi Desa Tracap`);
  };

  const importVoters = (imported: Voter[]) => {
    if (currentUser.role !== 'admin') return;
    setVoters(prev => [...imported, ...prev]);
    addLog('GENERATE', `Berhasil mengimpor ${imported.length} data pemilih dari file eksternal`);
  };

  const syncNow = async () => {
    setIsSyncing(true);
    await new Promise(res => setTimeout(res, 800));
    const now = new Date().toLocaleTimeString('id-ID');
    setLastSyncTime(now);
    setIsSyncing(false);
    addLog('SYNC', `Sinkronisasi data terenkripsi perangkat selesai (Status: 100% Cocok, Checksum: ${checksum})`);
  };

  const resetData = () => {
    if (currentUser.role !== 'admin') return;
    const fresh = generateVoterDataset(85);
    setVoters(fresh);
    addLog('SYNC', `Reset data pemilih Desa Tracap ke konfigurasi awal basis data`);
  };

  // Aggregated Stats
  const {
    totalDpt,
    totalUsman,
    totalMunjilin,
    totalMakful,
    totalSigit,
    totalUndecided,
    totalHadir,
    totalTembakKunci,
    totalNominalTembak,
  } = useMemo(() => {
    let usman = 0;
    let munjilin = 0;
    let makful = 0;
    let sigit = 0;
    let undecided = 0;
    let hadir = 0;
    let totalDikunci = 0;
    let totalNominalKunci = 0;

    for (const v of voters) {
      if (v.pilihan === 'usman') usman++;
      else if (v.pilihan === 'munjilin') munjilin++;
      else if (v.pilihan === 'makful') makful++;
      else if (v.pilihan === 'sigit') sigit++;
      else undecided++;

      if (v.statusKehadiran === 'hadir') hadir++;

      if (v.statusTembakKunci) {
        totalDikunci++;
        totalNominalKunci += (v.nominalTembak || 0);
      }
    }

    return {
      totalDpt: voters.length,
      totalUsman: usman,
      totalMunjilin: munjilin,
      totalMakful: makful,
      totalSigit: sigit,
      totalUndecided: undecided,
      totalHadir: hadir,
      totalTembakKunci: totalDikunci,
      totalNominalTembak: totalNominalKunci,
    };
  }, [voters]);

  const tpsStats: TPSStat[] = useMemo(() => {
    const map: Record<string, TPSStat> = {};
    TPS_LIST.forEach((tps, idx) => {
      // Assign dusun based on index (TPS 01 -> Dusun Krajan, TPS 02 -> Dusun Tracap Kulon, TPS 03 -> Dusun Tracap Wetan)
      const dusun = DUSUN_LIST[idx % DUSUN_LIST.length];
      map[tps] = {
        tps,
        dusun,
        totalDpt: 0,
        usman: 0,
        munjilin: 0,
        makful: 0,
        sigit: 0,
        undecided: 0,
        hadir: 0,
        statusBasis: 'Belum Terjamah',
      };
    });

    voters.forEach(v => {
      if (!map[v.tps]) {
        map[v.tps] = {
          tps: v.tps,
          dusun: v.dusun,
          totalDpt: 0,
          usman: 0,
          munjilin: 0,
          makful: 0,
          sigit: 0,
          undecided: 0,
          hadir: 0,
          statusBasis: 'Belum Terjamah',
        };
      }
      const st = map[v.tps];
      st.totalDpt++;
      if (v.pilihan === 'usman') st.usman++;
      else if (v.pilihan === 'munjilin') st.munjilin++;
      else if (v.pilihan === 'makful') st.makful++;
      else if (v.pilihan === 'sigit') st.sigit++;
      else st.undecided++;

      if (v.statusKehadiran === 'hadir') st.hadir++;
    });

    return Object.values(map).map(stat => {
      const usmanRatio = stat.totalDpt > 0 ? stat.usman / stat.totalDpt : 0;
      const opponentSum = stat.munjilin + stat.makful + stat.sigit;
      const opponentRatio = stat.totalDpt > 0 ? opponentSum / stat.totalDpt : 0;

      let statusBasis: TPSStat['statusBasis'] = 'Belum Terjamah';
      if (stat.totalDpt === 0) {
        statusBasis = 'Belum Terjamah';
      } else if (usmanRatio >= 0.5) {
        statusBasis = 'Kuat Usman';
      } else if (usmanRatio >= opponentRatio && usmanRatio >= 0.35) {
        statusBasis = 'Bersaing';
      } else if (opponentRatio > usmanRatio) {
        statusBasis = 'Dominan Lawan';
      } else {
        statusBasis = 'Bersaing';
      }

      return { ...stat, statusBasis };
    });
  }, [voters]);

  const dusunStats: DusunStat[] = useMemo(() => {
    const map: Record<string, DusunStat> = {};
    DUSUN_LIST.forEach(d => {
      map[d] = {
        dusun: d,
        totalDpt: 0,
        usman: 0,
        munjilin: 0,
        makful: 0,
        sigit: 0,
        undecided: 0,
      };
    });

    voters.forEach(v => {
      if (!map[v.dusun]) {
        map[v.dusun] = {
          dusun: v.dusun,
          totalDpt: 0,
          usman: 0,
          munjilin: 0,
          makful: 0,
          sigit: 0,
          undecided: 0,
        };
      }
      const st = map[v.dusun];
      st.totalDpt++;
      if (v.pilihan === 'usman') st.usman++;
      else if (v.pilihan === 'munjilin') st.munjilin++;
      else if (v.pilihan === 'makful') st.makful++;
      else if (v.pilihan === 'sigit') st.sigit++;
      else st.undecided++;
    });

    return Object.values(map);
  }, [voters]);

  const rtStats: RTStat[] = useMemo(() => {
    const map: Record<string, RTStat> = {};
    RT_LIST.forEach(rtNum => {
      const num = parseInt(rtNum, 10);
      const tps = num <= 10 ? 'TPS 01' : num <= 19 ? 'TPS 02' : 'TPS 03';
      const dusun = num <= 10 ? 'Dusun Krajan' : num <= 19 ? 'Dusun Tracap Kulon' : 'Dusun Tracap Wetan';
      map[rtNum] = {
        rt: rtNum,
        tps,
        dusun,
        totalDpt: 0,
        usman: 0,
        munjilin: 0,
        makful: 0,
        sigit: 0,
        undecided: 0,
        hadir: 0,
        statusBasis: 'Belum Terjamah',
        totalTembakKunci: 0,
        totalNominalKunci: 0,
      };
    });

    voters.forEach(v => {
      const rtKey = `0${v.rt}`.slice(-2);
      if (map[rtKey]) {
        const st = map[rtKey];
        st.totalDpt++;
        if (v.pilihan === 'usman') st.usman++;
        else if (v.pilihan === 'munjilin') st.munjilin++;
        else if (v.pilihan === 'makful') st.makful++;
        else if (v.pilihan === 'sigit') st.sigit++;
        else st.undecided++;

        if (v.statusKehadiran === 'hadir') st.hadir++;

        if (v.statusTembakKunci) {
          st.totalTembakKunci++;
          st.totalNominalKunci += (v.nominalTembak || 0);
        }
      }
    });

    return Object.values(map).map(stat => {
      const usmanRatio = stat.totalDpt > 0 ? stat.usman / stat.totalDpt : 0;
      const opponentSum = stat.munjilin + stat.makful + stat.sigit;
      const opponentRatio = stat.totalDpt > 0 ? opponentSum / stat.totalDpt : 0;

      let statusBasis: RTStat['statusBasis'] = 'Belum Terjamah';
      if (stat.totalDpt === 0) {
        statusBasis = 'Belum Terjamah';
      } else if (usmanRatio >= 0.5) {
        statusBasis = 'Kuat Usman';
      } else if (usmanRatio >= opponentRatio && usmanRatio >= 0.35) {
        statusBasis = 'Bersaing';
      } else if (opponentRatio > usmanRatio) {
        statusBasis = 'Dominan Lawan';
      } else {
        statusBasis = 'Bersaing';
      }

      return { ...stat, statusBasis };
    });
  }, [voters]);

  return (
    <AppContext.Provider
      value={{
        voters,
        currentUser,
        isEncryptedView,
        isSyncing,
        lastSyncTime,
        checksum,
        activityLogs,
        unreadLogsCount,
        selectedTPSFilter,
        selectedCandidateFilter,
        selectedRtFilter,
        searchQuery,
        setSelectedTPSFilter,
        setSelectedCandidateFilter,
        setSelectedRtFilter,
        setSearchQuery,
        toggleEncryptionView,
        markLogsAsRead,
        login,
        logout,
        addVoter,
        updateVoter,
        deleteVoter,
        quickSetVote,
        quickToggleAttendance,
        updateTembakKunci,
        generateBulkData,
        importVoters,
        syncNow,
        resetData,
        tpsStats,
        dusunStats,
        rtStats,
        totalDpt,
        totalUsman,
        totalMunjilin,
        totalMakful,
        totalSigit,
        totalUndecided,
        totalHadir,
        totalTembakKunci,
        totalNominalTembak,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
