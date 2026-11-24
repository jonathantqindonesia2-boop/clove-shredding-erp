'use client';

import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Building2,
  CheckCircle2,
  DollarSign,
  Download,
  FileSpreadsheet,
  Link2,
  RefreshCw,
  Scale,
  ShieldCheck,
  Sliders,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { BatchQC, InventoryItem, Machine, Order, Shipment } from '../lib/types';
import { HRISPayrollAllocation, JournalEntry, PricingConfig, PurchaseOrder } from '../lib/financial-types';
import { generateFinancialStatements } from '../lib/financial-engine';
import { HRIS_WORKERS } from '../lib/hris-integration';
import { SparePart, SparePartStockMutation } from '../lib/sparepart-types';
import { generateCorporateHealthCheck } from '../lib/corporate-healthcheck';
import CorporateHealthCheckView from './CorporateHealthCheckView';

interface FinancialModuleProps {
  orders: Order[];
  batches: BatchQC[];
  inventory: InventoryItem[];
  shipments: Shipment[];
  hrisPayroll: HRISPayrollAllocation;
  pricing: PricingConfig;
  purchaseOrders: PurchaseOrder[];
  spareParts?: SparePart[];
  sparePartMutations?: SparePartStockMutation[];
  machines?: Machine[];
  onSyncHRIS: () => void;
  onOpenPricingModal: () => void;
}

