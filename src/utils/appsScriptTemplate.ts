export const APPS_SCRIPT_CODE = `// --- UNIFIED SIM TPQ APPS SCRIPT ---
// Salin seluruh kode di bawah ini untuk menggantikan kode Google Apps Script Anda (Ekstensi > Apps Script).
// Jalankan fungsi 'setupDatabase' sekali saja untuk membuat/memperbarui seluruh struktur tabel dengan kolom yang lengkap.

function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var defaultSheets = {
    "Santri": [["id_santri", "nama_santri", "nis", "halaqah", "username_ortu", "password_ortu", "jumlah_hafalan", "juz_hafal", "murojaah", "created_by"], 
               ["S001", "Ahmad Faisal", "XbyU1001", "Abu Bakar", "ahmad", "XbyU1001", "2 Juz", "Juz 30, 29", "Lancar", "admin"]],
    "Users": [["username", "password", "nama_lengkap", "role"],
              ["ustadz", "123", "Ustadz Hanafi, M.Pd.", "Ustadz"],
              ["admin", "123", "Admin TPQ", "Admin"]],
    "Setoran": [["id_setoran", "tanggal", "id_santri", "nama_santri", "surah", "ayat", "tilawah", "halaman", "hadits", "kualitas", "catatan", "nama_ustadz", "created_by"],
                ["SET1", "2026-06-11", "S001", "Ahmad Faisal", "Al-Mulk", "1-10", "-", "-", "-", "Mumtaz", "Lancar", "Ustadz Hanafi", "admin"]],
    "Pembayaran": [["id_pembayaran", "tanggal", "id_santri", "nama_santri", "kategori", "nominal", "status", "catatan", "nama_admin", "created_by"],
                   ["PAY1", "2026-06-08", "S001", "Ahmad Faisal", "SPP Juni", "150000", "Lunas", "Lunas", "Ustadz Hanafi", "admin"]],
    "Kelas": [["id_kelas", "nama_kelas", "created_by"], ["K1", "Abu Bakar", "admin"]],
    "Tabungan": [["id", "id_santri", "nama_santri", "nominal", "tanggal", "created_by"], ["TB1", "S001", "Ahmad Faisal", "50000", "2026-06-11", "admin"]],
    "Pengaturan": [["username", "nama_lembaga", "nama_pimpinan", "logo", "alamat", "telepon", "email", "website", "pengumuman", "link_wa_json", "web_config_json", "id_drive", "link_website"],
                   ["admin", "SIM TPQ Baitul Quran", "Ustadz Hanafi", "", "Jl. Masjid Agung", "081234567890", "info@tpq.sch.id", "tpq.sch.id", "Selamat datang", "[]", "", "", ""]],
    "website": [
      ["username", "judul_hero", "sub_judul_hero", "gambar_hero", "judul_profil", "profil", 
       "program_1_judul", "program_1_gambar", "program_1_ket", 
       "program_2_judul", "program_2_gambar", "program_2_ket", 
       "program_3_judul", "program_3_gambar", "program_3_ket", 
       "program_4_judul", "program_4_gambar", "program_4_ket",
       "link_peta", "link_video", "testi_1_nama", "testi_1_jabatan", "testi_1_pesan"],
      ["admin", "Generasi Qur'ani", "Administrasi Santri", "", "Profil", "Deskripsi lembaga", 
       "Tilawati", "", "Belajar Iqro", 
       "Tahfidz", "", "Hafalan Qur'an", 
       "Akhlak", "", "Karakter mulia", 
       "Hadits", "", "Doa harian",
       "", "", "", "", ""]
    ],
    "Informasi": [["id", "tipe", "tanggal", "id_santri", "nama_santri", "pesan", "created_by"], ["INF1", "Manual", "2026-06-12", "S001", "Ahmad Faisal", "Membawa Iqro", "admin"]],
    "Mutabaah": [["id", "id_santri", "nama_santri", "tanggal", "subuh", "dzuhur", "ashar", "maghrib", "isya", "dhuha", "tilawah", "catatan", "created_by"],
                 ["M1", "S001", "Ahmad Faisal", "2026-06-12", "Ya", "Ya", "Ya", "Ya", "Ya", "Tidak", "Ya", "Baik", "admin"]],
    "MataPelajaran": [["id_kelas", "quran_methods", "hadits_doa", "tilawah_stages", "created_by"],
                      ["K1", '["Ziyadah","Murojaah"]', '["Niat"]', '["Iqro\' 1"]', "admin"]],
    "Pendaftaran": [["id_pendaftaran", "nama_santri", "halaqah", "nama_ortu", "wa_ortu", "status", "nis_ditetapkan", "tanggal_daftar", "created_by"],
                    ["REG1", "Hasan", "Abu Bakar", "Ahmad", "081234567890", "Pending", "-", "2026-06-30", "admin"]],
    "Agenda": [["id", "tipe", "tanggal", "waktu", "judul", "deskripsi", "status", "gambar", "created_by"],
               ["AGD1", "Agenda", "2026-07-06", "08.00 - 09.00", "Tahsin Al-Qur'an", "Belajar memperbaiki bacaan Al-Qur'an", "Berjalan", "", "admin"],
               ["AGD2", "Agenda", "2026-07-06", "09.00 - 10.30", "Tahfidz Juz 30", "Setoran hafalan baru", "Berikutnya", "", "admin"],
               ["AGD3", "Pengumuman", "2026-07-05", "-", "Libur 1 Muharram 1448 H", "Tahun Baru Islam 1448 H", "-", "", "admin"]]
  };
  for (var sheetName in defaultSheets) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      var rows = defaultSheets[sheetName];
      sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
    } else {
      var targetHeaders = defaultSheets[sheetName][0];
      var lastColumn = sheet.getLastColumn();
      var currentHeaders = [];
      if (lastColumn > 0) {
        currentHeaders = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(function(h) {
          return h.toString().toLowerCase().trim();
        });
      }
      for (var j = 0; j < targetHeaders.length; j++) {
        var headerName = targetHeaders[j];
        if (currentHeaders.indexOf(headerName.toLowerCase().trim()) === -1) {
          var newColIndex = sheet.getLastColumn() + 1;
          sheet.getRange(1, newColIndex).setValue(headerName);
          var lastRow = sheet.getLastRow();
          if (lastRow > 1) {
            var defaultVal = "-";
            if (headerName === "created_by" || headerName === "username") defaultVal = "admin";
            sheet.getRange(2, newColIndex, lastRow - 1, 1).setValue(defaultVal);
          }
          currentHeaders.push(headerName.toLowerCase().trim());
        }
      }
    }
  }
}

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // --- FITUR KEAMANAN: BLOK AKSES LANGSUNG ---
    // Jika diakses langsung dari browser tanpa parameter sinkronisasi (_t), tampilkan halaman web aman
    if (!e || !e.parameter || !e.parameter._t) {
      return HtmlService.createHtmlOutput(
        "<div style='font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;text-align:center;padding:60px 20px;color:#334155;background:#f8fafc;min-height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;box-sizing:border-box;'>" +
        "  <div style='background:white;padding:40px;border-radius:16px;box-shadow:0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);max-width:480px;width:100%;'>" +
        "    <div style='background:#f0fdf4;color:#166534;width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 20px;'>🛡️</div>" +
        "    <h2 style='margin:0 0 10px;font-size:22px;font-weight:600;color:#0f172a;'>SIM TPQ - Basis Data Terlindungi</h2>" +
        "    <p style='margin:0 0 24px;font-size:14px;line-height:1.6;color:#64748b;'>Node penyimpanan Google Sheets untuk lembaga TPQ aktif dan terproteksi dengan baik. Akses langsung melalui penjelajah web dibatasi untuk menjaga privasi data.</p>" +
        "    <div style='border-top:1px solid #e2e8f0;padding-top:16px;font-size:12px;color:#94a3b8;font-family:monospace;'>STATUS: TERHUBUNG & AMAN</div>" +
        "  </div>" +
        "</div>"
      ).setTitle("SIM TPQ - Basis Data Terlindungi");
    }

    // Mengamankan data kredensial: 'Users' tidak boleh dikirim atau disinkronkan ke client browser secara massal via GET!
    var sheets = ["Santri", "Setoran", "Pembayaran", "Kelas", "Tabungan", "Pengaturan", "Informasi", "Mutabaah", "MataPelajaran", "Pendaftaran", "website", "Agenda"];
    var resultObj = {};
    var requestedUsername = "";
    if (e && e.parameter) {
      requestedUsername = (e.parameter.username || e.parameter.tpq || "").toString().trim().toLowerCase();
    }
    for (var i = 0; i < sheets.length; i++) {
      var sName = sheets[i];
      var sheet = ss.getSheetByName(sName);
      if (!sheet) continue;
      var data = sheet.getDataRange().getValues();
      var headers = data[0];
      var idxUsername = -1;
      for (var h = 0; h < headers.length; h++) {
        var hName = headers[h].toString().toLowerCase().trim();
        if (hName === "username" || hName === "created_by" || hName === "createdby") {
          idxUsername = h;
          break;
        }
      }
      var rows = [];
      if (sName === "website" || sName === "Pengaturan") {
        var matchedRowIndex = -1;
        if (requestedUsername !== "" && idxUsername !== -1) {
          for (var r = 1; r < data.length; r++) {
            if (data[r][idxUsername].toString().trim().toLowerCase() === requestedUsername) {
              matchedRowIndex = r;
              break;
            }
          }
        }
        if (matchedRowIndex === -1 && data.length > 1) matchedRowIndex = 1;
        if (matchedRowIndex !== -1) {
          var rowObj = {};
          var hasData = false;
          for (var c = 0; c < headers.length; c++) {
            var val = data[matchedRowIndex][c];
            if (val instanceof Date) {
              val = Utilities.formatDate(val, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd");
            }
            if (val !== "" && val !== null && val !== undefined) hasData = true;
            rowObj[headers[c]] = val;
          }
          if (hasData) rows.push(rowObj);
        }
      } else {
        var shouldFilter = (requestedUsername !== "" && idxUsername !== -1);
        for (var r = 1; r < data.length; r++) {
          var rowUser = idxUsername !== -1 ? data[r][idxUsername].toString().trim().toLowerCase() : "";
          if (shouldFilter && rowUser !== requestedUsername && rowUser !== "admin" && rowUser !== "") continue;
          var rowObj = {};
          var hasData = false;
          for (var c = 0; c < headers.length; c++) {
            var val = data[r][c];
            if (val instanceof Date) {
              val = Utilities.formatDate(val, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd");
            }
            if (val !== "" && val !== null && val !== undefined) hasData = true;
            rowObj[headers[c]] = val;
          }
          if (hasData) rows.push(rowObj);
        }
      }
      resultObj[sName] = rows;
    }
    return ContentService.createTextOutput(JSON.stringify({ success: true, data: resultObj })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    var payload = JSON.parse(e.postData.contents);
    var targetSheetName = payload.sheet;
    var action = payload.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var requestedUsername = (payload.username || "").toString().trim().toLowerCase();
    
    if (action === "uploadFile") {
      var uploadData = payload.data;
      var folderId = uploadData.folderId;
      var fileContent = uploadData.file;
      var filename = uploadData.filename;
      var mimeType = uploadData.mimeType;
      var fieldName = uploadData.fieldName;
      var folder;
      var autoCreatedFolder = false;

      if (!folderId || folderId.toString().trim() === "") {
        try {
          var pSheet = ss.getSheetByName("Pengaturan");
          if (pSheet && pSheet.getLastRow() >= 2) {
            var pData = pSheet.getDataRange().getValues();
            var pHeaders = pData[0];
            var idxIdDrive = -1, idxPUsername = -1;
            for (var h = 0; h < pHeaders.length; h++) {
              var ph = pHeaders[h].toString().toLowerCase().trim();
              if (ph === "id_drive" || ph === "iddrive" || ph === "drive_id") idxIdDrive = h;
              if (ph === "username") idxPUsername = h;
            }
            var matchedPRow = 1;
            if (requestedUsername !== "" && idxPUsername !== -1) {
              for (var r = 1; r < pData.length; r++) {
                if (pData[r][idxPUsername].toString().trim().toLowerCase() === requestedUsername) {
                  matchedPRow = r;
                  break;
                }
              }
            }
            if (idxIdDrive !== -1) {
              var foundDriveId = pData[matchedPRow][idxIdDrive];
              if (foundDriveId && foundDriveId.toString().trim() !== "") {
                folderId = foundDriveId.toString().trim();
              }
            }
          }
        } catch (readErr) {}
      }

      if (folderId && folderId.toString().trim() !== "") {
        try { folder = DriveApp.getFolderById(folderId); } catch (err) { folder = getOrCreateAutoFolder(ss); autoCreatedFolder = true; }
      } else {
        folder = getOrCreateAutoFolder(ss);
        autoCreatedFolder = true;
      }

      if (autoCreatedFolder && folder) {
        try {
          var pSheet = ss.getSheetByName("Pengaturan") || ss.insertSheet("Pengaturan");
          var lastColumn = pSheet.getLastColumn();
          var pHeaders = [];
          if (lastColumn > 0) {
            pHeaders = pSheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(function(h) { return h.toString().toLowerCase().trim(); });
          }
          var idxPUsername = pHeaders.indexOf("username");
          if (idxPUsername === -1) {
            pSheet.insertColumnBefore(1);
            pSheet.getRange(1, 1).setValue("username");
            pHeaders.unshift("username");
            idxPUsername = 0;
          }
          var pHeadersList = ["nama_lembaga", "nama_pimpinan", "logo", "alamat", "telepon", "email", "website", "pengumuman", "link_wa_json", "web_config_json", "id_drive", "link_website"];
          for (var j = 0; j < pHeadersList.length; j++) {
            var hReq = pHeadersList[j];
            if (pHeaders.indexOf(hReq.toLowerCase()) === -1) {
              pSheet.getRange(1, pSheet.getLastColumn() + 1).setValue(hReq);
              pHeaders.push(hReq.toLowerCase());
            }
          }
          var freshPHeaders = pSheet.getRange(1, 1, 1, pSheet.getLastColumn()).getValues()[0];
          var pData = pSheet.getDataRange().getValues();
          var existsPRowIndex = -1;
          if (requestedUsername !== "") {
            for (var r = 1; r < pData.length; r++) {
              if (pData[r][idxPUsername].toString().trim().toLowerCase() === requestedUsername) { existsPRowIndex = r; break; }
            }
          }
          if (existsPRowIndex === -1) {
            var newRow = freshPHeaders.map(function() { return ""; });
            pSheet.appendRow(newRow);
            existsPRowIndex = pSheet.getLastRow() - 1;
          }
          pSheet.getRange(existsPRowIndex + 1, idxPUsername + 1).setValue(requestedUsername);
          var idxIdDrive = freshPHeaders.map(function(h) { return h.toString().toLowerCase().trim(); }).indexOf("id_drive");
          if (idxIdDrive !== -1) pSheet.getRange(existsPRowIndex + 1, idxIdDrive + 1).setValue(folder.getId());
        } catch (saveErr) {}
      }

      if (fileContent.indexOf(",") > -1) fileContent = fileContent.split(",")[1];
      var decodedFile = Utilities.base64Decode(fileContent);
      var blob = Utilities.newBlob(decodedFile, mimeType, filename);
      var file = folder.createFile(blob);
      try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (sharingErr) {}
      var fileUrl = "https://docs.google.com/uc?export=view&id=" + file.getId();

      var sheet = ss.getSheetByName("website") || ss.insertSheet("website");
      var headers = ensureWebsiteSheetHeaders(sheet);
      var idxUsername = headers.indexOf("username");
      var data = sheet.getDataRange().getValues();
      var existsRowIndex = -1;
      if (requestedUsername !== "" && idxUsername !== -1) {
        for (var r = 1; r < data.length; r++) {
          if (data[r][idxUsername].toString().trim().toLowerCase() === requestedUsername) { existsRowIndex = r; break; }
        }
      }
      if (existsRowIndex === -1) {
        var newRow = headers.map(function() { return ""; });
        sheet.appendRow(newRow);
        existsRowIndex = sheet.getLastRow() - 1;
      }
      if (idxUsername !== -1) sheet.getRange(existsRowIndex + 1, idxUsername + 1).setValue(requestedUsername);
      
      var targetCol = "";
      if (fieldName === "hero" || fieldName === "gambar_hero") targetCol = "gambar_hero";
      else if (fieldName === "program_1" || fieldName === "program_1_gambar") targetCol = "program_1_gambar";
      else if (fieldName === "program_2" || fieldName === "program_2_gambar") targetCol = "program_2_gambar";
      else if (fieldName === "program_3" || fieldName === "program_3_gambar") targetCol = "program_3_gambar";
      else if (fieldName === "program_4" || fieldName === "program_4_gambar") targetCol = "program_4_gambar";
      
      if (targetCol) {
        var idx = headers.indexOf(targetCol);
        if (idx !== -1) sheet.getRange(existsRowIndex + 1, idx + 1).setValue(fileUrl);
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true, url: fileUrl })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "saveWebsiteData") {
      var webData = payload.data;
      var sheet = ss.getSheetByName("website") || ss.insertSheet("website");
      var headers = ensureWebsiteSheetHeaders(sheet);
      var idxUsername = headers.indexOf("username");
      var data = sheet.getDataRange().getValues();
      var existsRowIndex = -1;
      if (requestedUsername !== "" && idxUsername !== -1) {
        for (var r = 1; r < data.length; r++) {
          if (data[r][idxUsername].toString().trim().toLowerCase() === requestedUsername) { existsRowIndex = r; break; }
        }
      }
      if (existsRowIndex === -1) {
        var newRow = headers.map(function() { return ""; });
        sheet.appendRow(newRow);
        existsRowIndex = sheet.getLastRow() - 1;
      }
      for (var c = 0; c < headers.length; c++) {
        var colKey = headers[c];
        if (colKey === "username") {
          sheet.getRange(existsRowIndex + 1, c + 1).setValue(requestedUsername);
        } else {
          var val = webData[colKey];
          if (val !== undefined) sheet.getRange(existsRowIndex + 1, c + 1).setValue(val);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Sukses!" })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "login_ustadz") {
      var usernameInput = payload.username || "";
      var passwordInput = payload.password || "";
      var userSheet = ss.getSheetByName("Users");
      if (!userSheet) return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Tabel Users kosong." })).setMimeType(ContentService.MimeType.JSON);
      var uData = userSheet.getDataRange().getValues();
      var uHeaders = uData[0];
      var idxUsername = uHeaders.indexOf("username"), idxPassword = uHeaders.indexOf("password"), idxNama = uHeaders.indexOf("nama_lengkap"), idxRole = uHeaders.indexOf("role");
      for (var r = 1; r < uData.length; r++) {
        if (uData[r][idxUsername].toString().trim().toLowerCase() === usernameInput.toLowerCase().trim() && uData[r][idxPassword].toString().trim() === passwordInput.toString().trim()) {
          return ContentService.createTextOutput(JSON.stringify({
            success: true, user: { role: uData[r][idxRole], nama_lengkap: uData[r][idxNama], id_santri: null, username: uData[r][idxUsername] }
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Akses login ditolak!" })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "login_wali") {
      var namaInput = payload.nama_santri || "";
      var nisInput = payload.nis || "";
      var santriSheet = ss.getSheetByName("Santri");
      if (!santriSheet) return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Tabel Santri kosong." })).setMimeType(ContentService.MimeType.JSON);
      var sData = santriSheet.getDataRange().getValues();
      var sHeaders = sData[0];
      var idxNamaS = sHeaders.indexOf("nama_santri"), idxNis = sHeaders.indexOf("nis"), idxIdS = sHeaders.indexOf("id_santri");
      for (var r = 1; r < sData.length; r++) {
        if (sData[r][idxNamaS].toString().trim().toLowerCase() === namaInput.toLowerCase().trim() && sData[r][idxNis].toString().trim().toLowerCase() === nisInput.toLowerCase().trim()) {
          return ContentService.createTextOutput(JSON.stringify({
            success: true, user: { role: "OrangTua", nama_lengkap: "Wali dari " + sData[r][idxNamaS], id_santri: sData[r][idxIdS] }
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Identitas Santri tidak verifikasi!" })).setMimeType(ContentService.MimeType.JSON);
    }
    
    var sheet = ss.getSheetByName(targetSheetName);
    if (!sheet) {
      if (targetSheetName === "Pengaturan") {
        sheet = ss.insertSheet("Pengaturan");
        var headersList = ["username", "nama_lembaga", "nama_pimpinan", "logo", "alamat", "telepon", "email", "website", "pengumuman", "link_wa_json", "web_config_json", "id_drive", "link_website"];
        sheet.appendRow(headersList);
        sheet.appendRow(headersList.map(function() { return ""; }));
      } else {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Tabel '" + targetSheetName + "' tidak ditemukan." })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    if (action === "add") {
      var rowData = payload.data;
      var exists = false;
      var existsRowIndex = -1;
      var idxCreatedBy = headers.indexOf("created_by");
      if (idxCreatedBy === -1) idxCreatedBy = headers.indexOf("createdby");
      var idxUserHeader = headers.indexOf("username");
      if (idxCreatedBy !== -1 && rowData.created_by === undefined && rowData.createdby === undefined) rowData[headers[idxCreatedBy]] = requestedUsername;
      if (idxUserHeader !== -1 && rowData.username === undefined) rowData[headers[idxUserHeader]] = requestedUsername;

      if (targetSheetName === "MataPelajaran") {
        var targetKelas = (rowData.id_kelas || rowData.idkelas || "").toString().trim();
        var targetUser = (rowData.created_by || rowData.createdby || requestedUsername || "admin").toString().trim();
        var idxKelas = headers.indexOf("id_kelas");
        var idxRowCreatedBy = headers.indexOf("created_by");
        if (idxRowCreatedBy === -1) idxRowCreatedBy = headers.indexOf("createdby");
        for (var r = 1; r < data.length; r++) {
          var rowKelas = data[r][idxKelas].toString().trim();
          var rowUser = idxRowCreatedBy >= 0 ? data[r][idxRowCreatedBy].toString().trim() : "admin";
          if (rowKelas === targetKelas && rowUser.toLowerCase() === targetUser.toLowerCase()) { exists = true; existsRowIndex = r; break; }
        }
      } else if (targetSheetName === "Setoran") {
        var idxTanggal = headers.indexOf("tanggal"), idxIdSantri = headers.indexOf("id_santri");
        var targetTgl = (rowData.tanggal || "").toString().trim();
        if (targetTgl.indexOf("T") !== -1) targetTgl = targetTgl.split("T")[0];
        var targetIdSantri = (rowData.id_santri || "").toString().trim();
        for (var r = 1; r < data.length; r++) {
          var rowTgl = data[r][idxTanggal];
          if (rowTgl instanceof Date) { rowTgl = Utilities.formatDate(rowTgl, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd"); }
          else { rowTgl = rowTgl.toString().trim(); if (rowTgl.indexOf("T") !== -1) rowTgl = rowTgl.split("T")[0]; }
          var rowIdSantri = data[r][idxIdSantri].toString().trim();
          if (rowTgl === targetTgl && rowIdSantri === targetIdSantri) { exists = true; existsRowIndex = r; break; }
        }
      } else {
        var keyVal = rowData[headers[0]];
        if (keyVal !== undefined && keyVal !== "") {
          for (var r = 1; r < data.length; r++) {
            if (data[r][0].toString().trim() == keyVal.toString().trim()) { exists = true; existsRowIndex = r; break; }
          }
        }
      }
      
      if (exists && existsRowIndex >= 0) {
        if (targetSheetName === "Setoran") {
          for (var c = 0; c < headers.length; c++) {
            var colName = headers[c], newVal = rowData[colName], oldVal = data[existsRowIndex][c];
            var oldValStr = oldVal ? oldVal.toString().trim() : "", newValStr = newVal ? newVal.toString().trim() : "";
            if (colName === "surah" || colName === "ayat" || colName === "tilawah" || colName === "halaman" || colName === "hadits" || colName === "kualitas" || colName === "nama_ustadz") {
              if (newValStr !== "" && newValStr !== "-") sheet.getRange(existsRowIndex + 1, c + 1).setValue(newVal);
            } else if (colName === "catatan") {
              if (newValStr !== "" && newValStr !== "-") {
                if (oldValStr !== "" && oldValStr !== "-") {
                  if (oldValStr.indexOf(newValStr) === -1) sheet.getRange(existsRowIndex + 1, c + 1).setValue(oldValStr + "; " + newValStr);
                } else sheet.getRange(existsRowIndex + 1, c + 1).setValue(newVal);
              }
            }
          }
        } else {
          for (var c = 0; c < headers.length; c++) {
            var val = rowData[headers[c]];
            if (val !== undefined) sheet.getRange(existsRowIndex + 1, c + 1).setValue(val);
          }
        }
        return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Diperbarui!" })).setMimeType(ContentService.MimeType.JSON);
      } else {
        var newRow = headers.map(function(h) { var val = rowData[h]; return val !== undefined ? val : ""; });
        sheet.appendRow(newRow);
        return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Ditambahkan!" })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    if (action === "clearCategory") {
      var deletedCount = 0;
      if (sheet.getLastRow() > 1) {
        deletedCount = sheet.getLastRow() - 1;
        sheet.deleteRows(2, deletedCount);
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true, cleared: true, deleted: deletedCount })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "delete") {
      var targetId = payload.id;
      var deletedCount = 0;
      if (targetSheetName === "MataPelajaran") {
        var parts = targetId.split("_"), targetKelas = parts[0], targetUser = parts[1] || "admin";
        var idxKelas = headers.indexOf("id_kelas"), idxCreatedBy = headers.indexOf("created_by");
        if (idxCreatedBy === -1) idxCreatedBy = headers.indexOf("createdby");
        for (var r = data.length - 1; r >= 1; r--) {
          var rowKelas = data[r][idxKelas].toString(), rowUser = idxCreatedBy >= 0 ? data[r][idxCreatedBy].toString() : "admin";
          if (rowKelas === targetKelas && rowUser === targetUser) { sheet.deleteRow(r + 1); deletedCount++; }
        }
      } else {
        for (var r = data.length - 1; r >= 1; r--) {
          if (data[r][0].toString() == targetId.toString()) { sheet.deleteRow(r + 1); deletedCount++; }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true, deleted: deletedCount })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "update") {
      var rowData = payload.data;
      var updated = false;
      if (targetSheetName === "MataPelajaran") {
        var targetKelas = rowData.id_kelas.toString(), targetUser = (rowData.created_by || rowData.createdby || requestedUsername || "admin").toString();
        var idxKelas = headers.indexOf("id_kelas"), idxCreatedBy = headers.indexOf("created_by");
        if (idxCreatedBy === -1) idxCreatedBy = headers.indexOf("createdby");
        for (var r = 1; r < data.length; r++) {
          var rowKelas = data[r][idxKelas].toString(), rowUser = idxCreatedBy >= 0 ? data[r][idxCreatedBy].toString() : "admin";
          if (rowKelas === targetKelas && rowUser === targetUser) {
            for (var c = 0; c < headers.length; c++) {
              var val = rowData[headers[c]];
              if (val !== undefined) sheet.getRange(r + 1, c + 1).setValue(val);
            }
            updated = true;
            break;
          }
        }
      } else {
        var keyFieldValue = rowData[headers[0]];
        for (var r = 1; r < data.length; r++) {
          if (data[r][0].toString() == keyFieldValue.toString()) {
            for (var c = 0; c < headers.length; c++) {
              var val = rowData[headers[c]];
              if (val !== undefined) sheet.getRange(r + 1, c + 1).setValue(val);
            }
            updated = true;
            break;
          }
        }
      }
      if (!updated) {
        var newRow = headers.map(function(h) { var val = rowData[h]; return val !== undefined ? val : ""; });
        sheet.appendRow(newRow);
        updated = true;
      }
      return ContentService.createTextOutput(JSON.stringify({ success: updated })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "saveSettings") {
      var rowData = payload.data;
      if (targetSheetName === "Pengaturan") {
        var lastColumn = sheet.getLastColumn();
        var currentHeaders = [];
        if (lastColumn > 0) {
          currentHeaders = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(function(h) { return h.toString().toLowerCase().trim(); });
        }
        var idxPUsername = currentHeaders.indexOf("username");
        if (idxPUsername === -1) {
          sheet.insertColumnBefore(1);
          sheet.getRange(1, 1).setValue("username");
          currentHeaders.unshift("username");
          idxPUsername = 0;
        }
        var requiredHeaders = ["id_drive", "link_website", "web_config_json"];
        for (var j = 0; j < requiredHeaders.length; j++) {
          var reqHeader = requiredHeaders[j];
          if (currentHeaders.indexOf(reqHeader.toLowerCase()) === -1) {
            sheet.getRange(1, sheet.getLastColumn() + 1).setValue(reqHeader);
            currentHeaders.push(reqHeader.toLowerCase());
          }
        }
        var webSheet = ss.getSheetByName("website") || ss.insertSheet("website");
        ensureWebsiteSheetHeaders(webSheet);
        
        var freshHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(function(h) { return h.toString().trim(); });
        var freshData = sheet.getDataRange().getValues();
        var existsRowIndex = -1;
        if (requestedUsername !== "") {
          for (var r = 1; r < freshData.length; r++) {
            if (freshData[r][idxPUsername].toString().trim().toLowerCase() === requestedUsername) { existsRowIndex = r; break; }
          }
        }
        if (existsRowIndex === -1) {
          var newRow = freshHeaders.map(function() { return ""; });
          sheet.appendRow(newRow);
          existsRowIndex = sheet.getLastRow() - 1;
        }
        sheet.getRange(existsRowIndex + 1, idxPUsername + 1).setValue(requestedUsername);
        for (var c = 0; c < freshHeaders.length; c++) {
          var colKey = freshHeaders[c];
          if (colKey.toLowerCase() === "username") continue;
          var val = rowData[colKey];
          if (val !== undefined) sheet.getRange(existsRowIndex + 1, c + 1).setValue(val);
        }
        return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Aksi tidak dikenal." })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    try { lock.releaseLock(); } catch (lockError) {}
  }
}

function ensureWebsiteSheetHeaders(sheet) {
  var defaultHeaders = [
    "username", "judul_hero", "sub_judul_hero", "gambar_hero", "judul_profil", "profil", 
    "program_1_judul", "program_1_gambar", "program_1_ket", 
    "program_2_judul", "program_2_gambar", "program_2_ket", 
    "program_3_judul", "program_3_gambar", "program_3_ket", 
    "program_4_judul", "program_4_gambar", "program_4_ket",
    "link_peta", "link_video",
    "testi_1_nama", "testi_1_jabatan", "testi_1_pesan",
    "testi_2_nama", "testi_2_jabatan", "testi_2_pesan",
    "testi_3_nama", "testi_3_jabatan", "testi_3_pesan"
  ];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(defaultHeaders);
    return defaultHeaders;
  }
  var currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var currentHeadersLower = currentHeaders.map(function(h) { return h.toString().trim().toLowerCase(); });
  for (var i = 0; i < defaultHeaders.length; i++) {
    var defH = defaultHeaders[i];
    if (currentHeadersLower.indexOf(defH.toLowerCase()) === -1) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(defH);
      currentHeadersLower.push(defH.toLowerCase());
    }
  }
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(function(h) { return h.toString().trim(); });
}

function getOrCreateAutoFolder(ss) {
  var folderName = "SIM TPQ - Unggahan Media (" + ss.getName() + ")";
  var folders = DriveApp.getFoldersByName(folderName);
  var f;
  if (folders.hasNext()) { f = folders.next(); } else { f = DriveApp.createFolder(folderName); }
  try { f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) {}
  return f;
}
`;
