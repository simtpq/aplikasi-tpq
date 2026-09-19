import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, MapPin, Phone, Mail, Globe, Award, Users, CheckCircle,
  GraduationCap, Calendar, Heart, ChevronRight,
  ArrowRight, Sparkles, Smartphone, Map, Clock, Camera, FileText,
  Star, Shield, Target, TrendingUp, Building2, BookMarked,
  Layers, Menu, X, ChevronLeft, Bell, Play, Quote, Send
} from 'lucide-react';
import { Pengaturan, Kelas, MataPelajaran, Santri, Pendaftaran, WebsiteData, Agenda } from '../types';

interface TPQLandingPageProps {
  school: { username: string; nama_lembaga: string; link_appscript: string };
  pengaturan: Pengaturan;
  websiteData: WebsiteData;
  kelasList: Kelas[];
  mataPelajaranList: MataPelajaran[];
  santriList: Santri[];
  pendaftaranList?: Pendaftaran[];
  agendaList?: Agenda[];
  onAddPendaftaran?: (p: Omit<Pendaftaran, 'id_pendaftaran' | 'tanggal_daftar' | 'status'>) => void;
  onAddSantri: (s: Omit<Santri, 'id_santri' | 'username_ortu' | 'password_ortu'>) => void;
  onNavigateToLogin: () => void;
  isSyncing: boolean;
  onSyncData: () => Promise<void>;
  user?: { role: string; nama_lengkap: string; id_santri: string | null } | null;
  onGoToDashboard?: () => void;
}

const repairAndParseJson = (jsonStr: string): any => {
  if (!jsonStr) return null;
  const trimmed = jsonStr.trim();
  try {
    return JSON.parse(trimmed);
  } catch (e) {
    console.warn("JSON kustomisasi terpotong, memulihkan data teks...", e);
    const recovered: any = { isPublished: true };
    const extractStringField = (key: string): string | undefined => {
      const regex = new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`);
      const match = trimmed.match(regex);
      if (match && match[1] !== undefined) {
        try { return JSON.parse(`"${match[1]}"`); }
        catch (err) { return match[1]; }
      }
      const truncatedRegex = new RegExp(`"${key}"\\s*:\\s*"([^"]*)$`);
      const truncMatch = trimmed.match(truncatedRegex);
      if (truncMatch && truncMatch[1] !== undefined) return truncMatch[1];
      return undefined;
    };
    const extractBooleanField = (key: string): boolean | undefined => {
      const regex = new RegExp(`"${key}"\\s*:\\s*(true|false)`);
      const match = trimmed.match(regex);
      if (match && match[1]) return match[1] === 'true';
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
    const namaLembaga = extractStringField('nama_lembaga');
    if (namaLembaga !== undefined) recovered.nama_lembaga = namaLembaga;
    const isPublished = extractBooleanField('isPublished');
    if (isPublished !== undefined) recovered.isPublished = isPublished;
    return recovered;
  }
};

const getCleanImageUrl = (urlOrId: string | undefined | null): string => {
  if (!urlOrId) return "";
  const trimmed = urlOrId.trim();
  if (trimmed.startsWith("data:")) return trimmed;
  const isGoogle = trimmed.includes("google.com") || trimmed.includes("googleusercontent.com");
  const isRawId = /^[a-zA-Z0-9_-]{15,100}$/.test(trimmed);
  if (isGoogle || isRawId) {
    let driveId = "";
    const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileDMatch) { driveId = fileDMatch[1]; }
    else {
      const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (idMatch) { driveId = idMatch[1]; }
      else {
        const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (dMatch) { driveId = dMatch[1]; }
        else if (isRawId) { driveId = trimmed; }
      }
    }
    if (driveId) return `https://lh3.googleusercontent.com/d/${driveId}`;
  }
  return trimmed;
};

const formatIndoDate = (dateStr: string | undefined | null): string => {
  if (!dateStr || dateStr === '-') return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
};

const getHijriDateString = (): string => {
  try {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { calendar: 'islamic', day: 'numeric', month: 'long', year: 'numeric' };
    return new Intl.DateTimeFormat('id-ID', options).format(now);
  } catch { return ''; }
};

const getAnnouncementTheme = (title: string, desc: string) => {
  const t = (title + ' ' + desc).toLowerCase();
  if (t.includes('libur') || t.includes('cuti') || t.includes('ramadhan') || t.includes('idul') || t.includes('muharram')) {
    return { bg: 'bg-[#042f2e]', border: 'border-teal-800/60', text: 'text-white', badgeBg: 'bg-teal-900/70 backdrop-blur-sm', badgeText: 'text-teal-300', tag: 'LIBUR SEKOLAH', icon: null };
  }
  if (t.includes('wisuda') || t.includes('tahfidz') || t.includes('kelulusan') || t.includes('khotmil')) {
    return { bg: 'bg-gradient-to-br from-amber-800 to-amber-950', border: 'border-amber-700/60', text: 'text-white', badgeBg: 'bg-amber-900/60', badgeText: 'text-amber-300', tag: 'WISUDA TAHFIDZ', icon: null };
  }
  if (t.includes('spp') || t.includes('pembayaran') || t.includes('keuangan') || t.includes('tagihan') || t.includes('biaya') || t.includes('infak')) {
    return { bg: 'bg-gradient-to-br from-teal-800 to-teal-950', border: 'border-teal-700/60', text: 'text-white', badgeBg: 'bg-teal-900/60', badgeText: 'text-teal-300', tag: 'INFORMASI KEUANGAN', icon: null };
  }
  if (t.includes('rapat') || t.includes('pertemuan') || t.includes('musyawarah') || t.includes('komite')) {
    return { bg: 'bg-gradient-to-br from-indigo-800 to-indigo-950', border: 'border-indigo-700/60', text: 'text-white', badgeBg: 'bg-indigo-900/60', badgeText: 'text-indigo-300', tag: 'RAPAT / PERTEMUAN', icon: null };
  }
  return { bg: 'bg-gradient-to-br from-teal-800 to-teal-950', border: 'border-teal-700/60', text: 'text-white', badgeBg: 'bg-teal-900/60', badgeText: 'text-teal-300', tag: 'PENGUMUMAN', icon: null };
};