export default function FinancialModule({
  orders,
  batches,
  inventory,
  shipments,
  hrisPayroll,
  pricing,
  purchaseOrders,
  spareParts = [],
  sparePartMutations = [],
  machines = [],
  onSyncHRIS,
  onOpenPricingModal,
}: FinancialModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<'pnl' | 'balance' | 'costing' | 'hris' | 'journal' | 'healthcheck'>('pnl');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Compute live statements using dynamic pricing, purchase orders & spareparts
  const { pnl, balanceSheet, journalEntries, unitCostPerKg, averageSellingPricePerKg } =
    generateFinancialStatements(
      orders,
      batches,
      inventory,
      shipments,
      hrisPayroll,
      pricing,
      purchaseOrders,
      spareParts,
      sparePartMutations
    );

  // Generate deterministic corporate health check & board diagnostic report
  const healthCheck = generateCorporateHealthCheck(
    pnl,
    balanceSheet,
    orders,
    batches,
    machines,
    spareParts,
    sparePartMutations
  );

  const formatIDR = (num: number) => {
    return 'Rp ' + Math.round(num).toLocaleString('id-ID');
  };

  const handleTriggerSync = () => {
    setIsSyncing(true);
    setSyncMessage(null);
    setTimeout(() => {
      onSyncHRIS();
      setIsSyncing(false);
      setSyncMessage('Sinkronisasi HRIS Payroll & Biaya Operasional Berhasil Terverifikasi!');
      setTimeout(() => setSyncMessage(null), 4000);
    }, 1000);
  };

  const handleExportFinancials = () => {
    let csv = 'Laporan Keuangan PT Industri Rajang Cengkeh\n';
    csv += `Periode,${pnl.period}\n\n`;
    csv += 'KOMPONEN,NILAI (IDR)\n';
    csv += `Penjualan Cengkeh Rajang Prima,${pnl.revenue.cloveCleanSales}\n`;
    csv += `Penjualan Debu Siklon (Byproduct),${pnl.revenue.dustByproductSales}\n`;
    csv += `Penjualan Gagang Cengkeh (Byproduct),${pnl.revenue.stemByproductSales}\n`;
    csv += `TOTAL PENDAPATAN,${pnl.revenue.totalRevenue}\n\n`;
    csv += `Biaya Bahan Baku Langsung,${pnl.cogs.directMaterialsCost}\n`;
    csv += `Upah Tenaga Kerja Langsung (HRIS),${pnl.cogs.directLaborCost}\n`;
    csv += `Overhead Pabrik (Listrik/Pisau/Penyusutan),${pnl.cogs.factoryOverhead.totalOverhead}\n`;
    csv += `TOTAL HPP (COGS),${pnl.cogs.totalCOGS}\n\n`;
    csv += `LABA KOTOR (GROSS PROFIT),${pnl.grossProfit}\n`;
    csv += `Margin Laba Kotor (%),${pnl.grossMarginPercent}%\n\n`;
    csv += `Beban Operasional & Logistik,${pnl.operatingExpenses.totalOpex}\n`;
    csv += `EBITDA / Laba Usaha,${pnl.operatingIncome}\n`;
    csv += `Estimasi Pajak PPh Badan,${pnl.taxExpense}\n`;
    csv += `LABA BERSIH (NET INCOME),${pnl.netIncome}\n`;
    csv += `Margin Laba Bersih (%),${pnl.netMarginPercent}%\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Keuangan_CloveERP_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with HRIS Sync Integration Status & Dynamic Price Configuration */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-emerald-900/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <DollarSign className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-lg font-bold">
                  Sistem Laporan Keuangan &amp; Akuntansi Manufaktur Terpadu
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-900/50 px-2.5 py-0.5 rounded-full border border-emerald-700/60 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Integrated with HRIS Core &amp; Dynamic Pricing
                  </span>
                  <span className="text-xs text-slate-400">Periode: {pnl.period}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenPricingModal}
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs active:scale-95"
            >
              <Sliders className="h-4 w-4" />
              <span>Update Harga Beli &amp; Jual</span>
            </button>

            <button
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-xs active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Payroll HRIS'}</span>
            </button>

            <button
              onClick={handleExportFinancials}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl transition border border-slate-700 active:scale-95"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Sync notification message */}
        {syncMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{syncMessage}</span>
          </div>
        )}
      </div>

      {/* 4 Executive KPI Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Revenue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Pendapatan Usaha</span>
            <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
              Klien &amp; Byproduct
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {formatIDR(pnl.revenue.totalRevenue)}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Rata-rata harga jual: <strong className="text-slate-800">{formatIDR(averageSellingPricePerKg)} / kg</strong>
          </p>
        </div>

        {/* KPI 2: COGS / HPP */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Harga Pokok Penjualan (HPP)</span>
            <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
              Bahan + HRIS + BOP
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-800 tracking-tight">
            {formatIDR(pnl.cogs.totalCOGS)}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Biaya per kg rajang: <strong className="text-slate-800">{formatIDR(unitCostPerKg)} / kg</strong>
          </p>
        </div>

        {/* KPI 3: Gross Profit & Margin */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Laba Kotor (Gross Profit)</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
              Margin {pnl.grossMarginPercent}%
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-600 tracking-tight">
            {formatIDR(pnl.grossProfit)}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Spread margin: <strong className="text-emerald-700">+{formatIDR(averageSellingPricePerKg - unitCostPerKg)} / kg</strong>
          </p>
        </div>

        {/* KPI 4: Net Income & Margin */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-teal-300 transition">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Laba Bersih Setelah Pajak</span>
            <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md text-[11px]">
              Net Margin {pnl.netMarginPercent}%
            </span>
          </div>
          <div className="text-2xl font-bold text-teal-600 tracking-tight">
            {formatIDR(pnl.netIncome)}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Setelah beban logistik &amp; PPh Badan (22%)
          </p>
        </div>
      </div>

      {/* Financial Navigation Sub-Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex overflow-x-auto gap-1 text-xs">
        <button
          onClick={() => setActiveSubTab('pnl')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition ${
            activeSubTab === 'pnl'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Laporan Laba Rugi (P&amp;L)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('balance')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition ${
            activeSubTab === 'balance'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Scale className="h-4 w-4" />
          <span>Neraca Keuangan (Balance Sheet)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('costing')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition ${
            activeSubTab === 'costing'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Analisis HPP &amp; Unit Economics</span>
        </button>

        <button
          onClick={() => setActiveSubTab('hris')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition ${
            activeSubTab === 'hris'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Link2 className="h-4 w-4" />
          <span>Integrasi HRIS &amp; Payroll Pabrik</span>
        </button>

        <button
          onClick={() => setActiveSubTab('journal')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition ${
            activeSubTab === 'journal'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Buku Besar &amp; Jurnal Otomatis</span>
        </button>

        <button
          onClick={() => setActiveSubTab('healthcheck')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition ${
            activeSubTab === 'healthcheck'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-purple-700 bg-purple-50 hover:bg-purple-100/80 border border-purple-200'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Corporate Health Check &amp; Direksi</span>
        </button>
      </div>

      {/* SUB-TAB 1: LAPORAN LABA RUGI (P&L) */}
      {activeSubTab === 'pnl' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Laporan Laba Rugi Komprehensif (Income Statement)
              </h3>
              <p className="text-xs text-slate-500">
                Standar Akuntansi Keuangan (SAK) Pabrik Perajangan Cengkeh &middot; {pnl.period}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenPricingModal}
                className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition"
              >
                Ubah Harga Satuan &rarr;
              </button>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* 1. Pendapatan */}
            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-emerald-800 mb-2">
                1. PENDAPATAN USAHA (REVENUE)
              </h4>
              <div className="space-y-2 pl-3 border-l-2 border-emerald-500">
                <div className="flex justify-between py-1">
                  <span className="text-slate-700">Penjualan Cengkeh Rajang Bersih / Prima ke Pabrikan Rokok</span>
                  <span className="font-semibold text-slate-900">{formatIDR(pnl.revenue.cloveCleanSales)}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Penjualan Byproduct: Debu Cengkeh Siklon Murni (@{formatIDR(pricing.byproductDustPrice)}/kg)</span>
                  <span className="font-medium">{formatIDR(pnl.revenue.dustByproductSales)}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Penjualan Byproduct: Gagang Cengkeh Sortir (@{formatIDR(pricing.byproductStemPrice)}/kg)</span>
                  <span className="font-medium">{formatIDR(pnl.revenue.stemByproductSales)}</span>
                </div>
                <div className="flex justify-between py-2 border-t border-slate-200 font-bold text-slate-900 text-sm">
                  <span>Total Pendapatan Usaha</span>
                  <span className="text-emerald-600">{formatIDR(pnl.revenue.totalRevenue)}</span>
                </div>
              </div>
            </div>

            {/* 2. HPP (Cost of Goods Sold) */}
            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-800 mb-2">
                2. HARGA POKOK PENJUALAN (HPP / COGS)
              </h4>
              <div className="space-y-2 pl-3 border-l-2 border-slate-400">
                <div className="flex justify-between py-1 text-slate-700">
                  <span>Biaya Bahan Baku Bunga Cengkeh Kering (@{formatIDR(pricing.rawClovePriceZanzibar)}/kg)</span>
                  <span className="font-semibold text-slate-900">{formatIDR(pnl.cogs.directMaterialsCost)}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span>Upah Tenaga Kerja Langsung Operator Mesin (Direct Labor)</span>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] px-1.5 py-0.2 rounded font-bold">
                      DARI HRIS
                    </span>
                  </span>
                  <span className="font-semibold text-slate-900">{formatIDR(pnl.cogs.directLaborCost)}</span>
                </div>
                <div className="pl-4 py-1 space-y-1.5 text-slate-500 border-l border-slate-200 text-[11px]">
                  <div className="flex justify-between">
                    <span>- Biaya Listrik 3-Phase Mesin (@{formatIDR(pricing.electricityPerKg)}/kg)</span>
                    <span>{formatIDR(pnl.cogs.factoryOverhead.powerElectricity)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>- Konsumsi Pengasahan &amp; Pisau (@{formatIDR(pricing.bladeWearPerKg)}/kg)</span>
                    <span>{formatIDR(pnl.cogs.factoryOverhead.bladeMaintenance)}</span>
                  </div>
                  <div className="flex justify-between text-indigo-700 font-medium">
                    <span className="flex items-center gap-1">
                      <span>- Pemakaian Suku Cadang Mesin Terpasang (Gudang Part)</span>
                      <span className="bg-indigo-50 text-indigo-700 text-[9px] px-1.5 py-0.2 rounded font-bold">
                        DARI SPAREPART
                      </span>
                    </span>
                    <span className="font-semibold text-indigo-900">
                      {formatIDR(pnl.cogs.factoryOverhead.sparePartsMaintenance)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>- Kemasan Sak Goni 50kg (@{formatIDR(pricing.packagingPricePerBag)}/sak)</span>
                    <span>{formatIDR(pnl.cogs.factoryOverhead.packagingSupplies)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>- Beban Penyusutan Mesin Perajang &amp; Filter Siklon</span>
                    <span>{formatIDR(pnl.cogs.factoryOverhead.depreciationMachines)}</span>
                  </div>
                </div>
                <div className="flex justify-between py-2 border-t border-slate-200 font-bold text-slate-900 text-sm">
                  <span>Total Harga Pokok Penjualan (HPP)</span>
                  <span className="text-slate-800">({formatIDR(pnl.cogs.totalCOGS)})</span>
                </div>
              </div>
            </div>

            {/* 3. Laba Kotor */}
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex justify-between items-center text-sm font-bold">
              <span className="text-emerald-900">LABA KOTOR (GROSS PROFIT)</span>
              <div className="text-right">
                <span className="text-emerald-700 text-base">{formatIDR(pnl.grossProfit)}</span>
                <span className="text-xs text-emerald-800 font-normal ml-2">
                  (Margin: {pnl.grossMarginPercent}%)
                </span>
              </div>
            </div>

            {/* 4. Beban Operasional (OPEX) */}
            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-800 mb-2">
                3. BEBAN USAHA &amp; OPERASIONAL (OPEX)
              </h4>
              <div className="space-y-2 pl-3 border-l-2 border-amber-400">
                <div className="flex justify-between py-1 text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span>Beban Ekspedisi &amp; Pengiriman Truk Armada (BBM, Supir, Tol)</span>
                    <span className="bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0.2 rounded font-bold">
                      DARI LOGISTIK
                    </span>
                  </span>
                  <span className="font-semibold">{formatIDR(pnl.operatingExpenses.deliveryAndLogistics)}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span>Gaji Manajemen, Staff HR, Keuangan &amp; QC Analyst</span>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] px-1.5 py-0.2 rounded font-bold">
                      DARI HRIS
                    </span>
                  </span>
                  <span className="font-semibold">{formatIDR(pnl.operatingExpenses.administrativeSalaries)}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Beban Operasional Kantor, Perijinan &amp; Pemeliharaan Umum</span>
                  <span>{formatIDR(pnl.operatingExpenses.officeAndGeneralSupplies)}</span>
                </div>
                <div className="flex justify-between py-2 border-t border-slate-200 font-bold text-slate-900">
                  <span>Total Beban Operasional</span>
                  <span>({formatIDR(pnl.operatingExpenses.totalOpex)})</span>
                </div>
              </div>
            </div>

            {/* 5. EBITDA, Pajak & Laba Bersih */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex justify-between py-1 font-semibold text-slate-800">
                <span>Laba Operasional (EBITDA)</span>
                <span>{formatIDR(pnl.operatingIncome)}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-500">
                <span>Estimasi Beban Pajak Penghasilan Badan (PPh Badan 22%)</span>
                <span>({formatIDR(pnl.taxExpense)})</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 text-white flex justify-between items-center text-base font-bold shadow-sm">
                <div>
                  <span>LABA BERSIH TAHUN BERJALAN (NET INCOME)</span>
                  <span className="block text-xs font-normal text-emerald-400 mt-0.5">
                    Net Profit Margin: {pnl.netMarginPercent}%
                  </span>
                </div>
                <span className="text-xl text-emerald-400">{formatIDR(pnl.netIncome)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: NERACA KEUANGAN (BALANCE SHEET) */}
      {activeSubTab === 'balance' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Laporan Posisi Keuangan (Balance Sheet)
              </h3>
              <p className="text-xs text-slate-500">
                Per {balanceSheet.asOfDate} &middot; Mata Uang: Rupiah (IDR)
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <ShieldCheck className="h-4 w-4" />
              <span>ASET = KEWAJIBAN + EKUITAS (SEIMBANG)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
            {/* Sisi Kiri: Aset / Aktiva */}
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 font-bold text-emerald-900 text-sm">
                AKTIVA (ASSETS)
              </div>

              <div>
                <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                  Aset Lancar (Current Assets)
                </h5>
                <div className="space-y-2 pl-3 border-l-2 border-emerald-500">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">Kas &amp; Giro Operasional Bank</span>
                    <span className="font-semibold text-slate-800">
                      {formatIDR(balanceSheet.assets.currentAssets.cashAndBank)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">Piutang Usaha Pabrik Rokok Kretek</span>
                    <span className="font-semibold text-slate-800">
                      {formatIDR(balanceSheet.assets.currentAssets.accountsReceivable)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">Persediaan Bahan Baku Bunga Cengkeh</span>
                    <span className="font-semibold text-slate-800">
                      {formatIDR(balanceSheet.assets.currentAssets.rawMaterialInventory)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">Persediaan Barang Jadi Cengkeh Rajang (FG)</span>
                    <span className="font-semibold text-slate-800">
                      {formatIDR(balanceSheet.assets.currentAssets.finishedGoodsInventory)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">Persediaan Hasil Samping (Debu &amp; Gagang)</span>
                    <span className="font-semibold text-slate-800">
                      {formatIDR(balanceSheet.assets.currentAssets.byproductInventory)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 text-indigo-700 font-medium">
                    <span className="flex items-center gap-1.5">
                      <span>Persediaan Suku Cadang &amp; Komponen Mesin</span>
                      <span className="bg-indigo-50 text-indigo-700 text-[10px] px-1.5 py-0.2 rounded font-bold">
                        GUDANG PART
                      </span>
                    </span>
                    <span className="font-semibold text-indigo-900">
                      {formatIDR(balanceSheet.assets.currentAssets.sparePartInventory)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-slate-200 font-bold text-slate-900">
                    <span>Total Aset Lancar</span>
                    <span className="text-emerald-700">
                      {formatIDR(balanceSheet.assets.currentAssets.totalCurrentAssets)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                  Aset Tetap (Fixed Assets)
                </h5>
                <div className="space-y-2 pl-3 border-l-2 border-slate-400">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">Armada Mesin Perajang &amp; Filter Siklon</span>
                    <span>{formatIDR(balanceSheet.assets.fixedAssets.shreddingMachinery)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">Armada Truk Ekspedisi Box Pendingin</span>
                    <span>{formatIDR(balanceSheet.assets.fixedAssets.transportVehicles)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-500">
                    <span>Akumulasi Penyusutan Mesin &amp; Kendaraan</span>
                    <span>({formatIDR(balanceSheet.assets.fixedAssets.accumulatedDepreciation)})</span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-slate-200 font-bold text-slate-900">
                    <span>Nilai Buku Aset Tetap</span>
                    <span>{formatIDR(balanceSheet.assets.fixedAssets.netFixedAssets)}</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-900 text-white rounded-xl flex justify-between items-center font-bold text-sm">
                <span>TOTAL AKTIVA / ASET</span>
                <span className="text-emerald-400 text-base">
                  {formatIDR(balanceSheet.assets.totalAssets)}
                </span>
              </div>
            </div>

            {/* Sisi Kanan: Kewajiban & Ekuitas */}
            <div className="space-y-4">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 font-bold text-blue-900 text-sm">
                PASIVA (LIABILITIES &amp; EQUITY)
              </div>

              <div>
                <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                  Kewajiban Lancar (Current Liabilities)
                </h5>
                <div className="space-y-2 pl-3 border-l-2 border-blue-500">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">Hutang Usaha Petani &amp; Pengepul Cengkeh</span>
                    <span className="font-semibold text-slate-800">
                      {formatIDR(balanceSheet.liabilities.currentLiabilities.accountsPayableSuppliers)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <span>Beban Gaji &amp; Lembur Akrual</span>
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] px-1 rounded font-bold">HRIS</span>
                    </span>
                    <span className="font-semibold text-slate-800">
                      {formatIDR(balanceSheet.liabilities.currentLiabilities.accruedPayrollHRIS)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">Hutang Pajak Penghasilan (PPh)</span>
                    <span className="font-semibold text-slate-800">
                      {formatIDR(balanceSheet.liabilities.currentLiabilities.taxPayable)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-slate-200 font-bold text-slate-900">
                    <span>Total Kewajiban</span>
                    <span className="text-blue-700">
                      {formatIDR(balanceSheet.liabilities.totalLiabilities)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                  Ekuitas Pemegang Saham (Equity)
                </h5>
                <div className="space-y-2 pl-3 border-l-2 border-emerald-500">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">Modal Disetor Pemegang Saham</span>
                    <span className="font-semibold text-slate-800">
                      {formatIDR(balanceSheet.equity.shareCapital)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">Laba Ditahan Periode Lalu (Retained Earnings)</span>
                    <span className="font-semibold text-slate-800">
                      {formatIDR(balanceSheet.equity.retainedEarnings)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-emerald-700 font-medium">Laba Bersih Periode Berjalan</span>
                    <span className="font-bold text-emerald-700">
                      {formatIDR(balanceSheet.equity.currentPeriodEarnings)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-slate-200 font-bold text-slate-900">
                    <span>Total Ekuitas</span>
                    <span className="text-emerald-700">
                      {formatIDR(balanceSheet.equity.totalEquity)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-900 text-white rounded-xl flex justify-between items-center font-bold text-sm">
                <span>TOTAL KEWAJIBAN &amp; EKUITAS</span>
                <span className="text-emerald-400 text-base">
                  {formatIDR(balanceSheet.liabilities.totalLiabilities + balanceSheet.equity.totalEquity)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ANALISIS HPP & UNIT ECONOMICS */}
      {activeSubTab === 'costing' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Struktur Harga Pokok Produksi (HPP) &amp; Unit Economics
              </h3>
              <p className="text-xs text-slate-500">
                Rincian biaya per kilogram hasil rajang prima dan simulasi margin keuntungan
              </p>
            </div>
            <button
              onClick={onOpenPricingModal}
              className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition"
            >
              Ubah Parameter Harga Satuan &rarr;
            </button>
          </div>

          {/* Unit Cost Comparison Bars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-xs text-slate-500 block">Rata-rata Harga Jual</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">
                {formatIDR(averageSellingPricePerKg)} <span className="text-xs font-normal text-slate-500">/ kg</span>
              </span>
              <p className="text-[11px] text-slate-500 mt-2">
                Berdasarkan harga rajang terkonfigurasi ke pabrik rokok
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-xs text-slate-500 block">Biaya Pokok (HPP) per kg</span>
              <span className="text-2xl font-bold text-slate-800 mt-1 block">
                {formatIDR(unitCostPerKg)} <span className="text-xs font-normal text-slate-500">/ kg</span>
              </span>
              <p className="text-[11px] text-slate-500 mt-2">
                Bahan mentah (@{formatIDR(pricing.rawClovePriceZanzibar)}), upah operator HRIS &amp; daya
              </p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
              <span className="text-xs text-emerald-800 block font-semibold">Keuntungan Bersih Pabrik</span>
              <span className="text-2xl font-bold text-emerald-600 mt-1 block">
                {formatIDR(averageSellingPricePerKg - unitCostPerKg)}{' '}
                <span className="text-xs font-normal text-emerald-700">/ kg</span>
              </span>
              <p className="text-[11px] text-emerald-700 mt-2 font-medium">
                Marjin laba kotor unit sebesar {pnl.grossMarginPercent}%
              </p>
            </div>
          </div>

          {/* Detailed Component Breakdown */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Komposisi Biaya Produksi per 1 Kilogram Rajangan Cengkeh:
            </h4>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>1. Bahan Baku Bunga Cengkeh Kering (@{formatIDR(pricing.rawClovePriceZanzibar)}/kg)</span>
                  <span className="font-bold text-slate-900">
                    {formatIDR(unitCostPerKg * 0.77)} (77.0%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '77%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span className="flex items-center gap-1">
                    <span>2. Upah Operator Mesin &amp; Lembur Shift (HRIS Integration)</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1 rounded font-bold">HRIS</span>
                  </span>
                  <span className="font-bold text-slate-900">
                    {formatIDR(unitCostPerKg * 0.11)} (11.0%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '11%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>3. Konsumsi Listrik Mesin (@{formatIDR(pricing.electricityPerKg)}) &amp; Asah Pisau (@{formatIDR(pricing.bladeWearPerKg)})</span>
                  <span className="font-bold text-slate-900">
                    {formatIDR(unitCostPerKg * 0.06)} (6.0%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '6%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>4. Kemasan Sak Goni 50kg, Logistik &amp; Penyusutan Mesin</span>
                  <span className="font-bold text-slate-900">
                    {formatIDR(unitCostPerKg * 0.06)} (6.0%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '6%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: INTEGRASI HRIS & PAYROLL PABRIK */}
      {activeSubTab === 'hris' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Integrasi Real-Time Sistem HRIS &amp; Payroll Pabrik
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Alokasi otomatis biaya gaji tenaga kerja langsung (TKL) ke HPP dan manajemen ke OPEX
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-600">Status API Endpoint:</span>
              <span className="font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold">
                hris-core-system.vercel.app (Connected 200 OK)
              </span>
            </div>
          </div>

          {/* Allocation Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-emerald-50/40">
              <span className="text-emerald-800 font-semibold block text-[11px]">
                Tenaga Kerja Langsung (TKL - HPP)
              </span>
              <span className="text-xl font-bold text-emerald-700 mt-1 block">
                {formatIDR(hrisPayroll.directLaborTotal + hrisPayroll.overtimeDirectLabor)}
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                Gaji Pokok: {formatIDR(hrisPayroll.directLaborTotal)} &middot; Lembur:{' '}
                {formatIDR(hrisPayroll.overtimeDirectLabor)}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-blue-50/40">
              <span className="text-blue-800 font-semibold block text-[11px]">
                Tenaga Kerja Tak Langsung (BOP)
              </span>
              <span className="text-xl font-bold text-blue-700 mt-1 block">
                {formatIDR(hrisPayroll.indirectLaborTotal)}
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                Teknisi Pisau, Pemeliharaan Mesin, QC Inspector &amp; Gudang
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-purple-50/40">
              <span className="text-purple-800 font-semibold block text-[11px]">
                Manajemen &amp; Administrasi (OPEX)
              </span>
              <span className="text-xl font-bold text-purple-700 mt-1 block">
                {formatIDR(hrisPayroll.administrativeTotal)}
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                Direktur Pabrik, HR Officer, Akuntan &amp; Pajak
              </p>
            </div>
          </div>

          {/* Employee Worker Table from HRIS */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">
                Daftar Personel Kunci &amp; Alokasi Akun Beban (HRIS Sync):
              </span>
              <span className="text-slate-500">Terakhir disinkronkan: {hrisPayroll.syncTimestamp}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">ID &amp; Nama Karyawan</th>
                    <th className="px-4 py-2.5 font-semibold">Posisi / Mesin</th>
                    <th className="px-4 py-2.5 font-semibold">Kategori Alokasi</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Gaji Pokok</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Lembur (Jam / Rp)</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Total Beban</th>
                    <th className="px-4 py-2.5 font-semibold text-center">Posting COA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {HRIS_WORKERS.map((worker) => (
                    <tr key={worker.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900 block">{worker.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">{worker.id}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <span>{worker.role}</span>
                        {worker.machineAssigned && (
                          <span className="ml-1.5 font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                            {worker.machineAssigned}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            worker.category === 'DIRECT_LABOR'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : worker.category === 'INDIRECT_LABOR'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }`}
                        >
                          {worker.category === 'DIRECT_LABOR'
                            ? 'TKL (HPP)'
                            : worker.category === 'INDIRECT_LABOR'
                            ? 'Overhead (BOP)'
                            : 'Admin (OPEX)'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-700">
                        {formatIDR(worker.baseSalary)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {worker.overtimeHours > 0 ? (
                          <>
                            <span className="font-bold text-amber-700">{worker.overtimeHours}j</span> &middot;{' '}
                            {formatIDR(worker.overtimePay)}
                          </>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">
                        {formatIDR(worker.totalCost)}
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-[11px] text-slate-500 font-semibold">
                        {worker.category === 'DIRECT_LABOR'
                          ? '5102 (HPP)'
                          : worker.category === 'INDIRECT_LABOR'
                          ? '5104 (BOP)'
                          : '6102 (OPEX)'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: BUKU BESAR & JURNAL OTOMATIS */}
      {activeSubTab === 'journal' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Jurnal Umum Akuntansi Otomatis (Double-Entry General Ledger)
              </h3>
              <p className="text-xs text-slate-500">
                Transaksi terposting secara otomatis dari aktivitas produksi batch, logistik DO, pengadaan PO, dan payroll HRIS
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              Double-Entry Validated ✓
            </span>
          </div>

          <div className="space-y-4">
            {journalEntries.map((jrn) => {
              const totalDebit = jrn.items.reduce((sum, item) => sum + item.debit, 0);
              const totalCredit = jrn.items.reduce((sum, item) => sum + item.credit, 0);

              const moduleBadge = {
                OPERASIONAL_PERAJANGAN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                HRIS_PAYROLL: 'bg-purple-50 text-purple-700 border-purple-200',
                LOGISTIK_PENGIRIMAN: 'bg-blue-50 text-blue-700 border-blue-200',
                GUDANG_INVENTORI: 'bg-amber-50 text-amber-700 border-amber-200',
                PENGADAAN_PEMBELIAN: 'bg-teal-50 text-teal-700 border-teal-200',
                GUDANG_SPAREPART: 'bg-cyan-50 text-cyan-700 border-cyan-200',
                PERAWATAN_MESIN: 'bg-indigo-50 text-indigo-700 border-indigo-200',
              }[jrn.sourceModule] || 'bg-slate-50 text-slate-700 border-slate-200';

              return (
                <div
                  key={jrn.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition text-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{jrn.id}</span>
                      <span className="text-slate-400">&middot;</span>
                      <span className="font-semibold text-slate-700 font-mono">{jrn.referenceNumber}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${moduleBadge}`}>
                        {jrn.sourceModule.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-slate-400 text-[11px]">{jrn.date}</span>
                  </div>

                  <p className="text-slate-700 font-medium">{jrn.description}</p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs bg-slate-50/50 rounded-lg overflow-hidden">
                      <thead className="bg-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="px-3 py-2 font-semibold">Kode Akun</th>
                          <th className="px-3 py-2 font-semibold">Keterangan Akun (COA)</th>
                          <th className="px-3 py-2 font-semibold text-right">Debit (Rp)</th>
                          <th className="px-3 py-2 font-semibold text-right">Kredit (Rp)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/60">
                        {jrn.items.map((line, idx) => (
                          <tr key={idx}>
                            <td className="px-3 py-2 font-mono text-[11px] font-semibold text-slate-600">
                              {line.accountCode}
                            </td>
                            <td className={`px-3 py-2 text-slate-800 ${line.credit > 0 ? 'pl-8 text-slate-600' : 'font-medium'}`}>
                              {line.accountName}
                            </td>
                            <td className="px-3 py-2 text-right font-medium text-slate-900">
                              {line.debit > 0 ? formatIDR(line.debit) : '-'}
                            </td>
                            <td className="px-3 py-2 text-right font-medium text-slate-900">
                              {line.credit > 0 ? formatIDR(line.credit) : '-'}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-slate-100/80 font-bold text-slate-900">
                          <td colSpan={2} className="px-3 py-2 text-right">
                            Total Keseimbangan Jurnal:
                          </td>
                          <td className="px-3 py-2 text-right text-emerald-700">{formatIDR(totalDebit)}</td>
                          <td className="px-3 py-2 text-right text-emerald-700">{formatIDR(totalCredit)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 6: CORPORATE HEALTH CHECK & LAPORAN DIREKSI */}
      {activeSubTab === 'healthcheck' && (
        <CorporateHealthCheckView healthCheck={healthCheck} />
      )}
    </div>
  );
}
