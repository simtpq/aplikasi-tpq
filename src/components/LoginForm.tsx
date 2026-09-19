import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, Building, GraduationCap, ArrowLeft, RefreshCw, X } from 'lucide-react';
import { Pengaturan } from '../types';

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

interface LoginFormProps {
  onLogin: (type: 'ustadz' | 'wali', field1: string, field2: string) => Promise<string | null>;
  pengaturan: Pengaturan;
  lembagaList?: { username: string; nama_lembaga: string; link_appscript: string; status: string; code_tpq?: string }[];
  onBackToLanding?: () => void;
}

export default function LoginForm({ onLogin, pengaturan, onBackToLanding }: LoginFormProps) {
  const [activeRole, setActiveRole] = useState<'ustadz' | 'wali' | null>('ustadz');
  const [displayRole, setDisplayRole] = useState<'ustadz' | 'wali'>('ustadz');

  // States for Ustadz/Admin form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // States for Wali Santri form
  const [namaSantri, setNamaSantri] = useState('');
  const [nis, setNis] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelectRole = (role: 'ustadz' | 'wali') => {
    setActiveRole(role);
    setDisplayRole(role);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRole) return;
    setError(null);
    setLoading(true);

    try {
      let errMessage: string | null = null;
      if (activeRole === 'ustadz') {
        errMessage = await onLogin('ustadz', username.trim(), password.trim());
      } else {
        errMessage = await onLogin('wali', namaSantri.trim(), nis.trim());
      }

      if (errMessage) {
        setError(errMessage);
      }
    } catch (err) {
      setError('Sistem otentikasi sedang mengalami gangguan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  const namaLembaga = pengaturan.nama_lembaga || "SIM TPQ DIGITAL";

  return (
    <div className="min-h-[100dvh] w-full relative flex flex-col items-center justify-center overflow-hidden select-none py-12 px-5">
      <img src="/login-bg.svg" alt="" className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none" />

      {onBackToLanding && (
        <button onClick={onBackToLanding} className="fixed top-6 left-6 z-20 flex items-center gap-2 text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
      )}

      <div className="relative z-10 w-full max-w-[380px]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-[68px] h-[68px] rounded-2xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.25)] flex items-center justify-center mb-4">
            <img referrerPolicy="no-referrer" src={pengaturan.logo ? getCleanImageUrl(pengaturan.logo) : 'https://iili.io/CCbS5Ss.md.png'} alt="SIM TPQ DIGITAL" className="w-10 h-10 object-contain" onError={(e) => { (e.target as HTMLImageElement).src = 'https://iili.io/CCbS5Ss.md.png'; }} />
          </div>
          <h1 className="text-slate-900 font-extrabold text-xl text-center drop-shadow-[0_1px_3px_rgba(255,255,255,0.3)]">{namaLembaga}</h1>
          <div className="w-10 h-0.5 bg-teal-600 rounded-full mt-3" />
          <p className="text-teal-700 font-bold text-[10px] tracking-[0.3em] uppercase mt-3 drop-shadow-[0_1px_2px_rgba(255,255,255,0.3)]">Sistem Akademik Terpadu</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/30 rounded-2xl p-1 mb-5">
          <button type="button" onClick={() => handleSelectRole('ustadz')} className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center ${displayRole === 'ustadz' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'}`}>Ustadz / Admin</button>
          <button type="button" onClick={() => handleSelectRole('wali')} className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center ${displayRole === 'wali' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'}`}>Wali Santri</button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-600 text-[11px] font-semibold rounded-2xl text-center flex items-center justify-center gap-1.5">
            <X className="w-3.5 h-3.5 shrink-0" /><span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {displayRole === 'ustadz' ? (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-white border-0 outline-none pl-11 pr-4 py-3.5 text-sm font-semibold text-slate-800 rounded-2xl shadow-lg placeholder:text-slate-400" placeholder="Masukkan username" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Kata Sandi</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white border-0 outline-none pl-11 pr-12 py-3.5 text-sm font-semibold text-slate-800 rounded-2xl shadow-lg placeholder:text-slate-400" placeholder="Masukkan kata sandi" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-teal-600 outline-none cursor-pointer">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Nama Lengkap Santri</label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="text" value={namaSantri} onChange={(e) => setNamaSantri(e.target.value)} className="w-full bg-white border-0 outline-none pl-11 pr-4 py-3.5 text-sm font-semibold text-slate-800 rounded-2xl shadow-lg placeholder:text-slate-400" placeholder="Masukkan nama lengkap santri" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">NIS (Nomor Induk Santri)</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="text" value={nis} onChange={(e) => setNis(e.target.value)} className="w-full bg-white border-0 outline-none pl-11 pr-4 py-3.5 text-sm font-semibold text-slate-800 rounded-2xl shadow-lg placeholder:text-slate-400" placeholder="Masukkan NIS santri" required />
                </div>
              </div>
            </>
          )}

          <button type="submit" disabled={loading} className={`w-full mt-6 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-extrabold py-3.5 rounded-2xl shadow-lg transition-all flex justify-center items-center gap-2 cursor-pointer uppercase tracking-wide text-sm ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
            {loading ? <><RefreshCw className="w-4 h-4 animate-spin" />Memproses...</> : 'Masuk'}
          </button>
        </form>

        <p className="text-center text-slate-500 text-[10px] font-semibold tracking-[0.15em] uppercase mt-8">
          &copy; {new Date().getFullYear()} HYDRA CORE DIGITECH
        </p>
      </div>
    </div>
  );
}
