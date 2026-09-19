import React, { useState, useEffect } from 'react';
import { Home, History, BookOpen, DollarSign, LogOut, Phone, Award, MessageSquare, Plus, Check, Coins, Calculator, RefreshCw, X, Users, ChevronLeft, Sparkles, TrendingUp, Clock, Heart, ShieldCheck, Calendar, Bell, FileText, Wallet, Activity } from 'lucide-react';
import { Santri, Setoran, Pembayaran, Pengaturan, Mutabaah, InformasiKhusus, Tabungan, Agenda } from '../types';
import QuranViewer from './QuranViewer';
import DoaList from './DoaList';

const formatTanggal = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-';
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const parts = dateStr.split('-');
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (isoMatch) {
      return `${isoMatch[3]}-${isoMatch[2]}-${isoMatch[1]}`;
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    }
  } catch (e) {
    // ignore
  }
  const fallbackMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (fallbackMatch) {
    return `${fallbackMatch[3]}-${fallbackMatch[2]}-${fallbackMatch[1]}`;
  }
  return dateStr;
};

const getCleanName = (name: string): string => {
  if (!name) return '';
  return name.replace(/^(Ust\.\s*|Ust\s+|Ustadz\.\s*|Ustadz\s+)/i, '');
};

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

const getHijriDateString = (date: Date = new Date()): string => {
  try {
    const formatter = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    let formatted = formatter.format(date);

    if (!formatted.includes('H')) {
      formatted += ' H';
    }

    if (formatted.includes(date.getFullYear().toString())) {
      throw new Error('Islamic calendar not supported on this browser');
    }

    formatted = formatted
      .replace('Muharam', 'Muharram')
      .replace('Zulhijah', 'Zulhijjah')
      .replace('Zulkaidah', "Zulqa'dah");

    return formatted;
  } catch (e) {
    const baseDate = new Date('2026-07-07');
    const msDiff = date.getTime() - baseDate.getTime();
    const dayDiff = Math.round(msDiff / (1000 * 60 * 60 * 24));

    let hijriDay = 22 + dayDiff;
    let hijriMonth = "Muharram";
    let hijriYear = 1448;

    if (hijriDay > 30) {
      hijriDay = hijriDay - 30;
      hijriMonth = "Safar";
    } else if (hijriDay <= 0) {
      hijriDay = 30 + hijriDay;
      hijriMonth = "Zulhijjah";
      hijriYear = 1447;
    }
    return `${hijriDay} ${hijriMonth} ${hijriYear} H`;
  }
};

const getAnnouncementTheme = (title: string, desc: string) => {
  const t = (title + ' ' + desc).toLowerCase();
  if (t.includes('libur') || t.includes('cuti') || t.includes('ramadhan') || t.includes('idul')) {
    return {
      bg: 'bg-gradient-to-br from-[#0f766e] to-[#042f2e]',
      border: 'border-teal-800/60',
      text: 'text-white',
      badgeBg: 'bg-teal-900/60',
      badgeText: 'text-teal-300',
      tag: 'LIBUR SEKOLAH',
      icon: (
        <svg className="w-24 h-24 text-teal-400" viewBox="0 0 100 100" fill="currentColor">
          <path d="M50 15 L53 25 L63 25 L55 31 L58 41 L50 35 L42 41 L45 31 L37 25 L47 25 Z" />
          <rect x="44" y="45" width="12" height="40" rx="3" />
          <circle cx="50" cy="45" r="10" />
        </svg>
      )
    };
  }
  if (t.includes('wisuda') || t.includes('tahfidz') || t.includes('kelulusan') || t.includes('khotmil')) {
    return {
      bg: 'bg-gradient-to-br from-amber-800 to-amber-950',
      border: 'border-amber-700/60',
      text: 'text-white',
      badgeBg: 'bg-amber-900/60',
      badgeText: 'text-amber-300',
      tag: 'WISUDA TAHFIDZ',
      icon: (
        <svg className="w-24 h-24 text-amber-400" viewBox="0 0 100 100" fill="currentColor">
          <path d="M10,40 L50,15 L90,40 L50,65 Z" />
          <rect x="42" y="55" width="16" height="30" />
        </svg>
      )
    };
  }
  if (t.includes('spp') || t.includes('pembayaran') || t.includes('keuangan') || t.includes('tagihan') || t.includes('biaya') || t.includes('infak')) {
    return {
      bg: 'bg-gradient-to-br from-indigo-800 to-indigo-950',
      border: 'border-indigo-700/60',
      text: 'text-white',
      badgeBg: 'bg-indigo-900/60',
      badgeText: 'text-indigo-300',
      tag: 'INFO KEUANGAN',
      icon: (
        <svg className="w-24 h-24 text-indigo-400" viewBox="0 0 100 100" fill="currentColor">
          <circle cx="50" cy="50" r="25" />
          <rect x="40" y="35" width="20" height="30" />
        </svg>
      )
    };
  }
  if (t.includes('rapat') || t.includes('wali') || t.includes('pertemuan') || t.includes('sosialisasi')) {
    return {
      bg: 'bg-gradient-to-br from-[#881337] to-[#4c0519]',
      border: 'border-rose-700/60',
      text: 'text-white',
      badgeBg: 'bg-rose-900/60',
      badgeText: 'text-rose-300',
      tag: 'RAPAT WALI',
      icon: (
        <svg className="w-24 h-24 text-rose-400" viewBox="0 0 100 100" fill="currentColor">
          <path d="M30 40 c 10 0, 10-20, 0-20 s -10 20, 0 20 Z" />
          <path d="M70 40 c 10 0, 10-20, 0-20 s -10 20, 0 20 Z" />
          <path d="M50 50 c 15 0, 15-30, 0-30 s -15 30, 0 30 Z" />
          <path d="M10 90 c 0-15 15-20 40-20 s 40 5 40 20 Z" />
        </svg>
      )
    };
  }
  if (t.includes('prestasi') || t.includes('juara') || t.includes('lomba') || t.includes('pemenang')) {
    return {
      bg: 'bg-gradient-to-br from-teal-800 to-teal-950',
      border: 'border-teal-700/60',
      text: 'text-white',
      badgeBg: 'bg-teal-900/60',
      badgeText: 'text-teal-300',
      tag: 'PRESTASI SANTRI',
      icon: (
        <svg className="w-24 h-24 text-teal-400" viewBox="0 0 100 100" fill="currentColor">
          <circle cx="50" cy="35" r="15" />
          <path d="M25 20 L35 20 L35 45 L25 45 Z" />
          <path d="M65 20 L75 20 L75 45 L65 45 Z" />
          <path d="M35 50 L50 75 L65 50 Z" />
          <rect x="46" y="75" width="8" height="15" />
          <rect x="40" y="90" width="20" height="5" />
        </svg>
      )
    };
  }
  return {
    bg: 'bg-gradient-to-br from-slate-800 to-slate-950',
    border: 'border-slate-700/60',
    text: 'text-white',
    badgeBg: 'bg-slate-700/60',
    badgeText: 'text-amber-300',
    tag: 'PENGUMUMAN PENTING',
    icon: (
      <svg className="w-24 h-24 text-slate-400" viewBox="0 0 100 100" fill="currentColor">
        <path d="M50 15 L80 75 L20 75 Z" />
        <circle cx="50" cy="50" r="8" />
        <rect x="48" y="62" width="4" height="4" />
      </svg>
    )
  };
};

