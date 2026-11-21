import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LayoutDashboard, UserCheck, Calendar as CalendarIcon, Users, BookOpen,
  Target, FileSearch, GitCommitHorizontal, CalendarRange, CalendarDays,
  FileText, Wrench, BookMarked, ClipboardCheck, Award, BarChart3,
  HeartHandshake, Settings, HelpCircle, Menu, X, ChevronLeft, ChevronRight,
  Sun, Moon, Cloud, Database, AlertTriangle, CheckCircle2, Info, Printer,
  Plus, Trash2, Edit3, ArrowUp, ArrowDown, Download, Upload, Sparkles,
  ShieldCheck, Copy, Check, RotateCcw, Lock, LogOut, Eye, EyeOff,
  KeyRound, User, Search
} from 'lucide-react';

// ============================================================================
// ============================================================================
// 1. KONFIGURASI TERPUSAT (APP CONFIG — TANPA KREDENSIAL & URL SENSITIF TERTANAM)
// ============================================================================
const APP_CONFIG = {
  appName: 'Digital Personal Workspace',
  appSubtitle: 'Personal Teacher Workspace',
  schoolDefault: {
    namaSekolah: 'SEKOLAH MENENGAH KEJURUAN NEGERI 1 GOMBONG',
    namaSekolahSingkat: 'SMK NEGERI 1 GOMBONG',
    pemerintah: 'PEMERINTAH PROVINSI JAWA TENGAH',
    dinas: 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
    npsn: '20330330',
    alamat: 'Jalan Wilis Nomor 15 Wero, Gombong, Kebumen Kode Pos 54416',
    telepon: '0287-472828',
    faksimile: '0287-472828',
    email: 'smkn1gombong@gmail.com',
    website: 'www.smkn1gombong.sch.id',
    logoJatengUrl: 'https://raw.githubusercontent.com/agungeko93/administrasi-guru/main/Logo%20Provinsi%20Jawa%20tengah.png',
    logoUrl: 'https://raw.githubusercontent.com/agungeko93/administrasi-guru/main/Logo_Stemsago.png',
    kepalaSekolah: 'Arif Sugianto, S.Pd., M.Pd.',
    nipKepalaSekolah: '19750412 200003 1 004',
  },
  programKeahlian: 'Teknik Otomotif',
  konsentrasiKeahlian: 'Teknik Sepeda Motor (TSM)',
  timezone: 'Asia/Jakarta',
  currency: 'IDR',
  storageKey: 'mototeach_workspace_v1_data',
  configKey: 'mototeach_workspace_v1_config',
  authSessionKey: 'mototeach_workspace_v1_session',
  authLocalAccountKey: 'mototeach_workspace_v1_local_auth',
};