export default function TPQLandingPage({
  school, pengaturan, websiteData, kelasList, mataPelajaranList,
  santriList, pendaftaranList = [], agendaList = [],
  onAddPendaftaran, onAddSantri, onNavigateToLogin,
  isSyncing, onSyncData, user, onGoToDashboard
}: TPQLandingPageProps) {

  const getInitialWebConfig = (): any => {
    const cloudPublishedRaw = localStorage.getItem(`tpq_cloud_${school.username}`);
    const localPublishedRaw = localStorage.getItem(`tpq_published_${school.username}`);
    let cloudConfig: any = null;
    let localConfig: any = null;
    try { if (cloudPublishedRaw) cloudConfig = JSON.parse(cloudPublishedRaw); } catch {}
    try { if (localPublishedRaw) localConfig = JSON.parse(localPublishedRaw); } catch {}
    let baseConfig: any = {};
    if (cloudConfig && localConfig) {
      const cloudTime = cloudConfig.publishedAt ? new Date(cloudConfig.publishedAt).getTime() : 0;
      const localTime = localConfig.publishedAt ? new Date(localConfig.publishedAt).getTime() : 0;
      if (localTime >= cloudTime) baseConfig = localConfig;
      else {
        baseConfig = { ...localConfig, ...cloudConfig };
        if (!cloudConfig.heroImage && localConfig.heroImage) baseConfig.heroImage = localConfig.heroImage;
        if ((!cloudConfig.galleryImages || !Array.isArray(cloudConfig.galleryImages) || cloudConfig.galleryImages.every((img: string) => !img)) && localConfig.galleryImages) baseConfig.galleryImages = localConfig.galleryImages;
      }
    } else if (localConfig) baseConfig = localConfig;
    else if (cloudConfig) baseConfig = cloudConfig;
    if (!baseConfig) baseConfig = {};
    const merged = {
      ...baseConfig,
      heroTitle: websiteData?.judul_hero || baseConfig.heroTitle || "Membentuk Generasi Qur'ani & Berakhlak Karimah",
      heroSubtitle: websiteData?.sub_judul_hero || baseConfig.heroSubtitle || "Kami berdedikasi mendidik putra-putri tercinta untuk mahir membaca, menghafal, dan mengamalkan nilai-nilai suci Al-Qur'an.",
      heroImage: websiteData?.gambar_hero || baseConfig.heroImage || "https://images.unsplash.com/photo-1541829019-259276a7f013?auto=format&fit=crop&w=1200&q=80",
      profileTitle: websiteData?.judul_profil || baseConfig.profileTitle || "Mendidik Al-Qur'an dengan Kurikulum Terstruktur & Modern",
      profileDesc: websiteData?.profil || baseConfig.profileDesc || "Lembaga kami menggabungkan tradisi talaqqi yang murni dengan sistem administrasi berbasis digital.",
      galleryImages: [websiteData?.program_1_gambar || baseConfig.galleryImages?.[0] || "", websiteData?.program_2_gambar || baseConfig.galleryImages?.[1] || "", websiteData?.program_3_gambar || baseConfig.galleryImages?.[2] || "", websiteData?.program_4_gambar || baseConfig.galleryImages?.[3] || ""],
      galleryTitles: [websiteData?.program_1_judul || baseConfig.galleryTitles?.[0] || "", websiteData?.program_2_judul || baseConfig.galleryTitles?.[1] || "", websiteData?.program_3_judul || baseConfig.galleryTitles?.[2] || "", websiteData?.program_4_judul || baseConfig.galleryTitles?.[3] || ""],
      galleryDescriptions: [websiteData?.program_1_ket || baseConfig.galleryDescriptions?.[0] || "", websiteData?.program_2_ket || baseConfig.galleryDescriptions?.[1] || "", websiteData?.program_3_ket || baseConfig.galleryDescriptions?.[2] || "", websiteData?.program_4_ket || baseConfig.galleryDescriptions?.[3] || ""],
      mapsLink: websiteData?.link_peta || baseConfig.mapsLink || "",
      videoLink: websiteData?.link_video || baseConfig.videoLink || "",
      testimonials: (baseConfig.testimonials && Array.isArray(baseConfig.testimonials) && baseConfig.testimonials.length > 0 && baseConfig.testimonials[0]?.nama) 
        ? baseConfig.testimonials 
        : (websiteData?.testi_1_nama || websiteData?.testi_2_nama || websiteData?.testi_3_nama) ? [
        { nama: websiteData?.testi_1_nama || "", jabatan: websiteData?.testi_1_jabatan || "", pesan: websiteData?.testi_1_pesan || "" },
        { nama: websiteData?.testi_2_nama || "", jabatan: websiteData?.testi_2_jabatan || "", pesan: websiteData?.testi_2_pesan || "" },
        { nama: websiteData?.testi_3_nama || "", jabatan: websiteData?.testi_3_jabatan || "", pesan: websiteData?.testi_3_pesan || "" }
      ] : [
        { nama: "Ahmad Fauzi", jabatan: "Wali Santri Kelas A", pesan: "Alhamdulillah sejak belajar di TPQ ini, hafalan anak saya meningkat pesat." },
        { nama: "Siti Rahma", jabatan: "Wali Santri Kelas B", pesan: "Kurikulumnya terstruktur dengan baik. Anak saya sangat antusias mengaji setiap hari." },
        { nama: "Budi Santoso", jabatan: "Wali Santri Kelas C", pesan: "Pelayanan ustadz-ustadzah yang ramah, metode pembelajarannya modern dan mudah diikuti oleh anak-anak." }
      ]
    };
    return merged;
  };

  const [webConfig, setWebConfig] = useState<any>(() => getInitialWebConfig());

  React.useEffect(() => {
    setWebConfig(getInitialWebConfig());
  }, [school, pengaturan, websiteData]);

  React.useEffect(() => {
    const htmlEl = document.documentElement;
    const bodyEl = document.body;
    const rootEl = document.getElementById('root');
    const origHtmlOverflow = htmlEl.style.overflow;
    const origBodyOverflow = bodyEl.style.overflow;
    const origHtmlHeight = htmlEl.style.height;
    const origBodyHeight = bodyEl.style.height;
    const origHtmlPosition = htmlEl.style.position;
    const origBodyPosition = bodyEl.style.position;
    const origHtmlOverscroll = htmlEl.style.overscrollBehavior;
    const origBodyOverscroll = bodyEl.style.overscrollBehavior;
    const origHtmlTouchAction = htmlEl.style.touchAction;
    const origBodyTouchAction = bodyEl.style.touchAction;
    const origRootOverflow = rootEl?.style.overflow;
    const origRootHeight = rootEl?.style.height;
    const origRootPosition = rootEl?.style.position;
    const origRootOverscroll = rootEl?.style.overscrollBehavior;
    const origRootTouchAction = rootEl?.style.touchAction;

    htmlEl.style.overflow = 'auto';
    htmlEl.style.height = 'auto';
    htmlEl.style.position = 'static';
    htmlEl.style.overscrollBehavior = 'auto';
    htmlEl.style.touchAction = 'auto';
    bodyEl.style.overflow = 'auto';
    bodyEl.style.height = 'auto';
    bodyEl.style.position = 'static';
    bodyEl.style.overscrollBehavior = 'auto';
    bodyEl.style.touchAction = 'auto';
    if (rootEl) {
      rootEl.style.overflow = 'auto';
      rootEl.style.height = 'auto';
      rootEl.style.position = 'static';
      rootEl.style.overscrollBehavior = 'auto';
      rootEl.style.touchAction = 'auto';
    }
    return () => {
      htmlEl.style.overflow = origHtmlOverflow;
      bodyEl.style.overflow = origBodyOverflow;
      htmlEl.style.height = origHtmlHeight;
      bodyEl.style.height = origBodyHeight;
      htmlEl.style.position = origHtmlPosition;
      bodyEl.style.position = origBodyPosition;
      htmlEl.style.overscrollBehavior = origHtmlOverscroll;
      bodyEl.style.overscrollBehavior = origBodyOverscroll;
      htmlEl.style.touchAction = origHtmlTouchAction;
      bodyEl.style.touchAction = origBodyTouchAction;
      if (rootEl) {
        rootEl.style.overflow = origRootOverflow || '';
        rootEl.style.height = origRootHeight || '';
        rootEl.style.position = origRootPosition || '';
        rootEl.style.overscrollBehavior = origRootOverscroll || '';
        rootEl.style.touchAction = origRootTouchAction || '';
      }
    };
  }, []);

  const displayName = webConfig?.nama_lembaga || pengaturan.nama_lembaga || school?.nama_lembaga || "SIM TPQ DIGITAL";
  const displayLogo = webConfig?.logo || pengaturan.logo || "https://iili.io/CCbS5Ss.md.png";

  const [namaSantri, setNamaSantri] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('');
  const [namaOrtu, setNamaOrtu] = useState('');
  const [waOrtu, setWaOrtu] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegisteringLocal, setIsRegisteringLocal] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [searchTrackName, setSearchTrackName] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return "";
    let videoId = "";
    if (url.includes("youtube.com/watch")) {
      try { const urlParams = new URLSearchParams(new URL(url).search); videoId = urlParams.get("v") || ""; }
      catch { const parts = url.split("v="); if (parts[1]) videoId = parts[1].split("&")[0]; }
    } else if (url.includes("youtu.be/")) { videoId = url.split("youtu.be/")[1]?.split("?")[0] || ""; }
    else if (url.includes("youtube.com/embed/")) return url;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  };

  const getMapsEmbedUrl = (link: string) => {
    if (!link) return "";
    const clean = link.trim();
    const match = clean.match(/src=["']([^"']+)["']/i);
    if (match) return match[1];
    return clean;
  };

  const getWhatsAppFloatLink = () => {
    if (pengaturan.telepon) {
      let cleanPhone = pengaturan.telepon.replace(/\D/g, '');
      if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);
      else if (!cleanPhone.startsWith('62')) cleanPhone = '62' + cleanPhone;
      return `https://wa.me/+${cleanPhone}`;
    }
    return 'https://wa.me/+6281234567890';
  };

  const totalStudents = santriList.length || 12;
  const totalClasses = kelasList.length || 3;
  const pimpinanNama = pengaturan.nama_pimpinan || 'Pimpinan TPQ';

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (!namaSantri.trim() || !namaOrtu.trim() || !waOrtu.trim() || !selectedKelas) {
      setValidationError('Mohon lengkapi semua isian formulir pendaftaran!');
      return;
    }
    setIsRegisteringLocal(true);
    try {
      if (onAddPendaftaran) {
        onAddPendaftaran({ nama_santri: namaSantri.trim(), halaqah: selectedKelas, nama_ortu: namaOrtu.trim(), wa_ortu: waOrtu.trim() });
      } else {
        onAddSantri({ nama_santri: namaSantri.trim(), nis: `SNT-${Math.floor(1000 + Math.random() * 9000)}`, halaqah: selectedKelas, jumlah_hafalan: 'Belum ada', juz_hafal: '0 Juz', murojaah: 'Pendaftaran Baru' });
      }
      if (typeof (window as any).Swal !== 'undefined') {
        (window as any).Swal.fire({ icon: 'success', title: 'Pendaftaran Berhasil!', text: `Data calon santri ${namaSantri.trim()} telah berhasil dikirim dan tersimpan di sistem.`, confirmButtonColor: '#0f766e', timer: 3000, timerProgressBar: true });
      }
      setIsRegistered(true);
      setNamaSantri(''); setNamaOrtu(''); setWaOrtu(''); setSelectedKelas('');
    } catch (err) { setValidationError('Pendaftaran gagal. Mohon coba beberapa saat lagi.'); }
    finally { setIsRegisteringLocal(false); }
  };

  const getClassCurriculum = (className: string) => {
    const matchedClass = kelasList.find(k => k.nama_kelas.toLowerCase().trim() === className.toLowerCase().trim() || k.id_kelas.toLowerCase().trim() === className.toLowerCase().trim());
    if (!matchedClass) return null;
    return mataPelajaranList.find(mp => mp.id_kelas.toLowerCase().trim() === matchedClass.id_kelas.toLowerCase().trim() || mp.id_kelas.toLowerCase().trim() === matchedClass.nama_kelas.toLowerCase().trim());
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Premium Design System colors: Deep Teal #0d9488, Warm Orange #F5A623
  return (
    <div id="landing-page-root" className="min-h-screen w-full bg-[#f5f7fa] text-slate-800 font-sans flex flex-col antialiased">
      {isSyncing && <div className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0d9488] via-[#0f766e] to-[#F5A623] z-[9999] animate-pulse" />}

      {/* ── PREMIUM NAVBAR: Dark Teal ── */}
      <header className="sticky top-0 bg-[#0d9488] z-50 px-4 py-3 sm:px-6 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/20 shadow-sm">
              {displayLogo ? (
                <img src={getCleanImageUrl(displayLogo)} alt={displayName} className="w-7 h-7 object-contain" referrerPolicy="no-referrer"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://iili.io/CCbS5Ss.md.png'; }} />
              ) : (
                <BookOpen className="text-white w-5 h-5" />
              )}
            </div>
            <div>
              <h1 className="text-xs font-black text-white uppercase tracking-wider leading-tight">{displayName}</h1>
              <p className="text-[7px] text-white/70 font-bold tracking-widest uppercase">SIM TPQ DIGITAL</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-[10px] font-bold uppercase tracking-wider text-white/80">
            <a href="#hero-section" className="hover:text-white transition-colors" onClick={() => scrollToSection('hero-section')}>Beranda</a>
            <a href="#program-section" className="hover:text-white transition-colors" onClick={() => scrollToSection('program-section')}>Program</a>
            <a href="#keunggulan-section" className="hover:text-white transition-colors" onClick={() => scrollToSection('keunggulan-section')}>Keunggulan</a>
            <a href="#pendaftaran-section" className="hover:text-white transition-colors" onClick={() => scrollToSection('pendaftaran-section')}>Pendaftaran</a>
          </nav>

          <div className="flex items-center gap-3">
            <a href="#pendaftaran-section"
              onClick={() => scrollToSection('pendaftaran-section')}
              className="hidden sm:inline-flex bg-[#F5A623] hover:bg-[#e0951f] text-white font-extrabold text-[10px] uppercase tracking-wider py-2.5 px-5 rounded-full shadow-lg shadow-[#F5A623]/30 transition-all active:scale-95 items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" /> Daftar Online
            </a>
            {/* Mobile menu button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white p-1 cursor-pointer">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="md:hidden mt-3 bg-white/10 rounded-2xl p-4 space-y-3 backdrop-blur-md">
            <a href="#hero-section" className="block text-white text-xs font-bold uppercase tracking-wider py-1" onClick={() => scrollToSection('hero-section')}>Beranda</a>
            <a href="#program-section" className="block text-white text-xs font-bold uppercase tracking-wider py-1" onClick={() => scrollToSection('program-section')}>Program</a>
            <a href="#keunggulan-section" className="block text-white text-xs font-bold uppercase tracking-wider py-1" onClick={() => scrollToSection('keunggulan-section')}>Keunggulan</a>
            <a href="#pendaftaran-section" className="block text-white text-xs font-bold uppercase tracking-wider py-1" onClick={() => scrollToSection('pendaftaran-section')}>Pendaftaran</a>
            <a href="#pendaftaran-section" onClick={() => scrollToSection('pendaftaran-section')} className="block bg-[#F5A623] text-white font-extrabold text-[10px] uppercase tracking-wider py-2.5 px-5 rounded-full text-center">Daftar Online</a>
          </motion.div>
        )}
      </header>

      {/* ── HERO: Premium Clean Layout ── */}
      <section id="hero-section" className="relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 bg-[url('/asset/bg-lending-hero.png')] bg-cover bg-center bg-no-repeat" />
        {/* Soft overlay untuk readability */}
        <div className="absolute inset-0 bg-white/85" />

        <div className="max-w-5xl mx-auto px-4 pt-12 pb-2 sm:pb-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            {/* Left: Text Content */}
            <div className="w-full md:w-[55%] py-6">
                            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
                className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight mb-4 text-[#0d9488]"
              >
                {webConfig?.heroTitle || (
                  <>
                    Membentuk Generasi <br />
                    <span className="text-[#F5A623]">Qur'ani & Berakhlaq Mulia</span>
                  </>
                )}
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
                className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6"
              >
                {webConfig?.heroSubtitle || "Kami menyelenggarakan program pendidikan berbasis Al-Qur'an dan Sunnah untuk membentuk generasi yang beriman, berilmu, dan berakhlak mulia."}
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
                className="flex flex-wrap items-center gap-3"
              >
                <a href="#pendaftaran-section" onClick={() => scrollToSection('pendaftaran-section')}
                  className="bg-[#0d9488] hover:bg-[#035388] text-white font-black text-xs uppercase tracking-wider py-3.5 px-8 rounded-full shadow-lg shadow-[#0d9488]/20 hover:shadow-[#0d9488]/30 transition-all active:scale-95 inline-flex items-center gap-2"
                >
                  Daftar Sekarang <ArrowRight className="w-4 h-4" />
                </a>
                <a href="#program-section" onClick={() => scrollToSection('program-section')}
                  className="bg-white hover:bg-slate-50 text-[#0d9488] font-bold text-xs uppercase tracking-wider py-3.5 px-8 rounded-full border border-[#0d9488]/20 shadow-sm hover:shadow transition-all active:scale-95"
                >
                  Lihat Program
                </a>
              </motion.div>
            </div>

            {/* Right: Hero Image - Photo (smaller, aligned with text height) */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
              className="w-full md:w-[35%] flex-shrink-0"
            >
              {(!webConfig?.heroImage && !websiteData?.gambar_hero) ? (
                <div className="w-full aspect-[4/3] bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm max-h-[260px]">
                  <div className="text-center p-6">
                    <Camera className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                    <p className="text-slate-300 text-xs font-bold">Foto Hero</p>
                  </div>
                </div>
              ) : (
                <img src={getCleanImageUrl(webConfig?.heroImage || websiteData?.gambar_hero)} alt="Hero" 
                  className="w-full h-auto object-cover rounded-2xl shadow-xl max-h-[280px]"
                  referrerPolicy="no-referrer" />
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STATS: Minimalist Bar Style ── */}
      <section className="relative -mt-6 px-4 z-20 pb-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            {/* Top divider accent */}
            <div className="h-2 bg-gradient-to-r from-[#0d9488] via-[#0f766e] to-[#0d9488]" />
            <div className="grid grid-cols-3 divide-x divide-slate-100">
              {[
                { icon: Users, value: totalStudents, label: "Santri Aktif" },
                { icon: GraduationCap, value: totalClasses, label: "Halaqah Kelas" },
                { icon: Award, value: pimpinanNama, label: "Pimpinan" }
              ].map((stat, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 * idx }}
                                  className="p-2.5 sm:p-3.5 flex flex-col items-center justify-center gap-1"
                                >
                                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#0d9488] rounded-lg flex items-center justify-center shadow-sm">
                                    <stat.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                                  </div>
                                  <h3 className={`font-black text-slate-900 tracking-tight leading-tight text-center max-w-full line-clamp-2 whitespace-normal break-words ${idx === 2 ? 'text-[8px] sm:text-[9px]' : 'text-[10px] sm:text-xs'}`}>{stat.value}</h3>
                                  <p className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-widest">{stat.label}</p>
                                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── AGENDA & PENGUMUMAN ── */}
      <section id="pengumuman-section" className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0d9488] to-[#0f766e] rounded-full flex items-center justify-center shadow-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Agenda & Pengumuman</h3>
                <p className="text-xs text-slate-500 font-medium">Terintegrasi real-time dari sistem admin</p>
              </div>
            </div>
            <span className="text-[9px] font-bold text-[#0d9488] bg-[#0d9488]/10 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488] animate-ping"></span> Live Sync
            </span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Agenda Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:border-teal-400/50 transition-all"
            >
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-7 h-7 rounded-full bg-[#0d9488]/10 flex items-center justify-center">
                  <BookOpen className="w-3.5 h-3.5 text-[#0d9488]" />
                </div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Agenda Kegiatan</h4>
              </div>
              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1 no-scrollbar">
                {(() => {
                  const items = (agendaList || []).filter(i => i.tipe === 'Agenda');
                  const data = items.length > 0 ? items : [
                    { id: '1', tanggal: '2026-07-06', waktu: '08.00 - 09.00', judul: "Tahsin Al-Qur'an & Tajwid Mandiri", status: 'Berjalan', deskripsi: 'Mempelajari makhrajul huruf, hukum mad, dan sifat-sifat huruf.' },
                    { id: '2', tanggal: '2026-07-06', waktu: '09.00 - 10.30', judul: 'Setoran Hafalan Juz 30', status: 'Berikutnya', deskripsi: 'Sesi pendampingan intensif bersama ustadz/ustadzah pembina.' },
                    { id: '3', tanggal: '2026-07-06', waktu: '14.00 - 15.30', judul: 'Evaluasi Bulanan', status: 'Berikutnya', deskripsi: 'Penilaian mutabaah berkala.' },
                  ];
                  return data.map((item, idx) => {
                    let badgeStyle = "bg-slate-50 text-slate-500 border border-slate-200";
                    if (item.status === 'Berjalan') badgeStyle = "bg-teal-50 text-teal-700 border border-teal-200";
                    else if (item.status === 'Berikutnya') badgeStyle = "bg-amber-50 text-amber-700 border border-amber-200";
                    return (
                      <div key={item.id || idx} className="p-3 rounded-xl border border-slate-100 hover:border-[#0d9488]/20 hover:bg-[#0d9488]/[0.02] transition-all">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[9px] font-bold text-slate-400 font-mono">{formatIndoDate(item.tanggal)} • {item.waktu || 'Tentatif'}</span>
                          <span className={`text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeStyle}`}>{item.status || 'Agenda'}</span>
                        </div>
                        <p className="text-sm font-black text-slate-900 leading-snug">{item.judul}</p>
                        {(item as any).deskripsi && <p className="text-[10px] text-slate-500 font-medium mt-0.5 line-clamp-2">{(item as any).deskripsi}</p>}
                      </div>
                    );
                  });
                })()}
              </div>
            </motion.div>

            {/* Pengumuman Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:border-teal-400/50 transition-all"
            >
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-7 h-7 rounded-full bg-[#F5A623]/10 flex items-center justify-center">
                  <Bell className="w-3.5 h-3.5 text-[#F5A623]" />
                </div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Pengumuman Penting</h4>
              </div>
              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1 no-scrollbar">
                {(() => {
                  const items = (agendaList || []).filter(i => i.tipe === 'Pengumuman');
                  const pengumuman = items.length > 0 ? items : (pengaturan.pengumuman ? [{ judul: "Maklumat Lembaga", deskripsi: pengaturan.pengumuman, tanggal: '' }] : [{ judul: "Penerimaan Santri Baru", deskripsi: "Pendaftaran santri baru telah dibuka secara online.", tanggal: "2026-07-01" }]);
                  return pengumuman.map((item: any, idx: number) => {
                    const theme = getAnnouncementTheme(item.judul, item.deskripsi);
                    const hasGambar = !!item.gambar;
                    return (
                      <div key={idx} className={`rounded-xl p-3 border relative overflow-hidden flex flex-col justify-between min-h-[100px] ${hasGambar ? 'text-white' : theme.text} ${hasGambar ? 'border-white/10' : theme.border}`}
                        style={hasGambar ? { background: 'transparent' } : {}}
                      >
                        {hasGambar && (
                          <>
                            <img
                              src={getCleanImageUrl(item.gambar)}
                              alt={item.judul}
                              className="absolute inset-0 z-0 w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                          </>
                        )}
                        {!hasGambar && (
                          <div className={`absolute inset-0 z-0 ${theme.bg}`} />
                        )}
                        <div className="relative z-10">
                          <span className={`text-[7px] font-black tracking-wider uppercase ${theme.badgeText} ${theme.badgeBg} px-2 py-0.5 rounded-full inline-block`}>{theme.tag}</span>
                          <h5 className="text-xs font-black leading-snug mt-1.5 text-white">{item.judul}</h5>
                          {item.deskripsi && <p className="text-[9px] text-white/80 mt-0.5 leading-relaxed line-clamp-2">{item.deskripsi}</p>}
                          {item.tanggal && <span className="text-[7px] text-white/50 mt-1.5 block font-mono">{formatIndoDate(item.tanggal)}</span>}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── KEUNGGULAN SECTION: Premium Cards with Circular Icons ── */}
      <section id="keunggulan-section" className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-3">Aktivitas Unggulan Santri</h2>
            <p className="text-sm text-slate-500 font-medium max-w-2xl mx-auto">Setiap hari santri dibimbing dengan kurikulum terpadu yang mencakup tilawah, tahfidz, hadits, dan doa harian.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: BookOpen, title: "Tashih & Tilawati", desc: "Membimbing santri dengan metode menyenangkan agar mencintai Al-Qur'an.", color: "from-[#0d9488] to-[#0f766e]" },
              { icon: BookMarked, title: "Tahfidzul Qur'an", desc: "Metode talqin & talaqqi intensif bersama ustadz/ustadzah berpengalaman.", color: "from-[#F5A623] to-[#e0951f]" },
              { icon: Heart, title: "Kajian Akhlak", desc: "Membentuk karakter santri yang mulia, berakhlak karimah, dan bertanggung jawab.", color: "from-[#0d9488] to-[#0f766e]" },
              { icon: Target, title: "Hadits & Doa", desc: "Membiasakan santri menghafal doa-doa harian dan hadits-hadits pilihan.", color: "from-[#0d9488] to-[#0d9488]" }
            ].map((item, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-xl hover:border-teal-400/50 hover:shadow-teal-500/10 transition-all duration-300 text-center"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xs font-black text-slate-900 mb-1.5">{item.title}</h4>
                <p className="text-[9px] text-slate-500 font-medium leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROFILE & PROGRAM HIGHLIGHTS ── */}
      <section className="py-16 px-4 bg-[#f5f7fa]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-3">{webConfig?.profileTitle || "Mendidik Al-Qur'an dengan Kurikulum Terstruktur & Modern"}</h2>
            <p className="text-sm text-slate-500 font-medium max-w-3xl mx-auto">{webConfig?.profileDesc || websiteData?.profil || "Lembaga kami menggabungkan tradisi talaqqi yang murni dengan sistem administrasi berbasis digital."}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
            {[
              { icon: CheckCircle, title: "Hafalan Metode Talaqqi", desc: "Ziyadah setoran dan murojaah harian dipandu langsung ustadz berpengalaman." },
              { icon: CheckCircle, title: "Buku Diary Mutabaah", desc: "Catatan sholat lima waktu, dhuha, dan tilawah mandiri setiap hari." },
              { icon: CheckCircle, title: "Tabungan Wadiah", desc: "Melatih kedisiplinan finansial sejak dini melalui tabungan harian santri." },
              { icon: CheckCircle, title: "Sistem Rapor Digital", desc: "Evaluasi nilai berkala yang dapat diunduh PDF langsung oleh orang tua." }
            ].map((item, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                className="flex gap-3 items-start p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-teal-400/40 hover:shadow-md hover:shadow-teal-500/10 transition-all"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-[#0d9488] to-[#0f766e] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <item.icon className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                  <p className="text-[9px] text-slate-500 font-medium leading-relaxed mt-0.5">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DYNAMIC CLASSES: Side-by-Side Premium Cards ── */}
      <section id="program-section" className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-3">Pilihan Jenjang Kelas Belajar</h2>
            <p className="text-sm text-slate-500 font-medium max-w-2xl mx-auto">Setiap jenjang dirancang dengan kurikulum bertahap, dipandu ustadz/ustadzah bersertifikat.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {kelasList.map((k, index) => {
              const curriculum = getClassCurriculum(k.nama_kelas);
              const accentColor = index % 2 === 0 ? 'from-[#0d9488] to-[#0f766e]' : 'from-[#F5A623] to-[#e0951f]';
              return (
                <motion.div key={k.id_kelas} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}
                  className="w-full sm:w-[360px] lg:w-[340px] bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-teal-500/10 hover:border-teal-400/50 transition-all duration-300 flex flex-col"
                >
                  <div className={`h-1.5 bg-gradient-to-r ${accentColor} shrink-0`} />
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`bg-gradient-to-r ${accentColor} text-white text-[8px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full`}>Halaqah</span>
                      <span className="text-[9px] font-bold text-slate-400">ID: {k.id_kelas}</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-3 shrink-0">Kelas {k.nama_kelas}</h3>

                    {curriculum ? (
                      <div className="space-y-3 flex-1">
                        {curriculum.tilawah_stages && curriculum.tilawah_stages.length > 0 && (
                          <div>
                            <p className="text-[8px] font-black text-[#0d9488] uppercase tracking-widest mb-1.5">Materi Tilawah</p>
                            <div className="flex flex-wrap gap-1">
                              {curriculum.tilawah_stages.slice(0, 4).map((s: string, i: number) => (
                                <span key={i} className="bg-white border border-slate-200 text-[8px] font-bold text-slate-600 px-2 py-1 rounded-lg">{s}</span>
                              ))}
                              {curriculum.tilawah_stages.length > 4 && <span className="bg-slate-50 text-slate-500 text-[8px] font-bold px-2 py-1 rounded-lg border">+{curriculum.tilawah_stages.length - 4} lagi</span>}
                            </div>
                          </div>
                        )}
                        {curriculum.quran_methods && curriculum.quran_methods.length > 0 && (
                          <div>
                            <p className="text-[8px] font-black text-[#F5A623] uppercase tracking-widest mb-1.5">Metode Setoran</p>
                            <div className="flex flex-wrap gap-1">
                              {curriculum.quran_methods.map((m: string, i: number) => (
                                <span key={i} className="bg-amber-50 border border-amber-100 text-[8px] font-bold text-amber-700 px-2 py-1 rounded-lg">{m}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {curriculum.hadits_doa && curriculum.hadits_doa.length > 0 && (
                          <div>
                            <p className="text-[8px] font-black text-purple-700 uppercase tracking-widest mb-1.5">Hafalan Hadits & Doa</p>
                            <ul className="text-[9px] text-slate-600 space-y-1 font-medium">
                              {curriculum.hadits_doa.slice(0, 2).map((h: string, i: number) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="w-1 h-1 bg-purple-400 rounded-full mt-1.5 shrink-0" />
                                  <span className="line-clamp-1">{h}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center">
                        <p className="text-[9px] text-slate-400 italic py-3">Informasi detail kurikulum halaqah ini sedang disiapkan oleh ustadz.</p>
                      </div>
                    )}
                  </div>

                  <div className="px-4 pb-4">
                    <a href="#pendaftaran-section" onClick={() => { setSelectedKelas(k.nama_kelas); scrollToSection('pendaftaran-section'); }}
                      className={`w-full bg-gradient-to-r ${accentColor} text-white font-black text-[9px] uppercase tracking-wider py-3 px-4 rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer`}
                    >
                      Pilih Kelas Ini <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── GALLERY SECTION ── */}
      <section className="py-16 px-4 bg-[#f5f7fa]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-3">Keseharian & Aktivitas Santri</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(() => {
              const defaultTitles = ["Tashih & Tilawati", "Tahfidzul Qur'an", "Kajian Akhlak", "Hadits & Doa"];
              const defaultDescriptions = ["Belajar membaca Al-Qur'an dengan interaktif.", "Program tahfidz intensif dengan target hafalan.", "Pembentukan karakter santri yang mulia.", "Hafalan doa harian dan hadits pilihan."];
              const defaultImgs = ["https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=400&q=80", "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80", "https://images.unsplash.com/photo-1609599006353-e629f1d00f18?auto=format&fit=crop&w=400&q=80", "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=400&q=80"];
              return [0, 1, 2, 3].map((idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -4 }} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:border-teal-400/50 hover:shadow-xl group transition-all"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={getCleanImageUrl((webConfig?.galleryImages && webConfig.galleryImages[idx]) || defaultImgs[idx])} alt={webConfig?.galleryTitles?.[idx] || defaultTitles[idx]}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                  </div>
                  <div className="p-3">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">{webConfig?.galleryTitles?.[idx] || defaultTitles[idx]}</h4>
                    <p className="text-[9px] text-slate-500 font-medium mt-1 leading-relaxed line-clamp-2">{webConfig?.galleryDescriptions?.[idx] || defaultDescriptions[idx]}</p>
                  </div>
                </motion.div>
              ));
            })()}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Apa Kata Wali Santri?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map(idx => {
              const defaultTestimonials = [
                { nama: "Ahmad Fauzi", jabatan: "Wali Santri Kelas A", pesan: "Alhamdulillah sejak belajar di TPQ ini, hafalan anak saya meningkat pesat." },
                { nama: "Siti Rahma", jabatan: "Wali Santri Kelas B", pesan: "Kurikulumnya terstruktur dengan baik. Anak saya sangat antusias mengaji setiap hari." },
                { nama: "Budi Santoso", jabatan: "Wali Santri Kelas C", pesan: "Pelayanan ustadz-ustadzah yang ramah, metode pembelajarannya modern dan mudah diikuti." }
              ];
              const t = (webConfig?.testimonials && webConfig.testimonials[idx]?.nama) ? webConfig.testimonials[idx] : defaultTestimonials[idx];
              return (
                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.15 }}
                  className="bg-[#f5f7fa] rounded-2xl p-5 border border-slate-100 flex flex-col hover:border-teal-400/40 hover:shadow-lg transition-all"
                >
                  <Quote className="w-5 h-5 text-[#0d9488]/20 shrink-0" />
                  <p className="text-[9px] text-slate-500 font-medium italic leading-relaxed mt-3 flex-1">"{t.pesan}"</p>
                  <div className="flex items-center gap-2.5 pt-2.5 border-t border-slate-200 mt-3 shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0d9488] to-[#0f766e] flex items-center justify-center text-white text-[9px] font-black uppercase">{t.nama.charAt(0)}</div>
                    <div>
                      <h4 className="text-[9px] font-black text-slate-800 uppercase tracking-tight">{t.nama}</h4>
                      <p className="text-[7px] text-slate-400 font-bold">{t.jabatan}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── REGISTRATION FORM ── */}
      <section id="pendaftaran-section" className="py-16 px-4 bg-gradient-to-b from-[#f5f7fa] to-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Pendaftaran Santri Baru</h2>
            <p className="text-sm text-slate-500 font-medium mt-2">Isi data diri calon santri secara lengkap untuk mendaftar.</p>
          </div>

          <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-xl border border-slate-100">
            {isRegistered ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-teal-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle className="w-10 h-10 text-teal-600" />
                </div>
                <h3 className="text-lg font-black text-slate-800">Pendaftaran Berhasil Terkirim!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed font-medium">Alhamdulillah, data calon santri berhasil dikirim ke sistem. Silakan konfirmasi pendaftaran melalui WhatsApp admin lembaga.</p>
                <div className="flex flex-col sm:flex-row gap-2.5 justify-center max-w-xs mx-auto pt-4">
                  <a href={getWhatsAppFloatLink()} target="_blank" rel="noreferrer"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-[10px] uppercase py-3 rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                  ><Phone className="w-3.5 h-3.5" /> Konfirmasi WhatsApp</a>
                  <button onClick={() => setIsRegistered(false)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[10px] uppercase py-3 rounded-full transition-all cursor-pointer"
                  >Daftarkan Santri Lain</button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                {validationError && <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-[9px] font-extrabold rounded-xl text-center">⚠️ {validationError}</div>}
                <div>
                  <label className="block text-[8px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Nama Lengkap Calon Santri <span className="text-rose-500">*</span></label>
                  <input type="text" required placeholder="Contoh: Muhammad Azka" value={namaSantri} onChange={(e) => setNamaSantri(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0d9488] p-3 text-xs font-semibold rounded-xl mt-1 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-[8px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Pilih Halaqah / Kelas <span className="text-rose-500">*</span></label>
                  <select required value={selectedKelas} onChange={(e) => setSelectedKelas(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0d9488] p-3 text-xs font-semibold rounded-xl mt-1 outline-none transition-colors cursor-pointer">
                    <option value="">-- Pilih Kelas --</option>
                    {kelasList.map(k => <option key={k.id_kelas} value={k.nama_kelas}>Kelas {k.nama_kelas}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Nama Orang Tua / Wali <span className="text-rose-500">*</span></label>
                  <input type="text" required placeholder="Contoh: H. Ahmad Budiman" value={namaOrtu} onChange={(e) => setNamaOrtu(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0d9488] p-3 text-xs font-semibold rounded-xl mt-1 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-[8px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Nomor WhatsApp Orang Tua <span className="text-rose-500">*</span></label>
                  <input type="tel" required placeholder="Contoh: 081234567890" value={waOrtu} onChange={(e) => setWaOrtu(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0d9488] p-3 text-xs font-semibold rounded-xl mt-1 outline-none transition-colors" />
                </div>
                <div className="pt-1">
                  <button type="submit" disabled={isRegisteringLocal}
                    className="w-full bg-gradient-to-r from-[#0d9488] to-[#0f766e] hover:from-[#035388] hover:to-[#0d9488] text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-full shadow-lg shadow-[#0d9488]/20 hover:shadow-[#0d9488]/30 transition-all active:scale-98 cursor-pointer"
                  >{isRegisteringLocal ? 'Memproses...' : 'Kirim Pendaftaran Online'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── STATUS TRACKER ── */}
            <section id="pengumuman-section" className="py-12 px-4 bg-white border-t border-slate-100">
              <div className="max-w-3xl mx-auto text-center space-y-6">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Lacak Status Penerimaan Santri</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">Wali santri dapat memeriksa status pendaftaran dengan mengetikkan nama lengkap anak.</p>
                <div className="bg-[#f5f7fa] p-4 rounded-2xl border border-slate-100 shadow-sm max-w-lg mx-auto">
                  <div className="relative">
                    <input type="text" placeholder="Ketik nama lengkap anak..." value={searchTrackName} onChange={(e) => setSearchTrackName(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-[#0d9488] p-3.5 pl-10 text-xs font-semibold rounded-xl outline-none transition-all shadow-xs" />
                    <Users className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                  {searchTrackName.trim().length >= 2 && (
                    <div className="mt-3 space-y-2.5 text-left">
                      {(() => {
                        const query = searchTrackName.trim().toLowerCase();
                        const fromPendaftaran = pendaftaranList.filter(p => p.nama_santri.toLowerCase().includes(query));
                        const fromSantri = santriList.filter(s => s.nama_santri.toLowerCase().includes(query));
                        const matched = [...fromPendaftaran, ...fromSantri.map(s => ({
                          id_pendaftaran: s.id_santri,
                          nama_santri: s.nama_santri,
                          nama_ortu: s.username_ortu || '-',
                          halaqah: s.halaqah || '-',
                          status: 'Aktif'
                        }))];
                        if (matched.length === 0) return <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center text-amber-800 text-[9px] font-semibold">Tidak ditemukan data dengan nama "{searchTrackName}".</div>;
                        return matched.map(m => (
                          <div key={m.id_pendaftaran} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                            <div className={`inline-block px-2.5 py-1 text-[8px] font-black rounded-full mb-2.5 ${m.status === 'Aktif' ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'}`}>
                              {m.status === 'Aktif' ? '✓ Diterima' : '⏳ Diproses'}
                            </div>
                            <h4 className="font-extrabold text-sm text-slate-900">{m.nama_santri}</h4>
                            <p className="text-[9px] text-slate-500">Ortu: {m.nama_ortu} | Kelas: {m.halaqah || '-'}</p>
                            {m.status === 'Aktif' && <p className="text-[9px] text-teal-700 mt-1.5 font-bold">Alhamdulillah! Dinyatakan LULUS / DITERIMA 🎉</p>}
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ── FAQ ── */}
      <section id="faq-section" className="py-12 px-4 bg-[#f5f7fa]">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-lg font-black text-slate-800 text-center mb-8">Pertanyaan Umum (FAQ)</h3>
          <div className="space-y-2.5">
            {[
              { q: 'Apakah pendaftaran bisa dilakukan secara online?', a: 'Ya. Calon wali santri dapat mengisi formulir pendaftaran secara online melalui website TPQ ini.' },
              { q: 'Bagaimana proses setelah formulir pendaftaran dikirim?', a: 'Data pendaftaran akan diverifikasi oleh admin TPQ dan hasilnya akan diumumkan melalui halaman Lacak Status Penerimaan.' },
              { q: 'Bagaimana wali santri mendapatkan informasi perkembangan anak?', a: 'Wali santri dapat mengakses Portal Wali untuk melihat informasi akademik, hafalan, kehadiran, dan pengumuman.' }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <button type="button" onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex justify-between items-center p-4 text-left font-extrabold text-xs text-slate-800 hover:bg-slate-50 transition-colors gap-3 cursor-pointer"
                >
                  <span>{idx + 1}. {faq.q}</span>
                  <div className={`w-4 h-4 bg-slate-50 rounded-full flex items-center justify-center shrink-0 border border-slate-200 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}>
                    <ChevronRight className={`w-2.5 h-2.5 text-slate-600 transition-transform ${openFaq === idx ? 'rotate-90' : ''}`} />
                  </div>
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 pt-1 text-[9px] text-slate-500 leading-relaxed font-semibold border-t border-slate-50 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PREMIUM FOOTER ── */}
      <footer className="bg-[#033659] text-slate-400 pt-10 pb-5 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 pb-8 border-b border-white/10">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
                {displayLogo ? (
                  <img src={getCleanImageUrl(displayLogo)} alt={displayName} className="w-6 h-6 object-contain" referrerPolicy="no-referrer"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <BookOpen className="text-[#F5A623] w-3.5 h-3.5" />
                )}
              </div>
              <h4 className="text-[9px] font-black text-white uppercase tracking-wider">{displayName}</h4>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-400">Sistem Manajemen TPQ Modern dengan pendaftaran online terintegrasi, pemantauan hafalan, serta tabungan wadiah amanah.</p>
          </div>
          <div>
            <h4 className="text-[9px] font-black text-white uppercase tracking-widest mb-3">Navigasi</h4>
            <ul className="space-y-1.5 text-[10px]">
              <li><a href="#hero-section" className="hover:text-white transition-colors" onClick={() => scrollToSection('hero-section')}>Beranda</a></li>
              <li><a href="#program-section" className="hover:text-white transition-colors" onClick={() => scrollToSection('program-section')}>Program</a></li>
              <li><a href="#pendaftaran-section" className="hover:text-white transition-colors" onClick={() => scrollToSection('pendaftaran-section')}>Pendaftaran</a></li>
            </ul>
          </div>
          <div>
                      <h4 className="text-[9px] font-black text-white uppercase tracking-widest mb-3">Pimpinan</h4>
                      <p className="text-[8px] text-white font-bold leading-snug line-clamp-2 whitespace-normal">{pengaturan.nama_pimpinan || 'Ustadz / Pengasuh'}</p>
                      <p className="text-[8px] text-slate-400 mt-0.5">Kepala Sekolah / Mudir TPQ</p>
                    </div>
        </div>
        <div className="max-w-5xl mx-auto pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[8px] uppercase tracking-widest font-black text-slate-500">
          <span>© {new Date().getFullYear()} {displayName} • ALL RIGHTS RESERVED</span>
          <a href="https://www.tiktok.com/@coday996" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">Powered by Codday996 Solution's</a>
        </div>
      </footer>

      {/* ── FLOATING WHATSAPP ── */}
      <a href={getWhatsAppFloatLink()} target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#0d9488] hover:bg-[#035388] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center gap-2 group cursor-pointer border border-white/10"
        title="Hubungi Admin TPQ (WhatsApp)"
      >
        <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out text-xs font-black uppercase tracking-wider">Hubungi Kami</span>
      </a>
    </div>
  );
}