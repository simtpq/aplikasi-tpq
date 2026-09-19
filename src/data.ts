import { Kelas, Santri, Setoran, Pembayaran, Tabungan, Pengaturan, InformasiKhusus, Mutabaah, DbUser, MataPelajaran, WebsiteData, Agenda } from './types';

export const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbweAnEM4tJJCeCK52JpDPk_kJWcgTw_7rfh6J76K8co1Yb5nW32udrw9R06ERIFMzEz/exec";
// Master Apps Script URL khusus untuk otentikasi multi-lembaga
export const MASTER_LOGIN_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzPe3Inw1ak1kzaUzzQ-r1yUut-quXgkC4xynQPUjVL68FlqPF1MKL_nENllOkB88Hn/exec";

// Helper untuk mengambil 4 karakter terakhir dari Apps Script URL sebelum '/exec'
export const getAppScriptPrefix = (url: string): string => {
  if (!url) return "TPQ1";
  const cleanUrl = url.trim().replace(/\/exec$/, "");
  const lastFour = cleanUrl.slice(-4);
  return lastFour || "TPQ1";
};

export const INITIAL_USERS: DbUser[] = [
  { username: 'ustadz', password: '123', nama_lengkap: 'Ustadz Hanafi, M.Pd.', role: 'Ustadz' },
  { username: 'admin', password: '123', nama_lengkap: 'Admin TPQ', role: 'Admin' }
];

export const DAFTAR_SURAH = [
  "Al-Fatihah", "Al-Baqarah", "Ali 'Imran", "An-Nisa'", "Al-Ma'idah", "Al-An'am", "Al-A'raf", "Al-Anfal", "At-Taubah",
  "Yunus", "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr", "An-Nahl", "Al-Isra'", "Al-Kahf", "Maryam", "Ta Ha",
  "Al-Anbiya'", "Al-Hajj", "Al-Mu'minun", "An-Nur", "Al-Furqan", "Asy-Syu'ara'", "An-Naml", "Al-Qasas", "Al-'Ankabut",
  "Ar-Rum", "Luqman", "As-Sajdah", "Al-Ahzab", "Saba'", "Fatir", "Ya Sin", "As-Saffat", "Sad", "Az-Zumar", "Ghafir",
  "Fussilat", "Asy-Syura", "Az-Zukhruf", "Ad-Dukhan", "Al-Jasiyah", "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat",
  "Qaf", "Az-Zariyat", "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahman", "Al-Waqi'ah", "Al-Hadid", "Al-Mujadilah",
  "Al-Hasyr", "Al-Mumtahanah", "As-Saff", "Al-Jumu'ah", "Al-Munafiqun", "At-Tagabun", "At-Talaq", "At-Tahrim",
  "Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij", "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddassir", "Al-Qiyamah",
  "Al-Insan", "Al-Mursalat", "An-Naba'", "An-Nazi'at", "'Abasa", "At-Takwir", "Al-Infitar", "Al-Mutaffifin",
  "Al-Insyiqaq", "Al-Buruj", "At-Tariq", "Al-A'la", "Al-Gasyiyah", "Al-Fajr", "Al-Balad", "Asy-Syams", "Al-Lail",
  "Ad-Duha", "Asy-Syarh", "At-Tin", "Al-'Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-'Adiyat", "Al-Qari'ah",
  "At-Takasur", "Al-'Asr", "Al-Humazah", "Al-Fil", "Quraisy", "Al-Ma'un", "Al-Kausar", "Al-Kafirun", "An-Nasr",
  "Al-Lahab", "Al-Ikhlas", "Al-Falaq", "An-Nas"
];

export const INITIAL_CLASSES: Kelas[] = [
  { id_kelas: 'K1', nama_kelas: 'Abu Bakar' },
  { id_kelas: 'K2', nama_kelas: 'Omar bin Khattab' },
  { id_kelas: 'K3', nama_kelas: 'Usman bin Affan' }
];

export const INITIAL_STUDENTS: Santri[] = [
  {
    id_santri: 'S001',
    nama_santri: 'Ahmad Faisal',
    nis: '1001',
    halaqah: 'Abu Bakar',
    username_ortu: 'ahmad',
    password_ortu: '123',
    jumlah_hafalan: '2 Juz',
    juz_hafal: 'Juz 30, 29',
    murojaah: 'Lancar'
  },
  {
    id_santri: 'S002',
    nama_santri: 'Budi Santoso',
    nis: '1002',
    halaqah: 'Abu Bakar',
    username_ortu: 'budi',
    password_ortu: '123',
    jumlah_hafalan: '1 Juz',
    juz_hafal: 'Juz 30',
    murojaah: 'Perlu Pengulangan'
  },
  {
    id_santri: 'S003',
    nama_santri: 'Citra Lestari',
    nis: '1003',
    halaqah: 'Omar bin Khattab',
    username_ortu: 'citra',
    password_ortu: '123',
    jumlah_hafalan: '5 Juz',
    juz_hafal: 'Juz 30, 29, 28, 27, 26',
    murojaah: 'Sangat Lancar'
  }
];

