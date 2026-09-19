import React, { useState } from 'react';
import { Search, Copy, Check, BookOpen } from 'lucide-react';

interface Doa {
  id: string;
  judul: string;
  arab: string;
  latin: string;
  arti: string;
  dalil: string;
}

const DOA_DATA: Doa[] = [
  {
    id: 'doa-1',
    judul: 'Doa Sebelum Makan',
    arab: 'بِسْمِ اللَّهِ',
    latin: 'Bismillaah',
    arti: 'Dengan nama Allah (aku makan).',
    dalil: 'HR. Bukhari no. 5376 dan Muslim no. 2022'
  },
  {
    id: 'doa-2',
    judul: 'Doa Setelah Makan',
    arab: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ',
    latin: 'Alhamdulillaahilladzii ath\'amanaa wa saqaanaa wa ja\'alanaa muslimiin.',
    arti: 'Segala puji bagi Allah yang telah memberi kami makan dan minum serta menjadikan kami umat Islam.',
    dalil: 'HR. Abu Dawud no. 3850 dan Tirmidzi no. 3457'
  },
  {
    id: 'doa-3',
    judul: 'Doa Sebelum Tidur',
    arab: 'بِاسْمِكَ اللَّهُمَّ أَحْيَا وَأَمُوتُ',
    latin: 'Bismika allaahumma ahyaa wa amuutu.',
    arti: 'Dengan nama-Mu ya Allah, aku hidup dan aku mati.',
    dalil: 'HR. Bukhari no. 6320 dan Muslim no. 2711'
  },
  {
    id: 'doa-4',
    judul: 'Doa Bangun Tidur',
    arab: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    latin: 'Alhamdulillaahilladzii ahyaanaa ba\'da maa amaatanaa wa ilaihin-nusyuur.',
    arti: 'Segala puji bagi Allah yang telah menghidupkan kami setelah mematikan kami, dan kepada-Nya lah tempat kembali.',
    dalil: 'HR. Bukhari no. 6312 dan Muslim no. 2711'
  },
  {
    id: 'doa-5',
    judul: 'Doa Masuk Masjid',
    arab: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    latin: 'Allaahummaftah-lii abwaaba rahmatik.',
    arti: 'Ya Allah, bukakanlah bagiku pintu-pintu rahmat-Mu.',
    dalil: 'HR. Muslim no. 713'
  },
  {
    id: 'doa-6',
    judul: 'Doa Keluar Masjid',
    arab: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
    latin: 'Allaahumma innii as\'aluka min fadhlik.',
    arti: 'Ya Allah, sesungguhnya aku memohon keutamaan dari-Mu.',
    dalil: 'HR. Muslim no. 713'
  },
  {
    id: 'doa-7',
    judul: 'Doa Memakai Pakaian',
    arab: 'الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا الثَّوْبَ وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
    latin: 'Alhamdulillaahilladzii kasaanii haadzats-tsaoba wa razaqaniihi min ghairi haulin minnii wa laa quwwatin.',
    arti: 'Segala puji bagi Allah yang telah memakaikan pakaian ini kepadaku dan memberi rezeki kepadaku tanpa daya dan kekuatan dariku.',
    dalil: 'HR. Abu Dawud no. 4023 dan Tirmidzi no. 3560'
  },
  {
    id: 'doa-8',
    judul: 'Doa Sebelum Masuk Kamar Mandi',
    arab: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ',
    latin: 'Allaahumma innii a\'uudzubika minal khubutsi wal khabaa\'its.',
    arti: 'Ya Allah, aku berlindung kepada-Mu dari setan laki-laki dan setan perempuan.',
    dalil: 'HR. Bukhari no. 142 dan Muslim no. 375'
  }
];

export default function DoaList({ onBack }: { onBack?: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredDoa = DOA_DATA.filter(doa =>
    doa.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doa.latin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doa.arti.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = (doa: Doa) => {
    const textToCopy = `${doa.judul}\n\n${doa.arab}\n\n${doa.latin}\n\nArtinya: "${doa.arti}"\n\nDalil: (${doa.dalil})`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(doa.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-100 overflow-hidden">
      {/* Sticky Header - seragam admin Kelas */}
      <div className="w-full shrink-0 bg-white sticky top-0 z-50">
        {/* Teal header dengan curved bottom */}
        <div className="bg-teal-600 text-white pt-3 pb-7 px-5 relative overflow-hidden shadow-[0_4px_20px_rgba(13,75,69,0.12)]" style={{ borderBottomLeftRadius: '50% 10px', borderBottomRightRadius: '50% 10px' }}>
          {/* Radial light glow effect */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

          {/* Back button + Title row */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer btn-active shrink-0"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                </button>
              )}

              <div className="text-left min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <p className="text-amber-300 text-[10px] font-black uppercase tracking-widest leading-none">
                    DOA & ADAB SUNNAH
                  </p>
                  <span className="w-3.5 h-3.5 bg-teal-500 rounded-full flex items-center justify-center text-white p-0.5 shadow-xs shrink-0" title="Shahih">
                    <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                  </span>
                </div>
                <h3 className="text-[13px] font-bold tracking-tight text-white leading-snug truncate">
                  Kumpulan Doa Harian Shahih
                </h3>
              </div>
            </div>

            {/* Date capsule */}
            <div className="bg-white/15 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[9px] font-bold text-white border border-white/10 shadow-3xs shrink-0">
              <BookOpen className="w-3 h-3 text-amber-300" />
              <span>Shahih</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative -mt-5 pb-2 bg-transparent">
          <div className="mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Cari doa harian..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200/60 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 placeholder:text-slate-400 text-slate-700 transition-all shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 no-scrollbar">
        {filteredDoa.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 font-semibold text-xs py-12 mt-3">
            Doa "{searchTerm}" tidak ditemukan.
          </div>
        ) : (
          filteredDoa.map((doa) => (
            <div
              key={doa.id}
              className="bg-white rounded-2xl border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 overflow-hidden relative"
            >
              {/* Top accent strip */}
              <div className="h-1 bg-gradient-to-r from-teal-500 via-teal-500 to-teal-600" />

              <div className="p-4">
                {/* Header with copy button */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-black text-xs text-slate-800 uppercase tracking-wide leading-snug">{doa.judul}</h4>
                      <span className="text-[7px] font-bold px-1.5 py-0.5 bg-teal-50 text-teal-700 border border-teal-100 rounded-full font-mono uppercase tracking-wider whitespace-nowrap">
                        Shahih
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(doa)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                      copiedId === doa.id
                        ? 'bg-teal-50 border-teal-200 text-teal-600'
                        : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                    }`}
                    title={copiedId === doa.id ? 'Tersalin' : 'Salin doa'}
                  >
                    {copiedId === doa.id ? <Check className="w-3 h-3 stroke-[3]" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>

                {/* Arabic text */}
                <div className="mt-3 bg-gradient-to-r from-slate-50 to-white p-3.5 rounded-xl border border-slate-100/80 text-right">
                  <p className="font-serif text-lg font-bold text-slate-800 leading-loose select-all" dir="rtl">
                    {doa.arab}
                  </p>
                </div>

                {/* Latin & Arti */}
                <div className="mt-3 space-y-1">
                  <p className="text-[10.5px] italic text-slate-500 font-medium leading-relaxed">
                    "{doa.latin}"
                  </p>
                  <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                    Artinya: <span className="font-medium text-slate-600">"{doa.arti}"</span>
                  </p>
                </div>

                {/* Dalil */}
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                    Dalil: <span className="text-slate-500 font-medium normal-case tracking-normal">{doa.dalil}</span>
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
