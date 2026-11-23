export interface MachineCodeDef {
  code: string; // e.g. MCH-ROT-01
  name: string;
  type: string;
  model: string;
  location: string;
  installationYear: number;
  totalOperatingHours: number;
}

export type SparePartCategory =
  | 'CUTTING_BLADE'
  | 'TRANSMISSION'
  | 'HYDRAULIC'
  | 'FILTRATION'
  | 'BEARING'
  | 'CONSUMABLE';

export interface SparePart {
  partCode: string; // e.g. PRT-CUT-BLD-01
  partName: string;
  category: SparePartCategory;
  compatibleMachineCodes: string[]; // Kode mesin yang cocok
  stockQty: number;
  minBuffer: number;
  unit: string;
  unitCost: number; // Nilai harga satuan (Rp)
  storageBin: string; // Lokasi rak gudang sparepart
  supplier: string;
  specifications: string;
}

export type WearCondition = 'PRIMA' | 'WARNING' | 'OVERDUE_REPLACE';

export interface PartLifespanTracker {
  id: string;
  machineCode: string; // e.g. MCH-ROT-01
  machineName: string;
  partCode: string; // e.g. PRT-CUT-BLD-01
  partName: string;
  category: SparePartCategory;
  installedDate: string;
  maxLifespanHours: number; // e.g. 350 jam
  currentRunningHours: number; // e.g. 290 jam
  remainingHours: number;
  healthPercent: number; // (remainingHours / maxLifespanHours) * 100
  maxThroughputTons: number; // e.g. 100 ton
  currentProcessedTons: number; // e.g. 82.5 ton
  wearCondition: WearCondition;
  sharpeningCount: number; // Frekuensi pengasahan yang telah dilakukan
  recommendedAction: string;
}

export type MaintenanceType = 'PREVENTIVE' | 'BREAKDOWN_REPAIR' | 'BLADE_SHARPENING';
export type MaintenanceStatus = 'Selesai' | 'Dalam Pengerjaan' | 'Menunggu Sparepart';

export interface MaintenanceHistory {
  id: string; // e.g. MNT-2026-11-042
  logNumber: string;
  machineCode: string;
  machineName: string;
  type: MaintenanceType;
  date: string;
  downtimeHours: number;
  issueDescription: string;
  actionTaken: string;
  technician: string;
  replacedPartCode?: string;
  replacedPartName?: string;
  replacedPartQty?: number;
  totalCost: number;
  status: MaintenanceStatus;
}

export type RequisitionUrgency = 'NORMAL' | 'URGENT_BREAKDOWN' | 'PREVENTIVE';
export type RequisitionStatus = 'Diajukan' | 'Disetujui' | 'Terpasang di Mesin' | 'Ditolak';

export interface SparePartRequisition {
  id: string;
  reqNumber: string; // e.g. REQ-SP-2026-021
  machineCode: string; // Target mesin pemasangan
  machineName: string;
  partCode: string; // Part yang diminta
  partName: string;
  quantity: number;
  requestedBy: string; // Teknisi
  urgency: RequisitionUrgency;
  reason: string;
  requestDate: string;
  status: RequisitionStatus;
  installedDate?: string;
  estimatedCost: number;
}

export type SparePartMutationType = 'IN_PURCHASE' | 'IN_ADJUSTMENT' | 'OUT_MAINTENANCE' | 'OUT_SCRAP';

export interface SparePartStockMutation {
  id: string; // e.g. SPMUT-2026-11-001
  mutationNumber: string; // e.g. TRX-SP-2026-091
  date: string; // e.g. 2026-11-18 14:20
  type: SparePartMutationType;
  partCode: string; // PRT-CUT-BLD-01
  partName: string;
  quantity: number;
  unit: string;
  unitCost: number; // Harga beli satuan (Rp)
  totalAmount: number; // quantity * unitCost

  // Link ke Permintaan & Mesin (jika OUT_MAINTENANCE)
  targetMachineCode?: string; // MCH-ROT-01
  targetMachineName?: string;
  requisitionId?: string;
  requisitionNumber?: string; // REQ-SP-2026-021
  maintenanceLogNumber?: string; // MNT-2026-042
  technician?: string; // Hendra Gunawan

  // Link ke Pembelian / PO (jika IN_PURCHASE)
  purchasePoNumber?: string; // PO-SP-2026-012
  supplierName?: string; // PT Teknik Mandiri Presisi
  invoiceNumber?: string;

  notes: string;
  performedBy: string;
}
