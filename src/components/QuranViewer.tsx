import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Search,
  Settings,
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
  Sliders,
  Maximize2
} from 'lucide-react';

// list of 114 Quran Surahs with basic metadata for fast client-side rendering & list navigation
export const SURAH_LIST = [
  { nomor: 1, nama: "الفاتحة", nama_latin: "Al-Fatihah", arti: "Pembukaan", jumlah_ayat: 7, tempat_turun: "Mekah" },
  { nomor: 2, nama: "البقرة", nama_latin: "Al-Baqarah", arti: "Sapi Betina", jumlah_ayat: 286, tempat_turun: "Madinah" },
  { nomor: 3, nama: "آل عمران", nama_latin: "Ali 'Imran", arti: "Keluarga 'Imran", jumlah_ayat: 200, tempat_turun: "Madinah" },
  { nomor: 4, nama: "النساء", nama_latin: "An-Nisa'", arti: "Wanita", jumlah_ayat: 176, tempat_turun: "Madinah" },
  { nomor: 5, nama: "المائدة", nama_latin: "Al-Ma'idah", arti: "Hidangan", jumlah_ayat: 120, tempat_turun: "Madinah" },
  { nomor: 6, nama: "الأنعام", nama_latin: "Al-An'am", arti: "Binatang Ternak", jumlah_ayat: 165, tempat_turun: "Mekah" },
  { nomor: 7, nama: "الأعراف", nama_latin: "Al-A'raf", arti: "Tempat yang Tertinggi", jumlah_ayat: 206, tempat_turun: "Mekah" },
  { nomor: 8, nama: "الأنفال", nama_latin: "Al-Anfal", arti: "Rampasan Perang", jumlah_ayat: 75, tempat_turun: "Madinah" },
  { nomor: 9, nama: "التوبة", nama_latin: "At-Taubah", arti: "Pengampunan", jumlah_ayat: 129, tempat_turun: "Madinah" },
  { nomor: 10, nama: "يونس", nama_latin: "Yunus", arti: "Nabi Yunus", jumlah_ayat: 109, tempat_turun: "Mekah" },
  { nomor: 11, nama: "هود", nama_latin: "Hud", arti: "Nabi Hud", jumlah_ayat: 123, tempat_turun: "Mekah" },
  { nomor: 12, nama: "يوسف", nama_latin: "Yusuf", arti: "Nabi Yusuf", jumlah_ayat: 111, tempat_turun: "Mekah" },
  { nomor: 13, nama: "الرعد", nama_latin: "Ar-Ra'd", arti: "Guruh", jumlah_ayat: 43, tempat_turun: "Madinah" },
  { nomor: 14, nama: "إبراهيم", nama_latin: "Ibrahim", arti: "Nabi Ibrahim", jumlah_ayat: 52, tempat_turun: "Mekah" },
  { nomor: 15, nama: "الحجر", nama_latin: "Al-Hijr", arti: "Suku Hijr", jumlah_ayat: 99, tempat_turun: "Mekah" },
  { nomor: 16, nama: "النحل", nama_latin: "An-Nahl", arti: "Lebah", jumlah_ayat: 128, tempat_turun: "Mekah" },
  { nomor: 17, nama: "الإسراء", nama_latin: "Al-Isra'", arti: "Perjalanan Malam", jumlah_ayat: 111, tempat_turun: "Mekah" },
  { nomor: 18, nama: "الكهف", nama_latin: "Al-Kahf", arti: "Penghuni Gua", jumlah_ayat: 110, tempat_turun: "Mekah" },
  { nomor: 19, nama: "مريم", nama_latin: "Maryam", arti: "Maryam", jumlah_ayat: 98, tempat_turun: "Mekah" },
  { nomor: 20, nama: "طه", nama_latin: "Ta Ha", arti: "Thaha", jumlah_ayat: 135, tempat_turun: "Mekah" },
  { nomor: 21, nama: "الأنبياء", nama_latin: "Al-Anbiya'", arti: "Para Nabi", jumlah_ayat: 112, tempat_turun: "Mekah" },
  { nomor: 22, nama: "الحج", nama_latin: "Al-Hajj", arti: "Haji", jumlah_ayat: 78, tempat_turun: "Madinah" },
  { nomor: 23, nama: "المؤمنون", nama_latin: "Al-Mu'minun", arti: "Orang-Orang Mukmin", jumlah_ayat: 118, tempat_turun: "Mekah" },
  { nomor: 24, nama: "النور", nama_latin: "An-Nur", arti: "Cahaya", jumlah_ayat: 64, tempat_turun: "Madinah" },
  { nomor: 25, nama: "الفرقان", nama_latin: "Al-Furqan", arti: "Pembeda", jumlah_ayat: 77, tempat_turun: "Mekah" },
  { nomor: 26, nama: "الشعراء", nama_latin: "Asy-Syu'ara'", arti: "Para Penyair", jumlah_ayat: 227, tempat_turun: "Mekah" },
  { nomor: 27, nama: "النمل", nama_latin: "An-Naml", arti: "Semut", jumlah_ayat: 93, tempat_turun: "Mekah" },
  { nomor: 28, nama: "القصص", nama_latin: "Al-Qasas", arti: "Kisah-Kisah", jumlah_ayat: 88, tempat_turun: "Mekah" },
  { nomor: 29, nama: "العنكبوت", nama_latin: "Al-'Ankabut", arti: "Laba-Laba", jumlah_ayat: 69, tempat_turun: "Mekah" },
  { nomor: 30, nama: "الروم", nama_latin: "Ar-Rum", arti: "Bangsa Romawi", jumlah_ayat: 60, tempat_turun: "Mekah" },
  { nomor: 31, nama: "لقمان", nama_latin: "Luqman", arti: "Luqman", jumlah_ayat: 34, tempat_turun: "Mekah" },
  { nomor: 32, nama: "السجدة", nama_latin: "As-Sajdah", arti: "Sujud", jumlah_ayat: 30, tempat_turun: "Mekah" },
  { nomor: 33, nama: "الأحزاب", nama_latin: "Al-Ahzab", arti: "Golongan yang Bersekutu", jumlah_ayat: 73, tempat_turun: "Madinah" },
  { nomor: 34, nama: "سبأ", nama_latin: "Saba'", arti: "Negeri Saba'", jumlah_ayat: 54, tempat_turun: "Mekah" },
  { nomor: 35, nama: "فاطر", nama_latin: "Fatir", arti: "Pencipta", jumlah_ayat: 45, tempat_turun: "Mekah" },
  { nomor: 36, nama: "يس", nama_latin: "Ya Sin", arti: "Yasin", jumlah_ayat: 83, tempat_turun: "Mekah" },
  { nomor: 37, nama: "الصافات", nama_latin: "As-Saffat", arti: "Barisan-Barisan", jumlah_ayat: 182, tempat_turun: "Mekah" },
  { nomor: 38, nama: "ص", nama_latin: "Sad", arti: "Shad", jumlah_ayat: 88, tempat_turun: "Mekah" },
  { nomor: 39, nama: "الزمر", nama_latin: "Az-Zumar", arti: "Rombongan-Rombongan", jumlah_ayat: 75, tempat_turun: "Mekah" },
  { nomor: 40, nama: "غافر", nama_latin: "Ghafir", arti: "Maha Pengampun", jumlah_ayat: 85, tempat_turun: "Mekah" },
  { nomor: 41, nama: "فصلت", nama_latin: "Fussilat", arti: "Yang Dijelaskan", jumlah_ayat: 54, tempat_turun: "Mekah" },
  { nomor: 42, nama: "الشورى", nama_latin: "Asy-Syura", arti: "Musyawarah", jumlah_ayat: 53, tempat_turun: "Mekah" },
  { nomor: 43, nama: "الزخرف", nama_latin: "Az-Zukhruf", arti: "Perhiasan", jumlah_ayat: 89, tempat_turun: "Mekah" },
  { nomor: 44, nama: "الدخان", nama_latin: "Ad-Dukhan", arti: "Kabut", jumlah_ayat: 59, tempat_turun: "Mekah" },
  { nomor: 45, nama: "الجاشية", nama_latin: "Al-Jasiyah", arti: "Yang Berlutut", jumlah_ayat: 37, tempat_turun: "Mekah" },
  { nomor: 46, nama: "الأحقاف", nama_latin: "Al-Ahqaf", arti: "Bukit-Bukit Pasir", jumlah_ayat: 35, tempat_turun: "Mekah" },
  { nomor: 47, nama: "محمد", nama_latin: "Muhammad", arti: "Nabi Muhammad", jumlah_ayat: 38, tempat_turun: "Madinah" },
  { nomor: 48, nama: "الفتح", nama_latin: "Al-Fath", arti: "Kemenangan", jumlah_ayat: 29, tempat_turun: "Madinah" },
  { nomor: 49, nama: "الحجرات", nama_latin: "Al-Hujurat", arti: "Kamar-Kamar", jumlah_ayat: 18, tempat_turun: "Madinah" },
  { nomor: 50, nama: "ق", nama_latin: "Qaf", arti: "Qaf", jumlah_ayat: 45, tempat_turun: "Mekah" },
  { nomor: 51, nama: "الذاريات", nama_latin: "Az-Zariyat", arti: "Angin yang Menerbangkan", jumlah_ayat: 60, tempat_turun: "Mekah" },
  { nomor: 52, nama: "الطور", nama_latin: "At-Tur", arti: "Bukit", jumlah_ayat: 49, tempat_turun: "Mekah" },
  { nomor: 53, nama: "النجم", nama_latin: "An-Najm", arti: "Bintang", jumlah_ayat: 62, tempat_turun: "Mekah" },
  { nomor: 54, nama: "القمر", nama_latin: "Al-Qamar", arti: "Bulan", jumlah_ayat: 55, tempat_turun: "Mekah" },
  { nomor: 55, nama: "الرحمن", nama_latin: "Ar-Rahman", arti: "Maha Pengasih", jumlah_ayat: 78, tempat_turun: "Madinah" },
  { nomor: 56, nama: "الواقعة", nama_latin: "Al-Waqi'ah", arti: "Hari Kiamat", jumlah_ayat: 96, tempat_turun: "Mekah" },
  { nomor: 57, nama: "الحديد", nama_latin: "Al-Hadid", arti: "Besi", jumlah_ayat: 29, tempat_turun: "Madinah" },
  { nomor: 58, nama: "المجادلة", nama_latin: "Al-Mujadilah", arti: "Wanita yang Mengajukan Gugatan", jumlah_ayat: 22, tempat_turun: "Madinah" },
  { nomor: 59, nama: "الحشر", nama_latin: "Al-Hasyr", arti: "Pengusiran", jumlah_ayat: 24, tempat_turun: "Madinah" },
  { nomor: 60, nama: "الممتحنة", nama_latin: "Al-Mumtahanah", arti: "Wanita yang Diuji", jumlah_ayat: 13, tempat_turun: "Madinah" },
  { nomor: 61, nama: "الصف", nama_latin: "As-Saff", arti: "Barisan", jumlah_ayat: 14, tempat_turun: "Madinah" },
  { nomor: 62, nama: "الجمعة", nama_latin: "Al-Jumu'ah", arti: "Hari Jumat", jumlah_ayat: 11, tempat_turun: "Madinah" },
  { nomor: 63, nama: "المنافقون", nama_latin: "Al-Munafiqun", arti: "Orang-Orang Munafik", jumlah_ayat: 11, tempat_turun: "Madinah" },
  { nomor: 64, nama: "التغابن", nama_latin: "At-Tagabun", arti: "Pengungkapan Kesalahan", jumlah_ayat: 18, tempat_turun: "Madinah" },
  { nomor: 65, nama: "الطلاق", nama_latin: "At-Talaq", arti: "Talak", jumlah_ayat: 12, tempat_turun: "Madinah" },
  { nomor: 66, nama: "التحريم", nama_latin: "At-Tahrim", arti: "Mengharamkan", jumlah_ayat: 12, tempat_turun: "Madinah" },
  { nomor: 67, nama: "الملك", nama_latin: "Al-Mulk", arti: "Kerajaan", jumlah_ayat: 30, tempat_turun: "Mekah" },
  { nomor: 68, nama: "القلم", nama_latin: "Al-Qalam", arti: "Pena", jumlah_ayat: 52, tempat_turun: "Mekah" },
  { nomor: 69, nama: "الحاقة", nama_latin: "Al-Haqqah", arti: "Hari Kiamat yang Pasti", jumlah_ayat: 52, tempat_turun: "Mekah" },
  { nomor: 70, nama: "المعارج", nama_latin: "Al-Ma'arij", arti: "Tempat Naik", jumlah_ayat: 44, tempat_turun: "Mekah" },
  { nomor: 71, nama: "نوح", nama_latin: "Nuh", arti: "Nabi Nuh", jumlah_ayat: 28, tempat_turun: "Mekah" },
  { nomor: 72, nama: "الجن", nama_latin: "Al-Jinn", arti: "Jin", jumlah_ayat: 28, tempat_turun: "Mekah" },
  { nomor: 73, nama: "المزمل", nama_latin: "Al-Muzzammil", arti: "Orang yang Berselimut", jumlah_ayat: 20, tempat_turun: "Mekah" },
  { nomor: 74, nama: "المدثر", nama_latin: "Al-Muddassir", arti: "Orang yang Berkemul", jumlah_ayat: 56, tempat_turun: "Mekah" },
  { nomor: 75, nama: "القيامة", nama_latin: "Al-Qiyamah", arti: "Hari Kiamat", jumlah_ayat: 40, tempat_turun: "Mekah" },
  { nomor: 76, nama: "الإنسان", nama_latin: "Al-Insan", arti: "Manusia", jumlah_ayat: 31, tempat_turun: "Madinah" },
  { nomor: 77, nama: "المرسلات", nama_latin: "Al-Mursalat", arti: "Malaikat yang Diutus", jumlah_ayat: 50, tempat_turun: "Mekah" },
  { nomor: 78, nama: "النبأ", nama_latin: "An-Naba'", arti: "Berita Besar", jumlah_ayat: 40, tempat_turun: "Mekah" },
  { nomor: 79, nama: "النازعات", nama_latin: "An-Nazi'at", arti: "Malaikat yang Mencabut Nyawa", jumlah_ayat: 46, tempat_turun: "Mekah" },
  { nomor: 80, nama: "عبس", nama_latin: "'Abasa", arti: "Dia Bermuka Masam", jumlah_ayat: 42, tempat_turun: "Mekah" },
  { nomor: 81, nama: "التكوير", nama_latin: "At-Takwir", arti: "Penggulungan", jumlah_ayat: 29, tempat_turun: "Mekah" },
  { nomor: 82, nama: "الانفطار", nama_latin: "Al-Infitar", arti: "Terbelah", jumlah_ayat: 19, tempat_turun: "Mekah" },
  { nomor: 83, nama: "المطففين", nama_latin: "Al-Mutaffifin", arti: "Orang-Orang yang Curang", jumlah_ayat: 36, tempat_turun: "Mekah" },
  { nomor: 84, nama: "الانشقاق", nama_latin: "Al-Insyiqaq", arti: "Terbelah", jumlah_ayat: 25, tempat_turun: "Mekah" },
  { nomor: 85, nama: "البروج", nama_latin: "Al-Buruj", arti: "Gugusan Bintang", jumlah_ayat: 22, tempat_turun: "Mekah" },
  { nomor: 86, nama: "الطارق", nama_latin: "At-Tariq", arti: "Yang Datang di Malam Hari", jumlah_ayat: 17, tempat_turun: "Mekah" },
  { nomor: 87, nama: "الأعلى", nama_latin: "Al-A'la", arti: "Yang Maha Tinggi", jumlah_ayat: 19, tempat_turun: "Mekah" },
  { nomor: 88, nama: "الغاشية", nama_latin: "Al-Gasyiyah", arti: "Hari Kiamat yang Menggegerkan", jumlah_ayat: 26, tempat_turun: "Mekah" },
  { nomor: 89, nama: "الفجر", nama_latin: "Al-Fajr", arti: "Fajar", jumlah_ayat: 30, tempat_turun: "Mekah" },
  { nomor: 90, nama: "البلد", nama_latin: "Al-Balad", arti: "Negeri", jumlah_ayat: 20, tempat_turun: "Mekah" },
  { nomor: 91, nama: "الشمس", nama_latin: "Asy-Syams", arti: "Matahari", jumlah_ayat: 15, tempat_turun: "Mekah" },
  { nomor: 92, nama: "الليل", nama_latin: "Al-Lail", arti: "Malam", jumlah_ayat: 21, tempat_turun: "Mekah" },
  { nomor: 93, nama: "الضحى", nama_latin: "Ad-Duha", arti: "Waktu Dhuha", jumlah_ayat: 11, tempat_turun: "Mekah" },
  { nomor: 94, nama: "الشرح", nama_latin: "Asy-Syarh", arti: "Lapang Dada", jumlah_ayat: 8, tempat_turun: "Mekah" },
  { nomor: 95, nama: "التين", nama_latin: "At-Tin", arti: "Buah Tin", jumlah_ayat: 8, tempat_turun: "Mekah" },
  { nomor: 96, nama: "العلق", nama_latin: "Al-'Alaq", arti: "Segumpal Darah", jumlah_ayat: 19, tempat_turun: "Mekah" },
  { nomor: 97, nama: "القدر", nama_latin: "Al-Qadr", arti: "Kemuliaan", jumlah_ayat: 5, tempat_turun: "Mekah" },
  { nomor: 98, nama: "البينة", nama_latin: "Al-Bayyinah", arti: "Bukti Nyata", jumlah_ayat: 8, tempat_turun: "Madinah" },
  { nomor: 99, nama: "الزلزلة", nama_latin: "Az-Zalzalah", arti: "Kegoncangan", jumlah_ayat: 8, tempat_turun: "Madinah" },
  { nomor: 100, nama: "العاديات", nama_latin: "Al-'Adiyat", arti: "Kuda Perang yang Berlari Kencang", jumlah_ayat: 11, tempat_turun: "Mekah" },
  { nomor: 101, nama: "القارعة", nama_latin: "Al-Qari'ah", arti: "Hari Kiamat yang Mengetuk", jumlah_ayat: 11, tempat_turun: "Mekah" },
  { nomor: 102, nama: "التكاثر", nama_latin: "At-Takasur", arti: "Bermegah-Megahan", jumlah_ayat: 8, tempat_turun: "Mekah" },
  { nomor: 103, nama: "العصر", nama_latin: "Al-'Asr", arti: "Demi Masa", jumlah_ayat: 3, tempat_turun: "Mekah" },
  { nomor: 104, nama: "الهمزة", nama_latin: "Al-Humazah", arti: "Pengumpat", jumlah_ayat: 9, tempat_turun: "Mekah" },
  { nomor: 105, nama: "الفيل", nama_latin: "Al-Fil", arti: "Gajah", jumlah_ayat: 5, tempat_turun: "Mekah" },
  { nomor: 106, nama: "قريش", nama_latin: "Quraisy", arti: "Suku Quraisy", jumlah_ayat: 4, tempat_turun: "Mekah" },
  { nomor: 107, nama: "الماعون", nama_latin: "Al-Ma'un", arti: "Barang yang Berguna", jumlah_ayat: 7, tempat_turun: "Mekah" },
  { nomor: 108, nama: "الكوثر", nama_latin: "Al-Kausar", arti: "Nikmat yang Banyak", jumlah_ayat: 3, tempat_turun: "Mekah" },
  { nomor: 109, nama: "الكافرون", nama_latin: "Al-Kafirun", arti: "Orang-Orang Kafir", jumlah_ayat: 6, tempat_turun: "Mekah" },
  { nomor: 110, nama: "النصر", nama_latin: "An-Nasr", arti: "Pertolongan", jumlah_ayat: 3, tempat_turun: "Madinah" },
  { nomor: 111, nama: "المسد", nama_latin: "Al-Lahab", arti: "Sabut / Gejolak Api", jumlah_ayat: 5, tempat_turun: "Mekah" },
  { nomor: 112, nama: "الإخلاص", nama_latin: "Al-Ikhlas", arti: "Ikhlas", jumlah_ayat: 4, tempat_turun: "Mekah" },
  { nomor: 113, nama: "الفلق", nama_latin: "Al-Falaq", arti: "Waktu Subuh", jumlah_ayat: 5, tempat_turun: "Mekah" },
  { nomor: 114, nama: "الناس", nama_latin: "An-Nas", arti: "Manusia", jumlah_ayat: 6, tempat_turun: "Mekah" }
];

