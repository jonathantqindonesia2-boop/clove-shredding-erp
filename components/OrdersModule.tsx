'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
  Plus,
  Search,
  Sliders,
  User,
} from 'lucide-react';
import { Machine, Order } from '../lib/types';
import { evaluateOrderDelay } from '../lib/calculations';

interface OrdersModuleProps {
  orders: Order[];
  machines: Machine[];
  onOpenAddOrder: () => void;
  onOpenAddBatchForOrder: (order: Order) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: any) => void;
}

export default function OrdersModule({
  orders,
  machines,
  onOpenAddOrder,
  onOpenAddBatchForOrder,
  onUpdateOrderStatus,
}: OrdersModuleProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.cutSize.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'Semua' ? true : order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Klien, Nomor Order (PO), atau Ukuran Rajang..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {['Semua', 'Sedang Diproses', 'Antrian', 'Selesai'].map((status) => (
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
            ))}
          </div>
        </div>

        <button
          onClick={onOpenAddOrder}
          className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Terima Order Baru</span>
        </button>
      </div>

      {/* Orders Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOrders.map((order) => {
          const machine = machines.find((m) => m.id === order.machineId);
          const delayEval = evaluateOrderDelay(order, machine);
          const percentProgress =
            order.quantityKg > 0 ? (order.processedKg / order.quantityKg) * 100 : 0;

          const priorityBadge = {
            'Ekspor Prioritas': 'bg-purple-50 text-purple-700 border-purple-200',
            'Tinggi (Rush)': 'bg-rose-50 text-rose-700 border-rose-200',
            Standar: 'bg-slate-50 text-slate-600 border-slate-200',
          }[order.priority];

          return (
            <div
              key={order.id}
              className={`bg-white border rounded-2xl p-5 shadow-xs transition hover:shadow-md flex flex-col justify-between ${
                delayEval.isDelayed ? 'border-amber-400/80 bg-amber-50/20' : 'border-slate-200'
              }`}
            >
              <div>
                {/* Header: Order No, Client & Priority */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        {order.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityBadge}`}
                      >
                        {order.priority}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {order.clientName}
                    </h3>
                  </div>

                  <span className="bg-emerald-100 text-emerald-800 font-mono text-xs font-bold px-2.5 py-1 rounded-lg">
                    {order.cutSize}
                  </span>
                </div>

                {/* Progress Bar & Volume */}
                <div className="mt-4 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-slate-500">Realisasi Rajangan:</span>
                    <span className="font-bold text-slate-800">
                      {order.processedKg.toLocaleString('id-ID')} /{' '}
                      {order.quantityKg.toLocaleString('id-ID')} kg ({percentProgress.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        percentProgress >= 100
                          ? 'bg-emerald-500'
                          : delayEval.isDelayed
                          ? 'bg-amber-500'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, percentProgress)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>Sisa: {delayEval.remainingKg.toLocaleString('id-ID')} kg</span>
                    <span>Butuh: ~{delayEval.hoursNeeded} Jam Kerja</span>
                  </div>
                </div>

                {/* Machine Assignment & Live Delay Projection */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Sliders className="h-3.5 w-3.5 text-slate-400" />
                      Mesin Alokasi:
                    </span>
                    <span className="font-semibold text-slate-800">
                      {machine ? `${machine.name} (${machine.capacityKgPerHour} kg/j)` : 'Belum ditentukan'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      Target Deadline:
                    </span>
                    <span className="font-semibold text-slate-800">
                      {new Date(order.deadline).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Delay evaluation callout */}
                  <div
                    className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                      delayEval.isDelayed
                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    }`}
                  >
                    {delayEval.isDelayed ? (
                      <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                    )}
                    <div className="text-[11px]">
                      <p className="font-bold">
                        {delayEval.varianceDisplay} (Estimasi Selesai: {delayEval.projectedCompletion})
                      </p>
                      <p className="opacity-90 mt-0.5">{delayEval.recommendation}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onOpenAddBatchForOrder(order)}
                  className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Catat Batch QC</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {order.status !== 'Selesai' ? (
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, 'Selesai')}
                      className="text-xs font-semibold text-slate-600 hover:text-emerald-700 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-300 transition"
                    >
                      Tandai Selesai
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-600 px-2 py-1 bg-emerald-50 rounded-lg">
                      Selesai &radic;
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
