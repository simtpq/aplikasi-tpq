import React, { useState, useEffect, useRef } from 'react';
import LoginForm from './components/LoginForm';
import AdminDashboard from './components/AdminDashboard';
import ParentDashboard from './components/ParentDashboard';
import TPQLandingPage from './components/TPQLandingPage';
import { DownloadCloud, Smartphone, X } from 'lucide-react';
import { Santri, Setoran, Pembayaran, Kelas, Tabungan, Pengaturan, InformasiKhusus, Mutabaah, DbUser, MataPelajaran, Pendaftaran, WebsiteData, Agenda } from './types';
import {
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
  INITIAL_SETORAN,
  INITIAL_PAYMENTS,
  INITIAL_SAVINGS,
  INITIAL_SETTINGS,
  INITIAL_INFOS,
  INITIAL_MUTABAAH,
  INITIAL_USERS,
  INITIAL_MATA_PELAJARAN,
  INITIAL_WEBSITE_DATA,
  INITIAL_AGENDAS,
  GOOGLE_SCRIPT_URL,
  MASTER_LOGIN_SCRIPT_URL,
  getAppScriptPrefix
} from './data';

const getCleanImageUrl = (urlOrId: string | undefined | null): string => {
  if (!urlOrId) return "";
  const trimmed = urlOrId.trim();
  if (trimmed.startsWith("data:")) return trimmed;

  // Check if it is a Google Drive / Google Docs / Google User Content URL or a raw ID
  const isGoogle = trimmed.includes("google.com") || trimmed.includes("googleusercontent.com");
  const isRawId = /^[a-zA-Z0-9_-]{15,100}$/.test(trimmed);

  if (isGoogle || isRawId) {
    let driveId = "";
    
    // 1. Try to match /file/d/ID
    const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileDMatch) {
      driveId = fileDMatch[1];
    } else {
      // 2. Try to match id=ID
      const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (idMatch) {
        driveId = idMatch[1];
      } else {
        // 3. Try to match /d/ID
        const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (dMatch) {
          driveId = dMatch[1];
        } else if (isRawId) {
          driveId = trimmed;
        }
      }
    }

    if (driveId) {
      return `https://lh3.googleusercontent.com/d/${driveId}`;
    }
  }

  return trimmed;
};