// Fallback short surah verse data in case of offline/API failures
const OFFLINE_SURAH_STORE: Record<number, any> = {
  1: {
    nomor: 1,
    namaLatin: "Al-Fatihah",
    nama: "الفاتحة",
    tempatTurun: "Mekah",
    arti: "Pembukaan",
    ayat: [
      { nomorAyat: 1, teksArab: "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ", teksLatin: "Bismillāhir-raḥmānir-raḥīm(i)", teksIndonesia: "Dengan nama Allah Yang Maha Pengasih, Maha Penyayang." },
      { nomorAyat: 2, teksArab: "اَلْحَمْدُ لِلّٰهِ رَبِّ الْعٰلَمِيْنَۙ", teksLatin: "Al-ḥamdu lillāhi rabbil-'ālamīn(a)", teksIndonesia: "Segala puji bagi Allah, Tuhan seluruh alam." },
      { nomorAyat: 3, teksArab: "الرَّحْمٰنِ الرَّحِيْمِۙ", teksLatin: "Ar-raḥmānir-raḥīm(i)", teksIndonesia: "Yang Maha Pengasih, Maha Penyayang," },
      { nomorAyat: 4, teksArab: "مٰلِكِ يَوْمِ الدِّيْنِۗ", teksLatin: "Māliki yaumid-dīn(i)", teksIndonesia: "Pemilik hari pembalasan." },
      { nomorAyat: 5, teksArab: "اِيَّاكَ نَعْبُدُ وَاِيَّاكَ نَسْتَعِيْنُۗ", teksLatin: "Iyyāka na'budu wa iyyāka nasta'īn(u)", teksIndonesia: "Hanya kepada-Mu kami menyembah dan hanya kepada-Mu kami memohon pertolongan." },
      { nomorAyat: 6, teksArab: "اِهْدِنَا الصِّرَاطَ الْمُسْتَقِيْمَۙ", teksLatin: "Ihdinaṣ-ṣirāṭal-mustaqīm(a)", teksIndonesia: "Tunjukkanlah kami jalan yang lurus," },
      { nomorAyat: 7, teksArab: "صِرَاطَ الَّذِيْنَ اَنْعَمْتَ عَلَيْهِمْ ەۙ غَيْرِ الْمَغْضُوْبِ عَلَيْهِمْ وَلَا الضَّۤالِّيْنَۗ", teksLatin: "Ṣirāṭal-laḏīna an'amta 'alayhim gayril-magḍūbi 'alayhim walad-ḍāllīn(a)", teksIndonesia: "(yaitu) jalan orang-orang yang telah Engkau beri nikmat kepadanya; bukan (jalan) mereka yang dimurkai, dan bukan (pula jalan) mereka yang sesat." }
    ]
  },
  112: {
    nomor: 112,
    namaLatin: "Al-Ikhlas",
    nama: "الإخلاص",
    tempatTurun: "Mekah",
    arti: "Ikhlas",
    ayat: [
      { nomorAyat: 1, teksArab: "قُلْ هُوَ اللّٰهُ اَحَدٌۚ", teksLatin: "Qul huwallāhu aḥad(un)", teksIndonesia: "Katakanlah (Muhammad), “Dialah Allah Yang Maha Esa." },
      { nomorAyat: 2, teksArab: "اَللّٰهُ الصَّمَدُۚ", teksLatin: "Allāhuṣ-ṣamad(u)", teksIndonesia: "Allah tempat meminta segala sesuatu." },
      { nomorAyat: 3, teksArab: "لَمْ يَلِدْ وَلَمْ يُولَدْۙ", teksLatin: "Lam yalid wa lam yūlad", teksIndonesia: "Dia tidak beranak dan tidak pula diperanakkan," },
      { nomorAyat: 4, teksArab: "وَلَمْ يَكُنْ لَّهٗ كُفُوًا اَحَدٌ", teksLatin: "Wa lam yakul lahū kufuwan aḥad(un)", teksIndonesia: "dan tidak ada sesuatu yang setara dengan Dia.”" }
    ]
  },
  113: {
    nomor: 113,
    namaLatin: "Al-Falaq",
    nama: "الفلق",
    tempatTurun: "Mekah",
    arti: "Waktu Subuh",
    ayat: [
      { nomorAyat: 1, teksArab: "قُلْ اَعُوْذُ بِرَبِّ الْفَلَقِۙ", teksLatin: "Qul a'ūżu birabbil-falaq(i)", teksIndonesia: "Katakanlah, “Aku berlindung kepada Tuhan yang menguasai subuh (fajar)," },
      { nomorAyat: 2, teksArab: "مِنْ شَرِّ مَا خَلَقَۙ", teksLatin: "Min syarri mā khalaq(a)", teksIndonesia: "dari kejahatan (makhluk yang) Dia ciptakan," },
      { nomorAyat: 3, teksArab: "وَمِنْ شَرِّ غَاسِقٍ اِذَا وَقَبَۙ", teksLatin: "Wa min syarri gāsiqin iżā waqab(a)", teksIndonesia: "dan dari kejahatan malam apabila telah gelap gulita," },
      { nomorAyat: 4, teksArab: "وَمِنْ شَرِّ النَّفّٰثٰتِ فِى الْعُقَدِۙ", teksLatin: "Wa min syarrin-naffāṡāti fil-'uqad(i)", teksIndonesia: "dan dari kejahatan perempuan-perempuan (penyihir) yang meniup pada buhul-buhul (talinya)," },
      { nomorAyat: 5, teksArab: "وَمِنْ شَرِّ حَاسِدٍ اِذَا حَسَدَ", teksLatin: "Wa min syarri ḥāsidin iżā ḥasad(a)", teksIndonesia: "dan dari kejahatan orang yang dengki apabila dia dengki.”" }
    ]
  },
  114: {
    nomor: 114,
    namaLatin: "An-Nas",
    nama: "الناس",
    tempatTurun: "Mekah",
    arti: "Manusia",
    ayat: [
      { nomorAyat: 1, teksArab: "قُلْ اَعُوْذُ بِرَبِّ النَّاسِۙ", teksLatin: "Qul a'ūżu birabbin-nās(i)", teksIndonesia: "Katakanlah, “Aku berlindung kepada Tuhannya manusia," },
      { nomorAyat: 2, teksArab: "مَلِكِ النَّاسِۙ", teksLatin: "Malikin-nās(i)", teksIndonesia: "Raja manusia," },
      { nomorAyat: 3, teksArab: "اِلٰهِ النَّاسِۙ", teksLatin: "Ilāhin-nās(i)", teksIndonesia: "Sembahan manusia," },
      { nomorAyat: 4, teksArab: "مِنْ شَرِّ الْوَسْوَاسِ ەۙ الْخَنَّاسِۖ", teksLatin: "Min syarril-waswāsil-khannās(i)", teksIndonesia: "dari kejahatan (bisikan) setan yang bersembunyi," },
      { nomorAyat: 5, teksArab: "الَّذِيْ يُوَسْوِسُ فِيْ صُدُوْرِ النَّاسِۙ", teksLatin: "Al-lażī yuwaswisu fī ṣudūrin-nās(i)", teksIndonesia: "yang membisikkan (kejahatan) ke dalam dada manusia," },
      { nomorAyat: 6, teksArab: "مِنَ الْجِنَّةِ وَالنَّاسِ", teksLatin: "Minal-jinnati wan-nās(i)", teksIndonesia: "dari (golongan) jin dan manusia.”" }
    ]
  }
};

