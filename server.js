import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const DB_FILE = path.join(__dirname, 'db.json');

// Default initial data for the database
const defaultDB = {
  Lembaga: [
    { username: 'tpq_baitulquran', password: 'password123', link_appscript: 'http://localhost:3001/api', nama_lembaga: 'TPQ Baitul Quran Terpadu', status: 'Aktif', code_tpq: 'BQR1' }
  ],
  Users: [
    { username: 'ustadz', password: '123', nama_lengkap: 'Ustadz Hanafi, M.Pd.', role: 'Ustadz' },
    { username: 'admin', password: '123', nama_lengkap: 'Admin TPQ', role: 'Admin' }
  ],
  Santri: [
    { id_santri: 'S001', nama_santri: 'Ahmad Faisal', nis: 'BQR11001', halaqah: 'Abu Bakar', username_ortu: 'ahmad', password_ortu: 'BQR11001', jumlah_hafalan: '2 Juz', juz_hafal: 'Juz 30, 29', murojaah: 'Lancar' }
  ],
  Setoran: [
    { id_setoran: 'SET1', tanggal: '2026-06-11', id_santri: 'S001', nama_santri: 'Ahmad Faisal', surah: 'Al-Mulk', ayat: '1-10', tilawah: '-', halaman: '-', hadits: '-', kualitas: 'Mumtaz', catatan: 'Hafalan tajwid sangat baik.', nama_ustadz: 'Ustadz Hanafi' }
  ],
  Pembayaran: [
    { id_pembayaran: 'PAY1', tanggal: '2026-06-08', id_santri: 'S001', nama_santri: 'Ahmad Faisal', kategori: 'SPP Juni', nominal: 150000, status: 'Lunas', catatan: 'Pembayaran SPP Juni.', nama_admin: 'Admin TPQ' }
  ],
  Kelas: [
    { id_kelas: 'K1', nama_kelas: 'Abu Bakar' }
  ],
  Tabungan: [
    { id: 'TB1', id_santri: 'S001', nama_santri: 'Ahmad Faisal', nominal: 50000, tanggal: '2026-06-11' }
  ],
  Pengaturan: [
    { nama_lembaga: 'SIM TPQ Baitul Quran Terpadu', nama_pimpinan: 'Ustadz Hanafi, M.Pd.', logo: 'https://cdn-icons-png.flaticon.com/512/3380/3380735.png', alamat: 'Jl. Masjid Agung No. 12', telepon: '081234567890', email: 'tahfidz@tpqbaitulquran.sch.id', website: 'tpqbaitulquran.sch.id', pengumuman: 'Selamat datang.', link_wa_json: '[]', web_config_json: '', id_drive: '', link_website: '' }
  ],
  Informasi: [],
  Mutabaah: [],
  MataPelajaran: [],
  Pendaftaran: [],
  website: []
};

// Helper: Read Database
function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2), 'utf-8');
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database:", err);
    return defaultDB;
  }
}

// Helper: Save Database
function saveDB(dbData) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error("Error writing database:", err);
    return false;
  }
}

// ==========================================
// 1. MASTER LOGIN SCRIPT EQUIVALENT
// ==========================================

// Get list of active lembaga
app.get('/api/master', (req, res) => {
  const db = readDB();
  const activeLembaga = db.Lembaga.map(l => ({
    username: l.username,
    nama_lembaga: l.nama_lembaga,
    link_appscript: l.link_appscript,
    status: l.status,
    code_tpq: l.code_tpq
  }));
  res.json({ success: true, data: activeLembaga });
});

// Master Admin Login (Lembaga)
app.post('/api/master', (req, res) => {
  const { action, username, password } = req.body;
  if (action === "login_admin") {
    const db = readDB();
    const user = db.Lembaga.find(l => l.username === username.toLowerCase() && l.password === password);
    if (user && user.status.toLowerCase() === 'aktif') {
      return res.json({
        success: true,
        link_appscript: user.link_appscript,
        nama_lembaga: user.nama_lembaga,
        status: user.status,
        code_tpq: user.code_tpq
      });
    }
    return res.json({ success: false, error: 'Kredensial Pengurus salah atau tidak aktif!' });
  }
  res.json({ success: false, error: 'Aksi tidak dikenal.' });
});

// ==========================================
// 2. TPQ INTERNAL SCRIPT EQUIVALENT
// ==========================================

// GET: Sync All Data
app.get('/api', (req, res) => {
  if (!req.query._t) {
    return res.status(403).send("<h1>SIM TPQ - Basis Data Terlindungi</h1>");
  }
  const db = readDB();
  // Filter out users table for security
  const { Users, Lembaga, ...safeData } = db;
  res.json({ success: true, data: safeData });
});

// POST: Actions (Login, Add, Update, Delete)
app.post('/api', (req, res) => {
  const { action, sheet, data, username, password, nama_santri, nis, id } = req.body;
  const db = readDB();

  // Login Ustadz / Admin
  if (action === "login_ustadz") {
    const user = db.Users.find(u => u.username === username.toLowerCase() && u.password === password);
    if (user) {
      return res.json({ success: true, user: { role: user.role, nama_lengkap: user.nama_lengkap, id_santri: null, username: user.username } });
    }
    return res.json({ success: false, error: "Akses login ditolak!" });
  }

  // Login Wali
  if (action === "login_wali") {
    const santri = db.Santri.find(s => s.nama_santri.toLowerCase() === (nama_santri||"").toLowerCase() && s.nis.toLowerCase() === (nis||"").toLowerCase());
    if (santri) {
      return res.json({ success: true, user: { role: "OrangTua", nama_lengkap: "Wali dari " + santri.nama_santri, id_santri: santri.id_santri } });
    }
    return res.json({ success: false, error: "Identitas Santri tidak terverifikasi!" });
  }

  // CRUD Operations
  if (!db[sheet]) db[sheet] = [];
  const table = db[sheet];

  if (action === "add") {
    table.push(data);
    saveDB(db);
    return res.json({ success: true, message: "Berhasil ditambahkan!" });
  }

  if (action === "update") {
    // Basic ID-based update logic (first key)
    const keys = Object.keys(data);
    if (keys.length > 0) {
      const primaryKey = keys[0]; // e.g. 'id_santri'
      const idVal = data[primaryKey];
      const index = table.findIndex(r => r[primaryKey] === idVal);
      if (index !== -1) {
        table[index] = { ...table[index], ...data };
      } else {
        table.push(data); // upsert
      }
      saveDB(db);
      return res.json({ success: true });
    }
  }

  if (action === "delete") {
    const keys = Object.keys(table[0] || {});
    if (keys.length > 0) {
      const primaryKey = keys[0];
      const initialLength = table.length;
      db[sheet] = table.filter(r => r[primaryKey] !== id);
      saveDB(db);
      return res.json({ success: true, deleted: initialLength - db[sheet].length });
    }
  }

  if (action === "clearCategory") {
    db[sheet] = [];
    saveDB(db);
    return res.json({ success: true, cleared: true });
  }

  if (action === "saveSettings") {
    db.Pengaturan = [data]; // replace setting
    saveDB(db);
    return res.json({ success: true });
  }

  res.json({ success: false, error: "Aksi tidak dikenali." });
});

// START SERVER
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ TPQ Backend Server berjalan di http://localhost:${PORT}`);
  console.log(`Database tersimpan di: ${DB_FILE}`);
});
