'use client';

import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  Download,
  Filter,
  Plus,
  Search,
  Warehouse,
} from 'lucide-react';
import { InventoryCategory, InventoryItem, StockMutation } from '../lib/types';

interface InventoryModuleProps {
  inventory: InventoryItem[];
  mutations: StockMutation[];
  onOpenAddMutation: () => void;
}

export default function InventoryModule({
  inventory,
  mutations,
  onOpenAddMutation,
}: InventoryModuleProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Semua');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');

  const filteredItems = inventory.filter((item) => {
    const matchesCategory =
      categoryFilter === 'Semua' ? true : item.category === categoryFilter;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredMutations = mutations.filter((m) => {
    const matchesType = typeFilter === 'ALL' ? true : m.type === typeFilter;
    const matchesSearch =
      m.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.refDocument.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.partner.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getCategoryLabel = (cat: InventoryCategory) => {
    switch (cat) {
      case 'RAW_MATERIAL':
        return { label: 'Bahan Baku', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'FINISHED_GOODS':
        return { label: 'Barang Jadi (Rajang)', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'BYPRODUCT_DUST':
        return { label: 'Debu Siklon (Byproduct)', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'STEMS':
        return { label: 'Gagang Cengkeh', color: 'bg-orange-50 text-orange-700 border-orange-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="h-5 w-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Monitoring Stock In / Out &amp; Inventori Terpadu
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pelacakan real-time bahan baku masuk, barang rajang siap kirim, dan hasil sampingan (debu siklon &amp; gagang).
          </p>
        </div>

        <button
          onClick={onOpenAddMutation}
          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-xs whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Catat Mutasi Stok (In / Out)</span>
        </button>
      </div>

      {/* Stock Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const catInfo = getCategoryLabel(item.category);
          const isLowStock = item.currentStockKg < item.minBufferKg;

          return (
            <div
              key={item.id}
              className={`bg-white border rounded-2xl p-5 shadow-xs transition hover:shadow-md flex flex-col justify-between ${
                isLowStock ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${catInfo.color}`}
                  >
                    {catInfo.label}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400 font-semibold">
                    {item.sku}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-2">{item.name}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Lokasi: {item.storageBin}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500">Stok Tersedia:</span>
                  <div className="text-right">
                    <span className="text-xl font-bold text-slate-900">
                      {item.currentStockKg.toLocaleString('id-ID')}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">kg</span>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Buffer Min: {item.minBufferKg.toLocaleString('id-ID')} kg</span>
                  <span
                    className={`font-semibold ${
                      isLowStock ? 'text-amber-600' : 'text-emerald-600'
                    }`}
                  >
                    {isLowStock ? 'Perlu Restock!' : 'Aman'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mutation History Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Buku Mutasi Barang (Stock In / Stock Out Ledger)
            </h3>
            <p className="text-xs text-slate-500">
              Log keluar masuk stok dengan nomor dokumen referensi
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            {(['ALL', 'IN', 'OUT'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  typeFilter === type
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type === 'ALL' ? 'Semua' : type === 'IN' ? 'Stok Masuk (IN)' : 'Stok Keluar (OUT)'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 font-semibold">Waktu &amp; ID</th>
                <th className="px-4 py-3 font-semibold">Tipe</th>
                <th className="px-4 py-3 font-semibold">Nama Komoditas</th>
                <th className="px-4 py-3 font-semibold text-right">Jumlah (kg)</th>
                <th className="px-4 py-3 font-semibold">Dokumen Referensi</th>
                <th className="px-4 py-3 font-semibold">Mitra / Asal / Tujuan</th>
                <th className="px-4 py-3 font-semibold">Petugas Logistik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMutations.map((mut) => (
                <tr key={mut.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3.5">
                    <span className="font-mono font-bold text-slate-800 block">{mut.id}</span>
                    <span className="text-[11px] text-slate-500">{mut.date}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    {mut.type === 'IN' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <ArrowDownLeft className="h-3 w-3" />
                        MASUK (IN)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        <ArrowUpRight className="h-3 w-3" />
                        KELUAR (OUT)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-800">{mut.itemName}</td>
                  <td className="px-4 py-3.5 text-right font-bold">
                    <span
                      className={mut.type === 'IN' ? 'text-emerald-600' : 'text-slate-800'}
                    >
                      {mut.type === 'IN' ? '+' : '-'}
                      {mut.quantityKg.toLocaleString('id-ID')} kg
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[11px] text-slate-600 font-semibold">
                    {mut.refDocument}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{mut.partner}</td>
                  <td className="px-4 py-3.5 text-slate-500 text-[11px]">{mut.operator}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
