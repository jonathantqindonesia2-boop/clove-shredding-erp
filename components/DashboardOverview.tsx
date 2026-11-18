'use client';

import React from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  Clock,
  Gauge,
  Layers,
  Sparkles,
  TrendingUp,
  Truck,
} from 'lucide-react';
import { BatchQC, Machine, Order, Shipment } from '../lib/types';
import { evaluateOrderDelay } from '../lib/calculations';

interface DashboardOverviewProps {
  orders: Order[];
  machines: Machine[];
  batches: BatchQC[];
  shipments: Shipment[];
  onSelectTab: (tab: any) => void;
  onOpenModal: (modal: string) => void;
}

export default function DashboardOverview({
  orders,
  machines,
  batches,
  shipments,
  onSelectTab,
  onOpenModal,
}: DashboardOverviewProps) {
  // Aggregate Metrics
  const activeOrders = orders.filter((o) => o.status !== 'Selesai');
  const totalWeightKg = orders.reduce((sum, o) => sum + o.quantityKg, 0);
  const totalProcessedKg = orders.reduce((sum, o) => sum + o.processedKg, 0);
  const overallProgress = totalWeightKg > 0 ? (totalProcessedKg / totalWeightKg) * 100 : 0;

  // QC Averages
  const avgRendemen =
    batches.length > 0
      ? batches.reduce((sum, b) => sum + b.rendemenPercent, 0) / batches.length
      : 89.2;
  const avgDust =
    batches.length > 0
      ? batches.reduce((sum, b) => sum + b.dustPercent, 0) / batches.length
      : 5.8;
  const avgStem =
    batches.length > 0
      ? batches.reduce((sum, b) => sum + b.stemPercent, 0) / batches.length
      : 3.8;

  // Delays evaluation
  const delayedOrders = activeOrders
    .map((order) => {
      const machine = machines.find((m) => m.id === order.machineId);
      const delayEval = evaluateOrderDelay(order, machine);
      return { order, machine, delayEval };
    })
    .filter((item) => item.delayEval.isDelayed);

  const totalActiveCapacity = machines
    .filter((m) => m.status === 'Running')
    .reduce((sum, m) => sum + m.capacityKgPerHour, 0);

  return (
    <div className="space-y-6">
      {/* Delayed Orders Alert Banner */}
      {delayedOrders.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-amber-800">
                Peringatan: Terdeteksi {delayedOrders.length} Order Berpotensi Terlambat!
              </h3>
              <p className="text-xs text-amber-700 mt-1">
                Kapasitas mesin saat ini tidak mencukupi untuk menyelesaikan beban sebelum batas deadline pelanggan:
              </p>
              <div className="mt-2 space-y-1.5">
                {delayedOrders.map(({ order, delayEval, machine }) => (
                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between text-xs bg-white/70 px-3 py-1.5 rounded-lg border border-amber-200"
                  >
                    <span className="font-semibold text-slate-800">
                      {order.orderNumber} ({order.clientName}) &middot; Rajang {order.cutSize} &middot; Sisa{' '}
                      {(order.quantityKg - order.processedKg).toLocaleString('id-ID')} kg
                    </span>
                    <span className="text-rose-600 font-bold">
                      {delayEval.varianceDisplay} (Estimasi selesai {delayEval.projectedCompletion})
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => onSelectTab('machines')}
                  className="text-xs font-semibold bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 transition"
                >
                  Sesuaikan Kapasitas / Mesin di Tab Mesin &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top 4 Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Orders */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Beban Order Aktif</span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {activeOrders.length} Order
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {totalWeightKg.toLocaleString('id-ID')}{' '}
            <span className="text-sm font-normal text-slate-500">kg</span>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Progres Selesai</span>
              <span className="font-semibold text-slate-700">
                {overallProgress.toFixed(1)}% ({totalProcessedKg.toLocaleString('id-ID')} kg)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, overallProgress)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* KPI 2: Average Rendemen */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Rata-Rata Rendemen Bersih</span>
            <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
              Target &ge; 88%
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-600 tracking-tight">
            {avgRendemen.toFixed(1)}%
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Hasil rajang prima lolos uji sortir &amp; mesh screen standard Kretek Grade.
          </p>
        </div>

        {/* KPI 3: Average Cyclone Dust */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-amber-300 transition">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Rata-Rata Debu Siklon</span>
            <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md text-[11px]">
              Batas &le; 6.5%
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-600 tracking-tight">
            {avgDust.toFixed(2)}%
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Limbah debu dialirkan ke filter siklon (dapat dimonetisasi untuk bahan dupa/minyak).
          </p>
        </div>

        {/* KPI 4: On-Time Delivery Rate */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Status Ketepatan Waktu</span>
            <span
              className={`font-semibold px-2 py-0.5 rounded-md text-[11px] ${
                delayedOrders.length === 0
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-rose-700 bg-rose-50'
              }`}
            >
              {delayedOrders.length === 0 ? 'Optimal' : 'Ada Delay'}
            </span>
          </div>
          <div
            className={`text-2xl font-bold tracking-tight ${
              delayedOrders.length === 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {delayedOrders.length === 0
              ? '100% On-Track'
              : `${delayedOrders.length} Order Terlambat`}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Berdasarkan kalkulasi kapasitas mesin terpasang ({totalActiveCapacity} kg/jam).
          </p>
        </div>
      </div>

      {/* Middle Row: Machine Load Status & Yield Breakdown Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Machine Status & Load Card */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Status Armada Mesin &amp; Beban Kerja
              </h2>
              <p className="text-xs text-slate-500">
                Pemantauan utilisasi kapasitas per jam dan estimasi sisa waktu operasional
              </p>
            </div>
            <button
              onClick={() => onSelectTab('machines')}
              className="text-xs text-emerald-600 font-semibold hover:underline inline-flex items-center gap-1"
            >
              Kelola Mesin &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {machines.map((machine) => {
              const assignedOrders = orders.filter((o) => o.machineId === machine.id && o.status !== 'Selesai');
              const remainingKg = assignedOrders.reduce(
                (sum, o) => sum + (o.quantityKg - o.processedKg),
                0
              );
              const effectiveCapacity = (machine.capacityKgPerHour * machine.efficiencyPercent) / 100;
              const hoursLeft = effectiveCapacity > 0 ? (remainingKg / effectiveCapacity).toFixed(1) : '0';

              const statusColors = {
                Running: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                Idle: 'bg-slate-100 text-slate-700 border-slate-200',
                Maintenance: 'bg-rose-50 text-rose-700 border-rose-200',
                'Pisau Ditajamkan': 'bg-amber-50 text-amber-700 border-amber-200',
              }[machine.status];

              return (
                <div
                  key={machine.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-300 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {machine.id}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{machine.name}</h4>
                      <p className="text-[11px] text-slate-500">{machine.type}</p>
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusColors}`}
                    >
                      {machine.status}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200/80 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Kapasitas</span>
                      <span className="font-bold text-slate-800">
                        {machine.capacityKgPerHour} kg/j
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Efisiensi</span>
                      <span className="font-bold text-emerald-600">
                        {machine.efficiencyPercent}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Sisa Waktu</span>
                      <span className="font-bold text-slate-800">{hoursLeft} Jam</span>
                    </div>
                  </div>

                  <div className="mt-2.5 text-[11px] text-slate-500 flex justify-between">
                    <span>Antrian: {assignedOrders.length} Order</span>
                    <span className="font-semibold text-slate-700">{remainingKg.toLocaleString('id-ID')} kg</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Yield & Byproduct Composition Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Komposisi Hasil Rajangan
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Rata-rata rendemen, debu, gagang &amp; susut penguapan
            </p>

            {/* Visual Bar Distribution */}
            <div className="h-6 w-full rounded-xl overflow-hidden flex bg-slate-100 mb-4 shadow-inner">
              <div
                className="bg-emerald-500 h-full flex items-center justify-center text-[10px] text-white font-bold"
                style={{ width: `${avgRendemen}%` }}
                title={`Rendemen Prima: ${avgRendemen.toFixed(1)}%`}
              >
                {avgRendemen > 25 ? `${avgRendemen.toFixed(1)}%` : ''}
              </div>
              <div
                className="bg-amber-400 h-full flex items-center justify-center text-[10px] text-white font-bold"
                style={{ width: `${avgDust}%` }}
                title={`Debu Siklon: ${avgDust.toFixed(1)}%`}
              ></div>
              <div
                className="bg-orange-400 h-full flex items-center justify-center text-[10px] text-white font-bold"
                style={{ width: `${avgStem}%` }}
                title={`Gagang: ${avgStem.toFixed(1)}%`}
              ></div>
              <div
                className="bg-slate-300 h-full flex items-center justify-center text-[10px] text-slate-700 font-bold"
                style={{ width: `${Math.max(0, 100 - avgRendemen - avgDust - avgStem)}%` }}
                title="Susut Kadar Air"
              ></div>
            </div>

            {/* Legend items */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span className="font-medium text-slate-800">Cengkeh Rajang Prima</span>
                </div>
                <span className="font-bold text-emerald-700">{avgRendemen.toFixed(1)}%</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/60 border border-amber-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                  <span className="font-medium text-slate-800">Debu Siklon (Byproduct)</span>
                </div>
                <span className="font-bold text-amber-700">{avgDust.toFixed(2)}%</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-orange-50/60 border border-orange-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-400"></span>
                  <span className="font-medium text-slate-800">Gagang Sisa Sortir</span>
                </div>
                <span className="font-bold text-orange-700">{avgStem.toFixed(2)}%</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                  <span className="font-medium text-slate-800">Susut / Penguapan Air</span>
                </div>
                <span className="font-bold text-slate-600">
                  {Math.max(0, 100 - avgRendemen - avgDust - avgStem).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => onSelectTab('analytics')}
              className="w-full text-center text-xs font-semibold text-emerald-700 hover:text-emerald-800 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition"
            >
              Buka Analisis Mendalam &amp; Kurva Kadar Air &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Batches & Live Shipments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Production Batches */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Batch Produksi Terbaru</h3>
              <p className="text-xs text-slate-500">Hasil verifikasi parameter mutu (QC)</p>
            </div>
            <button
              onClick={() => onSelectTab('production')}
              className="text-xs text-emerald-600 font-semibold hover:underline"
            >
              Lihat Semua ({batches.length}) &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {batches.slice(0, 3).map((b) => (
              <div
                key={b.id}
                className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800">{b.id}</span>
                    <span className="text-slate-400">&middot;</span>
                    <span className="font-medium text-slate-600">{b.machineId}</span>
                    <span className="text-slate-400">&middot;</span>
                    <span className="text-slate-500">{b.operator}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-slate-500">
                    <span>Input: <strong>{b.rawInputKg} kg</strong></span>
                    <span>Prima: <strong className="text-emerald-600">{b.cleanCutKg} kg ({b.rendemenPercent}%)</strong></span>
                    <span>Debu: <strong className="text-amber-600">{b.dustKg} kg ({b.dustPercent}%)</strong></span>
                    <span>Kadar Air: <strong>{b.moisturePercent}%</strong></span>
                  </div>
                </div>
                <div>
                  <span
                    className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                      b.qcStatus === 'Lolos Prima'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {b.qcStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Shipments */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pengiriman Berjalan</h3>
              <p className="text-xs text-slate-500">Surat Jalan dan armada ekspedisi ke pabrik rokok</p>
            </div>
            <button
              onClick={() => onSelectTab('shipments')}
              className="text-xs text-emerald-600 font-semibold hover:underline"
            >
              Lihat Log Pengiriman &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {shipments.map((s) => (
              <div
                key={s.id}
                className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800">{s.doNumber}</span>
                    <span className="text-slate-400">&middot;</span>
                    <span className="font-semibold text-slate-800">{s.clientName}</span>
                  </div>
                  <p className="text-slate-500 mt-0.5">
                    {s.goodsDescription} &middot; Driver: {s.driverName} ({s.vehiclePlate})
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Tujuan: {s.destinationCity} &middot; Estimasi Tiba: {s.estimatedArrival}
                  </p>
                </div>
                <div>
                  <span
                    className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                      s.status === 'Dalam Perjalanan'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : s.status === 'Persiapan Muat'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