export const INITIAL_SETORAN: Setoran[] = [
  {
    id_setoran: 'SET1',
    tanggal: '2026-06-11',
    id_santri: 'S001',
    nama_santri: 'Ahmad Faisal',
    surah: 'Al-Mulk',
    ayat: '1-10',
    tilawah: '-',
    halaman: '-',
    hadits: '-',
    kualitas: 'Mumtaz',
    catatan: 'Hafalan tajwid sangat baik, terus diulang.',
    nama_ustadz: 'Ustadz Hanafi'
  },
  {
    id_setoran: 'SET2',
    tanggal: '2026-06-12',
    id_santri: 'S002',
    nama_santri: 'Budi Santoso',
    surah: '-',
    ayat: '-',
    tilawah: 'Iqro 6 Hal 15',
    halaman: '-',
    hadits: '-',
    kualitas: 'Jayyid',
    catatan: 'Makharijul huruf diperjelas untuk harakat kasrah.',
    nama_ustadz: 'Ustadz Hanafi'
  },
  {
    id_setoran: 'SET3',
    tanggal: '2026-06-10',
    id_santri: 'S003',
    nama_santri: 'Citra Lestari',
    surah: 'An-Naba\'',
    ayat: '1-40',
    tilawah: '-',
    halaman: '-',
    hadits: '-',
    kualitas: 'Mumtaz',
    catatan: 'Hafalan lancar sekali, tajwidnya istimewa.',
    nama_ustadz: 'Ustadz Syamil'
  }
];

export const INITIAL_PAYMENTS: Pembayaran[] = [
  {
    id_pembayaran: 'PAY1',
    tanggal: '2026-06-08',
    id_santri: 'S001',
    nama_santri: 'Ahmad Faisal',
    kategori: 'SPP Juni 2026',
    nominal: 150000,
    status: 'Lunas',
    catatan: 'Pembayaran SPP Juni.',
    nama_admin: 'Ustadz Hanafi'
  },
  {
    id_pembayaran: 'PAY2',
    tanggal: '2026-06-09',
    id_santri: 'S002',
    nama_santri: 'Budi Santoso',
    kategori: 'Uang Seragam',
    nominal: 200000,
    status: 'Cicil',
    catatan: 'Pembayaran tahap ke-1 seragam baru.',
    nama_admin: 'Ustadz Hanafi'
  }
];

export const INITIAL_SAVINGS: Tabungan[] = [
  { id: 'TB1', id_santri: 'S001', nama_santri: 'Ahmad Faisal', nominal: 50000, tanggal: '2026-06-11' },
  { id: 'TB2', id_santri: 'S003', nama_santri: 'Citra Lestari', nominal: 100000, tanggal: '2026-06-12' }
];

export const INITIAL_SETTINGS: Pengaturan = {
  nama_lembaga: "SIM TPQ DIGITAL",
  nama_pimpinan: 'Ustadz Hanafi, M.Pd.',
  logo: 'https://iili.io/CCbS5Ss.md.png',
  link_wa: [
    { program: 'Umum', link: 'https://chat.whatsapp.com/abc-umum' },
    { program: 'Tahfidz', link: 'https://chat.whatsapp.com/xyz-tahfidz' }
  ],
  alamat: 'Jl. Raya Baitul Quran No. 12, Kelurahan Harapan Baru, Bekasi',
  telepon: '+6281234567890',
  email: 'info@baitulquran.sch.id',
  website: 'https://baitulquran.sch.id',
  pengumuman: 'Diberitahukan kepada seluruh wali santri bahwa ujian akhir semester genap akan dilaksanakan pada tanggal 20 Juni 2026. Mohon bimbingan belajar santri di rumah ditingkatkan.'
};

export const INITIAL_INFOS: InformasiKhusus[] = [
  {
    id: 'INF1',
    tipe: 'Manual',
    tanggal: '2026-06-11',
    terbaca_oleh: [],
    id_santri: 'S001',
    nama_santri: 'Ahmad Faisal',
    pesan: 'Mohon ananda ditambahkan durasi murojaah juz 30 di rumah.',
    target_id_santri: ['S001']
  }
];

export const INITIAL_MUTABAAH: Mutabaah[] = [
  {
    id: 'M1',
    id_santri: 'S001',
    nama_santri: 'Ahmad Faisal',
    tanggal: '2026-06-11',
    subuh: 'Ya',
    dzuhur: 'Ya',
    ashar: 'Ya',
    maghrib: 'Ya',
    isya: 'Ya',
    dhuha: 'Ya',
    tilawah: 'Ya',
    catatan: 'Alhamdulillah hari ini beribadah dengan rajin di rumah.'
  }
];

