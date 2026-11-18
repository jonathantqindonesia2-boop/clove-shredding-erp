export type CutSize = '0.4mm' | '0.6mm' | '0.8mm' | '1.0mm' | '1.2mm';

export type OrderStatus = 'Antrian' | 'Sedang Diproses' | 'Selesai' | 'Terlambat';

export type OrderPriority = 'Standar' | 'Tinggi (Rush)' | 'Ekspor Prioritas';

export interface Order {
  id: string;
  orderNumber: string;
  clientName: string;
  cutSize: CutSize;
  quantityKg: number;
  processedKg: number;
  deadline: string; // ISO format or YYYY-MM-DD HH:mm
  machineId: string;
  priority: OrderPriority;
  status: OrderStatus;
  orderDate: string;
  notes?: string;
}

export type QCStatus = 'Lolos Prima' | 'Toleransi' | 'Koreksi Kelembaban' | 'Ditolak';

export interface BatchQC {
  id: string;
  orderId: string;
  machineId: string;
  operator: string;
  date: string;
  shift: 1 | 2 | 3;
  rawInputKg: number;
  cleanCutKg: number;
  dustKg: number;
  stemKg: number;
  moisturePercent: number; // Kadar Air (%)
  rendemenPercent: number; // (Clean / Raw) * 100
  dustPercent: number; // (Dust / Raw) * 100
  stemPercent: number; // (Stem / Raw) * 100
  lossPercent: number; // 100 - (rendemen + dust + stem)
  qcStatus: QCStatus;
  notes?: string;
}

export type MachineStatus = 'Running' | 'Idle' | 'Maintenance' | 'Pisau Ditajamkan';

export interface Machine {
  id: string;
  name: string;
  type: string;
  capacityKgPerHour: number; // Kapasitas efektif
  efficiencyPercent: number; // OEE rating (e.g. 90%)
  status: MachineStatus;
  assignedOrderIds: string[];
  bladeSharpness: number; // 0-100%
  operatorOnDuty: string;
}

export type InventoryCategory = 'RAW_MATERIAL' | 'FINISHED_GOODS' | 'BYPRODUCT_DUST' | 'STEMS';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: InventoryCategory;
  currentStockKg: number;
  minBufferKg: number;
  unit: string;
  storageBin: string;
}

export interface StockMutation {
  id: string;
  date: string;
  type: 'IN' | 'OUT';
  itemId: string;
  itemName: string;
  category: InventoryCategory;
  quantityKg: number;
  refDocument: string;
  partner: string; // Supplier / Klien / Internal
  operator: string;
}

export type ShipmentStatus = 'Persiapan Muat' | 'Dalam Perjalanan' | 'Tiba di Lokasi' | 'Selesai & Diterima';

export interface Shipment {
  id: string;
  doNumber: string; // Surat Jalan
  orderId: string;
  clientName: string;
  goodsDescription: string;
  quantityKg: number;
  vehiclePlate: string;
  driverName: string;
  departureDate: string;
  estimatedArrival: string;
  destinationCity: string;
  status: ShipmentStatus;
}
