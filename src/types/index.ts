export type CandidateKey = 'usman' | 'munjilin' | 'makful' | 'sigit' | 'undecided';

export interface CandidateInfo {
  id: CandidateKey;
  name: string;
  shortName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  isMainCandidate?: boolean;
  avatar?: string;
}

export interface Voter {
  id: string;
  nik: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  usia: number;
  dusun: string;
  rt: string;
  tps: string;
  pilihan: CandidateKey;
  statusKehadiran: 'hadir' | 'belum_hadir';
  kategoriPemilih: 'Pasti' | 'Potensial' | 'Ragu-ragu' | 'Lawan';
  catatan?: string;
  waktuInput: string;
  petugasInput: string;
  // Field Operasi Khusus (HANYA BISA DILIHAT & DIEDIT ADMIN):
  statusTembakKunci?: boolean;
  nominalTembak?: number;
  catatanKunci?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  role: 'admin' | 'user';
  action: 'TAMBAH' | 'EDIT' | 'HAPUS' | 'SYNC' | 'GENERATE' | 'STATUS_SUARA' | 'KUNCI_SUARA';
  details: string;
  tps?: string;
}

export interface UserSession {
  username: string;
  displayName: string;
  role: 'admin' | 'user';
  tpsAssigned?: string;
  loginTime: string;
  token: string;
}

export interface TPSStat {
  tps: string;
  dusun: string;
  totalDpt: number;
  usman: number;
  munjilin: number;
  makful: number;
  sigit: number;
  undecided: number;
  hadir: number;
  statusBasis: 'Kuat Usman' | 'Bersaing' | 'Dominan Lawan' | 'Belum Terjamah';
}

export interface DusunStat {
  dusun: string;
  totalDpt: number;
  usman: number;
  munjilin: number;
  makful: number;
  sigit: number;
  undecided: number;
}

export interface RTStat {
  rt: string;
  tps: string;
  dusun: string;
  totalDpt: number;
  usman: number;
  munjilin: number;
  makful: number;
  sigit: number;
  undecided: number;
  hadir: number;
  statusBasis: 'Kuat Usman' | 'Bersaing' | 'Dominan Lawan' | 'Belum Terjamah';
  totalTembakKunci: number;
  totalNominalKunci: number;
}
