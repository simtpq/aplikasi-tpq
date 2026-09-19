/**
 * SIM TPQ TERPADU - SCRIPT MASTER LOGIN & REGISTRY (SPREADSHEET 1)
 * Untuk manajemen otentikasi pusat multi-lembaga dan tautan Apps Script eksternal.
 */

// Inisialisasi awal tabel master
function setupMasterDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = "Lembaga";
  var sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    var headers = [["username", "password", "link_appscript", "nama_lembaga", "status", "code_tpq"]];
    var demoData = [
      ["tpq_baitulquran", "password123", "https://script.google.com/macros/s/AKfycbz9PenbTHu8F5LY_J_K3idtof8Wc--992xKmf9SRPXOKNgcwNhElFWGr9ezYb-XbyU/exec", "TPQ Baitul Quran Terpadu", "Aktif", "BQR1"]
    ];
    sheet.getRange(1, 1, 1, 6).setValues(headers);
    sheet.getRange(2, 1, 1, 6).setValues(demoData);
  }
  Logger.log("Database Master Registry berhasil diinisialisasi!");
}

// Mengambil daftar lembaga aktif untuk lookup wali santri di client-aplikasi
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
        "    <h2 style='margin:0 0 10px;font-size:22px;font-weight:600;color:#0f172a;'>SIM TPQ - Server Registrasi Terlindungi</h2>" +
        "    <p style='margin:0 0 24px;font-size:14px;line-height:1.6;color:#64748b;'>Node registry master untuk otentikasi SIM TPQ aktif dan terproteksi dengan baik. Akses langsung melalui penjelajah web dibatasi untuk menjaga keamanan dan kerahasiaan tautan sistem.</p>" +
        "    <div style='border-top:1px solid #e2e8f0;padding-top:16px;font-size:12px;color:#94a3b8;font-family:monospace;'>STATUS: REGISTRY AKTIF & AMAN</div>" +
        "  </div>" +
        "</div>"
      ).setTitle("SIM TPQ - Server Registrasi Terlindungi");
    }
    
    var sheet = ss.getSheetByName("Lembaga");
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Sheet 'Lembaga' belum diisiasikan." })).setMimeType(ContentService.MimeType.JSON);
    }
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var list = [];
    
    for (var r = 1; r < data.length; r++) {
      var rowObj = {};
      for (var c = 0; c < headers.length; c++) {
        rowObj[headers[c]] = data[r][c];
      }
      
      // Amankan password, jangan kirim password asli ke klien tanpa login
      list.push({
        username: rowObj.username,
        nama_lembaga: rowObj.nama_lembaga,
        link_appscript: rowObj.link_appscript,
        status: rowObj.status,
        code_tpq: rowObj.code_tpq || ""
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: list
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Menjalankan validasi kredensial Admin Lembaga
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Lembaga");
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Sheet 'Lembaga' tidak ditemukan!" })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "login_admin") {
      var usernameInput = (payload.username || "").toString().trim().toLowerCase();
      var passwordInput = (payload.password || "").toString().trim();
      
      var data = sheet.getDataRange().getValues();
      var headers = data[0];
      
      var idxUser = headers.indexOf("username");
      var idxPass = headers.indexOf("password");
      var idxLink = headers.indexOf("link_appscript");
      var idxNama = headers.indexOf("nama_lembaga");
      var idxStatus = headers.indexOf("status");
      var idxCode = headers.indexOf("code_tpq");
      
      for (var r = 1; r < data.length; r++) {
        var shUser = data[r][idxUser].toString().trim().toLowerCase();
        var shPass = data[r][idxPass].toString().trim();
        var shStatus = data[r][idxStatus].toString().trim().toLowerCase();
        
        if (shUser === usernameInput && shPass === passwordInput) {
          if (shStatus === "aktif" || shStatus === "aktiv") {
            return ContentService.createTextOutput(JSON.stringify({
              success: true,
              link_appscript: data[r][idxLink].toString().trim(),
              nama_lembaga: data[r][idxNama].toString().trim(),
              status: "Aktif",
              code_tpq: idxCode !== -1 ? data[r][idxCode].toString().trim() : ""
            })).setMimeType(ContentService.MimeType.JSON);
          } else {
            return ContentService.createTextOutput(JSON.stringify({
              success: false,
              error: "Status lembaga Anda tidak aktif. Silakan hubungi super-administrator."
            })).setMimeType(ContentService.MimeType.JSON);
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Kredensial Pengurus salah!" })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Aksi pusat tidak dikenali." })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}
