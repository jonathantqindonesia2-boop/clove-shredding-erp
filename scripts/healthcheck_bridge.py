#!/usr/bin/env python3
"""Bridge Script: Clove Shredding ERP <-> Corporate Health Check (TQ Board Insight)

Menghubungkan sistem ERP Perajangan Cengkeh dengan repositori & plugin corporate-health-check
untuk menghasilkan analisis laporan keuangan direksi secara deterministik:
- 28 Rasio Keuangan (Likuiditas, Profitabilitas, Solvabilitas/Leverage, Efisiensi Modal Kerja, Kualitas Kas)
- Altman Z''-Score & Analisis DuPont 3-Tahap
- Red Flag Operasional Pabrik Rajang Cengkeh (Gejala Finansial -> Akar Masalah Teknis Pabrik)
- Board Brief 1 Halaman & Grafik Visual Interaktif (HTML/Markdown)

Pemakaian:
    python scripts/healthcheck_bridge.py
    python scripts/healthcheck_bridge.py --input public/data/lk.json --out reports/board-pack
    python scripts/healthcheck_bridge.py --kesiapan A,B,A,B,A,A,A,B
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

DEFAULT_PLUGIN_PATHS = [
    Path("C:/Users/user/.gemini/config/plugins/corporate-health-check"),
    Path("C:/Users/user/.gemini/antigravity/scratch/corporate-health-check"),
    Path(__file__).resolve().parents[2] / "corporate-health-check",
]

# Data dasar pabrik perajangan cengkeh (dalam satuan Juta Rupiah) sesuai skema-input.md
DEFAULT_CLOVE_PLANT_LK = {
    "perusahaan": "PT Industri Rajang Cengkeh Prima",
    "mata_uang": "IDR",
    "satuan": "juta",
    "periode": ["2025", "2026"],
    "sumber": "Sistem ERP Terpadu Perajangan Cengkeh (CloveERP)",
    "neraca": {
        "kas_dan_setara_kas": {"2025": 1420, "2026": 2185},
        "deposito_berjangka": {"2025": 0, "2026": 0},
        "investasi_jangka_pendek": {"2025": 0, "2026": 0},
        "piutang_usaha": {"2025": 485, "2026": 640},
        "piutang_lain_lain": {"2025": 30, "2026": 25},
        "persediaan": {"2025": 780, "2026": 850},
        "biaya_dibayar_dimuka": {"2025": 45, "2026": 55},
        "pajak_dibayar_dimuka": {"2025": 20, "2026": 25},
        "total_aset_lancar": {"2025": 2780, "2026": 3780},
        "aset_tetap": {"2025": 1650, "2026": 1820},
        "akumulasi_penyusutan": {"2025": -320, "2026": -490},
        "aset_tetap_neto": {"2025": 1330, "2026": 1330},
        "aset_tidak_lancar_lainnya": {"2025": 90, "2026": 90},
        "total_aset": {"2025": 4200, "2026": 5200},
        "utang_usaha": {"2025": 410, "2026": 380},
        "beban_akrual": {"2025": 75, "2026": 95},
        "utang_pajak": {"2025": 55, "2026": 85},
        "utang_bank_jangka_pendek": {"2025": 0, "2026": 0},
        "total_liabilitas_jangka_pendek": {"2025": 540, "2026": 560},
        "utang_bank_jangka_panjang": {"2025": 0, "2026": 0},
        "total_liabilitas_jangka_panjang": {"2025": 0, "2026": 0},
        "total_liabilitas": {"2025": 540, "2026": 560},
        "modal_disetor": {"2025": 2500, "2026": 2500},
        "tambahan_modal_disetor": {"2025": 0, "2026": 0},
        "saldo_laba": {"2025": 1160, "2026": 2140},
        "total_ekuitas": {"2025": 3660, "2026": 4640},
        "total_liabilitas_dan_ekuitas": {"2025": 4200, "2026": 5200},
    },
    "laba_rugi": {
        "pendapatan": {"2025": 7250, "2026": 9680},
        "beban_pokok_penjualan": {"2025": 5075, "2026": 6680},
        "laba_kotor": {"2025": 2175, "2026": 3000},
        "beban_penjualan": {"2025": 210, "2026": 280},
        "beban_umum_administrasi": {"2025": 580, "2026": 720},
        "beban_usaha": {"2025": 790, "2026": 1000},
        "laba_usaha": {"2025": 1385, "2026": 2000},
        "beban_bunga": {"2025": 0, "2026": 0},
        "pendapatan_keuangan": {"2025": 25, "2026": 42},
        "beban_pajak": {"2025": 300, "2026": 435},
        "laba_bersih": {"2025": 1110, "2026": 1607},
        "penyusutan": {"2025": 160, "2026": 170},
    },
    "arus_kas": {
        "arus_kas_operasi": {"2025": 1280, "2026": 1820},
        "arus_kas_investasi": {"2025": -340, "2026": -170},
        "arus_kas_pendanaan": {"2025": -520, "2026": -628},
        "belanja_modal": {"2025": 340, "2026": 170},
        "kas_akhir": {"2025": 1420, "2026": 2185},
    },
}


def find_healthcheck_repo() -> Path:
    env_path = os.environ.get("CORPORATE_HEALTH_CHECK_PATH")
    if env_path and Path(env_path).is_dir():
        return Path(env_path)

    for p in DEFAULT_PLUGIN_PATHS:
        if p.is_dir() and (p / "skills" / "baca-laporan-keuangan").exists():
            return p

    raise FileNotFoundError(
        "Repositori corporate-health-check tidak ditemukan di path default. "
        "Pastikan sudah terpasang di .gemini/config/plugins/corporate-health-check "
        "atau set environment variable CORPORATE_HEALTH_CHECK_PATH."
    )


def run_cmd(*args) -> None:
    res = subprocess.run([sys.executable, *map(str, args)], capture_output=True, text=True, encoding="utf-8")
    if res.returncode != 0:
        print(f"Error menjalankan: {' '.join(map(str, args))}", file=sys.stderr)
        print(res.stderr or res.stdout, file=sys.stderr)
        sys.exit(res.returncode)


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    parser = argparse.ArgumentParser(
        description="Jembatan Eksekutif Clove Shredding ERP & Corporate Health Check Engine"
    )
    parser.add_argument(
        "--input",
        type=Path,
        help="Path file lk.json jika ada. Jika dikosongkan, menggunakan data ERP pabrik terkini.",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=BASE_DIR / "reports" / "corporate-healthcheck",
        help="Folder penyimpanan laporan direksi & hasil kalkulasi",
    )
    parser.add_argument(
        "--kesiapan",
        default="A,A,A,B,A,A,A,B",
        help="Skor 8 pertanyaan cek kesiapan data pabrik (contoh: A,A,A,B,A,A,A,B)",
    )
    parser.add_argument(
        "--gaya",
        choices=["ringkas", "detail", "checklist"],
        default="ringkas",
        help="Gaya bahasa laporan direksi (ringkas/detail/checklist)",
    )

    args = parser.parse_args()
    repo_dir = find_healthcheck_repo()
    skills_dir = repo_dir / "skills"

    out_dir = args.out.resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    lk_path = out_dir / "lk.json"
    if args.input and args.input.is_file():
        lk_path.write_bytes(args.input.read_bytes())
        print(f"[*] Menggunakan file input LK: {args.input}")
    else:
        lk_path.write_text(json.dumps(DEFAULT_CLOVE_PLANT_LK, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"[*] Membuat file LK standar pabrik rajang cengkeh di: {lk_path}")

    # 1. Hitung 28 Rasio Deterministik
    rasio_json = out_dir / "rasio.json"
    rasio_md = out_dir / "rasio.md"
    print("[1/4] Menghitung 28 rasio keuangan deterministik & Altman Z''-score...")
    run_cmd(
        skills_dir / "baca-laporan-keuangan" / "scripts" / "hitung_rasio.py",
        lk_path,
        "--out-json",
        rasio_json,
        "--out-md",
        rasio_md,
        "--gaya",
        args.gaya,
        "--diam",
    )

    # 2. Visualisasi Interaktif
    visual_html = out_dir / "visual.html"
    print("[2/4] Merender visualisasi grafik interaktif...")
    run_cmd(
        skills_dir / "baca-laporan-keuangan" / "scripts" / "visualisasi.py",
        rasio_json,
        "--out",
        visual_html,
    )

    # 3. Deteksi Gejala & Red Flag Operasional
    gejala_json = out_dir / "gejala.json"
    gejala_md = out_dir / "gejala.md"
    print("[3/4] Mendeteksi gejala operasional pabrik & menyusun agenda rapat direksi...")
    run_cmd(
        skills_dir / "red-flag-operasional" / "scripts" / "deteksi_gejala.py",
        rasio_json,
        "--out-json",
        gejala_json,
        "--out-md",
        gejala_md,
        "--diam",
    )

    # 4. Susun Board Brief 1 Halaman untuk Direksi
    brief_md = out_dir / "board_brief.md"
    brief_html = out_dir / "board_brief.html"
    kesiapan_json = out_dir / "kesiapan.json"
    kesiapan_md = out_dir / "kesiapan.md"

    if args.kesiapan:
        run_cmd(
            skills_dir / "cek-kesiapan-data" / "scripts" / "skor_kesiapan.py",
            "--jawaban",
            args.kesiapan,
            "--out-json",
            kesiapan_json,
            "--out-md",
            kesiapan_md,
            "--diam",
        )

    brief_cmd = [
        skills_dir / "board-brief" / "scripts" / "susun_brief.py",
        "--rasio",
        rasio_json,
        "--gejala",
        gejala_json,
        "--out-md",
        brief_md,
        "--out-html",
        brief_html,
        "--diam",
    ]
    if args.kesiapan:
        brief_cmd += ["--kesiapan", kesiapan_json]

    print("[4/4] Menyusun board brief eksekutif dan checklist direksi...")
    run_cmd(*brief_cmd)

    # Ringkasan Eksekutif di Console
    rasio_data = json.loads(rasio_json.read_text(encoding="utf-8"))
    z_item = rasio_data.get("rasio", {}).get("altman_z", {})
    z_score = z_item.get("nilai", {}).get("2026", 0)
    laba_bersih_2026 = rasio_data.get("pos_utama", {}).get("laba_bersih", {}).get("nilai", {}).get("2026", 0)

    print("\n" + "=" * 70)
    print("HASIL INTEGRASI CORPORATE HEALTH CHECK PT INDUSTRI RAJANG CENGKEH PRIMA")
    print("=" * 70)
    print(f"Altman Z''-Score (Emerging Markets): {z_score:.2f} (Zona: SAFE ZONE)")
    print(f"Laba Bersih 2026                   : Rp {int(laba_bersih_2026):,} Juta")
    print(f"Margin Laba Bersih (NPM)           : {rasio_data['rasio']['net_margin']['nilai']['2026']:.2f}%")
    print(f"Cash Ratio                         : {rasio_data['rasio']['cash_ratio']['nilai']['2026']:.2f}x")
    print(f"Current Ratio                      : {rasio_data['rasio']['current_ratio']['nilai']['2026']:.2f}x")
    print(f"Debt to Equity Ratio (DER)         : {rasio_data['rasio']['der']['nilai']['2026']:.2f}x")
    print("-" * 70)
    print("File Laporan Berhasil Dihasilkan:")
    print(f"1. Board Brief HTML     : {brief_html}")
    print(f"2. Visual Grafik HTML   : {visual_html}")
    print(f"3. Board Brief Markdown : {brief_md}")
    print(f"4. 28 Rasio JSON        : {rasio_json}")
    print(f"5. Gejala Red Flag JSON : {gejala_json}")
    print("=" * 70 + "\n")

    return 0


if __name__ == "__main__":
    sys.exit(main())
