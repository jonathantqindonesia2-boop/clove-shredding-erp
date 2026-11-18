'use client';

import React, { useState } from 'react';
import { CheckCircle2, DollarSign, RefreshCw, Sparkles, X, Zap } from 'lucide-react';
import { PricingConfig } from '../lib/financial-types';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pricing: PricingConfig;
  onSavePricing: (newPricing: PricingConfig) => void;
}

export default function PricingModal({
  isOpen,
  onClose,
  pricing,
  onSavePricing,
}: PricingModalProps) {
  const [formData, setFormData] = useState<PricingConfig>(pricing);

  if (!isOpen) return null;

  const handleChange = (field: keyof PricingConfig, value: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Math.max(0, value),
    }));
  };

  const handleResetDefaults = () => {
    setFormData({
      rawClovePriceZanzibar: 105000,
      rawClovePriceSikotok: 95000,
      packagingPricePerBag: 8500,
      electricityPerKg: 850,
      bladeWearPerKg: 620,
      sellingPrice04mm: 155000,
      sellingPrice06mm: 145000,
      sellingPrice08mm: 138000,
      sellingPrice10mm: 132000,
      sellingPrice12mm: 128000,
      byproductDustPrice: 24000,
      byproductStemPrice: 18000,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePricing(formData);
    onClose();
  };

  // Preview calculations
  const avgSellingPrice = (formData.sellingPrice04mm + formData.sellingPrice06mm + formData.sellingPrice08mm) / 3;
  const estimatedHPPPerKg = formData.rawClovePriceZanzibar * 1.12 + formData.electricityPerKg + formData.bladeWearPerKg + 12800; // plus labor
  const estimatedSpreadPerKg = avgSellingPrice - estimatedHPPPerKg;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <DollarSign className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-bold">
                  Konfigurasi Matriks Harga Beli &amp; Harga Jual Dinamis
                </h3>
                <p className="text-xs text-slate-400">
                  Perubahan harga akan otomatis mensinkronisasi seluruh Laporan Keuangan, HPP, dan Pengadaan
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
            {/* Live Spread Indicator Card */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Proyeksi Spread Margin Unit per Kilogram
                </span>
                <span className="text-xl font-bold text-emerald-700 block mt-0.5">
                  +Rp {Math.round(estimatedSpreadPerKg).toLocaleString('id-ID')} / kg
                </span>
              </div>
              <div className="text-right text-[11px] text-slate-600">
                <span>Rata-rata Harga Jual: <strong>Rp {Math.round(avgSellingPrice).toLocaleString('id-ID')}</strong></span>
                <span className="block text-slate-500">Estimasi HPP: Rp {Math.round(estimatedHPPPerKg).toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* SEKSI 1: HARGA BELI BAHAN BAKU & BIAYA PABRIK */}
            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-800 mb-3 pb-1 border-b border-slate-100 flex items-center justify-between">
                <span>1. HARGA BELI BAHAN BAKU &amp; OVERHEAD PABRIK (HPP)</span>
                <span className="text-slate-400 font-normal">Mata Uang: IDR</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Bunga Cengkeh Utuh Zanzibar (Rp/kg):
                  </label>
                  <input
                    type="number"
                    step="1000"
                    min="10000"
                    value={formData.rawClovePriceZanzibar}
                    onChange={(e) => handleChange('rawClovePriceZanzibar', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <span className="text-[10px] text-slate-400">Harga pokok beli dari koperasi petani</span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Bunga Cengkeh Sortir Sikotok (Rp/kg):
                  </label>
                  <input
                    type="number"
                    step="1000"
                    min="10000"
                    value={formData.rawClovePriceSikotok}
                    onChange={(e) => handleChange('rawClovePriceSikotok', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400">Grade lokal Maluku / Minahasa</span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Tarif Listrik Daya Mesin (Rp/kg rajangan):
                  </label>
                  <input
                    type="number"
                    step="50"
                    min="100"
                    value={formData.electricityPerKg}
                    onChange={(e) => handleChange('electricityPerKg', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  />
                  <span className="text-[10px] text-slate-400">Beban daya 3-phase rotary &amp; siklon</span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Biaya Asah &amp; Pemakaian Pisau (Rp/kg):
                  </label>
                  <input
                    type="number"
                    step="50"
                    min="100"
                    value={formData.bladeWearPerKg}
                    onChange={(e) => handleChange('bladeWearPerKg', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  />
                  <span className="text-[10px] text-slate-400">Jasa asah teknisi &amp; spare blade</span>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">
                    Biaya Kemasan Sak Goni &amp; Plastik Liner (Rp per sak 50kg):
                  </label>
                  <input
                    type="number"
                    step="500"
                    min="1000"
                    value={formData.packagingPricePerBag}
                    onChange={(e) => handleChange('packagingPricePerBag', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  />
                  <span className="text-[10px] text-slate-400">Karung goni standar ekspor berlapis PE kedap udara</span>
                </div>
              </div>
            </div>

            {/* SEKSI 2: HARGA JUAL CENGKEH RAJANG KE PABRIK ROKOK */}
            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-emerald-800 mb-3 pb-1 border-b border-slate-100 flex items-center justify-between">
                <span>2. HARGA JUAL CENGKEH RAJANG PRIMA PER UKURAN (REVENUE)</span>
                <span className="text-emerald-700 font-normal">Harga Invoice Pabrik</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Rajangan 0.4mm:</label>
                  <input
                    type="number"
                    step="1000"
                    value={formData.sellingPrice04mm}
                    onChange={(e) => handleChange('sellingPrice04mm', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-emerald-700"
                  />
                  <span className="text-[10px] text-slate-400">Mikro Halus Sigaret</span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Rajangan 0.6mm:</label>
                  <input
                    type="number"
                    step="1000"
                    value={formData.sellingPrice06mm}
                    onChange={(e) => handleChange('sellingPrice06mm', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-emerald-700"
                  />
                  <span className="text-[10px] text-slate-400">Super Prima Filter</span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Rajangan 0.8mm:</label>
                  <input
                    type="number"
                    step="1000"
                    value={formData.sellingPrice08mm}
                    onChange={(e) => handleChange('sellingPrice08mm', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-emerald-700"
                  />
                  <span className="text-[10px] text-slate-400">Standar Kretek</span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Rajangan 1.0mm:</label>
                  <input
                    type="number"
                    step="1000"
                    value={formData.sellingPrice10mm}
                    onChange={(e) => handleChange('sellingPrice10mm', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  />
                  <span className="text-[10px] text-slate-400">Regular Medium</span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Rajangan 1.2mm:</label>
                  <input
                    type="number"
                    step="1000"
                    value={formData.sellingPrice12mm}
                    onChange={(e) => handleChange('sellingPrice12mm', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  />
                  <span className="text-[10px] text-slate-400">Extra Kasar</span>
                </div>
              </div>
            </div>

            {/* SEKSI 3: HARGA JUAL BYPRODUCT */}
            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-amber-800 mb-3 pb-1 border-b border-slate-100 flex items-center justify-between">
                <span>3. HARGA JUAL PRODUK SAMPINGAN (BYPRODUCT MONETIZATION)</span>
                <span className="text-amber-700 font-normal">Non-Waste Revenue</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Debu Cengkeh Siklon Murni (Rp/kg):
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={formData.byproductDustPrice}
                    onChange={(e) => handleChange('byproductDustPrice', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-amber-700"
                  />
                  <span className="text-[10px] text-slate-400">Bahan baku industri dupa &amp; aromaterapi</span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Gagang Cengkeh Sortir (Rp/kg):
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={formData.byproductStemPrice}
                    onChange={(e) => handleChange('byproductStemPrice', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-orange-700"
                  />
                  <span className="text-[10px] text-slate-400">Bahan distilasi minyak eugenol</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset Standar Pasar</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition active:scale-95"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Terapkan &amp; Sinkronkan Keuangan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
