import React, { useState } from 'react';
import {
  Coins,
  ChevronLeft,
  DollarSign,
  Briefcase,
  HelpCircle,
  TrendingUp,
  Percent,
  Wheat,
  ShoppingBag,
  Info,
  CheckCircle2,
  AlertCircle,
  BookOpen
} from 'lucide-react';

interface ZakatCalculatorProps {
  onBack?: () => void;
  formatRupiah: (val: number) => string;
}

export default function ZakatCalculator({ onBack, formatRupiah }: ZakatCalculatorProps) {
  // Tabs: 'fitrah' | 'profesi' | 'maal' | 'pertanian' | 'perdagangan'
  const [activeSubTab, setActiveSubTab] = useState<'fitrah' | 'profesi' | 'maal' | 'pertanian' | 'perdagangan'>('fitrah');

  // Input states
  // 1. Zakat Fitrah
  const [fitrahJiwa, setFitrahJiwa] = useState<string>('1');
  const [fitrahHargaBeras, setFitrahHargaBeras] = useState<string>('15000'); // default price per kg

  // 2. Zakat Profesi (Penghasilan)
  const [profesiGaji, setProfesiGaji] = useState<string>('8000000');
  const [profesiBonus, setProfesiBonus] = useState<string>('0');
  const [profesiHutang, setProfesiHutang] = useState<string>('0');
  const [profesiNisabMode, setProfesiNisabMode] = useState<'per-bulan' | 'per-tahun'>('per-bulan');

  // 3. Zakat Maal (Savings / Gold / Silver)
  const [maalTabungan, setMaalTabungan] = useState<string>('100000000');
  const [maalEmasGrams, setMaalEmasGrams] = useState<string>('0');
  const [maalPerakGrams, setMaalPerakGrams] = useState<string>('0');
  const [maalEmasHarga, setMaalEmasHarga] = useState<string>('1400000'); // price per gram gold
  const [maalPerakHarga, setMaalPerakHarga] = useState<string>('20000');  // price per gram silver

  // 4. Zakat Pertanian (Agriculture crops)
  const [tanianHasilKg, setTanianHasilKg] = useState<string>('800');
  const [tanianHargaCrop, setTanianHargaCrop] = useState<string>('12000'); // price of grain per kg
  const [tanianIrigasi, setTanianIrigasi] = useState<'tadah-hujan' | 'berbayar'>('tadah-hujan');

  // 5. Zakat Perdagangan (Trade Asset)
  const [dagangModalLog, setDagangModalLog] = useState<string>('150000000');
  const [dagangBarang, setDagangBarang] = useState<string>('50000000');
  const [dagangPiutang, setDagangPiutang] = useState<string>('10000000');
  const [dagangHutang, setDagangHutang] = useState<string>('20000000');

  // Static constants for Nisabs
  const NISAB_GOLD_GRAMS = 85; 
  const NISAB_SILVER_GRAMS = 595;
  const NISAB_GRAIN_RICE_KG = 653; // Nisab Pertanian (5 Wasaq)

  // Calculations
  // 1. FITRAH
  const totalFitrahRiceKg = Number(fitrahJiwa) * 2.5;
  const totalFitrahCash = Number(fitrahJiwa) * 2.5 * Number(fitrahHargaBeras);

  // 2. PROFESI
  const totalProfesiRevenue = Number(profesiGaji) + Number(profesiBonus) - Number(profesiHutang);
  // Monthly Nisab of salary equivalent to value of 522 kg of rice (Standard LAZISNU / MUI)
  const monthlyNisabProfesi = 522 * Number(fitrahHargaBeras); 
  const isProfesiReachNisab = totalProfesiRevenue >= monthlyNisabProfesi;
  const totalProfesiZakat = isProfesiReachNisab ? Math.round(totalProfesiRevenue * 0.025) : 0;

  // 3. MAAL
  const goldValue = Number(maalEmasGrams) * Number(maalEmasHarga);
  const silverValue = Number(maalPerakGrams) * Number(maalPerakHarga);
  const totalMaalAssets = Number(maalTabungan) + goldValue + silverValue;
  // Nisab Maal equivalent to value of 85 grams of gold
  const nisabMaalRupiah = NISAB_GOLD_GRAMS * Number(maalEmasHarga);
  const isMaalReachNisab = totalMaalAssets >= nisabMaalRupiah;
  const totalMaalZakat = isMaalReachNisab ? Math.round(totalMaalAssets * 0.025) : 0;

  // 4. PERTANIAN
  // Pertanian rate: 10% for natural rainfall, 5% for pumping/electric irrigation
  const pertanianRate = tanianIrigasi === 'tadah-hujan' ? 0.10 : 0.05;
  const tanianWeigth = Number(tanianHasilKg);
  const isTanianReachNisab = tanianWeigth >= NISAB_GRAIN_RICE_KG;
  const totalTanianZakatKg = isTanianReachNisab ? Math.round(tanianWeigth * pertanianRate) : 0;
  const totalTanianZakatCash = isTanianReachNisab ? Math.round(tanianWeigth * Number(tanianHargaCrop) * pertanianRate) : 0;

  // 5. PERDAGANGAN
  const totalDagangNetAssets = Number(dagangModalLog) + Number(dagangBarang) + Number(dagangPiutang) - Number(dagangHutang);
  // Nisab Perdagangan is equivalent to 85 grams of gold
  const nisabDagangRupiah = NISAB_GOLD_GRAMS * Number(maalEmasHarga);
  const isDagangReachNisab = totalDagangNetAssets >= nisabDagangRupiah;
  const totalDagangZakat = isDagangReachNisab ? Math.round(totalDagangNetAssets * 0.025) : 0;

  return (
    <div className="flex flex-col h-full bg-slate-50 relative pb-24 select-text animate-fadeIn">
      {/* Header Bar: CLEAN MODERN MINIMALIST */}
      <div className="bg-white text-slate-800 pt-[calc(10px+env(safe-area-inset-top,20px))] pb-3 px-4 flex items-center justify-between border-b border-slate-200 shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-3 text-left">
          {onBack && (
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5 leading-none">
              <span>Zakat NU</span>
              <span className="text-[8px] font-sans text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 font-bold uppercase">LAZISNU-Std</span>
            </h2>
          </div>
        </div>
        <Coins className="w-4 h-4 text-orange-500" />
      </div>

      {/* SELECT DROPDOWN FOR CATEGORIES */}
      <div className="bg-white border-b border-slate-100 p-4 shrink-0">
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Pilih Kategori Zakat</label>
        <select
          value={activeSubTab}
          onChange={(e) => setActiveSubTab(e.target.value as any)}
          className="w-full bg-slate-50 border border-slate-200 focus:border-teal-700 focus:bg-white rounded-xl px-4 py-3 text-xs font-bold text-teal-800 outline-none transition-all cursor-pointer shadow-sm align-middle"
        >
          <option value="fitrah">🌾 Zakat Fitrah Harian</option>
          <option value="profesi">💼 Zakat Profesi / Penghasilan</option>
          <option value="maal">💰 Zakat Ma'al / Tabungan & Emas</option>
          <option value="pertanian">🌾 Zakat Pertanian / Hasil Bumi</option>
          <option value="perdagangan">🏪 Zakat Perniagaan / Perdagangan</option>
        </select>
      </div>

      {/* COMPONENT SCROLL BODY */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 text-left">
        
        {/* TAB 1: FITRAH */}
        {activeSubTab === 'fitrah' && (
          <div className="space-y-4">
            <div className="bg-teal-800/10 border-l-4 border-teal-700 p-4 rounded-r-2xl space-y-1">
              <h4 className="text-xs font-bold text-teal-900 flex items-center gap-1.5 font-serif">
                <BookOpen className="w-3.5 h-3.5 text-teal-800" />
                <span>Syarat & Kewajiban Zakat Fitrah</span>
              </h4>
              <p className="text-[10px] text-slate-600 leading-relaxed">
                Zakat Fitrah disandarkan langsung pada penutupan bulan suci Ramadhan, wajib dikeluarkan oleh setiap muslim (baligh, merdeka, mampu) berupa beras atau bahan makanan pokok sebanyak <strong>2.5 kg atau 3.5 liter per jiwa</strong>. NU Care-LAZISNU memperbolehkan konversi uang sesuai harga beras pokok yang biasa dimakan.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Jumlah Jiwa yang Ditanggung:</label>
                <div className="relative">
                  <input
                    type="number"
                    value={fitrahJiwa}
                    min="1"
                    onChange={(e) => setFitrahJiwa(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-teal-700 outline-none text-slate-800"
                    placeholder="Contoh: 4"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">Jiwa (Orang)</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Harga Beras per Kilogram:</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    value={fitrahHargaBeras}
                    onChange={(e) => setFitrahHargaBeras(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-bold focus:ring-2 focus:ring-teal-700 outline-none text-slate-800"
                    placeholder="Contoh: 15000"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">/ kg</span>
                </div>
              </div>
            </div>

            {/* FITRAH RESULTS */}
            <div className="bg-gradient-to-br from-teal-900 to-teal-950 text-white rounded-3xl p-5 border border-amber-300/30 shadow-lg text-center relative overflow-hidden">
              <div className="relative z-10 space-y-3">
                <span className="text-[8px] font-bold uppercase tracking-widest text-amber-300 block">Kalkulasi Hasil Fitrah</span>
                
                <div className="grid grid-cols-2 gap-4 divide-x divide-white/10 pt-2">
                  <div>
                    <span className="text-[9px] text-teal-200 block uppercase font-bold text-center">Beras Pokok</span>
                    <span className="text-xl font-extrabold text-amber-200 mt-1 block">{totalFitrahRiceKg} <span className="text-xs">Kg</span></span>
                  </div>
                  <div>
                    <span className="text-[9px] text-teal-200 block uppercase font-bold text-center">Setara Uang</span>
                    <span className="text-xl font-extrabold text-white mt-1 block">{formatRupiah(totalFitrahCash)}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span className="text-[9px] text-teal-100 font-medium">Sah dikeluarkan sebelum shalat Idul Fitri</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROFESI */}
        {activeSubTab === 'profesi' && (
          <div className="space-y-4">
            <div className="bg-teal-800/10 border-l-4 border-teal-700 p-4 rounded-r-2xl space-y-1">
              <h4 className="text-xs font-bold text-teal-900 flex items-center gap-1.5 font-serif">
                <Briefcase className="w-3.5 h-3.5 text-teal-800" />
                <span>Nisab & Hukum Zakat Profesi</span>
              </h4>
              <p className="text-[10px] text-slate-600 leading-relaxed text-slate-600">
                Zakat Penghasilan dianalogikan terhadap emas/pertanian. Menurut Muktamar NU & Munas Alim Ulama, Nisab bulanan setara dengan harga <strong>522 kg beras</strong>. Jika penghasilan bersih bulanan mencapai batas ini, wajib dipotong <strong>2.5%</strong>.
              </p>
              <div className="pt-1.5 flex items-center gap-1 text-[9px] font-semibold text-teal-800 bg-teal-500/10 px-2 py-1 rounded">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>Nisab Profesi Bulan ini: <strong className="text-amber-800">{formatRupiah(monthlyNisabProfesi)}</strong></span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Gaji Pokok / Penghasilan Bulanan:</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    value={profesiGaji}
                    onChange={(e) => setProfesiGaji(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-bold focus:ring-2 focus:ring-teal-700 outline-none text-slate-800"
                    placeholder="Misal: 7000000"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Bonus, THR, & Pendapatan Lain:</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    value={profesiBonus}
                    onChange={(e) => setProfesiBonus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-bold focus:ring-2 focus:ring-teal-700 outline-none text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Potongan Kebutuhan Pokok / Utang Jatuh Tempo:</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    value={profesiHutang}
                    onChange={(e) => setProfesiHutang(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-bold focus:ring-2 focus:ring-teal-700 outline-none text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* RESULT */}
            <div className={`p-5 rounded-3xl border text-center transition-all shadow-md relative ${
              isProfesiReachNisab 
                ? 'bg-gradient-to-br from-teal-900 to-teal-950 border-amber-300/30 text-white' 
                : 'bg-white border-dashed border-slate-300 text-slate-600'
            }`}>
              <div className="space-y-2">
                <span className="text-[8px] font-bold uppercase tracking-widest block text-amber-300">Hasil Zakat Profesi</span>
                
                <div className="text-xs font-bold mt-1">
                  Penghasilan Bersih: <span className="text-amber-200 text-sm">{formatRupiah(totalProfesiRevenue)}</span>
                </div>

                {isProfesiReachNisab ? (
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider block text-teal-300">WAJIB MENUNAIKAN ZAKAT (2.5%)</span>
                    <span className="text-2xl font-black text-white tracking-wide block">{formatRupiah(totalProfesiZakat)}</span>
                    <p className="text-[9px] text-teal-200 italic">Sudah melampaui Nisab bulanan ({formatRupiah(monthlyNisabProfesi)})</p>
                  </div>
                ) : (
                  <div className="pt-2 flex flex-col items-center">
                    <AlertCircle className="w-5 h-5 text-amber-500 mb-1" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">BELUM WAJIB ZAKAT (Hanya Sunnah Infak/Sedekah)</span>
                    <p className="text-[9px] text-slate-400 mt-1">Penghasilan Anda belum mencapai Nisab bulanan senilai {formatRupiah(monthlyNisabProfesi)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MAAL / SAVINGS */}
        {activeSubTab === 'maal' && (
          <div className="space-y-4">
            <div className="bg-teal-800/10 border-l-4 border-teal-700 p-4 rounded-r-2xl space-y-1">
              <h4 className="text-xs font-bold text-teal-900 flex items-center gap-1.5 font-serif">
                <DollarSign className="w-3.5 h-3.5 text-teal-800" />
                <span>Nisab & Ketentuan Zakat Mal (Harta)</span>
              </h4>
              <p className="text-[10px] text-slate-600 leading-relaxed text-slate-600">
                Mencakup simpanan uang, tabungan, aset finansial, serta emas dan perak yang mengendap selama 1 tahun qamariyah (Haul). Batas nisab setara <strong>85 gram emas murni</strong>. Tarif zakat adalah <strong>2.5%</strong>.
              </p>
              <div className="pt-1.5 flex items-center gap-1 text-[9px] font-semibold text-teal-800 bg-teal-500/10 px-2 py-1 rounded">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>Nisab Emas ({NISAB_GOLD_GRAMS}g) Hari ini: <strong className="text-amber-800">{formatRupiah(nisabMaalRupiah)}</strong></span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Simpanan Uang / Tabungan / Giro / Deposito:</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    value={maalTabungan}
                    onChange={(e) => setMaalTabungan(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-bold focus:ring-2 focus:ring-teal-700 outline-none text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Emas Simpanan (g):</label>
                  <input
                    type="number"
                    value={maalEmasGrams}
                    onChange={(e) => setMaalEmasGrams(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-bold focus:ring-2 focus:ring-teal-700 outline-none text-slate-800"
                    placeholder="Gram"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Perak Simpanan (g):</label>
                  <input
                    type="number"
                    value={maalPerakGrams}
                    onChange={(e) => setMaalPerakGrams(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-bold focus:ring-2 focus:ring-teal-700 outline-none text-slate-800"
                    placeholder="Gram"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                <div>
                  <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Harga 1g Emas (Rp):</label>
                  <input
                    type="number"
                    value={maalEmasHarga}
                    onChange={(e) => setMaalEmasHarga(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-[11px] font-semibold focus:ring-1 focus:ring-teal-700 outline-none text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Harga 1g Perak (Rp):</label>
                  <input
                    type="number"
                    value={maalPerakHarga}
                    onChange={(e) => setMaalPerakHarga(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-[11px] font-semibold focus:ring-1 focus:ring-teal-700 outline-none text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* RESULTS */}
            <div className={`p-5 rounded-3xl border text-center transition-all shadow-md relative ${
              isMaalReachNisab 
                ? 'bg-gradient-to-br from-teal-900 to-teal-950 border-amber-300/30 text-white' 
                : 'bg-white border-dashed border-slate-300 text-slate-600'
            }`}>
              <div className="space-y-2">
                <span className="text-[8px] font-bold uppercase tracking-widest block text-amber-300">Hasil Kalkulasi Mal (Haul)</span>
                
                <div className="text-xs font-bold mt-1">
                  Total Harta Terhitung: <span className="text-amber-200 text-sm">{formatRupiah(totalMaalAssets)}</span>
                </div>

                {isMaalReachNisab ? (
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider block text-teal-300">WAJIB MENUNAIKAN ZAKAT (2.5%)</span>
                    <span className="text-2xl font-black text-white tracking-wide block">{formatRupiah(totalMaalZakat)}</span>
                    <p className="text-[9px] text-teal-200 italic">Nilai tabungan melampaui Nisab 85g Emas ({formatRupiah(nisabMaalRupiah)})</p>
                  </div>
                ) : (
                  <div className="pt-2 flex flex-col items-center">
                    <AlertCircle className="w-5 h-5 text-amber-500 mb-1" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">BELUM WAJIB ZAKAT MAL</span>
                    <p className="text-[9px] text-slate-400 mt-1">Harta tabungan belum mencapai Nisab minimal senilai {formatRupiah(nisabMaalRupiah)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PERTANIAN */}
        {activeSubTab === 'pertanian' && (
          <div className="space-y-4">
            <div className="bg-teal-800/10 border-l-4 border-teal-700 p-4 rounded-r-2xl space-y-1">
              <h4 className="text-xs font-bold text-teal-900 flex items-center gap-1.5 font-serif">
                <Wheat className="w-3.5 h-3.5 text-teal-800" />
                <span>Nisab & Kadar Zakat Sawah / Pertanian</span>
              </h4>
              <p className="text-[10px] text-slate-600 leading-relaxed text-slate-600">
                Wajib dikeluarkan saat panen jika mencapai nisab 5 Wasaq (<strong>653 kg beras / gabah kering</strong>). Tarif zakat dibedakan berdasarkan metode pengairannya:
              </p>
              <ul className="text-[10px] pl-4 list-disc text-slate-650 space-y-0.5 font-sans font-medium">
                <li>Menggunakan air hujan / sungai alami: tarif <strong>10%</strong>.</li>
                <li>Sistem irigasi pompa / beli air buatan: tarif <strong>5%</strong>.</li>
              </ul>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Hasil Panen Gabah / Beras Pokok:</label>
                <div className="relative">
                  <input
                    type="number"
                    value={tanianHasilKg}
                    onChange={(e) => setTanianHasilKg(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-teal-700 outline-none text-slate-800"
                    placeholder="Contoh: 800"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">Kilogram (Kg)</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Estimasi Harga Jual per Kilogram (Rp):</label>
                <input
                  type="number"
                  value={tanianHargaCrop}
                  onChange={(e) => setTanianHargaCrop(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-teal-700 outline-none text-slate-800"
                  placeholder="Estimasi harga per kg"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Penyediaan Air (Metode Irigasi):</label>
                <div className="grid grid-cols-2 gap-3 mt-1.5">
                  <button
                    onClick={() => setTanianIrigasi('tadah-hujan')}
                    className={`py-2 px-3.5 rounded-xl border-2 text-[10px] font-extrabold uppercase transition-all tracking-wide ${
                      tanianIrigasi === 'tadah-hujan'
                        ? 'bg-teal-500/10 border-teal-700 text-teal-800'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    Hujan / Alami (10%)
                  </button>
                  <button
                    onClick={() => setTanianIrigasi('berbayar')}
                    className={`py-2 px-3.5 rounded-xl border-2 text-[10px] font-extrabold uppercase transition-all tracking-wide ${
                      tanianIrigasi === 'berbayar'
                        ? 'bg-teal-500/10 border-teal-700 text-teal-800'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    Irigasi Pompa (5%)
                  </button>
                </div>
              </div>
            </div>

            {/* RESULTS */}
            <div className={`p-5 rounded-3xl border text-center transition-all shadow-md relative ${
              isTanianReachNisab 
                ? 'bg-gradient-to-br from-teal-900 to-teal-950 border-amber-300/30 text-white' 
                : 'bg-white border-dashed border-slate-300 text-slate-600'
            }`}>
              <div className="space-y-2">
                <span className="text-[8px] font-bold uppercase tracking-widest block text-amber-300">Hasil Zakat Hasil Sawah</span>
                
                <div className="text-xs font-bold mt-1">
                  Suhu Panen: <span className="text-amber-200 text-sm">{tanianHasilKg} Kg</span> (Harga: {formatRupiah(Number(tanianHasilKg) * Number(tanianHargaCrop))})
                </div>

                {isTanianReachNisab ? (
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider block text-teal-300">WAJIB MENUNAIKAN ZAKAT ({pertanianRate * 100}%)</span>
                    
                    <div className="grid grid-cols-2 gap-4 divide-x divide-white/10 pt-1">
                      <div>
                        <span className="text-[8px] text-teal-200 block uppercase font-bold text-center">Bentuk Gabah</span>
                        <span className="text-lg font-extrabold text-amber-200 mt-1 block">{totalTanianZakatKg} <span className="text-xs">Kg</span></span>
                      </div>
                      <div>
                        <span className="text-[8px] text-teal-200 block uppercase font-bold text-center">Rupiah Setara</span>
                        <span className="text-lg font-extrabold text-white mt-1 block">{formatRupiah(totalTanianZakatCash)}</span>
                      </div>
                    </div>

                    <p className="text-[9px] text-teal-200 italic mt-2.5">Telah melampaui nisab pertanian ({NISAB_GRAIN_RICE_KG} Kg)</p>
                  </div>
                ) : (
                  <div className="pt-2 flex flex-col items-center">
                    <AlertCircle className="w-5 h-5 text-amber-500 mb-1" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">BELUM WAJIB ZAKAT PANEN</span>
                    <p className="text-[9px] text-slate-400 mt-1">Hasil panen ({tanianHasilKg} kg) belum melampaui ketetapan maqom nisab {NISAB_GRAIN_RICE_KG} kg.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PERDAGANGAN */}
        {activeSubTab === 'perdagangan' && (
          <div className="space-y-4">
            <div className="bg-teal-800/10 border-l-4 border-teal-700 p-4 rounded-r-2xl space-y-1">
              <h4 className="text-xs font-bold text-teal-950 flex items-center gap-1.5 font-serif">
                <ShoppingBag className="w-3.5 h-3.5 text-teal-800" />
                <span>Nisab & Ketentuan Zakat Toko / Niaga</span>
              </h4>
              <p className="text-[10px] text-slate-600 leading-relaxed text-slate-650">
                Berlaku untuk badan usaha atau toko usaha dagangan pribadi yang berjalan 1 tahun (haul). Nisab setara dengan <strong>85 gram emas murni</strong>. Dihitung dengan rumus:
              </p>
              <div className="p-2 border border-teal-100 bg-white rounded-lg text-[9px] text-teal-900 font-mono text-center">
                (Modal Aktif + Stok Barang + Piutang Dagang - Hutang Toko) * 2.5%
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm space-y-3">
              <div>
                <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Uang Kas Usaha / Modal Berputar:</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-450">Rp</span>
                  <input
                    type="number"
                    value={dagangModalLog}
                    onChange={(e) => setDagangModalLog(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-8 pr-4 text-xs font-bold focus:ring-2 focus:ring-teal-700 outline-none text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Nilai Stok Barang Dagangan:</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-450">Rp</span>
                  <input
                    type="number"
                    value={dagangBarang}
                    onChange={(e) => setDagangBarang(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-8 pr-4 text-xs font-bold focus:ring-2 focus:ring-teal-700 outline-none text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Piutang Lancar Tagihan:</label>
                  <input
                    type="number"
                    value={dagangPiutang}
                    onChange={(e) => setDagangPiutang(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold focus:ring-2 focus:ring-teal-700 outline-none text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Hutang Toko:</label>
                  <input
                    type="number"
                    value={dagangHutang}
                    onChange={(e) => setDagangHutang(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold focus:ring-2 focus:ring-teal-700 outline-none text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* RESULTS */}
            <div className={`p-5 rounded-3xl border text-center transition-all shadow-md relative ${
              isDagangReachNisab 
                ? 'bg-gradient-to-br from-teal-900 to-teal-950 border-amber-300/30 text-white' 
                : 'bg-white border-dashed border-slate-300 text-slate-600'
            }`}>
              <div className="space-y-2">
                <span className="text-[8px] font-bold uppercase tracking-widest block text-amber-300">Hasil Zakat Niaga</span>
                
                <div className="text-xs font-bold mt-1">
                  Kekayaan Netto Usaha: <span className="text-amber-200 text-sm">{formatRupiah(totalDagangNetAssets)}</span>
                </div>

                {isDagangReachNisab ? (
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider block text-teal-300">WAJIB MENUNAIKAN ZAKAT (2.5%)</span>
                    <span className="text-2xl font-black text-white tracking-wide block">{formatRupiah(totalDagangZakat)}</span>
                    <p className="text-[9px] text-teal-200 italic">Sudah melampaui Nisab 85g Emas ({formatRupiah(nisabDagangRupiah)})</p>
                  </div>
                ) : (
                  <div className="pt-2 flex flex-col items-center">
                    <AlertCircle className="w-5 h-5 text-amber-500 mb-1" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">BELUM WAJIB ZAKAT NIAGA</span>
                    <p className="text-[9px] text-slate-400 mt-1">Aset lancar bersih usaha niaga Anda belum mencapai nisab setara {formatRupiah(nisabDagangRupiah)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-amber-50 p-4 border border-amber-200 rounded-2xl flex items-start gap-2.5 mt-2">
          <Info className="w-4.5 h-4.5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-[10px] text-slate-600 leading-relaxed text-left">
            <strong>Catatan Shodaqoh Wali:</strong> Jika harta belum mencapai batas Nisab wajib, umat Islam sangat didorong untuk tetap menyucikan harta dengan menyalurkan <strong>Infaq, Shodaqoh, atau Wakaf</strong> melalui pos pengurus TPQ/Lembaga terkait.
          </div>
        </div>
      </div>
    </div>
  );
}
