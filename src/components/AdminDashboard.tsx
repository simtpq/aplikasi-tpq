import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  Users,
  PlusCircle,
  History,
  Award,
  BookOpen,
  Phone,
  Settings,
  Calculator,
  Coins,
  Printer,
  Trash2,
  Edit,
  ArrowLeft,
  FileText,
  Code,
  Database,
  CheckCircle,
  Copy,
  Lock,
  User,
  GraduationCap,
  Calendar,
  DollarSign,
  Wallet,
  Info,
  Bell,
  Mail,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Upload,
  UserCheck,
  Building,
  Activity,
  LogOut,
  MapPin,
  Globe,
  Plus,
  Compass,
  AlertCircle,
  RefreshCw,
  LayoutGrid,
  QrCode,
  Camera,
  Video,
  Download,
  Search,
  X,
  Sparkles,
  TrendingUp,
  Clock,
  Heart,
  ShieldCheck,
  Star,
  MessageSquare,
  ChevronsUpDown
} from 'lucide-react';
import { Santri, Setoran, Pembayaran, Kelas, Tabungan, Pengaturan, InformasiKhusus, Mutabaah, MataPelajaran, Pendaftaran, WebsiteData, Agenda } from '../types';
import { DAFTAR_SURAH, INITIAL_WEBSITE_DATA, GOOGLE_SCRIPT_URL } from '../data';
import QuranViewer from './QuranViewer';
import { APPS_SCRIPT_CODE } from '../utils/appsScriptTemplate';
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
  // Remove "Ust. " or "Ust " or "Ustadz. " or "Ustadz " from the beginning
  return name.replace(/^(Ust\.\s*|Ust\s+|Ustadz\.\s*|Ustadz\s+)/i, '');
};

const getLocalDateString = (): string => {
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
};

const getLocalDateMonthString = (): string => {
  return getLocalDateString().substring(0, 7);
};

const getYouTubeEmbedUrl = (url: string): string => {
  if (!url) return "";
  let videoId = "";
  if (url.includes("youtube.com/watch")) {
    try {
      const urlParams = new URLSearchParams(new URL(url).search);
      videoId = urlParams.get("v") || "";
    } catch (e) {
      const parts = url.split("v=");
      if (parts[1]) videoId = parts[1].split("&")[0];
    }
  } else if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
  } else if (url.includes("youtube.com/embed/")) {
    return url;
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
};

const getMapsEmbedUrl = (link: string): string => {
  if (!link) return "";
  const clean = link.trim();
  const match = clean.match(/src=["']([^"']+)["']/i);
  if (match) return match[1];
  return clean;
};

const repairAndParseJson = (jsonStr: string): any => {
  if (!jsonStr) return null;
  const trimmed = jsonStr.trim();
  try {
    return JSON.parse(trimmed);
  } catch (e) {
    console.warn("JSON kustomisasi terpotong, memulihkan data teks...", e);
    const recovered: any = { isPublished: true };

    const extractStringField = (key: string): string | undefined => {
      // 1. Coba pencocokan standard dengan tanda kutip penutup
      const regex = new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`);
      const match = trimmed.match(regex);
      if (match && match[1] !== undefined) {
        try {
          return JSON.parse(`"${match[1]}"`);
        } catch (err) {
          return match[1];
        }
      }
      // 2. Fallback: jika terpotong (truncated) dan tidak ada tanda kutip penutup
      const truncatedRegex = new RegExp(`"${key}"\\s*:\\s*"([^"]*)$`);
      const truncMatch = trimmed.match(truncatedRegex);
      if (truncMatch && truncMatch[1] !== undefined) {
        return truncMatch[1];
      }
      return undefined;
    };

    const extractBooleanField = (key: string): boolean | undefined => {
      const regex = new RegExp(`"${key}"\\s*:\\s*(true|false)`);
      const match = trimmed.match(regex);
      if (match && match[1]) {
        return match[1] === 'true';
      }
      return undefined;
    };

    const heroTitle = extractStringField('heroTitle');
    if (heroTitle !== undefined) recovered.heroTitle = heroTitle;

    const heroSubtitle = extractStringField('heroSubtitle');
    if (heroSubtitle !== undefined) recovered.heroSubtitle = heroSubtitle;

    const mapsLink = extractStringField('mapsLink');
    if (mapsLink !== undefined) recovered.mapsLink = mapsLink;

    const videoLink = extractStringField('videoLink');
    if (videoLink !== undefined) recovered.videoLink = videoLink;

    const logo = extractStringField('logo');
    if (logo !== undefined) recovered.logo = logo;

    const nama_lembaga = extractStringField('nama_lembaga');
    if (nama_lembaga !== undefined) recovered.nama_lembaga = nama_lembaga;

    const publishedAt = extractStringField('publishedAt');
    if (publishedAt !== undefined) recovered.publishedAt = publishedAt;

    const isPublished = extractBooleanField('isPublished');
    if (isPublished !== undefined) recovered.isPublished = isPublished;

    const titlesMatch = trimmed.match(/"galleryTitles"\s*:\s*\[([\s\S]*?)\]/);
    if (titlesMatch && titlesMatch[1]) {
      try {
        recovered.galleryTitles = JSON.parse(`[${titlesMatch[1]}]`);
      } catch (err) {
        const stringRegex = /"((?:[^"\\\\]|\\\\.)*)"/g;
        const matches: string[] = [];
        let m;
        while ((m = stringRegex.exec(titlesMatch[1])) !== null) {
          matches.push(m[1]);
        }
        if (matches.length > 0) recovered.galleryTitles = matches;
      }
    }

    const descsMatch = trimmed.match(/"galleryDescriptions"\s*:\s*\[([\s\S]*?)\]/);
    if (descsMatch && descsMatch[1]) {
      try {
        recovered.galleryDescriptions = JSON.parse(`[${descsMatch[1]}]`);
      } catch (err) {
        const stringRegex = /"((?:[^"\\\\]|\\\\.)*)"/g;
        const matches: string[] = [];
        let m;
        while ((m = stringRegex.exec(descsMatch[1])) !== null) {
          matches.push(m[1]);
        }
        if (matches.length > 0) recovered.galleryDescriptions = matches;
      }
    }

    const testimonialsMatch = trimmed.match(/"testimonials"\s*:\s*\[([\s\S]*?)\]/);
    if (testimonialsMatch && testimonialsMatch[1]) {
      try {
        recovered.testimonials = JSON.parse(`[${testimonialsMatch[1]}]`);
      } catch (err) {
        const items: any[] = [];
        const objRegex = /\{\s*"nama"\s*:\s*"((?:[^"\\\\]|\\\\.)*)"\s*,\s*"jabatan"\s*:\s*"((?:[^"\\\\]|\\\\.)*)"\s*,\s*"pesan"\s*:\s*"((?:[^"\\\\]|\\\\.)*)"\s*\}/g;
        let m;
        while ((m = objRegex.exec(testimonialsMatch[1])) !== null) {
          items.push({
            nama: m[1],
            jabatan: m[2],
            pesan: m[3]
          });
        }
        if (items.length > 0) {
          recovered.testimonials = items;
        }
      }
    }

    const heroImage = extractStringField('heroImage');
    if (heroImage !== undefined) {
      recovered.heroImage = heroImage;
    }

    let galleryContent = "";
    const galleryImgsMatch = trimmed.match(/"galleryImages"\s*:\s*\[([\s\S]*?)\]/);
    if (galleryImgsMatch && galleryImgsMatch[1]) {
      galleryContent = galleryImgsMatch[1];
    } else {
      const truncGalleryMatch = trimmed.match(/"galleryImages"\s*:\s*\[([\s\S]*)$/);
      if (truncGalleryMatch && truncGalleryMatch[1]) {
        galleryContent = truncGalleryMatch[1];
      }
    }

    if (galleryContent) {
      try {
        recovered.galleryImages = JSON.parse(`[${galleryContent.endsWith(']') ? galleryContent : galleryContent + '"]'}]`);
      } catch (err) {
        const anyStringRegex = /"([^"\\]*(?:\\.[^"\\]*)*)"/g;
        const matches: string[] = [];
        let m;
        while ((m = anyStringRegex.exec(galleryContent)) !== null) {
          matches.push(m[1]);
        }
        const lastStringMatch = galleryContent.match(/"([^"]*)$/);
        if (lastStringMatch && lastStringMatch[1]) {
          matches.push(lastStringMatch[1]);
        }
        if (matches.length > 0) recovered.galleryImages = matches;
      }
    }

    return recovered;
  }
};

const compressImage = (file: File, callback: (base64: string) => void, limitSize: number = 48500) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.src = event.target?.result as string;
    img.onload = () => {
      // Dynamic, high-resolution iterative optimizer to prevent image blurring/pixelation ("tidak pecah")
      // Target up to 1020px maximum dimension (very crisp for web/mobile retina screens)
      // and high-quality WebP/JPEG compression, then dynamically optimize to fit Google Sheets' limits (~48KB).
      let maxDim = limitSize < 10000 ? 320 : 1020;
      let quality = limitSize < 10000 ? 0.5 : 0.85;
      let resultBase64 = "";

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Max 6 reduction steps to guarantee optimal fit and stunning visual output
      for (let attempt = 0; attempt < 6; attempt++) {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          // Enable premium high-quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // 1. Try modern WebP format first (much higher quality at tiny file size)
          let base64WebP = canvas.toDataURL('image/webp', quality);

          // Check if WebP is supported (not fallen back to image/png or image/jpeg)
          const isWebPSupported = base64WebP.startsWith('data:image/webp');

          // 2. Try classic JPEG as fallback or comparison
          let base64JPEG = canvas.toDataURL('image/jpeg', quality);

          // Pick the best format that fits within the limit
          if (isWebPSupported && base64WebP.length <= limitSize) {
            resultBase64 = base64WebP;
          } else if (base64JPEG.length <= limitSize) {
            resultBase64 = base64JPEG;
          } else if (isWebPSupported && base64WebP.length < base64JPEG.length) {
            resultBase64 = base64WebP;
          } else {
            resultBase64 = base64JPEG;
          }
        } else {
          resultBase64 = event.target?.result as string;
          break;
        }

        // Safe threshold for Google Sheets limit
        if (resultBase64.length <= limitSize) {
          break;
        }

        // Exceeded: iteratively scale down quality first, then resolution
        if (quality > 0.45) {
          quality -= 0.12;
        } else {
          maxDim = Math.max(160, maxDim - 100);
          quality = 0.60; // reset to good quality for smaller resolution
        }
      }

      callback(resultBase64);
    };
    img.onerror = () => {
      callback(event.target?.result as string);
    };
  };
  reader.readAsDataURL(file);
};

interface AdminDashboardProps {
  user: { role: string; nama_lengkap: string; id_santri: string | null; username: string };
  santriList: Santri[];
  setoranList: Setoran[];
  pembayaranList: Pembayaran[];
  kelasList: Kelas[];
  mataPelajaranList: MataPelajaran[];
  onUpdateMataPelajaran: React.Dispatch<React.SetStateAction<MataPelajaran[]>>;
  tabunganList: Tabungan[];
  informasiList: InformasiKhusus[];
  mutabaahList: Mutabaah[];
  pengaturan: Pengaturan;

  onAddSantri: (s: Omit<Santri, 'id_santri' | 'username_ortu' | 'password_ortu'>) => void;
  onImportSantri: (data: Santri[]) => void;
  onDeleteSantri: (id: string) => void;
  onAddKelas: (nama: string) => void;
  onUpdateKelas: (id: string, name: string) => void;
  onDeleteKelas: (id: string) => void;
  onUpdateSantri: (s: Santri) => void;

  onAddSetoran: (s: Omit<Setoran, 'id_setoran' | 'nama_ustadz'>) => void;
  onAddPembayaran: (p: Omit<Pembayaran, 'id_pembayaran' | 'nama_admin'>) => void;
  onAddTabungan: (t: Omit<Tabungan, 'id'>) => void;
  onAddInformasi: (i: Omit<InformasiKhusus, 'id'>) => void;

  onDeleteSetoran: (id: string) => Promise<any> | void;
  onDeletePembayaran: (id: string) => Promise<any> | void;
  onDeleteTabungan: (id: string) => Promise<any> | void;
  onDeleteInformasi: (id: string) => Promise<any> | void;
  onDeleteMutabaah: (id: string) => Promise<any> | void;
  onClearCategoryData?: (category: string) => Promise<void>;

  onUpdateSetoran: (s: Setoran) => void;
  onUpdatePembayaran: (p: Pembayaran) => void;
  onUpdateTabungan: (t: Tabungan) => void;
  onUpdateInformasi: (i: InformasiKhusus) => void;
  onUpdateMutabaah: (m: Mutabaah) => void;
  onAddMutabaah: (m: Omit<Mutabaah, 'id'>) => void;

  onUpdateSettings: (s: Pengaturan) => Promise<boolean>;
  onLogout: () => void;
  formatRupiah: (val: number) => string;
  isSyncing?: boolean;
  onSyncData?: () => Promise<void>;
  syncError?: string | null;
  pendaftaranList?: Pendaftaran[];
  onUpdatePendaftaran?: (p: Pendaftaran) => void;
  onDeletePendaftaran?: (id: string) => void;
  websiteData?: WebsiteData;
  onUpdateWebsiteData?: (data: WebsiteData) => void;
  agendaList?: Agenda[];
  onAddAgenda?: (a: Omit<Agenda, 'id'>) => void;
  onDeleteAgenda?: (id: string) => Promise<any> | void;
  onUpdateAgenda?: (a: Agenda) => void;
  activeSchoolPrefix?: string;
    activeSchoolName?: string;
  }

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

const getAnnouncementTheme = (title: string, desc: string) => {
  const t = (title + ' ' + desc).toLowerCase();
  if (t.includes('libur') || t.includes('cuti') || t.includes('ramadhan') || t.includes('idul') || t.includes('muharram')) {
    return {
      bg: 'bg-[#042f2e]',
      bgImage: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80',
      border: 'border-teal-800/60',
      text: 'text-white',
      badgeBg: 'bg-teal-900/70 backdrop-blur-sm',
      badgeText: 'text-teal-300',
      tag: 'LIBUR SEKOLAH',
      icon: null
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
      bg: 'bg-gradient-to-br from-rose-850 to-rose-950',
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
      bg: 'bg-[#042f2e]',
      border: 'border-teal-800/60',
      text: 'text-white',
      badgeBg: 'bg-teal-900/60 backdrop-blur-sm',
      badgeText: 'text-amber-300',
      tag: 'PENGUMUMAN PENTING',
      icon: null,
      overlay: 'bg-teal-950/70'
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

const PengumumanCarousel = ({ agendaList }: { agendaList: Agenda[] }) => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  // Auto-slide setiap 4 detik
  React.useEffect(() => {
    if (agendaList.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % agendaList.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [agendaList.length]);

  if (agendaList.length === 0) {
    return (
      <div className="w-full bg-white border border-slate-100 rounded-3xl p-6 text-center text-slate-700 text-xs py-10 font-medium">
        Belum ada pengumuman penting saat ini.
      </div>
    );
  }

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="relative w-full max-w-[260px] overflow-hidden rounded-3xl">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {agendaList.map((item, index) => {
            const theme = getAnnouncementTheme(item.judul, item.deskripsi);
            const hasGambar = !!item.gambar;
            return (
              <div
                key={item.id || index}
                className="w-full shrink-0 rounded-3xl shadow-sm border border-white/10 relative overflow-hidden flex flex-col justify-between text-white text-left"
                style={{ height: hasGambar ? '200px' : '125px' }}
              >
                {hasGambar && (
                  <>
                    <img
                      src={getCleanImageUrl(item.gambar)}
                      alt={item.judul}
                      className="absolute inset-0 z-0 w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 z-0 bg-black/40" />
                  </>
                )}

                {!hasGambar && (
                  <>
                    <div className={`absolute inset-0 z-0 ${theme.bg}`} />
                    <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none select-none z-0">
                      {theme.icon}
                    </div>
                  </>
                )}

                <div className="relative z-10 p-4 flex flex-col justify-between h-full">
                  <div>
                    <span className={`text-[8px] font-black tracking-widest ${theme.badgeText} ${theme.badgeBg} px-2.5 py-1 rounded-full w-max inline-block drop-shadow-md`}>
                      {theme.tag}
                    </span>
                    <h4 className="text-xs font-bold leading-snug mt-2.5 line-clamp-2">{item.judul}</h4>
                    <p className="text-[8px] opacity-90 mt-1 line-clamp-1">{item.deskripsi}</p>
                  </div>
                  <span className="text-[8.5px] font-semibold opacity-95">{formatIndoDate(item.tanggal)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {agendaList.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {agendaList.map((_, idx) => (
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
};

export default function AdminDashboard({
  user,
  santriList,
  setoranList,
  pembayaranList,
  kelasList,
  mataPelajaranList,
  onUpdateMataPelajaran,
  tabunganList,
  informasiList,
  mutabaahList,
  pengaturan,
  onAddSantri,
  onImportSantri,
  onDeleteSantri,
  onAddKelas,
  onUpdateKelas,
  onDeleteKelas,
  onUpdateSantri,
  onAddSetoran,
  onAddPembayaran,
  onAddTabungan,
  onAddInformasi,
  onDeleteSetoran,
  onDeletePembayaran,
  onDeleteTabungan,
  onDeleteInformasi,
  onDeleteMutabaah,
  onClearCategoryData,
  onUpdateSetoran,
  onUpdatePembayaran,
  onUpdateTabungan,
  onUpdateInformasi,
  onUpdateMutabaah,
  onAddMutabaah,
  onUpdateSettings,
  onLogout,
  formatRupiah,
  isSyncing,
  onSyncData,
  syncError,
  pendaftaranList = [],
  onUpdatePendaftaran,
  onDeletePendaftaran,
  websiteData,
  onUpdateWebsiteData,
  agendaList = [],
  onAddAgenda = () => { },
  onDeleteAgenda = () => { },
  onUpdateAgenda = () => { },
  activeSchoolPrefix = 'TPQ1',
  activeSchoolName = 'baitulquran',
}: AdminDashboardProps) {
  const myMataPelajaranList = (() => {
    const map = new Map<string, MataPelajaran>();
    const currentUser = (user?.username || 'admin').toLowerCase().trim();

    // 1. Tambahkan kurikulum milik user lain / default dulu
    mataPelajaranList.forEach(mp => {
      if (mp && mp.id_kelas) {
        const creator = (mp.created_by || 'admin').toLowerCase().trim();
        if (creator !== currentUser) {
          map.set(mp.id_kelas.toLowerCase().trim(), mp);
        }
      }
    });

    // 2. Timpa dengan kurikulum milik user sekarang agar diprioritaskan jika ada
    mataPelajaranList.forEach(mp => {
      if (mp && mp.id_kelas) {
        const creator = (mp.created_by || 'admin').toLowerCase().trim();
        if (creator === currentUser) {
          map.set(mp.id_kelas.toLowerCase().trim(), mp);
        }
      }
    });

    return Array.from(map.values());
  })();

  const isCurriculumForClass = (mp: MataPelajaran, classId: string, className: string) => {
    if (!mp || !mp.id_kelas) return false;

    const mpIdClean = mp.id_kelas.toString().trim().toLowerCase();
    const cleanKId = (classId || '').toString().trim().toLowerCase();
    const cleanKName = (className || '').toString().trim().toLowerCase();

    // 1. Match on exact class ID
    if (cleanKId && mpIdClean === cleanKId) return true;

    // 2. Match with class name
    if (cleanKName && mpIdClean === cleanKName) return true;

    // 3. Match without 'k' prefix
    if (cleanKId) {
      const mpIdNoK = mpIdClean.replace(/^k/, '');
      const kIdNoK = cleanKId.replace(/^k/, '');
      if (mpIdNoK === kIdNoK) return true;

      // 4. Robust Match prefix of ID (e.g. 10 chars prefix)
      if (kIdNoK.length >= 10 && mpIdNoK.length >= 10) {
        if (mpIdNoK.startsWith(kIdNoK.substring(0, 10)) || kIdNoK.startsWith(mpIdNoK.substring(0, 10))) {
          return true;
        }
      }
    }

    return false;
  };

  const findCurriculumForClass = (classId: string, className: string) => {
    if (!classId && !className) return null;
    return myMataPelajaranList.find(mp => isCurriculumForClass(mp, classId, className)) || null;
  };

  const [activeTab, setActiveTab] = useState<'beranda' | 'santri' | 'input-setoran' | 'kelas' | 'riwayat' | 'tabungan' | 'informasi' | 'pembayaran' | 'setting' | 'quran' | 'menu-hub' | 'mutabaah' | 'setoran' | 'website' | 'pendaftaran' | 'agenda'>('beranda');

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

  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.scrollTop > 10) {
        setIsHeaderScrolled(true);
      } else {
        setIsHeaderScrolled(false);
      }
    };
    const mainEl = document.getElementById('admin-main-viewport');
    if (mainEl) {
      mainEl.scrollTop = 0;
      setIsHeaderScrolled(false);
      mainEl.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => {
      if (mainEl) {
        mainEl.removeEventListener('scroll', handleScroll);
      }
    };
  }, [activeTab]);

  // Agenda State Variables
  const [showAgendaForm, setShowAgendaForm] = useState(false);
  const [editingAgenda, setEditingAgenda] = useState<Agenda | null>(null);
  const [agendaTipe, setAgendaTipe] = useState<'Agenda' | 'Pengumuman'>('Agenda');
  const [agendaTanggal, setAgendaTanggal] = useState(getLocalDateString());
  const [agendaWaktu, setAgendaWaktu] = useState('');
  const [agendaJudul, setAgendaJudul] = useState('');
  const [agendaDeskripsi, setAgendaDeskripsi] = useState('');
  const [agendaStatus, setAgendaStatus] = useState('Berjalan');
  const [agendaGambar, setAgendaGambar] = useState('');
  const [agendaGambarFile, setAgendaGambarFile] = useState<File | null>(null);
  const [agendaUploadingImage, setAgendaUploadingImage] = useState(false);
  const [filterAgendaTipe, setFilterAgendaTipe] = useState<'Semua' | 'Agenda' | 'Pengumuman'>('Semua');
  const [filterAgendaSearch, setFilterAgendaSearch] = useState('');
  const [searchMenuQuery, setSearchMenuQuery] = useState('');
  const [searchKelas, setSearchKelas] = useState('');

  // Input Setoran state
  const [jenisInput, setJenisInput] = useState<'hafalan' | 'tilawah' | 'hadits' | 'pembayaran' | 'mutabaah' | 'tabungan' | 'informasi'>('hafalan');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [inpKelas, setInpKelas] = useState('');
  const [inpSantriId, setInpSantriId] = useState('');
  const [inpSurah, setInpSurah] = useState('');
  const [inpAyat, setInpAyat] = useState('');
  const [inpTilawah, setInpTilawah] = useState('');
  const [inpTilawahDropdown, setInpTilawahDropdown] = useState('');
  const [inpTilawahHalaman, setInpTilawahHalaman] = useState('');
  const [inpHadits, setInpHadits] = useState('');
  const [inpHaditsDropdown, setInpHaditsDropdown] = useState('');
  const [inpMetodeQuran, setInpMetodeQuran] = useState('');
  const [inpKualitas, setInpKualitas] = useState('Mumtaz');
  const [inpCatatan, setInpCatatan] = useState('');

  // QR setoran state
  const [qrInpMetodeQuran, setQrInpMetodeQuran] = useState('');
  const [qrInpHaditsDropdown, setQrInpHaditsDropdown] = useState('');
  const [qrInpTilawahDropdown, setQrInpTilawahDropdown] = useState('');

  // Mutabaah Admin States
  const [mutSubuh, setMutSubuh] = useState<'Ya' | 'Tidak'>('Ya');
  const [mutDzuhur, setMutDzuhur] = useState<'Ya' | 'Tidak'>('Ya');
  const [mutAshar, setMutAshar] = useState<'Ya' | 'Tidak'>('Ya');
  const [mutMaghrib, setMutMaghrib] = useState<'Ya' | 'Tidak'>('Ya');
  const [mutIsya, setMutIsya] = useState<'Ya' | 'Tidak'>('Ya');
  const [mutDhuha, setMutDhuha] = useState<'Ya' | 'Tidak'>('Tidak');
  const [mutTilawah, setMutTilawah] = useState('');

  // Pembayaran Admin state
  const [payKategori, setPayKategori] = useState('');
  const [payNominal, setPayNominal] = useState('');
  const [payStatus, setPayStatus] = useState<'Lunas' | 'Cicil' | 'Belum Bayar'>('Lunas');
  const [payCatatan, setPayCatatan] = useState('');

  // Tabungan State
  const [tabKelas, setTabKelas] = useState('');
  const [tabSantriId, setTabSantriId] = useState('');
  const [tabNominal, setTabNominal] = useState('');

  // Informasi State
  const [infoTipe, setInfoTipe] = useState<'Manual' | 'Bulanan'>('Manual');
  const [infoKelas, setInfoKelas] = useState('');
  const [infoSantriId, setInfoSantriId] = useState('');
  const [infoPesan, setInfoPesan] = useState('');

  // Redesigned Riwayat Filter State
  const [filterKelas, setFilterKelas] = useState('');
  const [filterNama, setFilterNama] = useState('');
  const [filterMenu, setFilterMenu] = useState('');
  const [filterTglMulai, setFilterTglMulai] = useState('');
  const [filterTglAkhir, setFilterTglAkhir] = useState('');
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [appliedResults, setAppliedResults] = useState<any[]>([]);
  const [sortField, setSortField] = useState<'date' | 'class' | 'name' | 'menu'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // FILTER & MODAL STATES FOR EACH SEPARATE MENU:
  // Tabungan Filters
  const [filterTabunganKelas, setFilterTabunganKelas] = useState('');
  const [filterTabunganNama, setFilterTabunganNama] = useState('');
  const [isTabunganFilterApplied, setIsTabunganFilterApplied] = useState(false);
  const [tabExpandedStudentId, setTabExpandedStudentId] = useState<string | null>(null);
  const [editTabunganItem, setEditTabunganItem] = useState<Tabungan | null>(null);

  // Keuangan Filters
  const [filterKeuanganKelas, setFilterKeuanganKelas] = useState('');
  const [filterKeuanganNama, setFilterKeuanganNama] = useState('');
  const [isKeuanganFilterApplied, setIsKeuanganFilterApplied] = useState(false);
  const [keuanganExpandedStudentId, setKeuanganExpandedStudentId] = useState<string | null>(null);

  // Informasi Filters
  const [filterInformasiKelas, setFilterInformasiKelas] = useState('');
  const [filterInformasiNama, setFilterInformasiNama] = useState('');
  const [isInformasiFilterApplied, setIsInformasiFilterApplied] = useState(false);
  const [informasiExpandedStudentId, setInformasiExpandedStudentId] = useState<string | null>(null);
  const [editInformasiItem, setEditInformasiItem] = useState<InformasiKhusus | null>(null);

  // Mutabaah Filters
  const [filterMutabaahKelas, setFilterMutabaahKelas] = useState('');
  const [filterMutabaahNama, setFilterMutabaahNama] = useState('');
  const [isMutabaahFilterApplied, setIsMutabaahFilterApplied] = useState(false);
  const [mutabaahExpandedStudentId, setMutabaahExpandedStudentId] = useState<string | null>(null);
  const [editMutabaahItem, setEditMutabaahItem] = useState<Mutabaah | null>(null);

  // Setoran Filters
  const [filterSetoranKelas, setFilterSetoranKelas] = useState('');
  const [filterSetoranNama, setFilterSetoranNama] = useState('');
  const [isSetoranFilterApplied, setIsSetoranFilterApplied] = useState(false);
  const [setoranExpandedStudentId, setSetoranExpandedStudentId] = useState<string | null>(null);

  // Modals visibility
  const [showAddManual, setShowAddManual] = useState(false);
  const [selectedStudentForCert, setSelectedStudentForCert] = useState<Santri | null>(null);
  const [certPenghargaan, setCertPenghargaan] = useState('');
  const [certWaliHalaqah, setCertWaliHalaqah] = useState('');

  // Pendaftaran states
  const [filterPendaftaranStatus, setFilterPendaftaranStatus] = useState<'All' | 'Pending' | 'Aktif'>('All');
  const [filterPendaftaranNama, setFilterPendaftaranNama] = useState('');
  const [selectedRegForVerify, setSelectedRegForVerify] = useState<Pendaftaran | null>(null);
  const [inputNisForVerify, setInputNisForVerify] = useState('');
  const [inputClassForVerify, setInputClassForVerify] = useState('');

  // Invitation Modal States
  const [selectedStudentForInv, setSelectedStudentForInv] = useState<Santri | null>(null);
  const [invReceiver, setInvReceiver] = useState('');
  const [invTema, setInvTema] = useState('Silaturahmi Syakirin & Laporan Perkembangan Hafalan Qur\'an');
  const [invTanggal, setInvTanggal] = useState(getLocalDateString());
  const [invWaktu, setInvWaktu] = useState('08.00 WIB s/d Selesai');
  const [invTempat, setInvTempat] = useState('Aula Utama Kompleks Pondok');
  const [invSekretaris, setInvSekretaris] = useState('Ust. Ahmad Fauzi');

  // Student QR Identity Card Modal States
  const [selectedStudentForQrCard, setSelectedStudentForQrCard] = useState<Santri | null>(null);
  const [qrCodeImgUrl, setQrCodeImgUrl] = useState('');

  // QR Scanning Quick Form States
  const [scannedStudent, setScannedStudent] = useState<Santri | null>(null);
  const [selectedQrProgram, setSelectedQrProgram] = useState<'hafalan' | 'tilawah' | 'hadits' | 'pembayaran' | 'tabungan' | null>(null);
  const [qrInpSurah, setQrInpSurah] = useState('');
  const [qrInpAyat, setQrInpAyat] = useState('');
  const [qrInpTilawah, setQrInpTilawah] = useState('');
  const [qrInpTilawahHalaman, setQrInpTilawahHalaman] = useState('');
  const [qrInpHadits, setQrInpHadits] = useState('');
  const [qrInpKualitas, setQrInpKualitas] = useState('Mumtaz');
  const [qrInpCatatan, setQrInpCatatan] = useState('');
  const [qrPayKategori, setQrPayKategori] = useState('');
  const [qrPayNominal, setQrPayNominal] = useState<string | number>('');
  const [qrPayStatus, setQrPayStatus] = useState<'Lunas' | 'Cicil' | 'Belum Bayar'>('Lunas');
  const [qrPayCatatan, setQrPayCatatan] = useState('');
  const [qrTabNominal, setQrTabNominal] = useState<string | number>('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [qrManualInput, setQrManualInput] = useState('');
  const [showQrScanSimulatorModal, setShowQrScanSimulatorModal] = useState(false);
  const [searchQueryModal, setSearchQueryModal] = useState('');
  const [tambahSubTab, setTambahSubTab] = useState<'qr' | 'manual'>('qr');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraIsInitializing, setCameraIsInitializing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPdfSignModal, setShowPdfSignModal] = useState<boolean>(false);
  const [pdfSignType, setPdfSignType] = useState<'tabungan' | 'pembayaran' | 'setoran' | null>(null);
  const [pdfSignName, setPdfSignName] = useState<string>('');
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // --- States for Class & Mata Pelajaran Sub-Tabs ---
  const [kelasSubTab, setKelasSubTab] = useState<'kelas' | 'pelajaran'>('kelas');
  const [selectedDetailClassId, setSelectedDetailClassId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<'santri' | 'pelajaran'>('santri');

  // Mata Pelajaran Form States
  const [formKelasId, setFormKelasId] = useState<string>('');
  const [formSelectedKelasIds, setFormSelectedKelasIds] = useState<string[]>([]);
  const [formQuranMethods, setFormQuranMethods] = useState<string[]>(['']);
  const [formHaditsDoa, setFormHaditsDoa] = useState<string[]>(['']);
  const [formTilawahStages, setFormTilawahStages] = useState<string[]>(['']);

  const [sheetToClear, setSheetToClear] = useState<string>('tabungan');

  const handleClearSheetData = () => {
    let listCount = 0;
    let label = '';

    if (sheetToClear === 'tabungan') {
      listCount = tabunganList.length;
      label = 'Tabungan Santri';
    } else if (sheetToClear === 'informasi') {
      listCount = informasiList.length;
      label = 'Informasi / Broadcast';
    } else if (sheetToClear === 'pembayaran') {
      listCount = pembayaranList.length;
      label = 'Keuangan / Pembayaran Administrasi';
    } else if (sheetToClear === 'mutabaah') {
      listCount = mutabaahList.length;
      label = 'Mutabaah Ibadah';
    } else if (sheetToClear === 'setoran') {
      listCount = setoranList.length;
      label = 'Setoran / Laporan';
    }

    if (listCount === 0) {
      showToast(`Tidak ditemukan data aktif pada kategori ${label}.`);
      return;
    }

    requestConfirm(
      "DANGER: Kosongkan Data Anda",
      `Apakah Anda yakin ingin menghapus SELURUH data di kategori ${label} (${listCount} data) secara permanen dari penyimpanan dan lokal? Tindakan ini tidak dapat dibatalkan!`,
      async () => {
        try {
          setIsSaving(true);
          if (onClearCategoryData) {
            await onClearCategoryData(sheetToClear);
          } else {
            // Fallback sequential execution
            if (sheetToClear === 'tabungan') {
              for (const item of tabunganList) {
                await onDeleteTabungan(item.id);
              }
            } else if (sheetToClear === 'informasi') {
              for (const item of informasiList) {
                await onDeleteInformasi(item.id);
              }
            } else if (sheetToClear === 'pembayaran') {
              for (const item of pembayaranList) {
                await onDeletePembayaran(item.id_pembayaran);
              }
            } else if (sheetToClear === 'mutabaah') {
              for (const item of mutabaahList) {
                await onDeleteMutabaah(item.id);
              }
            } else if (sheetToClear === 'setoran') {
              for (const item of setoranList) {
                await onDeleteSetoran(item.id_setoran);
              }
            }
          }
          showToast(`Berhasil mengosongkan seluruh data ${label}.`);
        } catch (e) {
          showToast(`Terjadi kesalahan saat mengosongkan data.`);
        } finally {
          setIsSaving(false);
        }
      }
    );
  };

  const resetAgendaForm = () => {
    setEditingAgenda(null);
    setAgendaTipe('Agenda');
    setAgendaTanggal(getLocalDateString());
    setAgendaWaktu('');
    setAgendaJudul('');
    setAgendaDeskripsi('');
    setAgendaStatus('Berjalan');
    setAgendaGambar('');
    setAgendaGambarFile(null);
    setAgendaUploadingImage(false);
    setShowAgendaForm(false);
  };

  const handleAgendaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agendaJudul.trim()) {
      showToast('Judul tidak boleh kosong!');
      return;
    }
    const data = {
      tipe: agendaTipe,
      tanggal: agendaTanggal,
      waktu: agendaTipe === 'Agenda' ? agendaWaktu : '-',
      judul: agendaJudul.trim(),
      deskripsi: agendaDeskripsi.trim(),
      status: agendaTipe === 'Agenda' ? agendaStatus : '-',
      gambar: agendaGambar || '',
      created_by: user?.username || 'admin'
    };

    if (editingAgenda) {
      onUpdateAgenda({
        ...editingAgenda,
        ...data
      });
      showToast('Agenda berhasil diperbarui!');
    } else {
      onAddAgenda(data);
      showToast('Agenda baru berhasil ditambahkan!');
    }
    resetAgendaForm();
  };

  const handleEditAgenda = (a: Agenda) => {
    setEditingAgenda(a);
    setAgendaTipe(a.tipe);
    setAgendaTanggal(a.tanggal);
    setAgendaWaktu(a.waktu === '-' ? '' : a.waktu);
    setAgendaJudul(a.judul);
    setAgendaDeskripsi(a.deskripsi);
    setAgendaStatus(a.status === '-' ? 'Berjalan' : a.status);
    setAgendaGambar(a.gambar || '');
    setShowAgendaForm(true);
  };

  const handleAgendaImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setAgendaUploadingImage(true);

    try {
      const driveFolderId = idDriveInp || pengaturan.id_drive;
      const schoolUser = getActiveSchoolUsername();
      const appScriptUrl = localStorage.getItem(`sim_active_script_url_${schoolUser}`) || localStorage.getItem('sim_active_script_url') || GOOGLE_SCRIPT_URL;

      // Compress image
      const base64Data = await new Promise<string>((resolve) => {
        compressImage(file, (compressedBase64) => {
          resolve(compressedBase64);
        }, 48500);
      });

      if (appScriptUrl) {
        try {
          const res = await fetch(appScriptUrl, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({
              sheet: 'Agenda',
              action: 'uploadFile',
              username: schoolUser,
              data: {
                file: base64Data,
                filename: file.name,
                mimeType: file.type,
                folderId: driveFolderId,
                fieldName: 'agenda_image'
              }
            })
          });
          const result = await res.json();
          if (result && result.success && result.url) {
            setAgendaGambar(result.url);
            return;
          }
        } catch (uploadErr) {
          console.warn("Gagal unggah gambar agenda ke cloud:", uploadErr);
        }
      }

      // Fallback: simpan sebagai base64
      setAgendaGambar(base64Data);
    } finally {
      setAgendaUploadingImage(false);
    }
  };

  const handleDeleteAgenda = (id: string) => {
    requestConfirm(
      "Konfirmasi Hapus Agenda/Pengumuman",
      "Apakah Anda yakin ingin menghapus agenda atau pengumuman ini secara permanen?",
      () => {
        onDeleteAgenda(id);
        showToast('Agenda/Pengumuman berhasil dihapus.');
      }
    );
  };

  const requestConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(null);
      }
    });
  };

  const html5QrCodeRef = React.useRef<Html5Qrcode | null>(null);
  const isScanningRef = React.useRef<boolean>(false);

  useEffect(() => {
    let active = true;

    const safeStopScanner = async (scanner: Html5Qrcode) => {
      try {
        const state = typeof scanner.getState === 'function' ? scanner.getState() : 0;
        // 2=SCANNING, 3=PAUSED, or check .isScanning boolean
        if (state === 2 || state === 3 || (scanner as any).isScanning) {
          await scanner.stop();
          console.log('Scanner stopped safely.');
        }
      } catch (e) {
        console.warn('safeStopScanner caught error (ignorable):', e);
      }
    };

    if (showQrScanSimulatorModal) {
      setCameraError(null);
      setCameraIsInitializing(true);
      const initializeScanner = async () => {
        // Wait for DOM integration
        await new Promise(resolve => setTimeout(resolve, 300));

        if (!active) return;

        try {
          const element = document.getElementById('camera-reader');
          if (!element) {
            console.error('camera-reader DOM element not found');
            if (active) setCameraIsInitializing(false);
            return;
          }

          const html5QrCode = new Html5Qrcode('camera-reader');
          html5QrCodeRef.current = html5QrCode;
          isScanningRef.current = false;

          await html5QrCode.start(
                      { facingMode: 'environment' },
                      {
                        fps: 20,
                        // Scan seluruh area kamera (full-frame) agar QR kecil & di mana pun tetap terbaca cepat
                        disableFlip: false,
                        aspectRatio: 1.0
                      },
            (decodedText) => {
              // Successfully scanned student code
              handleScanQrCodeSimulated(decodedText);

              // Stop camera and close scan window
              if (html5QrCodeRef.current) {
                isScanningRef.current = false;
                safeStopScanner(html5QrCodeRef.current).then(() => {
                  if (active) setShowQrScanSimulatorModal(false);
                });
              }
            },
            () => {
              // Ignore failure frames
            }
          ).then(() => {
            if (!active) {
              safeStopScanner(html5QrCode);
              return;
            }
            isScanningRef.current = true;
            setCameraIsInitializing(false);
            setCameraError(null);
          }).catch(startErr => {
            if (!active) return;
            isScanningRef.current = false;
            console.error('Failed start scanner:', startErr);
            setCameraIsInitializing(false);
            const errStr = startErr?.toString() || '';
            if (errStr.includes('NotAllowedError') || errStr.includes('Permission denied') || errStr.includes('PermissionDeniedError') || errStr.includes('userMedia')) {
              setCameraError('PermissionDenied');
            } else {
              setCameraError(errStr || 'Gagal tersambung dengan kamera.');
            }
            showToast('Gagal mengakses kamera. Mohon setujui izin kamera perangkat Anda.');
          });
        } catch (error: any) {
          if (!active) return;
          console.error('Scanner init unexpected exception:', error);
          setCameraIsInitializing(false);
          setCameraError(error?.message || 'Kamera tidak dapat diakses.');
          showToast('Kamera tidak dapat diakses.');
        }
      };

      initializeScanner();
    } else {
      // De-initialize camera on modal close
      setCameraError(null);
      setCameraIsInitializing(false);
      if (html5QrCodeRef.current) {
        const scannerToStop = html5QrCodeRef.current;
        isScanningRef.current = false;
        safeStopScanner(scannerToStop).then(() => {
          html5QrCodeRef.current = null;
        });
      }
    }

    return () => {
      active = false;
      if (html5QrCodeRef.current) {
        const scannerToStop = html5QrCodeRef.current;
        isScanningRef.current = false;
        safeStopScanner(scannerToStop);
      }
    };
  }, [showQrScanSimulatorModal]);

  const [selectedStudentForRapor, setSelectedStudentForRapor] = useState<Santri | null>(null);
  const [raporPeriode, setRaporPeriode] = useState('semua');

  // Edit Setoran Modal
  const [editSetoranItem, setEditSetoranItem] = useState<Setoran | null>(null);
  // Edit Pembayaran Modal
  const [editPembayaranItem, setEditPembayaranItem] = useState<Pembayaran | null>(null);

  // Expanded Class state
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);

  // Edit Santri Modal
  const [editSantriItem, setEditSantriItem] = useState<Santri | null>(null);
  const [searchSantri, setSearchSantri] = useState('');
  const [filterKelasSantri, setFilterKelasSantri] = useState('Semua');
  const [visibleSantriCount, setVisibleSantriCount] = useState(10);
    const santriSentinelRef = React.useRef<HTMLDivElement>(null);
    const observerRef = React.useRef<IntersectionObserver | null>(null);

  // IntersectionObserver to auto-load more santri on scroll
    React.useEffect(() => {
      setVisibleSantriCount(10); // Reset on filter/search change
      const sentinel = santriSentinelRef.current;
      if (!sentinel) return;

      // Disconnect existing observer if any
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleSantriCount(prev => prev + 10);
          }
        },
        { rootMargin: '200px' }
      );
      observerRef.current = observer;
      observer.observe(sentinel);
      return () => observer.disconnect();
    }, [searchSantri, filterKelasSantri]); // Only re-create when filter values actually change

  // Kenaikan Kelas Modal
  const [showKenaikanModal, setShowKenaikanModal] = useState(false);
  const [kenaikanAsal, setKenaikanAsal] = useState('');
  const [kenaikanTujuan, setKenaikanTujuan] = useState('');
  const [kenaikanSelectedIds, setKenaikanSelectedIds] = useState<string[]>([]);

  // Settings states
  const [setLembaga, setSetLembaga] = useState(pengaturan.nama_lembaga);
  const [setPimpinan, setSetPimpinan] = useState(pengaturan.nama_pimpinan);
  const [setAlamat, setSetAlamat] = useState(pengaturan.alamat);
  const [setTelepon, setSetTelepon] = useState(pengaturan.telepon);
  const [setEmail, setSetEmail] = useState(pengaturan.email);
  const [setWebsite, setSetWebsite] = useState(pengaturan.website);
  const [logoInp, setLogoInp] = useState(pengaturan.logo || '');
  const [setPengumumanInp, setSetPengumumanInp] = useState(pengaturan.pengumuman || '');
  const [waRows, setWaRows] = useState(pengaturan.link_wa || []);
  const [idDriveInp, setIdDriveInp] = useState(pengaturan.id_drive || '');
  const [linkWebsiteInp, setLinkWebsiteInp] = useState(pengaturan.link_website || '');

  // WebsiteData States
  const [localWebsiteData, setLocalWebsiteData] = useState<WebsiteData>(websiteData || INITIAL_WEBSITE_DATA);

  useEffect(() => {
    if (websiteData) {
      setLocalWebsiteData(websiteData);
    }
  }, [websiteData]);

  // Custom Website Configuration States
  const [webHeroTitle, setWebHeroTitle] = useState("Membentuk Generasi Qur'ani & Berakhlak Karimah");
  const [webHeroSubtitle, setWebHeroSubtitle] = useState("Kami berdedikasi mendidik putra-putri tercinta untuk mahir membaca, menghafal, dan mengamalkan nilai-nilai suci Al-Qur'an.");
  const [webHeroImage, setWebHeroImage] = useState("");
  const [webGalleryImages, setWebGalleryImages] = useState<string[]>(["", "", "", ""]);
  const [webGalleryTitles, setWebGalleryTitles] = useState<string[]>([
    "Tahsin & Tilawah",
    "Setor Hafalan Baru",
    "Doa Harian & Adab",
    "Ukhuwah & Kebersamaan"
  ]);
  const [webGalleryDescriptions, setWebGalleryDescriptions] = useState<string[]>([
    "Membimbing santri dengan ketulusan dan metode menyenangkan agar mencintai firman Allah.",
    "Membimbing santri dengan ketulusan dan metode menyenangkan agar mencintai firman Allah.",
    "Membimbing santri dengan ketulusan dan metode menyenangkan agar mencintai firman Allah.",
    "Membimbing santri dengan ketulusan dan metode menyenangkan agar mencintai firman Allah."
  ]);
  const [webMapsLink, setWebMapsLink] = useState("");
  const [webVideoLink, setWebVideoLink] = useState("");
  const [webProfileTitle, setWebProfileTitle] = useState("Mendidik Al-Qur'an dengan Kurikulum Terstruktur & Modern");
  const [webProfileDesc, setWebProfileDesc] = useState("Lembaga kami menggabungkan tradisi talaqqi yang murni dengan sistem administrasi berbasis digital. Wali santri dapat memantau perkembangan hafalan harian anak, rekap ibadah harian, SPP, dan tabungan harian.");
  const [webTestimonial1Name, setWebTestimonial1Name] = useState("H. Ahmad Budiman");
  const [webTestimonial1Role, setWebTestimonial1Role] = useState("Wali Santri Kelas A");
  const [webTestimonial1Text, setWebTestimonial1Text] = useState("Alhamdulillah, sejak sekolah di sini perkembangan hafalan putra kami sangat pesat dan disiplin ibadah hariannya luar biasa terpantau!");
  const [webTestimonial2Name, setWebTestimonial2Name] = useState("Ibu Siti Aminah");
  const [webTestimonial2Role, setWebTestimonial2Role] = useState("Wali Santri Kelas B");
  const [webTestimonial2Text, setWebTestimonial2Text] = useState("Aplikasi SIM TPQ DIGITAL sangat memudahkan kami memantau setoran hafalan harian dan keuangan SPP secara transparan.");
  const [webTestimonial3Name, setWebTestimonial3Name] = useState("Bapak Joko Susilo");
  const [webTestimonial3Role, setWebTestimonial3Role] = useState("Wali Santri Kelas C");
  const [webTestimonial3Text, setWebTestimonial3Text] = useState("Pelayanan ustadz-ustadzah yang ramah, metode pembelajarannya modern dan mudah diikuti oleh anak-anak.");
  const [webIsPublished, setWebIsPublished] = useState(false);
  const [showPublishSuccessModal, setShowPublishSuccessModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [webJsonInput, setWebJsonInput] = useState<string>("");
  const [webJsonError, setWebJsonError] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<'form' | 'json'>('form');
  const [activeSection, setActiveSection] = useState<string>('hero');

  const detectSchoolUsername = (): string | null => {
    const path = window.location.pathname;
    const match = path.match(/^\/tpq\/([a-zA-Z0-9_-]+)/i);
    if (match) return match[1];

    const search = window.location.search;
    const queryMatch = search.match(/^\?tpq\/([a-zA-Z0-9_-]+)/i);
    if (queryMatch) return queryMatch[1];

    const params = new URLSearchParams(search);
    const paramVal = params.get('tpq');
    if (paramVal) return paramVal;

    const hash = window.location.hash;
    const hashMatch = hash.match(/^#\/tpq\/([a-zA-Z0-9_-]+)/i);
    if (hashMatch) return hashMatch[1];

    const hashParamMatch = hash.match(/^#tpq=([a-zA-Z0-9_-]+)/i);
    if (hashParamMatch) return hashParamMatch[1];

    return null;
  };

  const getActiveSchoolUsername = (): string => {
    // 1. Coba deteksi dari URL parameter (jika ada)
    const urlUname = detectSchoolUsername();
    if (urlUname) return urlUname.toLowerCase().trim();

    // 2. Jika user yang login memiliki username yang bukan default 'ustadz' atau 'admin'
    if (user?.username && user.username.toLowerCase().trim() !== 'ustadz' && user.username.toLowerCase().trim() !== 'admin') {
      return user.username.toLowerCase().trim();
    }

    // 3. Cari dari kecocokan sim_active_script_url dengan master list lembaga
    try {
      const savedLembagaListStr = localStorage.getItem('sim_lembaga_list');
      if (savedLembagaListStr) {
        const list = JSON.parse(savedLembagaListStr);
        if (Array.isArray(list)) {
          let activeUrl = localStorage.getItem('sim_active_script_url') || "";

          // Cari jika ada key berakhiran suffix di localStorage
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('sim_active_script_url_')) {
              const val = localStorage.getItem(key);
              if (val) {
                const matched = list.find((l: any) => l.link_appscript && l.link_appscript.trim() === val.trim());
                if (matched && matched.username) {
                  return matched.username.toLowerCase().trim();
                }
              }
            }
          }

          if (activeUrl) {
            const matched = list.find((l: any) => l.link_appscript && l.link_appscript.trim() === activeUrl.trim());
            if (matched && matched.username) {
              return matched.username.toLowerCase().trim();
            }
          }
        }
      }
    } catch (e) {
      console.warn("Gagal mencocokkan URL lembaga active:", e);
    }
    return (user?.username || "baitulquran").toLowerCase().trim();
  };

  const getDefaultJsonTemplate = () => {
    return JSON.stringify({
      heroTitle: "Membentuk Generasi Qur'ani & Berakhlak Karimah",
      heroSubtitle: "Kami berdedikasi mendidik putra-putri tercinta untuk mahir membaca, menghafal, dan mengamalkan nilai-nilai suci Al-Qur'an.",
      heroImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=90&w=1200",
      profileTitle: "Mendidik Al-Qur'an dengan Kurikulum Terstruktur & Modern",
      profileDesc: "Lembaga kami menggabungkan tradisi talaqqi yang murni dengan sistem administrasi berbasis digital. Wali santri dapat memantau perkembangan hafalan harian anak, rekap ibadah harian, SPP, dan tabungan harian.",
      galleryImages: [
        "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=90&w=1000",
        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=90&w=1000",
        "https://images.unsplash.com/photo-1609599006353-e629f1d00f18?auto=format&fit=crop&q=90&w=1000",
        "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=90&w=1000"
      ],
      galleryTitles: [
        "Tahsin & Tilawah",
        "Setor Hafalan Baru",
        "Doa Harian & Adab",
        "Ukhuwah & Kebersamaan"
      ],
      galleryDescriptions: [
        "Membimbing santri dengan ketulusan dan metode menyenangkan agar mencintai firman Allah.",
        "Metode talqin & talaqqi yang intensif bersama ustadz/ustadzah berpengalaman.",
        "Membiasakan santri mengamalkan adab harian, hafalan doa-doa penting, dan juz amma.",
        "Membangun rasa persaudaraan melalui kegiatan mabit, outbound, dan kajian santri."
      ],
      mapsLink: "",
      videoLink: "",
      testimonials: [
        {
          nama: "H. Ahmad Budiman",
          jabatan: "Wali Santri Kelas A",
          pesan: "Alhamdulillah, sejak sekolah di sini perkembangan hafalan putra kami sangat pesat dan disiplin ibadah hariannya luar biasa terpantau!"
        },
        {
          nama: "Ibu Siti Aminah",
          jabatan: "Wali Santri Kelas B",
          pesan: "Aplikasi SIM TPQ DIGITAL sangat memudahkan kami memantau setoran hafalan harian dan keuangan SPP secara transparan."
        },
        {
          nama: "Bapak Joko Susilo",
          jabatan: "Wali Santri Kelas C",
          pesan: "Pelayanan ustadz-ustadzah yang ramah, metode pembelajarannya modern dan mudah diikuti oleh anak-anak."
        }
      ]
    }, null, 2);
  };

  const compileFormFieldsToJson = (overrides: any = {}) => {
    const nextHeroTitle = overrides.heroTitle !== undefined ? overrides.heroTitle : webHeroTitle;
    const nextHeroSubtitle = overrides.heroSubtitle !== undefined ? overrides.heroSubtitle : webHeroSubtitle;
    const nextHeroImage = overrides.heroImage !== undefined ? overrides.heroImage : webHeroImage;
    const nextProfileTitle = overrides.profileTitle !== undefined ? overrides.profileTitle : webProfileTitle;
    const nextProfileDesc = overrides.profileDesc !== undefined ? overrides.profileDesc : webProfileDesc;
    const nextGalleryImages = overrides.galleryImages !== undefined ? overrides.galleryImages : webGalleryImages;
    const nextGalleryTitles = overrides.galleryTitles !== undefined ? overrides.galleryTitles : webGalleryTitles;
    const nextGalleryDescriptions = overrides.galleryDescriptions !== undefined ? overrides.galleryDescriptions : webGalleryDescriptions;
    const nextMapsLink = overrides.mapsLink !== undefined ? overrides.mapsLink : webMapsLink;
    const nextVideoLink = overrides.videoLink !== undefined ? overrides.videoLink : webVideoLink;
    const nextTestimonials = [
      { nama: overrides.t1Name !== undefined ? overrides.t1Name : webTestimonial1Name, jabatan: overrides.t1Role !== undefined ? overrides.t1Role : webTestimonial1Role, pesan: overrides.t1Text !== undefined ? overrides.t1Text : webTestimonial1Text },
      { nama: overrides.t2Name !== undefined ? overrides.t2Name : webTestimonial2Name, jabatan: overrides.t2Role !== undefined ? overrides.t2Role : webTestimonial2Role, pesan: overrides.t2Text !== undefined ? overrides.t2Text : webTestimonial2Text },
      { nama: overrides.t3Name !== undefined ? overrides.t3Name : webTestimonial3Name, jabatan: overrides.t3Role !== undefined ? overrides.t3Role : webTestimonial3Role, pesan: overrides.t3Text !== undefined ? overrides.t3Text : webTestimonial3Text }
    ];

    const configObj = {
      heroTitle: nextHeroTitle,
      heroSubtitle: nextHeroSubtitle,
      heroImage: nextHeroImage,
      profileTitle: nextProfileTitle,
      profileDesc: nextProfileDesc,
      galleryImages: nextGalleryImages,
      galleryTitles: nextGalleryTitles,
      galleryDescriptions: nextGalleryDescriptions,
      mapsLink: nextMapsLink,
      videoLink: nextVideoLink,
      testimonials: nextTestimonials
    };

    setWebJsonInput(JSON.stringify(configObj, null, 2));
    setWebJsonError(null);
  };

  const [uploadingImage, setUploadingImage] = useState<{ [key: string]: boolean }>({});
  const [isSavingWebsiteForm, setIsSavingWebsiteForm] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'hero' | 'program_1' | 'program_2' | 'program_3' | 'program_4') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so same file can be uploaded again
    e.target.value = "";

    const key = target;
    setUploadingImage(prev => ({ ...prev, [key]: true }));

    try {
      const driveFolderId = idDriveInp || pengaturan.id_drive;
      const schoolUser = getActiveSchoolUsername();
      const appScriptUrl = localStorage.getItem(`sim_active_script_url_${schoolUser}`) || localStorage.getItem('sim_active_script_url') || GOOGLE_SCRIPT_URL;

      // Compress the image before uploading/converting to avoid huge base64 size limits in Google Sheets.
      const limitSize = (driveFolderId || appScriptUrl) ? 48500 : 5500;
      const base64Data = await new Promise<string>((resolve) => {
        compressImage(file, (compressedBase64) => {
          resolve(compressedBase64);
        }, limitSize);
      });

      let updatedUrl = base64Data;
      let isUploadedToCloud = false;

      if (appScriptUrl) {
        try {
          const res = await fetch(appScriptUrl, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({
              sheet: 'website',
              action: 'uploadFile',
              username: schoolUser,
              data: {
                file: base64Data,
                filename: file.name,
                mimeType: file.type,
                folderId: driveFolderId,
                fieldName: key
              }
            })
          });
          const result = await res.json();
          if (result && result.success && result.url) {
            updatedUrl = result.url;
            isUploadedToCloud = true;
          }
        } catch (uploadErr) {
          console.warn("Gagal unggah gambar ke cloud, fallback ke penyimpanan lokal:", uploadErr);
        }
      }

      const nextData = { ...localWebsiteData };
      if (target === 'hero') {
        nextData.gambar_hero = updatedUrl;
      } else if (target === 'program_1') {
        nextData.program_1_gambar = updatedUrl;
      } else if (target === 'program_2') {
        nextData.program_2_gambar = updatedUrl;
      } else if (target === 'program_3') {
        nextData.program_3_gambar = updatedUrl;
      } else if (target === 'program_4') {
        nextData.program_4_gambar = updatedUrl;
      }

      // Simpan langsung ke localStorage agar tersimpan di browser
      const suffix = schoolUser ? `_${schoolUser}` : "";
      localStorage.setItem(`sim_website_data${suffix}`, JSON.stringify(nextData));

      // Update states safely
      setLocalWebsiteData(nextData);

      if (onUpdateWebsiteData) {
        onUpdateWebsiteData(nextData);
      }

      if (isUploadedToCloud) {
        showToast("Gambar berhasil diunggah & diperbarui di sistem cloud!");
      } else {
        showToast("Gambar berhasil diperbarui secara lokal!");
      }
    } catch (err: any) {
      showToast(`Gagal mengunggah gambar: ${err.message || err}`);
    } finally {
      setUploadingImage(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleSaveWebsiteForm = async () => {
    setIsSavingWebsiteForm(true);
    let isSynced = false;
    try {
      const schoolUser = getActiveSchoolUsername();
      const appScriptUrl = localStorage.getItem(`sim_active_script_url_${schoolUser}`) || localStorage.getItem('sim_active_script_url') || GOOGLE_SCRIPT_URL;

      // Ensure that all the new fields from individual visual states are also synced back to localWebsiteData
      const finalWebsiteData: WebsiteData = {
        ...localWebsiteData,
        username: schoolUser,
        judul_hero: localWebsiteData.judul_hero || webHeroTitle,
        sub_judul_hero: localWebsiteData.sub_judul_hero || webHeroSubtitle,
        gambar_hero: localWebsiteData.gambar_hero || webHeroImage,
        judul_profil: localWebsiteData.judul_profil || webProfileTitle,
        profil: localWebsiteData.profil || webProfileDesc,
        program_1_judul: localWebsiteData.program_1_judul || webGalleryTitles[0],
        program_1_gambar: localWebsiteData.program_1_gambar || webGalleryImages[0],
        program_1_ket: localWebsiteData.program_1_ket || webGalleryDescriptions[0],
        program_2_judul: localWebsiteData.program_2_judul || webGalleryTitles[1],
        program_2_gambar: localWebsiteData.program_2_gambar || webGalleryImages[1],
        program_2_ket: localWebsiteData.program_2_ket || webGalleryDescriptions[1],
        program_3_judul: localWebsiteData.program_3_judul || webGalleryTitles[2],
        program_3_gambar: localWebsiteData.program_3_gambar || webGalleryImages[2],
        program_3_ket: localWebsiteData.program_3_ket || webGalleryDescriptions[2],
        program_4_judul: localWebsiteData.program_4_judul || webGalleryTitles[3],
        program_4_gambar: localWebsiteData.program_4_gambar || webGalleryImages[3],
        program_4_ket: localWebsiteData.program_4_ket || webGalleryDescriptions[3],
        link_peta: localWebsiteData.link_peta || webMapsLink,
        link_video: localWebsiteData.link_video || webVideoLink,
        testi_1_nama: localWebsiteData.testi_1_nama || webTestimonial1Name,
        testi_1_jabatan: localWebsiteData.testi_1_jabatan || webTestimonial1Role,
        testi_1_pesan: localWebsiteData.testi_1_pesan || webTestimonial1Text,
        testi_2_nama: localWebsiteData.testi_2_nama || webTestimonial2Name,
        testi_2_jabatan: localWebsiteData.testi_2_jabatan || webTestimonial2Role,
        testi_2_pesan: localWebsiteData.testi_2_pesan || webTestimonial2Text,
        testi_3_nama: localWebsiteData.testi_3_nama || webTestimonial3Name,
        testi_3_jabatan: localWebsiteData.testi_3_jabatan || webTestimonial3Role,
        testi_3_pesan: localWebsiteData.testi_3_pesan || webTestimonial3Text,
      };

      // 1. Simpan ke Local Storage
      const suffix = schoolUser ? `_${schoolUser}` : "";
      localStorage.setItem(`sim_website_data${suffix}`, JSON.stringify(finalWebsiteData));

      // 2. Update state di App.tsx agar langsung tampil
      if (onUpdateWebsiteData) {
        onUpdateWebsiteData(finalWebsiteData);
      }

      // Also compile and save to sim_landing_config for visual and JSON compatibility
      const configObj = {
        heroTitle: finalWebsiteData.judul_hero,
        heroSubtitle: finalWebsiteData.sub_judul_hero,
        heroImage: finalWebsiteData.gambar_hero,
        profileTitle: finalWebsiteData.judul_profil,
        profileDesc: finalWebsiteData.profil,
        galleryImages: [
          finalWebsiteData.program_1_gambar,
          finalWebsiteData.program_2_gambar,
          finalWebsiteData.program_3_gambar,
          finalWebsiteData.program_4_gambar
        ],
        galleryTitles: [
          finalWebsiteData.program_1_judul,
          finalWebsiteData.program_2_judul,
          finalWebsiteData.program_3_judul,
          finalWebsiteData.program_4_judul
        ],
        galleryDescriptions: [
          finalWebsiteData.program_1_ket,
          finalWebsiteData.program_2_ket,
          finalWebsiteData.program_3_ket,
          finalWebsiteData.program_4_ket
        ],
        mapsLink: finalWebsiteData.link_peta,
        videoLink: finalWebsiteData.link_video,
        testimonials: [
          { nama: finalWebsiteData.testi_1_nama, jabatan: finalWebsiteData.testi_1_jabatan, pesan: finalWebsiteData.testi_1_pesan },
          { nama: finalWebsiteData.testi_2_nama, jabatan: finalWebsiteData.testi_2_jabatan, pesan: finalWebsiteData.testi_2_pesan },
          { nama: finalWebsiteData.testi_3_nama, jabatan: finalWebsiteData.testi_3_jabatan, pesan: finalWebsiteData.testi_3_pesan }
        ]
      };
      localStorage.setItem(`sim_landing_config_${schoolUser}`, JSON.stringify(configObj));

      // 3. Kirim ke Apps Script (jika ada) dengan headers text/plain untuk melewati preflight CORS
      if (appScriptUrl) {
        try {
          const res = await fetch(appScriptUrl, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({
              sheet: 'website',
              action: 'saveWebsiteData',
              username: schoolUser,
              data: finalWebsiteData
            })
          });

          if (res.ok) {
            const text = await res.text();
            try {
              const result = JSON.parse(text);
              if (result && result.success) {
                isSynced = true;
              } else {
                console.warn("Apps script save returned false, disimpan lokal saja", result);
              }
            } catch (parseErr) {
              // Jika status OK tetapi isinya bukan JSON, asumsikan data berhasil diterima oleh Apps Script
              console.log("Respon server bukan JSON valid, mengasumsikan sukses menyimpan:", text);
              isSynced = true;
            }
          }
        } catch (netErr) {
          console.warn("Koneksi gagal saat sinkronisasi website real-time:", netErr);
        }
      }

      // 4. Berikan pesan sukses yang menenangkan
      if (isSynced) {
        showToast("Kustomisasi website berhasil disimpan & disinkronkan ke sistem cloud!");
      } else {
        showToast("Kustomisasi disimpan secara lokal di sistem!");
      }
    } catch (err: any) {
      showToast(`Gagal menyimpan website: ${err.message || err}`);
    } finally {
      setIsSavingWebsiteForm(false);
    }
  };

  useEffect(() => {
    let configStr = "";
    if (pengaturan && pengaturan.web_config_json) {
      try {
        const testObj = repairAndParseJson(pengaturan.web_config_json);
        if (testObj && (testObj.heroTitle || testObj.isPublished)) {
          configStr = pengaturan.web_config_json;
        }
      } catch (e) {
        console.warn("Gagal mengurai kustomisasi awan, beralih ke lokal:", e);
      }
    }

    if (!configStr) {
      const usernameKey = getActiveSchoolUsername();
      configStr = localStorage.getItem(`sim_landing_config_${usernameKey}`) || "";
    }

    if (configStr) {
      try {
        const config = repairAndParseJson(configStr);
        if (config.heroTitle) setWebHeroTitle(config.heroTitle);
        if (config.heroSubtitle) setWebHeroSubtitle(config.heroSubtitle);
        if (config.heroImage) setWebHeroImage(config.heroImage);
        if (config.profileTitle) setWebProfileTitle(config.profileTitle);
        if (config.profileDesc) setWebProfileDesc(config.profileDesc);
        if (Array.isArray(config.galleryImages)) {
          const imgs = [...config.galleryImages];
          while (imgs.length < 4) imgs.push("");
          setWebGalleryImages(imgs);
        }
        if (Array.isArray(config.galleryTitles)) {
          const titles = [...config.galleryTitles];
          while (titles.length < 4) titles.push("");
          setWebGalleryTitles(titles);
        }
        if (Array.isArray(config.galleryDescriptions)) {
          const descs = [...config.galleryDescriptions];
          while (descs.length < 4) descs.push("");
          setWebGalleryDescriptions(descs);
        }
        if (config.mapsLink) setWebMapsLink(config.mapsLink);
        if (config.videoLink) setWebVideoLink(config.videoLink);

        if (config.testimonials && config.testimonials[0]) {
          setWebTestimonial1Name(config.testimonials[0].nama || "");
          setWebTestimonial1Role(config.testimonials[0].jabatan || "");
          setWebTestimonial1Text(config.testimonials[0].pesan || "");
        }
        if (config.testimonials && config.testimonials[1]) {
          setWebTestimonial2Name(config.testimonials[1].nama || "");
          setWebTestimonial2Role(config.testimonials[1].jabatan || "");
          setWebTestimonial2Text(config.testimonials[1].pesan || "");
        }
        if (config.testimonials && config.testimonials[2]) {
          setWebTestimonial3Name(config.testimonials[2].nama || "");
          setWebTestimonial3Role(config.testimonials[2].jabatan || "");
          setWebTestimonial3Text(config.testimonials[2].pesan || "");
        }
        if (config.isPublished !== undefined) setWebIsPublished(config.isPublished);

        // Clean & pretty-format the existing JSON to display in editor
        setWebJsonInput(JSON.stringify(config, null, 2));
      } catch (e) {
        console.error("Gagal mengurai konfigurasi landing page:", e);
        setWebJsonInput(getDefaultJsonTemplate());
      }
    } else {
      setWebJsonInput(getDefaultJsonTemplate());
    }
  }, [user, pengaturan]);

  // Keep individual web customizer states and webJsonInput perfectly in sync with visual form modifications (localWebsiteData)
  useEffect(() => {
    if (localWebsiteData) {
      const nextHeroTitle = localWebsiteData.judul_hero || "";
      const nextHeroImage = localWebsiteData.gambar_hero || "";
      const nextProfileDesc = localWebsiteData.profil || "";

      if (nextHeroTitle && nextHeroTitle !== webHeroTitle) setWebHeroTitle(nextHeroTitle);
      if (nextHeroImage && nextHeroImage !== webHeroImage) setWebHeroImage(nextHeroImage);
      if (nextProfileDesc && nextProfileDesc !== webProfileDesc) setWebProfileDesc(nextProfileDesc);

      // Program Gallery Images, Titles, Descriptions
      let imagesChanged = false;
      const updatedImages = [...webGalleryImages];
      if (localWebsiteData.program_1_gambar !== undefined && localWebsiteData.program_1_gambar !== updatedImages[0]) { updatedImages[0] = localWebsiteData.program_1_gambar; imagesChanged = true; }
      if (localWebsiteData.program_2_gambar !== undefined && localWebsiteData.program_2_gambar !== updatedImages[1]) { updatedImages[1] = localWebsiteData.program_2_gambar; imagesChanged = true; }
      if (localWebsiteData.program_3_gambar !== undefined && localWebsiteData.program_3_gambar !== updatedImages[2]) { updatedImages[2] = localWebsiteData.program_3_gambar; imagesChanged = true; }
      if (localWebsiteData.program_4_gambar !== undefined && localWebsiteData.program_4_gambar !== updatedImages[3]) { updatedImages[3] = localWebsiteData.program_4_gambar; imagesChanged = true; }
      if (imagesChanged) setWebGalleryImages(updatedImages);

      let titlesChanged = false;
      const updatedTitles = [...webGalleryTitles];
      if (localWebsiteData.program_1_judul !== undefined && localWebsiteData.program_1_judul !== updatedTitles[0]) { updatedTitles[0] = localWebsiteData.program_1_judul; titlesChanged = true; }
      if (localWebsiteData.program_2_judul !== undefined && localWebsiteData.program_2_judul !== updatedTitles[1]) { updatedTitles[1] = localWebsiteData.program_2_judul; titlesChanged = true; }
      if (localWebsiteData.program_3_judul !== undefined && localWebsiteData.program_3_judul !== updatedTitles[2]) { updatedTitles[2] = localWebsiteData.program_3_judul; titlesChanged = true; }
      if (localWebsiteData.program_4_judul !== undefined && localWebsiteData.program_4_judul !== updatedTitles[3]) { updatedTitles[3] = localWebsiteData.program_4_judul; titlesChanged = true; }
      if (titlesChanged) setWebGalleryTitles(updatedTitles);

      let descsChanged = false;
      const updatedDescs = [...webGalleryDescriptions];
      if (localWebsiteData.program_1_ket !== undefined && localWebsiteData.program_1_ket !== updatedDescs[0]) { updatedDescs[0] = localWebsiteData.program_1_ket; descsChanged = true; }
      if (localWebsiteData.program_2_ket !== undefined && localWebsiteData.program_2_ket !== updatedDescs[1]) { updatedDescs[1] = localWebsiteData.program_2_ket; descsChanged = true; }
      if (localWebsiteData.program_3_ket !== undefined && localWebsiteData.program_3_ket !== updatedDescs[2]) { updatedDescs[2] = localWebsiteData.program_3_ket; descsChanged = true; }
      if (localWebsiteData.program_4_ket !== undefined && localWebsiteData.program_4_ket !== updatedDescs[3]) { updatedDescs[3] = localWebsiteData.program_4_ket; descsChanged = true; }
      if (descsChanged) setWebGalleryDescriptions(updatedDescs);

      // Now compile this to JSON and update webJsonInput so raw JSON editor matches the visual editor!
      try {
        let currentJsonObj: any = {};
        if (webJsonInput) {
          try {
            currentJsonObj = JSON.parse(webJsonInput);
          } catch (e) { }
        }

        const nextJsonObj = {
          ...currentJsonObj,
          heroTitle: nextHeroTitle || currentJsonObj.heroTitle || "Membentuk Generasi Qur'ani & Berakhlak Karimah",
          heroSubtitle: webHeroSubtitle || currentJsonObj.heroSubtitle || "Kami berdedikasi mendidik putra-putri tercinta untuk mahir membaca, menghafal, dan mengamalkan nilai-nilai suci Al-Qur'an.",
          heroImage: nextHeroImage || currentJsonObj.heroImage || "",
          profileTitle: webProfileTitle || currentJsonObj.profileTitle || "Mendidik Al-Qur'an dengan Kurikulum Terstruktur & Modern",
          profileDesc: nextProfileDesc || currentJsonObj.profileDesc || "",
          galleryImages: updatedImages,
          galleryTitles: updatedTitles,
          galleryDescriptions: updatedDescs,
          mapsLink: webMapsLink || currentJsonObj.mapsLink || "",
          videoLink: webVideoLink || currentJsonObj.videoLink || "",
          testimonials: currentJsonObj.testimonials || [
            { nama: webTestimonial1Name, jabatan: webTestimonial1Role, pesan: webTestimonial1Text },
            { nama: webTestimonial2Name, jabatan: webTestimonial2Role, pesan: webTestimonial2Text },
            { nama: webTestimonial3Name, jabatan: webTestimonial3Role, pesan: webTestimonial3Text }
          ]
        };
        const nextJsonString = JSON.stringify(nextJsonObj, null, 2);
        if (nextJsonString !== webJsonInput) {
          setWebJsonInput(nextJsonString);
        }
      } catch (e) {
        console.warn("Gagal menyinkronkan ke JSON input:", e);
      }
    }
  }, [localWebsiteData]);

  useEffect(() => {
    setSetLembaga(pengaturan.nama_lembaga);
    setSetPimpinan(pengaturan.nama_pimpinan);
    setSetAlamat(pengaturan.alamat || '');
    setSetTelepon(pengaturan.telepon || '');
    setSetEmail(pengaturan.email || '');
    setSetWebsite(pengaturan.website || '');
    setLogoInp(pengaturan.logo || '');
    setSetPengumumanInp(pengaturan.pengumuman || '');
    setWaRows(pengaturan.link_wa || []);
    setIdDriveInp(pengaturan.id_drive || '');
    setLinkWebsiteInp(pengaturan.link_website || '');
  }, [pengaturan]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [landingPageQrUrl, setLandingPageQrUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
      const activeUname = activeSchoolName || getActiveSchoolUsername();
      // QR Brosur harus mengarah ke domain publik yang bisa diakses HP manapun.
      // window.location.origin bisa jadi localhost/tunnel saat admin kerja → pakai host publik tetap.
      const host = window.location.hostname === 'localhost' || window.location.hostname.endsWith('.local')
        ? 'https://simtpqdigital.web.id'
        : window.location.origin;
      const url = `${host}/?tpq=${activeUname}`;
        QRCode.toDataURL(url, {
          width: 300,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        }, (err, dataUrl) => {
          if (!err && dataUrl) {
            setLandingPageQrUrl(dataUrl);
          }
        });
      }, [user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePrintCard = () => {
    if (!selectedStudentForQrCard) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Kartu Santri - ${selectedStudentForQrCard.nama_santri}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap');
            body {
              margin: 0;
              padding: 40px;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              background-color: #f1f5f9;
              font-family: 'Poppins', sans-serif;
            }
            .card-wrapper {
              width: 480px;
              height: 300px;
              background: linear-gradient(135deg, #042f2e 0%, #115e59 60%, #042f2e 100%);
              border-radius: 20px;
              border: 3px solid #f59e0b;
              color: #ffffff;
              padding: 24px;
              box-sizing: border-box;
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              position: relative;
              overflow: hidden;
              box-shadow: 0 20px 40px rgba(0,0,0,0.3);
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .card-left {
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              width: 62%;
              z-index: 10;
              text-align: left;
            }
            .card-right {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              width: 35%;
              z-index: 10;
            }
            .lembaga {
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 1.5px;
              color: #f59e0b;
              margin: 0;
            }
            .kartu-title {
              font-size: 15px;
              font-weight: 700;
              color: #ffffff;
              margin: 2px 0 0 0;
              border-bottom: 2px solid rgba(245, 158, 11, 0.4);
              padding-bottom: 6px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .info-section {
              margin-top: 14px;
              display: flex;
              flex-direction: column;
              gap: 8px;
            }
            .info-block {
              margin: 0;
            }
            .label {
              font-size: 8px;
              font-weight: 700;
              color: #f59e0b;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin: 0 0 2px 0;
            }
            .value {
              font-size: 14px;
              font-weight: 700;
              color: #ffffff;
              margin: 0;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .qr-box {
              background: #ffffff;
              padding: 6px;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 2px solid #f59e0b;
              box-shadow: 0 8px 16px rgba(0,0,0,0.2);
            }
            .qr-img {
              width: 110px;
              height: 110px;
              display: block;
            }
            .nis {
              font-size: 10px;
              font-weight: 800;
              color: #f59e0b;
              margin-top: 8px;
              background: rgba(251, 191, 36, 0.1);
              padding: 2px 8px;
              border-radius: 6px;
              letter-spacing: 1px;
            }
            .gold-ring-1 {
              position: absolute;
              width: 250px;
              height: 250px;
              border-radius: 50%;
              background: radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%);
              bottom: -80px;
              right: -60px;
              border: 1px solid rgba(245,158,11,0.05);
            }
            .gold-ring-2 {
              position: absolute;
              width: 120px;
              height: 120px;
              border-radius: 50%;
              background: radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 60%);
              top: -40px;
              left: -40px;
            }
            @media print {
              body {
                background: none;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
              }
              .card-wrapper {
                box-shadow: none;
                border: 3px solid #fbbf24 !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="card-wrapper">
            <div class="gold-ring-1"></div>
            <div class="gold-ring-2"></div>
            <div class="card-left">
              <div>
                <p class="lembaga">${(pengaturan.nama_lembaga || 'TPQ AL-HIKMAH').toUpperCase()}</p>
                <p class="kartu-title">Kartu Identitas Santri</p>
              </div>
              <div class="info-section">
                <div class="info-block">
                  <p class="label">Nama Santri</p>
                  <p class="value">${selectedStudentForQrCard.nama_santri}</p>
                </div>
                <div class="info-block">
                  <p class="label">Nomor Induk Santri (NIS)</p>
                  <p class="value" style="font-family: monospace;">${selectedStudentForQrCard.nis}</p>
                </div>
                <div class="info-block">
                  <p class="label">Halaqah Kelas / Kelompok</p>
                  <p class="value">${selectedStudentForQrCard.halaqah}</p>
                </div>
              </div>
            </div>
            <div class="card-right">
              <div class="qr-box">
                <img src="${qrCodeImgUrl}" class="qr-img" />
              </div>
              <p class="nis">NIS: ${selectedStudentForQrCard.nis}</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 400);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadCard = () => {
    if (!selectedStudentForQrCard) return;

    const canvas = document.createElement('canvas');
    canvas.width = 960; // Extra High-Res double density
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Smooth rendering flags
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Background Radial/Linear gradient
    const grad = ctx.createLinearGradient(0, 0, 960, 600);
    grad.addColorStop(0, '#042f2e');
    grad.addColorStop(0.5, '#115e59');
    grad.addColorStop(1, '#042f2e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 960, 600);

    // Gold ornamental waves/circles
    ctx.fillStyle = 'rgba(245, 158, 11, 0.05)';
    ctx.beginPath();
    ctx.arc(800, 500, 280, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.08)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(100, 100, 150, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Main gold boundary frame
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, 920, 560);

    // Sub gold outline inside
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1;
    ctx.strokeRect(28, 28, 904, 544);

    // School Title Section (Left)
    ctx.fillStyle = '#fbbf24';
    ctx.font = '800 16px "Poppins", sans-serif';
    ctx.fillText((pengaturan.nama_lembaga || 'TPQ AL-HIKMAH').toUpperCase(), 60, 85);

    // Card Main Type Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'extrabold 30px "Poppins", sans-serif';
    ctx.fillText('KARTU IDENTITAS SANTRI', 60, 135);

    // Divider line
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(60, 160);
    ctx.lineTo(550, 160);
    ctx.stroke();

    // Labels & Details
    // Nama
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 12px "Poppins", sans-serif';
    ctx.fillText('NAMA SANTRI', 60, 215);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px "Poppins", sans-serif';
    ctx.fillText(selectedStudentForQrCard.nama_santri, 60, 255);

    // NIS
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 12px "Poppins", sans-serif';
    ctx.fillText('NOMOR INDUK SANTRI (NIS)', 60, 325);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Poppins", monospace';
    ctx.fillText(selectedStudentForQrCard.nis, 60, 365);

    // Class / Halaqah
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 12px "Poppins", sans-serif';
    ctx.fillText('HALAQAH KELAS / KELOMPOK', 60, 435);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Poppins", sans-serif';
    ctx.fillText(selectedStudentForQrCard.halaqah, 60, 475);

    // Draw QR code image
    const img = new Image();
    img.src = qrCodeImgUrl;
    img.onload = () => {
      // Draw premium white square rounded card background for QR
      ctx.fillStyle = '#ffffff';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 10;
      ctx.strokeStyle = '#fbbf24';
      ctx.strokeRect(635, 120, 230, 230);
      ctx.fillRect(640, 125, 220, 220);

      // Paint QR Code inside Frame
      ctx.drawImage(img, 650, 135, 200, 200);

      // Bottom QR text caption
      ctx.fillStyle = '#fbbf24';
      ctx.textAlign = 'center';
      ctx.font = 'extrabold 18px "Poppins", sans-serif';
      ctx.fillText(`NIS: ${selectedStudentForQrCard.nis}`, 750, 395);

      // Footer text branding
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = 'italic 10px "Poppins", sans-serif';
      ctx.fillText('E-KARTU RESMI ASLI - TPQ DIGITAL ONLINE', 750, 540);

      // Direct Link trigger download
      const dLink = document.createElement('a');
      dLink.download = `KARTU_KAP_QR_${selectedStudentForQrCard.nama_santri.replace(/\s+/g, '_')}.png`;
      dLink.href = canvas.toDataURL('image/png');
      dLink.click();
    };
  };

  const handleScanQrCodeSimulated = (nisCode: string) => {
      const raw = nisCode.trim();
      const sLower = raw.toLowerCase();

      // Parse format QR kartu: "NIS:xxx|NAMA:xxx|KEL:xxx|ID:xxx|TPQ:xxx"
      let parsedNis = '';
      let parsedId = '';
      let parsedTpq = '';
      if (sLower.includes('nis:') || raw.includes('|') || raw.includes(':')) {
        raw.split('|').forEach(part => {
          const idx = part.indexOf(':');
          if (idx > -1) {
            const key = part.slice(0, idx).trim().toLowerCase();
            const val = part.slice(idx + 1).trim();
            if (key === 'nis') parsedNis = val;
            else if (key === 'id') parsedId = val;
            else if (key === 'tpq' || key === 'lembaga') parsedTpq = val;
          }
        });
      }

      // Cek lembaga: jika QR membawa kode lembaga dan berbeda dari lembaga aktif => tolak
      if (parsedTpq) {
        const activePrefix = (activeSchoolPrefix || 'BQR').toLowerCase().trim();
        const qrPrefix = parsedTpq.toLowerCase();
        if (qrPrefix !== activePrefix) {
          alert(`Santri tidak terdaftar di lembaga ini! Kartu milik lembaga lain (${parsedTpq}). Santri dengan kode TPQ yang berbeda tidak terdaftar pada lembaga aktif Anda.`);
          return;
        }
      }

      const student = santriList.find(s =>
      (parsedNis && s.nis.toLowerCase() === parsedNis.toLowerCase()) ||
      (parsedId && s.id_santri.toLowerCase() === parsedId.toLowerCase()) ||
      s.nis.toLowerCase() === sLower ||
      s.id_santri.toLowerCase() === sLower ||
      s.nama_santri.toLowerCase() === sLower ||
      s.nama_santri.toLowerCase().includes(sLower)
    );
    if (student) {
      setScannedStudent(student);
      setSelectedQrProgram('hafalan'); // Default to hafalan tab!
      setQrInpSurah('');
      setQrInpAyat('');
      setQrInpTilawah('');
      setQrInpHadits('');
      setQrInpCatatan('');
      setQrPayKategori('');
      setQrPayNominal('');
      setQrPayCatatan('');
      setQrTabNominal('');
      showToast(`Terdeteksi: ${student.nama_santri}`);
    } else {
      alert(`Kartu ID / NIS / Nama "${nisCode}" tidak terdaftar di database! Cek kembali atau daftarkan santri Terlebih Dahulu.`);
    }
  };

  const submitQrQuickSetoran = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    if (!scannedStudent || !selectedQrProgram) {
      alert('Harap scan kartu santri terlebih dahulu!');
      return;
    }

    if (['hafalan', 'tilawah', 'hadits'].includes(selectedQrProgram)) {
      if (myMataPelajaranList.length === 0) {
        alert('⚠️ PERHATIAN:\n\nAkun Anda belum merekam Mata Pelajaran / Kurikulum sama sekali. Silakan buat rekaman mata pelajaran terlebih dahulu di menu "Kurikulum Kelas" sebelum menginput data Tahfidz, Tilawah, atau Hafalan.');
        return;
      }
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1500);

    if (selectedQrProgram === 'pembayaran') {
      onAddPembayaran({
        tanggal: getLocalDateString(),
        id_santri: scannedStudent.id_santri,
        nama_santri: scannedStudent.nama_santri,
        kategori: qrPayKategori,
        nominal: parseInt(String(qrPayNominal)) || 0,
        status: qrPayStatus,
        catatan: qrPayCatatan
      });
      setQrPayKategori('');
      setQrPayNominal('');
      setQrPayCatatan('');
      showToast(`Pembayaran Cepat Berhasil disimpan untuk ${scannedStudent.nama_santri}!`);
    } else if (selectedQrProgram === 'tabungan') {
      onAddTabungan({
        id_santri: scannedStudent.id_santri,
        nama_santri: scannedStudent.nama_santri,
        nominal: parseInt(String(qrTabNominal)) || 0,
        tanggal: getLocalDateString()
      });
      setQrTabNominal('');
      showToast(`Setor Tabungan Cepat Berhasil disimpan untuk ${scannedStudent.nama_santri}!`);
    } else {
      // Setoran: hafalan, tilawah, or hadits
      const finalCatatan = (selectedQrProgram === 'hafalan' && qrInpMetodeQuran)
        ? `[Metode: ${qrInpMetodeQuran}] ${qrInpCatatan}`.trim()
        : qrInpCatatan;

      onAddSetoran({
        tanggal: getLocalDateString(),
        id_santri: scannedStudent.id_santri,
        nama_santri: scannedStudent.nama_santri,
        surah: selectedQrProgram === 'hafalan' ? qrInpSurah : '-',
        ayat: selectedQrProgram === 'hafalan' ? qrInpAyat : '-',
        tilawah: selectedQrProgram === 'tilawah' ? qrInpTilawah : '-',
        halaman: selectedQrProgram === 'tilawah' ? (qrInpTilawahHalaman || '-') : '-',
        hadits: selectedQrProgram === 'hadits' ? qrInpHadits : '-',
        kualitas: qrInpKualitas,
        catatan: finalCatatan
      });
      setQrInpSurah('');
      setQrInpAyat('');
      setQrInpTilawah('');
      setQrInpTilawahDropdown('');
      setQrInpTilawahHalaman('');
      setQrInpHadits('');
      setQrInpHaditsDropdown('');
      setQrInpMetodeQuran('');
      setQrInpCatatan('');
      showToast(`Laporan setoran Berhasil disimpan untuk ${scannedStudent.nama_santri}!`);
    }
  };

  const handleAddWaRow = () => {
    setWaRows([...waRows, { program: 'Tahfidz', link: '' }]);
  };

  const handleRemoveWaRow = (index: number) => {
    setWaRows(waRows.filter((_, i) => i !== index));
  };

  const handleWaRowChange = (index: number, field: 'program' | 'link', val: string) => {
    const updated = waRows.map((row, i) => {
      if (i === index) {
        return { ...row, [field]: val };
      }
      return row;
    });
    setWaRows(updated);
  };

  const handleJsonInputChange = (val: string) => {
    setWebJsonInput(val);
    if (!val.trim()) {
      setWebJsonError("Input JSON tidak boleh kosong.");
      return;
    }
    try {
      const parsed = JSON.parse(val);
      if (typeof parsed !== "object" || parsed === null) {
        setWebJsonError("Format harus berupa objek JSON { ... }.");
        return;
      }

      // Sync preview states in real-time
      if (parsed.heroTitle !== undefined) setWebHeroTitle(parsed.heroTitle);
      if (parsed.heroSubtitle !== undefined) setWebHeroSubtitle(parsed.heroSubtitle);
      if (parsed.heroImage !== undefined) setWebHeroImage(parsed.heroImage);

      if (Array.isArray(parsed.galleryImages)) {
        const imgs = [...parsed.galleryImages];
        while (imgs.length < 4) imgs.push("");
        setWebGalleryImages(imgs);
      }
      if (Array.isArray(parsed.galleryTitles)) {
        const titles = [...parsed.galleryTitles];
        while (titles.length < 4) titles.push("");
        setWebGalleryTitles(titles);
      }
      if (Array.isArray(parsed.galleryDescriptions)) {
        const descs = [...parsed.galleryDescriptions];
        while (descs.length < 4) descs.push("");
        setWebGalleryDescriptions(descs);
      }
      if (parsed.mapsLink !== undefined) setWebMapsLink(parsed.mapsLink);
      if (parsed.videoLink !== undefined) setWebVideoLink(parsed.videoLink);

      if (Array.isArray(parsed.testimonials)) {
        if (parsed.testimonials[0]) {
          setWebTestimonial1Name(parsed.testimonials[0].nama || "");
          setWebTestimonial1Role(parsed.testimonials[0].jabatan || "");
          setWebTestimonial1Text(parsed.testimonials[0].pesan || "");
        }
        if (parsed.testimonials[1]) {
          setWebTestimonial2Name(parsed.testimonials[1].nama || "");
          setWebTestimonial2Role(parsed.testimonials[1].jabatan || "");
          setWebTestimonial2Text(parsed.testimonials[1].pesan || "");
        }
        if (parsed.testimonials[2]) {
          setWebTestimonial3Name(parsed.testimonials[2].nama || "");
          setWebTestimonial3Role(parsed.testimonials[2].jabatan || "");
          setWebTestimonial3Text(parsed.testimonials[2].pesan || "");
        }
      }

      setWebJsonError(null);
    } catch (e: any) {
      setWebJsonError(`Format JSON tidak valid: ${e.message}`);
    }
  };

  const handlePublishWebsite = async () => {
    setIsPublishing(true);
    const usernameKey = getActiveSchoolUsername();
    const appScriptUrl = localStorage.getItem(`sim_active_script_url_${usernameKey}`) || localStorage.getItem('sim_active_script_url') || GOOGLE_SCRIPT_URL;

    let configToSave: any = {};
    try {
      if (webJsonInput) {
        configToSave = JSON.parse(webJsonInput);
      }
    } catch (e: any) {
      console.warn("Raw JSON tidak valid, memulihkan dari status visual...", e);
    }

    if (!configToSave || typeof configToSave !== "object") {
      configToSave = {};
    }

    // Force sync from localWebsiteData and states to make sure any visual form edits are published
    configToSave.heroTitle = localWebsiteData?.judul_hero || configToSave.heroTitle || webHeroTitle || "Membentuk Generasi Qur'ani & Berakhlak Karimah";
    configToSave.heroSubtitle = localWebsiteData?.sub_judul_hero || webHeroSubtitle || configToSave.heroSubtitle || "Kami berdedikasi mendidik putra-putri tercinta untuk mahir membaca, menghafal, dan mengamalkan nilai-nilai suci Al-Qur'an.";
    configToSave.heroImage = localWebsiteData?.gambar_hero || configToSave.heroImage || webHeroImage || "";
    configToSave.profileTitle = localWebsiteData?.judul_profil || webProfileTitle || configToSave.profileTitle || "Mendidik Al-Qur'an dengan Kurikulum Terstruktur & Modern";
    configToSave.profileDesc = localWebsiteData?.profil || configToSave.profileDesc || webProfileDesc || "";

    // Gallery Images
    if (!configToSave.galleryImages || !Array.isArray(configToSave.galleryImages)) {
      configToSave.galleryImages = ["", "", "", ""];
    }
    configToSave.galleryImages[0] = localWebsiteData?.program_1_gambar || configToSave.galleryImages[0] || webGalleryImages[0] || "";
    configToSave.galleryImages[1] = localWebsiteData?.program_2_gambar || configToSave.galleryImages[1] || webGalleryImages[1] || "";
    configToSave.galleryImages[2] = localWebsiteData?.program_3_gambar || configToSave.galleryImages[2] || webGalleryImages[2] || "";
    configToSave.galleryImages[3] = localWebsiteData?.program_4_gambar || configToSave.galleryImages[3] || webGalleryImages[3] || "";

    // Gallery Titles
    if (!configToSave.galleryTitles || !Array.isArray(configToSave.galleryTitles)) {
      configToSave.galleryTitles = ["", "", "", ""];
    }
    configToSave.galleryTitles[0] = localWebsiteData?.program_1_judul || configToSave.galleryTitles[0] || webGalleryTitles[0] || "";
    configToSave.galleryTitles[1] = localWebsiteData?.program_2_judul || configToSave.galleryTitles[1] || webGalleryTitles[1] || "";
    configToSave.galleryTitles[2] = localWebsiteData?.program_3_judul || configToSave.galleryTitles[2] || webGalleryTitles[2] || "";
    configToSave.galleryTitles[3] = localWebsiteData?.program_4_judul || configToSave.galleryTitles[3] || webGalleryTitles[3] || "";

    // Gallery Descriptions
    if (!configToSave.galleryDescriptions || !Array.isArray(configToSave.galleryDescriptions)) {
      configToSave.galleryDescriptions = ["", "", "", ""];
    }
    configToSave.galleryDescriptions[0] = localWebsiteData?.program_1_ket || configToSave.galleryDescriptions[0] || webGalleryDescriptions[0] || "";
    configToSave.galleryDescriptions[1] = localWebsiteData?.program_2_ket || configToSave.galleryDescriptions[1] || webGalleryDescriptions[1] || "";
    configToSave.galleryDescriptions[2] = localWebsiteData?.program_3_ket || configToSave.galleryDescriptions[2] || webGalleryDescriptions[2] || "";
    configToSave.galleryDescriptions[3] = localWebsiteData?.program_4_ket || configToSave.galleryDescriptions[3] || webGalleryDescriptions[3] || "";

    configToSave.mapsLink = localWebsiteData?.link_peta || webMapsLink || configToSave.mapsLink || "";
    configToSave.videoLink = localWebsiteData?.link_video || webVideoLink || configToSave.videoLink || "";

    if (!configToSave.testimonials || !Array.isArray(configToSave.testimonials)) {
      configToSave.testimonials = [
        { nama: localWebsiteData?.testi_1_nama || webTestimonial1Name, jabatan: localWebsiteData?.testi_1_jabatan || webTestimonial1Role, pesan: localWebsiteData?.testi_1_pesan || webTestimonial1Text },
        { nama: localWebsiteData?.testi_2_nama || webTestimonial2Name, jabatan: localWebsiteData?.testi_2_jabatan || webTestimonial2Role, pesan: localWebsiteData?.testi_2_pesan || webTestimonial2Text },
        { nama: localWebsiteData?.testi_3_nama || webTestimonial3Name, jabatan: localWebsiteData?.testi_3_jabatan || webTestimonial3Role, pesan: localWebsiteData?.testi_3_pesan || webTestimonial3Text }
      ];
    }

    configToSave.isPublished = true;
    configToSave.publishedAt = new Date().toISOString();
    configToSave.logo = pengaturan.logo || '';
    configToSave.nama_lembaga = pengaturan.nama_lembaga || '';

    // Build the complete flat finalWebsiteData for the spreadsheet
    const finalWebsiteData: WebsiteData = {
      username: usernameKey,
      judul_hero: configToSave.heroTitle,
      sub_judul_hero: configToSave.heroSubtitle,
      gambar_hero: configToSave.heroImage,
      judul_profil: configToSave.profileTitle,
      profil: configToSave.profileDesc,
      program_1_judul: configToSave.galleryTitles[0],
      program_1_gambar: configToSave.galleryImages[0],
      program_1_ket: configToSave.galleryDescriptions[0],
      program_2_judul: configToSave.galleryTitles[1],
      program_2_gambar: configToSave.galleryImages[1],
      program_2_ket: configToSave.galleryDescriptions[1],
      program_3_judul: configToSave.galleryTitles[2],
      program_3_gambar: configToSave.galleryImages[2],
      program_3_ket: configToSave.galleryDescriptions[2],
      program_4_judul: configToSave.galleryTitles[3],
      program_4_gambar: configToSave.galleryImages[3],
      program_4_ket: configToSave.galleryDescriptions[3],
      link_peta: configToSave.mapsLink,
      link_video: configToSave.videoLink,
      testi_1_nama: configToSave.testimonials[0]?.nama || "",
      testi_1_jabatan: configToSave.testimonials[0]?.jabatan || "",
      testi_1_pesan: configToSave.testimonials[0]?.pesan || "",
      testi_2_nama: configToSave.testimonials[1]?.nama || "",
      testi_2_jabatan: configToSave.testimonials[1]?.jabatan || "",
      testi_2_pesan: configToSave.testimonials[1]?.pesan || "",
      testi_3_nama: configToSave.testimonials[2]?.nama || "",
      testi_3_jabatan: configToSave.testimonials[2]?.jabatan || "",
      testi_3_pesan: configToSave.testimonials[2]?.pesan || "",
    };

    // Save to Local Storage first for immediate visual feedback
    try {
      localStorage.setItem(`sim_landing_config_${usernameKey}`, JSON.stringify(configToSave));
      const suffix = usernameKey ? `_${usernameKey}` : "";
      localStorage.setItem(`sim_website_data${suffix}`, JSON.stringify(finalWebsiteData));
      if (onUpdateWebsiteData) {
        onUpdateWebsiteData(finalWebsiteData);
      }
    } catch (e) {
      console.warn("Gagal menyimpan ke penyimpanan lokal:", e);
    }

    // Await visual website data sync to the cloud
    let isWebDataSynced = false;
    if (appScriptUrl) {
      try {
        const webRes = await fetch(appScriptUrl, {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            sheet: 'website',
            action: 'saveWebsiteData',
            username: usernameKey,
            data: finalWebsiteData
          })
        });
        if (webRes.ok || webRes.status === 0 || webRes.status === 302) {
          isWebDataSynced = true;
        }
      } catch (err) {
        console.warn("Sinkronisasi data website kustomisasi gagal (kemungkinan CORS redirect, tetapi terkirim):", err);
        // Treat as completed since Google Apps Script runs asynchronously and CORS happens on redirection response
        isWebDataSynced = true;
      }
    }

    // Await settings JSON publication sync to the cloud
    let isSettingsSynced = false;
    try {
      const success = await onUpdateSettings({
        ...pengaturan,
        web_config_json: JSON.stringify(configToSave)
      });
      if (success !== false) {
        isSettingsSynced = true;
      }
    } catch (e: any) {
      console.warn("Sinkronisasi pengaturan gagal:", e);
    }

    // Always succeed visually because local changes are 100% saved and loaded correctly
    setWebIsPublished(true);
    setShowPublishSuccessModal(true);
    setWebJsonInput(JSON.stringify(configToSave, null, 2));

    if (isWebDataSynced || isSettingsSynced) {
      showToast("Website berhasil dipublikasikan dan disinkronkan ke Google Spreadsheet!");
    } else {
      showToast("Website berhasil dipublikasikan & disimpan lokal!");
    }
    setIsPublishing(false);
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const success = await onUpdateSettings({
        nama_lembaga: setLembaga,
        nama_pimpinan: setPimpinan,
        alamat: setAlamat,
        telepon: setTelepon,
        email: setEmail,
        website: setWebsite,
        logo: logoInp,
        link_wa: waRows,
        pengumuman: setPengumumanInp,
        id_drive: idDriveInp,
        link_website: linkWebsiteInp,
        web_config_json: pengaturan.web_config_json
      });
      if (success !== false) {
        showToast('Pengaturan Institusi berhasil disimpan secara aman!');
      } else {
        showToast('Profil berhasil disimpan di sistem lokal!');
      }
    } catch (e: any) {
      showToast(`Gagal menyimpan: ${e.message || "Kesalahan jaringan"}`);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Helper lists
  const studentsInClass = (className: string) => {
    return santriList.filter(s => s.halaqah === className);
  };

  const handleKenaikanCheckAll = (checked: boolean, classAsal: string) => {
    if (checked) {
      const ids = studentsInClass(classAsal).map(s => s.id_santri);
      setKenaikanSelectedIds(ids);
    } else {
      setKenaikanSelectedIds([]);
    }
  };

  const handleKenaikanCheckSingle = (id: string, checked: boolean) => {
    if (checked) {
      setKenaikanSelectedIds([...kenaikanSelectedIds, id]);
    } else {
      setKenaikanSelectedIds(kenaikanSelectedIds.filter(x => x !== id));
    }
  };

  const executeKenaikanKelas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kenaikanAsal || !kenaikanTujuan) {
      alert('Tentukan Kelas Asal & Tujuan!');
      return;
    }
    if (kenaikanAsal === kenaikanTujuan) {
      alert('Kelas asal dan tujuan tidak boleh sama!');
      return;
    }
    if (kenaikanSelectedIds.length === 0) {
      alert('Silakan pilih minimal 1 santri!');
      return;
    }

    kenaikanSelectedIds.forEach(id => {
      const studentObj = santriList.find(s => s.id_santri === id);
      if (studentObj) {
        onUpdateSantri({
          ...studentObj,
          halaqah: kenaikanTujuan
        });
      }
    });

    setShowKenaikanModal(false);
    setKenaikanSelectedIds([]);
    showToast(`Mutasi kelas berhasil! ${kenaikanSelectedIds.length} santri dipindah ke kelas ${kenaikanTujuan}`);
  };

  const [showInputForm, setShowInputForm] = useState(false);

  // Setoran Submission
  const submitSetoranData = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    if (!inpSantriId && !(jenisInput === 'informasi' && infoTipe === 'Bulanan')) {
      alert('Harap pilih santri!');
      return;
    }

    const matchedSType = santriList.find(s => s.id_santri === inpSantriId);
    if (!matchedSType && !(jenisInput === 'informasi' && infoTipe === 'Bulanan')) return;

    if (['hafalan', 'tilawah', 'hadits'].includes(jenisInput)) {
      if (myMataPelajaranList.length === 0) {
        alert('⚠️ PERHATIAN:\n\nAkun Anda belum merekam Mata Pelajaran / Kurikulum sama sekali. Silakan buat rekaman mata pelajaran terlebih dahulu di menu "Kurikulum Kelas" sebelum menginput data Tahfidz, Tilawah, atau Hafalan.');
        return;
      }
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1500);

    if (jenisInput === 'pembayaran') {
      onAddPembayaran({
        tanggal: getLocalDateString(),
        id_santri: inpSantriId,
        nama_santri: matchedSType!.nama_santri,
        kategori: payKategori,
        nominal: parseInt(payNominal) || 0,
        status: payStatus,
        catatan: payCatatan
      });
      setPayKategori('');
      setPayNominal('');
      setPayCatatan('');
      setShowInputForm(false);
      setIsFormVisible(false);
      showToast('Kwitansi Pembayaran Berhasil Disimpan!');
    } else if (jenisInput === 'mutabaah') {
      onAddMutabaah({
        tanggal: getLocalDateString(),
        id_santri: inpSantriId,
        nama_santri: matchedSType!.nama_santri,
        subuh: mutSubuh,
        dzuhur: mutDzuhur,
        ashar: mutAshar,
        maghrib: mutMaghrib,
        isya: mutIsya,
        dhuha: mutDhuha,
        tilawah: mutTilawah,
        catatan: inpCatatan
      });
      setInpCatatan('');
      setMutTilawah('');
      setShowInputForm(false);
      setIsFormVisible(false);
      showToast('Log Mutabaah Santri Berhasil Disimpan!');
    } else if (jenisInput === 'tabungan') {
      onAddTabungan({
        id_santri: inpSantriId,
        nama_santri: matchedSType!.nama_santri,
        nominal: parseInt(tabNominal) || 0,
        tanggal: getLocalDateString()
      });
      setTabNominal('');
      setShowInputForm(false);
      setIsFormVisible(false);
      showToast('Setor Tabungan Berhasil Disimpan!');
    } else if (jenisInput === 'informasi') {
      let targetIds: string[] = [];
      let sName = '';

      if (infoTipe === 'Manual') {
        targetIds = [inpSantriId];
        sName = matchedSType ? matchedSType.nama_santri : '';
      } else {
        const currentMonth = getLocalDateMonthString();
        const sudahBayarIds = pembayaranList
          .filter(p => p.status === 'Lunas' && p.tanggal.startsWith(currentMonth))
          .map(p => p.id_santri);
        targetIds = santriList.filter(s => !sudahBayarIds.includes(s.id_santri)).map(s => s.id_santri);
      }

      onAddInformasi({
        tipe: infoTipe,
        tanggal: getLocalDateString(),
        terbaca_oleh: [],
        pesan: infoPesan,
        id_santri: infoTipe === 'Manual' ? inpSantriId : undefined,
        nama_santri: infoTipe === 'Manual' ? sName : undefined,
        target_id_santri: targetIds
      });
      setInfoPesan('');
      setShowInputForm(false);
      setIsFormVisible(false);
      showToast('Notifikasi broadcast berhasil dikirim!');
    } else {
      const finalCatatan = (jenisInput === 'hafalan' && inpMetodeQuran)
        ? `[Metode: ${inpMetodeQuran}] ${inpCatatan}`.trim()
        : inpCatatan;

      onAddSetoran({
        tanggal: getLocalDateString(),
        id_santri: inpSantriId,
        nama_santri: matchedSType!.nama_santri,
        surah: jenisInput === 'hafalan' ? inpSurah : '-',
        ayat: jenisInput === 'hafalan' ? inpAyat : '-',
        tilawah: jenisInput === 'tilawah' ? inpTilawah : '-',
        halaman: jenisInput === 'tilawah' ? (inpTilawahHalaman || '-') : '-',
        hadits: jenisInput === 'hadits' ? inpHadits : '-',
        kualitas: inpKualitas,
        catatan: finalCatatan
      });
      setInpSurah('');
      setInpAyat('');
      setInpTilawah('');
      setInpTilawahDropdown('');
      setInpTilawahHalaman('');
      setInpHadits('');
      setInpHaditsDropdown('');
      setInpMetodeQuran('');
      setInpKualitas('Mumtaz');
      setInpCatatan('');
      setShowInputForm(false);
      setIsFormVisible(false);
      showToast('Setoran Laporan Berhasil Ditambahkan!');
    }
  };

  // Edit Setoran Modal Submission
  const submitEditSetoran = (e: React.FormEvent) => {
    e.preventDefault();
    if (editSetoranItem) {
      onUpdateSetoran(editSetoranItem);
      setEditSetoranItem(null);
      showToast('Laporan setoran berhasil diperbarui!');
    }
  };

  // Edit Pembayaran Modal Submission
  const submitEditPembayaran = (e: React.FormEvent) => {
    e.preventDefault();
    if (editPembayaranItem) {
      onUpdatePembayaran(editPembayaranItem);
      setEditPembayaranItem(null);
      showToast('Status pembayaran berhasil disimpan!');
    }
  };

  // Edit Tabungan Modal Submission
  const submitEditTabungan = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTabunganItem && onUpdateTabungan) {
      onUpdateTabungan(editTabunganItem);
      setEditTabunganItem(null);
      showToast('Data tabungan berhasil diperbarui!');
    }
  };

  // Edit Informasi Modal Submission
  const submitEditInformasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (editInformasiItem && onUpdateInformasi) {
      onUpdateInformasi(editInformasiItem);
      setEditInformasiItem(null);
      showToast('Informasi khusus berhasil diperbarui!');
    }
  };

  // Edit Mutabaah Modal Submission
  const submitEditMutabaah = (e: React.FormEvent) => {
    e.preventDefault();
    if (editMutabaahItem && onUpdateMutabaah) {
      onUpdateMutabaah(editMutabaahItem);
      setEditMutabaahItem(null);
      showToast('Diary mutabaah berhasil diperbarui!');
    }
  };

  const submitTabunganData = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    if (!tabSantriId) {
      alert('Harap pilih santri!');
      return;
    }
    const targetSantriObj = santriList.find(s => s.id_santri === tabSantriId);
    if (!targetSantriObj) return;

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1500);

    onAddTabungan({
      id_santri: tabSantriId,
      nama_santri: targetSantriObj.nama_santri,
      nominal: parseInt(tabNominal) || 0,
      tanggal: getLocalDateString()
    });

    setTabNominal('');
    showToast('Setor Tabungan Berhasil Disimpan!');
  };

  const submitInformasiMassa = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    if (infoTipe === 'Manual' && !infoSantriId) {
      alert('Harap pilih santri untuk pesan manual!');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1500);

    let targetIds: string[] = [];
    let sName = '';

    if (infoTipe === 'Manual') {
      targetIds = [infoSantriId];
      const found = santriList.find(s => s.id_santri === infoSantriId);
      sName = found ? found.nama_santri : '';
    } else {
      // Bulanan / Tunggakan auto-pull
      const currentMonth = getLocalDateMonthString();
      const sudahBayarIds = pembayaranList
        .filter(p => p.status === 'Lunas' && p.tanggal.startsWith(currentMonth))
        .map(p => p.id_santri);
      targetIds = santriList.filter(s => !sudahBayarIds.includes(s.id_santri)).map(s => s.id_santri);
    }

    onAddInformasi({
      tipe: infoTipe,
      tanggal: getLocalDateString(),
      terbaca_oleh: [],
      pesan: infoPesan,
      id_santri: infoTipe === 'Manual' ? infoSantriId : undefined,
      nama_santri: infoTipe === 'Manual' ? sName : undefined,
      target_id_santri: targetIds
    });

    setInfoPesan('');
    showToast('Notifikasi broadcast teriklan dikirim!');
  };

  // Helper to convert an image URL to a base64 PNG with customizable opacity
  const getWatermarkImage = (url: string, opacity: number): Promise<string> => {
    return new Promise((resolve) => {
      if (!url) {
        resolve('');
        return;
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width || 300;
          canvas.height = img.naturalHeight || img.height || 300;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = opacity;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/png'));
          } else {
            resolve(url);
          }
        } catch (e) {
          console.warn('Gagal merender logo transparan:', e);
          resolve(url); // fallback to original url if canvas fails
        }
      };
      img.onerror = () => {
        console.warn('Gagal memuat URL logo:', url);
        resolve(''); // resolve empty if load fails
      };
      img.src = url;
    });
  };

  // PDF receipt creation via jspdf autoloader
  const printReceipt = (p: Pembayaran) => {
    if ((window as any).jspdf) {
      const { jsPDF } = (window as any).jspdf;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [100, 150] });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(pengaturan.nama_lembaga.toUpperCase(), 50, 12, { align: 'center' });
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("Kwitansi Penerimaan Pembayaran", 50, 18, { align: 'center' });
      doc.line(10, 22, 90, 22);

      doc.text(`Kwitansi ID: ${p.id_pembayaran}`, 12, 30);
      doc.text(`Tanggal: ${formatTanggal(p.tanggal)}`, 12, 36);
      doc.text(`Nama Santri: ${p.nama_santri}`, 12, 42);
      doc.text(`Perihal: ${p.kategori}`, 12, 48);
      doc.text(`Satus: ${p.status.toUpperCase()}`, 12, 54);

      doc.line(10, 60, 90, 60);
      doc.setFont("helvetica", "bold");
      doc.text(`TOTAL BAYAR: ${formatRupiah(p.nominal)}`, 12, 68);

      doc.setFont("helvetica", "italic");
      doc.setFontSize(7);
      doc.text(`Ket: ${p.catatan || '-'}`, 12, 75);

      doc.setFont("helvetica", "normal");
      doc.text("Penerima,", 70, 95);
      doc.text(p.nama_admin || 'Staf Admin', 70, 115);

      doc.save(`Kwitansi_${p.nama_santri.replace(/\s+/g, '_')}.pdf`);
      showToast('Kwitansi PDF didownload!');
    } else {
      alert("Pustaka Cetak PDF sedang dipasang di peramban, harap coba lagi!");
    }
  };

  // Certificate printing Syahadah PDF
  const printCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForCert) return;

    if ((window as any).jspdf) {
      showToast('Sedang membuat Syahadah kelulusan...');
      const { jsPDF } = (window as any).jspdf;
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      // Load logo images
      let watermarkBase64 = '';
      let headerLogoBase64 = '';
      if (pengaturan.logo) {
        try {
          watermarkBase64 = await getWatermarkImage(pengaturan.logo, 0.08); // 8% opacity watermark
          headerLogoBase64 = await getWatermarkImage(pengaturan.logo, 0.95); // High opacity header
        } catch (err) {
          console.warn("Could not load logo for PDF rendering:", err);
        }
      }

      // Elegant parchment style light sand/cream background
      doc.setFillColor(255, 255, 252);
      doc.rect(0, 0, 297, 210, 'F');

      // Luxurious double frame: Gold outer, Teal inner
      doc.setDrawColor(218, 165, 32); // Gold
      doc.setLineWidth(2.5);
      doc.rect(8, 8, 281, 194);

      doc.setDrawColor(241, 196, 15); // Light Gold thin inner secondary border
      doc.setLineWidth(0.6);
      doc.rect(10.5, 10.5, 276, 189);

      doc.setDrawColor(2, 132, 199); // Teal elegant inner border
      doc.setLineWidth(1.2);
      doc.rect(14, 14, 269, 182);

      // Elegant Corner decorations in gold/teal
      const drawCorners = () => {
        doc.setFillColor(2, 132, 199);
        // Top-left corner box
        doc.rect(13.2, 13.2, 3.5, 3.5, 'F');
        // Top-right corner box
        doc.rect(280.3, 13.2, 3.5, 3.5, 'F');
        // Bottom-left corner box
        doc.rect(13.2, 193.3, 3.5, 3.5, 'F');
        // Bottom-right corner box
        doc.rect(280.3, 193.3, 3.5, 3.5, 'F');
      };
      drawCorners();

      // Draw Center Watermark Logo
      if (watermarkBase64) {
        try {
          doc.addImage(watermarkBase64, 'PNG', 106, 62, 85, 85);
        } catch (err) {
          console.warn("Error drawing watermark image:", err);
        }
      }

      // Draw Header Logo
      if (headerLogoBase64) {
        try {
          doc.addImage(headerLogoBase64, 'PNG', 137.5, 18, 22, 22);
        } catch (err) {
          console.warn("Error drawing header logo:", err);
        }
      }

      // Headline - Institusi
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(2, 132, 199); // Teal
      doc.text(pengaturan.nama_lembaga.toUpperCase(), 148.5, 47, { align: 'center' });

      doc.setFontSize(9.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(pengaturan.alamat || '', 148.5, 52, { align: 'center' });

      // Premium Divider line
      doc.setDrawColor(218, 165, 32);
      doc.setLineWidth(0.5);
      doc.line(100, 56, 197, 56);

      // Main Title
      doc.setFont("times", "bold");
      doc.setFontSize(26);
      doc.setTextColor(30, 41, 59); // deep slate
      doc.text("SYAHADAH KELULUSAN", 148.5, 68, { align: 'center' });

      doc.setFont("helvetica", "italic");
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139); // slate-light
      doc.text("Pemberian piagam penghargaan tertinggi ini didedikasikan kepada:", 148.5, 78, { align: 'center' });

      // Student Name with massive luxury serif font
      doc.setFont("times", "bolditalic");
      doc.setFontSize(30);
      doc.setTextColor(2, 132, 199); // Emerald teal
      doc.text(selectedStudentForCert.nama_santri, 148.5, 96, { align: 'center' });

      // Elegant base line
      doc.setDrawColor(2, 132, 199);
      doc.setLineWidth(0.8);
      doc.line(65, 100, 232, 100);

      // NIS & Program
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Nomor Induk Santri: ${selectedStudentForCert.nis || '-'}   |   Program Pembelajaran: ${selectedStudentForCert.halaqah}`, 148.5, 107, { align: 'center' });

      // Predikat Kelulusan
      doc.setFont("helvetica", "medium");
      doc.setFontSize(12);
      doc.setTextColor(47, 55, 65);
      doc.text("Dinyatakan LULUS dengan Predikat Akademik:", 148.5, 122, { align: 'center' });

      doc.setFont("times", "bold");
      doc.setFontSize(22);
      doc.setTextColor(184, 134, 11); // Dark Goldenrod
      doc.text(`"${certPenghargaan.toUpperCase()}"`, 148.5, 134, { align: 'center' });

      // Quran quote
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`"Sebaik-baiknya kamu adalah orang yang mempelajari Al-Qur'an dan mengamalkannya" (HR. Bukhari)`, 148.5, 150, { align: 'center' });

      // Signatures
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);

      const localDateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

      // Extract district location from alamat (look for kecamatan or kec.)
      let customLocation = "Jakarta";
      if (pengaturan.alamat) {
        const addressLower = pengaturan.alamat.toLowerCase();
        const kecIndex = addressLower.indexOf("kecamatan");
        if (kecIndex !== -1) {
          const suffix = pengaturan.alamat.substring(kecIndex + "kecamatan".length).trim();
          const commaParts = suffix.split(',');
          if (commaParts.length > 0) {
            const rawDistrict = commaParts[0].trim();
            const words = rawDistrict.split(/\s+/).filter(Boolean);
            if (words.length > 0) {
              customLocation = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
            }
          }
        } else {
          const kecShortIndex = addressLower.indexOf("kec.");
          if (kecShortIndex !== -1) {
            const suffix = pengaturan.alamat.substring(kecShortIndex + "kec.".length).trim();
            const commaParts = suffix.split(',');
            if (commaParts.length > 0) {
              const rawDistrict = commaParts[0].trim();
              const words = rawDistrict.split(/\s+/).filter(Boolean);
              if (words.length > 0) {
                customLocation = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
              }
            }
          }
        }
      }

      // Left Signature: Mudir
      doc.text(`${customLocation}, ${localDateStr}`, 65, 163, { align: 'center' });
      doc.text("Mendir/Mudir Lembaga", 65, 168, { align: 'center' });
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.line(35, 189, 95, 189);
      doc.setFont("helvetica", "bold");
      doc.text(pengaturan.nama_pimpinan, 65, 193, { align: 'center' });

      // Right Signature: Wali Kelas
      doc.setFont("helvetica", "normal");
      doc.text(`Disetujui Oleh,`, 232, 163, { align: 'center' });
      doc.text(`Wali Halaqah ${selectedStudentForCert.halaqah}`, 232, 168, { align: 'center' });
      doc.line(202, 189, 262, 189);
      doc.setFont("helvetica", "bold");
      doc.text(certWaliHalaqah || "Ustadz/Ustadzah Penguji", 232, 193, { align: 'center' });

      // Save PDF
      doc.save(`Syahadah_${selectedStudentForCert.nama_santri.replace(/\s+/g, '_')}.pdf`);
      setSelectedStudentForCert(null);
      setCertPenghargaan('');
      setCertWaliHalaqah('');
      showToast('Syahadah kelulusan PDF berhasil diunduh!');
    }
  };

  // Rapor PDF download - Redesigned with premium letterhead, watermark background & dual-signatures
  const downloadRaporPdf = async (santri: Santri) => {
    if ((window as any).jspdf) {
      showToast('Menyiapkan Rapor Prestasi Santri...');
      const { jsPDF } = (window as any).jspdf;
      const doc = new jsPDF();

      // Load logo images
      let watermarkBase64 = '';
      let headerLogoBase64 = '';
      if (pengaturan.logo) {
        try {
          watermarkBase64 = await getWatermarkImage(pengaturan.logo, 0.06); // 6% opacity watermark for clean text readability
          headerLogoBase64 = await getWatermarkImage(pengaturan.logo, 0.90); // header opacity logo
        } catch (err) {
          console.warn("Could not load logo for Rapor PDF:", err);
        }
      }

      // Draw Background Watermark in Center
      if (watermarkBase64) {
        try {
          doc.addImage(watermarkBase64, 'PNG', 62.5, 106, 85, 85);
        } catch (err) {
          console.warn("Error drawing background watermark in Raport:", err);
        }
      }

      // Draw Top-Left Professional Header Logo
      if (headerLogoBase64) {
        try {
          doc.addImage(headerLogoBase64, 'PNG', 14, 12, 18, 18);
        } catch (err) {
          console.warn("Error drawing header logo in Raport:", err);
        }
      }

      // Professional Letterhead Layout
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(30, 41, 59); // deep slate
      doc.text("RAPOR PRESTASI BELAJAR SANTRI DIGITAL", 36, 17);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(2, 132, 199); // emerald teal
      doc.text(pengaturan.nama_lembaga.toUpperCase(), 36, 22);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139); // cool gray
      doc.text(`${pengaturan.alamat || 'Alamat Lembaga'} | Telp: ${pengaturan.telepon || '-'} | Email: ${pengaturan.email || '-'}`, 36, 27);

      // Clean double line divider
      doc.setDrawColor(2, 132, 199);
      doc.setLineWidth(0.8);
      doc.line(14, 32, 196, 32);

      doc.setDrawColor(218, 165, 32); // gold highlight line
      doc.setLineWidth(0.3);
      doc.line(14, 33.5, 196, 33.5);

      // Student Info Box in 2-Column Grid
      doc.setFillColor(248, 250, 252); // light slate background block
      doc.rect(14, 38, 182, 24, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.rect(14, 38, 182, 24);

      // Student details text
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.setFont("helvetica", "bold");
      doc.text("DATA PESERTA DIDIK (SANTRI)", 18, 43);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      // Column 1
      doc.text(`1. Nama Lengkap  : ${santri.nama_santri.toUpperCase()}`, 18, 49);
      doc.text(`2. Nomor Induk     : ${santri.nis || '-'}`, 18, 54);

      // Column 2
      doc.text(`3. Halaqah / Kelas  : Halaqah ${santri.halaqah}`, 115, 49);
      doc.text(`4. Capaian Hafalan : ${santri.jumlah_hafalan || '0 Juz / Surat'}  (Murojaah: ${santri.murojaah || '-'})`, 115, 54);

      // setoran logs table format
      const clientSetorans = [...setoranList.filter(s => s.id_santri === santri.id_santri)].sort((a, b) => b.tanggal.localeCompare(a.tanggal));
      const bodyData = clientSetorans.map((s, idx) => {
        const kSurah = s.kualitas_surah || (s.kualitas && !s.kualitas.includes('|') && !s.kualitas.includes(':') ? s.kualitas : '') || 'Mumtaz';
        const kTilawah = s.kualitas_tilawah || (s.kualitas && !s.kualitas.includes('|') && !s.kualitas.includes(':') ? s.kualitas : '') || 'Mumtaz';
        const kHadits = s.kualitas_hadits || (s.kualitas && !s.kualitas.includes('|') && !s.kualitas.includes(':') ? s.kualitas : '') || 'Mumtaz';

        const tahfidzVal = s.surah !== '-'
          ? `${s.surah}\nAyat ${s.ayat}\n[${kSurah}]`
          : '-';

        const tilawahVal = s.tilawah !== '-'
          ? `${s.tilawah}\nHalaman: ${s.halaman || '-'}\n[${kTilawah}]`
          : '-';

        const hafalanVal = s.hadits !== '-'
          ? `${s.hadits}\n[${kHadits}]`
          : '-';

        return [
          String(idx + 1),
          formatTanggal(s.tanggal),
          tahfidzVal,
          tilawahVal,
          hafalanVal
        ];
      });

      if (doc.autoTable) {
        doc.autoTable({
          head: [['No', 'Tanggal', 'Tahfidz', 'Tilawah / Pages', 'Hafalan']],
          body: bodyData,
          startY: 68,
          theme: 'striped',
          styles: { fontSize: 8, cellPadding: 2.5 },
          headStyles: { fillColor: [2, 132, 199], textColor: [255, 255, 255], fontStyle: 'bold' },
          columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 22, halign: 'center' },
            2: { cellWidth: 50 },
            3: { cellWidth: 50 },
            4: { cellWidth: 50 }
          },
          margin: { left: 14, right: 14 }
        });
      } else {
        doc.setFont("helvetica", "bold");
        doc.text("RIWAYAT LAPORAN DAN EVALUASI:", 14, 72);
        let curY = 78;
        clientSetorans.forEach((row, i) => {
          doc.setFont("helvetica", "normal");
          const mText = row.surah !== '-' ? row.surah : row.tilawah !== '-' ? row.tilawah : row.hadits;
          doc.text(`${i + 1}. ${formatTanggal(row.tanggal)} | ${mText} | Predikat: ${row.kualitas}`, 14, curY);
          curY += 6;
        });
      }

      // Elegant Signatures bottom section
      const finalY = doc.autoTable ? Math.max(doc.lastAutoTable.finalY + 15, 180) : 180;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);

      const localDateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

      // Extract district location from alamat (look for kecamatan or kec.)
      let customLocation = "Jakarta";
      if (pengaturan.alamat) {
        const addressLower = pengaturan.alamat.toLowerCase();
        const kecIndex = addressLower.indexOf("kecamatan");
        if (kecIndex !== -1) {
          const suffix = pengaturan.alamat.substring(kecIndex + "kecamatan".length).trim();
          const commaParts = suffix.split(',');
          if (commaParts.length > 0) {
            const rawDistrict = commaParts[0].trim();
            const words = rawDistrict.split(/\s+/).filter(Boolean);
            if (words.length > 0) {
              customLocation = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
            }
          }
        } else {
          const kecShortIndex = addressLower.indexOf("kec.");
          if (kecShortIndex !== -1) {
            const suffix = pengaturan.alamat.substring(kecShortIndex + "kec.".length).trim();
            const commaParts = suffix.split(',');
            if (commaParts.length > 0) {
              const rawDistrict = commaParts[0].trim();
              const words = rawDistrict.split(/\s+/).filter(Boolean);
              if (words.length > 0) {
                customLocation = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
              }
            }
          }
        }
      }

      // Left signature - Wali / Orang tua (Symmetrically centered at X=45)
      doc.text("Mengetahui,", 45, finalY, { align: 'center' });
      doc.text("Orang Tua / Wali Santri,", 45, finalY + 5, { align: 'center' });
      doc.line(15, finalY + 28, 75, finalY + 28);
      doc.text("(................................................)", 45, finalY + 32, { align: 'center' });

      // Right signature - Mudir (Symmetrically centered at X=165)
      doc.text(`${customLocation}, ${localDateStr}`, 165, finalY, { align: 'center' });
      doc.text("Mudir / Pimpinan TPQ,", 165, finalY + 5, { align: 'center' });
      doc.line(135, finalY + 28, 195, finalY + 28);
      doc.setFont("helvetica", "bold");
      doc.text(pengaturan.nama_pimpinan, 165, finalY + 32, { align: 'center' });

      // Save PDF
      doc.save(`Rapor_${santri.nama_santri.replace(/\s+/g, '_')}.pdf`);
      setSelectedStudentForRapor(null);
      showToast('Rapor Digital PDF sukses diunduh!');
    }
  };

  // Helper to format Date to Indonesian Full Day, Date Month Year for dynamic Official undangan papers
  const formatIndonesianFullDate = (dateStr: string) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return dateStr;
    const days = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${days[dateObj.getDay()]}, ${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
  };

  const downloadUndanganPdf = async (santri: Santri, customTema: string, customTanggal: string, customWaktu: string, customTempat: string, customReceiver: string, customSekretaris: string) => {
    if ((window as any).jspdf) {
      showToast('Menyiapkan Surat Undangan Resmi...');
      const { jsPDF } = (window as any).jspdf;
      const doc = new jsPDF();

      // Load logo images
      let watermarkBase64 = '';
      let headerLogoBase64 = '';
      if (pengaturan.logo) {
        try {
          watermarkBase64 = await getWatermarkImage(pengaturan.logo, 0.05); // 5% opacity watermark
          headerLogoBase64 = await getWatermarkImage(pengaturan.logo, 0.90); // 90% opacity logo for header
        } catch (err) {
          console.warn("Could not load logo for invitation PDF:", err);
        }
      }

      // Draw Background Watermark in Center of Invitation
      if (watermarkBase64) {
        try {
          doc.addImage(watermarkBase64, 'PNG', 62.5, 106, 85, 85);
        } catch (err) {
          console.warn("Error drawing watermark in invitation:", err);
        }
      }

      // Draw Top-Left Professional Header Logo
      if (headerLogoBase64) {
        try {
          doc.addImage(headerLogoBase64, 'PNG', 14, 12, 18, 18);
        } catch (err) {
          console.warn("Error drawing header logo in invitation:", err);
        }
      }

      // Professional Elegant Letterhead Layout (Kop Surat Resmi)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(30, 41, 59); // deep slate
      doc.text("SURAT UNDANGAN RESMI WALI SANTRI", 36, 17);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(2, 132, 199); // emerald teal
      doc.text(pengaturan.nama_lembaga.toUpperCase(), 36, 22);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139); // cool gray
      doc.text(`${pengaturan.alamat || 'Alamat Lembaga'} | Telp: ${pengaturan.telepon || '-'} | Email: ${pengaturan.email || '-'}`, 36, 27);

      // Clean double line divider
      doc.setDrawColor(2, 132, 199);
      doc.setLineWidth(0.8);
      doc.line(14, 32, 196, 32);

      doc.setDrawColor(218, 165, 32); // gold highlight line
      doc.setLineWidth(0.3);
      doc.line(14, 33.5, 196, 33.5);

      // Letter Metadata (Nomor, Lampiran, Perihal)
      const currentYear = new Date().getFullYear();
      const currentMonthRoman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][new Date().getMonth()];
      const randomNo = Math.floor(100 + Math.random() * 900);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);

      doc.text(`Nomor      : ${randomNo}/${pengaturan.nama_lembaga.replace(/\s+/g, '-').toUpperCase()}/${currentMonthRoman}/${currentYear}`, 14, 45);
      doc.text("Lampiran   : -", 14, 50);
      doc.text("Perihal       : Undangan Resmi Orang Tua / Wali Santri", 14, 55);

      // Extract location for date line
      let customLocation = "Jakarta";
      if (pengaturan.alamat) {
        const addressLower = pengaturan.alamat.toLowerCase();
        const kecIndex = addressLower.indexOf("kecamatan");
        if (kecIndex !== -1) {
          const suffix = pengaturan.alamat.substring(kecIndex + "kecamatan".length).trim();
          const commaParts = suffix.split(',');
          if (commaParts.length > 0) {
            const rawDistrict = commaParts[0].trim();
            const words = rawDistrict.split(/\s+/).filter(Boolean);
            if (words.length > 0) {
              customLocation = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
            }
          }
        }
      }

      const localDateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      doc.text(`${customLocation}, ${localDateStr}`, 196, 45, { align: 'right' });

      // Recipient Address Block (Yth. Bapak/Ibu Wali Murid)
      doc.setFont("helvetica", "bold");
      doc.text("Kepada Yang Terhormat,", 14, 68);
      doc.text(customReceiver || `Bapak / Ibu Wali dari ${santri.nama_santri}`, 14, 73);
      doc.setFont("helvetica", "normal");
      doc.text("di Tempat", 14, 78);

      // Opening/Greeting
      doc.setFont("helvetica", "bold");
      doc.text("Assalamu'alaikum Warahmatullahi Wabarakatuh,", 14, 91);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      // Paragraph text
      const introText = `Dengan puji syukur kehadirat Allah SWT serta shalawat dan salam atas Rasulullah SAW. Semoga Bapak/Ibu sekalian senantiasa dalam limpahan kesehatan dan kebaikan. Sehubungan dengan program peningkatan mutu pendidikan Al-Qur'an dan kelancaran kegiatan santri di lingkungan ${pengaturan.nama_lembaga || 'Lembaga Pendidikan'}, kami mengharapkan kehadiran Bapak/Ibu Orang Tua/Wali Santri dalam acara yang insya Allah akan dilaksanakan pada:`;

      const linesIntro = doc.splitTextToSize(introText, 180);
      doc.text(linesIntro, 14, 97);

      // Event Details Box - Styled like official table
      const detailsStartY = 97 + (linesIntro.length * 4.5);

      doc.setFillColor(248, 250, 252); // light slate background block
      doc.rect(14, detailsStartY, 182, 38, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.rect(14, detailsStartY, 182, 38);

      doc.setFont("helvetica", "bold");
      doc.text("Rincian Agenda Kegiatan / Undangan:", 20, detailsStartY + 6);

      doc.setFont("helvetica", "normal");
      doc.text("Hari, Tanggal   :", 20, detailsStartY + 14);
      doc.setFont("helvetica", "bold");
      doc.text(formatIndonesianFullDate(customTanggal), 55, detailsStartY + 14);

      doc.setFont("helvetica", "normal");
      doc.text("Waktu                 :", 20, detailsStartY + 21);
      doc.setFont("helvetica", "bold");
      doc.text(customWaktu, 55, detailsStartY + 21);

      doc.setFont("helvetica", "normal");
      doc.text("Tempat               :", 20, detailsStartY + 28);
      doc.setFont("helvetica", "bold");
      doc.text(customTempat, 55, detailsStartY + 28);

      doc.setFont("helvetica", "normal");
      doc.text("Tema Acara       :", 20, detailsStartY + 35);
      doc.setFont("helvetica", "bold");
      doc.text(customTema, 55, detailsStartY + 35);

      // Closing Statement
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const outroText = "Demi kelancaran dan penyelarasan program belajar-mengajar santri tercinta, kehadiran Bapak/Ibu Orang Tua / Wali sangatlah kami harapkan tepat pada waktunya. Demikian surat undangan resmi ini kami sampaikan, atas perhatian dan kesediaan untuk meluangkan waktu kami haturkan Jazaakumullahu Khairan Katsiran.";
      const linesOutro = doc.splitTextToSize(outroText, 180);
      doc.text(linesOutro, 14, detailsStartY + 45);

      const outroTextGreeting = "Wassalamu'alaikum Warahmatullahi Wabarakatuh.";
      doc.setFont("helvetica", "bold");
      doc.text(outroTextGreeting, 14, detailsStartY + 45 + (linesOutro.length * 4.5) + 4);

      // Footer - Signatures Section
      const signY = detailsStartY + 45 + (linesOutro.length * 4.5) + 18;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      // Left Side: Sekretariat / Pengurus
      doc.text("Mengetahui,", 40, signY, { align: 'center' });
      doc.text("Sekretaris Yayasan / Lembaga,", 40, signY + 5, { align: 'center' });
      doc.line(15, signY + 28, 65, signY + 28);
      doc.setFont("helvetica", "bold");
      doc.text(customSekretaris || "Ust. Sekretaris Lembaga", 40, signY + 32, { align: 'center' });

      // Right Side: Pimpinan Pondok / Kepala TPQ
      doc.setFont("helvetica", "normal");
      doc.text("Hormat Kami,", 165, signY, { align: 'center' });
      doc.text("Kepala / Pimpinan Lembaga,", 165, signY + 5, { align: 'center' });
      doc.line(140, signY + 28, 190, signY + 28);
      doc.setFont("helvetica", "bold");
      doc.text(pengaturan.nama_pimpinan || "KH. Mudir Al-Hafidz", 165, signY + 32, { align: 'center' });

      // Save the Invitation PDF
      const formattedFileName = `Undangan_${santri.nama_santri.replace(/\s+/g, '_')}.pdf`;
      doc.save(formattedFileName);
      setSelectedStudentForInv(null);
      showToast('Surat Undangan Resmi PDF berhasil diunduh!');
    }
  };

  // ==================== KORAN TABUNGAN EXPORTS ====================
  const downloadTabunganPdf = async (customSignatoryName?: string) => {
    if ((window as any).jspdf) {
      showToast('Menyiapkan Laporan Tabungan PDF...');
      const { jsPDF } = (window as any).jspdf;
      const doc = new jsPDF();

      // Load logo images
      let watermarkBase64 = '';
      let headerLogoBase64 = '';
      if (pengaturan.logo) {
        try {
          watermarkBase64 = await getWatermarkImage(pengaturan.logo, 0.06);
          headerLogoBase64 = await getWatermarkImage(pengaturan.logo, 0.90);
        } catch (err) {
          console.warn("Could not load logo:", err);
        }
      }

      // Draw Background Watermark in Center
      if (watermarkBase64) {
        try {
          doc.addImage(watermarkBase64, 'PNG', 62.5, 106, 85, 85);
        } catch (err) { }
      }

      // Draw Header Logo
      if (headerLogoBase64) {
        try {
          doc.addImage(headerLogoBase64, 'PNG', 14, 12, 18, 18);
        } catch (err) { }
      }

      // Professional Letterhead Layout
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(30, 41, 59);
      doc.text("LAPORAN REKAP TABUNGAN SANTRI", 36, 17);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(2, 132, 199);
      doc.text(pengaturan.nama_lembaga.toUpperCase(), 36, 22);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`${pengaturan.alamat || 'Alamat Lembaga'} | Telp: ${pengaturan.telepon || '-'} | Email: ${pengaturan.email || '-'}`, 36, 27);

      // Double line divider
      doc.setDrawColor(2, 132, 199);
      doc.setLineWidth(0.8);
      doc.line(14, 32, 196, 32);

      doc.setDrawColor(218, 165, 32);
      doc.setLineWidth(0.3);
      doc.line(14, 33.5, 196, 33.5);

      // Metadata block
      doc.setFillColor(248, 250, 252);
      doc.rect(14, 38, 182, 14, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.rect(14, 38, 182, 14);

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(51, 65, 85);
      doc.text(`KELAS: ${filterTabunganKelas.toUpperCase()}`, 18, 46);

      const targetSantriName = filterTabunganNama === 'Semua' ? 'SEMUA SANTRI' : (santriList.find(s => s.id_santri === filterTabunganNama)?.nama_santri?.toUpperCase() || '-');
      doc.text(`SANTRI: ${targetSantriName}`, 115, 46);

      // Compile rows of the table
      const classStudents = filterTabunganKelas ? studentsInClass(filterTabunganKelas) : [];
      const displayStudents = filterTabunganNama === 'Semua'
        ? classStudents
        : classStudents.filter(s => s.id_santri === filterTabunganNama);

      const tableData: any[] = [];
      let globalCounter = 1;

      displayStudents.forEach(santri => {
        const studentTransactions = tabunganList.filter(t => t.id_santri === santri.id_santri);
        const totalSaldo = studentTransactions.reduce((acc, curr) => acc + curr.nominal, 0);

        if (filterTabunganNama === 'Semua') {
          // Summary rows for all student in class
          tableData.push([
            String(globalCounter++),
            santri.nis || '-',
            santri.nama_santri,
            santri.halaqah,
            String(studentTransactions.length) + ' Transaksi',
            formatRupiah(totalSaldo)
          ]);
        } else {
          // Detailed list of transactions
          studentTransactions.forEach(t => {
            tableData.push([
              String(globalCounter++),
              formatTanggal(t.tanggal),
              santri.nama_santri,
              santri.halaqah,
              'Setoran Tabungan',
              formatRupiah(t.nominal)
            ]);
          });
        }
      });

      const tableHeaders = filterTabunganNama === 'Semua'
        ? ['No', 'NIS', 'Nama Santri', 'Kelas', 'Jumlah Setor', 'Total Saldo Tabungan']
        : ['No', 'Tanggal Transaksi', 'Nama Santri', 'Kelas', 'Keterangan', 'Nominal Setoran'];

      if (doc.autoTable) {
        doc.autoTable({
          head: [tableHeaders],
          body: tableData,
          startY: 58,
          theme: 'striped',
          styles: { fontSize: 8.5, cellPadding: 3 },
          headStyles: { fillColor: [2, 132, 199], textColor: [255, 255, 255], fontStyle: 'bold' },
          columnStyles: {
            0: { width: 12, halign: 'center' },
            5: { halign: 'right', fontStyle: 'bold' }
          }
        });
      }

      // Add a signature block at bottom
      const finalY = doc.previousAutoTable ? doc.previousAutoTable.finalY + 15 : 120;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Mengetahui,", 50, finalY, { align: 'center' });
      doc.text("Kepala / Pimpinan Lembaga,", 50, finalY + 5, { align: 'center' });
      doc.line(20, finalY + 28, 80, finalY + 28);
      doc.setFont("helvetica", "bold");
      doc.text(pengaturan.nama_pimpinan || "Mudir Pondok", 50, finalY + 32, { align: 'center' });

      doc.setFont("helvetica", "normal");
      doc.text("Dibuat Oleh,", 155, finalY, { align: 'center' });
      doc.text("Sekretaris Yayasan,", 155, finalY + 5, { align: 'center' });
      doc.line(125, finalY + 28, 185, finalY + 28);
      doc.setFont("helvetica", "bold");
      doc.text(customSignatoryName || invSekretaris || "Sekretaris Lembaga", 155, finalY + 32, { align: 'center' });

      doc.save(`Laporan_Tabungan_${filterTabunganKelas.replace(/\s+/g, '_')}_${targetSantriName.replace(/\s+/g, '_')}.pdf`);
      showToast('Laporan Tabungan PDF berhasil diunduh!');
    }
  };

  const downloadTabunganExcel = () => {
    const classStudents = filterTabunganKelas ? studentsInClass(filterTabunganKelas) : [];
    const displayStudents = filterTabunganNama === 'Semua'
      ? classStudents
      : classStudents.filter(s => s.id_santri === filterTabunganNama);

    const headers = filterTabunganNama === 'Semua'
      ? ['No', 'NIS', 'Nama Santri', 'Kelas', 'Jumlah Setor', 'Total Saldo Tabungan']
      : ['No', 'Tanggal Transaksi', 'Nama Santri', 'Kelas', 'Keterangan', 'Nominal Setoran'];

    const csvRows = [];
    csvRows.push(`LAPORAN REKAP TABUNGAN SANTRI - ${pengaturan.nama_lembaga.toUpperCase()}`);
    csvRows.push(`Kelas: ${filterTabunganKelas} | Santri: ${filterTabunganNama === 'Semua' ? 'SEMUA SANTRI' : 'DETAIL TRANSKASI'}`);
    csvRows.push('');
    csvRows.push(headers.join(','));

    let globalCounter = 1;
    displayStudents.forEach(santri => {
      const studentTransactions = tabunganList.filter(t => t.id_santri === santri.id_santri);
      const totalSaldo = studentTransactions.reduce((acc, curr) => acc + curr.nominal, 0);

      if (filterTabunganNama === 'Semua') {
        const row = [
          globalCounter++,
          santri.nis || '-',
          `"${santri.nama_santri.replace(/"/g, '""')}"`,
          santri.halaqah,
          `${studentTransactions.length} Transaksi`,
          totalSaldo
        ];
        csvRows.push(row.join(','));
      } else {
        studentTransactions.forEach(t => {
          const row = [
            globalCounter++,
            formatTanggal(t.tanggal),
            `"${santri.nama_santri.replace(/"/g, '""')}"`,
            santri.halaqah,
            'Setoran Tabungan',
            t.nominal
          ];
          csvRows.push(row.join(','));
        });
      }
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.map(e => e).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const targetSantriName = filterTabunganNama === 'Semua' ? 'SEMUA' : (santriList.find(s => s.id_santri === filterTabunganNama)?.nama_santri || '-');
    link.setAttribute("download", `Laporan_Tabungan_${filterTabunganKelas}_${targetSantriName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Laporan Tabungan Excel/CSV berhasil diunduh!');
  };


  // ==================== KORAN KEUANGAN/PEMBAYARAN EXPORTS ====================
  const downloadPembayaranPdf = async (customSignatoryName?: string) => {
    if ((window as any).jspdf) {
      showToast('Menyiapkan Laporan Keuangan SPP PDF...');
      const { jsPDF } = (window as any).jspdf;
      const doc = new jsPDF();

      // Load logo images
      let watermarkBase64 = '';
      let headerLogoBase64 = '';
      if (pengaturan.logo) {
        try {
          watermarkBase64 = await getWatermarkImage(pengaturan.logo, 0.06);
          headerLogoBase64 = await getWatermarkImage(pengaturan.logo, 0.90);
        } catch (err) { }
      }

      // Draw Background Watermark in Center
      if (watermarkBase64) {
        try {
          doc.addImage(watermarkBase64, 'PNG', 62.5, 106, 85, 85);
        } catch (err) { }
      }

      // Draw Header Logo
      if (headerLogoBase64) {
        try {
          doc.addImage(headerLogoBase64, 'PNG', 14, 12, 18, 18);
        } catch (err) { }
      }

      // Professional Letterhead Layout
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(30, 41, 59);
      doc.text("LAPORAN ADMINISTRASI & KEUANGAN SPP", 36, 17);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(2, 132, 199);
      doc.text(pengaturan.nama_lembaga.toUpperCase(), 36, 22);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`${pengaturan.alamat || 'Alamat Lembaga'} | Telp: ${pengaturan.telepon || '-'} | Email: ${pengaturan.email || '-'}`, 36, 27);

      // Double line divider
      doc.setDrawColor(2, 132, 199);
      doc.setLineWidth(0.8);
      doc.line(14, 32, 196, 32);

      doc.setDrawColor(218, 165, 32);
      doc.setLineWidth(0.3);
      doc.line(14, 33.5, 196, 33.5);

      // Metadata block
      doc.setFillColor(248, 250, 252);
      doc.rect(14, 38, 182, 14, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.rect(14, 38, 182, 14);

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(51, 65, 85);
      doc.text(`KELAS: ${filterKeuanganKelas.toUpperCase()}`, 18, 46);

      const targetSantriName = filterKeuanganNama === 'Semua' ? 'SEMUA SANTRI' : (santriList.find(s => s.id_santri === filterKeuanganNama)?.nama_santri?.toUpperCase() || '-');
      doc.text(`SANTRI: ${targetSantriName}`, 115, 46);

      // Compile rows of the table
      const classStudents = filterKeuanganKelas ? studentsInClass(filterKeuanganKelas) : [];
      const displayStudents = filterKeuanganNama === 'Semua'
        ? classStudents
        : classStudents.filter(s => s.id_santri === filterKeuanganNama);

      const tableData: any[] = [];
      let globalCounter = 1;

      displayStudents.forEach(santri => {
        const studentTransactions = pembayaranList.filter(p => p.id_santri === santri.id_santri);

        if (filterKeuanganNama === 'Semua') {
          // Summary per student
          const totalSPP = studentTransactions.reduce((acc, curr) => acc + curr.nominal, 0);

          const currentMonth = getLocalDateMonthString();
          const currentMonthPayments = studentTransactions.filter(p => p.tanggal && p.tanggal.startsWith(currentMonth));

          const hasUnpaidInCurrentMonth = currentMonthPayments.length === 0 || currentMonthPayments.some(p => p.status === 'Belum Bayar');
          const hasUnpaidInPast = studentTransactions.some(p => p.status === 'Belum Bayar');
          const hasUnpaidPayment = hasUnpaidInCurrentMonth || hasUnpaidInPast;

          const hasCicilInCurrentMonth = currentMonthPayments.some(p => p.status === 'Cicil');
          const hasCicilInPast = studentTransactions.some(p => p.status === 'Cicil');
          const hasCicilPayment = !hasUnpaidPayment && (hasCicilInCurrentMonth || hasCicilInPast);

          let statusText = 'LUNAS SEMUA';
          if (hasUnpaidPayment) {
            statusText = 'BELUM BAYAR';
          } else if (hasCicilPayment) {
            statusText = 'CICIL';
          }

          tableData.push([
            String(globalCounter++),
            santri.nis || '-',
            santri.nama_santri,
            santri.halaqah,
            statusText,
            formatRupiah(totalSPP)
          ]);
        } else {
          // Detailed list for single student
          studentTransactions.forEach(p => {
            tableData.push([
              String(globalCounter++),
              formatTanggal(p.tanggal),
              santri.nama_santri,
              p.kategori,
              p.status.toUpperCase(),
              formatRupiah(p.nominal)
            ]);
          });
        }
      });

      const tableHeaders = filterKeuanganNama === 'Semua'
        ? ['No', 'NIS', 'Nama Santri', 'Kelas', 'Status Tagihan', 'Total Nilai Transaksi']
        : ['No', 'Tanggal Input', 'Nama Santri', 'Kategori', 'Status Pembayaran', 'Nominal Tagihan'];

      if (doc.autoTable) {
        doc.autoTable({
          head: [tableHeaders],
          body: tableData,
          startY: 58,
          theme: 'striped',
          styles: { fontSize: 8.5, cellPadding: 3 },
          headStyles: { fillColor: [2, 132, 199], textColor: [255, 255, 255], fontStyle: 'bold' },
          columnStyles: {
            0: { width: 12, halign: 'center' },
            5: { halign: 'right', fontStyle: 'bold' }
          }
        });
      }

      // Add signatures
      const finalY = doc.previousAutoTable ? doc.previousAutoTable.finalY + 15 : 120;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Mengetahui,", 50, finalY, { align: 'center' });
      doc.text("Kepala / Pimpinan Lembaga,", 50, finalY + 5, { align: 'center' });
      doc.line(20, finalY + 28, 80, finalY + 28);
      doc.setFont("helvetica", "bold");
      doc.text(pengaturan.nama_pimpinan || "Mudir Pondok", 50, finalY + 32, { align: 'center' });

      doc.setFont("helvetica", "normal");
      doc.text("Dibuat Oleh,", 155, finalY, { align: 'center' });
      doc.text("Bendahara / Sekretaris,", 155, finalY + 5, { align: 'center' });
      doc.line(125, finalY + 28, 185, finalY + 28);
      doc.setFont("helvetica", "bold");
      doc.text(customSignatoryName || invSekretaris || "Sekretaris Lembaga", 155, finalY + 32, { align: 'center' });

      doc.save(`Laporan_SPP_${filterKeuanganKelas.replace(/\s+/g, '_')}_${targetSantriName.replace(/\s+/g, '_')}.pdf`);
      showToast('Laporan Administrasi SPP PDF berhasil diunduh!');
    }
  };

  const downloadPembayaranExcel = () => {
    const classStudents = filterKeuanganKelas ? studentsInClass(filterKeuanganKelas) : [];
    const displayStudents = filterKeuanganNama === 'Semua'
      ? classStudents
      : classStudents.filter(s => s.id_santri === filterKeuanganNama);

    const headers = filterKeuanganNama === 'Semua'
      ? ['No', 'NIS', 'Nama Santri', 'Kelas', 'Status Tagihan Belum Lunas', 'Total Nilai Transaksi']
      : ['No', 'Tanggal Input', 'Nama Santri', 'Kategori Pembayaran', 'Status Pembayaran', 'Nominal Tagihan'];

    const csvRows = [];
    csvRows.push(`LAPORAN KAS ADMINISTRASI & SPP - ${pengaturan.nama_lembaga.toUpperCase()}`);
    csvRows.push(`Kelas: ${filterKeuanganKelas} | Santri: ${filterKeuanganNama === 'Semua' ? 'SEMUA SANTRI' : 'DETAIL PEMBAYARAN'}`);
    csvRows.push('');
    csvRows.push(headers.join(','));

    let globalCounter = 1;
    displayStudents.forEach(santri => {
      const studentTransactions = pembayaranList.filter(p => p.id_santri === santri.id_santri);

      if (filterKeuanganNama === 'Semua') {
        const totalSPP = studentTransactions.reduce((acc, curr) => acc + curr.nominal, 0);

        const currentMonth = getLocalDateMonthString();
        const currentMonthPayments = studentTransactions.filter(p => p.tanggal && p.tanggal.startsWith(currentMonth));

        const hasUnpaidInCurrentMonth = currentMonthPayments.length === 0 || currentMonthPayments.some(p => p.status === 'Belum Bayar');
        const hasUnpaidInPast = studentTransactions.some(p => p.status === 'Belum Bayar');
        const hasUnpaidPayment = hasUnpaidInCurrentMonth || hasUnpaidInPast;

        const hasCicilInCurrentMonth = currentMonthPayments.some(p => p.status === 'Cicil');
        const hasCicilInPast = studentTransactions.some(p => p.status === 'Cicil');
        const hasCicilPayment = !hasUnpaidPayment && (hasCicilInCurrentMonth || hasCicilInPast);

        let statusText = 'Lunas';
        if (hasUnpaidPayment) {
          statusText = 'Belum Bayar';
        } else if (hasCicilPayment) {
          statusText = 'Cicil';
        }

        const row = [
          globalCounter++,
          santri.nis || '-',
          `"${santri.nama_santri.replace(/"/g, '""')}"`,
          santri.halaqah,
          statusText,
          totalSPP
        ];
        csvRows.push(row.join(','));
      } else {
        studentTransactions.forEach(p => {
          const row = [
            globalCounter++,
            formatTanggal(p.tanggal),
            `"${santri.nama_santri.replace(/"/g, '""')}"`,
            `"${p.kategori.replace(/"/g, '""')}"`,
            p.status,
            p.nominal
          ];
          csvRows.push(row.join(','));
        });
      }
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.map(e => e).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const targetSantriName = filterKeuanganNama === 'Semua' ? 'SEMUA' : (santriList.find(s => s.id_santri === filterKeuanganNama)?.nama_santri || '-');
    link.setAttribute("download", `Laporan_Pembayaran_${filterKeuanganKelas}_${targetSantriName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Laporan Keuangan SPP Excel/CSV berhasil diunduh!');
  };


  // ==================== KORAN SETORAN EXPORTS ====================
  const downloadSetoranPdf = async (customSignatoryName?: string) => {
    if ((window as any).jspdf) {
      showToast('Menyiapkan Laporan Laporan Hafalan Qur\'an PDF...');
      const { jsPDF } = (window as any).jspdf;
      const doc = new jsPDF();

      // Load logo images
      let watermarkBase64 = '';
      let headerLogoBase64 = '';
      if (pengaturan.logo) {
        try {
          watermarkBase64 = await getWatermarkImage(pengaturan.logo, 0.06);
          headerLogoBase64 = await getWatermarkImage(pengaturan.logo, 0.90);
        } catch (err) { }
      }

      // Draw Background Watermark in Center
      if (watermarkBase64) {
        try {
          doc.addImage(watermarkBase64, 'PNG', 62.5, 106, 85, 85);
        } catch (err) { }
      }

      // Draw Header Logo
      if (headerLogoBase64) {
        try {
          doc.addImage(headerLogoBase64, 'PNG', 14, 12, 18, 18);
        } catch (err) { }
      }

      // Professional Letterhead Layout
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(30, 41, 59);
      doc.text("LAPORAN REKAP SETORAN TAHFIDZ & TILAWAH", 36, 17);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(2, 132, 199);
      doc.text(pengaturan.nama_lembaga.toUpperCase(), 36, 22);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`${pengaturan.alamat || 'Alamat Lembaga'} | Telp: ${pengaturan.telepon || '-'} | Email: ${pengaturan.email || '-'}`, 36, 27);

      // Double line divider
      doc.setDrawColor(2, 132, 199);
      doc.setLineWidth(0.8);
      doc.line(14, 32, 196, 32);

      doc.setDrawColor(218, 165, 32);
      doc.setLineWidth(0.3);
      doc.line(14, 33.5, 196, 33.5);

      // Metadata block
      doc.setFillColor(248, 250, 252);
      doc.rect(14, 38, 182, 14, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.rect(14, 38, 182, 14);

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(51, 65, 85);
      doc.text(`KELAS: ${filterSetoranKelas.toUpperCase()}`, 18, 46);

      const targetSantriName = filterSetoranNama === 'Semua' ? 'SEMUA SANTRI' : (santriList.find(s => s.id_santri === filterSetoranNama)?.nama_santri?.toUpperCase() || '-');
      doc.text(`SANTRI: ${targetSantriName}`, 115, 46);

      // Compile rows of the table
      const classStudents = filterSetoranKelas ? studentsInClass(filterSetoranKelas) : [];
      const displayStudents = filterSetoranNama === 'Semua'
        ? classStudents
        : classStudents.filter(s => s.id_santri === filterSetoranNama);

      const tableData: any[] = [];
      let globalCounter = 1;

      displayStudents.forEach(santri => {
        const studentTransactions = setoranList.filter(s => s.id_santri === santri.id_santri);

        if (filterSetoranNama === 'Semua') {
          // Summary per student for "Semua Santri"
          const totalActivities = studentTransactions.length;
          // Find last memorized sūrah
          const memoList = studentTransactions.filter(s => s.surah !== '-');
          const lastMemo = memoList.length > 0 ? `${memoList[0].surah} (${memoList[0].ayat})` : 'Belum Ada';

          tableData.push([
            String(globalCounter++),
            santri.nis || '-',
            santri.nama_santri,
            santri.halaqah,
            String(totalActivities) + ' Setoran',
            lastMemo
          ]);
        } else {
          // Detail list for single student - Direct mapping of transactions to match UI layout
          // Sort transactions by date descending
          const sortedTransactions = [...studentTransactions].sort((a, b) => b.tanggal.localeCompare(a.tanggal));

          sortedTransactions.forEach(s => {
            const kSurah = s.kualitas_surah || (s.kualitas && !s.kualitas.includes('|') && !s.kualitas.includes(':') ? s.kualitas : '') || 'Mumtaz';
            const kTilawah = s.kualitas_tilawah || (s.kualitas && !s.kualitas.includes('|') && !s.kualitas.includes(':') ? s.kualitas : '') || 'Mumtaz';
            const kHadits = s.kualitas_hadits || (s.kualitas && !s.kualitas.includes('|') && !s.kualitas.includes(':') ? s.kualitas : '') || 'Mumtaz';

            const tahfidzVal = s.surah !== '-'
              ? `${s.surah}\nAyat ${s.ayat}\n[${kSurah}]`
              : '-';

            const tilawahVal = s.tilawah !== '-'
              ? `${s.tilawah}\nHalaman: ${s.halaman || '-'}\n[${kTilawah}]`
              : '-';

            const hafalanVal = s.hadits !== '-'
              ? `${s.hadits}\n[${kHadits}]`
              : '-';

            tableData.push([
              String(globalCounter++),
              formatTanggal(s.tanggal),
              santri.nama_santri,
              tahfidzVal,
              tilawahVal,
              hafalanVal
            ]);
          });
        }
      });

      const tableHeaders = filterSetoranNama === 'Semua'
        ? ['No', 'NIS', 'Nama Santri', 'Kelas', 'Jumlah Setoran', 'Hafalan Terakhir']
        : ['No', 'Tanggal', 'Nama Santri', 'Tahfidz', 'Tilawah / Pages', 'Hafalan'];

      if (doc.autoTable) {
        doc.autoTable({
          head: [tableHeaders],
          body: tableData,
          startY: 58,
          theme: 'striped',
          styles: { fontSize: 8.5, cellPadding: 3 },
          headStyles: { fillColor: [2, 132, 199], textColor: [255, 255, 255], fontStyle: 'bold' },
          columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 32 },
            5: { halign: 'center' }
          }
        });
      }

      // Add signatures
      const finalY = doc.previousAutoTable ? doc.previousAutoTable.finalY + 15 : 120;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Mengetahui,", 50, finalY, { align: 'center' });
      doc.text("Kepala / Pimpinan Lembaga,", 50, finalY + 5, { align: 'center' });
      doc.line(20, finalY + 28, 80, finalY + 28);
      doc.setFont("helvetica", "bold");
      doc.text(pengaturan.nama_pimpinan || "Mudir Pondok", 50, finalY + 32, { align: 'center' });

      doc.setFont("helvetica", "normal");
      doc.text("Dibuat Oleh,", 155, finalY, { align: 'center' });
      doc.text("Penunggu Halaqoh/Kelas,", 155, finalY + 5, { align: 'center' });
      doc.line(125, finalY + 28, 185, finalY + 28);
      doc.setFont("helvetica", "bold");
      doc.text(customSignatoryName || invSekretaris || "Ustadz Pengawas", 155, finalY + 32, { align: 'center' });

      doc.save(`Laporan_Hafalan_${filterSetoranKelas.replace(/\s+/g, '_')}_${targetSantriName.replace(/\s+/g, '_')}.pdf`);
      showToast('Laporan Setoran Tahfidz PDF berhasil diunduh!');
    }
  };

  const downloadSetoranExcel = () => {
    const classStudents = filterSetoranKelas ? studentsInClass(filterSetoranKelas) : [];
    const displayStudents = filterSetoranNama === 'Semua'
      ? classStudents
      : classStudents.filter(s => s.id_santri === filterSetoranNama);

    const headers = filterSetoranNama === 'Semua'
      ? ['No', 'NIS', 'Nama Santri', 'Kelas', 'Jumlah Setoran Hafalan', 'Hafalan Terakhir']
      : ['No', 'Tanggal Setoran', 'Nama Santri', 'Tahfidz', 'Tilawah / Pages', 'Hafalan'];

    const csvRows = [];
    csvRows.push(`LAPORAN AKTIVITAS REKAP SETORAN TAHFIDZ - ${pengaturan.nama_lembaga.toUpperCase()}`);
    csvRows.push(`Kelas: ${filterSetoranKelas} | Santri: ${filterSetoranNama === 'Semua' ? 'SEMUA SANTRI' : 'DETAIL TANGGAL'}`);
    csvRows.push('');
    csvRows.push(headers.join(','));

    let globalCounter = 1;
    displayStudents.forEach(santri => {
      const studentTransactions = setoranList.filter(s => s.id_santri === santri.id_santri);

      if (filterSetoranNama === 'Semua') {
        const memoList = studentTransactions.filter(s => s.surah !== '-');
        const lastMemo = memoList.length > 0 ? `${memoList[0].surah} (${memoList[0].ayat})` : 'Belum Ada';
        const row = [
          globalCounter++,
          santri.nis || '-',
          `"${santri.nama_santri.replace(/"/g, '""')}"`,
          santri.halaqah,
          `${studentTransactions.length} Setoran`,
          `"${lastMemo.replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(','));
      } else {
        // Direct mapping of transactions to match UI layout and PDF layout for Excel download
        const sortedTransactions = [...studentTransactions].sort((a, b) => b.tanggal.localeCompare(a.tanggal));

        sortedTransactions.forEach(s => {
          const kSurah = s.kualitas_surah || (s.kualitas && !s.kualitas.includes('|') && !s.kualitas.includes(':') ? s.kualitas : '') || 'Mumtaz';
          const kTilawah = s.kualitas_tilawah || (s.kualitas && !s.kualitas.includes('|') && !s.kualitas.includes(':') ? s.kualitas : '') || 'Mumtaz';
          const kHadits = s.kualitas_hadits || (s.kualitas && !s.kualitas.includes('|') && !s.kualitas.includes(':') ? s.kualitas : '') || 'Mumtaz';

          const tahfidzVal = s.surah !== '-'
            ? `${s.surah} (Ayat ${s.ayat}) [${kSurah}]`
            : '-';

          const tilawahVal = s.tilawah !== '-'
            ? `${s.tilawah} (Hal: ${s.halaman || '-'}) [${kTilawah}]`
            : '-';

          const hafalanVal = s.hadits !== '-'
            ? `${s.hadits} [${kHadits}]`
            : '-';

          const row = [
            globalCounter++,
            formatTanggal(s.tanggal),
            `"${santri.nama_santri.replace(/"/g, '""')}"`,
            `"${tahfidzVal.replace(/"/g, '""')}"`,
            `"${tilawahVal.replace(/"/g, '""')}"`,
            `"${hafalanVal.replace(/"/g, '""')}"`
          ];
          csvRows.push(row.join(','));
        });
      }
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.map(e => e).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const targetSantriName = filterSetoranNama === 'Semua' ? 'SEMUA' : (santriList.find(s => s.id_santri === filterSetoranNama)?.nama_santri || '-');
    link.setAttribute("download", `Laporan_Setoran_${filterSetoranKelas}_${targetSantriName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Laporan Laporan Hafalan Qur\'an Excel/CSV berhasil diunduh!');
  };

  // REDESIGNED RIWAYAT FILTER: Click handler
  const handleApplyFilter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!filterKelas || !filterNama || !filterMenu || !filterTglMulai || !filterTglAkhir) {
      showToast("Mohon lengkapi semua kolom filter sebelum melakukan pencarian.");
      return;
    }

    // Process matching data
    let mergedResults: any[] = [];

    const inRange = (dStr: string) => {
      if (!dStr) return false;
      const normalizedDate = dStr.split('T')[0];
      return normalizedDate >= filterTglMulai && normalizedDate <= filterTglAkhir;
    };

    // Filter by child and date
    if (filterMenu === 'Semua' || filterMenu === 'Hafalan' || filterMenu === 'Tilawah' || filterMenu === 'Hadits') {
      const matches: any[] = [];
      setoranList.forEach(s => {
        if (s.id_santri !== filterNama) return;
        if (!inRange(s.tanggal)) return;

        // 1. Hafalan / Tahfidz
        const hasHafalan = s.surah && s.surah !== '-';
        if (hasHafalan && (filterMenu === 'Semua' || filterMenu === 'Hafalan')) {
          matches.push({
            ...s,
            type: 'Hafalan',
            desc: `Tahfidz: ${s.surah} (${s.ayat})`,
            nominal: 0
          });
        }

        // 2. Tilawah
        const hasTilawah = s.tilawah && s.tilawah !== '-';
        if (hasTilawah && (filterMenu === 'Semua' || filterMenu === 'Tilawah')) {
          matches.push({
            ...s,
            type: 'Tilawah',
            desc: `Tilawah: ${s.tilawah}${s.halaman && s.halaman !== '-' ? ` (Hlm: ${s.halaman})` : ''}`,
            nominal: 0
          });
        }

        // 3. Hadits / Doa
        const hasHadits = s.hadits && s.hadits !== '-';
        if (hasHadits && (filterMenu === 'Semua' || filterMenu === 'Hadits')) {
          matches.push({
            ...s,
            type: 'Hadits',
            desc: `Doa/Hadits: ${s.hadits}`,
            nominal: 0
          });
        }
      });
      mergedResults = [...mergedResults, ...matches];
    }

    if (filterMenu === 'Semua' || filterMenu === 'Pembayaran') {
      const matches = pembayaranList.filter(p => {
        if (p.id_santri !== filterNama) return false;
        if (!inRange(p.tanggal)) return false;
        return true;
      }).map(p => ({
        id_setoran: p.id_pembayaran,
        tanggal: p.tanggal,
        id_santri: p.id_santri,
        nama_santri: p.nama_santri,
        type: 'Pembayaran',
        desc: `${p.kategori} [${p.status}]`,
        kualitas: p.status,
        catatan: p.catatan,
        nama_ustadz: p.nama_admin,
        nominal: p.nominal
      }));
      mergedResults = [...mergedResults, ...matches];
    }

    if (filterMenu === 'Semua' || filterMenu === 'Tabungan') {
      const matches = tabunganList.filter(t => {
        if (t.id_santri !== filterNama) return false;
        if (!inRange(t.tanggal)) return false;
        return true;
      }).map(t => ({
        id_setoran: t.id,
        tanggal: t.tanggal,
        id_santri: t.id_santri,
        nama_santri: t.nama_santri,
        type: 'Tabungan',
        desc: `Penyetoran Saldo Kas`,
        kualitas: 'Tersimpan',
        catatan: 'Disimpan dalam tabungan.',
        nama_ustadz: 'Sistem Kas',
        nominal: t.nominal
      }));
      mergedResults = [...mergedResults, ...matches];
    }

    if (filterMenu === 'Semua' || filterMenu === 'Mutabaah') {
      const matches = mutabaahList.filter(m => {
        if (m.id_santri !== filterNama) return false;
        if (!inRange(m.tanggal)) return false;
        return true;
      }).map(m => ({
        id_setoran: m.id,
        tanggal: m.tanggal,
        id_santri: m.id_santri,
        nama_santri: m.nama_santri,
        type: 'Mutabaah',
        desc: `Shalat: [S:${m.subuh}, D:${m.dzuhur}, A:${m.ashar}, M:${m.maghrib}, I:${m.isya}], Dhuha:${m.dhuha}, Tilawah:${m.tilawah}`,
        kualitas: 'Harian',
        catatan: m.catatan || 'Jurnal ibadah di rumah.',
        nama_ustadz: 'Ortu / Wali',
        nominal: 0
      }));
      mergedResults = [...mergedResults, ...matches];
    }

    // Sort chronologically desc
    mergedResults.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

    setAppliedResults(mergedResults);
    setIsFilterApplied(true);
  };

  // Reset filter when values change so dynamic display requirements are respected
  const onFilterValueChange = (field: string, value: string) => {
    setIsFilterApplied(false); // force click of "Terapkan Filter"
    if (field === 'kelas') {
      setFilterKelas(value);
      setFilterNama(''); // reset name select on class changes
    } else if (field === 'nama') {
      setFilterNama(value);
    } else if (field === 'menu') {
      setFilterMenu(value);
    } else if (field === 'tglMulai') {
      setFilterTglMulai(value);
    } else if (field === 'tglAkhir') {
      setFilterTglAkhir(value);
    }
  };

  // Dynamically sort the filtered results based on selected column and order
  const sortedAppliedResults = React.useMemo(() => {
    return [...appliedResults].sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      if (sortField === 'date') {
        valA = new Date(a.tanggal || 0).getTime();
        valB = new Date(b.tanggal || 0).getTime();
      } else if (sortField === 'class') {
        const santriA = santriList.find(s => s.id_santri === a.id_santri);
        const santriB = santriList.find(s => s.id_santri === b.id_santri);
        valA = (santriA ? santriA.halaqah : '').toLowerCase();
        valB = (santriB ? santriB.halaqah : '').toLowerCase();
      } else if (sortField === 'name') {
        valA = (a.nama_santri || '').toLowerCase();
        valB = (b.nama_santri || '').toLowerCase();
      } else if (sortField === 'menu') {
        valA = (a.type || '').toLowerCase();
        valB = (b.type || '').toLowerCase();
      }

      if (valA === valB) return 0;
      if (sortOrder === 'asc') {
        return valA < valB ? -1 : 1;
      } else {
        return valA > valB ? -1 : 1;
      }
    });
  }, [appliedResults, sortField, sortOrder, santriList]);

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 relative overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-white px-5 py-3 rounded-2xl shadow-2xl font-semibold text-xs tracking-wide z-[200] animate-fadeIn flex items-center gap-2 w-max max-w-[90vw]">
          <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SUCCESS PUBLISH MODAL */}
      {showPublishSuccessModal && (() => {
              const activeUname = getActiveSchoolUsername();
              const cleanUrl = `${window.location.origin}/tpq/${activeUname}`;
              const queryUrl = `${window.location.origin}/?tpq=${activeUname}`;
              return (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-teal-50/50 space-y-5 text-center relative overflow-hidden">
                    {/* Top color strip */}
                    <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-teal-500 via-teal-500 to-teal-600" />

                    <div className="flex flex-col items-center space-y-3 pt-2">
                      <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 shadow-inner">
                        <Globe className="w-7 h-7 text-teal-600 animate-pulse" />
                      </div>
                      <h3 className="font-black text-xs uppercase text-teal-950 tracking-wider">
                        Website TPQ Berhasil Dipublikasikan!
                      </h3>
                      <p className="text-[10px] text-slate-800 font-bold leading-relaxed px-2">
                        Kustomisasi website TPQ Anda telah dipublikasikan secara global dan tersinkronisasi langsung ke database utama!
                      </p>
                    </div>

                    {/* Link Box */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                      <span className="text-[8px] font-black uppercase text-teal-600 tracking-widest block">Tautan Handal & Kompatibel (Direkomendasikan)</span>
                      <a
                        href={queryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-white hover:bg-teal-50 border border-teal-500/20 text-teal-600 hover:text-teal-700 rounded-xl p-3 font-mono text-[9px] break-all font-semibold shadow-sm leading-relaxed transition-colors cursor-pointer text-center"
                      >
                        {queryUrl}
                      </a>

                      <span className="text-[8px] font-black uppercase text-slate-700 tracking-widest block pt-1">Tautan Cantik (Clean URL)</span>
                      <a
                        href={cleanUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 hover:text-black font-medium rounded-xl p-3 font-mono text-[9px] break-all font-semibold shadow-sm leading-relaxed transition-colors cursor-pointer text-center"
                      >
                        {cleanUrl}
                      </a>

                      <p className="text-[8px] text-slate-700 font-bold leading-normal pt-1">
                        💡 Gunakan <b>Tautan Handal</b> untuk performa terbaik yang dijamin 100% selalu terbuka langsung ke landing page di semua perangkat.
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(queryUrl);
                          showToast("Tautan website berhasil disalin!");
                        }}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-3 px-4 rounded-xl text-[9px] uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Salin Tautan
                      </button>
                      <a
                        href={queryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black py-3 px-4 rounded-xl text-[9px] uppercase tracking-wider text-center flex items-center justify-center shadow-md shadow-teal-600/20 hover:shadow-lg hover:shadow-teal-600/30 transition-all duration-300 cursor-pointer relative overflow-hidden"
                      >
                        <span className="relative z-10">Buka Website</span>
                        <Globe className="w-3.5 h-3.5 ml-1.5 relative z-10 transition-transform group-hover:translate-x-1" />
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                      </a>
                    </div>

              <button
                type="button"
                onClick={() => setShowPublishSuccessModal(false)}
                className="w-full text-slate-700 hover:text-black font-medium font-black text-[8px] uppercase tracking-widest pt-2 block cursor-pointer"
              >
                Tutup Dialog
              </button>
            </div>
          </div>
        );
      })()}

      {/* Unified Header - Fixed at top, OUTSIDE the scrollable area (matches ParentDashboard pattern) */}
      {(activeTab !== 'quran' && (activeTab as any) !== 'doa') && (
        <div className="shrink-0 w-full bg-slate-50">
          {/* Unified Elegant Header with Dark Green Mosque backdrop / gradient */}
          <div className="bg-teal-600 text-white pt-3 pb-7 px-5 relative overflow-hidden shadow-[0_4px_20px_rgba(13,75,69,0.12)]" style={{ borderBottomLeftRadius: '50% 10px', borderBottomRightRadius: '50% 10px' }}>
            {/* Radial light glow effect */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

            {/* Profile info & action buttons in single row */}
            <div className="flex items-center justify-between">
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
                        const fallbackIcon = document.getElementById('header-fallback-icon-unified');
                        if (fallbackIcon) fallbackIcon.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <img
                    id="header-fallback-icon-unified"
                    style={{ display: pengaturan?.logo ? 'none' : 'block' }}
                    src="https://iili.io/CCbS5Ss.md.png"
                    alt="SIM TPQ DIGITAL"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>

                <div className="text-left min-w-0 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 mb-1">
                    <p className="text-amber-300 text-[10px] font-black uppercase tracking-widest leading-none">
                      {user.role || 'Admin'}
                    </p>
                    <span className="w-3.5 h-3.5 bg-teal-500 rounded-full flex items-center justify-center text-white p-0.5 shadow-xs shrink-0" title="Verified Account">
                      <CheckCircle className="w-2.5 h-2.5 text-white" />
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold tracking-tight text-white mt-0.5 leading-snug truncate">
                    {getCleanName(user.nama_lengkap).replace(/^(Admin|Ustadz)\s*-\s*/i, '')}
                  </h3>
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                {onSyncData && (
                  <button
                    type="button"
                    onClick={() => {
                      onSyncData();
                      showToast("Memperbarui data pusat secara aman...");
                    }}
                    disabled={isSyncing}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${isSyncing
                      ? 'bg-teal-600/40 border-teal-500/40 text-teal-300 animate-spin cursor-not-allowed'
                      : 'bg-white/10 border-white/20 text-teal-100 hover:bg-teal-500 hover:text-white hover:border-teal-500 cursor-pointer'
                      }`}
                    title="Perbarui Data Hub"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={onLogout}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-rose-500 hover:text-white hover:border-rose-500 border border-white/20 flex items-center justify-center text-rose-200 transition-all cursor-pointer"
                  title="Keluar Akun"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Date Capsule Pills */}
            <div className="flex justify-end mt-2 animate-fadeIn gap-1">
              <div className="bg-white/15 px-2 sm:px-3 py-1.5 rounded-full flex items-center gap-1 sm:gap-1.5 text-[8.5px] sm:text-[10px] font-bold text-white border border-white/10 shadow-3xs min-w-0 text-right">
                <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300 shrink-0" />
                <span className="truncate">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY QUICK INFO BAR - Elegant Compact Design (Only for Beranda) - FIXED, outside scroll */}
      {activeTab === 'beranda' && (
        <div className="shrink-0 w-full bg-slate-50 px-4 -mt-7 pb-2">
          <div className="bg-white/95 backdrop-blur-md rounded-[1.25rem] py-1.5 px-1 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-white/60 grid grid-cols-3 gap-0.5 relative z-10">
            {/* Col 1: Santri */}
            <button
              onClick={() => setActiveTab('santri')}
              className="flex flex-row items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-50/60 py-1.5 px-1 rounded-xl transition-all active:scale-95 focus:outline-none"
            >
              <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0 shadow-[0_2px_10px_rgba(16,185,129,0.12)] border border-teal-100/60">
                <img src="/asset/icon/data-santri.png" alt="Santri" className="w-7 h-7 object-contain" />
              </div>
              <div className="flex flex-col items-center gap-0">
                <span className="text-[14px] font-black text-slate-800 leading-none">
                  {santriList.length}
                </span>
                <span className="text-[7.5px] font-bold text-slate-900 uppercase tracking-widest leading-tight mt-0.5">Santri</span>
              </div>
            </button>

            {/* Col 2: Setoran */}
            <button
              onClick={() => setActiveTab('setoran')}
              className="flex flex-row items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-50/60 py-1.5 px-1 rounded-xl transition-all active:scale-95 focus:outline-none"
            >
              <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0 shadow-[0_2px_10px_rgba(16,185,129,0.12)] border border-teal-100/60">
                <img src="/asset/icon/setoran.png" alt="Setoran" className="w-7 h-7 object-contain" />
              </div>
              <div className="flex flex-col items-center gap-0">
                <span className="text-[14px] font-black text-slate-800 leading-none">
                  {setoranList.length}
                </span>
                <span className="text-[7.5px] font-bold text-slate-900 uppercase tracking-widest leading-tight mt-0.5">Setoran</span>
              </div>
            </button>

            {/* Col 3: Kelas */}
            <button
              onClick={() => setActiveTab('kelas')}
              className="flex flex-row items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-50/60 py-1.5 px-1 rounded-xl transition-all active:scale-95 focus:outline-none relative"
            >
              <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0 shadow-[0_2px_10px_rgba(16,185,129,0.12)] border border-teal-100/60">
                <img src="/asset/icon/kelas.png" alt="Kelas" className="w-7 h-7 object-contain" />
              </div>
              <div className="flex flex-col items-center gap-0">
                <span className="text-[14px] font-black text-slate-800 leading-none">
                  {kelasList.length}
                </span>
                <span className="text-[7.5px] font-bold text-slate-900 uppercase tracking-widest leading-tight mt-0.5">Kelas</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* OVERLAY SEARCH BOX (Only for Santri) - FIXED, outside scroll */}
      {activeTab === 'santri' && (
        <div className="shrink-0 w-full bg-slate-50 px-4 -mt-7 pb-2">
          <div className="bg-white/95 backdrop-blur-md rounded-[1.25rem] p-3 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-white/60 flex items-center gap-3 relative z-10">
            <Search className="w-4.5 h-4.5 text-slate-700 shrink-0" />
            <input
              type="text"
              placeholder="Cari santri..."
              value={searchSantri}
              onChange={(e) => setSearchSantri(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-xs text-slate-700 placeholder-slate-400 font-bold tracking-tight"
            />
            {searchSantri && (
              <button
                type="button"
                onClick={() => setSearchSantri('')}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-700 hover:text-black font-medium transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* OVERLAY TITLE (Only for Riwayat) - FIXED, outside scroll */}
      {activeTab === 'riwayat' && (
        <div className="shrink-0 w-full bg-slate-50 px-4 -mt-7 pb-2">
          <div className="bg-white/95 backdrop-blur-md rounded-[1.25rem] p-3.5 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-white/60 flex items-center justify-center relative z-10 text-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800 leading-tight">Pusat Riwayat & Transaksi Akademik</h3>
              <p className="text-[10px] text-slate-700 font-semibold mt-0.5">Kelola records, pembayaran Spp, & mutabaah santri.</p>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY TITLE (Only for Setoran) - FIXED, outside scroll */}
      {activeTab === 'setoran' && (
        <div className="shrink-0 w-full bg-slate-50 px-4 -mt-7 pb-2">
          <div className="bg-white/95 backdrop-blur-md rounded-[1.25rem] p-3.5 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-white/60 flex items-center justify-center relative z-10 text-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800 leading-tight">Koran Setoran Laporan Santri</h3>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY TITLE (Only for Input Setoran) - FIXED, outside scroll */}
      {activeTab === 'input-setoran' && (
        <div className="shrink-0 w-full bg-slate-50 px-4 -mt-7 pb-2">
          <div className="bg-white/95 backdrop-blur-md rounded-[1.25rem] p-3.5 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-white/60 flex items-center justify-center relative z-10 text-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800 leading-tight">Laporan Input Aktivitas Santri</h3>
              <p className="text-[10px] text-slate-700 font-semibold mt-0.5">Pilih metode input di bawah ini: baik secara instan melalui Scan Kartu QR atau Dropdown Manual.</p>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY SEARCH BOX (Only for Menu Hub) - FIXED, outside scroll */}
      {activeTab === 'menu-hub' && (
        <div className="shrink-0 w-full bg-slate-50 px-4 -mt-7 pb-2">
          <div className="bg-white/95 backdrop-blur-md rounded-[1.25rem] p-3.5 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-white/60 flex items-center gap-3">
            <Search className="w-4.5 h-4.5 text-slate-700 shrink-0" />
            <input
              type="text"
              placeholder="Cari layanan (misal: santri, spp)..."
              value={searchMenuQuery}
              onChange={(e) => setSearchMenuQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-xs text-slate-700 placeholder-slate-400 font-bold tracking-tight"
            />
            {searchMenuQuery && (
              <button
                onClick={() => setSearchMenuQuery('')}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-700 hover:text-black font-medium transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* OVERLAY SEARCH BOX (Only for Kelas) - FIXED, outside scroll */}
      {activeTab === 'kelas' && (
        <div className="shrink-0 w-full bg-slate-50 px-4 -mt-7 pb-2">
          <div className="bg-white/95 backdrop-blur-md rounded-[1.25rem] p-3.5 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-white/60 flex items-center gap-3">
            <Search className="w-4.5 h-4.5 text-slate-700 shrink-0" />
            <input
              type="text"
              placeholder="Cari kelas / halaqah..."
              value={searchKelas}
              onChange={(e) => setSearchKelas(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-xs text-slate-700 placeholder-slate-400 font-bold tracking-tight"
            />
            {searchKelas && (
              <button
                onClick={() => setSearchKelas('')}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-700 hover:text-black font-medium transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Viewport */}
      <main
        className={`flex-grow min-h-0 h-full flex flex-col overflow-hidden ${activeTab === 'quran' || (activeTab as any) === 'doa'
          ? 'bg-slate-50'
          : 'bg-slate-50'
          }`}
      >
        <div
          id="admin-main-viewport"
          className={`flex-grow min-h-0 h-full flex flex-col w-full ${activeTab === 'quran' || (activeTab as any) === 'doa'
            ? 'p-0 h-full overflow-hidden bg-slate-50'
            : 'pt-2 pb-[72px] overflow-y-auto scroll-smooth bg-slate-50 no-scrollbar'
            }`}
        >
          {/* Spacer for non-overlay tabs */}
          {activeTab !== 'beranda' && activeTab !== 'santri' && activeTab !== 'kelas' && activeTab !== 'menu-hub' && activeTab !== 'riwayat' && activeTab !== 'setoran' && activeTab !== 'input-setoran' && (
            <div className="h-4 bg-transparent" />
          )}

          {/* TAB 1: BERANDA OVERVIEW */}
          {activeTab === 'beranda' && (
            <div key="beranda" className="flex flex-col text-left animate-fadeIn w-full">

              {/* STICKY HEADER WRAPPER FOR BERANDA */}
              <div className="hidden">
                {/* Unified Elegant Header with Dark Green Mosque backdrop / gradient */}
                <div className="bg-teal-600 text-white pt-4 pb-8 px-5 relative overflow-hidden shadow-[0_4px_20px_rgba(13,75,69,0.12)]">
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
                  <div className="flex items-center justify-between">
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
                              const fallbackIcon = document.getElementById('header-fallback-icon');
                              if (fallbackIcon) fallbackIcon.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <img
                          id="header-fallback-icon"
                          style={{ display: pengaturan?.logo ? 'none' : 'block' }}
                          src="https://iili.io/CCbS5Ss.md.png"
                          alt="SIM TPQ DIGITAL"
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>

                      <div className="text-left min-w-0">
                        <p className="text-amber-300 text-[8px] font-black uppercase tracking-widest leading-none mb-1">SIM TPQ DIGITAL</p>

                        <h3 className="text-sm font-bold tracking-tight text-white flex flex-wrap items-center gap-1.5 mt-0.5">
                          {getCleanName(user.nama_lengkap)}
                          <span className="w-3.5 h-3.5 bg-teal-500 rounded-full flex items-center justify-center text-white p-0.5 shadow-xs shrink-0" title="Verified Account">
                            <CheckCircle className="w-2.5 h-2.5 text-white" />
                          </span>
                        </h3>
                      </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {onSyncData && (
                        <button
                          onClick={() => {
                            onSyncData();
                            showToast("Memperbarui data pusat secara aman...");
                          }}
                          disabled={isSyncing}
                          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all btn-active ${isSyncing
                            ? 'bg-teal-600/40 border-teal-500/40 text-teal-300 animate-spin cursor-not-allowed'
                            : 'bg-white/10 border-white/20 text-teal-100 hover:bg-white/20 hover:text-white cursor-pointer'
                            }`}
                          title="Perbarui Data Hub"
                        >
                          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                        </button>
                      )}

                      <button
                        onClick={onLogout}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-rose-500 hover:text-white border border-white/20 flex items-center justify-center text-rose-200 transition-all btn-active cursor-pointer"
                        title="Keluar Akun"
                      >
                        <LogOut className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>


              {/* Quick Info Bar has been moved into the sticky header wrapper */}

              {/* FULL-WIDTH DETAILED KAS CARD */}
              <div className="px-4 mt-5">
                <div className="bg-white border border-slate-100/80 rounded-3xl p-4 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex flex-col w-full text-left relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-teal-500 z-10"></div>
                  <div className="flex items-center justify-between w-full relative z-20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0 border border-teal-100/50">
                        <Wallet className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-extrabold text-slate-800 uppercase tracking-widest mb-1">Total Kas Terkumpul</p>
                        <h4 className="text-sm font-black text-black leading-none mt-1">
                          {formatRupiah(pembayaranList.reduce((sum, p) => sum + (Number(p.nominal) || 0), 0))}
                        </h4>
                        <div className="w-24 h-[2.5px] bg-amber-400 rounded-full mt-2.5"></div>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('pembayaran')}
                      className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center shrink-0 hover:bg-teal-600 transition-colors cursor-pointer focus:outline-none shadow-sm animate-pulse-subtle"
                    >
                      <ChevronRight className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  {(() => {
                    const last7Days = Array.from({ length: 7 }).map((_, i) => {
                      const d = new Date();
                      d.setDate(d.getDate() - (6 - i));
                      const dateStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                      const total = pembayaranList.filter(p => p.tanggal === dateStr).reduce((sum, p) => sum + (Number(p.nominal) || 0), 0);
                      const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
                      return { date: dateStr, total, dayName };
                    });
                    const maxKas = Math.max(...last7Days.map(k => k.total), 1);

                    return (
                      <div className="w-full mt-3 pt-3 border-t border-slate-50">
                        <div className="flex justify-between items-center text-[9px] font-extrabold text-slate-700 mb-2">
                          <span className="uppercase tracking-widest text-[8px] text-slate-500">7 HARI TERAKHIR</span>
                          <span className="text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100/50">
                            +{formatRupiah(last7Days[6].total)} hari ini
                          </span>
                        </div>
                        <div className="flex items-end justify-between h-10 gap-1 mt-1">
                          {last7Days.map((day, idx) => {
                            const heightPercentage = Math.max((day.total / maxKas) * 100, 20); // Min 20% height so it's not a tiny dot
                            const isToday = idx === 6;
                            return (
                              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                                <div className="w-full flex justify-center items-end h-8">
                                  <div
                                    className={`w-1.5 sm:w-2 rounded-full transition-all duration-500 ${isToday ? 'bg-teal-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]' : 'bg-slate-200 group-hover:bg-teal-200'}`}
                                    style={{ height: `${heightPercentage}%` }}
                                  ></div>
                                </div>
                                <span className={`text-[7px] font-bold uppercase tracking-wider ${isToday ? 'text-teal-600 font-extrabold' : 'text-slate-400'}`}>
                                  {day.dayName.replace('.', '')}
                                </span>
                                <div className="absolute -top-6 bg-slate-800 text-white text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity shadow-lg">
                                  {day.dayName.replace('.', '')}: {formatRupiah(day.total)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* QUICK ACTIONS SECTION */}
              <div className="px-0 mt-5">
                <div className="flex justify-between items-center mb-3.5 px-4">
                  <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                    {/* Islamic Star & Crescent Icon */}
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-teal-600" fill="currentColor">
                      <path d="M12 2.5C9.5 2.5 7.3 3.7 5.9 5.6C6.7 5.3 7.6 5.1 8.5 5.1C12.4 5.1 15.6 8.3 15.6 12.2C15.6 14.7 14.3 16.9 12.3 18.1C12.5 18.1 12.8 18.2 13 18.2C17 18.2 20.2 15 20.2 11C20.2 6.3 16.5 2.5 12 2.5ZM9 9L9.8 11.5L12.5 11.5L10.3 13L11.2 15.5L9 14L6.8 15.5L7.7 13L5.5 11.5L8.2 11.5Z"/>
                    </svg> Menu Utama
                  </h3>
                  <button
                    onClick={() => setActiveTab('menu-hub')}
                    className="text-[10px] text-black font-extrabold hover:underline uppercase tracking-wider flex items-center gap-0.5"
                  >
                    Kelola Cepat <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-2 bg-white rounded-3xl p-3 shadow-[0_10px_30px_rgba(15,23,42,0.04)] border border-slate-100/80">
                  {[
                    { label: "Al-Qur'an", tab: "quran", icon: <img src="/asset/icon/alquran.png" alt="Al-Quran" className="w-8 h-8 object-contain" />, bg: "bg-teal-50" },
                    { label: "Informasi", tab: "informasi", icon: <img src="/asset/icon/informasi.png" alt="Informasi" className="w-8 h-8 object-contain" />, bg: "bg-teal-50" },
                    { label: "Mutaba'ah", tab: "mutabaah", icon: <img src="/asset/icon/mutabaah.png" alt="Mutabaah" className="w-8 h-8 object-contain" />, bg: "bg-teal-50" },
                    { label: "Pendaftaran", tab: "pendaftaran", icon: <img src="/asset/icon/pendaftaran.png" alt="Pendaftaran" className="w-8 h-8 object-contain" />, bg: "bg-teal-50", badge: pendaftaranList.filter(p => p.status === 'Pending').length },
                    { label: "Keuangan", tab: "pembayaran", icon: <img src="/asset/icon/keuangan.png" alt="Keuangan" className="w-8 h-8 object-contain" />, bg: "bg-teal-50" }
                  ].map((act, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTab(act.tab as any)}
                      className="flex flex-col items-center gap-1.5 p-1 transition-all hover:-translate-y-0.5 cursor-pointer"
                    >
                      <div className={`relative w-12 h-12 rounded-2xl ${act.bg} flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.06)] hover:scale-105 transition-all duration-300`}>
                        {act.icon}
                        {act.badge ? (
                          <span className="absolute -top-1.5 -right-1.5 min-w-[15px] h-[15px] bg-red-500 text-white font-extrabold text-[8px] px-1 rounded-full flex items-center justify-center">
                            {act.badge}
                          </span>
                        ) : null}
                      </div>
                      <span className="text-[9.5px] font-bold text-slate-900 leading-none truncate w-full text-center">{act.label}</span>
                    </button>
                  ))}
                </div>
              </div>


              {/* PENGUMUMAN PENTING SECTION */}
              <div className="px-0 mt-5">
                <div className="flex flex-col items-center justify-center mb-3.5">
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-4.5 h-4.5 text-teal-600" />
                    <h3 className="text-sm font-extrabold text-slate-800">Pengumuman Penting</h3>
                  </div>
                </div>

                {/* Pengumuman Carousel */}
                <PengumumanCarousel agendaList={agendaList} />
              </div>


              {/* TWO COLUMN AGENDA & RECENT ACTIVITIES */}
              <div className="px-0 mt-5 grid grid-cols-2 gap-4">
                {/* COLUMN 1: Agenda Hari Ini */}
                <div className="bg-white border border-slate-100/80 rounded-3xl p-4 shadow-sm flex flex-col justify-start text-left relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-teal-500"></div>
                  <div className="relative z-10">
                    <div className="flex flex-col mb-4 pb-2 border-b border-slate-50">
                      <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-teal-600" /> Agenda Hari Ini
                      </span>
                    </div>

                    {/* Schedules list */}
                    <div className="space-y-3">
                      {(() => {
                        const todayAgendas = agendaList.filter(item => item.tipe === 'Agenda');
                        if (todayAgendas.length > 0) {
                          return todayAgendas.map((item, idx) => {
                            return (
                              <React.Fragment key={item.id || idx}>
                                {idx > 0 && <div className="border-t border-slate-50 my-1"></div>}
                                <div className="flex flex-col gap-0.5">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-[8.5px] font-bold text-slate-800">{item.waktu || 'Tentatif'}</span>
                                    <span className="text-[7.5px] font-black text-teal-600">{item.status || 'Agenda'}</span>
                                  </div>
                                  <p className="text-[10px] font-extrabold text-slate-700">{item.judul}</p>
                                  {item.deskripsi && <p className="text-[8px] text-slate-700 font-medium line-clamp-2">{item.deskripsi}</p>}
                                </div>
                              </React.Fragment>
                            );
                          });
                        } else {
                          const fallbackAgendas = [
                            { waktu: "08.00 - 09.00", status: "Berjalan", judul: "Tahsin Al-Qur'an" },
                            { waktu: "09.00 - 10.30", status: "Berikutnya", judul: "Tahfidz Juz 30" }
                          ];
                          return fallbackAgendas.map((item, idx) => {
                            return (
                              <React.Fragment key={idx}>
                                {idx > 0 && <div className="border-t border-slate-50 my-1"></div>}
                                <div className="flex flex-col gap-0.5">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-[8.5px] font-bold text-slate-800">{item.waktu}</span>
                                    <span className="text-[7.5px] font-black text-teal-600">{item.status}</span>
                                  </div>
                                  <p className="text-[10px] font-extrabold text-slate-700">{item.judul}</p>
                                </div>
                              </React.Fragment>
                            );
                          });
                        }
                      })()}
                    </div>
                  </div>
                </div>

                {/* COLUMN 2: Aktivitas Terbaru */}
                <div className="bg-white border border-slate-100/80 rounded-3xl p-4 shadow-sm text-left flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-teal-500"></div>
                  <div className="relative z-10">
                    <div className="flex flex-col mb-4 pb-2 border-b border-slate-50">
                      <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-teal-600" /> Aktivitas Terbaru
                      </span>
                    </div>

                    <div className="space-y-3.5">
                      {setoranList.length > 0 ? (
                        setoranList.slice(0, 3).map((s, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-1.5 animate-fadeIn">
                            <div className="flex items-center gap-2 min-w-0">

                              <div className="min-w-0 text-left">
                                <p className="text-[10px] font-extrabold text-slate-700">{s.nama_santri}</p>
                                <p className="text-[8px] text-slate-700">Setoran {s.surah}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[8px] font-bold text-slate-700">
                                {s.tanggal.substring(5)}
                              </span>
                              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                            </div>
                          </div>
                        ))
                      ) : (
                        // Beautiful custom high-fidelity fallback items to matches the design perfectly
                        <>
                          <div className="flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-7.5 h-7.5 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 font-extrabold text-[10px] text-amber-600">
                                Y
                              </div>
                              <div className="min-w-0 text-left">
                                <p className="text-[10px] font-extrabold text-slate-700">Yusra Azzahra</p>
                                <p className="text-[8px] text-slate-700">Setoran Al-Qur'an</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[8px] font-bold text-slate-700">10:15</span>
                              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                            </div>
                          </div>

                          <div className="border-t border-teal-400 my-1"></div>

                          <div className="flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-7.5 h-7.5 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 font-extrabold text-[10px] text-teal-600">
                                A
                              </div>
                              <div className="min-w-0 text-left">
                                <p className="text-[10px] font-extrabold text-slate-700">Ahmad Zaky</p>
                                <p className="text-[8px] text-slate-700">Hadir Tahfidz</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[8px] font-bold text-slate-700">09:45</span>
                              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                            </div>
                          </div>

                          <div className="border-t border-teal-400 my-1"></div>

                          <div className="flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-7.5 h-7.5 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0 font-extrabold text-[10px] text-rose-600">
                                S
                              </div>
                              <div className="min-w-0 text-left">
                                <p className="text-[10px] font-extrabold text-slate-700">Siti Rohmah</p>
                                <p className="text-[8px] text-slate-700">Bayar SPP</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[8px] font-bold text-slate-700">09:30</span>
                              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-teal-400 flex justify-center shrink-0">
                    <button onClick={() => setActiveTab('riwayat')} className="text-[9px] text-teal-600 font-extrabold hover:underline whitespace-nowrap">
                      Lihat Semua
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: SANTRI MANAGEMENT */}
          {activeTab === 'santri' && (() => {
                      // Filter & sort santri (di luar IIFE render agar bisa dipakai header)
                      const filtered = (santriList || []).filter(s => {
                        const matchSearch = s.nama_santri.toLowerCase().includes(searchSantri.toLowerCase());
                        const matchClass = filterKelasSantri === 'Semua' || s.halaqah === filterKelasSantri;
                        return matchSearch && matchClass;
                      });
                      const sorted = [...filtered].sort((a, b) => (b.id_santri || '').localeCompare(a.id_santri || ''));
                      const displaySantri = sorted.slice(0, visibleSantriCount);
                      const hasMore = visibleSantriCount < sorted.length;

                      return (
                        <div className="flex flex-col text-left animate-fadeIn">
                          <div className="px-4 mt-1 space-y-4">
                            <h3 className="text-xs font-black text-black uppercase tracking-wider m-1.5 flex items-center justify-between">
                              <span>Database Santri</span>
                              <span className="flex items-center gap-1.5">
                                {filtered.length} Anak
                                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">({visibleSantriCount} ditampilkan)</span>
                              </span>
                            </h3>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white p-2 text-center shadow-sm rounded-2xl border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden">
                    <BookOpen className="w-4 h-4 text-teal-600 mb-0.5" />
                    <span className="text-[7.5px] font-black uppercase tracking-wider text-slate-800 mb-0.5">Pilih Kelas</span>
                    <select
                      value={filterKelasSantri}
                      onChange={(e) => setFilterKelasSantri(e.target.value)}
                      className="w-full bg-white border-none text-[9.5px] font-bold text-teal-600 outline-none text-center cursor-pointer appearance-none text-ellipsis"
                      style={{ textAlignLast: 'center' }}
                    >
                      <option className="text-slate-800 bg-white" value="Semua">Semua Kelas</option>
                      {kelasList.map((k, kIdx) => (
                        <option key={kIdx} className="text-slate-800 bg-white" value={k.nama_kelas}>
                          {k.nama_kelas}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => setShowKenaikanModal(true)}
                    className="bg-white text-slate-700 p-3 rounded-2xl border border-slate-200 text-center shadow-sm flex flex-col items-center justify-center btn-active hover:border-teal-500 cursor-pointer"
                  >
                    <GraduationCap className="w-5 h-5 text-teal-600 mb-1" />
                    <span className="text-[8.5px] font-bold uppercase tracking-wider">Naik Kelas</span>
                  </button>

                  <button
                    onClick={() => setShowAddManual(true)}
                    className="bg-teal-500 text-white p-3 rounded-2xl border border-teal-500 text-center shadow-sm flex flex-col items-center justify-center btn-active hover:bg-teal-600 hover:border-teal-600 cursor-pointer"
                  >
                    <PlusCircle className="w-5 h-5 text-white mb-1" />
                    <span className="text-[8.5px] font-bold uppercase tracking-wider">Tambah</span>
                  </button>
                </div>

                <div className="space-y-3 pt-2">
                                {filtered.length === 0 ? (
                                  <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-200 text-center text-slate-700 font-semibold text-xs my-2">
                                    Tidak ada santri yang cocok dengan kriteria pencarian / kelas "{filterKelasSantri}"
                                  </div>
                                ) : (
                                  <>
                                    <div className="text-[10px] font-semibold text-slate-500 text-right mb-2">
                                      Total: {filtered.length} Santri
                                    </div>
                                    {displaySantri.map((s, idx) => (
                                                              <div key={s.id_santri || idx} className="bg-white p-3.5 rounded-2xl border border-slate-100/70 border-t-4 border-t-teal-500 shadow-[0_8px_25px_rgba(20,184,166,0.08)] relative overflow-hidden flex flex-col gap-2.5 animate-fadeIn">

                                                                <div className="flex items-start justify-between">
                                                                  <div>
                                                                    <h4 className="font-bold text-xs text-slate-800">{s.nama_santri}</h4>
                                                                    <p className="text-[10px] text-black font-semibold">NIS. {s.nis} | <span>Kelas: {s.halaqah}</span></p>
                                                                  </div>
                                                                  <div className="flex items-center gap-1">
                                                                    <button
                                                                      onClick={() => setEditSantriItem(s)}
                                                                      className="text-teal-600 hover:bg-teal-50 p-1.5 rounded-lg border border-transparent hover:border-teal-100 cursor-pointer"
                                                                      title="Edit Santri"
                                                                    >
                                                                      <Edit className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <button
                                                                      onClick={() => {
                                                                        requestConfirm(
                                                                          "Hapus Santri",
                                                                          `Apakah Anda yakin ingin menghapus data santri ${s.nama_santri} dari database secara permanen?`,
                                                                          () => {
                                                                            onDeleteSantri(s.id_santri);
                                                                            showToast('Santri berhasil dihilangkan dari database.');
                                                                          }
                                                                        );
                                                                      }}
                                                                      className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg border border-transparent hover:border-rose-100 cursor-pointer"
                                                                      title="Hapus Santri"
                                                                    >
                                                                      <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                  </div>
                                                                </div>

                                                                {/* Acc credentials block */}
                                                                <div className="bg-teal-50 rounded-xl p-2.5 text-[10px] text-teal-800 border border-teal-100/50 flex items-center justify-between">
                                                                  <div>
                                                                    <span className="block font-bold text-black">Wali Account</span>
                                                                    <span className="text-black">Username <b className="text-black">{s.username_ortu}</b> | Pass <b className="text-teal-600">{s.password_ortu}</b></span>
                                                                  </div>
                                                                  <button
                                                                    onClick={() => {
                                                                      const copyTxt = `Akses Portal Wali Santri SIM-TPQ:\\nNama: ${s.nama_santri}\\nUsername: ${s.username_ortu}\\nKata Sandi: ${s.password_ortu}`;
                                                                      navigator.clipboard.writeText(copyTxt);
                                                                      showToast('Akun berhasil disalin!');
                                                                    }}
                                                                    className="p-1 text-teal-600 hover:bg-teal-100 rounded border border-teal-200 bg-white/80"
                                                                  >
                                                                    <Copy className="w-3 h-3" />
                                                                  </button>
                                                                </div>

                                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 border-t border-slate-50 pt-3 mt-0.5">
                                                                  <button
                                                                    onClick={() => {
                                                                      setSelectedStudentForInv(s);
                                                                      setInvReceiver(`Wali dari ${s.nama_santri}`);
                                                                    }}
                                                                    className="bg-teal-500 hover:bg-teal-600 text-white w-full py-1.5 rounded-lg text-[9px] font-bold cursor-pointer text-center transition-all"
                                                                  >
                                                                    Undangan
                                                                  </button>
                                                                  <button
                                                                    onClick={() => {
                                                                      setSelectedStudentForCert(s);
                                                                      setCertPenghargaan('Hafal Juz 30 Predikat Mumtaz');
                                                                    }}
                                                                    className="bg-teal-500 hover:bg-teal-600 text-white w-full py-1.5 rounded-lg text-[9px] font-bold cursor-pointer text-center transition-all"
                                                                  >
                                                                    Syahadah
                                                                  </button>
                                                                  <button
                                                                    onClick={() => downloadRaporPdf(s)}
                                                                    className="bg-teal-500 hover:bg-teal-600 text-white w-full py-1.5 rounded-lg text-[9px] font-bold cursor-pointer text-center transition-all"
                                                                  >
                                                                    Rapor PDF
                                                                  </button>
                                                                  <button
                                                                                                                                      onClick={async () => {
                                                                                                                                        // QR pendek & renggang agar mudah di-scan: cukup NIS + kode lembaga (TPQ).
                                                                                                                                        // Scanner mencari santri dari NIS/ID di database, jadi field lain tak perlu dimuat.
                                                                                                                                        const qrData = `NIS:${s.nis}|TPQ:${activeSchoolPrefix || 'BQR'}`;
                                                                                                                                        try {
                                                                                                                                          const { toDataURL } = await import('qrcode');
                                                                                                                                          const dataUrl = await toDataURL(qrData, {
                                                                                                                                            width: 512,
                                                                                                                                            margin: 4,
                                                                                                                                            errorCorrectionLevel: 'L',
                                                                                                                                            color: {
                                                                                                                                              dark: '#000000',
                                                                                                                                              light: '#ffffff'
                                                                                                                                            }
                                                                                                                                          });
                                                                                                                                          setQrCodeImgUrl(dataUrl);
                                                                                                                                          setSelectedStudentForQrCard(s);
                                                                                                                                        } catch (qErr) {
                                                                                                                                          console.error('QR code generating error:', qErr);
                                                                                                                                          showToast('Gagal membuat QR card. Coba lagi.');
                                                                                                                                        }
                                                                                                                                      }}
                                                                                                                                      className="bg-teal-500 hover:bg-teal-600 text-white w-full py-1.5 rounded-lg text-[9px] font-bold cursor-pointer text-center transition-all"
                                                                                                                                    >
                                                                                                                                      Kartu QR
                                                                                                                                    </button>
                                                                </div>
                                                              </div>
                                                            ))}

                                                            {/* Load More Sentinels */}
                                                            {hasMore && (
                                                              <>
                                                                {/* Invisible sentinel for IntersectionObserver */}
                                                                <div
                                                                  ref={santriSentinelRef}
                                                                  className="w-full h-4"
                                                                  onClick={() => setVisibleSantriCount(prev => Math.min(prev + 10, sorted.length))}
                                                                />
                                                                <button
                                                                  onClick={() => setVisibleSantriCount(prev => Math.min(prev + 10, sorted.length))}
                                                                  className="w-full py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500 hover:bg-slate-100 transition-all btn-active cursor-pointer"
                                                                >
                                                                  Tampilkan 10 Lagi ({sorted.length - visibleSantriCount} tersisa)
                                                                </button>
                                                              </>
                                                            )}
                                                          </>
                                                        )}
                                                    </div>
                                                  </div>
                                                </div>
                                              )})()}

          {/* TAB 3: INPUT SETORAN HUB */}
          {activeTab === 'input-setoran' && (
            <div className="flex flex-col text-left animate-fadeIn">

              {/* PADDED CONTENT CONTAINER */}
              <div className="px-4 mt-2 space-y-6">
                {/* TAB SELECTOR: Scan QR vs Input Manual */}
                <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-xs max-w-sm ml-1">
                  <button
                    type="button"
                    onClick={() => setTambahSubTab('qr')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${tambahSubTab === 'qr'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 bg-transparent'
                      }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    Scan QR Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setTambahSubTab('manual')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${tambahSubTab === 'manual'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 bg-transparent'
                      }`}
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Input Manual
                  </button>
                </div>

                {tambahSubTab === 'manual' && (
                  /* METODE A: INPUT MANUAL KELOMPOK / KELAS */
                  <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Input Manual Kelompok / Kelas</h4>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Pilih Kategori Input</label>
                      <select
                        value={jenisInput}
                        onChange={(e) => {
                          setJenisInput(e.target.value as any);
                          setIsFormVisible(false); // Hide form on change so they click show form again!
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-teal-700 outline-none focus:ring-4 focus:ring-teal-100 transition-all cursor-pointer align-middle"
                      >
                        <option value="hafalan">Setoran Tahfidz Al-Qur'an</option>
                        <option value="tilawah">Batas Tilawah Santri</option>
                        <option value="hadits">Setoran Hafalan (Hadits / Do'a / Lainnya)</option>
                        <option value="pembayaran">Administrasi / Setor SPP (Keuangan)</option>
                        <option value="mutabaah">Mutabaah Harian (Diary Ibadah / Shalat)</option>
                        <option value="tabungan">Saku & Kas Tabungan</option>
                        <option value="informasi">Broadcast Informasi Khusus Wali</option>
                      </select>
                    </div>

                    {!isFormVisible ? (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setIsFormVisible(true)}
                          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest transition-all shadow-md border-2 border-teal-400/20 btn-active cursor-pointer text-center"
                        >
                          Tampilkan Formulir Input Manual
                        </button>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-slate-200/60 animate-fadeIn space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full uppercase">Form Aktif: {jenisInput}</span>
                          <button
                            type="button"
                            onClick={() => setIsFormVisible(false)}
                            className="text-xs font-semibold text-slate-800 hover:text-slate-800 transition-colors"
                          >
                            ← Sembunyikan Formulir / Ganti Kategori
                          </button>
                        </div>

                        <form onSubmit={submitSetoranData} className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-700 uppercase">Halaqah / Kelas</label>
                              <select
                                value={inpKelas}
                                onChange={(e) => {
                                  setInpKelas(e.target.value);
                                  setInpSantriId('');
                                }}
                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-600 rounded-xl p-3 text-xs outline-none tracking-wide text-slate-800 font-semibold cursor-pointer"
                                required
                              >
                                <option value="">-- Pilih --</option>
                                {kelasList.map(k => <option key={k.id_kelas} value={k.nama_kelas}>{k.nama_kelas}</option>)}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-700 uppercase">Nama Santri</label>
                              <select
                                disabled={!inpKelas}
                                value={inpSantriId}
                                onChange={(e) => setInpSantriId(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-600 rounded-xl p-3 text-xs outline-none text-slate-800 font-semibold cursor-pointer disabled:opacity-50"
                                required
                              >
                                <option value="">-- Pilih --</option>
                                {inpKelas && studentsInClass(inpKelas).map((s, idx) => (
                                  <option key={`${s.id_santri}-${idx}`} value={s.id_santri}>{s.nama_santri} ({s.nis})</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 relative text-left">
                            <div className="absolute top-0 right-4 -translate-y-1/2 bg-teal-100 text-teal-800 text-[8px] font-bold px-2 py-0.5 rounded tracking-widest uppercase shadow-sm">
                              {jenisInput}
                            </div>

                            {(() => {
                              const selectedStudentObj = santriList.find(s => s.id_santri === inpSantriId);
                              const studentClassObj = selectedStudentObj ? kelasList.find(k => k.nama_kelas === selectedStudentObj.halaqah) : null;
                              const studentLessonsObj = studentClassObj ? findCurriculumForClass(studentClassObj.id_kelas, studentClassObj.nama_kelas) : null;

                              const isAcademicInput = ['hafalan', 'tilawah', 'hadits'].includes(jenisInput);
                              const hasMyCurriculum = myMataPelajaranList.length > 0;

                              if (isAcademicInput && !hasMyCurriculum) {
                                return (
                                  <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-5 text-center space-y-3 mt-1 shadow-sm">
                                    <p className="text-sm font-bold text-rose-800 flex items-center justify-center gap-1.5">⚠️ Perhatian: Kurikulum Belum Direkam</p>
                                    <p className="text-[11px] leading-relaxed text-rose-700">
                                      Akun Anda belum merekam <strong>Mata Pelajaran / Kurikulum</strong> sama sekali.
                                      Sebagai privasi dan prasyarat input data akademis, silakan buat rekaman mata pelajaran terlebih dahulu di menu <strong>"Kurikulum Kelas"</strong> sebelum menginput data Tahfidz, Tilawah, atau Hafalan.
                                    </p>
                                  </div>
                                );
                              }

                              const quranMethodsOptions = studentLessonsObj?.quran_methods && studentLessonsObj.quran_methods.length > 0
                                ? studentLessonsObj.quran_methods
                                : ['Ziyadah', 'Murojaah', 'Sabaq', 'Sabqi', 'Manzil'];

                              const haditsDoaOptions = studentLessonsObj?.hadits_doa || [];
                              const tilawahStagesOptions = studentLessonsObj?.tilawah_stages || [];

                              return (
                                <>
                                  {jenisInput === 'hafalan' && (
                                    <div className="space-y-3 pt-1">
                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-[9px] font-bold text-slate-800 uppercase">Surah</label>
                                          <select
                                            value={inpSurah}
                                            onChange={(e) => setInpSurah(e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-none text-slate-800 font-semibold cursor-pointer"
                                            required
                                          >
                                            <option value="">Pilih Surah...</option>
                                            {DAFTAR_SURAH.map((s, i) => <option key={i} value={s}>{s}</option>)}
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-[9px] font-bold text-slate-800 uppercase">Ayat</label>
                                          <input
                                            type="text"
                                            value={inpAyat}
                                            onChange={(e) => setInpAyat(e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-none text-slate-800 font-semibold"
                                            placeholder="e.g. 1-10"
                                            required
                                          />
                                        </div>
                                      </div>
                                      <div>
                                        <label className="block text-[9px] font-bold text-slate-800 uppercase">Metode Hafalan (Sesuai Kurikulum Kelas)</label>
                                        <select
                                          value={inpMetodeQuran}
                                          onChange={(e) => setInpMetodeQuran(e.target.value)}
                                          className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-none text-slate-800 font-semibold cursor-pointer"
                                        >
                                          <option value="">-- Pilih Metode --</option>
                                          {quranMethodsOptions.map((m, i) => <option key={i} value={m}>{m}</option>)}
                                        </select>
                                      </div>
                                    </div>
                                  )}

                                  {jenisInput === 'tilawah' && (
                                    <div className="space-y-2 pt-1">
                                      <div>
                                        <label className="block text-[9px] font-bold text-slate-800 uppercase">Pilih Batasan / Metode</label>
                                        <select
                                          value={inpTilawahDropdown}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setInpTilawahDropdown(val);
                                            if (val !== 'custom') {
                                              setInpTilawah(val);
                                            } else {
                                              setInpTilawah('');
                                            }
                                          }}
                                          className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-none text-slate-800 font-semibold cursor-pointer"
                                        >
                                          <option value="">-- Pilih Batasan --</option>
                                          {tilawahStagesOptions.map((t, i) => <option key={i} value={t}>{t}</option>)}
                                          <option value="custom">✍️ Tulis Manual...</option>
                                        </select>
                                      </div>
                                      {(inpTilawahDropdown === 'custom' || tilawahStagesOptions.length === 0) && (
                                        <div>
                                          <label className="block text-[9px] font-bold text-slate-800 uppercase">Tulis Batas Tilawah / Jilid Iqro / Halaman</label>
                                          <input
                                            type="text"
                                            value={inpTilawah}
                                            onChange={(e) => setInpTilawah(e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs outline-none text-slate-800 font-semibold"
                                            placeholder="Iqro Jilid 4"
                                            required
                                          />
                                        </div>
                                      )}
                                      <div>
                                        <label className="block text-[9px] font-bold text-slate-800 uppercase">Halaman</label>
                                        <input
                                          type="text"
                                          value={inpTilawahHalaman}
                                          onChange={(e) => setInpTilawahHalaman(e.target.value)}
                                          className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs outline-none text-slate-800 font-semibold"
                                          placeholder="Contoh: Halaman 4, atau 4-5"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {jenisInput === 'hadits' && (
                                    <div className="space-y-2 pt-1">
                                      <div>
                                        <label className="block text-[9px] font-bold text-slate-800 uppercase">Pilih Materi Hafalan</label>
                                        <select
                                          value={inpHaditsDropdown}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setInpHaditsDropdown(val);
                                            if (val !== 'custom') {
                                              setInpHadits(val);
                                            } else {
                                              setInpHadits('');
                                            }
                                          }}
                                          className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-none text-slate-800 font-semibold cursor-pointer"
                                        >
                                          <option value="">-- Pilih Materi --</option>
                                          {haditsDoaOptions.map((h, i) => <option key={i} value={h}>{h}</option>)}
                                          <option value="custom">✍️ Tulis Manual...</option>
                                        </select>
                                      </div>
                                      {(inpHaditsDropdown === 'custom' || haditsDoaOptions.length === 0) && (
                                        <div>
                                          <label className="block text-[9px] font-bold text-slate-800 uppercase">Tulis Nama Materi Hafalan</label>
                                          <input
                                            type="text"
                                            value={inpHadits}
                                            onChange={(e) => setInpHadits(e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs outline-none text-slate-800 font-semibold"
                                            placeholder="Hadits Ke-3 tentang Rukun Islam"
                                            required
                                          />
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </>
                              );
                            })()}

                            {jenisInput === 'pembayaran' && (
                              <div className="space-y-3 pt-1">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-800 uppercase">Perihal Kategori</label>
                                    <input
                                      type="text"
                                      value={payKategori}
                                      onChange={(e) => setPayKategori(e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-none text-slate-800 font-semibold"
                                      placeholder="SPP Juni 2026"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-800 uppercase">Nominal</label>
                                    <input
                                      type="number"
                                      value={payNominal}
                                      onChange={(e) => setPayNominal(e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-none text-slate-800 font-semibold"
                                      placeholder="150000"
                                      required
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-800 uppercase">Status</label>
                                    <select
                                      value={payStatus}
                                      onChange={(e) => setPayStatus(e.target.value as any)}
                                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none text-slate-800 font-semibold cursor-pointer"
                                    >
                                      <option value="Lunas">Lunas</option>
                                      <option value="Cicil">Cicil / Uang Muka</option>
                                      <option value="Belum Bayar">Belum Bayar</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-800 uppercase">Catatan</label>
                                    <input
                                      type="text"
                                      value={payCatatan}
                                      onChange={(e) => setPayCatatan(e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-none text-slate-800 font-semibold"
                                      placeholder="Catatan tambahan..."
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {jenisInput === 'mutabaah' && (
                              <div className="space-y-3 pt-1">
                                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider mb-1">Ceklis Ibadah Harian / Mutaba'ah:</p>

                                <div className="grid grid-cols-3 gap-2 text-center">
                                  {[
                                    { label: 'Subuh', val: mutSubuh, setVal: setMutSubuh },
                                    { label: 'Dzuhur', val: mutDzuhur, setVal: setMutDzuhur },
                                    { label: 'Ashar', val: mutAshar, setVal: setMutAshar },
                                    { label: 'Maghrib', val: mutMaghrib, setVal: setMutMaghrib },
                                    { label: 'Isya', val: mutIsya, setVal: setMutIsya },
                                    { label: 'Dhuha', val: mutDhuha, setVal: setMutDhuha }
                                  ].map((m, i) => (
                                    <div key={i} className="bg-slate-50 p-2 rounded-xl border border-slate-200 flex flex-col items-center justify-between shadow-xs">
                                      <span className="text-[9px] font-bold text-black font-medium block mb-1">{m.label}</span>
                                      <button
                                        type="button"
                                        onClick={() => m.setVal(m.val === 'Ya' ? 'Tidak' : 'Ya')}
                                        className={`px-1 py-1 rounded-lg text-[9px] font-bold tracking-wider uppercase transition-colors outline-none cursor-pointer w-full text-center ${m.val === 'Ya' ? 'bg-teal-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'}`}
                                      >
                                        {m.val}
                                      </button>
                                    </div>
                                  ))}
                                </div>

                                <div className="pt-2">
                                  <label className="block text-[10px] font-bold text-slate-800 uppercase">Progres / Bacaan Tilawah Al-Qur'an (Manual)</label>
                                  <input
                                    type="text"
                                    value={mutTilawah}
                                    onChange={(e) => setMutTilawah(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 mt-1"
                                    placeholder="Contoh: Juz 2 Hal 15 atau Al-Baqarah 1-10"
                                  />
                                </div>

                                <div className="pt-2">
                                  <label className="block text-[9px] font-bold text-slate-800 uppercase">Catatan Aktivitas / Catatan Guru</label>
                                  <input
                                    type="text"
                                    value={inpCatatan}
                                    onChange={(e) => setInpCatatan(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-none text-slate-800 font-semibold"
                                    placeholder="Sholat berjamaah lancar, tilawah juz 30..."
                                  />
                                </div>
                              </div>
                            )}

                            {jenisInput === 'tabungan' && (
                              <div className="space-y-3 pt-1">
                                <div>
                                  <label className="block text-[9px] font-bold text-slate-800 uppercase">Jumlah Setor Saku Tabungan (Rupiah)</label>
                                  <input
                                    type="number"
                                    value={tabNominal}
                                    onChange={(e) => setTabNominal(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-none text-slate-800 font-semibold"
                                    placeholder="e.g. 5000"
                                    required
                                  />
                                </div>
                              </div>
                            )}

                            {jenisInput === 'informasi' && (
                              <div className="space-y-3 pt-1">
                                <div>
                                  <label className="block text-[9px] font-bold text-slate-800 uppercase">Tipe Broadcast Informasi</label>
                                  <select
                                    value={infoTipe}
                                    onChange={(e) => setInfoTipe(e.target.value as any)}
                                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none text-slate-800 font-semibold cursor-pointer"
                                  >
                                    <option value="Manual">Manual (Kirim ke Santri Terpilih)</option>
                                    <option value="Bulanan">Bulanan / Keuangan (Tunggakan Otomatis)</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[9px] font-bold text-slate-800 uppercase">Pesan Broadcast Berita / Informasi Khusus</label>
                                  <textarea
                                    value={infoPesan}
                                    onChange={(e) => setInfoPesan(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs outline-none min-h-[90px] text-slate-800 font-semibold"
                                    placeholder="Yth. Bapak/Ibu Wali Murid, diumumkan bahwa..."
                                    required
                                  />
                                </div>
                              </div>
                            )}

                            {/* Kualitas & Catatan for setoran activities */}
                            {jenisInput !== 'pembayaran' && jenisInput !== 'mutabaah' && jenisInput !== 'tabungan' && jenisInput !== 'informasi' && (
                              <div className="grid grid-cols-2 gap-3 mt-3">
                                <div>
                                  <label className="block text-[9px] font-bold text-slate-800 uppercase">Predikat / Nilai</label>
                                  <select
                                    value={inpKualitas}
                                    onChange={(e) => setInpKualitas(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none text-slate-800 font-semibold cursor-pointer"
                                  >
                                    <option value="Mumtaz">Mumtaz (Sempurna)</option>
                                    <option value="Jayyid">Jayyid (Lancar)</option>
                                    <option value="Maqbul">Maqbul (Cukup)</option>
                                    <option value="Rasib">Rasib (Perlu Remedial)</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[9px] font-bold text-slate-800 uppercase">Catatan Guru (Opsional)</label>
                                  <input
                                    type="text"
                                    value={inpCatatan}
                                    onChange={(e) => setInpCatatan(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-none text-slate-800 font-semibold"
                                    placeholder="Tajwid diperbagus..."
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          <button
                            type="submit"
                            className="w-full bg-[#0f766e] hover:bg-[#042f2e] text-white font-bold py-3.5 rounded-2xl shadow-md transition-all active:scale-99 btn-active leading-none text-xs uppercase tracking-wider cursor-pointer"
                          >
                            Simpan Laporan Sekarang
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                )}

                {tambahSubTab === 'qr' && (
                  /* METODE B: INPUT CEPAT VIA SCAN KARTU QR SANTRI */
                  <div className="space-y-4 mt-2">
                    <div className="flex items-center justify-center gap-2 pb-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse"></span>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Scan Kartu QR</h4>
                    </div>

                    {!scannedStudent ? (
                      !showQrScanSimulatorModal ? (
                        <div
                          onClick={() => {
                            setSearchQueryModal('');
                            setShowQrScanSimulatorModal(true);
                          }}
                          className="bg-gradient-to-b from-teal-50/50 to-white border border-teal-200/80 border-t-[6px] border-t-teal-500 hover:border-teal-400 focus-within:border-teal-400 transition-all rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-4 py-10 animate-scaleUp cursor-pointer group shadow-md shadow-teal-100/60 hover:shadow-lg hover:shadow-teal-100 overflow-hidden relative"
                        >
                          <div className="w-16 h-16 rounded-2xl bg-yellow-400 border border-yellow-500 group-hover:bg-yellow-500 flex items-center justify-center relative shadow-md overflow-hidden transition-colors">
                            <QrCode className="w-8 h-8 text-teal-800 group-hover:scale-110 transition-transform" />
                          </div>

                          <div className="space-y-1.5 max-w-sm">
                            <h5 className="text-[11px] font-black text-slate-700 uppercase tracking-wider group-hover:text-teal-800 transition-colors">
                              E-Scanner Kartu QR
                            </h5>
                            <p className="text-[10px] text-slate-800 leading-relaxed font-semibold">
                              Arahkan kamera ke kartu QR santri untuk mendeteksi NIS secara otomatis.
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-teal-600 group-hover:bg-teal-700 text-white text-[9px] uppercase tracking-wider font-extrabold transition-all border border-transparent shadow-sm">
                            <Camera className="w-3.5 h-3.5 text-white/90 group-hover:text-white" />
                            Buka Kamera
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 animate-scaleUp flex flex-col text-left mt-2">
                          <div className="flex flex-wrap justify-between items-center gap-2 pb-2 border-b border-slate-200">
                            <h5 className="text-[10px] font-black uppercase text-teal-800 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping shrink-0"></span>
                              Kamera E-Scanner Aktif
                            </h5>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowQrScanSimulatorModal(false);
                              }}
                              className="relative inline-flex h-4 w-8 items-center rounded-full bg-teal-500 transition-colors hover:bg-teal-600 shrink-0 cursor-pointer shadow-inner border border-teal-600/30"
                              title="Matikan Kamera"
                            >
                              <span className="inline-block h-3 w-3 translate-x-4 rounded-full bg-white shadow-sm transition-transform" />
                            </button>
                          </div>

                          <div className="relative bg-slate-950 rounded-2xl overflow-hidden aspect-square mx-auto border border-slate-800 shadow-inner flex flex-col items-center justify-center w-full max-w-[320px]">
                            {cameraIsInitializing && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-20 space-y-3 p-4">
                                <div className="w-7 h-7 border-3 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-[8px] font-black uppercase text-teal-400 tracking-wider">Menghubungkan Kamera...</span>
                              </div>
                            )}

                            {!cameraIsInitializing && cameraError ? (
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white border-t-[6px] border-t-teal-500 p-6 text-center z-20 space-y-4">
                                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-lg font-bold shadow-md">
                                  ⚠️
                                </div>
                                <div>
                                  <h4 className="text-xs font-black uppercase text-black tracking-wider">Akses Kamera Dibatasi</h4>
                                  <p className="text-[10px] text-teal-950 mt-1.5 leading-relaxed max-w-[240px] mx-auto font-medium">
                                    Silakan buka di tab baru untuk menggunakan fitur kamera.
                                  </p>
                                </div>
                                <div className="flex flex-col gap-2.5 w-full max-w-[260px] mt-2">
                                  <a
                                    href={window.location.origin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-[#0f766e] hover:bg-teal-900 text-white font-extrabold py-2.5 px-4 rounded-xl text-[10px] uppercase tracking-wider transition-colors shadow-sm inline-block text-center"
                                  >
                                    Buka Tab Baru
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCameraError(null);
                                      setCameraIsInitializing(true);
                                      setShowQrScanSimulatorModal(false);
                                      setTimeout(() => setShowQrScanSimulatorModal(true), 150);
                                    }}
                                    className="bg-white hover:bg-slate-50 text-black font-black py-2.5 px-4 rounded-xl text-[10px] uppercase tracking-wider transition-colors border border-slate-200 shadow-sm"
                                  >
                                    Hubungkan Kembali
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {/* Custom scanning line & target overlays */}
                                <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
                                  <div className="absolute inset-x-6 top-1/2 h-0.5 bg-teal-500 shadow-[0_0_10px_#0f766e] animate-bounce duration-2500"></div>
                                  <div className="border border-dashed border-teal-400/40 w-36 h-36 rounded-xl flex items-center justify-center relative">
                                    <span className="text-[6px] font-black text-teal-400 uppercase tracking-widest mt-24">Posisikan Kode QR</span>
                                    <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-teal-400 rounded-tl"></span>
                                    <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-teal-400 rounded-tr"></span>
                                    <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-teal-400 rounded-bl"></span>
                                    <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-teal-400 rounded-br"></span>
                                  </div>
                                </div>

                                {/* The Live Video Anchor point */}
                                <div id="camera-reader" className="w-full h-full object-cover [&>video]:object-cover [&>video]:w-full [&>video]:h-full" />
                              </>
                            )}
                          </div>

                          <div className="text-center pb-1">
                            <span className="text-[8px] font-black text-teal-600 uppercase tracking-wider block">Kamera Aktif Memindai</span>
                            <p className="text-[9px] text-slate-800 font-semibold leading-normal max-w-xs mx-auto">
                              Arahkan kamera ke kode QR di Kartu ID Santri untuk mendeteksi NIS otomatis.
                            </p>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-inner space-y-5 animate-scaleUp">
                        {/* Active Connected Profile details view */}
                        <div className="bg-gradient-to-r from-teal-50/40 to-slate-50/40 border border-teal-600/10 p-3.5 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
                          <div className="flex gap-3 items-center">
                            <div className="w-10 h-10 rounded-full bg-[#0f766e] flex items-center justify-center text-white font-black text-xs shadow-sm border-2 border-white uppercase justify-center flex-shrink-0">
                              {scannedStudent.nama_santri.charAt(0)}
                            </div>
                            <div className="text-left">
                              <div className="flex items-center gap-2">
                                <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wide leading-none">{scannedStudent.nama_santri}</h4>
                                <span className="bg-teal-700/10 text-teal-800 text-[7px] tracking-widest font-black uppercase px-2 py-0.5 rounded border border-teal-600/10">Connected</span>
                              </div>
                              <p className="text-[9px] text-slate-800 font-bold mt-1">
                                NIS: <span className="font-mono text-teal-800">{scannedStudent.nis}</span> • Halaqah: <span className="text-slate-700">{scannedStudent.halaqah}</span>
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setScannedStudent(null);
                              setSelectedQrProgram(null);
                            }}
                            className="text-[8px] font-extrabold text-rose-600 hover:text-rose-700 bg-white border border-rose-100 px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-1"
                          >
                            <X className="w-3 h-3" /> Batal & Reset Scan
                          </button>
                        </div>

                        {/* 5 PROGRAM MENUS IN TILES-GRID */}
                        <div className="space-y-2 text-left">
                          <label className="block text-[8px] font-black text-slate-700 uppercase tracking-widest leading-none">PILIH PROGRAM AKTIVITAS SANTRI</label>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            {[
                              { id: 'hafalan', label: "Setoran Tahfidz", desc: 'Quran & Predikat', icon: BookOpen },
                              { id: 'tilawah', label: 'Batas Tilawah', desc: 'Juz & Halaman', icon: Award },
                              { id: 'hadits', label: 'Setoran Hafalan', desc: 'Doa & Hadits', icon: Compass },
                              { id: 'pembayaran', label: 'Administrasi', desc: 'Spp & Seragam', icon: DollarSign },
                              { id: 'tabungan', label: 'Tabungan', desc: 'Saku & Kas', icon: Coins }
                            ].map(prog => {
                              const IconComponent = prog.icon;
                              const isActive = selectedQrProgram === prog.id;
                              return (
                                <button
                                  key={prog.id}
                                  type="button"
                                  onClick={() => setSelectedQrProgram(prog.id as any)}
                                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between h-[75px] ${isActive
                                    ? 'bg-[#0f766e] border-[#0f766e] text-white shadow-xs scale-102 font-bold'
                                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-850 hover:border-slate-350'
                                    }`}
                                >
                                  <IconComponent className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-teal-700'}`} />
                                  <div>
                                    <h5 className="text-[9px] font-black leading-tight tracking-wide">{prog.label}</h5>
                                    <p className={`text-[7px] font-semibold mt-0.5 leading-none ${isActive ? 'text-teal-100' : 'text-slate-700'}`}>{prog.desc}</p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* ACTIVE TAB INPUT FORM CONTAINER */}
                        {selectedQrProgram ? (
                          <form onSubmit={submitQrQuickSetoran} className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 space-y-4 text-left shadow-sm animate-fadeIn">
                            <div className="border-b border-slate-200/80 pb-2 flex justify-between items-center">
                              <h5 className="text-[9px] font-black text-slate-850 uppercase tracking-wider flex items-center gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                                Formulir Cepat: {
                                  selectedQrProgram === 'hafalan' ? "Setoran Tahfidz" :
                                    selectedQrProgram === 'tilawah' ? "Batas Tilawah" :
                                      selectedQrProgram === 'hadits' ? "Setoran Hafalan" :
                                        selectedQrProgram === 'pembayaran' ? "Administrasi" :
                                          "Tabungan Santri"
                                }
                              </h5>
                              <span className="text-[8px] bg-white border border-slate-200 text-black font-medium font-bold uppercase px-2 py-0.5 rounded-md font-mono">
                                NIS: {scannedStudent.nis}
                              </span>
                            </div>

                            {/* Form 1: Setoran Hafalan Qur'an */}
                            {(() => {
                              const qrStudentClassObj = scannedStudent ? kelasList.find(k => k.nama_kelas === scannedStudent.halaqah) : null;
                              const qrStudentLessonsObj = qrStudentClassObj ? findCurriculumForClass(qrStudentClassObj.id_kelas, qrStudentClassObj.nama_kelas) : null;

                              const isAcademicInput = ['hafalan', 'tilawah', 'hadits'].includes(selectedQrProgram);
                              const hasMyCurriculum = myMataPelajaranList.length > 0;

                              if (isAcademicInput && !hasMyCurriculum) {
                                return (
                                  <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-5 text-center space-y-3 mt-1 shadow-sm">
                                    <p className="text-sm font-bold text-rose-800 flex items-center justify-center gap-1.5">⚠️ Perhatian: Kurikulum Belum Direkam</p>
                                    <p className="text-[11px] leading-relaxed text-rose-700">
                                      Akun Anda belum merekam <strong>Mata Pelajaran / Kurikulum</strong> sama sekali.
                                      Sebagai privasi dan prasyarat input data akademis, silakan buat rekaman mata pelajaran terlebih dahulu di menu <strong>"Kurikulum Kelas"</strong> sebelum menginput data Tahfidz, Tilawah, atau Hafalan.
                                    </p>
                                  </div>
                                );
                              }

                              const qrQuranMethodsOptions = qrStudentLessonsObj?.quran_methods && qrStudentLessonsObj.quran_methods.length > 0
                                ? qrStudentLessonsObj.quran_methods
                                : ['Ziyadah', 'Murojaah', 'Sabaq', 'Sabqi', 'Manzil'];

                              const qrHaditsDoaOptions = qrStudentLessonsObj?.hadits_doa || [];
                              const qrTilawahStagesOptions = qrStudentLessonsObj?.tilawah_stages || [];

                              return (
                                <>
                                  {selectedQrProgram === 'hafalan' && (
                                    <div className="space-y-3">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <label className="block text-[8px] font-black uppercase text-slate-700 tracking-wider mb-1">Pilih Surat</label>
                                          <select
                                            value={qrInpSurah}
                                            onChange={(e) => setQrInpSurah(e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-800 cursor-pointer"
                                            required
                                          >
                                            <option value="">-- Pilih Surah --</option>
                                            {DAFTAR_SURAH.map(s => <option key={s} value={s}>{s}</option>)}
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-[8px] font-black uppercase text-slate-700 tracking-wider mb-1">Ayat</label>
                                          <input
                                            type="text"
                                            value={qrInpAyat}
                                            onChange={(e) => setQrInpAyat(e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-800"
                                            placeholder="Contoh: 1 - 10"
                                            required
                                          />
                                        </div>
                                      </div>

                                      <div>
                                        <label className="block text-[8px] font-black uppercase text-slate-700 tracking-wider mb-1">Metode Hafalan (Sesuai Kurikulum Kelas)</label>
                                        <select
                                          value={qrInpMetodeQuran}
                                          onChange={(e) => setQrInpMetodeQuran(e.target.value)}
                                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-800 cursor-pointer"
                                        >
                                          <option value="">-- Pilih Metode --</option>
                                          {qrQuranMethodsOptions.map((m, i) => <option key={i} value={m}>{m}</option>)}
                                        </select>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <label className="block text-[8px] font-black uppercase text-slate-700 tracking-wider mb-1">Predikat</label>
                                          <select
                                            value={qrInpKualitas}
                                            onChange={(e) => setQrInpKualitas(e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-800 cursor-pointer"
                                          >
                                            <option value="Mumtaz">Mumtaz (Istimewa)</option>
                                            <option value="Jayyid Jiddan">Jayyid Jiddan (Sangat Baik)</option>
                                            <option value="Jayyid">Jayyid (Baik)</option>
                                            <option value="Maqbul">Maqbul (Cukup)</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-[8px] font-black uppercase text-slate-700 tracking-wider mb-1">Catatan Guru</label>
                                          <input
                                            type="text"
                                            value={qrInpCatatan}
                                            onChange={(e) => setQrInpCatatan(e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-800"
                                            placeholder="Lancarkan lagi makhraj tajwid..."
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {selectedQrProgram === 'tilawah' && (
                                    <div className="space-y-3">
                                      <div>
                                        <label className="block text-[8px] font-black uppercase text-slate-700 tracking-wider mb-1">Pilih Batasan / Metode</label>
                                        <select
                                          value={qrInpTilawahDropdown}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setQrInpTilawahDropdown(val);
                                            if (val !== 'custom') {
                                              setQrInpTilawah(val);
                                            } else {
                                              setQrInpTilawah('');
                                            }
                                          }}
                                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-800 cursor-pointer"
                                        >
                                          <option value="">-- Pilih Batasan --</option>
                                          {qrTilawahStagesOptions.map((t, i) => <option key={i} value={t}>{t}</option>)}
                                          <option value="custom">✍️ Tulis Manual...</option>
                                        </select>
                                      </div>

                                      {(qrInpTilawahDropdown === 'custom' || qrTilawahStagesOptions.length === 0) && (
                                        <div>
                                          <label className="block text-[8px] font-black uppercase text-slate-700 tracking-wider mb-1">Tulis Batas Tilawah / Jilid Iqro / Halaman</label>
                                          <input
                                            type="text"
                                            value={qrInpTilawah}
                                            onChange={(e) => setQrInpTilawah(e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-800"
                                            placeholder="Contoh: Juz 3 atau Iqro jilid 4"
                                            required
                                          />
                                        </div>
                                      )}

                                      <div>
                                        <label className="block text-[8px] font-black uppercase text-slate-700 tracking-wider mb-1">Halaman</label>
                                        <input
                                          type="text"
                                          value={qrInpTilawahHalaman}
                                          onChange={(e) => setQrInpTilawahHalaman(e.target.value)}
                                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-800"
                                          placeholder="Contoh: Halaman 4, atau 4-5"
                                        />
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <label className="block text-[8px] font-black uppercase text-slate-700 tracking-wider mb-1">Predikat</label>
                                          <select
                                            value={qrInpKualitas}
                                            onChange={(e) => setQrInpKualitas(e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-800 cursor-pointer"
                                          >
                                            <option value="Mumtaz">Mumtaz (Istimewa)</option>
                                            <option value="Jayyid Jiddan">Jayyid Jiddan (Sangat Baik)</option>
                                            <option value="Jayyid">Jayyid (Baik)</option>
                                            <option value="Maqbul">Maqbul (Cukup)</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-[8px] font-black uppercase text-slate-700 tracking-wider mb-1">Catatan</label>
                                          <input
                                            type="text"
                                            value={qrInpCatatan}
                                            onChange={(e) => setQrInpCatatan(e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-800"
                                            placeholder="Sudah lancar tajwid nya..."
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Form 3: Setoran Hafalan (Hadits / Doa / Lainnya) */}
                                  {selectedQrProgram === 'hadits' && (
                                    <div className="space-y-3">
                                      <div>
                                        <label className="block text-[8px] font-black uppercase text-slate-700 tracking-wider mb-1">Pilih Materi Hafalan</label>
                                        <select
                                          value={qrInpHaditsDropdown}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setQrInpHaditsDropdown(val);
                                            if (val !== 'custom') {
                                              setQrInpHadits(val);
                                            } else {
                                              setQrInpHadits('');
                                            }
                                          }}
                                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-800 cursor-pointer"
                                        >
                                          <option value="">-- Pilih Materi --</option>
                                          {qrHaditsDoaOptions.map((h, i) => <option key={i} value={h}>{h}</option>)}
                                          <option value="custom">✍️ Tulis Manual...</option>
                                        </select>
                                      </div>
                                      {(qrInpHaditsDropdown === 'custom' || qrHaditsDoaOptions.length === 0) && (
                                        <div>
                                          <label className="block text-[8px] font-black uppercase text-slate-700 tracking-wider mb-1">Tulis Nama Materi Hafalan</label>
                                          <input
                                            type="text"
                                            value={qrInpHadits}
                                            onChange={(e) => setQrInpHadits(e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-800"
                                            placeholder="Contoh: Arbain Nawawi No 1 atau Doa Sebelum Makan"
                                            required
                                          />
                                        </div>
                                      )}

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <label className="block text-[8px] font-black uppercase text-slate-700 tracking-wider mb-1">Predikat</label>
                                          <select
                                            value={qrInpKualitas}
                                            onChange={(e) => setQrInpKualitas(e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-800 cursor-pointer"
                                          >
                                            <option value="Mumtaz">Mumtaz (Istimewa)</option>
                                            <option value="Jayyid Jiddan">Jayyid Jiddan (Sangat Baik)</option>
                                            <option value="Jayyid">Jayyid (Baik)</option>
                                            <option value="Maqbul">Maqbul (Cukup)</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-[8px] font-black uppercase text-slate-700 tracking-wider mb-1">Catatan</label>
                                          <input
                                            type="text"
                                            value={qrInpCatatan}
                                            onChange={(e) => setQrInpCatatan(e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-800"
                                            placeholder="Hafal lancar tuntas..."
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </>
                              );
                            })()}

                            {/* Form 4: Administrasi Keuangan */}
                            {selectedQrProgram === 'pembayaran' && (
                              <div className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-[8px] font-black uppercase text-slate-700 tracking-wider mb-1">Kategori / Perihal</label>
                                    <input
                                      type="text"
                                      value={qrPayKategori}
                                      onChange={(e) => setQrPayKategori(e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-800"
                                      placeholder="SPP Juli, Kitab, Seragam..."
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[8px] font-black uppercase text-slate-700 tracking-wider mb-1">Nominal Transaksi (Rp)</label>
                                    <input
                                      type="number"
                                      value={qrPayNominal}
                                      onChange={(e) => setQrPayNominal(Number(e.target.value))}
                                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-800"
                                      placeholder="Contoh: 150000"
                                      required
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-[8px]. font-black uppercase text-slate-700 tracking-wider mb-1">Status Pembayaran</label>
                                    <select
                                      value={qrPayStatus}
                                      onChange={(e) => setQrPayStatus(e.target.value as any)}
                                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-800 cursor-pointer"
                                    >
                                      <option value="Lunas">Lunas</option>
                                      <option value="Cicil">Cicil</option>
                                      <option value="Belum Bayar">Belum Bayar</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-[8px] font-black uppercase text-slate-700 tracking-wider mb-1">Catatan</label>
                                    <input
                                      type="text"
                                      value={qrPayCatatan}
                                      onChange={(e) => setQrPayCatatan(e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-800"
                                      placeholder="Lunas murni..."
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Form 5: Tabungan Santri */}
                            {selectedQrProgram === 'tabungan' && (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-[8px] font-black uppercase text-slate-700 tracking-wider mb-1">Jumlah Setor Saku Tabungan (Rp)</label>
                                  <input
                                    type="number"
                                    value={qrTabNominal}
                                    onChange={(e) => setQrTabNominal(Number(e.target.value))}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-teal-500 font-[#0f766e] font-bold"
                                    placeholder="Model: 10000, 20000..."
                                    required
                                  />
                                </div>
                              </div>
                            )}

                            <button
                              type="submit"
                              className="w-full bg-[#0f766e] hover:bg-teal-900 border-2 border-teal-600/30 text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-wider transition-all shadow-md mt-1 cursor-pointer flex items-center justify-center gap-2"
                            >
                              <CheckCircle className="w-3.5 h-3.5 text-amber-400" /> Simpan Data Cetak QR Cepat
                            </button>
                          </form>
                        ) : (
                          <div className="border border-dashed border-slate-250 bg-slate-50 rounded-xl p-4 text-center text-slate-800 text-[10px]">
                            Pilih salah satu menu program aktivitas di atas untuk mengisi formulir input cepat.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: KELAS MANAGEMENT */}
          {activeTab === 'kelas' && (
            <div className="flex flex-col text-left animate-fadeIn">

              <div className="px-4 mt-4 space-y-4">
                {/* Sub-Tabs Nav */}
                <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/40">
                  <button
                    onClick={() => {
                      setKelasSubTab('kelas');
                    }}
                    className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${kelasSubTab === 'kelas'
                      ? 'bg-teal-500 text-white shadow-sm'
                      : 'text-slate-800 hover:text-slate-800 hover:bg-slate-50/50'
                      }`}
                  >
                    Kelas / Halaqoh
                  </button>
                  <button
                    onClick={() => {
                      setKelasSubTab('pelajaran');
                      setFormKelasId('');
                      setFormSelectedKelasIds([]);
                      setFormQuranMethods(['']);
                      setFormHaditsDoa(['']);
                      setFormTilawahStages(['']);
                    }}
                    className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${kelasSubTab === 'pelajaran'
                      ? 'bg-teal-500 text-white shadow-sm'
                      : 'text-slate-800 hover:text-slate-800 hover:bg-slate-50/50'
                      }`}
                  >
                    Rekam Mata Pelajaran
                  </button>
                </div>

                {/* Sub-Tab 1: KELAS / HALAQOH */}
                {kelasSubTab === 'kelas' && (
                  <div className="space-y-4">
                    {selectedDetailClassId === null ? (
                      // List view
                      <div className="space-y-4">
                        <button
                          onClick={() => {
                            const name = prompt('Masukkan Nama Kelas / Halaqah Baru:');
                            if (name && name.trim()) {
                              onAddKelas(name.trim());
                              showToast('Halaqah Kelas Berhasil Dibuat!');
                            }
                          }}
                          className="w-full bg-white text-teal-800 hover:bg-teal-50 border border-teal-200 py-3 rounded-2xl text-xs font-bold btn-active uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4" /> Tambah Halaqah Baru
                        </button>

                        <div className="space-y-3">
                          {kelasList
                            .filter(k => k.nama_kelas.toLowerCase().includes(searchKelas.toLowerCase()))
                            .map((k, idx) => {
                              const classStudents = studentsInClass(k.nama_kelas);
                              const cur = findCurriculumForClass(k.id_kelas, k.nama_kelas);
                              const hasCurriculum = cur && (cur.quran_methods.length > 0 || cur.hadits_doa.length > 0 || cur.tilawah_stages.length > 0);

                              return (
                                <div
                                  key={idx}
                                  onClick={() => {
                                    setSelectedDetailClassId(k.id_kelas);
                                    setDetailTab('santri');
                                  }}
                                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:shadow-md hover:border-teal-300 hover:bg-teal-50 transition-all duration-300 cursor-pointer flex items-center justify-between"
                                >
                                  <div>
                                    <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                                      Kelas {k.nama_kelas}
                                    </h4>
                                    <p className="text-[10px] text-slate-700 font-semibold mt-1">
                                      {classStudents.length} Santri aktif • {hasCurriculum ? 'Kurikulum Tercatat' : 'Kurikulum Kosong'}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      onClick={() => {
                                        const newName = prompt(`Ubah Nama Kelas "${k.nama_kelas}" Menjadi:`, k.nama_kelas);
                                        if (newName && newName.trim() && newName.trim() !== k.nama_kelas) {
                                          onUpdateKelas(k.id_kelas, newName.trim());
                                          showToast('Nama kelas berhasil diperbarui!');
                                        }
                                      }}
                                      className="text-teal-600 hover:bg-teal-50 p-2 border border-transparent hover:border-teal-100 rounded-xl cursor-pointer"
                                      title="Edit Nama Kelas"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        requestConfirm(
                                          "Hapus Kelas",
                                          `Apakah Anda yakin ingin menghapus kelas ${k.nama_kelas}? Semua daftar relasi santri akan beralih ke Tanpa Kelas.`,
                                          () => {
                                            onDeleteKelas(k.id_kelas);
                                            showToast('Daftar kelas berhasil dihapus.');
                                          }
                                        );
                                      }}
                                      className="text-rose-500 hover:bg-rose-50 p-2 border border-transparent hover:border-rose-100 rounded-xl cursor-pointer"
                                      title="Hapus Kelas"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    ) : (
                      // Detailed view
                      (() => {
                        const selectedClass = kelasList.find(k => k.id_kelas === selectedDetailClassId);
                        if (!selectedClass) {
                          setSelectedDetailClassId(null);
                          return null;
                        }
                        const classStudents = studentsInClass(selectedClass.nama_kelas);
                        const curriculum = findCurriculumForClass(selectedClass.id_kelas, selectedClass.nama_kelas);

                        return (
                          <div className="space-y-4 animate-fadeIn">
                            {/* Header & Back Button */}
                            <div className="flex items-center justify-between">
                              <button
                                onClick={() => setSelectedDetailClassId(null)}
                                className="flex items-center gap-1.5 text-black font-medium hover:text-slate-800 text-xs font-bold cursor-pointer"
                              >
                                <ArrowLeft className="w-4 h-4" /> Kembali
                              </button>
                              <span className="text-[10px] bg-teal-50 border border-teal-200 text-teal-800 font-bold px-2.5 py-1 rounded-full">
                                ID: {selectedClass.id_kelas}
                              </span>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 border-t-4 border-t-teal-500 p-5 shadow-sm text-left space-y-2">
                              <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                                Halaman Kelas {selectedClass.nama_kelas}
                              </h4>
                              <p className="text-[10px] text-slate-700 font-semibold">
                                Total {classStudents.length} Santri Terdaftar di Kelas ini.
                              </p>
                            </div>

                            {/* Detail Tabs */}
                            <div className="flex border-b border-slate-200">
                              <button
                                onClick={() => setDetailTab('santri')}
                                className={`flex-1 pb-2.5 text-center text-xs font-bold border-b-2 transition-all cursor-pointer ${detailTab === 'santri'
                                  ? 'border-teal-600 text-teal-800 font-bold'
                                  : 'border-transparent text-slate-700 hover:text-black font-medium'
                                  }`}
                              >
                                Santri ({classStudents.length})
                              </button>
                              <button
                                onClick={() => setDetailTab('pelajaran')}
                                className={`flex-1 pb-2.5 text-center text-xs font-bold border-b-2 transition-all cursor-pointer ${detailTab === 'pelajaran'
                                  ? 'border-teal-600 text-teal-800 font-bold'
                                  : 'border-transparent text-slate-700 hover:text-black font-medium'
                                  }`}
                              >
                                Kurikulum Pelajaran
                              </button>
                            </div>

                            {/* DETAIL CONTENT: SANTRI LIST */}
                            {detailTab === 'santri' && (
                              <div className="space-y-2.5">
                                {classStudents.length === 0 ? (
                                  <p className="text-[10px] text-black font-medium italic py-6 text-center bg-white rounded-2xl border border-slate-100">
                                    Kelas ini kosong (Belum ada santri)
                                  </p>
                                ) : (
                                  classStudents.map((s, sIdx) => (
                                    <div key={sIdx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-3 hover:shadow-md transition-all">
                                      <div className="min-w-0 text-left">
                                        <h5 className="font-bold text-xs text-slate-800 truncate">{s.nama_santri}</h5>
                                        <p className="text-[9px] text-black font-medium font-semibold mt-0.5">NIS: {s.nis}</p>
                                        <div className="text-[9px] text-slate-800 flex items-center gap-1.5 mt-2 bg-slate-50 px-2.5 py-1.5 rounded-xl w-fit border border-slate-100">
                                          <span>User: <b className="text-slate-700">{s.username_ortu}</b></span>
                                          <span className="text-slate-300">|</span>
                                          <span>Pass: <b className="text-slate-700">{s.password_ortu}</b></span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                          onClick={() => setEditSantriItem(s)}
                                          className="text-teal-600 hover:text-teal-600 bg-teal-50 hover:bg-teal-100 p-2 rounded-xl transition-colors border border-teal-100 cursor-pointer"
                                          title="Edit Santri"
                                        >
                                          <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => {
                                            requestConfirm(
                                              "Hapus Santri",
                                              `Apakah Anda yakin ingin menghapus data santri ${s.nama_santri} dari database secara permanen?`,
                                              () => {
                                                onDeleteSantri(s.id_santri);
                                                showToast('Santri berhasil dikeluarkan.');
                                              }
                                            );
                                          }}
                                          className="text-rose-500 hover:text-teal-600 bg-teal-50 hover:bg-rose-100 p-2 rounded-xl transition-colors border border-rose-100 cursor-pointer"
                                          title="Hapus Santri"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}

                            {/* DETAIL CONTENT: MATA PELAJARAN LIST */}
                            {detailTab === 'pelajaran' && (
                              <div className="space-y-4">
                                {!curriculum || (curriculum.quran_methods.length === 0 && curriculum.hadits_doa.length === 0 && curriculum.tilawah_stages.length === 0) ? (
                                  <div className="bg-white p-6 rounded-2xl border border-slate-100 text-center space-y-3">
                                    <p className="text-[10px] text-black font-medium italic">Kurikulum pelajaran belum direkam untuk kelas ini.</p>
                                    <button
                                      onClick={() => {
                                        setFormKelasId(selectedClass.id_kelas);
                                        setFormSelectedKelasIds([selectedClass.id_kelas]);
                                        setFormQuranMethods(['']);
                                        setFormHaditsDoa(['']);
                                        setFormTilawahStages(['']);
                                        setKelasSubTab('pelajaran');
                                      }}
                                      className="mx-auto bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 text-xs font-bold py-2 px-4 rounded-xl cursor-pointer"
                                    >
                                      Buat Kurikulum Sekarang
                                    </button>
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    {/* Top Controls */}
                                    <div className="flex items-center justify-between bg-teal-50 border border-teal-100 rounded-2xl p-4">
                                      <div className="text-left">
                                        <h5 className="text-xs font-bold text-teal-800">Kurikulum Aktif</h5>
                                        <p className="text-[9px] text-teal-600">Sesuaikan materi ajar dan daftar metode.</p>
                                      </div>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => {
                                            setFormKelasId(curriculum.id_kelas);
                                            setFormSelectedKelasIds([curriculum.id_kelas]);
                                            setFormQuranMethods(curriculum.quran_methods.length > 0 ? curriculum.quran_methods : ['']);
                                            setFormHaditsDoa(curriculum.hadits_doa.length > 0 ? curriculum.hadits_doa : ['']);
                                            setFormTilawahStages(curriculum.tilawah_stages.length > 0 ? curriculum.tilawah_stages : ['']);
                                            setKelasSubTab('pelajaran');
                                          }}
                                          className="bg-white text-teal-700 hover:bg-teal-100 border border-teal-200 text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-xl cursor-pointer flex items-center gap-1 shadow-sm transition-all"
                                        >
                                          <Edit className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        <button
                                          onClick={() => {
                                            requestConfirm(
                                              "Hapus Kurikulum",
                                              `Apakah Anda yakin ingin menghapus seluruh rekaman pelajaran untuk kelas ini?`,
                                              () => {
                                                onUpdateMataPelajaran(prev => prev.filter(mp =>
                                                  !isCurriculumForClass(mp, selectedClass.id_kelas, selectedClass.nama_kelas)
                                                ));
                                                showToast('Seluruh kurikulum kelas berhasil dihapus.');
                                              }
                                            );
                                          }}
                                          className="bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-xl cursor-pointer flex items-center gap-1 shadow-sm transition-all"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" /> Hapus
                                        </button>
                                      </div>
                                    </div>

                                    {/* Quran methods section */}
                                    <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                                      <h5 className="font-bold text-xs text-slate-800 flex items-center gap-2">
                                        Metode Tahfidz Qur'an
                                      </h5>
                                      {curriculum.quran_methods.length === 0 ? (
                                        <p className="text-[10px] text-black font-medium italic">Tidak ada metode khusus.</p>
                                      ) : (
                                        <div className="flex flex-wrap gap-2 pt-1">
                                          {curriculum.quran_methods.map((method, mIdx) => (
                                            <span key={mIdx} className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-800 border border-teal-100 rounded-xl px-2.5 py-1.5 text-xs font-semibold">
                                              {method}
                                              <button
                                                onClick={() => {
                                                  requestConfirm(
                                                    "Hapus Metode",
                                                    `Hapus metode "${method}" dari kelas ini?`,
                                                    () => {
                                                      onUpdateMataPelajaran(prev => prev.map(mp => {
                                                        if (isCurriculumForClass(mp, selectedClass.id_kelas, selectedClass.nama_kelas)) {
                                                          const updated = [...mp.quran_methods];
                                                          updated.splice(mIdx, 1);
                                                          return { ...mp, quran_methods: updated };
                                                        }
                                                        return mp;
                                                      }));
                                                      showToast('Metode berhasil dihapus.');
                                                    }
                                                  );
                                                }}
                                                className="hover:bg-teal-100 text-teal-600 hover:text-rose-600 p-0.5 rounded transition-colors cursor-pointer"
                                                title="Hapus"
                                              >
                                                <X className="w-3 h-3" />
                                              </button>
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    {/* Hadits Doa section */}
                                    <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                                      <h5 className="font-bold text-xs text-slate-800 flex items-center gap-2">
                                        Hafalan (Hadits / Doa / Lainnya)
                                      </h5>
                                      {curriculum.hadits_doa.length === 0 ? (
                                        <p className="text-[10px] text-black font-medium italic">Tidak ada pelajaran hadits / doa.</p>
                                      ) : (
                                        <div className="flex flex-wrap gap-2 pt-1">
                                          {curriculum.hadits_doa.map((item, mIdx) => (
                                            <span key={mIdx} className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-100 rounded-xl px-2.5 py-1.5 text-xs font-semibold">
                                              {item}
                                              <button
                                                onClick={() => {
                                                  requestConfirm(
                                                    "Hapus Pelajaran",
                                                    `Hapus "${item}" dari kelas ini?`,
                                                    () => {
                                                      onUpdateMataPelajaran(prev => prev.map(mp => {
                                                        if (isCurriculumForClass(mp, selectedClass.id_kelas, selectedClass.nama_kelas)) {
                                                          const updated = [...mp.hadits_doa];
                                                          updated.splice(mIdx, 1);
                                                          return { ...mp, hadits_doa: updated };
                                                        }
                                                        return mp;
                                                      }));
                                                      showToast('Pelajaran berhasil dihapus.');
                                                    }
                                                  );
                                                }}
                                                className="hover:bg-amber-100 text-amber-600 hover:text-rose-600 p-0.5 rounded transition-colors cursor-pointer"
                                                title="Hapus"
                                              >
                                                <X className="w-3 h-3" />
                                              </button>
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    {/* Tilawah stages section */}
                                    <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                                      <h5 className="font-bold text-xs text-slate-800 flex items-center gap-2">
                                        Batas Tilawah (Tahapan / Jilid)
                                      </h5>
                                      {curriculum.tilawah_stages.length === 0 ? (
                                        <p className="text-[10px] text-black font-medium italic">Tidak ada tahapan tilawah.</p>
                                      ) : (
                                        <div className="flex flex-wrap gap-2 pt-1">
                                          {curriculum.tilawah_stages.map((stage, mIdx) => (
                                            <span key={mIdx} className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-850 border border-teal-100 rounded-xl px-2.5 py-1.5 text-xs font-semibold">
                                              {stage}
                                              <button
                                                onClick={() => {
                                                  requestConfirm(
                                                    "Hapus Tahapan",
                                                    `Hapus tahapan "${stage}" dari kelas ini?`,
                                                    () => {
                                                      onUpdateMataPelajaran(prev => prev.map(mp => {
                                                        if (isCurriculumForClass(mp, selectedClass.id_kelas, selectedClass.nama_kelas)) {
                                                          const updated = [...mp.tilawah_stages];
                                                          updated.splice(mIdx, 1);
                                                          return { ...mp, tilawah_stages: updated };
                                                        }
                                                        return mp;
                                                      }));
                                                      showToast('Tahapan berhasil dihapus.');
                                                    }
                                                  );
                                                }}
                                                className="hover:bg-teal-100 text-teal-600 hover:text-rose-600 p-0.5 rounded transition-colors cursor-pointer"
                                                title="Hapus"
                                              >
                                                <X className="w-3 h-3" />
                                              </button>
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })()
                    )}
                  </div>
                )}

                {/* Sub-Tab 2: REKAM MATA PELAJARAN */}
                {kelasSubTab === 'pelajaran' && (
                  <div className="space-y-4">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (formSelectedKelasIds.length === 0) {
                          showToast('Silakan pilih minimal satu kelas terlebih dahulu.');
                          return;
                        }

                        const qQuran = formQuranMethods.map(x => x.trim()).filter(Boolean);
                        const qHadits = formHaditsDoa.map(x => x.trim()).filter(Boolean);
                        const qTilawah = formTilawahStages.map(x => x.trim()).filter(Boolean);

                        if (qQuran.length === 0 && qHadits.length === 0 && qTilawah.length === 0) {
                          showToast('Silakan isi minimal satu metode atau pelajaran.');
                          return;
                        }

                        onUpdateMataPelajaran(prev => {
                          let updated = [...prev];
                          formSelectedKelasIds.forEach(cid => {
                            // Cari berdasarkan id_kelas saja untuk mencegah data ganda / double
                            const existingIdx = updated.findIndex(mp => isCurriculumForClass(mp, cid, ''));

                            const existingMp = existingIdx >= 0 ? updated[existingIdx] : null;
                            const newMp = {
                              id_kelas: cid,
                              quran_methods: qQuran,
                              hadits_doa: qHadits,
                              tilawah_stages: qTilawah,
                              // Pertahankan pembuat asli jika ada, jika tidak ada baru gunakan username sekarang
                              created_by: existingMp ? (existingMp.created_by || 'admin') : (user?.username || 'admin')
                            };

                            if (existingIdx >= 0) {
                              updated[existingIdx] = newMp;
                            } else {
                              updated.push(newMp);
                            }
                          });
                          return updated;
                        });

                        showToast(`Kurikulum Mata Pelajaran Berhasil Direkam untuk ${formSelectedKelasIds.length} kelas!`);
                        // Reset form
                        setFormKelasId('');
                        setFormSelectedKelasIds([]);
                        setFormQuranMethods(['']);
                        setFormHaditsDoa(['']);
                        setFormTilawahStages(['']);
                        setKelasSubTab('kelas');
                      }}
                      className="bg-white rounded-2xl border border-slate-200 border-t-4 border-t-teal-500 p-5 shadow-sm space-y-6"
                    >
                      <div className="flex flex-col gap-3.5">
                        <div className="flex flex-row items-center justify-between gap-2.5 flex-wrap">
                          <label className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            ● Pilih Kelas
                          </label>
                          <div className="flex gap-2 w-full sm:w-auto shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setFormSelectedKelasIds(kelasList.map(k => k.id_kelas));
                                showToast('Semua kelas berhasil dicentang!');
                              }}
                              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl transition-all cursor-pointer border shadow-sm text-[10px] font-bold ${kelasList.length > 0 && formSelectedKelasIds.length === kelasList.length
                                ? 'bg-teal-500 text-white border-teal-500 shadow-teal-500/20 shadow-md'
                                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                                }`}
                            >
                              Centang Semua
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setFormSelectedKelasIds([]);
                                showToast('Batal centang semua kelas.');
                              }}
                              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl transition-all cursor-pointer border shadow-sm text-[10px] font-bold ${formSelectedKelasIds.length === 0
                                ? 'bg-teal-500 text-white border-teal-500 shadow-teal-500/20 shadow-md'
                                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                                }`}
                            >
                              Batal Semua
                            </button>
                          </div>
                        </div>

                        {/* Checkboxes List of Classes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl max-h-[240px] overflow-y-auto shadow-inner">
                          {kelasList.map((k) => {
                            const isChecked = formSelectedKelasIds.includes(k.id_kelas);
                            return (
                              <label
                                key={k.id_kelas}
                                className={`flex items-center gap-3 p-3 rounded-xl border text-[11px] font-bold cursor-pointer transition-all ${isChecked
                                  ? 'bg-teal-50 border-teal-200 text-teal-800 ring-1 ring-teal-200'
                                  : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700'
                                  }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    let nextSelected = [...formSelectedKelasIds];
                                    if (e.target.checked) {
                                      if (!nextSelected.includes(k.id_kelas)) {
                                        nextSelected.push(k.id_kelas);
                                      }
                                      // Auto load template jika ini adalah kelas pertama yang dipilih
                                      if (nextSelected.length === 1) {
                                        const existing = findCurriculumForClass(k.id_kelas, k.nama_kelas);
                                        if (existing) {
                                          setFormQuranMethods(existing.quran_methods.length > 0 ? existing.quran_methods : ['']);
                                          setFormHaditsDoa(existing.hadits_doa.length > 0 ? existing.hadits_doa : ['']);
                                          setFormTilawahStages(existing.tilawah_stages.length > 0 ? existing.tilawah_stages : ['']);
                                          setFormKelasId(k.id_kelas);
                                        }
                                      }
                                    } else {
                                      nextSelected = nextSelected.filter(id => id !== k.id_kelas);
                                    }
                                    setFormSelectedKelasIds(nextSelected);
                                  }}
                                  className="w-3.5 h-3.5 accent-teal-600 rounded cursor-pointer shrink-0"
                                />
                                <span className="truncate">{k.nama_kelas}</span>
                              </label>
                            );
                          })}
                          {kelasList.length === 0 && (
                            <p className="col-span-full text-center text-slate-700 italic py-2 text-[10px]">
                              Belum ada data kelas. Silakan tambahkan kelas terlebih dahulu.
                            </p>
                          )}
                        </div>

                        {/* Template Loader Dropdown for copying existing curriculum */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[9px] text-slate-800 mt-1 bg-white p-2.5 rounded-xl border border-slate-200/80">
                          <div className="flex items-center gap-1 shrink-0 font-semibold text-black">
                            <span>Dicentang: <b className="text-teal-700 text-[10px]">{formSelectedKelasIds.length} Kelas</b></span>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-3.5 min-w-0 w-full sm:w-auto">
                            <span className="shrink-0 font-medium text-black">Salin dari Templat Kelas:</span>
                            <select
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val) {
                                  const selectedClassObj = kelasList.find(k => k.id_kelas === val);
                                  const existing = findCurriculumForClass(val, selectedClassObj?.nama_kelas || '');
                                  if (existing) {
                                    setFormQuranMethods(existing.quran_methods.length > 0 ? existing.quran_methods : ['']);
                                    setFormHaditsDoa(existing.hadits_doa.length > 0 ? existing.hadits_doa : ['']);
                                    setFormTilawahStages(existing.tilawah_stages.length > 0 ? existing.tilawah_stages : ['']);
                                    showToast(`Berhasil memuat templat dari kelas ${selectedClassObj?.nama_kelas || val}`);
                                  } else {
                                    showToast('Kelas ini belum memiliki rekaman kurikulum.');
                                  }
                                }
                              }}
                              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-1 px-1.5 text-[9px] font-bold text-slate-700 cursor-pointer outline-none max-w-xs truncate"
                            >
                              <option value="">Pilih Templat</option>
                              {kelasList.map(k => {
                                const hasCur = !!findCurriculumForClass(k.id_kelas, k.nama_kelas);
                                if (!hasCur) return null;
                                return <option key={k.id_kelas} value={k.id_kelas}>{k.nama_kelas}</option>;
                              })}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Quran Methods */}
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          ● Metode Tahfidz Qur'an
                        </label>
                        <p className="text-[9px] text-slate-700">Tentukan daftar metode hafalan santri (misal: ziyadah, murojaah, sabaq, dll).</p>
                        <div className="space-y-2">
                          {formQuranMethods.map((m, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={m}
                                onChange={(e) => {
                                  const updated = [...formQuranMethods];
                                  updated[idx] = e.target.value;
                                  setFormQuranMethods(updated);
                                }}
                                className="flex-grow bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-2.5 py-2 min-w-0 text-xs outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-slate-800"
                                placeholder="Contoh: Ziyadah"
                                required={idx === 0}
                              />
                              {idx === formQuranMethods.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => setFormQuranMethods([...formQuranMethods, ''])}
                                  className="bg-teal-500 hover:bg-teal-600 text-white p-2.5 rounded-xl cursor-pointer transition-all active:scale-95 shrink-0"
                                  title="Tambah"
                                >
                                  <Plus className="w-4 h-4 font-black" />
                                </button>
                              )}
                              {formQuranMethods.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...formQuranMethods];
                                    updated.splice(idx, 1);
                                    setFormQuranMethods(updated);
                                  }}
                                  className="bg-rose-50 text-rose-500 hover:bg-rose-100 border border-rose-200 p-2 rounded-xl cursor-pointer shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Hadits Doa */}
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          ● Pelajaran Hafalan (Hadits / Doa / Lainnya)
                        </label>
                        <p className="text-[9px] text-slate-700">Tentukan daftar target hadits atau doa harian (misal: Doa Masuk WC, Hadits Ke-1, dll).</p>
                        <div className="space-y-2">
                          {formHaditsDoa.map((h, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={h}
                                onChange={(e) => {
                                  const updated = [...formHaditsDoa];
                                  updated[idx] = e.target.value;
                                  setFormHaditsDoa(updated);
                                }}
                                className="flex-grow bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-2.5 py-2 min-w-0 text-xs outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-slate-800"
                                placeholder="Contoh: Hadits Ke-1 atau Doa Masuk WC"
                                required={idx === 0}
                              />
                              {idx === formHaditsDoa.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => setFormHaditsDoa([...formHaditsDoa, ''])}
                                  className="bg-teal-500 hover:bg-teal-600 text-white p-2.5 rounded-xl cursor-pointer transition-all active:scale-95 shrink-0"
                                  title="Tambah"
                                >
                                  <Plus className="w-4 h-4 font-black" />
                                </button>
                              )}
                              {formHaditsDoa.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...formHaditsDoa];
                                    updated.splice(idx, 1);
                                    setFormHaditsDoa(updated);
                                  }}
                                  className="bg-rose-50 text-rose-500 hover:bg-rose-100 border border-rose-200 p-2 rounded-xl cursor-pointer shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tilawah stages */}
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          ● Batas Tilawah / Tahapan Bacaan
                        </label>
                        <p className="text-[9px] text-slate-700">Tentukan tahapan atau jilid tilawah santri (misal: Iqro' 1, Ummi 1, Juz Amma, dll).</p>
                        <div className="space-y-2">
                          {formTilawahStages.map((t, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={t}
                                onChange={(e) => {
                                  const updated = [...formTilawahStages];
                                  updated[idx] = e.target.value;
                                  setFormTilawahStages(updated);
                                }}
                                className="flex-grow bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-2.5 py-2 min-w-0 text-xs outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-slate-800"
                                placeholder="Contoh: Iqro' 1 atau Ummi 1"
                                required={idx === 0}
                              />
                              {idx === formTilawahStages.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => setFormTilawahStages([...formTilawahStages, ''])}
                                  className="bg-teal-500 hover:bg-teal-600 text-white p-2.5 rounded-xl cursor-pointer transition-all active:scale-95 shrink-0"
                                  title="Tambah"
                                >
                                  <Plus className="w-4 h-4 font-black" />
                                </button>
                              )}
                              {formTilawahStages.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...formTilawahStages];
                                    updated.splice(idx, 1);
                                    setFormTilawahStages(updated);
                                  }}
                                  className="bg-rose-50 text-rose-500 hover:bg-rose-100 border border-rose-200 p-2 rounded-xl cursor-pointer shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-teal-500 hover:bg-teal-600 border-2 border-teal-400/30 text-white font-black py-3 rounded-2xl text-[10px] uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                      >
                        Simpan Kurikulum Kelas
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: REDESIGNED RIWAYAT VIEW - THE FOCUS OF USER DIRECTION */}
          {activeTab === 'riwayat' && (
            <div className="flex flex-col text-left animate-fadeIn">

              {/* PADDED CONTENT CONTAINER */}
              <div className="px-4 mt-2 space-y-5">
                {/* CARD FOR FILTER */}
                <section className="relative overflow-hidden bg-white rounded-[2rem] border border-slate-100/80 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-5 text-left animate-fadeIn">
                  {/* Green accent line on top */}
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-400 to-teal-500"></div>

                  {/* Row 1: Pilih Kelas & Pilih Nama */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* PILIH KELAS */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[9px] font-extrabold text-black uppercase tracking-wider pl-3.5">
                        PILIH KELAS
                      </label>
                      <div className="relative">
                        <select
                          value={filterKelas}
                          onChange={(e) => onFilterValueChange('kelas', e.target.value)}
                          className="w-full bg-slate-50/50 border border-slate-200/80 rounded-xl pl-3.5 pr-10 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 cursor-pointer text-slate-700 font-bold h-[42px] appearance-none shadow-3xs"
                        >
                          <option value=""> Pilih Kelas</option>
                          {kelasList.map(k => <option key={k.id_kelas} value={k.nama_kelas}>{k.nama_kelas}</option>)}
                        </select>
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-700">
                          <ChevronsUpDown className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>

                    {/* PILIH NAMA */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[9px] font-extrabold text-black uppercase tracking-wider pl-3.5">
                        PILIH NAMA
                      </label>
                      <div className="relative">
                        <select
                          disabled={!filterKelas}
                          value={filterNama}
                          onChange={(e) => onFilterValueChange('nama', e.target.value)}
                          className="w-full bg-slate-50/50 border border-slate-200/80 rounded-xl pl-3.5 pr-10 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 cursor-pointer text-slate-700 font-bold h-[42px] disabled:bg-slate-50 disabled:opacity-50 appearance-none shadow-3xs"
                        >
                          <option value="">Pilih Nama</option>
                          {filterKelas && studentsInClass(filterKelas).map((s, idx) => (
                            <option key={`${s.id_santri}-${idx}`} value={s.id_santri}>{s.nama_santri}</option>
                          ))}
                        </select>
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-700">
                          <ChevronsUpDown className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Pilih Menu */}
                  <div className="flex flex-col gap-1.5 text-left w-full">
                    <label className="text-[9px] font-extrabold text-black uppercase tracking-wider pl-3.5">
                      PILIH MENU
                    </label>
                    <div className="relative">
                      <select
                        value={filterMenu}
                        onChange={(e) => onFilterValueChange('menu', e.target.value)}
                        className="w-full bg-slate-50/50 border border-slate-200/80 rounded-xl pl-3.5 pr-10 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 cursor-pointer text-slate-700 font-bold h-[42px] appearance-none shadow-3xs"
                      >
                        <option value="">Pilih Menu Laporan/Aktivitas</option>
                        <option value="Semua">Semua Catatan / Buku Induk</option>
                        <option value="Hafalan">Tahfidz Al-Qur'an</option>
                        <option value="Tilawah">Tilawah Batas Jilid</option>
                        <option value="Hadits">Hafalan (Hadits & Do'a)</option>
                        <option value="Pembayaran">SPP & Keuangan</option>
                        <option value="Tabungan">Saku Kas & Tabungan</option>
                        <option value="Mutabaah">Jurnal Mutabaah Harian</option>
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-700">
                        <ChevronsUpDown className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Tanggal Mulai & Tanggal Akhir */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* TANGGAL MULAI */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[9px] font-extrabold text-black uppercase tracking-wider pl-3.5">
                        TANGGAL MULAI
                      </label>
                      <input
                        type="date"
                        value={filterTglMulai}
                        onChange={(e) => onFilterValueChange('tglMulai', e.target.value)}
                        className={`bg-slate-50/50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 cursor-pointer w-full h-[42px] font-bold shadow-3xs ${filterTglMulai ? 'text-slate-700' : 'text-slate-700'}`}
                      />
                    </div>

                    {/* TANGGAL AKHIR */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[9px] font-extrabold text-black uppercase tracking-wider pl-3.5">
                        TANGGAL AKHIR
                      </label>
                      <input
                        type="date"
                        value={filterTglAkhir}
                        onChange={(e) => onFilterValueChange('tglAkhir', e.target.value)}
                        className={`bg-slate-50/50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 cursor-pointer w-full h-[42px] font-bold shadow-3xs ${filterTglAkhir ? 'text-slate-700' : 'text-slate-700'}`}
                      />
                    </div>
                  </div>

                  {/* Row 4: Submit Button */}
                  <div className="pt-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleApplyFilter()}
                      className="w-full bg-teal-500 text-white border border-teal-500 rounded-full text-xs font-black uppercase tracking-widest hover:bg-teal-600 py-3.5 px-8 transition-all duration-300 active:scale-[0.98] btn-active shadow-md text-center cursor-pointer"
                    >
                      TERAPKAN FILTER
                    </button>
                  </div>
                </section>

                {/* RESULTS SCREEN - Hide / Empty state initially if not applied */}
                {!isFilterApplied ? (
                  <div className="flex flex-col items-center justify-center bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-800 py-12">
                    <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <History className="h-6 w-6 text-slate-450" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800">Data Belum Ditampilkan</h3>
                    <p className="text-xs text-slate-700 text-center max-w-xs mt-1 leading-relaxed">
                      Silakan tentukan secara lengkap isian filter kelas, nama, menu, dan rentang tanggal untuk melihat daftar hasil riwayat akademik.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 uppercase tracking-widest pl-1 mt-3">
                      <span>Hasil Filter</span>
                      <span className="text-slate-800">{appliedResults.length} Catatan Ditemukan</span>
                    </div>

                    {/* Sorting Toolbar */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Urutkan Berdasarkan:</span>
                        <div className="flex flex-wrap gap-1">
                          {[
                            { id: 'date', label: 'Tanggal' },
                            { id: 'class', label: 'Kelas' },
                            { id: 'name', label: 'Nama Santri' },
                            { id: 'menu', label: 'Menu/Tipe' }
                          ].map((col) => {
                            const isActive = sortField === col.id;
                            return (
                              <button
                                key={col.id}
                                type="button"
                                onClick={() => {
                                  if (isActive) {
                                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                  } else {
                                    setSortField(col.id as any);
                                    setSortOrder('asc');
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all flex items-center gap-1.5 border cursor-pointer ${isActive
                                  ? 'bg-slate-900 border-slate-900 text-white font-bold shadow-sm'
                                  : 'bg-slate-50 border-slate-200 text-black font-medium hover:bg-slate-100'
                                  }`}
                              >
                                <span>{col.label}</span>
                                {isActive && (
                                  sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-amber-400" /> : <ChevronDown className="w-3 h-3 text-amber-400" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end md:self-auto border-t md:border-t-0 pt-2 md:pt-0 border-slate-100 w-full md:w-auto justify-end">
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Arah:</span>
                        <button
                          type="button"
                          onClick={() => setSortOrder('asc')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all border cursor-pointer ${sortOrder === 'asc'
                            ? 'bg-slate-900 border-slate-900 text-white font-bold shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-black font-medium hover:bg-slate-100'
                            }`}
                        >
                          Asc (A-Z)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSortOrder('desc')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all border cursor-pointer ${sortOrder === 'desc'
                            ? 'bg-slate-900 border-slate-900 text-white font-bold shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-black font-medium hover:bg-slate-100'
                            }`}
                        >
                          Desc (Z-A)
                        </button>
                      </div>
                    </div>

                    {sortedAppliedResults.length === 0 ? (
                      <div className="text-center py-12 bg-white rounded-xl border border-slate-100 text-slate-405 text-xs italic">
                        Tidak ditemukan data riwayat untuk kombinasi filter dan rentang tanggal di atas.
                      </div>
                    ) : (
                      sortedAppliedResults.map((rec, idx) => {
                        const isSetoran = rec.type === 'Hafalan' || rec.type === 'Tilawah' || rec.type === 'Hadits';
                        const isFinance = rec.type === 'Pembayaran';
                        const isMutabaah = rec.type === 'Mutabaah';

                        return (
                          <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden text-left flex flex-col gap-3 hover:shadow-md transition-shadow animate-fadeIn">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-900 rounded-r-full"></div>

                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-700">{formatTanggal(rec.tanggal)}</span>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase bg-slate-100 text-slate-700`}>
                                {rec.type}
                              </span>
                            </div>

                            <div>
                              <h4 className="font-bold text-xs text-slate-800">
                                {rec.nama_santri} <span className="text-[10px] text-slate-700 font-normal">({santriList.find(s => s.id_santri === rec.id_santri)?.halaqah || '-'})</span>
                              </h4>
                              <p className="text-[10.5px] font-bold text-slate-800 mt-1">{rec.desc}</p>
                              {rec.catatan && <p className="text-[11px] text-slate-800 italic mt-1 bg-slate-50 p-2 rounded">"{rec.catatan}"</p>}
                            </div>

                            {/* Numeric values */}
                            {rec.nominal > 0 && (
                              <p className="text-xs font-bold text-slate-800">
                                Nominal Kas: <span className="text-teal-600">{formatRupiah(rec.nominal)}</span>
                              </p>
                            )}

                            <div className="flex items-center justify-between border-t border-slate-50 pt-2 mt-1">
                              <span className="text-[9px] text-slate-700">Oleh: {rec.nama_ustadz}</span>
                              <div className="flex gap-2">
                                {isSetoran && (
                                  <button
                                    onClick={() => setEditSetoranItem(rec)}
                                    className="text-black font-medium hover:text-slate-900 p-1 rounded-md border"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    requestConfirm(
                                      "Hapus Catatan Sejarah",
                                      "Apakah Anda yakin ingin menghapus catatan riwayat sejarah ini secara permanen dari database?",
                                      () => {
                                        if (isSetoran) onDeleteSetoran(rec.id_setoran);
                                        else if (isFinance) onDeletePembayaran(rec.id_setoran);
                                        else if (isMutabaah) onDeleteMutabaah(rec.id_setoran);
                                        else onDeleteTabungan(rec.id_setoran);

                                        // Refresh applied values
                                        setAppliedResults(appliedResults.filter(r => r.id_setoran !== rec.id_setoran));
                                        showToast('Catatan berhasil dihapus dari arsip.');
                                      }
                                    );
                                  }}
                                  className="text-rose-500 hover:text-rose-600 p-1 rounded-md border border-rose-100"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: TABUNGAN */}
          {activeTab === 'tabungan' && (
            <div className="flex flex-col text-left animate-fadeIn">

              {/* STICKY HEADER WRAPPER FOR TABUNGAN */}
              <div className="hidden">
                <div className="bg-teal-600 text-white pt-4 pb-8 px-5 relative overflow-hidden shadow-[0_4px_20px_rgba(13,75,69,0.12)]">
                  <div className="absolute top-0 right-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

                  <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none select-none">
                    <svg className="w-32 h-32 text-amber-200" viewBox="0 0 100 100" fill="currentColor">
                      <path d="M50,10 C40,25 35,35 35,45 C35,60 42,75 50,90 C58,75 65,60 65,45 C65,35 60,25 50,10 Z" />
                      <rect x="47" y="30" width="6" height="40" rx="3" />
                      <rect x="40" y="47" width="20" height="6" rx="3" />
                    </svg>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setActiveTab('beranda')}
                        className="bg-white/10 hover:bg-white/25 p-2 rounded-xl border border-white/10 text-white shadow-xs transition-all focus:ring-2 focus:ring-white/20 cursor-pointer flex items-center justify-center shrink-0"
                      >
                        <ChevronRight className="w-4 h-4 rotate-180" />
                      </button>
                      <div className="relative w-11 h-11 rounded-full border-2 border-yellow-400 p-0.5 bg-[#042f2e] flex items-center justify-center shadow-md overflow-hidden shrink-0">
                        {pengaturan?.logo ? (
                          <img
                            src={getCleanImageUrl(pengaturan.logo)}
                            alt={pengaturan.nama_lembaga || "Logo"}
                            className="w-full h-full object-cover rounded-full"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const fallbackIcon = document.getElementById('header-fallback-icon-tabungan');
                              if (fallbackIcon) fallbackIcon.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          id="header-fallback-icon-tabungan"
                          style={{ display: pengaturan?.logo ? 'none' : 'flex' }}
                          className="w-full h-full items-center justify-center text-yellow-300 font-bold"
                        >
                          <i className="fa-solid fa-mosque text-lg text-yellow-400 animate-pulse"></i>
                        </div>
                      </div>

                      <div className="text-left min-w-0">
                        <p className="text-amber-300 text-[8px] font-black uppercase tracking-widest leading-none mb-1">SIM TPQ DIGITAL</p>

                        <h3 className="text-sm font-bold tracking-tight text-white flex flex-wrap items-center gap-1.5 mt-0.5">
                          {getCleanName(user.nama_lengkap)}
                          <span className="w-3.5 h-3.5 bg-teal-500 rounded-full flex items-center justify-center text-white p-0.5 shadow-xs shrink-0" title="Verified Account">
                            <CheckCircle className="w-2.5 h-2.5 text-white" />
                          </span>
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {onSyncData && (
                        <button
                          onClick={() => {
                            onSyncData();
                            showToast("Memperbarui data pusat secara aman...");
                          }}
                          disabled={isSyncing}
                          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all btn-active ${isSyncing
                            ? 'bg-teal-600/40 border-teal-500/40 text-teal-300 animate-spin cursor-not-allowed'
                            : 'bg-white/10 border-white/20 text-teal-100 hover:bg-white/20 hover:text-white cursor-pointer'
                            }`}
                          title="Perbarui Data Hub"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      )}

                      <button
                        onClick={onLogout}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-rose-500 hover:text-white border border-white/20 flex items-center justify-center text-rose-200 transition-all btn-active cursor-pointer"
                        title="Keluar Akun"
                      >
                        <LogOut className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <div className="bg-white/15 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-bold text-white border border-white/10 shadow-3xs">
                      <Calendar className="w-3.5 h-3.5 text-amber-300" />
                      <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="bg-white/15 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-bold text-white border border-white/10 shadow-3xs">
                      <Clock className="w-3.5 h-3.5 text-amber-300" />
                      <span>{getHijriDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 space-y-4">
                <div className="flex items-center gap-3 pl-2 border-l-4 border-slate-900/90 py-0.5 text-left">
                  <h3 className="text-sm font-bold text-slate-800 leading-tight">Koran Tabungan Santri</h3>
                </div>

                {/* Redesigned filter section meeting exact specifications */}
                <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Pilih Kelas</label>
                      <select
                        value={filterTabunganKelas}
                        onChange={(e) => {
                          setFilterTabunganKelas(e.target.value);
                          setFilterTabunganNama('');
                          setIsTabunganFilterApplied(false);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:bg-white focus:border-teal-500 transition-all font-semibold"
                      >
                        <option value="">-- Pilih --</option>
                        {kelasList.map(k => <option key={k.id_kelas} value={k.nama_kelas}>{k.nama_kelas}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Pilih Nama</label>
                      <select
                        disabled={!filterTabunganKelas}
                        value={filterTabunganNama}
                        onChange={(e) => {
                          setFilterTabunganNama(e.target.value);
                          setIsTabunganFilterApplied(false);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:bg-white focus:border-teal-500 transition-all font-semibold"
                      >
                        <option value="">-- Pilih --</option>
                        {filterTabunganKelas && (
                          <>
                            <option value="Semua">Semua Santri</option>
                            {studentsInClass(filterTabunganKelas).map(s => (
                              <option key={s.id_santri} value={s.id_santri}>{s.nama_santri}</option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  {!isTabunganFilterApplied && (
                    <button
                      onClick={() => {
                        if (!filterTabunganKelas || !filterTabunganNama) {
                          alert("Silakan pilih kelas dan nama santri terlebih dahulu!");
                          return;
                        }
                        setIsTabunganFilterApplied(true);
                      }}
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white font-extrabold py-3 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md btn-active"
                    >
                      Terapkan Filter
                    </button>
                  )}
                </div>

                {/* Results displayed only when filter is applied */}
                {!isTabunganFilterApplied ? (
                  <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 text-center flex flex-col items-center justify-center gap-3">
                    <Search className="w-5 h-5 text-slate-300" />
                    <p className="text-[10px] text-slate-700 font-medium leading-relaxed max-w-[220px] mx-auto">
                      Silakan tentukan kolom kelas, nama santri, dan klik tombol <b className="text-slate-800 font-extrabold">Terapkan Filter</b> untuk memuat informasi laporan saku tabungan.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Export actions menu bar */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 mb-2">
                      <div>
                        <span className="text-[9px] font-extrabold uppercase text-slate-700 tracking-wider">Ekspor Koran Saku</span>
                        <h5 className="font-bold text-xs text-slate-800">Unduh Rekap Laporan Tabungan</h5>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setPdfSignType('tabungan');
                            setPdfSignName(invSekretaris || '');
                            setShowPdfSignModal(true);
                          }}
                          className="bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-100 rounded-xl px-3.5 py-2 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                        >
                          <Printer className="w-3.5 h-3.5" /> Cetak PDF
                        </button>
                        <button
                          onClick={() => downloadTabunganExcel()}
                          className="bg-teal-600 text-white hover:bg-teal-700 rounded-xl px-3.5 py-2 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm transition-all whitespace-nowrap"
                        >
                          <Download className="w-3.5 h-3.5 text-amber-300" /> Ekspor Excel
                        </button>
                      </div>
                    </div>

                    {(() => {
                      const classStudents = filterTabunganKelas ? studentsInClass(filterTabunganKelas) : [];
                      const displayStudents = filterTabunganNama === 'Semua'
                        ? classStudents
                        : classStudents.filter(s => s.id_santri === filterTabunganNama);

                      if (displayStudents.length === 0) {
                        return (
                          <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-xl text-xs text-center">
                            Santri tidak ditemukan.
                          </div>
                        );
                      }

                      return displayStudents.map(filteredSantri => {
                        const matchedTabungans = tabunganList.filter(t => t.id_santri === filteredSantri.id_santri);
                        const totalSaldo = matchedTabungans.reduce((acc, curr) => acc + curr.nominal, 0);
                        const isExpanded = tabExpandedStudentId === filteredSantri.id_santri;

                        return (
                          <div key={filteredSantri.id_santri} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm transition-all">
                            {/* Long Card main display */}
                            <div
                              onClick={() => setTabExpandedStudentId(isExpanded ? null : filteredSantri.id_santri)}
                              className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-all select-none"
                            >
                              <div>
                                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 uppercase">
                                  Kelas {filteredSantri.halaqah}
                                </span>
                                <h4 className="font-bold text-sm text-slate-800 mt-1">{filteredSantri.nama_santri}</h4>
                                <p className="text-[10px] text-slate-700 font-mono mt-0.5">NIS: {filteredSantri.nis}</p>
                              </div>
                              <div className="text-right flex items-center gap-3 animate-fadeIn">
                                <div>
                                  <p className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Total Tabungan</p>
                                  <span className="text-sm font-extrabold text-teal-600">{formatRupiah(totalSaldo)}</span>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-405">
                                  {isExpanded ? <ChevronUp className="w-4 h-4 text-teal-700" /> : <ChevronDown className="w-4 h-4" />}
                                </div>
                              </div>
                            </div>

                            {/* Expandable view: detailed logs table */}
                            {isExpanded && (
                              <div className="p-5 bg-slate-50/50 border-t border-slate-100 animate-fadeIn text-slate-800 text-xs">
                                <h5 className="font-bold text-slate-700 uppercase tracking-wider text-[9px] mb-3">Detail Transaksi Tabungan - {filteredSantri.nama_santri}</h5>
                                {matchedTabungans.length === 0 ? (
                                  <p className="text-slate-700 text-xs italic text-center py-4 bg-white rounded-2xl border border-slate-100">Belum ada mutasi setoran tabungan.</p>
                                ) : (
                                  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-inner">
                                    <table className="w-full text-left border-collapse">
                                      <thead>
                                        <tr className="bg-slate-50 text-slate-800 uppercase text-[9px] font-extrabold tracking-wider border-b border-slate-200">
                                          <th className="py-3 px-4">No</th>
                                          <th className="py-3 px-4">Tanggal</th>
                                          <th className="py-3 px-4 text-right">Nominal</th>
                                          <th className="py-3 px-4 text-center">Aksi</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 text-black font-medium font-medium">
                                        {matchedTabungans.map((t, idx) => (
                                          <tr key={t.id} className="hover:bg-slate-50/70 transition-all">
                                            <td className="py-3 px-4 font-mono text-[10px]">{idx + 1}</td>
                                            <td className="py-3 px-4 font-semibold text-[11px]">{formatTanggal(t.tanggal)}</td>
                                            <td className="py-3 px-4 text-right font-bold text-teal-600 text-xs">{formatRupiah(t.nominal)}</td>
                                            <td className="py-3 px-4 text-center">
                                              <div className="flex items-center justify-center gap-1.5" onClick={(ex) => ex.stopPropagation()}>
                                                {/* Cetak Kwitansi */}
                                                <button
                                                  onClick={() => {
                                                    const printContent = `
========================================
       KWITANSI TABUNGAN SANTRI
       Lembaga: ${pengaturan.nama_lembaga}
========================================
Nama        : ${filteredSantri.nama_santri}
Kelas       : ${filteredSantri.halaqah}
NIS         : ${filteredSantri.nis}
----------------------------------------
No. Ref     : ${t.id}
Tanggal     : ${formatTanggal(t.tanggal)}
Nominal     : ${formatRupiah(t.nominal)}
Status      : BERHASIL DISIMPAN / DIKREDITKAN
----------------------------------------
Pimpinan: ${pengaturan.nama_pimpinan}
========================================
      Terima kasih atas kepercayaannya.
`;
                                                    const win = window.open("", "_blank");
                                                    if (win) {
                                                      win.document.write("<pre>" + printContent + "</pre>");
                                                      win.document.close();
                                                      win.print();
                                                    } else {
                                                      alert("Pop-up diblokir! Berikut isi kwitansi Anda:\n" + printContent);
                                                    }
                                                  }}
                                                  className="p-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-100 transition-all cursor-pointer"
                                                  title="Cetak Kwitansi"
                                                >
                                                  <Printer className="w-3.5 h-3.5" />
                                                </button>

                                                {/* Edit Tabungan Button */}
                                                <button
                                                  onClick={() => setEditTabunganItem(t)}
                                                  className="p-1.5 rounded-lg bg-slate-50 text-black font-medium hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
                                                  title="Edit Transaksi"
                                                >
                                                  <Edit className="w-3.5 h-3.5" />
                                                </button>

                                                {/* Hapus Tabungan Button */}
                                                <button
                                                  onClick={() => {
                                                    requestConfirm(
                                                      "Hapus Tabungan",
                                                      `Apakah Anda yakin ingin menghapus data tabungan senilai ${formatRupiah(t.nominal)} ini secara permanen?`,
                                                      () => {
                                                        onDeleteTabungan(t.id);
                                                        showToast("Laporan tabungan telah dihapus.");
                                                      }
                                                    );
                                                  }}
                                                  className="p-1.5 rounded-lg bg-rose-50 text-rose-550 hover:bg-rose-100 border border-rose-100 transition-all cursor-pointer"
                                                  title="Hapus Transaksi"
                                                >
                                                  <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: INFORMASI BROADCASTER */}
          {activeTab === 'informasi' && (
            <div className="flex flex-col text-left animate-fadeIn">

              {/* STICKY HEADER WRAPPER FOR INFORMASI */}
              <div className="hidden">
                <div className="bg-teal-600 text-white pt-4 pb-8 px-5 relative overflow-hidden shadow-[0_4px_20px_rgba(13,75,69,0.12)]">
                  <div className="absolute top-0 right-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

                  <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none select-none">
                    <svg className="w-32 h-32 text-amber-200" viewBox="0 0 100 100" fill="currentColor">
                      <path d="M50,10 C40,25 35,35 35,45 C35,60 42,75 50,90 C58,75 65,60 65,45 C65,35 60,25 50,10 Z" />
                      <rect x="47" y="30" width="6" height="40" rx="3" />
                      <rect x="40" y="47" width="20" height="6" rx="3" />
                    </svg>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setActiveTab('beranda')}
                        className="bg-white/10 hover:bg-white/25 p-2 rounded-xl border border-white/10 text-white shadow-xs transition-all focus:ring-2 focus:ring-white/20 cursor-pointer flex items-center justify-center shrink-0"
                      >
                        <ChevronRight className="w-4 h-4 rotate-180" />
                      </button>
                      <div className="relative w-11 h-11 rounded-full border-2 border-yellow-400 p-0.5 bg-[#042f2e] flex items-center justify-center shadow-md overflow-hidden shrink-0">
                        {pengaturan?.logo ? (
                          <img
                            src={getCleanImageUrl(pengaturan.logo)}
                            alt={pengaturan.nama_lembaga || "Logo"}
                            className="w-full h-full object-cover rounded-full"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const fallbackIcon = document.getElementById('header-fallback-icon-informasi');
                              if (fallbackIcon) fallbackIcon.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          id="header-fallback-icon-informasi"
                          style={{ display: pengaturan?.logo ? 'none' : 'flex' }}
                          className="w-full h-full items-center justify-center text-yellow-300 font-bold"
                        >
                          <i className="fa-solid fa-mosque text-lg text-yellow-400 animate-pulse"></i>
                        </div>
                      </div>

                      <div className="text-left min-w-0">
                        <p className="text-amber-300 text-[8px] font-black uppercase tracking-widest leading-none mb-1">SIM TPQ DIGITAL</p>

                        <h3 className="text-sm font-bold tracking-tight text-white flex flex-wrap items-center gap-1.5 mt-0.5">
                          {getCleanName(user.nama_lengkap)}
                          <span className="w-3.5 h-3.5 bg-teal-500 rounded-full flex items-center justify-center text-white p-0.5 shadow-xs shrink-0" title="Verified Account">
                            <CheckCircle className="w-2.5 h-2.5 text-white" />
                          </span>
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {onSyncData && (
                        <button
                          onClick={() => {
                            onSyncData();
                            showToast("Memperbarui data pusat secara aman...");
                          }}
                          disabled={isSyncing}
                          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all btn-active ${isSyncing
                            ? 'bg-teal-600/40 border-teal-500/40 text-teal-300 animate-spin cursor-not-allowed'
                            : 'bg-white/10 border-white/20 text-teal-100 hover:bg-white/20 hover:text-white cursor-pointer'
                            }`}
                          title="Perbarui Data Hub"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      )}

                      <button
                        onClick={onLogout}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-rose-500 hover:text-white border border-white/20 flex items-center justify-center text-rose-200 transition-all btn-active cursor-pointer"
                        title="Keluar Akun"
                      >
                        <LogOut className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <div className="bg-white/15 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-bold text-white border border-white/10 shadow-3xs">
                      <Calendar className="w-3.5 h-3.5 text-amber-300" />
                      <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="bg-white/15 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-bold text-white border border-white/10 shadow-3xs">
                      <Clock className="w-3.5 h-3.5 text-amber-300" />
                      <span>{getHijriDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 space-y-4">
                <div className="flex items-center gap-3 pl-2 border-l-4 border-slate-900/90 py-0.5 text-left">
                  <h3 className="text-sm font-bold text-slate-800 leading-tight">Koran Informasi Wali</h3>
                </div>

                {/* Redesigned filter section meeting exact specifications */}
                <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Pilih Kelas</label>
                      <select
                        value={filterInformasiKelas}
                        onChange={(e) => {
                          setFilterInformasiKelas(e.target.value);
                          setFilterInformasiNama('');
                          setIsInformasiFilterApplied(false);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                      >
                        <option value="">-- Pilih --</option>
                        {kelasList.map(k => <option key={k.id_kelas} value={k.nama_kelas}>{k.nama_kelas}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Pilih Nama</label>
                      <select
                        disabled={!filterInformasiKelas}
                        value={filterInformasiNama}
                        onChange={(e) => {
                          setFilterInformasiNama(e.target.value);
                          setIsInformasiFilterApplied(false);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                      >
                        <option value="">-- Pilih --</option>
                        {filterInformasiKelas && studentsInClass(filterInformasiKelas).map(s => (
                          <option key={s.id_santri} value={s.id_santri}>{s.nama_santri}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {!isInformasiFilterApplied && (
                    <button
                      onClick={() => {
                        if (!filterInformasiKelas || !filterInformasiNama) {
                          alert("Silakan pilih kelas dan nama santri terlebih dahulu!");
                          return;
                        }
                        setIsInformasiFilterApplied(true);
                      }}
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white font-extrabold py-3 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md btn-active"
                    >
                      Terapkan Filter
                    </button>
                  )}
                </div>

                {/* Results displayed only when filter is applied */}
                {!isInformasiFilterApplied ? (
                  <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 text-center flex flex-col items-center justify-center gap-3">
                    <Search className="w-5 h-5 text-slate-300" />
                    <p className="text-[10px] text-slate-700 font-medium leading-relaxed max-w-[220px] mx-auto">
                      Silakan tentukan kolom kelas, nama santri, dan klik tombol <b className="text-slate-800 font-extrabold">Terapkan Filter</b> untuk memuat daftar sebaran informasi.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(() => {
                      const filteredSantri = santriList.find(s => s.id_santri === filterInformasiNama);
                      if (!filteredSantri) {
                        return (
                          <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-xl text-xs text-center">
                            Santri tidak ditemukan.
                          </div>
                        );
                      }

                      // Find information specifically targeting this santri or bulk-configured matching current active sets
                      const matchedInfos = informasiList.filter(inf =>
                        (inf.id_santri === filteredSantri.id_santri) ||
                        (inf.target_id_santri && inf.target_id_santri.includes(filteredSantri.id_santri))
                      );
                      const isExpanded = informasiExpandedStudentId === filteredSantri.id_santri;

                      return (
                        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm transition-all">
                          {/* Long Card main display */}
                          <div
                            onClick={() => setInformasiExpandedStudentId(isExpanded ? null : filteredSantri.id_santri)}
                            className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-all select-none"
                          >
                            <div>
                              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 uppercase">
                                Kelas {filteredSantri.halaqah}
                              </span>
                              <h4 className="font-bold text-sm text-slate-800 mt-1">{filteredSantri.nama_santri}</h4>
                              <p className="text-[10px] text-slate-700 mt-0.5">Total Broadcast: {matchedInfos.length} Pesan</p>
                            </div>
                            <div className="text-right flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-700">
                                {isExpanded ? <ChevronUp className="w-4 h-4 text-indigo-700" /> : <ChevronDown className="w-4 h-4" />}
                              </div>
                            </div>
                          </div>

                          {/* Expandable view: detailed list with Edit/Delete */}
                          {isExpanded && (
                            <div className="p-5 bg-slate-50/50 border-t border-slate-100 animate-fadeIn text-slate-800 text-xs">
                              <h5 className="font-bold text-slate-700 uppercase tracking-wider text-[9px] mb-3">Detail Broadcast Informasi</h5>
                              {matchedInfos.length === 0 ? (
                                <p className="text-slate-700 text-xs italic text-center py-4 bg-white rounded-2xl border border-slate-100">Belum ada sebaran informasi khusus untuk santri ini.</p>
                              ) : (
                                <div className="space-y-3">
                                  {matchedInfos.map((inf) => (
                                    <div key={inf.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative text-left">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-[9px] font-bold text-slate-700">{formatTanggal(inf.tanggal)}</span>
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() => setEditInformasiItem(inf)}
                                            className="text-slate-800 hover:text-slate-800 p-1"
                                            title="Edit"
                                          >
                                            <Edit className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() => {
                                              requestConfirm(
                                                "Hapus Informasi",
                                                "Apakah Anda yakin ingin menghapus sebaran broadcast informasi ini secara permanen dari basis data?",
                                                () => {
                                                  onDeleteInformasi(inf.id);
                                                  showToast('Broadcast informasi berhasil dihapus.');
                                                }
                                              );
                                            }}
                                            className="text-rose-500 hover:text-rose-700 p-1"
                                            title="Hapus"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                      <p className="text-xs text-slate-700 leading-relaxed font-semibold">"{inf.pesan}"</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 8: PEMBAYARAN KAS KELOLA */}
          {activeTab === 'pembayaran' && (
            <div className="flex flex-col text-left animate-fadeIn">

              {/* STICKY HEADER WRAPPER FOR PEMBAYARAN */}
              <div className="hidden">
                <div className="bg-teal-600 text-white pt-4 pb-8 px-5 relative overflow-hidden shadow-[0_4px_20px_rgba(13,75,69,0.12)]">
                  <div className="absolute top-0 right-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

                  <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none select-none">
                    <svg className="w-32 h-32 text-amber-200" viewBox="0 0 100 100" fill="currentColor">
                      <path d="M50,10 C40,25 35,35 35,45 C35,60 42,75 50,90 C58,75 65,60 65,45 C65,35 60,25 50,10 Z" />
                      <rect x="47" y="30" width="6" height="40" rx="3" />
                      <rect x="40" y="47" width="20" height="6" rx="3" />
                    </svg>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setActiveTab('beranda')}
                        className="bg-white/10 hover:bg-white/25 p-2 rounded-xl border border-white/10 text-white shadow-xs transition-all focus:ring-2 focus:ring-white/20 cursor-pointer flex items-center justify-center shrink-0"
                      >
                        <ChevronRight className="w-4 h-4 rotate-180" />
                      </button>
                      <div className="relative w-11 h-11 rounded-full border-2 border-yellow-400 p-0.5 bg-[#042f2e] flex items-center justify-center shadow-md overflow-hidden shrink-0">
                        {pengaturan?.logo ? (
                          <img
                            src={getCleanImageUrl(pengaturan.logo)}
                            alt={pengaturan.nama_lembaga || "Logo"}
                            className="w-full h-full object-cover rounded-full"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const fallbackIcon = document.getElementById('header-fallback-icon-pembayaran');
                              if (fallbackIcon) fallbackIcon.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          id="header-fallback-icon-pembayaran"
                          style={{ display: pengaturan?.logo ? 'none' : 'flex' }}
                          className="w-full h-full items-center justify-center text-yellow-300 font-bold"
                        >
                          <i className="fa-solid fa-mosque text-lg text-yellow-400 animate-pulse"></i>
                        </div>
                      </div>

                      <div className="text-left min-w-0">
                        <p className="text-amber-300 text-[8px] font-black uppercase tracking-widest leading-none mb-1">SIM TPQ DIGITAL</p>

                        <h3 className="text-sm font-bold tracking-tight text-white flex flex-wrap items-center gap-1.5 mt-0.5">
                          {getCleanName(user.nama_lengkap)}
                          <span className="w-3.5 h-3.5 bg-teal-500 rounded-full flex items-center justify-center text-white p-0.5 shadow-xs shrink-0" title="Verified Account">
                            <CheckCircle className="w-2.5 h-2.5 text-white" />
                          </span>
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {onSyncData && (
                        <button
                          onClick={() => {
                            onSyncData();
                            showToast("Memperbarui data pusat secara aman...");
                          }}
                          disabled={isSyncing}
                          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all btn-active ${isSyncing
                            ? 'bg-teal-600/40 border-teal-500/40 text-teal-300 animate-spin cursor-not-allowed'
                            : 'bg-white/10 border-white/20 text-teal-100 hover:bg-white/20 hover:text-white cursor-pointer'
                            }`}
                          title="Perbarui Data Hub"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      )}

                      <button
                        onClick={onLogout}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-rose-500 hover:text-white border border-white/20 flex items-center justify-center text-rose-200 transition-all btn-active cursor-pointer"
                        title="Keluar Akun"
                      >
                        <LogOut className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <div className="bg-white/15 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-bold text-white border border-white/10 shadow-3xs">
                      <Calendar className="w-3.5 h-3.5 text-amber-300" />
                      <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="bg-white/15 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-bold text-white border border-white/10 shadow-3xs">
                      <Clock className="w-3.5 h-3.5 text-amber-300" />
                      <span>{getHijriDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 space-y-4">
                <div className="flex items-center gap-3 pl-2 border-l-4 border-slate-900/90 py-0.5 text-left">
                  <h3 className="text-sm font-bold text-slate-800 leading-tight">Koran Keuangan SPP</h3>
                </div>

                {/* Redesigned filter section meeting exact specifications */}
                <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Pilih Kelas</label>
                      <select
                        value={filterKeuanganKelas}
                        onChange={(e) => {
                          setFilterKeuanganKelas(e.target.value);
                          setFilterKeuanganNama('');
                          setIsKeuanganFilterApplied(false);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:bg-white focus:border-teal-500 transition-all font-semibold"
                      >
                        <option value="">-- Pilih --</option>
                        {kelasList.map(k => <option key={k.id_kelas} value={k.nama_kelas}>{k.nama_kelas}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Pilih Nama</label>
                      <select
                        disabled={!filterKeuanganKelas}
                        value={filterKeuanganNama}
                        onChange={(e) => {
                          setFilterKeuanganNama(e.target.value);
                          setIsKeuanganFilterApplied(false);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:bg-white focus:border-teal-500 transition-all font-semibold"
                      >
                        <option value="">-- Pilih --</option>
                        {filterKeuanganKelas && (
                          <>
                            <option value="Semua">Semua Santri</option>
                            {studentsInClass(filterKeuanganKelas).map(s => (
                              <option key={s.id_santri} value={s.id_santri}>{s.nama_santri}</option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  {!isKeuanganFilterApplied && (
                    <button
                      onClick={() => {
                        if (!filterKeuanganKelas || !filterKeuanganNama) {
                          alert("Silakan pilih kelas dan nama santri terlebih dahulu!");
                          return;
                        }
                        setIsKeuanganFilterApplied(true);
                      }}
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white font-extrabold py-3 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md btn-active"
                    >
                      Terapkan Filter
                    </button>
                  )}
                </div>

                {/* Results displayed only when filter is applied */}
                {!isKeuanganFilterApplied ? (
                  <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 text-center flex flex-col items-center justify-center gap-3">
                    <Search className="w-5 h-5 text-slate-300" />
                    <p className="text-[10px] text-slate-700 font-medium leading-relaxed max-w-[220px] mx-auto">
                      Silakan tentukan kolom kelas, nama santri, dan klik tombol <b className="text-slate-800 font-extrabold">Terapkan Filter</b> untuk memuat daftar sebaran rincian keuangan Anda.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Export actions menu bar */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 mb-2">
                      <div>
                        <span className="text-[9px] font-extrabold uppercase text-slate-700 tracking-wider">Ekspor Koran SPP</span>
                        <h5 className="font-bold text-xs text-slate-800">Unduh Rekap Laporan Keuangan SPP</h5>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setPdfSignType('pembayaran');
                            setPdfSignName(invSekretaris || '');
                            setShowPdfSignModal(true);
                          }}
                          className="bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-100 rounded-xl px-3.5 py-2 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                        >
                          <Printer className="w-3.5 h-3.5" /> Cetak PDF
                        </button>
                        <button
                          onClick={() => downloadPembayaranExcel()}
                          className="bg-teal-700 text-white hover:bg-teal-800 rounded-xl px-3.5 py-2 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm transition-all whitespace-nowrap"
                        >
                          <Download className="w-3.5 h-3.5 text-amber-300" /> Ekspor Excel
                        </button>
                      </div>
                    </div>

                    {(() => {
                      const classStudents = filterKeuanganKelas ? studentsInClass(filterKeuanganKelas) : [];
                      const displayStudents = filterKeuanganNama === 'Semua'
                        ? classStudents
                        : classStudents.filter(s => s.id_santri === filterKeuanganNama);

                      if (displayStudents.length === 0) {
                        return (
                          <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-xl text-xs text-center">
                            Santri tidak ditemukan.
                          </div>
                        );
                      }

                      return displayStudents.map(filteredSantri => {
                        const matchedFinances = pembayaranList.filter(p => p.id_santri === filteredSantri.id_santri);
                        const isExpanded = keuanganExpandedStudentId === filteredSantri.id_santri;

                        return (
                          <div key={filteredSantri.id_santri} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm transition-all">
                            {/* Long Card main display */}
                            <div
                              onClick={() => setKeuanganExpandedStudentId(isExpanded ? null : filteredSantri.id_santri)}
                              className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-all select-none"
                            >
                              <div>
                                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 uppercase">
                                  Kelas {filteredSantri.halaqah}
                                </span>
                                <h4 className="font-bold text-sm text-slate-800 mt-1">{filteredSantri.nama_santri}</h4>
                                <p className="text-[10px] text-slate-700 mt-0.5">Total Mutasi Transaksi keuangan: {matchedFinances.length} Setoran</p>
                              </div>
                              <div className="text-right flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-700">
                                  {isExpanded ? <ChevronUp className="w-4 h-4 text-teal-700" /> : <ChevronDown className="w-4 h-4" />}
                                </div>
                              </div>
                            </div>

                            {/* Expandable view: detailed table of payments */}
                            {isExpanded && (
                              <div className="p-5 bg-slate-50/50 border-t border-slate-100 animate-fadeIn text-slate-800 text-xs">
                                <h5 className="font-bold text-slate-700 uppercase tracking-wider text-[9px] mb-3">Detail Transaksi Pembayaran SPP - {filteredSantri.nama_santri}</h5>
                                {matchedFinances.length === 0 ? (
                                  <p className="text-slate-700 text-xs italic text-center py-4 bg-white rounded-2xl border border-slate-100">Belum ada mutasi pembayaran SPP / syahriah dari santri ini.</p>
                                ) : (
                                  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-inner">
                                    <table className="w-full text-left border-collapse">
                                      <thead>
                                        <tr className="bg-slate-50 text-slate-800 uppercase text-[9px] font-extrabold tracking-wider border-b border-slate-200">
                                          <th className="py-3 px-4">No</th>
                                          <th className="py-3 px-4">Tanggal</th>
                                          <th className="py-3 px-4">Kategori</th>
                                          <th className="py-3 px-4 text-right">Nominal</th>
                                          <th className="py-3 px-4 text-center">Status</th>
                                          <th className="py-3 px-4 text-center">Aksi</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 text-black font-medium font-medium whitespace-nowrap">
                                        {matchedFinances.map((p, idx) => {
                                          const isPaid = p.status === 'Lunas';
                                          return (
                                            <tr key={p.id_pembayaran} className="hover:bg-slate-50/70 transition-all">
                                              <td className="py-3 px-4 font-mono text-[10px]">{idx + 1}</td>
                                              <td className="py-3 px-4 font-semibold text-[10px]">{formatTanggal(p.tanggal)}</td>
                                              <td className="py-3 px-4 font-semibold text-slate-800">{p.kategori}</td>
                                              <td className="py-3 px-4 text-right font-extrabold text-slate-900 text-xs">{formatRupiah(p.nominal)}</td>
                                              <td className="py-3 px-4 text-center">
                                                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${isPaid ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                                  {p.status}
                                                </span>
                                              </td>
                                              <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-center gap-1.5 animate-fadeIn">
                                                  {/* Cetak Kwitansi */}
                                                  <button
                                                    onClick={() => printReceipt(p)}
                                                    className="p-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-100 transition-all cursor-pointer"
                                                    title="Cetak Kwitansi"
                                                  >
                                                    <Printer className="w-3.5 h-3.5" />
                                                  </button>

                                                  {/* Edit */}
                                                  <button
                                                    onClick={() => setEditPembayaranItem(p)}
                                                    className="p-1.5 rounded-lg bg-slate-50 text-black font-medium hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
                                                    title="Edit Billing"
                                                  >
                                                    <Edit className="w-3.5 h-3.5" />
                                                  </button>

                                                  {/* Hapus */}
                                                  <button
                                                    onClick={() => {
                                                      requestConfirm(
                                                        "Hapus Administrasi",
                                                        `Apakah Anda yakin ingin menghapus data tagihan/pembayaran ${p.kategori} senilai ${formatRupiah(p.nominal)} ini secara permanen?`,
                                                        () => {
                                                          onDeletePembayaran(p.id_pembayaran);
                                                          showToast("Log pembayaran berhasil dihapus.");
                                                        }
                                                      );
                                                    }}
                                                    className="p-1.5 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 border border-rose-100 transition-all cursor-pointer"
                                                    title="Hapus Billing"
                                                  >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                  </button>
                                                </div>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: MENU-HUB */}
          {activeTab === 'menu-hub' && (() => {
            const ALL_HUB_MENUS = [
              // FAVORIT / UTAMA
              {
                id: 'setoran',
                label: 'Setoran',
                description: 'Laporan & rekapan setoran harian',
                icon: <img src="/asset/icon/setoran.png" alt="Setoran" className="w-8 h-8 object-contain" />,
                color: 'text-teal-600 bg-teal-50',
                category: 'favorit',
                badge: 'Laporan',
                starBadge: true
              },
              {
                id: 'mutabaah',
                label: 'Mutabaah',
                description: 'Monitoring hafalan & bacaan',
                icon: <img src="/asset/icon/mutabaah.png" alt="Mutabaah" className="w-8 h-8 object-contain" />,
                color: 'text-teal-600 bg-teal-50',
                category: 'favorit',
                badge: 'Siswa',
                starBadge: true
              },
              {
                id: 'pembayaran',
                label: 'Keuangan',
                description: 'Kas, keuangan & laporan',
                icon: <img src="/asset/icon/keuangan.png" alt="Keuangan" className="w-8 h-8 object-contain" />,
                color: 'text-teal-600 bg-teal-50',
                category: 'favorit',
                badge: 'Finansial',
                starBadge: true
              },
              {
                id: 'informasi',
                label: 'Informasi',
                description: 'Pengumuman & info terbaru',
                icon: <img src="/asset/icon/informasi.png" alt="Informasi" className="w-8 h-8 object-contain" />,
                color: 'text-teal-600 bg-teal-50',
                category: 'favorit',
                starBadge: false
              },

              // AKADEMIK
              {
                id: 'quran',
                label: "Al-Qur'an",
                description: "Kelola data Al-Qur'an digital",
                icon: <img src="/asset/icon/alquran.png" alt="Al-Qur'an" className="w-8 h-8 object-contain" />,
                color: 'text-teal-600 bg-teal-50',
                category: 'akademik'
              },
              {
                id: 'doa',
                label: 'Doa Sunnah',
                description: 'Kumpulan doa harian & adab',
                icon: <img src="/asset/icon/doa-sunnah.png" alt="Doa Sunnah" className="w-8 h-8 object-contain" />,
                color: 'text-teal-600 bg-teal-50',
                category: 'akademik'
              },
              {
                id: 'kelas',
                label: 'Kelas',
                description: 'Data kelas & jadwal TPQ',
                icon: <img src="/asset/icon/kelas.png" alt="Kelas" className="w-8 h-8 object-contain" />,
                color: 'text-teal-600 bg-teal-50',
                category: 'akademik'
              },
              {
                id: 'agenda',
                label: 'Agenda',
                description: 'Kalender & agenda kegiatan',
                icon: <img src="/asset/icon/agenda.png" alt="Agenda" className="w-8 h-8 object-contain" />,
                color: 'text-teal-600 bg-teal-50',
                category: 'akademik'
              },

              // ADMINISTRASI
              {
                id: 'santri',
                label: 'Data Santri',
                description: 'Biodata & data induk',
                icon: <img src="/asset/icon/data-santri.png" alt="Data Santri" className="w-8 h-8 object-contain" />,
                color: 'text-teal-600 bg-teal-50',
                category: 'administrasi'
              },
              {
                id: 'tabungan',
                label: 'Tabungan',
                description: 'Tabungan & uang jajan',
                icon: <img src="/asset/icon/tabungan.png" alt="Tabungan" className="w-8 h-8 object-contain" />,
                color: 'text-teal-600 bg-teal-50',
                category: 'administrasi'
              },
              {
                id: 'pendaftaran',
                label: 'Pendaftaran',
                description: 'Pendaftaran santri baru',
                icon: <img src="/asset/icon/pendaftaran.png" alt="Pendaftaran" className="w-8 h-8 object-contain" />,
                color: 'text-teal-600 bg-teal-50',
                category: 'administrasi'
              },
              {
                id: 'website',
                label: 'Website TPQ',
                description: 'Kelola landing page profil',
                icon: <img src="/asset/icon/website.png" alt="Website TPQ" className="w-8 h-8 object-contain" />,
                color: 'text-teal-600 bg-teal-50',
                category: 'administrasi'
              },
              {
                id: 'setting',
                label: 'Setting Profil',
                description: 'Pengaturan TPQ & akun',
                icon: <img src="/asset/icon/setting-profile.png" alt="Setting Profil" className="w-8 h-8 object-contain" />,
                color: 'text-teal-600 bg-teal-50',
                                category: 'administrasi'
              },
            ];

            const filteredMenus = ALL_HUB_MENUS.filter(menu =>
              menu.label.toLowerCase().includes(searchMenuQuery.toLowerCase()) ||
              menu.description.toLowerCase().includes(searchMenuQuery.toLowerCase())
            );

            const favoritMenus = filteredMenus.filter(m => m.category === 'favorit');
            const akademikMenus = filteredMenus.filter(m => m.category === 'akademik');
            const administrasiMenus = filteredMenus.filter(m => m.category === 'administrasi');

            return (
              <div className="w-full text-left animate-fadeIn">
                {/* MAIN CONTENT PORTION */}
                <div className="px-2 pt-3 space-y-5">
                  {/* Search result header if searching */}
                  {searchMenuQuery && (
                    <div className="text-xs text-slate-800 font-bold px-1">
                      Ditemukan <span className="text-teal-600">{filteredMenus.length}</span> layanan yang cocok:
                    </div>
                  )}

                  {/* 1. FAVORIT / UTAMA SECTION */}
                  {(!searchMenuQuery || favoritMenus.length > 0) && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2 text-slate-800 font-black text-xs uppercase tracking-widest pb-2 w-full mb-1">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span>Favorit</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {(searchMenuQuery ? favoritMenus : ALL_HUB_MENUS.filter(m => m.category === 'favorit')).map(m => {
                          return (
                            <button
                              key={m.id}
                              onClick={() => setActiveTab(m.id as any)}
                              className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-teal-400/50 transition-all duration-300 flex flex-col items-center gap-1.5 relative overflow-hidden group text-center cursor-pointer active:scale-95 w-full"
                            >
                              {/* Star icon badge in top right */}
                              {m.starBadge && (
                                <div className="absolute top-2 right-2 w-4 h-4 bg-teal-500 text-white rounded-full flex items-center justify-center p-0.5 shadow-2xs">
                                  <Star className="w-2 h-2 fill-white animate-pulse" />
                                </div>
                              )}

                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${m.color} shadow-[0_4px_12px_rgba(0,0,0,0.03)] group-hover:scale-105 transition-transform shrink-0`}>
                                {m.icon}
                              </div>

                              <div className="w-full text-center">
                                <h4 className="text-xs font-black text-slate-950 leading-tight tracking-tight group-hover:text-teal-600 transition-colors">{m.label}</h4>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 2. AKADEMIK SECTION */}
                  {(!searchMenuQuery || akademikMenus.length > 0) && (() => {
                    const list = searchMenuQuery ? akademikMenus : ALL_HUB_MENUS.filter(m => m.category === 'akademik');
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center gap-2 text-slate-800 font-black text-xs uppercase tracking-widest pb-2 w-full mb-1">
                            {/* Quran Islamic icon */}
                            <svg viewBox="0 0 24 24" className="w-4 h-4 text-teal-600" fill="none">
                              <rect x="3" y="2" width="18" height="20" rx="2" fill="#ccfbf1" stroke="#0f766e" strokeWidth="1.5"/>
                              <path d="M3 2H6C6.6 2 7 2.4 7 3V21C7 21.6 6.6 22 6 22H3" fill="#0f766e"/>
                              <path d="M10 8H17M10 11H15M10 14H17M10 17H13" stroke="#0f766e" strokeWidth="1" strokeLinecap="round"/>
                            </svg>
                            <span>Akademik</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {list.map((m, idx) => {
                            const isOddLast = list.length % 2 !== 0 && idx === list.length - 1;
                            return (
                              <button
                                key={m.id}
                                onClick={() => setActiveTab(m.id as any)}
                                className={`bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-teal-400/50 transition-all duration-300 flex flex-col items-center gap-1.5 relative overflow-hidden group text-center cursor-pointer active:scale-95 w-full ${isOddLast ? 'col-span-2 sm:col-span-1' : ''
                                  }`}
                              >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${m.color} shadow-[0_4px_12px_rgba(0,0,0,0.03)] group-hover:scale-105 transition-transform shrink-0`}>
                                  {m.icon}
                                </div>
                                <div className="w-full text-center">
                                  <h5 className="text-[10px] sm:text-[11px] font-black text-slate-950 leading-tight group-hover:text-teal-600 transition-colors tracking-tight truncate">{m.label}</h5>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 3. ADMINISTRASI SECTION */}
                  {(!searchMenuQuery || administrasiMenus.length > 0) && (() => {
                    const list = searchMenuQuery ? administrasiMenus : ALL_HUB_MENUS.filter(m => m.category === 'administrasi');
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center gap-2 text-slate-800 font-black text-xs uppercase tracking-widest pb-2 w-full mb-1">
                            {/* Mosque/Building Islamic icon */}
                            <svg viewBox="0 0 24 24" className="w-4 h-4 text-purple-600" fill="none">
                              <path d="M12 2C10.3 2 9 4 9 6H15C15 4 13.7 2 12 2Z" fill="#ede9fe" stroke="#7c3aed" strokeWidth="1.5"/>
                              <rect x="4" y="6" width="16" height="16" rx="1" fill="#ede9fe" stroke="#7c3aed" strokeWidth="1.5"/>
                              <path d="M10 22V16H14V22" fill="#c4b5fd" stroke="#7c3aed" strokeWidth="1"/>
                              <path d="M5 10H7.5V13H5Z" fill="#c4b5fd"/>
                              <path d="M16.5 10H19V13H16.5Z" fill="#c4b5fd"/>
                              <path d="M12 1.5V3" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            <span>Layanan Administrasi</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {list.map((m, idx) => {
                            const isOddLast = list.length % 2 !== 0 && idx === list.length - 1;
                            return (
                              <button
                                key={m.id}
                                onClick={() => setActiveTab(m.id as any)}
                                className={`bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-teal-400/50 transition-all duration-300 flex flex-col items-center gap-1.5 relative overflow-hidden group text-center cursor-pointer active:scale-95 w-full ${isOddLast ? 'col-span-2 sm:col-span-1' : ''
                                  }`}
                              >
                                {m.badge && (
                                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white font-black text-[7px] px-1.5 py-0.5 rounded-full scale-90 uppercase tracking-widest shadow-3xs z-10">{m.badge}</span>
                                )}
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${m.color} shadow-[0_4px_12px_rgba(0,0,0,0.03)] group-hover:scale-105 transition-transform shrink-0`}>
                                  {m.icon}
                                </div>
                                <div className="w-full text-center">
                                  <h5 className="text-[10px] sm:text-[11px] font-black text-slate-950 leading-tight group-hover:text-teal-600 transition-colors tracking-tight truncate">{m.label}</h5>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Empty State when no menus found */}
                  {searchMenuQuery && filteredMenus.length === 0 && (
                    <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-3xs space-y-3">
                      <div className="w-12 h-12 bg-slate-50 text-slate-700 rounded-full flex items-center justify-center mx-auto">
                        <Search className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-700">Layanan tidak ditemukan</h4>
                        <p className="text-[10px] text-slate-700 leading-relaxed max-w-[200px] mx-auto">Silakan cari menggunakan kata kunci yang berbeda, seperti setoran, mutabaah, keuangan, dll.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* TAB: MUTABAAH */}
          {activeTab === 'mutabaah' && (
            <div className="flex flex-col text-left animate-fadeIn">

              {/* STICKY HEADER WRAPPER FOR MUTABAAH */}
              <div className="hidden">
                <div className="bg-teal-600 text-white pt-4 pb-8 px-5 relative overflow-hidden shadow-[0_4px_20px_rgba(13,75,69,0.12)]">
                  <div className="absolute top-0 right-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

                  <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none select-none">
                    <svg className="w-32 h-32 text-amber-200" viewBox="0 0 100 100" fill="currentColor">
                      <path d="M50,10 C40,25 35,35 35,45 C35,60 42,75 50,90 C58,75 65,60 65,45 C65,35 60,25 50,10 Z" />
                      <rect x="47" y="30" width="6" height="40" rx="3" />
                      <rect x="40" y="47" width="20" height="6" rx="3" />
                    </svg>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setActiveTab('beranda')}
                        className="bg-white/10 hover:bg-white/25 p-2 rounded-xl border border-white/10 text-white shadow-xs transition-all focus:ring-2 focus:ring-white/20 cursor-pointer flex items-center justify-center shrink-0"
                      >
                        <ChevronRight className="w-4 h-4 rotate-180" />
                      </button>
                      <div className="relative w-11 h-11 rounded-full border-2 border-yellow-400 p-0.5 bg-[#042f2e] flex items-center justify-center shadow-md overflow-hidden shrink-0">
                        {pengaturan?.logo ? (
                          <img
                            src={getCleanImageUrl(pengaturan.logo)}
                            alt={pengaturan.nama_lembaga || "Logo"}
                            className="w-full h-full object-cover rounded-full"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const fallbackIcon = document.getElementById('header-fallback-icon-mutabaah');
                              if (fallbackIcon) fallbackIcon.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          id="header-fallback-icon-mutabaah"
                          style={{ display: pengaturan?.logo ? 'none' : 'flex' }}
                          className="w-full h-full items-center justify-center text-yellow-300 font-bold"
                        >
                          <i className="fa-solid fa-mosque text-lg text-yellow-400 animate-pulse"></i>
                        </div>
                      </div>

                      <div className="text-left min-w-0">
                        <p className="text-amber-300 text-[8px] font-black uppercase tracking-widest leading-none mb-1">SIM TPQ DIGITAL</p>

                        <h3 className="text-sm font-bold tracking-tight text-white flex flex-wrap items-center gap-1.5 mt-0.5">
                          {getCleanName(user.nama_lengkap)}
                          <span className="w-3.5 h-3.5 bg-teal-500 rounded-full flex items-center justify-center text-white p-0.5 shadow-xs shrink-0" title="Verified Account">
                            <CheckCircle className="w-2.5 h-2.5 text-white" />
                          </span>
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {onSyncData && (
                        <button
                          onClick={() => {
                            onSyncData();
                            showToast("Memperbarui data pusat secara aman...");
                          }}
                          disabled={isSyncing}
                          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all btn-active ${isSyncing
                            ? 'bg-teal-600/40 border-teal-500/40 text-teal-300 animate-spin cursor-not-allowed'
                            : 'bg-white/10 border-white/20 text-teal-100 hover:bg-white/20 hover:text-white cursor-pointer'
                            }`}
                          title="Perbarui Data Hub"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      )}

                      <button
                        onClick={onLogout}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-rose-500 hover:text-white border border-white/20 flex items-center justify-center text-rose-200 transition-all btn-active cursor-pointer"
                        title="Keluar Akun"
                      >
                        <LogOut className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <div className="bg-white/15 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-bold text-white border border-white/10 shadow-3xs">
                      <Calendar className="w-3.5 h-3.5 text-amber-300" />
                      <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="bg-white/15 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-bold text-white border border-white/10 shadow-3xs">
                      <Clock className="w-3.5 h-3.5 text-amber-300" />
                      <span>{getHijriDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 space-y-4">
                <div className="flex items-center gap-3 pl-2 border-l-4 border-slate-900/90 py-0.5 text-left">
                  <h3 className="text-sm font-bold text-slate-800 leading-tight">Diary Mutaba'ah Santri</h3>
                </div>

                {/* Redesigned filter section meeting exact specifications */}
                <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Pilih Kelas</label>
                      <select
                        value={filterMutabaahKelas}
                        onChange={(e) => {
                          setFilterMutabaahKelas(e.target.value);
                          setFilterMutabaahNama('');
                          setIsMutabaahFilterApplied(false);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:bg-white focus:border-rose-500 transition-all font-semibold"
                      >
                        <option value="">-- Pilih --</option>
                        {kelasList.map(k => <option key={k.id_kelas} value={k.nama_kelas}>{k.nama_kelas}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Pilih Nama</label>
                      <select
                        disabled={!filterMutabaahKelas}
                        value={filterMutabaahNama}
                        onChange={(e) => {
                          setFilterMutabaahNama(e.target.value);
                          setIsMutabaahFilterApplied(false);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:bg-white focus:border-rose-500 transition-all font-semibold"
                      >
                        <option value="">-- Pilih --</option>
                        {filterMutabaahKelas && studentsInClass(filterMutabaahKelas).map(s => (
                          <option key={s.id_santri} value={s.id_santri}>{s.nama_santri}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {!isMutabaahFilterApplied && (
                    <button
                      onClick={() => {
                        if (!filterMutabaahKelas || !filterMutabaahNama) {
                          alert("Silakan pilih kelas dan nama santri terlebih dahulu!");
                          return;
                        }
                        setIsMutabaahFilterApplied(true);
                      }}
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white font-extrabold py-3 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md btn-active"
                    >
                      Terapkan Filter
                    </button>
                  )}
                </div>

                {/* Results displayed only when filter is applied */}
                {!isMutabaahFilterApplied ? (
                  <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 text-center flex flex-col items-center justify-center gap-3">
                    <Search className="w-5 h-5 text-slate-300" />
                    <p className="text-[10px] text-slate-700 font-medium leading-relaxed max-w-[220px] mx-auto">
                      Silakan tentukan kolom kelas, nama santri, dan klik tombol <b className="text-slate-800 font-extrabold">Terapkan Filter</b> untuk memuat data diary shalat & mutabaah harian.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(() => {
                      const filteredSantri = santriList.find(s => s.id_santri === filterMutabaahNama);
                      if (!filteredSantri) {
                        return (
                          <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-xl text-xs text-center">
                            Santri tidak ditemukan.
                          </div>
                        );
                      }

                      const matchedMutabaahs = mutabaahList.filter(m => m.id_santri === filteredSantri.id_santri);
                      const isExpanded = mutabaahExpandedStudentId === filteredSantri.id_santri;

                      return (
                        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm transition-all">
                          {/* Long Card main display */}
                          <div
                            onClick={() => setMutabaahExpandedStudentId(isExpanded ? null : filteredSantri.id_santri)}
                            className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-all select-none"
                          >
                            <div>
                              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-300 uppercase">
                                Kelas {filteredSantri.halaqah}
                              </span>
                              <h4 className="font-bold text-sm text-slate-800 mt-1">{filteredSantri.nama_santri}</h4>
                              <p className="text-[10px] text-slate-700 mt-0.5">Total Mutaba'ah: {matchedMutabaahs.length} Kali Pengisian</p>
                            </div>
                            <div className="text-right flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-700">
                                {isExpanded ? <ChevronUp className="w-4 h-4 text-rose-700" /> : <ChevronDown className="w-4 h-4" />}
                              </div>
                            </div>
                          </div>

                          {/* Expandable detailed diaries info */}
                          {isExpanded && (
                            <div className="p-5 bg-slate-50/50 border-t border-slate-100 animate-fadeIn text-slate-800 text-xs">
                              <h5 className="font-bold text-slate-700 uppercase tracking-wider text-[9px] mb-3">Detail Jejak Shalat Fardhu & Ibadah Sunnah</h5>
                              {matchedMutabaahs.length === 0 ? (
                                <p className="text-slate-700 text-xs italic text-center py-4 bg-white rounded-2xl border border-slate-100">Belum ada isian lembar mutabaah harian.</p>
                              ) : (
                                <div className="space-y-3">
                                  {matchedMutabaahs.map((m) => (
                                    <div key={m.id} className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm text-left text-black font-medium">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-extrabold text-teal-800 font-mono bg-teal-50 px-2 py-0.5 rounded-md">{formatTanggal(m.tanggal)}</span>
                                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                          <button
                                            onClick={() => setEditMutabaahItem(m)}
                                            className="p-1 rounded hover:bg-slate-50 border border-slate-200 text-slate-800 cursor-pointer"
                                          >
                                            <Edit className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() => {
                                              requestConfirm(
                                                "Hapus Mutabaah",
                                                `Apakah Anda yakin ingin menghapus data mutabaah tertanggal ${formatTanggal(m.tanggal)} ini secara permanen dari database?`,
                                                () => {
                                                  onDeleteMutabaah(m.id);
                                                  showToast("Mutabaah berhasil dibuang.");
                                                }
                                              );
                                            }}
                                            className="p-1 rounded bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-100 cursor-pointer"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Grid values */}
                                      <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold text-slate-800 py-1.5">
                                        <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                          <p className="text-[8px] text-slate-700 uppercase">Subuh</p>
                                          <span className={m.subuh === 'Ya' ? 'text-teal-700 font-extrabold' : 'text-slate-350'}>{m.subuh === 'Ya' ? '🟢 Ya' : '🔴 Tidak'}</span>
                                        </div>
                                        <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                          <p className="text-[8px] text-slate-700 uppercase">Dzuhur</p>
                                          <span className={m.dzuhur === 'Ya' ? 'text-teal-700 font-extrabold' : 'text-slate-350'}>{m.dzuhur === 'Ya' ? '🟢 Ya' : '🔴 Tidak'}</span>
                                        </div>
                                        <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                          <p className="text-[8px] text-slate-700 uppercase">Ashar</p>
                                          <span className={m.ashar === 'Ya' ? 'text-teal-700 font-extrabold' : 'text-slate-350'}>{m.ashar === 'Ya' ? '🟢 Ya' : '🔴 Tidak'}</span>
                                        </div>
                                        <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                          <p className="text-[8px] text-slate-700 uppercase">Maghrib</p>
                                          <span className={m.maghrib === 'Ya' ? 'text-teal-700 font-extrabold' : 'text-slate-350'}>{m.maghrib === 'Ya' ? '🟢 Ya' : '🔴 Tidak'}</span>
                                        </div>
                                        <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                          <p className="text-[8px] text-slate-700 uppercase">Isya</p>
                                          <span className={m.isya === 'Ya' ? 'text-teal-700 font-extrabold' : 'text-slate-350'}>{m.isya === 'Ya' ? '🟢 Ya' : '🔴 Tidak'}</span>
                                        </div>
                                        <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                          <p className="text-[8px] text-slate-700 uppercase">Dhuha</p>
                                          <span className={m.dhuha === 'Ya' ? 'text-amber-600 font-extrabold' : 'text-slate-350'}>{m.dhuha === 'Ya' ? '🟢 Ya' : '🔴 Tidak'}</span>
                                        </div>
                                        <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 col-span-2">
                                          <p className="text-[8px] text-slate-700 uppercase">Tilawah Qur'an</p>
                                          <span className={m.tilawah && m.tilawah !== 'Tidak' && m.tilawah !== 'Belum' && m.tilawah !== '-' ? 'text-teal-700 font-bold text-[10px]' : 'text-slate-700 text-[10px]'}>
                                            {m.tilawah || 'Belum'}
                                          </span>
                                        </div>
                                      </div>

                                      {m.catatan && (
                                        <p className="text-[10px] text-slate-800 mt-2 bg-slate-50 p-2 rounded-xl italic font-medium">"{m.catatan}"</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: SETORAN */}
          {activeTab === 'setoran' && (
            <div className="flex flex-col text-left animate-fadeIn">

              {/* PADDED CONTENT CONTAINER */}
              <div className="px-4 mt-2 space-y-4">
                {/* Redesigned filter section meeting exact specifications */}
                <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Pilih Kelas</label>
                      <select
                        value={filterSetoranKelas}
                        onChange={(e) => {
                          setFilterSetoranKelas(e.target.value);
                          setFilterSetoranNama('');
                          setIsSetoranFilterApplied(false);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:bg-white focus:border-teal-500 transition-all font-semibold"
                      >
                        <option value="">-- Pilih --</option>
                        {kelasList.map(k => <option key={k.id_kelas} value={k.nama_kelas}>{k.nama_kelas}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Pilih Nama</label>
                      <select
                        disabled={!filterSetoranKelas}
                        value={filterSetoranNama}
                        onChange={(e) => {
                          setFilterSetoranNama(e.target.value);
                          setIsSetoranFilterApplied(false);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:bg-white focus:border-teal-500 transition-all font-semibold"
                      >
                        <option value="">-- Pilih --</option>
                        {filterSetoranKelas && (
                          <>
                            <option value="Semua">Semua Santri</option>
                            {studentsInClass(filterSetoranKelas).map(s => (
                              <option key={s.id_santri} value={s.id_santri}>{s.nama_santri}</option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  {!isSetoranFilterApplied && (
                    <button
                      onClick={() => {
                        if (!filterSetoranKelas || !filterSetoranNama) {
                          alert("Silakan pilih kelas dan nama santri terlebih dahulu!");
                          return;
                        }
                        setIsSetoranFilterApplied(true);
                      }}
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white font-extrabold py-3 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md btn-active"
                    >
                      Terapkan Filter
                    </button>
                  )}
                </div>

                {/* Results displayed only when filter is applied */}
                {!isSetoranFilterApplied ? (
                  <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 text-center flex flex-col items-center justify-center gap-3">
                    <Search className="w-5 h-5 text-slate-300" />
                    <p className="text-[10px] text-slate-700 font-medium leading-relaxed max-w-[220px] mx-auto">
                      Silakan tentukan kolom kelas, nama santri, dan klik tombol <b className="text-slate-800 font-extrabold">Terapkan Filter</b> untuk memuat hasil laporan pembelajaran & hafalan.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Export actions menu bar */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 mb-2">
                      <div>
                        <span className="text-[9px] font-extrabold uppercase text-slate-700 tracking-wider">Ekspor Setoran</span>
                        <h5 className="font-bold text-xs text-slate-800">Unduh Rekap Laporan Setoran & Tilawah</h5>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setPdfSignType('setoran');
                            setPdfSignName('');
                            setShowPdfSignModal(true);
                          }}
                          className="bg-teal-50 text-teal-800 hover:bg-teal-150 border border-teal-100 rounded-xl px-3.5 py-2 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                        >
                          <Printer className="w-3.5 h-3.5" /> Cetak PDF
                        </button>
                        <button
                          onClick={() => downloadSetoranExcel()}
                          className="bg-teal-700 text-white hover:bg-teal-800 rounded-xl px-3.5 py-2 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm transition-all whitespace-nowrap"
                        >
                          <Download className="w-3.5 h-3.5 text-amber-300" /> Ekspor Excel
                        </button>
                      </div>
                    </div>

                    {(() => {
                      const classStudents = filterSetoranKelas ? studentsInClass(filterSetoranKelas) : [];
                      const displayStudents = filterSetoranNama === 'Semua'
                        ? classStudents
                        : classStudents.filter(s => s.id_santri === filterSetoranNama);

                      if (displayStudents.length === 0) {
                        return (
                          <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-xl text-xs text-center">
                            Santri tidak ditemukan.
                          </div>
                        );
                      }

                      return displayStudents.map(filteredSantri => {
                        const matchedSetorans = setoranList.filter(s => s.id_santri === filteredSantri.id_santri);
                        const isExpanded = setoranExpandedStudentId === filteredSantri.id_santri;

                        return (
                          <div key={filteredSantri.id_santri} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm transition-all">
                            {/* Long Card main display */}
                            <div
                              onClick={() => setSetoranExpandedStudentId(isExpanded ? null : filteredSantri.id_santri)}
                              className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-all select-none"
                            >
                              <div>
                                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-teal-50 text-teal-900 border border-teal-200 uppercase">
                                  Kelas {filteredSantri.halaqah}
                                </span>
                                <h4 className="font-bold text-sm text-slate-800 mt-1">{filteredSantri.nama_santri}</h4>
                                <p className="text-[10px] text-slate-700 mt-0.5">Total Mutasi Setoran: {matchedSetorans.length} Aktivitas</p>
                              </div>
                              <div className="text-right flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-700">
                                  {isExpanded ? <ChevronUp className="w-4 h-4 text-teal-700" /> : <ChevronDown className="w-4 h-4" />}
                                </div>
                              </div>
                            </div>

                            {/* Expandable view: detailed table of setoran */}
                            {isExpanded && (
                              <div className="p-5 bg-slate-50/50 border-t border-slate-105 animate-fadeIn text-slate-800 text-xs">
                                <h5 className="font-bold text-slate-700 uppercase tracking-wider text-[9px] mb-3">Detail Setoran & Tilawah Santri - {filteredSantri.nama_santri}</h5>
                                {matchedSetorans.length === 0 ? (
                                  <p className="text-slate-700 text-xs italic text-center py-4 bg-white rounded-2xl border border-slate-100">Belum ada mutasi aktivitas hafalan dari santri ini.</p>
                                ) : (
                                  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-inner">
                                    <table className="w-full text-left border-collapse">
                                      <thead>
                                        <tr className="bg-slate-50 text-slate-800 uppercase text-[9px] font-extrabold tracking-wider border-b border-slate-200">
                                          <th className="py-3 px-4">No</th>
                                          <th className="py-3 px-4">Tanggal</th>
                                          <th className="py-3 px-4">Tahfidz</th>
                                          <th className="py-3 px-4">Tilawah / Pages</th>
                                          <th className="py-3 px-4 text-center">Hafalan</th>
                                          <th className="py-3 px-4 text-center">Aksi</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 text-black font-medium font-medium whitespace-nowrap">
                                        {matchedSetorans.map((s, idx) => {
                                          return (
                                            <tr key={s.id_setoran} className="hover:bg-slate-50/70 transition-all">
                                              <td className="py-3 px-4 font-mono text-[10px]">{idx + 1}</td>
                                              <td className="py-3 px-4">{formatTanggal(s.tanggal)}</td>
                                              <td className="py-3 px-4">
                                                {s.surah !== '-' ? (
                                                  <div className="flex flex-col gap-0.5 leading-tight">
                                                    <span className="text-[12px] font-bold text-slate-800">{s.surah}</span>
                                                    <span className="text-[10px] text-slate-800 font-medium">Ayat {s.ayat}</span>
                                                    <span className="mt-1 self-start px-1.5 py-0.5 rounded text-[8.5px] font-black bg-teal-50 text-teal-700 border border-teal-100">
                                                      {s.kualitas_surah || (s.kualitas && !s.kualitas.includes('|') && !s.kualitas.includes(':') ? s.kualitas : '') || 'Mumtaz'}
                                                    </span>
                                                  </div>
                                                ) : (
                                                  <span className="text-slate-300">-</span>
                                                )}
                                              </td>
                                              <td className="py-3 px-4">
                                                {s.tilawah !== '-' ? (
                                                  <div className="flex flex-col gap-0.5 leading-tight">
                                                    <span className="text-[12px] font-bold text-slate-800">{s.tilawah}</span>
                                                    <span className="text-[10px] text-slate-800 font-mono">Halaman: {s.halaman || '-'}</span>
                                                    <span className="mt-1 self-start px-1.5 py-0.5 rounded text-[8.5px] font-black bg-teal-50 text-teal-700 border border-teal-100">
                                                      {s.kualitas_tilawah || (s.kualitas && !s.kualitas.includes('|') && !s.kualitas.includes(':') ? s.kualitas : '') || 'Mumtaz'}
                                                    </span>
                                                  </div>
                                                ) : (
                                                  <span className="text-slate-300">-</span>
                                                )}
                                              </td>
                                              <td className="py-3 px-4 text-center">
                                                {s.hadits !== '-' ? (
                                                  <div className="flex flex-col items-center gap-0.5 leading-tight">
                                                    <span className="text-[12px] font-bold text-slate-800">{s.hadits}</span>
                                                    <span className="mt-1 px-1.5 py-0.5 rounded text-[8.5px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                      {s.kualitas_hadits || (s.kualitas && !s.kualitas.includes('|') && !s.kualitas.includes(':') ? s.kualitas : '') || 'Mumtaz'}
                                                    </span>
                                                  </div>
                                                ) : (
                                                  <span className="text-slate-300">-</span>
                                                )}
                                              </td>
                                              <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-center gap-1.5 animate-fadeIn">
                                                  {/* Edit */}
                                                  <button
                                                    onClick={() => setEditSetoranItem(s)}
                                                    className="p-1.5 rounded-lg bg-slate-50 text-black font-medium hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
                                                    title="Edit Setoran"
                                                  >
                                                    <Edit className="w-3.5 h-3.5" />
                                                  </button>

                                                  {/* Hapus */}
                                                  <button
                                                    onClick={() => {
                                                      requestConfirm(
                                                        "Hapus Setoran",
                                                        `Apakah Anda yakin ingin menghapus data setoran ${s.surah !== '-' ? s.surah : s.tilawah !== '-' ? s.tilawah : s.hadits} ini secara permanen?`,
                                                        () => {
                                                          onDeleteSetoran(s.id_setoran);
                                                          showToast("Setoran laporan berhasil dihapus.");
                                                        }
                                                      );
                                                    }}
                                                    className="p-1.5 rounded-lg bg-rose-50 text-rose-550 hover:bg-rose-100 border border-rose-100 transition-all cursor-pointer"
                                                    title="Hapus Setoran"
                                                  >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                  </button>
                                                </div>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 9: SETTING */}
          {activeTab === 'setting' && (
            <div className="flex flex-col text-left animate-fadeIn">

              {/* STICKY HEADER WRAPPER FOR SETTING */}
              <div className="hidden">
                <div className="bg-teal-600 text-white pt-4 pb-8 px-5 relative overflow-hidden shadow-[0_4px_20px_rgba(13,75,69,0.12)]">
                  <div className="absolute top-0 right-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

                  <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none select-none">
                    <svg className="w-32 h-32 text-amber-200" viewBox="0 0 100 100" fill="currentColor">
                      <path d="M50,10 C40,25 35,35 35,45 C35,60 42,75 50,90 C58,75 65,60 65,45 C65,35 60,25 50,10 Z" />
                      <rect x="47" y="30" width="6" height="40" rx="3" />
                      <rect x="40" y="47" width="20" height="6" rx="3" />
                    </svg>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setActiveTab('beranda')}
                        className="bg-white/10 hover:bg-white/25 p-2 rounded-xl border border-white/10 text-white shadow-xs transition-all focus:ring-2 focus:ring-white/20 cursor-pointer flex items-center justify-center shrink-0"
                      >
                        <ChevronRight className="w-4 h-4 rotate-180" />
                      </button>
                      <div className="relative w-11 h-11 rounded-full border-2 border-yellow-400 p-0.5 bg-[#042f2e] flex items-center justify-center shadow-md overflow-hidden shrink-0">
                        {pengaturan?.logo ? (
                          <img
                            src={getCleanImageUrl(pengaturan.logo)}
                            alt={pengaturan.nama_lembaga || "Logo"}
                            className="w-full h-full object-cover rounded-full"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const fallbackIcon = document.getElementById('header-fallback-icon-setting');
                              if (fallbackIcon) fallbackIcon.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          id="header-fallback-icon-setting"
                          style={{ display: pengaturan?.logo ? 'none' : 'flex' }}
                          className="w-full h-full items-center justify-center text-yellow-300 font-bold"
                        >
                          <i className="fa-solid fa-mosque text-lg text-yellow-400 animate-pulse"></i>
                        </div>
                      </div>

                      <div className="text-left min-w-0">
                        <p className="text-amber-300 text-[8px] font-black uppercase tracking-widest leading-none mb-1">SIM TPQ DIGITAL</p>

                        <h3 className="text-sm font-bold tracking-tight text-white flex flex-wrap items-center gap-1.5 mt-0.5">
                          {getCleanName(user.nama_lengkap)}
                          <span className="w-3.5 h-3.5 bg-teal-500 rounded-full flex items-center justify-center text-white p-0.5 shadow-xs shrink-0" title="Verified Account">
                            <CheckCircle className="w-2.5 h-2.5 text-white" />
                          </span>
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {onSyncData && (
                        <button
                          onClick={() => {
                            onSyncData();
                            showToast("Memperbarui data pusat secara aman...");
                          }}
                          disabled={isSyncing}
                          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all btn-active ${isSyncing
                            ? 'bg-teal-600/40 border-teal-500/40 text-teal-300 animate-spin cursor-not-allowed'
                            : 'bg-white/10 border-white/20 text-teal-100 hover:bg-white/20 hover:text-white cursor-pointer'
                            }`}
                          title="Perbarui Data Hub"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      )}

                      <button
                        onClick={onLogout}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-rose-500 hover:text-white border border-white/20 flex items-center justify-center text-rose-200 transition-all btn-active cursor-pointer"
                        title="Keluar Akun"
                      >
                        <LogOut className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <div className="bg-white/15 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-bold text-white border border-white/10 shadow-3xs">
                      <Calendar className="w-3.5 h-3.5 text-amber-300" />
                      <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="bg-white/15 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-bold text-white border border-white/10 shadow-3xs">
                      <Clock className="w-3.5 h-3.5 text-amber-300" />
                      <span>{getHijriDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 space-y-4">
                <div className="flex items-center gap-3 pl-2 border-l-4 border-slate-900/90 py-0.5 text-left">
                  <h3 className="text-sm font-bold text-slate-800 leading-tight">Pengaturan Lembaga</h3>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
                  <form onSubmit={saveSettings} className="space-y-4 text-slate-700">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-700">Nama Lembaga</label>
                      <input
                        type="text"
                        value={setLembaga}
                        onChange={(e) => setSetLembaga(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 p-3 text-xs font-semibold rounded-xl mt-1 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-700">Pimpinan Lembaga</label>
                      <input
                        type="text"
                        value={setPimpinan}
                        onChange={(e) => setSetPimpinan(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 p-3 text-xs font-semibold rounded-xl mt-1 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">URL Logo</label>
                      <div className="flex gap-4 items-center bg-slate-50/50 p-3 rounded-2xl border border-slate-200">
                        <div className="w-16 h-16 rounded-xl border border-slate-200 bg-white shadow-inner flex items-center justify-center overflow-hidden shrink-0">
                          {logoInp ? (
                            <img
                              src={getCleanImageUrl(logoInp)}
                              alt="Pratinjau Logo"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain p-1"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Error';
                              }}
                            />
                          ) : (
                            <span className="text-[10px] font-bold text-slate-700">No Logo</span>
                          )}
                        </div>
                        <div className="flex-grow">
                          <input
                            type="text"
                            value={logoInp}
                            onChange={(e) => setLogoInp(e.target.value)}
                            placeholder="https://contoh.com/logo.png"
                            className="w-full bg-white border border-slate-300 focus:border-teal-600 p-2 text-xs font-semibold rounded-xl outline-none"
                          />
                          <p className="text-[9px] text-slate-700 mt-1">
                            Gunakan tautan gambar berformat PNG transparan (rasio 1:1).
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-700">Alamat Lengkap</label>
                      <input
                        type="text"
                        value={setAlamat}
                        onChange={(e) => setSetAlamat(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 p-3 text-xs font-semibold rounded-xl mt-1 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-700 font-medium">Nomor Telepon</label>
                        <input
                          type="text"
                          value={setTelepon}
                          onChange={(e) => setSetTelepon(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 p-2.5 text-xs rounded-xl mt-1 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-700 font-medium">Alamat Email</label>
                        <input
                          type="text"
                          value={setEmail}
                          onChange={(e) => setSetEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 p-2.5 text-xs rounded-xl mt-1 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-50">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-700 font-medium">ID Google Drive (Opsional)</label>
                        <input
                          type="text"
                          value={idDriveInp}
                          onChange={(e) => setIdDriveInp(e.target.value)}
                          placeholder="Opsional: Kosongkan untuk bawaan sistem"
                          className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 p-2.5 text-xs rounded-xl mt-1 outline-none font-mono"
                        />
                        <p className="text-[8px] text-slate-700 mt-1">
                          ID folder Google Drive untuk menyimpan berkas unggahan.
                        </p>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-700 font-medium">Tautan Website (Opsional)</label>
                        <input
                          type="text"
                          value={linkWebsiteInp}
                          onChange={(e) => setLinkWebsiteInp(e.target.value)}
                          placeholder="Contoh: https://tpq-alikhlas.sch.id"
                          className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 p-2.5 text-xs rounded-xl mt-1 outline-none"
                        />
                        <p className="text-[8px] text-slate-700 mt-1">
                          Alamat akses publik dari website lembaga.
                        </p>
                      </div>
                    </div>

                    {/* WA Group rows list */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="block text-[10px] font-bold uppercase text-slate-800">Tautan Grup WhatsApp</span>
                        <button
                          type="button"
                          onClick={handleAddWaRow}
                          className="text-teal-600 font-black text-2xl hover:text-teal-800 transition-colors cursor-pointer w-8 h-8 flex items-center justify-center"
                          title="Tambah Grup"
                        >
                          +
                        </button>
                      </div>

                      <div className="space-y-2">
                        {waRows.map((wa, idx) => (
                          <div key={idx} className="flex gap-1.5 items-center">
                            <select
                              value={wa.program}
                              onChange={(e) => handleWaRowChange(idx, 'program', e.target.value)}
                              className="bg-slate-50 border p-2 text-xs rounded-xl w-1/3 outline-none"
                            >
                              <option value="Umum">Umum</option>
                              <option value="Tahfidz">Tahfidz</option>
                              <option value="Reguler">Reguler</option>
                              <option value="Takhassus">Takhassus</option>
                            </select>
                            <input
                              type="text"
                              value={wa.link}
                              onChange={(e) => handleWaRowChange(idx, 'link', e.target.value)}
                              placeholder="https://chat.whatsapp.com/abc"
                              className="bg-slate-50 border p-2 text-xs rounded-xl w-full outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveWaRow(idx)}
                              className="text-rose-500 bg-rose-50 p-2 rounded-xl border border-rose-100 shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-2xl shadow-md transition-all active:scale-99 btn-active mt-6 text-xs uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSavingSettings ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          MENYIMPAN PROFIL...
                        </>
                      ) : (
                        "Simpan Semua Profil"
                      )}
                    </button>
                  </form>

                  {/* LANDING PAGE CONFIG & QR SECTION */}
                  <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-teal-50 rounded-lg text-teal-600">
                        <QrCode className="w-4 h-4" />
                      </span>
                      <h4 className="text-xs font-black text-teal-900 uppercase tracking-wider">Brosur & QR Code Pendaftaran</h4>
                    </div>

                    <p className="text-[10px] text-slate-700 leading-relaxed font-semibold">
                      Gunakan tautan khusus dan kode QR di bawah ini untuk mengarahkan calon wali santri ke landing page pendaftaran mandiri digital TPQ Anda. Anda bisa mencetaknya di brosur fisik, spanduk, atau membagikannya di grup sosial media.
                    </p>

                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3.5">
                      <div>
                        <label className="block text-[9px] font-extrabold uppercase text-slate-700 tracking-wider mb-1 ml-0.5">Tautan Landing Page TPQ Anda</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            readOnly
                            value={`${window.location.origin}/?tpq=${getActiveSchoolUsername()}`}
                            className="flex-grow bg-white border border-slate-200 p-2.5 text-xs font-bold text-slate-700 rounded-xl outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/?tpq=${getActiveSchoolUsername()}`);
                              setCopiedLink(true);
                              showToast('Tautan Landing Page berhasil disalin!');
                              setTimeout(() => setCopiedLink(false), 2000);
                            }}
                            className="bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200/50 px-3.5 rounded-xl transition-all font-black text-xs uppercase tracking-wider shrink-0 flex items-center justify-center gap-1.5"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            {copiedLink ? 'Tersalin!' : 'Salin'}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 items-center pt-2">
                        {landingPageQrUrl ? (
                          <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shrink-0 shadow-xs flex flex-col items-center">
                            <img
                              src={landingPageQrUrl}
                              alt="QR Code Landing Page"
                              className="w-28 h-28 object-contain"
                            />
                            <span className="text-[8px] font-bold text-slate-700 uppercase tracking-widest mt-1">SCAN ME</span>
                          </div>
                        ) : (
                          <div className="w-28 h-28 bg-slate-100 rounded-2xl animate-pulse shrink-0"></div>
                        )}

                        <div className="space-y-2 text-center sm:text-left w-full">
                          <h5 className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Bagikan QR Code Brosur</h5>
                          <p className="text-[9px] text-slate-700 leading-relaxed font-semibold">
                            Wali santri cukup memindai kode QR ini dengan kamera HP mereka untuk langsung masuk ke halaman formulir pendaftaran online TPQ Anda.
                          </p>

                          <div className="flex gap-2">
                            <a
                              href={landingPageQrUrl}
                              download={`QR_Pendaftaran_TPQ_${getActiveSchoolUsername()}.png`}
                              className="flex-1 bg-slate-900 hover:bg-black text-white text-center py-2 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <Download className="w-3 h-3" /> Unduh QR PNG
                            </a>
                            <a
                              href={`${window.location.origin}/?tpq=${getActiveSchoolUsername()}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-center py-2 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-sm text-center"
                            >
                              <Globe className="w-3 h-3" /> Buka Landing
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* DANGER ZONE - HAPUS DATA SPREADSHEET */}
                  <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="p-1 bg-rose-50 rounded-lg text-rose-500">
                        <Trash2 className="w-4 h-4" />
                      </span>
                      <h4 className="text-xs font-black text-rose-850 uppercase tracking-wider">Kontrol Hapus Data</h4>
                    </div>

                    <p className="text-[10px] text-slate-700 leading-relaxed font-semibold">
                      Gunakan menu ini untuk mengosongkan menu tertentu di pangkalan data secara penuh. Semua entri yang dipilih akan dihapus secara permanen dari server awan Google Penyimpanan TPQ Anda.
                    </p>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-slate-700 tracking-wider mb-1.5 ml-0.5">Pilih Kategori Data Menu</label>
                        <select
                          value={sheetToClear}
                          onChange={(e) => setSheetToClear(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-rose-500 p-3 text-xs font-bold text-slate-700 rounded-xl outline-none transition-all cursor-pointer"
                        >
                          <option value="tabungan">Tabungan Santri</option>
                          <option value="informasi">Broadcast Informasi Khusus</option>
                          <option value="pembayaran">Keuangan / Pembayaran Administrasi</option>
                          <option value="mutabaah">Mutabaah Harian (Diary Ibadah)</option>
                          <option value="setoran">Setoran Hafalan & Tilawah (Tahfidz)</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={handleClearSheetData}
                        className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/60 font-black py-3.5 px-4 rounded-xl shadow-xs transition-all active:scale-99 cursor-pointer text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Hapus Data Terpilih
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: AGENDA & PENGUMUMAN DUAL-FUNCTION */}
          {activeTab === 'agenda' && (
            <div className="flex flex-col text-left animate-fadeIn">

              {/* STICKY HEADER WRAPPER FOR AGENDA */}
              <div className="hidden">
                <div className="bg-teal-600 text-white pt-4 pb-8 px-5 relative overflow-hidden shadow-[0_4px_20px_rgba(13,75,69,0.12)]">
                  <div className="absolute top-0 right-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

                  <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none select-none">
                    <svg className="w-32 h-32 text-amber-200" viewBox="0 0 100 100" fill="currentColor">
                      <path d="M50,10 C40,25 35,35 35,45 C35,60 42,75 50,90 C58,75 65,60 65,45 C65,35 60,25 50,10 Z" />
                      <rect x="47" y="30" width="6" height="40" rx="3" />
                      <rect x="40" y="47" width="20" height="6" rx="3" />
                    </svg>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setActiveTab('beranda')}
                        className="bg-white/10 hover:bg-white/25 p-2 rounded-xl border border-white/10 text-white shadow-xs transition-all focus:ring-2 focus:ring-white/20 cursor-pointer flex items-center justify-center shrink-0"
                      >
                        <ChevronRight className="w-4 h-4 rotate-180" />
                      </button>
                      <div className="relative w-11 h-11 rounded-full border-2 border-yellow-400 p-0.5 bg-[#042f2e] flex items-center justify-center shadow-md overflow-hidden shrink-0">
                        {pengaturan?.logo ? (
                          <img
                            src={getCleanImageUrl(pengaturan.logo)}
                            alt={pengaturan.nama_lembaga || "Logo"}
                            className="w-full h-full object-cover rounded-full"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const fallbackIcon = document.getElementById('header-fallback-icon-agenda');
                              if (fallbackIcon) fallbackIcon.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          id="header-fallback-icon-agenda"
                          style={{ display: pengaturan?.logo ? 'none' : 'flex' }}
                          className="w-full h-full items-center justify-center text-yellow-300 font-bold"
                        >
                          <i className="fa-solid fa-mosque text-lg text-yellow-400 animate-pulse"></i>
                        </div>
                      </div>

                      <div className="text-left min-w-0">
                        <p className="text-amber-300 text-[8px] font-black uppercase tracking-widest leading-none mb-1">SIM TPQ DIGITAL</p>

                        <h3 className="text-sm font-bold tracking-tight text-white flex flex-wrap items-center gap-1.5 mt-0.5">
                          {getCleanName(user.nama_lengkap)}
                          <span className="w-3.5 h-3.5 bg-teal-500 rounded-full flex items-center justify-center text-white p-0.5 shadow-xs shrink-0" title="Verified Account">
                            <CheckCircle className="w-2.5 h-2.5 text-white" />
                          </span>
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {onSyncData && (
                        <button
                          onClick={() => {
                            onSyncData();
                            showToast("Memperbarui data pusat secara aman...");
                          }}
                          disabled={isSyncing}
                          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all btn-active ${isSyncing
                            ? 'bg-teal-600/40 border-teal-500/40 text-teal-300 animate-spin cursor-not-allowed'
                            : 'bg-white/10 border-white/20 text-teal-100 hover:bg-white/20 hover:text-white cursor-pointer'
                            }`}
                          title="Perbarui Data Hub"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      )}

                      <button
                        onClick={onLogout}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-rose-500 hover:text-white border border-white/20 flex items-center justify-center text-rose-200 transition-all btn-active cursor-pointer"
                        title="Keluar Akun"
                      >
                        <LogOut className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <div className="bg-white/15 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-bold text-white border border-white/10 shadow-3xs">
                      <Calendar className="w-3.5 h-3.5 text-amber-300" />
                      <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="bg-white/15 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-bold text-white border border-white/10 shadow-3xs">
                      <Clock className="w-3.5 h-3.5 text-amber-300" />
                      <span>{getHijriDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 space-y-4">
                <div className="flex items-center justify-between pl-2 border-l-4 border-slate-900/90 py-0.5 text-left ml-1">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 leading-tight">Agenda & Pengumuman</h3>
                    <p className="text-[10px] text-slate-700 font-semibold mt-0.5">Kelola agenda harian belajar hari ini dan pengumuman penting lembaga</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (showAgendaForm) {
                        resetAgendaForm();
                      } else {
                        setShowAgendaForm(true);
                      }
                    }}
                    className={`text-[9px] font-black uppercase tracking-wider py-2 px-3 rounded-xl flex items-center gap-1.5 cursor-pointer border shadow-xs transition-all shrink-0 ${showAgendaForm
                      ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                      : 'bg-teal-600 border-teal-700 text-white hover:bg-teal-700'
                      }`}
                  >
                    {showAgendaForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    {showAgendaForm ? 'Batal' : 'Tambah Agenda'}
                  </button>
                </div>

                {/* ADD / EDIT FORM */}
                {showAgendaForm && (
                  <form onSubmit={handleAgendaSubmit} className="bg-white rounded-3xl border border-slate-100/80 p-5 shadow-sm space-y-3.5 animate-fadeIn">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-50">
                      <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-teal-600" />
                        {editingAgenda ? 'Edit Agenda / Pengumuman' : 'Tambah Agenda / Pengumuman Baru'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-700 uppercase tracking-wider mb-1">Tipe Data</label>
                        <select
                          value={agendaTipe}
                          onChange={(e) => setAgendaTipe(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-100 p-2.5 text-xs font-bold text-slate-700 rounded-xl outline-none"
                        >
                          <option value="Agenda">Agenda Hari Ini</option>
                          <option value="Pengumuman">Pengumuman Penting</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-700 uppercase tracking-wider mb-1">Tanggal</label>
                        <input
                          type="date"
                          value={agendaTanggal}
                          onChange={(e) => setAgendaTanggal(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-100 p-2.5 text-xs font-bold text-slate-700 rounded-xl outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className={agendaTipe === 'Agenda' ? '' : 'col-span-2'}>
                        <label className="block text-[9px] font-bold text-slate-700 uppercase tracking-wider mb-1">Judul / Pengumuman</label>
                        <input
                          type="text"
                          placeholder={agendaTipe === 'Agenda' ? 'Contoh: Tahfidz Juz 30' : 'Contoh: Wisuda Tahfidz Qur\'an Ke-3'}
                          value={agendaJudul}
                          onChange={(e) => setAgendaJudul(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-100 p-2.5 text-xs font-medium text-slate-700 rounded-xl outline-none"
                          required
                        />
                      </div>

                      {agendaTipe === 'Agenda' && (
                        <div>
                          <label className="block text-[9px] font-bold text-slate-700 uppercase tracking-wider mb-1">Jam / Waktu</label>
                          <input
                            type="text"
                            placeholder="Contoh: 08.00 - 09.30"
                            value={agendaWaktu}
                            onChange={(e) => setAgendaWaktu(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 p-2.5 text-xs font-medium text-slate-700 rounded-xl outline-none"
                            required={agendaTipe === 'Agenda'}
                          />
                        </div>
                      )}
                    </div>

                    {agendaTipe === 'Agenda' && (
                      <div>
                        <label className="block text-[9px] font-bold text-slate-700 uppercase tracking-wider mb-1">Status Kegiatan</label>
                        <select
                          value={agendaStatus}
                          onChange={(e) => setAgendaStatus(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-100 p-2.5 text-xs font-bold text-slate-700 rounded-xl outline-none"
                        >
                          <option value="Berjalan">🟢 Berjalan</option>
                          <option value="Berikutnya">🟡 Berikutnya</option>
                          <option value="Selesai">🔵 Selesai</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-[9px] font-bold text-slate-700 uppercase tracking-wider mb-1">Deskripsi / Detail Tambahan</label>
                      <textarea
                        rows={2}
                        placeholder="Tuliskan keterangan lengkap atau catatan khusus mengenai agenda/pengumuman ini..."
                        value={agendaDeskripsi}
                        onChange={(e) => setAgendaDeskripsi(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 p-2.5 text-xs font-medium text-slate-700 rounded-xl outline-none"
                      />
                    </div>

                    {/* Image Upload for Agenda */}
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="block text-[9px] font-bold text-slate-700 uppercase tracking-wider mb-1">Gambar Pendukung</label>
                        {agendaUploadingImage && (
                          <span className="text-[8px] font-black text-teal-600 animate-pulse">SEDANG MENGUNGGAH...</span>
                        )}
                      </div>
                      <div className="flex gap-4 items-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 border border-slate-200">
                          {agendaGambar ? (
                            <img src={getCleanImageUrl(agendaGambar)} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                          ) : (
                            <Camera className="w-6 h-6 text-slate-300" />
                          )}
                        </div>
                        <div className="flex-grow space-y-2">
                          <input
                            type="file"
                            accept="image/*"
                            id="agenda-gambar-upload"
                            onChange={handleAgendaImageUpload}
                            className="hidden"
                          />
                          <label
                            htmlFor="agenda-gambar-upload"
                            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-xl transition-all shadow-xs cursor-pointer active:scale-97"
                          >
                            <Upload className="w-3.5 h-3.5" /> Pilih Gambar
                          </label>
                          {agendaGambar && (
                            <button
                              type="button"
                              onClick={() => setAgendaGambar('')}
                              className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-xl transition-all shadow-xs cursor-pointer active:scale-97 ml-1"
                            >
                              <X className="w-3 h-3" /> Hapus
                            </button>
                          )}
                          <p className="text-[8px] text-slate-700 leading-relaxed font-sans">
                            Upload foto kegiatan atau poster pengumuman. Gambar akan disimpan di Google Drive.
                          </p>
                        </div>
                      </div>
                      {agendaGambar && agendaGambar.startsWith('data:') && (
                        <p className="text-[8px] text-amber-600 mt-1 font-bold">
                          ⚠️ Gambar disimpan lokal (base64). Koneksi cloud tidak tersedia.
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 justify-end pt-1.5">
                      <button
                        type="button"
                        onClick={resetAgendaForm}
                        className="px-4 py-2 border border-slate-200 text-slate-800 rounded-xl text-[9px] font-bold uppercase tracking-wider hover:bg-slate-50 cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-teal-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-teal-700 cursor-pointer shadow-xs"
                      >
                        {editingAgenda ? 'Simpan Perubahan' : 'Simpan Agenda'}
                      </button>
                    </div>
                  </form>
                )}

                {/* LIST AREA WITH FILTERS */}
                <div className="bg-white rounded-3xl border border-slate-100/80 p-5 shadow-sm space-y-4">
                  {/* Filter Row */}
                  <div className="flex gap-2.5">
                    <div className="flex-1">
                      <label className="block text-[9px] font-bold text-slate-700 uppercase tracking-wider mb-1">Cari Agenda/Pengumuman</label>
                      <input
                        type="text"
                        placeholder="Ketik judul kegiatan..."
                        value={filterAgendaSearch}
                        onChange={(e) => setFilterAgendaSearch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 p-2 rounded-xl text-xs font-medium text-slate-700 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-700 uppercase tracking-wider mb-1">Filter Tipe</label>
                      <select
                        value={filterAgendaTipe}
                        onChange={(e) => setFilterAgendaTipe(e.target.value as any)}
                        className="bg-slate-50 border border-slate-100 p-2 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
                      >
                        <option value="Semua">Semua</option>
                        <option value="Agenda">Agenda</option>
                        <option value="Pengumuman">Pengumuman</option>
                      </select>
                    </div>
                  </div>

                  {/* Items Render */}
                  <div className="space-y-3">
                    {agendaList
                      .filter(a => {
                        if (filterAgendaTipe !== 'Semua' && a.tipe !== filterAgendaTipe) return false;
                        if (filterAgendaSearch && !a.judul.toLowerCase().includes(filterAgendaSearch.toLowerCase())) return false;
                        return true;
                      })
                      .map((item, idx) => (
                        <div key={item.id || idx} className="border border-slate-100 rounded-2xl p-4 flex justify-between items-start gap-4 hover:bg-slate-50/50 transition-colors">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${item.tipe === 'Agenda'
                                ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                }`}>
                                {item.tipe}
                              </span>
                              {item.tipe === 'Agenda' && (
                                <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full ${item.status === 'Berjalan' ? 'bg-teal-50 text-teal-600' :
                                  item.status === 'Berikutnya' ? 'bg-amber-50 text-amber-600' :
                                    'bg-slate-100 text-black font-medium'
                                  }`}>
                                  {item.status}
                                </span>
                              )}
                              <span className="text-[9px] text-slate-700 font-semibold">{formatTanggal(item.tanggal)}</span>
                              {item.tipe === 'Agenda' && <span className="text-[9px] text-teal-600 font-bold bg-teal-50 px-1.5 py-0.5 rounded">{item.waktu}</span>}
                            </div>
                            <h4 className="text-xs font-extrabold text-slate-800">{item.judul}</h4>
                            {item.deskripsi && <p className="text-[10px] text-slate-800 leading-relaxed">{item.deskripsi}</p>}
                            {item.gambar && (
                              <div className="mt-2 w-full max-h-32 overflow-hidden rounded-xl border border-slate-100">
                                <img src={getCleanImageUrl(item.gambar)} alt={item.judul} className="w-full h-32 object-cover" referrerPolicy="no-referrer" />
                              </div>
                            )}
                          </div>

                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleEditAgenda(item)}
                              className="p-1.5 hover:bg-slate-100 text-slate-800 hover:text-slate-700 rounded-lg cursor-pointer"
                              title="Edit Agenda"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAgenda(item.id)}
                              className="p-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded-lg cursor-pointer"
                              title="Hapus Agenda"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                    {agendaList.filter(a => {
                      if (filterAgendaTipe !== 'Semua' && a.tipe !== filterAgendaTipe) return false;
                      if (filterAgendaSearch && !a.judul.toLowerCase().includes(filterAgendaSearch.toLowerCase())) return false;
                      return true;
                    }).length === 0 && (
                        <div className="text-center py-8 text-slate-700 text-xs">
                          Tidak ada agenda atau pengumuman yang sesuai kriteria pencarian.
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PENDAFTARAN ONLINE */}
          {activeTab === 'pendaftaran' && (
            <div className="flex flex-col text-left animate-fadeIn">

              {/* STICKY HEADER WRAPPER FOR PENDAFTARAN */}
              <div className="hidden">
                <div className="bg-teal-600 text-white pt-4 pb-8 px-5 relative overflow-hidden shadow-[0_4px_20px_rgba(13,75,69,0.12)]">
                  <div className="absolute top-0 right-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

                  <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none select-none">
                    <svg className="w-32 h-32 text-amber-200" viewBox="0 0 100 100" fill="currentColor">
                      <path d="M50,10 C40,25 35,35 35,45 C35,60 42,75 50,90 C58,75 65,60 65,45 C65,35 60,25 50,10 Z" />
                      <rect x="47" y="30" width="6" height="40" rx="3" />
                      <rect x="40" y="47" width="20" height="6" rx="3" />
                    </svg>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setActiveTab('beranda')}
                        className="bg-white/10 hover:bg-white/25 p-2 rounded-xl border border-white/10 text-white shadow-xs transition-all focus:ring-2 focus:ring-white/20 cursor-pointer flex items-center justify-center shrink-0"
                      >
                        <ChevronRight className="w-4 h-4 rotate-180" />
                      </button>
                      <div className="relative w-11 h-11 rounded-full border-2 border-yellow-400 p-0.5 bg-[#042f2e] flex items-center justify-center shadow-md overflow-hidden shrink-0">
                        {pengaturan?.logo ? (
                          <img
                            src={getCleanImageUrl(pengaturan.logo)}
                            alt={pengaturan.nama_lembaga || "Logo"}
                            className="w-full h-full object-cover rounded-full"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const fallbackIcon = document.getElementById('header-fallback-icon-pendaftaran');
                              if (fallbackIcon) fallbackIcon.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          id="header-fallback-icon-pendaftaran"
                          style={{ display: pengaturan?.logo ? 'none' : 'flex' }}
                          className="w-full h-full items-center justify-center text-yellow-300 font-bold"
                        >
                          <i className="fa-solid fa-mosque text-lg text-yellow-400 animate-pulse"></i>
                        </div>
                      </div>

                      <div className="text-left min-w-0">
                        <p className="text-amber-300 text-[8px] font-black uppercase tracking-widest leading-none mb-1">SIM TPQ DIGITAL</p>

                        <h3 className="text-sm font-bold tracking-tight text-white flex flex-wrap items-center gap-1.5 mt-0.5">
                          {getCleanName(user.nama_lengkap)}
                          <span className="w-3.5 h-3.5 bg-teal-500 rounded-full flex items-center justify-center text-white p-0.5 shadow-xs shrink-0" title="Verified Account">
                            <CheckCircle className="w-2.5 h-2.5 text-white" />
                          </span>
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {onSyncData && (
                        <button
                          onClick={() => {
                            onSyncData();
                            showToast("Memperbarui data pusat secara aman...");
                          }}
                          disabled={isSyncing}
                          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all btn-active ${isSyncing
                            ? 'bg-teal-600/40 border-teal-500/40 text-teal-300 animate-spin cursor-not-allowed'
                            : 'bg-white/10 border-white/20 text-teal-100 hover:bg-white/20 hover:text-white cursor-pointer'
                            }`}
                          title="Perbarui Data Hub"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      )}

                      <button
                        onClick={onLogout}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-rose-500 hover:text-white border border-white/20 flex items-center justify-center text-rose-200 transition-all btn-active cursor-pointer"
                        title="Keluar Akun"
                      >
                        <LogOut className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <div className="bg-white/15 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-bold text-white border border-white/10 shadow-3xs">
                      <Calendar className="w-3.5 h-3.5 text-amber-300" />
                      <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="bg-white/15 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-bold text-white border border-white/10 shadow-3xs">
                      <Clock className="w-3.5 h-3.5 text-amber-300" />
                      <span>{getHijriDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 space-y-4">
                <div className="flex items-center gap-3 pl-2 border-l-4 border-slate-900/90 py-0.5 text-left ml-1">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 leading-tight">Verifikasi Pendaftaran Online</h3>
                    <p className="text-[10px] text-slate-700 font-semibold mt-0.5">Kelola dan aktifkan calon santri yang mendaftar secara online</p>
                  </div>
                </div>

                {/* Quick Status Stats Card */}
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { label: 'SEMUA', count: pendaftaranList.length, color: 'text-slate-700 bg-white border-slate-200/60' },
                    { label: 'PENDING', count: pendaftaranList.filter(p => p.status === 'Pending').length, color: 'text-slate-700 bg-white border-slate-200/60' },
                    { label: 'AKTIF/SANTRI', count: pendaftaranList.filter(p => p.status === 'Aktif').length, color: 'text-slate-700 bg-white border-slate-200/60' },
                  ].map((s, idx) => (
                    <div key={idx} className={`rounded-2xl p-2.5 border shadow-xs text-center ${s.color}`}>
                      <span className="block text-base font-black leading-none mb-0.5">{s.count}</span>
                      <span className="text-[8px] font-black uppercase tracking-wider block opacity-85">{s.label}</span>
                    </div>
                  ))}
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs space-y-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-700 uppercase tracking-wider mb-1">Cari Nama Anak</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Ketik nama calon santri..."
                        value={filterPendaftaranNama}
                        onChange={(e) => setFilterPendaftaranNama(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs outline-none focus:bg-white focus:border-teal-500 font-medium transition-all"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-700 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-700 uppercase tracking-wider mb-1">Status Verifikasi</label>
                    <div className="flex gap-1.5">
                      {(['All', 'Pending', 'Aktif'] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setFilterPendaftaranStatus(st)}
                          className={`flex-1 py-1.5 rounded-lg border text-center text-[10px] font-bold uppercase transition-all cursor-pointer ${filterPendaftaranStatus === st ? 'bg-teal-600 text-white border-teal-600 shadow-xs' : 'bg-slate-50 text-black font-medium border-slate-200 hover:bg-slate-100'}`}
                        >
                          {st === 'All' ? 'Semua' : st === 'Pending' ? 'Pending' : 'Diterima'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Registration Lists */}
                <div className="space-y-3">
                  {(() => {
                    const filtered = pendaftaranList.filter(p => {
                      const matchesName = p.nama_santri.toLowerCase().includes(filterPendaftaranNama.toLowerCase());
                      const matchesStatus = filterPendaftaranStatus === 'All' || p.status === filterPendaftaranStatus;
                      return matchesName && matchesStatus;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-slate-700 text-xs">
                          Tidak ada data pendaftaran yang cocok.
                        </div>
                      );
                    }

                    return filtered.map((p) => (
                      <div key={p.id_pendaftaran} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs space-y-3 text-slate-700">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-900">{p.nama_santri}</h4>
                            <p className="text-[10px] text-slate-800 font-medium">Ortu: {p.nama_ortu} ({p.wa_ortu})</p>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${p.status === 'Aktif' ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'}`}>
                            {p.status === 'Aktif' ? 'Diterima' : 'Pending'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] border-t border-slate-50 pt-2 text-black font-medium">
                          <div>
                            <span className="text-slate-700 block text-[9px] font-bold uppercase">Halaqah Pilihan</span>
                            <span className="font-semibold">{p.halaqah || '-'}</span>
                          </div>
                          <div>
                            <span className="text-slate-700 block text-[9px] font-bold uppercase">Tanggal Daftar</span>
                            <span className="font-semibold">{formatTanggal(p.tanggal_daftar)}</span>
                          </div>
                        </div>

                        {p.status === 'Pending' ? (
                          <div className="flex gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                let maxNum = 1000;
                                santriList.forEach(s => {
                                  const val = parseInt(s.nis, 10);
                                  if (!isNaN(val) && val > maxNum) {
                                    maxNum = val;
                                  }
                                });
                                const nextNis = String(maxNum + 1);

                                setSelectedRegForVerify(p);
                                setInputNisForVerify(nextNis);
                                setInputClassForVerify(p.halaqah || kelasList[0]?.nama_kelas || '');
                              }}
                              className="flex-1 bg-teal-500 hover:bg-teal-600 text-white text-[10px] font-black uppercase tracking-wider py-2 px-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              Terima & Beri NIS
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Apakah Anda yakin ingin menghapus pendaftaran ${p.nama_santri}?`)) {
                                  if (onDeletePendaftaran) onDeletePendaftaran(p.id_pendaftaran);
                                }
                              }}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 rounded-xl transition-all flex items-center justify-center border border-rose-100 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="bg-slate-50 rounded-xl p-2.5 flex items-center justify-between text-[10px]">
                            <span className="text-slate-800">Telah diaktifkan dengan NIS: <strong className="text-slate-800 font-extrabold">{p.nis_ditetapkan}</strong></span>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Apakah Anda yakin ingin menghapus arsip pendaftaran ${p.nama_santri}?`)) {
                                  if (onDeletePendaftaran) onDeletePendaftaran(p.id_pendaftaran);
                                }
                              }}
                              className="text-rose-500 hover:text-rose-700 font-bold"
                            >
                              Hapus Arsip
                            </button>
                          </div>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: WEBSITE CUSTOMIZER */}
          {activeTab === 'website' && (
            <div className="flex flex-col text-left animate-fadeIn">

              {/* STICKY HEADER WRAPPER FOR WEBSITE */}
              <div className="hidden">
                <div className="bg-teal-600 text-white pt-4 pb-8 px-5 relative overflow-hidden shadow-[0_4px_20px_rgba(13,75,69,0.12)]">
                  <div className="absolute top-0 right-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

                  <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none select-none">
                    <svg className="w-32 h-32 text-amber-200" viewBox="0 0 100 100" fill="currentColor">
                      <path d="M50,10 C40,25 35,35 35,45 C35,60 42,75 50,90 C58,75 65,60 65,45 C65,35 60,25 50,10 Z" />
                      <rect x="47" y="30" width="6" height="40" rx="3" />
                      <rect x="40" y="47" width="20" height="6" rx="3" />
                    </svg>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setActiveTab('beranda')}
                        className="bg-white/10 hover:bg-white/25 p-2 rounded-xl border border-white/10 text-white shadow-xs transition-all focus:ring-2 focus:ring-white/20 cursor-pointer flex items-center justify-center shrink-0"
                      >
                        <ChevronRight className="w-4 h-4 rotate-180" />
                      </button>
                      <div className="relative w-11 h-11 rounded-full border-2 border-yellow-400 p-0.5 bg-[#042f2e] flex items-center justify-center shadow-md overflow-hidden shrink-0">
                        {pengaturan?.logo ? (
                          <img
                            src={getCleanImageUrl(pengaturan.logo)}
                            alt={pengaturan.nama_lembaga || "Logo"}
                            className="w-full h-full object-cover rounded-full"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const fallbackIcon = document.getElementById('header-fallback-icon-website');
                              if (fallbackIcon) fallbackIcon.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          id="header-fallback-icon-website"
                          style={{ display: pengaturan?.logo ? 'none' : 'flex' }}
                          className="w-full h-full items-center justify-center text-yellow-300 font-bold"
                        >
                          <i className="fa-solid fa-mosque text-lg text-yellow-400 animate-pulse"></i>
                        </div>
                      </div>

                      <div className="text-left min-w-0">
                        <p className="text-amber-300 text-[8px] font-black uppercase tracking-widest leading-none mb-1">SIM TPQ DIGITAL</p>

                        <h3 className="text-sm font-bold tracking-tight text-white flex flex-wrap items-center gap-1.5 mt-0.5">
                          {getCleanName(user.nama_lengkap)}
                          <span className="w-3.5 h-3.5 bg-teal-500 rounded-full flex items-center justify-center text-white p-0.5 shadow-xs shrink-0" title="Verified Account">
                            <CheckCircle className="w-2.5 h-2.5 text-white" />
                          </span>
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {onSyncData && (
                        <button
                          onClick={() => {
                            onSyncData();
                            showToast("Memperbarui data pusat secara aman...");
                          }}
                          disabled={isSyncing}
                          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all btn-active ${isSyncing
                            ? 'bg-teal-600/40 border-teal-500/40 text-teal-300 animate-spin cursor-not-allowed'
                            : 'bg-white/10 border-white/20 text-teal-100 hover:bg-white/20 hover:text-white cursor-pointer'
                            }`}
                          title="Perbarui Data Hub"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      )}

                      <button
                        onClick={onLogout}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-rose-500 hover:text-white border border-white/20 flex items-center justify-center text-rose-200 transition-all btn-active cursor-pointer"
                        title="Keluar Akun"
                      >
                        <LogOut className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <div className="bg-white/15 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-bold text-white border border-white/10 shadow-3xs">
                      <Calendar className="w-3.5 h-3.5 text-amber-300" />
                      <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="bg-white/15 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-bold text-white border border-white/10 shadow-3xs">
                      <Clock className="w-3.5 h-3.5 text-amber-300" />
                      <span>{getHijriDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 ml-1">
                  <div className="flex items-center gap-3">
                    <div className="pl-2 border-l-4 border-slate-900/90 py-0.5 text-left">
                      <h3 className="text-sm font-bold text-slate-800 leading-tight">Website Customizer</h3>
                      <p className="text-[10px] text-slate-700 font-semibold mt-0.5">Atur & Desain Website Publik TPQ {pengaturan.nama_lembaga}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-2xs ${webIsPublished
                      ? 'bg-teal-50 text-teal-700 border border-teal-200/50'
                      : 'bg-amber-50 text-amber-700 border border-amber-200/50'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${webIsPublished ? 'bg-teal-500 animate-pulse' : 'bg-amber-500'}`} />
                      {webIsPublished ? 'SUDAH PUBLISH' : 'DRAFT / BELUM PUBLISH'}
                    </div>

                    {webIsPublished && (
                      <a
                        href={`${window.location.origin}/?tpq=${getActiveSchoolUsername()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-teal-800 hover:bg-teal-900 text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1 shadow-sm shrink-0"
                      >
                        <Globe className="w-3 h-3" /> Lihat Website
                      </a>
                    )}
                  </div>
                </div>


                <div className="max-w-4xl mx-auto w-full mt-4 space-y-6">
                  <div className="space-y-4">
                    {/* Navigation Accordion Headers */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {[
                        { id: 'hero', label: 'Spanduk Hero', icon: Sparkles },
                        { id: 'profile', label: 'Profil TPQ', icon: BookOpen },
                        { id: 'gallery', label: '4 Program Galeri', icon: Camera },
                        { id: 'media', label: 'Peta & Video', icon: Video },
                        { id: 'testimonial', label: 'Testimoni', icon: MessageSquare }
                      ].map((sec) => {
                        const IconComp = sec.icon;
                        const isActive = activeSection === sec.id;
                        return (
                          <button
                            key={sec.id}
                            type="button"
                            onClick={() => {
                              setActiveSection(sec.id);
                            }}
                            className={`py-2.5 px-3 rounded-xl border text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${isActive
                              ? 'bg-teal-50 border-teal-200/60 text-teal-900 shadow-3xs'
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-black font-medium'
                              }`}
                          >
                            <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-teal-600' : 'text-slate-700'}`} />
                            <span>{sec.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* ACTIVE FORM CONTAINER */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4">
                      {activeSection === 'hero' && (
                        <div className="space-y-4 animate-fadeIn">
                          <div className="border-b border-slate-50 pb-2">
                            <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Spanduk Atas (Hero Section)</h4>
                            <p className="text-[9px] text-slate-700 font-medium font-sans">Atur judul utama, sub-judul, dan gambar latar belakang spanduk atas.</p>
                          </div>

                          <div className="space-y-1.5 font-sans">
                            <label className="text-[9px] font-black text-slate-800 uppercase">Judul Utama Hero</label>
                            <input
                              type="text"
                              value={localWebsiteData.judul_hero || ""}
                              onChange={(e) => {
                                setLocalWebsiteData(prev => ({ ...prev, judul_hero: e.target.value }));
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 outline-none transition-all font-semibold"
                              placeholder="Membentuk Generasi Qur'ani & Berakhlak Karimah"
                            />
                          </div>

                          <div className="space-y-1.5 font-sans">
                            <label className="text-[9px] font-black text-slate-800 uppercase">Sub Judul Hero</label>
                            <textarea
                              value={localWebsiteData.sub_judul_hero || ""}
                              onChange={(e) => {
                                setLocalWebsiteData(prev => ({ ...prev, sub_judul_hero: e.target.value }));
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 outline-none transition-all font-semibold h-16 resize-none"
                              placeholder="Kami berdedikasi mendidik putra-putri tercinta untuk mahir membaca, menghafal, dan mengamalkan nilai-nilai suci Al-Qur'an."
                            />
                          </div>

                          <div className="space-y-3 font-sans">
                            <div className="flex items-center justify-between">
                              <label className="text-[9px] font-black text-slate-800 uppercase">Unggah Gambar Hero (Cloud)</label>
                              {uploadingImage['hero'] && (
                                <span className="text-[8px] font-black text-teal-600 animate-pulse">SEDANG MENGUNGGAH...</span>
                              )}
                            </div>
                            <div className="flex gap-4 items-center">
                              <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 border border-slate-200">
                                {localWebsiteData.gambar_hero ? (
                                  <img src={getCleanImageUrl(localWebsiteData.gambar_hero)} className="w-full h-full object-cover" alt="Hero" referrerPolicy="no-referrer" />
                                ) : (
                                  <Camera className="w-5 h-5 text-slate-300" />
                                )}
                              </div>
                              <div className="flex-grow space-y-2">
                                <input
                                  type="file"
                                  accept="image/*"
                                  id="hero-upload-input"
                                  onChange={(e) => handleImageUpload(e, 'hero')}
                                  className="hidden"
                                />
                                <label
                                  htmlFor="hero-upload-input"
                                  className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-xl transition-all shadow-xs cursor-pointer active:scale-97"
                                >
                                  <Upload className="w-3.5 h-3.5" /> Pilih File Gambar
                                </label>
                                <p className="text-[8px] text-slate-700 leading-relaxed font-sans">
                                  Rekomendasi gambar horizontal kualitas HD. Gambar akan diunggah secara otomatis langsung ke folder penyimpanan cloud Anda.
                                </p>
                              </div>
                            </div>

                            <div className="space-y-1 pt-1.5">
                              <span className="text-[8px] font-bold text-slate-700 uppercase">Atau gunakan URL Gambar Langsung</span>
                              <input
                                type="text"
                                value={localWebsiteData.gambar_hero || ""}
                                onChange={(e) => {
                                  setLocalWebsiteData(prev => ({ ...prev, gambar_hero: e.target.value }));
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-[10px] text-slate-800 focus:bg-white focus:border-teal-500 outline-none transition-all font-mono"
                                placeholder="https://images.unsplash.com/photo-..."
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {activeSection === 'profile' && (
                        <div className="space-y-4 animate-fadeIn">
                          <div className="border-b border-slate-50 pb-2">
                            <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Profil Lembaga</h4>
                            <p className="text-[9px] text-slate-700 font-medium">Tuliskan judul profil, kata sambutan, dan deskripsi pengurus lembaga.</p>
                          </div>

                          <div className="space-y-1.5 font-sans">
                            <label className="text-[9px] font-black text-slate-800 uppercase">Judul Profil Utama</label>
                            <input
                              type="text"
                              value={localWebsiteData.judul_profil || ""}
                              onChange={(e) => {
                                setLocalWebsiteData(prev => ({ ...prev, judul_profil: e.target.value }));
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 outline-none transition-all font-semibold"
                              placeholder="Mendidik Al-Qur'an dengan Kurikulum Terstruktur & Modern"
                            />
                          </div>

                          <div className="space-y-1.5 font-sans">
                            <label className="text-[9px] font-black text-slate-800 uppercase">Teks Deskripsi Profil Lembaga</label>
                            <textarea
                              value={localWebsiteData.profil || ""}
                              onChange={(e) => {
                                setLocalWebsiteData(prev => ({ ...prev, profil: e.target.value }));
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:border-teal-500 outline-none transition-all font-semibold h-44 resize-none"
                              placeholder="Tuliskan latar belakang, metode pengajaran, serta keunggulan administratif TPQ Anda..."
                            />
                          </div>
                        </div>
                      )}

                      {activeSection === 'gallery' && (
                        <div className="space-y-6 animate-fadeIn">
                          <div className="border-b border-slate-50 pb-2">
                            <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">4 Galeri Program Lembaga</h4>
                            <p className="text-[9px] text-slate-700 font-medium font-sans">Unggah foto kegiatan belajar mengajar serta tulis judul dan keterangan untuk tiap program unggulan.</p>
                          </div>

                          <div className="space-y-6 font-sans">
                            {(['program_1', 'program_2', 'program_3', 'program_4'] as const).map((progKey, index) => {
                              const titleKey = `${progKey}_judul` as const;
                              const imageKey = `${progKey}_gambar` as const;
                              const descKey = `${progKey}_ket` as const;

                              return (
                                <div key={progKey} className="bg-slate-50/50 rounded-2xl border border-slate-100 p-4 space-y-3.5">
                                  <div className="flex items-center justify-between">
                                    <span className="bg-teal-600 text-white font-extrabold text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-lg">PROGRAM {index + 1}</span>
                                    {uploadingImage[progKey] && (
                                      <span className="text-[8px] font-black text-teal-600 animate-pulse">SEDANG UPLOAD...</span>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                      <label className="text-[8px] font-black text-slate-700 uppercase">Nama Program</label>
                                      <input
                                        type="text"
                                        value={localWebsiteData[titleKey] || ""}
                                        onChange={(e) => {
                                          setLocalWebsiteData(prev => ({ ...prev, [titleKey]: e.target.value }));
                                        }}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-teal-500 outline-none font-semibold"
                                        placeholder={`Program Unggulan ${index + 1}`}
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="text-[8px] font-black text-slate-700 uppercase">Keterangan Singkat</label>
                                      <input
                                        type="text"
                                        value={localWebsiteData[descKey] || ""}
                                        onChange={(e) => {
                                          setLocalWebsiteData(prev => ({ ...prev, [descKey]: e.target.value }));
                                        }}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-teal-500 outline-none font-semibold"
                                        placeholder="Keterangan singkat..."
                                      />
                                    </div>
                                  </div>

                                  <div className="flex gap-4 items-center">
                                    <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-slate-200">
                                      {localWebsiteData[imageKey] ? (
                                        <img src={getCleanImageUrl(localWebsiteData[imageKey])} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                                      ) : (
                                        <Camera className="w-4 h-4 text-slate-300" />
                                      )}
                                    </div>
                                    <div className="flex-grow space-y-1.5 font-sans">
                                      <input
                                        type="file"
                                        accept="image/*"
                                        id={`upload-file-${progKey}`}
                                        onChange={(e) => handleImageUpload(e, progKey)}
                                        className="hidden"
                                      />
                                      <label
                                        htmlFor={`upload-file-${progKey}`}
                                        className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-xl cursor-pointer shadow-2xs"
                                      >
                                        <Upload className="w-3 h-3" /> Unggah Foto ke Cloud
                                      </label>
                                      <input
                                        type="text"
                                        value={localWebsiteData[imageKey] || ""}
                                        onChange={(e) => {
                                          setLocalWebsiteData(prev => ({ ...prev, [imageKey]: e.target.value }));
                                        }}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-[9px] text-slate-800 focus:border-teal-500 outline-none font-mono"
                                        placeholder="Atau tempel URL gambar di sini..."
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {activeSection === 'media' && (
                        <div className="space-y-4 animate-fadeIn">
                          <div className="border-b border-slate-50 pb-2">
                            <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Peta & Video</h4>
                            <p className="text-[9px] text-slate-700 font-medium">Sematkan tautan peta lokasi lembaga dan video profil YouTube.</p>
                          </div>

                          <div className="space-y-1.5 font-sans">
                            <label className="text-[9px] font-black text-slate-800 uppercase font-bold">Link Embed Google Maps (Iframe Src)</label>
                            <input
                              type="text"
                              value={localWebsiteData.link_peta || ""}
                              onChange={(e) => {
                                setLocalWebsiteData(prev => ({ ...prev, link_peta: e.target.value }));
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:border-teal-500 outline-none transition-all font-semibold"
                              placeholder="Contoh: https://www.google.com/maps/embed?pb=..."
                            />
                            <p className="text-[8px] text-slate-700 leading-normal">
                              Dapatkan dari Google Maps &gt; Bagikan &gt; Sematkan Peta &gt; Salin link di dalam atribut `src` iframe tersebut.
                            </p>
                          </div>

                          <div className="space-y-1.5 font-sans">
                            <label className="text-[9px] font-black text-slate-800 uppercase font-bold">Link Video Profil YouTube</label>
                            <input
                              type="text"
                              value={localWebsiteData.link_video || ""}
                              onChange={(e) => {
                                setLocalWebsiteData(prev => ({ ...prev, link_video: e.target.value }));
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:border-teal-500 outline-none transition-all font-semibold"
                              placeholder="Contoh: https://www.youtube.com/embed/dQw4w9WgXcQ atau https://youtu.be/..."
                            />
                          </div>
                        </div>
                      )}

                      {activeSection === 'testimonial' && (
                        <div className="space-y-6 animate-fadeIn">
                          <div className="border-b border-slate-50 pb-2">
                            <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Testimoni Wali Santri</h4>
                            <p className="text-[9px] text-slate-700 font-medium">Tuliskan ulasan positif dari para wali santri untuk meningkatkan kepercayaan masyarakat.</p>
                          </div>

                          {([1, 2, 3] as const).map((num) => {
                            const nameKey = `testi_${num}_nama` as const;
                            const roleKey = `testi_${num}_jabatan` as const;
                            const msgKey = `testi_${num}_pesan` as const;

                            return (
                              <div key={num} className="bg-slate-50/50 rounded-2xl border border-slate-100 p-4 space-y-3.5">
                                <span className="bg-amber-500 text-slate-950 font-extrabold text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-lg">TESTIMONI {num}</span>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div className="space-y-1.5">
                                    <label className="text-[8px] font-black text-slate-700 uppercase">Nama Wali Santri</label>
                                    <input
                                      type="text"
                                      value={localWebsiteData[nameKey] || ""}
                                      onChange={(e) => {
                                        setLocalWebsiteData(prev => ({ ...prev, [nameKey]: e.target.value }));
                                      }}
                                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-teal-500 outline-none font-semibold"
                                      placeholder="Nama lengkap..."
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-[8px] font-black text-slate-700 uppercase">Jabatan / Keterangan</label>
                                    <input
                                      type="text"
                                      value={localWebsiteData[roleKey] || ""}
                                      onChange={(e) => {
                                        setLocalWebsiteData(prev => ({ ...prev, [roleKey]: e.target.value }));
                                      }}
                                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-teal-500 outline-none font-semibold"
                                      placeholder="Contoh: Wali Santri Kelas A"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-1.5 font-sans">
                                  <label className="text-[8px] font-black text-slate-700 uppercase">Ulasan / Pesan Testimoni</label>
                                  <textarea
                                    value={localWebsiteData[msgKey] || ""}
                                    onChange={(e) => {
                                      setLocalWebsiteData(prev => ({ ...prev, [msgKey]: e.target.value }));
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-teal-500 outline-none transition-all font-semibold h-20 resize-none"
                                    placeholder="Isi testimoni..."
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Action buttons inside the active form view */}
                      <div className="pt-3 border-t border-slate-50 flex items-center justify-between gap-3 font-sans">
                        <div className="text-left">
                          <p className="text-[7.5px] text-slate-700 font-bold uppercase tracking-wider">SISTEM INTEGRASI</p>
                          <p className="text-[8.5px] text-black font-medium font-bold">
                            Cloud Storage: <strong className="text-teal-600 font-bold">TERINTEGRASI OTOMATIS (AKTIF)</strong>
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={isSavingWebsiteForm}
                          onClick={handleSaveWebsiteForm}
                          className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-black text-[10px] uppercase tracking-widest py-3 px-6 rounded-2xl transition-all shadow-md active:scale-97 flex items-center gap-2 cursor-pointer"
                        >
                          {isSavingWebsiteForm ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" /> Menyimpan...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 text-teal-400" /> Simpan Perubahan Konten
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Publish & Status Card */}
                  <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-md space-y-4 text-left">
                    <div className="space-y-1">
                      <h4 className="text-[11px] font-black text-teal-400 uppercase tracking-wider">Status Publikasi & Akses</h4>
                      <p className="text-[9px] text-slate-700 leading-relaxed font-medium">Publikasikan seluruh kustomisasi tampilan dan data profil website Anda ke server awan secara instan.</p>
                    </div>

                    <div className="bg-slate-950/80 rounded-2xl p-3.5 border border-slate-850 space-y-2 text-[10px] font-semibold text-slate-300">
                      <div className="flex justify-between items-center">
                        <span>Status Rilis:</span>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${webIsPublished ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                          {webIsPublished ? 'SUDAH PUBLISH' : 'DRAFT'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Koneksi Server Cloud:</span>
                        <span className="text-teal-400">AKTIF (Real-time Cloud Sync)</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isPublishing || !!webJsonError}
                      onClick={handlePublishWebsite}
                      className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:hover:bg-teal-600 text-slate-950 font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isPublishing ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          Sedang Menyinkronkan...
                        </>
                      ) : (
                        <>
                          <Globe className="w-4 h-4" /> Publish Sekarang
                        </>
                      )}
                    </button>

                    {webIsPublished && (
                      <div className="pt-2 space-y-2 border-t border-slate-800/60 animate-fadeIn">
                        <p className="text-[9px] text-slate-700 font-bold uppercase tracking-wider">Tautan Publik Website Anda:</p>
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between gap-2">
                          <span className="font-mono text-[9px] text-teal-400 truncate select-all">{`${window.location.origin}/?tpq=${getActiveSchoolUsername()}`}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/?tpq=${getActiveSchoolUsername()}`);
                              showToast("Tautan disalin ke clipboard!");
                            }}
                            className="bg-slate-900 hover:bg-slate-850 text-slate-300 p-1.5 rounded-lg text-[8px] font-black uppercase border border-slate-800 shrink-0 cursor-pointer"
                          >
                            Salin Link
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Brosur & QR Code Section */}
                  <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-3">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-black font-medium" />
                      <h5 className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Brosur & QR Code</h5>
                    </div>
                    <p className="text-[9px] text-slate-700 font-semibold leading-relaxed">Gunakan tautan khusus TPQ Anda untuk disematkan di brosur pendaftaran wali santri secara digital.</p>

                    {landingPageQrUrl ? (
                      <div className="border border-slate-100 rounded-2xl p-3 flex flex-col items-center bg-slate-50">
                        <img src={landingPageQrUrl} alt="QR Code" className="w-32 h-32 object-contain" />
                        <span className="text-[8px] font-bold text-slate-700 uppercase tracking-wider mt-1">SCAN ME</span>
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-slate-100 rounded-2xl animate-pulse"></div>
                    )}

                    <a
                      href={landingPageQrUrl}
                      download={`QR_Pendaftaran_TPQ_${user?.username}.png`}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/50 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-3xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Unduh Kode QR
                    </a>
                  </div>

                  {/* Right Column: Visual Preview removed as requested */}
                  {false && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-teal-600" />
                          <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Visual Preview Website</h4>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping" />
                          <span className="text-[8px] font-black uppercase tracking-wider text-teal-600">LIVE SYNC PREVIEW</span>
                        </div>
                      </div>

                      {/* Mock Browser Envelope */}
                      <div className="bg-slate-100 rounded-3xl border border-slate-200/80 shadow-md overflow-hidden flex flex-col h-[750px] relative">
                        {/* Browser Bar */}
                        <div className="bg-slate-200/70 border-b border-slate-250/50 px-4 py-2.5 flex items-center gap-3 shrink-0">
                          <div className="flex gap-1.5 shrink-0">
                            <span className="w-2 h-2 rounded-full bg-rose-400" />
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            <span className="w-2 h-2 rounded-full bg-teal-400" />
                          </div>
                          <div className="bg-white border border-slate-250/30 rounded-lg px-3 py-1 text-[9px] text-slate-700 font-mono flex-grow truncate flex items-center gap-1.5 select-none">
                            <Lock className="w-2.5 h-2.5 text-slate-700 shrink-0" />
                            <span>https://tpq-terpadu.id/?tpq={getActiveSchoolUsername()}</span>
                          </div>
                        </div>

                        {/* Browser Viewport */}
                        <div className="flex-grow overflow-y-auto bg-slate-50 space-y-8 pb-12 select-none scrollbar-none">
                          {/* Navbar Preview */}
                          <div className="bg-white px-4 py-3 border-b border-slate-100/60 flex justify-between items-center sticky top-0 z-10 shadow-3xs">
                            <div className="flex items-center gap-1.5">
                              {logoInp ? (
                                <img src={getCleanImageUrl(logoInp)} className="w-5 h-5 object-contain" alt="Logo" />
                              ) : (
                                <div className="w-5 h-5 bg-teal-50 rounded flex items-center justify-center text-teal-600 font-bold text-[9px]">TPQ</div>
                              )}
                              <span className="text-[9px] font-black uppercase tracking-tight text-slate-800 truncate max-w-[130px]">
                                {pengaturan.nama_lembaga || "Lembaga TPQ"}
                              </span>
                            </div>
                            <span className="bg-teal-600 text-white px-2.5 py-1 rounded-full text-[7.5px] font-black uppercase tracking-wider scale-90">
                              Daftar Online
                            </span>
                          </div>

                          {/* Hero Section Preview */}
                          <div className="px-4">
                            <div
                              className="rounded-2xl overflow-hidden relative min-h-[180px] flex items-center justify-center px-4 py-8 bg-slate-900 border border-slate-850 shadow-sm"
                              style={{
                                backgroundImage: webHeroImage ? `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.75)), url(${getCleanImageUrl(webHeroImage)})` : 'linear-gradient(to bottom right, #0f766e, #0d9488)',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                              }}
                            >
                              <div className="text-center max-w-xs space-y-2 relative z-10 text-white">
                                <h2 className="text-xs sm:text-sm font-black tracking-tight leading-tight uppercase text-amber-300 drop-shadow-sm">
                                  {webHeroTitle || "Membentuk Generasi Qur'ani & Berakhlak Karimah"}
                                </h2>
                                <p className="text-[8px] text-slate-200/90 leading-relaxed font-medium font-sans">
                                  {webHeroSubtitle || "Kami berdedikasi mendidik putra-putri tercinta untuk mahir membaca, menghafal, dan mengamalkan nilai-nilai suci Al-Qur'an."}
                                </p>
                                <div className="pt-2 flex justify-center gap-2">
                                  <span className="bg-amber-400 text-slate-950 font-black py-1 px-2.5 rounded-full text-[7px] uppercase tracking-wider shadow-sm scale-90">
                                    Daftar Online Sekarang
                                  </span>
                                  <span className="bg-white/15 border border-white/20 text-white font-black py-1 px-2.5 rounded-full text-[7px] uppercase tracking-wider scale-90">
                                    Hubungi Admin
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Quick Stats Section Preview */}
                          <div className="px-4 -mt-10 relative z-10">
                            <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-2xl shadow-md border border-slate-100/80 text-center">
                              <div className="p-1 border-r border-slate-100">
                                <div className="bg-teal-50 text-teal-700 w-6 h-6 rounded-lg flex items-center justify-center mx-auto mb-1">
                                  <Users className="w-3.5 h-3.5" />
                                </div>
                                <h3 className="text-[9px] font-black text-slate-800">{santriList.length || 12}</h3>
                                <p className="text-[6px] text-slate-700 font-bold uppercase tracking-wider mt-0.5">Santri Aktif</p>
                              </div>
                              <div className="p-1 border-r border-slate-100">
                                <div className="bg-amber-50 text-amber-700 w-6 h-6 rounded-lg flex items-center justify-center mx-auto mb-1">
                                  <GraduationCap className="w-3.5 h-3.5" />
                                </div>
                                <h3 className="text-[9px] font-black text-slate-800">{kelasList.length || 3}</h3>
                                <p className="text-[6px] text-slate-700 font-bold uppercase tracking-wider mt-0.5">Halaqah Kelas</p>
                              </div>
                              <div className="p-1">
                                <div className="bg-teal-50 text-teal-700 w-6 h-6 rounded-lg flex items-center justify-center mx-auto mb-1">
                                  <Award className="w-3.5 h-3.5" />
                                </div>
                                <h3 className="text-[7.5px] font-black text-slate-800 truncate px-0.5" title={setPimpinan || pengaturan.nama_pimpinan || 'Ustadz / Pengasuh'}>
                                  {setPimpinan || pengaturan.nama_pimpinan || 'Ustadz / Pengasuh'}
                                </h3>
                                <p className="text-[6px] text-slate-700 font-bold uppercase tracking-wider mt-0.5">Pimpinan</p>
                              </div>
                            </div>
                          </div>

                          {/* Profil Lembaga Section Preview */}
                          <div className="px-4 text-center space-y-2">
                            <div className="inline-flex items-center gap-1 bg-teal-50 px-2 py-0.5 rounded-full text-[6.5px] font-extrabold uppercase tracking-wider text-teal-800">
                              Profil Lembaga
                            </div>
                            <h3 className="text-[9px] font-black text-slate-900 leading-snug">
                              {webProfileTitle || "Mendidik Al-Qur'an dengan Kurikulum Terstruktur & Modern"}
                            </h3>
                            <p className="text-[7.5px] text-slate-800 leading-relaxed font-medium font-sans">
                              {webProfileDesc || "Lembaga kami menggabungkan tradisi talaqqi yang murni dengan sistem administrasi berbasis digital. Wali santri dapat memantau perkembangan hafalan harian anak, rekap ibadah harian, SPP, dan tabungan harian."}
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-left pt-1">
                              {[
                                "Hafalan Metode Talaqqi",
                                "Buku Diary Mutabaah",
                                "Tabungan Wadiah",
                                "Sistem Rapor Digital"
                              ].map((pt, idx) => (
                                <div key={idx} className="flex gap-1 items-start p-1.5 bg-white rounded-lg border border-slate-100 shadow-3xs">
                                  <CheckCircle className="text-teal-600 w-2.5 h-2.5 shrink-0 mt-0.5" />
                                  <span className="text-[7px] font-bold text-slate-700">{pt}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Programs Section Preview */}
                          <div className="px-4 space-y-3">
                            <div className="text-center">
                              <span className="text-[6.5px] font-black tracking-widest text-teal-600 uppercase bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100/50">Daftar Halaqah</span>
                              <h3 className="text-[9px] font-black text-slate-800 uppercase tracking-wider mt-1">Pilihan Jenjang Belajar</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {kelasList.map((k) => {
                                const matchedClass = kelasList.find(
                                  item => item.nama_kelas.toLowerCase().trim() === k.nama_kelas.toLowerCase().trim() ||
                                    item.id_kelas.toLowerCase().trim() === k.id_kelas.toLowerCase().trim()
                                );
                                const curriculum = matchedClass ? mataPelajaranList.find(
                                  mp => mp.id_kelas.toLowerCase().trim() === matchedClass.id_kelas.toLowerCase().trim()
                                ) : null;

                                return (
                                  <div key={k.id_kelas} className="bg-white rounded-xl p-3 border border-slate-100 shadow-3xs text-left space-y-1.5">
                                    <div className="flex justify-between items-center">
                                      <span className="bg-teal-600 text-white font-extrabold text-[6px] uppercase px-1.5 py-0.5 rounded">Halaqah</span>
                                      <span className="text-[6px] text-slate-700">ID: {k.id_kelas.slice(0, 5)}</span>
                                    </div>
                                    <h4 className="text-[8.5px] font-black text-slate-800">Kelas {k.nama_kelas}</h4>

                                    {curriculum ? (
                                      <div className="space-y-1 pt-1 border-t border-slate-50">
                                        {curriculum.tilawah_stages && curriculum.tilawah_stages.length > 0 && (
                                          <p className="text-[6.5px] text-slate-800 font-semibold truncate">
                                            📚 {curriculum.tilawah_stages.join(", ")}
                                          </p>
                                        )}
                                        {curriculum.quran_methods && curriculum.quran_methods.length > 0 && (
                                          <p className="text-[6.5px] text-amber-700 font-semibold truncate">
                                            ⭐ {curriculum.quran_methods.join(", ")}
                                          </p>
                                        )}
                                      </div>
                                    ) : (
                                      <p className="text-[6.5px] text-slate-700 italic">Kurikulum sedang disiapkan.</p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Gallery Section Preview */}
                          <div className="px-4 space-y-3">
                            <div className="text-center">
                              <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Galeri Halaqah & Kegiatan</h3>
                              <div className="w-6 h-0.5 bg-teal-500 mx-auto mt-1" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              {[0, 1, 2, 3].map((idx) => {
                                const img = webGalleryImages[idx];
                                const title = webGalleryTitles[idx] || `Kegiatan ${idx + 1}`;
                                const desc = webGalleryDescriptions[idx] || "Membimbing santri dengan ketulusan dan metode menyenangkan.";
                                return (
                                  <div key={idx} className="bg-white border border-slate-100 rounded-xl overflow-hidden p-1.5 shadow-3xs space-y-1 text-left flex flex-col justify-between">
                                    <div>
                                      {img ? (
                                        <img src={getCleanImageUrl(img)} className="w-full h-16 object-cover rounded-lg" alt="" />
                                      ) : (
                                        <div className="w-full h-16 bg-slate-100 rounded-lg flex items-center justify-center text-slate-300">
                                          <Camera className="w-4 h-4 opacity-40" />
                                        </div>
                                      )}
                                      <h4 className="text-[8px] font-black text-slate-800 truncate uppercase tracking-tight mt-1.5">{title}</h4>
                                      <p className="text-[7px] text-slate-700 font-semibold leading-relaxed line-clamp-2 mt-0.5">{desc}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Testimonials Section Preview */}
                          <div className="px-4 space-y-3 bg-slate-100/50 py-4 border-y border-slate-200/30">
                            <div className="text-center">
                              <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Suara Wali Santri</h3>
                              <div className="w-6 h-0.5 bg-teal-500 mx-auto mt-1" />
                            </div>

                            <div className="space-y-3">
                              {[
                                { nama: webTestimonial1Name, jabatan: webTestimonial1Role, pesan: webTestimonial1Text },
                                { nama: webTestimonial2Name, jabatan: webTestimonial2Role, pesan: webTestimonial2Text },
                                { nama: webTestimonial3Name, jabatan: webTestimonial3Role, pesan: webTestimonial3Text }
                              ].map((t, idx) => (
                                <div key={idx} className="bg-white border border-slate-100 rounded-xl p-3 shadow-3xs text-left space-y-1">
                                  <MessageSquare className="w-3 h-3 text-teal-500 opacity-60" />
                                  <p className="text-[7.5px] italic text-black font-medium font-medium leading-relaxed">"{t.pesan}"</p>
                                  <div className="pt-1.5 border-t border-slate-50 flex items-center justify-between">
                                    <div>
                                      <h5 className="text-[7.5px] font-black text-slate-800">{t.nama || "Wali Santri"}</h5>
                                      <p className="text-[6.5px] text-slate-700 font-bold">{t.jabatan || "Orang Tua"}</p>
                                    </div>
                                    <span className="text-[10px] text-amber-400">★★★★★</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Form Pendaftaran Section Preview */}
                          <div className="px-4">
                            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-3xs text-left space-y-3">
                              <div className="text-center space-y-1">
                                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[6px] font-black uppercase">Formulir Digital</span>
                                <h4 className="text-[9px] font-black text-slate-900 uppercase">Penerimaan Santri Baru</h4>
                              </div>

                              <div className="space-y-2 text-[7.5px]">
                                <div>
                                  <span className="text-slate-700 font-bold block uppercase">Nama Calon Santri:</span>
                                  <div className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded-md text-slate-700">Contoh: Muhammad Azka</div>
                                </div>
                                <div>
                                  <span className="text-slate-700 font-bold block uppercase">Pilih Halaqah / Kelas:</span>
                                  <div className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded-md text-slate-700">-- Pilih Kelas --</div>
                                </div>
                                <div>
                                  <span className="text-slate-700 font-bold block uppercase">Nama Orang Tua:</span>
                                  <div className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded-md text-slate-700">Contoh: H. Ahmad Budiman</div>
                                </div>
                                <div className="bg-teal-800 text-white font-extrabold text-center py-2 rounded-lg text-[7px] uppercase tracking-wider cursor-not-allowed">
                                  Kirim Pendaftaran Online
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Status Tracker Preview */}
                          <div className="px-4 text-center space-y-2">
                            <span className="text-[6.5px] font-black tracking-widest text-teal-600 uppercase bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100/50">Lacak Pengumuman</span>
                            <h3 className="text-[9px] font-black text-slate-800 uppercase tracking-wider mt-1">Cek Status Penerimaan</h3>

                            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-3xs text-left space-y-2">
                              <span className="text-[7px] font-bold text-slate-700 uppercase">Cari Nama Calon Santri:</span>
                              <div className="relative">
                                <div className="w-full bg-slate-50 border border-slate-200 p-2 pl-7 rounded-xl text-slate-700 text-[8px] flex items-center gap-1.5">
                                  <Users className="w-3 h-3 text-slate-700" />
                                  <span>Ketik nama lengkap anak...</span>
                                </div>
                              </div>
                              <p className="text-[6.5px] text-slate-700 italic leading-relaxed text-center">
                                Sistem akan melacak database pendaftaran dan mencocokkan status verifikasi / pemberian NIS secara otomatis.
                              </p>
                            </div>
                          </div>

                          {/* Video & Maps Preview */}
                          {(webVideoLink || webMapsLink) && (
                            <div className="px-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {webVideoLink && (
                                <div className="bg-white border border-slate-100 rounded-xl p-2 shadow-3xs space-y-1.5 text-left">
                                  <h4 className="text-[8px] font-black text-slate-800 uppercase flex items-center gap-1">
                                    <Video className="w-3 h-3 text-rose-600" /> Profil Video Lembaga
                                  </h4>
                                  {(() => {
                                    const embedUrl = getYouTubeEmbedUrl(webVideoLink);
                                    if (embedUrl) {
                                      return (
                                        <iframe
                                          src={embedUrl}
                                          className="w-full h-24 rounded-lg bg-slate-100 border-none"
                                          title="YouTube video"
                                          allowFullScreen
                                        />
                                      );
                                    } else {
                                      return (
                                        <div className="w-full h-24 bg-slate-100 rounded-lg flex flex-col items-center justify-center text-slate-700 gap-1 text-center p-2">
                                          <Video className="w-4 h-4 opacity-40" />
                                          <span className="text-[6.5px] font-bold leading-normal text-rose-700">Link YouTube tidak valid</span>
                                          <span className="text-[6px] text-slate-700 leading-normal truncate w-full">{webVideoLink}</span>
                                        </div>
                                      );
                                    }
                                  })()}
                                </div>
                              )}

                              {webMapsLink && (
                                <div className="bg-white border border-slate-100 rounded-xl p-2 shadow-3xs space-y-1.5 text-left">
                                  <h4 className="text-[8px] font-black text-slate-800 uppercase flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-teal-600" /> Lokasi Google Maps
                                  </h4>
                                  {(() => {
                                    const embedUrl = getMapsEmbedUrl(webMapsLink);
                                    if (embedUrl) {
                                      return (
                                        <iframe
                                          src={embedUrl}
                                          className="w-full h-24 rounded-lg bg-slate-100 border-none"
                                          title="Google Maps"
                                          allowFullScreen
                                          loading="lazy"
                                        />
                                      );
                                    } else {
                                      return (
                                        <div className="w-full h-24 bg-slate-100 rounded-lg flex flex-col items-center justify-center text-slate-700 gap-1 text-center p-2">
                                          <MapPin className="w-4 h-4 opacity-40" />
                                          <span className="text-[6.5px] font-bold leading-normal text-teal-700">Link Google Maps tidak valid</span>
                                          <span className="text-[6px] text-slate-700 leading-normal truncate w-full">{webMapsLink}</span>
                                        </div>
                                      );
                                    }
                                  })()}
                                </div>
                              )}
                            </div>
                          )}

                          {/* FAQ Preview */}
                          <div className="px-4 text-center space-y-2">
                            <span className="text-[6.5px] font-black tracking-widest text-teal-600 uppercase bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100/50">Pertanyaan Umum</span>
                            <h3 className="text-[9px] font-black text-slate-800 uppercase tracking-wider mt-1">FAQ & Informasi</h3>

                            <div className="space-y-1.5 text-left">
                              {[
                                { q: 'Apakah pendaftaran bisa dilakukan secara online?', a: 'Ya. Calon wali santri dapat mengisi formulir pendaftaran secara online melalui website TPQ.' },
                                { q: 'Bagaimana proses setelah formulir dikirim?', a: 'Data pendaftaran akan diterima oleh admin TPQ untuk diverifikasi kemudian akan diumumkan.' },
                                { q: 'Bagaimana wali santri memantau perkembangan?', a: 'Wali santri dapat mengakses Portal Wali untuk melihat rekap harian hafalan santri.' }
                              ].map((faq, idx) => (
                                <div key={idx} className="bg-white rounded-lg border border-slate-200 p-2 text-[7.5px] font-bold text-slate-700 flex justify-between items-center">
                                  <span>{idx + 1}. {faq.q}</span>
                                  <ChevronDown className="w-3 h-3 text-slate-700 shrink-0" />
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Mock Footer Preview */}
                          <div className="bg-slate-900 text-slate-700 text-center py-5 px-4 text-[7.5px] font-semibold space-y-1 border-t border-slate-850">
                            <p className="uppercase tracking-wider text-slate-200">{pengaturan.nama_lembaga || "Lembaga TPQ"}</p>
                            <p>Sistem Informasi Manajemen TPQ Digital Terintegrasi</p>
                            <p className="text-slate-800 mt-2">Hak Cipta © {new Date().getFullYear()} • Seluruh Hak Cipta Dilindungi</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'quran' && (
            <QuranViewer onBack={() => setActiveTab('beranda')} />
          )}

          {/* (activeTab as any) === 'doa' && (
          <DoaList onBack={() => setActiveTab('beranda')} />
        ) */}
          {(activeTab as any) === 'doa' && (
            <DoaList onBack={() => setActiveTab('beranda')} />
          )}
        </div>
      </main>

      {/* Floating Bottom Navigation Tab - Premium Curved Notch Design */}
      <nav className="fixed bottom-0 left-0 right-0 sm:max-w-md mx-auto h-[62px] flex justify-between items-center px-4 pb-1.5 pt-1 z-50 bg-transparent border-none">
        {/* SVG curved notch background with thin green line following the top edge */}
        <div className="absolute inset-0 -z-10 w-full h-[62px] overflow-visible">
          <svg className="w-full h-full filter drop-shadow-[0_-5px_15px_rgba(13,148,136,0.25)]" viewBox="0 0 400 62" preserveAspectRatio="none">
            <defs>
              <linearGradient id="navGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0d9488" />
                <stop offset="50%" stopColor="#0f766e" />
                <stop offset="100%" stopColor="#115e59" />
              </linearGradient>
            </defs>
            {/* Green gradient background path */}
            <path d="M 0 16 Q 0 0, 16 0 L 155 0 C 172 0, 178 22, 200 22 C 222 22, 228 0, 245 0 L 384 0 Q 400 0, 400 16 L 400 62 L 0 62 Z" fill="url(#navGradient)" />
            {/* Elegant thin green line outline following the exact top curved path */}
            <path d="M 0 16 Q 0 0, 16 0 L 155 0 C 172 0, 178 22, 200 22 C 222 22, 228 0, 245 0 L 384 0 Q 400 0, 400 16" fill="none" stroke="#0f766e" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="flex justify-around w-2/5">
          <button
            onClick={() => setActiveTab('beranda')}
            className="relative flex flex-col items-center justify-center w-12 h-11 group"
          >
            <div className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${activeTab === 'beranda' ? 'text-white' : 'text-white group-hover:text-white'}`}>
              {/* Islamic Mosque Icon */}
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="currentColor">
                <path d="M12 2C10.9 2 10 2.9 10 4C10 4.74 10.4 5.38 11 5.73V7H8.5C8.22 7 8 7.22 8 7.5V8H7C6.45 8 6 8.45 6 9V10H4C3.45 10 3 10.45 3 11V21H21V11C21 10.45 20.55 10 20 10H18V9C18 8.45 17.55 8 17 8H16V7.5C16 7.22 15.78 7 15.5 7H13V5.73C13.6 5.38 14 4.74 14 4C14 2.9 13.1 2 12 2ZM12 3.5C12.28 3.5 12.5 3.72 12.5 4C12.5 4.28 12.28 4.5 12 4.5C11.72 4.5 11.5 4.28 11.5 4C11.5 3.72 11.72 3.5 12 3.5ZM9 9H15V10H9V9ZM7 11H17V19H15V15C15 13.9 14.1 13 13 13H11C9.9 13 9 13.9 9 15V19H7V11ZM11 15H13V19H11V15Z"/>
              </svg>
            </div>
            <span className={`text-[8px] font-extrabold uppercase tracking-wider ${activeTab === 'beranda' ? 'text-white' : 'text-white'}`}>Beranda</span>
          </button>

          <button
            onClick={() => setActiveTab('santri')}
            className="relative flex flex-col items-center justify-center w-12 h-11 group"
          >
            <div className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${activeTab === 'santri' ? 'text-white' : 'text-white group-hover:text-white'}`}>
              <Users className="w-[16px] h-[16px]" />
            </div>
            <span className={`text-[8px] font-extrabold uppercase tracking-wider ${activeTab === 'santri' ? 'text-white' : 'text-white'}`}>Santri</span>
          </button>
        </div>

        {/* Floating Teardrop Plus Button inside the central curve - Upgraded to Solid Yellow */}
        <div className="relative w-1/5 flex justify-center h-full">
          <button
            onClick={() => setActiveTab('input-setoran')}
            className="absolute -top-[12px] w-[45px] h-[45px] bg-teal-600 hover:bg-teal-700 text-white font-black rounded-full flex items-center justify-center shadow-md shadow-teal-600/35 border-[3.5px] border-amber-400 btn-active z-50"
            title="Tambah Setoran"
          >
            <Plus className="w-[22px] h-[22px] stroke-[4]" />
          </button>
        </div>

        <div className="flex justify-around w-2/5">
          <button
            onClick={() => setActiveTab('kelas')}
            className="relative flex flex-col items-center justify-center w-12 h-11 group"
          >
            <div className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${activeTab === 'kelas' ? 'text-white' : 'text-white group-hover:text-white'}`}>
              <Building className="w-[16px] h-[16px]" />
            </div>
            <span className={`text-[8px] font-extrabold uppercase tracking-wider ${activeTab === 'kelas' ? 'text-white' : 'text-white'}`}>Kelas</span>
          </button>

          <button
            onClick={() => setActiveTab('riwayat')}
            className="relative flex flex-col items-center justify-center w-12 h-11 group"
          >
            <div className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${activeTab === 'riwayat' ? 'text-white' : 'text-white group-hover:text-white'}`}>
              <History className="w-[16px] h-[16px]" />
            </div>
            <span className={`text-[8px] font-extrabold uppercase tracking-wider ${activeTab === 'riwayat' ? 'text-white' : 'text-white'}`}>Riwayat</span>
          </button>
        </div>
      </nav>

      {/* MODAL: VERIFY/ACTIVATE ONLINE PENDAFTARAN */}
      {selectedRegForVerify && (
        <div className="fixed inset-0 bg-slate-900/70 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-sm uppercase text-slate-800">Verifikasi & Terima Santri</h3>
              <button
                type="button"
                onClick={() => setSelectedRegForVerify(null)}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-black font-medium font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-teal-50/50 rounded-2xl p-3 border border-teal-100/40 text-[11px] text-teal-800">
                <p className="font-bold">Informasi Calon Santri:</p>
                <p className="mt-1">Nama: <strong className="text-slate-900">{selectedRegForVerify.nama_santri}</strong></p>
                <p>Ortu: <strong className="text-slate-900">{selectedRegForVerify.nama_ortu}</strong></p>
                <p>Telp/WA: <strong className="text-slate-900">{selectedRegForVerify.wa_ortu}</strong></p>
                <p>Halaqah Pilihan: <strong className="text-slate-900">{selectedRegForVerify.halaqah || '-'}</strong></p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 font-sans">Tetapkan Nomor Induk Santri (NIS)</label>
                <input
                  type="text"
                  value={inputNisForVerify}
                  onChange={(e) => setInputNisForVerify(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-teal-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 font-sans">Pilih Halaqah / Kelas</label>
                <select
                  value={inputClassForVerify}
                  onChange={(e) => setInputClassForVerify(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-teal-500 font-semibold cursor-pointer"
                >
                  {kelasList.map(k => (
                    <option key={k.id_kelas} value={k.nama_kelas}>{k.nama_kelas}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!inputNisForVerify.trim()) {
                  alert('Mohon masukkan NIS terlebih dahulu!');
                  return;
                }

                // 1. Tambah santri secara otomatis
                onAddSantri({
                  nama_santri: selectedRegForVerify.nama_santri,
                  nis: inputNisForVerify,
                  halaqah: inputClassForVerify,
                  jumlah_hafalan: '-',
                  juz_hafal: '-',
                  murojaah: '-'
                });

                // 2. Update status pendaftaran menjadi aktif
                if (onUpdatePendaftaran) {
                  onUpdatePendaftaran({
                    ...selectedRegForVerify,
                    status: 'Aktif',
                    nis_ditetapkan: inputNisForVerify
                  });
                }

                // 3. Close modal & show toast
                setSelectedRegForVerify(null);
                showToast(`Santri ${selectedRegForVerify.nama_santri} berhasil diaktifkan dengan NIS: ${inputNisForVerify}!`);
              }}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black py-3 px-4 rounded-xl shadow-md transition-all active:scale-95 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              Aktifkan & Simpan Database
            </button>
          </div>
        </div>
      )}

      {/* MODAL: ADD MANUAL SANTRI */}
      {showAddManual && (
        <div className="fixed inset-0 bg-slate-900/70 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm uppercase text-slate-800">Man-Add Santri</h3>
              <button
                type="button"
                onClick={() => setShowAddManual(false)}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-black font-medium"
              >
                <b>X</b>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const nis = (e.target as any).nis.value.trim();
                const nama = (e.target as any).nama.value.trim();
                const hq = (e.target as any).halaqah.value;

                onAddSantri({
                  nis,
                  nama_santri: nama,
                  halaqah: hq,
                  jumlah_hafalan: '0 Juz',
                  juz_hafal: '-',
                  murojaah: '-'
                });
                setShowAddManual(false);
                showToast('Santri berhasil dimasukkan!');
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-800 block mb-1.5">Nomor Induk Siswa (NIS)</label>
                <input
                  type="text"
                  name="nis"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-800 block mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  name="nama"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-800 block mb-1.5">Target Halaqah</label>
                <select
                  name="halaqah"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none"
                  required
                >
                  {kelasList.map(k => <option key={k.id_kelas} value={k.nama_kelas}>{k.nama_kelas}</option>)}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-white text-slate-900 border border-slate-200 shadow-sm font-bold py-3.5 rounded-2xl text-[10px] uppercase tracking-widest mt-4 hover:bg-teal-500 hover:text-white hover:border-teal-500 transition-all duration-300"
              >
                Simpan Santri
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EXPORT UNDANGAN */}
      {selectedStudentForInv && (
        <div className="fixed inset-0 bg-slate-900/70 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-4.5 shadow-2xl text-slate-800 space-y-3 animate-fadeIn relative">
            {/* Close button outside at top-right */}
            <button
              type="button"
              onClick={() => setSelectedStudentForInv(null)}
              className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center font-black cursor-pointer text-[10px] shadow-lg border-2 border-white transition-all hover:scale-105 active:scale-95 z-[60]"
            >
              X
            </button>

            <div className="relative flex justify-center items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-xs uppercase text-slate-800 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-teal-600" /> Cetak Surat Undangan
              </h3>
            </div>

            <div className="bg-teal-50/70 p-2.5 rounded-2xl border border-teal-200/60 text-center">
              <span className="block text-[9px] font-extrabold text-teal-700 uppercase tracking-wider font-sans">Undangan Wali Santri</span>
              <p className="text-xs font-black mt-0.5 text-slate-800">{selectedStudentForInv.nama_santri}</p>
            </div>

            {/* Quick Templates Picker for Multi-event reusability */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest block">Pilih Tema Acara:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "Silaturahmi", val: "Silaturahmi Syakirin & Laporan Perkembangan Hafalan" },
                  { label: "Wisuda / Tahfidz", val: "Wisuda Juz Amma & Khotmil Qur'an Bulanan" },
                  { label: "Rapat Walmur", val: "Rapat Koordinasi & Pembagian Rapor Hasil Belajar" }
                ].map((t, idx) => {
                  const isActive = invTema === t.val;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setInvTema(t.val)}
                      className={`text-center py-1.5 px-3 rounded-2xl text-[8.5px] font-extrabold cursor-pointer transition-all border ${isActive
                        ? 'bg-teal-500 text-white border-teal-500 shadow-sm shadow-teal-500/20 scale-102 font-black'
                        : 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100/80 hover:border-slate-200'
                        }`}
                      title={t.val}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              downloadUndanganPdf(selectedStudentForInv, invTema, invTanggal, invWaktu, invTempat, invReceiver, invSekretaris);
            }} className="space-y-2.5 text-left">

              <div>
                <label className="text-[8.5px] font-extrabold uppercase text-slate-800 block tracking-widest">Penerima</label>
                <input
                  type="text"
                  value={invReceiver}
                  onChange={(e) => setInvReceiver(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 text-xs outline-none mt-1 font-bold focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all text-slate-850 placeholder-slate-400"
                  placeholder="Yth. Wali Santri ..."
                  required
                />
              </div>

              <div>
                <label className="text-[8.5px] font-extrabold uppercase text-slate-800 block tracking-widest">Nama Acara</label>
                <input
                  type="text"
                  value={invTema}
                  onChange={(e) => setInvTema(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 text-xs outline-none mt-1 font-bold focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all text-slate-850 placeholder-slate-400"
                  placeholder="Tema Acara"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[8.5px] font-extrabold uppercase text-slate-800 block tracking-widest">Tanggal</label>
                  <input
                    type="date"
                    value={invTanggal}
                    onChange={(e) => setInvTanggal(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 text-xs outline-none mt-1 font-bold focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all text-slate-850"
                    required
                  />
                </div>

                <div>
                  <label className="text-[8.5px] font-extrabold uppercase text-slate-800 block tracking-widest">Waktu</label>
                  <input
                    type="text"
                    value={invWaktu}
                    onChange={(e) => setInvWaktu(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 text-xs outline-none mt-1 font-bold focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all text-slate-850 placeholder-slate-400"
                    placeholder="Contoh: 08.00 WIB s/d Selesai"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[8.5px] font-extrabold uppercase text-slate-800 block tracking-widest">Tempat</label>
                <input
                  type="text"
                  value={invTempat}
                  onChange={(e) => setInvTempat(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 text-xs outline-none mt-1 font-bold focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all text-slate-850 placeholder-slate-400"
                  placeholder="Tempat Acara"
                  required
                />
              </div>

              <div>
                <label className="text-[8.5px] font-extrabold uppercase text-slate-800 block tracking-widest">Sekretaris</label>
                <input
                  type="text"
                  value={invSekretaris}
                  onChange={(e) => setInvSekretaris(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 text-xs outline-none mt-1 font-bold focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all text-slate-850 placeholder-slate-400"
                  placeholder="Contoh: Ust. Ahmad Fauzi"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-teal-500 text-white font-black py-2.5 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-teal-600 transition-all btn-active cursor-pointer shadow-md border-2 border-teal-400/20"
              >
                Cetak Undangan Resmi (PDF)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EXPORT SYAHADAH */}
      {selectedStudentForCert && (
        <div className="fixed inset-0 bg-slate-900/70 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-4.5 shadow-2xl text-slate-800 space-y-3 relative animate-fadeIn">
            {/* Close button outside at top-right */}
            <button
              type="button"
              onClick={() => setSelectedStudentForCert(null)}
              className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center font-black cursor-pointer text-[10px] shadow-lg border-2 border-white transition-all hover:scale-105 active:scale-95 z-[60]"
            >
              X
            </button>

            <div className="relative flex justify-center items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-xs uppercase text-slate-800">Syahadah (Kelulusan)</h3>
            </div>

            <div className="bg-amber-50/60 p-2.5 rounded-2xl border border-amber-100 text-center">
              <span className="block text-[10px] font-extrabold text-amber-900 uppercase tracking-wider">Cetak Syahadah Wisuda</span>
              <p className="text-xs font-black mt-0.5 text-slate-800">{selectedStudentForCert.nama_santri}</p>
            </div>

            <form onSubmit={printCertificate} className="space-y-3">
              <div>
                <label className="text-[8.5px] font-extrabold uppercase text-slate-800 block tracking-widest">Predikat Kelulusan</label>
                <input
                  type="text"
                  value={certPenghargaan}
                  onChange={(e) => setCertPenghargaan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs outline-none mt-1 font-bold focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all text-slate-850 placeholder-slate-400"
                  placeholder="Hafal Juz 30 Predikat Mumtaz"
                  required
                />
              </div>

              <div>
                <label className="text-[8.5px] font-extrabold uppercase text-slate-800 block tracking-widest">Wali Halaqah</label>
                <input
                  type="text"
                  value={certWaliHalaqah}
                  onChange={(e) => setCertWaliHalaqah(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs outline-none mt-1 font-bold focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all text-slate-850 placeholder-slate-400"
                  placeholder="Nama Wali Halaqah (Contoh: Ust. Ahmad, S.Pd.)"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-teal-500 text-white font-black py-2.5 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-teal-600 transition-all btn-active cursor-pointer shadow-md border-2 border-teal-400/20"
              >
                Cetak Syahadah (PDF)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CETAK KARTU QR */}
      {selectedStudentForQrCard && (
        <div className="fixed inset-0 bg-slate-900/70 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-4.5 shadow-2xl text-slate-800 space-y-4 animate-fadeIn relative">
            {/* Close button outside at top-right */}
            <button
              type="button"
              onClick={() => setSelectedStudentForQrCard(null)}
              className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center font-black cursor-pointer text-[10px] shadow-lg border-2 border-white transition-all hover:scale-105 active:scale-95 z-[60]"
            >
              X
            </button>

            <div className="relative flex justify-center items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-xs uppercase text-slate-800 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-teal-600" /> Cetak Kartu QR
              </h3>
            </div>

            {/* PREVIEW CONTAINER OF LUXURIOUS GOLD CARD */}
            <div className="flex justify-center items-center py-1">
              <div
                id="printable-student-card"
                className="w-[330px] h-[210px] bg-gradient-to-br from-[#042f2e] via-[#115e59] to-[#042f2e] rounded-xl border border-amber-500 text-white p-4 flex flex-row justify-between relative overflow-hidden shadow-lg"
              >
                {/* Decorative golden geometric elements */}
                <div className="absolute -bottom-16 -right-12 w-48 h-48 rounded-full bg-gradient-to-tr from-amber-500/10 to-transparent border border-amber-500/5 pointer-events-none"></div>
                <div className="absolute -top-12 -left-12 w-28 h-28 rounded-full bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/5 pointer-events-none"></div>

                {/* Left Side: Info */}
                <div className="w-[62%] h-full flex flex-col justify-between z-10 text-left">
                  <div>
                    <h5 className="text-[7px] font-extrabold uppercase tracking-widest text-amber-400 leading-none">
                      {pengaturan.nama_lembaga || 'TPQ AL-HIKMAH'}
                    </h5>
                    <h4 className="text-[9px] font-bold tracking-wide text-white uppercase mt-1 leading-tight border-b border-amber-500/30 pb-1 w-full">
                      KARTU IDENTITAS SANTRI
                    </h4>
                  </div>

                  <div className="flex flex-col gap-1.5 mt-2">
                    <div>
                      <span className="block text-[5px] font-bold text-amber-400 uppercase tracking-wider">Nama Santri</span>
                      <p className="text-[10px] font-bold text-white leading-tight truncate">
                        {selectedStudentForQrCard.nama_santri}
                      </p>
                    </div>

                    <div>
                      <span className="block text-[5px] font-bold text-amber-400 uppercase tracking-wider">Nomor Induk Santri (NIS)</span>
                      <p className="text-[9px] font-bold text-teal-100 tracking-wider font-mono">
                        {selectedStudentForQrCard.nis}
                      </p>
                    </div>

                    <div>
                      <span className="block text-[5px] font-bold text-amber-400 uppercase tracking-wider">Halaqah Kelas / Kelompok</span>
                      <p className="text-[9px] font-bold text-teal-100 truncate">
                        {selectedStudentForQrCard.halaqah}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side: QR Code Panel */}
                <div className="w-[35%] h-full flex flex-col items-center justify-center z-10">
                  <div className="bg-white p-1 rounded-lg border border-amber-400/60 shadow-md">
                    {qrCodeImgUrl ? (
                      <img src={qrCodeImgUrl} className="w-[75px] h-[75px] block object-contain" alt="QR Code" />
                    ) : (
                      <div className="w-[75px] h-[75px] bg-slate-100 flex items-center justify-center text-[10px] text-slate-700">Loading...</div>
                    )}
                  </div>
                  <span className="text-[8px] font-extrabold text-amber-400 mt-1.5 bg-amber-500/10 px-1.5 py-0.5 rounded tracking-wide">
                    NIS: {selectedStudentForQrCard.nis}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl text-[10px] text-slate-800 border border-slate-100 flex items-start gap-2 text-left">
              <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold block text-slate-900">Kartu Siap Cetak</p>
                <p className="mt-0.5 text-slate-850">Dapat disimpan/unduh berformat PNG atau langsung cetak ke PDF dengan ratio standard KIS.</p>
              </div>
            </div>

            {/* BUTTON REGISTRY */}
            <div className="grid grid-cols-2 gap-3 pb-1">
              <button
                type="button"
                onClick={handlePrintCard}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-2xl text-[10px] uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-1 border-2 border-slate-700/20"
              >
                <Printer className="w-3.5 h-3.5" /> Cetak PDF
              </button>
              <button
                type="button"
                onClick={handleDownloadCard}
                className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2.5 rounded-2xl text-[10px] uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-1 border-2 border-teal-400/20"
              >
                <Download className="w-3.5 h-3.5" /> Download PNG
              </button>
            </div>
          </div>
        </div>
      )}



      {/* MODAL: KENAIKAN KELAS Promosi */}
      {showKenaikanModal && (
        <div className="fixed inset-0 bg-slate-900/70 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xs p-4 shadow-2xl max-h-[70vh] flex flex-col justify-between">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-xs uppercase text-teal-800">Kenaikan Kelas / Mutasi Masal</h3>
              <button
                type="button"
                onClick={() => setShowKenaikanModal(false)}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center cursor-pointer font-bold text-slate-800"
              >
                <b>X</b>
              </button>
            </div>

            <form onSubmit={executeKenaikanKelas} className="flex-grow flex flex-col justify-between mt-4 overflow-hidden">
              <div className="space-y-3 shrink-0 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div>
                  <label className="text-[10px] font-black text-black block uppercase">Pilih Kelas Asal</label>
                  <select
                    value={kenaikanAsal}
                    onChange={(e) => {
                      setKenaikanAsal(e.target.value);
                      setKenaikanSelectedIds([]);
                    }}
                    className="w-full bg-white border border-slate-200 p-2 text-xs rounded-xl mt-1 outline-none"
                    required
                  >
                    <option value="">-- Pilih --</option>
                    {kelasList.map(k => <option key={k.id_kelas} value={k.nama_kelas}>{k.nama_kelas}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-black block uppercase">Pilih Kelas Tujuan Baru</label>
                  <select
                    value={kenaikanTujuan}
                    onChange={(e) => setKenaikanTujuan(e.target.value)}
                    className="w-full bg-white border border-slate-200 p-2 text-xs rounded-xl mt-1 outline-none"
                    required
                  >
                    <option value="">-- Pilih --</option>
                    {kelasList.map(k => <option key={k.id_kelas} value={k.nama_kelas}>{k.nama_kelas}</option>)}
                  </select>
                </div>
              </div>

              {/* Santris array list checkables */}
              <div className="flex-grow overflow-y-auto border border-slate-100 rounded-2xl p-2 my-3 space-y-1.5 bg-slate-50/50">
                {kenaikanAsal ? (
                  <>
                    <label className="flex items-center space-x-3 bg-teal-50 border border-teal-100 p-2.5 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={kenaikanSelectedIds.length === studentsInClass(kenaikanAsal).length}
                        onChange={(e) => handleKenaikanCheckAll(e.target.checked, kenaikanAsal)}
                        className="w-4 h-4 rounded text-teal-600"
                      />
                      <span className="font-bold text-xs text-teal-700">Pilih Semua ({studentsInClass(kenaikanAsal).length} Santri)</span>
                    </label>

                    {studentsInClass(kenaikanAsal).map((s, i) => (
                      <label key={i} className="flex items-center space-x-3 bg-white p-2.5 rounded-xl border border-slate-100 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={kenaikanSelectedIds.includes(s.id_santri)}
                          onChange={(e) => handleKenaikanCheckSingle(s.id_santri, e.target.checked)}
                          className="w-4 h-4 rounded text-teal-600"
                        />
                        <span className="text-xs font-semibold text-slate-700">{s.nama_santri} ({s.nis})</span>
                      </label>
                    ))}
                  </>
                ) : (
                  <p className="text-center text-slate-700 text-xs py-6">Pilih kelas asal untuk memuat santri.</p>
                )}
              </div>

              <div className="flex gap-3 mt-1.5 w-full">
                <button
                  type="button"
                  onClick={() => {
                    setShowKenaikanModal(false);
                    setKenaikanSelectedIds([]);
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-slate-700 font-bold py-3.5 rounded-2xl text-[10px] uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-bold py-3.5 rounded-2xl text-[10px] uppercase tracking-widest transition-all cursor-pointer shadow-sm border border-teal-400/20"
                >
                  Promosikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT SETORAN */}
      {editSetoranItem && (
        <div className="fixed inset-0 bg-slate-900/70 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-xs uppercase text-slate-800">Edit Laporan Setoran</h3>
              <button
                type="button"
                onClick={() => setEditSetoranItem(null)}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center"
              >
                <b>X</b>
              </button>
            </div>

            <form onSubmit={submitEditSetoran} className="space-y-3 text-slate-700">
              {editSetoranItem.surah !== '-' && (
                <div className="space-y-2 border-b border-slate-100 pb-2">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-teal-600 block">Program Tahfidz</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-bold block">Surah</label>
                      <input
                        type="text"
                        value={editSetoranItem.surah}
                        onChange={(e) => setEditSetoranItem({ ...editSetoranItem, surah: e.target.value })}
                        className="w-full bg-slate-50 border rounded-xl p-2 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold block">Ayat</label>
                      <input
                        type="text"
                        value={editSetoranItem.ayat}
                        onChange={(e) => setEditSetoranItem({ ...editSetoranItem, ayat: e.target.value })}
                        className="w-full bg-slate-50 border rounded-xl p-2 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold block">Predikat</label>
                      <select
                        value={editSetoranItem.kualitas_surah || (editSetoranItem.kualitas && !editSetoranItem.kualitas.includes('|') && !editSetoranItem.kualitas.includes(':') ? editSetoranItem.kualitas : '') || 'Mumtaz'}
                        onChange={(e) => setEditSetoranItem({ ...editSetoranItem, kualitas_surah: e.target.value })}
                        className="w-full bg-slate-50 border rounded-xl p-2 text-xs outline-none"
                      >
                        <option value="Mumtaz">Mumtaz</option>
                        <option value="Jayyid">Jayyid</option>
                        <option value="Maqbul">Maqbul</option>
                        <option value="Rasib">Rasib</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {editSetoranItem.tilawah !== '-' && (
                <div className="space-y-2 border-b border-slate-100 pb-2">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-teal-600 block">Program Tilawah</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold block">Batas Tilawah</label>
                      <input
                        type="text"
                        value={editSetoranItem.tilawah}
                        onChange={(e) => setEditSetoranItem({ ...editSetoranItem, tilawah: e.target.value })}
                        className="w-full bg-slate-50 border rounded-xl p-2 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold block">Predikat</label>
                      <select
                        value={editSetoranItem.kualitas_tilawah || (editSetoranItem.kualitas && !editSetoranItem.kualitas.includes('|') && !editSetoranItem.kualitas.includes(':') ? editSetoranItem.kualitas : '') || 'Mumtaz'}
                        onChange={(e) => setEditSetoranItem({ ...editSetoranItem, kualitas_tilawah: e.target.value })}
                        className="w-full bg-slate-50 border rounded-xl p-2 text-xs outline-none"
                      >
                        <option value="Mumtaz">Mumtaz</option>
                        <option value="Jayyid">Jayyid</option>
                        <option value="Maqbul">Maqbul</option>
                        <option value="Rasib">Rasib</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {editSetoranItem.hadits !== '-' && (
                <div className="space-y-2 border-b border-slate-100 pb-2">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-600 block">Program Hadits & Do'a</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold block">Hadits / Do'a</label>
                      <input
                        type="text"
                        value={editSetoranItem.hadits}
                        onChange={(e) => setEditSetoranItem({ ...editSetoranItem, hadits: e.target.value })}
                        className="w-full bg-slate-50 border rounded-xl p-2 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold block">Predikat</label>
                      <select
                        value={editSetoranItem.kualitas_hadits || (editSetoranItem.kualitas && !editSetoranItem.kualitas.includes('|') && !editSetoranItem.kualitas.includes(':') ? editSetoranItem.kualitas : '') || 'Mumtaz'}
                        onChange={(e) => setEditSetoranItem({ ...editSetoranItem, kualitas_hadits: e.target.value })}
                        className="w-full bg-slate-50 border rounded-xl p-2 text-xs outline-none"
                      >
                        <option value="Mumtaz">Mumtaz</option>
                        <option value="Jayyid">Jayyid</option>
                        <option value="Maqbul">Maqbul</option>
                        <option value="Rasib">Rasib</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold block">Catatan Evaluasi Umum</label>
                <input
                  type="text"
                  value={editSetoranItem.catatan}
                  onChange={(e) => setEditSetoranItem({ ...editSetoranItem, catatan: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs outline-none"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-2xl text-[10px] uppercase tracking-widest mt-2"
                >
                  Perbarui Setoran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT BILLING PEMBAYARAN */}
      {editPembayaranItem && (
        <div className="fixed inset-0 bg-slate-900/70 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-xs uppercase text-slate-800">Edit Riwayat Pembayaran</h3>
              <button
                type="button"
                onClick={() => setEditPembayaranItem(null)}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center"
              >
                <b>X</b>
              </button>
            </div>

            <form onSubmit={submitEditPembayaran} className="space-y-3 text-slate-700">
              <div>
                <label className="text-[10px] font-bold block">Perihal Kategori</label>
                <input
                  type="text"
                  value={editPembayaranItem.kategori}
                  onChange={(e) => setEditPembayaranItem({ ...editPembayaranItem, kategori: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold block">Nominal Rupiah (Rp)</label>
                <input
                  type="number"
                  value={editPembayaranItem.nominal}
                  onChange={(e) => setEditPembayaranItem({ ...editPembayaranItem, nominal: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold block">Status Pembayaran</label>
                <select
                  value={editPembayaranItem.status}
                  onChange={(e) => setEditPembayaranItem({ ...editPembayaranItem, status: e.target.value as any })}
                  className="w-full bg-slate-50 border rounded-xl p-2 text-xs outline-none"
                >
                  <option value="Lunas">Lunas</option>
                  <option value="Cicil">Cicil</option>
                  <option value="Belum Bayar">Belum Bayar</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold block">Catatan Arsip</label>
                <input
                  type="text"
                  value={editPembayaranItem.catatan}
                  onChange={(e) => setEditPembayaranItem({ ...editPembayaranItem, catatan: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs outline-none"
                />
              </div>

              <div className="pt-3 animate-fade-in">
                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-2xl text-[10px] uppercase tracking-widest mt-2"
                >
                  Simpan Perubahan Billing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT DATA SANTRI */}
      {editSantriItem && (
        <div className="fixed inset-0 bg-slate-900/75 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-bold text-xs uppercase text-black font-medium">Edit Profil & Data Santri</h3>
              <button
                onClick={() => setEditSantriItem(null)}
                className="text-slate-700 hover:text-black font-medium text-sm font-semibold rounded-full p-1 bg-slate-50 hover:bg-slate-100 border transition-all"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateSantri(editSantriItem);
                setEditSantriItem(null);
                showToast('Profil & Data Santri Berhasil Diperbarui!');
              }}
              className="space-y-3.5 text-left text-slate-700"
            >
              <div>
                <label className="text-[10px] font-bold block mb-1">Nama Lengkap Santri</label>
                <input
                  type="text"
                  value={editSantriItem.nama_santri}
                  onChange={(e) => {
                    const newName = e.target.value;
                    const autoUsername = newName.toLowerCase().trim().replace(/\s+/g, '');
                    setEditSantriItem({
                      ...editSantriItem,
                      nama_santri: newName,
                      username_ortu: autoUsername
                    });
                  }}
                  className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold block mb-1">Nomor Induk Santri (NIS)</label>
                <input
                  type="text"
                  value={editSantriItem.nis}
                  onChange={(e) => {
                    const newNis = e.target.value;
                    const cleanNis = newNis.trim();
                    const prefix = activeSchoolPrefix || 'TPQ1';
                    let autoPassword = cleanNis;
                    if (prefix && cleanNis && !cleanNis.toLowerCase().startsWith(prefix.toLowerCase())) {
                      autoPassword = prefix + cleanNis;
                    }
                    setEditSantriItem({
                      ...editSantriItem,
                      nis: newNis,
                      password_ortu: autoPassword
                    });
                  }}
                  className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold block mb-1">Halaqah / Kelas</label>
                <select
                  value={editSantriItem.halaqah}
                  onChange={(e) => setEditSantriItem({ ...editSantriItem, halaqah: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl p-2 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                  required
                >
                  <option value="">-- Pilih Halaqah --</option>
                  {kelasList.map(k => <option key={k.id_kelas} value={k.nama_kelas}>{k.nama_kelas}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="text-[10px] font-sans font-bold block mb-1">Akun Wali Username</label>
                  <input
                    type="text"
                    value={editSantriItem.username_ortu}
                    onChange={(e) => setEditSantriItem({ ...editSantriItem, username_ortu: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-sans font-bold block mb-1">Akun Wali Password</label>
                  <input
                    type="text"
                    value={editSantriItem.password_ortu}
                    onChange={(e) => setEditSantriItem({ ...editSantriItem, password_ortu: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold block mb-1">Jumlah Hafalan</label>
                  <input
                    type="text"
                    value={editSantriItem.jumlah_hafalan}
                    onChange={(e) => setEditSantriItem({ ...editSantriItem, jumlah_hafalan: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Contoh: 2 Juz"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold block mb-1">Juz Hafal</label>
                  <input
                    type="text"
                    value={editSantriItem.juz_hafal}
                    onChange={(e) => setEditSantriItem({ ...editSantriItem, juz_hafal: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Contoh: 30, 29"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold block mb-1">Murojaah Saat Ini</label>
                <input
                  type="text"
                  value={editSantriItem.murojaah}
                  onChange={(e) => setEditSantriItem({ ...editSantriItem, murojaah: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Contoh: An-Naba"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-3.5 rounded-2xl text-[10px] uppercase tracking-widest mt-2 block"
                >
                  Simpan Perubahan Profil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL: EDIT TABUNGAN */}
      {editTabunganItem && (
        <div className="fixed inset-0 bg-slate-900/70 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-xs uppercase text-teal-800">Edit Nominal Tabungan</h3>
              <button
                type="button"
                onClick={() => setEditTabunganItem(null)}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center cursor-pointer font-bold text-slate-800"
              >
                <b>✕</b>
              </button>
            </div>
            <form onSubmit={submitEditTabungan} className="space-y-4 text-left">
              <div>
                <label className="text-[10px] font-bold text-slate-700 block uppercase mb-1">Nama Santri</label>
                <div className="w-full bg-slate-100 border rounded-xl p-2.5 text-xs text-slate-800 font-semibold">
                  {editTabunganItem.nama_santri}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-450 block uppercase mb-1">Tanggal Transaksi</label>
                <input
                  type="date"
                  value={editTabunganItem.tanggal}
                  onChange={(e) => setEditTabunganItem({ ...editTabunganItem, tanggal: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-450 block uppercase mb-1">Nominal Rupiah (Rp)</label>
                <input
                  type="number"
                  value={editTabunganItem.nominal}
                  onChange={(e) => setEditTabunganItem({ ...editTabunganItem, nominal: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-3.5 rounded-2xl text-[10px] uppercase tracking-wider transition-colors shadow cursor-pointer text-center"
              >
                Simpan Perubahan Tabungan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT INFORMASI KHUSUS */}
      {editInformasiItem && (
        <div className="fixed inset-0 bg-slate-900/70 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-xs uppercase text-teal-800">Edit Informasi Wali</h3>
              <button
                type="button"
                onClick={() => setEditInformasiItem(null)}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center cursor-pointer font-bold text-slate-800"
              >
                <b>✕</b>
              </button>
            </div>
            <form onSubmit={submitEditInformasi} className="space-y-4 text-left">
              <div>
                <label className="text-[10px] font-bold text-slate-455 block uppercase mb-1">Tanggal Terbit</label>
                <input
                  type="date"
                  value={editInformasiItem.tanggal}
                  onChange={(e) => setEditInformasiItem({ ...editInformasiItem, tanggal: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-455 block uppercase mb-1">Pesan / Isi Informasi</label>
                <textarea
                  rows={4}
                  value={editInformasiItem.pesan}
                  onChange={(e) => setEditInformasiItem({ ...editInformasiItem, pesan: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-3.5 rounded-2xl text-[10px] uppercase tracking-wider transition-colors shadow cursor-pointer text-center"
              >
                Simpan Perubahan Informasi
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT DIARY MUTABAAH */}
      {editMutabaahItem && (
        <div className="fixed inset-0 bg-slate-900/75 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-xs uppercase text-black font-medium">Edit Jurnal Mutabaah</h3>
              <button
                type="button"
                onClick={() => setEditMutabaahItem(null)}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center cursor-pointer font-bold text-slate-800"
              >
                <b>✕</b>
              </button>
            </div>
            <form onSubmit={submitEditMutabaah} className="space-y-4 text-left">
              <div>
                <label className="text-[10px] font-bold text-slate-700 block uppercase mb-1">Nama Santri</label>
                <div className="w-full bg-slate-100 border rounded-xl p-2.5 text-xs text-slate-800 font-semibold font-sans">
                  {editMutabaahItem.nama_santri}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-700 block uppercase mb-1">Tanggal Mutabaah</label>
                <input
                  type="date"
                  value={editMutabaahItem.tanggal}
                  onChange={(e) => setEditMutabaahItem({ ...editMutabaahItem, tanggal: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                {[
                  { label: 'Subuh', field: 'subuh' },
                  { label: 'Dzuhur', field: 'dzuhur' },
                  { label: 'Ashar', field: 'ashar' },
                  { label: 'Maghrib', field: 'maghrib' },
                  { label: 'Isya', field: 'isya' },
                  { label: 'Dhuha', field: 'dhuha' }
                ].map((item, i) => (
                  <div key={i} className="bg-slate-50 p-2 rounded-xl border border-slate-200 flex flex-col items-center justify-between shadow-sm">
                    <span className="text-[9px] font-bold text-black font-medium block mb-1">{item.label}</span>
                    <button
                      type="button"
                      onClick={() => setEditMutabaahItem({
                        ...editMutabaahItem,
                        [item.field]: editMutabaahItem[item.field as keyof Mutabaah] === 'Ya' ? 'Tidak' : 'Ya'
                      } as Mutabaah)}
                      className={`px-1 py-1 rounded-lg text-[9px] font-bold tracking-wider uppercase transition-colors outline-none cursor-pointer w-full text-center ${editMutabaahItem[item.field as keyof Mutabaah] === 'Ya' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200'}`}
                    >
                      {editMutabaahItem[item.field as keyof Mutabaah]}
                    </button>
                  </div>
                ))}
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-455 block uppercase mb-1">Tilawah Qur'an (Manual)</label>
                <input
                  type="text"
                  value={editMutabaahItem.tilawah}
                  onChange={(e) => setEditMutabaahItem({ ...editMutabaahItem, tilawah: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-455 block uppercase mb-1">Catatan / Guru</label>
                <textarea
                  rows={2}
                  value={editMutabaahItem.catatan}
                  onChange={(e) => setEditMutabaahItem({ ...editMutabaahItem, catatan: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-3.5 rounded-2xl text-[10px] uppercase tracking-wider transition-colors shadow cursor-pointer text-center"
              >
                Simpan Perubahan Mutabaah
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CUSTOM CONFIRMATION DIALOG */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/75 z-[200] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 border border-slate-100 text-center">
            <div className="mx-auto w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-slate-800">{confirmModal.title || 'Konfirmasi Tindakan'}</h3>
              <p className="text-xs text-slate-800 font-medium leading-relaxed px-2">{confirmModal.message}</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold py-3 rounded-2xl text-[11px] uppercase tracking-wider transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmModal.onConfirm();
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-2xl text-[11px] uppercase tracking-wider transition-all shadow-md shadow-rose-200 cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INPUT NAMA PENANDATANGAN UNTUK PDF */}
      {showPdfSignModal && (
        <div className="fixed inset-0 bg-slate-950/75 z-[200] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 border border-slate-100 text-left">
            <div className="mx-auto w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center text-teal-600">
              <Printer className="w-5 h-5" />
            </div>

            <div className="space-y-1 text-center">
              <h3 className="font-extrabold text-base text-slate-800">Cetak Laporan PDF</h3>
              <p className="text-xs text-slate-800 font-medium leading-relaxed px-2">
                {pdfSignType === 'setoran'
                  ? 'Silakan masukkan nama penunggu halaqah / ustadz kelas'
                  : 'Silakan masukkan nama sekretaris / bendahara'} untuk dicetak di lembar pengesahan laporan.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                {pdfSignType === 'setoran' ? 'Nama Penunggu Halaqoh/Kelas' : 'Nama Sekretaris/Bendahara'}
              </label>
              <input
                type="text"
                value={pdfSignName}
                onChange={(e) => setPdfSignName(e.target.value)}
                placeholder={pdfSignType === 'setoran' ? 'e.g. Ustadz Hanafi' : 'e.g. Fitri Handayani, S.E.'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 font-semibold text-slate-800"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowPdfSignModal(false);
                  setPdfSignType(null);
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold py-3 rounded-2xl text-[11px] uppercase tracking-wider transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPdfSignModal(false);
                  if (pdfSignType === 'tabungan') {
                    downloadTabunganPdf(pdfSignName);
                  } else if (pdfSignType === 'pembayaran') {
                    downloadPembayaranPdf(pdfSignName);
                  } else if (pdfSignType === 'setoran') {
                    downloadSetoranPdf(pdfSignName);
                  }
                  setPdfSignType(null);
                }}
                className="flex-1 bg-teal-700 hover:bg-teal-800 text-white font-bold py-3 rounded-2xl text-[11px] uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                Cetak PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
