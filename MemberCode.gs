/**
 * SIM TPQ TERPADU - SCRIPT PENYIMPANAN DATA LEMBAGA (SPREADSHEET INTERN)
 * Menyinkronkan Santri, Wali, Keuangan, Setoran, dan Tabungan secara mandiri.
 * Mendukung pembatasan kurikulum (MataPelajaran) multi-admin secara privat.
 */

function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var defaultSheets = {
    "Santri": [["id_santri", "nama_santri", "nis", "halaqah", "username_ortu", "password_ortu", "jumlah_hafalan", "juz_hafal", "murojaah"], 
               ["S001", "Ahmad Faisal", "BQR1001", "Abu Bakar", "ahmad", "BQR1001", "2 Juz", "Juz 30, 29", "Lancar"],
               ["S002", "Budi Santoso", "BQR1002", "Abu Bakar", "budi", "BQR1002", "1 Juz", "Juz 30", "Perlu Pengulangan"]],
               
    "Users": [["username", "password", "nama_lengkap", "role"],
              ["ustadz", "123", "Ustadz Hanafi, M.Pd.", "Ustadz"],
              ["admin", "123", "Admin TPQ", "Admin"]],
               
    "Setoran": [["id_setoran", "tanggal", "id_santri", "nama_santri", "surah", "ayat", "tilawah", "halaman", "hadits", "kualitas", "catatan", "nama_ustadz"],
                ["SET1", "2026-06-11", "S001", "Ahmad Faisal", "Al-Mulk", "1-10", "-", "-", "-", "Mumtaz", "Hafalan tajwid sangat baik.", "Ustadz Hanafi"]],
                 
    "Pembayaran": [["id_pembayaran", "tanggal", "id_santri", "nama_santri", "kategori", "nominal", "status", "catatan", "nama_admin"],
                   ["PAY1", "2026-06-08", "S001", "Ahmad Faisal", "SPP Juni", "150000", "Lunas", "Pembayaran SPP Juni.", "Ustadz Hanafi"]],
                    
    "Kelas": [["id_kelas", "nama_kelas"],
              ["K1", "Abu Bakar"],
              ["K2", "Omar bin Khattab"]],
              
    "Tabungan": [["id", "id_santri", "nama_santri", "nominal", "tanggal"],
                 ["TB1", "S001", "Ahmad Faisal", "50000", "2026-06-11"]],
                 
    "Pengaturan": [["nama_lembaga", "nama_pimpinan", "logo", "alamat", "telepon", "email", "website", "pengumuman", "link_wa_json", "web_config_json", "id_drive", "link_website"],
                   ["SIM TPQ Baitul Quran Terpadu", "Ustadz Hanafi, M.Pd.", "https://cdn-icons-png.flaticon.com/512/3380/3380735.png", "Jl. Masjid Agung No. 12, Surabaya", "081234567890", "tahfidz@tpqbaitulquran.sch.id", "tpqbaitulquran.sch.id", "Selamat datang di portal informasi santri baitul quran terpadu.", '[]', '', '', '']],
                    
    "website": [["judul_hero", "gambar_hero", "profil", "program_1_judul", "program_1_gambar", "program_1_ket", "program_2_judul", "program_2_gambar", "program_2_ket", "program_3_judul", "program_3_gambar", "program_3_ket", "program_4_judul", "program_4_gambar", "program_4_ket", "testi_1_nama", "testi_1_jabatan", "testi_1_pesan", "testi_2_nama", "testi_2_jabatan", "testi_2_pesan", "testi_3_nama", "testi_3_jabatan", "testi_3_pesan"],
                ["Membentuk Generasi Qur'ani & Berakhlak Karimah", "https://images.unsplash.com/photo-1541829019-259276a7f013?auto=format&fit=crop&w=1200&q=80", "Lembaga kami menggabungkan tradisi talaqqi yang murni dengan sistem administrasi berbasis digital. Melalui SIM TPQ Terpadu, wali santri dapat memantau perkembangan hafalan harian anak (ziyadah & murojaah), rekap mutabaah ibadah harian, keuangan SPP, serta tabungan wadiah secara transparan dari mana saja.", "Tashih & Tilawati", "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=90&w=1000", "Bimbingan baca Al-Qur'an tartil sejak dini menggunakan metode interaktif yang menyenangkan.", "Tahfidzul Qur'an", "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=90&w=1000", "Program hafalan terukur dengan pendampingan intensif ustadz/ustadzah berpengalaman.", "Kajian Akhlak", "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=90&w=1000", "Membentuk kepribadian santri yang mulia, santun, dan taat beribadah.", "Hadits & Doa", "https://images.unsplash.com/photo-1609599006353-e629f1d40968?auto=format&fit=crop&q=90&w=1000", "Membimbing santri dengan ketulusan dan metode menyenangkan agar mencintai firman Allah."]],
                    
    "Informasi": [["id", "tipe", "tanggal", "id_santri", "nama_santri", "pesan"],
                  ["INF1", "Manual", "2026-06-12", "S001", "Ahmad Faisal", "Dimohon wali murid membawa kitab iqro esok hari."]],
                   
    "Mutabaah": [["id", "id_santri", "nama_santri", "tanggal", "subuh", "dzuhur", "ashar", "maghrib", "isya", "dhuha", "tilawah", "catatan"],
                 ["M1", "S001", "Ahmad Faisal", "2026-06-12", "Ya", "Ya", "Ya", "Ya", "Ya", "Tidak", "Ya", "Membaca bersama wali santri."]],
                 
    "MataPelajaran": [["id_kelas", "quran_methods", "hadits_doa", "tilawah_stages", "created_by"],
                      ["K1", '["Ziyadah","Murojaah","Sabaq","Sabqi","Manzil"]', '["Hadits Ke-1 tentang Niat","Doa Masuk WC"]', '["Iqro\' 1","Iqro\' 2","Iqro\' 3"]', "admin"]],
                      
    "Pendaftaran": [["id_pendaftaran", "nama_santri", "halaqah", "nama_ortu", "wa_ortu", "status", "nis_ditetapkan", "tanggal_daftar"],
                    ["REG1", "Hasan Al-Banna", "Abu Bakar", "Ahmad", "081234567890", "Pending", "-", "2026-06-30"]],

    "Agenda": [["id", "tipe", "tanggal", "waktu", "judul", "deskripsi", "status", "gambar", "created_by"],
               ["AGD1", "Agenda", "2026-07-06", "08.00 - 09.00", "Tahsin Al-Qur'an", "Belajar makhrajul huruf", "Berjalan", "", "admin"]]
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
        currentHeaders = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
        for (var k = 0; k < currentHeaders.length; k++) {
          currentHeaders[k] = currentHeaders[k].toString().toLowerCase().trim();
        }
      }
      
      for (var j = 0; j < targetHeaders.length; j++) {
        var headerName = targetHeaders[j];
        var cleanHeaderName = headerName.toString().toLowerCase().trim();
        
        if (currentHeaders.indexOf(cleanHeaderName) === -1) {
          var newColIndex = sheet.getLastColumn() + 1;
          sheet.getRange(1, newColIndex).setValue(headerName);
          
          var lastRow = sheet.getLastRow();
          if (lastRow > 1) {
            var defaultVal = "-";
            if (headerName === "created_by") {
              defaultVal = "admin";
            }
            sheet.getRange(2, newColIndex, lastRow - 1, 1).setValue(defaultVal);
          }
          currentHeaders.push(cleanHeaderName);
          Logger.log("Berhasil menambahkan kolom baru '" + headerName + "' ke sheet: " + sheetName);
        }
      }
    }
  }
  Logger.log("DATABASE PENYIMPANAN BERHASIL DIAGREGASI!");
}

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
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

    var sheets = ["Santri", "Setoran", "Pembayaran", "Kelas", "Tabungan", "Pengaturan", "Informasi", "Mutabaah", "MataPelajaran", "Pendaftaran", "website", "Agenda"];
    var resultObj = {};
    
    for (var i = 0; i < sheets.length; i++) {
      var sheet = ss.getSheetByName(sheets[i]);
      if (!sheet) continue;
      
      var data = sheet.getDataRange().getValues();
      var headers = data[0];
      var list = [];
      
      for (var r = 1; r < data.length; r++) {
        var rowObj = {};
        for (var c = 0; c < headers.length; c++) {
          var val = data[r][c];
          if (val instanceof Date || (val && Object.prototype.toString.call(val) === "[object Date]")) {
            val = Utilities.formatDate(val, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd");
          }
          rowObj[headers[c]] = val;
        }
        list.push(rowObj);
      }
      resultObj[sheets[i]] = list;
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
            var idxIdDrive = pHeaders.indexOf("id_drive");
            if (idxIdDrive !== -1) {
              var foundDriveId = pData[1][idxIdDrive];
              if (foundDriveId && foundDriveId.toString().trim() !== "") {
                folderId = foundDriveId.toString().trim();
              }
            }
          }
        } catch (readErr) {
        }
      }

      if (folderId && folderId.toString().trim() !== "") {
        try {
          folder = DriveApp.getFolderById(folderId);
        } catch (err) {
          folder = getOrCreateAutoFolder(ss);
          autoCreatedFolder = true;
        }
      } else {
        folder = getOrCreateAutoFolder(ss);
        autoCreatedFolder = true;
      }

      if (autoCreatedFolder && folder) {
        try {
          var pSheet = ss.getSheetByName("Pengaturan") || ss.insertSheet("Pengaturan");
          var pHeadersList = ["nama_lembaga", "nama_pimpinan", "logo", "alamat", "telepon", "email", "website", "pengumuman", "link_wa_json", "web_config_json", "id_drive", "link_website"];
          if (pSheet.getLastRow() === 0) {
            pSheet.appendRow(pHeadersList);
          }
          if (pSheet.getLastRow() === 1) {
            pSheet.appendRow(["", "", "", "", "", "", "", "", "", "", "", ""]);
          }
          var pData = pSheet.getDataRange().getValues();
          var pHeaders = pData[0];
          var idxIdDrive = pHeaders.indexOf("id_drive");
          if (idxIdDrive !== -1) {
            pSheet.getRange(2, idxIdDrive + 1).setValue(folder.getId());
          }
        } catch (saveErr) {
        }
      }

      if (fileContent.indexOf(",") > -1) {
        fileContent = fileContent.split(",")[1];
      }

      var decodedFile = Utilities.base64Decode(fileContent);
      var blob = Utilities.newBlob(decodedFile, mimeType, filename);
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      var fileUrl = "https://docs.google.com/uc?export=view&id=" + file.getId();

      var sheet = ss.getSheetByName("website") || ss.insertSheet("website");
      var defaultHeaders = ["judul_hero", "gambar_hero", "profil", "program_1_judul", "program_1_gambar", "program_1_ket", "program_2_judul", "program_2_gambar", "program_2_ket", "program_3_judul", "program_3_gambar", "program_3_ket", "program_4_judul", "program_4_gambar", "program_4_ket", "testi_1_nama", "testi_1_jabatan", "testi_1_pesan", "testi_2_nama", "testi_2_jabatan", "testi_2_pesan", "testi_3_nama", "testi_3_jabatan", "testi_3_pesan"];
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(defaultHeaders);
      }
      if (sheet.getLastRow() === 1) {
        sheet.appendRow(["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
      }

      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      var targetCol = "";
      if (fieldName === "hero") targetCol = "gambar_hero";
      else if (fieldName === "program_1") targetCol = "program_1_gambar";
      else if (fieldName === "program_2") targetCol = "program_2_gambar";
      else if (fieldName === "program_3") targetCol = "program_3_gambar";
      else if (fieldName === "program_4") targetCol = "program_4_gambar";
      else if (fieldName === "agenda_image") {
        // Agenda images: only upload to Drive, frontend saves URL via add/update
        return ContentService.createTextOutput(JSON.stringify({ success: true, url: fileUrl })).setMimeType(ContentService.MimeType.JSON);
      }

      if (targetCol) {
        var idx = headers.indexOf(targetCol);
        if (idx !== -1) {
          sheet.getRange(2, idx + 1).setValue(fileUrl);
        }
      }

      return ContentService.createTextOutput(JSON.stringify({ success: true, url: fileUrl })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "saveWebsiteData") {
      var webData = payload.data;
      var sheet = ss.getSheetByName("website") || ss.insertSheet("website");
      var defaultHeaders = ["judul_hero", "gambar_hero", "profil", "program_1_judul", "program_1_gambar", "program_1_ket", "program_2_judul", "program_2_gambar", "program_2_ket", "program_3_judul", "program_3_gambar", "program_3_ket", "program_4_judul", "program_4_gambar", "program_4_ket", "testi_1_nama", "testi_1_jabatan", "testi_1_pesan", "testi_2_nama", "testi_2_jabatan", "testi_2_pesan", "testi_3_nama", "testi_3_jabatan", "testi_3_pesan"];
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(defaultHeaders);
      }
      if (sheet.getLastRow() === 1) {
        sheet.appendRow(["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
      }

      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      for (var c = 0; c < headers.length; c++) {
        var colKey = headers[c].toString().trim();
        var val = webData[colKey];
        if (val !== undefined) {
          sheet.getRange(2, c + 1).setValue(val);
        }
      }

      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Kustomisasi website berhasil disimpan!" })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "login_ustadz") {
      var usernameInput = payload.username || "";
      var passwordInput = payload.password || "";
      var userSheet = ss.getSheetByName("Users");
      if (!userSheet) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Tabel Users kosong." })).setMimeType(ContentService.MimeType.JSON);
      }
      
      var uData = userSheet.getDataRange().getValues();
      var uHeaders = uData[0];
      var idxUsername = uHeaders.indexOf("username");
      var idxPassword = uHeaders.indexOf("password");
      var idxNama = uHeaders.indexOf("nama_lengkap");
      var idxRole = uHeaders.indexOf("role");
      
      for (var r = 1; r < uData.length; r++) {
        var sheetUser = uData[r][idxUsername].toString().trim().toLowerCase();
        var sheetPass = uData[r][idxPassword].toString().trim();
        
        if (sheetUser === usernameInput.toLowerCase().trim() && sheetPass === passwordInput.toString().trim()) {
          return ContentService.createTextOutput(JSON.stringify({
            success: true,
            user: { role: uData[r][idxRole], nama_lengkap: uData[r][idxNama], id_santri: null, username: uData[r][idxUsername] }
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Akses login ditolak!" })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "login_wali") {
      var namaInput = payload.nama_santri || "";
      var nisInput = payload.nis || "";
      var santriSheet = ss.getSheetByName("Santri");
      if (!santriSheet) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Tabel Santri kosong." })).setMimeType(ContentService.MimeType.JSON);
      }
      
      var sData = santriSheet.getDataRange().getValues();
      var sHeaders = sData[0];
      var idxNamaS = sHeaders.indexOf("nama_santri");
      var idxNis = sHeaders.indexOf("nis");
      var idxIdS = sHeaders.indexOf("id_santri");
      
      for (var r = 1; r < sData.length; r++) {
        var sheetNama = sData[r][idxNamaS].toString().trim().toLowerCase();
        var sheetNis = sData[r][idxNis].toString().trim().toLowerCase();
        
        if (sheetNama === namaInput.toLowerCase().trim() && sheetNis === nisInput.toLowerCase().trim()) {
          return ContentService.createTextOutput(JSON.stringify({
            success: true,
            user: { role: "OrangTua", nama_lengkap: "Wali dari " + sData[r][idxNamaS], id_santri: sData[r][idxIdS] }
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Identitas Santri tidak terverifikasi!" })).setMimeType(ContentService.MimeType.JSON);
    }
    
    var sheet = ss.getSheetByName(targetSheetName);
    if (!sheet) {
      if (targetSheetName === "Pengaturan") {
        sheet = ss.insertSheet("Pengaturan");
        var headersList = ["nama_lembaga", "nama_pimpinan", "logo", "alamat", "telepon", "email", "website", "pengumuman", "link_wa_json", "web_config_json", "id_drive", "link_website"];
        sheet.appendRow(headersList);
        sheet.appendRow(["", "", "", "", "", "", "", "", "", "", "", ""]);
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
      
      if (targetSheetName === "MataPelajaran") {
        var targetKelas = (rowData.id_kelas || rowData.idkelas || "").toString().trim();
        var targetUser = (rowData.created_by || rowData.createdby || "admin").toString().trim();
        var idxKelas = headers.indexOf("id_kelas");
        var idxCreatedBy = headers.indexOf("created_by");
        if (idxCreatedBy === -1) idxCreatedBy = headers.indexOf("createdby");
        
        for (var r = 1; r < data.length; r++) {
          var rowKelas = data[r][idxKelas].toString().trim();
          var rowUser = idxCreatedBy >= 0 ? data[r][idxCreatedBy].toString().trim() : "admin";
          if (rowKelas === targetKelas && rowUser.toLowerCase() === targetUser.toLowerCase()) {
            exists = true;
            existsRowIndex = r;
            break;
          }
        }
      } else if (targetSheetName === "Setoran") {
        var idxTanggal = headers.indexOf("tanggal");
        var idxIdSantri = headers.indexOf("id_santri");
        var targetTgl = (rowData.tanggal || "").toString().trim();
        if (targetTgl.indexOf("T") !== -1) {
          targetTgl = targetTgl.split("T")[0];
        }
        var targetIdSantri = (rowData.id_santri || "").toString().trim();
        
        for (var r = 1; r < data.length; r++) {
          var rowTgl = data[r][idxTanggal];
          if (rowTgl instanceof Date || (rowTgl && Object.prototype.toString.call(rowTgl) === "[object Date]")) {
            rowTgl = Utilities.formatDate(rowTgl, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd");
          } else {
            rowTgl = rowTgl.toString().trim();
            if (rowTgl.indexOf("T") !== -1) {
              rowTgl = rowTgl.split("T")[0];
            }
          }
          var rowIdSantri = data[r][idxIdSantri].toString().trim();
          
          if (rowTgl === targetTgl && rowIdSantri === targetIdSantri) {
            exists = true;
            existsRowIndex = r;
            break;
          }
        }
      } else {
        var keyVal = rowData[headers[0]];
        if (keyVal !== undefined && keyVal !== "") {
          for (var r = 1; r < data.length; r++) {
            if (data[r][0].toString().trim() == keyVal.toString().trim()) {
              exists = true;
              existsRowIndex = r;
              break;
            }
          }
        }
      }
      
      if (exists && existsRowIndex >= 0) {
        if (targetSheetName === "Setoran") {
          for (var c = 0; c < headers.length; c++) {
            var colName = headers[c];
            var newVal = rowData[colName];
            var oldVal = data[existsRowIndex][c];
            
            var oldValStr = (oldVal !== null && oldVal !== undefined) ? oldVal.toString().trim() : "";
            var newValStr = (newVal !== null && newVal !== undefined) ? newVal.toString().trim() : "";
            
            if (colName === "surah" || colName === "ayat" || colName === "tilawah" || colName === "halaman" || colName === "hadits" || colName === "kualitas" || colName === "nama_ustadz") {
              if (newValStr !== "" && newValStr !== "-") {
                sheet.getRange(existsRowIndex + 1, c + 1).setValue(newVal);
              }
            } else if (colName === "catatan") {
              if (newValStr !== "" && newValStr !== "-") {
                if (oldValStr !== "" && oldValStr !== "-") {
                  if (oldValStr.indexOf(newValStr) === -1) {
                    sheet.getRange(existsRowIndex + 1, c + 1).setValue(oldValStr + "; " + newValStr);
                  }
                } else {
                  sheet.getRange(existsRowIndex + 1, c + 1).setValue(newVal);
                }
              }
            }
          }
        } else {
          for (var c = 0; c < headers.length; c++) {
            var val = rowData[headers[c]];
            if (val !== undefined) {
              sheet.getRange(existsRowIndex + 1, c + 1).setValue(val);
            }
          }
        }
        return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Baris sudah ada, berhasil diperbarui!" })).setMimeType(ContentService.MimeType.JSON);
      } else {
        var newRow = [];
        for (var i = 0; i < headers.length; i++) {
          var val = rowData[headers[i]];
          newRow.push(val !== undefined ? val : "");
        }
        sheet.appendRow(newRow);
        return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Berhasil menambahkan baris baru!" })).setMimeType(ContentService.MimeType.JSON);
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
        var parts = targetId.split("_");
        var targetKelas = parts[0];
        var targetUser = parts[1] || "admin";
        var idxKelas = headers.indexOf("id_kelas");
        var idxCreatedBy = headers.indexOf("created_by");
        if (idxCreatedBy === -1) idxCreatedBy = headers.indexOf("createdby");
        
        for (var r = data.length - 1; r >= 1; r--) {
          var rowKelas = data[r][idxKelas].toString();
          var rowUser = idxCreatedBy >= 0 ? data[r][idxCreatedBy].toString() : "admin";
          if (rowKelas === targetKelas && rowUser === targetUser) {
            sheet.deleteRow(r + 1);
            deletedCount++;
          }
        }
      } else {
        for (var r = data.length - 1; r >= 1; r--) {
          if (data[r][0].toString() == targetId.toString()) {
            sheet.deleteRow(r + 1);
            deletedCount++;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true, deleted: deletedCount })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "update") {
      var rowData = payload.data;
      var updated = false;
      
      if (targetSheetName === "MataPelajaran") {
        var targetKelas = rowData.id_kelas.toString();
        var targetUser = (rowData.created_by || rowData.createdby || "admin").toString();
        var idxKelas = headers.indexOf("id_kelas");
        var idxCreatedBy = headers.indexOf("created_by");
        if (idxCreatedBy === -1) idxCreatedBy = headers.indexOf("createdby");
        
        for (var r = 1; r < data.length; r++) {
          var rowKelas = data[r][idxKelas].toString();
          var rowUser = idxCreatedBy >= 0 ? data[r][idxCreatedBy].toString() : "admin";
          if (rowKelas === targetKelas && rowUser === targetUser) {
            for (var c = 0; c < headers.length; c++) {
              var val = rowData[headers[c]];
              if (val !== undefined) {
                sheet.getRange(r + 1, c + 1).setValue(val);
              }
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
              if (val !== undefined) {
                sheet.getRange(r + 1, c + 1).setValue(val);
              }
            }
            updated = true;
            break;
          }
        }
      }
      
      if (!updated) {
        var newRow = [];
        for (var i = 0; i < headers.length; i++) {
          var val = rowData[headers[i]];
          newRow.push(val !== undefined ? val : "");
        }
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
          currentHeaders = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
          for (var k = 0; k < currentHeaders.length; k++) {
            currentHeaders[k] = currentHeaders[k].toString().toLowerCase().trim();
          }
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
        var defaultHeaders = ["judul_hero", "gambar_hero", "profil", "program_1_judul", "program_1_gambar", "program_1_ket", "program_2_judul", "program_2_gambar", "program_2_ket", "program_3_judul", "program_3_gambar", "program_3_ket", "program_4_judul", "program_4_gambar", "program_4_ket", "testi_1_nama", "testi_1_jabatan", "testi_1_pesan", "testi_2_nama", "testi_2_jabatan", "testi_2_pesan", "testi_3_nama", "testi_3_jabatan", "testi_3_pesan"];
        if (webSheet.getLastRow() === 0) {
          webSheet.appendRow(defaultHeaders);
        }
        if (webSheet.getLastRow() === 1) {
          webSheet.appendRow(["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
        }
        
        if (sheet.getLastRow() < 2) {
          var emptyRow = [];
          for (var col = 0; col < sheet.getLastColumn(); col++) {
            emptyRow.push("");
          }
          sheet.appendRow(emptyRow);
        }
        
        var freshData = sheet.getDataRange().getValues();
        var freshHeaders = freshData[0];
        
        for (var c = 0; c < freshHeaders.length; c++) {
          var colKey = freshHeaders[c].toString().trim();
          var val = rowData[colKey];
          if (val !== undefined) {
            sheet.getRange(2, c + 1).setValue(val);
          }
        }
        return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Aksi tidak dikenal." })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    try {
      lock.releaseLock();
    } catch (lockError) {
    }
  }
}

function getOrCreateAutoFolder(ss) {
  var folderName;
  if (ss && ss.getName) {
    folderName = "SIM TPQ - Unggahan Media (" + ss.getName() + ")";
  } else {
    folderName = "SIM TPQ - Unggahan Media";
  }
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    var f = folders.next();
    f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return f;
  } else {
    var newFolder = DriveApp.createFolder(folderName);
    newFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return newFolder;
  }
}