// --- Helper Deduplication Functions for strict state security & data integrity ---
const uniqueUsers = (arr: DbUser[]): DbUser[] => {
  const seen = new Set();
  return arr.filter(item => {
    if (!item) return false;
    const key = (item.username || '').trim().toLowerCase();
    if (!key) return false;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const uniqueSantri = (arr: Santri[]): Santri[] => {
  const seenIds = new Set();
  const seenNis = new Set();
  return arr.filter(item => {
    if (!item) return false;
    const id = (item.id_santri || '').trim();
    const nis = (item.nis || '').trim();
    if (!id && !nis) return false;
    if (id && seenIds.has(id)) return false;
    if (nis && seenNis.has(nis)) return false;
    if (id) seenIds.add(id);
    if (nis) seenNis.add(nis);
    return true;
  });
};

const uniqueSetoran = (arr: Setoran[]): Setoran[] => {
  const seen = new Set();
  return arr.filter(item => {
    if (!item) return false;
    const key = (item.id_setoran || '').trim();
    if (!key) return false;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const uniquePembayaran = (arr: Pembayaran[]): Pembayaran[] => {
  const seen = new Set();
  return arr.filter(item => {
    if (!item) return false;
    const key = (item.id_pembayaran || '').trim();
    if (!key) return false;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const uniqueKelas = (arr: Kelas[]): Kelas[] => {
  const seenIds = new Set();
  const seenNames = new Set();
  return arr.filter(item => {
    if (!item) return false;
    const id = (item.id_kelas || '').trim();
    const name = (item.nama_kelas || '').trim().toLowerCase();
    if (!id && !name) return false;
    if (id && seenIds.has(id)) return false;
    if (name && seenNames.has(name)) return false;
    if (id) seenIds.add(id);
    if (name) seenNames.add(name);
    return true;
  });
};

const uniqueTabungan = (arr: Tabungan[]): Tabungan[] => {
  const seen = new Set();
  return arr.filter(item => {
    if (!item) return false;
    const key = (item.id || '').trim();
    if (!key) return false;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const uniqueInformasi = (arr: InformasiKhusus[]): InformasiKhusus[] => {
  const seen = new Set();
  return arr.filter(item => {
    if (!item) return false;
    const key = (item.id || '').trim();
    if (!key) return false;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const uniqueMutabaah = (arr: Mutabaah[]): Mutabaah[] => {
  const seen = new Set();
  return arr.filter(item => {
    if (!item) return false;
    const key = (item.id || '').trim();
    if (!key) return false;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const parseKualitasString = (kStr: string) => {
  const res = { surah: undefined as string | undefined, tilawah: undefined as string | undefined, hadits: undefined as string | undefined };
  if (!kStr) return res;
  if (kStr.includes('|') || kStr.includes(':')) {
    const parts = kStr.split('|');
    parts.forEach(p => {
      const partsOfP = p.split(':');
      if (partsOfP.length >= 2) {
        const key = partsOfP[0].trim().toLowerCase();
        const val = partsOfP.slice(1).join(':').trim();
        if (key === 'hafalan' || key === 'surah' || key === 'tahfidz') res.surah = val;
        else if (key === 'tilawah') res.tilawah = val;
        else if (key === 'hadits' || key === 'doa' || key === 'hadits_doa') res.hadits = val;
      }
    });
  }
  return res;
};

const cleanDateString = (val: string | null | undefined): string => {
  if (!val) return '';
  const s = val.trim();
  // 1. Matches YYYY-MM-DD directly
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return s;
  }
  // 2. Fallback to parse with Date and format in Asia/Jakarta timezone
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    try {
      const options = { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' } as const;
      return new Intl.DateTimeFormat('en-CA', options).format(d);
    } catch (e) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${year}-${month}-${day}`;
    }
  }
  // 3. Matches prefix YYYY-MM-DD or YYYY/MM/DD
  if (s.length >= 10 && /^\d{4}[-/]\d{2}[-/]\d{2}/.test(s)) {
    return s.substring(0, 10).replace(/\//g, '-');
  }
  return s;
};

const safeLoadFromLocalStorage = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    if (saved === 'undefined' || saved === 'null' || saved.trim() === '') return fallback;
    const parsed = JSON.parse(saved);
    return (parsed !== null && parsed !== undefined) ? parsed : fallback;
  } catch (e) {
    console.warn(`Gagal memuat key "${key}" dari localStorage:`, e);
    return fallback;
  }
};

const detectSchoolUsername = (): string | null => {
  // 1. Check pathname (e.g. /tpq/arrohman)
  const path = window.location.pathname;
  const match = path.match(/^\/tpq\/([a-zA-Z0-9_-]+)/i);
  if (match) return match[1];

  // 2. Check query string starting with ?tpq/ (e.g. ?tpq/arrohman)
  const search = window.location.search;
  const queryMatch = search.match(/^\?tpq\/([a-zA-Z0-9_-]+)/i);
  if (queryMatch) return queryMatch[1];

  // 3. Check query parameter (e.g. ?tpq=arrohman)
  const params = new URLSearchParams(search);
  const paramVal = params.get('tpq');
  if (paramVal) return paramVal;

  // 4. Check hash (e.g. #/tpq/arrohman or #tpq=arrohman)
  const hash = window.location.hash;
  const hashMatch = hash.match(/^#\/tpq\/([a-zA-Z0-9_-]+)/i);
  if (hashMatch) return hashMatch[1];
  
  const hashParamMatch = hash.match(/^#tpq=([a-zA-Z0-9_-]+)/i);
  if (hashParamMatch) return hashParamMatch[1];

  return null;
};

const getSchoolSuffix = (): string => {
  const u = detectSchoolUsername();
  return u ? `_${u.trim().toLowerCase()}` : "";
};

const getActiveSchoolUsernameFromUrl = (): string => {
  return (detectSchoolUsername() || "").toLowerCase().trim();
};

export default function App() {
  // --- PWA Installation states ---
  const [pwaPrompt, setPwaPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  // --- Multi-Lembaga Apps Script Configurations ---
  const [masterScriptUrl, setMasterScriptUrl] = useState<string>(() => {
    return localStorage.getItem('sim_master_script_url') || MASTER_LOGIN_SCRIPT_URL;
  });

  const [activeScriptUrl, setActiveScriptUrl] = useState<string>(() => {
    const suffix = getSchoolSuffix();
    return localStorage.getItem(`sim_active_script_url${suffix}`) || GOOGLE_SCRIPT_URL;
  });

  const latestSyncUrlRef = useRef<string>("");

  const [lembagaList, setLembagaList] = useState<{ username: string; nama_lembaga: string; link_appscript: string; status: string; code_tpq?: string }[]>(() => {
    return safeLoadFromLocalStorage('sim_lembaga_list', []);
  });

  const [selectedLandingSchool, setSelectedLandingSchool] = useState<{ username: string; nama_lembaga: string; link_appscript: string; status: string } | null>(() => {
    const schoolUsername = detectSchoolUsername();
    if (schoolUsername) {
      const cleanUser = schoolUsername.trim().toLowerCase();
      let matched = null;
      try {
        const saved = localStorage.getItem('sim_lembaga_list');
        if (saved) {
          const list = JSON.parse(saved);
          if (Array.isArray(list)) {
            matched = list.find((l: any) => l.username.toLowerCase().trim() === cleanUser);
          }
        }
      } catch (e) {
        console.warn("Gagal membaca list lembaga dari localstorage:", e);
      }
      const suffix = `_${cleanUser}`;
      return matched || {
        username: cleanUser,
        nama_lembaga: "SIM TPQ DIGITAL",
        link_appscript: localStorage.getItem(`sim_active_script_url${suffix}`) || GOOGLE_SCRIPT_URL,
        status: "Aktif"
      };
    }
    return null;
  });
  const [forceLogin, setForceLogin] = useState<boolean>(false);

  // --- Active logged user session ---
  const [user, setUser] = useState<{ role: string; nama_lengkap: string; id_santri: string | null; username: string } | null>(() => {
    const suffix = getSchoolSuffix();
    const saved = safeLoadFromLocalStorage<{ role: string; nama_lengkap: string; id_santri: string | null; username?: string } | null>(`sim_user${suffix}`, null);
    if (saved) {
      return {
        role: saved.role,
        nama_lengkap: saved.nama_lengkap,
        id_santri: saved.id_santri,
        username: saved.username || ""
      };
    }
    return null;
  });

  // --- Dynamic Users State for Google Sheets validation ---
  const [usersList, setUsersListRaw] = useState<DbUser[]>(() => {
    const suffix = getSchoolSuffix();
    const initial = safeLoadFromLocalStorage<DbUser[]>(`sim_users${suffix}`, INITIAL_USERS);
    return uniqueUsers(initial);
  });
  const setUsersList = (val: DbUser[] | ((prev: DbUser[]) => DbUser[])) => {
    setUsersListRaw(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      return uniqueUsers(next);
    });
  };

  // --- Core Persistent States with fallback to preset seed arrays ---
  const [pendaftaranList, setPendaftaranListRaw] = useState<Pendaftaran[]>(() => {
    const suffix = getSchoolSuffix();
    return safeLoadFromLocalStorage<Pendaftaran[]>(`sim_pendaftaran${suffix}`, []);
  });
  const setPendaftaranList = (val: Pendaftaran[] | ((prev: Pendaftaran[]) => Pendaftaran[])) => {
    setPendaftaranListRaw(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      return next;
    });
  };

  const [santriList, setSantriListRaw] = useState<Santri[]>(() => {
    const suffix = getSchoolSuffix();
    const initial = safeLoadFromLocalStorage<Santri[]>(`sim_santri${suffix}`, INITIAL_STUDENTS);
    return uniqueSantri(initial);
  });
  const setSantriList = (val: Santri[] | ((prev: Santri[]) => Santri[])) => {
    setSantriListRaw(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      return uniqueSantri(next);
    });
  };

  const [setoranList, setSetoranListRaw] = useState<Setoran[]>(() => {
    const suffix = getSchoolSuffix();
    const initial = safeLoadFromLocalStorage<Setoran[]>(`sim_setoran${suffix}`, INITIAL_SETORAN);
    return uniqueSetoran(initial);
  });
  const setSetoranList = (val: Setoran[] | ((prev: Setoran[]) => Setoran[])) => {
    setSetoranListRaw(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      return uniqueSetoran(next);
    });
  };

  const [pembayaranList, setPembayaranListRaw] = useState<Pembayaran[]>(() => {
    const suffix = getSchoolSuffix();
    const initial = safeLoadFromLocalStorage<Pembayaran[]>(`sim_pembayaran${suffix}`, INITIAL_PAYMENTS);
    return uniquePembayaran(initial);
  });
  const setPembayaranList = (val: Pembayaran[] | ((prev: Pembayaran[]) => Pembayaran[])) => {
    setPembayaranListRaw(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      return uniquePembayaran(next);
    });
  };

  const [kelasList, setKelasListRaw] = useState<Kelas[]>(() => {
    const suffix = getSchoolSuffix();
    const initial = safeLoadFromLocalStorage<Kelas[]>(`sim_kelas${suffix}`, INITIAL_CLASSES);
    return uniqueKelas(initial);
  });
  const setKelasList = (val: Kelas[] | ((prev: Kelas[]) => Kelas[])) => {
    setKelasListRaw(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      return uniqueKelas(next);
    });
  };

  const [mataPelajaranList, setMataPelajaranList] = useState<MataPelajaran[]>(() => {
    const suffix = getSchoolSuffix();
    return safeLoadFromLocalStorage(`sim_mata_pelajaran${suffix}`, INITIAL_MATA_PELAJARAN);
  });

  const updateMataPelajaran = (updater: React.SetStateAction<MataPelajaran[]>) => {
    setMataPelajaranList(prev => {
      const next = typeof updater === 'function' ? (updater as Function)(prev) : updater;
      
      // Sync deletions
      prev.forEach(p => {
        const found = next.find((n: MataPelajaran) => 
          n && n.id_kelas && p && p.id_kelas &&
          n.id_kelas.toLowerCase().trim() === p.id_kelas.toLowerCase().trim() && 
          (n.created_by || 'admin').toLowerCase().trim() === (p.created_by || 'admin').toLowerCase().trim()
        );
        if (!found) {
          const deleteIdKelas = p.untrimmed_id_kelas || p.id_kelas;
          const deleteCreatedBy = p.untrimmed_created_by || p.created_by || 'admin';
          syncToGoogleSheetsCurrent('MataPelajaran', 'delete', null, `${deleteIdKelas}_${deleteCreatedBy}`);
        }
      });
      
      // Sync additions/updates
      next.forEach((n: MataPelajaran) => {
        const found = prev.find(p => 
          p && p.id_kelas && n && n.id_kelas &&
          p.id_kelas.toLowerCase().trim() === n.id_kelas.toLowerCase().trim() && 
          (p.created_by || 'admin').toLowerCase().trim() === (n.created_by || 'admin').toLowerCase().trim()
        );
        if (!found || JSON.stringify(found) !== JSON.stringify(n)) {
          const syncIdKelas = n.untrimmed_id_kelas || n.id_kelas;
          const syncCreatedBy = n.untrimmed_created_by || n.created_by || 'admin';
          syncToGoogleSheetsCurrent('MataPelajaran', 'update', {
            id_kelas: syncIdKelas,
            idkelas: syncIdKelas,
            id: `${syncIdKelas}_${syncCreatedBy}`,
            quran_methods: JSON.stringify(n.quran_methods),
            quranmethods: JSON.stringify(n.quran_methods),
            hadits_doa: JSON.stringify(n.hadits_doa),
            haditsdoa: JSON.stringify(n.hadits_doa),
            tilawah_stages: JSON.stringify(n.tilawah_stages),
            tilawahstages: JSON.stringify(n.tilawah_stages),
            created_by: syncCreatedBy,
            createdby: syncCreatedBy
          }, `${syncIdKelas}_${syncCreatedBy}`);
        }
      });
      
      const suffix = getSchoolSuffix();
      localStorage.setItem(`sim_mata_pelajaran${suffix}`, JSON.stringify(next));
      return next;
    });
  };

  const [tabunganList, setTabunganListRaw] = useState<Tabungan[]>(() => {
    const suffix = getSchoolSuffix();
    const initial = safeLoadFromLocalStorage<Tabungan[]>(`sim_tabungan${suffix}`, INITIAL_SAVINGS);
    return uniqueTabungan(initial);
  });
  const setTabunganList = (val: Tabungan[] | ((prev: Tabungan[]) => Tabungan[])) => {
    setTabunganListRaw(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      return uniqueTabungan(next);
    });
  };

  const [informasiList, setInformasiListRaw] = useState<InformasiKhusus[]>(() => {
    const suffix = getSchoolSuffix();
    const initial = safeLoadFromLocalStorage<InformasiKhusus[]>(`sim_informasi${suffix}`, INITIAL_INFOS);
    return uniqueInformasi(initial);
  });
  const setInformasiList = (val: InformasiKhusus[] | ((prev: InformasiKhusus[]) => InformasiKhusus[])) => {
    setInformasiListRaw(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      return uniqueInformasi(next);
    });
  };

  const [mutabaahList, setMutabaahListRaw] = useState<Mutabaah[]>(() => {
    const suffix = getSchoolSuffix();
    const initial = safeLoadFromLocalStorage<Mutabaah[]>(`sim_mutabaah${suffix}`, INITIAL_MUTABAAH);
    return uniqueMutabaah(initial);
  });
  const setMutabaahList = (val: Mutabaah[] | ((prev: Mutabaah[]) => Mutabaah[])) => {
    setMutabaahListRaw(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      return uniqueMutabaah(next);
    });
  };

  const [pengaturan, setPengaturan] = useState<Pengaturan>(() => {
    const suffix = getSchoolSuffix();
    return safeLoadFromLocalStorage(`sim_pengaturan${suffix}`, INITIAL_SETTINGS);
  });

  const [websiteData, setWebsiteData] = useState<WebsiteData>(() => {
    const suffix = getSchoolSuffix();
    return safeLoadFromLocalStorage(`sim_website_data${suffix}`, INITIAL_WEBSITE_DATA);
  });

  const [agendaList, setAgendaListRaw] = useState<Agenda[]>(() => {
    const suffix = getSchoolSuffix();
    const initial = safeLoadFromLocalStorage<Agenda[]>(`sim_agenda${suffix}`, INITIAL_AGENDAS);
    const unique = (list: Agenda[]) => {
      const seen = new Set();
      return list.filter(item => {
        if (!item || !item.id) return false;
        const key = item.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    };
    return unique(initial);
  });
  const setAgendaList = (val: Agenda[] | ((prev: Agenda[]) => Agenda[])) => {
    setAgendaListRaw(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      const seen = new Set();
      return next.filter(item => {
        if (!item || !item.id) return false;
        const key = item.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    });
  };

  // --- Synchronization State ---
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  // --- Helper to safely resolve values from case-insensitive property names from Google Sheets Response ---
  const getProp = (obj: any, keys: string[]): any => {
    if (!obj) return undefined;
    const cleanKeys = keys.map(k => k.toLowerCase().replace(/[\s_-]/g, ''));
    for (const k in obj) {
      const cleanK = k.toLowerCase().replace(/[\s_-]/g, '');
      if (cleanKeys.includes(cleanK)) {
        return obj[k];
      }
    }
    return undefined;
  };

  const syncDataFromSheets = async (urlToUse?: string): Promise<{ Users?: DbUser[]; Santri?: Santri[] } | null> => {
    const url = urlToUse || activeScriptUrl;
    if (!url) return null;
    latestSyncUrlRef.current = url;
    setIsSyncing(true);
    setSyncError(null);
    try {
      const schoolUser = detectSchoolUsername() || "";
      const buster = `_t=${Date.now()}${schoolUser ? `&username=${encodeURIComponent(schoolUser)}` : ''}`;
      const urlWithBuster = url + (url.includes('?') ? '&' : '?') + buster;
      const response = await fetch(urlWithBuster);
      const json = await response.json();
      
      // Mencegah race condition: jika ada permintaan sinkronisasi yang lebih baru, abaikan respon ini
      if (latestSyncUrlRef.current !== url) {
        console.warn("Mencegah race-condition: mengabaikan respon sync lama untuk URL:", url);
        return null;
      }

      if (json && json.success && json.data) {
        const d = json.data;
        
        // Helper case-insensitive sheet finder to ensure dynamic custom tables map successfully
        const getSheet = (name: string): any[] | undefined => {
          const lower = name.toLowerCase();
          for (const key in d) {
            if (key.toLowerCase() === lower) {
              return d[key];
            }
          }
          return undefined;
        };
        
        let syncedUsers: DbUser[] = [];
        let syncedSantri: Santri[] = [];

        // 1. Users
        const usersSheet = getSheet('Users');
        if (usersSheet) {
          const list = Array.isArray(usersSheet) ? usersSheet : [];
          syncedUsers = list.map(item => {
            const username = String(getProp(item, ['username', 'user']) || '').trim();
            const password = String(getProp(item, ['password', 'pass']) || '').trim();
            const nama_lengkap = String(getProp(item, ['namalengkap', 'nama', 'fullname', 'fullname_user']) || '').trim();
            const roleVal = String(getProp(item, ['role', 'role_user', 'jabatan']) || '').trim().toLowerCase();
            return {
              username,
              password,
              nama_lengkap: nama_lengkap || username,
              role: (roleVal === 'admin' ? 'Admin' : 'Ustadz') as 'Ustadz' | 'Admin'
            };
          }).filter(u => u.username !== '');
          if (syncedUsers.length > 0) {
            setUsersList(syncedUsers);
          }
        }

        // 2. Santri
        const santriSheet = getSheet('Santri');
        if (santriSheet) {
          const list = Array.isArray(santriSheet) ? santriSheet : [];
          syncedSantri = list.map((item, idx) => {
            const id_santri = String(getProp(item, ['idsantri', 'id', 'id_santri']) || `S${101 + idx}`).trim();
            const nama_santri = String(getProp(item, ['namasantri', 'nama', 'nama_santri']) || '').trim();
            const nis = String(getProp(item, ['nis', 'noinduk', 'nomorinduk']) || '').trim();
            const halaqah = String(getProp(item, ['halaqah', 'kelas', 'id_kelas']) || '').trim();
            const username_ortu = String(getProp(item, ['usernameortu', 'username_ortu', 'userortu']) || '').trim();
            const password_ortu = String(getProp(item, ['passwordortu', 'password_ortu', 'passortu']) || '').trim();
            const jumlah_hafalan = String(getProp(item, ['jumlahhafalan', 'jumlah_hafalan', 'hafalan']) || '').trim();
            const juz_hafal = String(getProp(item, ['juzhafal', 'juz_hafal', 'juz']) || '').trim();
            const murojaah = String(getProp(item, ['murojaah', 'catatan_murojaah']) || '').trim();

            return {
              id_santri,
              nama_santri,
              nis,
              halaqah,
              username_ortu: username_ortu || (nama_santri ? nama_santri.split(' ')[0].toLowerCase() : `ortu_${nis}`),
              password_ortu: password_ortu || nis || '123',
              jumlah_hafalan,
              juz_hafal,
              murojaah
            };
          }).filter(s => s.nama_santri !== '');
          if (syncedSantri.length > 0) {
            setSantriList(syncedSantri);
          }
        }

        // 2b. Pendaftaran Online
        const pendaftaranSheet = getSheet('Pendaftaran');
        if (pendaftaranSheet) {
          const list = Array.isArray(pendaftaranSheet) ? pendaftaranSheet : [];
          const parsed = list.map((item, idx) => ({
            id_pendaftaran: String(getProp(item, ['id_pendaftaran', 'id', 'idpendaftaran']) || `REG${100 + idx}`).trim(),
            nama_santri: String(getProp(item, ['nama_santri', 'namasantri', 'nama']) || '').trim(),
            halaqah: String(getProp(item, ['halaqah', 'kelas', 'id_kelas']) || '').trim(),
            nama_ortu: String(getProp(item, ['nama_ortu', 'namaortu', 'ortu']) || '').trim(),
            wa_ortu: String(getProp(item, ['wa_ortu', 'waortu', 'telepon', 'phone']) || '').trim(),
            tanggal_daftar: cleanDateString(String(getProp(item, ['tanggal_daftar', 'tanggaldaftar', 'tanggal']) || '')),
            status: (String(getProp(item, ['status']) || 'Pending').trim().toLowerCase() === 'aktif' ? 'Aktif' : 'Pending') as 'Pending' | 'Aktif',
            nis_ditetapkan: String(getProp(item, ['nis_ditetapkan', 'nisditetapkan', 'nis']) || '').trim() || undefined
          })).filter(p => p.nama_santri !== '');
          setPendaftaranList(parsed);
        }

        // 3. Setoran
        const setoranSheet = getSheet('Setoran');
        if (setoranSheet) {
          const list = Array.isArray(setoranSheet) ? setoranSheet : [];
          const parsed = list.map((item, idx) => {
            const rawKualitas = String(getProp(item, ['kualitas', 'nilai']) || '').trim();
            const res = parseKualitasString(rawKualitas);
            return {
              id_setoran: String(getProp(item, ['idsetoran', 'id', 'id_setoran']) || `SET${100 + idx}`).trim(),
              tanggal: cleanDateString(String(getProp(item, ['tanggal', 'tgl']) || '')),
              id_santri: String(getProp(item, ['idsantri', 'id_santri']) || '').trim(),
              nama_santri: String(getProp(item, ['namasantri', 'nama_santri', 'nama']) || '').trim(),
              surah: String(getProp(item, ['surah']) || '-').trim(),
              ayat: String(getProp(item, ['ayat']) || '-').trim(),
              tilawah: String(getProp(item, ['tilawah', 'bacaan']) || '-').trim(),
              halaman: String(getProp(item, ['halaman', 'hal', 'page']) || '-').trim(),
              hadits: String(getProp(item, ['hadits', 'hafalanhadits']) || '-').trim(),
              kualitas: rawKualitas,
              catatan: String(getProp(item, ['catatan', 'keterangan']) || '').trim(),
              nama_ustadz: String(getProp(item, ['namaustadz', 'ustadz', 'nama_ustadz']) || '').trim(),
              kualitas_surah: String(getProp(item, ['kualitas_surah']) || '').trim() || res.surah || undefined,
              kualitas_tilawah: String(getProp(item, ['kualitas_tilawah']) || '').trim() || res.tilawah || undefined,
              kualitas_hadits: String(getProp(item, ['kualitas_hadits']) || '').trim() || res.hadits || undefined
            };
          });
          setSetoranList(parsed);
        }

        // 4. Pembayaran
        const pembayaranSheet = getSheet('Pembayaran');
        if (pembayaranSheet) {
          const list = Array.isArray(pembayaranSheet) ? pembayaranSheet : [];
          const parsed = list.map((item, idx) => {
            const nominalRaw = getProp(item, ['nominal', 'jumlah', 'nominal_bayar']);
            return {
              id_pembayaran: String(getProp(item, ['idpembayaran', 'id', 'id_pembayaran']) || `PAY${100 + idx}`).trim(),
              tanggal: cleanDateString(String(getProp(item, ['tanggal', 'tgl']) || '')),
              id_santri: String(getProp(item, ['idsantri', 'id_santri']) || '').trim(),
              nama_santri: String(getProp(item, ['namasantri', 'nama_santri', 'nama']) || '').trim(),
              kategori: String(getProp(item, ['kategori', 'jenis']) || '').trim(),
              nominal: Number(nominalRaw) || 0,
              status: (() => {
                const statusRaw = String(getProp(item, ['status']) || 'Lunas').trim().toLowerCase();
                if (statusRaw === 'cicil') return 'Cicil';
                if (statusRaw === 'belum bayar' || statusRaw === 'belum_bayar' || statusRaw === 'belum' || statusRaw === 'unpaid' || statusRaw === 'tunggakan') return 'Belum Bayar';
                return 'Lunas';
              })() as 'Lunas' | 'Cicil' | 'Belum Bayar',
              catatan: String(getProp(item, ['catatan', 'keterangan']) || '').trim(),
              nama_admin: String(getProp(item, ['namaadmin', 'admin', 'nama_admin']) || '').trim()
            };
          });
          setPembayaranList(parsed);
        }

        // 5. Kelas
        const kelasSheet = getSheet('Kelas');
        if (kelasSheet) {
          const list = Array.isArray(kelasSheet) ? kelasSheet : [];
          const parsed = list.map((item, idx) => ({
            id_kelas: String(getProp(item, ['idkelas', 'id_kelas', 'id']) || `K${100 + idx}`).trim(),
            nama_kelas: String(getProp(item, ['namakelas', 'nama_kelas', 'nama']) || '').trim()
          }));
          setKelasList(parsed);
        }

        // 6. Tabungan
        const tabunganSheet = getSheet('Tabungan');
        if (tabunganSheet) {
          const list = Array.isArray(tabunganSheet) ? tabunganSheet : [];
          const parsed = list.map((item, idx) => {
            const nominalRaw = getProp(item, ['nominal', 'jumlah', 'nominal_tabung']);
            return {
              id: String(getProp(item, ['id', 'idtabungan', 'id_tabungan']) || `TAB${100 + idx}`).trim(),
              id_santri: String(getProp(item, ['idsantri', 'id_santri']) || '').trim(),
              nama_santri: String(getProp(item, ['namasantri', 'nama_santri', 'nama']) || '').trim(),
              nominal: Number(nominalRaw) || 0,
              tanggal: cleanDateString(String(getProp(item, ['tanggal', 'tgl']) || ''))
            };
          });
          setTabunganList(parsed);
        }

        // 7. Pengaturan
        const pengaturanSheet = getSheet('Pengaturan');
        if (pengaturanSheet && pengaturanSheet.length > 0) {
          const schoolUser = (detectSchoolUsername() || "admin").toLowerCase().trim();
          let firstSetting = pengaturanSheet[0];
          
          const matchedP = pengaturanSheet.find(row => {
            const rowUser = String(getProp(row, ['username']) || '').trim().toLowerCase();
            return rowUser === schoolUser;
          });
          if (matchedP) {
            firstSetting = matchedP;
          } else if (schoolUser !== "admin") {
            const adminP = pengaturanSheet.find(row => {
              const rowUser = String(getProp(row, ['username']) || '').trim().toLowerCase();
              return rowUser === "admin";
            });
            if (adminP) firstSetting = adminP;
          }

          let parsedWa = [];
          const link_wa_json = getProp(firstSetting, ['link_wa_json', 'link_wa_json_val', 'wa_json']);
          const link_wa_direct = getProp(firstSetting, ['link_wa', 'wa_link', 'links']);
          try {
            parsedWa = typeof link_wa_json === 'string' 
              ? JSON.parse(link_wa_json) 
              : (link_wa_direct || []);
          } catch(e) {
            parsedWa = [];
          }
          setPengaturan({
            nama_lembaga: String(getProp(firstSetting, ['namalembaga', 'nama_lembaga', 'nama', 'school_name', 'schoolname']) || INITIAL_SETTINGS.nama_lembaga).trim(),
            nama_pimpinan: String(getProp(firstSetting, ['namapimpinan', 'nama_pimpinan', 'pimpinan', 'kepala_sekolah', 'leader']) || INITIAL_SETTINGS.nama_pimpinan).trim(),
            logo: String(getProp(firstSetting, ['logo', 'logo_url', 'logosekolah', 'gambar_logo']) || INITIAL_SETTINGS.logo).trim(),
            alamat: String(getProp(firstSetting, ['alamat', 'address', 'alamat_sekolah']) || INITIAL_SETTINGS.alamat).trim(),
            telepon: String(getProp(firstSetting, ['telepon', 'telp', 'phone', 'no_hp', 'no_telp']) || INITIAL_SETTINGS.telepon).trim(),
            email: String(getProp(firstSetting, ['email', 'mail']) || INITIAL_SETTINGS.email).trim(),
            website: String(getProp(firstSetting, ['website', 'site', 'web']) || INITIAL_SETTINGS.website).trim(),
            pengumuman: String(getProp(firstSetting, ['pengumuman', 'announcement', 'info_penting']) || INITIAL_SETTINGS.pengumuman).trim(),
            link_wa: Array.isArray(parsedWa) ? parsedWa : [],
            web_config_json: getProp(firstSetting, ['web_config_json', 'webconfigjson', 'website_config']) || undefined,
            id_drive: String(getProp(firstSetting, ['id_drive', 'iddrive', 'drive_id']) || '').trim(),
            link_website: String(getProp(firstSetting, ['link_website', 'linkwebsite', 'website_link']) || '').trim()
          });
        }

        // 7b. Website
        const websiteSheet = getSheet('Website');
        if (websiteSheet && websiteSheet.length > 0) {
          const schoolUser = (detectSchoolUsername() || "admin").toLowerCase().trim();
          let w = websiteSheet[0];
          
          const matchedW = websiteSheet.find(row => {
            const rowUser = String(getProp(row, ['username']) || '').trim().toLowerCase();
            return rowUser === schoolUser;
          });
          if (matchedW) {
            w = matchedW;
          } else if (schoolUser !== "admin") {
            const adminW = websiteSheet.find(row => {
              const rowUser = String(getProp(row, ['username']) || '').trim().toLowerCase();
              return rowUser === "admin";
            });
            if (adminW) w = adminW;
          }

          setWebsiteData({
            judul_hero: String(getProp(w, ['judul_hero', 'judulhero', 'hero_title', 'hero_judul', 'title_hero', 'judul_utama']) || INITIAL_WEBSITE_DATA.judul_hero).trim(),
            sub_judul_hero: String(getProp(w, ['sub_judul_hero', 'subjudul_hero', 'hero_subtitle', 'subjudulhero']) || INITIAL_WEBSITE_DATA.sub_judul_hero || '').trim(),
            gambar_hero: String(getProp(w, ['gambar_hero', 'gambarhero', 'hero_image', 'hero_gambar', 'image_hero', 'gambar_utama']) || INITIAL_WEBSITE_DATA.gambar_hero).trim(),
            judul_profil: String(getProp(w, ['judul_profil', 'judulprofil', 'profile_title', 'profiletitle']) || INITIAL_WEBSITE_DATA.judul_profil || '').trim(),
            profil: String(getProp(w, ['profil', 'profile', 'profile_desc', 'profil_lembaga', 'tentang_kami', 'tentangkami']) || INITIAL_WEBSITE_DATA.profil).trim(),
            program_1_judul: String(getProp(w, ['program_1_judul', 'program1_judul', 'program1judul', 'judul_program_1', 'judul_program1', 'gallery_title_1', 'gallery1_title', 'judul_galeri_1']) || INITIAL_WEBSITE_DATA.program_1_judul).trim(),
            program_1_gambar: String(getProp(w, ['program_1_gambar', 'program1_gambar', 'program1gambar', 'gambar_program_1', 'gambar_program1', 'gallery_image_1', 'gallery1_image', 'gambar_galeri_1']) || INITIAL_WEBSITE_DATA.program_1_gambar).trim(),
            program_1_ket: String(getProp(w, ['program_1_ket', 'program1_ket', 'program1ket', 'ket_program_1', 'keterangan_program1', 'gallery_desc_1', 'gallery1_desc', 'ket_galeri_1']) || INITIAL_WEBSITE_DATA.program_1_ket).trim(),
            program_2_judul: String(getProp(w, ['program_2_judul', 'program2_judul', 'program2judul', 'judul_program_2', 'judul_program2', 'gallery_title_2', 'gallery2_title', 'judul_galeri_2']) || INITIAL_WEBSITE_DATA.program_2_judul).trim(),
            program_2_gambar: String(getProp(w, ['program_2_gambar', 'program2_gambar', 'program2gambar', 'gambar_program_2', 'gambar_program2', 'gallery_image_2', 'gallery2_image', 'gambar_galeri_2']) || INITIAL_WEBSITE_DATA.program_2_gambar).trim(),
            program_2_ket: String(getProp(w, ['program_2_ket', 'program2_ket', 'program2ket', 'ket_program_2', 'keterangan_program2', 'gallery_desc_2', 'gallery2_desc', 'ket_galeri_2']) || INITIAL_WEBSITE_DATA.program_2_ket).trim(),
            program_3_judul: String(getProp(w, ['program_3_judul', 'program3_judul', 'program3judul', 'judul_program_3', 'judul_program3', 'gallery_title_3', 'gallery3_title', 'judul_galeri_3']) || INITIAL_WEBSITE_DATA.program_3_judul).trim(),
            program_3_gambar: String(getProp(w, ['program_3_gambar', 'program3_gambar', 'program3gambar', 'gambar_program_3', 'gambar_program3', 'gallery_image_3', 'gallery3_image', 'gambar_galeri_3']) || INITIAL_WEBSITE_DATA.program_3_gambar).trim(),
            program_3_ket: String(getProp(w, ['program_3_ket', 'program3_ket', 'program3ket', 'ket_program_3', 'keterangan_program3', 'gallery_desc_3', 'gallery3_desc', 'ket_galeri_3']) || INITIAL_WEBSITE_DATA.program_3_ket).trim(),
            program_4_judul: String(getProp(w, ['program_4_judul', 'program4_judul', 'program4judul', 'judul_program_4', 'judul_program4', 'gallery_title_4', 'gallery4_title', 'judul_galeri_4']) || INITIAL_WEBSITE_DATA.program_4_judul).trim(),
            program_4_gambar: String(getProp(w, ['program_4_gambar', 'program4_gambar', 'program4gambar', 'gambar_program_4', 'gambar_program4', 'gallery_image_4', 'gallery4_image', 'gambar_galeri_4']) || INITIAL_WEBSITE_DATA.program_4_gambar).trim(),
            program_4_ket: String(getProp(w, ['program_4_ket', 'program4_ket', 'program4ket', 'ket_program_4', 'keterangan_program4', 'gallery_desc_4', 'gallery4_desc', 'ket_galeri_4']) || INITIAL_WEBSITE_DATA.program_4_ket).trim(),
            link_peta: String(getProp(w, ['link_peta', 'linkpeta', 'maps_link', 'mapslink']) || INITIAL_WEBSITE_DATA.link_peta || '').trim(),
            link_video: String(getProp(w, ['link_video', 'linkvideo', 'video_link', 'videolink']) || INITIAL_WEBSITE_DATA.link_video || '').trim(),
            testi_1_nama: String(getProp(w, ['testi_1_nama', 'testi1_nama', 'testi1nama', 'testi_1_name']) || INITIAL_WEBSITE_DATA.testi_1_nama || '').trim(),
            testi_1_jabatan: String(getProp(w, ['testi_1_jabatan', 'testi1_jabatan', 'testi1jabatan', 'testi_1_role']) || INITIAL_WEBSITE_DATA.testi_1_jabatan || '').trim(),
            testi_1_pesan: String(getProp(w, ['testi_1_pesan', 'testi1_pesan', 'testi1pesan', 'testi_1_text']) || INITIAL_WEBSITE_DATA.testi_1_pesan || '').trim(),
            testi_2_nama: String(getProp(w, ['testi_2_nama', 'testi2_nama', 'testi2nama', 'testi_2_name']) || INITIAL_WEBSITE_DATA.testi_2_nama || '').trim(),
            testi_2_jabatan: String(getProp(w, ['testi_2_jabatan', 'testi2_jabatan', 'testi2jabatan', 'testi_2_role']) || INITIAL_WEBSITE_DATA.testi_2_jabatan || '').trim(),
            testi_2_pesan: String(getProp(w, ['testi_2_pesan', 'testi2_pesan', 'testi2pesan', 'testi_2_text']) || INITIAL_WEBSITE_DATA.testi_2_pesan || '').trim(),
            testi_3_nama: String(getProp(w, ['testi_3_nama', 'testi3_nama', 'testi3nama', 'testi_3_name']) || INITIAL_WEBSITE_DATA.testi_3_nama || '').trim(),
            testi_3_jabatan: String(getProp(w, ['testi_3_jabatan', 'testi3_jabatan', 'testi3jabatan', 'testi_3_role']) || INITIAL_WEBSITE_DATA.testi_3_jabatan || '').trim(),
            testi_3_pesan: String(getProp(w, ['testi_3_pesan', 'testi3_pesan', 'testi3pesan', 'testi_3_text']) || INITIAL_WEBSITE_DATA.testi_3_pesan || '').trim()
          });
        }

        // 8. Informasi
        const informasiSheet = getSheet('Informasi');
        if (informasiSheet) {
          const list = Array.isArray(informasiSheet) ? informasiSheet : [];
          const parsed = list.map((item, idx) => {
            const terbacaRaw = getProp(item, ['terbacaoleh', 'terbaca_oleh']);
            const targetRaw = getProp(item, ['targetidsantri', 'target_id_santri']);
            const idSantri = String(getProp(item, ['idsantri', 'id_santri']) || '').trim();
            
            let terbaca_oleh: string[] = [];
            try {
              terbaca_oleh = typeof terbacaRaw === 'string' ? JSON.parse(terbacaRaw || '[]') : (Array.isArray(terbacaRaw) ? terbacaRaw : []);
            } catch(e) { /* ignore */ }

            let target_id_santri: string[] = [];
            try {
              if (typeof targetRaw === 'string') {
                const trimmed = targetRaw.trim();
                if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                  target_id_santri = JSON.parse(trimmed);
                } else if (trimmed) {
                  target_id_santri = trimmed.split(/[\s,]+/).filter(Boolean);
                }
              } else if (Array.isArray(targetRaw)) {
                target_id_santri = targetRaw;
              }
            } catch(e) {
              if (typeof targetRaw === 'string' && targetRaw.trim()) {
                target_id_santri = [targetRaw.trim()];
              }
            }
            
            if (target_id_santri.length === 0 && idSantri) {
              target_id_santri = [idSantri];
            }

            return {
              id: String(getProp(item, ['id', 'idinformasi', 'id_informasi']) || `INF${100 + idx}`).trim(),
              tipe: (String(getProp(item, ['tipe', 'jenis']) || 'Manual').trim().toLowerCase() === 'bulanan' ? 'Bulanan' : 'Manual') as 'Manual' | 'Bulanan',
              tanggal: cleanDateString(String(getProp(item, ['tanggal', 'tgl']) || '')),
              terbaca_oleh,
              id_santri: idSantri || undefined,
              nama_santri: String(getProp(item, ['namasantri', 'nama_santri', 'nama']) || '').trim() || undefined,
              pesan: String(getProp(item, ['pesan', 'isi', 'informasi']) || '').trim(),
              target_id_santri
            };
          });
          setInformasiList(parsed);
        }

        // 9. Mutabaah
        const mutabaahSheet = getSheet('Mutabaah');
        if (mutabaahSheet) {
          const list = Array.isArray(mutabaahSheet) ? mutabaahSheet : [];
          const parsed = list.map((item, idx) => ({
            id: String(getProp(item, ['id', 'idmutabaah', 'id_mutabaah']) || `MUT${100 + idx}`).trim(),
            id_santri: String(getProp(item, ['idsantri', 'id_santri']) || '').trim(),
            nama_santri: String(getProp(item, ['namasantri', 'nama_santri', 'nama']) || '').trim(),
            tanggal: cleanDateString(String(getProp(item, ['tanggal', 'tgl']) || '')),
            subuh: (String(getProp(item, ['subuh']) || 'Tidak').trim().toLowerCase() === 'ya' ? 'Ya' : 'Tidak') as 'Ya' | 'Tidak',
            dzuhur: (String(getProp(item, ['dzuhur']) || 'Tidak').trim().toLowerCase() === 'ya' ? 'Ya' : 'Tidak') as 'Ya' | 'Tidak',
            ashar: (String(getProp(item, ['ashar']) || 'Tidak').trim().toLowerCase() === 'ya' ? 'Ya' : 'Tidak') as 'Ya' | 'Tidak',
            maghrib: (String(getProp(item, ['maghrib']) || 'Tidak').trim().toLowerCase() === 'ya' ? 'Ya' : 'Tidak') as 'Ya' | 'Tidak',
            isya: (String(getProp(item, ['isya']) || 'Tidak').trim().toLowerCase() === 'ya' ? 'Ya' : 'Tidak') as 'Ya' | 'Tidak',
            dhuha: (String(getProp(item, ['dhuha']) || 'Tidak').trim().toLowerCase() === 'ya' ? 'Ya' : 'Tidak') as 'Ya' | 'Tidak',
            tilawah: String(getProp(item, ['tilawah']) || 'Tidak').trim(),
            catatan: String(getProp(item, ['catatan', 'keterangan']) || '').trim()
          }));
          setMutabaahList(parsed);
        }

        // 10. MataPelajaran
        const mataPelajaranSheet = getSheet('MataPelajaran');
        if (mataPelajaranSheet) {
          const list = Array.isArray(mataPelajaranSheet) ? mataPelajaranSheet : [];
          const parsed = list.map((item) => {
            const rawIdKelas = String(getProp(item, ['idkelas', 'id_kelas']) || '');
            const id_kelas = rawIdKelas.trim();
            const quranRaw = getProp(item, ['quranmethods', 'quran_methods']);
            const haditsRaw = getProp(item, ['haditsdoa', 'hadits_doa']);
            const tilawahRaw = getProp(item, ['tilawahstages', 'tilawah_stages']);

            let quran_methods: string[] = [];
            try {
              quran_methods = typeof quranRaw === 'string' ? JSON.parse(quranRaw || '[]') : (Array.isArray(quranRaw) ? quranRaw : (quranRaw ? String(quranRaw).split(',') : []));
            } catch(e) { quran_methods = quranRaw ? String(quranRaw).split(',').map(x => x.trim()) : []; }

            let hadits_doa: string[] = [];
            try {
              hadits_doa = typeof haditsRaw === 'string' ? JSON.parse(haditsRaw || '[]') : (Array.isArray(haditsRaw) ? haditsRaw : (haditsRaw ? String(haditsRaw).split(',') : []));
            } catch(e) { hadits_doa = haditsRaw ? String(haditsRaw).split(',').map(x => x.trim()) : []; }

            let tilawah_stages: string[] = [];
            try {
              tilawah_stages = typeof tilawahRaw === 'string' ? JSON.parse(tilawahRaw || '[]') : (Array.isArray(tilawahRaw) ? tilawahRaw : (tilawahRaw ? String(tilawahRaw).split(',') : []));
            } catch(e) { tilawah_stages = tilawahRaw ? String(tilawahRaw).split(',').map(x => x.trim()) : []; }

            const rawCreatedBy = String(getProp(item, ['createdby', 'created_by', 'user', 'username']) || '');
            const created_by = rawCreatedBy.trim() || 'admin';
            return {
              id_kelas,
              quran_methods: quran_methods.map(x => x.trim()).filter(Boolean),
              hadits_doa: hadits_doa.map(x => x.trim()).filter(Boolean),
              tilawah_stages: tilawah_stages.map(x => x.trim()).filter(Boolean),
              created_by,
              untrimmed_id_kelas: rawIdKelas,
              untrimmed_created_by: rawCreatedBy || undefined
            };
          }).filter(mp => mp.id_kelas !== '');
          setMataPelajaranList(parsed);
        }

        // 11. Agenda
        const agendaSheet = getSheet('Agenda');
        if (agendaSheet) {
          const list = Array.isArray(agendaSheet) ? agendaSheet : [];
          const parsed = list.map((item, idx) => ({
            id: String(getProp(item, ['id', 'idagenda', 'id_agenda']) || `AGD${100 + idx}`).trim(),
            tipe: (String(getProp(item, ['tipe', 'jenis']) || 'Agenda').trim().toLowerCase() === 'pengumuman' ? 'Pengumuman' : 'Agenda') as 'Agenda' | 'Pengumuman',
            tanggal: cleanDateString(String(getProp(item, ['tanggal', 'tgl']) || '')),
            waktu: String(getProp(item, ['waktu', 'jam']) || '-').trim(),
            judul: String(getProp(item, ['judul', 'nama']) || '').trim(),
            deskripsi: String(getProp(item, ['deskripsi', 'keterangan', 'isi']) || '').trim(),
            status: String(getProp(item, ['status', 'state']) || '-').trim(),
            gambar: String(getProp(item, ['gambar']) || '').trim(),
            created_by: String(getProp(item, ['createdby', 'created_by']) || 'admin').trim()
          })).filter(a => a.judul !== '');
          setAgendaList(parsed);
        }

        console.log("Sinkronisasi database dari Google Sheets berhasil!");
        return { Users: syncedUsers, Santri: syncedSantri };
      } else {
        setSyncError(json.error || "Gagal mengurai respon basis data.");
      }
    } catch (err: any) {
      console.warn("Koneksi cloud offline, menggunakan cache lokal:", err);
      setSyncError("Gagal terhubung dengan database awan. Mode offline aktif.");
    } finally {
      setIsSyncing(false);
      setIsInitialLoading(false);
    }
    return null;
  };

  // Consolidated and robust dynamic loader to ensure we fully sync active school data before rendering
  useEffect(() => {
    const runInitialSetup = async () => {
      setIsInitialLoading(true);
      
      const schoolUsername = detectSchoolUsername();
      let targetScriptUrl = activeScriptUrl;
      let currentLembagaList = lembagaList;
      
      // 1. Fetch Lembaga List from Master Table
      if (masterScriptUrl) {
        try {
          const urlWithBuster = masterScriptUrl + (masterScriptUrl.includes('?') ? '&' : '?') + `_t=${Date.now()}`;
          const response = await fetch(urlWithBuster);
          const json = await response.json();
          if (json && json.success && Array.isArray(json.data)) {
            currentLembagaList = json.data;
            setLembagaList(json.data);
            localStorage.setItem('sim_lembaga_list', JSON.stringify(json.data));
          }
        } catch (err) {
          console.warn("Gagal mengambil data lembaga:", err);
        }
      }

      // 2. Resolve target school URL and update selectedLandingSchool
      if (schoolUsername) {
        const cleanUser = schoolUsername.trim().toLowerCase();
        const matched = (currentLembagaList || []).find(l => l.username.toLowerCase().trim() === cleanUser);
        const suffix = `_${cleanUser}`;
        
        const finalSchoolData = matched || {
          username: cleanUser,
          nama_lembaga: `TPQ ${cleanUser.split(/[-_]/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}`,
          link_appscript: localStorage.getItem(`sim_active_script_url${suffix}`) || GOOGLE_SCRIPT_URL,
          status: "Aktif"
        };

        targetScriptUrl = finalSchoolData.link_appscript;
        setSelectedLandingSchool(finalSchoolData);
        
        if (targetScriptUrl && targetScriptUrl !== activeScriptUrl) {
          setActiveScriptUrl(targetScriptUrl);
          localStorage.setItem(`sim_active_script_url${suffix}`, targetScriptUrl);
        }
      }

      // 3. Sync data from the target script URL
      if (targetScriptUrl) {
        console.log("Melakukan sinkronisasi awal basis data...");
        await syncDataFromSheets(targetScriptUrl);
      } else {
        setIsInitialLoading(false);
      }
    };

    runInitialSetup();
  }, [masterScriptUrl]);

  // --- PWA beforeinstallprompt handler and OS detection ---
  useEffect(() => {
    // Cek apakah sudah berjalan di mode kelola mandiri/standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as any).standalone === true;

    if (isStandalone) {
      console.log("Aplikasi sudah terpasang dan berjalan secara standalone.");
      return;
    }

    const ua = window.navigator.userAgent.toLowerCase();
    const iosDetected = /iphone|ipad|ipod/.test(ua);
    setIsIOS(iosDetected);

    // Deteksi jika dari browser perangkat mobile / HP
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setPwaPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Selalu tampilkan notifikasi jika dibuka dari browser HP
    if (isMobile) {
      setShowInstallBanner(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // --- Synchronization blocks to cache database locally ---
  useEffect(() => {
    const suffix = getSchoolSuffix();
    localStorage.setItem(`sim_user${suffix}`, user ? JSON.stringify(user) : '');
  }, [user]);

  useEffect(() => {
    const suffix = getSchoolSuffix();
    localStorage.setItem(`sim_users${suffix}`, JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
    const suffix = getSchoolSuffix();
    localStorage.setItem(`sim_pendaftaran${suffix}`, JSON.stringify(pendaftaranList));
  }, [pendaftaranList]);

  useEffect(() => {
    const suffix = getSchoolSuffix();
    localStorage.setItem(`sim_santri${suffix}`, JSON.stringify(santriList));
  }, [santriList]);

  useEffect(() => {
    const suffix = getSchoolSuffix();
    localStorage.setItem(`sim_setoran${suffix}`, JSON.stringify(setoranList));
  }, [setoranList]);

  useEffect(() => {
    const suffix = getSchoolSuffix();
    localStorage.setItem(`sim_pembayaran${suffix}`, JSON.stringify(pembayaranList));
  }, [pembayaranList]);

  useEffect(() => {
    const suffix = getSchoolSuffix();
    localStorage.setItem(`sim_kelas${suffix}`, JSON.stringify(kelasList));
  }, [kelasList]);

  useEffect(() => {
    const suffix = getSchoolSuffix();
    localStorage.setItem(`sim_mata_pelajaran${suffix}`, JSON.stringify(mataPelajaranList));
  }, [mataPelajaranList]);

  useEffect(() => {
    const suffix = getSchoolSuffix();
    localStorage.setItem(`sim_tabungan${suffix}`, JSON.stringify(tabunganList));
  }, [tabunganList]);

  useEffect(() => {
    const suffix = getSchoolSuffix();
    localStorage.setItem(`sim_informasi${suffix}`, JSON.stringify(informasiList));
  }, [informasiList]);

  useEffect(() => {
    const suffix = getSchoolSuffix();
    localStorage.setItem(`sim_mutabaah${suffix}`, JSON.stringify(mutabaahList));
  }, [mutabaahList]);

  useEffect(() => {
    const suffix = getSchoolSuffix();
    localStorage.setItem(`sim_pengaturan${suffix}`, JSON.stringify(pengaturan));
  }, [pengaturan]);

  useEffect(() => {
    const suffix = getSchoolSuffix();
    localStorage.setItem(`sim_website_data${suffix}`, JSON.stringify(websiteData));
  }, [websiteData]);

  useEffect(() => {
    const suffix = getSchoolSuffix();
    localStorage.setItem(`sim_agenda${suffix}`, JSON.stringify(agendaList));
  }, [agendaList]);

  // --- Authentication Processor ---
  const handleLogin = async (
    type: 'ustadz' | 'wali',
    field1: string,
    field2: string
  ): Promise<string | null> => {
    if (type === 'ustadz') {
      const usernameInput = field1.trim();
      const passwordInput = field2.trim();

      setIsSyncing(true);
      
      // 1. Coba login via master script (untuk akun Admin Utama / Super Admin Lembaga)
      try {
        const res = await fetch(masterScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            action: 'login_admin',
            username: usernameInput,
            password: passwordInput
          })
        });
        const json = await res.json();
        if (json && json.success) {
          const targetUrl = json.link_appscript;
          setActiveScriptUrl(targetUrl);
          const suffix = getSchoolSuffix();
          localStorage.setItem(`sim_active_script_url${suffix}`, targetUrl);

          const loggedAdmin = {
            role: 'Admin' as const,
            nama_lengkap: `Admin - ${json.nama_lembaga || 'Lembaga'}`,
            id_santri: null,
            username: usernameInput
          };
          setUser(loggedAdmin);

          // Save hashed offline credentials for secure zero-trust offline fallback
          const offlineCreds = {
            username: usernameInput.toLowerCase().trim(),
            passwordObfuscated: btoa(passwordInput),
            role: 'Admin' as const,
            nama_lengkap: `Admin - ${json.nama_lembaga || 'Lembaga'}`
          };
          localStorage.setItem(`sim_offline_creds${suffix}`, JSON.stringify(offlineCreds));
          
          setTimeout(() => {
            syncDataFromSheets(targetUrl);
          }, 100);
          return null;
        }
      } catch (err) {
        console.warn("Koneksi ke server pusat terganggu, memindai instansi lokal...", err);
      }

      // 2. Jika tidak cocok di Master table, scan database sekolah yang aktif secara paralel (untuk Ustadz & lokal Admin)
      const activeSchools = lembagaList.filter(l => l.status && (l.status.toLowerCase() === 'aktif' || l.status.toLowerCase() === 'aktiv'));
      
      if (activeSchools.length > 0) {
        try {
          const scanPromises = activeSchools.map(async (school) => {
            try {
              const res = await fetch(school.link_appscript, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({
                  action: 'login_ustadz',
                  username: usernameInput,
                  password: passwordInput
                })
              });
              const data = await res.json();
              if (data && data.success) {
                return { school, user: data.user };
              }
            } catch (e) {
              // Abaikan kegagalan koneksi ke satu sekolah sewaktu pemindaian
            }
            return null;
          });

          const scanResults = await Promise.all(scanPromises);
          const matchedResult = scanResults.find(r => r !== null);

          if (matchedResult) {
            const { school, user: loggedUser } = matchedResult;
            setActiveScriptUrl(school.link_appscript);
            const suffix = getSchoolSuffix();
            localStorage.setItem(`sim_active_script_url${suffix}`, school.link_appscript);

            const activeUser = {
              role: loggedUser?.role || 'Ustadz',
              nama_lengkap: loggedUser?.nama_lengkap || usernameInput,
              id_santri: null,
              username: loggedUser?.username || usernameInput
            };
            setUser(activeUser);

            // Save hashed offline credentials for secure zero-trust offline fallback
            const offlineCreds = {
              username: usernameInput.toLowerCase().trim(),
              passwordObfuscated: btoa(passwordInput),
              role: loggedUser?.role || 'Ustadz',
              nama_lengkap: loggedUser?.nama_lengkap || usernameInput
            };
            localStorage.setItem(`sim_offline_creds${suffix}`, JSON.stringify(offlineCreds));

            setTimeout(() => {
              syncDataFromSheets(school.link_appscript);
            }, 100);
            return null;
          }
        } catch (scanErr) {
          console.error("Gagal melakukan pemindaian instansi:", scanErr);
        }
      }

      // 3. Fallback pencocokan offline jika server offline/down
      const suffix = getSchoolSuffix();
      const offlineCredsStr = localStorage.getItem(`sim_offline_creds${suffix}`);
      if (offlineCredsStr) {
        try {
          const offlineCreds = JSON.parse(offlineCredsStr);
          if (
            offlineCreds &&
            offlineCreds.username === usernameInput.toLowerCase().trim() &&
            atob(offlineCreds.passwordObfuscated) === passwordInput
          ) {
            setUser({
              role: offlineCreds.role,
              nama_lengkap: offlineCreds.nama_lengkap,
              id_santri: null,
              username: offlineCreds.username
            });
            setIsSyncing(false);
            return null;
          }
        } catch (e) {
          console.error("Gagal memproses kredensial offline:", e);
        }
      }

      // Legacy fallback (jika ada cache sim_users lama)
      const foundUser = usersList.find(
        u => u.username && u.username.toLowerCase().trim() === usernameInput.toLowerCase().trim() && u.password && String(u.password).trim() === passwordInput
      );
      if (foundUser) {
        setUser({
          role: foundUser.role,
          nama_lengkap: foundUser.nama_lengkap,
          id_santri: null,
          username: foundUser.username
        });
        setIsSyncing(false);
        return null;
      }

      setIsSyncing(false);
      return 'ID Pengguna atau Kata Sandi salah untuk akun Pengurus / Admin!';
    } else {
      // Wali Santri Login
      const namaInput = field1.trim();
      const nisInput = field2.trim();

      const inputNisLower = nisInput.toLowerCase();

      // Cari lembaga mana pencocokan prefix kode lembaga ini (baik code_tpq kustom maupun fallback dari appscript URL)
      let matchedInst = lembagaList.find(inst => {
        const customPrefix = inst.code_tpq ? String(inst.code_tpq).toLowerCase().trim() : '';
        const fallbackPrefix = getAppScriptPrefix(inst.link_appscript).toLowerCase();
        
        // Cek apakah NIS diawali dengan customPrefix (jika ada) atau fallbackPrefix
        const isMatched = (customPrefix && inputNisLower.startsWith(customPrefix)) || inputNisLower.startsWith(fallbackPrefix);
        return isMatched && (inst.status.toLowerCase() === 'aktif' || inst.status.toLowerCase() === 'aktiv');
      });

      // Fallback: jika lembagaList kosong atau tidak cocok, pakai activeScriptUrl / GOOGLE_SCRIPT_URL langsung
      if (!matchedInst && activeScriptUrl) {
        matchedInst = {
          username: '',
          nama_lembaga: '',
          link_appscript: activeScriptUrl,
          status: 'Aktif'
        };
      } else if (!matchedInst && GOOGLE_SCRIPT_URL) {
        matchedInst = {
          username: '',
          nama_lembaga: '',
          link_appscript: GOOGLE_SCRIPT_URL,
          status: 'Aktif'
        };
      }

      if (!matchedInst) {
        return `Nomor Induk Siswa (NIS) "${nisInput}" tidak cocok dengan kode lembaga aktif manapun. Mohon hubungi admin TPQ Anda.`;
      }

      const targetUrl = matchedInst.link_appscript;
      setIsSyncing(true);
      try {
        // 1. Sync data dari lembaga bersangkutan terlebih dahulu agar data ter-update
        const syncResult = await syncDataFromSheets(targetUrl);
        const activeSantriList = (syncResult && syncResult.Santri && syncResult.Santri.length > 0) 
          ? syncResult.Santri 
          : santriList;

        // 2. Pencocokan dengan toleransi logika tinggi (Premium/Seamless Matching)
        const foundSantri = activeSantriList.find(s => {
          if (!s) return false;
          
          const sNis = String(s.nis || '').trim().toLowerCase();
          const inputNis = nisInput.toLowerCase();
          
          if (sNis !== inputNis) return false;

          // Normalisasi Nama
          const sNameOrig = String(s.nama_santri || '').trim().toLowerCase();
          const sNameNoSpaces = sNameOrig.replace(/\s+/g, '');
          const inputNameOrig = namaInput.toLowerCase();
          const inputNameNoSpaces = inputNameOrig.replace(/\s+/g, '');
          
          // Normalisasi Username Ortu
          const sUsernameOrtu = String(s.username_ortu || '').trim().toLowerCase();
          
          // Nama Depan
          const sFirstWord = sNameOrig.split(' ')[0] || '';
          const inputFirstWord = inputNameOrig.split(' ')[0] || '';

          // Kriteria Pencocokan
          const isExactName = sNameOrig === inputNameOrig;
          const isNoSpaceName = sNameNoSpaces === inputNameNoSpaces;
          const isUsernameOrtu = sUsernameOrtu === inputNameOrig;
          const isFirstWordMatch = sFirstWord && sFirstWord === inputFirstWord;

          return isExactName || isNoSpaceName || isUsernameOrtu || isFirstWordMatch;
        });

        if (foundSantri) {
          setActiveScriptUrl(targetUrl);
          const suffix = getSchoolSuffix();
          localStorage.setItem(`sim_active_script_url${suffix}`, targetUrl);

          setUser({
            role: 'OrangTua',
            nama_lengkap: `Wali dari ${foundSantri.nama_santri}`,
            id_santri: foundSantri.id_santri,
            username: foundSantri.username_ortu || ""
          });

          return null;
        } else {
          return 'Identitas Santri tidak terverifikasi! Pastikan Nama Lengkap Santri / Akun Wali / Nama Depan dan NIS sudah benar.';
        }
      } catch (err) {
        // Fallback offline match dari database lokal yang tersimpan
        const foundSantri = santriList.find(s => {
          if (!s) return false;
          const sNis = String(s.nis || '').trim().toLowerCase();
          const inputNis = nisInput.toLowerCase();
          if (sNis !== inputNis) return false;

          const sNameOrig = String(s.nama_santri || '').trim().toLowerCase();
          const sNameNoSpaces = sNameOrig.replace(/\s+/g, '');
          const inputNameOrig = namaInput.toLowerCase();
          const inputNameNoSpaces = inputNameOrig.replace(/\s+/g, '');
          const sUsernameOrtu = String(s.username_ortu || '').trim().toLowerCase();
          
          return sNameOrig === inputNameOrig || sNameNoSpaces === inputNameNoSpaces || sUsernameOrtu === inputNameOrig;
        });

        if (foundSantri) {
          setActiveScriptUrl(targetUrl);
          const suffix = getSchoolSuffix();
          localStorage.setItem(`sim_active_script_url${suffix}`, targetUrl);
          
          setUser({
            role: 'OrangTua',
            nama_lengkap: `Wali dari ${foundSantri.nama_santri}`,
            id_santri: foundSantri.id_santri,
            username: foundSantri.username_ortu || ""
          });
          return null;
        }
        return 'Gagal menyambungkan ke database lembaga. Silakan periksa koneksi internet Anda.';
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setForceLogin(false);
  };

  // --- Helpers formatting decimal currency ---
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  // --- MUTATORS TRIGGERS (With Google Sheets background sync) ---
  const syncToGoogleSheetsCurrent = async (sheetName: string, action: string, data: any, id?: string): Promise<boolean> => {
    const urlToUse = (selectedLandingSchool && selectedLandingSchool.link_appscript)
      ? selectedLandingSchool.link_appscript
      : activeScriptUrl;
    if (!urlToUse) return false;
    try {
      setSyncError(null);
      const schoolUser = detectSchoolUsername() || "";
      const response = await fetch(urlToUse, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          sheet: sheetName,
          action: action,
          data: data,
          id: id,
          username: schoolUser
        })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return true;
    } catch (e: any) {
      console.warn('Sync warning (using cached mode):', e);
      setSyncError("Sinkronisasi gagal, perubahan disimpan secara lokal di browser.");
      return false;
    }
  };

  const addPendaftaran = (p: Omit<Pendaftaran, 'id_pendaftaran' | 'tanggal_daftar' | 'status'>) => {
    const id = 'REG' + Date.now();
    const newReg: Pendaftaran = {
      ...p,
      id_pendaftaran: id,
      tanggal_daftar: new Date().toISOString().substring(0, 10),
      status: 'Pending'
    };
    setPendaftaranList(prev => [newReg, ...prev]);
    syncToGoogleSheetsCurrent('Pendaftaran', 'add', newReg);
  };

  const updatePendaftaran = (updated: Pendaftaran) => {
    setPendaftaranList(prev => prev.map(p => p.id_pendaftaran === updated.id_pendaftaran ? updated : p));
    syncToGoogleSheetsCurrent('Pendaftaran', 'update', updated);
  };

  const deletePendaftaran = (id: string) => {
    setPendaftaranList(prev => prev.filter(p => p.id_pendaftaran !== id));
    syncToGoogleSheetsCurrent('Pendaftaran', 'delete', null, id);
  };

  const addSantri = (s: Omit<Santri, 'id_santri' | 'username_ortu' | 'password_ortu'>) => {
    const id = 'S' + Date.now();
    const matchedInst = lembagaList.find(inst => inst.link_appscript === activeScriptUrl);
    const prefix = matchedInst?.code_tpq || getAppScriptPrefix(activeScriptUrl);
    
    let correctedNis = (s.nis || "").toString().trim();
    if (correctedNis && !correctedNis.toLowerCase().startsWith(prefix.toLowerCase())) {
      correctedNis = prefix + correctedNis;
    } else if (!correctedNis) {
      correctedNis = prefix + "1001";
    }
    const newStudent: Santri = {
      ...s,
      nis: correctedNis,
      id_santri: id,
      username_ortu: s.nama_santri.toLowerCase().replace(/\s+/g, ''),
      password_ortu: correctedNis
    };
    setSantriList(prev => [...prev, newStudent]);
    syncToGoogleSheetsCurrent('Santri', 'add', newStudent);
  };

  const importSantriList = (data: Santri[]) => {
    setSantriList(prev => [...prev, ...data]);
    data.forEach(s => {
      syncToGoogleSheetsCurrent('Santri', 'add', s);
    });
  };

  const deleteSantri = (id: string) => {
    setSantriList(prev => prev.filter(s => s.id_santri !== id));
    setSetoranList(prev => prev.filter(s => s.id_santri !== id));
    setPembayaranList(prev => prev.filter(p => p.id_santri !== id));
    setTabunganList(prev => prev.filter(t => t.id_santri !== id));
    syncToGoogleSheetsCurrent('Santri', 'delete', null, id);
  };

  const updateSantriSingle = (s: Santri) => {
    const matchedInst = lembagaList.find(inst => inst.link_appscript === activeScriptUrl);
    const prefix = matchedInst?.code_tpq || getAppScriptPrefix(activeScriptUrl);
    
    let correctedNis = (s.nis || "").toString().trim();
    if (correctedNis && !correctedNis.toLowerCase().startsWith(prefix.toLowerCase())) {
      correctedNis = prefix + correctedNis;
    } else if (!correctedNis) {
      correctedNis = prefix + "1001";
    }
    const updated = {
      ...s,
      nis: correctedNis,
      password_ortu: s.password_ortu || correctedNis,
      halaqah: s.halaqah || "",
      jumlah_hafalan: s.jumlah_hafalan || "",
      juz_hafal: s.juz_hafal || "",
      murojaah: s.murojaah || ""
    };
    setSantriList(prev => prev.map(item => item.id_santri === s.id_santri ? updated : item));
    syncToGoogleSheetsCurrent('Santri', 'update', updated);
  };

  const addKelas = (name: string) => {
    const id = 'K' + Date.now();
    const newK = { id_kelas: id, nama_kelas: name };
    setKelasList(prev => [...prev, newK]);
    syncToGoogleSheetsCurrent('Kelas', 'add', newK);
  };

  const updateKelas = (id: string, newName: string) => {
    const foundK = kelasList.find(k => k.id_kelas === id);
    if (!foundK) return;
    const oldName = foundK.nama_kelas;
    setKelasList(prev => prev.map(k => k.id_kelas === id ? { ...k, nama_kelas: newName } : k));
    setSantriList(prev => prev.map(s => s.halaqah === oldName ? { ...s, halaqah: newName } : s));
    syncToGoogleSheetsCurrent('Kelas', 'update', { id_kelas: id, nama_kelas: newName });
  };

  const deleteKelas = (id: string) => {
    const foundK = kelasList.find(k => k.id_kelas === id);
    if (!foundK) return;
    setKelasList(prev => prev.filter(k => k.id_kelas !== id));
    setSantriList(prev => prev.map(s => s.halaqah === foundK.nama_kelas ? { ...s, halaqah: 'Tanpa Kelas' } : s));
    syncToGoogleSheetsCurrent('Kelas', 'delete', null, id);
  };

  const addSetoran = (s: Omit<Setoran, 'id_setoran' | 'nama_ustadz'>) => {
    // Merge everything into a single row if it's the same student on the same date
    const existingIndex = setoranList.findIndex(x => x.id_santri === s.id_santri && x.tanggal === s.tanggal);

    if (existingIndex !== -1) {
      const existing = { ...setoranList[existingIndex] };
      
      // Parse any existing combined kualitas first to recover individual values if present
      const parsedK = parseKualitasString(existing.kualitas || '');
      if (parsedK.surah && !existing.kualitas_surah) existing.kualitas_surah = parsedK.surah;
      if (parsedK.tilawah && !existing.kualitas_tilawah) existing.kualitas_tilawah = parsedK.tilawah;
      if (parsedK.hadits && !existing.kualitas_hadits) existing.kualitas_hadits = parsedK.hadits;

      // CRITICAL: Before we apply the new qualities, if there is already an existing field,
      // preserve its previous predikat using the previous existing.kualitas value if individual was not set
      if (existing.surah !== '-' && existing.surah !== '' && !existing.kualitas_surah) {
        existing.kualitas_surah = existing.kualitas || 'Mumtaz';
      }
      if (existing.tilawah !== '-' && existing.tilawah !== '' && !existing.kualitas_tilawah) {
        existing.kualitas_tilawah = existing.kualitas || 'Mumtaz';
      }
      if (existing.hadits !== '-' && existing.hadits !== '' && !existing.kualitas_hadits) {
        existing.kualitas_hadits = existing.kualitas || 'Mumtaz';
      }

      // Now apply the newly entered fields and their specific predikats
      if (s.surah !== '-' && s.surah !== '') {
        existing.surah = s.surah;
        existing.ayat = s.ayat;
        existing.kualitas_surah = s.kualitas;
      }
      if (s.tilawah !== '-' && s.tilawah !== '') {
        existing.tilawah = s.tilawah;
        existing.kualitas_tilawah = s.kualitas;
      }
      if (s.halaman !== undefined && s.halaman !== '-' && s.halaman !== '') {
        existing.halaman = s.halaman;
      }
      if (s.hadits !== '-' && s.hadits !== '') {
        existing.hadits = s.hadits;
        existing.kualitas_hadits = s.kualitas;
      }
      if (s.catatan && s.catatan !== '-' && s.catatan !== '') {
        if (existing.catatan && existing.catatan !== '-' && existing.catatan !== '') {
          if (!existing.catatan.includes(s.catatan)) {
            existing.catatan = `${existing.catatan}; ${s.catatan}`;
          }
        } else {
          existing.catatan = s.catatan;
        }
      }

      // Rebuild combined kualitas string representing each program specifically
      const kParts: string[] = [];
      if (existing.surah !== '-' && existing.surah !== '') {
        kParts.push(`Hafalan: ${existing.kualitas_surah || 'Mumtaz'}`);
      }
      if (existing.tilawah !== '-' && existing.tilawah !== '') {
        kParts.push(`Tilawah: ${existing.kualitas_tilawah || 'Mumtaz'}`);
      }
      if (existing.hadits !== '-' && existing.hadits !== '') {
        kParts.push(`Hadits: ${existing.kualitas_hadits || 'Mumtaz'}`);
      }
      existing.kualitas = kParts.join(' | ') || s.kualitas || 'Mumtaz';

      existing.nama_ustadz = user?.nama_lengkap || existing.nama_ustadz || 'Ustadz Hanafi';
      
      setSetoranList(prev => prev.map((item, idx) => idx === existingIndex ? existing : item));
      syncToGoogleSheetsCurrent('Setoran', 'update', existing);
    } else {
      const id = 'SET' + Date.now();
      const kSurah = s.surah !== '-' && s.surah !== '' ? s.kualitas : undefined;
      const kTilawah = s.tilawah !== '-' && s.tilawah !== '' ? s.kualitas : undefined;
      const kHadits = s.hadits !== '-' && s.hadits !== '' ? s.kualitas : undefined;

      const kParts: string[] = [];
      if (s.surah !== '-' && s.surah !== '') kParts.push(`Hafalan: ${kSurah || 'Mumtaz'}`);
      if (s.tilawah !== '-' && s.tilawah !== '') kParts.push(`Tilawah: ${kTilawah || 'Mumtaz'}`);
      if (s.hadits !== '-' && s.hadits !== '') kParts.push(`Hadits: ${kHadits || 'Mumtaz'}`);
      const combinedKualitas = kParts.join(' | ') || s.kualitas || 'Mumtaz';

      const newS: Setoran = {
        ...s,
        halaman: s.halaman || '-',
        id_setoran: id,
        nama_ustadz: user?.nama_lengkap || 'Ustadz Hanafi',
        kualitas_surah: kSurah,
        kualitas_tilawah: kTilawah,
        kualitas_hadits: kHadits,
        kualitas: combinedKualitas
      };
      setSetoranList(prev => [...prev, newS]);
      syncToGoogleSheetsCurrent('Setoran', 'add', newS);
    }
  };

  const deleteSetoran = (id: string) => {
    setSetoranList(prev => prev.filter(x => x.id_setoran !== id));
    return syncToGoogleSheetsCurrent('Setoran', 'delete', null, id);
  };

  const updateSetoran = (uObj: Setoran) => {
    // Rebuild combined kualitas string representing each program specifically when edited/saved
    const kParts: string[] = [];
    if (uObj.surah !== '-' && uObj.surah !== '') {
      kParts.push(`Hafalan: ${uObj.kualitas_surah || uObj.kualitas || 'Mumtaz'}`);
    }
    if (uObj.tilawah !== '-' && uObj.tilawah !== '') {
      kParts.push(`Tilawah: ${uObj.kualitas_tilawah || uObj.kualitas || 'Mumtaz'}`);
    }
    if (uObj.hadits !== '-' && uObj.hadits !== '') {
      kParts.push(`Hadits: ${uObj.kualitas_hadits || uObj.kualitas || 'Mumtaz'}`);
    }
    const updatedObj = {
      ...uObj,
      kualitas: kParts.join(' | ') || uObj.kualitas || 'Mumtaz'
    };

    setSetoranList(prev => prev.map(x => x.id_setoran === uObj.id_setoran ? updatedObj : x));
    syncToGoogleSheetsCurrent('Setoran', 'update', {
      ...updatedObj,
      surah: updatedObj.surah || "-",
      ayat: updatedObj.ayat || "-",
      tilawah: updatedObj.tilawah || "-",
      halaman: updatedObj.halaman || "-",
      hadits: updatedObj.hadits || "-",
      catatan: updatedObj.catatan || ""
    });
  };

  const addPembayaran = (p: Omit<Pembayaran, 'id_pembayaran' | 'nama_admin'>) => {
    const id = 'PAY' + Date.now();
    const newP = {
      ...p,
      id_pembayaran: id,
      nama_admin: user?.nama_lengkap || 'Admin'
    };
    setPembayaranList(prev => [...prev, newP]);
    syncToGoogleSheetsCurrent('Pembayaran', 'add', newP);
  };

  const deletePembayaran = (id: string) => {
    setPembayaranList(prev => prev.filter(x => x.id_pembayaran !== id));
    return syncToGoogleSheetsCurrent('Pembayaran', 'delete', null, id);
  };

  const updatePembayaran = (uObj: Pembayaran) => {
    setPembayaranList(prev => prev.map(x => x.id_pembayaran === uObj.id_pembayaran ? uObj : x));
    syncToGoogleSheetsCurrent('Pembayaran', 'update', {
      ...uObj,
      nominal: Number(uObj.nominal) || 0,
      status: uObj.status || "Lunas",
      catatan: uObj.catatan || ""
    });
  };

  const addTabunganLog = (t: Omit<Tabungan, 'id'>) => {
    const id = 'TB' + Date.now();
    const newT = { ...t, id };
    setTabunganList(prev => [...prev, newT]);
    syncToGoogleSheetsCurrent('Tabungan', 'add', newT);
  };

  const deleteTabungan = (id: string) => {
    setTabunganList(prev => prev.filter(x => x.id !== id));
    return syncToGoogleSheetsCurrent('Tabungan', 'delete', null, id);
  };

  const addInformasiMsg = (i: Omit<InformasiKhusus, 'id'>) => {
    const id = 'INF' + Date.now();
    const newI = {
      id,
      tipe: i.tipe,
      tanggal: i.tanggal,
      id_santri: i.id_santri || '',
      nama_santri: i.nama_santri || '',
      pesan: i.pesan,
      target_id_santri: JSON.stringify(i.target_id_santri || []),
      terbaca_oleh: JSON.stringify([])
    };
    setInformasiList(prev => [...prev, { ...i, id }]);
    syncToGoogleSheetsCurrent('Informasi', 'add', newI);
  };

  const deleteInformasi = (id: string) => {
    setInformasiList(prev => prev.filter(x => x.id !== id));
    return syncToGoogleSheetsCurrent('Informasi', 'delete', null, id);
  };

  const addAgenda = (agenda: Omit<Agenda, 'id'>) => {
    const id = 'AGD' + Date.now();
    const newA = {
      ...agenda,
      id
    };
    setAgendaList(prev => [...prev, newA]);
    syncToGoogleSheetsCurrent('Agenda', 'add', newA);
  };

  const deleteAgenda = (id: string) => {
    setAgendaList(prev => prev.filter(x => x.id !== id));
    return syncToGoogleSheetsCurrent('Agenda', 'delete', null, id);
  };

  const updateAgenda = (agenda: Agenda) => {
    setAgendaList(prev => prev.map(x => x.id === agenda.id ? agenda : x));
    syncToGoogleSheetsCurrent('Agenda', 'update', agenda);
  };

  const addHomeMutabaahLog = (mInp: Omit<Mutabaah, 'id' | 'id_santri' | 'nama_santri'>) => {
    if (!user || !user.id_santri) return;
    const studentObj = santriList.find(s => s.id_santri === user.id_santri);
    if (!studentObj) return;

    const id = 'M' + Date.now();
    const newM = {
      ...mInp,
      id,
      id_santri: user.id_santri!,
      nama_santri: studentObj.nama_santri
    };
    setMutabaahList(prev => [...prev, newM]);
    syncToGoogleSheetsCurrent('Mutabaah', 'add', newM);
  };

  const addMutabaahDirect = (data: Omit<Mutabaah, 'id'>) => {
    const id = 'M' + Date.now();
    const newM: Mutabaah = {
      ...data,
      id
    };
    setMutabaahList(prev => [...prev, newM]);
    syncToGoogleSheetsCurrent('Mutabaah', 'add', newM);
  };

  const deleteMutabaah = (id: string) => {
    setMutabaahList(prev => prev.filter(m => m.id !== id));
    return syncToGoogleSheetsCurrent('Mutabaah', 'delete', null, id);
  };

  const clearCategoryData = async (category: string) => {
    let sheetName = "";
    if (category === 'tabungan') {
      sheetName = 'Tabungan';
      setTabunganList([]);
    } else if (category === 'informasi') {
      sheetName = 'Informasi';
      setInformasiList([]);
    } else if (category === 'pembayaran') {
      sheetName = 'Pembayaran';
      setPembayaranList([]);
    } else if (category === 'mutabaah') {
      sheetName = 'Mutabaah';
      setMutabaahList([]);
    } else if (category === 'setoran') {
      sheetName = 'Setoran';
      setSetoranList([]);
    }

    if (sheetName) {
      await syncToGoogleSheetsCurrent(sheetName, 'clearCategory', null);
    }
  };

  const updateTabungan = (tObj: Tabungan) => {
    setTabunganList(prev => prev.map(x => x.id === tObj.id ? tObj : x));
    syncToGoogleSheetsCurrent('Tabungan', 'update', {
      ...tObj,
      nominal: Number(tObj.nominal) || 0
    });
  };

  const updateInformasi = (iObj: InformasiKhusus) => {
    setInformasiList(prev => prev.map(x => x.id === iObj.id ? iObj : x));
    syncToGoogleSheetsCurrent('Informasi', 'update', {
      ...iObj,
      target_id_santri: JSON.stringify(iObj.target_id_santri || []) as any,
      terbaca_oleh: JSON.stringify(iObj.terbaca_oleh || []) as any
    });
  };

  const updateMutabaah = (mObj: Mutabaah) => {
    setMutabaahList(prev => prev.map(x => x.id === mObj.id ? mObj : x));
    syncToGoogleSheetsCurrent('Mutabaah', 'update', mObj);
  };

  const handleUpdateSettings = async (s: Pengaturan): Promise<boolean> => {
    setPengaturan(s);
    const success = await syncToGoogleSheetsCurrent('Pengaturan', 'saveSettings', {
      nama_lembaga: s.nama_lembaga,
      nama_pimpinan: s.nama_pimpinan,
      logo: s.logo,
      alamat: s.alamat,
      telepon: s.telepon,
      email: s.email,
      website: s.website,
      pengumuman: s.pengumuman,
      link_wa_json: JSON.stringify(s.link_wa),
      web_config_json: s.web_config_json || "",
      id_drive: s.id_drive || "",
      link_website: s.link_website || ""
    });
    return success;
  };

  const triggerSyncData = async (): Promise<void> => {
    await syncDataFromSheets();
  };

  if (selectedLandingSchool && !forceLogin) {
    if (isInitialLoading) {
      const schoolLogo = (pengaturan.logo && !pengaturan.logo.includes('CsJgAej') && !pengaturan.logo.includes('placeholder')) ? pengaturan.logo : "https://iili.io/CCbS5Ss.md.png";
      const rawName = pengaturan.nama_lembaga || selectedLandingSchool.nama_lembaga || "";
      const schoolName = (!rawName || rawName.includes("Baitul Quran") || rawName === "SIM SAYA") ? "SIM TPQ DIGITAL" : rawName;

      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="space-y-6 max-w-md animate-pulse">
            {/* Pulsing elegant logo */}
            <div className="relative flex justify-center">
              <div className="w-28 h-28 bg-teal-600/10 rounded-full absolute animate-ping duration-[2000ms]"></div>
              <div className="w-28 h-28 bg-teal-500/5 rounded-full absolute animate-pulse duration-[3000ms] border border-teal-500/20"></div>
              
              <div className="w-24 h-24 bg-gradient-to-br from-slate-900 to-teal-950 border border-teal-500/30 rounded-[2rem] shadow-[0_0_50px_rgba(13,148,136,0.25)] flex items-center justify-center relative z-10 transition-all duration-500 overflow-hidden">
                <img 
                  src={getCleanImageUrl(schoolLogo)} 
                  alt={schoolName}
                  className="w-16 h-16 object-contain rounded-2xl p-1"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://iili.io/CCbS5Ss.md.png';
                  }}
                />
              </div>
            </div>
            
            <div className="space-y-3 pt-4">
              <h3 className="text-xl font-black text-white uppercase tracking-wider">
                SIM TPQ DIGITAL
              </h3>
              <p className="text-xs text-teal-400 font-extrabold tracking-widest uppercase px-4 leading-relaxed">
                {schoolName}
              </p>
              <div className="h-[3px] w-36 bg-slate-800/80 mx-auto rounded-full overflow-hidden relative mt-6">
                <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-400 to-teal-500 w-1/2 rounded-full animate-[loadingProgress_1.5s_infinite_ease-in-out]"></div>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">
                Mengamankan Koneksi & Sinkronisasi...
              </p>
            </div>
          </div>
          <style>{`
            @keyframes loadingProgress {
              0% { left: -50%; }
              100% { left: 100%; }
            }
          `}</style>
        </div>
      );
    }

    return (
      <TPQLandingPage
        school={selectedLandingSchool}
        pengaturan={pengaturan}
        websiteData={websiteData}
        kelasList={kelasList}
        mataPelajaranList={mataPelajaranList}
        santriList={santriList}
        pendaftaranList={pendaftaranList}
        agendaList={agendaList}
        onAddPendaftaran={addPendaftaran}
        onAddSantri={addSantri}
        onNavigateToLogin={() => setForceLogin(true)}
        isSyncing={isSyncing}
        onSyncData={triggerSyncData}
        user={user}
        onGoToDashboard={() => setForceLogin(true)}
      />
    );
  }

  const matchedCurrentInst = lembagaList.find(inst => inst.link_appscript === activeScriptUrl);
  const activeSchoolPrefix = matchedCurrentInst?.code_tpq || getAppScriptPrefix(activeScriptUrl);

  return (
    <div id="app-container">
      <div id="app-root" className="h-[100dvh] w-full sm:max-w-md sm:mx-auto bg-slate-100 flex flex-col relative shadow-2xl overflow-hidden">
        
        {/* PWA Install Notification Dialog */}
        {showInstallBanner && !user && (
          <div className="absolute top-4 left-4 right-4 bg-teal-950 text-white p-4.5 rounded-3xl shadow-2xl z-50 border border-teal-800/80 animate-[slideDown_0.4s_ease-out]">
            <div className="flex gap-3 items-center">
              <div className="bg-gradient-to-br from-amber-400 to-amber-500 p-2.5 rounded-2xl shrink-0 text-slate-900 shadow-lg shadow-amber-500/20">
                <Smartphone className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-grow text-left">
                <h4 className="text-xs font-bold tracking-tight text-white font-sans">
                  Instal Aplikasi Ini
                </h4>
                <p className="text-[10px] text-teal-200 mt-0.5 leading-relaxed font-sans">
                  {isIOS ? (
                    <span className="flex items-center gap-1.5 flex-wrap">
                      Ketuk <i className="fa-solid fa-arrow-up-from-bracket text-amber-400 text-xs"></i> lalu pilih <b className="text-white">"Tambahkan ke Layar Utama"</b>
                    </span>
                  ) : (
                    "Tambahkan ke layar utama HP Anda agar akses portal lebih cepat dan ringan."
                  )}
                </p>
                {!isIOS && pwaPrompt && (
                  <button
                    onClick={() => {
                      if (pwaPrompt) {
                        pwaPrompt.prompt();
                        pwaPrompt.userChoice.then((choiceResult: any) => {
                          if (choiceResult.outcome === 'accepted') {
                            console.log('User installed the PWA app');
                            setShowInstallBanner(false);
                          }
                          setPwaPrompt(null);
                        });
                      }
                    }}
                    className="mt-2.5 w-full bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-bold py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow active:scale-97 cursor-pointer"
                  >
                    <DownloadCloud className="w-3.5 h-3.5" /> Instal Sekarang
                  </button>
                )}
                {!isIOS && !pwaPrompt && (
                  <p className="text-[9px] text-teal-300 mt-1 font-sans">
                    💡 Ketuk <b>titik tiga</b> browser Anda, pilih <b>"Instal Aplikasi"</b> atau <b>"Tambahkan ke Layar Utama"</b>.
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowInstallBanner(false)}
                className="text-teal-300 hover:text-white p-1 hover:bg-teal-900/60 rounded-full shrink-0 transition-colors cursor-pointer"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Sync loading status bar hid for professional view */}

        {!user ? (
          <LoginForm 
            onLogin={handleLogin} 
            pengaturan={pengaturan} 
            lembagaList={lembagaList} 
            onBackToLanding={selectedLandingSchool ? () => setForceLogin(false) : undefined}
          />
        ) : user.role === 'Ustadz' || user.role === 'Admin' ? (
          <AdminDashboard
            user={user}
            santriList={santriList}
            setoranList={setoranList}
            pembayaranList={pembayaranList}
            kelasList={kelasList}
            mataPelajaranList={mataPelajaranList}
            onUpdateMataPelajaran={updateMataPelajaran}
            tabunganList={tabunganList}
            informasiList={informasiList}
            mutabaahList={mutabaahList}
            pengaturan={pengaturan}
                        activeSchoolPrefix={activeSchoolPrefix}
                        activeSchoolName={matchedCurrentInst?.username || getActiveSchoolUsernameFromUrl() || 'baitulquran'}
            
            onAddSantri={addSantri}
            onImportSantri={importSantriList}
            onDeleteSantri={deleteSantri}
            onAddKelas={addKelas}
            onUpdateKelas={updateKelas}
            onDeleteKelas={deleteKelas}
            onUpdateSantri={updateSantriSingle}
            
            onAddSetoran={addSetoran}
            onAddPembayaran={addPembayaran}
            onAddTabungan={addTabunganLog}
            onAddInformasi={addInformasiMsg}
            onAddMutabaah={addMutabaahDirect}
            
            onDeleteSetoran={deleteSetoran}
            onDeletePembayaran={deletePembayaran}
            onDeleteTabungan={deleteTabungan}
            onDeleteInformasi={deleteInformasi}
            onDeleteMutabaah={deleteMutabaah}
            onClearCategoryData={clearCategoryData}
            
            onUpdateSetoran={updateSetoran}
            onUpdatePembayaran={updatePembayaran}
            onUpdateTabungan={updateTabungan}
            onUpdateInformasi={updateInformasi}
            onUpdateMutabaah={updateMutabaah}
            
            onUpdateSettings={handleUpdateSettings}
            pendaftaranList={pendaftaranList}
            onUpdatePendaftaran={updatePendaftaran}
            onDeletePendaftaran={deletePendaftaran}
            websiteData={websiteData}
            onUpdateWebsiteData={setWebsiteData}
            
            agendaList={agendaList}
            onAddAgenda={addAgenda}
            onDeleteAgenda={deleteAgenda}
            onUpdateAgenda={updateAgenda}

            onLogout={handleLogout}
            formatRupiah={formatRupiah}
            isSyncing={isSyncing}
            onSyncData={triggerSyncData}
            syncError={syncError}
          />
        ) : (
          <ParentDashboard
            user={user}
            santriList={santriList}
            setoranList={setoranList}
            pembayaranList={pembayaranList}
            tabunganList={tabunganList}
            pengaturan={pengaturan}
            mutabaahList={mutabaahList}
            informasiList={informasiList}
            agendaList={agendaList}
            onAddMutabaah={addHomeMutabaahLog}
            onLogout={handleLogout}
            formatRupiah={formatRupiah}
            isSyncing={isSyncing}
            onSyncData={triggerSyncData}
            syncError={syncError}
          />
        )}
      </div>
    </div>
  );
}
