// Google Apps Script — Webhook untuk menerima data dari Vercel Serverless Function
//
// Cara deploy:
//   1. Buka https://sheets.new → buat Google Sheet
//   2. Extensions > Apps Script
//   3. Paste kode ini, simpan (Ctrl+S)
//   4. Deploy > New deployment > Web App
//      - Execute as: Me
//      - Who has access: Anyone
//   5. Copy URL web app → set sebagai GSCRIPT_WEBHOOK_URL di Vercel
//   6. Selesai — sheet akan otomatis bikin header baris pertama

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // header otomatis
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp', 'Gereja', 'Kota', 'PIC', 'WhatsApp', 'Email', 'Jumlah Jemaat', 'Denominasi'
      ]);
    }

    const data = JSON.parse(e.postData.contents);
    sheet.appendRow([
      new Date(),
      data.gereja,
      data.kota,
      data.pic,
      data.wa,
      data.email,
      data.jumlah_jemaat,
      data.denominasi
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