interface QuranViewerProps {
  onBack?: () => void;
}

export default function QuranViewer({ onBack }: QuranViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [surahData, setSurahData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Settings
  const [arabicFontSize, setArabicFontSize] = useState<number>(() => {
    return Number(localStorage.getItem('sim_quran_font_size') || '26');
  });
  const [showTransliteration, setShowTransliteration] = useState<boolean>(() => {
    return localStorage.getItem('sim_quran_show_latin') !== 'false';
  });
  const [showTranslation, setShowTranslation] = useState<boolean>(() => {
    return localStorage.getItem('sim_quran_show_translate') !== 'false';
  });
  const [themeMode, setThemeMode] = useState<'green' | 'cream' | 'dark'>(() => {
    return (localStorage.getItem('sim_quran_theme') as any) || 'green';
  });

  // Bookmark / Last Read
  const [lastRead, setLastRead] = useState<{ nomor_surah: number; nama_surah: string; ayat_ke: number } | null>(() => {
    const saved = localStorage.getItem('sim_quran_bookmark');
    return saved ? JSON.parse(saved) : null;
  });

  // Audio system state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [audioSurahNum, setAudioSurahNum] = useState<number | null>(null);
  const [audioVerseNum, setAudioVerseNum] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('sim_quran_font_size', arabicFontSize.toString());
  }, [arabicFontSize]);

  useEffect(() => {
    localStorage.setItem('sim_quran_show_latin', showTransliteration.toString());
  }, [showTransliteration]);

  useEffect(() => {
    localStorage.setItem('sim_quran_show_translate', showTranslation.toString());
  }, [showTranslation]);

  useEffect(() => {
    localStorage.setItem('sim_quran_theme', themeMode);
  }, [themeMode]);

  // Handle Surah Loading from equran.id API
  const handleSelectSurah = async (nomor: number) => {
    setSelectedSurah(nomor);
    setLoading(true);
    setSurahData(null);
    setErrorMsg(null);
    stopAudio();

    try {
      // Check if we have offline data directly
      if (OFFLINE_SURAH_STORE[nomor]) {
        setSurahData(OFFLINE_SURAH_STORE[nomor]);
        setLoading(false);
        return;
      }

      // Live fetch
      const res = await fetch(`https://equran.id/api/v2/surat/${nomor}`);
      if (!res.ok) {
        throw new Error('Gagal mengunduh surah dari server');
      }
      const json = await res.json();
      if (json.code === 200 && json.data) {
        // Map v2 API to our visual structure
        const mappedData = {
          nomor: json.data.nomor,
          namaLatin: json.data.namaLatin,
          nama: json.data.nama,
          tempatTurun: json.data.tempatTurun,
          arti: json.data.arti,
          deskripsi: json.data.deskripsi,
          audioFull: json.data.audioFull['01'] || Object.values(json.data.audioFull)[0], // reciter 01 or fallback
          ayat: json.data.ayat.map((ay: any) => ({
            nomorAyat: ay.nomorAyat,
            teksArab: ay.teksArab,
            teksLatin: ay.teksLatin,
            teksIndonesia: ay.teksIndonesia,
            audio: ay.audio['01'] || Object.values(ay.audio)[0]
          }))
        };
        setSurahData(mappedData);
      } else {
        throw new Error('Format data tidak sesuai');
      }
    } catch (err: any) {
      console.error(err);
      // Fallback
      if (OFFLINE_SURAH_STORE[1]) {
        setErrorMsg('Gagal menyambung internet. Menampilkan Surah Al-Fatihah sebagai contoh luring.');
        setSurahData(OFFLINE_SURAH_STORE[1]);
      } else {
        setErrorMsg('Data surah gagal dimuat. Pastikan Anda memiliki koneksi internet.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Toggle Bookmark for verse
  const handleToggleBookmark = (nomorSurah: number, namaSurah: string, ayatKe: number) => {
    const isBookmarked = lastRead && lastRead.nomor_surah === nomorSurah && lastRead.ayat_ke === ayatKe;
    if (isBookmarked) {
      setLastRead(null);
      localStorage.removeItem('sim_quran_bookmark');
    } else {
      const obj = { nomor_surah: nomorSurah, nama_surah: namaSurah, ayat_ke: ayatKe };
      setLastRead(obj);
      localStorage.setItem('sim_quran_bookmark', JSON.stringify(obj));
    }
  };

  // Play audio for individual verse or entire Surah
  const playAudio = (url: string, surahNum: number, verseNum: number | null) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    setCurrentAudioUrl(url);
    setAudioSurahNum(surahNum);
    setAudioVerseNum(verseNum);
    setIsPlaying(true);

    audio.play().catch(err => {
      console.warn("Audio play failed:", err);
      setIsPlaying(false);
    });

    audio.onended = () => {
      setIsPlaying(false);
      setAudioVerseNum(null);
    };
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentAudioUrl(null);
    setAudioSurahNum(null);
    setAudioVerseNum(null);
  };

  // Search filter
  const filteredSurahs = SURAH_LIST.filter(s =>
    s.nama_latin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.arti.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nomor.toString() === searchQuery.trim()
  );

  // Styling helpers
  const getThemeClasses = () => {
    switch (themeMode) {
      case 'cream':
        return {
          bg: 'bg-[#faf6eb]',
          text: 'text-stone-800',
          card: 'bg-[#f3edd9] border-[#e4d8b5]',
          border: 'border-[#dfd0a9]',
          badge: 'bg-[#ebdcb9] text-stone-700',
          arabicColor: 'text-[#362511]'
        };
      case 'dark':
        return {
          bg: 'bg-slate-900',
          text: 'text-slate-100',
          card: 'bg-slate-800 border-slate-700',
          border: 'border-slate-800',
          badge: 'bg-slate-700 text-slate-100',
          arabicColor: 'text-amber-200'
        };
      default: // green
        return {
          bg: 'bg-teal-50/50',
          text: 'text-slate-800',
          card: 'bg-white border-teal-100',
          border: 'border-teal-100',
          badge: 'bg-teal-50 text-teal-800',
          arabicColor: 'text-teal-950'
        };
    }
  };

  const t = getThemeClasses();

  return (
    <div className="flex flex-col h-full bg-white z-40 relative select-text text-left pb-20 animate-fadeIn">
      {/* HEADER: CLEAN MODERN MINIMALIST */}
      <div className="bg-white text-slate-800 pt-[calc(10px+env(safe-area-inset-top,20px))] pb-3 px-4 flex items-center justify-between border-b border-slate-200 shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          {selectedSurah ? (
            <button
              onClick={() => {
                setSelectedSurah(null);
                setSurahData(null);
                stopAudio();
              }}
              className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            onBack && (
              <button
                onClick={onBack}
                className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )
          )}
          <div>
            <h2 className="font-bold text-xs uppercase tracking-wider text-teal-800 flex items-center gap-1.5 leading-none animate-fadeIn">
              <span>Al-Qur'an</span>
            </h2>
          </div>
        </div>
        <BookOpen className="w-4 h-4 text-teal-600" />
      </div>

      {/* DETAILED SURAH VIEW */}
      {selectedSurah ? (
        <div className={`flex-grow overflow-y-auto p-4 space-y-4 ${t.bg} ${t.text}`}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-3">
              <div className="relative w-12 h-12 border-4 border-teal-200 border-t-teal-800 rounded-full animate-spin"></div>
              <p className="text-xs font-semibold text-teal-800">Mengunduh wahyu Ilahi...</p>
              <p className="text-[10px] text-slate-400 italic">Terjemahan Kemenag RI</p>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div className="bg-amber-100 border-l-4 border-amber-500 p-3 rounded-r-xl text-amber-900 text-xs mb-3 font-medium flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {surahData && (
                <div className="space-y-4">
                  {/* Surah Header Card */}
                  <div className="bg-[#0d9488] text-white rounded-3xl p-5 shadow-lg border border-amber-400/40 relative overflow-hidden text-center">

                    <div className="relative z-10 space-y-2">
                      <span className="text-[9px] font-bold tracking-widest text-amber-300">
                        SURAH KE-{surahData.nomor} • {surahData.tempatTurun.toUpperCase()}
                      </span>
                      <h3 className="font-serif text-3xl text-amber-100 tracking-wide font-bold">{surahData.nama}</h3>
                      <h4 className="font-sans font-bold text-lg text-white">{surahData.namaLatin}</h4>
                      <p className="text-xs text-teal-200 font-medium italic mt-0.5">"{surahData.arti}" — {surahData.ayat.length} Ayat</p>

                      <div className="pt-3 flex justify-center gap-2">
                        {surahData.audioFull && (
                          <button
                            onClick={() => {
                              if (isPlaying && audioSurahNum === surahData.nomor && audioVerseNum === null) {
                                stopAudio();
                              } else {
                                playAudio(surahData.audioFull, surahData.nomor, null);
                              }
                            }}
                            className="bg-amber-400 hover:bg-amber-500 text-teal-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow transition-all transform active:scale-95"
                          >
                            {isPlaying && audioSurahNum === surahData.nomor && audioVerseNum === null ? (
                              <>
                                <Pause className="w-3.5 h-3.5" /> Stop Murottal
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 fill-current" /> Putar Murottal
                              </>
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => {
                            // Quick scroll to last read
                            if (lastRead && lastRead.nomor_surah === surahData.nomor) {
                              const el = document.getElementById(`verse-${lastRead.ayat_ke}`);
                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                          }}
                          disabled={!lastRead || lastRead.nomor_surah !== surahData.nomor}
                          className="bg-white/10 text-yellow-400 hover:text-yellow-300 hover:bg-white/20 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all text-center disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <Bookmark className="w-3.5 h-3.5" /> Lompat Penanda
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Settings Tray */}
                  <div className={`${t.card} p-3 rounded-2xl border text-xs grid grid-cols-3 gap-2 align-middle`}>
                    <div className="flex flex-col justify-center">
                      <span className="text-[10px] text-black block font-bold uppercase tracking-wider mb-1">Ukuran Arab</span>
                      <input
                        type="range"
                        min="20"
                        max="46"
                        value={arabicFontSize}
                        onChange={(e) => setArabicFontSize(Number(e.target.value))}
                        className="w-full accent-teal-700 bg-slate-200 rounded"
                      />
                    </div>
                    <div className="flex flex-col justify-center items-center">
                      <button
                        onClick={() => setShowTransliteration(!showTransliteration)}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-[10px] font-bold border transition-colors ${showTransliteration ? 'bg-teal-800 text-amber-400 border-teal-800' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                      >
                        {showTransliteration ? 'Latin Aktif' : 'Tanpa Latin'}
                      </button>
                    </div>
                    <div className="flex flex-col justify-center items-center">
                      <button
                        onClick={() => setShowTranslation(!showTranslation)}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-[10px] font-bold border transition-colors ${showTranslation ? 'bg-teal-800 text-amber-400 border-teal-800' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                      >
                        {showTranslation ? 'Arti Aktif' : 'Tanpa Arti'}
                      </button>
                    </div>
                  </div>

                  {/* Beautiful Islamic Gold Bismillah banner */}
                  {surahData.nomor !== 1 && surahData.nomor !== 9 && (
                    <div className="text-center py-6 select-none relative">
                      <div className="text-3xl font-serif tracking-normal text-teal-950/80 drop-shadow-sm font-medium">
                        بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
                      </div>
                      <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-2"></div>
                    </div>
                  )}

                  {/* Verses Container */}
                  <div className="space-y-6 pt-2">
                    {surahData.ayat.map((ay: any, index: number) => {
                      const isBookmarked = lastRead && lastRead.nomor_surah === surahData.nomor && lastRead.ayat_ke === ay.nomorAyat;
                      const isVersePlaying = isPlaying && audioSurahNum === surahData.nomor && audioVerseNum === ay.nomorAyat;

                      return (
                        <div
                          key={ay.nomorAyat}
                          id={`verse-${ay.nomorAyat}`}
                          className={`group p-4 rounded-2xl border transition-all relative ${isBookmarked || isVersePlaying
                            ? 'bg-[#0d9488] border-[#0d9488] shadow-lg selected'
                            : 'bg-[#0f766e] border-[#0f766e] hover:bg-[#0d9488] hover:border-[#0d9488] shadow-md'
                            }`}
                        >
                          {/* Metadata row with Verse Emblem + Quick Buttons */}
                          <div className={`absolute left-0 top-4 bottom-4 w-1.5 bg-amber-400 rounded-r-lg transition-opacity ${isBookmarked || isVersePlaying ? 'opacity-100' : 'opacity-100'}`}></div>
                          <div className="flex justify-between items-center mb-4 border-b border-amber-400/30 pb-2 flex-row-reverse sm:flex-row group-hover:border-amber-400 group-[.selected]:border-amber-400">
                            <div className="flex items-center gap-1">
                              {/* Simple verse numbering medallion */}
                              <div className="w-8 h-8 rounded-full bg-white text-[#0f766e] text-[13px] font-bold flex items-center justify-center shadow-sm shrink-0">
                                <span>{ay.nomorAyat}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {ay.audio && (
                                <button
                                  onClick={() => {
                                    if (isVersePlaying) {
                                      stopAudio();
                                    } else {
                                      playAudio(ay.audio, surahData.nomor, ay.nomorAyat);
                                    }
                                  }}
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all shadow-sm ${isVersePlaying
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-amber-400 hover:bg-amber-500 text-amber-900'
                                    }`}
                                  title="Dengarkan ayat"
                                >
                                  {isVersePlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className={`w-3.5 h-3.5 fill-current`} />}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Arabic Text (IndoPak / Uthmanic style spacing) */}
                          <div
                            className="text-right font-serif leading-loose mb-3 pr-2 select-all text-white"
                            style={{
                              fontSize: `${arabicFontSize}px`,
                              fontFamily: "'Amiri', 'Traditional Arabic', 'Scheherazade', serif",
                              lineHeight: '2.3'
                            }}
                          >
                            {ay.teksArab}
                          </div>

                          {/* Latin Transliteration */}
                          {showTransliteration && (
                            <p className="text-xs font-medium italic leading-relaxed mb-3 pb-3 border-b border-white/20 text-teal-100">
                              {ay.teksLatin}
                            </p>
                          )}

                          {/* Indonesian Translation */}
                          {showTranslation && (
                            <p className="text-xs leading-relaxed font-normal pl-1 border-l-2 text-white border-white/30">
                              {ay.nomorAyat}. {ay.teksIndonesia}
                            </p>
                          )}

                          {/* Bottom Right Bookmark Button */}
                          <div className="flex justify-end mt-2">
                            <button
                              onClick={() => handleToggleBookmark(surahData.nomor, surahData.namaLatin, ay.nomorAyat)}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all shadow-sm ${isBookmarked
                                ? 'bg-teal-500 text-white'
                                : 'bg-amber-400 hover:bg-teal-500 text-amber-900 hover:text-white'
                                }`}
                              title="Tandai terakhir dibaca"
                            >
                              {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Navigation footer of Surah detail */}
                  <div className="pt-6 pb-12 flex justify-between gap-3">
                    <button
                      onClick={() => surahData.nomor > 1 && handleSelectSurah(surahData.nomor - 1)}
                      disabled={surahData.nomor <= 1}
                      className="flex-grow bg-slate-905 bg-white border border-slate-200 py-3 rounded-2xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1 shadow-sm disabled:opacity-30 active:bg-slate-50"
                    >
                      <ChevronLeft className="w-4 h-4" /> Surah Sebelumnya
                    </button>
                    <button
                      onClick={() => surahData.nomor < 114 && handleSelectSurah(surahData.nomor + 1)}
                      disabled={surahData.nomor >= 114}
                      className="flex-grow bg-teal-800 border border-teal-800 text-white py-3 rounded-2xl text-xs font-semibold hover:bg-teal-900 flex items-center justify-center gap-1 shadow-sm disabled:opacity-30 active:scale-99"
                    >
                      Surah Berikutnya <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        /* MAIN SURAH TABLE OF CONTENTS */
        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50/50">

          {/* Quick Notification of Bookmark */}
          {lastRead && (
            <div
              onClick={() => handleSelectSurah(lastRead.nomor_surah)}
              className="bg-gradient-to-r from-amber-500/10 to-amber-500/5 hover:from-amber-500/25 border-2 border-dashed border-amber-300 text-amber-900 rounded-3xl p-4 flex items-center justify-between cursor-pointer transition-all shadow-sm group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow">
                  <Bookmark className="w-4 h-4 animate-bounce" />
                </div>
                <div className="text-left font-sans">
                  <span className="text-[9px] uppercase tracking-wider block font-bold text-amber-700/80 leading-none">Terakhir Dibaca (Penanda)</span>
                  <span className="text-xs font-extrabold text-slate-800 mt-1 block">Surah {lastRead.nama_surah} Ayat {lastRead.ayat_ke}</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-amber-500 group-hover:translate-x-1 transition-transform" />
            </div>
          )}

          {/* Sapaan & Search bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari surah (misal: Yasin, Al-Mulk, Al-Fatihah)..."
                className="w-full bg-white border border-slate-200 pl-11 pr-10 py-3.5 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-teal-700 focus:border-teal-700 outline-none shadow-sm transition-all text-slate-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Menu selections (Shortcuts to popular Juz 30 / Yasin / Tahlil) */}
          <div className="text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 ml-1">Pintasan Surah Sering Dibaca</span>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { nomor: 36, label: "Ya Sin" },
                { nomor: 67, label: "Al-Mulk" },
                { nomor: 56, label: "Al-Waqi'ah" },
                { nomor: 18, label: "Al-Kahf" }
              ].map((shortcut) => (
                <button
                  key={shortcut.nomor}
                  onClick={() => handleSelectSurah(shortcut.nomor)}
                  className="border border-slate-200 py-2.5 rounded-xl text-[10px] font-extrabold text-center transition-all active:scale-95 btn-active shadow-sm bg-white text-black hover:bg-[#0d9488] hover:text-white hover:border-[#0d9488]"
                >
                  {shortcut.label}
                </button>
              ))}
            </div>
          </div>

          {/* SURAH LIST DISPLAY */}
          <div className="space-y-2 mt-4 text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block ml-1">Daftar Surah (114)</span>

            {filteredSurahs.length === 0 ? (
              <div className="text-center py-10 bg-white border border-dashed rounded-3xl text-slate-400 text-xs text-medium">
                Surah "{searchQuery}" tidak ditemukan. Coba masukkan surah lain.
              </div>
            ) : (
              <div className="space-y-2 pb-10">
                {filteredSurahs.map((surah) => (
                  <div
                    key={surah.nomor}
                    onClick={() => handleSelectSurah(surah.nomor)}
                    className="bg-white border border-slate-100 rounded-2xl p-3.5 hover:bg-[#0d9488] hover:border-[#0d9488] transition-all flex items-center justify-between cursor-pointer shadow-sm hover:shadow-md group"
                  >
                    <div className="flex items-center gap-3">
                      {/* Left circular order token */}
                      <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-500 font-mono text-xs font-bold flex items-center justify-center border border-slate-200 shrink-0 group-hover:bg-white group-hover:text-[#0d9488] group-hover:border-transparent transition-all">
                        {surah.nomor}
                      </div>

                      <div className="text-left font-sans">
                        <span className="text-xs font-extrabold text-slate-800 group-hover:text-white tracking-wide uppercase block">{surah.nama_latin}</span>
                        <span className="text-[10px] text-slate-500 group-hover:text-teal-100 block font-medium mt-0.5">
                          {surah.arti} • <span className="font-semibold text-slate-500 group-hover:text-teal-50">{surah.jumlah_ayat} Ayat</span>
                        </span>
                      </div>
                    </div>

                    {/* Far right showing Arabic script & revelation venue badge */}
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-serif text-lg tracking-wide text-teal-950 group-hover:text-white font-bold leading-normal">{surah.nama}</span>
                      <span className="text-[8px] font-bold uppercase tracking-wider transition-all text-[#0d9488] group-hover:text-white">
                        {surah.tempat_turun}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AUDIO FIXED BOTTOM CONTROLLER (Sticky bar) */}
      {isPlaying && currentAudioUrl && (
        <div className="fixed bottom-[72px] left-0 right-0 max-w-md mx-auto bg-gradient-to-r from-teal-950 to-teal-950 text-white p-3 z-50 shadow-inner flex items-center justify-between border-t border-amber-300">
          <div className="flex items-center gap-2 max-w-[70%]">
            <Volume2 className="w-4 h-4 text-amber-300 shrink-0 animate-ping" />
            <div className="text-left min-w-0">
              <span className="text-[8px] text-teal-300 uppercase font-black block tracking-widest leading-none">Sedang Melantun</span>
              <span className="text-[11px] font-extrabold text-white truncate block mt-0.5">
                Surah {SURAH_LIST.find(s => s.nomor === audioSurahNum)?.nama_latin || 'Al-Qur\'an'}
                {audioVerseNum ? ` : Ayat ${audioVerseNum}` : ' (Full Murottal)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={stopAudio}
              className="w-7 h-7 bg-red-600/30 text-rose-300 border border-rose-500/20 hover:bg-red-700 rounded-lg flex items-center justify-center transition-all font-bold"
              title="Stop audio"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
