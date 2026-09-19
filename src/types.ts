export interface DbUser {
  username: string;
  password: string;
  nama_lengkap: string;
  role: 'Ustadz' | 'Admin';
}

export interface Santri {
  id_santri: string;
  nama_santri: string;
  nis: string;
  halaqah: string;
  username_ortu: string;
  password_ortu: string;
  jumlah_hafalan: string;
  juz_hafal: string;
  murojaah: string;
}

export interface Setoran {
  id_setoran: string;
  tanggal: string;
  id_santri: string;
  nama_santri: string;
  surah: string;
  ayat: string;
  tilawah: string;
  halaman: string;
  hadits: string;
  kualitas: string;
  catatan: string;
  nama_ustadz: string;
  kualitas_surah?: string;
  kualitas_tilawah?: string;
  kualitas_hadits?: string;
}

export interface Pembayaran {
  id_pembayaran: string;
  tanggal: string;
  id_santri: string;
  nama_santri: string;
  kategori: string;
  nominal: number;
  status: 'Lunas' | 'Cicil' | 'Belum Bayar';
  catatan: string;
  nama_admin: string;
}

export interface Kelas {
  id_kelas: string;
  nama_kelas: string;
}

export interface Tabungan {
  id: string;
  id_santri: string;
  nama_santri: string;
  nominal: number;
  tanggal: string;
}

export interface WaLink {
  program: string;
  link: string;
}

export interface Pengaturan {
  nama_lembaga: string;
  nama_pimpinan: string;
  logo: string;
  link_wa: WaLink[];
  alamat: string;
  telepon: string;
  email: string;
  website: string;
  pengumuman?: string;
  web_config_json?: string;
  id_drive?: string;
  link_website?: string;
}

export interface InformasiKhusus {
  id: string;
  tipe: 'Manual' | 'Bulanan';
  tanggal: string;
  terbaca_oleh: string[];
  id_santri?: string;
  nama_santri?: string;
  pesan: string;
  target_id_santri: string[];
}

export interface Mutabaah {
  id: string;
  id_santri: string;
  nama_santri: string;
  tanggal: string;
  subuh: 'Ya' | 'Tidak';
  dzuhur: 'Ya' | 'Tidak';
  ashar: 'Ya' | 'Tidak';
  maghrib: 'Ya' | 'Tidak';
  isya: 'Ya' | 'Tidak';
  dhuha: 'Ya' | 'Tidak';
  tilawah: string;
  catatan: string;
}

export interface MataPelajaran {
  id_kelas: string;
  quran_methods: string[];
  hadits_doa: string[];
  tilawah_stages: string[];
  created_by?: string;
  untrimmed_id_kelas?: string;
  untrimmed_created_by?: string;
}

export interface Pendaftaran {
  id_pendaftaran: string;
  nama_santri: string;
  halaqah: string;
  nama_ortu: string;
  wa_ortu: string;
  tanggal_daftar: string;
  status: 'Pending' | 'Aktif';
  nis_ditetapkan?: string;
}

export interface WebsiteData {
  username?: string;
  judul_hero: string;
  sub_judul_hero?: string;
  gambar_hero: string;
  judul_profil?: string;
  profil: string;
  program_1_judul: string;
  program_1_gambar: string;
  program_1_ket: string;
  program_2_judul: string;
  program_2_gambar: string;
  program_2_ket: string;
  program_3_judul: string;
  program_3_gambar: string;
  program_3_ket: string;
  program_4_judul: string;
  program_4_gambar: string;
  program_4_ket: string;
  link_peta?: string;
  link_video?: string;
  testi_1_nama?: string;
  testi_1_jabatan?: string;
  testi_1_pesan?: string;
  testi_2_nama?: string;
  testi_2_jabatan?: string;
  testi_2_pesan?: string;
  testi_3_nama?: string;
  testi_3_jabatan?: string;
  testi_3_pesan?: string;
}

export interface Agenda {
  id: string;
  tipe: 'Agenda' | 'Pengumuman';
  tanggal: string;
  waktu: string;
  judul: string;
  deskripsi: string;
  status: string;
  created_by?: string;
  gambar?: string;
}



