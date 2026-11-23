'use client';

import React, { useState } from 'react';
import { X, Sparkles, ShoppingCart, Wrench, ArrowDownLeft } from 'lucide-react';
import { CutSize, InventoryItem, Machine, Order, OrderPriority, QCStatus } from '../lib/types';
import { PurchaseOrder } from '../lib/financial-types';
import { MachineCodeDef, RequisitionUrgency, SparePart, SparePartRequisition } from '../lib/sparepart-types';
import { calculateYieldMetrics } from '../lib/calculations';

interface ModalsProps {
  activeModal: string | null;
  onClose: () => void;
  machines: Machine[];
  orders: Order[];
  inventory: InventoryItem[];
  onAddOrder: (order: Order) => void;
  onAddMachine: (machine: Machine) => void;
  onAddBatch: (batch: any) => void;
  onAddMutation: (mutation: any) => void;
  onAddShipment: (shipment: any) => void;
  onAddPO?: (po: PurchaseOrder) => void;
  selectedOrderForBatch?: Order | null;
  spareParts?: SparePart[];
  machineCodeDefs?: MachineCodeDef[];
  onAddSparepartReq?: (req: SparePartRequisition) => void;
  onAddSparepartStockIn?: (data: {
    partCode: string;
    quantity: number;
    newUnitCost: number;
    poNumber: string;
    supplierName: string;
    invoiceNumber: string;
    notes: string;
    performedBy: string;
  }) => void;
}

