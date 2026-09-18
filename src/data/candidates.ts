import { CandidateInfo, CandidateKey } from '../types';

export const CANDIDATES: Record<CandidateKey, CandidateInfo> = {
  usman: {
    id: 'usman',
    name: 'Ahmad Latif Usman (Paman Usman)',
    shortName: 'Paman Usman',
    color: '#16a34a', // vibrant green
    bgColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    borderColor: '#059669',
    isMainCandidate: true,
    avatar: '/logo_usman.jpg',
  },
  munjilin: {
    id: 'munjilin',
    name: 'Munjilin',
    shortName: 'Munjilin',
    color: '#ea580c', // orange
    bgColor: 'bg-orange-50 text-orange-800 border-orange-300',
    borderColor: '#c2410c',
  },
  makful: {
    id: 'makful',
    name: 'Makful',
    shortName: 'Makful',
    color: '#0284c7', // blue
    bgColor: 'bg-sky-50 text-sky-800 border-sky-300',
    borderColor: '#0369a1',
  },
  sigit: {
    id: 'sigit',
    name: 'Sigit',
    shortName: 'Sigit',
    color: '#9333ea', // purple
    bgColor: 'bg-purple-50 text-purple-800 border-purple-300',
    borderColor: '#7e22ce',
  },
  undecided: {
    id: 'undecided',
    name: 'Belum Menentukan (Swing)',
    shortName: 'Swing / Ragu',
    color: '#64748b', // slate gray
    bgColor: 'bg-slate-100 text-slate-700 border-slate-300',
    borderColor: '#475569',
  },
};

export const DUSUN_LIST = [
  'Dusun Krajan',
  'Dusun Tracap Kulon',
  'Dusun Tracap Wetan',
];

export const TPS_LIST = [
  'TPS 01',
  'TPS 02',
  'TPS 03',
];

// 28 RT list: RT 01 to RT 28
export const RT_LIST = Array.from({ length: 28 }, (_, i) => `0${i + 1}`.slice(-2));
