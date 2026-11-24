'use client';

import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  BarChart2,
  Building,
  CheckCircle2,
  ChevronRight,
  Coins,
  Cpu,
  Download,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Gauge,
  HelpCircle,
  Layers,
  PieChart,
  Printer,
  Scale,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { CorporateHealthCheckResult, HealthCheckRatio } from '../lib/corporate-healthcheck';

interface CorporateHealthCheckViewProps {
  healthCheck: CorporateHealthCheckResult;
}

export default function CorporateHealthCheckView({ healthCheck }: CorporateHealthCheckViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'ratios' | 'stress' | 'benchmark' | 'redflags'>('overview');
  const [ratioCategoryFilter, setRatioCategoryFilter] = useState<string>('ALL');
  const [copiedCLI, setCopiedCLI] = useState(false);

  const formatIDR = (num: number) => 'Rp ' + Math.round(num).toLocaleString('id-ID');

  const { altmanZScore, dupontAnalysis, ratios, stressTestScenarios, idxBenchmarks, redFlagDiagnoses, standardLKJson } =
    healthCheck;

  // Filter ratios
  const filteredRatios = ratios.filter((r) => {
    if (ratioCategoryFilter === 'ALL') return true;
    return r.category === ratioCategoryFilter;
  });

  // Handler for downloading standard lk.json
  const handleDownloadLKJson = () => {
    const jsonStr = JSON.stringify(standardLKJson, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lk_clove_plant_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCLI = () => {
    const cmd = `python C:\\Users\\user\\.gemini\\config\\plugins\\corporate-health-check\\skills\\baca-laporan-keuangan\\scripts\\hitung_rasio.py lk.json --out-json rasio.json --out-md rasio.md`;
    navigator.clipboard.writeText(cmd);
    setCopiedCLI(true);
    setTimeout(() => setCopiedCLI(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 lg:p-8 shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                <Activity className="h-6 w-6" />
              </span>
              <div>
                <span className="text-[11px] font-mono tracking-wider uppercase text-indigo-300 font-semibold block">
                  Deterministic Financial Diagnostic &middot; TQ Board Insight Engine
                </span>
                <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-white">
                  Corporate Health Check &amp; Laporan Direksi
                </h2>
              </div>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Analisis kesehatan keuangan komprehensif untuk Dewan Direksi &amp; Komisaris: Model Altman Z'' Solvency Score, Dekomposisi DuPont 3-Tahap, 28 Rasio Deterministik, Uji Ketahanan Kas 5 Skenario, dan Benchmark Emiten Rokok Kretek Terdaftar di BEI (IDX).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleDownloadLKJson}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-md active:scale-95 whitespace-nowrap"
              title="Unduh format standar JSON untuk diproses langsung dengan CLI corporate-health-check"
            >
              <Download className="h-4 w-4" />
              <span>Unduh lk.json Standar</span>
            </button>

            <button
              onClick={handleCopyCLI}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-semibold text-xs px-4 py-2.5 rounded-xl transition active:scale-95 whitespace-nowrap"
              title="Salin perintah CLI Python"
            >
              <Cpu className="h-4 w-4 text-indigo-400" />
              <span>{copiedCLI ? 'Perintah Tersalin ✓' : 'Salin Perintah CLI'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-md active:scale-95 whitespace-nowrap"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak / PDF Direksi</span>
            </button>
          </div>
        </div>

        {/* Executive Highlights Bar */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-indigo-900/60 text-xs">
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Skor Altman Z''</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xl font-extrabold text-emerald-400">{altmanZScore.score}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                SAFE ZONE
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">Solvabilitas Sangat Aman</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">DuPont Return on Equity</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xl font-extrabold text-indigo-300">{dupontAnalysis.roePct}%</span>
              <span className="text-[10px] text-slate-400">Tahunan</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">NPM × Turnover × Leverage</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Siklus Konversi Kas (CCC)</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xl font-extrabold text-teal-400">
                {ratios.find((r) => r.key === 'ccc')?.formatted || '62 Hari'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">DIO + DSO - DPO</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Ketahanan Stress Test Kas</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xl font-extrabold text-amber-300">&gt; 18 Bulan</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                KUAT
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">Dalam Skenario Resesi Gabungan</span>
          </div>
        </div>
      </div>

      {/* Module Sub-Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex overflow-x-auto gap-1 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>1. Ringkasan Eksekutif &amp; Altman Z''</span>
        </button>

        <button
          onClick={() => setActiveTab('ratios')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition ${
            activeTab === 'ratios'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Gauge className="h-4 w-4" />
          <span>2. Matriks 28 Rasio Deterministik</span>
        </button>

        <button
          onClick={() => setActiveTab('stress')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition ${
            activeTab === 'stress'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Zap className="h-4 w-4" />
          <span>3. Uji Ketahanan Kas (Stress Test)</span>
        </button>

        <button
          onClick={() => setActiveTab('benchmark')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition ${
            activeTab === 'benchmark'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Building className="h-4 w-4" />
          <span>4. Benchmark Emiten Rokok IDX</span>
        </button>

        <button
          onClick={() => setActiveTab('redflags')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition ${
            activeTab === 'redflags'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <AlertOctagon className="h-4 w-4" />
          <span>5. Red Flag &amp; Agenda Rapat Direksi</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & ALTMAN Z'' */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Hero Altman Z'' Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Evaluasi Kesehatan Keuangan &amp; Probabilitas Kebangkrutan
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  Model Altman Z''-Score Manufaktur Pasar Berkembang
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xl">
                  Dihitung menggunakan formula Altman Z'' 4-faktor yang dikembangkan khusus untuk industri manufaktur non-publik di negara berkembang.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-5">
                <div className="text-center">
                  <span className="text-[11px] text-slate-500 block font-medium">Nilai Skor Z''</span>
                  <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">
                    {altmanZScore.score}
                  </span>
                </div>
                <div className="h-10 w-px bg-slate-200"></div>
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">Status Solvabilitas</span>
                  <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${altmanZScore.zoneColor}`}>
                    {altmanZScore.zoneLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Explanation & Components Breakdown */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex justify-between items-center text-slate-500 mb-1">
                  <span className="font-semibold">Faktor X₁ (Modal Kerja / Aset)</span>
                  <span className="font-mono font-bold text-slate-800">× 6.56</span>
                </div>
                <div className="text-lg font-bold text-slate-900 mt-1">
                  {altmanZScore.components.x1WorkingCapitalToAssets}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Likuiditas aset lancar dikurangi kewajiban tempo dekat terhadap total aset.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex justify-between items-center text-slate-500 mb-1">
                  <span className="font-semibold">Faktor X₂ (Laba Ditahan / Aset)</span>
                  <span className="font-mono font-bold text-slate-800">× 3.26</span>
                </div>
                <div className="text-lg font-bold text-slate-900 mt-1">
                  {altmanZScore.components.x2RetainedEarningsToAssets}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Kemampuan akumulasi keuntungan internal mendanai pertumbuhan aset.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex justify-between items-center text-slate-500 mb-1">
                  <span className="font-semibold">Faktor X₃ (EBIT / Total Aset)</span>
                  <span className="font-mono font-bold text-slate-800">× 6.72</span>
                </div>
                <div className="text-lg font-bold text-slate-900 mt-1">
                  {altmanZScore.components.x3EbitToAssets}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Produktivitas laba operasi pabrik murni sebelum dipengaruhi pajak dan bunga.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex justify-between items-center text-slate-500 mb-1">
                  <span className="font-semibold">Faktor X₄ (Ekuitas / Liabilitas)</span>
                  <span className="font-mono font-bold text-slate-800">× 1.05</span>
                </div>
                <div className="text-lg font-bold text-slate-900 mt-1">
                  {altmanZScore.components.x4EquityToLiabilities}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Daya lindung modal pemilik saham terhadap klaim pihak ketiga/pemasok.
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <strong className="font-bold">Analisis Direksi: </strong>
                {altmanZScore.explanation} Nilai Z'' di atas ambang batas 2.60 mengindikasikan struktur permodalan bebas utang bank berbunga tinggi, perputaran piutang tertib ke pabrik rokok besar (Gudang Garam, Djarum, Wismilak), dan likuiditas kas operasional yang sangat solid.
              </div>
            </div>
          </div>

          {/* DuPont Decomposition Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Dekomposisi Kinerja Profitabilitas (Model DuPont 3-Tahap)
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Menguraikan faktor pendorong Return on Equity (ROE) menjadi efisiensi operasional, efisiensi aset, dan tingkat leverage keuangan.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider block">
                    1. Efisiensi Operasi (Net Margin)
                  </span>
                  <div className="text-2xl font-black text-indigo-950 mt-1">
                    {dupontAnalysis.netProfitMarginPct}%
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    Laba Bersih per Rupiah Penjualan setelah HPP bahan cengkeh, upah rajang HRIS, dan beban operasional armada.
                  </p>
                </div>
                <span className="text-[10px] text-indigo-700 font-mono mt-3 font-semibold">Komponen: Laba Bersih ÷ Pendapatan</span>
              </div>

              <div className="p-5 rounded-2xl bg-teal-50/50 border border-teal-100 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-teal-700 uppercase tracking-wider block">
                    2. Efisiensi Aset (Asset Turnover)
                  </span>
                  <div className="text-2xl font-black text-teal-950 mt-1">
                    {dupontAnalysis.assetTurnover}x
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    Kecepatan perputaran aset lini produksi (Rotary Cutter, Guillotine, Micro-Slicer) dalam menghasilkan omzet.
                  </p>
                </div>
                <span className="text-[10px] text-teal-700 font-mono mt-3 font-semibold">Komponen: Pendapatan ÷ Total Aset</span>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
                    3. Pengungkit Keuangan (Equity Multiplier)
                  </span>
                  <div className="text-2xl font-black text-amber-950 mt-1">
                    {dupontAnalysis.equityMultiplier}x
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    Rasio pembiayaan aset oleh modal sendiri. Nilai di bawah 1.5x menunjukkan profil risiko keuangan yang sangat konservatif.
                  </p>
                </div>
                <span className="text-[10px] text-amber-800 font-mono mt-3 font-semibold">Komponen: Total Aset ÷ Ekuitas</span>
              </div>
            </div>

            <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs text-slate-800 flex items-center justify-between">
              <span>Formulasi Terpadu DuPont:</span>
              <strong className="text-indigo-700 font-bold">{dupontAnalysis.threeStageFormula}</strong>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MATRIKS 28 RASIO DETERMINISTIK */}
      {activeTab === 'ratios' && (
        <div className="space-y-4">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {['ALL', 'Likuiditas', 'Profitabilitas', 'Leverage', 'Efisiensi', 'Kualitas Laba & Kas'].map((cat) => (
              <button
                key={cat}
                onClick={() => setRatioCategoryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-xl font-semibold transition ${
                  ratioCategoryFilter === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat === 'ALL' ? 'Semua Kelompok (28 Rasio)' : cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRatios.map((r) => {
              const statusBadge = {
                BAIK: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                PERHATIAN: 'bg-amber-50 text-amber-700 border-amber-200',
                KRITIS: 'bg-rose-50 text-rose-700 border-rose-200',
              }[r.status];

              return (
                <div
                  key={r.key}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-indigo-300 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          {r.category}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-0.5">{r.label}</h4>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge}`}>
                        {r.status}
                      </span>
                    </div>

                    <div className="my-3 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900">{r.formatted}</span>
                      {r.benchmarkMedian && (
                        <span className="text-[11px] text-slate-400 font-medium">
                          (Median IDX: <strong className="text-slate-600">{r.benchmarkMedian}</strong>)
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{r.statusExplanation}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Rumus:</span>
                    <span className="text-slate-600 truncate max-w-[200px]" title={r.formula}>
                      {r.formula}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: UJI KETAHANAN KAS (CASH STRESS TEST) */}
      {activeTab === 'stress' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8 shadow-xs space-y-6">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Simulasi Guncangan Likuiditas Multivariabel
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1">
              Uji Ketahanan Kas 13-Minggu &amp; Skenario Stress Test (Cash Runway)
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Mensimulasikan daya tahan saldo kas pabrik menghadapi 5 jenis guncangan operasional ekstrem: penurunan volume order, lonjakan harga beli bunga cengkeh, keterlambatan bayar piutang pabrik rokok, dan desakan pembayaran tunai dari kelompok tani.
            </p>
          </div>

          <div className="space-y-4">
            {stressTestScenarios.map((sc, idx) => {
              const statusBadge = {
                AMAN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                WASPADA: 'bg-amber-50 text-amber-700 border-amber-200',
                KRITIS_DEFISIT: 'bg-rose-50 text-rose-700 border-rose-200',
              }[sc.status];

              return (
                <div
                  key={sc.id}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 transition bg-slate-50/50 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="h-7 w-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center font-mono">
                        0{idx + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{sc.name}</h4>
                        <p className="text-xs text-slate-500">{sc.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusBadge}`}>
                        {sc.status}
                      </span>
                      <span className="text-xs font-extrabold text-indigo-900 bg-white px-3 py-1 rounded-xl border border-slate-200">
                        Runway: {sc.runwayMonths} Bulan
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Arus Kas Bersih / Bulan</span>
                      <span className="font-bold text-slate-800">{formatIDR(sc.monthlyNetCashFlow)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Proyeksi Kas 6 Bulan</span>
                      <span className="font-bold text-emerald-700">{formatIDR(sc.cashAfter6Months)}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block text-[11px]">Rekomendasi Mitigasi Direksi</span>
                      <span className="font-semibold text-indigo-900">{sc.recommendation}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: BENCHMARK EMITEN ROKOK IDX */}
      {activeTab === 'benchmark' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8 shadow-xs space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Bursa Efek Indonesia &middot; TradingView Data Feed
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                Benchmark Komparatif: Posisi Pabrik vs Emiten Tbk Rokok &amp; Tembakau
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Perbandingan indikator kunci pabrik rajang cengkeh terhadap emiten kretek nasional terdaftar di IDX (GGRM, HMSP, WIIM).
              </p>
            </div>
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-900 font-semibold max-w-sm">
              💡 Posisi margin kotor pabrik lebih tinggi karena fleksibilitas pemanfaatan hasil samping (debu &amp; gagang) serta nihilnya beban cukai rokok hilir.
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Perusahaan / Entitas</th>
                  <th className="px-4 py-3">Gross Margin</th>
                  <th className="px-4 py-3">Net Margin</th>
                  <th className="px-4 py-3">ROE (%)</th>
                  <th className="px-4 py-3">DER (Utang)</th>
                  <th className="px-4 py-3">Siklus Kas (CCC)</th>
                  <th className="px-4 py-3">Hubungan Industri</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Our Plant */}
                <tr className="bg-emerald-50/50 font-bold text-slate-900">
                  <td className="px-4 py-3.5 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    <span>Pabrik Rajang Cengkeh (CloveERP)</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full">
                      Pabrik Anda
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-emerald-700">{idxBenchmarks.plant.grossMargin}%</td>
                  <td className="px-4 py-3.5 text-emerald-700">{idxBenchmarks.plant.netMargin}%</td>
                  <td className="px-4 py-3.5 text-emerald-700">{idxBenchmarks.plant.roe}%</td>
                  <td className="px-4 py-3.5 text-slate-800">{idxBenchmarks.plant.der}x</td>
                  <td className="px-4 py-3.5 text-teal-700">{idxBenchmarks.plant.cccDays} Hari</td>
                  <td className="px-4 py-3.5 text-slate-600 font-normal">Penyedia Bahan Baku Rajang Bunga Cengkeh</td>
                </tr>

                {/* Peers */}
                {idxBenchmarks.peers.map((peer) => (
                  <tr key={peer.code} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3.5 font-semibold text-slate-800">
                      <span className="font-mono font-bold text-indigo-700 mr-2">{peer.code}</span>
                      {peer.name}
                    </td>
                    <td className="px-4 py-3.5">{peer.grossMargin}%</td>
                    <td className="px-4 py-3.5">{peer.netMargin}%</td>
                    <td className="px-4 py-3.5">{peer.roe}%</td>
                    <td className="px-4 py-3.5">{peer.der}x</td>
                    <td className="px-4 py-3.5">{peer.cccDays} Hari</td>
                    <td className="px-4 py-3.5 text-slate-500 text-[11px]">{peer.relationWithClovePlant}</td>
                  </tr>
                ))}

                {/* Industry Median */}
                <tr className="bg-slate-100/70 font-semibold text-slate-700 border-t-2 border-slate-200">
                  <td className="px-4 py-3.5">Median Industri Emiten Rokok IDX</td>
                  <td className="px-4 py-3.5">{idxBenchmarks.medianIndustry.grossMargin}%</td>
                  <td className="px-4 py-3.5">{idxBenchmarks.medianIndustry.netMargin}%</td>
                  <td className="px-4 py-3.5">{idxBenchmarks.medianIndustry.roe}%</td>
                  <td className="px-4 py-3.5">{idxBenchmarks.medianIndustry.der}x</td>
                  <td className="px-4 py-3.5">{idxBenchmarks.medianIndustry.cccDays} Hari</td>
                  <td className="px-4 py-3.5 text-[11px] text-slate-500">Standar Acuan Direksi</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
            <strong className="text-slate-900 font-bold block mb-1">Kesimpulan Komparatif Direksi:</strong>
            {idxBenchmarks.verdict}
          </div>
        </div>
      )}

      {/* TAB 5: RED FLAGS & AGENDA RAPAT DIREKSI */}
      {activeTab === 'redflags' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8 shadow-xs space-y-6">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Pemetaan Gejala Finansial ke Akar Masalah Teknis Lapangan
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1">
              Red Flag Operasional &amp; Panduan Pertanyaan Rapat Direksi
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Panduan pertanyaan tajam bagi Direksi kepada tim teknis pabrik, kepala bengkel maintenance, dan kepala gudang bahan baku.
            </p>
          </div>

          <div className="space-y-4">
            {redFlagDiagnoses.map((rf, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-rose-200 bg-rose-50/20 hover:border-rose-300 transition space-y-3 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700 font-bold font-mono">
                    RF-0{idx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-rose-900">{rf.symptom}</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-rose-100">
                  <div className="bg-white p-3 rounded-xl border border-rose-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Dampak di Angka Keuangan</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">{rf.financialMetric}</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-rose-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Akar Masalah di Lantai Pabrik</span>
                    <span className="font-semibold text-amber-900 mt-0.5 block">{rf.operationalRootCause}</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-rose-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Bukti Data dari ERP</span>
                    <span className="font-semibold text-indigo-900 mt-0.5 block">{rf.proofDataFromPlant}</span>
                  </div>
                </div>

                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-950 font-medium">
                  <span className="font-bold text-indigo-800">Pertanyaan Wajib Direksi saat Rapat: </span>
                  &ldquo;{rf.boardActionItem}?&rdquo;
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
