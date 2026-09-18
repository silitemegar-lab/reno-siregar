import { ActivityLog, CandidateKey, Voter } from '../types';

// Realistic voter names from Central Java / Desa Tracap area
const FIRST_NAMES = [
  'Ahmad', 'Bambang', 'Siti', 'Sri', 'Supriadi', 'Budi', 'Joko', 'Tri', 'Wahyu',
  'Nurul', 'Eko', 'Slamet', 'Agus', 'Widodo', 'Endang', 'Suwarno', 'Maryanto',
  'Kusnadi', 'Haryanto', 'Rukmini', 'Yuliani', 'Dwi', 'Untung', 'Wagiman',
  'Sutrisno', 'Hariyadi', 'Sunardi', 'Sumarni', 'Mulyono', 'Hartono', 'Purnomo'
];

const LAST_NAMES = [
  'Pratama', 'Santoso', 'Wibowo', 'Kusuma', 'Saputro', 'Lestari', 'Hidayat',
  'Kurniawan', 'Nugroho', 'Setiawan', 'Rahayu', 'Suryani', 'Utami', 'Purwanto',
  'Wijaya', 'Sugiarto', 'Subagyo', 'Iskandar', 'Suharto', 'Fauzi', 'Mawardi'
];

// Desa Tracap with 28 RTs and 3 TPS
// TPS 01: Dusun Krajan (RT 01 - RT 10)
// TPS 02: Dusun Tracap Kulon (RT 11 - RT 19)
// TPS 03: Dusun Tracap Wetan (RT 20 - RT 28)
const DUSUN_DATA = [
  {
    dusun: 'Dusun Krajan',
    tps: 'TPS 01',
    rts: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'],
  },
  {
    dusun: 'Dusun Tracap Kulon',
    tps: 'TPS 02',
    rts: ['11', '12', '13', '14', '15', '16', '17', '18', '19'],
  },
  {
    dusun: 'Dusun Tracap Wetan',
    tps: 'TPS 03',
    rts: ['20', '21', '22', '23', '24', '25', '26', '27', '28'],
  },
];

export function generateVoterRecord(index: number, candidatePref?: CandidateKey): Voter {
  const dusunInfo = DUSUN_DATA[index % DUSUN_DATA.length];
  const tps = dusunInfo.tps;
  const rt = dusunInfo.rts[index % dusunInfo.rts.length];

  const fn = FIRST_NAMES[index % FIRST_NAMES.length];
  const ln = LAST_NAMES[(index * 3 + 7) % LAST_NAMES.length];
  const nama = `${fn} ${ln}`;
  const gender: 'L' | 'P' = index % 2 === 0 ? 'L' : 'P';
  const usia = 17 + ((index * 7 + 13) % 65);

  // Distribution probability: Paman Usman strong lead, followed by Munjilin, Makful, Sigit, and Undecided
  let pilihan: CandidateKey = candidatePref || 'usman';
  if (!candidatePref) {
    const r = (index * 37 + 19) % 100;
    if (r < 52) pilihan = 'usman'; // 52% Paman Usman
    else if (r < 68) pilihan = 'munjilin'; // 16% Munjilin
    else if (r < 80) pilihan = 'makful'; // 12% Makful
    else if (r < 90) pilihan = 'sigit'; // 10% Sigit
    else pilihan = 'undecided'; // 10% Undecided
  }

  const categoryMap: Record<CandidateKey, Voter['kategoriPemilih']> = {
    usman: index % 4 === 0 ? 'Potensial' : 'Pasti',
    munjilin: 'Lawan',
    makful: 'Lawan',
    sigit: 'Lawan',
    undecided: 'Ragu-ragu',
  };

  const hadir: 'hadir' | 'belum_hadir' = (index % 3 !== 0) ? 'hadir' : 'belum_hadir';
  const nik = `330704${String(10 + (index % 20)).padStart(2, '0')}${String(100000 + index).slice(1)}0001`;

  // Status Tembak & Kunci khusus Admin (e.g. beberapa pemilih Paman Usman sudah dikunci dengan amunisi)
  const isKunci = pilihan === 'usman' && (index % 2 === 0);
  const nominalOptions = [50000, 75000, 100000, 150000];
  const nominalTembak = isKunci ? nominalOptions[index % nominalOptions.length] : undefined;

  return {
    id: `VOTER-${1000 + index}`,
    nik,
    nama,
    jenisKelamin: gender,
    usia,
    dusun: dusunInfo.dusun,
    rt: `0${rt}`.slice(-2),
    tps,
    pilihan,
    statusKehadiran: hadir,
    kategoriPemilih: categoryMap[pilihan],
    catatan: pilihan === 'usman' ? 'Keluarga tokoh masyarakat, militan Paman Usman' : undefined,
    waktuInput: new Date(Date.now() - (index * 3600000)).toISOString().slice(0, 16).replace('T', ' '),
    petugasInput: index % 2 === 0 ? 'Admin Tim Inti' : `Saksi ${tps}`,
    statusTembakKunci: isKunci,
    nominalTembak,
    catatanKunci: isKunci ? 'Telah disalurkan amunisi dan komitmen suara terkunci rapat' : undefined,
  };
}

export function generateVoterDataset(count: number = 80): Voter[] {
  const voters: Voter[] = [];
  for (let i = 0; i < count; i++) {
    voters.push(generateVoterRecord(i));
  }
  return voters;
}

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'ACT-01',
    timestamp: '2026-09-18 10:15',
    user: 'Admin Tim Inti',
    role: 'admin',
    action: 'GENERATE',
    details: 'Inisialisasi database DPT Desa Tracap untuk pemenangan Paman Usman',
    tps: 'Semua TPS',
  },
  {
    id: 'ACT-02',
    timestamp: '2026-09-18 10:20',
    user: 'Saksi TPS 01',
    role: 'user',
    action: 'STATUS_SUARA',
    details: 'Verifikasi pemilih Ahmad Pratama terkonfirmasi solid Paman Usman',
    tps: 'TPS 01',
  },
  {
    id: 'ACT-03',
    timestamp: '2026-09-18 10:35',
    user: 'Admin Tim Inti',
    role: 'admin',
    action: 'SYNC',
    details: 'Sinkronisasi data terenkripsi antar perangkat saksi TPS 01 s/d TPS 03 berhasil',
  },
  {
    id: 'ACT-04',
    timestamp: '2026-09-18 10:45',
    user: 'Admin Tim Inti',
    role: 'admin',
    action: 'KUNCI_SUARA',
    details: 'Penyaluran logistik amunisi & status tembak-kunci suara pemilih prioritas di RT 01-28',
    tps: 'TPS 01',
  },
];
