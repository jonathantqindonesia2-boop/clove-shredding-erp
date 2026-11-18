'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Gauge,
  Plus,
  RefreshCw,
  Sliders,
  Wrench,
  Zap,
} from 'lucide-react';
import { Machine, MachineStatus, Order } from '../lib/types';
import { evaluateOrderDelay } from '../lib/calculations';

interface MachinesCapacityModuleProps {
  machines: Machine[];
  orders: Order[];
  onUpdateMachineCapacity: (machineId: string, newCapacity: number) => void;
  onUpdateMachineStatus: (machineId: string, newStatus: MachineStatus) => void;
  onOpenAddMachine: () => void;
}

export default function MachinesCapacityModule({
  machines,
  orders,
  onUpdateMachineCapacity,
  onUpdateMachineStatus,
  onOpenAddMachine,
}: MachinesCapacityModuleProps) {
  const [selectedMachineId, setSelectedMachineId] = useState<string>(machines[0]?.id || '');

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Manajemen Armada Mesin &amp; Kalkulator Estimasi Keterlambatan
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ubah input kapasitas (kg/jam) secara dinamis untuk menguji simulasi waktu penyelesaian order dan mendeteksi potensi keterlambatan secara otomatis.
          </p>
        </div>

        <button
          onClick={onOpenAddMachine}
          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-xs whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Mesin Baru</span>
        </button>
      </div>

      {/* Machine Fleet Cards with Live Capacity Slider */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {machines.map((machine) => {
          const assignedOrders = orders.filter(
            (o) => o.machineId === machine.id && o.status !== 'Selesai'
          );
          const totalAssignedRemainingKg = assignedOrders.reduce(
            (sum, o) => sum + Math.max(0, o.quantityKg - o.processedKg),
            0
          );
          const effectiveThroughput =
            (machine.capacityKgPerHour * machine.efficiencyPercent) / 100;
          const totalHoursNeeded =
            effectiveThroughput > 0
              ? (totalAssignedRemainingKg / effectiveThroughput).toFixed(1)
              : '0';

          const hasDelayInAssigned = assignedOrders.some((order) => {
            const ev = evaluateOrderDelay(order, machine);
            return ev.isDelayed;
          });

          return (
            <div
              key={machine.id}
              className={`bg-white border rounded-2xl p-5 shadow-xs transition hover:shadow-md flex flex-col justify-between ${
                hasDelayInAssigned ? 'border-amber-400 bg-amber-50/10' : 'border-slate-200'
              }`}
            >
              <div>
                {/* Header: Machine ID, Name & Status Switcher */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-400">
                      {machine.id}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{machine.name}</h3>
                    <p className="text-xs text-slate-500">{machine.type}</p>
                  </div>

                  {/* Status Selector */}
                  <select
                    value={machine.status}
                    onChange={(e) =>
                      onUpdateMachineStatus(machine.id, e.target.value as MachineStatus)
                    }
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="Running">Running (Aktif)</option>
                    <option value="Idle">Idle (Siaga)</option>
                    <option value="Maintenance">Maintenance (Servis)</option>
                    <option value="Pisau Ditajamkan">Pisau Ditajamkan</option>
                  </select>
                </div>

                {/* Capacity Input & Dynamic Slider */}
                <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-amber-500" />
                      Kapasitas Operasional:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="50"
                        max="600"
                        step="10"
                        value={machine.capacityKgPerHour}
                        onChange={(e) =>
                          onUpdateMachineCapacity(machine.id, Number(e.target.value) || 50)
                        }
                        className="w-20 px-2 py-1 text-right text-xs font-bold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                      />
                      <span className="text-xs font-bold text-emerald-700">kg/jam</span>
                    </div>
                  </div>

                  {/* Range Slider for dynamic live tweaking */}
                  <div className="space-y-1">
                    <input
                      type="range"
                      min="50"
                      max="600"
                      step="10"
                      value={machine.capacityKgPerHour}
                      onChange={(e) =>
                        onUpdateMachineCapacity(machine.id, Number(e.target.value))
                      }
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>50 kg/j</span>
                      <span>300 kg/j</span>
                      <span>600 kg/j (Maks)</span>
                    </div>
                  </div>

                  {/* Metrics grid */}
                  <div className="pt-2 border-t border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">OEE Efisiensi</span>
                      <span className="font-bold text-slate-800">
                        {machine.efficiencyPercent}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Output Efektif</span>
                      <span className="font-bold text-emerald-600">
                        {Math.round(effectiveThroughput)} kg/j
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Tajam Pisau</span>
                      <span
                        className={`font-bold ${
                          machine.bladeSharpness > 70
                            ? 'text-emerald-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {machine.bladeSharpness}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Queue & Delay Evaluation on this machine */}
                <div className="mt-4">
                  <h4 className="text-xs font-bold text-slate-700 mb-2">
                    Antrian Order pada Mesin Ini ({assignedOrders.length} Order &middot;{' '}
                    {totalAssignedRemainingKg.toLocaleString('id-ID')} kg tersisa &middot; Est.{' '}
                    {totalHoursNeeded} Jam):
                  </h4>

                  {assignedOrders.length === 0 ? (
                    <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl text-center">
                      Tidak ada antrian order. Mesin siap menerima order baru.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {assignedOrders.map((order) => {
                        const delayEval = evaluateOrderDelay(order, machine);
                        return (
                          <div
                            key={order.id}
                            className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                              delayEval.isDelayed
                                ? 'bg-rose-50 border-rose-200 text-rose-900'
                                : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold">{order.clientName}</span>
                                <span className="text-slate-400 font-mono text-[11px]">
                                  ({order.orderNumber})
                                </span>
                                <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded text-[10px]">
                                  {order.cutSize}
                                </span>
                              </div>
                              <p className="text-[11px] opacity-80 mt-0.5">
                                Sisa: {delayEval.remainingKg.toLocaleString('id-ID')} kg &middot; Butuh: ~{delayEval.hoursNeeded} Jam
                              </p>
                            </div>

                            <div className="text-right">
                              <span
                                className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[11px] ${
                                  delayEval.isDelayed
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {delayEval.isDelayed ? (
                                  <AlertTriangle className="h-3 w-3 text-rose-600" />
                                ) : (
                                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                )}
                                {delayEval.varianceDisplay}
                              </span>
                              <span className="block text-[10px] opacity-75 mt-0.5">
                                Deadline: {new Date(order.deadline).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer info */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Operator: {machine.operatorOnDuty}</span>
                <span>ID: {machine.id}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
