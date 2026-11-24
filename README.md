# CloveERP - Sistem Terpadu Perajangan Cengkeh, HRIS & Laporan Keuangan

> **Sistem Enterprise Terintegrasi: Operasional Pabrik Rajang Cengkeh ↔ HRIS Payroll Tenaga Kerja ↔ Laporan Keuangan & HPP Manufaktur**  
> Dibangun dengan Next.js 14 App Router, TypeScript, dan Tailwind CSS. Siap dideploy ke Vercel dengan satu klik.

---

## 🌟 Modul & Fitur Terintegrasi

### 1. Sistem Laporan Keuangan, Akuntansi Manufaktur & Corporate Health Check
- **Laporan Laba Rugi Komprehensif (*Income Statement / P&L*):**
  - Penjualan Cengkeh Rajang Prima ke pabrikan rokok (0.4mm, 0.6mm, 0.8mm, 1.0mm).
  - Penjualan Byproduct: Debu Siklon (industri dupa) dan Gagang Cengkeh (minyak atsiri).
  - Harga Pokok Penjualan (HPP / COGS) mencakup bahan baku, upah tenaga kerja langsung dari HRIS, dan overhead pabrik (listrik, asah pisau, kemasan, depresiasi).
  - EBITDA, Beban Logistik Armada Truk, Beban Gaji Manajemen, Pajak PPh Badan (22%), dan Laba Bersih (*Net Income*).
- **Neraca Keuangan (*Balance Sheet*):**
  - Aktiva Lancar (Kas Bank, Piutang Usaha Klien, Persediaan Bahan Mentah, Rajang Prima, Debu & Gagang, Persediaan Sparepart).
  - Aktiva Tetap (Mesin Perajang Rotary/Guillotine, Truk Box, Akumulasi Penyusutan).
  - Kewajiban (Hutang Petani Cengkeh, Akrual Gaji HRIS, Hutang Pajak).
  - Ekuitas (Modal Disetor, Laba Ditahan, Laba Tahun Berjalan) dengan validasi keseimbangan otomatis (*Assets = Liabilities + Equity*).
- **Corporate Health Check & Board Reporting (Integrasi `corporate-health-check` TQ Board Insight):**
  - **Skor Kesehatan Altman Z'' (Emerging Markets):** $Z'' = 6.56 X_1 + 3.26 X_2 + 6.72 X_3 + 1.05 X_4$ (Safe Zone $>2.60$, Grey Zone $1.10 - 2.60$, Distress Zone $<1.10$).
  - **Dekomposisi DuPont 3-Tahap:** $\text{ROE} = \text{Net Profit Margin} \times \text{Asset Turnover} \times \text{Equity Multiplier}$.
  - **28 Rasio Finansial Deterministik:** Likuiditas (Current, Quick, Cash Ratio), Profitabilitas (GPM, OPM, EBITDA, NPM, ROA, ROE), Solvabilitas (DER, Debt-to-Assets, Net Debt/EBITDA), Efisiensi Siklus Kas (DIO, DSO, DPO, CCC), dan Kualitas Kas (CFO/Net Income, FCF Margin, Capex/Depr).
  - **Uji Ketahanan Kas 5 Skenario (Cash Stress Test):** Penjualan $-15\%$, Kenaikan Harga Bahan $+10\%$, Keterlambatan Piutang $+30$ hari, Percepatan Pembayaran Pemasok $-15$ hari, dan Resesi Gabungan; dilengkapi kalkulasi arus kas bulanan dan runway kas.
  - **Benchmark Emiten Tbk Industri Rokok & Tembakau IDX:** Komparasi langsung dengan PT Gudang Garam Tbk (`GGRM`), PT HM Sampoerna Tbk (`HMSP`), dan PT Wismilak Inti Makmur Tbk (`WIIM`).
  - **Pemetaan Red Flag Operasional Pabrik:** Gejala Finansial $\rightarrow$ Kemungkinan Akar Masalah Mesin/Operasional $\rightarrow$ Data Pembukti ERP $\rightarrow$ Pertanyaan Agenda Rapat Direksi & CFO.
  - **Ekspor Format Standar `lk.json` & Bridge CLI Python:** Skrip `scripts/healthcheck_bridge.py` untuk mengotomatisasi generasi board brief HTML/Markdown 1-halaman.

