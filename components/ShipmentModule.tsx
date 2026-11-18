'use client';

import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  MapPin,
  Plus,
  Search,
  Truck,
  User,
} from 'lucide-react';
import { Shipment, ShipmentStatus } from '../lib/types';

interface ShipmentModuleProps {
  shipments: Shipment[];
  onOpenAddShipment: () => void;
  onUpdateShipmentStatus: (shipmentId: string, newStatus: ShipmentStatus) => void;
}

export default function ShipmentModule({
  shipments,
  onOpenAddShipment,
  onUpdateShipmentStatus,
}: ShipmentModuleProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');

  const filteredShipments = shipments.filter((s) => {
    const matchesStatus =
      statusFilter === 'Semua' ? true : s.status === statusFilter;
    const matchesSearch =
      s.doNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.destinationCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.driverName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: ShipmentStatus) => {
    switch (status) {
      case 'Persiapan Muat':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Dalam Perjalanan':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Tiba di Lokasi':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Selesai & Diterima':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Monitoring Pengiriman &amp; Surat Jalan (Delivery Tracking)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pelacakan distribusi hasil rajang cengkeh ke pabrik rokok rekanan dengan nomor Surat Jalan (DO), armada, dan pengemudi.
          </p>
        </div>

        <button
          onClick={onOpenAddShipment}
          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-xs whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Buat Pengiriman Baru</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari No Surat Jalan (DO), Pabrik Klien, Kota, atau Pengemudi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {['Semua', 'Dalam Perjalanan', 'Persiapan Muat', 'Selesai & Diterima'].map(
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

      {/* Shipment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredShipments.map((s) => (
          <div
            key={s.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-emerald-300 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-400">
                    {s.doNumber}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{s.clientName}</h3>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                    s.status
                  )}`}
                >
                  {s.status}
                </span>
              </div>

              <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Muatan:</span>
                  <span className="font-bold text-slate-800">
                    {s.quantityKg.toLocaleString('id-ID')} kg
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">{s.goodsDescription}</p>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Truck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>
                    Armada: <strong>{s.vehiclePlate}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>
                    Driver: <strong>{s.driverName}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>
                    Tujuan: <strong>{s.destinationCity}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>
                    Berangkat: {s.departureDate} &rarr; Est: {s.estimatedArrival}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Status Update Selector */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Update Status:</span>
              <select
                value={s.status}
                onChange={(e) =>
                  onUpdateShipmentStatus(s.id, e.target.value as ShipmentStatus)
                }
                className="text-xs font-medium px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
              >
                <option value="Persiapan Muat">Persiapan Muat</option>
                <option value="Dalam Perjalanan">Dalam Perjalanan</option>
                <option value="Tiba di Lokasi">Tiba di Lokasi</option>
                <option value="Selesai & Diterima">Selesai &amp; Diterima</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
