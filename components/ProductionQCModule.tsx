'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { BatchQC, QCStatus } from '../lib/types';

interface ProductionQCModuleProps {
  batches: BatchQC[];
  onOpenAddBatch: () => void;
}

export default function ProductionQCModule({
  batches,
  onOpenAddBatch,
}: ProductionQCModuleProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.machineId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'Semua' ? true : b.qcStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: QCStatus) => {
    switch (status) {
      case 'Lolos Prima':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Toleransi':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Koreksi Kelembaban':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Ditolak':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quality Standards Guidance Card */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-800/80 text-emerald-300">
                <Sparkles className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-bold">
                Standar Parameter Mutu Rajang Cengkeh (Kretek &amp; Export Grade)
              </h2>
            </div>
            <p className="text-xs text-emerald-200 mt-1 max-w-2xl">
              Setiap batch perajangan wajib diverifikasi melalui uji sampling mesh screen, kadar air moisture analyzer, dan penimbangan akurat fraksi debu siklon.
            </p>
          </div>
          <button
            onClick={onOpenAddBatch}
            className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs whitespace-nowrap self-start md:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Input Hasil Batch (QC)</span>
          </button>
        </div>

        {/* Parameter Threshold Badges */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-emerald-800/60 text-xs">
          <div className="bg-emerald-800/40 p-2.5 rounded-xl border border-emerald-700/50">
            <span className="text-emerald-300 block text-[11px]">Rendemen Prima</span>
            <span className="text-base font-bold text-white">&ge; 88.0%</span>
            <span className="text-[10px] text-emerald-200 block">Target Optimal 90%</span>
          </div>
          <div className="bg-emerald-800/40 p-2.5 rounded-xl border border-emerald-700/50">
            <span className="text-emerald-300 block text-[11px]">Debu Siklon (Waste)</span>
            <span className="text-base font-bold text-amber-300">&le; 6.5%</span>
            <span className="text-[10px] text-emerald-200 block">Toleransi Maks 7.5%</span>
          </div>
          <div className="bg-emerald-800/40 p-2.5 rounded-xl border border-emerald-700/50">
            <span className="text-emerald-300 block text-[11px]">Kadar Air (Moisture)</span>
            <span className="text-base font-bold text-teal-300">11.5% - 13.0%</span>
            <span className="text-[10px] text-emerald-200 block">&lt;10.5% rapuh, &gt;13.8% lekat</span>
          </div>
          <div className="bg-emerald-800/40 p-2.5 rounded-xl border border-emerald-700/50">
            <span className="text-emerald-300 block text-[11px]">Gagang Sisa Sortir</span>
            <span className="text-base font-bold text-orange-300">&le; 4.5%</span>
            <span className="text-[10px] text-emerald-200 block">Dipisahkan ke Distilasi</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari Batch ID, No Order, Mesin, atau Nama Operator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {['Semua', 'Lolos Prima', 'Toleransi', 'Koreksi Kelembaban'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Batch QC Log Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 font-semibold">Batch &amp; Shift</th>
                <th className="px-4 py-3 font-semibold">Order &amp; Mesin</th>
                <th className="px-4 py-3 font-semibold text-right">Input Bahan (kg)</th>
                <th className="px-4 py-3 font-semibold text-right">Hasil Prima (kg / %)</th>
                <th className="px-4 py-3 font-semibold text-right">Debu Siklon (kg / %)</th>
                <th className="px-4 py-3 font-semibold text-right">Gagang (kg / %)</th>
                <th className="px-4 py-3 font-semibold text-center">Kadar Air</th>
                <th className="px-4 py-3 font-semibold text-center">Status QC</th>
                <th className="px-4 py-3 font-semibold">Catatan Mutu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBatches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3.5">
                    <span className="font-mono font-bold text-slate-900 block">{b.id}</span>
                    <span className="text-[11px] text-slate-500">
                      Shift {b.shift} &middot; {b.operator}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-slate-800 block">{b.orderId}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{b.machineId}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-bold text-slate-800">
                    {b.rawInputKg.toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="font-bold text-emerald-600 block">
                      {b.cleanCutKg.toLocaleString('id-ID')} kg
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                      {b.rendemenPercent}%
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="font-bold text-amber-600 block">
                      {b.dustKg.toLocaleString('id-ID')} kg
                    </span>
                    <span className="text-[11px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-sm">
                      {b.dustPercent}%
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="font-medium text-slate-700 block">
                      {b.stemKg.toLocaleString('id-ID')} kg
                    </span>
                    <span className="text-[11px] text-slate-500">{b.stemPercent}%</span>
                  </td>
                  <td className="px-4 py-3.5 text-center font-bold text-slate-800">
                    <span
                      className={`px-2 py-0.5 rounded-md ${
                        b.moisturePercent >= 11.5 && b.moisturePercent <= 13.0
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {b.moisturePercent}%
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full border ${getStatusBadge(
                        b.qcStatus
                      )}`}
                    >
                      {b.qcStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 text-[11px] max-w-xs truncate">
                    {b.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
