'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownLeft,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  Filter,
  PackageCheck,
  Plus,
  Search,
  ShoppingCart,
  Truck,
  UserCheck,
} from 'lucide-react';
import { InventoryItem, Order } from '../lib/types';
import { PurchaseOrder, PurchaseStatus } from '../lib/financial-types';

interface ProcurementModuleProps {
  purchaseOrders: PurchaseOrder[];
  customerOrders: Order[];
  inventory: InventoryItem[];
  onOpenAddPO: () => void;
  onUpdatePOStatus: (poId: string, newStatus: PurchaseStatus) => void;
  onReceiveGoods: (po: PurchaseOrder) => void;
}

export default function ProcurementModule({
  purchaseOrders,
  customerOrders,
  inventory,
  onOpenAddPO,
  onUpdatePOStatus,
  onReceiveGoods,
}: ProcurementModuleProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');

  // MRP Calculation: Raw Material Requirement vs Available Stock
  const totalCustomerOrderKg = customerOrders.reduce((sum, o) => sum + o.quantityKg, 0);
  const estimatedRendemen = 0.89; // 89% benchmark
  const totalRawRequiredKg = Math.round(totalCustomerOrderKg / estimatedRendemen);

  const rawInventory = inventory.find((i) => i.category === 'RAW_MATERIAL')?.currentStockKg || 28500;
  const onOrderPurchasesKg = purchaseOrders
    .filter((po) => po.status !== 'Diterima Penuh (Selesai)')
    .reduce((sum, po) => sum + po.quantityKg, 0);

  const totalEffectiveSupplyKg = rawInventory + onOrderPurchasesKg;
  const deficitOrSurplusKg = totalEffectiveSupplyKg - totalRawRequiredKg;
  const isDeficit = deficitOrSurplusKg < 0;

  const filteredPOs = purchaseOrders.filter((po) => {
    const matchesStatus =
      statusFilter === 'Semua' ? true : po.status === statusFilter;
    const matchesSearch =
      po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (po.customerName && po.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      po.commodityType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: PurchaseStatus) => {
    switch (status) {
      case 'Draf Pengajuan':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'PO Terkirim ke Supplier':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Dalam Pengiriman':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Tiba & Uji Sampling QC':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Diterima Penuh (Selesai)':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const formatIDR = (num: number) => 'Rp ' + Math.round(num).toLocaleString('id-ID');

  return (
    <div className="space-y-6">
      {/* MRP Demand Planning Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-emerald-800/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShoppingCart className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-lg font-bold">
                  Sistem Pengadaan &amp; Pembelian Bahan Baku Berdasarkan Permintaan Order (MRP)
                </h2>
                <p className="text-xs text-emerald-200 mt-0.5">
                  Kalkulasi otomatis kebutuhan bunga cengkeh utuh kering berdasarkan volume purchase order (PO) pabrikan rokok
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenAddPO}
            className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs whitespace-nowrap self-start lg:self-auto active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Buat PO Pembelian Baru</span>
          </button>
        </div>

        {/* MRP KPI Grid */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-emerald-800/60 text-xs">
          <div className="bg-emerald-800/30 p-3 rounded-xl border border-emerald-700/40">
            <span className="text-emerald-300 block text-[11px]">Beban Order Klien</span>
            <span className="text-base font-bold text-white">
              {totalCustomerOrderKg.toLocaleString('id-ID')} kg
            </span>
            <span className="text-[10px] text-emerald-200 block">Target Cengkeh Rajang</span>
          </div>

          <div className="bg-emerald-800/30 p-3 rounded-xl border border-emerald-700/40">
            <span className="text-emerald-300 block text-[11px]">Kebutuhan Mentah (89% Rendemen)</span>
            <span className="text-base font-bold text-amber-300">
              {totalRawRequiredKg.toLocaleString('id-ID')} kg
            </span>
            <span className="text-[10px] text-emerald-200 block">Kebutuhan Bunga Cengkeh</span>
          </div>

          <div className="bg-emerald-800/30 p-3 rounded-xl border border-emerald-700/40">
            <span className="text-emerald-300 block text-[11px]">Stok Tersedia + Dalam Pesanan</span>
            <span className="text-base font-bold text-teal-300">
              {totalEffectiveSupplyKg.toLocaleString('id-ID')} kg
            </span>
            <span className="text-[10px] text-emerald-200 block">
              Gudang: {rawInventory.toLocaleString('id-ID')} &middot; PO: {onOrderPurchasesKg.toLocaleString('id-ID')}
            </span>
          </div>

          <div className={`p-3 rounded-xl border ${isDeficit ? 'bg-rose-900/40 border-rose-600/50' : 'bg-emerald-800/30 border-emerald-700/40'}`}>
            <span className="text-emerald-300 block text-[11px]">Status Keseimbangan Bahan</span>
            <span className={`text-base font-bold ${isDeficit ? 'text-rose-300' : 'text-emerald-300'}`}>
              {isDeficit ? `Defisit ${Math.abs(deficitOrSurplusKg).toLocaleString('id-ID')} kg` : `Surplus +${deficitOrSurplusKg.toLocaleString('id-ID')} kg`}
            </span>
            <span className="text-[10px] text-emerald-200 block">
              {isDeficit ? 'Wajib terbitkan PO baru!' : 'Pasokan aman tercukupi'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari Nomor PO Pembelian, Supplier, atau Order Klien Terkait..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {['Semua', 'Dalam Pengiriman', 'Tiba & Uji Sampling QC', 'PO Terkirim ke Supplier', 'Diterima Penuh (Selesai)'].map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                  statusFilter === status
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>
      </div>

      {/* Purchase Orders Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPOs.map((po) => {
          const isDone = po.status === 'Diterima Penuh (Selesai)';

          return (
            <div
              key={po.id}
              className={`bg-white border rounded-2xl p-5 shadow-xs transition hover:shadow-md flex flex-col justify-between ${
                isDone ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200'
              }`}
            >
              <div>
                {/* Header: PO Number & Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-400">
                      {po.poNumber}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{po.supplierName}</h3>
                    <p className="text-[11px] text-slate-500">{po.supplierContact}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                      po.status
                    )}`}
                  >
                    {po.status}
                  </span>
                </div>

                {/* Linked Order & Commodity */}
                <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Komoditas:</span>
                    <span className="font-bold text-slate-800">{po.commodityType}</span>
                  </div>
                  {po.customerName && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Order Pemesan:</span>
                      <span className="font-semibold text-emerald-700">{po.customerName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Volume Pembelian:</span>
                    <span className="font-bold text-slate-900">
                      {po.quantityKg.toLocaleString('id-ID')} kg
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200/80">
                    <span className="text-slate-500">Harga Satuan:</span>
                    <span className="font-semibold text-slate-700">
                      {formatIDR(po.unitPrice)} / kg
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 pt-0.5">
                    <span>Total Tagihan:</span>
                    <span className="text-emerald-700">{formatIDR(po.totalAmount)}</span>
                  </div>
                </div>

                {/* Metadata & Requirements */}
                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>
                      Tanggal PO: {po.orderDate} &middot; Estimasi Tiba: <strong>{po.estimatedArrival}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <DollarSign className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>Syarat Pembayaran: <strong>{po.paymentTerms}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <PackageCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>Syarat Kadar Air Maks: <strong>&le; {po.targetMoisturePercent}%</strong></span>
                  </div>
                  {po.notes && (
                    <p className="text-[10px] text-slate-500 italic mt-1 bg-slate-50/70 p-2 rounded-lg">
                      {po.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Status Update & Receive Goods Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {!isDone ? (
                  <>
                    <select
                      value={po.status}
                      onChange={(e) => onUpdatePOStatus(po.id, e.target.value as PurchaseStatus)}
                      className="text-xs font-medium px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 flex-1"
                    >
                      <option value="Draf Pengajuan">Draf Pengajuan</option>
                      <option value="PO Terkirim ke Supplier">PO Terkirim</option>
                      <option value="Dalam Pengiriman">Dalam Pengiriman</option>
                      <option value="Tiba & Uji Sampling QC">Uji Sampling QC</option>
                      <option value="Diterima Penuh (Selesai)">Diterima Penuh</option>
                    </select>

                    <button
                      onClick={() => onReceiveGoods(po)}
                      className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition shadow-xs whitespace-nowrap active:scale-95"
                      title="Konfirmasi barang telah dibongkar dan lolos QC ke Silo Gudang"
                    >
                      <ArrowDownLeft className="h-3.5 w-3.5" />
                      <span>Terima Gudang</span>
                    </button>
                  </>
                ) : (
                  <div className="w-full flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <span className="flex items-center gap-1 font-bold">
                      <CheckCircle2 className="h-4 w-4" />
                      Barang Telah Masuk Gudang
                    </span>
                    <span className="font-semibold">{po.receivedKg.toLocaleString('id-ID')} kg</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
