'use client';

import React from 'react';
import { Factory, Plus, RefreshCw, ShoppingCart, Sliders, Sparkles } from 'lucide-react';

interface NavbarProps {
  totalCapacity: number;
  activeOrdersCount: number;
  onOpenModal: (modalName: string) => void;
  onOpenPricingModal: () => void;
  onResetData: () => void;
}

export default function Navbar({
  totalCapacity,
  activeOrdersCount,
  onOpenModal,
  onOpenPricingModal,
  onResetData,
}: NavbarProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand & Plant Identity */}
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Factory className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900">
                Clove<span className="text-emerald-600">ERP</span>
              </h1>
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Plant Ops Active
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Sistem Terpadu: Order &rarr; Pembelian Bahan &rarr; Kapasitas &rarr; Mutu &rarr; HRIS &rarr; Keuangan
            </p>
          </div>
        </div>

        {/* Live Metrics & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Quick Metrics */}
          <div className="hidden xl:flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Throughput</span>
              <span className="font-bold text-emerald-600 text-xs">{totalCapacity} kg/j</span>
            </div>
            <div className="h-5 w-px bg-slate-200"></div>
            <div>
              <span className="text-slate-400 block text-[10px]">Order Aktif</span>
              <span className="font-bold text-slate-800 text-xs">{activeOrdersCount} Antrian</span>
            </div>
          </div>

          {/* Pricing Button */}
          <button
            onClick={onOpenPricingModal}
            className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold px-3 py-2 rounded-xl transition shadow-xs active:scale-95"
            title="Update Harga Beli & Jual"
          >
            <Sliders className="h-3.5 w-3.5 text-amber-600" />
            <span>Harga (Rp)</span>
          </button>

          {/* PO Pembelian Button */}
          <button
            onClick={() => onOpenModal('add-po')}
            className="inline-flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 text-xs font-semibold px-3 py-2 rounded-xl transition shadow-xs active:scale-95"
          >
            <ShoppingCart className="h-3.5 w-3.5 text-teal-600" />
            <span>+ Beli Bahan</span>
          </button>

          {/* Terima Order Button */}
          <button
            onClick={() => onOpenModal('add-order')}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow-xs active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Terima Order</span>
          </button>

          {/* Input QC Batch */}
          <button
            onClick={() => onOpenModal('add-batch')}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow-xs active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
            <span>Input QC</span>
          </button>

          <button
            onClick={onResetData}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            title="Muat Ulang Data Simulasi"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