// Fungsi hashing SHA-256 dengan salt lokal (Web Crypto API)
async function hashPasswordWithSalt(password: string, salt: string): Promise<string> {
  const material = `${salt}:${password}`;
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(material);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  let h = 0x811c9dc5;
  for (let i = 0; i < material.length; i++) {
    h ^= material.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return ('00000000' + (h >>> 0).toString(16)).slice(-8);
}

function generateSalt(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const arr = new Uint8Array(16);
    window.crypto.getRandomValues(arr);
    return Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// ============================================================================
// 2. DEFINISI TIPE DATA (TYPESCRIPT INTERFACES)
// ============================================================================
interface AppSettings {
  appsScriptUrl: string;
  apiToken: string;
  tahunAjaran: string;
  semester: 'Ganjil' | 'Genap';
  darkMode: boolean;
  kktpDefault: number;
  autoSyncOnLoad: boolean;
  onboardingCompleted: boolean;
}

interface TeacherProfile {
  id: string;
  namaLengkap: string;
  gelarDepan: string;
  gelarBelakang: string;
  nip: string;
  nuptk: string;
  pangkatGolongan: string;
  jabatan: string;
  namaSekolah: string;
  npsn: string;
  alamatSekolah: string;
  teleponSekolah: string;
  email: string;
  noHp: string;
  fotoUrl: string;
  mataPelajaran: string;
  konsentrasiKeahlian: string;
  tahunAjaran: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
}

type AgendaCategory =
  | 'Hari Efektif'
  | 'Libur Nasional'
  | 'Libur Sekolah'
  | 'Kegiatan Sekolah'
  | 'Asesmen'
  | 'Praktik Bengkel'
  | 'Kegiatan Industri'
  | 'Lainnya';

interface CalendarEvent {
  id: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  judul: string;
  kategori: AgendaCategory;
  semester: 'Ganjil' | 'Genap';
  keterangan: string;
}

interface SchoolClass {
  id: string;
  namaKelas: string;
  fase: 'E' | 'F';
  tingkat: 'X' | 'XI' | 'XII';
  tahunAjaran: string;
  semester: 'Ganjil' | 'Genap';
  waliKelas: string;
}

interface Student {
  id: string;
  nis: string;
  nisn: string;
  namaLengkap: string;
  jenisKelamin: 'L' | 'P';
  classId: string;
  statusAktif: 'Aktif' | 'Nonaktif';
  keterangan: string;
}

interface Subject {
  id: string;
  namaMapel: string;
  kelompok: string;
  programKeahlian: string;
  konsentrasiKeahlian: string;
  fase: 'E' | 'F';
  tingkat: 'X' | 'XI' | 'XII';
  jumlahJp: number;
  tahunAjaran: string;
  semester: 'Ganjil' | 'Genap';
  keterangan: string;
}

interface LearningOutcome {
  id: string;
  subjectId: string;
  fase: 'E' | 'F';
  elemen: string;
  deskripsiCp: string;
  tahunDokumen: string;
  sumberDokumen: string;
  statusAktif: boolean;
}

interface CPAnalysis {
  id: string;
  cpId: string;
  subjectId: string;
  fase: 'E' | 'F';
  elemen: string;
  kompetensi: string;
  lingkupMateri: string;
  kataKerjaOperasional: string;
  buktiKetercapaian: string;
  kebutuhanPraktik: string;
  aspekK3: string;
  keterangan: string;
}

interface ATPItem {
  id: string;
  subjectId: string;
  analysisId: string;
  fase: 'E' | 'F';
  tahunAjaran: string;
  semester: 'Ganjil' | 'Genap';
  elemen: string;
  kodeTp: string;
  tujuanPembelajaran: string;
  kompetensi: string;
  lingkupMateri: string;
  urutan: number;
  alokasiJp: number;
  keterangan: string;
}

interface ProtaItem {
  id: string;
  subjectId: string;
  atpId: string;
  fase: 'E' | 'F';
  tingkat: 'X' | 'XI' | 'XII';
  tahunAjaran: string;
  semester: 'Ganjil' | 'Genap';
  bulan: string;
  alokasiJp: number;
  keterangan: string;
}

interface PromesItem {
  id: string;
  protaId: string;
  subjectId: string;
  atpId: string;
  semester: 'Ganjil' | 'Genap';
  bulan: string;
  mingguKe: number;
  jp: number;
  jenisMinggu: 'Efektif' | 'Asesmen' | 'Tidak Efektif';
  keterangan: string;
}

interface TeachingModule {
  id: string;
  judulModul: string;
  subjectId: string;
  classId: string;
  atpId: string;
  fase: 'E' | 'F';
  semester: 'Ganjil' | 'Genap';
  tahunAjaran: string;
  alokasiWaktu: string;
  kompetensiAwal: string;
  profilLulusan: string;
  pemahamanBermakna: string;
  pertanyaanPemantik: string;
  modelPembelajaran: string;
  mediaSumber: string;
  pendahuluan: string;
  kegiatanInti: string;
  penutup: string;
  asesmenDiagnostik: string;
  asesmenFormatif: string;
  asesmenSumatif: string;
  remedialPengayaan: string;
  status: 'Draft' | 'Final' | 'Arsip';
  updatedAt: string;
}

interface Jobsheet {
  id: string;
  nomorJobsheet: string;
  judulPekerjaan: string;
  kategori: string;
  subjectId: string;
  fase: 'E' | 'F';
  alokasiWaktu: string;
  tujuanPraktik: string;
  dasarTeori: string;
  alatBahan: string;
  apd: string;
  keselamatanKerja: string;
  langkahKerja: string;
  tabelPengukuran: string;
  pertanyaanEvaluasi: string;
  driveUrl: string;
  updatedAt: string;
}

interface TeachingJournal {
  id: string;
  tanggal: string;
  jamKe: string;
  classId: string;
  subjectId: string;
  atpId: string;
  materi: string;
  kegiatan: string;
  hadir: number;
  tidakHadir: number;
  catatan: string;
  tindakLanjut: string;
}

interface AttendanceRecord {
  id: string;
  tanggal: string;
  classId: string;
  studentId: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';
  keterangan: string;
}

interface Assessment {
  id: string;
  judul: string;
  jenis: 'Diagnostik' | 'Formatif' | 'Sumatif' | 'Praktik Bengkel' | 'Proyek' | 'Sikap Kerja';
  subjectId: string;
  classId: string;
  atpId: string;
  tanggal: string;
  bobot: number;
  skorMaks: number;
  kktp: number;
  rubrikTsm: {
    persiapanAlat: number;
    penerapanK3: number;
    prosedurKerja: number;
    alatUkur: number;
    hasilPekerjaan: number;
    efisiensiWaktu: number;
    kerapianArea: number;
    pelaporan: number;
  };
}

interface GradeRecord {
  id: string;
  assessmentId: string;
  studentId: string;
  nilai: number;
  detailRubrik?: Record<string, number>;
  catatan: string;
}

interface FollowUpRecord {
  id: string;
  studentId: string;
  assessmentId: string;
  atpId: string;
  jenis: 'Remedial' | 'Pengayaan';
  nilaiAwal: number;
  program: string;
  tanggalPelaksanaan: string;
  nilaiAkhir: number;
  catatan: string;
}

interface WorkspaceDatabase {
  teacher: TeacherProfile;
  calendar: CalendarEvent[];
  classes: SchoolClass[];
  students: Student[];
  subjects: Subject[];
  cps: LearningOutcome[];
  cpAnalyses: CPAnalysis[];
  atps: ATPItem[];
  protas: ProtaItem[];
  promes: PromesItem[];
  modules: TeachingModule[];
  jobsheets: Jobsheet[];
  journals: TeachingJournal[];
  attendances: AttendanceRecord[];
  assessments: Assessment[];
  grades: GradeRecord[];
  followUps: FollowUpRecord[];
  lastUpdated: string;
  isDemoData?: boolean;
}

// ============================================================================
// 3. UTILITAS & DATA AWAL / DATA DEMO TSM
// ============================================================================
const uid = (prefix = 'id') =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const todayISO = () => new Date().toISOString().split('T')[0];

const DEFAULT_SETTINGS: AppSettings = {
  appsScriptUrl: '',
  apiToken: '',
  tahunAjaran: '2026/2027',
  semester: 'Ganjil',
  darkMode: false,
  kktpDefault: 75,
  autoSyncOnLoad: true,
  onboardingCompleted: true,
};

const EMPTY_TEACHER: TeacherProfile = {
  id: 'teacher-primary',
  namaLengkap: 'Agung Eko Setiono',
  gelarDepan: '',
  gelarBelakang: 'S.Pd., Gr.',
  nip: '19930815 202221 1 008',
  nuptk: '4147771672130093',
  pangkatGolongan: 'Penata Muda Tk. I / III.b',
  jabatan: 'Guru Produktif Teknik Sepeda Motor',
  namaSekolah: APP_CONFIG.schoolDefault.namaSekolah,
  npsn: APP_CONFIG.schoolDefault.npsn,
  alamatSekolah: APP_CONFIG.schoolDefault.alamat,
  teleponSekolah: APP_CONFIG.schoolDefault.telepon,
  email: 'agungekosetiono@smkn1gombong.sch.id',
  noHp: '0812-2700-1993',
  fotoUrl: '',
  mataPelajaran: 'Konsentrasi Keahlian Teknik Sepeda Motor',
  konsentrasiKeahlian: 'Teknik Sepeda Motor (TSM)',
  tahunAjaran: '2026/2027',
  kepalaSekolah: APP_CONFIG.schoolDefault.kepalaSekolah,
  nipKepalaSekolah: APP_CONFIG.schoolDefault.nipKepalaSekolah,
};

const createEmptyDatabase = (): WorkspaceDatabase => ({
  teacher: { ...EMPTY_TEACHER },
  calendar: [],
  classes: [],
  students: [],
  subjects: [],
  cps: [],
  cpAnalyses: [],
  atps: [],
  protas: [],
  promes: [],
  modules: [],
  jobsheets: [],
  journals: [],
  attendances: [],
  assessments: [],
  grades: [],
  followUps: [],
  lastUpdated: new Date().toISOString(),
  isDemoData: false,
});

const createDemoDatabase = (): WorkspaceDatabase => {
  const cls1 = 'cls-xi-tsm-1';
  const cls2 = 'cls-xi-tsm-2';
  const sub1 = 'sub-tsm-engine';
  const sub2 = 'sub-tsm-kelistrikan';
  const cp1 = 'cp-tsm-01';
  const cp2 = 'cp-tsm-02';
  const an1 = 'an-tsm-01';
  const atp1 = 'atp-tsm-01';
  const atp2 = 'atp-tsm-02';
  const atp3 = 'atp-tsm-03';
  const asm1 = 'asm-tsm-01';
  const asm2 = 'asm-tsm-02';

  const students: Student[] = [
    { id: 'std-01', nis: '241001', nisn: '0081234501', namaLengkap: 'Ahmad Fauzi Pratama', jenisKelamin: 'L', classId: cls1, statusAktif: 'Aktif', keterangan: 'DEMO' },
    { id: 'std-02', nis: '241002', nisn: '0081234502', namaLengkap: 'Bagas Saputra', jenisKelamin: 'L', classId: cls1, statusAktif: 'Aktif', keterangan: 'DEMO' },
    { id: 'std-03', nis: '241003', nisn: '0081234503', namaLengkap: 'Dimas Adi Nugroho', jenisKelamin: 'L', classId: cls1, statusAktif: 'Aktif', keterangan: 'DEMO' },
    { id: 'std-04', nis: '241004', nisn: '0081234504', namaLengkap: 'Eka Wahyu Ramadhan', jenisKelamin: 'L', classId: cls1, statusAktif: 'Aktif', keterangan: 'DEMO' },
    { id: 'std-05', nis: '241005', nisn: '0081234505', namaLengkap: 'Fajar Sidik Kurniawan', jenisKelamin: 'L', classId: cls1, statusAktif: 'Aktif', keterangan: 'DEMO' },
    { id: 'std-06', nis: '241006', nisn: '0081234506', namaLengkap: 'Galih Permana Putra', jenisKelamin: 'L', classId: cls2, statusAktif: 'Aktif', keterangan: 'DEMO' },
    { id: 'std-07', nis: '241007', nisn: '0081234507', namaLengkap: 'Hendra Wijaya', jenisKelamin: 'L', classId: cls2, statusAktif: 'Aktif', keterangan: 'DEMO' },
    { id: 'std-08', nis: '241008', nisn: '0081234508', namaLengkap: 'Nadia Putri Rahmawati', jenisKelamin: 'P', classId: cls2, statusAktif: 'Aktif', keterangan: 'DEMO' },
  ];

  return {
    teacher: { ...EMPTY_TEACHER },
    classes: [
      { id: cls1, namaKelas: 'XI TSM 1', fase: 'F', tingkat: 'XI', tahunAjaran: '2026/2027', semester: 'Ganjil', waliKelas: 'Agung Eko Setiono, S.Pd., Gr.' },
      { id: cls2, namaKelas: 'XI TSM 2', fase: 'F', tingkat: 'XI', tahunAjaran: '2026/2027', semester: 'Ganjil', waliKelas: 'Dra. Siti Aminah' },
    ],
    students,
    subjects: [
      {
        id: sub1,
        namaMapel: 'Perawatan dan Perbaikan Engine Sepeda Motor',
        kelompok: 'Kejuruan - Konsentrasi Keahlian',
        programKeahlian: 'Teknik Otomotif',
        konsentrasiKeahlian: 'Teknik Sepeda Motor',
        fase: 'F',
        tingkat: 'XI',
        jumlahJp: 108,
        tahunAjaran: '2026/2027',
        semester: 'Ganjil',
        keterangan: '[DEMO] Mata pelajaran produktif bengkel engine TSM',
      },
      {
        id: sub2,
        namaMapel: 'Sistem Kelistrikan dan Injeksi (PGM-FI / FI)',
        kelompok: 'Kejuruan - Konsentrasi Keahlian',
        programKeahlian: 'Teknik Otomotif',
        konsentrasiKeahlian: 'Teknik Sepeda Motor',
        fase: 'F',
        tingkat: 'XI',
        jumlahJp: 72,
        tahunAjaran: '2026/2027',
        semester: 'Ganjil',
        keterangan: '[DEMO] Diagnostik sensor & aktuator injeksi sepeda motor',
      },
    ],
    cps: [
      {
        id: cp1,
        subjectId: sub1,
        fase: 'F',
        elemen: 'Perawatan dan Perbaikan Engine Sepeda Motor',
        deskripsiCp: '[CONTOH DEMO — Silakan ganti dengan teks resmi Keputusan Kepala BSKAP terbaru] Pada akhir fase F, peserta didik mampu mendiagnosis gangguan atau kerusakan pada engine sepeda motor meliputi komponen utama engine, sistem pelumasan, sistem pendinginan, sistem bahan bakar, serta melakukan tindakan perawatan dan perbaikan sesuai SOP buku pedoman reparasi (BPR).',
        tahunDokumen: '2025',
        sumberDokumen: 'Contoh Input Guru (Sesuaikan dengan BSKAP Kemendikdasmen)',
        statusAktif: true,
      },
      {
        id: cp2,
        subjectId: sub2,
        fase: 'F',
        elemen: 'Perawatan dan Perbaikan Sistem Kelistrikan Sepeda Motor',
        deskripsiCp: '[CONTOH DEMO] Pada akhir fase F, peserta didik mampu mendiagnosis gangguan pada sistem pengapian, sistem pengisian, sistem starter, sistem penerangan, dan sistem manajemen engine (EMS/Injeksi) menggunakan diagnostic scanner dan multitester.',
        tahunDokumen: '2025',
        sumberDokumen: 'Contoh Input Guru (Sesuaikan dengan BSKAP Kemendikdasmen)',
        statusAktif: true,
      },
    ],
    cpAnalyses: [
      {
        id: an1,
        cpId: cp1,
        subjectId: sub1,
        fase: 'F',
        elemen: 'Perawatan dan Perbaikan Engine Sepeda Motor',
        kompetensi: 'Mendiagnosis gangguan, melakukan perawatan berkala, dan memperbaiki komponen mekanisme katup serta kepala silinder',
        lingkupMateri: 'Mekanisme katup (SOHC/DOHC), celah katup, kompresi silinder, sistem pelumasan & pendinginan',
        kataKerjaOperasional: 'Memeriksa, Mengukur, Menyetel, Mendiagnosis, Memperbaiki',
        buktiKetercapaian: 'Peserta didik mampu menyetel celah katup dengan feeler gauge sesuai spesifikasi BPR dan menghasilkan tekanan kompresi standar.',
        kebutuhanPraktik: 'Unit sepeda motor sport/cub 4-tak, feeler gauge, kunci T, kunci momen, compression tester, BPR Honda/Yamaha',
        aspekK3: 'Wearpack, sepatu safety, ventilasi gas buang (exhaust extractor), penampungan oli bekas',
        keterangan: '[DEMO]',
      },
    ],
    atps: [
      {
        id: atp1,
        subjectId: sub1,
        analysisId: an1,
        fase: 'F',
        tahunAjaran: '2026/2027',
        semester: 'Ganjil',
        elemen: 'Perawatan dan Perbaikan Engine Sepeda Motor',
        kodeTp: 'TP.11.1',
        tujuanPembelajaran: 'Menerapkan prosedur K3LH, penggunaan SST, dan pembacaan Buku Pedoman Reparasi (BPR) pada area bengkel TSM.',
        kompetensi: 'Menerapkan K3LH dan pembacaan BPR',
        lingkupMateri: 'K3 Bengkel, SST, Alat Ukur Mekanik',
        urutan: 1,
        alokasiJp: 12,
        keterangan: '[DEMO]',
      },
      {
        id: atp2,
        subjectId: sub1,
        analysisId: an1,
        fase: 'F',
        tahunAjaran: '2026/2027',
        semester: 'Ganjil',
        elemen: 'Perawatan dan Perbaikan Engine Sepeda Motor',
        kodeTp: 'TP.11.2',
        tujuanPembelajaran: 'Melakukan pemeriksaan, pengukuran celah katup, dan penyetelan mekanisme katup sepeda motor 4 langkah sesuai standar pabrikan.',
        kompetensi: 'Memeriksa dan menyetel mekanisme katup',
        lingkupMateri: 'Kepala Silinder & Mekanisme Katup',
        urutan: 2,
        alokasiJp: 18,
        keterangan: '[DEMO]',
      },
      {
        id: atp3,
        subjectId: sub2,
        analysisId: an1,
        fase: 'F',
        tahunAjaran: '2026/2027',
        semester: 'Ganjil',
        elemen: 'Perawatan dan Perbaikan Sistem Kelistrikan Sepeda Motor',
        kodeTp: 'TP.11.3',
        tujuanPembelajaran: 'Mendiagnosis kode kedipan MIL (Malfunction Indicator Lamp) dan membaca parameter sensor menggunakan diagnostic scanner.',
        kompetensi: 'Mendiagnosis sistem injeksi elektronik',
        lingkupMateri: 'Sensor TP, EOT, O2, dan Diagnostic Scanner',
        urutan: 3,
        alokasiJp: 18,
        keterangan: '[DEMO]',
      },
    ],
    protas: [
      { id: 'prota-1', subjectId: sub1, atpId: atp1, fase: 'F', tingkat: 'XI', tahunAjaran: '2026/2027', semester: 'Ganjil', bulan: 'Juli', alokasiJp: 12, keterangan: 'Minggu 3-4 Juli' },
      { id: 'prota-2', subjectId: sub1, atpId: atp2, fase: 'F', tingkat: 'XI', tahunAjaran: '2026/2027', semester: 'Ganjil', bulan: 'Agustus', alokasiJp: 18, keterangan: 'Praktik Bengkel Blok 1' },
      { id: 'prota-3', subjectId: sub2, atpId: atp3, fase: 'F', tingkat: 'XI', tahunAjaran: '2026/2027', semester: 'Ganjil', bulan: 'September', alokasiJp: 18, keterangan: 'Praktik Scanner FI' },
    ],
    promes: [
      { id: 'prm-1', protaId: 'prota-1', subjectId: sub1, atpId: atp1, semester: 'Ganjil', bulan: 'Juli', mingguKe: 3, jp: 6, jenisMinggu: 'Efektif', keterangan: 'Pengenalan K3 & BPR' },
      { id: 'prm-2', protaId: 'prota-1', subjectId: sub1, atpId: atp1, semester: 'Ganjil', bulan: 'Juli', mingguKe: 4, jp: 6, jenisMinggu: 'Efektif', keterangan: 'Kalibrasi Jangka Sorong & Mikrometer' },
      { id: 'prm-3', protaId: 'prota-2', subjectId: sub1, atpId: atp2, semester: 'Ganjil', bulan: 'Agustus', mingguKe: 1, jp: 6, jenisMinggu: 'Efektif', keterangan: 'Pembongkaran Cover Head' },
      { id: 'prm-4', protaId: 'prota-2', subjectId: sub1, atpId: atp2, semester: 'Ganjil', bulan: 'Agustus', mingguKe: 2, jp: 6, jenisMinggu: 'Efektif', keterangan: 'Penyetelan Celah Katup IN/EX' },
      { id: 'prm-5', protaId: 'prota-2', subjectId: sub1, atpId: atp2, semester: 'Ganjil', bulan: 'Agustus', mingguKe: 3, jp: 6, jenisMinggu: 'Asesmen', keterangan: 'Uji Praktik Penyetelan Katup' },
    ],
    modules: [
      {
        id: 'mod-01',
        judulModul: 'Modul Ajar: Penyetelan Celah Katup & Pemeriksaan Tekanan Kompresi',
        subjectId: sub1,
        classId: cls1,
        atpId: atp2,
        fase: 'F',
        semester: 'Ganjil',
        tahunAjaran: '2026/2027',
        alokasiWaktu: '3 Pertemuan (18 JP x 45 Menit)',
        kompetensiAwal: 'Peserta didik memahami prinsip kerja motor bakar 4 langkah (hisap, kompresi, usaha, buang) dan mampu menggunakan kunci pas/ring serta feeler gauge.',
        profilLulusan: 'Penalaran Kritis, Kemandirian, Kolaborasi, Keselamatan Kerja Industri (5R/5S)',
        pemahamanBermakna: 'Ketepatan celah katup sangat menentukan efisiensi volumetrik, tenaga mesin, konsumsi bahan bakar, dan keawetan komponen valve train.',
        pertanyaanPemantik: 'Mengapa mesin sepeda motor terdengar suara berisik (ngelitik) di bagian kepala silinder saat panas, atau justru sulit hidup saat dingin?',
        modelPembelajaran: 'Teaching Factory (TeFa) & Project Based Learning (PjBL)',
        mediaSumber: 'Unit Sepeda Motor Honda Supra X 125 / Beat FI, BPR Resmi, Feeler Gauge, Kunci L Penyetel Katup, Video Animasi Valve Timing.',
        pendahuluan: '1. Salam, doa bersama, dan pemeriksaan kelengkapan APD (wearpack & safety shoes).\n2. Safety briefing 5 menit sebelum masuk area stall bengkel.\n3. Apersepsi suara mesin dengan celah katup terlalu renggang vs terlalu rapat.',
        kegiatanInti: '1. Orientasi Masalah: Siswa mengamati gejala mesin brebet & kompresi rendah pada unit praktik.\n2. Eksplorasi BPR: Siswa mencari data spesifikasi celah katup IN dan EX pada Buku Pedoman Reparasi.\n3. Praktik Terbimbing: Menempatkan piston pada posisi TMA langkah kompresi (tanda T sejajar indeks), mengukur celah dengan feeler gauge, dan menyetel sesuai standar.\n4. Uji Nyala & Verifikasi: Menghidupkan mesin, memeriksa kebocoran oli, serta mencatat hasil pada Jobsheet.',
        penutup: '1. Penerapan 5R (Ringkas, Rapi, Resik, Rawat, Rajin) pada stall dan tool caddy.\n2. Refleksi temuan kendala saat mencari posisi TMA.\n3. Penyampaian agenda praktik berikutnya.',
        asesmenDiagnostik: 'Kuis singkat 5 soal tentang siklus 4-tak dan pembacaan skala feeler gauge.',
        asesmenFormatif: 'Observasi sikap kerja K3, ketepatan mencari posisi TMA, dan lembar kerja Jobsheet.',
        asesmenSumatif: 'Uji kinerja individu penyetelan katup berdurasi maksimal 25 menit dengan toleransi +/- 0.02 mm.',
        remedialPengayaan: 'Remedial: Pendampingan ulang pembacaan tanda TOP magnet dan feeler gauge. Pengayaan: Penyetelan katup tipe shim (DOHC).',
        status: 'Final',
        updatedAt: todayISO(),
      },
    ],
    jobsheets: [
      {
        id: 'js-01',
        nomorJobsheet: 'JS-TSM-XI-01',
        judulPekerjaan: 'Pemeriksaan dan Penyetelan Celah Katup (Valve Clearance)',
        kategori: 'Dasar mesin sepeda motor',
        subjectId: sub1,
        fase: 'F',
        alokasiWaktu: '6 JP (270 Menit)',
        tujuanPraktik: '1. Peserta didik mampu menentukan posisi TMA (Top Dead Center) langkah kompresi dengan tepat.\n2. Peserta didik mampu mengukur dan menyetel celah katup IN dan EX sesuai spesifikasi BPR.\n3. Peserta didik mampu menerapkan prosedur K3 dan budaya kerja 5R di bengkel TSM.',
        dasarTeori: 'Celah katup (valve clearance) diperlukan untuk mengkompensasi pemuaian batang katup akibat panas pembakaran. Celah terlalu rapat menyebabkan katup tidak menutup sempurna (kompresi bocor), sedangkan celah terlalu renggang menimbulkan suara berisik dan mengurangi durasi bukaan katup.',
        alatBahan: 'Alat: Tool set, Kunci T 8/10/14/17, Kunci L penyetel katup, Feeler gauge, Obeng min/plus, Fender cover.\nBahan: 1 Unit Sepeda Motor 4-Tak, Kain majun, BPR.',
        apd: 'Wearpack bengkel, Sepatu safety anti-slip, Sarung tangan mekanik.',
        keselamatanKerja: '1. Pastikan mesin dalam keadaan dingin (< 35°C) sebelum menyetel katup.\n2. Pasang selang pembuangan gas buang (exhaust duct) saat menghidupkan mesin.\n3. Letakkan baut/mur pada magnetic tray agar tidak hilang.',
        langkahKerja: '1. Tempatkan sepeda motor pada bike lift dengan standar tengah.\n2. Lepas cover body yang menghalangi tutup kepala silinder dan lubang intip magnet.\n3. Putar poros engkol berlawanan arah jarum jam hingga tanda "T" pada flywheel sejajar dengan tanda indeks pada crankcase (pastikan kedua rocker arm bebas).\n4. Ukur celah katup IN dan EX menggunakan feeler gauge sebelum penyetelan.\n5. Kendurkan mur pengunci, putar sekrup penyetel hingga feeler gauge terasa seret ringan, lalu kencangkan mur pengunci.\n6. Periksa ulang celah katup setelah pengencangan.\n7. Pasang kembali seluruh komponen dan uji hidup mesin.',
        tabelPengukuran: 'Katup Masuk (IN): Standar = 0.10 ± 0.02 mm | Hasil Awal = .... mm | Hasil Akhir = .... mm | Kesimpulan = Baik / Perlu Setel\nKatup Buang (EX): Standar = 0.12 ± 0.02 mm | Hasil Awal = .... mm | Hasil Akhir = .... mm | Kesimpulan = Baik / Perlu Setel',
        pertanyaanEvaluasi: '1. Bagaimana cara membedakan posisi TMA langkah kompresi dengan TMA langkah buang?\n2. Apa dampak teknis apabila celah katup EX disetel terlalu rapat?',
        driveUrl: '',
        updatedAt: todayISO(),
      },
    ],
    journals: [
      {
        id: 'jrn-01',
        tanggal: todayISO(),
        jamKe: '1 - 6',
        classId: cls1,
        subjectId: sub1,
        atpId: atp2,
        materi: 'Praktik Penyetelan Celah Katup Motor 4-Tak (Jobsheet JS-TSM-XI-01)',
        kegiatan: 'Safety briefing, demonstrasi penentuan posisi TMA kompresi, praktik kelompok 2 siswa per bike lift, pengujian suara mesin dan evaluasi.',
        hadir: 5,
        tidakHadir: 0,
        catatan: 'Seluruh siswa XI TSM 1 antusias. Kelompok 2 sempat keliru posisi TMA langkah buang namun berhasil diperbaiki.',
        tindakLanjut: 'Lanjutkan minggu depan ke pengukuran tekanan kompresi silinder.',
      },
    ],
    attendances: [
      { id: 'att-1', tanggal: todayISO(), classId: cls1, studentId: 'std-01', status: 'Hadir', keterangan: '' },
      { id: 'att-2', tanggal: todayISO(), classId: cls1, studentId: 'std-02', status: 'Hadir', keterangan: '' },
      { id: 'att-3', tanggal: todayISO(), classId: cls1, studentId: 'std-03', status: 'Hadir', keterangan: '' },
      { id: 'att-4', tanggal: todayISO(), classId: cls1, studentId: 'std-04', status: 'Hadir', keterangan: '' },
      { id: 'att-5', tanggal: todayISO(), classId: cls1, studentId: 'std-05', status: 'Hadir', keterangan: '' },
    ],
    assessments: [
      {
        id: asm1,
        judul: 'Uji Praktik Penyetelan Katup & K3 Bengkel',
        jenis: 'Praktik Bengkel',
        subjectId: sub1,
        classId: cls1,
        atpId: atp2,
        tanggal: todayISO(),
        bobot: 40,
        skorMaks: 100,
        kktp: 75,
        rubrikTsm: {
          persiapanAlat: 10,
          penerapanK3: 15,
          prosedurKerja: 20,
          alatUkur: 15,
          hasilPekerjaan: 20,
          efisiensiWaktu: 10,
          kerapianArea: 5,
          pelaporan: 5,
        },
      },
      {
        id: asm2,
        judul: 'Asesmen Formatif Teori Mekanisme Katup',
        jenis: 'Formatif',
        subjectId: sub1,
        classId: cls1,
        atpId: atp2,
        tanggal: todayISO(),
        bobot: 30,
        skorMaks: 100,
        kktp: 75,
        rubrikTsm: {
          persiapanAlat: 10,
          penerapanK3: 15,
          prosedurKerja: 20,
          alatUkur: 15,
          hasilPekerjaan: 20,
          efisiensiWaktu: 10,
          kerapianArea: 5,
          pelaporan: 5,
        },
      },
    ],
    grades: [
      { id: 'grd-1', assessmentId: asm1, studentId: 'std-01', nilai: 88, catatan: 'Sangat teliti menggunakan feeler gauge' },
      { id: 'grd-2', assessmentId: asm1, studentId: 'std-02', nilai: 82, catatan: 'Prosedur sesuai BPR' },
      { id: 'grd-3', assessmentId: asm1, studentId: 'std-03', nilai: 70, catatan: 'Perlu bimbingan menentukan TMA kompresi' },
      { id: 'grd-4', assessmentId: asm1, studentId: 'std-04', nilai: 92, catatan: 'Cepat, presisi, dan rapi 5R' },
      { id: 'grd-5', assessmentId: asm1, studentId: 'std-05', nilai: 78, catatan: 'Tuntas dengan baik' },
      { id: 'grd-6', assessmentId: asm2, studentId: 'std-01', nilai: 85, catatan: '' },
      { id: 'grd-7', assessmentId: asm2, studentId: 'std-02', nilai: 80, catatan: '' },
      { id: 'grd-8', assessmentId: asm2, studentId: 'std-03', nilai: 72, catatan: '' },
      { id: 'grd-9', assessmentId: asm2, studentId: 'std-04', nilai: 90, catatan: '' },
      { id: 'grd-10', assessmentId: asm2, studentId: 'std-05', nilai: 76, catatan: '' },
    ],
    followUps: [
      {
        id: 'fu-01',
        studentId: 'std-03',
        assessmentId: asm1,
        atpId: atp2,
        jenis: 'Remedial',
        nilaiAwal: 70,
        program: 'Praktik terbimbing penentuan tanda TOP flywheel & pengukuran feeler gauge pada unit trainer Supra X 125',
        tanggalPelaksanaan: todayISO(),
        nilaiAkhir: 80,
        catatan: 'Sudah tuntas setelah bimbingan praktik individu.',
      },
    ],
    calendar: [
      { id: 'cal-1', tanggalMulai: '2026-07-13', tanggalSelesai: '2026-07-13', judul: 'Awal Tahun Ajaran 2026/2027', kategori: 'Hari Efektif', semester: 'Ganjil', keterangan: 'Hari pertama masuk sekolah' },
      { id: 'cal-2', tanggalMulai: '2026-08-17', tanggalSelesai: '2026-08-17', judul: 'HUT Kemerdekaan RI ke-81', kategori: 'Libur Nasional', semester: 'Ganjil', keterangan: 'Upacara bendera & libur nasional' },
      { id: 'cal-3', tanggalMulai: '2026-09-21', tanggalSelesai: '2026-09-25', judul: 'Asesmen Tengah Semester (ATS) Ganjil', kategori: 'Asesmen', semester: 'Ganjil', keterangan: 'Ujian teori & praktik bengkel TSM' },
      { id: 'cal-4', tanggalMulai: '2026-10-12', tanggalSelesai: '2026-10-16', judul: 'Kunjungan Industri & Sinkronisasi Kurikulum Astra Honda', kategori: 'Kegiatan Industri', semester: 'Ganjil', keterangan: 'Program kelas industri TSM' },
      { id: 'cal-5', tanggalMulai: '2026-11-30', tanggalSelesai: '2026-12-05', judul: 'Asesmen Sumatif Akhir Semester (ASAS)', kategori: 'Asesmen', semester: 'Ganjil', keterangan: 'Penilaian akhir semester ganjil' },
    ],
    lastUpdated: new Date().toISOString(),
    isDemoData: true,
  };
};

// ============================================================================
// 4. APPLICATION / API LAYER (apiService.ts)
// ============================================================================
class MotoTeachApiService {
  private inflightWrites = new Set<string>();

  async testConnection(
    url: string,
    token?: string
  ): Promise<{ ok: boolean; message: string; latencyMs: number }> {
    if (!url || !url.trim()) {
      return { ok: false, message: 'URL Google Apps Script belum diisi.', latencyMs: 0 };
    }
    const start = performance.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      // Jika token diisi, uji autentikasi POST langsung ke backend
      if (token && token.trim()) {
        const res = await fetch(url.trim(), {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'verifyAuth', token: token.trim() }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        const latencyMs = Math.round(performance.now() - start);
        const json = await res.json();
        if (json && json.success) {
          return { ok: true, message: 'Terhubung & API Token terverifikasi!', latencyMs };
        }
        return { ok: false, message: json?.message || 'Autentikasi token ditolak server.', latencyMs };
      }

      const target = `${url.trim()}${url.includes('?') ? '&' : '?'}action=health&_ts=${Date.now()}`;
      const res = await fetch(target, { method: 'GET', mode: 'cors', signal: controller.signal });
      clearTimeout(timeout);
      const latencyMs = Math.round(performance.now() - start);
      if (!res.ok) {
        return { ok: false, message: `Server merespons status HTTP ${res.status}`, latencyMs };
      }
      const json = await res.json();
      if (json && json.success) {
        return {
          ok: true,
          message: 'Endpoint aktif (Isi API Token untuk mengaktifkan sinkronisasi terproteksi)',
          latencyMs,
        };
      }
      return { ok: false, message: json?.message || 'Respons API tidak valid', latencyMs };
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - start);
      return {
        ok: false,
        message:
          err?.name === 'AbortError'
            ? 'Koneksi timeout (>10 detik). Periksa jaringan atau deployment Apps Script.'
            : 'Gagal menghubungi Apps Script (Pastikan akses deployment diatur ke "Anyone" / "Siapa saja").',
        latencyMs,
      };
    }
  }

  async pullDatabase(
    url: string,
    token?: string
  ): Promise<{ success: boolean; isEmpty?: boolean; data?: WorkspaceDatabase; message: string }> {
    if (!url || !url.trim()) return { success: false, message: 'URL Apps Script kosong' };
    if (!token || !token.trim()) return { success: false, message: 'API Token belum diisi di Pengaturan' };

    let attempt = 0;
    while (attempt < 2) {
      attempt++;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        // Token dikirim melalui POST body, bukan query string URL
        const res = await fetch(url.trim(), {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'pullAll',
            token: token.trim(),
            timestamp: new Date().toISOString(),
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        const json = await res.json();
        if (json?.success) {
          if (json.isEmpty || !json.data) {
            return { success: true, isEmpty: true, message: json.message || 'Database cloud masih kosong' };
          }
          return { success: true, isEmpty: false, data: json.data, message: 'Sinkronisasi dari Google Sheets berhasil' };
        }
        return { success: false, message: json?.message || 'Gagal menarik data dari Google Sheets' };
      } catch {
        if (attempt >= 2) {
          return { success: false, message: 'Gagal menghubungi server Google Sheets' };
        }
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }
    return { success: false, message: 'Gagal menarik data' };
  }

  async pushDatabase(
    url: string,
    db: WorkspaceDatabase,
    token?: string
  ): Promise<{ success: boolean; message: string }> {
    if (!url || !url.trim()) return { success: false, message: 'Tersimpan lokal (Cloud belum dikonfigurasi)' };
    if (!token || !token.trim()) return { success: false, message: 'Tersimpan lokal (API Token belum diisi)' };

    const lockKey = 'pushAll';
    if (this.inflightWrites.has(lockKey)) {
      return { success: false, message: 'Proses sinkronisasi sebelumnya masih berjalan' };
    }
    this.inflightWrites.add(lockKey);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 18000);
      const res = await fetch(url.trim(), {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'syncAll',
          token: token.trim(),
          payload: db,
          timestamp: new Date().toISOString(),
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const json = await res.json();
      if (json?.success) {
        return { success: true, message: json.message || 'Tersinkronisasi ke Google Sheets' };
      }
      return { success: false, message: json?.message || 'Gagal menyimpan ke Google Sheets' };
    } catch {
      return {
        success: false,
        message: 'Tersimpan lokal, namun gagal sinkron ke Google Sheets. Periksa koneksi internet.',
      };
    } finally {
      this.inflightWrites.delete(lockKey);
    }
  }
}

const apiService = new MotoTeachApiService();

// ============================================================================
// 5. KOMPONEN LOGO & KOP SURAT RESMI SMK NEGERI 1 GOMBONG
// ============================================================================
const JatengLogo: React.FC<{ size?: number; className?: string }> = ({ size = 68, className = '' }) => {
  const [imgError, setImgError] = useState(false);

  if (!imgError) {
    return (
      <img
        src={APP_CONFIG.schoolDefault.logoJatengUrl}
        alt="Logo Provinsi Jawa Tengah"
        width={size}
        height={size}
        onError={() => setImgError(true)}
        className={`object-contain select-none ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M32 4L56 16V34C56 48 32 60 32 60C32 60 8 48 8 34V16L32 4Z" fill="#173B70" stroke="#FBBF24" strokeWidth="2.5" />
      <polygon points="32,12 35,21 44,21 37,26 39,35 32,30 25,35 27,26 20,21 29,21" fill="#FBBF24" />
      <text x="32" y="48" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">JATENG</text>
    </svg>
  );
};

const SchoolLogo: React.FC<{ size?: number; className?: string }> = ({ size = 44, className = '' }) => {
  const [imgError, setImgError] = useState(false);

  if (!imgError) {
    return (
      <img
        src={APP_CONFIG.schoolDefault.logoUrl}
        alt="Logo SMK Negeri 1 Gombong"
        width={size}
        height={size}
        onError={() => setImgError(true)}
        className={`object-contain select-none ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="32" cy="32" r="30" fill="#173B70" stroke="#178C8C" strokeWidth="3" />
      <path d="M32 10L48 20V38C48 47 32 54 32 54C32 54 16 47 16 38V20L32 10Z" fill="#FFFFFF" fillOpacity="0.15" />
      <circle cx="32" cy="31" r="10" stroke="#FFFFFF" strokeWidth="3" />
    </svg>
  );
};

const KopSuratInstansi: React.FC<{ teacher: TeacherProfile; subtitle?: string }> = ({ teacher, subtitle }) => (
  <div className="border-b-4 border-double border-slate-900 pb-3 mb-5 text-slate-900">
    <div className="flex items-center justify-between gap-3 sm:gap-5">
      <div className="shrink-0">
        <JatengLogo size={74} />
      </div>
      <div className="text-center flex-1 leading-snug">
        <p className="text-xs sm:text-sm font-semibold tracking-wide uppercase">
          {APP_CONFIG.schoolDefault.pemerintah}
        </p>
        <p className="text-xs sm:text-sm font-bold tracking-wide uppercase">
          {APP_CONFIG.schoolDefault.dinas}
        </p>
        <h2 className="text-sm sm:text-lg font-extrabold tracking-wide uppercase mt-0.5 leading-tight">
          SEKOLAH MENENGAH KEJURUAN NEGERI 1
          <br />
          GOMBONG
        </h2>
        <p className="text-[10px] sm:text-xs text-slate-800 mt-0.5">
          {teacher.alamatSekolah || APP_CONFIG.schoolDefault.alamat} Telepon {teacher.teleponSekolah || APP_CONFIG.schoolDefault.telepon}
        </p>
        <p className="text-[10px] sm:text-xs text-slate-800">
          Faksimile {APP_CONFIG.schoolDefault.faksimile} Surat Elektronik {APP_CONFIG.schoolDefault.email}
        </p>
      </div>
      <div className="shrink-0">
        <SchoolLogo size={74} />
      </div>
    </div>
    {subtitle && (
      <div className="mt-3 pt-2 border-t border-slate-400 text-center">
        <h3 className="text-sm sm:text-base font-bold uppercase tracking-wide">{subtitle}</h3>
      </div>
    )}
  </div>
);

// ============================================================================
// 6. KODE BACKEND APPS SCRIPT SIAP SALIN (UNTUK HALAMAN SETUP GUIDE)
// ============================================================================
const APPS_SCRIPT_CODE_BUNDLE = `const SHEET_NAMES = [
  'Settings', 'TeacherProfile', 'AcademicYears', 'Calendar',
  'Classes', 'Students', 'Subjects', 'LearningOutcomes',
  'CPAnalysis', 'LearningObjectives', 'ATP', 'PROTA',
  'PROMES', 'TeachingModules', 'Jobsheets', 'TeachingJournal',
  'Attendance', 'Assessments', 'AssessmentItems', 'Grades',
  'Remedial', 'Enrichment', 'ActivityLogs', 'RawSnapshot'
];

function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  SHEET_NAMES.forEach(function(name) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    if (sheet.getLastRow() === 0) {
      if (name === 'RawSnapshot') sheet.appendRow(['Key', 'JsonData', 'UpdatedAt']);
      else if (name === 'ActivityLogs') sheet.appendRow(['ID', 'Timestamp', 'Action', 'Details', 'Status']);
      else sheet.appendRow(['ID', 'PayloadJSON', 'UpdatedAt']);
      sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight('bold').setBackground('#173B70').setFontColor('#FFFFFF');
      sheet.setFrozenRows(1);
    }
  });
  return 'Setup Database MotoTeach Workspace Selesai!';
}

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'health';
  try {
    if (action === 'health') {
      return jsonResponse({ success: true, message: 'MotoTeach Google Apps Script API Aktif & Sehat' });
    }
    if (action === 'pullAll') {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const snapSheet = ss.getSheetByName('RawSnapshot');
      if (!snapSheet || snapSheet.getLastRow() < 2) {
        return jsonResponse({ success: false, message: 'Database masih kosong.' });
      }
      const rawJson = snapSheet.getRange(2, 2).getValue();
      return jsonResponse({ success: true, message: 'Data berhasil dimuat', data: rawJson ? JSON.parse(rawJson) : null });
    }
    return jsonResponse({ success: false, message: 'Endpoint tidak dikenali' });
  } catch (err) {
    return jsonResponse({ success: false, message: err.toString() });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const body = JSON.parse(e.postData.contents);
    if (body.action === 'syncAll' && body.payload) {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let snapSheet = ss.getSheetByName('RawSnapshot');
      if (!snapSheet) { setupDatabase(); snapSheet = ss.getSheetByName('RawSnapshot'); }
      const now = new Date().toISOString();
      snapSheet.getRange(2, 1, 1, 3).setValues([['PRIMARY_WORKSPACE', JSON.stringify(body.payload), now]]);
      syncRelationalSheet(ss, 'Classes', body.payload.classes || []);
      syncRelationalSheet(ss, 'Students', body.payload.students || []);
      syncRelationalSheet(ss, 'Subjects', body.payload.subjects || []);
      syncRelationalSheet(ss, 'LearningOutcomes', body.payload.cps || []);
      syncRelationalSheet(ss, 'ATP', body.payload.atps || []);
      syncRelationalSheet(ss, 'TeachingModules', body.payload.modules || []);
      syncRelationalSheet(ss, 'Jobsheets', body.payload.jobsheets || []);
      syncRelationalSheet(ss, 'TeachingJournal', body.payload.journals || []);
      syncRelationalSheet(ss, 'Attendance', body.payload.attendances || []);
      syncRelationalSheet(ss, 'Assessments', body.payload.assessments || []);
      syncRelationalSheet(ss, 'Grades', body.payload.grades || []);
      return jsonResponse({ success: true, message: 'Tersinkronisasi ke Google Sheets pada ' + now });
    }
    return jsonResponse({ success: false, message: 'Aksi tidak valid' });
  } catch (err) {
    return jsonResponse({ success: false, message: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function syncRelationalSheet(ss, sheetName, records) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;
  const now = new Date().toISOString();
  if (sheet.getLastRow() > 1) sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).clearContent();
  if (records.length > 0) {
    const rows = records.map(function(item) { return [item.id || '', JSON.stringify(item), now]; });
    sheet.getRange(2, 1, rows.length, 3).setValues(rows);
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}`;

// ============================================================================
// 7. APLIKASI UTAMA (MotoTeach Workspace)
// ============================================================================
type PageId =
  | 'dashboard'
  | 'identitas'
  | 'kalender'
  | 'kelas_siswa'
  | 'mapel'
  | 'cp'
  | 'analisis_cp'
  | 'atp'
  | 'prota'
  | 'promes'
  | 'modul_ajar'
  | 'jobsheet'
  | 'jurnal'
  | 'presensi'
  | 'asesmen'
  | 'analisis_hasil'
  | 'remedial'
  | 'pengaturan'
  | 'panduan';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(APP_CONFIG.authSessionKey) === 'authenticated';
    } catch {
      return false;
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(APP_CONFIG.configKey);
      const parsed = saved ? JSON.parse(saved) : {};
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        appsScriptUrl: parsed.appsScriptUrl || '',
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [db, setDb] = useState<WorkspaceDatabase>(() => {
    try {
      const saved = localStorage.getItem(APP_CONFIG.storageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return createEmptyDatabase();
  });

  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'connected' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string>('Belum disinkronkan');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmModal, setConfirmModal] = useState<ConfirmState>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [printPreview, setPrintPreview] = useState<{ open: boolean; title: string; content: React.ReactNode }>({
    open: false,
    title: '',
    content: null,
  });

  const dark = settings.darkMode;

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = uid('toast');
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const askConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({ open: true, title, message, onConfirm });
  };

  useEffect(() => {
    try {
      localStorage.setItem(APP_CONFIG.configKey, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(db));
    } catch {}
  }, [db]);

  // Sinkronisasi otomatis saat login berhasil
  useEffect(() => {
    if (!isAuthenticated || !settings.appsScriptUrl) return;
    let cancelled = false;
    (async () => {
      setSyncStatus('syncing');
      const pullRes = await apiService.pullDatabase(settings.appsScriptUrl, settings.apiToken);
      if (cancelled) return;
      if (pullRes.success && pullRes.data && pullRes.data.teacher) {
        setDb(pullRes.data);
        setSyncStatus('connected');
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      } else {
        const pushRes = await apiService.pushDatabase(settings.appsScriptUrl, db, settings.apiToken);
        if (cancelled) return;
        if (pushRes.success) {
          setSyncStatus('connected');
          setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
        } else {
          setSyncStatus('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const updateDatabase = async (updater: (prev: WorkspaceDatabase) => WorkspaceDatabase, toastMsg?: string) => {
    const nextDb = { ...updater(db), lastUpdated: new Date().toISOString() };
    setDb(nextDb);
    if (toastMsg) showToast('success', toastMsg);

    if (settings.appsScriptUrl) {
      setSyncStatus('syncing');
      const res = await apiService.pushDatabase(settings.appsScriptUrl, nextDb, settings.apiToken);
      if (res.success) {
        setSyncStatus('connected');
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      } else {
        setSyncStatus('error');
      }
    }
  };

  const handleManualSync = async () => {
    if (!settings.appsScriptUrl) {
      showToast('error', 'URL Google Apps Script belum diisi.');
      return;
    }
    setSyncStatus('syncing');
    const res = await apiService.pushDatabase(settings.appsScriptUrl, db, settings.apiToken);
    if (res.success) {
      setSyncStatus('connected');
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      showToast('success', 'Data berhasil disinkronkan ke Google Sheets!');
    } else {
      setSyncStatus('error');
      showToast('error', res.message);
    }
  };

  const stats = useMemo(() => {
    const activeStudents = db.students.filter((s) => s.statusAktif === 'Aktif').length;
    const totalClasses = db.classes.length;
    const perangkatCount = db.modules.length + db.jobsheets.length + db.atps.length;
    const totalAssessments = db.assessments.length;
    const avgScore =
      db.grades.length > 0
        ? (db.grades.reduce((acc, g) => acc + Number(g.nilai || 0), 0) / db.grades.length).toFixed(1)
        : '0.0';
    return { activeStudents, totalClasses, perangkatCount, totalAssessments, avgScore };
  }, [db]);

  const navGroups: {
    group: string;
    items: { id: PageId; label: string; icon: React.ReactNode; badge?: number }[];
  }[] = [
    {
      group: 'UTAMA',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'identitas', label: 'Identitas Guru', icon: <UserCheck size={18} /> },
        { id: 'kalender', label: 'Kalender Pendidikan', icon: <CalendarIcon size={18} />, badge: db.calendar.length },
      ],
    },
    {
      group: 'DATA MASTER',
      items: [
        { id: 'kelas_siswa', label: 'Kelas & Peserta Didik', icon: <Users size={18} />, badge: db.students.length },
        { id: 'mapel', label: 'Mata Pelajaran', icon: <BookOpen size={18} />, badge: db.subjects.length },
      ],
    },
    {
      group: 'PERENCANAAN KURIKULUM',
      items: [
        { id: 'cp', label: 'Capaian Pembelajaran (CP)', icon: <Target size={18} />, badge: db.cps.length },
        { id: 'analisis_cp', label: 'Analisis CP', icon: <FileSearch size={18} />, badge: db.cpAnalyses.length },
        { id: 'atp', label: 'Alur Tujuan (ATP)', icon: <GitCommitHorizontal size={18} />, badge: db.atps.length },
        { id: 'prota', label: 'Program Tahunan (PROTA)', icon: <CalendarRange size={18} /> },
        { id: 'promes', label: 'Program Semester (PROMES)', icon: <CalendarDays size={18} /> },
      ],
    },
    {
      group: 'PERANGKAT & PELAKSANAAN',
      items: [
        { id: 'modul_ajar', label: 'Modul Ajar', icon: <FileText size={18} />, badge: db.modules.length },
        { id: 'jobsheet', label: 'Jobsheet & Bahan Ajar TSM', icon: <Wrench size={18} />, badge: db.jobsheets.length },
        { id: 'jurnal', label: 'Jurnal Mengajar', icon: <BookMarked size={18} />, badge: db.journals.length },
        { id: 'presensi', label: 'Presensi & Rekap', icon: <ClipboardCheck size={18} /> },
      ],
    },
    {
      group: 'ASESMEN & EVALUASI',
      items: [
        { id: 'asesmen', label: 'Asesmen & Penilaian', icon: <Award size={18} />, badge: db.assessments.length },
        { id: 'analisis_hasil', label: 'Analisis Hasil Belajar', icon: <BarChart3 size={18} /> },
        { id: 'remedial', label: 'Remedial & Pengayaan', icon: <HeartHandshake size={18} /> },
      ],
    },
    {
      group: 'SISTEM & BANTUAN',
      items: [
        { id: 'pengaturan', label: 'Pengaturan & Backup', icon: <Settings size={18} /> },
        { id: 'panduan', label: 'Panduan Setup & Backend', icon: <HelpCircle size={18} /> },
      ],
    },
  ];

  const currentNavLabel =
    navGroups.flatMap((g) => g.items).find((i) => i.id === activePage)?.label || 'Dashboard';

  const renderPageContent = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <DashboardView
            db={db}
            settings={settings}
            stats={stats}
            onNavigate={setActivePage}
            onLoadDemo={() => {
              const demo = createDemoDatabase();
              updateDatabase(() => demo, 'Data Demo Teknik Sepeda Motor berhasil dimuat!');
            }}
            onClearDemo={() => {
              updateDatabase(() => createEmptyDatabase(), 'Data demo berhasil dibersihkan.');
            }}
          />
        );
      case 'identitas':
        return (
          <TeacherIdentityView
            teacher={db.teacher}
            dark={dark}
            onSave={(updated) => {
              updateDatabase((prev) => ({ ...prev, teacher: updated }), 'Identitas guru dan sekolah berhasil disimpan!');
              setSettings((s) => ({ ...s, tahunAjaran: updated.tahunAjaran }));
            }}
          />
        );
      case 'kalender':
        return (
          <CalendarView
            events={db.calendar}
            semester={settings.semester}
            dark={dark}
            onAdd={(ev) => updateDatabase((prev) => ({ ...prev, calendar: [ev, ...prev.calendar] }), 'Agenda pendidikan ditambahkan')}
            onUpdate={(ev) =>
              updateDatabase(
                (prev) => ({ ...prev, calendar: prev.calendar.map((c) => (c.id === ev.id ? ev : c)) }),
                'Agenda pendidikan diperbarui'
              )
            }
            onDelete={(id) =>
              askConfirm('Hapus Agenda?', 'Agenda yang dihapus tidak dapat dikembalikan.', () =>
                updateDatabase((prev) => ({ ...prev, calendar: prev.calendar.filter((c) => c.id !== id) }), 'Agenda dihapus')
              )
            }
          />
        );
      case 'kelas_siswa':
        return (
          <ClassesStudentsView
            classes={db.classes}
            students={db.students}
            settings={settings}
            dark={dark}
            onAddClass={(cls) => updateDatabase((p) => ({ ...p, classes: [...p.classes, cls] }), 'Kelas berhasil ditambahkan')}
            onUpdateClass={(cls) =>
              updateDatabase(
                (p) => ({ ...p, classes: p.classes.map((c) => (c.id === cls.id ? cls : c)) }),
                'Data kelas diperbarui'
              )
            }
            onDeleteClass={(id) =>
              askConfirm('Hapus Kelas?', 'Data kelas ini akan dihapus.', () =>
                updateDatabase((p) => ({ ...p, classes: p.classes.filter((c) => c.id !== id) }), 'Kelas dihapus')
              )
            }
            onAddStudent={(st) => updateDatabase((p) => ({ ...p, students: [...p.students, st] }), 'Peserta didik ditambahkan')}
            onUpdateStudent={(st) =>
              updateDatabase(
                (p) => ({ ...p, students: p.students.map((s) => (s.id === st.id ? st : s)) }),
                'Data peserta didik diperbarui'
              )
            }
            onBulkImportStudents={(list) =>
              updateDatabase((p) => ({ ...p, students: [...p.students, ...list] }), `${list.length} peserta didik berhasil diimpor`)
            }
            onDeleteStudent={(id) =>
              askConfirm('Hapus Peserta Didik?', 'Data peserta didik akan dihapus permanen.', () =>
                updateDatabase((p) => ({ ...p, students: p.students.filter((s) => s.id !== id) }), 'Peserta didik dihapus')
              )
            }
          />
        );
      case 'mapel':
        return (
          <SubjectsView
            subjects={db.subjects}
            settings={settings}
            dark={dark}
            onAdd={(sub) => updateDatabase((p) => ({ ...p, subjects: [...p.subjects, sub] }), 'Mata pelajaran ditambahkan')}
            onUpdate={(sub) =>
              updateDatabase(
                (p) => ({ ...p, subjects: p.subjects.map((s) => (s.id === sub.id ? sub : s)) }),
                'Mata pelajaran diperbarui'
              )
            }
            onDelete={(id) =>
              askConfirm('Hapus Mata Pelajaran?', 'Yakin menghapus mata pelajaran ini?', () =>
                updateDatabase((p) => ({ ...p, subjects: p.subjects.filter((s) => s.id !== id) }), 'Mata pelajaran dihapus')
              )
            }
          />
        );
      case 'cp':
        return (
          <CPView
            cps={db.cps}
            subjects={db.subjects}
            dark={dark}
            onAdd={(cp) => updateDatabase((p) => ({ ...p, cps: [...p.cps, cp] }), 'Capaian Pembelajaran berhasil disimpan')}
            onUpdate={(cp) =>
              updateDatabase(
                (p) => ({ ...p, cps: p.cps.map((c) => (c.id === cp.id ? cp : c)) }),
                'Capaian Pembelajaran diperbarui'
              )
            }
            onDelete={(id) =>
              askConfirm('Hapus CP?', 'Hapus data Capaian Pembelajaran ini?', () =>
                updateDatabase((p) => ({ ...p, cps: p.cps.filter((c) => c.id !== id) }), 'CP dihapus')
              )
            }
          />
        );
      case 'analisis_cp':
        return (
          <CPAnalysisView
            analyses={db.cpAnalyses}
            cps={db.cps}
            subjects={db.subjects}
            dark={dark}
            onAdd={(an) => updateDatabase((p) => ({ ...p, cpAnalyses: [...p.cpAnalyses, an] }), 'Analisis CP berhasil disimpan')}
            onUpdate={(an) =>
              updateDatabase(
                (p) => ({ ...p, cpAnalyses: p.cpAnalyses.map((a) => (a.id === an.id ? an : a)) }),
                'Analisis CP diperbarui'
              )
            }
            onDelete={(id) =>
              askConfirm('Hapus Analisis CP?', 'Data analisis ini akan dihapus.', () =>
                updateDatabase((p) => ({ ...p, cpAnalyses: p.cpAnalyses.filter((a) => a.id !== id) }), 'Analisis CP dihapus')
              )
            }
          />
        );
      case 'atp':
        return (
          <ATPView
            atps={db.atps}
            subjects={db.subjects}
            analyses={db.cpAnalyses}
            teacher={db.teacher}
            settings={settings}
            dark={dark}
            onAdd={(item) => updateDatabase((p) => ({ ...p, atps: [...p.atps, item] }), 'Tujuan Pembelajaran ditambahkan ke ATP')}
            onUpdate={(item) =>
              updateDatabase(
                (p) => ({ ...p, atps: p.atps.map((a) => (a.id === item.id ? item : a)) }),
                'Tujuan Pembelajaran pada ATP diperbarui'
              )
            }
            onReorder={(nextAtps) => updateDatabase((p) => ({ ...p, atps: nextAtps }), 'Urutan ATP diperbarui')}
            onDelete={(id) =>
              askConfirm('Hapus TP dari ATP?', 'Tujuan pembelajaran akan dihapus dari alur.', () =>
                updateDatabase((p) => ({ ...p, atps: p.atps.filter((a) => a.id !== id) }), 'TP dihapus')
              )
            }
            onOpenPrint={(title, content) => setPrintPreview({ open: true, title, content })}
          />
        );
      case 'prota':
        return (
          <ProtaView
            protas={db.protas}
            atps={db.atps}
            subjects={db.subjects}
            teacher={db.teacher}
            settings={settings}
            dark={dark}
            onAdd={(item) => updateDatabase((p) => ({ ...p, protas: [...p.protas, item] }), 'Program Tahunan disimpan')}
            onUpdate={(item) =>
              updateDatabase(
                (p) => ({ ...p, protas: p.protas.map((x) => (x.id === item.id ? item : x)) }),
                'Program Tahunan diperbarui'
              )
            }
            onDelete={(id) =>
              updateDatabase((p) => ({ ...p, protas: p.protas.filter((x) => x.id !== id) }), 'Baris PROTA dihapus')
            }
            onOpenPrint={(title, content) => setPrintPreview({ open: true, title, content })}
          />
        );
      case 'promes':
        return (
          <PromesView
            promes={db.promes}
            protas={db.protas}
            atps={db.atps}
            subjects={db.subjects}
            teacher={db.teacher}
            settings={settings}
            dark={dark}
            onAdd={(item) => updateDatabase((p) => ({ ...p, promes: [...p.promes, item] }), 'Jadwal PROMES ditambahkan')}
            onUpdate={(item) =>
              updateDatabase(
                (p) => ({ ...p, promes: p.promes.map((x) => (x.id === item.id ? item : x)) }),
                'Jadwal PROMES diperbarui'
              )
            }
            onDelete={(id) =>
              updateDatabase((p) => ({ ...p, promes: p.promes.filter((x) => x.id !== id) }), 'Item PROMES dihapus')
            }
            onOpenPrint={(title, content) => setPrintPreview({ open: true, title, content })}
          />
        );
      case 'modul_ajar':
        return (
          <TeachingModuleView
            modules={db.modules}
            subjects={db.subjects}
            classes={db.classes}
            atps={db.atps}
            teacher={db.teacher}
            settings={settings}
            dark={dark}
            onSave={(mod) =>
              updateDatabase((p) => {
                const exists = p.modules.some((m) => m.id === mod.id);
                return {
                  ...p,
                  modules: exists ? p.modules.map((m) => (m.id === mod.id ? mod : m)) : [mod, ...p.modules],
                };
              }, 'Modul Ajar berhasil disimpan!')
            }
            onDelete={(id) =>
              askConfirm('Hapus Modul Ajar?', 'Modul ajar yang dihapus tidak dapat dipulihkan.', () =>
                updateDatabase((p) => ({ ...p, modules: p.modules.filter((m) => m.id !== id) }), 'Modul ajar dihapus')
              )
            }
            onOpenPrint={(title, content) => setPrintPreview({ open: true, title, content })}
          />
        );
      case 'jobsheet':
        return (
          <JobsheetView
            jobsheets={db.jobsheets}
            subjects={db.subjects}
            teacher={db.teacher}
            dark={dark}
            onSave={(js) =>
              updateDatabase((p) => {
                const exists = p.jobsheets.some((j) => j.id === js.id);
                return {
                  ...p,
                  jobsheets: exists ? p.jobsheets.map((j) => (j.id === js.id ? js : j)) : [js, ...p.jobsheets],
                };
              }, 'Jobsheet Praktik TSM berhasil disimpan!')
            }
            onDelete={(id) =>
              askConfirm('Hapus Jobsheet?', 'Hapus jobsheet praktik bengkel ini?', () =>
                updateDatabase((p) => ({ ...p, jobsheets: p.jobsheets.filter((j) => j.id !== id) }), 'Jobsheet dihapus')
              )
            }
            onOpenPrint={(title, content) => setPrintPreview({ open: true, title, content })}
          />
        );
      case 'jurnal':
        return (
          <JournalView
            journals={db.journals}
            classes={db.classes}
            subjects={db.subjects}
            atps={db.atps}
            teacher={db.teacher}
            dark={dark}
            onAdd={(j) => updateDatabase((p) => ({ ...p, journals: [j, ...p.journals] }), 'Jurnal mengajar tersimpan')}
            onUpdate={(item) =>
  updateDatabase(
    (p) => ({ ...p, journals: p.journals.map((j) => (j.id === item.id ? item : j)) }),
    'Jurnal mengajar diperbarui'
  )
}
            onDelete={(id) =>
              askConfirm('Hapus Jurnal?', 'Hapus entri jurnal mengajar ini?', () =>
                updateDatabase((p) => ({ ...p, journals: p.journals.filter((j) => j.id !== id) }), 'Jurnal dihapus')
              )
            }
            onOpenPrint={(title, content) => setPrintPreview({ open: true, title, content })}
          />
        );
      case 'presensi':
        return (
          <AttendanceView
            attendances={db.attendances}
            classes={db.classes}
            students={db.students}
            dark={dark}
            onOpenPrint={(title, content) => setPrintPreview({ open: true, title, content })}
            onSaveBatch={(tanggal, classId, records) =>
              updateDatabase((p) => {
                const filtered = p.attendances.filter(
                  (a) => !(a.tanggal === tanggal && a.classId === classId)
                );
                return { ...p, attendances: [...filtered, ...records] };
              }, `Presensi tanggal ${tanggal} berhasil disimpan & disinkronkan ke Google Sheets!`)
            }
          />
        );
      case 'asesmen':
        return (
          <AssessmentView
            assessments={db.assessments}
            grades={db.grades}
            classes={db.classes}
            students={db.students}
            subjects={db.subjects}
            atps={db.atps}
            defaultKktp={settings.kktpDefault}
            dark={dark}
            onAddAssessment={(asm) =>
              updateDatabase((p) => ({ ...p, assessments: [asm, ...p.assessments] }), 'Asesmen baru berhasil dibuat')
            }
            onUpdate={(item) =>
  updateDatabase(
    (p) => ({ ...p, assessments: p.assessments.map((a) => (a.id === item.id ? item : a)) }),
    'Data asesmen diperbarui'
  )
}
            onSaveGrades={(assessmentId, newGrades) =>
              updateDatabase((p) => {
                const others = p.grades.filter((g) => g.assessmentId !== assessmentId);
                return { ...p, grades: [...others, ...newGrades] };
              }, 'Nilai peserta didik berhasil disimpan & dihitung!')
            }
            onDeleteAssessment={(id) =>
              askConfirm('Hapus Asesmen?', 'Asesmen dan seluruh nilai terkait akan dihapus.', () =>
                updateDatabase(
                  (p) => ({
                    ...p,
                    assessments: p.assessments.filter((a) => a.id !== id),
                    grades: p.grades.filter((g) => g.assessmentId !== id),
                  }),
                  'Asesmen dihapus'
                )
              )
            }
          />
        );
      case 'analisis_hasil':
        return (
          <LearningAnalysisView
            assessments={db.assessments}
            grades={db.grades}
            students={db.students}
            classes={db.classes}
            kktpDefault={settings.kktpDefault}
            onUpdateKktp={(val) => setSettings((s) => ({ ...s, kktpDefault: val }))}
            dark={dark}
          />
        );
      case 'remedial':
        return (
          <FollowUpView
            followUps={db.followUps}
            students={db.students}
            assessments={db.assessments}
            grades={db.grades}
            atps={db.atps}
            kktpDefault={settings.kktpDefault}
            dark={dark}
            onAdd={(fu) => updateDatabase((p) => ({ ...p, followUps: [fu, ...p.followUps] }), 'Program tindak lanjut disimpan')}
            onUpdate={(item) =>
        updateDatabase(
          (p) => ({
            ...p,
            followUps: p.followUps.map((f) => (f.id === item.id ? item : f)),
          }),
          'Program tindak lanjut diperbarui'
        )
      }
            onDelete={(id) =>
              updateDatabase((p) => ({ ...p, followUps: p.followUps.filter((f) => f.id !== id) }), 'Data tindak lanjut dihapus')
            }
          />
        );
      case 'pengaturan':
        return (
          <SettingsBackupView
            settings={settings}
            db={db}
            syncStatus={syncStatus}
            lastSyncTime={lastSyncTime}
            onUpdateSettings={(next) => {
              setSettings(next);
              showToast('success', 'Pengaturan workspace disimpan');
            }}
            onTestConnection={async (url, token) => {
              const res = await apiService.testConnection(url, token);
              if (res.ok) {
                setSyncStatus('connected');
                showToast('success', `${res.message} (${res.latencyMs} ms)`);
              } else {
                setSyncStatus('error');
                showToast('error', res.message);
              }
            }}
            onSyncNow={handleManualSync}
            onPullFromCloud={async () => {
              if (!settings.appsScriptUrl) {
                showToast('error', 'Masukkan URL Apps Script terlebih dahulu');
                return;
              }
              setSyncStatus('syncing');
              const res = await apiService.pullDatabase(settings.appsScriptUrl, settings.apiToken);
              if (res.success && res.data) {
                setDb(res.data);
                setSyncStatus('connected');
                setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
                showToast('success', 'Data berhasil ditarik dari Google Sheets!');
              } else {
                setSyncStatus('error');
                showToast('error', res.message);
              }
            }}
            onRestoreDatabase={(restored) =>
              askConfirm(
                'Pulihkan Database dari File Backup?',
                'Data saat ini akan digantikan oleh data dari file backup JSON yang Anda pilih. Lanjutkan?',
                () => {
                  updateDatabase(() => restored, 'Pemulihan database dari backup JSON berhasil!');
                }
              )
            }
            onResetLocal={() =>
              askConfirm(
                'Reset Seluruh Data Lokal?',
                'Semua data di browser ini akan dikosongkan. Pastikan Anda sudah melakukan backup terlebih dahulu.',
                () => {
                  setDb(createEmptyDatabase());
                  showToast('info', 'Workspace lokal telah direset ke kondisi kosong.');
                }
              )
            }
          />
        );
      case 'panduan':
        return <SetupGuideView dark={dark} onCopySuccess={(label) => showToast('success', `${label} berhasil disalin ke clipboard!`)} />;
      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return (
      <LoginPage
        dark={dark}
        onToggleDark={() => setSettings((s) => ({ ...s, darkMode: !s.darkMode }))}
        onLoginSuccess={(cloudConfig) => {
          if (cloudConfig) {
            setSettings((s) => ({
              ...s,
              appsScriptUrl: cloudConfig.appsScriptUrl,
              apiToken: cloudConfig.apiToken,
            }));
          }
          try {
            sessionStorage.setItem(APP_CONFIG.authSessionKey, 'authenticated');
          } catch {}
          setIsAuthenticated(true);
          showToast('success', 'Selamat datang kembali di MotoTeach Workspace!');
        }}
      />
    );
  }

  return (
    <div
      className={`min-h-screen flex transition-colors duration-200 font-sans ${
        dark ? 'bg-[#0B1324] text-slate-100' : 'bg-[#F6F7FB] text-[#202633]'
      }`}
    >
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* SIDEBAR KIRI */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen flex flex-col transition-all duration-300 select-none ${
          dark ? 'bg-[#0F1B33] border-r border-slate-800' : 'bg-[#173B70] text-white'
        } ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'} ${
          mobileDrawerOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-sm">
              <SchoolLogo size={32} />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <h1 className="font-bold text-base tracking-tight text-white truncate">
                  {APP_CONFIG.appName}
                </h1>
                <p className="text-[11px] text-blue-200 truncate">
                  {APP_CONFIG.appSubtitle}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => setMobileDrawerOpen(false)}
            className="lg:hidden p-2 rounded-lg text-white/80 hover:bg-white/10"
            aria-label="Tutup Menu"
          >
            <X size={20} />
          </button>
        </div>

        {!sidebarCollapsed && (
          <div className="mx-3 mt-3 p-3 rounded-xl bg-white/10 border border-white/10">
            <p className="text-xs font-semibold text-white truncate">
              {APP_CONFIG.schoolDefault.namaSekolahSingkat}
            </p>
            <p className="text-[11px] text-blue-200 mt-0.5">
              T.A. {settings.tahunAjaran} • Sem. {settings.semester}
            </p>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-thin">
          {navGroups.map((group) => (
            <div key={group.group}>
              {!sidebarCollapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-bold tracking-wider uppercase text-blue-200/70">
                  {group.group}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActivePage(item.id);
                        setMobileDrawerOpen(false);
                      }}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                        active
                          ? 'bg-white text-[#173B70] font-semibold shadow-sm'
                          : 'text-blue-100 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={active ? 'text-[#173B70]' : 'text-blue-200'}>{item.icon}</span>
                        {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </div>
                      {!sidebarCollapsed && typeof item.badge === 'number' && item.badge > 0 && (
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                            active ? 'bg-[#173B70]/10 text-[#173B70]' : 'bg-white/15 text-white'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              try {
                sessionStorage.removeItem(APP_CONFIG.authSessionKey);
              } catch {}
              setIsAuthenticated(false);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-100 hover:text-white text-xs font-semibold transition-colors"
            title="Keluar dari Workspace"
          >
            <LogOut size={16} />
            {!sidebarCollapsed && <span>Keluar</span>}
          </button>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors ml-auto"
            title={sidebarCollapsed ? 'Perluas Sidebar' : 'Perkecil Sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </aside>

      {/* AREA KONTEN UTAMA */}
      <div className="flex-1 flex flex-col min-w-0">
        <header
          className={`sticky top-0 z-30 border-b px-4 sm:px-6 py-3 flex items-center justify-between gap-3 backdrop-blur-md ${
            dark ? 'bg-[#0F1B33]/90 border-slate-800' : 'bg-white/90 border-slate-200/80'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2.5 rounded-xl border border-slate-300/60 dark:border-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Buka Menu"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span>Digital Workspace</span>
                <span>/</span>
                <span className="truncate">{currentNavLabel}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold truncate">{currentNavLabel}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={handleManualSync}
              title={`Status: ${syncStatus} (${lastSyncTime}) — Klik untuk sinkron paksa`}
              className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                syncStatus === 'connected'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                  : syncStatus === 'syncing'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-slate-800 dark:text-amber-300 dark:border-slate-700'
              }`}
            >
              {syncStatus === 'connected' ? <Cloud size={15} /> : <Database size={15} />}
              <span>
                {syncStatus === 'connected'
                  ? `Cloud Aktif (${lastSyncTime})`
                  : syncStatus === 'syncing'
                  ? 'Menyinkronkan...'
                  : 'Sinkronisasi Siap'}
              </span>
            </button>

            <div className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#173B70]/10 text-[#173B70] dark:bg-blue-900/40 dark:text-blue-200">
              <CalendarIcon size={14} />
              <span>T.A. {settings.tahunAjaran} ({settings.semester})</span>
            </div>

            <button
              onClick={() => setSettings((s) => ({ ...s, darkMode: !s.darkMode }))}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title={dark ? 'Mode Terang' : 'Mode Gelap'}
            >
              {dark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-600" />}
            </button>

            <button
              onClick={() => setActivePage('identitas')}
              className="w-10 h-10 rounded-full bg-[#173B70] text-white font-bold text-sm flex items-center justify-center shadow-xs overflow-hidden border-2 border-[#178C8C]"
              title="Profil Guru"
            >
              {db.teacher.fotoUrl ? (
                <img src={db.teacher.fotoUrl} alt="Foto Guru" className="w-full h-full object-cover" />
              ) : (
                (db.teacher.namaLengkap || 'G').charAt(0).toUpperCase()
              )}
            </button>
          </div>
        </header>

        {db.isDemoData && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-medium">
              <AlertTriangle size={16} className="shrink-0 text-amber-600" />
              <span>
                Anda sedang melihat <strong>DATA DEMO</strong> contoh administrasi Teknik Sepeda Motor. Anda dapat menghapusnya kapan saja untuk mulai mengisi data asli.
              </span>
            </div>
            <button
              onClick={() =>
                askConfirm('Hapus Data Demo?', 'Seluruh data demo akan dihapus dan workspace menjadi kosong.', () => {
                  setDb(createEmptyDatabase());
                  showToast('info', 'Data demo dihapus.');
                })
              }
              className="px-3 py-1 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors"
            >
              Bersihkan Data Demo
            </button>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderPageContent()}
        </main>
      </div>

      {/* TOAST NOTIFICATIONS */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 p-3.5 rounded-2xl shadow-lg border text-sm font-medium transition-all ${
              t.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : t.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700'
                : 'bg-[#173B70] text-white border-blue-700'
            }`}
          >
            {t.type === 'success' ? <CheckCircle2 size={18} /> : t.type === 'error' ? <AlertTriangle size={18} /> : <Info size={18} />}
            <span className="flex-1">{t.text}</span>
          </div>
        ))}
      </div>

      {/* CONFIRMATION DIALOG */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`max-w-md w-full rounded-2xl p-6 shadow-2xl border ${
              dark ? 'bg-[#152238] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold">{confirmModal.title}</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">{confirmModal.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmModal((c) => ({ ...c, open: false }))}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal((c) => ({ ...c, open: false }));
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PRINT PREVIEW A4 */}
      {printPreview.open && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
          <div className="bg-white text-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-5 py-3.5 bg-[#173B70] text-white flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <Printer size={18} />
                <span className="font-semibold text-sm">Pratinjau Cetak A4 — {printPreview.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-xl bg-[#178C8C] hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer size={15} /> Cetak / Simpan PDF
                </button>
                <button
                  onClick={() => setPrintPreview({ open: false, title: '', content: null })}
                  className="p-1.5 rounded-lg hover:bg-white/15"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-6 sm:p-10 overflow-y-auto bg-white text-slate-900 print:p-0">
              <KopSuratInstansi teacher={db.teacher} subtitle={printPreview.title} />
              {printPreview.content}
              <div className="mt-10 grid grid-cols-2 gap-8 text-xs sm:text-sm pt-4 break-inside-avoid">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-bold">Kepala Sekolah</p>
                  <div className="h-16" />
                  <p className="font-bold underline">{db.teacher.kepalaSekolah || APP_CONFIG.schoolDefault.kepalaSekolah}</p>
                  <p>NIP. {db.teacher.nipKepalaSekolah || APP_CONFIG.schoolDefault.nipKepalaSekolah}</p>
                </div>
                <div className="text-left sm:pl-12">
                  <p>Kebumen, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="font-semibold">Guru Mata Pelajaran</p>
                  <div className="h-16" />
                  <p className="font-bold underline">
                    {[db.teacher.gelarDepan, db.teacher.namaLengkap, db.teacher.gelarBelakang].filter(Boolean).join(' ')}
                  </p>
                  <p>NIP. {db.teacher.nip || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// KOMPONEN LOGIN PAGE (AMAN DENGAN HASH SHA-256)
// ============================================================================
interface LocalAuthRecord {
  email: string;
  salt: string;
  passwordHash: string;
}

const LoginPage: React.FC<{
  dark: boolean;
  onToggleDark: () => void;
  onLoginSuccess: (cloudConfig?: { appsScriptUrl: string; apiToken: string }) => void;
}> = ({ dark, onToggleDark, onLoginSuccess }) => {
  const existingLocalAuth: LocalAuthRecord | null = useMemo(() => {
    try {
      const raw = localStorage.getItem(APP_CONFIG.authLocalAccountKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const [authMode, setAuthMode] = useState<'local' | 'cloud'>(existingLocalAuth ? 'local' : 'cloud');
  const [email, setEmail] = useState(existingLocalAuth?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [scriptUrl, setScriptUrl] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLocalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) {
        setErrorMsg('Email guru wajib diisi.');
        return;
      }

      if (!existingLocalAuth) {
        if (password.length < 8) {
          setErrorMsg('Kata sandi baru minimal 8 karakter.');
          return;
        }
        if (password !== confirmPassword) {
          setErrorMsg('Konfirmasi kata sandi tidak cocok.');
          return;
        }
        const salt = generateSalt();
        const passwordHash = await hashPasswordWithSalt(password, salt);
        localStorage.setItem(
          APP_CONFIG.authLocalAccountKey,
          JSON.stringify({ email: normalizedEmail, salt, passwordHash })
        );
        onLoginSuccess();
        return;
      }

      if (normalizedEmail !== existingLocalAuth.email) {
        setErrorMsg('Email tidak cocok dengan akun lokal yang terdaftar di perangkat ini.');
        return;
      }

      const candidateHash = await hashPasswordWithSalt(password, existingLocalAuth.salt);
      if (candidateHash === existingLocalAuth.passwordHash) {
        onLoginSuccess();
      } else {
        setErrorMsg('Kata sandi salah. Silakan periksa kembali.');
      }
    } catch {
      setErrorMsg('Terjadi kendala saat memverifikasi kredensial.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloudTokenLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!scriptUrl.trim() || !apiToken.trim()) {
      setErrorMsg('URL Web App Apps Script dan API Token wajib diisi.');
      return;
    }
    setLoading(true);
    try {
      const res = await apiService.testConnection(scriptUrl.trim(), apiToken.trim());
      if (res.ok) {
        onLoginSuccess({ appsScriptUrl: scriptUrl.trim(), apiToken: apiToken.trim() });
      } else {
        setErrorMsg(res.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm min-h-[46px] ${
    dark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
  }`;

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors ${
        dark ? 'bg-[#0B1324] text-slate-100' : 'bg-[#F6F7FB] text-slate-900'
      }`}
    >
      <div
        className={`w-full max-w-md rounded-3xl p-7 sm:p-8 shadow-xl border space-y-5 ${
          dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#173B70]/10 p-1.5 flex items-center justify-center">
              <SchoolLogo size={38} />
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-[#173B70] dark:text-white leading-tight">
                {APP_CONFIG.appName}
              </h1>
              <p className="text-xs text-slate-500">SMK Negeri 1 Gombong • TSM</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleDark}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700"
            title="Ubah Tema"
          >
            {dark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => { setAuthMode('cloud'); setErrorMsg(''); }}
            className={`py-2 rounded-lg text-xs font-bold transition-colors ${
              authMode === 'cloud' ? 'bg-[#173B70] text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Masuk via Cloud Token
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('local'); setErrorMsg(''); }}
            className={`py-2 rounded-lg text-xs font-bold transition-colors ${
              authMode === 'local' ? 'bg-[#173B70] text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {existingLocalAuth ? 'Masuk Akun Lokal' : 'Aktivasi Lokal Baru'}
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {authMode === 'cloud' ? (
          <form onSubmit={handleCloudTokenLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5">URL Web App Google Apps Script</label>
              <div className="relative">
                <Cloud size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="url"
                  required
                  value={scriptUrl}
                  onChange={(e) => setScriptUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">API Token Server</label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  placeholder="Token dari Script Properties"
                  className={`${inputCls} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Diverifikasi langsung oleh backend Google Apps Script tanpa menyimpan kredensial di kode publik.
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#173B70] hover:bg-blue-900 text-white font-bold text-sm shadow-md transition-colors min-h-[46px]"
            >
              {loading ? 'Memverifikasi ke Server...' : 'Hubungkan & Masuk'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLocalSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5">Email Guru</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@smkn1gombong.sch.id"
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5">
                {existingLocalAuth ? 'Kata Sandi' : 'Buat Kata Sandi Baru (Min. 8 Karakter)'}
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  autoComplete={existingLocalAuth ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={`${inputCls} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {!existingLocalAuth && (
              <div>
                <label className="block text-xs font-semibold mb-1.5">Konfirmasi Kata Sandi</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi"
                    className={inputCls}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#173B70] hover:bg-blue-900 text-white font-bold text-sm shadow-md transition-colors min-h-[46px]"
            >
              {loading ? 'Memverifikasi...' : existingLocalAuth ? 'Masuk ke Workspace' : 'Simpan Akun & Masuk'}
            </button>
          </form>
        )}

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck size={14} className="text-[#178C8C]" /> Proteksi Token Server & Hash Lokal
          </span>
          <span>STEMSAGO TSM</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SUB-KOMPONEN TIAP HALAMAN / MODUL
// ============================================================================

// --- 1. DASHBOARD VIEW ---
const DashboardView: React.FC<{
  db: WorkspaceDatabase;
  settings: AppSettings;
  stats: any;
  onNavigate: (p: PageId) => void;
  onLoadDemo: () => void;
  onClearDemo: () => void;
}> = ({ db, settings, stats, onNavigate, onLoadDemo }) => {
  const dark = settings.darkMode;
  const fullName = [db.teacher.gelarDepan, db.teacher.namaLengkap, db.teacher.gelarBelakang].filter(Boolean).join(' ');
  const classNames = db.classes.map((c) => c.namaKelas).join(', ') || 'Belum ada kelas';
  const cardBg = dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200/80';

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-[#173B70] via-[#1E4A8A] to-[#173B70] text-white p-6 sm:p-7 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/15 border-2 border-white/40 overflow-hidden flex items-center justify-center shrink-0">
            {db.teacher.fotoUrl ? (
              <img src={db.teacher.fotoUrl} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              <SchoolLogo size={54} />
            )}
          </div>
          <div>
            <p className="text-[11px] font-bold tracking-widest uppercase text-teal-300">
              SELAMAT MENGAJAR HARI INI
            </p>
            <h1 className="text-xl sm:text-2xl font-extrabold mt-0.5">{fullName || 'Guru Teknik Sepeda Motor'}</h1>
            <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
              {db.teacher.jabatan} • {db.teacher.namaSekolah}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/15 border border-white/15">
                T.A. {settings.tahunAjaran}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/15 border border-white/15">
                {db.teacher.konsentrasiKeahlian}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#178C8C]/60 border border-teal-400/30">
                Kelas: {classNames}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
          <button
            onClick={() => onNavigate('identitas')}
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-white text-[#173B70] font-semibold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
          >
            <UserCheck size={16} /> Kelola Identitas
          </button>
          {db.students.length === 0 && (
            <button
              onClick={onLoadDemo}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-[#178C8C] text-white font-semibold text-sm hover:bg-teal-600 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Sparkles size={16} /> Muat Data Demo TSM
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="PESERTA DIDIK AKTIF"
          value={stats.activeStudents}
          sub={`${stats.totalClasses} rombongan belajar`}
          icon={<Users size={22} className="text-[#173B70] dark:text-blue-300" />}
          dark={dark}
          onClick={() => onNavigate('kelas_siswa')}
        />
        <StatCard
          label="PERANGKAT AJAR"
          value={stats.perangkatCount}
          sub={`${db.modules.length} Modul, ${db.jobsheets.length} Jobsheet, ${db.atps.length} TP`}
          icon={<BookOpen size={22} className="text-[#178C8C]" />}
          dark={dark}
          onClick={() => onNavigate('modul_ajar')}
        />
        <StatCard
          label="ASESMEN & PENILAIAN"
          value={stats.totalAssessments}
          sub={`${db.grades.length} entri nilai terekam`}
          icon={<Award size={22} className="text-[#4169A1]" />}
          dark={dark}
          onClick={() => onNavigate('asesmen')}
        />
        <StatCard
          label="RATA-RATA HASIL BELAJAR"
          value={stats.avgScore}
          sub={`Target KKTP: ${settings.kktpDefault}`}
          icon={<BarChart3 size={22} className="text-emerald-600" />}
          dark={dark}
          onClick={() => onNavigate('analisis_hasil')}
        />
      </div>

      <div className={`p-5 rounded-2xl border ${cardBg}`}>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Aksi Cepat Administrasi Guru TSM
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Buat Modul Ajar', icon: <FileText size={18} />, page: 'modul_ajar' as PageId },
            { label: 'Buat Jobsheet TSM', icon: <Wrench size={18} />, page: 'jobsheet' as PageId },
            { label: 'Tambah Jurnal', icon: <BookMarked size={18} />, page: 'jurnal' as PageId },
            { label: 'Input Presensi', icon: <ClipboardCheck size={18} />, page: 'presensi' as PageId },
            { label: 'Input Nilai', icon: <Award size={18} />, page: 'asesmen' as PageId },
            { label: 'Kelola ATP', icon: <GitCommitHorizontal size={18} />, page: 'atp' as PageId },
          ].map((act) => (
            <button
              key={act.label}
              onClick={() => onNavigate(act.page)}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-2 min-h-[48px] ${
                dark
                  ? 'border-slate-700 hover:bg-slate-800/80 text-slate-100'
                  : 'border-slate-200 hover:border-[#173B70] hover:bg-blue-50/40 text-slate-800'
              }`}
            >
              <span className="w-9 h-9 rounded-lg bg-[#173B70]/10 text-[#173B70] dark:bg-blue-900/50 dark:text-blue-300 flex items-center justify-center">
                {act.icon}
              </span>
              <span className="text-xs font-semibold">{act.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 p-6 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base">Perkembangan Hasil Belajar</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rata-rata nilai per asesmen dibandingkan target KKTP ({settings.kktpDefault})
              </p>
            </div>
            <button
              onClick={() => onNavigate('analisis_hasil')}
              className="text-xs font-semibold text-[#173B70] dark:text-blue-300 hover:underline"
            >
              Detail Analisis →
            </button>
          </div>

          {db.assessments.length === 0 ? (
            <div className="py-12 text-center border border-dashed rounded-xl border-slate-300 dark:border-slate-700">
              <p className="text-sm font-medium text-slate-500">Belum ada data asesmen & nilai</p>
              <p className="text-xs text-slate-400 mt-1">
                Buat asesmen pada menu Asesmen & Penilaian untuk melihat grafik capaian siswa.
              </p>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {db.assessments.map((asm) => {
                const asmGrades = db.grades.filter((g) => g.assessmentId === asm.id);
                const avg =
                  asmGrades.length > 0
                    ? Math.round(asmGrades.reduce((s, g) => s + Number(g.nilai), 0) / asmGrades.length)
                    : 0;
                const passed = avg >= (asm.kktp || settings.kktpDefault);
                return (
                  <div key={asm.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="truncate pr-2">{asm.judul}</span>
                      <span className={passed ? 'text-emerald-600' : 'text-amber-600'}>
                        Rata-rata: {avg} / 100
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          passed ? 'bg-[#178C8C]' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, avg)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={`p-6 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base">Kalender Akademik</h3>
            <button
              onClick={() => onNavigate('kalender')}
              className="text-xs font-semibold text-[#173B70] dark:text-blue-300 hover:underline"
            >
              Lihat semua
            </button>
          </div>
          {db.calendar.length === 0 ? (
            <div className="py-10 text-center border border-dashed rounded-xl border-slate-300 dark:border-slate-700">
              <p className="text-xs text-slate-500">Belum ada agenda pendidikan.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {db.calendar.slice(0, 4).map((ev) => (
                <div
                  key={ev.id}
                  className={`p-3 rounded-xl border flex items-start justify-between gap-2 ${
                    dark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{ev.judul}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{ev.tanggalMulai}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[#173B70]/10 text-[#173B70] dark:bg-blue-900/50 dark:text-blue-200 shrink-0">
                    {ev.kategori}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  label: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  dark: boolean;
  onClick: () => void;
}> = ({ label, value, sub, icon, dark, onClick }) => (
  <button
    onClick={onClick}
    className={`p-5 rounded-2xl border text-left transition-all hover:shadow-md ${
      dark ? 'bg-[#13203B] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200/80 hover:border-blue-200'
    }`}
  >
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">{icon}</span>
    </div>
    <p className="text-3xl font-extrabold mt-2">{value}</p>
    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{sub}</p>
  </button>
);

// --- 2. IDENTITAS GURU ---
const TeacherIdentityView: React.FC<{
  teacher: TeacherProfile;
  dark: boolean;
  onSave: (t: TeacherProfile) => void;
}> = ({ teacher, dark, onSave }) => {
  const [form, setForm] = useState<TeacherProfile>(teacher);
  useEffect(() => setForm(teacher), [teacher]);

  const inputCls = `w-full px-3.5 py-2.5 rounded-xl border text-sm min-h-[44px] ${
    dark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
  }`;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setForm((f) => ({ ...f, fotoUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className={`p-6 rounded-2xl border space-y-6 ${dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center border">
            {form.fotoUrl ? <img src={form.fotoUrl} alt="Foto" className="w-full h-full object-cover" /> : <SchoolLogo size={44} />}
          </div>
          <div>
            <h3 className="font-bold text-lg">Identitas Guru & Satuan Pendidikan</h3>
            <p className="text-xs text-slate-500">Data ini otomatis digunakan pada Kop Surat & Tanda Tangan Dokumen Cetak.</p>
          </div>
        </div>
        <label className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700">
          Unggah Foto Profil
          <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1">Gelar Depan</label>
          <input className={inputCls} value={form.gelarDepan} onChange={(e) => setForm({ ...form, gelarDepan: e.target.value })} placeholder="Contoh: Drs." />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Nama Lengkap *</label>
          <input required className={inputCls} value={form.namaLengkap} onChange={(e) => setForm({ ...form, namaLengkap: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Gelar Belakang</label>
          <input className={inputCls} value={form.gelarBelakang} onChange={(e) => setForm({ ...form, gelarBelakang: e.target.value })} placeholder="Contoh: S.Pd., Gr." />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">NIP</label>
          <input className={inputCls} value={form.nip} onChange={(e) => setForm({ ...form, nip: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">NUPTK</label>
          <input className={inputCls} value={form.nuptk} onChange={(e) => setForm({ ...form, nuptk: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Pangkat / Golongan</label>
          <input className={inputCls} value={form.pangkatGolongan} onChange={(e) => setForm({ ...form, pangkatGolongan: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Jabatan</label>
          <input className={inputCls} value={form.jabatan} onChange={(e) => setForm({ ...form, jabatan: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Konsentrasi Keahlian</label>
          <input className={inputCls} value={form.konsentrasiKeahlian} onChange={(e) => setForm({ ...form, konsentrasiKeahlian: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Tahun Ajaran Aktif</label>
          <input className={inputCls} value={form.tahunAjaran} onChange={(e) => setForm({ ...form, tahunAjaran: e.target.value })} />
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1">Nama Sekolah *</label>
          <input required className={inputCls} value={form.namaSekolah} onChange={(e) => setForm({ ...form, namaSekolah: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">NPSN</label>
          <input className={inputCls} value={form.npsn} onChange={(e) => setForm({ ...form, npsn: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold mb-1">Alamat Sekolah</label>
          <input className={inputCls} value={form.alamatSekolah} onChange={(e) => setForm({ ...form, alamatSekolah: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Nama Kepala Sekolah</label>
          <input className={inputCls} value={form.kepalaSekolah} onChange={(e) => setForm({ ...form, kepalaSekolah: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">NIP Kepala Sekolah</label>
          <input className={inputCls} value={form.nipKepalaSekolah} onChange={(e) => setForm({ ...form, nipKepalaSekolah: e.target.value })} />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-[#173B70] hover:bg-blue-900 text-white font-semibold text-sm shadow-sm min-h-[44px]"
        >
          Simpan Perubahan Identitas
        </button>
      </div>
    </form>
  );
};

// --- 3. KALENDER PENDIDIKAN ---
const CalendarView: React.FC<{
  events: CalendarEvent[];
  semester: 'Ganjil' | 'Genap';
  dark: boolean;
  onAdd: (e: CalendarEvent) => void;
  onUpdate: (e: CalendarEvent) => void;
  onDelete: (id: string) => void;
}> = ({ events, semester, dark, onAdd, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [judul, setJudul] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState(todayISO());
  const [tanggalSelesai, setTanggalSelesai] = useState(todayISO());
  const [kategori, setKategori] = useState<AgendaCategory>('Praktik Bengkel');
  const [keterangan, setKeterangan] = useState('');

  const badgeColor: Record<AgendaCategory, string> = {
    'Hari Efektif': 'bg-emerald-100 text-emerald-800',
    'Libur Nasional': 'bg-rose-100 text-rose-800',
    'Libur Sekolah': 'bg-orange-100 text-orange-800',
    'Kegiatan Sekolah': 'bg-blue-100 text-blue-800',
    'Asesmen': 'bg-purple-100 text-purple-800',
    'Praktik Bengkel': 'bg-teal-100 text-teal-800',
    'Kegiatan Industri': 'bg-indigo-100 text-indigo-800',
    'Lainnya': 'bg-slate-100 text-slate-800',
  };

  const resetForm = () => {
    setEditingId(null);
    setJudul('');
    setTanggalMulai(todayISO());
    setTanggalSelesai(todayISO());
    setKategori('Praktik Bengkel');
    setKeterangan('');
  };

  const handleEdit = (ev: CalendarEvent) => {
    setEditingId(ev.id);
    setJudul(ev.judul);
    setTanggalMulai(ev.tanggalMulai);
    setTanggalSelesai(ev.tanggalSelesai);
    setKategori(ev.kategori);
    setKeterangan(ev.keterangan || '');
  };

  const inputCls = `w-full px-3.5 py-2.5 rounded-xl border text-sm min-h-[44px] ${
    dark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
  }`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!judul.trim()) return;
          if (editingId) {
            onUpdate({ id: editingId, judul, tanggalMulai, tanggalSelesai, kategori, semester, keterangan });
          } else {
            onAdd({ id: uid('cal'), judul, tanggalMulai, tanggalSelesai, kategori, semester, keterangan });
          }
          resetForm();
        }}
        className={`p-5 rounded-2xl border space-y-4 h-fit ${dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'}`}
      >
        <h3 className="font-bold text-base">{editingId ? 'Edit Agenda Pendidikan' : 'Tambah Agenda Pendidikan'}</h3>
        <div>
          <label className="block text-xs font-semibold mb-1">Judul Agenda *</label>
          <input required className={inputCls} value={judul} onChange={(e) => setJudul(e.target.value)} placeholder="Contoh: Uji Kompetensi Keahlian TSM" />
          <p className="text-[11px] text-slate-400 mt-1">Nama kegiatan akademik, asesmen, atau jadwal bengkel.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1">Tanggal Mulai</label>
            <input type="date" className={inputCls} value={tanggalMulai} onChange={(e) => setTanggalMulai(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Tanggal Selesai</label>
            <input type="date" className={inputCls} value={tanggalSelesai} onChange={(e) => setTanggalSelesai(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Kategori</label>
          <select className={inputCls} value={kategori} onChange={(e) => setKategori(e.target.value as AgendaCategory)}>
            {Object.keys(badgeColor).map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Keterangan</label>
          <input className={inputCls} value={keterangan} onChange={(e) => setKeterangan(e.target.value)} placeholder="Catatan tambahan lokasi/kelas..." />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#173B70] text-white font-semibold text-sm min-h-[44px]">
            {editingId ? 'Simpan Perubahan' : '+ Simpan Agenda'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="px-4 py-2.5 rounded-xl border text-sm font-semibold">
              Batal
            </button>
          )}
        </div>
      </form>

      <div className={`lg:col-span-2 p-5 rounded-2xl border ${dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'}`}>
        <h3 className="font-bold text-base mb-4">Daftar Agenda Kalender Pendidikan ({events.length})</h3>
        {events.length === 0 ? (
          <p className="text-sm text-slate-500 py-8 text-center">Belum ada agenda kalender pendidikan.</p>
        ) : (
          <div className="space-y-3">
            {events.map((ev) => (
              <div
                key={ev.id}
                className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                  dark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${badgeColor[ev.kategori]}`}>
                      {ev.kategori}
                    </span>
                    <span className="text-xs text-slate-500">
                      {ev.tanggalMulai} {ev.tanggalSelesai !== ev.tanggalMulai ? `s.d. ${ev.tanggalSelesai}` : ''}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm mt-1">{ev.judul}</h4>
                  {ev.keterangan && <p className="text-xs text-slate-500 mt-0.5">{ev.keterangan}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEdit(ev)}
                    className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50"
                    title="Edit Agenda"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(ev.id)}
                    className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                    title="Hapus"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
// --- 4. DATA KELAS & PESERTA DIDIK ---
const ClassesStudentsView: React.FC<{
  classes: SchoolClass[];
  students: Student[];
  settings: AppSettings;
  dark: boolean;
  onAddClass: (c: SchoolClass) => void;
  onUpdateClass: (c: SchoolClass) => void;
  onDeleteClass: (id: string) => void;
  onAddStudent: (s: Student) => void;
  onUpdateStudent: (s: Student) => void;
  onBulkImportStudents: (list: Student[]) => void;
  onDeleteStudent: (id: string) => void;
}> = ({
  classes,
  students,
  settings,
  dark,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
  onAddStudent,
  onUpdateStudent,
  onBulkImportStudents,
  onDeleteStudent,
}) => {
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [namaKelas, setNamaKelas] = useState('');
  const [tingkat, setTingkat] = useState<'X' | 'XI' | 'XII'>('X');
  const [waliKelas, setWaliKelas] = useState('');

  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [nis, setNis] = useState('');
  const [namaSiswa, setNamaSiswa] = useState('');
  const [jk, setJk] = useState<'L' | 'P'>('L');
  const [studentClassId, setStudentClassId] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);

  const resetClassForm = () => {
    setEditingClassId(null);
    setNamaKelas('');
    setTingkat('X');
    setWaliKelas('');
  };

  const resetStudentForm = () => {
    setEditingStudentId(null);
    setNis('');
    setNamaSiswa('');
    setJk('L');
  };

  const inputCls = `w-full px-3.5 py-2.5 rounded-xl border text-sm min-h-[44px] ${
    dark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
  }`;

  const filteredStudents = students.filter((s) => {
    const matchClass = selectedClass === 'ALL' || s.classId === selectedClass;
    const matchSearch =
      s.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nis.toLowerCase().includes(searchQuery.toLowerCase());
    return matchClass && matchSearch;
  });

  const handleBulkParse = () => {
    const targetCls = studentClassId || classes[0]?.id || '';
    if (!targetCls) return;
    const lines = bulkText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const parsed: Student[] = lines.map((line, idx) => {
      const parts = line.split(/[,;\t]/).map((p) => p.trim());
      return {
        id: uid('std'),
        nis: parts[0] || `NIS-${Date.now()}-${idx}`,
        nisn: parts[2] || '',
        namaLengkap: parts[1] || parts[0],
        jenisKelamin: parts[3]?.toUpperCase() === 'P' ? 'P' : 'L',
        classId: targetCls,
        statusAktif: 'Aktif',
        keterangan: '',
      };
    });
    if (parsed.length > 0) {
      onBulkImportStudents(parsed);
      setBulkText('');
      setShowBulkModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className={`p-5 rounded-2xl border ${dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'}`}>
        <h3 className="font-bold text-base mb-1">Rombongan Belajar / Kelas TSM</h3>
        <p className="text-xs text-slate-500 mb-4">Kelas X otomatis terhubung ke Fase E, sedangkan Kelas XI & XII terhubung ke Fase F.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!namaKelas.trim()) return;
            const payload: SchoolClass = {
              id: editingClassId || uid('cls'),
              namaKelas,
              tingkat,
              fase: tingkat === 'X' ? 'E' : 'F',
              tahunAjaran: settings.tahunAjaran,
              semester: settings.semester,
              waliKelas,
            };
            if (editingClassId) {
              onUpdateClass(payload);
            } else {
              onAddClass(payload);
            }
            resetClassForm();
          }}
          className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-5"
        >
          <div>
            <label className="block text-[11px] font-semibold mb-1">Nama Kelas *</label>
            <input className={inputCls} placeholder="Contoh: X TSM 1 / XI TSM 1" value={namaKelas} onChange={(e) => setNamaKelas(e.target.value)} required />
          </div>
          <div>
            <label className="block text-[11px] font-semibold mb-1">Tingkat & Fase *</label>
            <select className={inputCls} value={tingkat} onChange={(e) => setTingkat(e.target.value as any)}>
              <option value="X">Kelas X (Fase E)</option>
              <option value="XI">Kelas XI (Fase F)</option>
              <option value="XII">Kelas XII (Fase F)</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold mb-1">Wali Kelas (Opsional)</label>
            <input className={inputCls} placeholder="Nama Wali Kelas" value={waliKelas} onChange={(e) => setWaliKelas(e.target.value)} />
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl bg-[#173B70] text-white font-semibold text-sm min-h-[44px]">
              {editingClassId ? 'Update' : '+ Tambah Kelas'}
            </button>
            {editingClassId && (
              <button type="button" onClick={resetClassForm} className="px-3 py-2.5 rounded-xl border text-xs font-semibold min-h-[44px]">
                Batal
              </button>
            )}
          </div>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {classes.map((c) => {
            const count = students.filter((s) => s.classId === c.id).length;
            return (
              <div
                key={c.id}
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  dark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div>
                  <h4 className="font-bold text-sm">{c.namaKelas}</h4>
                  <p className="text-xs text-slate-500">Kelas {c.tingkat} • Fase {c.fase} • {count} Siswa</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingClassId(c.id);
                      setNamaKelas(c.namaKelas);
                      setTingkat(c.tingkat);
                      setWaliKelas(c.waliKelas || '');
                    }}
                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                    title="Edit Kelas"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button type="button" onClick={() => onDeleteClass(c.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg" title="Hapus Kelas">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`p-5 rounded-2xl border space-y-4 ${dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base">Daftar Peserta Didik ({filteredStudents.length})</h3>
            <p className="text-xs text-slate-500">Tambahkan peserta didik satu per satu atau salin-tempel langsung dari daftar Excel.</p>
          </div>
          <button
            onClick={() => setShowBulkModal(!showBulkModal)}
            className="px-4 py-2 rounded-xl bg-[#178C8C] text-white text-xs font-semibold flex items-center gap-2 min-h-[44px]"
          >
            <Upload size={15} /> Impor Massal (Copy-Paste Excel)
          </button>
        </div>

        {showBulkModal && (
          <div className="p-4 rounded-xl border border-teal-500/40 bg-teal-500/5 space-y-3">
            <p className="text-xs font-semibold">
              Tempel daftar siswa dari Excel (Format per baris: <code>NIS, Nama Lengkap, NISN, L/P</code>):
            </p>
            <select
              className={inputCls}
              value={studentClassId || classes[0]?.id || ''}
              onChange={(e) => setStudentClassId(e.target.value)}
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.namaKelas}</option>
              ))}
            </select>
            <textarea
              rows={4}
              className={`w-full p-3 rounded-xl border text-xs font-mono ${dark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`}
              placeholder={'241010, Rizky Ramadhan, 0081234510, L\n241011, Wahyu Setiawan, 0081234511, L'}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
            />
            <div className="flex gap-2">
              <button onClick={handleBulkParse} className="px-4 py-2 rounded-xl bg-[#173B70] text-white text-xs font-semibold">
                Proses Impor
              </button>
              <button onClick={() => setShowBulkModal(false)} className="px-4 py-2 rounded-xl border text-xs">
                Tutup
              </button>
            </div>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const targetCls = studentClassId || classes[0]?.id;
            if (!targetCls || !namaSiswa.trim()) return;
            const existing = students.find((s) => s.id === editingStudentId);
            const payload: Student = {
              id: editingStudentId || uid('std'),
              nis,
              nisn: existing?.nisn || '',
              namaLengkap: namaSiswa,
              jenisKelamin: jk,
              classId: targetCls,
              statusAktif: existing?.statusAktif || 'Aktif',
              keterangan: existing?.keterangan || '',
            };
            if (editingStudentId) {
              onUpdateStudent(payload);
            } else {
              onAddStudent(payload);
            }
            resetStudentForm();
          }}
          className="grid grid-cols-1 sm:grid-cols-5 gap-3"
        >
          <div>
            <label className="block text-[11px] font-semibold mb-1">NIS *</label>
            <input className={inputCls} placeholder="Nomor Induk" value={nis} onChange={(e) => setNis(e.target.value)} required />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold mb-1">Nama Lengkap Peserta Didik *</label>
            <input className={inputCls} placeholder="Nama sesuai rapor/ijazah" value={namaSiswa} onChange={(e) => setNamaSiswa(e.target.value)} required />
          </div>
          <div>
            <label className="block text-[11px] font-semibold mb-1">Kelas *</label>
            <select className={inputCls} value={studentClassId || classes[0]?.id || ''} onChange={(e) => setStudentClassId(e.target.value)}>
              <option value="">-- Pilih Kelas --</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.namaKelas}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold mb-1">L/P & Simpan</label>
            <div className="flex gap-2">
              <select className={inputCls} value={jk} onChange={(e) => setJk(e.target.value as any)}>
                <option value="L">L</option>
                <option value="P">P</option>
              </select>
              <button type="submit" className="px-4 py-2.5 rounded-xl bg-[#173B70] text-white font-semibold text-sm shrink-0">
                {editingStudentId ? 'Update' : '+ Tambah'}
              </button>
              {editingStudentId && (
                <button type="button" onClick={resetStudentForm} className="px-3 py-2.5 rounded-xl border text-xs font-semibold shrink-0">
                  Batal
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="flex flex-wrap gap-3 pt-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input
              className={`${inputCls} pl-10`}
              placeholder="Cari nama peserta didik atau NIS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className={`${inputCls} w-auto`}
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="ALL">Semua Kelas ({students.length})</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.namaKelas}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className={`text-xs uppercase ${dark ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
              <tr>
                <th className="p-3">NIS</th>
                <th className="p-3">Nama Lengkap</th>
                <th className="p-3">L/P</th>
                <th className="p-3">Kelas</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredStudents.map((st) => (
                <tr key={st.id}>
                  <td className="p-3 font-mono text-xs">{st.nis}</td>
                  <td className="p-3 font-semibold">{st.namaLengkap}</td>
                  <td className="p-3">{st.jenisKelamin}</td>
                  <td className="p-3">{classes.find((c) => c.id === st.classId)?.namaKelas || '-'}</td>
                  <td className="p-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingStudentId(st.id);
                          setNis(st.nis);
                          setNamaSiswa(st.namaLengkap);
                          setJk(st.jenisKelamin);
                          setStudentClassId(st.classId);
                        }}
                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg"
                        title="Edit Peserta Didik"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button type="button" onClick={() => onDeleteStudent(st.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg" title="Hapus">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- 5. MATA PELAJARAN ---
const SubjectsView: React.FC<{
  subjects: Subject[];
  settings: AppSettings;
  dark: boolean;
  onAdd: (s: Subject) => void;
  onUpdate: (s: Subject) => void;
  onDelete: (id: string) => void;
}> = ({ subjects, settings, dark, onAdd, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [namaMapel, setNamaMapel] = useState('');
  const [fase, setFase] = useState<'E' | 'F'>('E');
  const [tingkat, setTingkat] = useState<'X' | 'XI' | 'XII'>('X');
  const [jumlahJp, setJumlahJp] = useState(108);
  const [keterangan, setKeterangan] = useState('');

  const handleFaseChange = (newFase: 'E' | 'F') => {
    setFase(newFase);
    if (newFase === 'E') {
      setTingkat('X');
    } else if (tingkat === 'X') {
      setTingkat('XI');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setNamaMapel('');
    setFase('E');
    setTingkat('X');
    setJumlahJp(108);
    setKeterangan('');
  };

  const inputCls = `w-full px-3.5 py-2.5 rounded-xl border text-sm min-h-[44px] ${
    dark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
  }`;

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!namaMapel.trim()) return;
          const payload: Subject = {
            id: editingId || uid('sub'),
            namaMapel,
            kelompok: fase === 'E' ? 'Dasar-Dasar Program Keahlian' : 'Kejuruan - Konsentrasi Keahlian',
            programKeahlian: 'Teknik Otomotif',
            konsentrasiKeahlian: 'Teknik Sepeda Motor',
            fase,
            tingkat,
            jumlahJp,
            tahunAjaran: settings.tahunAjaran,
            semester: settings.semester,
            keterangan,
          };
          if (editingId) {
            onUpdate(payload);
          } else {
            onAdd(payload);
          }
          resetForm();
        }}
        className={`p-5 rounded-2xl border space-y-4 ${
          dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="border-b pb-3 border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-base">
            {editingId ? 'Edit Mata Pelajaran Kejuruan TSM' : 'Tambah Mata Pelajaran Kejuruan TSM'}
          </h3>
          <p className="text-xs text-slate-500">
            Fase E otomatis dipetakan ke Kelas X (Dasar Program Keahlian), sedangkan Fase F untuk Kelas XI & XII (Konsentrasi Keahlian).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold mb-1">Nama Mata Pelajaran *</label>
            <input
              required
              className={inputCls}
              placeholder="Contoh: Dasar-Dasar Teknik Otomotif"
              value={namaMapel}
              onChange={(e) => setNamaMapel(e.target.value)}
            />
            <p className="text-[11px] text-slate-400 mt-1">Tulis nama mapel sesuai struktur kurikulum SMK.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Fase Kurikulum *</label>
            <select className={inputCls} value={fase} onChange={(e) => handleFaseChange(e.target.value as 'E' | 'F')}>
              <option value="E">Fase E (Kelas X SMK)</option>
              <option value="F">Fase F (Kelas XI / XII SMK)</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">Fase E = Dasar Kejuruan; Fase F = Konsentrasi.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Tingkat Kelas *</label>
            <select className={inputCls} value={tingkat} onChange={(e) => setTingkat(e.target.value as 'X' | 'XI' | 'XII')}>
              {fase === 'E' ? (
                <option value="X">Kelas X</option>
              ) : (
                <>
                  <option value="XI">Kelas XI</option>
                  <option value="XII">Kelas XII</option>
                </>
              )}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">Otomatis menyesuaikan pilihan Fase.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Alokasi Jam Pelajaran (JP) *</label>
            <input
              type="number"
              min={1}
              className={inputCls}
              placeholder="Contoh: 108"
              value={jumlahJp}
              onChange={(e) => setJumlahJp(Number(e.target.value))}
            />
            <p className="text-[11px] text-slate-400 mt-1">Total JP per semester/tahun (1 JP = 45 menit).</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold mb-1">Keterangan / Fokus Kompetensi (Opsional)</label>
            <input
              className={inputCls}
              placeholder="Contoh: Praktik bengkel dasar & alat ukur mekanik"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
            />
            <p className="text-[11px] text-slate-400 mt-1">Catatan singkat ruang lingkup pembelajaran.</p>
          </div>

          <div className="flex items-end gap-2">
            <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl bg-[#173B70] hover:bg-blue-900 text-white font-semibold text-sm min-h-[44px]">
              {editingId ? 'Simpan Perubahan' : '+ Tambah Mata Pelajaran'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="px-3 py-2.5 rounded-xl border text-xs font-semibold min-h-[44px]">
                Batal
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects.map((sub) => (
          <div
            key={sub.id}
            className={`p-5 rounded-2xl border flex items-start justify-between gap-4 ${
              dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#173B70]/10 text-[#173B70] dark:bg-blue-900/50 dark:text-blue-200">
                Fase {sub.fase} • Kelas {sub.tingkat} • {sub.jumlahJp} JP
              </span>
              <h4 className="font-bold text-base mt-2">{sub.namaMapel}</h4>
              <p className="text-xs text-slate-500 mt-1">
                {sub.konsentrasiKeahlian} • T.A. {sub.tahunAjaran} ({sub.semester})
              </p>
              {sub.keterangan && <p className="text-xs text-slate-400 mt-1">{sub.keterangan}</p>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setEditingId(sub.id);
                  setNamaMapel(sub.namaMapel);
                  setFase(sub.fase);
                  setTingkat(sub.tingkat);
                  setJumlahJp(sub.jumlahJp);
                  setKeterangan(sub.keterangan || '');
                }}
                className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                title="Edit Mata Pelajaran"
              >
                <Edit3 size={16} />
              </button>
              <button type="button" onClick={() => onDelete(sub.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg" title="Hapus Mata Pelajaran">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 6. CAPAIAN PEMBELAJARAN (CP) ---
const CPView: React.FC<{
  cps: LearningOutcome[];
  subjects: Subject[];
  dark: boolean;
  onAdd: (cp: LearningOutcome) => void;
  onUpdate: (cp: LearningOutcome) => void;
  onDelete: (id: string) => void;
}> = ({ cps, subjects, dark, onAdd, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [elemen, setElemen] = useState('');
  const [deskripsiCp, setDeskripsiCp] = useState('');
  const [sumberDokumen, setSumberDokumen] = useState('Keputusan Kepala BSKAP Kemendikdasmen');
  const [tahunDokumen, setTahunDokumen] = useState('2025');

  const resetForm = () => {
    setEditingId(null);
    setElemen('');
    setDeskripsiCp('');
    setSumberDokumen('Keputusan Kepala BSKAP Kemendikdasmen');
    setTahunDokumen('2025');
  };

  const inputCls = `w-full px-3.5 py-2.5 rounded-xl border text-sm min-h-[44px] ${
    dark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
  }`;

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs flex items-start gap-3">
        <Info size={18} className="text-[#173B70] dark:text-blue-300 shrink-0 mt-0.5" />
        <p>
          Masukkan teks <strong>Capaian Pembelajaran (CP)</strong> resmi dari dokumen BSKAP Kemendikdasmen beserta nomor/tahun rujukan agar tetap akurat dan dapat diaudit.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const sub = subjects.find((s) => s.id === (subjectId || subjects[0]?.id));
          if (!sub || !elemen.trim() || !deskripsiCp.trim()) return;
          const payload: LearningOutcome = {
            id: editingId || uid('cp'),
            subjectId: sub.id,
            fase: sub.fase,
            elemen,
            deskripsiCp,
            tahunDokumen,
            sumberDokumen,
            statusAktif: true,
          };
          if (editingId) {
            onUpdate(payload);
          } else {
            onAdd(payload);
          }
          resetForm();
        }}
        className={`p-5 rounded-2xl border space-y-4 ${dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'}`}
      >
        <h3 className="font-bold text-base">
          {editingId ? 'Edit Capaian Pembelajaran (CP)' : 'Input Capaian Pembelajaran (CP)'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Mata Pelajaran *</label>
            <select className={inputCls} value={subjectId || subjects[0]?.id || ''} onChange={(e) => setSubjectId(e.target.value)}>
              <option value="">-- Pilih Mata Pelajaran --</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.namaMapel} (Fase {s.fase})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Elemen CP *</label>
            <input required className={inputCls} placeholder="Contoh: Perawatan Engine Sepeda Motor" value={elemen} onChange={(e) => setElemen(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Sumber Dokumen Regulasi</label>
            <input className={inputCls} placeholder="Nomor SK BSKAP / Tahun" value={sumberDokumen} onChange={(e) => setSumberDokumen(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Deskripsi Lengkap Capaian Pembelajaran *</label>
          <textarea
            required
            rows={3}
            className={`w-full p-3.5 rounded-xl border text-sm ${dark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`}
            placeholder="Salin & tempel deskripsi lengkap Capaian Pembelajaran (CP)..."
            value={deskripsiCp}
            onChange={(e) => setDeskripsiCp(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#173B70] text-white font-semibold text-sm min-h-[44px]">
            {editingId ? 'Simpan Perubahan CP' : '+ Simpan Capaian Pembelajaran'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="px-4 py-2.5 rounded-xl border text-sm font-semibold min-h-[44px]">
              Batal
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {cps.map((cp) => {
          const sub = subjects.find((s) => s.id === cp.subjectId);
          return (
            <div key={cp.id} className={`p-5 rounded-2xl border ${dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-[#178C8C]">{sub?.namaMapel} • Fase {cp.fase}</span>
                  <h4 className="font-bold text-base mt-0.5">Elemen: {cp.elemen}</h4>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(cp.id);
                      setSubjectId(cp.subjectId);
                      setElemen(cp.elemen);
                      setDeskripsiCp(cp.deskripsiCp);
                      setSumberDokumen(cp.sumberDokumen);
                      setTahunDokumen(cp.tahunDokumen);
                    }}
                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                    title="Edit CP"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button type="button" onClick={() => onDelete(cp.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg" title="Hapus CP">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-sm mt-2 leading-relaxed">{cp.deskripsiCp}</p>
              <p className="text-xs text-slate-500 mt-3">Referensi: {cp.sumberDokumen} ({cp.tahunDokumen})</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- 7. ANALISIS CAPAIAN PEMBELAJARAN ---
const CPAnalysisView: React.FC<{
  analyses: CPAnalysis[];
  cps: LearningOutcome[];
  subjects: Subject[];
  dark: boolean;
  onAdd: (a: CPAnalysis) => void;
  onUpdate: (a: CPAnalysis) => void;
  onDelete: (id: string) => void;
}> = ({ analyses, cps, dark, onAdd, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cpId, setCpId] = useState(cps[0]?.id || '');
  const [kompetensi, setKompetensi] = useState('');
  const [lingkupMateri, setLingkupMateri] = useState('');
  const [kko, setKko] = useState('');
  const [bukti, setBukti] = useState('');
  const [praktik, setPraktik] = useState('');
  const [k3, setK3] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setKompetensi('');
    setLingkupMateri('');
    setKko('');
    setBukti('');
    setPraktik('');
    setK3('');
  };

  const inputCls = `w-full px-3.5 py-2.5 rounded-xl border text-sm min-h-[44px] ${
    dark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
  }`;

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const cp = cps.find((c) => c.id === (cpId || cps[0]?.id));
          if (!cp || !kompetensi.trim()) return;
          const payload: CPAnalysis = {
            id: editingId || uid('an'),
            cpId: cp.id,
            subjectId: cp.subjectId,
            fase: cp.fase,
            elemen: cp.elemen,
            kompetensi,
            lingkupMateri,
            kataKerjaOperasional: kko,
            buktiKetercapaian: bukti,
            kebutuhanPraktik: praktik,
            aspekK3: k3,
            keterangan: '',
          };
          if (editingId) {
            onUpdate(payload);
          } else {
            onAdd(payload);
          }
          resetForm();
        }}
        className={`p-5 rounded-2xl border space-y-4 ${dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'}`}
      >
        <h3 className="font-bold text-base">
          {editingId ? 'Edit Hasil Analisis CP' : 'Lembar Analisis Capaian Pembelajaran (CP → Kompetensi & Materi)'}
        </h3>
        <div>
          <label className="block text-xs font-semibold mb-1">Pilih Elemen CP yang Dianalisis *</label>
          <select className={inputCls} value={cpId || cps[0]?.id || ''} onChange={(e) => setCpId(e.target.value)}>
            <option value="">-- Pilih CP --</option>
            {cps.map((c) => (
              <option key={c.id} value={c.id}>Elemen: {c.elemen} (Fase {c.fase})</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input required className={inputCls} placeholder="Kompetensi yang harus dikuasai" value={kompetensi} onChange={(e) => setKompetensi(e.target.value)} />
          <input required className={inputCls} placeholder="Lingkup Materi Inti TSM" value={lingkupMateri} onChange={(e) => setLingkupMateri(e.target.value)} />
          <input className={inputCls} placeholder="Kata Kerja Operasional (KKO)" value={kko} onChange={(e) => setKko(e.target.value)} />
          <input className={inputCls} placeholder="Indikator / Bukti Ketercapaian" value={bukti} onChange={(e) => setBukti(e.target.value)} />
          <input className={inputCls} placeholder="Kebutuhan Unit / Alat Praktik Bengkel" value={praktik} onChange={(e) => setPraktik(e.target.value)} />
          <input className={inputCls} placeholder="Aspek Keselamatan Kerja (K3LH)" value={k3} onChange={(e) => setK3(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#173B70] text-white font-semibold text-sm min-h-[44px]">
            {editingId ? 'Simpan Perubahan Analisis' : '+ Simpan Hasil Analisis CP'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="px-4 py-2.5 rounded-xl border text-sm font-semibold min-h-[44px]">
              Batal
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm text-left">
          <thead className={`text-xs uppercase ${dark ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
            <tr>
              <th className="p-3.5">Elemen</th>
              <th className="p-3.5">Kompetensi</th>
              <th className="p-3.5">Lingkup Materi</th>
              <th className="p-3.5">Kebutuhan Praktik & K3</th>
              <th className="p-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {analyses.map((a) => (
              <tr key={a.id} className={dark ? 'bg-[#13203B]' : 'bg-white'}>
                <td className="p-3.5 font-semibold">{a.elemen}</td>
                <td className="p-3.5">{a.kompetensi}</td>
                <td className="p-3.5">{a.lingkupMateri}</td>
                <td className="p-3.5 text-xs">
                  <p><strong>Alat:</strong> {a.kebutuhanPraktik || '-'}</p>
                  <p className="text-amber-600"><strong>K3:</strong> {a.aspekK3 || '-'}</p>
                </td>
                <td className="p-3.5 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(a.id);
                        setCpId(a.cpId);
                        setKompetensi(a.kompetensi);
                        setLingkupMateri(a.lingkupMateri);
                        setKko(a.kataKerjaOperasional || '');
                        setBukti(a.buktiKetercapaian || '');
                        setPraktik(a.kebutuhanPraktik || '');
                        setK3(a.aspekK3 || '');
                      }}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                      title="Edit Analisis"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button type="button" onClick={() => onDelete(a.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg" title="Hapus">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- 8. ALUR TUJUAN PEMBELAJARAN (ATP) ---
const ATPView: React.FC<{
  atps: ATPItem[];
  subjects: Subject[];
  analyses: CPAnalysis[];
  teacher: TeacherProfile;
  settings: AppSettings;
  dark: boolean;
  onAdd: (item: ATPItem) => void;
  onUpdate: (item: ATPItem) => void;
  onReorder: (next: ATPItem[]) => void;
  onDelete: (id: string) => void;
  onOpenPrint: (title: string, content: React.ReactNode) => void;
}> = ({ atps, subjects, analyses, settings, dark, onAdd, onUpdate, onReorder, onDelete, onOpenPrint }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [kodeTp, setKodeTp] = useState('TP.10.1');
  const [tpText, setTpText] = useState('');
  const [lingkup, setLingkup] = useState('');
  const [jp, setJp] = useState(12);

  const sortedAtps = [...atps].sort((a, b) => a.urutan - b.urutan);

  const resetForm = () => {
    setEditingId(null);
    setKodeTp(`TP.10.${sortedAtps.length + 1}`);
    setTpText('');
    setLingkup('');
    setJp(12);
  };

  const moveItem = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= sortedAtps.length) return;
    const copy = [...sortedAtps];
    const [removed] = copy.splice(index, 1);
    copy.splice(target, 0, removed);
    const reindexed = copy.map((item, idx) => ({ ...item, urutan: idx + 1 }));
    onReorder(reindexed);
  };

  const inputCls = `w-full px-3.5 py-2.5 rounded-xl border text-sm min-h-[44px] ${
    dark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
  }`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-base">Alur Tujuan Pembelajaran (ATP)</h3>
          <p className="text-xs text-slate-500">Susun urutan logis Tujuan Pembelajaran dan alokasi JP.</p>
        </div>
        <button
          onClick={() =>
            onOpenPrint(
              `ALUR TUJUAN PEMBELAJARAN (ATP) — T.A. ${settings.tahunAjaran}`,
              <table className="w-full border-collapse border border-slate-800 text-xs">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-800 p-2">No</th>
                    <th className="border border-slate-800 p-2">Kode TP</th>
                    <th className="border border-slate-800 p-2">Elemen</th>
                    <th className="border border-slate-800 p-2">Tujuan Pembelajaran</th>
                    <th className="border border-slate-800 p-2">Lingkup Materi</th>
                    <th className="border border-slate-800 p-2">Alokasi</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAtps.map((a, i) => (
                    <tr key={a.id}>
                      <td className="border border-slate-800 p-2 text-center">{i + 1}</td>
                      <td className="border border-slate-800 p-2 font-bold">{a.kodeTp}</td>
                      <td className="border border-slate-800 p-2">{a.elemen}</td>
                      <td className="border border-slate-800 p-2">{a.tujuanPembelajaran}</td>
                      <td className="border border-slate-800 p-2">{a.lingkupMateri}</td>
                      <td className="border border-slate-800 p-2 text-center">{a.alokasiJp} JP</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
          className="px-4 py-2.5 rounded-xl bg-[#178C8C] text-white text-xs font-semibold flex items-center gap-2 min-h-[44px]"
        >
          <Printer size={16} /> Pratinjau Cetak ATP
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const sub = subjects.find((s) => s.id === (subjectId || subjects[0]?.id));
          if (!sub || !tpText.trim()) return;
          const existing = atps.find((a) => a.id === editingId);
          const payload: ATPItem = {
            id: editingId || uid('atp'),
            subjectId: sub.id,
            analysisId: existing?.analysisId || analyses[0]?.id || '',
            fase: sub.fase,
            tahunAjaran: settings.tahunAjaran,
            semester: settings.semester,
            elemen: sub.namaMapel,
            kodeTp,
            tujuanPembelajaran: tpText,
            kompetensi: tpText.split(' ')[0] || 'Menerapkan',
            lingkupMateri: lingkup,
            urutan: existing ? existing.urutan : sortedAtps.length + 1,
            alokasiJp: jp,
            keterangan: existing?.keterangan || '',
          };
          if (editingId) {
            onUpdate(payload);
          } else {
            onAdd(payload);
          }
          resetForm();
        }}
        className={`p-5 rounded-2xl border grid grid-cols-1 md:grid-cols-6 gap-3 ${
          dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <input className={inputCls} placeholder="Kode TP" value={kodeTp} onChange={(e) => setKodeTp(e.target.value)} required />
        <select className={inputCls} value={subjectId || subjects[0]?.id || ''} onChange={(e) => setSubjectId(e.target.value)}>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.namaMapel}</option>
          ))}
        </select>
        <input className={`${inputCls} md:col-span-2`} placeholder="Rumusan Tujuan Pembelajaran (Kompetensi + Materi)" value={tpText} onChange={(e) => setTpText(e.target.value)} required />
        <input className={inputCls} placeholder="Lingkup Materi" value={lingkup} onChange={(e) => setLingkup(e.target.value)} />
        <div className="flex gap-2">
          <input type="number" className={inputCls} value={jp} onChange={(e) => setJp(Number(e.target.value))} title="JP" />
          <button type="submit" className="px-4 py-2.5 rounded-xl bg-[#173B70] text-white font-semibold text-sm shrink-0">
            {editingId ? 'Update' : '+ TP'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="px-3 py-2.5 rounded-xl border text-xs font-semibold shrink-0">
              Batal
            </button>
          )}
        </div>
      </form>

      <div className="space-y-2.5">
        {sortedAtps.map((item, idx) => (
          <div
            key={item.id}
            className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
              dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-xl bg-[#173B70] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-[#178C8C]">{item.kodeTp}</span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold">
                    {item.alokasiJp} JP
                  </span>
                  <span className="text-xs text-slate-500">{item.lingkupMateri}</span>
                </div>
                <p className="text-sm font-medium mt-1">{item.tujuanPembelajaran}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button type="button" onClick={() => moveItem(idx, -1)} disabled={idx === 0} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30" title="Geser Naik">
                <ArrowUp size={16} />
              </button>
              <button type="button" onClick={() => moveItem(idx, 1)} disabled={idx === sortedAtps.length - 1} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30" title="Geser Turun">
                <ArrowDown size={16} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingId(item.id);
                  setSubjectId(item.subjectId);
                  setKodeTp(item.kodeTp);
                  setTpText(item.tujuanPembelajaran);
                  setLingkup(item.lingkupMateri);
                  setJp(item.alokasiJp);
                }}
                className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                title="Edit TP"
              >
                <Edit3 size={16} />
              </button>
              <button type="button" onClick={() => onDelete(item.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg" title="Hapus TP">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 9. PROTA ---
const ProtaView: React.FC<{
  protas: ProtaItem[];
  atps: ATPItem[];
  subjects: Subject[];
  teacher: TeacherProfile;
  settings: AppSettings;
  dark: boolean;
  onAdd: (p: ProtaItem) => void;
  onUpdate: (p: ProtaItem) => void;
  onDelete: (id: string) => void;
  onOpenPrint: (title: string, content: React.ReactNode) => void;
}> = ({ protas, atps, settings, dark, onAdd, onUpdate, onDelete, onOpenPrint }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [atpId, setAtpId] = useState(atps[0]?.id || '');
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>(settings.semester);
  const [bulan, setBulan] = useState('Juli');
  const [jp, setJp] = useState(12);

  const totalGanjil = protas.filter((p) => p.semester === 'Ganjil').reduce((s, p) => s + Number(p.alokasiJp), 0);
  const totalGenap = protas.filter((p) => p.semester === 'Genap').reduce((s, p) => s + Number(p.alokasiJp), 0);

  const resetForm = () => {
    setEditingId(null);
    setSemester(settings.semester);
    setBulan('Juli');
    setJp(12);
  };

  const inputCls = `w-full px-3.5 py-2.5 rounded-xl border text-sm min-h-[44px] ${
    dark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
  }`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-3">
          <span className="px-3.5 py-2 rounded-xl bg-[#173B70]/10 text-[#173B70] dark:bg-blue-900/40 dark:text-blue-200 text-xs font-bold">
            Total Ganjil: {totalGanjil} JP
          </span>
          <span className="px-3.5 py-2 rounded-xl bg-[#178C8C]/10 text-[#178C8C] text-xs font-bold">
            Total Genap: {totalGenap} JP
          </span>
          <span className="px-3.5 py-2 rounded-xl bg-slate-200/70 dark:bg-slate-800 text-xs font-bold">
            Total Tahunan: {totalGanjil + totalGenap} JP
          </span>
        </div>
        <button
          onClick={() =>
            onOpenPrint(
              `PROGRAM TAHUNAN (PROTA) — T.A. ${settings.tahunAjaran}`,
              <table className="w-full border-collapse border border-slate-800 text-xs">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-800 p-2">Semester</th>
                    <th className="border border-slate-800 p-2">Tujuan Pembelajaran</th>
                    <th className="border border-slate-800 p-2">Bulan</th>
                    <th className="border border-slate-800 p-2">Alokasi JP</th>
                  </tr>
                </thead>
                <tbody>
                  {protas.map((p) => {
                    const tp = atps.find((a) => a.id === p.atpId);
                    return (
                      <tr key={p.id}>
                        <td className="border border-slate-800 p-2 text-center">{p.semester}</td>
                        <td className="border border-slate-800 p-2">{tp ? `${tp.kodeTp} - ${tp.tujuanPembelajaran}` : '-'}</td>
                        <td className="border border-slate-800 p-2 text-center">{p.bulan}</td>
                        <td className="border border-slate-800 p-2 text-center font-bold">{p.alokasiJp} JP</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          }
          className="px-4 py-2.5 rounded-xl bg-[#178C8C] text-white text-xs font-semibold flex items-center gap-2 min-h-[44px]"
        >
          <Printer size={16} /> Cetak PROTA
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const tp = atps.find((a) => a.id === (atpId || atps[0]?.id));
          if (!tp) return;
          const payload: ProtaItem = {
            id: editingId || uid('prota'),
            subjectId: tp.subjectId,
            atpId: tp.id,
            fase: tp.fase,
            tingkat: tp.fase === 'E' ? 'X' : 'XI',
            tahunAjaran: settings.tahunAjaran,
            semester,
            bulan,
            alokasiJp: jp,
            keterangan: '',
          };
          if (editingId) {
            onUpdate(payload);
          } else {
            onAdd(payload);
          }
          resetForm();
        }}
        className={`p-5 rounded-2xl border grid grid-cols-1 md:grid-cols-5 gap-3 ${
          dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <select className={`${inputCls} md:col-span-2`} value={atpId || atps[0]?.id || ''} onChange={(e) => setAtpId(e.target.value)}>
          {atps.map((a) => (
            <option key={a.id} value={a.id}>{a.kodeTp}: {a.tujuanPembelajaran}</option>
          ))}
        </select>
        <select className={inputCls} value={semester} onChange={(e) => setSemester(e.target.value as any)}>
          <option value="Ganjil">Semester Ganjil</option>
          <option value="Genap">Semester Genap</option>
        </select>
        <select className={inputCls} value={bulan} onChange={(e) => setBulan(e.target.value)}>
          {['Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni'].map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <input type="number" className={inputCls} value={jp} onChange={(e) => setJp(Number(e.target.value))} />
          <button type="submit" className="px-4 py-2.5 rounded-xl bg-[#173B70] text-white font-semibold text-sm shrink-0">
            {editingId ? 'Update' : '+ PROTA'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="px-3 py-2.5 rounded-xl border text-xs font-semibold shrink-0">
              Batal
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm text-left">
          <thead className={`text-xs uppercase ${dark ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
            <tr>
              <th className="p-3.5">Semester</th>
              <th className="p-3.5">Tujuan Pembelajaran (ATP)</th>
              <th className="p-3.5">Bulan</th>
              <th className="p-3.5">Alokasi JP</th>
              <th className="p-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {protas.map((p) => {
              const tp = atps.find((a) => a.id === p.atpId);
              return (
                <tr key={p.id} className={dark ? 'bg-[#13203B]' : 'bg-white'}>
                  <td className="p-3.5 font-semibold">{p.semester}</td>
                  <td className="p-3.5">{tp ? `${tp.kodeTp} — ${tp.tujuanPembelajaran}` : '-'}</td>
                  <td className="p-3.5">{p.bulan}</td>
                  <td className="p-3.5 font-bold">{p.alokasiJp} JP</td>
                  <td className="p-3.5 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(p.id);
                          setAtpId(p.atpId);
                          setSemester(p.semester);
                          setBulan(p.bulan);
                          setJp(p.alokasiJp);
                        }}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                        title="Edit PROTA"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button type="button" onClick={() => onDelete(p.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg" title="Hapus">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- 10. PROMES ---
const PromesView: React.FC<{
  promes: PromesItem[];
  protas: ProtaItem[];
  atps: ATPItem[];
  subjects: Subject[];
  teacher: TeacherProfile;
  settings: AppSettings;
  dark: boolean;
  onAdd: (p: PromesItem) => void;
  onUpdate: (p: PromesItem) => void;
  onDelete: (id: string) => void;
  onOpenPrint: (title: string, content: React.ReactNode) => void;
}> = ({ promes, protas, atps, settings, dark, onAdd, onUpdate, onDelete, onOpenPrint }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [atpId, setAtpId] = useState(atps[0]?.id || '');
  const [bulan, setBulan] = useState('Juli');
  const [mingguKe, setMingguKe] = useState(1);
  const [jp, setJp] = useState(6);
  const [jenisMinggu, setJenisMinggu] = useState<'Efektif' | 'Asesmen' | 'Tidak Efektif'>('Efektif');

  const resetForm = () => {
    setEditingId(null);
    setBulan('Juli');
    setMingguKe(1);
    setJp(6);
    setJenisMinggu('Efektif');
  };

  const inputCls = `w-full px-3.5 py-2.5 rounded-xl border text-sm min-h-[44px] ${
    dark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
  }`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-base">Program Semester ({settings.semester} — {settings.tahunAjaran})</h3>
        <button
          onClick={() =>
            onOpenPrint(
              `PROGRAM SEMESTER (PROMES) ${settings.semester.toUpperCase()} — T.A. ${settings.tahunAjaran}`,
              <table className="w-full border-collapse border border-slate-800 text-xs">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-800 p-2">Bulan</th>
                    <th className="border border-slate-800 p-2">Minggu Ke</th>
                    <th className="border border-slate-800 p-2">Tujuan Pembelajaran</th>
                    <th className="border border-slate-800 p-2">Status Minggu</th>
                    <th className="border border-slate-800 p-2">JP</th>
                  </tr>
                </thead>
                <tbody>
                  {promes.map((item) => {
                    const tp = atps.find((a) => a.id === item.atpId);
                    return (
                      <tr key={item.id}>
                        <td className="border border-slate-800 p-2">{item.bulan}</td>
                        <td className="border border-slate-800 p-2 text-center">Minggu {item.mingguKe}</td>
                        <td className="border border-slate-800 p-2">{tp?.tujuanPembelajaran || '-'}</td>
                        <td className="border border-slate-800 p-2 text-center">{item.jenisMinggu}</td>
                        <td className="border border-slate-800 p-2 text-center font-bold">{item.jp} JP</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          }
          className="px-4 py-2.5 rounded-xl bg-[#178C8C] text-white text-xs font-semibold flex items-center gap-2 min-h-[44px]"
        >
          <Printer size={16} /> Cetak PROMES
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const tp = atps.find((a) => a.id === (atpId || atps[0]?.id));
          if (!tp) return;
          const payload: PromesItem = {
            id: editingId || uid('prm'),
            protaId: protas[0]?.id || '',
            subjectId: tp.subjectId,
            atpId: tp.id,
            semester: settings.semester,
            bulan,
            mingguKe,
            jp,
            jenisMinggu,
            keterangan: '',
          };
          if (editingId) {
            onUpdate(payload);
          } else {
            onAdd(payload);
          }
          resetForm();
        }}
        className={`p-5 rounded-2xl border grid grid-cols-1 md:grid-cols-6 gap-3 ${
          dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <select className={`${inputCls} md:col-span-2`} value={atpId || atps[0]?.id || ''} onChange={(e) => setAtpId(e.target.value)}>
          {atps.map((a) => (
            <option key={a.id} value={a.id}>{a.kodeTp} - {a.lingkupMateri}</option>
          ))}
        </select>
        <select className={inputCls} value={bulan} onChange={(e) => setBulan(e.target.value)}>
          {['Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni'].map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select className={inputCls} value={mingguKe} onChange={(e) => setMingguKe(Number(e.target.value))}>
          {[1, 2, 3, 4, 5].map((w) => (
            <option key={w} value={w}>Minggu ke-{w}</option>
          ))}
        </select>
        <select className={inputCls} value={jenisMinggu} onChange={(e) => setJenisMinggu(e.target.value as any)}>
          <option value="Efektif">Minggu Efektif</option>
          <option value="Asesmen">Agenda Asesmen</option>
          <option value="Tidak Efektif">Tidak Efektif</option>
        </select>
        <div className="flex gap-2">
          <input type="number" className={inputCls} value={jp} onChange={(e) => setJp(Number(e.target.value))} />
          <button type="submit" className="px-4 py-2.5 rounded-xl bg-[#173B70] text-white font-semibold text-sm shrink-0">
            {editingId ? 'Update' : '+'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="px-3 py-2.5 rounded-xl border text-xs font-semibold shrink-0">
              Batal
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm text-left">
          <thead className={`text-xs uppercase ${dark ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
            <tr>
              <th className="p-3.5">Bulan & Minggu</th>
              <th className="p-3.5">Tujuan Pembelajaran</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">JP</th>
              <th className="p-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {promes.map((item) => {
              const tp = atps.find((a) => a.id === item.atpId);
              return (
                <tr key={item.id} className={dark ? 'bg-[#13203B]' : 'bg-white'}>
                  <td className="p-3.5 font-semibold">{item.bulan} • Minggu {item.mingguKe}</td>
                  <td className="p-3.5">{tp?.tujuanPembelajaran || '-'}</td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800">
                      {item.jenisMinggu}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold">{item.jp} JP</td>
                  <td className="p-3.5 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(item.id);
                          setAtpId(item.atpId);
                          setBulan(item.bulan);
                          setMingguKe(item.mingguKe);
                          setJp(item.jp);
                          setJenisMinggu(item.jenisMinggu);
                        }}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                        title="Edit PROMES"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button type="button" onClick={() => onDelete(item.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg" title="Hapus">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- 11. MODUL AJAR / RENCANA PEMBELAJARAN ---
const TeachingModuleView: React.FC<{
  modules: TeachingModule[];
  subjects: Subject[];
  classes: SchoolClass[];
  atps: ATPItem[];
  teacher: TeacherProfile;
  settings: AppSettings;
  dark: boolean;
  onSave: (m: TeachingModule) => void;
  onDelete: (id: string) => void;
  onOpenPrint: (title: string, content: React.ReactNode) => void;
}> = ({ modules, subjects, classes, atps, settings, dark, onSave, onDelete, onOpenPrint }) => {
  const [editing, setEditing] = useState<TeachingModule | null>(null);

  const startNew = () => {
    setEditing({
      id: uid('mod'),
      judulModul: '',
      subjectId: subjects[0]?.id || '',
      classId: classes[0]?.id || '',
      atpId: atps[0]?.id || '',
      fase: 'F',
      semester: settings.semester,
      tahunAjaran: settings.tahunAjaran,
      alokasiWaktu: '3 Pertemuan (18 JP x 45 Menit)',
      kompetensiAwal: '',
      profilLulusan: 'Penalaran Kritis, Kemandirian, Kolaborasi',
      pemahamanBermakna: '',
      pertanyaanPemantik: '',
      modelPembelajaran: 'Teaching Factory (TeFa) / Project Based Learning',
      mediaSumber: 'Unit Sepeda Motor, Buku Pedoman Reparasi (BPR), SST',
      pendahuluan: '',
      kegiatanInti: '',
      penutup: '',
      asesmenDiagnostik: '',
      asesmenFormatif: '',
      asesmenSumatif: '',
      remedialPengayaan: '',
      status: 'Final',
      updatedAt: todayISO(),
    });
  };

  const inputCls = `w-full px-3.5 py-2.5 rounded-xl border text-sm ${
    dark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
  }`;

  if (editing) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave({ ...editing, updatedAt: todayISO() });
          setEditing(null);
        }}
        className={`p-6 rounded-2xl border space-y-4 ${dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'}`}
      >
        <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-lg">Editor Modul Ajar Kurikulum Merdeka SMK</h3>
          <button type="button" onClick={() => setEditing(null)} className="text-xs px-3 py-1.5 rounded-lg border">
            Kembali
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold mb-1">Judul Modul Ajar *</label>
            <input required className={inputCls} value={editing.judulModul} onChange={(e) => setEditing({ ...editing, judulModul: e.target.value })} placeholder="Contoh: Modul Ajar Perawatan Sistem Injeksi PGM-FI" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Mata Pelajaran</label>
            <select className={inputCls} value={editing.subjectId} onChange={(e) => setEditing({ ...editing, subjectId: e.target.value })}>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.namaMapel}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Alokasi Waktu</label>
            <input className={inputCls} value={editing.alokasiWaktu} onChange={(e) => setEditing({ ...editing, alokasiWaktu: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Model Pembelajaran</label>
            <input className={inputCls} value={editing.modelPembelajaran} onChange={(e) => setEditing({ ...editing, modelPembelajaran: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Media & Sumber Belajar</label>
            <input className={inputCls} value={editing.mediaSumber} onChange={(e) => setEditing({ ...editing, mediaSumber: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Pemahaman Bermakna</label>
            <textarea rows={2} className={inputCls} value={editing.pemahamanBermakna} onChange={(e) => setEditing({ ...editing, pemahamanBermakna: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Pertanyaan Pemantik</label>
            <textarea rows={2} className={inputCls} value={editing.pertanyaanPemantik} onChange={(e) => setEditing({ ...editing, pertanyaanPemantik: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Kegiatan Pendahuluan (Safety Briefing & Apersepsi)</label>
          <textarea rows={2} className={inputCls} value={editing.pendahuluan} onChange={(e) => setEditing({ ...editing, pendahuluan: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Kegiatan Inti (Eksplorasi BPR & Praktik Bengkel)</label>
          <textarea rows={4} className={inputCls} value={editing.kegiatanInti} onChange={(e) => setEditing({ ...editing, kegiatanInti: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Kegiatan Penutup (5R & Refleksi)</label>
          <textarea rows={2} className={inputCls} value={editing.penutup} onChange={(e) => setEditing({ ...editing, penutup: e.target.value })} />
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => setEditing(null)} className="px-4 py-2.5 rounded-xl border text-sm">Batal</button>
          <button type="submit" className="px-6 py-2.5 rounded-xl bg-[#173B70] text-white font-semibold text-sm">Simpan Modul Ajar</button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Kelola perencanaan pembelajaran fleksibel sesuai karakteristik bengkel TSM.</p>
        <button onClick={startNew} className="px-4 py-2.5 rounded-xl bg-[#173B70] text-white text-sm font-semibold flex items-center gap-2 min-h-[44px]">
          <Plus size={17} /> Buat Modul Ajar Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((m) => (
          <div key={m.id} className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 ${dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'}`}>
            <div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {m.status} • {m.alokasiWaktu}
              </span>
              <h4 className="font-bold text-base mt-2">{m.judulModul}</h4>
              <p className="text-xs text-slate-500 mt-1">Model: {m.modelPembelajaran}</p>
            </div>
            <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button onClick={() => setEditing(m)} className="px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1">
                <Edit3 size={14} /> Edit
              </button>
              <button
                onClick={() =>
                  onOpenPrint(
                    m.judulModul,
                    <div className="space-y-3 text-xs leading-relaxed">
                      <p><strong>Alokasi Waktu:</strong> {m.alokasiWaktu} | <strong>Model:</strong> {m.modelPembelajaran}</p>
                      <p><strong>Media & Sumber:</strong> {m.mediaSumber}</p>
                      <div className="border p-3 rounded">
                        <p className="font-bold mb-1">Pemahaman Bermakna:</p>
                        <p>{m.pemahamanBermakna}</p>
                      </div>
                      <div className="border p-3 rounded whitespace-pre-line">
                        <p className="font-bold mb-1">1. Pendahuluan:</p>
                        <p>{m.pendahuluan}</p>
                        <p className="font-bold mt-2 mb-1">2. Kegiatan Inti:</p>
                        <p>{m.kegiatanInti}</p>
                        <p className="font-bold mt-2 mb-1">3. Penutup:</p>
                        <p>{m.penutup}</p>
                      </div>
                    </div>
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-[#178C8C] text-white text-xs font-semibold flex items-center gap-1"
              >
                <Printer size={14} /> Cetak A4
              </button>
              <button onClick={() => onDelete(m.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg ml-auto">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 12. JOBSHEET & BAHAN AJAR TSM ---
const JobsheetView: React.FC<{
  jobsheets: Jobsheet[];
  subjects: Subject[];
  teacher: TeacherProfile;
  dark: boolean;
  onSave: (j: Jobsheet) => void;
  onDelete: (id: string) => void;
  onOpenPrint: (title: string, content: React.ReactNode) => void;
}> = ({ jobsheets, subjects, dark, onSave, onDelete, onOpenPrint }) => {
  const [editing, setEditing] = useState<Jobsheet | null>(null);

  const kategoriTsm = [
    'K3 dan budaya kerja industri',
    'Peralatan bengkel & Alat ukur',
    'Dasar mesin sepeda motor',
    'Sistem bahan bakar & Injeksi',
    'Sistem pelumasan & pendinginan',
    'Sistem pemindah tenaga',
    'Sistem kelistrikan, pengapian, starter & pengisian',
    'Sistem rem, suspensi, rangka & kemudi',
    'Perawatan berkala & Diagnosis kerusakan',
  ];

  const startNew = () => {
    setEditing({
      id: uid('js'),
      nomorJobsheet: `JS-TSM-${jobsheets.length + 1}`,
      judulPekerjaan: '',
      kategori: kategoriTsm[2],
      subjectId: subjects[0]?.id || '',
      fase: 'F',
      alokasiWaktu: '6 JP (270 Menit)',
      tujuanPraktik: '',
      dasarTeori: '',
      alatBahan: '',
      apd: 'Wearpack, Sepatu Safety, Sarung Tangan',
      keselamatanKerja: '',
      langkahKerja: '',
      tabelPengukuran: '',
      pertanyaanEvaluasi: '',
      driveUrl: '',
      updatedAt: todayISO(),
    });
  };

  const inputCls = `w-full px-3.5 py-2.5 rounded-xl border text-sm ${
    dark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
  }`;

  if (editing) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave({ ...editing, updatedAt: todayISO() });
          setEditing(null);
        }}
        className={`p-6 rounded-2xl border space-y-4 ${dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'}`}
      >
        <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-lg">Editor Jobsheet Praktik Bengkel TSM</h3>
          <button type="button" onClick={() => setEditing(null)} className="text-xs px-3 py-1.5 rounded-lg border">Kembali</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input required className={inputCls} placeholder="Nomor Jobsheet" value={editing.nomorJobsheet} onChange={(e) => setEditing({ ...editing, nomorJobsheet: e.target.value })} />
          <input required className={`${inputCls} md:col-span-2`} placeholder="Judul Pekerjaan Praktik" value={editing.judulPekerjaan} onChange={(e) => setEditing({ ...editing, judulPekerjaan: e.target.value })} />
          <select className={inputCls} value={editing.kategori} onChange={(e) => setEditing({ ...editing, kategori: e.target.value })}>
            {kategoriTsm.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
          <input className={inputCls} placeholder="Alokasi Waktu" value={editing.alokasiWaktu} onChange={(e) => setEditing({ ...editing, alokasiWaktu: e.target.value })} />
          <input className={inputCls} placeholder="APD Wajib" value={editing.apd} onChange={(e) => setEditing({ ...editing, apd: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Tujuan Praktik</label>
          <textarea rows={2} className={inputCls} value={editing.tujuanPraktik} onChange={(e) => setEditing({ ...editing, tujuanPraktik: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Alat & Bahan (SST, Unit Motor, BPR)</label>
            <textarea rows={3} className={inputCls} value={editing.alatBahan} onChange={(e) => setEditing({ ...editing, alatBahan: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Langkah Keselamatan Kerja (K3)</label>
            <textarea rows={3} className={inputCls} value={editing.keselamatanKerja} onChange={(e) => setEditing({ ...editing, keselamatanKerja: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Langkah Kerja Sesuai SOP BPR</label>
          <textarea rows={4} className={inputCls} value={editing.langkahKerja} onChange={(e) => setEditing({ ...editing, langkahKerja: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Format Data Hasil Pengukuran & Standar BPR</label>
          <textarea rows={3} className={inputCls} value={editing.tabelPengukuran} onChange={(e) => setEditing({ ...editing, tabelPengukuran: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Tautan Lampiran Google Drive / PDF BPR (Opsional)</label>
          <input className={inputCls} placeholder="https://drive.google.com/..." value={editing.driveUrl} onChange={(e) => setEditing({ ...editing, driveUrl: e.target.value })} />
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => setEditing(null)} className="px-4 py-2.5 rounded-xl border text-sm">Batal</button>
          <button type="submit" className="px-6 py-2.5 rounded-xl bg-[#173B70] text-white font-semibold text-sm">Simpan Jobsheet</button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Template lembar kerja praktik bengkel Teknik Sepeda Motor siap cetak.</p>
        <button onClick={startNew} className="px-4 py-2.5 rounded-xl bg-[#173B70] text-white text-sm font-semibold flex items-center gap-2 min-h-[44px]">
          <Plus size={17} /> Buat Jobsheet Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobsheets.map((js) => (
          <div key={js.id} className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 ${dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'}`}>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#178C8C]">{js.nomorJobsheet}</span>
                <span className="text-xs text-slate-500">{js.alokasiWaktu}</span>
              </div>
              <h4 className="font-bold text-base mt-1">{js.judulPekerjaan}</h4>
              <p className="text-xs text-slate-500 mt-1">Kategori: {js.kategori}</p>
            </div>
            <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button onClick={() => setEditing(js)} className="px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1">
                <Edit3 size={14} /> Edit
              </button>
              <button
                onClick={() =>
                  onOpenPrint(
                    `JOBSHEET PRAKTIK TSM — ${js.nomorJobsheet}`,
                    <div className="space-y-3 text-xs leading-relaxed">
                      <div className="grid grid-cols-2 border border-slate-800 p-2.5">
                        <p><strong>Judul Pekerjaan:</strong> {js.judulPekerjaan}</p>
                        <p><strong>Alokasi Waktu:</strong> {js.alokasiWaktu}</p>
                        <p><strong>Kategori:</strong> {js.kategori}</p>
                        <p><strong>APD Wajib:</strong> {js.apd}</p>
                      </div>
                      <div className="border border-slate-800 p-2.5 whitespace-pre-line">
                        <p className="font-bold">A. Tujuan Praktik:</p>
                        <p>{js.tujuanPraktik}</p>
                        <p className="font-bold mt-2">B. Alat dan Bahan:</p>
                        <p>{js.alatBahan}</p>
                        <p className="font-bold mt-2">C. Keselamatan Kerja (K3):</p>
                        <p>{js.keselamatanKerja}</p>
                        <p className="font-bold mt-2">D. Langkah Kerja SOP:</p>
                        <p>{js.langkahKerja}</p>
                        <p className="font-bold mt-2">E. Data Hasil Pengukuran:</p>
                        <p className="font-mono bg-slate-50 p-2 border mt-1">{js.tabelPengukuran}</p>
                      </div>
                    </div>
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-[#178C8C] text-white text-xs font-semibold flex items-center gap-1"
              >
                <Printer size={14} /> Cetak Jobsheet
              </button>
              <button onClick={() => onDelete(js.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg ml-auto">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 13. JURNAL MENGAJAR ---
const JournalView: React.FC<{
  journals: TeachingJournal[];
  classes: SchoolClass[];
  subjects: Subject[];
  atps: ATPItem[];
  teacher: TeacherProfile;
  dark: boolean;
  onAdd: (j: TeachingJournal) => void;
  onUpdate: (j: TeachingJournal) => void;
  onDelete: (id: string) => void;
  onOpenPrint: (title: string, content: React.ReactNode) => void;
}> = ({ journals, classes, subjects, atps, dark, onAdd, onUpdate, onDelete, onOpenPrint }) => {
  const [tanggal, setTanggal] = useState(todayISO());
  const [jamKe, setJamKe] = useState('1 - 6');
  const [classId, setClassId] = useState(classes[0]?.id || '');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [materi, setMateri] = useState('');
  const [kegiatan, setKegiatan] = useState('');
  const [catatan, setCatatan] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const inputCls = `w-full px-3.5 py-2.5 rounded-xl border text-sm min-h-[44px] ${
    dark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
  }`;
  const resetForm = () => {
  setEditingId(null);
  setTanggal(todayISO());
  setJamKe('1 - 6');
  setClassId(classes[0]?.id || '');
  setSubjectId(subjects[0]?.id || '');
  setMateri('');
  setKegiatan('');
  setCatatan('');
};

const handleEdit = (item: TeachingJournal) => {
  setEditingId(item.id);
  setTanggal(item.tanggal);
  setJamKe(item.jamKe);
  setClassId(item.classId);
  setSubjectId(item.subjectId);
  setMateri(item.materi);
  setKegiatan(item.kegiatan);
  setCatatan(item.catatan || '');
};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-base">Jurnal Kegiatan Mengajar Harian</h3>
        <button
          onClick={() =>
            onOpenPrint(
              'JURNAL KEGIATAN MENGAJAR GURU',
              <table className="w-full border-collapse border border-slate-800 text-xs">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-800 p-2">Tanggal / Jam</th>
                    <th className="border border-slate-800 p-2">Kelas</th>
                    <th className="border border-slate-800 p-2">Materi & Kegiatan</th>
                    <th className="border border-slate-800 p-2">Catatan Refleksi</th>
                  </tr>
                </thead>
                <tbody>
                  {journals.map((j) => (
                    <tr key={j.id}>
                      <td className="border border-slate-800 p-2">{j.tanggal} (Jam {j.jamKe})</td>
                      <td className="border border-slate-800 p-2">{classes.find((c) => c.id === j.classId)?.namaKelas || '-'}</td>
                      <td className="border border-slate-800 p-2"><strong>{j.materi}</strong><br />{j.kegiatan}</td>
                      <td className="border border-slate-800 p-2">{j.catatan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
          className="px-4 py-2.5 rounded-xl bg-[#178C8C] text-white text-xs font-semibold flex items-center gap-2 min-h-[44px]"
        >
          <Printer size={16} /> Cetak Jurnal
        </button>
      </div>

            <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!materi.trim()) return;
          const payload: TeachingJournal = {
            id: editingId || uid('jrn'),
            tanggal,
            jamKe,
            classId: classId || classes[0]?.id || '',
            subjectId: subjectId || subjects[0]?.id || '',
            atpId: atps[0]?.id || '',
            materi,
            kegiatan,
            hadir: 0,
            tidakHadir: 0,
            catatan,
            tindakLanjut: '',
          };

          if (editingId) {
            onUpdate(payload);
          } else {
            onAdd(payload);
          }
          resetForm();
        }}
        className={`p-5 rounded-2xl border space-y-4 ${dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'}`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold mb-1">Tanggal Mengajar</label>
            <input type="date" className={inputCls} value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold mb-1">Jam Pelajaran Ke-</label>
            <input className={inputCls} placeholder="Contoh: 1 - 6" value={jamKe} onChange={(e) => setJamKe(e.target.value)} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold mb-1">Kelas</label>
            <select className={inputCls} value={classId || classes[0]?.id || ''} onChange={(e) => setClassId(e.target.value)}>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.namaKelas}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold mb-1">Mata Pelajaran</label>
            <select className={inputCls} value={subjectId || subjects[0]?.id || ''} onChange={(e) => setSubjectId(e.target.value)}>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.namaMapel}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-semibold mb-1">Topik / Materi Pembelajaran Hari Ini *</label>
          <input required className={inputCls} placeholder="Contoh: Praktik Penyetelan Celah Katup Sepeda Motor 4-Tak" value={materi} onChange={(e) => setMateri(e.target.value)} />
        </div>
        <div>
          <label className="block text-[11px] font-semibold mb-1">Uraian Kegiatan Belajar & Praktik Bengkel</label>
          <textarea rows={2} className={`w-full p-3 rounded-xl border text-sm ${dark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`} placeholder="Ringkasan aktivitas siswa, penggunaan alat, dan pencapaian target..." value={kegiatan} onChange={(e) => setKegiatan(e.target.value)} />
        </div>
        <div>
          <label className="block text-[11px] font-semibold mb-1">Catatan Refleksi / Tindak Lanjut</label>
          <input className={inputCls} placeholder="Catatan kendala teknis atau tindak lanjut pertemuan berikutnya" value={catatan} onChange={(e) => setCatatan(e.target.value)} />
        </div>
        <div className="flex gap-2">
    <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#173B70] text-white font-semibold text-sm min-h-[44px]">
      {editingId ? 'Simpan Perubahan Jurnal' : '+ Simpan Jurnal Mengajar'}
    </button>
    {editingId && (
      <button type="button" onClick={resetForm} className="px-4 py-2.5 rounded-xl border text-sm font-semibold min-h-[44px]">
        Batal
      </button>
    )}
  </div>
      </form>
          <div className="space-y-3">
        {journals.map((j) => (
          <div key={j.id} className={`p-4 rounded-2xl border flex items-start justify-between gap-4 ${dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'}`}>
            <div>
              <span className="text-xs font-bold text-[#178C8C]">
                {j.tanggal} • Jam {j.jamKe} • {classes.find((c) => c.id === j.classId)?.namaKelas || '-'}
              </span>
              <h4 className="font-bold text-sm mt-1">{j.materi}</h4>
              <p className="text-xs text-slate-500 mt-1">{j.kegiatan}</p>
              {j.catatan && <p className="text-xs text-amber-600 mt-1">Catatan: {j.catatan}</p>}
            </div>
           <div className="inline-flex items-center gap-1 shrink-0">
    <button
      type="button"
      onClick={() => handleEdit(j)}
      className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg"
      title="Edit Jurnal"
    >
      <Edit3 size={16} />
    </button>
    <button onClick={() => onDelete(j.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg">
      <Trash2 size={15} />
    </button>
  </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 14. PRESENSI PESERTA DIDIK & REKAPITULASI ---
const AttendanceView: React.FC<{
  attendances: AttendanceRecord[];
  classes: SchoolClass[];
  students: Student[];
  dark: boolean;
  onOpenPrint: (title: string, content: React.ReactNode) => void;
  onSaveBatch: (tanggal: string, classId: string, records: AttendanceRecord[]) => void;
}> = ({ attendances, classes, students, dark, onOpenPrint, onSaveBatch }) => {
  const [activeTab, setActiveTab] = useState<'input' | 'rekap'>('input');
  const [tanggal, setTanggal] = useState(todayISO());
  const [classId, setClassId] = useState(classes[0]?.id || '');
  const [filterMonth, setFilterMonth] = useState<string>(todayISO().slice(0, 7));

  const activeClassId = classId || classes[0]?.id || '';
  const activeClassObj = classes.find((c) => c.id === activeClassId);
  const classStudents = students.filter((s) => s.classId === activeClassId && s.statusAktif === 'Aktif');

  const [statusMap, setStatusMap] = useState<Record<string, 'Hadir' | 'Izin' | 'Sakit' | 'Alpa'>>({});

  useEffect(() => {
    const next: Record<string, 'Hadir' | 'Izin' | 'Sakit' | 'Alpa'> = {};
    classStudents.forEach((st) => {
      const existing = attendances.find(
        (a) => a.tanggal === tanggal && a.classId === activeClassId && a.studentId === st.id
      );
      next[st.id] = existing ? existing.status : 'Hadir';
    });
    setStatusMap(next);
  }, [tanggal, activeClassId, students.length]);

  const markAllPresent = () => {
    const next: Record<string, 'Hadir'> = {};
    classStudents.forEach((s) => (next[s.id] = 'Hadir'));
    setStatusMap(next);
  };

  const recapRows = useMemo(() => {
    const classRecords = attendances.filter((a) => {
      const matchClass = a.classId === activeClassId;
      const matchMonth = filterMonth === 'ALL' || a.tanggal.startsWith(filterMonth);
      return matchClass && matchMonth;
    });

    const uniqueDates = Array.from(new Set(classRecords.map((r) => r.tanggal))).sort();

    const rows = classStudents.map((st) => {
      const stRecs = classRecords.filter((r) => r.studentId === st.id);
      const hadir = stRecs.filter((r) => r.status === 'Hadir').length;
      const izin = stRecs.filter((r) => r.status === 'Izin').length;
      const sakit = stRecs.filter((r) => r.status === 'Sakit').length;
      const alpa = stRecs.filter((r) => r.status === 'Alpa').length;
      const total = hadir + izin + sakit + alpa;
      const persentase = total > 0 ? Math.round((hadir / total) * 100) : 100;
      return { student: st, hadir, izin, sakit, alpa, total, persentase };
    });

    return { rows, uniqueDates };
  }, [attendances, activeClassId, classStudents, filterMonth]);

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs flex items-start gap-3">
        <Info size={18} className="text-[#173B70] dark:text-blue-300 shrink-0 mt-0.5" />
        <p>
          Data presensi tersimpan otomatis ke database <strong>Google Sheets (Sheet Attendance)</strong> tanpa duplikasi per tanggal, digunakan untuk menghitung <strong>persentase kehadiran syarat uji praktik/UKK</strong>, bahan evaluasi wali kelas, serta dapat dicetak sebagai laporan resmi bulanan/semester.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-800 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('input')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] ${
              activeTab === 'input'
                ? 'bg-[#173B70] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Input Presensi Harian
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rekap')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] ${
              activeTab === 'rekap'
                ? 'bg-[#173B70] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Rekap Kehadiran ({recapRows.uniqueDates.length} Pertemuan)
          </button>
        </div>

        <select
          value={activeClassId}
          onChange={(e) => setClassId(e.target.value)}
          className={`px-3.5 py-2.5 rounded-xl border text-sm font-semibold min-h-[44px] ${
            dark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
          }`}
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>Kelas: {c.namaKelas}</option>
          ))}
        </select>
      </div>

      {activeTab === 'input' ? (
        <div className={`p-5 rounded-2xl border space-y-5 ${dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Tanggal Pertemuan / Praktik Bengkel</label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className={`px-3.5 py-2.5 rounded-xl border text-sm min-h-[44px] ${
                  dark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
                }`}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={markAllPresent}
                className="px-4 py-2.5 rounded-xl border border-emerald-500 text-emerald-700 dark:text-emerald-300 text-xs font-bold min-h-[44px]"
              >
                Tandai Semua Hadir
              </button>
              <button
                type="button"
                onClick={() => {
                  const records: AttendanceRecord[] = classStudents.map((st) => ({
                    id: uid('att'),
                    tanggal,
                    classId: activeClassId,
                    studentId: st.id,
                    status: statusMap[st.id] || 'Hadir',
                    keterangan: '',
                  }));
                  onSaveBatch(tanggal, activeClassId, records);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#173B70] text-white text-xs font-bold min-h-[44px]"
              >
                Simpan Presensi
              </button>
            </div>
          </div>

          {classStudents.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">Pilih kelas yang memiliki peserta didik untuk mengisi presensi.</p>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {classStudents.map((st, i) => (
                <div key={st.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs text-slate-400 mr-2">{i + 1}.</span>
                    <span className="font-semibold text-sm">{st.namaLengkap}</span>
                    <span className="text-xs text-slate-500 ml-2">({st.nis})</span>
                  </div>
                  <div className="flex gap-1.5">
                    {(['Hadir', 'Izin', 'Sakit', 'Alpa'] as const).map((opt) => {
                      const active = (statusMap[st.id] || 'Hadir') === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setStatusMap((prev) => ({ ...prev, [st.id]: opt }))}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold min-h-[38px] transition-all ${
                            active
                              ? opt === 'Hadir'
                                ? 'bg-emerald-600 text-white'
                                : opt === 'Izin'
                                ? 'bg-blue-600 text-white'
                                : opt === 'Sakit'
                                ? 'bg-amber-500 text-white'
                                : 'bg-rose-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className={`p-5 rounded-2xl border space-y-4 ${dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Periode Rekap</label>
              <div className="flex gap-2">
                <input
                  type="month"
                  value={filterMonth === 'ALL' ? todayISO().slice(0, 7) : filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  disabled={filterMonth === 'ALL'}
                  className={`px-3 py-2 rounded-xl border text-xs min-h-[42px] ${
                    dark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setFilterMonth(filterMonth === 'ALL' ? todayISO().slice(0, 7) : 'ALL')}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-bold min-h-[42px] ${
                    filterMonth === 'ALL' ? 'bg-[#173B70] text-white border-[#173B70]' : ''
                  }`}
                >
                  {filterMonth === 'ALL' ? 'Semua Semester (Aktif)' : 'Tampilkan 1 Semester'}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onOpenPrint(
                  `REKAPITULASI PRESENSI PESERTA DIDIK — KELAS ${activeClassObj?.namaKelas || ''}`,
                  <div className="space-y-3 text-xs">
                    <p>
                      <strong>Periode:</strong> {filterMonth === 'ALL' ? 'Satu Semester Penuh' : `Bulan ${filterMonth}`} •{' '}
                      <strong>Jumlah Pertemuan Tercatat:</strong> {recapRows.uniqueDates.length} Hari
                    </p>
                    <table className="w-full border-collapse border border-slate-800">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border border-slate-800 p-2">No</th>
                          <th className="border border-slate-800 p-2">NIS</th>
                          <th className="border border-slate-800 p-2 text-left">Nama Peserta Didik</th>
                          <th className="border border-slate-800 p-2">Hadir</th>
                          <th className="border border-slate-800 p-2">Izin</th>
                          <th className="border border-slate-800 p-2">Sakit</th>
                          <th className="border border-slate-800 p-2">Alpa</th>
                          <th className="border border-slate-800 p-2">% Hadir</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recapRows.rows.map((r, idx) => (
                          <tr key={r.student.id}>
                            <td className="border border-slate-800 p-2 text-center">{idx + 1}</td>
                            <td className="border border-slate-800 p-2 text-center">{r.student.nis}</td>
                            <td className="border border-slate-800 p-2">{r.student.namaLengkap}</td>
                            <td className="border border-slate-800 p-2 text-center font-bold">{r.hadir}</td>
                            <td className="border border-slate-800 p-2 text-center">{r.izin}</td>
                            <td className="border border-slate-800 p-2 text-center">{r.sakit}</td>
                            <td className="border border-slate-800 p-2 text-center">{r.alpa}</td>
                            <td className="border border-slate-800 p-2 text-center font-bold">{r.persentase}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              }
              className="px-4 py-2.5 rounded-xl bg-[#178C8C] text-white text-xs font-bold flex items-center gap-2 min-h-[42px]"
            >
              <Printer size={15} /> Cetak Rekap Presensi A4
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className={`text-xs uppercase ${dark ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                <tr>
                  <th className="p-3">NIS</th>
                  <th className="p-3">Nama Peserta Didik</th>
                  <th className="p-3 text-center">Hadir</th>
                  <th className="p-3 text-center">Izin</th>
                  <th className="p-3 text-center">Sakit</th>
                  <th className="p-3 text-center">Alpa</th>
                  <th className="p-3 text-center">Persentase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {recapRows.rows.map((r) => (
                  <tr key={r.student.id}>
                    <td className="p-3 font-mono text-xs">{r.student.nis}</td>
                    <td className="p-3 font-semibold">{r.student.namaLengkap}</td>
                    <td className="p-3 text-center font-bold text-emerald-600">{r.hadir}</td>
                    <td className="p-3 text-center text-blue-600">{r.izin}</td>
                    <td className="p-3 text-center text-amber-600">{r.sakit}</td>
                    <td className="p-3 text-center text-rose-600 font-bold">{r.alpa}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          r.persentase >= 85
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.persentase >= 75
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {r.persentase}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// --- 15. ASESMEN & PENILAIAN ---
const AssessmentView: React.FC<{
  assessments: Assessment[];
  grades: GradeRecord[];
  classes: SchoolClass[];
  students: Student[];
  subjects: Subject[];
  atps: ATPItem[];
  defaultKktp: number;
  dark: boolean;
  onAddAssessment: (a: Assessment) => void;
  onUpdate: (a: Assessment) => void;
  onSaveGrades: (assessmentId: string, list: GradeRecord[]) => void;
  onDeleteAssessment: (id: string) => void;
}> = ({ assessments, grades, classes, students, subjects, atps, defaultKktp, dark, onAddAssessment, onUpdate, onSaveGrades, onDeleteAssessment }) => {
  const [judul, setJudul] = useState('');
  const [jenis, setJenis] = useState<Assessment['jenis']>('Praktik Bengkel');
  const [classId, setClassId] = useState(classes[0]?.id || '');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [selectedAsmId, setSelectedAsmId] = useState<string>(assessments[0]?.id || '');
  const [scoreMap, setScoreMap] = useState<Record<string, number>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const activeAsm = assessments.find((a) => a.id === (selectedAsmId || assessments[0]?.id));
  const targetStudents = activeAsm ? students.filter((s) => s.classId === activeAsm.classId) : [];

  const resetForm = () => {
    setEditingId(null);
    setJudul('');
    setJenis('Praktik Bengkel');
    setClassId(classes[0]?.id || '');
    setSubjectId(subjects[0]?.id || '');
  };

  const handleEdit = (item: Assessment) => {
    setEditingId(item.id);
    setJudul(item.judul);
    setJenis(item.jenis);
    setClassId(item.classId);
    setSubjectId(item.subjectId);
  };

  useEffect(() => {
    if (!activeAsm) return;
    const next: Record<string, number> = {};
    targetStudents.forEach((st) => {
      const g = grades.find((x) => x.assessmentId === activeAsm.id && x.studentId === st.id);
      next[st.id] = g ? g.nilai : 0;
    });
    setScoreMap(next);
  }, [activeAsm?.id, students.length]);

  const inputCls = `w-full px-3.5 py-2.5 rounded-xl border text-sm min-h-[44px] ${
    dark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
  }`;

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!judul.trim()) return;
          const payload: Assessment = {
            id: editingId || uid('asm'),
            judul,
            jenis,
            subjectId: subjectId || subjects[0]?.id || '',
            classId: classId || classes[0]?.id || '',
            atpId: activeAsm?.atpId || atps[0]?.id || '',
            tanggal: activeAsm?.tanggal || todayISO(),
            bobot: activeAsm?.bobot ?? 30,
            skorMaks: activeAsm?.skorMaks ?? 100,
            kktp: activeAsm?.kktp ?? defaultKktp,
            rubrikTsm: activeAsm?.rubrikTsm || { persiapanAlat: 10, penerapanK3: 15, prosedurKerja: 20, alatUkur: 15, hasilPekerjaan: 20, efisiensiWaktu: 10, kerapianArea: 5, pelaporan: 5 },
          };

          if (editingId) {
            onUpdate(payload);
          } else {
            onAddAssessment(payload);
            setSelectedAsmId(payload.id);
          }
          resetForm();
        }}
        className={`p-5 rounded-2xl border grid grid-cols-1 md:grid-cols-5 gap-3 ${dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'}`}
      >
        <input required className={`${inputCls} md:col-span-2`} placeholder="Judul Asesmen (cth: Uji Praktik Tune Up Injeksi)" value={judul} onChange={(e) => setJudul(e.target.value)} />
        <select className={inputCls} value={jenis} onChange={(e) => setJenis(e.target.value as any)}>
          {['Praktik Bengkel', 'Formatif', 'Sumatif', 'Diagnostik', 'Proyek', 'Sikap Kerja'].map((j) => (
            <option key={j} value={j}>{j}</option>
          ))}
        </select>
        <select className={inputCls} value={classId || classes[0]?.id || ''} onChange={(e) => setClassId(e.target.value)}>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.namaKelas}</option>)}
        </select>
        <div className="flex gap-2">
          <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl bg-[#173B70] text-white font-semibold text-sm min-h-[44px]">
            {editingId ? 'Simpan Perubahan Asesmen' : '+ Buat Asesmen'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className={`px-3.5 py-2.5 rounded-xl border text-sm font-semibold min-h-[44px] ${
                dark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Batal
            </button>
          )}
        </div>
      </form>

      {assessments.length > 0 && (
        <div className={`p-5 rounded-2xl border space-y-4 ${dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <select
              className={`${inputCls} max-w-md font-semibold`}
              value={activeAsm?.id || ''}
              onChange={(e) => setSelectedAsmId(e.target.value)}
            >
              {assessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.judul} ({a.jenis} — {classes.find((c) => c.id === a.classId)?.namaKelas || ''})
                </option>
              ))}
            </select>
            <div className="flex flex-wrap items-center gap-2">
              {activeAsm && (
                <div className="inline-flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEdit(activeAsm)}
                    className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg inline-flex items-center gap-1.5 text-xs font-bold"
                    title="Edit Asesmen"
                  >
                    <Edit3 size={15} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteAssessment(activeAsm.id)}
                    className="px-3.5 py-2.5 rounded-xl border border-rose-500/40 text-rose-600 text-xs font-bold"
                  >
                    Hapus Asesmen
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  if (!activeAsm) return;
                  const list: GradeRecord[] = targetStudents.map((st) => ({
                    id: uid('grd'),
                    assessmentId: activeAsm.id,
                    studentId: st.id,
                    nilai: Number(scoreMap[st.id] || 0),
                    catatan: '',
                  }));
                  onSaveGrades(activeAsm.id, list);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#178C8C] text-white text-xs font-bold min-h-[44px]"
              >
                Simpan Semua Nilai
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {targetStudents.map((st) => {
              const val = scoreMap[st.id] ?? 0;
              const tuntas = val >= (activeAsm?.kktp || defaultKktp);
              return (
                <div key={st.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-sm">{st.namaLengkap}</p>
                    <p className="text-xs text-slate-500">NIS: {st.nis}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tuntas ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {tuntas ? 'Tuntas' : 'Belum Tuntas'}
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={val}
                      onChange={(e) => setScoreMap((prev) => ({ ...prev, [st.id]: Number(e.target.value) }))}
                      className={`w-24 px-3 py-2 rounded-xl border text-center font-bold text-sm ${dark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// --- 16. ANALISIS HASIL BELAJAR ---
const LearningAnalysisView: React.FC<{
  assessments: Assessment[];
  grades: GradeRecord[];
  students: Student[];
  classes: SchoolClass[];
  kktpDefault: number;
  onUpdateKktp: (v: number) => void;
  dark: boolean;
}> = ({ grades, students, classes, kktpDefault, onUpdateKktp, dark }) => {
  const values = grades.map((g) => Number(g.nilai));
  const avg = values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : '0';
  const max = values.length ? Math.max(...values) : 0;
  const min = values.length ? Math.min(...values) : 0;
  const tuntasCount = values.filter((v) => v >= kktpDefault).length;
  const persenTuntas = values.length ? Math.round((tuntasCount / values.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className={`p-5 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'}`}>
        <div>
          <h3 className="font-bold text-base">Pengaturan Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)</h3>
          <p className="text-xs text-slate-500">Sesuaikan ambang batas ketuntasan sesuai kebijakan sekolah & karakteristik mata pelajaran TSM.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold">Nilai KKTP:</span>
          <input
            type="number"
            min={50}
            max={95}
            value={kktpDefault}
            onChange={(e) => onUpdateKktp(Number(e.target.value))}
            className={`w-20 px-3 py-2 rounded-xl border font-bold text-sm ${dark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl border ${dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className="text-xs text-slate-500 font-bold">RATA-RATA KESELURUHAN</p>
          <p className="text-3xl font-extrabold mt-1">{avg}</p>
        </div>
        <div className={`p-5 rounded-2xl border ${dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className="text-xs text-slate-500 font-bold">NILAI TERTINGGI / TERENDAH</p>
          <p className="text-3xl font-extrabold mt-1">{max} / {min}</p>
        </div>
        <div className={`p-5 rounded-2xl border ${dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className="text-xs text-slate-500 font-bold">PERSENTASE KETUNTASAN</p>
          <p className="text-3xl font-extrabold mt-1 text-emerald-600">{persenTuntas}%</p>
        </div>
        <div className={`p-5 rounded-2xl border ${dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className="text-xs text-slate-500 font-bold">PERLU REMEDIAL</p>
          <p className="text-3xl font-extrabold mt-1 text-amber-600">{values.length - tuntasCount}</p>
        </div>
      </div>

      <div className={`p-5 rounded-2xl border ${dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'}`}>
        <h3 className="font-bold text-base mb-4">Rekap Capaian Individu Peserta Didik</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className={`text-xs uppercase ${dark ? 'bg-slate-900' : 'bg-slate-100'}`}>
              <tr>
                <th className="p-3">Nama Peserta Didik</th>
                <th className="p-3">Kelas</th>
                <th className="p-3">Rata-Rata</th>
                <th className="p-3">Rekomendasi Tindak Lanjut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {students.map((st) => {
                const stGrades = grades.filter((g) => g.studentId === st.id);
                const stAvg = stGrades.length ? Math.round(stGrades.reduce((a, b) => a + Number(b.nilai), 0) / stGrades.length) : 0;
                const status =
                  stGrades.length === 0
                    ? 'Belum dinilai'
                    : stAvg >= 90
                    ? 'Pengayaan (Tutor Sebaya / Kompetisi LKS)'
                    : stAvg >= kktpDefault
                    ? 'Tuntas'
                    : 'Wajib Remedial Praktik/Teori';
                return (
                  <tr key={st.id}>
                    <td className="p-3 font-semibold">{st.namaLengkap}</td>
                    <td className="p-3">{classes.find((c) => c.id === st.classId)?.namaKelas || '-'}</td>
                    <td className="p-3 font-bold">{stGrades.length ? stAvg : '-'}</td>
                    <td className="p-3 text-xs font-semibold">{status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- 17. REMEDIAL & PENGAYAAN ---
const FollowUpView: React.FC<{
  followUps: FollowUpRecord[];
  students: Student[];
  assessments: Assessment[];
  grades: GradeRecord[];
  atps: ATPItem[];
  kktpDefault: number;
  dark: boolean;
  onAdd: (f: FollowUpRecord) => void;
  onUpdate: (f: FollowUpRecord) => void;
  onDelete: (id: string) => void;
}> = ({ followUps, students, assessments, grades, atps, dark, onAdd, onUpdate, onDelete }) => {
  const [studentId, setStudentId] = useState(students?.[0]?.id || '');
  const [jenis, setJenis] = useState<'Remedial' | 'Pengayaan'>('Remedial');
  const [program, setProgram] = useState('');
  const [nilaiAkhir, setNilaiAkhir] = useState(80);
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setStudentId(students?.[0]?.id || '');
    setJenis('Remedial');
    setProgram('');
    setNilaiAkhir(80);
  };

  const handleEdit = (item: FollowUpRecord) => {
    setEditingId(item.id);
    setStudentId(item.studentId);
    setJenis(item.jenis);
    setProgram(item.program);
    setNilaiAkhir(item.nilaiAkhir);
  };

  const inputCls = `w-full px-3.5 py-2.5 rounded-xl border text-sm min-h-[44px] ${
    dark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
  }`;

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const targetSt = studentId || students?.[0]?.id;
          if (!targetSt || !program.trim()) return;
          const prevGrade = grades.find((g) => g.studentId === targetSt)?.nilai || 0;
          const existingItem = editingId ? followUps.find((f) => f.id === editingId) : undefined;

          const payload: FollowUpRecord = {
            id: editingId || uid('fu'),
            studentId: targetSt,
            assessmentId: existingItem?.assessmentId || assessments?.[0]?.id || '',
            atpId: existingItem?.atpId || atps?.[0]?.id || '',
            jenis,
            nilaiAwal: existingItem?.nilaiAwal ?? prevGrade,
            program,
            tanggalPelaksanaan: existingItem?.tanggalPelaksanaan || todayISO(),
            nilaiAkhir,
            catatan: existingItem?.catatan || '',
          };

          if (editingId) {
            onUpdate(payload);
          } else {
            onAdd(payload);
          }
          resetForm();
        }}
        className={`p-5 rounded-2xl border grid grid-cols-1 md:grid-cols-5 gap-3 ${dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'}`}
      >
        <select className={inputCls} value={studentId || students?.[0]?.id || ''} onChange={(e) => setStudentId(e.target.value)}>
          {students.map((s) => <option key={s.id} value={s.id}>{s.namaLengkap}</option>)}
        </select>
        <select className={inputCls} value={jenis} onChange={(e) => setJenis(e.target.value as any)}>
          <option value="Remedial">Program Remedial</option>
          <option value="Pengayaan">Program Pengayaan</option>
        </select>
        <input required className={`${inputCls} md:col-span-2`} placeholder="Bentuk Kegiatan (cth: Bimbingan praktik penyetelan katup)" value={program} onChange={(e) => setProgram(e.target.value)} />
        <div className="flex gap-2">
          <input type="number" className={inputCls} value={nilaiAkhir} onChange={(e) => setNilaiAkhir(Number(e.target.value))} title="Nilai Akhir" />
          <button type="submit" className="px-4 py-2.5 rounded-xl bg-[#173B70] text-white font-semibold text-sm shrink-0">
            {editingId ? 'Simpan Perubahan' : '+ Simpan Program'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className={`px-3 py-2.5 rounded-xl border text-sm font-semibold shrink-0 ${
                dark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Batal
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {followUps.map((f) => {
          const st = students.find((s) => s.id === f.studentId);
          return (
            <div
              key={f.id}
              className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-colors ${
                editingId === f.id
                  ? 'border-[#178C8C] ring-1 ring-[#178C8C]'
                  : dark
                  ? 'bg-[#13203B] border-slate-800'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${f.jenis === 'Remedial' ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'}`}>
                  {f.jenis} • {f.tanggalPelaksanaan}
                </span>
                <h4 className="font-bold text-sm mt-1">{st?.namaLengkap || 'Peserta Didik'} (Nilai Akhir: {f.nilaiAkhir})</h4>
                <p className="text-xs text-slate-500 mt-0.5">{f.program}</p>
              </div>
              <div className="inline-flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleEdit(f)}
                  className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg"
                  title="Edit Data"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(f.id)}
                  className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg"
                  title="Hapus Data"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- 18. PENGATURAN, KEAMANAN PASSWORD & BACKUP / RESTORE ---
const SettingsBackupView: React.FC<{
  settings: AppSettings;
  db: WorkspaceDatabase;
  syncStatus: string;
  lastSyncTime: string;
  onUpdateSettings: (s: AppSettings) => void;
  onTestConnection: (url: string, token?: string) => void;
  onSyncNow: () => void;
  onPullFromCloud: () => void;
  onRestoreDatabase: (db: WorkspaceDatabase) => void;
  onResetLocal: () => void;
}> = ({
  settings,
  db,
  lastSyncTime,
  onUpdateSettings,
  onTestConnection,
  onSyncNow,
  onPullFromCloud,
  onRestoreDatabase,
  onResetLocal,
}) => {
  const [urlInput, setUrlInput] = useState(settings.appsScriptUrl);
  const [tokenInput, setTokenInput] = useState(settings.apiToken || '');
  const [showToken, setShowToken] = useState(false);
  const [tahun, setTahun] = useState(settings.tahunAjaran);
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>(settings.semester);

  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdStatus, setPwdStatus] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  const localAuthAccount: LocalAuthRecord | null = useMemo(() => {
    try {
      const raw = localStorage.getItem(APP_CONFIG.authLocalAccountKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [pwdStatus]);

  const dark = settings.darkMode;
  const inputCls = `w-full px-3.5 py-2.5 rounded-xl border text-sm min-h-[44px] ${
    dark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
  }`;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdStatus(null);
    if (newPwd.length < 8) {
      setPwdStatus({ type: 'err', text: 'Kata sandi baru minimal 8 karakter.' });
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdStatus({ type: 'err', text: 'Konfirmasi kata sandi baru tidak cocok.' });
      return;
    }

    if (!localAuthAccount) {
      setPwdStatus({
        type: 'err',
        text: 'Akun lokal belum diaktifkan di perangkat ini. Silakan logout lalu aktifkan melalui tab "Aktivasi Lokal Baru".',
      });
      return;
    }

    const oldHash = await hashPasswordWithSalt(oldPwd, localAuthAccount.salt);
    if (oldHash !== localAuthAccount.passwordHash) {
      setPwdStatus({ type: 'err', text: 'Kata sandi lama yang Anda masukkan salah.' });
      return;
    }

    const newSalt = generateSalt();
    const nextHash = await hashPasswordWithSalt(newPwd, newSalt);
    localStorage.setItem(
      APP_CONFIG.authLocalAccountKey,
      JSON.stringify({
        email: localAuthAccount.email,
        salt: newSalt,
        passwordHash: nextHash,
      })
    );
    setOldPwd('');
    setNewPwd('');
    setConfirmPwd('');
    setPwdStatus({ type: 'ok', text: 'Kata sandi lokal berhasil diperbarui!' });
  };

  const handleDownloadBackup = () => {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MotoTeach_Backup_${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed && parsed.teacher && Array.isArray(parsed.students)) {
          onRestoreDatabase(parsed);
        }
      } catch {}
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleChangePassword}
        className={`p-6 rounded-2xl border space-y-4 ${dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'}`}
      >
        <div className="flex items-center gap-2">
          <KeyRound size={18} className="text-[#178C8C]" />
          <h3 className="font-bold text-base">Keamanan Akun Lokal & Ubah Kata Sandi</h3>
        </div>
        <p className="text-xs text-slate-500">
          {localAuthAccount ? (
            <>
              Akun lokal perangkat ini: <strong>{localAuthAccount.email}</strong>. Kata sandi disimpan dalam bentuk hash SHA-256 dengan salt unik.
            </>
          ) : (
            <>
              Anda masuk menggunakan <strong>Cloud API Token</strong>. Akun lokal perangkat belum diaktifkan.
            </>
          )}
        </p>

        {pwdStatus && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold ${
              pwdStatus.type === 'ok'
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
            }`}
          >
            {pwdStatus.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Kata Sandi Lama *</label>
            <input type="password" required className={inputCls} value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} placeholder="Masukkan sandi saat ini" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Kata Sandi Baru *</label>
            <input type="password" required className={inputCls} value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="Minimal 8 karakter" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Konfirmasi Sandi Baru *</label>
            <input type="password" required className={inputCls} value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} placeholder="Ulangi sandi baru" />
          </div>
        </div>
        <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#173B70] text-white text-xs font-bold min-h-[44px]">
          Perbarui Kata Sandi
        </button>
      </form>

      <div className={`p-6 rounded-2xl border space-y-4 ${dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'}`}>
        <h3 className="font-bold text-base">Koneksi Backend Google Apps Script & Tahun Ajaran</h3>
        <p className="text-xs text-slate-500">
          Masukkan URL Web App Google Apps Script dan API Token yang terdaftar pada Script Properties untuk mengaktifkan sinkronisasi terproteksi.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold mb-1">URL Web App Google Apps Script</label>
            <input
              className={inputCls}
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold mb-1">API Token Server (MOTOTEACH_API_TOKEN)</label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                className={`${inputCls} pr-11`}
                placeholder="Masukkan API Token rahasia dari Script Properties"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                title={showToken ? 'Sembunyikan Token' : 'Tampilkan Token'}
              >
                {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Tahun Ajaran Aktif</label>
            <input className={inputCls} value={tahun} onChange={(e) => setTahun(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Semester Aktif</label>
            <select className={inputCls} value={semester} onChange={(e) => setSemester(e.target.value as any)}>
              <option value="Ganjil">Ganjil</option>
              <option value="Genap">Genap</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={() =>
              onUpdateSettings({
                ...settings,
                appsScriptUrl: urlInput.trim(),
                apiToken: tokenInput.trim(),
                tahunAjaran: tahun,
                semester,
              })
            }
            className="px-5 py-2.5 rounded-xl bg-[#173B70] text-white text-xs font-bold min-h-[44px]"
          >
            Simpan Konfigurasi
          </button>
          <button
            onClick={() => onTestConnection(urlInput.trim(), tokenInput.trim())}
            className="px-4 py-2.5 rounded-xl border text-xs font-bold min-h-[44px]"
          >
            Test Koneksi & Token
          </button>
          <button
            onClick={onSyncNow}
            className="px-4 py-2.5 rounded-xl bg-[#178C8C] text-white text-xs font-bold min-h-[44px]"
          >
            Kirim Data ke Sheets (Push)
          </button>
          <button
            onClick={onPullFromCloud}
            className="px-4 py-2.5 rounded-xl border border-teal-600 text-teal-700 dark:text-teal-300 text-xs font-bold min-h-[44px]"
          >
            Ambil Data dari Sheets (Pull)
          </button>
        </div>
        <p className="text-xs text-slate-500">Sinkronisasi terakhir: {lastSyncTime}</p>
      </div>

      <div className={`p-6 rounded-2xl border space-y-4 ${dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'}`}>
        <h3 className="font-bold text-base">Backup & Pemulihan Data (Cadangan File Lokal)</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDownloadBackup}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 min-h-[44px]"
          >
            <Download size={16} /> Unduh Backup JSON
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="px-5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 min-h-[44px]"
          >
            <Upload size={16} /> Pulihkan dari File JSON
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          <button
            onClick={onResetLocal}
            className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold flex items-center gap-2 min-h-[44px] ml-auto"
          >
            <RotateCcw size={16} /> Reset Data Lokal
          </button>
        </div>
      </div>
    </div>
  );
};
// --- 19. PANDUAN INSTALASI AWAM & SALIN KODE APPS SCRIPT ---
const SetupGuideView: React.FC<{ dark: boolean; onCopySuccess: (label: string) => void }> = ({ dark, onCopySuccess }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE_BUNDLE);
    setCopied(true);
    onCopySuccess('Kode Google Apps Script (Digital Personal Workspace API)');
    setTimeout(() => setCopied(false), 3000);
  };

  const cardCls = `p-5 rounded-2xl border space-y-2 ${dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'}`;

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-[#173B70] text-white space-y-2">
        <h3 className="text-lg font-extrabold">Panduan Konfigurasi Langkah demi Langkah</h3>
        <p className="text-xs sm:text-sm text-blue-100">
          Ikuti 4 tahapan praktis di bawah ini untuk menghubungkan Digital Personal Workspace dengan Google Sheets pribadi Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={cardCls}>
          <span className="text-xs font-extrabold text-[#178C8C]">TAHAP 1 — MEMBUAT DATABASE GOOGLE SHEETS</span>
          <ol className="list-decimal list-inside text-xs sm:text-sm space-y-1.5 pt-1">
            <li>Buka <strong>drive.google.com</strong> menggunakan akun Google pribadi Anda.</li>
            <li>Klik tombol <strong>+ Baru</strong> → pilih <strong>Google Spreadsheet</strong>.</li>
            <li>Ubah nama file menjadi: <code>MotoTeach_Workspace_Database</code>.</li>
          </ol>
        </div>

        <div className={cardCls}>
          <span className="text-xs font-extrabold text-[#178C8C]">TAHAP 2 — MEMASANG BACKEND APPS SCRIPT</span>
          <ol className="list-decimal list-inside text-xs sm:text-sm space-y-1.5 pt-1">
            <li>Di dalam Spreadsheet tadi, klik menu <strong>Ekstensi</strong> → <strong>Apps Script</strong>.</li>
            <li>Tempel kode dari tombol <strong>Salin Kode Apps Script</strong> di bawah dan Simpan.</li>
            <li>Pilih fungsi <code>setupDatabase</code> lalu klik <strong>Jalankan (Run)</strong>.</li>
          </ol>
        </div>

        <div className={cardCls}>
          <span className="text-xs font-extrabold text-[#178C8C]">TAHAP 3 — DEPLOY SEBAGAI WEB APP</span>
          <ol className="list-decimal list-inside text-xs sm:text-sm space-y-1.5 pt-1">
            <li>Klik <strong>Terapkan (Deploy)</strong> → <strong>Deployment baru</strong> → <strong>Aplikasi web</strong>.</li>
            <li><em>Jalankan sebagai</em>: <strong>Saya</strong>; <em>Yang memiliki akses</em>: <strong>Siapa saja (Anyone)</strong>.</li>
            <li>Salin <strong>URL Aplikasi Web</strong> yang muncul.</li>
          </ol>
        </div>

        <div className={cardCls}>
          <span className="text-xs font-extrabold text-[#178C8C]">TAHAP 4 — MENGHUBUNGKAN KE APLIKASI</span>
          <ol className="list-decimal list-inside text-xs sm:text-sm space-y-1.5 pt-1">
            <li>Buka menu <strong>Pengaturan & Backup</strong> di sidebar kiri aplikasi ini.</li>
            <li>Tempel URL Web App lalu klik <strong>Simpan Konfigurasi</strong> & <strong>Test Koneksi API</strong>.</li>
          </ol>
        </div>
      </div>

      <div className={cardCls}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-base">Kode Lengkap Google Apps Script (MotoTeach API)</h4>
            <p className="text-xs text-slate-500">Salin seluruh kode ini dan tempel ke editor Google Apps Script Anda.</p>
          </div>
          <button
            onClick={handleCopyCode}
            className="px-4 py-2.5 rounded-xl bg-[#173B70] text-white text-xs font-bold flex items-center gap-2 min-h-[44px]"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Kode Tersalin!' : 'Salin Kode Apps Script'}
          </button>
        </div>
        <pre className="p-4 rounded-xl bg-slate-950 text-emerald-300 text-xs overflow-x-auto max-h-80 font-mono leading-relaxed">
          {APPS_SCRIPT_CODE_BUNDLE}
        </pre>
      </div>
    </div>
  );
};
