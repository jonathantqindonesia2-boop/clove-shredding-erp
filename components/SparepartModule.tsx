'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  Clock,
  Cog,
  DollarSign,
  Download,
  Filter,
  History,
  Layers,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Wrench,
  Zap,
} from 'lucide-react';
import {
  MachineCodeDef,
  MaintenanceHistory,
  PartLifespanTracker,
  SparePart,
  SparePartCategory,
  SparePartRequisition,
} from '../lib/sparepart-types';

interface SparepartModuleProps {
  spareParts: SparePart[];
  machines: MachineCodeDef[];
  lifespanTrackers: PartLifespanTracker[];
  maintenanceHistory: MaintenanceHistory[];
  requisitions: SparePartRequisition[];
  onOpenAddRequisition: () => void;
  onApproveAndInstallPart: (req: SparePartRequisition) => void;
  onUpdateRequisitionStatus: (reqId: string, newStatus: any) => void;
}

export default function SparepartModule({
  spareParts,
  machines,
  lifespanTrackers,
  maintenanceHistory,
  requisitions,
  onOpenAddRequisition,
  onApproveAndInstallPart,
  onUpdateRequisitionStatus,
}: SparepartModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'lifespan' | 'history' | 'requisitions'>('lifespan');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMachineFilter, setSelectedMachineFilter] = useState<string>('ALL');

  const formatIDR = (num: number) => 'Rp ' + Math.round(num).toLocaleString('id-ID');

  // Critical part alerts
  const criticalParts = lifespanTrackers.filter((t) => t.wearCondition === 'OVERDUE_REPLACE');
  const warningParts = lifespanTrackers.filter((t) => t.wearCondition === 'WARNING');
  const lowStockParts = spareParts.filter((p) => p.stockQty <= p.minBuffer);

  // Filtered lists
  const filteredParts = spareParts.filter((part) => {
    const matchesSearch =
      part.partCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.storageBin.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMachine =
      selectedMachineFilter === 'ALL'
        ? true
        : part.compatibleMachineCodes.includes(selectedMachineFilter);
    return matchesSearch && matchesMachine;
  });

  const filteredTrackers = lifespanTrackers.filter((t) => {
    const matchesSearch =
      t.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.partCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.machineCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMachine =
      selectedMachineFilter === 'ALL' ? true : t.machineCode === selectedMachineFilter;
    return matchesSearch && matchesMachine;
  });

  const filteredHistory = maintenanceHistory.filter((h) => {
    const matchesSearch =
      h.logNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.issueDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.technician.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMachine =
      selectedMachineFilter === 'ALL' ? true : h.machineCode === selectedMachineFilter;
    return matchesSearch && matchesMachine;
  });

  const filteredRequisitions = requisitions.filter((r) => {
    const matchesSearch =
      r.reqNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.partCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.machineCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMachine =
      selectedMachineFilter === 'ALL' ? true : r.machineCode === selectedMachineFilter;
    return matchesSearch && matchesMachine;
  });

  const getCategoryBadge = (cat: SparePartCategory) => {
    switch (cat) {
      case 'CUTTING_BLADE':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'HYDRAULIC':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'BEARING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'TRANSMISSION':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'FILTRATION':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CONSUMABLE':
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Alert Callouts */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-6 shadow-md border border-slate-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Wrench className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-lg font-bold">
                  Gudang Sparepart, Analisa Umur Suku Cadang &amp; History Perawatan Mesin (CMMS)
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Standarisasi Koding Mesin (<code>MCH-ROT-01..04</code>) &amp; Koding Part (<code>PRT-CUT-BLD-01..08</code>) dengan Sistem Tiket Permintaan
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenAddRequisition}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs whitespace-nowrap active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>+ Minta Sparepart untuk Mesin</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Overview */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-700 text-xs">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[11px]">Total Item Sparepart</span>
            <span className="text-base font-bold text-white">{spareParts.length} Tipe Part</span>
            <span className="text-[10px] text-slate-400 block">Katalog Suku Cadang Aktif</span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[11px]">Part Overdue / Kritis</span>
            <span className="text-base font-bold text-rose-400">{criticalParts.length} Komponen</span>
            <span className="text-[10px] text-rose-300 block">Wajib Diganti Segera</span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[11px]">Part Warning (Mendekati Aus)</span>
            <span className="text-base font-bold text-amber-400">{warningParts.length} Komponen</span>
            <span className="text-[10px] text-amber-300 block">Sisa Umur &lt; 35%</span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[11px]">Stok Kritis Gudang</span>
            <span className="text-base font-bold text-teal-300">{lowStockParts.length} Item</span>
            <span className="text-[10px] text-teal-200 block">&le; Buffer Minimum</span>
          </div>
        </div>
      </div>

      {/* Critical Maintenance Alert Banner if any parts are overdue */}
      {criticalParts.length > 0 && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-rose-800">
                Peringatan Kerusakan: Terdeteksi {criticalParts.length} Komponen Mesin Melebihi Batas Umur Pakai!
              </h3>
              <p className="text-xs text-rose-700 mt-1">
                Komponen berikut wajib segera diganti untuk mencegah gagal potong, kerusakan motor penggerak, atau penurunan drastis rendemen cengkeh:
              </p>
              <div className="mt-2 space-y-1.5">
                {criticalParts.map((cp) => (
                  <div
                    key={cp.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between text-xs bg-white/80 px-3 py-1.5 rounded-lg border border-rose-200"
                  >
                    <span className="font-semibold text-slate-800">
                      [{cp.machineCode}] {cp.machineName} &middot; <span className="font-mono text-rose-700">{cp.partCode}</span> ({cp.partName})
                    </span>
                    <span className="text-rose-600 font-bold">
                      Sisa Umur: 0 Jam (Terpakai {cp.currentRunningHours}/{cp.maxLifespanHours} Jam)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex overflow-x-auto gap-1 text-xs">
        <button
          onClick={() => setActiveSubTab('lifespan')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition ${
            activeSubTab === 'lifespan'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Analisa Umur Sparepart ({lifespanTrackers.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('requisitions')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition ${
            activeSubTab === 'requisitions'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wrench className="h-4 w-4" />
          <span>Permintaan Sparepart Mesin ({requisitions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('inventory')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition ${
            activeSubTab === 'inventory'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Boxes className="h-4 w-4" />
          <span>Gudang Persediaan Sparepart ({spareParts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition ${
            activeSubTab === 'history'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="h-4 w-4" />
          <span>History Perawatan &amp; Kerusakan ({maintenanceHistory.length})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari Kode Mesin (MCH-...), Kode Part (PRT-...), Nama Suku Cadang, atau Teknisi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          />
        </div>

        {/* Machine Filter Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium whitespace-nowrap">Filter Mesin:</span>
          <select
            value={selectedMachineFilter}
            onChange={(e) => setSelectedMachineFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700"
          >
            <option value="ALL">Semua Mesin</option>
            {machines.map((m) => (
              <option key={m.code} value={m.code}>
                {m.code} - {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SUB-TAB 1: ANALISA UMUR SPAREPART (LIFESPAN & WEAR TRACKER) */}
      {activeSubTab === 'lifespan' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTrackers.map((tracker) => {
              const conditionBadge = {
                PRIMA: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                WARNING: 'bg-amber-50 text-amber-700 border-amber-200',
                OVERDUE_REPLACE: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse',
              }[tracker.wearCondition];

              const progressColor =
                tracker.healthPercent > 50
                  ? 'bg-emerald-500'
                  : tracker.healthPercent > 20
                  ? 'bg-amber-500'
                  : 'bg-rose-500';

              return (
                <div
                  key={tracker.id}
                  className={`bg-white border rounded-2xl p-5 shadow-xs transition hover:shadow-md flex flex-col justify-between ${
                    tracker.wearCondition === 'OVERDUE_REPLACE'
                      ? 'border-rose-400 bg-rose-50/15'
                      : tracker.wearCondition === 'WARNING'
                      ? 'border-amber-300'
                      : 'border-slate-200'
                  }`}
                >
                  <div>
                    {/* Header: Machine Code & Part Code */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            {tracker.machineCode}
                          </span>
                          <span className="text-slate-400">&middot;</span>
                          <span className="font-mono text-[11px] font-bold text-slate-500">
                            {tracker.partCode}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1.5">
                          {tracker.partName}
                        </h4>
                        <p className="text-[11px] text-slate-500">{tracker.machineName}</p>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${conditionBadge}`}
                      >
                        {tracker.wearCondition.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Lifespan Progress Gauge */}
                    <div className="mt-4 bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Sisa Umur Pakai:</span>
                        <span className="font-bold text-slate-900">
                          {tracker.healthPercent}% ({tracker.remainingHours} Jam Tersisa)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-500 ${progressColor}`}
                          style={{ width: `${Math.min(100, tracker.healthPercent)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Terpakai: {tracker.currentRunningHours} Jam</span>
                        <span>Maks: {tracker.maxLifespanHours} Jam</span>
                      </div>
                    </div>

                    {/* Operational Throughput Metrics */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 block">Total Cacahan</span>
                        <span className="font-bold text-slate-800">
                          {tracker.currentProcessedTons} / {tracker.maxThroughputTons} Ton
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 block">Frekuensi Asah</span>
                        <span className="font-bold text-slate-800">{tracker.sharpeningCount} Kali</span>
                      </div>
                    </div>

                    {/* Recommended Action Box */}
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                      <p className="font-semibold text-slate-800 mb-0.5">Rekomendasi Pemeliharaan:</p>
                      <p>{tracker.recommendedAction}</p>
                    </div>
                  </div>

                  {/* Footer metadata */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Terpasang Sejak: {tracker.installedDate}</span>
                    <button
                      onClick={onOpenAddRequisition}
                      className="font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      Ajukan Ganti &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: PERMINTAAN SPAREPART (REQUISITIONS) */}
      {activeSubTab === 'requisitions' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Daftar Permintaan Sparepart &amp; Pemasangan ke Mesin
              </h3>
              <p className="text-xs text-slate-500">
                Tiket pengeluaran suku cadang dari gudang yang dikaitkan langsung ke kode mesin
              </p>
            </div>

            <button
              onClick={onOpenAddRequisition}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition shadow-xs whitespace-nowrap active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Buat Tiket Permintaan</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3 font-semibold">No Tiket &amp; Tanggal</th>
                  <th className="px-4 py-3 font-semibold">Kode Mesin Tujuan</th>
                  <th className="px-4 py-3 font-semibold">Kode Part &amp; Nama Part</th>
                  <th className="px-4 py-3 font-semibold text-right">Kuantitas</th>
                  <th className="px-4 py-3 font-semibold">Urgensi &amp; Alasan</th>
                  <th className="px-4 py-3 font-semibold text-right">Est. Biaya</th>
                  <th className="px-4 py-3 font-semibold text-center">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequisitions.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold text-slate-900 block">{req.reqNumber}</span>
                      <span className="text-[11px] text-slate-500">{req.requestDate}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block">
                        {req.machineCode}
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">{req.machineName}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-semibold text-slate-800">{req.partCode}</span>
                      <span className="text-slate-600 block">{req.partName}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                      {req.quantity} pcs
                    </td>
                    <td className="px-4 py-3.5 max-w-xs">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 ${
                          req.urgency === 'URGENT_BREAKDOWN'
                            ? 'bg-rose-100 text-rose-800'
                            : req.urgency === 'PREVENTIVE'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {req.urgency.replace('_', ' ')}
                      </span>
                      <p className="text-[11px] text-slate-500 truncate">{req.reason}</p>
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-slate-800">
                      {formatIDR(req.estimatedCost)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                          req.status === 'Terpasang di Mesin'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : req.status === 'Disetujui'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {req.status !== 'Terpasang di Mesin' ? (
                        <button
                          onClick={() => onApproveAndInstallPart(req)}
                          className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-xs transition active:scale-95 whitespace-nowrap"
                          title="Keluarkan sparepart dari gudang dan reset umur pakai mesin terkait ke 100%"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Pasang ke Mesin</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Selesai Terpasang</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: GUDANG PERSEDIAAN SPAREPART (INVENTORY) */}
      {activeSubTab === 'inventory' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center text-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Katalog Suku Cadang Mesin Perajang</h3>
              <p className="text-slate-500">Stok fisik gudang sparepart, batas minimum buffer, dan kompatibilitas mesin</p>
            </div>
            <span className="font-semibold text-slate-600">Total Nilai Persediaan: {formatIDR(spareParts.reduce((s, p) => s + p.stockQty * p.unitCost, 0))}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Kode Part &amp; Lokasi Rak</th>
                  <th className="px-4 py-3 font-semibold">Nama Sparepart</th>
                  <th className="px-4 py-3 font-semibold">Kategori</th>
                  <th className="px-4 py-3 font-semibold">Mesin Kompatibel</th>
                  <th className="px-4 py-3 font-semibold text-right">Stok Fisik</th>
                  <th className="px-4 py-3 font-semibold text-right">Buffer Min</th>
                  <th className="px-4 py-3 font-semibold text-right">Harga Satuan</th>
                  <th className="px-4 py-3 font-semibold">Spesifikasi Teknis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredParts.map((part) => {
                  const isLow = part.stockQty <= part.minBuffer;

                  return (
                    <tr key={part.partCode} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3.5">
                        <span className="font-mono font-bold text-slate-900 block">{part.partCode}</span>
                        <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          {part.storageBin}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-800">{part.partName}</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryBadge(
                            part.category
                          )}`}
                        >
                          {part.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {part.compatibleMachineCodes.map((mCode) => (
                            <span
                              key={mCode}
                              className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold"
                            >
                              {mCode}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold">
                        <span className={isLow ? 'text-rose-600 font-extrabold' : 'text-slate-900'}>
                          {part.stockQty} {part.unit}
                        </span>
                        {isLow && (
                          <span className="block text-[10px] text-rose-500 font-normal">Restock Segera!</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right text-slate-500">{part.minBuffer} {part.unit}</td>
                      <td className="px-4 py-3.5 text-right font-semibold text-slate-800">
                        {formatIDR(part.unitCost)}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 text-[11px] max-w-xs truncate">
                        {part.specifications}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: HISTORY PERAWATAN & KERUSAKAN MESIN (CMMS) */}
      {activeSubTab === 'history' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center text-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Log Catatan Pemeliharaan &amp; Riwayat Kerusakan (Maintenance History)
              </h3>
              <p className="text-slate-500">Rekam jejak perbaikan, jam downtime mesin, penggantian part dan biaya</p>
            </div>
            <span className="text-slate-600 font-medium">Total Catatan: {filteredHistory.length} Kasus</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {filteredHistory.map((h) => {
              const typeBadge = {
                PREVENTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                BREAKDOWN_REPAIR: 'bg-rose-50 text-rose-700 border-rose-200',
                BLADE_SHARPENING: 'bg-amber-50 text-amber-700 border-amber-200',
              }[h.type];

              return (
                <div key={h.id} className="p-4 hover:bg-slate-50/70 transition space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{h.logNumber}</span>
                      <span className="text-slate-400">&middot;</span>
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {h.machineCode}
                      </span>
                      <span className="font-semibold text-slate-800">{h.machineName}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeBadge}`}>
                        {h.type.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                      <span>Downtime: <strong className="text-rose-600">{h.downtimeHours} Jam</strong></span>
                      <span>Tanggal: {h.date}</span>
                    </div>
                  </div>

                  <p className="text-slate-700 font-medium">
                    <span className="text-slate-500">Gejala / Masalah:</span> {h.issueDescription}
                  </p>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                    <div>
                      <span className="font-semibold text-slate-800">Tindakan Perbaikan: </span>
                      <span className="text-slate-600">{h.actionTaken}</span>
                      {h.replacedPartCode && (
                        <span className="block mt-0.5 text-emerald-700 font-mono font-semibold">
                          Part Diganti: {h.replacedPartCode} ({h.replacedPartName}) - {h.replacedPartQty} pcs
                        </span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-slate-500 block">Teknisi: {h.technician}</span>
                      <span className="font-bold text-slate-900">Biaya: {formatIDR(h.totalCost)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
