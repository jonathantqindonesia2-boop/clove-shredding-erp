# CloveERP - Sistem Terpadu Perajangan Cengkeh, HRIS & Laporan Keuangan

> **Sistem Enterprise Terintegrasi: Operasional Pabrik Rajang Cengkeh ↔ HRIS Payroll Tenaga Kerja ↔ Laporan Keuangan & HPP Manufaktur**  
> Dibangun dengan Next.js 14 App Router, TypeScript, dan Tailwind CSS. Siap dideploy ke Vercel dengan satu klik.

---

## 🌟 Modul & Fitur Terintegrasi

### 1. Sistem Laporan Keuangan & Akuntansi Manufaktur (*Financial & Cost Suite*)
- **Laporan Laba Rugi Komprehensif (*Income Statement / P&L*):**
  - Penjualan Cengkeh Rajang Prima ke pabrikan rokok (0.4mm, 0.6mm, 0.8mm, 1.0mm).
  - Penjualan Byproduct: Debu Siklon (industri dupa) dan Gagang Cengkeh (minyak atsiri).
  - Harga Pokok Penjualan (HPP / COGS) mencakup bahan baku, upah tenaga kerja langsung dari HRIS, dan overhead pabrik (listrik, asah pisau, kemasan, depresiasi).
  - EBITDA, Beban Logistik Armada Truk, Beban Gaji Manajemen, Pajak PPh Badan (22%), dan Laba Bersih (*Net Income*).
- **Neraca Keuangan (*Balance Sheet*):**
  - Aktiva Lancar (Kas Bank, Piutang Usaha Klien, Persediaan Bahan Mentah, Rajang Prima, Debu & Gagang).
  - Aktiva Tetap (Mesin Perajang Rotary/Guillotine, Truk Box, Akumulasi Penyusutan).
  - Kewajiban (Hutang Petani Cengkeh, Akrual Gaji HRIS, Hutang Pajak).
  - Ekuitas (Modal Disetor, Laba Ditahan, Laba Tahun Berjalan) dengan validasi keseimbangan otomatis (*Assets = Liabilities + Equity*).
- **Analisis HPP & Unit Economics (Cost per Kg):**
  - Rincian biaya per 1 kg rajangan cengkeh bersih: Bahan Baku (77%), Upah Operator HRIS (11%), Listrik & Pisau (6%), Kemasan & Logistik (6%).
  - Spread margin keuntungan per kg (+Rp 27.000 / kg) dan persentase margin kotor.
- **Buku Besar & Jurnal Otomatis (*Double-Entry General Ledger*):**
  - Jurnal akuntansi otomatis terposting seketika terjadi batch pengerjaan, penerbitan Surat Jalan pengiriman, mutasi stok gudang, dan sinkronisasi penggajian HRIS.

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
