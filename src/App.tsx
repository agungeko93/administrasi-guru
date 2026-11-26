import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LayoutDashboard, UserCheck, Calendar as CalendarIcon, Users, BookOpen,
  Target, FileSearch, GitCommitHorizontal, CalendarRange, CalendarDays,
  FileText, Wrench, BookMarked, ClipboardCheck, Award, BarChart3,
  HeartHandshake, Settings, HelpCircle, Menu, X, ChevronLeft, ChevronRight,
  Sun, Moon, Cloud, Database, AlertTriangle, CheckCircle2, Info, Printer,
  Plus, Trash2, Edit3, ArrowUp, ArrowDown, Download, Upload, Sparkles,
  ShieldCheck, Copy, Check, RotateCcw, Lock, LogOut, Eye, EyeOff,
  KeyRound, User, Search, ListChecks, ChevronDown
} from 'lucide-react';

// ============================================================================
// 1. KONFIGURASI TERPUSAT (APP CONFIG)
// ============================================================================
const APP_CONFIG = {
  appName: 'Digital Personal Workspace',
  appSubtitle: 'Personal Teacher Workspace',
  defaultAppsScriptUrl:
    'https://script.google.com/macros/s/AKfycby0Fkne3fjXNGysL5tq4hRNSUO6omzKHu-7MNqeeqnAJ62ii6JbHW2sFDuHG22aLmneWQ/exec',
  schoolDefault: {
    namaSekolah: 'SEKOLAH MENENGAH KEJURUAN NEGERI 1 GOMBONG',
    namaSekolahSingkat: 'SMK NEGERI 1 GOMBONG',
    pemerintah: 'PEMERINTAH PROVINSI JAWA TENGAH',
    dinas: 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
    npsn: '20330330',
    alamat: 'Jalan Wilis Nomor 15 Wero, Gombong, Kebumen Kode Pos 54416',
    telepon: '0287-472828',
    faksimile: '0287-472828',
    email: 'jaya@smkn1gombong.sch.id',
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
  authStoreKey: 'mototeach_workspace_v2_auth',
  // Kunci lama (login lokal v1) yang dibersihkan otomatis dari browser
  legacyKeys: ['mototeach_workspace_v1_session', 'mototeach_workspace_v1_pwd_hash'],
  cloudVersionKey: 'mototeach_workspace_v1_cloud_version',
  dirtyKey: 'mototeach_workspace_v1_dirty',
  navGroupsKey: 'mototeach_workspace_v1_nav_groups',
  urlOverrideKey: 'mototeach_workspace_v1_url_override',
};

// ============================================================================
// 2. DEFINISI TIPE DATA (TYPESCRIPT INTERFACES)
// ============================================================================
interface AppSettings {
  appsScriptUrl: string;
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

// Tujuan Pembelajaran (TP): hasil merumuskan kompetensi + lingkup materi dari Analisis CP
interface LearningObjective {
  id: string;
  subjectId: string;
  fase: 'E' | 'F';
  tingkat: 'X' | 'XI' | 'XII';
  elemen: string;
  analysisIds: string[]; // baris Analisis CP yang menjadi dasar TP ini
  kodeTp: string;
  rumusan: string;
  konteks: string; // karakteristik peserta didik, visi-misi, sumber daya satuan pendidikan
  keterangan: string;
}

interface ATPItem {
  id: string;
  subjectId: string;
  analysisId: string;
  tpId?: string; // TP sumber (halaman Tujuan Pembelajaran)
  tingkat?: 'X' | 'XI' | 'XII';
  prinsipUrutan?: string;
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

// Perencanaan Pembelajaran Mendalam (dahulu "Modul Ajar"). Kerangka: Panduan Pembelajaran Mendalam,
// Kemendikdasmen: Identifikasi, Desain Pembelajaran, Pengalaman Belajar, Asesmen.
interface TeachingModule {
  id: string;
  judulModul: string;
  subjectId: string;
  classId: string;
  atpId: string;
  tpId: string;
  fase: 'E' | 'F';
  tingkat: 'X' | 'XI' | 'XII';
  semester: 'Ganjil' | 'Genap';
  tahunAjaran: string;
  alokasiWaktu: string; // ringkasan turunan dari JP x menit x pertemuan
  // Identitas
  bidangKeahlian: string;
  programKeahlian: string;
  konsentrasiKeahlian: string;
  jpPerPertemuan: number;
  menitPerJp: number;
  jumlahPertemuan: number;
  sistemPenjadwalan: string;
  // 1. Identifikasi
  idPesertaDidik: string;
  idMateriPelajaran: string;
  dimensiProfil: string[];
  // 2. Desain Pembelajaran
  capaianPembelajaran: string;
  lintasDisiplin: string;
  tujuanPembelajaran: string;
  topikPembelajaran: string;
  praktikPedagogis: string;
  kemitraan: string;
  lingkunganBudaya: string;
  lingkunganRuangFisik: string;
  lingkunganRuangVirtual: string;
  pemanfaatanDigital: string;
  // 3. Pengalaman Belajar
  awalPrinsip: string[];
  awalKegiatan: string;
  memahamiPrinsip: string[];
  memahamiKegiatan: string;
  mengaplikasiPrinsip: string[];
  mengaplikasiKegiatan: string;
  merefleksiPrinsip: string[];
  merefleksiKegiatan: string;
  penutupPrinsip: string[];
  penutupKegiatan: string;
  // 4. Asesmen
  asesmenAwal: string;
  asesmenProses: string;
  asesmenAkhir: string;
  // Tambahan (di luar kerangka resmi)
  mediaSumber: string;
  remedialPengayaan: string;
  // Sisa data format lama yang tidak punya padanan otomatis (mis. kegiatan inti): untuk disalin manual
  catatanMigrasi: string;
  schemaVersion: number;
  status: 'Draft' | 'Final' | 'Arsip';
  updatedAt: string;
  // Field format lama (dipertahankan agar data lama tidak hilang)
  kompetensiAwal?: string;
  profilLulusan?: string;
  pemahamanBermakna?: string;
  pertanyaanPemantik?: string;
  modelPembelajaran?: string;
  pendahuluan?: string;
  kegiatanInti?: string;
  penutup?: string;
  asesmenDiagnostik?: string;
  asesmenFormatif?: string;
  asesmenSumatif?: string;
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
  tps: LearningObjective[];
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
  appsScriptUrl: APP_CONFIG.defaultAppsScriptUrl,
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
  nip: '',
  nuptk: '',
  pangkatGolongan: '',
  jabatan: 'Guru Produktif Teknik Sepeda Motor',
  namaSekolah: APP_CONFIG.schoolDefault.namaSekolah,
  npsn: APP_CONFIG.schoolDefault.npsn,
  alamatSekolah: APP_CONFIG.schoolDefault.alamat,
  teleponSekolah: APP_CONFIG.schoolDefault.telepon,
  email: '',
  noHp: '',
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
  tps: [],
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
  const an2 = 'an-tsm-02';
  const an3 = 'an-tsm-03';
  const tp1 = 'tp-tsm-01';
  const tp2 = 'tp-tsm-02';
  const tp3 = 'tp-tsm-03';
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
      {
        id: an2,
        cpId: cp2,
        subjectId: sub2,
        fase: 'F',
        elemen: 'Perawatan dan Perbaikan Sistem Kelistrikan Sepeda Motor',
        kompetensi: 'Mendiagnosis gangguan sistem pengapian, pengisian, starter, dan manajemen engine (EMS/injeksi)',
        lingkupMateri: 'Sensor TP, EOT, O2, kode kedipan MIL, dan diagnostic scanner',
        kataKerjaOperasional: 'Mendiagnosis, Membaca, Mengukur',
        buktiKetercapaian: 'Peserta didik mampu membaca kode MIL dan parameter sensor menggunakan diagnostic scanner.',
        kebutuhanPraktik: 'Diagnostic scanner, multitester, unit sepeda motor injeksi',
        aspekK3: 'Hindari hubungan singkat baterai, gunakan sarung tangan, pastikan ventilasi',
        keterangan: '[DEMO]',
      },
      {
        id: an3,
        cpId: cp1,
        subjectId: sub1,
        fase: 'F',
        elemen: 'Perawatan dan Perbaikan Engine Sepeda Motor',
        kompetensi: 'Memeriksa dan merawat sistem pelumasan serta sistem pendinginan engine',
        lingkupMateri: 'Pompa oli, filter oli, radiator, thermostat (contoh baris yang belum dirumuskan TP-nya)',
        kataKerjaOperasional: 'Memeriksa, Merawat',
        buktiKetercapaian: '',
        kebutuhanPraktik: 'Unit sepeda motor, wadah oli bekas',
        aspekK3: 'Penampungan oli bekas, sarung tangan',
        keterangan: '[DEMO]',
      },
    ],
    tps: [
      {
        id: tp1,
        subjectId: sub1,
        fase: 'F',
        tingkat: 'XI',
        elemen: 'Perawatan dan Perbaikan Engine Sepeda Motor',
        analysisIds: [an1],
        kodeTp: 'TP.11.1',
        rumusan: 'Menerapkan prosedur K3LH, penggunaan SST, dan pembacaan Buku Pedoman Reparasi (BPR) pada area bengkel TSM.',
        konteks: '',
        keterangan: '[DEMO]',
      },
      {
        id: tp2,
        subjectId: sub1,
        fase: 'F',
        tingkat: 'XI',
        elemen: 'Perawatan dan Perbaikan Engine Sepeda Motor',
        analysisIds: [an1],
        kodeTp: 'TP.11.2',
        rumusan: 'Melakukan pemeriksaan, pengukuran celah katup, dan penyetelan mekanisme katup sepeda motor 4 langkah sesuai standar pabrikan.',
        konteks: '',
        keterangan: '[DEMO]',
      },
      {
        id: tp3,
        subjectId: sub2,
        fase: 'F',
        tingkat: 'XI',
        elemen: 'Perawatan dan Perbaikan Sistem Kelistrikan Sepeda Motor',
        analysisIds: [an2],
        kodeTp: 'TP.11.1',
        rumusan: 'Mendiagnosis kode kedipan MIL (Malfunction Indicator Lamp) dan membaca parameter sensor menggunakan diagnostic scanner.',
        konteks: '',
        keterangan: '[DEMO]',
      },
    ],
    atps: [
      {
        id: atp1,
        subjectId: sub1,
        analysisId: an1,
        tpId: tp1,
        tingkat: 'XI',
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
        tpId: tp2,
        tingkat: 'XI',
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
        analysisId: an2,
        tpId: tp3,
        tingkat: 'XI',
        fase: 'F',
        tahunAjaran: '2026/2027',
        semester: 'Ganjil',
        elemen: 'Perawatan dan Perbaikan Sistem Kelistrikan Sepeda Motor',
        kodeTp: 'TP.11.1',
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
        judulModul: 'Penyetelan Celah Katup dan Pemeriksaan Tekanan Kompresi',
        subjectId: sub1,
        classId: cls1,
        atpId: atp2,
        tpId: tp2,
        fase: 'F',
        tingkat: 'XI',
        semester: 'Ganjil',
        tahunAjaran: '2026/2027',
        alokasiWaktu: '3 Pertemuan (18 JP x 45 Menit)',
        bidangKeahlian: 'Teknologi Manufaktur dan Rekayasa',
        programKeahlian: 'Teknik Otomotif',
        konsentrasiKeahlian: 'Teknik Sepeda Motor',
        jpPerPertemuan: 6,
        menitPerJp: 45,
        jumlahPertemuan: 3,
        sistemPenjadwalan: 'Blok',
        idPesertaDidik: 'Peserta didik sudah mengenal siklus motor 4 langkah dan penggunaan alat ukur dasar, tetapi kemampuan membaca skala feeler gauge dan menentukan posisi TMA masih bervariasi. Sebagian besar menunjukkan minat tinggi pada praktik langsung di bengkel.',
        idMateriPelajaran: 'Materi bersifat prosedural dan aplikatif: pengetahuan esensial (mekanisme katup dan siklus 4 langkah), aplikatif (pengukuran dan penyetelan celah katup), serta nilai dan karakter (disiplin K3LH dan budaya kerja 5R). Tingkat kesulitan sedang dan tersusun berjenjang dari konsep ke praktik.',
        dimensiProfil: ['Penalaran Kritis', 'Kolaborasi', 'Kemandirian', 'Kesehatan'],
        capaianPembelajaran: '[CONTOH DEMO — Silakan ganti dengan teks resmi Keputusan Kepala BSKAP terbaru] Pada akhir fase F, peserta didik mampu mendiagnosis gangguan atau kerusakan pada engine sepeda motor meliputi komponen utama engine, sistem pelumasan, sistem pendinginan, sistem bahan bakar, serta melakukan tindakan perawatan dan perbaikan sesuai SOP buku pedoman reparasi (BPR).',
        lintasDisiplin: 'Matematika (satuan dan ketelitian pengukuran), Fisika (termodinamika motor bakar), Bahasa Inggris teknik (membaca BPR).',
        tujuanPembelajaran: 'Melakukan pemeriksaan, pengukuran celah katup, dan penyetelan mekanisme katup sepeda motor 4 langkah sesuai standar pabrikan.',
        topikPembelajaran: 'Penyetelan celah katup pada sepeda motor 4 langkah',
        praktikPedagogis: 'Pembelajaran Berbasis Proyek (PjBL) dengan pendekatan Teaching Factory; demonstrasi, praktik terbimbing, dan diskusi kelompok kecil.',
        kemitraan: 'Instruktur bengkel resmi/dealer sepeda motor (DUDI) sebagai narasumber tamu; kolaborasi antar guru produktif.',
        lingkunganBudaya: 'Budaya kerja industri: disiplin K3LH, 5R, saling mengingatkan, aman bertanya, dan menghargai kerja tim.',
        lingkunganRuangFisik: 'Bengkel TSM (stall unit praktik) dan ruang kelas untuk teori singkat.',
        lingkunganRuangVirtual: 'Kelas daring (LMS) untuk BPR digital, video valve timing, dan jurnal refleksi.',
        pemanfaatanDigital: 'Video animasi valve timing, BPR digital, kuis formatif daring, portofolio digital hasil praktik.',
        awalPrinsip: ['Berkesadaran', 'Bermakna'],
        awalKegiatan: '1. Salam, doa bersama, pemeriksaan APD (wearpack dan safety shoes), dan safety briefing.\n2. Video singkat perbandingan suara mesin dengan celah katup normal dan tidak normal.\n3. Pertanyaan pemantik: Mengapa mesin berisik di kepala silinder saat panas, atau sulit hidup saat dingin?\n4. Penyampaian tujuan pembelajaran dan kaitannya dengan pekerjaan mekanik di bengkel.',
        memahamiPrinsip: ['Berkesadaran', 'Bermakna'],
        memahamiKegiatan: '1. Peserta didik membaca BPR untuk menemukan spesifikasi celah katup IN/EX dan prosedur penyetelan.\n2. Diskusi kelompok tentang pengaruh celah katup terhadap tenaga, konsumsi bahan bakar, dan umur komponen.\n3. Membuat peta konsep mekanisme katup dan siklus 4 langkah.',
        mengaplikasiPrinsip: ['Bermakna', 'Menggembirakan'],
        mengaplikasiKegiatan: '1. Menentukan posisi TMA langkah kompresi pada unit praktik.\n2. Mengukur dan menyetel celah katup dengan feeler gauge sesuai standar, bekerja berpasangan dengan pembagian peran.\n3. Menghidupkan mesin, memeriksa kebocoran oli, dan mencatat hasil pada Jobsheet.\n4. Proyek mini: mendiagnosis unit dengan keluhan suara berisik dan menyusun rekomendasi perbaikan.',
        merefleksiPrinsip: ['Berkesadaran', 'Bermakna'],
        merefleksiKegiatan: '1. Presentasi hasil praktik dan umpan balik dari teman, guru, dan instruktur tamu.\n2. Jurnal refleksi individu: kendala saat mencari posisi TMA dan strategi memperbaikinya.\n3. Penilaian diri terhadap pencapaian tujuan pembelajaran dan rencana tindak lanjut.',
        penutupPrinsip: ['Berkesadaran'],
        penutupKegiatan: '1. Guru dan peserta didik menyimpulkan pembelajaran.\n2. Penerapan 5R pada stall dan tool caddy.\n3. Merencanakan praktik berikutnya dan menghargai pencapaian peserta didik.',
        asesmenAwal: 'Kuis singkat 5 soal tentang siklus 4 langkah dan pembacaan skala feeler gauge; pertanyaan diagnostik lisan.',
        asesmenProses: 'Observasi sikap kerja K3LH dan kerja sama, umpan balik formatif saat praktik, peta konsep, serta lembar kerja Jobsheet.',
        asesmenAkhir: 'Uji kinerja individu penyetelan celah katup (maks. 25 menit, toleransi +/- 0,02 mm), jurnal refleksi, dan tes tertulis singkat.',
        mediaSumber: 'Unit sepeda motor Honda Supra X 125 / Beat FI, BPR resmi, feeler gauge, kunci penyetel katup, video animasi valve timing.',
        remedialPengayaan: 'Remedial: pendampingan ulang pembacaan tanda TOP magnet dan feeler gauge. Pengayaan: penyetelan katup tipe shim (DOHC).',
        catatanMigrasi: '',
        schemaVersion: 2,
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
// Kode respons standar dari backend Apps Script v2 (lihat Google_App_Script.gs)
type CloudCode =
  | 'OK'
  | 'EMPTY'
  | 'AUTH_FAILED'
  | 'TOKEN_NOT_CONFIGURED'
  | 'CONFLICT'
  | 'EMPTY_PAYLOAD'
  | 'SERVER_CORRUPT'
  | 'BUSY'
  | 'NOT_CONFIGURED'
  | 'NETWORK'
  | 'TIMEOUT'
  | 'INVALID_RESPONSE'
  | 'INVALID_REQUEST'
  | 'METHOD_NOT_ALLOWED'
  | 'LOGIN_FAILED'
  | 'LOCKED'
  | 'CREDENTIALS_NOT_CONFIGURED'
  | 'WEAK_PASSWORD'
  | 'SERVER_ERROR';

interface CloudResponse {
  success: boolean;
  code: CloudCode;
  message: string;
  data?: any;
  version?: number;
  updatedAt?: string;
  currentVersion?: number;
  token?: string;
  expiresAt?: number;
  email?: string;
}

const DATA_COLLECTIONS = [
  'calendar', 'classes', 'students', 'subjects', 'cps', 'cpAnalyses', 'atps',
  'protas', 'promes', 'modules', 'jobsheets', 'journals', 'attendances',
  'assessments', 'grades', 'followUps', 'tps',
] as const;

// Apakah database berisi data pengguna (bukan sekadar kerangka kosong)?
const hasUserData = (d: WorkspaceDatabase): boolean =>
  DATA_COLLECTIONS.some((k) => Array.isArray((d as any)[k]) && (d as any)[k].length > 0);

// ---- Alur kurikulum: TP terpisah dari ATP ------------------------------------
const tingkatNumber = (t: 'X' | 'XI' | 'XII'): number => (t === 'X' ? 10 : t === 'XI' ? 11 : 12);

const inferTingkat = (kodeTp: string, fase: 'E' | 'F'): 'X' | 'XI' | 'XII' => {
  const m = /^TP\.(\d{2})\./i.exec(kodeTp || '');
  if (m && m[1] === '10') return 'X';
  if (m && m[1] === '11') return 'XI';
  if (m && m[1] === '12') return 'XII';
  return fase === 'E' ? 'X' : 'XI';
};

// Data lama: tiap ATP yang belum punya TP sumber dibuatkan TP-nya. Id TP diturunkan dari id ATP
// sehingga hasil migrasi SAMA di setiap perangkat (tidak menimbulkan konflik sinkronisasi) dan
// aman dijalankan berulang kali.
const migrateLearningObjectives = (d: any): any => {
  const tps: LearningObjective[] = Array.isArray(d.tps) ? d.tps : [];
  const atps: ATPItem[] = Array.isArray(d.atps) ? d.atps : [];
  const analyses: CPAnalysis[] = Array.isArray(d.cpAnalyses) ? d.cpAnalyses : [];
  const hasTp = (id?: string) => !!id && tps.some((t) => t.id === id);
  if (atps.every((a) => hasTp(a.tpId) && a.tingkat)) return d;

  const nextTps = [...tps];
  const nextAtps = atps.map((a) => {
    const tingkat = a.tingkat || inferTingkat(a.kodeTp, a.fase);
    const an = analyses.find((x) => x.id === a.analysisId && x.subjectId === a.subjectId);
    const tpId = a.tpId || `tp-from-${a.id}`;
    if (!nextTps.some((t) => t.id === tpId)) {
      nextTps.push({
        id: tpId,
        subjectId: a.subjectId,
        fase: a.fase,
        tingkat,
        elemen: a.elemen,
        analysisIds: an ? [an.id] : [],
        kodeTp: a.kodeTp,
        rumusan: a.tujuanPembelajaran,
        konteks: '',
        keterangan: a.keterangan || '',
      });
    }
    return { ...a, tpId, tingkat, analysisId: an ? a.analysisId : '' };
  });
  return { ...d, tps: nextTps, atps: nextAtps };
};

// ---- Perencanaan Pembelajaran Mendalam -----------------------------------------
const DIMENSI_PROFIL = [
  'Keimanan dan Ketakwaan terhadap Tuhan YME',
  'Kewargaan',
  'Penalaran Kritis',
  'Kreativitas',
  'Kolaborasi',
  'Kemandirian',
  'Kesehatan',
  'Komunikasi',
];
const PRINSIP_PM = ['Berkesadaran', 'Bermakna', 'Menggembirakan'];
const SISTEM_PENJADWALAN = ['Blok', 'Reguler (Mingguan)'];
const DEFAULT_BIDANG_KEAHLIAN = 'Teknologi Manufaktur dan Rekayasa';

const faseOfTingkat = (t: 'X' | 'XI' | 'XII'): 'E' | 'F' => (t === 'X' ? 'E' : 'F');
const semesterLabel = (s: 'Ganjil' | 'Genap'): string => (s === 'Ganjil' ? '1 (Satu)' : '2 (Dua)');
const jamPelajaranText = (m: { jpPerPertemuan: number; menitPerJp: number; jumlahPertemuan: number }): string =>
  `${m.jpPerPertemuan} JP x ${m.menitPerJp} menit x ${m.jumlahPertemuan} pertemuan`;
const alokasiRingkas = (m: { jpPerPertemuan: number; menitPerJp: number; jumlahPertemuan: number }): string =>
  `${m.jumlahPertemuan} Pertemuan (${m.jpPerPertemuan * m.jumlahPertemuan} JP x ${m.menitPerJp} Menit)`;
const schoolShortName = (t: { namaSekolah?: string }): string =>
  !t.namaSekolah || t.namaSekolah === APP_CONFIG.schoolDefault.namaSekolah
    ? APP_CONFIG.schoolDefault.namaSekolahSingkat
    : t.namaSekolah;

const hasText = (v?: string): boolean => !!(v && v.trim());

// Butir WAJIB menurut kerangka (hlm. 38-39 panduan); butir lain bersifat opsional.
const planChecklist = (m: TeachingModule): { key: string; label: string; ok: boolean }[] => [
  { key: 'dimensi', label: 'Dimensi profil lulusan', ok: (m.dimensiProfil || []).length > 0 },
  { key: 'tujuan', label: 'Tujuan pembelajaran', ok: hasText(m.tujuanPembelajaran) },
  { key: 'pedagogis', label: 'Praktik pedagogis', ok: hasText(m.praktikPedagogis) },
  {
    key: 'lingkungan',
    label: 'Lingkungan pembelajaran',
    ok: hasText(m.lingkunganBudaya) || hasText(m.lingkunganRuangFisik) || hasText(m.lingkunganRuangVirtual),
  },
  { key: 'memahami', label: 'Pengalaman belajar: Memahami', ok: hasText(m.memahamiKegiatan) },
  { key: 'mengaplikasi', label: 'Pengalaman belajar: Mengaplikasi', ok: hasText(m.mengaplikasiKegiatan) },
  { key: 'merefleksi', label: 'Pengalaman belajar: Merefleksi', ok: hasText(m.merefleksiKegiatan) },
  { key: 'asesmenAwal', label: 'Asesmen awal pembelajaran', ok: hasText(m.asesmenAwal) },
  { key: 'asesmenProses', label: 'Asesmen proses pembelajaran', ok: hasText(m.asesmenProses) },
  { key: 'asesmenAkhir', label: 'Asesmen akhir pembelajaran', ok: hasText(m.asesmenAkhir) },
];

const cpTextForTp = (tp: LearningObjective | undefined, analyses: CPAnalysis[], cps: LearningOutcome[]): string => {
  if (!tp) return '';
  const cpIds = Array.from(new Set(analyses.filter((a) => tp.analysisIds.includes(a.id)).map((a) => a.cpId)));
  return cps
    .filter((c) => cpIds.includes(c.id))
    .map((c) => c.deskripsiCp)
    .join('\n');
};

const parseAlokasi = (s: string): { jpPerPertemuan: number; menitPerJp: number; jumlahPertemuan: number } => {
  const str = String(s || '');
  const num = (re: RegExp): number => {
    const m = re.exec(str);
    const n = m ? parseInt(m[1], 10) : NaN;
    return Number.isFinite(n) && n > 0 ? n : 0;
  };
  const pertemuan = num(/(\d+)\s*pertemuan/i) || 1;
  const totalJp = num(/(\d+)\s*JP/i);
  const menit = num(/(\d+)\s*menit/i) || 45;
  return {
    jumlahPertemuan: pertemuan,
    jpPerPertemuan: totalJp ? Math.max(1, Math.round(totalJp / pertemuan)) : 4,
    menitPerJp: menit,
  };
};

const matchDimensi = (dim: string, part: string): boolean =>
  dim.startsWith('Keimanan') ? /keimanan|ketakwaan/i.test(part) : part.toLowerCase().includes(dim.toLowerCase());

// Data lama (format "Modul Ajar") dipetakan ke kerangka baru. Hasilnya deterministik (sama di setiap
// perangkat) dan idempoten. Teks "kegiatan inti" lama TIDAK dipecah otomatis karena tidak dapat
// dipastikan mana yang termasuk memahami/mengaplikasi/merefleksi: disimpan di catatanMigrasi.
const upgradeModule = (m: any, d: any): TeachingModule => {
  const subjects: Subject[] = d.subjects || [];
  const atps: ATPItem[] = d.atps || [];
  const tps: LearningObjective[] = d.tps || [];
  const analyses: CPAnalysis[] = d.cpAnalyses || [];
  const cps: LearningOutcome[] = d.cps || [];
  const subj = subjects.find((s) => s.id === m.subjectId);
  const atp = atps.find((a) => a.id === m.atpId);
  const tp = tps.find((x) => x.id === (m.tpId || atp?.tpId));
  const tingkat: 'X' | 'XI' | 'XII' = m.tingkat || subj?.tingkat || tp?.tingkat || atp?.tingkat || (m.fase === 'E' ? 'X' : 'XI');

  const parts = String(m.profilLulusan || '')
    .split(',')
    .map((x: string) => x.trim())
    .filter(Boolean);
  const dimensi = DIMENSI_PROFIL.filter((dim) => parts.some((p: string) => matchDimensi(dim, p)));
  const profilSisa = parts.filter((p: string) => !DIMENSI_PROFIL.some((dim) => matchDimensi(dim, p)));

  const catatan: string[] = [];
  if (hasText(m.kegiatanInti)) catatan.push(`KEGIATAN INTI (format lama):\n${String(m.kegiatanInti).trim()}`);
  if (profilSisa.length) catatan.push(`PROFIL LULUSAN LAMA (tanpa padanan dimensi):\n${profilSisa.join(', ')}`);

  return {
    ...m,
    tpId: tp?.id || '',
    tingkat,
    fase: faseOfTingkat(tingkat),
    bidangKeahlian: DEFAULT_BIDANG_KEAHLIAN,
    programKeahlian: subj?.programKeahlian || '',
    konsentrasiKeahlian: subj?.konsentrasiKeahlian || '',
    ...parseAlokasi(m.alokasiWaktu),
    sistemPenjadwalan: 'Blok',
    idPesertaDidik: m.kompetensiAwal || '',
    idMateriPelajaran: m.pemahamanBermakna || '',
    dimensiProfil: dimensi,
    capaianPembelajaran: cpTextForTp(tp, analyses, cps),
    lintasDisiplin: '',
    tujuanPembelajaran: tp?.rumusan || atp?.tujuanPembelajaran || '',
    topikPembelajaran: '',
    praktikPedagogis: m.modelPembelajaran || '',
    kemitraan: '',
    lingkunganBudaya: '',
    lingkunganRuangFisik: '',
    lingkunganRuangVirtual: '',
    pemanfaatanDigital: '',
    awalPrinsip: [],
    awalKegiatan: [m.pendahuluan, hasText(m.pertanyaanPemantik) ? `Pertanyaan pemantik: ${String(m.pertanyaanPemantik).trim()}` : '']
      .filter((x) => hasText(x))
      .join('\n'),
    memahamiPrinsip: [],
    memahamiKegiatan: '',
    mengaplikasiPrinsip: [],
    mengaplikasiKegiatan: '',
    merefleksiPrinsip: [],
    merefleksiKegiatan: '',
    penutupPrinsip: [],
    penutupKegiatan: m.penutup || '',
    asesmenAwal: m.asesmenDiagnostik || '',
    asesmenProses: m.asesmenFormatif || '',
    asesmenAkhir: m.asesmenSumatif || '',
    mediaSumber: m.mediaSumber || '',
    remedialPengayaan: m.remedialPengayaan || '',
    catatanMigrasi: catatan.join('\n\n'),
    schemaVersion: 2,
  } as TeachingModule;
};

const migrateTeachingModules = (d: any): any => {
  const modules: any[] = Array.isArray(d.modules) ? d.modules : [];
  if (modules.every((m) => m && m.schemaVersion === 2)) return d;
  return { ...d, modules: modules.map((m) => (m && m.schemaVersion === 2 ? m : upgradeModule(m || {}, d))) };
};

// Memvalidasi & melengkapi struktur database dari cloud/backup. Mengembalikan null jika tidak valid.
const normalizeWorkspace = (raw: any): WorkspaceDatabase | null => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  if (!raw.teacher || typeof raw.teacher !== 'object') return null;
  const base = createEmptyDatabase();
  const merged: any = { ...base, ...raw, teacher: { ...base.teacher, ...raw.teacher } };
  DATA_COLLECTIONS.forEach((k) => {
    if (!Array.isArray(merged[k])) merged[k] = [];
  });
  return migrateTeachingModules(migrateLearningObjectives(merged)) as WorkspaceDatabase;
};

const lowerFirst = (s: string): string => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);

const seqOfKode = (kode: string): number => {
  const m = /(\d+)\s*$/.exec(kode || '');
  return m ? parseInt(m[1], 10) : 0;
};

const compareTp = (a: LearningObjective, b: LearningObjective): number =>
  tingkatNumber(a.tingkat) - tingkatNumber(b.tingkat) ||
  seqOfKode(a.kodeTp) - seqOfKode(b.kodeTp) ||
  (a.kodeTp || '').localeCompare(b.kodeTp || '');

// Kode TP otomatis mengikuti kelas dan urutan pada mata pelajaran yang sama: TP.11.1, TP.11.2, ...
const nextKodeTp = (tps: LearningObjective[], subjectId: string, tingkat: 'X' | 'XI' | 'XII'): string => {
  const prefix = `TP.${tingkatNumber(tingkat)}.`;
  const used = tps
    .filter((t) => t.subjectId === subjectId && (t.kodeTp || '').startsWith(prefix))
    .map((t) => parseInt(t.kodeTp.slice(prefix.length), 10))
    .filter((n) => Number.isFinite(n));
  return `${prefix}${(used.length ? Math.max(...used) : 0) + 1}`;
};

// Draf rumusan TP dari baris analisis terpilih (kompetensi + lingkup materi). Selalu disunting guru.
const buildTpDraft = (rows: CPAnalysis[]): string => {
  if (!rows.length) return '';
  const komp = rows
    .map((r) => lowerFirst((r.kompetensi || '').trim()).replace(/[.\s]+$/, ''))
    .filter(Boolean)
    .join(' serta ');
  const materi = Array.from(new Set(rows.map((r) => (r.lingkupMateri || '').trim()).filter(Boolean))).join('; ');
  return `Peserta didik mampu ${komp}${materi ? ` pada materi ${materi}` : ''}.`;
};

// Menyelaraskan salinan data TP di ATP dengan TP sumbernya
const syncAtpWithTp = (atp: ATPItem, tp: LearningObjective, analyses: CPAnalysis[]): ATPItem => {
  const src = analyses.filter((a) => tp.analysisIds.includes(a.id));
  return {
    ...atp,
    subjectId: tp.subjectId,
    fase: tp.fase,
    tingkat: tp.tingkat,
    elemen: tp.elemen,
    kodeTp: tp.kodeTp,
    tujuanPembelajaran: tp.rumusan,
    analysisId: src[0]?.id || '',
    kompetensi: src.length ? src.map((a) => a.kompetensi).join('; ') : atp.kompetensi,
    lingkupMateri: src.length
      ? Array.from(new Set(src.map((a) => a.lingkupMateri))).join('; ')
      : atp.lingkupMateri,
  };
};

// Hanya ATP yang tertaut ke TP terdampak (onlyTpIds) yang diselaraskan; ATP lain tidak disentuh.
const resyncAtps = (d: WorkspaceDatabase, onlyTpIds: string[]): WorkspaceDatabase => ({
  ...d,
  atps: d.atps.map((atp) => {
    if (!atp.tpId || !onlyTpIds.includes(atp.tpId)) return atp;
    const tp = d.tps.find((x) => x.id === atp.tpId);
    return tp ? syncAtpWithTp(atp, tp, d.cpAnalyses) : atp;
  }),
});

// Sidik isi database (mengabaikan lastUpdated) untuk membandingkan data lokal vs cloud
const contentFingerprint = (d: WorkspaceDatabase): string => {
  const n = normalizeWorkspace(d);
  return n ? JSON.stringify({ ...n, lastUpdated: '' }) : '';
};
const sameContent = (a: WorkspaceDatabase, b: WorkspaceDatabase): boolean => {
  const fa = contentFingerprint(a);
  return fa !== '' && fa === contentFingerprint(b);
};

const readStoredNumber = (key: string): number | null => {
  try {
    const v = localStorage.getItem(key);
    if (v === null || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
};
// URL Web App: nilai bawaan ada di kode. Nilai yang tersimpan di browser HANYA berupa "penggantian"
// yang sengaja diisi pengguna; URL lama yang pernah tersimpan otomatis tidak lagi dipakai.
const readUrlOverride = (): string => {
  try {
    const v = (localStorage.getItem(APP_CONFIG.urlOverrideKey) || '').trim();
    return /^https:\/\//i.test(v) ? v : '';
  } catch {
    return '';
  }
};

// Kegagalan menghubungi server (belum ada jawaban dari skrip): layak dicoba ulang dengan URL bawaan.
// Jawaban JSON dari server (mis. kata sandi salah, terkunci) TIDAK termasuk.
const isConnectionFailure = (code: string): boolean =>
  code === 'NETWORK' || code === 'TIMEOUT' || code === 'INVALID_RESPONSE' || code === 'NOT_CONFIGURED';

const readStoredFlag = (key: string): boolean => {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
};
const writeStored = (key: string, value: string | null): void => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Metadata sinkronisasi gagal disimpan: sinkronisasi berikutnya akan memeriksa ulang ke cloud.
  }
};

// Mengunduh salinan database sebagai file JSON. Mengembalikan false jika gagal.
const downloadDatabaseFile = (data: WorkspaceDatabase, prefix: string): boolean => {
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prefix}_${todayISO()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch {
    return false;
  }
};

// ---- Sesi login (token sesi diterbitkan server setelah email + kata sandi diverifikasi) ----
interface AuthSession {
  token: string;
  email: string;
  expiresAt: number;
}

const authStores = (): Storage[] => {
  const out: Storage[] = [];
  try {
    out.push(sessionStorage);
  } catch {
    // sessionStorage tidak tersedia
  }
  try {
    out.push(localStorage);
  } catch {
    // localStorage tidak tersedia
  }
  return out;
};

const readAuthSession = (): AuthSession | null => {
  for (const store of authStores()) {
    try {
      const raw = store.getItem(APP_CONFIG.authStoreKey);
      if (!raw) continue;
      const s = JSON.parse(raw);
      if (s && typeof s.token === 'string' && typeof s.expiresAt === 'number' && s.expiresAt > Date.now()) {
        return { token: s.token, email: String(s.email || ''), expiresAt: s.expiresAt };
      }
      store.removeItem(APP_CONFIG.authStoreKey); // sesi kedaluwarsa/rusak
    } catch {
      // data sesi rusak: dianggap tidak ada
    }
  }
  return null;
};

const clearAuthSession = (): void => {
  authStores().forEach((st) => {
    try {
      st.removeItem(APP_CONFIG.authStoreKey);
    } catch {
      // abaikan
    }
  });
};

// remember=true -> localStorage (bertahan sampai sesi server habis); false -> hilang saat tab ditutup
const saveAuthSession = (s: AuthSession, remember: boolean): boolean => {
  clearAuthSession();
  try {
    (remember ? localStorage : sessionStorage).setItem(APP_CONFIG.authStoreKey, JSON.stringify(s));
    return true;
  } catch {
    return false;
  }
};

const getAuthToken = (): string => readAuthSession()?.token || '';

class MotoTeachApiService {
  // Semua operasi data memakai POST (token berada di isi permintaan, bukan di URL).
  private async post(url: string, body: Record<string, unknown>, timeoutMs: number): Promise<CloudResponse> {
    if (!url || !url.trim()) {
      return { success: false, code: 'NOT_CONFIGURED', message: 'URL Google Apps Script belum diisi.' };
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url.trim(), {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      const text = await res.text();
      let json: any;
      try {
        json = JSON.parse(text);
      } catch {
        return {
          success: false,
          code: 'INVALID_RESPONSE',
          message: `Respons server bukan JSON (HTTP ${res.status}). Pastikan deployment Web App diatur "Siapa saja (Anyone)" dan sudah dideploy sebagai versi baru.`,
        };
      }
      return this.normalize(json);
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return {
          success: false,
          code: 'TIMEOUT',
          message: `Koneksi ke Google Apps Script timeout (>${Math.round(timeoutMs / 1000)} detik).`,
        };
      }
      return {
        success: false,
        code: 'NETWORK',
        message: 'Tidak dapat menghubungi Google Apps Script. Periksa koneksi internet dan URL Web App (akses harus "Siapa saja").',
      };
    } finally {
      clearTimeout(timer);
    }
  }

  private normalize(json: any): CloudResponse {
    const message = String(json?.message || '');
    let code: CloudCode | undefined = json?.code;
    if (!code) {
      // Kompatibilitas dengan backend versi lama yang belum mengirim "code"
      if (json?.success) code = 'OK';
      else if (/autentikasi gagal|token/i.test(message)) code = 'AUTH_FAILED';
      else if (/masih kosong/i.test(message)) code = 'EMPTY';
      else code = 'SERVER_ERROR';
    }
    return {
      success: !!json?.success,
      code,
      message,
      data: json?.data,
      version: typeof json?.version === 'number' ? json.version : undefined,
      updatedAt: json?.updatedAt,
      currentVersion: typeof json?.currentVersion === 'number' ? json.currentVersion : undefined,
      token: typeof json?.token === 'string' ? json.token : undefined,
      expiresAt: typeof json?.expiresAt === 'number' ? json.expiresAt : undefined,
      email: typeof json?.email === 'string' ? json.email : undefined,
    };
  }

  async login(url: string, email: string, password: string): Promise<CloudResponse> {
    return this.post(url, { action: 'login', email, password }, 30000);
  }

  async logout(url: string, token: string): Promise<CloudResponse> {
    return this.post(url, { action: 'logout', token }, 10000);
  }

  async changePassword(url: string, token: string, oldPassword: string, newPassword: string): Promise<CloudResponse> {
    return this.post(url, { action: 'changePassword', token, oldPassword, newPassword }, 30000);
  }

  async testConnection(url: string, token?: string): Promise<{ ok: boolean; message: string; latencyMs: number }> {
    if (!url || !url.trim()) {
      return { ok: false, message: 'URL Google Apps Script belum diisi.', latencyMs: 0 };
    }
    const start = performance.now();
    const elapsed = () => Math.round(performance.now() - start);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const target = `${url.trim()}${url.includes('?') ? '&' : '?'}action=health&_ts=${Date.now()}`;
      const res = await fetch(target, { method: 'GET', mode: 'cors', signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) {
        return { ok: false, message: `Server merespons status HTTP ${res.status}`, latencyMs: elapsed() };
      }
      let json: any;
      try {
        json = JSON.parse(await res.text());
      } catch {
        return {
          ok: false,
          message: 'Respons bukan JSON. Pastikan deployment Web App diatur "Siapa saja (Anyone)" dan sudah dideploy sebagai versi baru.',
          latencyMs: elapsed(),
        };
      }
      if (!json?.success) {
        return { ok: false, message: json?.message || 'Respons API tidak valid', latencyMs: elapsed() };
      }
    } catch (err: any) {
      return {
        ok: false,
        message:
          err?.name === 'AbortError'
            ? 'Koneksi timeout (>10 detik). Periksa jaringan atau deployment Apps Script.'
            : 'Gagal menghubungi Apps Script (Pastikan akses deployment diatur ke "Anyone" / "Siapa saja").',
        latencyMs: elapsed(),
      };
    }
    if (!token || !token.trim()) {
      return {
        ok: false,
        message: 'Server terjangkau, tetapi Anda belum memiliki sesi login yang valid. Silakan login ulang.',
        latencyMs: elapsed(),
      };
    }
    const verify = await this.post(url, { action: 'verify', token: token.trim() }, 15000);
    if (verify.success) {
      return { ok: true, message: verify.message || 'Terhubung dan sesi login valid', latencyMs: elapsed() };
    }
    return { ok: false, message: verify.message || 'Verifikasi sesi gagal', latencyMs: elapsed() };
  }

  async pullDatabase(url: string, token?: string): Promise<CloudResponse> {
    const body = { action: 'pullAll', token: token || '' };
    let res = await this.post(url, body, 20000);
    if (!res.success && (res.code === 'NETWORK' || res.code === 'TIMEOUT')) {
      await new Promise((r) => setTimeout(r, 1000));
      res = await this.post(url, body, 20000);
    }
    if (res.success && res.code === 'OK' && !res.data) {
      return { success: false, code: 'INVALID_RESPONSE', message: 'Server tidak mengirim data database.' };
    }
    return res;
  }

  async pushDatabase(
    url: string,
    db: WorkspaceDatabase,
    token: string | undefined,
    baseVersion: number | null,
    opts: { force?: boolean; allowEmpty?: boolean } = {}
  ): Promise<CloudResponse> {
    if (!url) {
      return { success: false, code: 'NOT_CONFIGURED', message: 'Tersimpan lokal (Cloud belum dikonfigurasi)' };
    }
    return this.post(
      url,
      {
        action: 'syncAll',
        token: token || '',
        payload: db,
        baseVersion,
        force: opts.force === true,
        allowEmpty: opts.allowEmpty === true,
        timestamp: new Date().toISOString(),
      },
      30000
    );
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
const APPS_SCRIPT_CODE_BUNDLE = `/**
 * MotoTeach Workspace API v3.0.0 (Fase 1: keamanan)
 *
 * Perubahan utama dibanding v2:
 *  - Login diperiksa di SERVER (email + kata sandi). Kata sandi hanya disimpan sebagai
 *    hash bergaram di Script Properties, tidak pernah ada di kode atau repository.
 *  - Setelah login berhasil, server menerbitkan token sesi acak (berlaku 7 hari).
 *    Semua akses data wajib membawa token sesi itu. Server hanya menyimpan hash token.
 *  - Pembatasan percobaan login: 5 kali gagal = login dikunci 15 menit.
 *  - Ganti kata sandi dilakukan di server (butuh kata sandi lama; sesi lain dicabut).
 *  - API_TOKEN statis dari v2 DIHAPUS dan tidak lagi diterima.
 *  - Menu "MotoTeach" di Spreadsheet untuk mengatur email & kata sandi admin.
 *
 * Fitur sinkronisasi (versi, deteksi konflik, snapshot terpecah) dari v2 tidak berubah.
 */

const API_VERSION = '3.1.0';
const TZ = 'Asia/Jakarta';
const CHUNK_SIZE = 40000;
const SNAP_KEY = 'PRIMARY_WORKSPACE';
const META_KEY = 'META';
const MAX_LOG_ROWS = 500;
const MAX_PAYLOAD_CHARS = 4000000;

const HASH_ROUNDS = 1000;                       // putaran hash kata sandi
const SESSION_TTL_MS = 7 * 24 * 3600 * 1000;    // masa berlaku sesi: 7 hari
const MAX_SESSIONS = 10;                        // jumlah sesi aktif maksimum
const MAX_LOGIN_FAILS = 5;                      // percobaan gagal sebelum dikunci
const LOCK_MS = 15 * 60 * 1000;                 // lama penguncian login: 15 menit
const MIN_PASSWORD_LEN = 10;
const MAX_PASSWORD_LEN = 200;

const SHEET_NAMES = [
  'Settings', 'TeacherProfile', 'AcademicYears', 'Calendar',
  'Classes', 'Students', 'Subjects', 'LearningOutcomes',
  'CPAnalysis', 'LearningObjectives', 'ATP', 'PROTA',
  'PROMES', 'TeachingModules', 'Jobsheets', 'TeachingJournal',
  'Attendance', 'Assessments', 'AssessmentItems', 'Grades',
  'Remedial', 'Enrichment', 'ActivityLogs', 'RawSnapshot', 'RawSnapshotPrev'
];

// [nama sheet, kunci koleksi pada payload]
const MIRRORS = [
  ['Classes', 'classes'], ['Students', 'students'], ['Subjects', 'subjects'],
  ['LearningOutcomes', 'cps'], ['ATP', 'atps'], ['TeachingModules', 'modules'],
  ['Jobsheets', 'jobsheets'], ['TeachingJournal', 'journals'],
  ['Attendance', 'attendances'], ['Assessments', 'assessments'], ['Grades', 'grades'],
  ['LearningObjectives', 'tps']
];

// Koleksi yang dipakai untuk menentukan "payload berisi data atau kosong"
const CONTENT_KEYS = [
  'calendar', 'classes', 'students', 'subjects', 'cps', 'cpAnalyses', 'atps',
  'protas', 'promes', 'modules', 'jobsheets', 'journals', 'attendances',
  'assessments', 'grades', 'followUps', 'tps'
];

/* ------------------------------------------------------------------ */
/* SETUP                                                               */
/* ------------------------------------------------------------------ */

/** Jalankan SEKALI dari editor untuk membuat semua sheet. */
function setupDatabase() {
  const ss = getSS_();
  SHEET_NAMES.forEach(function (name) {
    ensureSheet_(ss, name);
  });
  return 'Setup Database MotoTeach Workspace selesai!';
}

/** Menu di Spreadsheet (muncul setelah Spreadsheet dimuat ulang). */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('MotoTeach')
    .addItem('Atur email & kata sandi admin', 'menuSetCredentials')
    .addItem('Keluarkan semua sesi login', 'menuRevokeSessions')
    .addToUi();
}

function menuSetCredentials() {
  const ui = SpreadsheetApp.getUi();
  const r1 = ui.prompt('Email admin', 'Email yang dipakai untuk login ke aplikasi:', ui.ButtonSet.OK_CANCEL);
  if (r1.getSelectedButton() !== ui.Button.OK) return;
  const r2 = ui.prompt('Kata sandi baru',
    'Minimal ' + MIN_PASSWORD_LEN + ' karakter, memuat huruf dan angka/simbol. Gunakan kata sandi yang BARU dan belum pernah dipakai di tempat lain. (Teks terlihat saat diketik; lakukan di tempat privat.)',
    ui.ButtonSet.OK_CANCEL);
  if (r2.getSelectedButton() !== ui.Button.OK) return;
  const r3 = ui.prompt('Ulangi kata sandi', 'Ketik kata sandi yang sama sekali lagi:', ui.ButtonSet.OK_CANCEL);
  if (r3.getSelectedButton() !== ui.Button.OK) return;
  if (r2.getResponseText() !== r3.getResponseText()) {
    ui.alert('Kata sandi tidak sama. Tidak ada yang diubah.');
    return;
  }
  try {
    setAdminCredentials_(r1.getResponseText(), r2.getResponseText());
    ui.alert('Berhasil. Email dan kata sandi admin sudah diatur. Semua sesi login lama dicabut. Silakan login di aplikasi.');
  } catch (err) {
    ui.alert('Gagal: ' + (err && err.message ? err.message : String(err)));
  }
}

function menuRevokeSessions() {
  revokeAllSessions();
  SpreadsheetApp.getUi().alert('Semua sesi login dicabut. Semua perangkat harus login ulang.');
}

/** Dapat juga dijalankan dari editor: mencabut semua sesi login. */
function revokeAllSessions() {
  props_().deleteProperty('SESSIONS');
  return 'Semua sesi dicabut.';
}

/* ------------------------------------------------------------------ */
/* AUTENTIKASI                                                         */
/* ------------------------------------------------------------------ */

function props_() {
  return PropertiesService.getScriptProperties();
}

function sha256Hex_(text) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8);
  return bytes.map(function (b) {
    return ('0' + (b < 0 ? b + 256 : b).toString(16)).slice(-2);
  }).join('');
}

function hashPassword_(password, salt) {
  var h = sha256Hex_(salt + ':' + password);
  for (var i = 0; i < HASH_ROUNDS; i++) h = sha256Hex_(h + ':' + salt);
  return h;
}

function safeEquals_(a, b) {
  a = String(a);
  b = String(b);
  if (a.length !== b.length) return false;
  var diff = 0;
  for (var i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Mengembalikan pesan kesalahan, atau null jika kata sandi memenuhi syarat. */
function validatePassword_(password, email) {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LEN) {
    return 'Kata sandi minimal ' + MIN_PASSWORD_LEN + ' karakter.';
  }
  if (password.length > MAX_PASSWORD_LEN) return 'Kata sandi terlalu panjang.';
  if (!/[A-Za-z]/.test(password) || !/[0-9\\W_]/.test(password)) {
    return 'Kata sandi harus memuat huruf dan minimal satu angka atau simbol.';
  }
  const local = String(email || '').toLowerCase().split('@')[0];
  if (local.length >= 4 && password.toLowerCase().indexOf(local) !== -1) {
    return 'Kata sandi tidak boleh memuat bagian nama email.';
  }
  return null;
}

function setAdminCredentials_(email, password) {
  const e = String(email || '').trim().toLowerCase();
  if (!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(e)) throw new Error('Format email tidak valid.');
  const err = validatePassword_(password, e);
  if (err) throw new Error(err);
  const salt = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '');
  const p = props_();
  p.setProperty('ADMIN_EMAIL', e);
  p.setProperty('PASSWORD_SALT', salt);
  p.setProperty('PASSWORD_HASH', hashPassword_(password, salt));
  p.deleteProperty('API_TOKEN');          // token statis versi 2 dihapus
  p.deleteProperty('SESSIONS');           // cabut semua sesi lama
  p.deleteProperty('LOGIN_FAILS');
  p.deleteProperty('LOGIN_LOCK_UNTIL');
}

function readSessions_() {
  try {
    const raw = props_().getProperty('SESSIONS');
    const o = raw ? JSON.parse(raw) : {};
    return (o && typeof o === 'object' && !Array.isArray(o)) ? o : {};
  } catch (err) {
    return {};
  }
}

function writeSessions_(o) {
  props_().setProperty('SESSIONS', JSON.stringify(o));
}

function pruneSessions_(sessions, now) {
  Object.keys(sessions).forEach(function (k) {
    if (!(sessions[k] > now)) delete sessions[k];
  });
  const keys = Object.keys(sessions).sort(function (x, y) { return sessions[x] - sessions[y]; });
  while (keys.length > MAX_SESSIONS) delete sessions[keys.shift()];
  return sessions;
}

function createSession_() {
  const token = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '');
  const now = Date.now();
  const sessions = pruneSessions_(readSessions_(), now);
  sessions[sha256Hex_(token)] = now + SESSION_TTL_MS;
  writeSessions_(pruneSessions_(sessions, now));
  return { token: token, expiresAt: now + SESSION_TTL_MS };
}

/** Memeriksa token sesi. Hanya hash token yang disimpan di server. */
function checkSession_(token) {
  if (typeof token !== 'string' || token.length < 32 || token.length > 200) return { ok: false };
  const hash = sha256Hex_(token);
  const exp = readSessions_()[hash];
  if (!exp || !(exp > Date.now())) return { ok: false };
  return { ok: true, hash: hash };
}

function loginLockResponse_() {
  const until = Number(props_().getProperty('LOGIN_LOCK_UNTIL') || 0);
  const now = Date.now();
  if (until > now) {
    return fail_('LOCKED', 'Terlalu banyak percobaan gagal. Coba lagi dalam ' + Math.ceil((until - now) / 60000) + ' menit.');
  }
  return null;
}

/** Mencatat satu kegagalan; mengembalikan sisa percobaan, atau 0 jika kini terkunci. */
function registerLoginFailure_() {
  const p = props_();
  const fails = (Number(p.getProperty('LOGIN_FAILS')) || 0) + 1;
  if (fails >= MAX_LOGIN_FAILS) {
    p.setProperty('LOGIN_LOCK_UNTIL', String(Date.now() + LOCK_MS));
    p.setProperty('LOGIN_FAILS', '0');
    return 0;
  }
  p.setProperty('LOGIN_FAILS', String(fails));
  return MAX_LOGIN_FAILS - fails;
}

function clearLoginFailures_() {
  props_().deleteProperty('LOGIN_FAILS');
  props_().deleteProperty('LOGIN_LOCK_UNTIL');
}

function failedLoginResponse_(message) {
  const left = registerLoginFailure_();
  if (left === 0) return fail_('LOCKED', 'Terlalu banyak percobaan gagal. Login dikunci selama 15 menit.');
  return fail_('LOGIN_FAILED', message + ' (sisa percobaan: ' + left + ')');
}

function handleLogin_(ss, body) {
  const p = props_();
  const adminEmail = p.getProperty('ADMIN_EMAIL');
  const hash = p.getProperty('PASSWORD_HASH');
  const salt = p.getProperty('PASSWORD_SALT');
  if (!adminEmail || !hash || !salt) {
    return fail_('CREDENTIALS_NOT_CONFIGURED',
      'Akun admin belum diatur di server. Di Spreadsheet, buka menu MotoTeach > Atur email & kata sandi admin.');
  }
  const locked = loginLockResponse_();
  if (locked) return locked;

  const email = String(body.email || '').trim().toLowerCase();
  const password = typeof body.password === 'string' ? body.password.slice(0, MAX_PASSWORD_LEN) : '';
  // Hash selalu dihitung agar waktu respons tidak membocorkan apakah email benar.
  const computed = hashPassword_(password, salt);
  const emailOk = safeEquals_(email, adminEmail);
  const passOk = safeEquals_(computed, hash);

  if (emailOk && passOk) {
    clearLoginFailures_();
    const s = createSession_();
    appendLog_(ss, 'login', 'berhasil', 'OK');
    return ok_({ code: 'OK', message: 'Login berhasil', token: s.token, expiresAt: s.expiresAt, email: adminEmail });
  }
  appendLog_(ss, 'login', 'gagal', 'FAILED');
  return failedLoginResponse_('Email atau kata sandi salah.');
}

function handleLogout_(ss, session) {
  const sessions = readSessions_();
  delete sessions[session.hash];
  writeSessions_(sessions);
  return ok_({ code: 'OK', message: 'Logout berhasil' });
}

function handleChangePassword_(ss, body, session) {
  const p = props_();
  const adminEmail = p.getProperty('ADMIN_EMAIL');
  const salt = p.getProperty('PASSWORD_SALT');
  const hash = p.getProperty('PASSWORD_HASH');
  if (!adminEmail || !salt || !hash) return fail_('CREDENTIALS_NOT_CONFIGURED', 'Akun admin belum diatur di server.');

  const locked = loginLockResponse_();
  if (locked) return locked;

  const oldPw = typeof body.oldPassword === 'string' ? body.oldPassword.slice(0, MAX_PASSWORD_LEN) : '';
  const newPw = typeof body.newPassword === 'string' ? body.newPassword : '';
  if (!safeEquals_(hashPassword_(oldPw, salt), hash)) {
    appendLog_(ss, 'changePassword', 'kata sandi lama salah', 'FAILED');
    return failedLoginResponse_('Kata sandi lama salah.');
  }
  const err = validatePassword_(newPw, adminEmail);
  if (err) return fail_('WEAK_PASSWORD', err);
  if (newPw === oldPw) return fail_('WEAK_PASSWORD', 'Kata sandi baru harus berbeda dari kata sandi lama.');

  const newSalt = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '');
  p.setProperty('PASSWORD_SALT', newSalt);
  p.setProperty('PASSWORD_HASH', hashPassword_(newPw, newSalt));
  clearLoginFailures_();

  // Cabut semua sesi lain; pertahankan sesi yang sedang dipakai.
  const sessions = readSessions_();
  const keep = {};
  if (sessions[session.hash]) keep[session.hash] = sessions[session.hash];
  writeSessions_(keep);

  appendLog_(ss, 'changePassword', 'berhasil; sesi lain dicabut', 'OK');
  return ok_({ code: 'OK', message: 'Kata sandi berhasil diperbarui. Sesi di perangkat lain dikeluarkan.' });
}

/* ------------------------------------------------------------------ */
/* ENDPOINT                                                            */
/* ------------------------------------------------------------------ */

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'health';
  if (action === 'health') {
    return respond_({
      success: true, code: 'OK', message: 'MotoTeach Google Apps Script API aktif',
      apiVersion: API_VERSION, credentialsConfigured: !!props_().getProperty('PASSWORD_HASH')
    });
  }
  return fail_('METHOD_NOT_ALLOWED', 'Gunakan permintaan POST untuk operasi ini.');
}

function doPost(e) {
  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return fail_('INVALID_REQUEST', 'Permintaan tidak valid (bukan JSON).');
  }
  if (!body || typeof body !== 'object') return fail_('INVALID_REQUEST', 'Permintaan tidak valid.');

  var session = null;
  if (body.action === 'login') {
    const pre = loginLockResponse_();    // tolak cepat saat terkunci, tanpa menahan kunci skrip
    if (pre) return pre;
  } else {
    session = checkSession_(body.token);
    if (!session.ok) return fail_('AUTH_FAILED', 'Sesi login tidak valid atau sudah berakhir. Silakan login ulang.');
  }

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return fail_('BUSY', 'Server sedang memproses permintaan lain. Coba lagi sebentar.');
  }

  try {
    const ss = getSS_();
    if (body.action === 'login') return handleLogin_(ss, body);
    if (body.action === 'logout') return handleLogout_(ss, session);
    if (body.action === 'changePassword') return handleChangePassword_(ss, body, session);
    if (body.action === 'verify') return handleVerify_(ss);
    if (body.action === 'pullAll') return handlePull_(ss);
    if (body.action === 'syncAll') return handleSync_(ss, body);
    return fail_('INVALID_REQUEST', 'Aksi tidak dikenali.');
  } catch (err) {
    return fail_('SERVER_ERROR', 'Kesalahan server: ' + String(err));
  } finally {
    lock.releaseLock();
  }
}

function handleVerify_(ss) {
  const snap = readSnapshot_(ss);
  return ok_({ code: 'OK', message: 'Sesi login valid. Terhubung ke Spreadsheet "' + ss.getName() + '".',
    version: snap.state === 'OK' ? snap.version : 0, apiVersion: API_VERSION });
}

function handlePull_(ss) {
  const snap = readSnapshot_(ss);
  if (snap.state === 'EMPTY') {
    return ok_({ code: 'EMPTY', message: 'Database cloud belum berisi data.', version: 0 });
  }
  if (snap.state === 'CORRUPT') {
    return fail_('SERVER_CORRUPT', snap.message);
  }
  return ok_({ code: 'OK', message: 'Data berhasil dimuat', data: snap.data, version: snap.version, updatedAt: snap.updatedAt });
}

function handleSync_(ss, body) {
  const payload = body.payload;
  const check = validatePayload_(payload);
  if (!check.ok) return fail_('INVALID_REQUEST', check.message);

  const force = body.force === true;
  const baseVersion = (body.baseVersion === undefined || body.baseVersion === null) ? null : Number(body.baseVersion);
  const current = readSnapshot_(ss);
  const curVersion = current.state === 'OK' ? current.version : 0;

  if (!force) {
    if (current.state === 'CORRUPT') {
      return fail_('SERVER_CORRUPT', current.message);
    }
    if (baseVersion !== curVersion) {
      return respond_({ success: false, code: 'CONFLICT', currentVersion: curVersion,
        updatedAt: current.state === 'OK' ? current.updatedAt : null,
        message: 'Data cloud sudah berubah sejak sinkronisasi terakhir perangkat ini.' });
    }
    if (current.state === 'OK' && hasContent_(current.data) && !hasContent_(payload) && body.allowEmpty !== true) {
      return fail_('EMPTY_PAYLOAD', 'Ditolak: data yang dikirim kosong, sedangkan cloud berisi data. Gunakan Pull, atau timpa paksa secara sadar dari Pengaturan.');
    }
  }

  if (force && current.state !== 'EMPTY') backupToPrev_(ss);

  const now = nowStamp_();
  const newVersion = curVersion + 1;
  writeSnapshot_(ss, JSON.stringify(payload), newVersion, now);

  const mirrorErrors = [];
  MIRRORS.forEach(function (m) {
    try {
      mirrorSheet_(ss, m[0], Array.isArray(payload[m[1]]) ? payload[m[1]] : [], now);
    } catch (err) {
      mirrorErrors.push(m[0] + ': ' + String(err));
    }
  });

  appendLog_(ss, force ? 'syncAll(force)' : 'syncAll', 'versi ' + newVersion,
    mirrorErrors.length ? 'MIRROR_ERROR' : 'OK');

  return ok_({ code: 'OK', version: newVersion, updatedAt: now, mirrorErrors: mirrorErrors,
    message: 'Tersinkronisasi ke Google Sheets pada ' + now });
}

/* ------------------------------------------------------------------ */
/* SNAPSHOT                                                            */
/* ------------------------------------------------------------------ */

function readSnapshot_(ss) {
  const sheet = ss.getSheetByName('RawSnapshot');
  if (!sheet || sheet.getLastRow() < 2) return { state: 'EMPTY' };

  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).getValues();
  var meta = null;
  const chunks = [];
  values.forEach(function (r) {
    const key = String(r[0]);
    if (key === META_KEY) {
      try { meta = JSON.parse(String(r[1])); } catch (err) { meta = null; }
    } else if (key === SNAP_KEY) {
      chunks.push({ idx: 0, text: String(r[1] === null ? '' : r[1]), at: String(r[2]) });
    } else if (key.indexOf(SNAP_KEY + '#') === 0) {
      chunks.push({ idx: parseInt(key.split('#')[1], 10) || 0, text: String(r[1] === null ? '' : r[1]), at: String(r[2]) });
    }
  });

  if (!chunks.length) return { state: 'EMPTY' };
  chunks.sort(function (a, b) { return a.idx - b.idx; });

  if (meta && meta.chunks && Number(meta.chunks) !== chunks.length) {
    return { state: 'CORRUPT', message: 'Snapshot cloud tidak lengkap (jumlah potongan tidak cocok). Cek sheet RawSnapshot dan RawSnapshotPrev.' };
  }

  const json = chunks.map(function (c) { return c.text; }).join('');
  if (!json) return { state: 'EMPTY' };

  var data;
  try {
    data = JSON.parse(json);
  } catch (err) {
    return { state: 'CORRUPT', message: 'Snapshot cloud tidak dapat dibaca (JSON rusak). Cek sheet RawSnapshot dan RawSnapshotPrev.' };
  }
  return {
    state: 'OK',
    data: data,
    version: meta ? (Number(meta.version) || 0) : 0,
    updatedAt: meta ? meta.updatedAt : chunks[0].at
  };
}

function writeSnapshot_(ss, json, version, now) {
  const sheet = ensureSheet_(ss, 'RawSnapshot');
  const chunks = [];
  for (var i = 0; i < json.length; i += CHUNK_SIZE) chunks.push(json.substring(i, i + CHUNK_SIZE));

  const rows = [[META_KEY, JSON.stringify({ version: version, updatedAt: now, chunks: chunks.length, chars: json.length }), now]];
  chunks.forEach(function (c, i) {
    rows.push([SNAP_KEY + '#' + pad4_(i + 1), c, now]);
  });

  ensureRows_(sheet, rows.length + 1);
  const range = sheet.getRange(2, 1, rows.length, 3);
  range.setNumberFormat('@');          // paksa teks agar potongan JSON tidak diubah menjadi angka/tanggal
  range.setValues(rows);

  const last = sheet.getLastRow();
  if (last > rows.length + 1) {          // hapus sisa potongan lama setelah data baru tertulis
    sheet.getRange(rows.length + 2, 1, last - (rows.length + 1), 3).clearContent();
  }
}

function backupToPrev_(ss) {
  const src = ss.getSheetByName('RawSnapshot');
  if (!src || src.getLastRow() < 2) return;
  const dst = ensureSheet_(ss, 'RawSnapshotPrev');
  const vals = src.getRange(2, 1, src.getLastRow() - 1, 3).getValues();
  if (dst.getLastRow() > 1) dst.getRange(2, 1, dst.getLastRow() - 1, 3).clearContent();
  ensureRows_(dst, vals.length + 1);
  const range = dst.getRange(2, 1, vals.length, 3);
  range.setNumberFormat('@');
  range.setValues(vals);
}

/* ------------------------------------------------------------------ */
/* SHEET RELASIONAL (cermin untuk dibaca manusia)                      */
/* ------------------------------------------------------------------ */

function mirrorSheet_(ss, sheetName, records, now) {
  const sheet = ensureSheet_(ss, sheetName);
  if (sheet.getLastRow() > 1) sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).clearContent();
  if (!records.length) return;
  const rows = records.map(function (item) {
    var text = JSON.stringify(item);
    if (text.length > 49000) {
      text = JSON.stringify({ id: item && item.id, catatan: 'Data terlalu panjang untuk satu sel; lihat sheet RawSnapshot.' });
    }
    return [item && item.id ? item.id : '', text, now];
  });
  ensureRows_(sheet, rows.length + 1);
  const range = sheet.getRange(2, 1, rows.length, 3);
  range.setNumberFormat('@');
  range.setValues(rows);
}

/* ------------------------------------------------------------------ */
/* UTILITAS                                                            */
/* ------------------------------------------------------------------ */

function getSS_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Script ini tidak terikat ke Spreadsheet. Buat dari Spreadsheet: Ekstensi > Apps Script.');
  return ss;
}

function ensureSheet_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    if (name === 'RawSnapshot' || name === 'RawSnapshotPrev') sheet.appendRow(['Key', 'JsonData', 'UpdatedAt']);
    else if (name === 'ActivityLogs') sheet.appendRow(['ID', 'Timestamp', 'Action', 'Details', 'Status']);
    else sheet.appendRow(['ID', 'PayloadJSON', 'UpdatedAt']);
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight('bold').setBackground('#173B70').setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function ensureRows_(sheet, neededRows) {
  const max = sheet.getMaxRows();
  if (max < neededRows) sheet.insertRowsAfter(max, neededRows - max);
}

function appendLog_(ss, action, details, status) {
  try {
    const sheet = ensureSheet_(ss, 'ActivityLogs');
    sheet.appendRow([Utilities.getUuid(), nowStamp_(), action, details, status]);
    const last = sheet.getLastRow();
    if (last > MAX_LOG_ROWS + 100) sheet.deleteRows(2, last - MAX_LOG_ROWS - 1);
  } catch (err) {
    // Log bersifat pelengkap; kegagalan mencatat log tidak boleh menggagalkan sinkronisasi.
  }
}

function validatePayload_(p) {
  if (!p || typeof p !== 'object' || Array.isArray(p)) return { ok: false, message: 'Payload harus berupa objek.' };
  if (!p.teacher || typeof p.teacher !== 'object') return { ok: false, message: 'Payload tidak memiliki profil guru (teacher).' };
  for (var i = 0; i < CONTENT_KEYS.length; i++) {
    const k = CONTENT_KEYS[i];
    if (p[k] !== undefined && !Array.isArray(p[k])) return { ok: false, message: 'Koleksi "' + k + '" harus berupa array.' };
  }
  if (JSON.stringify(p).length > MAX_PAYLOAD_CHARS) return { ok: false, message: 'Payload terlalu besar.' };
  return { ok: true };
}

function hasContent_(p) {
  if (!p) return false;
  return CONTENT_KEYS.some(function (k) { return Array.isArray(p[k]) && p[k].length > 0; });
}

function nowStamp_() {
  return Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

function pad4_(n) {
  return ('0000' + n).slice(-4);
}

function ok_(obj) {
  obj.success = true;
  return respond_(obj);
}

function fail_(code, message) {
  return respond_({ success: false, code: code, message: message });
}

function respond_(obj) {
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
  | 'tp'
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
  confirmLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => readAuthSession() !== null);
  const [loginNotice, setLoginNotice] = useState('');

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(APP_CONFIG.configKey);
      const parsed = saved ? JSON.parse(saved) : {};
      delete parsed.apiToken; // sisa token statis versi lama: dibuang
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        appsScriptUrl: readUrlOverride() || APP_CONFIG.defaultAppsScriptUrl,
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [db, setDb] = useState<WorkspaceDatabase>(() => {
    try {
      const saved = localStorage.getItem(APP_CONFIG.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return normalizeWorkspace(parsed) || parsed;
      }
    } catch {}
    return createEmptyDatabase();
  });

  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Kategori menu sidebar yang sedang dilipat (diingat di browser ini)
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(APP_CONFIG.navGroupsKey);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  });
  const toggleGroup = (name: string) => {
    const next = { ...collapsedGroups, [name]: !collapsedGroups[name] };
    setCollapsedGroups(next);
    writeStored(APP_CONFIG.navGroupsKey, JSON.stringify(next));
  };

  // Tutup menu profil saat klik di luar menu atau menekan Escape
  useEffect(() => {
    if (!profileMenuOpen) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) setProfileMenuOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProfileMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [profileMenuOpen]);
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
  const [printPreview, setPrintPreview] = useState<{ open: boolean; title: string; content: React.ReactNode; kop?: boolean }>({
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
    }, type === 'error' ? 9000 : 4000);
  };

  const askConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    opts?: { confirmLabel?: string; cancelLabel?: string; onCancel?: () => void }
  ) => {
    setConfirmModal({ open: true, title, message, onConfirm, ...opts });
  };

  useEffect(() => {
    try {
      const { appsScriptUrl: _urlTidakDisimpan, ...settingsTanpaUrl } = settings; // URL punya tempat sendiri (penggantian)
      localStorage.setItem(APP_CONFIG.configKey, JSON.stringify(settingsTanpaUrl));
    } catch {}
  }, [settings]);

  // ==========================================================================
  // SINKRONISASI CLOUD (Fase 2a)
  // Prinsip: kegagalan membaca cloud TIDAK PERNAH dianggap "cloud kosong".
  // Cloud hanya ditulis jika (a) cloud terbukti kosong, atau (b) versi cloud masih
  // sama dengan versi dasar perangkat ini. Selain itu pengguna diminta memilih.
  // ==========================================================================
  const dbRef = useRef<WorkspaceDatabase>(db);
  const settingsRef = useRef<AppSettings>(settings);
  dbRef.current = db;
  settingsRef.current = settings;

  const cloudVersionRef = useRef<number | null>(readStoredNumber(APP_CONFIG.cloudVersionKey));
  const dirtyRef = useRef<boolean>(readStoredFlag(APP_CONFIG.dirtyKey));
  const changeCounterRef = useRef(0);
  const syncingRef = useRef(false);
  const queuedRef = useRef(false);
  const pausedRef = useRef<'auth' | 'empty' | 'conflict' | null>(null);
  const lastSyncOkRef = useRef(true);
  const allowEmptyRef = useRef(false);
  const storageWarnedRef = useRef(false);
  const lastErrorToastRef = useRef(0);
  const [syncDetail, setSyncDetail] = useState('');

  // Bersihkan sisa login lokal versi lama (hash kata sandi di browser) saat aplikasi dimuat
  useEffect(() => {
    APP_CONFIG.legacyKeys.forEach((k) => {
      try {
        localStorage.removeItem(k);
        sessionStorage.removeItem(k);
      } catch {
        // abaikan
      }
    });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(db));
      storageWarnedRef.current = false;
    } catch {
      if (!storageWarnedRef.current) {
        storageWarnedRef.current = true;
        showToast(
          'error',
          'Penyimpanan di browser GAGAL (kuota penuh atau mode privat). Perubahan terbaru bisa hilang jika halaman ditutup. Segera unduh backup JSON di Pengaturan.'
        );
      }
    }
  }, [db]);

  const markDirty = (v: boolean) => {
    dirtyRef.current = v;
    writeStored(APP_CONFIG.dirtyKey, v ? '1' : null);
  };

  const setCloudVersion = (v: number | null | undefined) => {
    const n = typeof v === 'number' && Number.isFinite(v) ? v : null;
    cloudVersionRef.current = n;
    writeStored(APP_CONFIG.cloudVersionKey, n === null ? null : String(n));
  };

  const markSynced = () => {
    lastSyncOkRef.current = true;
    setSyncStatus('connected');
    setSyncDetail('');
    setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
  };

  const notifySyncError = (detail: string, forceToast = false) => {
    lastSyncOkRef.current = false;
    setSyncStatus('error');
    setSyncDetail(detail);
    const now = Date.now();
    if (forceToast || now - lastErrorToastRef.current > 15000) {
      lastErrorToastRef.current = now;
      showToast('error', detail);
    }
  };

  const adoptCloud = (remote: WorkspaceDatabase, version: number) => {
    dbRef.current = remote;
    setDb(remote);
    setCloudVersion(version);
    markDirty(false);
    markSynced();
  };

  // Keluar dari aplikasi. Data lokal TIDAK dihapus; hanya sesi login yang dibuang.
  const performLogout = (notice?: string) => {
    clearAuthSession();
    pausedRef.current = null;
    setSyncStatus('idle');
    setSyncDetail('');
    setLoginNotice(notice || '');
    setIsAuthenticated(false);
  };

  // Mengembalikan pesan kesalahan, atau null jika berhasil.
  const handleLogin = async (email: string, password: string, remember: boolean): Promise<string | null> => {
    const url = settingsRef.current.appsScriptUrl || APP_CONFIG.defaultAppsScriptUrl;
    let res = await apiService.login(url, email, password);
    let recovered = false;
    // URL tersimpan tidak bisa dihubungi (404, jaringan, bukan JSON): coba sekali dengan URL bawaan aplikasi
    if (!res.success && isConnectionFailure(res.code) && url !== APP_CONFIG.defaultAppsScriptUrl) {
      const fallback = await apiService.login(APP_CONFIG.defaultAppsScriptUrl, email, password);
      if (fallback.success) {
        recovered = true;
      } else if (isConnectionFailure(fallback.code)) {
        fallback.message = `Tidak dapat menghubungi server, baik dengan URL tersimpan maupun URL bawaan. ${fallback.message}`;
      }
      res = fallback;
    }
    if (!res.success || !res.token || typeof res.expiresAt !== 'number') {
      return res.message || 'Login gagal. Silakan coba lagi.';
    }
    const saved = saveAuthSession({ token: res.token, email: res.email || email, expiresAt: res.expiresAt }, remember);
    if (!saved) return 'Browser tidak dapat menyimpan sesi login (mode privat atau penyimpanan penuh).';
    pausedRef.current = null;
    setLoginNotice('');
    setIsAuthenticated(true);
    showToast('success', 'Selamat datang kembali di MotoTeach Workspace!');
    if (recovered) {
      writeStored(APP_CONFIG.urlOverrideKey, null);
      const next = { ...settingsRef.current, appsScriptUrl: APP_CONFIG.defaultAppsScriptUrl };
      settingsRef.current = next;
      setSettings(next);
      showToast('info', 'URL Web App yang tersimpan tidak dapat dihubungi, jadi aplikasi kembali memakai URL bawaan.');
    }
    return null;
  };

  const handleLogout = () => {
    const token = getAuthToken();
    const url = settingsRef.current.appsScriptUrl;
    performLogout();
    if (token && url) {
      // Pencabutan sesi di server dilakukan sebisanya; sesi tetap kedaluwarsa otomatis di server.
      void apiService.logout(url, token);
    }
  };

  const handleChangePassword = async (oldPwd: string, newPwd: string): Promise<{ ok: boolean; message: string }> => {
    const url = settingsRef.current.appsScriptUrl;
    const res = await apiService.changePassword(url, getAuthToken(), oldPwd, newPwd);
    if (res.code === 'AUTH_FAILED') {
      performLogout('Sesi login berakhir. Silakan login kembali.');
      return { ok: false, message: res.message };
    }
    return { ok: res.success, message: res.message };
  };

  const handleFailure = (res: CloudResponse, manual: boolean) => {
    if (res.code === 'AUTH_FAILED') {
      performLogout('Sesi login berakhir atau dicabut. Silakan login kembali. Data lokal Anda tetap tersimpan di perangkat ini.');
      return;
    }
    if (res.code === 'EMPTY_PAYLOAD') {
      pausedRef.current = 'empty';
      notifySyncError(res.message, true);
      return;
    }
    const safe =
      res.code === 'NETWORK' || res.code === 'TIMEOUT' || res.code === 'INVALID_RESPONSE'
        ? ' Data tetap aman di perangkat ini dan tidak ada yang ditimpa di cloud.'
        : '';
    notifySyncError((res.message || 'Sinkronisasi gagal.') + safe, manual);
  };

  const resolveConflict = (remote: WorkspaceDatabase, remoteVersion: number) => {
    pausedRef.current = 'conflict';
    lastSyncOkRef.current = false;
    setSyncStatus('error');
    setSyncDetail('Data lokal dan cloud berbeda. Sinkronisasi ditunda sampai Anda memilih.');
    askConfirm(
      'Data Lokal dan Cloud Berbeda',
      'Perubahan di perangkat ini belum tersinkron, sedangkan data di Google Sheets sudah berubah (mungkin dari perangkat lain). ' +
        'Pilih "Pakai Data Cloud" untuk mengganti data di perangkat ini; salinan data lokal akan diunduh otomatis sebagai backup. ' +
        'Pilih "Simpan Lokal" untuk tetap memakai data lokal: cloud TIDAK akan ditimpa dan sinkronisasi otomatis ditunda sampai Anda menyelesaikannya di Pengaturan & Backup.',
      () => {
        if (!downloadDatabaseFile(dbRef.current, 'MotoTeach_Backup_Lokal_Sebelum_Ganti')) {
          showToast('error', 'Gagal membuat backup lokal, penggantian data dibatalkan.');
          return;
        }
        adoptCloud(remote, remoteVersion);
        pausedRef.current = null;
        showToast('info', 'Data cloud dipakai. Salinan data lokal sudah diunduh sebagai backup.');
      },
      { confirmLabel: 'Pakai Data Cloud', cancelLabel: 'Simpan Lokal' }
    );
  };

  // Dipanggil saat syncingRef sudah true.
  const pushLoop = async (manual: boolean, force: boolean) => {
    const s = settingsRef.current;
    let useForce = force;
    let last: CloudResponse | null = null;
    do {
      queuedRef.current = false;
      const counterBefore = changeCounterRef.current;
      const res = await apiService.pushDatabase(s.appsScriptUrl, dbRef.current, getAuthToken(), cloudVersionRef.current, {
        force: useForce,
        allowEmpty: allowEmptyRef.current,
      });
      useForce = false;
      last = res;
      if (!res.success) break;
      allowEmptyRef.current = false;
      setCloudVersion(res.version);
      if (changeCounterRef.current === counterBefore) markDirty(false);
      markSynced();
    } while (queuedRef.current);

    if (last && !last.success) {
      if (last.code === 'CONFLICT') {
        await reconcile(manual, false);
        return;
      }
      handleFailure(last, manual);
      return;
    }
    if (manual) showToast('success', 'Data berhasil disinkronkan ke Google Sheets!');
  };

  // Tarik data cloud lalu putuskan tindakan yang aman. Dipanggil saat syncingRef sudah true.
  const reconcile = async (manual: boolean, allowPush: boolean) => {
    const s = settingsRef.current;
    const pull = await apiService.pullDatabase(s.appsScriptUrl, getAuthToken());

    if (pull.code === 'EMPTY') {
      // Cloud TERBUKTI kosong (bukan gagal dibaca): aman untuk inisialisasi.
      setCloudVersion(0);
      if (!hasUserData(dbRef.current)) {
        markSynced();
        if (manual) showToast('info', 'Cloud dan perangkat ini sama-sama masih kosong.');
        return;
      }
      if (!allowPush) {
        notifySyncError('Data cloud berubah saat sinkronisasi berlangsung. Coba sinkronkan lagi.', manual);
        return;
      }
      await pushLoop(manual, false);
      return;
    }

    if (!pull.success) {
      handleFailure(pull, manual);
      return;
    }

    const remote = normalizeWorkspace(pull.data);
    if (!remote) {
      notifySyncError('Format data di cloud tidak dikenali. Tidak ada data yang diubah.', true);
      return;
    }

    const remoteVersion = typeof pull.version === 'number' ? pull.version : 0;
    const localVersion = cloudVersionRef.current;
    const local = dbRef.current;

    if (sameContent(remote, local)) {
      setCloudVersion(remoteVersion);
      markDirty(false);
      markSynced();
      if (manual) showToast('success', 'Data perangkat ini sudah sama dengan cloud.');
      return;
    }

    const localNeedsPush = dirtyRef.current || (localVersion === null && hasUserData(local));
    if (!localNeedsPush) {
      adoptCloud(remote, remoteVersion);
      if (manual) showToast('success', 'Data terbaru dari Google Sheets berhasil dimuat.');
      return;
    }

    if (localVersion !== null && localVersion === remoteVersion && allowPush) {
      await pushLoop(manual, false);
      return;
    }

    resolveConflict(remote, remoteVersion);
  };

  const withSyncLock = async (fn: () => Promise<void>, onBusy?: () => void) => {
    if (syncingRef.current) {
      queuedRef.current = true;
      if (onBusy) onBusy();
      return;
    }
    syncingRef.current = true;
    setSyncStatus('syncing');
    try {
      await fn();
    } catch (err: any) {
      notifySyncError(`Terjadi kesalahan tak terduga saat sinkronisasi: ${err?.message || String(err)}`, true);
    } finally {
      syncingRef.current = false;
      if (queuedRef.current && dirtyRef.current && !pausedRef.current && lastSyncOkRef.current) {
        queuedRef.current = false;
        setTimeout(() => {
          void autoSyncAfterEdit();
        }, 0);
      }
    }
  };

  const runSync = (manual: boolean): Promise<void> => {
    if (!settingsRef.current.appsScriptUrl) {
      if (manual) showToast('error', 'URL Google Apps Script belum diisi.');
      return Promise.resolve();
    }
    if (manual) pausedRef.current = null;
    return withSyncLock(
      () => reconcile(manual, true),
      () => {
        if (manual) showToast('info', 'Sinkronisasi sedang berjalan...');
      }
    );
  };

  const autoSyncAfterEdit = async () => {
    if (!settingsRef.current.appsScriptUrl) return;
    if (pausedRef.current) {
      notifySyncError(
        'Sinkronisasi otomatis ditunda. Perubahan tetap tersimpan di perangkat ini. Buka Pengaturan & Backup untuk menyelesaikannya.'
      );
      return;
    }
    if (cloudVersionRef.current === null) {
      // Belum pernah memastikan status cloud: wajib tarik dulu, jangan langsung menulis.
      await runSync(false);
      return;
    }
    await withSyncLock(() => pushLoop(false, false));
  };

  const handlePullFromCloud = async () => {
    const s = settingsRef.current;
    if (!s.appsScriptUrl) {
      showToast('error', 'Masukkan URL Apps Script terlebih dahulu');
      return;
    }
    await withSyncLock(
      async () => {
        const pull = await apiService.pullDatabase(s.appsScriptUrl, getAuthToken());
        if (pull.code === 'EMPTY') {
          setCloudVersion(0);
          markSynced();
          showToast('info', 'Cloud masih kosong. Tidak ada data yang ditarik.');
          return;
        }
        if (!pull.success) {
          handleFailure(pull, true);
          return;
        }
        const remote = normalizeWorkspace(pull.data);
        if (!remote) {
          notifySyncError('Format data di cloud tidak dikenali. Tidak ada data yang diubah.', true);
          return;
        }
        const remoteVersion = typeof pull.version === 'number' ? pull.version : 0;
        const apply = () => {
          if (dirtyRef.current && !downloadDatabaseFile(dbRef.current, 'MotoTeach_Backup_Lokal_Sebelum_Pull')) {
            showToast('error', 'Gagal membuat backup lokal, penarikan data dibatalkan.');
            return;
          }
          adoptCloud(remote, remoteVersion);
          pausedRef.current = null;
          showToast('success', 'Data berhasil ditarik dari Google Sheets!');
        };
        if (dirtyRef.current && !sameContent(remote, dbRef.current)) {
          setSyncStatus('idle');
          askConfirm(
            'Ganti Data Lokal dengan Data Cloud?',
            'Ada perubahan di perangkat ini yang belum tersinkron dan akan diganti oleh data cloud. Salinan data lokal akan diunduh otomatis sebagai backup.',
            apply,
            { confirmLabel: 'Ya, Ganti' }
          );
        } else {
          apply();
        }
      },
      () => showToast('info', 'Sinkronisasi sedang berjalan...')
    );
  };

  const handleForcePush = () => {
    const emptyWarning = hasUserData(dbRef.current)
      ? ''
      : ' PERINGATAN: data di perangkat ini KOSONG, sehingga cloud akan dikosongkan.';
    askConfirm(
      'Timpa Data Cloud dengan Data Lokal?',
      'Seluruh data di Google Sheets akan DIGANTI dengan data di perangkat ini, termasuk perubahan dari perangkat lain yang belum Anda ambil. ' +
        'Server menyimpan salinan data cloud sebelumnya di sheet RawSnapshotPrev. Lanjutkan hanya jika Anda yakin data di perangkat ini yang benar.' +
        emptyWarning,
      () => {
        pausedRef.current = null;
        void withSyncLock(
          () => pushLoop(true, true),
          () => showToast('info', 'Sinkronisasi sedang berjalan...')
        );
      },
      { confirmLabel: 'Ya, Timpa Cloud' }
    );
  };

  // Sinkronisasi otomatis saat login berhasil / aplikasi dibuka
  useEffect(() => {
    if (!isAuthenticated || !settings.appsScriptUrl || !settings.autoSyncOnLoad) return;
    void runSync(false);
  }, [isAuthenticated]);

  // Setelah kembali online, kirim perubahan yang tertunda
  useEffect(() => {
    const onOnline = () => {
      if (isAuthenticated && dirtyRef.current && !pausedRef.current) void autoSyncAfterEdit();
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [isAuthenticated]);

  const updateDatabase = async (updater: (prev: WorkspaceDatabase) => WorkspaceDatabase, toastMsg?: string) => {
    const nextDb = { ...updater(dbRef.current), lastUpdated: new Date().toISOString() };
    dbRef.current = nextDb;
    changeCounterRef.current += 1;
    markDirty(true);
    setDb(nextDb);
    if (toastMsg) showToast('success', toastMsg);
    await autoSyncAfterEdit();
  };

  const handleManualSync = () => runSync(true);

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
        { id: 'tp', label: 'Tujuan Pembelajaran (TP)', icon: <ListChecks size={18} />, badge: db.tps.length },
        { id: 'atp', label: 'Alur Tujuan (ATP)', icon: <GitCommitHorizontal size={18} />, badge: db.atps.length },
        { id: 'prota', label: 'Program Tahunan (PROTA)', icon: <CalendarRange size={18} /> },
        { id: 'promes', label: 'Program Semester (PROMES)', icon: <CalendarDays size={18} /> },
      ],
    },
    {
      group: 'PERANGKAT & PELAKSANAAN',
      items: [
        { id: 'modul_ajar', label: 'Perencanaan Pembelajaran', icon: <FileText size={18} />, badge: db.modules.length },
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

  // Saat berpindah halaman (mis. lewat tombol alur atau menu avatar), buka kategori yang memuat halaman itu
  useEffect(() => {
    const owner = navGroups.find((g) => g.items.some((i) => i.id === activePage));
    if (owner && collapsedGroups[owner.group]) {
      const next = { ...collapsedGroups, [owner.group]: false };
      setCollapsedGroups(next);
      writeStored(APP_CONFIG.navGroupsKey, JSON.stringify(next));
    }
  }, [activePage]);

  const alurCounts: AlurCounts = {
    cp: db.cps.length,
    analisis_cp: db.cpAnalyses.length,
    tp: db.tps.length,
    atp: db.atps.length,
  };

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
            counts={alurCounts}
            onNavigate={setActivePage}
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
            tps={db.tps}
            counts={alurCounts}
            dark={dark}
            onNavigate={setActivePage}
            onAddMany={(list) =>
              updateDatabase(
                (p) => ({ ...p, cpAnalyses: [...p.cpAnalyses, ...list] }),
                list.length > 1 ? `${list.length} baris analisis CP berhasil disimpan` : 'Analisis CP berhasil disimpan'
              )
            }
            onUpdate={(an) =>
              updateDatabase(
                (p) =>
                  resyncAtps(
                    { ...p, cpAnalyses: p.cpAnalyses.map((a) => (a.id === an.id ? an : a)) },
                    p.tps.filter((tp) => tp.analysisIds.includes(an.id)).map((tp) => tp.id)
                  ),
                'Analisis CP diperbarui'
              )
            }
            onDelete={(id) => {
              const used = db.tps.filter((tp) => tp.analysisIds.includes(id)).length;
              askConfirm(
                'Hapus Baris Analisis CP?',
                used > 0
                  ? `Baris analisis ini menjadi dasar ${used} Tujuan Pembelajaran. TP tidak ikut terhapus, tetapi tautannya ke analisis ini dilepas.`
                  : 'Baris analisis ini akan dihapus.',
                () =>
                  updateDatabase(
                    (p) =>
                      resyncAtps(
                        {
                          ...p,
                          cpAnalyses: p.cpAnalyses.filter((a) => a.id !== id),
                          tps: p.tps.map((tp) => ({ ...tp, analysisIds: tp.analysisIds.filter((x) => x !== id) })),
                        },
                        p.tps.filter((tp) => tp.analysisIds.includes(id)).map((tp) => tp.id)
                      ),
                    'Analisis CP dihapus'
                  )
              );
            }}
          />
        );
      case 'tp':
        return (
          <TPView
            tps={db.tps}
            analyses={db.cpAnalyses}
            subjects={db.subjects}
            atps={db.atps}
            counts={alurCounts}
            dark={dark}
            onNavigate={setActivePage}
            onAdd={(tp) => updateDatabase((p) => ({ ...p, tps: [...p.tps, tp] }), 'Tujuan Pembelajaran berhasil disimpan')}
            onUpdate={(tp) =>
              updateDatabase(
                (p) => resyncAtps({ ...p, tps: p.tps.map((x) => (x.id === tp.id ? tp : x)) }, [tp.id]),
                'Tujuan Pembelajaran diperbarui (ATP terkait ikut diselaraskan)'
              )
            }
            onDelete={(id) => {
              if (db.atps.some((a) => a.tpId === id)) {
                showToast('error', 'TP ini sudah dipakai di ATP. Hapus dari ATP terlebih dahulu.');
                return;
              }
              askConfirm('Hapus Tujuan Pembelajaran?', 'TP ini akan dihapus dari daftar TP.', () =>
                updateDatabase((p) => ({ ...p, tps: p.tps.filter((x) => x.id !== id) }), 'Tujuan Pembelajaran dihapus')
              );
            }}
          />
        );
      case 'atp':
        return (
          <ATPView
            atps={db.atps}
            tps={db.tps}
            subjects={db.subjects}
            analyses={db.cpAnalyses}
            settings={settings}
            dark={dark}
            counts={alurCounts}
            onNavigate={setActivePage}
            onAddMany={(items) =>
              updateDatabase(
                (p) => ({
                  ...p,
                  atps: [...p.atps, ...items.map((it, i) => ({ ...it, urutan: p.atps.length + i + 1 }))],
                }),
                items.length > 1 ? `${items.length} TP ditambahkan ke ATP` : 'TP ditambahkan ke ATP'
              )
            }
            onUpdate={(item) =>
              updateDatabase((p) => ({ ...p, atps: p.atps.map((a) => (a.id === item.id ? item : a)) }), 'Pengaturan ATP diperbarui')
            }
            onReorder={(nextAtps) => updateDatabase((p) => ({ ...p, atps: nextAtps }), 'Urutan ATP diperbarui')}
            onDelete={(id) =>
              askConfirm('Hapus dari ATP?', 'TP dilepas dari alur ini. TP tetap tersimpan di daftar Tujuan Pembelajaran.', () =>
                updateDatabase((p) => ({ ...p, atps: p.atps.filter((a) => a.id !== id) }), 'TP dihapus dari ATP')
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
            tps={db.tps}
            analyses={db.cpAnalyses}
            cps={db.cps}
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
              }, 'Perencanaan Pembelajaran berhasil disimpan!')
            }
            onDelete={(id) =>
              askConfirm('Hapus Perencanaan Pembelajaran?', 'Perencanaan pembelajaran yang dihapus tidak dapat dipulihkan.', () =>
                updateDatabase((p) => ({ ...p, modules: p.modules.filter((m) => m.id !== id) }), 'Perencanaan pembelajaran dihapus')
              )
            }
            onOpenPrint={(title, content, opts) => setPrintPreview({ open: true, title, content, kop: opts?.kop })}
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
            syncDetail={syncDetail}
            onUpdateSettings={(raw) => {
              // URL hanya disimpan sebagai "penggantian" bila sengaja berbeda dari URL bawaan aplikasi
              const typed = (raw.appsScriptUrl || '').trim();
              const isCustom = !!typed && typed !== APP_CONFIG.defaultAppsScriptUrl;
              writeStored(APP_CONFIG.urlOverrideKey, isCustom ? typed : null);
              const next = { ...raw, appsScriptUrl: isCustom ? typed : APP_CONFIG.defaultAppsScriptUrl };
              const connectionChanged = next.appsScriptUrl !== settings.appsScriptUrl;
              settingsRef.current = next;
              setSettings(next);
              pausedRef.current = null;
              showToast('success', 'Pengaturan workspace disimpan');
              if (connectionChanged && next.appsScriptUrl) {
                setTimeout(() => {
                  void runSync(false);
                }, 0);
              }
            }}
            accountEmail={readAuthSession()?.email || ''}
            onChangePassword={handleChangePassword}
            onTestConnection={async (url) => {
              const res = await apiService.testConnection(url, getAuthToken());
              if (res.ok) {
                showToast('success', `${res.message} (${res.latencyMs} ms)`);
              } else {
                showToast('error', res.message);
              }
            }}
            onSyncNow={handleManualSync}
            onPullFromCloud={handlePullFromCloud}
            onForcePush={handleForcePush}
            onRestoreDatabase={(restored) =>
              askConfirm(
                'Pulihkan Database dari File Backup?',
                'Data saat ini akan digantikan oleh data dari file backup JSON yang Anda pilih. Lanjutkan?',
                () => {
                  updateDatabase(() => normalizeWorkspace(restored) || restored, 'Pemulihan database dari backup JSON berhasil!');
                }
              )
            }
            onResetLocal={() =>
              askConfirm(
                'Reset Seluruh Data Lokal?',
                'Semua data di browser ini akan dikosongkan. Pastikan Anda sudah melakukan backup terlebih dahulu.',
                () => {
                  const empty = createEmptyDatabase();
                  dbRef.current = empty;
                  setDb(empty);
                  // Perangkat ini kini kosong: lupakan versi cloud agar perubahan berikutnya
                  // tidak menimpa data cloud tanpa pemeriksaan terlebih dahulu.
                  setCloudVersion(null);
                  markDirty(false);
                  pausedRef.current = null;
                  showToast('info', 'Workspace lokal telah direset ke kondisi kosong. Data di cloud tidak diubah.');
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
        notice={loginNotice}
        onLogin={handleLogin}
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

        <style>{`.mt-hide-scrollbar{scrollbar-width:none;-ms-overflow-style:none}.mt-hide-scrollbar::-webkit-scrollbar{display:none}`}</style>
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5 mt-hide-scrollbar">
          {navGroups.map((group) => {
            // Saat sidebar diperkecil (hanya ikon), semua item tetap tampil karena judul kategori disembunyikan
            const open = sidebarCollapsed || !collapsedGroups[group.group];
            const panelId = `nav-group-${group.group.replace(/[^A-Za-z]+/g, '-').toLowerCase()}`;
            return (
            <div key={group.group}>
              {!sidebarCollapsed && (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.group)}
                  aria-expanded={open}
                  aria-controls={panelId}
                  className="w-full flex items-center justify-between px-3 mb-1.5 min-h-[32px] rounded-lg text-[10px] font-bold tracking-wider uppercase text-blue-200/70 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <span>{group.group}</span>
                  <ChevronDown size={14} className={`transition-transform ${open ? '' : '-rotate-90'}`} />
                </button>
              )}
              {open && (
              <div id={panelId} className="space-y-1">
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
              )}
            </div>
            );
          })}
        </nav>

        <div className="hidden lg:flex p-3 border-t border-white/10 items-center justify-end gap-2">
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
              title={`Status: ${syncStatus} (${lastSyncTime})${syncDetail ? ' — ' + syncDetail : ''} — Klik untuk sinkronkan`}
              className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                syncStatus === 'connected'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                  : syncStatus === 'syncing'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : syncStatus === 'error'
                  ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                  : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-slate-800 dark:text-amber-300 dark:border-slate-700'
              }`}
            >
              {syncStatus === 'connected' ? <Cloud size={15} /> : syncStatus === 'error' ? <AlertTriangle size={15} /> : <Database size={15} />}
              <span>
                {syncStatus === 'connected'
                  ? `Cloud Aktif (${lastSyncTime})`
                  : syncStatus === 'syncing'
                  ? 'Menyinkronkan...'
                  : syncStatus === 'error'
                  ? 'Gagal Sinkron'
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

            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen((o: boolean) => !o)}
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
                className="w-10 h-10 rounded-full bg-[#173B70] text-white font-bold text-sm flex items-center justify-center shadow-xs overflow-hidden border-2 border-[#178C8C]"
                title="Menu Profil"
              >
                {db.teacher.fotoUrl ? (
                  <img src={db.teacher.fotoUrl} alt="Foto Guru" className="w-full h-full object-cover" />
                ) : (
                  (db.teacher.namaLengkap || 'G').charAt(0).toUpperCase()
                )}
              </button>

              {profileMenuOpen && (
                <div
                  role="menu"
                  className={`absolute right-0 mt-2 w-64 rounded-2xl border shadow-xl z-50 overflow-hidden ${
                    dark ? 'bg-[#13203B] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-bold truncate">{db.teacher.namaLengkap || 'Guru'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{readAuthSession()?.email || '-'}</p>
                  </div>
                  <div className="p-1.5">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        setActivePage('identitas');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left min-h-[44px] hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <UserCheck size={16} className="text-[#178C8C]" /> Profil & Identitas Guru
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        setActivePage('pengaturan');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left min-h-[44px] hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <KeyRound size={16} className="text-[#178C8C]" /> Ubah Kata Sandi
                    </button>
                    <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left min-h-[44px] text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <LogOut size={16} /> Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
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
                  allowEmptyRef.current = true; // penghapusan disengaja: izinkan push data kosong
                  void updateDatabase(() => createEmptyDatabase(), 'Data demo dihapus.');
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
                onClick={() => {
                  if (confirmModal.onCancel) confirmModal.onCancel();
                  setConfirmModal((c) => ({ ...c, open: false }));
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {confirmModal.cancelLabel || 'Batal'}
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal((c) => ({ ...c, open: false }));
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700"
              >
                {confirmModal.confirmLabel || 'Ya, Lanjutkan'}
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
              {printPreview.kop !== false && <KopSuratInstansi teacher={db.teacher} subtitle={printPreview.title} />}
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
// KOMPONEN LOGIN PAGE (VERIFIKASI DI SERVER / GOOGLE APPS SCRIPT)
// ============================================================================
const LoginPage: React.FC<{
  dark: boolean;
  onToggleDark: () => void;
  notice?: string;
  onLogin: (email: string, password: string, remember: boolean) => Promise<string | null>;
}> = ({ dark, onToggleDark, notice, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg('');
    setLoading(true);
    try {
      const err = await onLogin(email.trim(), password, remember);
      if (err) setErrorMsg(err);
    } catch (e2: any) {
      setErrorMsg(`Terjadi kendala saat login: ${e2?.message || 'kesalahan tak terduga'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors ${
        dark ? 'bg-[#0B1324] text-slate-100' : 'bg-[#F6F7FB] text-slate-900'
      }`}
    >
      <div
        className={`w-full max-w-md rounded-3xl p-7 sm:p-8 shadow-xl border space-y-6 ${
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

        <div className="space-y-1">
          <h2 className="text-xl font-bold">Masuk ke Ruang Kerja Guru</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Silakan masuk menggunakan akun guru terdaftar untuk mengakses perangkat ajar, presensi, dan penilaian peserta didik.
          </p>
        </div>

        {notice && !errorMsg && (
          <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs font-medium flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
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
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm min-h-[46px] ${
                  dark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Masukkan alamat email dinas guru yang terdaftar.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5">Kata Sandi (Password)</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type={showPwd ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className={`w-full pl-10 pr-11 py-2.5 rounded-xl border text-sm min-h-[46px] ${
                  dark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                title={showPwd ? 'Sembunyikan' : 'Tampilkan'}
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Password dapat diubah kapan saja melalui menu Pengaturan.</p>
          </div>

          <label className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400 select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 mt-0.5"
            />
            <span>Ingat saya di perangkat ini (maks. 7 hari). Jangan dicentang di komputer bersama.</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#173B70] hover:bg-blue-900 disabled:opacity-60 text-white font-bold text-sm shadow-md transition-colors min-h-[46px]"
          >
            {loading ? 'Memverifikasi ke server...' : 'Masuk ke Workspace'}
          </button>
        </form>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck size={14} className="text-[#178C8C]" /> Login diverifikasi di server
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
          sub={`${db.modules.length} Perencanaan, ${db.jobsheets.length} Jobsheet, ${db.tps.length} TP`}
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
            { label: 'Buat Perencanaan Pembelajaran', icon: <FileText size={18} />, page: 'modul_ajar' as PageId },
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
  counts: AlurCounts;
  onNavigate: (p: PageId) => void;
}> = ({ cps, subjects, dark, onAdd, onUpdate, onDelete, counts, onNavigate }) => {
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
      <AlurStepper current="cp" counts={counts} dark={dark} onNavigate={onNavigate} />
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
// ============================================================================
// ALUR PENYUSUNAN: CP -> ANALISIS CP -> TUJUAN PEMBELAJARAN (TP) -> ATP
// ============================================================================
type AlurStep = 'cp' | 'analisis_cp' | 'tp' | 'atp';
interface AlurCounts {
  cp: number;
  analisis_cp: number;
  tp: number;
  atp: number;
}

const AlurStepper: React.FC<{
  current: AlurStep;
  counts: AlurCounts;
  dark: boolean;
  onNavigate: (p: PageId) => void;
}> = ({ current, counts, dark, onNavigate }) => {
  const steps: { id: AlurStep; label: string; hint: string }[] = [
    { id: 'cp', label: 'CP', hint: 'Pahami capaian' },
    { id: 'analisis_cp', label: 'Analisis CP', hint: 'Kompetensi × materi' },
    { id: 'tp', label: 'Tujuan Pembelajaran', hint: 'Rumuskan TP' },
    { id: 'atp', label: 'ATP', hint: 'Urutkan & alokasi JP' },
  ];
  return (
    <ol className="flex flex-wrap gap-2" aria-label="Alur penyusunan perangkat kurikulum">
      {steps.map((s, i) => {
        const active = s.id === current;
        const done = counts[s.id] > 0;
        return (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onNavigate(s.id)}
              aria-current={active ? 'step' : undefined}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold min-h-[44px] transition-colors ${
                active
                  ? 'bg-[#173B70] text-white border-[#173B70]'
                  : dark
                  ? 'bg-[#13203B] border-slate-700 text-slate-200 hover:bg-slate-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center shrink-0 ${
                  active ? 'bg-white/20' : done ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {done && !active ? <Check size={12} /> : i + 1}
              </span>
              <span className="text-left leading-tight">
                <span className="block">
                  {s.label}
                  {counts[s.id] > 0 ? ` (${counts[s.id]})` : ''}
                </span>
                <span className={`block text-[10px] font-normal ${active ? 'text-blue-100' : 'text-slate-400'}`}>
                  {s.hint}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
};

// --- 6b. ANALISIS CP: uraikan CP menjadi pasangan kompetensi × lingkup materi ---
interface DraftRow {
  kompetensi: string;
  kko: string;
  lingkupMateri: string;
  bukti: string;
  praktik: string;
  k3: string;
}
const emptyDraftRow = (): DraftRow => ({ kompetensi: '', kko: '', lingkupMateri: '', bukti: '', praktik: '', k3: '' });

const KKO_SUGGESTIONS = [
  'Menerapkan', 'Memeriksa', 'Mengukur', 'Menyetel', 'Mendiagnosis', 'Memperbaiki', 'Merawat',
  'Membongkar', 'Memasang', 'Menganalisis', 'Menjelaskan', 'Mengidentifikasi', 'Membaca',
  'Menggunakan', 'Mengoperasikan', 'Mengevaluasi', 'Merancang', 'Menguji',
];

const CPAnalysisView: React.FC<{
  analyses: CPAnalysis[];
  cps: LearningOutcome[];
  subjects: Subject[];
  tps: LearningObjective[];
  counts: AlurCounts;
  dark: boolean;
  onNavigate: (p: PageId) => void;
  onAddMany: (list: CPAnalysis[]) => void;
  onUpdate: (a: CPAnalysis) => void;
  onDelete: (id: string) => void;
}> = ({ analyses, cps, subjects, tps, counts, dark, onNavigate, onAddMany, onUpdate, onDelete }) => {
  const [cpId, setCpId] = useState('');
  const [rows, setRows] = useState<DraftRow[]>([emptyDraftRow()]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const selectedCpId = cps.some((c) => c.id === cpId) ? cpId : cps[0]?.id || '';
  const selectedCp = cps.find((c) => c.id === selectedCpId);
  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.namaMapel || '-';

  const inputCls = `w-full px-3.5 py-2.5 rounded-xl border text-sm min-h-[44px] ${
    dark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
  }`;
  const cardCls = `rounded-2xl border ${dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'}`;

  const updateRow = (i: number, patch: Partial<DraftRow>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const resetForm = () => {
    setEditingId(null);
    setRows([emptyDraftRow()]);
    setFormError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!selectedCp) {
      setFormError('Pilih Capaian Pembelajaran (CP) yang akan dianalisis.');
      return;
    }
    const filled = rows.filter((r) => r.kompetensi.trim() || r.lingkupMateri.trim());
    if (!filled.length) {
      setFormError('Isi minimal satu baris: kompetensi dan lingkup materi.');
      return;
    }
    if (filled.some((r) => !r.kompetensi.trim() || !r.lingkupMateri.trim())) {
      setFormError('Setiap baris harus memiliki Kompetensi dan Lingkup Materi, atau kosongkan barisnya.');
      return;
    }
    const build = (r: DraftRow, id: string): CPAnalysis => ({
      id,
      cpId: selectedCp.id,
      subjectId: selectedCp.subjectId,
      fase: selectedCp.fase,
      elemen: selectedCp.elemen,
      kompetensi: r.kompetensi.trim(),
      lingkupMateri: r.lingkupMateri.trim(),
      kataKerjaOperasional: r.kko.trim(),
      buktiKetercapaian: r.bukti.trim(),
      kebutuhanPraktik: r.praktik.trim(),
      aspekK3: r.k3.trim(),
      keterangan: analyses.find((a) => a.id === editingId)?.keterangan || '',
    });
    if (editingId) {
      onUpdate(build(filled[0], editingId));
    } else {
      onAddMany(filled.map((r) => build(r, uid('an'))));
    }
    resetForm();
  };

  const startEdit = (a: CPAnalysis) => {
    setEditingId(a.id);
    setCpId(a.cpId);
    setRows([
      {
        kompetensi: a.kompetensi,
        kko: a.kataKerjaOperasional || '',
        lingkupMateri: a.lingkupMateri,
        bukti: a.buktiKetercapaian || '',
        praktik: a.kebutuhanPraktik || '',
        k3: a.aspekK3 || '',
      },
    ]);
    setFormError('');
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  const tpsOf = (analysisId: string) => tps.filter((tp) => tp.analysisIds.includes(analysisId));
  const groups = cps
    .map((cp) => ({ cp, items: analyses.filter((a) => a.cpId === cp.id) }))
    .filter((g) => g.items.length > 0);
  const orphans = analyses.filter((a) => !cps.some((c) => c.id === a.cpId));

  const renderTable = (items: CPAnalysis[]) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className={`text-xs uppercase ${dark ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
          <tr>
            <th className="p-3 w-10">No</th>
            <th className="p-3">Kompetensi</th>
            <th className="p-3">KKO</th>
            <th className="p-3">Lingkup Materi</th>
            <th className="p-3">Bukti Ketercapaian</th>
            <th className="p-3">Alat & K3</th>
            <th className="p-3">TP</th>
            <th className="p-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {items.map((a, idx) => {
            const linked = tpsOf(a.id);
            return (
              <tr key={a.id} className="align-top">
                <td className="p-3 text-slate-500">{idx + 1}</td>
                <td className="p-3 min-w-[200px]">{a.kompetensi}</td>
                <td className="p-3 min-w-[120px] text-xs">{a.kataKerjaOperasional || <span className="text-slate-400">-</span>}</td>
                <td className="p-3 min-w-[180px]">{a.lingkupMateri}</td>
                <td className="p-3 min-w-[160px] text-xs">{a.buktiKetercapaian || <span className="text-slate-400">-</span>}</td>
                <td className="p-3 min-w-[160px] text-xs">
                  <p><strong>Alat:</strong> {a.kebutuhanPraktik || '-'}</p>
                  <p className="text-amber-600"><strong>K3:</strong> {a.aspekK3 || '-'}</p>
                </td>
                <td className="p-3 min-w-[110px] text-xs">
                  {linked.length ? (
                    <div className="flex flex-wrap gap-1">
                      {linked.map((tp) => (
                        <span key={tp.id} className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                          {tp.kodeTp}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-semibold">Belum ada TP</span>
                  )}
                </td>
                <td className="p-3 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button type="button" onClick={() => startEdit(a)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg" title="Edit baris analisis">
                      <Edit3 size={15} />
                    </button>
                    <button type="button" onClick={() => onDelete(a.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg" title="Hapus baris analisis">
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
  );

  return (
    <div className="space-y-6">
      <AlurStepper current="analisis_cp" counts={counts} dark={dark} onNavigate={onNavigate} />

      <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs flex items-start gap-3">
        <Info size={18} className="text-[#173B70] dark:text-blue-300 shrink-0 mt-0.5" />
        <p>
          Baca CP secara utuh, lalu <strong>pisahkan</strong> menjadi pasangan <strong>kompetensi</strong> (kemampuan/kata kerja)
          dan <strong>lingkup materi</strong> (konten atau konsep utama). Satu CP biasanya menghasilkan beberapa baris.
          Hasilnya menjadi bahan merumuskan Tujuan Pembelajaran (TP) pada langkah berikutnya.
        </p>
      </div>

      {cps.length === 0 ? (
        <div className={`${cardCls} p-6 text-sm`}>
          <p className="font-semibold">Belum ada Capaian Pembelajaran.</p>
          <p className="text-xs text-slate-500 mt-1">Masukkan teks CP terlebih dahulu pada langkah 1.</p>
          <button type="button" onClick={() => onNavigate('cp')} className="mt-3 px-4 py-2.5 rounded-xl bg-[#173B70] text-white text-xs font-semibold min-h-[44px]">
            Buka halaman CP
          </button>
        </div>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit} className={`${cardCls} p-5 space-y-4`}>
          <h3 className="font-bold text-base">{editingId ? 'Edit Baris Analisis CP' : 'Lembar Analisis Capaian Pembelajaran'}</h3>

          <div>
            <label className="block text-xs font-semibold mb-1">Pilih Elemen CP yang Dianalisis *</label>
            <select
              className={inputCls}
              value={selectedCpId}
              onChange={(e) => setCpId(e.target.value)}
              disabled={!!editingId}
            >
              {cps.map((c) => (
                <option key={c.id} value={c.id}>
                  {subjectName(c.subjectId)} — {c.elemen} (Fase {c.fase})
                </option>
              ))}
            </select>
          </div>

          {selectedCp && (
            <div className={`p-4 rounded-xl border text-sm ${dark ? 'bg-slate-900/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#178C8C] mb-1">
                Teks Capaian Pembelajaran — Fase {selectedCp.fase}
              </p>
              <p className="leading-relaxed">{selectedCp.deskripsiCp}</p>
              <p className="text-[11px] text-slate-500 mt-2">
                Sumber: {selectedCp.sumberDokumen} ({selectedCp.tahunDokumen})
              </p>
            </div>
          )}

          <datalist id="kko-suggestions">
            {KKO_SUGGESTIONS.map((k) => (
              <option key={k} value={k} />
            ))}
          </datalist>

          <div className="space-y-3">
            {rows.map((r, i) => (
              <div key={i} className={`p-3.5 rounded-xl border space-y-3 ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Baris {i + 1}</span>
                  {!editingId && rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-xs text-rose-600 font-semibold flex items-center gap-1 min-h-[32px]"
                    >
                      <Trash2 size={13} /> Hapus baris
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-1">
                    <label className="block text-[11px] font-semibold mb-1">Kompetensi (kemampuan yang diminta CP) *</label>
                    <input className={inputCls} value={r.kompetensi} onChange={(e) => updateRow(i, { kompetensi: e.target.value })} placeholder="mis. Mendiagnosis gangguan mekanisme katup" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Kata Kerja Operasional (KKO)</label>
                    <input className={inputCls} list="kko-suggestions" value={r.kko} onChange={(e) => updateRow(i, { kko: e.target.value })} placeholder="mis. Mendiagnosis" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Lingkup Materi (konten/konsep) *</label>
                    <input className={inputCls} value={r.lingkupMateri} onChange={(e) => updateRow(i, { lingkupMateri: e.target.value })} placeholder="mis. Celah katup, kompresi silinder" />
                  </div>
                </div>
                <details open={!!(r.bukti || r.praktik || r.k3)}>
                  <summary className="text-xs font-semibold text-[#178C8C] cursor-pointer select-none min-h-[32px] flex items-center">
                    Detail tambahan (opsional): bukti ketercapaian, alat praktik, K3LH
                  </summary>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                    <input className={inputCls} value={r.bukti} onChange={(e) => updateRow(i, { bukti: e.target.value })} placeholder="Indikator / bukti ketercapaian" />
                    <input className={inputCls} value={r.praktik} onChange={(e) => updateRow(i, { praktik: e.target.value })} placeholder="Unit / alat praktik bengkel" />
                    <input className={inputCls} value={r.k3} onChange={(e) => updateRow(i, { k3: e.target.value })} placeholder="Aspek keselamatan kerja (K3LH)" />
                  </div>
                </details>
              </div>
            ))}
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/15 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2" role="alert">
              <AlertTriangle size={15} className="shrink-0" /> {formError}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {!editingId && (
              <button
                type="button"
                onClick={() => setRows((prev) => [...prev, emptyDraftRow()])}
                className="px-4 py-2.5 rounded-xl border border-[#178C8C] text-[#178C8C] text-sm font-semibold min-h-[44px] flex items-center gap-1.5"
              >
                <Plus size={15} /> Tambah baris
              </button>
            )}
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#173B70] text-white font-semibold text-sm min-h-[44px]">
              {editingId ? 'Simpan Perubahan' : rows.length > 1 ? `Simpan ${rows.length} Baris Analisis` : 'Simpan Hasil Analisis'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="px-4 py-2.5 rounded-xl border text-sm font-semibold min-h-[44px]">
                Batal
              </button>
            )}
          </div>
        </form>
      )}

      {analyses.length === 0 ? (
        <div className={`${cardCls} p-6 text-sm text-slate-500`}>
          Belum ada hasil analisis. Pilih CP di atas, lalu uraikan kompetensi dan lingkup materinya.
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map(({ cp, items }) => {
            const covered = items.filter((a) => tpsOf(a.id).length > 0).length;
            return (
              <section key={cp.id} className={`${cardCls} overflow-hidden`}>
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{subjectName(cp.subjectId)}</p>
                    <p className="text-xs text-slate-500 truncate">Elemen: {cp.elemen} • Fase {cp.fase}</p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      covered === items.length ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Sudah dipetakan ke TP: {covered}/{items.length}
                  </span>
                </div>
                {renderTable(items)}
              </section>
            );
          })}
          {orphans.length > 0 && (
            <section className={`${cardCls} overflow-hidden`}>
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 text-sm font-bold">
                Analisis tanpa CP (CP sumber sudah dihapus)
              </div>
              {renderTable(orphans)}
            </section>
          )}
          <div className="flex justify-end">
            <button type="button" onClick={() => onNavigate('tp')} className="px-5 py-2.5 rounded-xl bg-[#178C8C] text-white text-sm font-semibold min-h-[44px]">
              Lanjut: Rumuskan Tujuan Pembelajaran →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- 7. TUJUAN PEMBELAJARAN (TP): turunkan hasil analisis menjadi rumusan TP ---
const TPView: React.FC<{
  tps: LearningObjective[];
  analyses: CPAnalysis[];
  subjects: Subject[];
  atps: ATPItem[];
  counts: AlurCounts;
  dark: boolean;
  onNavigate: (p: PageId) => void;
  onAdd: (tp: LearningObjective) => void;
  onUpdate: (tp: LearningObjective) => void;
  onDelete: (id: string) => void;
}> = ({ tps, analyses, subjects, atps, counts, dark, onNavigate, onAdd, onUpdate, onDelete }) => {
  const [subjectIdState, setSubjectIdState] = useState('');
  const subjectId = subjects.some((s) => s.id === subjectIdState) ? subjectIdState : subjects[0]?.id || '';
  const subject = subjects.find((s) => s.id === subjectId);

  const [tingkatState, setTingkatState] = useState<'X' | 'XI' | 'XII' | ''>('');
  const tingkat = (tingkatState || subject?.tingkat || 'X') as 'X' | 'XI' | 'XII';

  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [kode, setKode] = useState('');
  const [rumusan, setRumusan] = useState('');
  const [konteks, setKonteks] = useState('');
  const [formError, setFormError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const subjectAnalyses = analyses.filter((a) => a.subjectId === subjectId);
  const subjectTps = tps.filter((x) => x.subjectId === subjectId).sort(compareTp);
  const coveredCount = subjectAnalyses.filter((a) => subjectTps.some((x) => x.analysisIds.includes(a.id))).length;
  const autoKode = nextKodeTp(tps, subjectId, tingkat);
  const selectedRows = subjectAnalyses.filter((a) => selectedIds.includes(a.id));

  const inputCls = `w-full px-3.5 py-2.5 rounded-xl border text-sm min-h-[44px] ${
    dark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
  }`;
  const cardCls = `rounded-2xl border ${dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'}`;

  const resetForm = () => {
    setEditingId(null);
    setSelectedIds([]);
    setKode('');
    setRumusan('');
    setKonteks('');
    setFormError('');
  };

  const changeSubject = (id: string) => {
    setSubjectIdState(id);
    setTingkatState('');
    resetForm();
  };

  const scrollToForm = () => setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);

  const startFromAnalysis = (a: CPAnalysis) => {
    resetForm();
    setSelectedIds([a.id]);
    setRumusan(buildTpDraft([a]));
    scrollToForm();
  };

  const startEdit = (tp: LearningObjective) => {
    setSubjectIdState(tp.subjectId);
    setTingkatState(tp.tingkat);
    setEditingId(tp.id);
    setSelectedIds(tp.analysisIds);
    setKode(tp.kodeTp);
    setRumusan(tp.rumusan);
    setKonteks(tp.konteks || '');
    setFormError('');
    scrollToForm();
  };

  const toggleAnalysis = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!subject) return;
    const text = rumusan.trim();
    if (text.length < 10) {
      setFormError('Rumusan TP terlalu singkat. Tuliskan kompetensi dan lingkup materi secara spesifik dan terukur.');
      return;
    }
    if (!editingId && selectedIds.length === 0) {
      setFormError('Pilih minimal satu baris Analisis CP sebagai dasar TP.');
      return;
    }
    const kodeFinal = kode.trim() || autoKode;
    if (tps.some((x) => x.id !== editingId && x.subjectId === subjectId && x.kodeTp === kodeFinal)) {
      setFormError(`Kode TP ${kodeFinal} sudah dipakai pada mata pelajaran ini.`);
      return;
    }
    const existing = tps.find((x) => x.id === editingId);
    const payload: LearningObjective = {
      id: editingId || uid('tp'),
      subjectId,
      fase: subject.fase,
      tingkat,
      elemen: selectedRows[0]?.elemen || existing?.elemen || subject.namaMapel,
      analysisIds: selectedIds,
      kodeTp: kodeFinal,
      rumusan: text,
      konteks: konteks.trim(),
      keterangan: existing?.keterangan || '',
    };
    if (editingId) onUpdate(payload);
    else onAdd(payload);
    resetForm();
  };

  if (subjects.length === 0) {
    return (
      <div className="space-y-6">
        <AlurStepper current="tp" counts={counts} dark={dark} onNavigate={onNavigate} />
        <div className={`${cardCls} p-6 text-sm`}>
          <p className="font-semibold">Belum ada mata pelajaran.</p>
          <button type="button" onClick={() => onNavigate('mapel')} className="mt-3 px-4 py-2.5 rounded-xl bg-[#173B70] text-white text-xs font-semibold min-h-[44px]">
            Buka Mata Pelajaran
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AlurStepper current="tp" counts={counts} dark={dark} onNavigate={onNavigate} />

      <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs flex items-start gap-3">
        <Info size={18} className="text-[#173B70] dark:text-blue-300 shrink-0 mt-0.5" />
        <p>
          Ubah hasil Analisis CP menjadi <strong>Tujuan Pembelajaran</strong> yang spesifik, operasional, dan terukur.
          Sesuaikan dengan karakteristik peserta didik dan sumber daya bengkel, dan pastikan seluruh kompetensi CP pada
          satu fase sudah tercakup.
        </p>
      </div>

      <div className={`${cardCls} p-5 space-y-3`}>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-xs font-semibold mb-1">Mata Pelajaran</label>
            <select className={inputCls} value={subjectId} onChange={(e) => changeSubject(e.target.value)} disabled={!!editingId}>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.namaMapel} (Fase {s.fase})</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold">Cakupan CP: {coveredCount} dari {subjectAnalyses.length} baris analisis sudah punya TP</span>
            <span className="text-slate-500">{subjectAnalyses.length ? Math.round((coveredCount / subjectAnalyses.length) * 100) : 0}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#178C8C] transition-all"
              style={{ width: `${subjectAnalyses.length ? (coveredCount / subjectAnalyses.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {subjectAnalyses.length === 0 ? (
          <div className="text-sm text-slate-500">
            Mata pelajaran ini belum punya hasil Analisis CP.{' '}
            <button type="button" onClick={() => onNavigate('analisis_cp')} className="text-[#178C8C] font-semibold underline">
              Buka Analisis CP
            </button>
          </div>
        ) : coveredCount < subjectAnalyses.length ? (
          <div className="space-y-2">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-300">Belum dirumuskan menjadi TP:</p>
            {subjectAnalyses
              .filter((a) => !subjectTps.some((x) => x.analysisIds.includes(a.id)))
              .map((a) => (
                <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <div className="min-w-0 text-xs">
                    <p className="font-semibold">{a.kompetensi}</p>
                    <p className="text-slate-500">{a.lingkupMateri}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => startFromAnalysis(a)}
                    className="px-3 py-2 rounded-lg bg-[#173B70] text-white text-xs font-semibold min-h-[36px] shrink-0"
                  >
                    Rumuskan TP
                  </button>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 size={15} /> Semua baris analisis sudah tercakup oleh minimal satu TP.
          </p>
        )}
      </div>

      {subjectAnalyses.length > 0 && (
        <form ref={formRef} onSubmit={handleSubmit} className={`${cardCls} p-5 space-y-4`}>
          <h3 className="font-bold text-base">{editingId ? 'Edit Tujuan Pembelajaran' : 'Rumuskan Tujuan Pembelajaran'}</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold mb-1">Kelas / Tingkat</label>
              <select className={inputCls} value={tingkat} onChange={(e) => setTingkatState(e.target.value as 'X' | 'XI' | 'XII')}>
                <option value="X">Kelas X</option>
                <option value="XI">Kelas XI</option>
                <option value="XII">Kelas XII</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold mb-1">Kode TP</label>
              <input className={inputCls} value={kode} onChange={(e) => setKode(e.target.value)} placeholder={`Otomatis: ${autoKode}`} />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold mb-1.5">Dasar TP: pilih baris Analisis CP {editingId ? '' : '*'}</p>
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {subjectAnalyses.map((a) => {
                const n = subjectTps.filter((x) => x.analysisIds.includes(a.id)).length;
                return (
                  <label
                    key={a.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer ${
                      selectedIds.includes(a.id)
                        ? 'border-[#178C8C] bg-[#178C8C]/10'
                        : dark
                        ? 'border-slate-700'
                        : 'border-slate-200'
                    }`}
                  >
                    <input type="checkbox" className="mt-0.5 w-4 h-4" checked={selectedIds.includes(a.id)} onChange={() => toggleAnalysis(a.id)} />
                    <span className="min-w-0">
                      <span className="block font-semibold">{a.kompetensi}</span>
                      <span className="block text-slate-500">{a.lingkupMateri}</span>
                      <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${n ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {n ? `${n} TP` : 'Belum ada TP'}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <label className="block text-xs font-semibold">Rumusan Tujuan Pembelajaran *</label>
              <button
                type="button"
                disabled={selectedRows.length === 0}
                onClick={() => setRumusan(buildTpDraft(selectedRows))}
                className="text-xs font-semibold text-[#178C8C] disabled:opacity-40 flex items-center gap-1 min-h-[32px]"
              >
                <Sparkles size={13} /> {rumusan.trim() ? 'Ganti dengan draf baru' : 'Buat draf dari analisis terpilih'}
              </button>
            </div>
            <textarea
              className={`${inputCls} min-h-[96px]`}
              value={rumusan}
              onChange={(e) => setRumusan(e.target.value)}
              placeholder="Peserta didik mampu ... (kompetensi) ... pada materi ... (lingkup materi), dengan ... (kondisi/standar)"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Draf hanya titik awal. Sunting agar spesifik, operasional, dan terukur (kata kerja + materi + kondisi/standar).
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Konteks Satuan Pendidikan (opsional)</label>
            <textarea
              className={`${inputCls} min-h-[64px]`}
              value={konteks}
              onChange={(e) => setKonteks(e.target.value)}
              placeholder="Karakteristik peserta didik, visi-misi sekolah, sumber daya bengkel/unit praktik yang tersedia"
            />
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/15 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2" role="alert">
              <AlertTriangle size={15} className="shrink-0" /> {formError}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#173B70] text-white font-semibold text-sm min-h-[44px]">
              {editingId ? 'Simpan Perubahan TP' : '+ Simpan Tujuan Pembelajaran'}
            </button>
            {(editingId || selectedIds.length > 0 || rumusan) && (
              <button type="button" onClick={resetForm} className="px-4 py-2.5 rounded-xl border text-sm font-semibold min-h-[44px]">
                {editingId ? 'Batal' : 'Kosongkan'}
              </button>
            )}
          </div>
        </form>
      )}

      <div className="space-y-2.5">
        {subjectTps.length === 0 ? (
          <div className={`${cardCls} p-6 text-sm text-slate-500`}>Belum ada Tujuan Pembelajaran untuk mata pelajaran ini.</div>
        ) : (
          subjectTps.map((tp) => {
            const inAtp = atps.some((a) => a.tpId === tp.id);
            const linked = analyses.filter((a) => tp.analysisIds.includes(a.id));
            return (
              <div key={tp.id} className={`${cardCls} p-4 flex items-start justify-between gap-4`}>
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-[#178C8C]">{tp.kodeTp}</span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold">Kelas {tp.tingkat}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${inAtp ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {inAtp ? 'Sudah di ATP' : 'Belum di ATP'}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{tp.rumusan}</p>
                  {linked.length > 0 && (
                    <p className="text-[11px] text-slate-500">
                      Dasar analisis: {linked.map((a) => a.kompetensi).join(' • ')}
                    </p>
                  )}
                  {tp.konteks && <p className="text-[11px] text-slate-500">Konteks: {tp.konteks}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button type="button" onClick={() => startEdit(tp)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg" title="Edit TP">
                    <Edit3 size={16} />
                  </button>
                  <button type="button" onClick={() => onDelete(tp.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg" title="Hapus TP">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {tps.length > 0 && (
        <div className="flex justify-end">
          <button type="button" onClick={() => onNavigate('atp')} className="px-5 py-2.5 rounded-xl bg-[#178C8C] text-white text-sm font-semibold min-h-[44px]">
            Lanjut: Susun Alur Tujuan Pembelajaran (ATP) →
          </button>
        </div>
      )}
    </div>
  );
};

// --- 8. ALUR TUJUAN PEMBELAJARAN (ATP) ---
const PRINSIP_OPTIONS = [
  'Konkret ke abstrak',
  'Mudah ke sulit',
  'Umum ke khusus',
  'Prosedural (tahapan keterampilan)',
  'Lainnya',
];

const ATPView: React.FC<{
  atps: ATPItem[];
  tps: LearningObjective[];
  subjects: Subject[];
  analyses: CPAnalysis[];
  settings: AppSettings;
  dark: boolean;
  counts: AlurCounts;
  onNavigate: (p: PageId) => void;
  onAddMany: (items: ATPItem[]) => void;
  onUpdate: (item: ATPItem) => void;
  onReorder: (next: ATPItem[]) => void;
  onDelete: (id: string) => void;
  onOpenPrint: (title: string, content: React.ReactNode) => void;
}> = ({ atps, tps, subjects, analyses, settings, dark, counts, onNavigate, onAddMany, onUpdate, onReorder, onDelete, onOpenPrint }) => {
  const [subjectIdState, setSubjectIdState] = useState('');
  const subjectId = subjects.some((s) => s.id === subjectIdState) ? subjectIdState : subjects[0]?.id || '';
  const subject = subjects.find((s) => s.id === subjectId);

  const [tpIdState, setTpIdState] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>(settings.semester);
  const [jp, setJp] = useState(12);
  const [prinsip, setPrinsip] = useState(PRINSIP_OPTIONS[0]);
  const [formError, setFormError] = useState('');

  const sortedAtps = [...atps].sort((a, b) => a.urutan - b.urutan);
  const visible = sortedAtps.filter((a) => a.subjectId === subjectId);
  const availableTps = tps
    .filter((x) => x.subjectId === subjectId && !atps.some((a) => a.tpId === x.id))
    .sort(compareTp);
  const tpId = availableTps.some((x) => x.id === tpIdState) ? tpIdState : availableTps[0]?.id || '';
  const editingItem = atps.find((a) => a.id === editingId);

  const totalJp = (sem?: 'Ganjil' | 'Genap') =>
    visible.filter((a) => !sem || a.semester === sem).reduce((s, a) => s + (Number(a.alokasiJp) || 0), 0);

  const inputCls = `w-full px-3.5 py-2.5 rounded-xl border text-sm min-h-[44px] ${
    dark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
  }`;
  const cardCls = `rounded-2xl border ${dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'}`;

  const resetForm = () => {
    setEditingId(null);
    setFormError('');
    setJp(12);
  };

  const buildAtp = (tp: LearningObjective): ATPItem => {
    const src = analyses.filter((a) => tp.analysisIds.includes(a.id));
    return {
      id: uid('atp'),
      subjectId: tp.subjectId,
      analysisId: src[0]?.id || '',
      tpId: tp.id,
      tingkat: tp.tingkat,
      prinsipUrutan: prinsip,
      fase: tp.fase,
      tahunAjaran: settings.tahunAjaran,
      semester,
      elemen: tp.elemen,
      kodeTp: tp.kodeTp,
      tujuanPembelajaran: tp.rumusan,
      kompetensi: src.map((a) => a.kompetensi).join('; '),
      lingkupMateri: Array.from(new Set(src.map((a) => a.lingkupMateri))).join('; '),
      urutan: 0, // diberi nomor urut final oleh penyimpan data
      alokasiJp: jp,
      keterangan: '',
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!(jp > 0)) {
      setFormError('Alokasi waktu harus lebih dari 0 JP.');
      return;
    }
    if (editingItem) {
      onUpdate({ ...editingItem, alokasiJp: jp, semester, prinsipUrutan: prinsip });
      resetForm();
      return;
    }
    const tp = availableTps.find((x) => x.id === tpId);
    if (!tp) {
      setFormError('Pilih TP yang akan dimasukkan ke ATP.');
      return;
    }
    onAddMany([buildAtp(tp)]);
    setTpIdState('');
  };

  const addAllRemaining = () => {
    if (!(jp > 0)) {
      setFormError('Alokasi waktu harus lebih dari 0 JP.');
      return;
    }
    setFormError('');
    onAddMany(availableTps.map(buildAtp));
    setTpIdState('');
  };

  const startEdit = (item: ATPItem) => {
    setEditingId(item.id);
    setJp(item.alokasiJp);
    setSemester(item.semester);
    setPrinsip(item.prinsipUrutan || PRINSIP_OPTIONS[0]);
    setFormError('');
  };

  // Menggeser urutan di antara TP pada mata pelajaran yang sama (urutan global tetap konsisten)
  const moveItem = (visibleIndex: number, dir: -1 | 1) => {
    const a = visible[visibleIndex];
    const b = visible[visibleIndex + dir];
    if (!a || !b) return;
    const copy = [...sortedAtps];
    const ia = copy.findIndex((x) => x.id === a.id);
    const ib = copy.findIndex((x) => x.id === b.id);
    [copy[ia], copy[ib]] = [copy[ib], copy[ia]];
    onReorder(copy.map((item, idx) => ({ ...item, urutan: idx + 1 })));
  };

  if (subjects.length === 0) {
    return (
      <div className="space-y-6">
        <AlurStepper current="atp" counts={counts} dark={dark} onNavigate={onNavigate} />
        <div className={`${cardCls} p-6 text-sm`}>Belum ada mata pelajaran.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AlurStepper current="atp" counts={counts} dark={dark} onNavigate={onNavigate} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-base">Alur Tujuan Pembelajaran (ATP)</h3>
          <p className="text-xs text-slate-500">
            Urutkan TP secara logis dari awal hingga akhir fase, lalu tentukan alokasi waktu (JP) tiap TP.
          </p>
        </div>
        <button
          disabled={visible.length === 0}
          onClick={() =>
            onOpenPrint(
              `ALUR TUJUAN PEMBELAJARAN (ATP) — ${subject?.namaMapel || ''} — T.A. ${settings.tahunAjaran}`,
              <table className="w-full border-collapse border border-slate-800 text-xs">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-800 p-2">No</th>
                    <th className="border border-slate-800 p-2">Kode TP</th>
                    <th className="border border-slate-800 p-2">Kelas</th>
                    <th className="border border-slate-800 p-2">Smt</th>
                    <th className="border border-slate-800 p-2">Elemen</th>
                    <th className="border border-slate-800 p-2">Tujuan Pembelajaran</th>
                    <th className="border border-slate-800 p-2">Lingkup Materi</th>
                    <th className="border border-slate-800 p-2">Alokasi</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((a, i) => (
                    <tr key={a.id}>
                      <td className="border border-slate-800 p-2 text-center">{i + 1}</td>
                      <td className="border border-slate-800 p-2 font-bold">{a.kodeTp}</td>
                      <td className="border border-slate-800 p-2 text-center">{a.tingkat || '-'}</td>
                      <td className="border border-slate-800 p-2 text-center">{a.semester}</td>
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
          className="px-4 py-2.5 rounded-xl bg-[#178C8C] disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-2 min-h-[44px]"
        >
          <Printer size={16} /> Pratinjau Cetak ATP
        </button>
      </div>

      <div className={`${cardCls} p-5 space-y-4`}>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-xs font-semibold mb-1">Mata Pelajaran</label>
            <select
              className={inputCls}
              value={subjectId}
              onChange={(e) => {
                setSubjectIdState(e.target.value);
                setTpIdState('');
                resetForm();
              }}
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.namaMapel} (Fase {s.fase})</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="px-3 py-2 rounded-xl bg-[#173B70]/10 text-[#173B70] dark:bg-blue-900/40 dark:text-blue-200">Ganjil: {totalJp('Ganjil')} JP</span>
            <span className="px-3 py-2 rounded-xl bg-[#173B70]/10 text-[#173B70] dark:bg-blue-900/40 dark:text-blue-200">Genap: {totalJp('Genap')} JP</span>
            <span className="px-3 py-2 rounded-xl bg-[#178C8C]/15 text-[#178C8C]">Total: {totalJp()} JP</span>
          </div>
        </div>

        {availableTps.length === 0 && !editingItem ? (
          <div className="text-sm text-slate-500">
            {tps.some((x) => x.subjectId === subjectId)
              ? 'Semua TP pada mata pelajaran ini sudah masuk ATP.'
              : 'Belum ada Tujuan Pembelajaran untuk mata pelajaran ini.'}{' '}
            <button type="button" onClick={() => onNavigate('tp')} className="text-[#178C8C] font-semibold underline">
              Buka halaman TP
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <h4 className="font-bold text-sm">{editingItem ? `Atur ${editingItem.kodeTp}` : 'Tambahkan TP ke ATP'}</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold mb-1">Tujuan Pembelajaran</label>
                {editingItem ? (
                  <div className={`${inputCls} flex items-center text-xs`}>
                    {editingItem.kodeTp} — {editingItem.tujuanPembelajaran.slice(0, 80)}
                    {editingItem.tujuanPembelajaran.length > 80 ? '…' : ''}
                  </div>
                ) : (
                  <select className={inputCls} value={tpId} onChange={(e) => setTpIdState(e.target.value)}>
                    {availableTps.map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.kodeTp} — {x.rumusan.length > 70 ? `${x.rumusan.slice(0, 70)}…` : x.rumusan}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-[11px] font-semibold mb-1">Semester</label>
                <select className={inputCls} value={semester} onChange={(e) => setSemester(e.target.value as 'Ganjil' | 'Genap')}>
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold mb-1">Alokasi (JP)</label>
                <input type="number" min={1} className={inputCls} value={jp} onChange={(e) => setJp(Number(e.target.value))} />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold mb-1">Prinsip pengurutan</label>
              <select className={inputCls} value={prinsip} onChange={(e) => setPrinsip(e.target.value)}>
                {PRINSIP_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/15 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2" role="alert">
                <AlertTriangle size={15} className="shrink-0" /> {formError}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#173B70] text-white font-semibold text-sm min-h-[44px]">
                {editingItem ? 'Simpan Perubahan' : '+ Tambahkan ke ATP'}
              </button>
              {!editingItem && availableTps.length > 1 && (
                <button
                  type="button"
                  onClick={addAllRemaining}
                  className="px-4 py-2.5 rounded-xl border border-[#178C8C] text-[#178C8C] text-sm font-semibold min-h-[44px]"
                >
                  Tambahkan semua TP yang tersisa ({availableTps.length})
                </button>
              )}
              {editingItem && (
                <button type="button" onClick={resetForm} className="px-4 py-2.5 rounded-xl border text-sm font-semibold min-h-[44px]">
                  Batal
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      <div className="space-y-2.5">
        {visible.length === 0 ? (
          <div className={`${cardCls} p-6 text-sm text-slate-500`}>Belum ada TP dalam ATP untuk mata pelajaran ini.</div>
        ) : (
          visible.map((item, idx) => (
            <div key={item.id} className={`${cardCls} p-4 flex items-center justify-between gap-4`}>
              <div className="flex items-start gap-3 min-w-0">
                <span className="w-8 h-8 rounded-xl bg-[#173B70] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-[#178C8C]">{item.kodeTp}</span>
                    {item.tingkat && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold">Kelas {item.tingkat}</span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold">{item.semester}</span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-[#173B70]/10 text-[#173B70] dark:bg-blue-900/50 dark:text-blue-200 font-semibold">
                      {item.alokasiJp} JP
                    </span>
                    {item.prinsipUrutan && <span className="text-[11px] text-slate-500">{item.prinsipUrutan}</span>}
                  </div>
                  <p className="text-sm font-medium mt-1">{item.tujuanPembelajaran}</p>
                  {item.lingkupMateri && <p className="text-[11px] text-slate-500 mt-0.5">Materi: {item.lingkupMateri}</p>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button type="button" onClick={() => moveItem(idx, -1)} disabled={idx === 0} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30" title="Geser Naik">
                  <ArrowUp size={16} />
                </button>
                <button type="button" onClick={() => moveItem(idx, 1)} disabled={idx === visible.length - 1} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30" title="Geser Turun">
                  <ArrowDown size={16} />
                </button>
                <button type="button" onClick={() => startEdit(item)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg" title="Atur JP, semester, prinsip">
                  <Edit3 size={16} />
                </button>
                <button type="button" onClick={() => onDelete(item.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg" title="Hapus dari ATP">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {visible.length > 0 && (
        <p className="text-[11px] text-slate-400">
          Untuk mengubah rumusan TP, gunakan halaman{' '}
          <button type="button" onClick={() => onNavigate('tp')} className="underline text-[#178C8C] font-semibold">
            Tujuan Pembelajaran
          </button>
          ; perubahan otomatis ikut diselaraskan ke ATP.
        </p>
      )}
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

// --- 11. PERENCANAAN PEMBELAJARAN MENDALAM (dahulu "Modul Ajar") ---
const PlanSection: React.FC<{
  number: number | string;
  title: string;
  note?: string;
  dark: boolean;
  children: React.ReactNode;
}> = ({ number, title, note, dark, children }) => (
  <details open className={`rounded-2xl border ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
    <summary className="cursor-pointer select-none px-4 py-3 flex items-center justify-between gap-3 min-h-[48px]">
      <span className="flex items-center gap-2.5 font-bold text-sm">
        <span className="w-6 h-6 rounded-full bg-[#173B70] text-white text-xs flex items-center justify-center shrink-0">
          {number}
        </span>
        {title}
      </span>
      {note && <span className="text-[11px] font-semibold text-slate-500">{note}</span>}
    </summary>
    <div className="px-4 pb-4 pt-1 space-y-4">{children}</div>
  </details>
);

const PlanField: React.FC<{
  label: string;
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, htmlFor, required, optional, hint, children }) => (
  <div>
    <div className="flex flex-wrap items-center gap-2 mb-1">
      {htmlFor ? (
        <label htmlFor={htmlFor} className="text-xs font-semibold">
          {label}
        </label>
      ) : (
        <span className="text-xs font-semibold">{label}</span>
      )}
      {required && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">Wajib</span>}
      {optional && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">Opsional</span>}
    </div>
    {children}
    {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
  </div>
);

const addPhrase = (current: string, phrase: string): string => {
  const c = current || '';
  if (c.toLowerCase().includes(phrase.toLowerCase())) return c;
  return c.trim() ? `${c.replace(/[\s,]+$/, '')}, ${phrase}` : phrase;
};

const SuggestChips: React.FC<{ options: string[]; onPick: (o: string) => void; dark: boolean }> = ({ options, onPick, dark }) => (
  <div className="flex flex-wrap gap-1.5 mt-1.5">
    {options.map((o) => (
      <button
        type="button"
        key={o}
        onClick={() => onPick(o)}
        className={`text-[11px] px-2 py-1 rounded-lg border min-h-[28px] ${
          dark ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-50'
        }`}
      >
        + {o}
      </button>
    ))}
  </div>
);

const PrinsipChips: React.FC<{ value: string[]; onChange: (v: string[]) => void; dark: boolean }> = ({ value, onChange, dark }) => (
  <div className="flex flex-wrap items-center gap-1.5 mb-1.5" role="group" aria-label="Prinsip pembelajaran yang digunakan">
    <span className="text-[11px] text-slate-500">Prinsip:</span>
    {PRINSIP_PM.map((p) => {
      const on = (value || []).includes(p);
      return (
        <button
          type="button"
          key={p}
          aria-pressed={on}
          onClick={() => onChange(on ? value.filter((x) => x !== p) : [...(value || []), p])}
          className={`text-[11px] px-2.5 py-1 rounded-full border font-semibold min-h-[28px] ${
            on
              ? 'bg-[#178C8C] border-[#178C8C] text-white'
              : dark
              ? 'border-slate-700 text-slate-300'
              : 'border-slate-300 text-slate-600'
          }`}
        >
          {p}
        </button>
      );
    })}
  </div>
);

const PlanPrint: React.FC<{ m: TeachingModule; subject?: Subject; teacher: TeacherProfile }> = ({ m, subject, teacher }) => {
  const idRows: [string, string][] = [
    ['Bidang Keahlian', m.bidangKeahlian],
    ['Program Keahlian', m.programKeahlian],
    ['Konsentrasi Keahlian', m.konsentrasiKeahlian],
    ['Mata Pelajaran', subject?.namaMapel || '-'],
    ['Fase / Kelas', `${m.fase} / ${m.tingkat}`],
    ['Semester', semesterLabel(m.semester)],
    ['Jam Pelajaran', jamPelajaranText(m)],
    ['Sistem Penjadwalan', m.sistemPenjadwalan],
  ];
  const prinsipText = (p: string[]) => (p && p.length ? ` (${p.join(', ')})` : '');
  const groups: { title: string; rows: { label: string; value: React.ReactNode; show: boolean }[] }[] = [
    {
      title: 'Identifikasi',
      rows: [
        { label: 'Peserta Didik', value: m.idPesertaDidik, show: hasText(m.idPesertaDidik) },
        { label: 'Materi Pelajaran', value: m.idMateriPelajaran, show: hasText(m.idMateriPelajaran) },
        { label: 'Dimensi Profil Lulusan', value: (m.dimensiProfil || []).join(', ') || '-', show: true },
      ],
    },
    {
      title: 'Desain Pembelajaran',
      rows: [
        { label: 'Capaian Pembelajaran', value: m.capaianPembelajaran, show: hasText(m.capaianPembelajaran) },
        { label: 'Lintas Disiplin Ilmu', value: m.lintasDisiplin, show: hasText(m.lintasDisiplin) },
        { label: 'Tujuan Pembelajaran', value: m.tujuanPembelajaran || '-', show: true },
        { label: 'Topik Pembelajaran', value: m.topikPembelajaran, show: hasText(m.topikPembelajaran) },
        { label: 'Praktik Pedagogis', value: m.praktikPedagogis || '-', show: true },
        { label: 'Kemitraan Pembelajaran', value: m.kemitraan, show: hasText(m.kemitraan) },
        {
          label: 'Lingkungan Pembelajaran',
          value: (
            <>
              {hasText(m.lingkunganBudaya) && <p>Budaya belajar: {m.lingkunganBudaya}</p>}
              {hasText(m.lingkunganRuangFisik) && <p>Ruang fisik: {m.lingkunganRuangFisik}</p>}
              {hasText(m.lingkunganRuangVirtual) && <p>Ruang virtual: {m.lingkunganRuangVirtual}</p>}
              {!hasText(m.lingkunganBudaya) && !hasText(m.lingkunganRuangFisik) && !hasText(m.lingkunganRuangVirtual) && '-'}
            </>
          ),
          show: true,
        },
        { label: 'Pemanfaatan Digital', value: m.pemanfaatanDigital, show: hasText(m.pemanfaatanDigital) },
      ],
    },
    {
      title: 'Pengalaman Belajar',
      rows: [
        { label: `Awal${prinsipText(m.awalPrinsip)}`, value: m.awalKegiatan, show: hasText(m.awalKegiatan) },
        { label: `Inti: Memahami${prinsipText(m.memahamiPrinsip)}`, value: m.memahamiKegiatan || '-', show: true },
        { label: `Inti: Mengaplikasi${prinsipText(m.mengaplikasiPrinsip)}`, value: m.mengaplikasiKegiatan || '-', show: true },
        { label: `Inti: Merefleksi${prinsipText(m.merefleksiPrinsip)}`, value: m.merefleksiKegiatan || '-', show: true },
        { label: `Penutup${prinsipText(m.penutupPrinsip)}`, value: m.penutupKegiatan, show: hasText(m.penutupKegiatan) },
      ],
    },
    {
      title: 'Asesmen',
      rows: [
        { label: 'Asesmen pada Awal Pembelajaran', value: m.asesmenAwal || '-', show: true },
        { label: 'Asesmen pada Proses Pembelajaran', value: m.asesmenProses || '-', show: true },
        { label: 'Asesmen pada Akhir Pembelajaran', value: m.asesmenAkhir || '-', show: true },
      ],
    },
  ];
  const extras = [
    { label: 'Media, Alat, dan Bahan', value: m.mediaSumber },
    { label: 'Remedial dan Pengayaan', value: m.remedialPengayaan },
  ].filter((x) => hasText(x.value));

  return (
    <div className="text-slate-900 text-[11px] sm:text-xs leading-relaxed space-y-4">
      <div className="text-center font-bold uppercase leading-snug text-sm">
        <p>Perencanaan Pembelajaran Mendalam</p>
        <p>{schoolShortName(teacher)}</p>
      </div>
      <table className="text-[11px] sm:text-xs">
        <tbody>
          {idRows.map(([k, v]) => (
            <tr key={k}>
              <td className="pr-4 py-0.5 align-top whitespace-nowrap">{k}</td>
              <td className="pr-2 py-0.5 align-top">:</td>
              <td className="py-0.5 align-top">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <table className="w-full border-collapse border border-slate-800">
        <tbody>
          {groups.map((g) => {
            const rows = g.rows.filter((r) => r.show);
            return rows.map((r, i) => (
              <tr key={`${g.title}-${r.label}`} className="align-top">
                {i === 0 && (
                  <td rowSpan={rows.length} className="border border-slate-800 p-2 font-bold text-center align-middle bg-slate-100 w-24">
                    {g.title}
                  </td>
                )}
                <td className="border border-slate-800 p-2 font-semibold w-40">{r.label}</td>
                <td className="border border-slate-800 p-2 whitespace-pre-line">{r.value}</td>
              </tr>
            ));
          })}
          {extras.map((x, i) => (
            <tr key={x.label} className="align-top">
              {i === 0 && (
                <td rowSpan={extras.length} className="border border-slate-800 p-2 font-bold text-center align-middle bg-slate-100 w-24">
                  Tambahan
                </td>
              )}
              <td className="border border-slate-800 p-2 font-semibold w-40">{x.label}</td>
              <td className="border border-slate-800 p-2 whitespace-pre-line">{x.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TeachingModuleView: React.FC<{
  modules: TeachingModule[];
  subjects: Subject[];
  classes: SchoolClass[];
  atps: ATPItem[];
  tps: LearningObjective[];
  analyses: CPAnalysis[];
  cps: LearningOutcome[];
  teacher: TeacherProfile;
  settings: AppSettings;
  dark: boolean;
  onSave: (m: TeachingModule) => void;
  onDelete: (id: string) => void;
  onOpenPrint: (title: string, content: React.ReactNode, opts?: { kop?: boolean }) => void;
}> = ({ modules, subjects, classes, atps, tps, analyses, cps, teacher, settings, dark, onSave, onDelete, onOpenPrint }) => {
  const [editing, setEditing] = useState<TeachingModule | null>(null);
  const [formError, setFormError] = useState('');

  const set = (patch: Partial<TeachingModule>) => setEditing((prev) => (prev ? { ...prev, ...patch } : prev));

  const startNew = () => {
    const s = subjects[0];
    const tingkat = (s?.tingkat || 'X') as 'X' | 'XI' | 'XII';
    setFormError('');
    setEditing({
      id: uid('mod'),
      judulModul: '',
      subjectId: s?.id || '',
      classId: classes[0]?.id || '',
      atpId: '',
      tpId: '',
      fase: faseOfTingkat(tingkat),
      tingkat,
      semester: settings.semester,
      tahunAjaran: settings.tahunAjaran,
      alokasiWaktu: '4 Pertemuan (16 JP x 45 Menit)',
      bidangKeahlian: modules[0]?.bidangKeahlian || DEFAULT_BIDANG_KEAHLIAN,
      programKeahlian: s?.programKeahlian || '',
      konsentrasiKeahlian: s?.konsentrasiKeahlian || '',
      jpPerPertemuan: 4,
      menitPerJp: 45,
      jumlahPertemuan: 4,
      sistemPenjadwalan: modules[0]?.sistemPenjadwalan || 'Blok',
      idPesertaDidik: '',
      idMateriPelajaran: '',
      dimensiProfil: [],
      capaianPembelajaran: '',
      lintasDisiplin: '',
      tujuanPembelajaran: '',
      topikPembelajaran: '',
      praktikPedagogis: '',
      kemitraan: '',
      lingkunganBudaya: '',
      lingkunganRuangFisik: '',
      lingkunganRuangVirtual: '',
      pemanfaatanDigital: '',
      awalPrinsip: [],
      awalKegiatan: '',
      memahamiPrinsip: [],
      memahamiKegiatan: '',
      mengaplikasiPrinsip: [],
      mengaplikasiKegiatan: '',
      merefleksiPrinsip: [],
      merefleksiKegiatan: '',
      penutupPrinsip: [],
      penutupKegiatan: '',
      asesmenAwal: '',
      asesmenProses: '',
      asesmenAkhir: '',
      mediaSumber: '',
      remedialPengayaan: '',
      catatanMigrasi: '',
      schemaVersion: 2,
      status: 'Draft',
      updatedAt: todayISO(),
    });
  };

  const inputCls = `w-full px-3.5 py-2.5 rounded-xl border text-sm min-h-[44px] ${
    dark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
  }`;
  const cardCls = `rounded-2xl border ${dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'}`;

  const applySubject = (id: string) => {
    const s = subjects.find((x) => x.id === id);
    if (!s) return;
    set({
      subjectId: id,
      tingkat: s.tingkat,
      fase: faseOfTingkat(s.tingkat),
      programKeahlian: s.programKeahlian,
      konsentrasiKeahlian: s.konsentrasiKeahlian,
      tpId: '',
      atpId: '',
    });
  };

  const applyTp = (id: string) => {
    const tp = tps.find((x) => x.id === id);
    if (!tp) {
      set({ tpId: '', atpId: '' });
      return;
    }
    const atp = atps.find((a) => a.tpId === tp.id);
    set({
      tpId: tp.id,
      atpId: atp?.id || '',
      tingkat: tp.tingkat,
      fase: faseOfTingkat(tp.tingkat),
      tujuanPembelajaran: tp.rumusan,
      capaianPembelajaran: cpTextForTp(tp, analyses, cps),
    });
  };

  if (editing) {
    const checklist = planChecklist(editing);
    const missing = checklist.filter((c) => !c.ok);
    const done = checklist.length - missing.length;
    const subjectTps = tps.filter((x) => x.subjectId === editing.subjectId).sort(compareTp);
    const ta = (v: string) => `${inputCls} min-h-[88px]`;

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setFormError('');
      if (!hasText(editing.judulModul)) {
        setFormError('Judul perencanaan wajib diisi.');
        return;
      }
      if (editing.status === 'Final' && missing.length > 0) {
        setFormError(`Status Final memerlukan semua butir wajib terisi. Belum lengkap: ${missing.map((x) => x.label).join('; ')}.`);
        return;
      }
      onSave({
        ...editing,
        fase: faseOfTingkat(editing.tingkat),
        alokasiWaktu: alokasiRingkas(editing),
        schemaVersion: 2,
        updatedAt: todayISO(),
      });
      setEditing(null);
    };

    return (
      <form onSubmit={handleSubmit} className={`${cardCls} p-5 sm:p-6 space-y-4`} aria-label="Formulir Perencanaan Pembelajaran Mendalam">
        <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800 gap-3">
          <div>
            <h3 className="font-bold text-lg">Perencanaan Pembelajaran Mendalam</h3>
            <p className="text-xs text-slate-500">Mengikuti kerangka Panduan Pembelajaran Mendalam: Identifikasi, Desain Pembelajaran, Pengalaman Belajar, Asesmen.</p>
          </div>
          <button type="button" onClick={() => setEditing(null)} className="text-xs px-3 py-1.5 rounded-lg border min-h-[36px]">
            Kembali
          </button>
        </div>

        {hasText(editing.catatanMigrasi) && (
          <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-xs space-y-2" role="note">
            <p className="font-bold text-amber-800 dark:text-amber-200">
              Catatan dari format Modul Ajar lama (tidak ikut tercetak)
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              Bagian ini tidak punya padanan otomatis. Salin ke kolom yang sesuai di bawah (mis. kegiatan inti ke Memahami, Mengaplikasi, dan Merefleksi), lalu hapus catatan ini.
            </p>
            <pre className="whitespace-pre-wrap font-sans text-xs p-3 rounded-lg bg-white/60 dark:bg-slate-900/60 border border-amber-500/30">{editing.catatanMigrasi}</pre>
            <button type="button" onClick={() => set({ catatanMigrasi: '' })} className="px-3 py-1.5 rounded-lg border border-amber-600 text-amber-800 dark:text-amber-200 font-semibold min-h-[36px]">
              Hapus catatan ini
            </button>
          </div>
        )}

        <PlanSection number="•" title="Identitas" dark={dark}>
          <PlanField label="Judul Perencanaan" htmlFor="pl-judul" required>
            <input id="pl-judul" className={inputCls} value={editing.judulModul} onChange={(e) => set({ judulModul: e.target.value })} placeholder="Contoh: Penyetelan Celah Katup dan Pemeriksaan Tekanan Kompresi" />
          </PlanField>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PlanField label="Bidang Keahlian" htmlFor="pl-bidang">
              <input id="pl-bidang" className={inputCls} value={editing.bidangKeahlian} onChange={(e) => set({ bidangKeahlian: e.target.value })} />
            </PlanField>
            <PlanField label="Program Keahlian" htmlFor="pl-program">
              <input id="pl-program" className={inputCls} value={editing.programKeahlian} onChange={(e) => set({ programKeahlian: e.target.value })} />
            </PlanField>
            <PlanField label="Konsentrasi Keahlian" htmlFor="pl-konsentrasi">
              <input id="pl-konsentrasi" className={inputCls} value={editing.konsentrasiKeahlian} onChange={(e) => set({ konsentrasiKeahlian: e.target.value })} />
            </PlanField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <PlanField label="Mata Pelajaran" htmlFor="pl-mapel">
                <select id="pl-mapel" className={inputCls} value={editing.subjectId} onChange={(e) => applySubject(e.target.value)}>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.namaMapel}</option>
                  ))}
                </select>
              </PlanField>
            </div>
            <PlanField label="Kelas (Fase ditentukan otomatis)" htmlFor="pl-kelas">
              <select id="pl-kelas" className={inputCls} value={editing.tingkat} onChange={(e) => set({ tingkat: e.target.value as 'X' | 'XI' | 'XII', fase: faseOfTingkat(e.target.value as 'X' | 'XI' | 'XII') })}>
                <option value="X">Kelas X (Fase E)</option>
                <option value="XI">Kelas XI (Fase F)</option>
                <option value="XII">Kelas XII (Fase F)</option>
              </select>
            </PlanField>
            <PlanField label="Semester" htmlFor="pl-semester">
              <select id="pl-semester" className={inputCls} value={editing.semester} onChange={(e) => set({ semester: e.target.value as 'Ganjil' | 'Genap' })}>
                <option value="Ganjil">1 (Satu)</option>
                <option value="Genap">2 (Dua)</option>
              </select>
            </PlanField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <PlanField label="JP per pertemuan" htmlFor="pl-jp">
              <input id="pl-jp" type="number" min={1} className={inputCls} value={editing.jpPerPertemuan} onChange={(e) => set({ jpPerPertemuan: Math.max(1, Number(e.target.value) || 1) })} />
            </PlanField>
            <PlanField label="Menit per JP" htmlFor="pl-menit">
              <input id="pl-menit" type="number" min={1} className={inputCls} value={editing.menitPerJp} onChange={(e) => set({ menitPerJp: Math.max(1, Number(e.target.value) || 1) })} />
            </PlanField>
            <PlanField label="Jumlah pertemuan" htmlFor="pl-pertemuan">
              <input id="pl-pertemuan" type="number" min={1} className={inputCls} value={editing.jumlahPertemuan} onChange={(e) => set({ jumlahPertemuan: Math.max(1, Number(e.target.value) || 1) })} />
            </PlanField>
            <PlanField label="Sistem Penjadwalan" htmlFor="pl-sistem">
              <select id="pl-sistem" className={inputCls} value={editing.sistemPenjadwalan} onChange={(e) => set({ sistemPenjadwalan: e.target.value })}>
                {SISTEM_PENJADWALAN.map((x) => (
                  <option key={x} value={x}>{x}</option>
                ))}
              </select>
            </PlanField>
          </div>
          <p className="text-xs text-slate-500">
            Tertulis di dokumen: <strong>Jam Pelajaran: {jamPelajaranText(editing)}</strong> (total {editing.jpPerPertemuan * editing.jumlahPertemuan} JP) • Fase / Kelas: {faseOfTingkat(editing.tingkat)} / {editing.tingkat} • Semester: {semesterLabel(editing.semester)}
          </p>
        </PlanSection>

        <PlanSection number={1} title="Identifikasi" note="Dimensi profil lulusan wajib" dark={dark}>
          <PlanField label="Peserta Didik" htmlFor="pl-peserta" optional hint="Kesiapan sebelum belajar: pengetahuan awal, minat, latar belakang, dan kebutuhan belajar.">
            <textarea id="pl-peserta" className={ta(editing.idPesertaDidik)} value={editing.idPesertaDidik} onChange={(e) => set({ idPesertaDidik: e.target.value })} />
          </PlanField>
          <PlanField label="Materi Pelajaran" htmlFor="pl-materi" optional hint="Jenis pengetahuan yang dicapai, relevansi dengan kehidupan nyata, tingkat kesulitan, struktur materi, dan integrasi nilai dan karakter.">
            <textarea id="pl-materi" className={ta(editing.idMateriPelajaran)} value={editing.idMateriPelajaran} onChange={(e) => set({ idMateriPelajaran: e.target.value })} />
          </PlanField>
          <div role="group" aria-labelledby="pl-dimensi-label">
            <div className="flex items-center gap-2 mb-1.5">
              <span id="pl-dimensi-label" className="text-xs font-semibold">Dimensi Profil Lulusan</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">Wajib</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {DIMENSI_PROFIL.map((dim) => {
                const on = editing.dimensiProfil.includes(dim);
                return (
                  <label
                    key={dim}
                    className={`flex items-start gap-2 p-2.5 rounded-xl border text-xs cursor-pointer min-h-[44px] ${
                      on ? 'border-[#178C8C] bg-[#178C8C]/10' : dark ? 'border-slate-700' : 'border-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 w-4 h-4"
                      checked={on}
                      onChange={() => set({ dimensiProfil: on ? editing.dimensiProfil.filter((x) => x !== dim) : [...editing.dimensiProfil, dim] })}
                    />
                    <span>{dim}</span>
                  </label>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Pilih dimensi yang menjadi fokus pencapaian dalam pembelajaran ini.</p>
          </div>
        </PlanSection>

        <PlanSection number={2} title="Desain Pembelajaran" note="Tujuan, praktik pedagogis, lingkungan wajib" dark={dark}>
          <PlanField label="Ambil dari Tujuan Pembelajaran (TP)" htmlFor="pl-tp" optional hint="Memilih TP mengisi otomatis tujuan pembelajaran dan capaian pembelajaran (tetap dapat Anda sunting).">
            <select id="pl-tp" className={inputCls} value={editing.tpId} onChange={(e) => applyTp(e.target.value)}>
              <option value="">— Tidak dipilih —</option>
              {subjectTps.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.kodeTp} — {x.rumusan.length > 80 ? `${x.rumusan.slice(0, 80)}…` : x.rumusan}
                </option>
              ))}
            </select>
          </PlanField>
          <PlanField label="Capaian Pembelajaran" htmlFor="pl-cp" optional hint="Capaian pembelajaran sesuai fase.">
            <textarea id="pl-cp" className={ta(editing.capaianPembelajaran)} value={editing.capaianPembelajaran} onChange={(e) => set({ capaianPembelajaran: e.target.value })} />
          </PlanField>
          <PlanField label="Lintas Disiplin Ilmu" htmlFor="pl-lintas" optional hint="Disiplin ilmu dan/atau mata pelajaran lain yang relevan.">
            <input id="pl-lintas" className={inputCls} value={editing.lintasDisiplin} onChange={(e) => set({ lintasDisiplin: e.target.value })} />
          </PlanField>
          <PlanField label="Tujuan Pembelajaran" htmlFor="pl-tujuan" required hint="Mencakup kompetensi dan konten pada lingkup materi, memakai kata kerja operasional yang relevan.">
            <textarea id="pl-tujuan" className={ta(editing.tujuanPembelajaran)} value={editing.tujuanPembelajaran} onChange={(e) => set({ tujuanPembelajaran: e.target.value })} />
          </PlanField>
          <PlanField label="Topik Pembelajaran" htmlFor="pl-topik" optional hint="Topik yang relevan dengan capaian dan tujuan pembelajaran.">
            <input id="pl-topik" className={inputCls} value={editing.topikPembelajaran} onChange={(e) => set({ topikPembelajaran: e.target.value })} />
          </PlanField>
          <PlanField label="Praktik Pedagogis" htmlFor="pl-pedagogis" required hint="Model, strategi, atau metode yang dipilih untuk mencapai tujuan belajar.">
            <textarea id="pl-pedagogis" className={ta(editing.praktikPedagogis)} value={editing.praktikPedagogis} onChange={(e) => set({ praktikPedagogis: e.target.value })} />
            <SuggestChips dark={dark} onPick={(o) => set({ praktikPedagogis: addPhrase(editing.praktikPedagogis, o) })} options={['Pembelajaran Berbasis Proyek', 'Pembelajaran Berbasis Masalah', 'Pembelajaran Inkuiri', 'Pembelajaran Kolaboratif', 'Pembelajaran Kontekstual', 'Pembelajaran Berdiferensiasi', 'Teaching Factory', 'Demonstrasi dan praktik terbimbing']} />
          </PlanField>
          <PlanField label="Kemitraan Pembelajaran" htmlFor="pl-kemitraan" optional hint="Kolaborasi di dalam dan/atau luar sekolah.">
            <textarea id="pl-kemitraan" className={ta(editing.kemitraan)} value={editing.kemitraan} onChange={(e) => set({ kemitraan: e.target.value })} />
            <SuggestChips dark={dark} onPick={(o) => set({ kemitraan: addPhrase(editing.kemitraan, o) })} options={['Dunia usaha dan dunia industri (DUDI)', 'Instruktur bengkel/dealer', 'Guru lintas mata pelajaran', 'MGMP', 'Orang tua', 'Komunitas otomotif']} />
          </PlanField>
          <div role="group" aria-labelledby="pl-ling-label" className="space-y-3">
            <div className="flex items-center gap-2">
              <span id="pl-ling-label" className="text-xs font-semibold">Lingkungan Pembelajaran</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">Wajib</span>
              <span className="text-[11px] text-slate-400">minimal salah satu terisi; ruang virtual bersifat opsional</span>
            </div>
            <PlanField label="Budaya belajar" htmlFor="pl-ling-budaya" hint="Iklim belajar yang aman, nyaman, dan saling memuliakan.">
              <input id="pl-ling-budaya" className={inputCls} value={editing.lingkunganBudaya} onChange={(e) => set({ lingkunganBudaya: e.target.value })} />
            </PlanField>
            <PlanField label="Ruang fisik" htmlFor="pl-ling-fisik">
              <input id="pl-ling-fisik" className={inputCls} value={editing.lingkunganRuangFisik} onChange={(e) => set({ lingkunganRuangFisik: e.target.value })} placeholder="mis. bengkel TSM, ruang kelas, laboratorium" />
            </PlanField>
            <PlanField label="Ruang virtual" htmlFor="pl-ling-virtual" optional>
              <input id="pl-ling-virtual" className={inputCls} value={editing.lingkunganRuangVirtual} onChange={(e) => set({ lingkunganRuangVirtual: e.target.value })} placeholder="mis. LMS, forum diskusi daring" />
            </PlanField>
          </div>
          <PlanField label="Pemanfaatan Digital" htmlFor="pl-digital" optional hint="Teknologi untuk pembelajaran yang interaktif, kolaboratif, dan kontekstual.">
            <textarea id="pl-digital" className={ta(editing.pemanfaatanDigital)} value={editing.pemanfaatanDigital} onChange={(e) => set({ pemanfaatanDigital: e.target.value })} />
            <SuggestChips dark={dark} onPick={(o) => set({ pemanfaatanDigital: addPhrase(editing.pemanfaatanDigital, o) })} options={['Video pembelajaran', 'Platform pembelajaran (LMS)', 'Perpustakaan digital', 'Forum diskusi daring', 'Aplikasi penilaian', 'Simulasi dan animasi']} />
          </PlanField>
        </PlanSection>

        <PlanSection number={3} title="Pengalaman Belajar" note="Memahami, Mengaplikasi, Merefleksi wajib" dark={dark}>
          <div>
            <p className="text-xs font-bold mb-1">Awal <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 ml-1">Opsional</span></p>
            <PrinsipChips dark={dark} value={editing.awalPrinsip} onChange={(v) => set({ awalPrinsip: v })} />
            <textarea aria-label="Kegiatan awal" className={ta(editing.awalKegiatan)} value={editing.awalKegiatan} onChange={(e) => set({ awalKegiatan: e.target.value })} placeholder="Orientasi yang bermakna, apersepsi kontekstual, motivasi yang menggembirakan (termasuk pertanyaan pemantik, safety briefing, dan APD)." />
          </div>
          <div className="space-y-4 p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            <p className="text-xs font-bold">Inti <span className="font-normal text-slate-500">(tidak harus selesai dalam satu pertemuan)</span></p>
            <div>
              <p className="text-xs font-semibold mb-1">Memahami <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 ml-1">Wajib</span></p>
              <PrinsipChips dark={dark} value={editing.memahamiPrinsip} onChange={(v) => set({ memahamiPrinsip: v })} />
              <textarea aria-label="Kegiatan memahami" className={`${ta(editing.memahamiKegiatan)} min-h-[110px]`} value={editing.memahamiKegiatan} onChange={(e) => set({ memahamiKegiatan: e.target.value })} placeholder="Kegiatan agar peserta didik aktif mengonstruksi pengetahuan (esensial, aplikatif, nilai dan karakter) dari berbagai sumber dan konteks." />
            </div>
            <div>
              <p className="text-xs font-semibold mb-1">Mengaplikasi <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 ml-1">Wajib</span></p>
              <PrinsipChips dark={dark} value={editing.mengaplikasiPrinsip} onChange={(v) => set({ mengaplikasiPrinsip: v })} />
              <textarea aria-label="Kegiatan mengaplikasi" className={`${ta(editing.mengaplikasiKegiatan)} min-h-[110px]`} value={editing.mengaplikasiKegiatan} onChange={(e) => set({ mengaplikasiKegiatan: e.target.value })} placeholder="Kegiatan mengaplikasi pemahaman secara kontekstual atau kehidupan nyata (praktik bengkel, proyek, kerja sama tim)." />
            </div>
            <div>
              <p className="text-xs font-semibold mb-1">Merefleksi <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 ml-1">Wajib</span></p>
              <PrinsipChips dark={dark} value={editing.merefleksiPrinsip} onChange={(v) => set({ merefleksiPrinsip: v })} />
              <textarea aria-label="Kegiatan merefleksi" className={`${ta(editing.merefleksiKegiatan)} min-h-[110px]`} value={editing.merefleksiKegiatan} onChange={(e) => set({ merefleksiKegiatan: e.target.value })} placeholder="Kegiatan mengevaluasi dan memaknai proses dan hasil praktik, menentukan tindak lanjut, serta mengelola proses belajar secara mandiri (regulasi diri)." />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold mb-1">Penutup <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 ml-1">Opsional</span></p>
            <PrinsipChips dark={dark} value={editing.penutupPrinsip} onChange={(v) => set({ penutupPrinsip: v })} />
            <textarea aria-label="Kegiatan penutup" className={ta(editing.penutupKegiatan)} value={editing.penutupKegiatan} onChange={(e) => set({ penutupKegiatan: e.target.value })} placeholder="Umpan balik konstruktif, menyimpulkan pembelajaran, merencanakan pembelajaran berikutnya bersama peserta didik (termasuk penerapan 5R)." />
          </div>
        </PlanSection>

        <PlanSection number={4} title="Asesmen" note="Awal, proses, dan akhir wajib" dark={dark}>
          <p className="text-[11px] text-slate-500">
            Tuliskan teknik dan instrumen penilaian. Asesmen dalam Pembelajaran Mendalam mencakup asesmen sebagai pembelajaran (penilaian diri dan sejawat), untuk pembelajaran (umpan balik), dan hasil pembelajaran (capaian dan tindak lanjut).
          </p>
          {([
            ['pl-as-awal', 'Asesmen pada Awal Pembelajaran', 'asesmenAwal', ['Pertanyaan diagnostik', 'Kuis singkat pengetahuan awal']],
            ['pl-as-proses', 'Asesmen pada Proses Pembelajaran', 'asesmenProses', ['Observasi', 'Penilaian kinerja', 'Penilaian sejawat', 'Penilaian diri', 'Umpan balik formatif']],
            ['pl-as-akhir', 'Asesmen pada Akhir Pembelajaran', 'asesmenAkhir', ['Uji kinerja', 'Penilaian proyek', 'Penilaian produk', 'Portofolio', 'Jurnal refleksi', 'Tes tertulis', 'Tes lisan']],
          ] as [string, string, 'asesmenAwal' | 'asesmenProses' | 'asesmenAkhir', string[]][]).map(([id, label, key, opts]) => (
            <PlanField key={id} label={label} htmlFor={id} required>
              <textarea id={id} className={ta(editing[key])} value={editing[key]} onChange={(e) => set({ [key]: e.target.value } as Partial<TeachingModule>)} />
              <SuggestChips dark={dark} onPick={(o) => set({ [key]: addPhrase(editing[key], o) } as Partial<TeachingModule>)} options={opts} />
            </PlanField>
          ))}
        </PlanSection>

        <PlanSection number="+" title="Tambahan (di luar kerangka resmi)" note="Opsional" dark={dark}>
          <PlanField label="Media, alat, bahan, dan K3LH" htmlFor="pl-media" optional hint="Berguna untuk praktik bengkel TSM: unit, BPR, SST, APD, dan lainnya.">
            <textarea id="pl-media" className={ta(editing.mediaSumber)} value={editing.mediaSumber} onChange={(e) => set({ mediaSumber: e.target.value })} />
          </PlanField>
          <PlanField label="Remedial dan pengayaan" htmlFor="pl-remedial" optional>
            <textarea id="pl-remedial" className={ta(editing.remedialPengayaan)} value={editing.remedialPengayaan} onChange={(e) => set({ remedialPengayaan: e.target.value })} />
          </PlanField>
        </PlanSection>

        <div className={`sticky bottom-0 -mx-5 sm:-mx-6 px-5 sm:px-6 py-3 border-t flex flex-wrap items-center justify-between gap-3 ${dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="text-xs">
            <p className={`font-bold ${missing.length ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-300'}`} role="status">
              Kelengkapan wajib: {done} dari {checklist.length}
            </p>
            {missing.length > 0 && <p className="text-slate-500 max-w-xl">Belum: {missing.map((x) => x.label).join('; ')}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs font-semibold" htmlFor="pl-status">Status</label>
            <select id="pl-status" className={`${inputCls} w-auto`} value={editing.status} onChange={(e) => set({ status: e.target.value as 'Draft' | 'Final' | 'Arsip' })}>
              <option value="Draft">Draft</option>
              <option value="Final" disabled={missing.length > 0}>Final{missing.length ? ' (lengkapi butir wajib)' : ''}</option>
              <option value="Arsip">Arsip</option>
            </select>
            <button type="button" onClick={() => setEditing(null)} className="px-4 py-2.5 rounded-xl border text-sm min-h-[44px]">Batal</button>
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-[#173B70] text-white font-semibold text-sm min-h-[44px]">Simpan Perencanaan</button>
          </div>
        </div>
        {formError && (
          <div className="p-3 rounded-xl bg-rose-500/15 text-rose-700 dark:text-rose-300 text-xs font-semibold" role="alert">{formError}</div>
        )}
      </form>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Susun Perencanaan Pembelajaran Mendalam: Identifikasi, Desain Pembelajaran, Pengalaman Belajar, dan Asesmen.
        </p>
        <button onClick={startNew} className="px-4 py-2.5 rounded-xl bg-[#173B70] text-white text-sm font-semibold flex items-center gap-2 min-h-[44px]">
          <Plus size={17} /> Buat Perencanaan Baru
        </button>
      </div>

      {modules.length === 0 && (
        <div className={`${cardCls} p-6 text-sm text-slate-500`}>
          Belum ada perencanaan pembelajaran. Klik "Buat Perencanaan Baru"; Anda dapat mengambil tujuan pembelajaran langsung dari daftar TP.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((m) => {
          const subject = subjects.find((s) => s.id === m.subjectId);
          const checklist = planChecklist(m);
          const missing = checklist.filter((c) => !c.ok);
          const tp = tps.find((x) => x.id === m.tpId);
          return (
            <div key={m.id} className={`p-5 ${cardCls} flex flex-col justify-between gap-4`}>
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">{m.status}</span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${missing.length ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {missing.length ? `Wajib ${checklist.length - missing.length}/${checklist.length}` : 'Kerangka lengkap'}
                  </span>
                  {tp && <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#178C8C]/15 text-[#178C8C]">{tp.kodeTp}</span>}
                </div>
                <h4 className="font-bold text-base mt-2">{m.judulModul}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  {subject?.namaMapel || '-'} • Kelas {m.tingkat} • Semester {semesterLabel(m.semester)}
                </p>
                <p className="text-xs text-slate-500">
                  {jamPelajaranText(m)} • {m.sistemPenjadwalan}
                </p>
                {m.dimensiProfil.length > 0 && <p className="text-[11px] text-slate-400 mt-1">Dimensi: {m.dimensiProfil.join(', ')}</p>}
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button onClick={() => { setFormError(''); setEditing(m); }} className="px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 min-h-[36px]">
                  <Edit3 size={14} /> Edit
                </button>
                <button
                  onClick={() => onOpenPrint(m.judulModul, <PlanPrint m={m} subject={subject} teacher={teacher} />, { kop: false })}
                  className="px-3 py-1.5 rounded-lg bg-[#178C8C] text-white text-xs font-semibold flex items-center gap-1 min-h-[36px]"
                >
                  <Printer size={14} /> Cetak A4
                </button>
                <button onClick={() => onDelete(m.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg ml-auto" title="Hapus perencanaan">
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
  syncDetail?: string;
  accountEmail: string;
  onChangePassword: (oldPwd: string, newPwd: string) => Promise<{ ok: boolean; message: string }>;
  onTestConnection: (url: string) => void;
  onForcePush: () => void;
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
  onForcePush,
  syncDetail,
  accountEmail,
  onChangePassword,
  onRestoreDatabase,
  onResetLocal,
}) => {
  const [urlInput, setUrlInput] = useState(settings.appsScriptUrl);
  const [pwdBusy, setPwdBusy] = useState(false);
  const [tahun, setTahun] = useState(settings.tahunAjaran);
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>(settings.semester);

  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdStatus, setPwdStatus] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  const dark = settings.darkMode;
  const inputCls = `w-full px-3.5 py-2.5 rounded-xl border text-sm min-h-[44px] ${
    dark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
  }`;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdBusy) return;
    setPwdStatus(null);
    if (newPwd.length < 10) {
      setPwdStatus({ type: 'err', text: 'Kata sandi baru minimal 10 karakter.' });
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdStatus({ type: 'err', text: 'Konfirmasi kata sandi baru tidak cocok.' });
      return;
    }
    setPwdBusy(true);
    try {
      const res = await onChangePassword(oldPwd, newPwd);
      if (res.ok) {
        setOldPwd('');
        setNewPwd('');
        setConfirmPwd('');
        setPwdStatus({ type: 'ok', text: res.message || 'Kata sandi berhasil diperbarui!' });
      } else {
        setPwdStatus({ type: 'err', text: res.message || 'Gagal memperbarui kata sandi.' });
      }
    } finally {
      setPwdBusy(false);
    }
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
          <h3 className="font-bold text-base">Keamanan Akun & Ubah Kata Sandi</h3>
        </div>
        <p className="text-xs text-slate-500">
          Akun aktif: <strong>{accountEmail || '-'}</strong>. Kata sandi diperiksa di server (Google Apps Script) dan tidak disimpan di aplikasi. Mengganti kata sandi akan mengeluarkan perangkat lain.
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
            <input type="password" required className={inputCls} value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="Min. 10 karakter, huruf + angka/simbol" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Konfirmasi Sandi Baru *</label>
            <input type="password" required className={inputCls} value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} placeholder="Ulangi sandi baru" />
          </div>
        </div>
        <button
          type="submit"
          disabled={pwdBusy}
          className="px-5 py-2.5 rounded-xl bg-[#173B70] disabled:opacity-60 text-white text-xs font-bold min-h-[44px]"
        >
          {pwdBusy ? 'Memproses...' : 'Perbarui Kata Sandi'}
        </button>
      </form>

      <div className={`p-6 rounded-2xl border space-y-4 ${dark ? 'bg-[#13203B] border-slate-800' : 'bg-white border-slate-200'}`}>
        <h3 className="font-bold text-base">Koneksi Backend Google Apps Script & Tahun Ajaran</h3>
        <p className="text-xs text-slate-500">
          Aplikasi menyinkronkan data setiap kali dibuka dan setiap kali Anda menyimpan perubahan. Cloud tidak akan ditimpa jika status cloud tidak dapat dipastikan atau jika data cloud berubah dari perangkat lain; Anda akan diminta memilih.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="set-url" className="block text-xs font-semibold mb-1">URL Web App Google Apps Script</label>
            <input
              id="set-url"
              className={inputCls}
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
            {urlInput.trim() && urlInput.trim() !== APP_CONFIG.defaultAppsScriptUrl ? (
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="text-amber-700 dark:text-amber-300 font-semibold">
                  URL kustom: berbeda dari URL bawaan aplikasi.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setUrlInput(APP_CONFIG.defaultAppsScriptUrl);
                    onUpdateSettings({ ...settings, appsScriptUrl: APP_CONFIG.defaultAppsScriptUrl, tahunAjaran: tahun, semester });
                  }}
                  className="px-2.5 py-1 rounded-lg border border-[#178C8C] text-[#178C8C] font-semibold min-h-[32px]"
                >
                  Pakai URL bawaan
                </button>
              </div>
            ) : (
              <p className="mt-1.5 text-[11px] text-slate-400">Memakai URL bawaan aplikasi.</p>
            )}
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
            onClick={() => {
              const finalUrl = urlInput.trim() || APP_CONFIG.defaultAppsScriptUrl;
              setUrlInput(finalUrl);
              onUpdateSettings({ ...settings, appsScriptUrl: finalUrl, tahunAjaran: tahun, semester });
            }}
            className="px-5 py-2.5 rounded-xl bg-[#173B70] text-white text-xs font-bold min-h-[44px]"
          >
            Simpan Konfigurasi
          </button>
          <button
            onClick={() => onTestConnection(urlInput.trim())}
            className="px-4 py-2.5 rounded-xl border text-xs font-bold min-h-[44px]"
          >
            Test Koneksi API
          </button>
          <button
            onClick={onSyncNow}
            className="px-4 py-2.5 rounded-xl bg-[#178C8C] text-white text-xs font-bold min-h-[44px]"
          >
            Sinkronkan Sekarang
          </button>
          <button
            onClick={onPullFromCloud}
            className="px-4 py-2.5 rounded-xl border border-teal-600 text-teal-700 dark:text-teal-300 text-xs font-bold min-h-[44px]"
          >
            Ambil Data dari Sheets (Pull)
          </button>
          <button
            onClick={onForcePush}
            className="px-4 py-2.5 rounded-xl border border-rose-500 text-rose-700 dark:text-rose-300 text-xs font-bold min-h-[44px]"
          >
            Timpa Cloud dengan Data Lokal
          </button>
        </div>
        <p className="text-xs text-slate-500">Sinkronisasi terakhir: {lastSyncTime}</p>
        {syncDetail ? <p className="text-xs text-rose-600 dark:text-rose-300">{syncDetail}</p> : null}
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
            <li>Muat ulang Spreadsheet, lalu buka menu <strong>MotoTeach → Atur email &amp; kata sandi admin</strong> dan isi email serta kata sandi baru (minimal 10 karakter).</li>
          </ol>
        </div>

        <div className={cardCls}>
          <span className="text-xs font-extrabold text-[#178C8C]">TAHAP 3 — DEPLOY SEBAGAI WEB APP</span>
          <ol className="list-decimal list-inside text-xs sm:text-sm space-y-1.5 pt-1">
            <li>Klik <strong>Terapkan (Deploy)</strong> → <strong>Deployment baru</strong> → <strong>Aplikasi web</strong>.</li>
            <li><em>Jalankan sebagai</em>: <strong>Saya</strong>; <em>Yang memiliki akses</em>: <strong>Siapa saja (Anyone)</strong>.</li>
            <li>Salin <strong>URL Aplikasi Web</strong> yang muncul.</li>
            <li>Setiap kali kode diubah, buat <strong>Deployment baru</strong> (versi baru) agar perubahan berlaku.</li>
          </ol>
        </div>

        <div className={cardCls}>
          <span className="text-xs font-extrabold text-[#178C8C]">TAHAP 4 — MENGHUBUNGKAN KE APLIKASI</span>
          <ol className="list-decimal list-inside text-xs sm:text-sm space-y-1.5 pt-1">
            <li>Buka menu <strong>Pengaturan & Backup</strong> di sidebar kiri aplikasi ini.</li>
            <li>Tempel URL Web App lalu klik <strong>Simpan Konfigurasi</strong>. Setelah masuk dengan email dan kata sandi admin, klik <strong>Test Koneksi API</strong>.</li>
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
