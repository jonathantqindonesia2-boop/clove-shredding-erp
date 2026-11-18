'use client';

import React from 'react';
import {
  AlertCircle,
  BarChart2,
  DollarSign,
  Download,
  Flame,
  Info,
  Layers,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { BatchQC, Machine, Order } from '../lib/types';

interface DeepDiveAnalyticsProps {
  batches: BatchQC[];
  machines: Machine[];
  orders: Order[];
}

export default function DeepDiveAnalytics({
  batches,
  machines,
  orders,
}: DeepDiveAnalyticsProps) {
  // Financial Estimations
  const totalCleanKg = batches.reduce((sum, b) => sum + b.cleanCutKg, 0);
  const totalDustKg = batches.reduce((sum, b) => sum + b.dustKg, 0);
  const totalStemKg = batches.reduce((sum, b) => sum + b.stemKg, 0);

  // Economic valuation (IDR)
  const cleanValuation = totalCleanKg * 145000; // Rp 145.000 / kg
  const dustValuation = totalDustKg * 24000; // Rp 24.000 / kg (industri dupa)
  const stemValuation = totalStemKg * 18000; // Rp 18.000 / kg (penyulingan minyak daun/gagang)
  const totalValuation = cleanValuation + dustValuation + stemValuation;

  // Moisture Curve Data Points
  const moisturePoints = [
    { moisture: '9.5%', dust: '11.2%', status: 'Kritis (Terlalu Kering/Rapuh)', color: 'bg-rose-500' },
    { moisture: '10.5%', dust: '8.4%', status: 'Toleransi Bawah', color: 'bg-amber-500' },
    { moisture: '11.8%', dust: '5.8%', status: 'Optimal (Kretek Grade)', color: 'bg-emerald-500' },
    { moisture: '12.5%', dust: '5.2%', status: 'Optimal (Prima)', color: 'bg-emerald-600' },
    { moisture: '13.2%', dust: '5.9%', status: 'Batas Atas Aman', color: 'bg-teal-500' },
    { moisture: '14.2%', dust: '7.8%', status: 'Bahaya (Pisau Lengket/Basah)', color: 'bg-rose-500' },
  ];

  const handleExportCSV = () => {
    let csv = 'Batch ID,Order ID,Mesin,Operator,Bahan Baku (kg),Hasil Prima (kg),Rendemen (%),Debu (kg),Debu (%),Kadar Air (%),Status QC\n';
    batches.forEach((b) => {
      csv += `${b.id},${b.orderId},${b.machineId},${b.operator},${b.rawInputKg},${b.cleanCutKg},${b.rendemenPercent}%,${b.dustKg},${b.dustPercent}%,${b.moisturePercent}%,${b.qcStatus}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Rajang_Cengkeh_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Analisis Mendalam: Parameter Mutu &amp; Monetisasi Byproduct
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Korelasi non-linear kadar air terhadap fraksi debu dan analisis efisiensi mesin perajang.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-xs whitespace-nowrap self-start sm:self-auto"
        >
          <Download className="h-4 w-4" />
          <span>Export Laporan QC (CSV)</span>
        </button>
      </div>

      {/* Row 1: Moisture vs Dust Waste Correlation Analysis */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Korelasi Non-Linear: Kadar Air vs Persentase Debu Siklon
            </h3>
            <p className="text-xs text-slate-500">
              Fenomena teknis: Kelembaban &lt; 10.5% membuat cengkeh getas/rapuh saat dicacah pisau rotary berkecepatan tinggi, menyebabkan debu melonjak hingga &gt; 9%.
            </p>
          </div>
          <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
            Gold Standard: 11.8% - 12.6%
          </span>
        </div>

        {/* Moisture Simulation Graph Representation */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {moisturePoints.map((pt) => (
            <div
              key={pt.moisture}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 transition text-center"
            >
              <span className="text-xs font-semibold text-slate-500 block">Kadar Air</span>
              <span className="text-lg font-bold text-slate-900 block my-1">
                {pt.moisture}
              </span>
              <div className="my-2 flex justify-center">
                <span className={`w-3 h-3 rounded-full ${pt.color}`}></span>
              </div>
              <span className="text-xs font-bold block text-slate-700">Debu: {pt.dust}</span>
              <span className="text-[10px] text-slate-400 block mt-1 leading-tight">
                {pt.status}
              </span>
            </div>
          ))}
        </div>

        {/* Technical Insight Box */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
          <Info className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="font-semibold text-slate-800">
              Rekomendasi Kontrol Suhu &amp; Kelembaban Pabrik:
            </p>
            <p>
              1. <strong>Bunga Cengkeh Terlalu Kering (&lt;10.5%):</strong> Lakukan pengkondisian ulang (conditioning misting) di ruang humidifikasi 4-6 jam sebelum dicacah untuk mencegah debu berlebih.
            </p>
            <p>
              2. <strong>Bunga Cengkeh Terlalu Basah (&gt;13.8%):</strong> Menimbulkan getah eugenol pekat yang menempel pada mata pisau. Kapasitas jatuh 30% dan pisau cepat tumpul. Wajib dikeringkan matahari / rotary dryer terlebih dahulu.
            </p>
          </div>
        </div>
      </div>

      {/* Row 2: Economic Value & Machine Efficiency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Economic Valuation of Output */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Valuasi Ekonomi &amp; Monetisasi Hasil
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Konversi nilai komersial dari total batch yang diproses dalam periode ini
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-900 block">
                    Rajangan Prima ({totalCleanKg.toLocaleString('id-ID')} kg)
                  </span>
                  <span className="text-emerald-700 text-[11px]">
                    @ Rp 145.000 / kg (Grade Kretek Ekspor)
                  </span>
                </div>
                <span className="text-sm font-bold text-emerald-800">
                  Rp {cleanValuation.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-900 block">
                    Debu Siklon ({totalDustKg.toLocaleString('id-ID')} kg)
                  </span>
                  <span className="text-amber-700 text-[11px]">
                    @ Rp 24.000 / kg (Bahan Baku Dupa &amp; Aromaterapi)
                  </span>
                </div>
                <span className="text-sm font-bold text-amber-800">
                  Rp {dustValuation.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-orange-900 block">
                    Gagang Sortir ({totalStemKg.toLocaleString('id-ID')} kg)
                  </span>
                  <span className="text-orange-700 text-[11px]">
                    @ Rp 18.000 / kg (Bahan Distilasi Minyak Eugenol)
                  </span>
                </div>
                <span className="text-sm font-bold text-orange-800">
                  Rp {stemValuation.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-baseline justify-between">
            <span className="text-xs font-bold text-slate-700">Total Nilai Ekonomi Output:</span>
            <span className="text-lg font-bold text-slate-900">
              Rp {totalValuation.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Machine Throughput Comparison */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Peringkat Efisiensi &amp; Ketajaman Mesin
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Performa OEE dan status mata pisau pemotong
            </p>

            <div className="space-y-3.5">
              {machines.map((m) => (
                <div key={m.id} className="text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-800">
                      {m.name} ({m.id})
                    </span>
                    <span className="font-semibold text-emerald-600">
                      OEE {m.efficiencyPercent}% &middot; Pisau {m.bladeSharpness}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        m.bladeSharpness > 75
                          ? 'bg-emerald-500'
                          : m.bladeSharpness > 50
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${m.bladeSharpness}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <p>
              *Pisau dengan ketajaman &lt; 50% wajib diasah ulang (re-sharpening) untuk menjaga rendemen rajang tetap &ge; 88%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