export const INITIAL_MATA_PELAJARAN: MataPelajaran[] = [
  {
    id_kelas: 'K1',
    quran_methods: ['Ziyadah', 'Murojaah', 'Sabaq', 'Sabqi', 'Manzil'],
    hadits_doa: ['Doa Masuk Masjid', 'Doa Keluar Masjid', 'Hadits ke-1 Niat', 'Hadits ke-2 Kebersihan'],
    tilawah_stages: ["Iqro' 1", "Iqro' 2", "Iqro' 3", "Iqro' 4", "Iqro' 5", "Iqro' 6", "Al-Qur'an Juz 1"]
  },
  {
    id_kelas: 'K2',
    quran_methods: ['Ziyadah', 'Murojaah', 'Sabaq'],
    hadits_doa: ['Doa Sebelum Tidur', 'Doa Bangun Tidur', 'Hadits ke-3 Persaudaraan'],
    tilawah_stages: ['Ummi 1', 'Ummi 2', 'Ummi 3', 'Ummi 4', 'Ummi 5', 'Ummi 6', "Al-Qur'an Juz 1"]
  },
  {
    id_kelas: 'K3',
    quran_methods: ['Ziyadah', 'Murojaah'],
    hadits_doa: ['Doa Masuk WC', 'Doa Keluar WC', 'Hadits ke-4 Menuntut Ilmu'],
    tilawah_stages: ['Wafa 1', 'Wafa 2', 'Wafa 3', 'Wafa 4', 'Wafa 5', 'Wafa 6']
  }
];

export const INITIAL_WEBSITE_DATA: WebsiteData = {
  judul_hero: "Membentuk Generasi Qur'ani & Berakhlak Karimah",
  sub_judul_hero: "Kami berdedikasi mendidik putra-putri tercinta untuk mahir membaca, menghafal, dan mengamalkan nilai-nilai suci Al-Qur'an.",
  gambar_hero: "https://images.unsplash.com/photo-1541829019-259276a7f013?auto=format&fit=crop&w=1200&q=80",
  judul_profil: "Mendidik Al-Qur'an dengan Kurikulum Terstruktur & Modern",
  profil: "Lembaga kami menggabungkan tradisi talaqqi yang murni dengan sistem administrasi berbasis digital. Melalui SIM TPQ DIGITAL, wali santri dapat memantau perkembangan hafalan harian anak (ziyadah & murojaah), rekap mutabaah ibadah harian, keuangan SPP, serta tabungan wadiah secara transparan dari mana saja.",
  program_1_judul: "Tashih & Tilawati",
  program_1_gambar: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=90&w=1000",
  program_1_ket: "Bimbingan baca Al-Qur'an tartil sejak dini menggunakan metode interaktif yang menyenangkan.",
  program_2_judul: "Tahfidzul Qur'an",
  program_2_gambar: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=90&w=1000",
  program_2_ket: "Program hafalan terukur dengan pendampingan intensif ustadz/ustadzah berpengalaman.",
  program_3_judul: "Kajian Akhlak",
  program_3_gambar: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=90&w=1000",
  program_3_ket: "Membentuk kepribadian santri yang mulia, santun, dan taat beribadah.",
  program_4_judul: "Hadits & Doa",
  program_4_gambar: "https://images.unsplash.com/photo-1609599006353-e629f1d40968?auto=format&fit=crop&q=90&w=1000",
  program_4_ket: "Membimbing santri dengan ketulusan dan metode menyenangkan agar mencintai firman Allah.",
  link_peta: "",
  link_video: "",
  testi_1_nama: "Ahmad Fauzi",
  testi_1_jabatan: "Wali Santri Kelas A",
  testi_1_pesan: "Alhamdulillah sejak belajar di TPQ ini, hafalan anak saya meningkat pesat.",
  testi_2_nama: "Siti Rahma",
  testi_2_jabatan: "Wali Santri Kelas B",
  testi_2_pesan: "Kurikulumnya terstruktur dengan baik. Anak saya sangat antusias mengaji setiap hari.",
  testi_3_nama: "Budi Santoso",
  testi_3_jabatan: "Wali Santri Kelas C",
  testi_3_pesan: "Pelayanan ustadz-ustadzah yang ramah, metode pembelajarannya modern dan mudah diikuti oleh anak-anak."
};

export const INITIAL_AGENDAS: Agenda[] = [
  {
    id: 'AGD1',
    tipe: 'Agenda',
    tanggal: '2026-07-06',
    waktu: '08.00 - 09.00',
    judul: "Tahsin Al-Qur'an",
    deskripsi: 'Belajar makhrajul huruf dan sifat-sifat huruf secara tartil.',
    status: 'Berjalan',
    gambar: ''
  },
  {
    id: 'AGD2',
    tipe: 'Agenda',
    tanggal: '2026-07-06',
    waktu: '09.00 - 10.30',
    judul: 'Tahfidz Juz 30',
    deskripsi: 'Ujian setoran hafalan surah pendek juz 30.',
    status: 'Berikutnya',
    gambar: ''
  },
  {
    id: 'AGD3',
    tipe: 'Pengumuman',
    tanggal: '2026-07-05',
    waktu: '-',
    judul: 'Libur 1 Muharram 1448 H',
    deskripsi: 'Libur menyambut Tahun Baru Islam 1448 Hijriyah.',
    status: '-',
    gambar: ''
  }
];


