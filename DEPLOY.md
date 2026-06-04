# Deployment Guide — Eklesia CMS Landing Page

## Daftar Isi
1. [Google Sheet & Apps Script](#1-google-sheet--apps-script)
2. [Set Environment Variable di Vercel](#2-set-environment-variable-di-vercel)
3. [Deploy ke Vercel](#3-deploy-ke-vercel)
4. [Testing](#4-testing)

---

## 1. Google Sheet & Apps Script

### 1.1 Buat Google Sheet
- Buka https://sheets.new
- Ganti nama sheet (contoh: "Eklesia — Pilot Signup")
- Biarkan sheet kosong (header akan terisi otomatis)

### 1.2 Buat Apps Script
- Klik menu **Extensions > Apps Script**
- Hapus semua kode default (`function myFunction() { ... }`)
- Buka file `gsheet-webhook.gs`, copy seluruh isinya
- Paste ke editor Apps Script
- Klik tombol **Save** (atau Ctrl+S), beri nama project "Eklesia Webhook"

### 1.3 Deploy Web App
- Klik tombol **Deploy > New deployment**
- Pilih **Type:** Web App
- Isi **Description:** (opsional, misal "Eklesia form receiver")
- **Execute as:** Me
- **Who has access:** Anyone
- Klik **Deploy**

### 1.4 Copy Web App URL
- Setelah deploy, akan muncul popup dengan URL seperti:
  ```
  https://script.google.com/macros/s/AKfycbwEXAMPLE/exec
  ```
- Klik **Copy**
- **Simpan URL ini** — akan dipakai di Langkah 2

> **Penting:** Setiap kali mengedit kode Apps Script, Anda harus **Deploy > New deployment** lagi (atau deploy versi baru) agar perubahan diterapkan.

---

## 2. Set Environment Variable di Vercel

Environment variable `GSCRIPT_WEBHOOK_URL` memberitahu Vercel Function kemana harus meneruskan data form.

### Opsi A — Via Vercel Dashboard (tanpa CLI)
1. Buka https://vercel.com
2. Masuk ke project Anda
3. **Settings > Environment Variables**
4. Isi:
   - **Name:** `GSCRIPT_WEBHOOK_URL`
   - **Value:** paste URL dari Langkah 1.4
   - **Environments:** Production (centang)
5. Klik **Save**

### Opsi B — Via Vercel CLI
```bash
vercel secret add GSCRIPT_WEBHOOK_URL https://script.google.com/macros/s/AKfycbwEXAMPLE/exec
```

Atau jika pakai `.env` file:

```bash
# Di mesin local Anda
echo "GSCRIPT_WEBHOOK_URL=https://script.google.com/macros/s/AKfycbwEXAMPLE/exec" >> .env

# lalu deploy
vercel --prod
```

---

## 3. Deploy ke Vercel

### Prasyarat
- Node.js terinstall
- Akun Vercel (daftar gratis di https://vercel.com)
- Vercel CLI (opsional, bisa via Git)

### Opsi A — Deploy via Git (recommended)
```bash
# 1. Buat repository di GitHub/GitLab/Bitbucket
# 2. Push project ke repository
git init
git add .
git commit -m "Initial deploy"
git remote add origin https://github.com/username/eklesia-landing.git
git push -u origin main

# 3. Di Vercel Dashboard, klik "Add New > Project"
# 4. Import repository Anda
# 5. Set environment variable GSCRIPT_WEBHOOK_URL
# 6. Klik Deploy
```

### Opsi B — Deploy via Vercel CLI
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy dari folder project
cd /home/bayu/Projects/CMS-landingpage
vercel --prod
```

### Opsi C — Deploy via Vercel Web (drag & drop)
1. Buka https://vercel.com/new
2. Pilih **Deploy without Git**
3. Drag & drop folder `CMS-landingpage` ke area upload
4. Set environment variable `GSCRIPT_WEBHOOK_URL`
5. Klik **Deploy**

### Yang akan terjadi saat deploy:
| File | Peran |
|---|---|
| `index.html` | Landing page (static) |
| `api/submit.js` | Vercel Serverless Function (Node.js) — proxy ke Google Script |
| `.env.example` | Template env (tidak dipakai Vercel) |
| `gsheet-webhook.gs` | Google Apps Script (tidak ikut diupload ke Vercel) |

---

## 4. Testing

### 4.1 Test form langsung
- Buka URL yang diberikan Vercel (misal `https://eklesia-landing.vercel.app`)
- Scroll ke bagian **Program Pilot**
- Isi form, klik **Daftar Sekarang**
- Tombol akan berubah jadi "✓ Terkirim!" jika berhasil

### 4.2 Cek Google Sheet
- Buka Google Sheet dari Langkah 1.1
- Baris pertama: header kolom (Timestamp, Gereja, Kota, dst.)
- Baris berikutnya: data submission yang baru masuk

### 4.3 Troubleshooting

**Tombol muncul "✗ Gagal, coba lagi"**
- Cek apakah `GSCRIPT_WEBHOOK_URL` sudah benar di Vercel Environment Variables
- Cek Apps Script — pastikan web app sudah di-deploy dan aksesnya "Anyone"
- Cek Vercel Function Logs: Dashboard > Project > Functions > `api/submit`

**Data tidak muncul di Sheet padahal tombol "✓ Terkirim"**
- Refresh sheet (kadang perlu refresh manual)
- Cek apakah sheet yang aktif adalah sheet yang benar
- Coba submit sekali lagi

**Error 502 di console browser**
- Vercel Function gagal menghubungi Google Script — periksa URL webhook

---

## Arsitektur

```
Browser                    Vercel                          Google
┌─────────┐    POST       ┌────────────────┐   POST       ┌──────────────┐
│  Form    │ ──────────▶  │ /api/submit.js  │ ──────────▶  │ Apps Script  │
│  HTML    │              │ (Node.js proxy) │              │ → Google Sheet
└─────────┘    JSON       └────────────────┘   JSON       └──────────────┘
                               ▲
                               │ env: GSCRIPT_WEBHOOK_URL
```

Mengapa pakai proxy:
- **Webhook URL tersembunyi** dari client (tidak terekspos di DevTools)
- **Response proper** — tahu pasti sukses/gagal
- **Bisa ganti backend** kapan saja tanpa edit frontend
- **Validasi & logging** bisa ditambahkan di masa depan