export default function Modals({
  activeModal,
  onClose,
  machines,
  orders,
  inventory,
  onAddOrder,
  onAddMachine,
  onAddBatch,
  onAddMutation,
  onAddShipment,
  onAddPO,
  selectedOrderForBatch,
  spareParts,
  machineCodeDefs,
  onAddSparepartReq,
  onAddSparepartStockIn,
}: ModalsProps) {
  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8">
        {/* Modal: Tambah Order Baru */}
        {activeModal === 'add-order' && (
          <AddOrderForm
            machines={machines}
            onClose={onClose}
            onSubmit={(order) => {
              onAddOrder(order);
              onClose();
            }}
          />
        )}

        {/* Modal: Tambah Mesin Baru */}
        {activeModal === 'add-machine' && (
          <AddMachineForm
            onClose={onClose}
            onSubmit={(machine) => {
              onAddMachine(machine);
              onClose();
            }}
          />
        )}

        {/* Modal: Input QC Batch */}
        {activeModal === 'add-batch' && (
          <AddBatchForm
            machines={machines}
            orders={orders}
            selectedOrder={selectedOrderForBatch}
            onClose={onClose}
            onSubmit={(batch) => {
              onAddBatch(batch);
              onClose();
            }}
          />
        )}

        {/* Modal: Catat Mutasi Stok */}
        {activeModal === 'add-mutation' && (
          <AddMutationForm
            inventory={inventory}
            onClose={onClose}
            onSubmit={(mutation) => {
              onAddMutation(mutation);
              onClose();
            }}
          />
        )}

        {/* Modal: Buat Pengiriman Baru */}
        {activeModal === 'add-shipment' && (
          <AddShipmentForm
            orders={orders}
            onClose={onClose}
            onSubmit={(shipment) => {
              onAddShipment(shipment);
              onClose();
            }}
          />
        )}

        {/* Modal: Buat PO Pembelian Bahan Baru */}
        {activeModal === 'add-po' && onAddPO && (
          <AddPOForm
            orders={orders}
            onClose={onClose}
            onSubmit={(po) => {
              onAddPO(po);
              onClose();
            }}
          />
        )}

        {/* Modal: Permintaan Sparepart Mesin */}
        {activeModal === 'add-sparepart-req' && onAddSparepartReq && (
          <AddSparepartReqForm
            machines={machineCodeDefs || []}
            spareParts={spareParts || []}
            onClose={onClose}
            onSubmit={(req) => {
              onAddSparepartReq(req);
              onClose();
            }}
          />
        )}

        {/* Modal: Penerimaan / Pembelian Sparepart (+ Stock In) */}
        {activeModal === 'add-sparepart-stockin' && onAddSparepartStockIn && (
          <AddSparepartStockInForm
            spareParts={spareParts || []}
            onClose={onClose}
            onSubmit={(data) => {
              onAddSparepartStockIn(data);
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
}

// 1. FORM TAMBAH ORDER
function AddOrderForm({
  machines,
  onClose,
  onSubmit,
}: {
  machines: Machine[];
  onClose: () => void;
  onSubmit: (order: Order) => void;
}) {
  const [clientName, setClientName] = useState('');
  const [orderNumber, setOrderNumber] = useState(`PO-${Date.now().toString().slice(-4)}`);
  const [cutSize, setCutSize] = useState<CutSize>('0.6mm');
  const [quantityKg, setQuantityKg] = useState<number>(5000);
  const [deadlineHours, setDeadlineHours] = useState<number>(24);
  const [machineId, setMachineId] = useState(machines[0]?.id || 'MS-01');
  const [priority, setPriority] = useState<OrderPriority>('Standar');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const deadline = new Date(Date.now() + deadlineHours * 3600 * 1000).toISOString();
    const newOrder: Order = {
      id: `ORD-${Date.now().toString().slice(-5)}`,
      orderNumber,
      clientName,
      cutSize,
      quantityKg,
      processedKg: 0,
      deadline,
      machineId,
      priority,
      status: 'Sedang Diproses',
      orderDate: new Date().toISOString().slice(0, 10),
      notes,
    };
    onSubmit(newOrder);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-900">Terima Order Baru (Rajang Cengkeh)</h3>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4 space-y-3.5 text-xs">
        <div>
          <label className="font-semibold text-slate-700 block mb-1">Nama Klien / Pabrikan:</label>
          <input
            required
            type="text"
            placeholder="Contoh: PT Gudang Garam Tbk, HM Sampoerna, dll"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">No. Purchase Order (PO):</label>
            <input
              required
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Ukuran Rajangan:</label>
            <select
              value={cutSize}
              onChange={(e) => setCutSize(e.target.value as CutSize)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            >
              <option value="0.4mm">0.4mm (Mikro Halus)</option>
              <option value="0.6mm">0.6mm (Super Prima)</option>
              <option value="0.8mm">0.8mm (Standar Kretek)</option>
              <option value="1.0mm">1.0mm (Regular Medium)</option>
              <option value="1.2mm">1.2mm (Extra Kasar)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Volume Kuantitas (kg):</label>
            <input
              required
              type="number"
              min="100"
              step="50"
              value={quantityKg}
              onChange={(e) => setQuantityKg(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Target Deadline:</label>
            <select
              value={deadlineHours}
              onChange={(e) => setDeadlineHours(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            >
              <option value={12}>12 Jam (Urgent)</option>
              <option value={24}>24 Jam (1 Hari)</option>
              <option value={48}>48 Jam (2 Hari)</option>
              <option value={72}>72 Jam (3 Hari)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Alokasi Mesin:</label>
            <select
              value={machineId}
              onChange={(e) => setMachineId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            >
              {machines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.capacityKgPerHour} kg/j)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Prioritas Order:</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as OrderPriority)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            >
              <option value="Standar">Standar</option>
              <option value="Tinggi (Rush)">Tinggi (Rush)</option>
              <option value="Ekspor Prioritas">Ekspor Prioritas</option>
            </select>
          </div>
        </div>

        <div>
          <label className="font-semibold text-slate-700 block mb-1">Catatan Spesifikasi Khusus:</label>
          <input
            type="text"
            placeholder="Contoh: Kadar air 12.0%, kemasan sak goni 50kg, dll"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
        >
          Batal
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
        >
          Simpan &amp; Masukkan Antrian
        </button>
      </div>
    </form>
  );
}

// 2. FORM TAMBAH MESIN BARU
function AddMachineForm({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (machine: Machine) => void;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState('Rotary High-Speed Multi-Blade');
  const [capacity, setCapacity] = useState<number>(300);
  const [efficiency, setEfficiency] = useState<number>(90);
  const [operator, setOperator] = useState('Operator Shift');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMachine: Machine = {
      id: `MS-0${Math.floor(Math.random() * 80) + 5}`,
      name,
      type,
      capacityKgPerHour: capacity,
      efficiencyPercent: efficiency,
      status: 'Running',
      assignedOrderIds: [],
      bladeSharpness: 98,
      operatorOnDuty: operator,
    };
    onSubmit(newMachine);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-900">Tambah Mesin Perajang Baru</h3>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4 space-y-3.5 text-xs">
        <div>
          <label className="font-semibold text-slate-700 block mb-1">Nama Mesin:</label>
          <input
            required
            type="text"
            placeholder="Contoh: Rotary Cutter Epsilon / Guillotine 400"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700 block mb-1">Tipe / Model Mesin:</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300"
          >
            <option value="Rotary Multi-Blade Slicer">Rotary Multi-Blade Slicer</option>
            <option value="Hydraulic Shear Shredder">Hydraulic Shear Shredder</option>
            <option value="Fine Tobacco & Clove Cutter">Fine Precision Cutter</option>
            <option value="Continuous Drum Cutter">Continuous Drum Cutter</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Kapasitas Input (kg/jam):</label>
            <input
              required
              type="number"
              min="50"
              max="1000"
              step="25"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Target Efisiensi OEE (%):</label>
            <input
              required
              type="number"
              min="50"
              max="99"
              value={efficiency}
              onChange={(e) => setEfficiency(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            />
          </div>
        </div>

        <div>
          <label className="font-semibold text-slate-700 block mb-1">Operator Penanggung Jawab:</label>
          <input
            type="text"
            placeholder="Nama teknisi / operator"
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
        >
          Batal
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
        >
          Tambahkan ke Armada
        </button>
      </div>
    </form>
  );
}

// 3. FORM INPUT BATCH HASIL (QC MUTU)
function AddBatchForm({
  machines,
  orders,
  selectedOrder,
  onClose,
  onSubmit,
}: {
  machines: Machine[];
  orders: Order[];
  selectedOrder?: Order | null;
  onClose: () => void;
  onSubmit: (batch: any) => void;
}) {
  const [orderId, setOrderId] = useState(selectedOrder?.id || orders[0]?.id || '');
  const [machineId, setMachineId] = useState(selectedOrder?.machineId || machines[0]?.id || 'MS-01');
  const [operator, setOperator] = useState('Budi Santoso');
  const [shift, setShift] = useState<1 | 2 | 3>(1);
  const [rawInputKg, setRawInputKg] = useState<number>(1000);
  const [cleanCutKg, setCleanCutKg] = useState<number>(890);
  const [dustKg, setDustKg] = useState<number>(55);
  const [stemKg, setStemKg] = useState<number>(40);
  const [moisturePercent, setMoisturePercent] = useState<number>(12.2);
  const [notes, setNotes] = useState('Hasil homogen, lolos saringan 20 mesh.');

  const metrics = calculateYieldMetrics(rawInputKg, cleanCutKg, dustKg, stemKg, moisturePercent);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBatch = {
      id: `BAT-${Date.now().toString().slice(-6)}`,
      orderId,
      machineId,
      operator,
      date: new Date().toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      shift,
      rawInputKg,
      cleanCutKg,
      dustKg,
      stemKg,
      moisturePercent,
      ...metrics,
      notes,
    };
    onSubmit(newBatch);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">Input Hasil Pengerjaan Batch &amp; QC</h3>
          <p className="text-xs text-slate-500">Parameter rendemen bersih, debu siklon &amp; kadar air</p>
        </div>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4 space-y-3.5 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Pilih Order:</label>
            <select
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} - {o.clientName} ({o.cutSize})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Mesin Pemroses:</label>
            <select
              value={machineId}
              onChange={(e) => setMachineId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            >
              {machines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Operator QC / Mesin:</label>
            <input
              type="text"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Shift Kerja:</label>
            <select
              value={shift}
              onChange={(e) => setShift(Number(e.target.value) as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            >
              <option value={1}>Shift 1 (Pagi 07:00 - 15:00)</option>
              <option value={2}>Shift 2 (Sore 15:00 - 23:00)</option>
              <option value={3}>Shift 3 (Malam 23:00 - 07:00)</option>
            </select>
          </div>
        </div>

        {/* Input Parameters */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="font-bold text-slate-800">Timbangan Parameter Hasil:</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 block mb-1">Bahan Baku Masuk (kg):</label>
              <input
                type="number"
                min="10"
                value={rawInputKg}
                onChange={(e) => setRawInputKg(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold"
              />
            </div>
            <div>
              <label className="text-slate-600 block mb-1">Hasil Rajang Prima (kg):</label>
              <input
                type="number"
                min="0"
                value={cleanCutKg}
                onChange={(e) => setCleanCutKg(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-slate-600 block mb-1">Debu Siklon (kg):</label>
              <input
                type="number"
                min="0"
                value={dustKg}
                onChange={(e) => setDustKg(Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-300 font-bold text-amber-600"
              />
            </div>
            <div>
              <label className="text-slate-600 block mb-1">Gagang Sisa (kg):</label>
              <input
                type="number"
                min="0"
                value={stemKg}
                onChange={(e) => setStemKg(Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-300 font-medium"
              />
            </div>
            <div>
              <label className="text-slate-600 block mb-1">Kadar Air (%):</label>
              <input
                type="number"
                step="0.1"
                min="5"
                max="25"
                value={moisturePercent}
                onChange={(e) => setMoisturePercent(Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-300 font-bold"
              />
            </div>
          </div>

          {/* Live Calculation Output Card */}
          <div className="pt-2 border-t border-slate-200 grid grid-cols-4 gap-2 text-center">
            <div>
              <span className="text-[10px] text-slate-400 block">Rendemen Prima</span>
              <span className="font-bold text-emerald-600 text-sm">{metrics.rendemenPercent}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Debu Siklon</span>
              <span className="font-bold text-amber-600 text-sm">{metrics.dustPercent}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Gagang</span>
              <span className="font-bold text-slate-700 text-sm">{metrics.stemPercent}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Status QC</span>
              <span className="font-bold text-emerald-700 text-xs block">{metrics.qcStatus}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="font-semibold text-slate-700 block mb-1">Catatan Uji Mutu:</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
        >
          Batal
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
        >
          Verifikasi &amp; Simpan QC Batch
        </button>
      </div>
    </form>
  );
}

// 4. FORM CATAT MUTASI STOK
function AddMutationForm({
  inventory,
  onClose,
  onSubmit,
}: {
  inventory: InventoryItem[];
  onClose: () => void;
  onSubmit: (mutation: any) => void;
}) {
  const [itemId, setItemId] = useState(inventory[0]?.id || '');
  const [type, setType] = useState<'IN' | 'OUT'>('IN');
  const [quantityKg, setQuantityKg] = useState<number>(1000);
  const [refDocument, setRefDocument] = useState(`SJ-IN-${Date.now().toString().slice(-4)}`);
  const [partner, setPartner] = useState('Petani Cengkeh Lokal');
  const [operator, setOperator] = useState('Gudang Logistik');

  const selectedItem = inventory.find((i) => i.id === itemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMut = {
      id: `MUT-${Date.now().toString().slice(-5)}`,
      date: new Date().toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      type,
      itemId,
      itemName: selectedItem?.name || 'Komoditas Cengkeh',
      category: selectedItem?.category || 'RAW_MATERIAL',
      quantityKg,
      refDocument,
      partner,
      operator,
    };
    onSubmit(newMut);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-900">Catat Mutasi Stok Barang</h3>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4 space-y-3.5 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Jenis Transaksi:</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
            >
              <option value="IN">Stok MASUK (IN)</option>
              <option value="OUT">Stok KELUAR (OUT)</option>
            </select>
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Pilih Item Komoditas:</label>
            <select
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            >
              {inventory.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.name} (Stok: {inv.currentStockKg} kg)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Jumlah Mutasi (kg):</label>
            <input
              required
              type="number"
              min="10"
              value={quantityKg}
              onChange={(e) => setQuantityKg(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Nomor Dokumen Acuan:</label>
            <input
              required
              type="text"
              value={refDocument}
              onChange={(e) => setRefDocument(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="font-semibold text-slate-700 block mb-1">Mitra / Asal / Tujuan:</label>
          <input
            required
            type="text"
            placeholder="Contoh: Supplier Trenggalek / Gudang Produksi / Klien"
            value={partner}
            onChange={(e) => setPartner(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700 block mb-1">Petugas Bertanggung Jawab:</label>
          <input
            type="text"
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
        >
          Batal
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
        >
          Catat Transaksi Stok
        </button>
      </div>
    </form>
  );
}

// 5. FORM BUAT PENGIRIMAN (SURAT JALAN)
function AddShipmentForm({
  orders,
  onClose,
  onSubmit,
}: {
  orders: Order[];
  onClose: () => void;
  onSubmit: (shipment: any) => void;
}) {
  const [orderId, setOrderId] = useState(orders[0]?.id || '');
  const [doNumber, setDoNumber] = useState(`DO-2026-11-${Math.floor(Math.random() * 800) + 100}`);
  const [quantityKg, setQuantityKg] = useState<number>(3000);
  const [vehiclePlate, setVehiclePlate] = useState('L 8921 UX (Truk Box)');
  const [driverName, setDriverName] = useState('Bambang Sutrisno');
  const [destinationCity, setDestinationCity] = useState('Kudus, Jawa Tengah');

  const selectedOrder = orders.find((o) => o.id === orderId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newShipment = {
      id: `SHP-${Date.now().toString().slice(-5)}`,
      doNumber,
      orderId,
      clientName: selectedOrder?.clientName || 'Klien Industri',
      goodsDescription: `Cengkeh Rajang ${selectedOrder?.cutSize || '0.6mm'} (Kemasan Sak 50kg)`,
      quantityKg,
      vehiclePlate,
      driverName,
      departureDate: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      estimatedArrival: 'Hari ini +4 Jam',
      destinationCity,
      status: 'Persiapan Muat' as any,
    };
    onSubmit(newShipment);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-900">Buat Surat Jalan &amp; Pengiriman Baru</h3>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4 space-y-3.5 text-xs">
        <div>
          <label className="font-semibold text-slate-700 block mb-1">Pilih Order Pelanggan:</label>
          <select
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300"
          >
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.orderNumber} - {o.clientName} ({o.cutSize})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Nomor Surat Jalan (DO):</label>
            <input
              required
              type="text"
              value={doNumber}
              onChange={(e) => setDoNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Kuantitas Kirim (kg):</label>
            <input
              required
              type="number"
              min="50"
              value={quantityKg}
              onChange={(e) => setQuantityKg(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Plat Nomor Armada:</label>
            <input
              required
              type="text"
              placeholder="Contoh: L 9182 BB (Fuso Box)"
              value={vehiclePlate}
              onChange={(e) => setVehiclePlate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Nama Supir (Driver):</label>
            <input
              required
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            />
          </div>
        </div>

        <div>
          <label className="font-semibold text-slate-700 block mb-1">Kota / Pabrik Tujuan:</label>
          <input
            required
            type="text"
            placeholder="Contoh: Kediri, Jawa Timur / Karawang"
            value={destinationCity}
            onChange={(e) => setDestinationCity(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
        >
          Batal
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
        >
          Terbitkan Surat Jalan
        </button>
      </div>
    </form>
  );
}

// 6. FORM BUAT PURCHASE ORDER (PENGADAAN BAHAN BAKU DARI PETANI / SUPPLIER)
function AddPOForm({
  orders,
  onClose,
  onSubmit,
}: {
  orders: Order[];
  onClose: () => void;
  onSubmit: (po: PurchaseOrder) => void;
}) {
  const [poNumber, setPoNumber] = useState(`PO-RAW-${new Date().getFullYear()}-${Math.floor(Math.random() * 800) + 100}`);
  const [linkedOrderId, setLinkedOrderId] = useState(orders[0]?.id || '');
  const [supplierName, setSupplierName] = useState('Koperasi Tani Cengkeh Trenggalek');
  const [supplierContact, setSupplierContact] = useState('Pak Warno (0812-3456-7890)');
  const [commodityType, setCommodityType] = useState<'Bunga Cengkeh Zanzibar Super' | 'Bunga Cengkeh Sikotok' | 'Cengkeh Kering Sortir Lokal'>('Bunga Cengkeh Zanzibar Super');
  const [quantityKg, setQuantityKg] = useState<number>(5000);
  const [unitPrice, setUnitPrice] = useState<number>(105000);
  const [targetMoisturePercent, setTargetMoisturePercent] = useState<number>(12.0);
  const [estimatedDays, setEstimatedDays] = useState<number>(3);
  const [paymentTerms, setPaymentTerms] = useState<'Tempo 30 Hari' | 'DP 50% + Pelunasan' | 'Tunai / COD'>('Tempo 30 Hari');
  const [notes, setNotes] = useState('');

  const selectedOrder = orders.find((o) => o.id === linkedOrderId);

  // Auto-suggest quantity based on linked customer order if changed
  const handleLinkedOrderChange = (orderId: string) => {
    setLinkedOrderId(orderId);
    const ord = orders.find((o) => o.id === orderId);
    if (ord) {
      const suggestedRawKg = Math.round(ord.quantityKg / 0.89);
      setQuantityKg(suggestedRawKg);
      setNotes(`Pengadaan bahan baku untuk memenuhi pesanan ${ord.clientName} (${ord.orderNumber} - ${ord.cutSize})`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const arrivalDate = new Date(Date.now() + estimatedDays * 24 * 3600 * 1000).toISOString().slice(0, 10);
    const newPO: PurchaseOrder = {
      id: `PUR-${Date.now().toString().slice(-5)}`,
      poNumber,
      linkedCustomerOrderId: linkedOrderId,
      customerName: selectedOrder?.clientName,
      supplierName,
      supplierContact,
      commodityType,
      quantityKg,
      receivedKg: 0,
      unitPrice,
      totalAmount: quantityKg * unitPrice,
      orderDate: new Date().toISOString().slice(0, 10),
      estimatedArrival: arrivalDate,
      targetMoisturePercent,
      status: 'PO Terkirim ke Supplier',
      paymentTerms,
      notes,
    };
    onSubmit(newPO);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
            <ShoppingCart className="h-5 w-5" />
          </span>
          <h3 className="text-base font-bold text-slate-900">
            Terbitkan Purchase Order (PO) Pembelian Bahan
          </h3>
        </div>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4 space-y-3.5 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Nomor PO Pembelian:</label>
            <input
              required
              type="text"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Hubungkan Order Pelanggan:</label>
            <select
              value={linkedOrderId}
              onChange={(e) => handleLinkedOrderChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            >
              <option value="">-- Pengadaan Mandiri (Stok Bebas) --</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.clientName} ({o.quantityKg.toLocaleString('id-ID')} kg - {o.cutSize})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Nama Supplier / Koperasi:</label>
            <input
              required
              type="text"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Kontak Petani / Pengepul:</label>
            <input
              required
              type="text"
              value={supplierContact}
              onChange={(e) => setSupplierContact(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Jenis Komoditas:</label>
            <select
              value={commodityType}
              onChange={(e) => setCommodityType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
            >
              <option value="Bunga Cengkeh Zanzibar Super">Bunga Cengkeh Zanzibar Super</option>
              <option value="Bunga Cengkeh Sikotok">Bunga Cengkeh Sikotok</option>
              <option value="Cengkeh Kering Sortir Lokal">Cengkeh Kering Sortir Lokal</option>
            </select>
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Syarat Kadar Air Maksimal:</label>
            <input
              required
              type="number"
              step="0.1"
              value={targetMoisturePercent}
              onChange={(e) => setTargetMoisturePercent(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-teal-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Volume Pembelian (kg):</label>
            <input
              required
              type="number"
              min="100"
              step="100"
              value={quantityKg}
              onChange={(e) => setQuantityKg(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Harga Beli Satuan (Rp/kg):</label>
            <input
              required
              type="number"
              step="1000"
              value={unitPrice}
              onChange={(e) => setUnitPrice(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900"
            />
          </div>
        </div>

        {/* Live Total Calculation */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
          <span className="font-semibold text-slate-600">Total Nilai Kontrak Pembelian:</span>
          <span className="text-base font-bold text-emerald-700">
            Rp {(quantityKg * unitPrice).toLocaleString('id-ID')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Estimasi Hari Pengiriman:</label>
            <select
              value={estimatedDays}
              onChange={(e) => setEstimatedDays(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            >
              <option value={1}>1 Hari (Besok Tiba)</option>
              <option value={2}>2 Hari</option>
              <option value={3}>3 Hari (Standar)</option>
              <option value={5}>5 Hari (Luar Pulau)</option>
            </select>
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Ketentuan Pembayaran:</label>
            <select
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            >
              <option value="Tempo 30 Hari">Tempo 30 Hari</option>
              <option value="DP 50% + Pelunasan">DP 50% + Pelunasan</option>
              <option value="Tunai / COD">Tunai / COD</option>
            </select>
          </div>
        </div>

        <div>
          <label className="font-semibold text-slate-700 block mb-1">Catatan Tambahan / Instruksi Armada:</label>
          <input
            type="text"
            placeholder="Contoh: Pengiriman via armada truk Fuso, wajib terpal ganda"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
        >
          Batal
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
        >
          Terbitkan &amp; Kirim ke Supplier
        </button>
      </div>
    </form>
  );
}

// 7. FORM PERMINTAAN SPAREPART MESIN
function AddSparepartReqForm({
  machines,
  spareParts,
  onClose,
  onSubmit,
}: {
  machines: MachineCodeDef[];
  spareParts: SparePart[];
  onClose: () => void;
  onSubmit: (req: SparePartRequisition) => void;
}) {
  const [machineCode, setMachineCode] = useState(machines[0]?.code || 'MCH-ROT-01');
  const [partCode, setPartCode] = useState(spareParts[0]?.partCode || 'PRT-CUT-BLD-01');
  const [quantity, setQuantity] = useState(1);
  const [requestedBy, setRequestedBy] = useState('Hendra Gunawan (Teknisi Mesin)');
  const [urgency, setUrgency] = useState<RequisitionUrgency>('URGENT_BREAKDOWN');
  const [reason, setReason] = useState('Penggantian mata pisau aus akibat pemotongan cengkeh padat');

  const selectedMachine = machines.find((m) => m.code === machineCode);
  const selectedPart = spareParts.find((p) => p.partCode === partCode);

  const formatIDR = (num: number) => 'Rp ' + Math.round(num).toLocaleString('id-ID');
  const estimatedCost = (selectedPart?.unitCost || 0) * Number(quantity);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: SparePartRequisition = {
      id: `req-${Date.now()}`,
      reqNumber: `REQ-SP-2026-${Math.floor(Math.random() * 900) + 100}`,
      machineCode: selectedMachine?.code || machineCode,
      machineName: selectedMachine?.name || 'Mesin Perajang',
      partCode: selectedPart?.partCode || partCode,
      partName: selectedPart?.partName || 'Sparepart',
      quantity: Number(quantity),
      requestedBy,
      urgency,
      reason,
      requestDate: new Date().toISOString().split('T')[0],
      status: 'Diajukan',
      estimatedCost,
    };
    onSubmit(newReq);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Ajukan Permintaan Sparepart</h3>
            <p className="text-xs text-slate-500">Koneksikan Kode Part dengan Target Kode Mesin Pemasangan</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 space-y-4 text-xs">
        {/* Target Kode Mesin */}
        <div>
          <label className="font-semibold text-slate-700 block mb-1">
            Target Kode Mesin (Tempat Pemasangan):
          </label>
          <select
            value={machineCode}
            onChange={(e) => setMachineCode(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs font-semibold"
          >
            {machines.map((m) => (
              <option key={m.code} value={m.code}>
                {m.code} &mdash; {m.name} ({m.model})
              </option>
            ))}
          </select>
          {selectedMachine && (
            <p className="mt-1 text-[11px] text-slate-500">
              Lokasi: <span className="font-medium text-slate-700">{selectedMachine.location}</span> | Total Jam Kerja: <span className="font-medium text-slate-700">{selectedMachine.totalOperatingHours} jam</span>
            </p>
          )}
        </div>

        {/* Kode Sparepart */}
        <div>
          <label className="font-semibold text-slate-700 block mb-1">
            Pilih Kode Part &amp; Komponen:
          </label>
          <select
            value={partCode}
            onChange={(e) => setPartCode(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs font-semibold"
          >
            {spareParts.map((p) => (
              <option key={p.partCode} value={p.partCode}>
                {p.partCode} &mdash; {p.partName} [Stok: {p.stockQty} {p.unit}]
              </option>
            ))}
          </select>
        </div>

        {/* Info Part Detail Box */}
        {selectedPart && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-[11px]">
            <div>
              <span className="text-slate-400 block">Stok Tersedia di Gudang</span>
              <span className={`font-bold ${selectedPart.stockQty <= selectedPart.minBuffer ? 'text-rose-600' : 'text-emerald-600'}`}>
                {selectedPart.stockQty} {selectedPart.unit} (Buffer Min: {selectedPart.minBuffer})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Lokasi Bin Gudang</span>
              <span className="font-semibold text-slate-800">{selectedPart.storageBin}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Harga Satuan</span>
              <span className="font-semibold text-slate-800">{formatIDR(selectedPart.unitCost)}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Jumlah Diperlukan:</label>
            <input
              type="number"
              min={1}
              max={selectedPart?.stockQty || 99}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Tingkat Urgensi:</label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as RequisitionUrgency)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
            >
              <option value="URGENT_BREAKDOWN">🚨 Urgent Breakdown (Mesin Berhenti)</option>
              <option value="PREVENTIVE">⏱️ Preventive Maintenance (Terjadwal)</option>
              <option value="NORMAL">📦 Normal Buffer (Cadangan Reguler)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="font-semibold text-slate-700 block mb-1">Teknisi Pengaju:</label>
          <input
            type="text"
            value={requestedBy}
            onChange={(e) => setRequestedBy(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300"
            placeholder="Nama teknisi / regu maintenance"
            required
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700 block mb-1">Alasan Permintaan / Gejala Kerusakan:</label>
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300"
            placeholder="Deskripsikan kondisi sparepart aus atau gejala kegagalan mekanik..."
            required
          />
        </div>

        {/* Cost Summary */}
        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
          <span className="text-indigo-900 font-semibold">Total Estimasi Biaya Penggantian:</span>
          <span className="text-sm font-bold text-indigo-700">{formatIDR(estimatedCost)}</span>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
        >
          Batal
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
        >
          Kirim Tiket Permintaan
        </button>
      </div>
    </form>
  );
}

// 8. FORM PENERIMAAN / PEMBELIAN SPAREPART (+ STOCK IN)
function AddSparepartStockInForm({
  spareParts,
  onClose,
  onSubmit,
}: {
  spareParts: SparePart[];
  onClose: () => void;
  onSubmit: (data: {
    partCode: string;
    quantity: number;
    newUnitCost: number;
    poNumber: string;
    supplierName: string;
    invoiceNumber: string;
    notes: string;
    performedBy: string;
  }) => void;
}) {
  const [partCode, setPartCode] = useState(spareParts[0]?.partCode || 'PRT-CUT-BLD-01');
  const selectedPart = spareParts.find((p) => p.partCode === partCode);

  const [quantity, setQuantity] = useState(2);
  const [newUnitCost, setNewUnitCost] = useState(selectedPart?.unitCost || 2850000);
  const [poNumber, setPoNumber] = useState(`PO-SP-2026-${Math.floor(Math.random() * 900) + 100}`);
  const [supplierName, setSupplierName] = useState(selectedPart?.supplier || 'PT Teknik Mandiri Presisi');
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-SP-${Math.floor(Math.random() * 9000) + 1000}`);
  const [performedBy, setPerformedBy] = useState('Agus Riyadi (Gudang Maintenance)');
  const [notes, setNotes] = useState('Penerimaan pengiriman sparepart restock sesuai pesanan pembelian');

  const formatIDR = (num: number) => 'Rp ' + Math.round(num).toLocaleString('id-ID');
  const totalPurchaseValue = Number(quantity) * Number(newUnitCost);

  const handlePartChange = (code: string) => {
    setPartCode(code);
    const p = spareParts.find((item) => item.partCode === code);
    if (p) {
      setNewUnitCost(p.unitCost);
      setSupplierName(p.supplier || 'PT Teknik Mandiri Presisi');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      partCode,
      quantity: Number(quantity),
      newUnitCost: Number(newUnitCost),
      poNumber,
      supplierName,
      invoiceNumber,
      notes,
      performedBy,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
            <ArrowDownLeft className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Penerimaan Pembelian Sparepart (+ Stock In)</h3>
            <p className="text-xs text-slate-500">Harga beli baru menjadi dasar penilaian HPP &amp; Persediaan di Laporan Keuangan</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 space-y-4 text-xs">
        {/* Pilih Sparepart */}
        <div>
          <label className="font-semibold text-slate-700 block mb-1">
            Pilih Kode Part yang Diterima / Dibeli:
          </label>
          <select
            value={partCode}
            onChange={(e) => handlePartChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs font-semibold"
          >
            {spareParts.map((p) => (
              <option key={p.partCode} value={p.partCode}>
                {p.partCode} &mdash; {p.partName} [Stok Saat Ini: {p.stockQty} {p.unit}]
              </option>
            ))}
          </select>
        </div>

        {/* Existing info */}
        {selectedPart && (
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-[11px]">
            <div>
              <span className="text-slate-400 block">Stok Gudang Sebelum In</span>
              <span className="font-bold text-slate-800">{selectedPart.stockQty} {selectedPart.unit}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Lokasi Rak Simpan</span>
              <span className="font-semibold text-emerald-700">{selectedPart.storageBin}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Harga Satuan Lama</span>
              <span className="font-semibold text-slate-600">{formatIDR(selectedPart.unitCost)}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {/* Harga Beli Satuan Baru (Input) */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Harga Beli Satuan Baru (Rp):
            </label>
            <input
              type="number"
              min={1000}
              step={1000}
              value={newUnitCost}
              onChange={(e) => setNewUnitCost(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-emerald-700"
              required
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Update harga beli dasar</span>
          </div>

          {/* Jumlah / Qty Diterima */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Jumlah Diterima ({selectedPart?.unit || 'Unit'}):
            </label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
              required
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Menambah kuantitas fisik</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Nomor PO Pembelian:</label>
            <input
              type="text"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
              required
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Nomor Surat Jalan / Faktur:</label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="font-semibold text-slate-700 block mb-1">Nama Supplier / Vendor Sparepart:</label>
          <input
            type="text"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300"
            required
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700 block mb-1">Petugas Penerima Gudang:</label>
          <input
            type="text"
            value={performedBy}
            onChange={(e) => setPerformedBy(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300"
            required
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700 block mb-1">Catatan Tambahan:</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300"
          />
        </div>

        {/* Total Purchase Value Box */}
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-teal-900 font-semibold">Total Nilai Pembelian Suku Cadang:</span>
            <span className="text-sm font-bold text-teal-700">{formatIDR(totalPurchaseValue)}</span>
          </div>
          <p className="text-[10px] text-teal-800">
            &bull; Otomatis mendebit Akun 1204 (Persediaan Suku Cadang Mesin) di Neraca dan mengkredit Hutang Supplier (Akun 2104).
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
        >
          Batal
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs"
        >
          Terima Barang &amp; Masuk Gudang
        </button>
      </div>
    </form>
  );
}
