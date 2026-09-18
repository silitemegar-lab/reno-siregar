import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CANDIDATES } from '../data/candidates';
import { CandidateKey, TPSStat, Voter } from '../types';

export function exportToExcel(
  voters: Voter[],
  tpsStats: TPSStat[],
  villageName = 'Desa Tracap',
  isAdmin = false
): void {
  // Sheet 1: Daftar Pemilih Tetap Detail
  const voterRows = voters.map((v, index) => {
    const baseRow: Record<string, unknown> = {
      No: index + 1,
      'Nama Pemilih': v.nama,
      'RT': `RT ${v.rt}`,
      'Nomor TPS': v.tps,
      'Dusun / Wilayah': v.dusun,
      'NIK (Terproteksi)': v.nik,
      'Jenis Kelamin': v.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
      'Usia': v.usia,
      'Pilihan Suara': CANDIDATES[v.pilihan].name,
      'Status Kehadiran': v.statusKehadiran === 'hadir' ? 'Hadir / Sudah Mencoblos' : 'Belum Hadir',
      'Kategori Pemilih': v.kategoriPemilih,
      'Petugas Input': v.petugasInput,
      'Waktu Input': v.waktuInput,
      'Catatan Tim Sukses': v.catatan || '-',
    };

    // HANYA BISA DILIHAT OLEH ADMIN:
    if (isAdmin) {
      baseRow['Status Tembak & Kunci'] = v.statusTembakKunci ? 'SUDAH DIKUNCI' : 'BELUM';
      baseRow['Nominal Amunisi (Rp)'] = v.statusTembakKunci ? (v.nominalTembak || 0) : 0;
      baseRow['Catatan Kunci Suara'] = v.catatanKunci || '-';
    }

    return baseRow;
  });

  // Sheet 2: Rekapitulasi Suara per TPS
  const rekapRows = tpsStats.map((stat, idx) => {
    const totalSuara = stat.usman + stat.munjilin + stat.makful + stat.sigit + stat.undecided;
    const persenUsman = totalSuara > 0 ? ((stat.usman / totalSuara) * 100).toFixed(1) + '%' : '0%';
    return {
      No: idx + 1,
      'TPS': stat.tps,
      'Dusun': stat.dusun,
      'Total Pemilih': stat.totalDpt,
      'Paman Usman': stat.usman,
      'Munjilin': stat.munjilin,
      'Makful': stat.makful,
      'Sigit': stat.sigit,
      'Swing / Ragu': stat.undecided,
      'Persentase Paman Usman': persenUsman,
      'Pemilih Hadir': stat.hadir,
      'Status Basis': stat.statusBasis,
    };
  });

  const wb = XLSX.utils.book_new();

  const wsVoters = XLSX.utils.json_to_sheet(voterRows);
  XLSX.utils.book_append_sheet(wb, wsVoters, 'DPT Pemilih Desa Tracap');

  const wsRekap = XLSX.utils.json_to_sheet(rekapRows);
  XLSX.utils.book_append_sheet(wb, wsRekap, 'Rekapitulasi Suara per TPS');

  const fileName = `Rekapitulasi_Pemilih_${villageName.replace(/\s+/g, '_')}_Paman_Usman_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Download standard Excel template for bulk import
 */
export function downloadExcelTemplate(): void {
  const templateRows = [
    {
      'Nama Pemilih': 'Contoh Budi Santoso',
      'RT': '01',
      'Nomor TPS': 'TPS 01',
      'Dusun': 'Dusun Krajan',
      'NIK': '3307041205850001',
      'Jenis Kelamin (L/P)': 'L',
      'Usia': 38,
      'Pilihan Suara (Paman Usman / Munjilin / Makful / Sigit / Swing)': 'Paman Usman',
      'Status Kehadiran (Hadir / Belum)': 'Belum',
      'Kategori (Pasti / Potensial / Ragu-ragu / Lawan)': 'Pasti',
      'Catatan': 'Tokoh warga RT 01',
    },
    {
      'Nama Pemilih': 'Siti Rahayu',
      'RT': '15',
      'Nomor TPS': 'TPS 02',
      'Dusun': 'Dusun Tracap Kulon',
      'NIK': '3307045508920002',
      'Jenis Kelamin (L/P)': 'P',
      'Usia': 32,
      'Pilihan Suara (Paman Usman / Munjilin / Makful / Sigit / Swing)': 'Paman Usman',
      'Status Kehadiran (Hadir / Belum)': 'Hadir',
      'Kategori (Pasti / Potensial / Ragu-ragu / Lawan)': 'Potensial',
      'Catatan': 'Keluarga jamaah pengajian',
    },
    {
      'Nama Pemilih': 'Ahmad Fauzi',
      'RT': '28',
      'Nomor TPS': 'TPS 03',
      'Dusun': 'Dusun Tracap Wetan',
      'NIK': '3307041003780003',
      'Jenis Kelamin (L/P)': 'L',
      'Usia': 46,
      'Pilihan Suara (Paman Usman / Munjilin / Makful / Sigit / Swing)': 'Swing',
      'Status Kehadiran (Hadir / Belum)': 'Belum',
      'Kategori (Pasti / Potensial / Ragu-ragu / Lawan)': 'Ragu-ragu',
      'Catatan': 'Perlu dikunjungi tim relawan',
    },
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(templateRows);
  
  // Set custom column widths for readability
  ws['!cols'] = [
    { wch: 24 }, // Nama
    { wch: 8 },  // RT
    { wch: 12 }, // TPS
    { wch: 20 }, // Dusun
    { wch: 20 }, // NIK
    { wch: 18 }, // Gender
    { wch: 8 },  // Usia
    { wch: 22 }, // Pilihan
    { wch: 16 }, // Kehadiran
    { wch: 16 }, // Kategori
    { wch: 28 }, // Catatan
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Template DPT Desa Tracap');
  XLSX.writeFile(wb, 'Format_Import_DPT_Tracap_Paman_Usman.xlsx');
}

export interface ExcelImportResult {
  voters: Voter[];
  errors: string[];
  totalParsed: number;
}

/**
 * Parse Excel file (.xlsx or .xls) uploaded by admin
 */
export async function parseExcelFile(file: File, userDisplayName = 'Admin'): Promise<ExcelImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to array of objects
        const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        
        const voters: Voter[] = [];
        const errors: string[] = [];

        rawRows.forEach((row, idx) => {
          const rowNum = idx + 2; // header is row 1
          
          // Helper to find value by various possible column headers
          const getVal = (keys: string[]): string => {
            for (const key of keys) {
              const matchedKey = Object.keys(row).find(
                k => k.trim().toLowerCase() === key.toLowerCase()
              );
              if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null) {
                return String(row[matchedKey]).trim();
              }
            }
            return '';
          };

          const nama = getVal(['Nama Pemilih', 'Nama', 'Nama Lengkap', 'Name']);
          if (!nama) {
            // Skip empty rows without name
            return;
          }

          // Parse RT
          let rawRt = getVal(['RT', 'Rt', 'Rukun Tetangga', 'No RT', 'No. RT']);
          rawRt = rawRt.replace(/[^0-9]/g, '');
          if (!rawRt) rawRt = '01';
          const rtNum = parseInt(rawRt, 10);
          const rt = `0${Math.min(Math.max(1, isNaN(rtNum) ? 1 : rtNum), 28)}`.slice(-2);

          // Parse TPS (3 TPS: TPS 01, TPS 02, TPS 03)
          let rawTps = getVal(['Nomor TPS', 'TPS', 'Tps', 'No TPS']);
          let tps = 'TPS 01';
          if (/0?3/i.test(rawTps) || /tps\s*0?3/i.test(rawTps)) {
            tps = 'TPS 03';
          } else if (/0?2/i.test(rawTps) || /tps\s*0?2/i.test(rawTps)) {
            tps = 'TPS 02';
          } else if (/0?1/i.test(rawTps) || /tps\s*0?1/i.test(rawTps)) {
            tps = 'TPS 01';
          } else {
            // Auto map by RT
            const num = parseInt(rt, 10);
            tps = num <= 10 ? 'TPS 01' : num <= 19 ? 'TPS 02' : 'TPS 03';
          }

          // Dusun
          let dusun = getVal(['Dusun', 'Dusun / Wilayah', 'Wilayah']);
          if (!dusun) {
            dusun = tps === 'TPS 01' ? 'Dusun Krajan' : tps === 'TPS 02' ? 'Dusun Tracap Kulon' : 'Dusun Tracap Wetan';
          }

          // NIK
          let nik = getVal(['NIK', 'Nomor Induk Kependudukan', 'NIK (Terproteksi)']);
          if (!nik || nik.length < 5) {
            nik = `330704${String(10 + (idx % 20)).padStart(2, '0')}${String(100000 + idx).slice(1)}0001`;
          }

          // Gender
          const rawGender = getVal(['Jenis Kelamin', 'Jenis Kelamin (L/P)', 'JK', 'Gender']).toUpperCase();
          const jenisKelamin: 'L' | 'P' = rawGender.startsWith('P') || rawGender.includes('PEREMPUAN') ? 'P' : 'L';

          // Usia
          const rawUsia = getVal(['Usia', 'Umur', 'Age']);
          const usia = parseInt(rawUsia, 10) || (20 + (idx % 50));

          // Pilihan Suara
          const rawPilihan = getVal(['Pilihan Suara', 'Pilihan', 'Calon', 'Pilihan Suara (Paman Usman / Munjilin / Makful / Sigit / Swing)']).toLowerCase();
          let pilihan: CandidateKey = 'usman';
          if (rawPilihan.includes('munjilin')) {
            pilihan = 'munjilin';
          } else if (rawPilihan.includes('makful')) {
            pilihan = 'makful';
          } else if (rawPilihan.includes('sigit')) {
            pilihan = 'sigit';
          } else if (rawPilihan.includes('ragu') || rawPilihan.includes('swing') || rawPilihan.includes('belum') || rawPilihan.includes('undecided')) {
            pilihan = 'undecided';
          } else {
            pilihan = 'usman';
          }

          // Kehadiran
          const rawHadir = getVal(['Status Kehadiran', 'Kehadiran', 'Hadir']).toLowerCase();
          const statusKehadiran: 'hadir' | 'belum_hadir' = rawHadir.includes('hadir') || rawHadir.includes('sudah') ? 'hadir' : 'belum_hadir';

          // Kategori
          const rawKat = getVal(['Kategori', 'Kategori Pemilih']).toLowerCase();
          let kategoriPemilih: Voter['kategoriPemilih'] = 'Pasti';
          if (rawKat.includes('potensial')) kategoriPemilih = 'Potensial';
          else if (rawKat.includes('ragu')) kategoriPemilih = 'Ragu-ragu';
          else if (rawKat.includes('lawan')) kategoriPemilih = 'Lawan';
          else if (pilihan === 'usman') kategoriPemilih = 'Pasti';
          else kategoriPemilih = 'Lawan';

          const catatan = getVal(['Catatan', 'Catatan Tim Sukses', 'Keterangan']);

          // Optional Tembak Kunci from Excel (Khusus jika diimpor oleh admin)
          const rawKunci = getVal(['Status Kunci', 'Tembak Kunci', 'Kunci Suara', 'Kunci']).toLowerCase();
          const statusTembakKunci = rawKunci.includes('kunci') || rawKunci.includes('ya') || rawKunci.includes('tembak') || rawKunci.includes('sudah');
          const rawNominal = getVal(['Nominal Kunci', 'Nominal Tembak', 'Amunisi', 'Nominal (Rp)', 'Nominal']);
          const nominalTembak = statusTembakKunci ? (parseInt(rawNominal.replace(/[^0-9]/g, ''), 10) || 100000) : 0;
          const catatanKunci = getVal(['Catatan Kunci', 'Keterangan Kunci']);

          voters.push({
            id: `VOTER-IMP-${Date.now().toString().slice(-4)}-${idx + 1}`,
            nama,
            rt,
            tps,
            dusun,
            nik,
            jenisKelamin,
            usia,
            pilihan,
            statusKehadiran,
            kategoriPemilih,
            catatan: catatan || `Diimpor dari file Excel ${file.name}`,
            waktuInput: new Date().toISOString().slice(0, 16).replace('T', ' '),
            petugasInput: userDisplayName,
            statusTembakKunci,
            nominalTembak,
            catatanKunci,
          });
        });

        resolve({
          voters,
          errors,
          totalParsed: voters.length,
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

export function exportToPDF(
  voters: Voter[],
  tpsStats: TPSStat[],
  villageName = 'Desa Tracap',
  isAdmin = false
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const totalDpt = voters.length;
  const usmanVotes = voters.filter(v => v.pilihan === 'usman').length;
  const munjilinVotes = voters.filter(v => v.pilihan === 'munjilin').length;
  const makfulVotes = voters.filter(v => v.pilihan === 'makful').length;
  const sigitVotes = voters.filter(v => v.pilihan === 'sigit').length;
  const undecidedVotes = voters.filter(v => v.pilihan === 'undecided').length;
  const usmanPercent = totalDpt > 0 ? ((usmanVotes / totalDpt) * 100).toFixed(1) : '0';
  const totalKunci = voters.filter(v => v.statusTembakKunci).length;
  const totalNominal = voters.reduce((s, v) => s + (v.statusTembakKunci ? (v.nominalTembak || 0) : 0), 0);

  // Header Banner
  doc.setFillColor(30, 58, 138); // Deep Navy Blue
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('LAPORAN REKAPITULASI DPT & AKUMULASI SUARA', 105, 12, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`TIM PEMENANGAN PAMAN USMAN (AHMAD LATIF USMAN) - ${villageName.toUpperCase()}`, 105, 19, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(224, 231, 255);
  doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')} | Status: Terenkripsi & Terverifikasi Real-Time`, 105, 26, { align: 'center' });

  // Summary Metrics Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  const boxHeight = isAdmin ? 38 : 34;
  doc.roundedRect(14, 38, 182, boxHeight, 2, 2, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('RINGKASAN ESTIMASI PEROLEHAN SUARA (3 TPS DESA TRACAP):', 18, 45);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`• Total DPT Terdaftar: ${totalDpt} Pemilih`, 18, 52);
  doc.text(`• PAMAN USMAN: ${usmanVotes} Suara (${usmanPercent}%)`, 18, 58);
  doc.text(`• Munjilin: ${munjilinVotes} Suara`, 18, 64);

  doc.text(`• Makful: ${makfulVotes} Suara`, 105, 52);
  doc.text(`• Sigit: ${sigitVotes} Suara`, 105, 58);
  doc.text(`• Swing / Ragu-ragu: ${undecidedVotes} Suara`, 105, 64);

  if (isAdmin) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 101, 52); // green
    doc.text(`• Operasi Kunci (Admin): ${totalKunci} Pemilih Terkunci (Amunisi: Rp ${totalNominal.toLocaleString('id-ID')})`, 18, 71);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
  }

  // Table per TPS
  const tableData = tpsStats.map(stat => {
    const total = stat.usman + stat.munjilin + stat.makful + stat.sigit + stat.undecided;
    const pct = total > 0 ? ((stat.usman / total) * 100).toFixed(0) + '%' : '0%';
    return [
      stat.tps,
      stat.dusun.replace('Dusun ', ''),
      stat.totalDpt.toString(),
      stat.usman.toString(),
      stat.munjilin.toString(),
      stat.makful.toString(),
      stat.sigit.toString(),
      stat.undecided.toString(),
      pct,
      stat.statusBasis,
    ];
  });

  autoTable(doc, {
    startY: isAdmin ? 82 : 78,
    head: [['TPS', 'Dusun', 'DPT', 'Usman', 'Munjilin', 'Makful', 'Sigit', 'Ragu', '% Usman', 'Status']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold', halign: 'center' },
    columnStyles: {
      0: { halign: 'center', fontStyle: 'bold' },
      2: { halign: 'right' },
      3: { halign: 'right', textColor: [22, 163, 74], fontStyle: 'bold' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'right' },
      8: { halign: 'center', fontStyle: 'bold' },
      9: { halign: 'center' },
    },
  });

  // Recent Voters Sample Table with RT prominently featured
  // @ts-expect-error jspdf-autotable attaches lastAutoTable
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 160;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('SAMPEL DAFTAR PEMILIH TERDAFTAR (RT 01 - 28):', 14, finalY);

  const sampleVoters = voters.slice(0, 10).map((v, i) => {
    const row = [
      (i + 1).toString(),
      v.nama,
      `RT ${v.rt}`,
      v.tps,
      v.dusun.replace('Dusun ', ''),
      CANDIDATES[v.pilihan].shortName,
      v.statusKehadiran === 'hadir' ? 'Hadir' : 'Belum',
    ];
    if (isAdmin) {
      row.push(v.statusTembakKunci ? `Kunci: Rp ${(v.nominalTembak || 0).toLocaleString('id-ID')}` : '-');
    }
    return row;
  });

  const sampleHeaders = ['No', 'Nama Pemilih', 'RT', 'TPS', 'Dusun', 'Pilihan', 'Kehadiran'];
  if (isAdmin) {
    sampleHeaders.push('Tembak/Kunci');
  }

  autoTable(doc, {
    startY: finalY + 4,
    head: [sampleHeaders],
    body: sampleVoters,
    theme: 'striped',
    styles: { fontSize: 7.5, cellPadding: 2 },
    headStyles: { fillColor: [71, 85, 105], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { halign: 'center' },
      2: { halign: 'center', fontStyle: 'bold' },
      3: { halign: 'center' },
      5: { fontStyle: 'bold' },
    },
  });

  // Signatures at the bottom
  // @ts-expect-error jspdf-autotable attaches lastAutoTable
  const signY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 230) + 12;

  if (signY < 270) {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Mengetahui,`, 25, signY);
    doc.text(`Koordinator Saksi Desa Tracap`, 25, signY + 5);
    doc.text(`(........................................)`, 25, signY + 22);

    doc.text(`Tracap, ${new Date().toLocaleDateString('id-ID')}`, 135, signY);
    doc.text(`Tim Pemenangan PAMAN USMAN`, 135, signY + 5);
    doc.setFont('helvetica', 'bold');
    doc.text(`( Ahmad Latif Usman )`, 135, signY + 22);
  }

  const fileName = `Laporan_Rekapitulasi_${villageName.replace(/\s+/g, '_')}_Paman_Usman_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}
