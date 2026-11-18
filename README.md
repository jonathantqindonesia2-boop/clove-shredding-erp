# CloveERP - Sistem Monitoring & Perajangan Cengkeh Terpadu

> **Sistem Informasi Manajemen & Eksekutif Dashboard untuk Pabrik Perajangan Cengkeh (Clove Shredding & Cutting Plant)**  
> Dibangun dengan Next.js 14 App Router, TypeScript, dan Tailwind CSS. Siap dideploy ke Vercel dengan satu klik.

---

## 🌟 Fitur Utama Sistem

### 1. Penerimaan Order & Antrian Produksi (*Order Intake*)
- Pencatatan purchase order dari pabrikan rokok kretek (e.g., PT Gudang Garam Tbk, PT Djarum, HM Sampoerna, PT Wismilak, dll).
- Pemilihan spesifikasi ukuran rajangan:
  - `0.4mm` (Mikro Halus - Sigaret Premium)
  - `0.6mm` (Super Prima - Kretek Filter)
  - `0.8mm` (Standar Kretek)
  - `1.0mm` (Regular Medium)
  - `1.2mm` (Extra Kasar)
- Pelacakan kuantitas target vs realisasi kilogram yang telah diproses.
- Alokasi mesin dan penentuan prioritas pengerjaan (Standar, Tinggi / Rush, Ekspor Prioritas).

### 2. Monitoring Pengerjaan & Parameter Hasil Mutu (*Quality Control*)
- Pencatatan real-time per batch perajangan (Shift, Operator, Mesin).
- Formulasi parameter otomatis:
  $$\text{Rendemen Prima (\%)} = \left(\frac{\text{Hasil Rajang Bersih (kg)}}{\text{Bahan Baku Masuk (kg)}}\right) \times 100\%$$
  $$\text{Persentase Debu (\%)} = \left(\frac{\text{Debu Siklon (kg)}}{\text{Bahan Baku Masuk (kg)}}\right) \times 100\%$$
  $$\text{Persentase Gagang (\%)} = \left(\frac{\text{Gagang Sortir (kg)}}{\text{Bahan Baku Masuk (kg)}}\right) \times 100\%$$
- Evaluasi otomatis parameter standar:
  - **Rendemen Prima:** $\ge 88.0\%$ (Target Optimal $90\%$).
  - **Debu Siklon:** $\le 6.5\%$ (Ambang batas maksimum $7.5\%$).
  - **Kadar Air (*Moisture Content*):** $11.5\% - 13.0\%$.
  - **Status QC Otomatis:** *Lolos Prima*, *Toleransi*, *Koreksi Kelembaban*, atau *Ditolak*.

### 3. Manajemen Mesin, Input Kapasitas & Evaluasi Keterlambatan
- **Penambahan Mesin Dinamis:** Kemampuan mendaftarkan mesin baru ke armada pabrik lengkap dengan spesifikasi pisau dan target efisiensi OEE.
- **Input & Slider Kapasitas Real-Time:** Penyesuaian kapasitas operasional mesin (50 - 600 kg/jam) secara dinamis.
- **Mesin Kalkulasi Estimasi Waktu Penyelesaian:**
  $$\text{Kapasitas Efektif (kg/jam)} = \text{Kapasitas Mesin} \times \left(\frac{\text{Efisiensi OEE}}{100}\right)$$
  $$\text{Durasi Selesai (Jam)} = \frac{\text{Sisa Beban Order (kg)}}{\text{Kapasitas Efektif (kg/jam)}}$$
  $$\text{Proyeksi Waktu Selesai} = \text{Waktu Mulai} + \text{Durasi Selesai}$$
- **Deteksi Keterlambatan Otomatis (*Delay Evaluation Engine*):**
  - Membandingkan proyeksi selesai dengan deadline pesanan pelanggan.
  - Memunculkan alert visual, selisih jam defisit, dan rekomendasi mitigasi (naikkan slider kapasitas, alihkan antrian ke mesin idle, atau jadwalkan shift lembur).

### 4. Monitoring Stock In / Out Barang (*Integrated Inventory*)
- Manajemen 4 kategori komoditas pabrik:
  1. **Bahan Baku (*Raw Material*):** Bunga Cengkeh Kering (Zanzibar, Sikotok).
  2. **Barang Jadi (*Finished Goods*):** Cengkeh Rajang Bersih per ukuran (0.4mm, 0.6mm, 0.8mm).
  3. **Hasil Sampingan (*Byproduct Dust*):** Debu Cengkeh Siklon murni (dimonetisasi untuk industri dupa & ekstrak minyak).
  4. **Gagang Cengkeh (*Clove Stems*):** Gagang sisa sortir untuk distilasi minyak eugenol.
- Pemantauan batas minimum buffer stok dengan peringatan restock.
- Buku kas mutasi barang (*Stock Mutation Ledger*) mencatat waktu, tipe (IN/OUT), kuantitas, nomor referensi dokumen, dan mitra/rekanan.

### 5. Monitoring Pengiriman & Surat Jalan (*Dispatch Tracking*)
- Penerbitan Surat Jalan (*Delivery Order* / DO).
- Pencatatan armada truk ekspedisi, plat nomor polisi, nama pengemudi, kota tujuan pabrik klien, waktu keberangkatan (ETD), dan estimasi tiba (ETA).
- Pipeline status pengiriman: *Persiapan Muat* &rarr; *Dalam Perjalanan* &rarr; *Tiba di Lokasi Pabrik* &rarr; *Selesai & Diterima*.

### 6. Analisis Mendalam (*Deep-Dive Quality & Economic Analytics*)
- **Korelasi Non-Linear Kadar Air vs Debu:** Visualisasi teknis mengapa kadar air $<10.5\%$ menyebabkan kerapuhan cengkeh dan lonjakan debu $>9\%$, serta kadar air $>13.8\%$ memicu getah eugenol lengket pada pisau pemotong.
- **Valuasi Ekonomi Output:** Kalkulasi nilai rupiah dari hasil rajang prima, debu siklon, dan gagang sortir.
- **Peringkat Efisiensi Mesin & Indikator Ketajaman Pisau.**
- **Ekspor Data:** Fitur download laporan QC dalam format file `.csv`.

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

Proyek ini telah dikonfigurasi secara optimal untuk platform Vercel:

1. Buka dashboard [Vercel](https://vercel.com).
2. Klik **"Add New"** &rarr; **"Project"**.
3. Hubungkan akun GitHub Anda dan pilih repository `jonathantqindonesia2-boop/clove-shredding-erp`.
4. Framework Preset akan otomatis terdeteksi sebagai **Next.js**.
5. Klik **"Deploy"**!
6. Sistem ERP Perajangan Cengkeh akan live dalam hitungan detik.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Library:** React 18
- **Bahasa:** TypeScript
- **Styling:** Tailwind CSS
- **Ikonografi:** Lucide React
- **Platform:** Vercel