const formatIndoDate = (dateStr: string) => {
  try {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
};

interface ParentDashboardProps {
  user: { role: string; nama_lengkap: string; id_santri: string | null };
  santriList: Santri[];
  setoranList: Setoran[];
  pembayaranList: Pembayaran[];
  tabunganList?: Tabungan[];
  pengaturan: Pengaturan;
  mutabaahList: Mutabaah[];
  informasiList: InformasiKhusus[];
  onAddMutabaah: (data: Omit<Mutabaah, 'id' | 'id_santri' | 'nama_santri'>) => void;
  onLogout: () => void;
  formatRupiah: (val: number) => string;
  isSyncing?: boolean;
  onSyncData?: () => Promise<void>;
  syncError?: string | null;
  agendaList?: Agenda[];
}

export default function ParentDashboard({
  user,
  santriList,
  setoranList,
  pembayaranList,
  tabunganList = [],
  pengaturan,
  mutabaahList,
  informasiList,
  onAddMutabaah,
  onLogout,
  formatRupiah,
  isSyncing,
  onSyncData,
  syncError,
  agendaList = []
}: ParentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'beranda' | 'riwayat' | 'mutabaah' | 'pembayaran' | 'quran' | 'informasi' | 'doa' | 'agenda'>('beranda');

  // Manage browser/physical back button history for tab navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.tab) {
        setActiveTab(event.state.tab);
      } else {
        setActiveTab('beranda');
      }
    };
    window.addEventListener('popstate', handlePopState);
    if (!window.history.state) {
      window.history.replaceState({ tab: 'beranda' }, '', '');
    }
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    if (window.history.state?.tab !== activeTab) {
      window.history.pushState({ tab: activeTab }, '', '');
    }
  }, [activeTab]);

  const [riwayatSubTab, setRiwayatSubTab] = useState<'setoran' | 'mutabaah'>('setoran');
  const [selectedRiwayatCard, setSelectedRiwayatCard] = useState<'setoran' | 'keuangan' | 'tabungan' | 'mutabaah' | null>(null);
  const [closedAnnouncementIds, setClosedAnnouncementIds] = useState<string[]>([]);
    const [agendaFilterTab, setAgendaFilterTab] = useState<'all' | 'agenda' | 'pengumuman'>('all');
    const [showJuzModal, setShowJuzModal] = useState(false);
    const [showMurojaahModal, setShowMurojaahModal] = useState(false);

    // Safe date sort helper - NaN dates go to bottom
    const safeDateSort = (a: any, b: any) => {
      const dateA = new Date(a.tanggal).getTime();
      const dateB = new Date(b.tanggal).getTime();
      if (isNaN(dateA) && isNaN(dateB)) return 0;
      if (isNaN(dateA)) return 1;
      if (isNaN(dateB)) return -1;
      return dateB - dateA;
    };

    // Find logged student
    const student = santriList.find(s => s.id_santri && user.id_santri && String(s.id_santri).trim().toLowerCase() === String(user.id_santri).trim().toLowerCase());
    const mySetoran = setoranList.filter(s => s.id_santri && user.id_santri && String(s.id_santri).trim().toLowerCase() === String(user.id_santri).trim().toLowerCase()).sort(safeDateSort);
    const myPayments = pembayaranList.filter(p => p.id_santri && user.id_santri && String(p.id_santri).trim().toLowerCase() === String(user.id_santri).trim().toLowerCase()).sort(safeDateSort);
    const myMutabaah = (mutabaahList || []).filter(m => m.id_santri && user.id_santri && String(m.id_santri).trim().toLowerCase() === String(user.id_santri).trim().toLowerCase()).sort(safeDateSort);
    const mySavings = (tabunganList || []).filter(t => t.id_santri && user.id_santri && String(t.id_santri).trim().toLowerCase() === String(user.id_santri).trim().toLowerCase()).sort(safeDateSort);

    const todayStr = (() => {
    try {
      const options = { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' } as const;
      return new Intl.DateTimeFormat('en-CA', options).format(new Date());
    } catch (e) {
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  })();
  const hasSubmittedToday = myMutabaah.some(m => m.tanggal === todayStr);

  // Filter matching personal announcements
  const myAnnouncements = (informasiList || []).filter(inf => {
    const isTarget = (inf.id_santri === user.id_santri) ||
      (inf.target_id_santri && inf.target_id_santri.includes(user.id_santri || ''));
    return isTarget;
  });

  const activeAnnouncementsToShow = myAnnouncements.filter(inf => !closedAnnouncementIds.includes(inf.id));

  // Premium Dashboard Custom Props
  const islamicQuotes = [
    { text: "Sebaik-baik kalian adalah yang mempelajari Al-Qur'an dan mengajarkannya.", ref: "HR. Bukhari" },
    { text: "Bacalah Al-Qur'an, karena ia akan datang pada hari kiamat sebagai pemberi syafaat bagi pembacanya.", ref: "HR. Muslim" },
    { text: "Rumah yang di dalamnya dibacakan Al-Qur'an akan dihadiri malaikat dan dijauhi dari keburukan.", ref: "HR. Thabrani" },
    { text: "Hati yang tidak terdapat Al-Qur'an di dalamnya bagaikan rumah kosong yang runtuh.", ref: "HR. Tirmidzi" },
    { text: "Barangsiapa membaca satu huruf Kitabullah maka baginya satu kebaikan berkelipatan sepuluh.", ref: "HR. Tirmidzi" }
  ];
  const dateSeed = new Date().getDate();
  const currentQuote = islamicQuotes[dateSeed % islamicQuotes.length];

  const getIslamicGreeting = () => {
    const hr = new Date().getHours();
    if (hr >= 4 && hr < 11) return "Selamat Pagi 🌅";
    if (hr >= 11 && hr < 15) return "Selamat Siang ☀️";
    if (hr >= 15 && hr < 18) return "Selamat Sore 🌤️";
    return "Selamat Malam 🌙";
  };

  // Calculate dynamic stats for the student
  const totalPaidAmount = myPayments.reduce((sum, p) => sum + (Number(p.nominal) || 0), 0);
  const latestMutabaahReport = myMutabaah[0];
  let latestPrayersCompleted = 0;
  if (latestMutabaahReport) {
    if (latestMutabaahReport.subuh === 'Ya') latestPrayersCompleted++;
    if (latestMutabaahReport.dzuhur === 'Ya') latestPrayersCompleted++;
    if (latestMutabaahReport.ashar === 'Ya') latestPrayersCompleted++;
    if (latestMutabaahReport.maghrib === 'Ya') latestPrayersCompleted++;
    if (latestMutabaahReport.isya === 'Ya') latestPrayersCompleted++;
    if (latestMutabaahReport.dhuha === 'Ya') latestPrayersCompleted++;
  }

  // Home Checklist states
  const [date, setDate] = useState(todayStr);
  const isDateSubmitted = myMutabaah.some(m => m.tanggal === date);
  const [prayers, setPrayers] = useState({
    subuh: false, dzuhur: false, ashar: false, maghrib: false, isya: false, dhuha: false
  });
  const [tilawahVal, setTilawahVal] = useState('');
  const [note, setNote] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handlePrayerToggle = (pName: keyof typeof prayers) => {
    setPrayers(prev => ({ ...prev, [pName]: !prev[pName] }));
  };

  const handleMutabaahSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMutabaah({
      tanggal: date,
      subuh: prayers.subuh ? 'Ya' : 'Tidak',
      dzuhur: prayers.dzuhur ? 'Ya' : 'Tidak',
      ashar: prayers.ashar ? 'Ya' : 'Tidak',
      maghrib: prayers.maghrib ? 'Ya' : 'Tidak',
      isya: prayers.isya ? 'Ya' : 'Tidak',
      dhuha: prayers.dhuha ? 'Ya' : 'Tidak',
      tilawah: tilawahVal.trim() || '-',
      catatan: note
    });

    setSubmitSuccess(true);
    setNote('');
    setTilawahVal('');
    // reset checkboxes
    setPrayers({ subuh: false, dzuhur: false, ashar: false, maghrib: false, isya: false, dhuha: false });
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  const renderUnifiedHeader = () => {
    return (
      <div className="sticky top-0 z-40 bg-transparent">
        {/* Header - seragam admin: bg-teal-600 dengan border radius bottom */}
        <div className="bg-teal-600 text-white pt-[calc(12px+env(safe-area-inset-top,0px))] pb-7 px-5 relative overflow-hidden shadow-[0_4px_20px_rgba(13,75,69,0.12)]" style={{ borderBottomLeftRadius: '50% 10px', borderBottomRightRadius: '50% 10px' }}>
          {/* Radial light glow effect */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

          {/* Subtle abstract dome/mosque silhouette in the background */}
          <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none select-none">
            <svg className="w-32 h-32 text-amber-200" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50,10 C40,25 35,35 35,45 C35,60 42,75 50,90 C58,75 65,60 65,45 C65,35 60,25 50,10 Z" />
              <rect x="47" y="30" width="6" height="40" rx="3" />
              <rect x="40" y="47" width="20" height="6" rx="3" />
            </svg>
          </div>

          {/* Profile info & action buttons in single row */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              {/* Profile Logo as Avatar Circle */}
              <div className="relative w-11 h-11 rounded-full border-2 border-yellow-400 p-0.5 bg-[#042f2e] flex items-center justify-center shadow-md overflow-hidden shrink-0">
                {pengaturan?.logo ? (
                  <img
                    src={getCleanImageUrl(pengaturan.logo)}
                    alt={pengaturan.nama_lembaga || "Logo"}
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const fallbackIcon = document.getElementById('header-fallback-icon-parent');
                      if (fallbackIcon) fallbackIcon.style.display = 'flex';
                    }}
                  />
                ) : null}
                <img
                  id="header-fallback-icon-parent"
                  style={{ display: pengaturan?.logo ? 'none' : 'block' }}
                  src="https://iili.io/CCbS5Ss.md.png"
                  alt="SIM TPQ DIGITAL"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              <div className="text-left min-w-0">
                <p className="text-amber-300 text-[8px] font-black uppercase tracking-widest leading-none mb-1">PORTAL WALI SANTRI</p>
                <h2 className="text-xs font-semibold text-teal-100 leading-none">Assalamu'alaikum,</h2>
                <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5 mt-0.5 truncate max-w-[150px] sm:max-w-none">
                  Ananda {student?.nama_santri || user.nama_lengkap}
                  <span className="w-3.5 h-3.5 bg-teal-500 rounded-full flex items-center justify-center text-white p-0.5 shadow-xs shrink-0" title="Verified Account">
                    <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                  </span>
                </h3>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              {onSyncData && (
                <button
                  onClick={onSyncData}
                  disabled={isSyncing}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all btn-active ${isSyncing
                      ? 'bg-teal-600/40 border-teal-500/40 text-teal-300 animate-spin cursor-not-allowed'
                      : 'bg-white/10 border-white/20 text-teal-100 hover:bg-white/20 hover:text-white cursor-pointer'
                    }`}
                  title="Sinkronisasi Data"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                </button>
              )}

              <button
                onClick={onLogout}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-rose-500 hover:text-white border border-white/20 flex items-center justify-center text-rose-200 transition-all btn-active cursor-pointer"
                title="Keluar"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Date Capsule */}
          <div className="flex gap-2 mt-4 pb-6 relative z-10">
            <div className="bg-white/15 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-bold text-white border border-white/10 shadow-3xs">
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* OVERLAY QUICK INFO BAR - Overlapping the curve */}
        <div className="relative -mt-6 pb-3 bg-transparent">
          <div className="mx-4 bg-white rounded-2xl p-4 shadow-[0_8px_20px_rgba(0,0,0,0.04)] border border-slate-200/60 flex items-center justify-between">
            {/* Col 1: Hafalan */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0 text-left p-1.5 rounded-2xl">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-50 to-green-50 text-teal-600 flex items-center justify-center shrink-0">
                <Award className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-black text-slate-800 leading-none truncate">
                  {student?.jumlah_hafalan || '-'}
                </p>
                <p className="text-[8.5px] font-extrabold text-slate-400 uppercase tracking-tight mt-1 truncate">Hafalan</p>
              </div>
            </div>

            {/* Divider */}
            <div className="w-[1px] h-8 bg-slate-100 mx-1 shrink-0" />

            {/* Col 2: Catatan Juz */}
            <div
              className="flex items-center gap-2.5 flex-1 min-w-0 text-left p-1.5 rounded-2xl btn-active cursor-pointer transition-all hover:bg-amber-50/50"
              onClick={() => setShowJuzModal(true)}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-50 to-orange-50 text-amber-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                {(() => {
                  const raw = (student?.juz_hafal || '-').trim();
                  if (raw === '-' || raw === '') {
                    return (
                      <>
                        <p className="text-[13px] font-black text-slate-800 leading-none">-</p>
                        <p className="text-[8.5px] font-extrabold text-slate-400 uppercase tracking-tight mt-1">Catatan Juz</p>
                      </>
                    );
                  }
                  // Parse juz numbers
                  const numbers: number[] = [];
                  raw.split(/[,;\s]+/).forEach(part => {
                    const clean = part.replace(/[^0-9\-]/g, '');
                    if (!clean) return;
                    if (clean.includes('-')) {
                      const [a, b] = clean.split('-').map(Number);
                      if (!isNaN(a) && !isNaN(b)) {
                        for (let i = Math.min(a, b); i <= Math.max(a, b); i++) numbers.push(i);
                      }
                    } else {
                      const n = Number(clean);
                      if (!isNaN(n) && n >= 1 && n <= 30) numbers.push(n);
                    }
                  });
                  const unique = [...new Set(numbers)].sort((a, b) => a - b);
                  let displayText = raw;
                  if (unique.length > 0) {
                    // Build compact range summary
                    const ranges: string[] = [];
                    let start = unique[0], end = unique[0];
                    for (let i = 1; i <= unique.length; i++) {
                      if (unique[i] === end + 1) {
                        end = unique[i];
                      } else {
                        ranges.push(start === end ? `${start}` : `${start}–${end}`);
                        start = unique[i];
                        end = unique[i];
                      }
                    }
                    displayText = `Juz ${ranges.join(', ')}`;
                  }
                  return (
                    <>
                      <p className="text-[13px] font-black text-slate-800 leading-none truncate">{displayText}</p>
                      <p className="text-[8.5px] font-extrabold text-slate-400 uppercase tracking-tight mt-1">Catatan Juz ›</p>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Divider */}
            <div className="w-[1px] h-8 bg-slate-100 mx-1 shrink-0" />

            {/* Col 3: Murojaah */}
            <div
              className="flex items-center gap-2.5 flex-1 min-w-0 text-left p-1.5 rounded-2xl btn-active cursor-pointer transition-all hover:bg-indigo-50/50"
              onClick={() => setShowMurojaahModal(true)}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Users className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-black text-slate-800 leading-none truncate">
                    {student?.murojaah || '-'}
                  </p>
                  <p className="text-[8.5px] font-extrabold text-slate-400 uppercase tracking-tight mt-1">Murojaah ›</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-100 relative overflow-hidden">
      {/* Unified Header for Beranda, Riwayat, Mutabaah, Pembayaran, Agenda, and Informasi (Fixed at top, outside the scrollable area) */}
      {(activeTab === 'beranda' || activeTab === 'riwayat' || activeTab === 'mutabaah' || activeTab === 'pembayaran' || activeTab === 'agenda' || activeTab === 'informasi') && (
        <div className="shrink-0 w-full z-40 bg-slate-100">
          {renderUnifiedHeader()}
        </div>
      )}

      {/* Main Container */}
      <main className={`flex-grow min-h-0 h-full flex flex-col w-full relative scroll-smooth ${activeTab === 'beranda' || activeTab === 'riwayat' || activeTab === 'mutabaah' || activeTab === 'pembayaran' || activeTab === 'agenda' || activeTab === 'informasi'
        ? 'p-0 pb-[78px] overflow-y-auto bg-slate-100 text-left no-scrollbar'
        : (activeTab === 'quran' || activeTab === 'doa'
          ? 'p-0 h-full overflow-hidden bg-slate-100'
          : 'p-4 pb-24 overflow-y-auto pt-[98px] no-scrollbar')
        }`}>
        {activeTab === 'beranda' && (
          <div className="flex flex-col text-left">
            {/* Rest of Beranda Content Wrapper */}
            <div className="p-4 space-y-6">
              {/* 1. Header Greeting & Quote of the Day */}
              <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 text-left relative overflow-hidden">
                {/* Gradient accent strip */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 via-teal-500 to-teal-600" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white shadow-[0_4px_15px_rgba(20,184,166,0.25)] shrink-0">
                    <Sparkles className="w-5.5 h-5.5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase text-teal-600 tracking-widest">{getIslamicGreeting()}</h3>
                    <h2 className="text-sm font-extrabold text-slate-800 mt-0.5">Assalamu'alaikum, Walisantri</h2>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 relative">
                  <p className="text-[11px] text-slate-500 leading-relaxed italic font-medium">
                    "{currentQuote.text}"
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 bg-teal-50/70 border border-teal-100 rounded-lg px-2 py-0.5 w-max">
                    <div className="w-1 h-1 rounded-full bg-teal-500"></div>
                    <span className="text-[9px] font-bold text-teal-700 uppercase tracking-widest">{currentQuote.ref}</span>
                  </div>
                </div>
              </div>

              {/* 3. Interactive Bento Metric Cards - Premium */}
              <div className="grid grid-cols-2 gap-3 text-left">
                {/* Daily Prayer Tracker */}
                <button
                  onClick={() => setActiveTab('mutabaah')}
                  className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 hover:border-teal-400/50 text-left relative overflow-hidden transition-all duration-300 group btn-active cursor-pointer"
                >
                  {/* Gradient accent strip - always visible */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 via-teal-500 to-teal-600" />
                  <div className="absolute top-0 right-0 w-16 h-16 bg-teal-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-50 to-teal-50 text-teal-600 flex items-center justify-center shadow-3xs">
                      <Clock className="w-4 h-4" />
                    </div>
                    {hasSubmittedToday ? (
                      <span className="text-[8px] font-extrabold px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full border border-teal-100 uppercase tracking-wider">Lengkap</span>
                    ) : (
                      <span className="text-[8px] font-extrabold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-100 uppercase tracking-widest animate-pulse">Isi Laporan</span>
                    )}
                  </div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shalat & Adab</h4>
                  <p className="text-sm font-black text-slate-800 mt-1">
                    {latestMutabaahReport ? `${latestPrayersCompleted}/6 Shalat` : 'Belum Lapor'}
                  </p>
                  <span className="text-[9px] text-slate-400 block mt-1 font-medium group-hover:text-teal-600 transition-colors">
                    {hasSubmittedToday ? 'Laporan hari ini terkirim ✓' : 'Klik untuk rekap mandiri'}
                  </span>
                </button>

                {/* Finance & SPP Tracker */}
                <button
                  onClick={() => setActiveTab('pembayaran')}
                  className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 hover:border-teal-400/50 text-left relative overflow-hidden transition-all duration-300 group btn-active cursor-pointer"
                >
                  {/* Gradient accent strip - always visible */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />
                  <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 text-amber-600 flex items-center justify-center shadow-3xs">
                      <Coins className="w-4 h-4" />
                    </div>
                    {(() => {
                      const getLocalDateMonthString = (): string => {
                        const d = new Date();
                        const year = d.getFullYear();
                        const month = String(d.getMonth() + 1).padStart(2, '0');
                        return `${year}-${month}`;
                      };
                      const currentMonth = getLocalDateMonthString();
                      const currentMonthPayments = myPayments.filter(p => p.tanggal && p.tanggal.startsWith(currentMonth));

                      const hasUnpaidInCurrentMonth = currentMonthPayments.length === 0 || currentMonthPayments.some(p => p.status === 'Belum Bayar');
                      const hasUnpaidInPast = myPayments.some(p => p.status === 'Belum Bayar');
                      const hasUnpaidPayment = hasUnpaidInCurrentMonth || hasUnpaidInPast;

                      const hasCicilInCurrentMonth = currentMonthPayments.some(p => p.status === 'Cicil');
                      const hasCicilInPast = myPayments.some(p => p.status === 'Cicil');
                      const hasCicilPayment = !hasUnpaidPayment && (hasCicilInCurrentMonth || hasCicilInPast);

                      const currentFinanceStatus = hasUnpaidPayment ? 'Belum Bayar' : (hasCicilPayment ? 'Cicil' : 'Aman');

                      let financeStatusBadgeColor = "bg-teal-50 text-teal-700 border-teal-100";
                      if (currentFinanceStatus === 'Belum Bayar') {
                        financeStatusBadgeColor = "bg-rose-50 text-rose-700 border-rose-100";
                      } else if (currentFinanceStatus === 'Cicil') {
                        financeStatusBadgeColor = "bg-amber-50 text-amber-700 border-amber-100";
                      }

                      return (
                        <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${financeStatusBadgeColor}`}>
                          {currentFinanceStatus}
                        </span>
                      );
                    })()}
                  </div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Administrasi</h4>
                  <p className="text-sm font-black text-slate-800 mt-1 truncate">
                    {totalPaidAmount > 0 ? formatRupiah(totalPaidAmount) : 'Rp 0'}
                  </p>
                  <span className="text-[9px] text-slate-400 block mt-1 font-medium group-hover:text-amber-600 transition-colors">
                    Total dana tercatat
                  </span>
                </button>
              </div>

              {/* 5. Personal Special Messages (Wax Seal style layout) */}
              {activeAnnouncementsToShow.length > 0 && (
                <div className="text-left space-y-3">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-teal-500 fill-teal-500/20" /> Pesan Khusus Ustadz
                  </h3>
                  <div className="space-y-3">
                    {activeAnnouncementsToShow.map((inf) => (
                      <div key={inf.id} className="bg-white p-5 rounded-2xl border border-slate-200/60 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] shadow-[0_2px_12px_rgba(0,0,0,0.03)] relative overflow-hidden transition-all duration-300 group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-teal-500 to-teal-500 rounded-r"></div>
                        <button
                          onClick={() => setClosedAnnouncementIds(prev => [...prev, inf.id])}
                          className="absolute top-4 right-4 w-6 h-6 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                          title="Tutup pesan"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[9px] font-black tracking-widest text-teal-700 bg-teal-50 uppercase px-2.5 py-0.5 rounded-full border border-teal-100">
                            Khusus
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">{formatTanggal(inf.tanggal)}</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-semibold pr-4 mt-0.5">
                          "{inf.pesan}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PENGUMUMAN PENTING SECTION */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-4.5 h-4.5 text-teal-600" />
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Pengumuman Penting</h3>
                  </div>
                </div>

                  {(() => {
                                      const pengumumanList = (agendaList || []).filter(item => item.tipe === 'Pengumuman');
                                      return (
                                        <AutoScrollCarousel items={pengumumanList} />
                                      );
                                    })()}

              </div>

              {/* 6. Layanan & Lembaga (gabungan) */}
              <div className="text-center">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-3">Layanan & Lembaga</h3>

                {/* Row 1: Layanan Utama */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <button
                    onClick={() => setActiveTab('quran')}
                    className="bg-white p-4 rounded-2xl border border-slate-200/60 flex flex-col items-center justify-center gap-2 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 hover:border-teal-400/50 shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-center btn-active transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-50 to-teal-50 text-teal-600 rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <img src="/asset/icon/alquran.png" alt="Al-Qur'an" className="w-7 h-7 object-contain" />
                    </div>
                    <span className="text-[10px] font-black text-slate-700 tracking-wider">BACA QUR'AN</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('mutabaah')}
                    className="bg-white p-4 rounded-2xl border border-slate-200/60 flex flex-col items-center justify-center gap-2 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 hover:border-teal-400/50 shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-center btn-active transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-50 to-teal-50 text-teal-600 rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <img src="/asset/icon/doa-sunnah.png" alt="Doa Sunnah" className="w-7 h-7 object-contain" />
                    </div>
                    <span className="text-[10px] font-black text-slate-700 tracking-wider">DOA SUNNAH</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('agenda')}
                    className="bg-white p-4 rounded-2xl border border-slate-200/60 flex flex-col items-center justify-center gap-2 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 hover:border-teal-400/50 shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-center btn-active transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <img src="/asset/icon/agenda.png" alt="Agenda" className="w-7 h-7 object-contain" />
                    </div>
                    <span className="text-[10px] font-black text-slate-700 tracking-wider">AGENDA LEMBAGA</span>
                  </button>
                </div>

                {/* Row 2: Saluran Hubungan */}
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => setActiveTab('pembayaran')}
                    className="bg-white p-3 rounded-2xl border border-slate-200/40 flex flex-col items-center justify-center gap-1.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 hover:border-teal-300/50 shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-center btn-active cursor-pointer transition-all duration-300"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-50 to-teal-50 text-teal-600 rounded-xl flex items-center justify-center shadow-3xs">
                      <img src="/asset/icon/keuangan.png" alt="SPP" className="w-6 h-6 object-contain" />
                    </div>
                    <span className="text-[9px] font-extrabold text-slate-700 uppercase tracking-widest mt-0.5">SPP</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('agenda')}
                    className="bg-white p-3 rounded-2xl border border-slate-200/40 flex flex-col items-center justify-center gap-1.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 hover:border-teal-300/50 shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-center btn-active cursor-pointer transition-all duration-300"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-rose-50 to-pink-50 text-rose-600 rounded-xl flex items-center justify-center shadow-3xs">
                      <img src="/asset/icon/agenda.png" alt="Agenda" className="w-6 h-6 object-contain" />
                    </div>
                    <span className="text-[9px] font-extrabold text-slate-700 uppercase tracking-widest mt-0.5">Agenda</span>
                  </button>

                  <a
                    href={`https://wa.me/62${pengaturan.telepon?.replace(/^0+/, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white p-3 rounded-2xl border border-slate-200/40 flex flex-col items-center justify-center gap-1.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 hover:border-teal-300/50 shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-center btn-active block transition-all duration-300"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto shadow-3xs">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-extrabold text-slate-700 uppercase tracking-widest mt-0.5 block">Admin</span>
                  </a>

                  <a
                    href={(() => {
                      const waGroups = pengaturan.link_wa || [];
                      const halaqah = student?.halaqah?.toLowerCase().trim() || '';
                      const byProgram = waGroups.find(wa => wa.program?.toLowerCase().trim() === halaqah)?.link;
                      const umumGroup = waGroups.find(wa => wa.program?.toLowerCase().trim() === 'umum')?.link;
                      const firstGroup = waGroups[0]?.link;
                      const waAdmin = pengaturan.telepon ? `https://wa.me/62${pengaturan.telepon.replace(/^0+/, '')}` : '';
                      return byProgram || umumGroup || firstGroup || waAdmin || '#';
                    })()}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white p-3 rounded-2xl border border-slate-200/40 flex flex-col items-center justify-center gap-1.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 hover:border-teal-300/50 shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-center btn-active block transition-all duration-300"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-50 to-green-50 text-teal-600 rounded-xl flex items-center justify-center mx-auto shadow-3xs">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-extrabold text-slate-700 uppercase tracking-widest mt-0.5 block truncate max-w-full">Grup</span>
                  </a>
                </div>
              </div>
              {/* Close Rest of Beranda Content Wrapper div */}
            </div>
          </div>
        )}

        {activeTab === 'riwayat' && (
          <div className="flex flex-col text-left animate-fadeIn">
            <div className="p-4 space-y-4">
              {!selectedRiwayatCard ? (
                <div className="space-y-4 font-sans">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">REKAPITULASI DATA</span>
                      <h3 className="text-sm font-extrabold text-slate-800">Semua Aktivitas & Laporan Anak</h3>
                    </div>
                    <span className="text-[9px] font-extrabold px-2.5 py-0.5 bg-teal-50 text-teal-700 rounded-xl">Riwayat</span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Card 1: Setoran */}
                    <div
                      onClick={() => setSelectedRiwayatCard('setoran')}
                      className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-teal-500/20 transition-all cursor-pointer flex flex-col justify-between group active:scale-98"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-50 to-teal-50 text-teal-600 flex items-center justify-center shadow-3xs">
                          <FileText className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-extrabold px-2.5 py-1 bg-teal-50 text-teal-700 rounded-full border border-teal-100">
                          {mySetoran.length} Setoran
                        </span>
                      </div>
                      <h4 className="font-extrabold text-xs text-slate-800 group-hover:text-teal-600 transition-colors uppercase tracking-wider">LAPORAN SETORAN & TAHFIDZ</h4>
                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">
                        Pantau perkembangan hafalan Al-Qur'an, tilawah harian, serta hafalan hadits & doa harian ananda di madrasah.
                      </p>
                    </div>

                    {/* Card 2: Keuangan */}
                    <div
                      onClick={() => setSelectedRiwayatCard('keuangan')}
                      className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-teal-500/20 transition-all cursor-pointer flex flex-col justify-between group active:scale-98"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 text-amber-600 flex items-center justify-center shadow-3xs">
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-extrabold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-100">
                          {myPayments.length} Pembayaran
                        </span>
                      </div>
                      <h4 className="font-extrabold text-xs text-slate-800 group-hover:text-teal-600 transition-colors uppercase tracking-wider">ADMINISTRASI & KEUANGAN SPP</h4>
                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">
                        Pantau status tagihan, iuran SPP bulanan, serta mutasi laporan dana pendidikan ananda.
                      </p>
                    </div>

                    {/* Card 3: Tabungan */}
                    <div
                      onClick={() => setSelectedRiwayatCard('tabungan')}
                      className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-teal-500/20 transition-all cursor-pointer flex flex-col justify-between group active:scale-98"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-50 to-teal-50 text-teal-600 flex items-center justify-center shadow-3xs">
                          <Wallet className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-extrabold px-2.5 py-1 bg-teal-50 text-teal-700 rounded-full border border-teal-100">
                          Saldo: {formatRupiah(mySavings.reduce((sum, s) => sum + (s.nominal || 0), 0))}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-xs text-slate-800 group-hover:text-teal-600 transition-colors uppercase tracking-wider">SAKU TABUNGAN SANTRI</h4>
                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">
                        Pantau saldo saku tabungan wadiah santri, riwayat penyetoran, dan penggunaan dana harian anak.
                      </p>
                    </div>

                    {/* Card 4: Mutaba'ah */}
                    <div
                      onClick={() => setSelectedRiwayatCard('mutabaah')}
                      className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-teal-500/20 transition-all cursor-pointer flex flex-col justify-between group active:scale-98"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-600 flex items-center justify-center shadow-3xs">
                          <Activity className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-extrabold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                          {myMutabaah.length} Laporan
                        </span>
                      </div>
                      <h4 className="font-extrabold text-xs text-slate-800 group-hover:text-teal-600 transition-colors uppercase tracking-wider">LOG MUTABA'AH HARIAN RUMAH</h4>
                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">
                        Pantau rekapitulasi amalan ibadah, tilawah mandiri, dan evaluasi kondisi akhlak anak di rumah yang dikirim.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Back bar */}
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <button
                      onClick={() => setSelectedRiwayatCard(null)}
                      className="bg-white hover:bg-slate-50 p-2 rounded-xl border border-slate-200 text-slate-700 shadow-sm transition-all cursor-pointer flex items-center justify-center"
                      title="Kembali ke menu riwayat"
                    >
                      <ChevronLeft className="w-4 h-4 text-slate-650" />
                    </button>
                    <div>
                      <span className="text-[9px] font-extrabold text-teal-600 uppercase tracking-widest block">Kembali</span>
                      <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mt-0.5">
                        {selectedRiwayatCard === 'setoran' && 'Laporan Setoran Tahfidz & Tilawah'}
                        {selectedRiwayatCard === 'keuangan' && 'Laporan Keuangan & SPP'}
                        {selectedRiwayatCard === 'tabungan' && 'Laporan Saku Tabungan'}
                        {selectedRiwayatCard === 'mutabaah' && 'Laporan Mutaba\'ah Ibadah'}
                      </h3>
                    </div>
                  </div>

                  {/* Sub-view rendering */}
                  {selectedRiwayatCard === 'setoran' && (() => {
                    // Merge same-day setoran logs on the fly for display
                    const groupedSetoranMap: { [tanggal: string]: Setoran } = {};
                    mySetoran.forEach(s => {
                      const fallbackSurah = s.kualitas_surah || (s.kualitas && !s.kualitas.includes('|') && !s.kualitas.includes(':') ? s.kualitas : undefined);
                      const fallbackTilawah = s.kualitas_tilawah || (s.kualitas && !s.kualitas.includes('|') && !s.kualitas.includes(':') ? s.kualitas : undefined);
                      const fallbackHadits = s.kualitas_hadits || (s.kualitas && !s.kualitas.includes('|') && !s.kualitas.includes(':') ? s.kualitas : undefined);

                      if (!groupedSetoranMap[s.tanggal]) {
                        groupedSetoranMap[s.tanggal] = {
                          ...s,
                          kualitas_surah: s.surah !== '-' && s.surah !== '' ? fallbackSurah : undefined,
                          kualitas_tilawah: s.tilawah !== '-' && s.tilawah !== '' ? fallbackTilawah : undefined,
                          kualitas_hadits: s.hadits !== '-' && s.hadits !== '' ? fallbackHadits : undefined
                        };
                      } else {
                        const curr = groupedSetoranMap[s.tanggal];
                        if (s.surah !== '-' && s.surah !== '') {
                          curr.surah = s.surah;
                          curr.ayat = s.ayat;
                          curr.kualitas_surah = fallbackSurah;
                        }
                        if (s.tilawah !== '-' && s.tilawah !== '') {
                          curr.tilawah = s.tilawah;
                          curr.kualitas_tilawah = fallbackTilawah;
                        }
                        if (s.hadits !== '-' && s.hadits !== '') {
                          curr.hadits = s.hadits;
                          curr.kualitas_hadits = fallbackHadits;
                        }
                        if (s.catatan && s.catatan !== '-' && s.catatan !== '') {
                          if (curr.catatan && curr.catatan !== '-' && curr.catatan !== '') {
                            if (!curr.catatan.includes(s.catatan)) {
                              curr.catatan = `${curr.catatan}; ${s.catatan}`;
                            }
                          } else {
                            curr.catatan = s.catatan;
                          }
                        }
                      }
                    });
                    const displaySetoranList = Object.values(groupedSetoranMap).sort((a, b) => b.tanggal.localeCompare(a.tanggal));

                    return (
                      <div className="space-y-3">
                        {displaySetoranList.length === 0 ? (
                          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                              <FileText className="w-7 h-7 text-slate-300" />
                            </div>
                            <p className="text-xs font-semibold text-slate-400">Belum ada catatan setoran tercatat.</p>
                          </div>
                        ) : (
                          displaySetoranList.map((s, idx) => {
                            const hasSurah = s.surah !== '-' && s.surah !== '';
                            const hasTilawah = s.tilawah !== '-' && s.tilawah !== '';
                            const hasHadits = s.hadits !== '-' && s.hadits !== '';
                            const hasCatatan = s.catatan && s.catatan !== '-' && s.catatan !== '';
                            const totalProgress = [hasSurah, hasTilawah, hasHadits].filter(Boolean).length;
                            return (
                              <div
                                key={s.id_setoran || idx}
                                className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                              >
                                {/* Accent strip */}
                                <div className="h-1 bg-gradient-to-r from-teal-500 via-teal-500 to-teal-600" />
                                {/* Header */}
                                <div className="flex items-center justify-between px-4 pt-3.5 pb-2 border-b border-slate-50">
                                  <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                                      {idx + 1}
                                    </span>
                                    <span className="text-[11px] font-bold text-slate-800">{formatTanggal(s.tanggal)}</span>
                                  </div>
                                  <span className="text-[8px] font-bold text-slate-400 px-2 py-1 rounded-full bg-slate-50 border border-slate-100">
                                    {totalProgress}/3 Item
                                  </span>
                                </div>

                                {/* Body */}
                                <div className="p-4 space-y-3">
                                  {/* Hafalan Qur'an */}
                                  {hasSurah ? (
                                    <div>
                                      <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Hafalan Qur'an (Tahfidz)</span>
                                      <div className="flex items-start gap-1.5">
                                        <BookOpen className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                                        <div className="flex flex-col gap-1">
                                          <span className="text-[11px] font-bold text-slate-800">{s.surah}</span>
                                          <span className="text-[9px] text-slate-500">Ayat {s.ayat}</span>
                                          <span className="self-start px-2 py-0.5 rounded-lg text-[7.5px] font-black bg-teal-50 text-teal-700 border border-teal-100 uppercase tracking-wider">
                                            {s.kualitas_surah || (s.kualitas && !s.kualitas.includes('|') && !s.kualitas.includes(':') ? s.kualitas : '') || 'Mumtaz'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  ) : null}

                                  {/* Batas Tilawah */}
                                  {hasTilawah ? (
                                    <div>
                                      <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Batas Tilawah</span>
                                      <div className="flex items-start gap-1.5">
                                        <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                                        <div className="flex flex-col gap-1">
                                          <span className="text-[11px] font-bold text-slate-800">{s.tilawah}</span>
                                          <span className="text-[9px] text-slate-500">Halaman {s.halaman || '-'}</span>
                                          <span className="self-start px-2 py-0.5 rounded-lg text-[7.5px] font-black bg-teal-50 text-teal-700 border border-teal-100 uppercase tracking-wider">
                                            {s.kualitas_tilawah || (s.kualitas && !s.kualitas.includes('|') && !s.kualitas.includes(':') ? s.kualitas : '') || 'Mumtaz'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  ) : null}

                                  {/* Hadits & Doa */}
                                  {hasHadits ? (
                                    <div>
                                      <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Hadits & Doa</span>
                                      <div className="flex items-start gap-1.5">
                                        <Heart className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                                        <div className="flex flex-col gap-1">
                                          <span className="text-[11px] font-bold text-slate-800">{s.hadits}</span>
                                          <span className="self-start px-2 py-0.5 rounded-lg text-[7.5px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                                            {s.kualitas_hadits || (s.kualitas && !s.kualitas.includes('|') && !s.kualitas.includes(':') ? s.kualitas : '') || 'Mumtaz'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  ) : null}

                                  {/* Catatan */}
                                  {hasCatatan ? (
                                    <div>
                                      <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Catatan Ustadz</span>
                                      <div className="flex items-start gap-1.5">
                                        <MessageSquare className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                        <span className="text-[10.5px] text-slate-600 italic leading-relaxed">{s.catatan}</span>
                                      </div>
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    );
                  })()}

                  {selectedRiwayatCard === 'keuangan' && (
                    <div className="space-y-3">
                      {myPayments.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 text-center">
                          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <Wallet className="w-7 h-7 text-slate-300" />
                          </div>
                          <p className="text-xs font-semibold text-slate-400">Belum ada berkas pembayaran terbit.</p>
                        </div>
                      ) : (
                        myPayments.map((p, idx) => (
                          <div
                            key={idx}
                            className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                          >
                            {/* Accent strip */}
                            <div className="h-1 bg-gradient-to-r from-teal-500 via-teal-500 to-teal-600" />
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 pt-3.5 pb-2 border-b border-slate-50">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                                  {idx + 1}
                                </span>
                                <span className="text-[11px] font-bold text-slate-800">{formatTanggal(p.tanggal)}</span>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-[8px] font-extrabold uppercase tracking-wider ${
                                p.status === 'Lunas'
                                  ? 'bg-teal-50 text-teal-700 border border-teal-100'
                                  : p.status === 'Cicil'
                                  ? 'bg-teal-50 text-teal-700 border border-teal-100'
                                  : 'bg-amber-50 text-amber-700 border border-amber-100'
                              }`}>
                                {p.status === 'Lunas' ? <><Check className="w-2.5 h-2.5 inline mr-0.5 -mt-0.5" />{p.status}</> : p.status}
                              </span>
                            </div>

                            {/* Body */}
                            <div className="p-4 space-y-2.5">
                              {/* Kategori */}
                              <div className="flex items-start gap-1.5">
                                <Calculator className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 block">Kategori Tagihan</span>
                                  <span className="text-[11px] font-bold text-slate-800">{p.kategori}</span>
                                </div>
                              </div>

                              {/* Nominal */}
                              <div className="flex items-start gap-1.5">
                                <DollarSign className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 block">Total Nominal</span>
                                  <span className="text-[13px] font-black text-teal-700">{formatRupiah(p.nominal)}</span>
                                </div>
                              </div>

                              {/* Catatan */}
                              {p.catatan && p.catatan !== '-' && p.catatan !== '' ? (
                                <div className="flex items-start gap-1.5">
                                  <MessageSquare className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 block">Catatan</span>
                                    <span className="text-[10.5px] text-slate-600 italic leading-relaxed">{p.catatan}</span>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {selectedRiwayatCard === 'tabungan' && (
                    <div className="space-y-3">
                      {/* Total Saldo Card */}
                      <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-3xl p-5 text-white shadow-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-teal-200">Saldo Kumulatif Saku</span>
                            <p className="text-xl font-black mt-1 tracking-tight">{formatRupiah(mySavings.reduce((sum, s) => sum + (s.nominal || 0), 0))}</p>
                          </div>
                          <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <Wallet className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Mutasi List */}
                      {mySavings.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 text-center">
                          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <TrendingUp className="w-7 h-7 text-slate-300" />
                          </div>
                          <p className="text-xs font-semibold text-slate-400">Belum ada riwayat mutasi tabungan wadiah.</p>
                        </div>
                      ) : (
                        mySavings.map((s, idx) => (
                          <div
                            key={idx}
                            className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                          >
                            {/* Accent strip */}
                            <div className="h-1 bg-gradient-to-r from-teal-500 via-teal-500 to-teal-600" />
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 pt-3.5 pb-2 border-b border-slate-50">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                                  {idx + 1}
                                </span>
                                <span className="text-[11px] font-bold text-slate-800">{formatTanggal(s.tanggal)}</span>
                              </div>
                              <span className="text-[9px] font-extrabold text-teal-600">
                                +{formatRupiah(s.nominal)}
                              </span>
                            </div>

                            {/* Body */}
                            <div className="p-4">
                              <div className="flex items-start gap-1.5">
                                <Coins className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 block">Keterangan</span>
                                  <span className="text-[11px] font-bold text-slate-800">Penyetoran Kas Saku</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {selectedRiwayatCard === 'mutabaah' && (
                    <div className="space-y-3">
                      {myMutabaah.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 text-center">
                          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <Activity className="w-7 h-7 text-slate-300" />
                          </div>
                          <p className="text-xs font-semibold text-slate-400">Belum ada amalan mutabaah harian terekam.</p>
                        </div>
                      ) : (
                        myMutabaah.map((m, idx) => {
                          const shalatList = [
                            { label: 'Sbh', checked: m.subuh === 'Ya', full: 'Subuh' },
                            { label: 'Dzh', checked: m.dzuhur === 'Ya', full: 'Dzuhur' },
                            { label: 'Asr', checked: m.ashar === 'Ya', full: 'Ashar' },
                            { label: 'Mgb', checked: m.maghrib === 'Ya', full: 'Maghrib' },
                            { label: 'Isy', checked: m.isya === 'Ya', full: 'Isya' },
                            { label: 'Dha', checked: m.dhuha === 'Ya', full: 'Dhuha' }
                          ];
                          const checkedCount = shalatList.filter(s => s.checked).length;
                          return (
                            <div
                              key={idx}
                              className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                            >
                              {/* Accent strip */}
                              <div className="h-1 bg-gradient-to-r from-teal-500 via-teal-500 to-teal-600" />
                              {/* Header: Nomor + Tanggal */}
                              <div className="flex items-center justify-between px-4 pt-3.5 pb-2 border-b border-slate-50">
                                <div className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                                    {idx + 1}
                                  </span>
                                  <span className="text-[11px] font-bold text-slate-800">{formatTanggal(m.tanggal)}</span>
                                </div>
                                <span className={`text-[9px] font-bold px-2 py-1 rounded-full ${
                                  checkedCount >= 5 ? 'bg-teal-50 text-teal-700' : checkedCount >= 3 ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-500'
                                }`}>
                                  {checkedCount}/6 Shalat
                                </span>
                              </div>

                              {/* Body */}
                              <div className="p-4 space-y-3">
                                {/* Shalat Checklist */}
                                <div>
                                  <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Checklist Shalat</span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {shalatList.map((sh, shIdx) => (
                                      <span
                                        key={shIdx}
                                        className={`inline-flex items-center gap-1 text-[9px] font-bold px-2.5 py-1.5 rounded-xl leading-none transition-all ${
                                          sh.checked
                                            ? 'bg-gradient-to-br from-teal-50 to-green-50 text-teal-700 border border-teal-200/50 shadow-xs'
                                            : 'bg-slate-50 text-slate-300 border border-slate-100/50'
                                        }`}
                                        title={sh.full}
                                      >
                                        {sh.checked ? (
                                          <Check className="w-2.5 h-2.5 text-teal-500" />
                                        ) : (
                                          <X className="w-2.5 h-2.5 text-slate-300" />
                                        )}
                                        {sh.label}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {/* Tilawah */}
                                <div>
                                  <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Materi Tilawah</span>
                                  <div className="flex items-center gap-1.5">
                                    <BookOpen className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                                    <span className="text-[11px] font-semibold text-slate-700">
                                      {m.tilawah && m.tilawah !== '-' ? m.tilawah : 'Belum Mulai'}
                                    </span>
                                  </div>
                                </div>

                                {/* Catatan */}
                                {m.catatan && m.catatan !== '-' && m.catatan !== '' && (
                                  <div>
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Catatan Wali</span>
                                    <div className="flex items-start gap-1.5">
                                      <MessageSquare className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                      <span className="text-[10.5px] text-slate-600 italic leading-relaxed">"{m.catatan}"</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'mutabaah' && (
          <div className="flex flex-col text-left animate-fadeIn">
            <div className="p-4 space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Mutabaah Laporan Rumah (Adab & Ibadah)</h3>
              <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
                {isDateSubmitted && (
                  <div className="mb-4 p-3.5 bg-teal-50 border border-teal-200 rounded-2xl flex items-center gap-2 text-teal-900 text-[11px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse shrink-0"></span>
                    <span>Laporan Mutaba'ah tanggal {date} sudah dikirim.</span>
                  </div>
                )}
                <form onSubmit={handleMutabaahSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Pilih Tanggal Mutabaah</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 mt-1"
                      required
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Checklist Amal Harian Rumah</span>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.keys(prayers).map((key) => {
                        const typedKey = key as keyof typeof prayers;
                        const active = prayers[typedKey];
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handlePrayerToggle(typedKey)}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${active ? 'bg-teal-50 border-teal-500/30 text-teal-700 font-bold' : 'bg-slate-50 border-slate-300/20 text-slate-600'}`}
                          >
                            <span className="text-[11px] capitalize">{key}</span>
                            <span className={`w-4 h-4 rounded flex items-center justify-center border ${active ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white border-slate-200'}`}>
                              {active && <Check className="w-3 h-3" />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Perkembangan Tilawah Al-Qur'an (Manual)</label>
                    <input
                      type="text"
                      value={tilawahVal}
                      onChange={(e) => setTilawahVal(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 mt-1"
                      placeholder="Contoh: Juz 1 Hal 23 atau Iqro 6 Hal 12"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Catatan Adab / Kondisi Anak</label>
                    <textarea
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs mt-1 outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Murojaah mandiri 10 menit dsb..."
                    />
                  </div>

                  {submitSuccess && (
                    <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl text-teal-700 font-medium text-xs text-center">
                      Laporan Berhasil Terkirim ke Ustadz! Jazakumullah Khairan.
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-teal-700 to-teal-600 text-white font-semibold py-3.5 rounded-2xl shadow-md btn-active leading-none tracking-wider text-[11px] uppercase"
                  >
                    Kirim Laporan Harian
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pembayaran' && (
          <div className="p-4 space-y-4 text-left animate-fadeIn">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('beranda')}
                className="bg-white hover:bg-slate-50 p-2 rounded-xl border border-slate-200 text-slate-700 shadow-sm transition-all focus:ring-2 focus:ring-slate-100 cursor-pointer flex items-center justify-center shrink-0"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status Keuangan & Administrasi</h3>
            </div>

            {myPayments.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                Belum ada data kwitansi pembayaran tercatat.
              </div>
            ) : (
              myPayments.map((p, idx) => {
                const isPaid = p.status === 'Lunas';
                return (
                  <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-teal-600"></div>
                    <div className="flex items-center justify-between mb-2 pl-1.5">
                      <span className="text-[10px] text-slate-400 font-bold">{formatTanggal(p.tanggal)}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${isPaid ? 'bg-teal-50 text-teal-700 border border-teal-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                        {p.status}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50 mt-1 pl-1.5">
                      <p className="text-xs text-slate-600 font-medium mb-1">{p.kategori}</p>
                      <p className="text-sm font-bold text-slate-800">{formatRupiah(p.nominal)}</p>
                      {p.catatan && (
                        <p className="text-[10px] text-slate-400 italic mt-1.5 border-t border-slate-200/10 pt-1.5">
                          "{p.catatan}"
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'agenda' && (
          <div className="text-left animate-fadeIn">
            {/* Header premium */}
            <div className="bg-white border-b border-slate-200/60 px-4 pt-3 pb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('beranda')}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-teal-600 transition-all cursor-pointer shrink-0 btn-active shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Agenda & Pengumuman Lembaga</h3>
                  <p className="text-[9px] text-slate-400 font-medium">Jadwal kegiatan belajar santri dan pengumuman resmi</p>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-1 mt-3 bg-slate-100 rounded-xl p-1">
                {[
                  { key: 'all', label: 'Semua' },
                  { key: 'agenda', label: 'Agenda' },
                  { key: 'pengumuman', label: 'Pengumuman' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setAgendaFilterTab(tab.key as 'all' | 'agenda' | 'pengumuman')}
                    className={`flex-1 py-2 text-[10px] font-extrabold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                      agendaFilterTab === tab.key
                        ? 'bg-white text-teal-700 shadow-sm border border-slate-200/60'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="px-4 pt-3 pb-4 space-y-3">
              {(() => {
                const filtered = agendaFilterTab === 'all'
                  ? agendaList
                  : agendaList.filter(a => a.tipe.toLowerCase() === agendaFilterTab);

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                      {agendaFilterTab === 'all' 
                        ? 'Belum ada agenda atau pengumuman terbaru saat ini.'
                        : `Belum ada ${agendaFilterTab} saat ini.`}
                    </div>
                  );
                }

                return filtered
                  .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
                  .map((item, idx) => (
                    <div key={item.id || idx} className="bg-white rounded-2xl border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 overflow-hidden relative">
                      {/* Top accent strip */}
                      <div className={`h-1 ${item.tipe === 'Agenda' ? 'bg-gradient-to-r from-rose-500 to-pink-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`} />

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${
                              item.tipe === 'Agenda'
                                ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                            }`}>
                              {item.tipe}
                            </span>
                            {item.tipe === 'Agenda' && item.status && (
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${
                                item.status === 'Berjalan' ? 'bg-teal-50 text-teal-700 border border-teal-100' :
                                item.status === 'Berikutnya' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {item.status}
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] text-slate-400 font-bold shrink-0">{formatTanggal(item.tanggal)}</span>
                        </div>

                        <div className="mt-2.5 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs font-black text-slate-800 leading-snug">{item.judul}</h4>
                            {item.tipe === 'Agenda' && item.waktu && item.waktu !== '-' && (
                              <span className="text-[9px] font-bold text-teal-600 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-lg shrink-0">{item.waktu}</span>
                            )}
                          </div>
                          {item.deskripsi && (
                            <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap">{item.deskripsi}</p>
                          )}
                          {item.gambar && (
                            <div className="mt-2 w-full max-h-36 overflow-hidden rounded-xl border border-slate-100">
                              <img src={getCleanImageUrl(item.gambar)} alt={item.judul} className="w-full h-36 object-cover" referrerPolicy="no-referrer" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ));
              })()}
            </div>
          </div>
        )}

        {activeTab === 'informasi' && (
          <div className="p-4 space-y-4 text-left animate-fadeIn">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('beranda')}
                className="bg-white hover:bg-slate-50 p-2 rounded-xl border border-slate-200 text-slate-700 shadow-sm transition-all focus:ring-2 focus:ring-slate-100 cursor-pointer flex items-center justify-center shrink-0"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Papan Informasi & Pengumuman</h3>
            </div>
            <div className="space-y-3">
              {myAnnouncements.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-xs">
                  Belum ada pengumuman khusus atau informasi baru saat ini.
                </div>
              ) : (
                myAnnouncements.map((inf) => {
                  const isPrivate = inf.tipe === 'Manual';
                  return (
                    <div key={inf.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                      <div className={`absolute top-0 left-0 w-1.5 h-full ${isPrivate ? 'bg-teal-600' : 'bg-teal-700'}`}></div>
                      <div className="flex justify-between items-center mb-2 pl-2">
                        <span className="text-[10px] text-slate-400 font-bold">{formatTanggal(inf.tanggal)}</span>
                        <span className={`px-2.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${isPrivate ? 'bg-teal-50 text-teal-700' : 'bg-teal-50 text-teal-700'}`}>
                          {isPrivate ? 'Khusus' : 'Umum / Tagihan'}
                        </span>
                      </div>
                      <div className="pl-2 mt-2">
                        <p className="text-xs text-slate-700 leading-relaxed font-semibold whitespace-pre-wrap">{inf.pesan}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'quran' && (
          <QuranViewer onBack={() => setActiveTab('beranda')} />
        )}

        {activeTab === 'doa' && (
          <DoaList onBack={() => setActiveTab('beranda')} />
        )}
      </main>

      {/* Footer Nav Bar - Teal Curved Notch */}
      <nav className="fixed bottom-0 left-0 right-0 sm:max-w-md mx-auto h-[62px] flex justify-between items-center px-4 pb-1.5 pt-1 z-50 bg-transparent border-none">

        {/* SVG curved notch background - seragam admin */}
        <div className="absolute inset-0 -z-10 w-full h-[62px] overflow-visible">
          <svg className="w-full h-full filter drop-shadow-[0_-5px_15px_rgba(13,148,136,0.25)]" viewBox="0 0 400 62" preserveAspectRatio="none">
            <defs>
              <linearGradient id="navGradientParent" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0d9488" />
                <stop offset="50%" stopColor="#0f766e" />
                <stop offset="100%" stopColor="#115e59" />
              </linearGradient>
            </defs>
            {/* Teal gradient background path - same curve as admin */}
            <path d="M 0 16 Q 0 0, 16 0 L 155 0 C 172 0, 178 22, 200 22 C 222 22, 228 0, 245 0 L 384 0 Q 400 0, 400 16 L 400 62 L 0 62 Z" fill="url(#navGradientParent)" />
            {/* Thin outline following the top curved path */}
            <path d="M 0 16 Q 0 0, 16 0 L 155 0 C 172 0, 178 22, 200 22 C 222 22, 228 0, 245 0 L 384 0 Q 400 0, 400 16" fill="none" stroke="#0f766e" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Left tabs: Beranda */}
        <div className="flex justify-around w-2/5">
          <button
            onClick={() => setActiveTab('beranda')}
            className="relative flex flex-col items-center justify-center w-12 h-11 btn-active"
          >
            {activeTab === 'beranda' && (
              <>
                <div className="absolute -top-0.5 w-5 h-5 bg-teal-300/30 rounded-full blur-sm"></div>
                <div className="absolute top-0 w-1.5 h-1.5 bg-teal-300 rounded-full"></div>
              </>
            )}
            <div className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${activeTab === 'beranda' ? 'text-white' : 'text-white'}`}>
              <Home className="w-[16px] h-[16px]" />
            </div>
            <span className={`text-[8px] font-extrabold uppercase tracking-wider ${activeTab === 'beranda' ? 'text-white font-bold' : 'text-white'}`}>Beranda</span>
          </button>
        </div>

        {/* Center: Floating Doa/Shalat - seragam admin */}
        <div className="relative w-1/5 flex justify-center h-full">
          <button
            onClick={() => setActiveTab('mutabaah')}
            className={`absolute -top-[12px] w-[45px] h-[45px] rounded-full flex items-center justify-center text-white font-black btn-active z-50 transition-all duration-300 hover:scale-105 active:scale-95 border-[3.5px] shadow-md ${
              activeTab === 'mutabaah'
                ? 'bg-teal-600 border-amber-400 shadow-teal-600/35'
                : 'bg-teal-600 border-amber-400/70 shadow-teal-600/25'
            }`}
            title="Mutabaah & Laporan"
          >
            <BookOpen className="w-[18px] h-[18px] stroke-[2.5]" />
          </button>
        </div>

        {/* Right tabs: Profil */}
        <div className="flex justify-around w-2/5">
          <button
            onClick={() => setActiveTab('riwayat')}
            className="relative flex flex-col items-center justify-center w-12 h-11 btn-active"
          >
            {activeTab === 'riwayat' && (
              <>
                <div className="absolute -top-0.5 w-5 h-5 bg-teal-300/30 rounded-full blur-sm"></div>
                <div className="absolute top-0 w-1.5 h-1.5 bg-teal-300 rounded-full"></div>
              </>
            )}
            <div className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${activeTab === 'riwayat' ? 'text-white' : 'text-white'}`}>
              <History className="w-[16px] h-[16px]" />
            </div>
            <span className={`text-[8px] font-extrabold uppercase tracking-wider ${activeTab === 'riwayat' ? 'text-white font-bold' : 'text-white'}`}>History</span>
          </button>
        </div>
      </nav>

      {/* POPUP NOTIFIKASI KHUSUS WALI SANTRI */}
      {activeAnnouncementsToShow.length > 0 && (
        <div className="fixed inset-0 bg-slate-900/75 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col justify-between border border-teal-500/10">
            <div className="flex justify-between items-center pb-2 border-b border-indigo-50 text-indigo-800">
              <div className="flex items-center gap-1.5 text-indigo-700">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0"></span>
                <h3 className="font-extrabold text-xs uppercase tracking-wider">Notifikasi Khusus Wali Santri</h3>
              </div>
              <button
                onClick={() => {
                  setClosedAnnouncementIds(prev => [...prev, ...activeAnnouncementsToShow.map(inf => inf.id)]);
                }}
                className="text-slate-400 hover:text-slate-600 transition-all cursor-pointer p-1 rounded-full hover:bg-slate-105"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto space-y-3 flex-grow pr-1">
              {activeAnnouncementsToShow.map((inf) => (
                <div key={inf.id} className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 relative text-left">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[9px] font-bold text-indigo-400 font-semibold">{formatTanggal(inf.tanggal)}</span>
                    <button
                      onClick={() => setClosedAnnouncementIds(prev => [...prev, inf.id])}
                      className="text-indigo-400 hover:text-indigo-700 p-0.5 rounded-lg border border-indigo-100 hover:bg-white transition-all cursor-pointer"
                      title="Sembunyikan pesan ini"
                    >
                      <Check className="w-4.5 h-4.5 p-0.5" />
                    </button>
                  </div>
                  <p className="text-xs text-indigo-900 leading-relaxed font-bold">"{inf.pesan}"</p>
                  <p className="text-[9px] text-indigo-500 mt-2 font-medium">Klik icon checklist (✓) di atas untuk menyembunyikan pesan ini.</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                setClosedAnnouncementIds(prev => [...prev, ...activeAnnouncementsToShow.map(inf => inf.id)]);
              }}
              className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold py-3.5 rounded-2xl text-[10px] uppercase tracking-widest cursor-pointer transition-all mt-2 shadow-lg"
            >
              Tutup Semua Notifikasi
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL JUZ ── */}
      {showJuzModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setShowJuzModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Catatan Juz Hafalan</h3>
              </div>
              <button
                onClick={() => setShowJuzModal(false)}
                className="w-7 h-7 rounded-xl bg-slate-50 flex items-center justify-center btn-active"
              >
                <X className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>

            {/* Body: grid 30 juz */}
            <div className="p-5">
              {(() => {
                const raw = (student?.juz_hafal || '').trim();
                const numbers: number[] = [];
                raw.split(/[,;\s]+/).forEach(part => {
                  const clean = part.replace(/[^0-9\-]/g, '');
                  if (!clean) return;
                  if (clean.includes('-')) {
                    const [a, b] = clean.split('-').map(Number);
                    if (!isNaN(a) && !isNaN(b)) {
                      for (let i = Math.min(a, b); i <= Math.max(a, b); i++) numbers.push(i);
                    }
                  } else {
                    const n = Number(clean);
                    if (!isNaN(n) && n >= 1 && n <= 30) numbers.push(n);
                  }
                });
                const hafiz = new Set(numbers);
                return (
                  <>
                    <div className="grid grid-cols-5 gap-2">
                      {Array.from({ length: 30 }, (_, i) => i + 1).map(juz => {
                        const done = hafiz.has(juz);
                        return (
                          <div
                            key={juz}
                            className={`rounded-xl p-2.5 text-center transition-all ${
                              done
                                ? 'bg-gradient-to-br from-teal-50 to-green-50 text-teal-700 border border-teal-200/50 shadow-xs'
                                : 'bg-slate-50 text-slate-300 border border-slate-100'
                            }`}
                          >
                            <p className="text-[10px] font-bold leading-tight">{juz}</p>
                            <p className="text-[6px] font-bold uppercase tracking-wider mt-0.5">
                              {done ? '✓ Hafal' : '—'}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500">
                        <span className="w-3 h-3 rounded bg-teal-50 border border-teal-200" />
                        Hafal
                        <span className="w-3 h-3 rounded bg-slate-50 border border-slate-100 ml-1" />
                        Belum
                      </div>
                      <span className="text-[9px] font-extrabold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
                        {hafiz.size}/30 Juz
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL MUROJAAH ── */}
      {showMurojaahModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setShowMurojaahModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Catatan Murojaah</h3>
              </div>
              <button
                onClick={() => setShowMurojaahModal(false)}
                className="w-7 h-7 rounded-xl bg-slate-50 flex items-center justify-center btn-active"
              >
                <X className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              {(() => {
                const raw = (student?.murojaah || '').trim();
                if (!raw || raw === '-') {
                  return (
                    <div className="text-center py-8">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6 text-slate-300" />
                      </div>
                      <p className="text-xs font-semibold text-slate-400">Belum ada catatan murojaah.</p>
                    </div>
                  );
                }
                // Split entries — support koma, titik koma, newline, "dan"
                let entries = raw.split(/[,;]+|\n+|(?:\s+dan\s+)/i).map(e => e.trim()).filter(Boolean);
                // Further split entries that have multiple "Juz" mentions (e.g. "Lancar Juz 30 Juz 29")
                const expandedEntries: string[] = [];
                entries.forEach(e => {
                  const juzCount = (e.match(/juz\s*\d+/gi) || []).length;
                  if (juzCount > 1) {
                    // Split at each "Juz" occurrence, keeping the "Juz" prefix
                    const parts = e.split(/(?=juz\s*\d+)/gi).map(p => p.trim()).filter(Boolean);
                    // First part might be text before any "Juz" — merge with next part
                    const merged: string[] = [];
                    let pending = '';
                    parts.forEach(p => {
                      if (/^juz\s*\d+/i.test(p)) {
                        if (pending) { merged.push(pending.trim()); pending = ''; }
                        merged.push(p);
                      } else {
                        pending = (pending + ' ' + p).trim();
                      }
                    });
                    if (pending) {
                      if (merged.length > 0) {
                        merged[merged.length - 1] = (merged[merged.length - 1] + ' ' + pending).trim();
                      } else {
                        merged.push(pending);
                      }
                    }
                    expandedEntries.push(...merged);
                  } else {
                    expandedEntries.push(e);
                  }
                });
                entries = expandedEntries;
                // Reverse: assume newest is written last → show first
                entries = entries.reverse();
                return <MurojaahList entries={entries} />;
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Murojaah List sub-component ── */
function MurojaahList({ entries: allEntries }: { entries: string[] }) {
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);

  const filtered = allEntries.filter(e => {
    if (!search) return true;
    const match = e.match(/(?:juz\s*)?(\d{1,2})/i);
    if (!match) return e.toLowerCase().includes(search.toLowerCase());
    return match[1] === search || e.toLowerCase().includes(search.toLowerCase());
  });

  const displayEntries = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const needsSearch = allEntries.length > 10;

  return (
    <div>
      {needsSearch && (
        <div className="relative mb-3">
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setVisibleCount(10); }}
            placeholder="Cari juz (contoh: 30)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xs font-semibold text-slate-400">
            {search ? `Tidak ada catatan juz ${search}.` : 'Belum ada catatan murojaah.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayEntries.map((entry, i) => {
            const isLancar = /lancar/i.test(entry);
            let juzLabel: string | number = '';
            const juzMatch = entry.match(/(?:juz\s*)?(\d{1,2})\s*(?:–|-|s\/d|sd|sampai)?\s*(\d{0,2})/i);
            if (juzMatch) {
              const a = parseInt(juzMatch[1]);
              if (!isNaN(a) && a >= 1 && a <= 30) {
                if (juzMatch[2]) {
                  const b = parseInt(juzMatch[2]);
                  if (!isNaN(b) && b >= 1 && b <= 30 && b !== a) {
                    juzLabel = `${a}-${b}`;
                  } else {
                    juzLabel = String(a);
                  }
                } else {
                  juzLabel = String(a);
                }
              }
            }
            return (
              <div
                key={i}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                  isLancar
                    ? 'bg-teal-50/70 border-teal-200/50'
                    : 'bg-slate-50 border-slate-100'
                }`}
              >
                {juzLabel && (
                  <span className={`rounded-xl flex items-center justify-center shrink-0 text-[9px] font-black px-2 py-1 leading-none ${
                    isLancar ? 'bg-teal-100 text-teal-700' : 'bg-indigo-100 text-indigo-600'
                  }`}>
                    Juz {juzLabel}
                  </span>
                )}
                <span className={`text-[11px] font-semibold flex-1 ${
                  isLancar ? 'text-teal-800' : 'text-slate-700'
                }`}>
                  {entry}
                </span>
                {isLancar && (
                  <span className="shrink-0 text-[8px] font-black tracking-widest text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full">
                    ✓ Lancar
                  </span>
                )}
                {!isLancar && (
                  <span className="shrink-0 text-[8px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    Perlu Ulang
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {hasMore && (
        <button
          onClick={() => setVisibleCount(prev => prev + 10)}
          className="w-full mt-3 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500 hover:bg-slate-100 transition-all btn-active cursor-pointer"
        >
          Tampilkan 10 Lagi ({filtered.length - visibleCount} tersisa)
        </button>
      )}
    </div>
  );
}

/* ── Auto-scroll Carousel for Pengumuman Penting ── */
function AutoScrollCarousel({ items }: { items: Agenda[] }) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  // Auto-slide setiap 4 detik (berlaku untuk 1, 2, atau lebih item)
  React.useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % items.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [items.length]);

  if (items.length === 0) {
    return (
      <div className="w-full bg-white border border-slate-100 rounded-3xl p-6 text-center text-slate-400 text-xs py-10 font-medium">
        Belum ada pengumuman penting saat ini.
      </div>
    );
  }

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Slide container */}
      <div className="relative w-full max-w-[260px] overflow-hidden rounded-3xl">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {items.map((item, index) => {
            const hasGambar = !!item.gambar;
            return (
              <div
                key={item.id || index}
                className="w-full shrink-0 rounded-3xl shadow-sm border border-white/10 relative overflow-hidden flex flex-col justify-between text-white text-left"
                style={{ height: hasGambar ? '185px' : '125px' }}
              >
                {hasGambar && (
                  <>
                    <img
                      src={getCleanImageUrl(item.gambar)}
                      alt={item.judul}
                      className="absolute inset-0 z-0 w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
                  </>
                )}

                {!hasGambar && (
                  <>
                    <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-800 to-slate-950" />
                    <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none select-none z-0">
                      {(() => {
                        const theme = getAnnouncementTheme(item.judul, item.deskripsi);
                        return theme.icon;
                      })()}
                    </div>
                  </>
                )}

                <div className="relative z-10 p-4 flex flex-col justify-between h-full">
                  <div>
                    {(() => {
                      const theme = getAnnouncementTheme(item.judul, item.deskripsi);
                      return (
                        <span className={`text-[8px] font-black tracking-widest uppercase ${theme.badgeText} ${theme.badgeBg} px-2.5 py-1 rounded-full w-max inline-block`}>
                          {theme.tag}
                        </span>
                      );
                    })()}
                    <h4 className="text-xs font-bold leading-snug mt-2.5 line-clamp-2 text-white drop-shadow-sm">{item.judul}</h4>
                    <p className="text-[8px] text-white/80 mt-1 line-clamp-1 drop-shadow-sm">{item.deskripsi}</p>
                  </div>
                  <span className="text-[8.5px] font-semibold text-white/70 drop-shadow-sm mt-2">{formatIndoDate(item.tanggal)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dots indicator */}
      {items.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {items.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === activeIndex ? 'w-4.5 bg-teal-600' : 'w-1.5 bg-slate-300'}`}
              onClick={() => setActiveIndex(idx)}
            ></span>
          ))}
        </div>
      )}
    </div>
  );
}