### 2. Modul Gudang Sparepart, Umur Part & CMMS Mesin (*Sparepart Lifespan & Maintenance*)
- Standarisasi Koding Mesin (`MSN-RC-01` s/d `MSN-PK-02`) dan Koding Komponen Part (`PRT-BLD-01`, `PRT-BRG-01`, `PRT-BLT-01`, `PRT-CYC-01`).
- Pelacak Umur Komponen (*Part Lifespan Tracker*) berbasis jam kerja aktual pisau & bearing dengan peringatan aus otomatis (*Normal*, *Warning*, *Overdue Replace*).
- Alur Permintaan Suku Cadang (*Requisition Flow*) terhubung nomor mesin tujuan dan approval kepala teknisi.
- Kartu Mutasi Stok Masuk/Keluar Gudang Sparepart terhubung modul pengadaan PO dan penilaian persediaan neraca (Akun COA 1204).

### 2. Integrasi Real-Time dengan HRIS Core System (`hris-core-system`)
- Terhubung langsung dengan basis data kepegawaian & payroll HRIS:
  - **Tenaga Kerja Langsung (TKL - Akun COA 5102):** Upah operator mesin perajang (Budi Santoso, Agus Riyadi, Hendra Gunawan) dan kalkulasi lembur otomatis untuk pesanan prioritas (*rush orders*).
  - **Biaya Overhead Pabrik (BOP - Akun COA 5104):** Upah teknisi pengasahan pisau, maintenance mesin, QC analyst, dan logistik gudang.
  - **Beban Usaha / OPEX (Akun COA 6102):** Gaji direksi pabrik, HR specialist, dan tim finance & accounting.
- Tombol **"Sinkronkan Payroll HRIS"** untuk sinkronisasi beban gaji dan lembur secara real-time.

### 3. Penerimaan Order & Antrian Produksi (*Order Intake*)
- Pencatatan PO klien (PT Gudang Garam Tbk, PT Djarum, HM Sampoerna, PT Wismilak, dll).
- Pemilihan spesifikasi ukuran rajangan (`0.4mm`, `0.6mm`, `0.8mm`, `1.0mm`, `1.2mm`).
- Alokasi mesin dan prioritas pengerjaan (*Standard*, *Rush*, *Export*).

### 4. Monitoring Pengerjaan & Parameter Hasil Mutu (*Quality Control*)
- Pencatatan hasil per batch: Bahan Baku Masuk, Hasil Rajang Prima, Debu Siklon, Gagang Sisa, dan Kadar Air (*Moisture %*).
- Evaluasi otomatis parameter standar:
  - Rendemen Prima: $\ge 88.0\%$ (Target Optimal $90\%$).
  - Debu Siklon: $\le 6.5\%$ (Ambang batas maksimum $7.5\%$).
  - Kadar Air (*Moisture Content*): $11.5\% - 13.0\%$.

### 5. Manajemen Mesin, Input Kapasitas & Evaluasi Keterlambatan
- Penambahan armada mesin baru dengan spesifikasi pisau dan target efisiensi OEE.
- Slider kapasitas operasional dinamis ($50 - 600\text{ kg/jam}$).
- *Delay Evaluation Engine* yang membandingkan proyeksi penyelesaian dengan deadline pesanan.

### 6. Monitoring Stock In / Out Barang & Pengiriman (*Logistics & Dispatch*)
- Inventori 4 kategori komoditas pabrik dengan mutasi stok masuk/keluar terverifikasi.
- Penerbitan Surat Jalan (*Delivery Order* / DO) dengan nomor plat truk, driver, dan status live tracking.

---

## 🚀 Menjalankan Secara Lokal

```bash
# 1. Clone repository
git clone https://github.com/jonathantqindonesia2-boop/clove-shredding-erp.git
cd clove-shredding-erp

# 2. Install dependensi
npm install

# 3. Jalankan server pengembang
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

---

## ☁️ Deployment ke Vercel

1. Buka dashboard [Vercel](https://vercel.com).
2. Hubungkan repository `jonathantqindonesia2-boop/clove-shredding-erp`.
3. Klik **"Deploy"** (Otomatis mendeteksi Next.js 14).

---

## 🛠️ Arsitektur Teknologi

- **Framework:** Next.js 14 (App Router)
- **Library:** React 18
- **Bahasa:** TypeScript
- **Styling:** Tailwind CSS
- **Ikon:** Lucide React
- **Integrasi Eksternal:** HRIS Core System (`hris-core-system.vercel.app`)
- **Platform:** Vercel
