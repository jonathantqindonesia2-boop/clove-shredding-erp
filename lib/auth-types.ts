import { TabKey } from '../components/TabNavigation';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'DIREKSI'
  | 'PLANT_MANAGER'
  | 'QC_SUPERVISOR'
  | 'WAREHOUSE_LEAD'
  | 'MAINTENANCE_LEAD'
  | 'PURCHASING_OFFICER'
  | 'FINANCE_ACCOUNTING';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

export interface AppUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  department: string;
  status: UserStatus;
  avatarBg: string;
  avatarText: string;
  allowedModules: TabKey[];
  lastLoginAt: string;
  lastLoginIp: string;
  createdAt: string;
}

export type AuditActionType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'ACCESS_DENIED'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'PERMISSION_CHANGED'
  | 'STATUS_CHANGED'
  | 'PASSWORD_RESET';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  name: string;
  role: UserRole;
  roleLabel: string;
  action: AuditActionType;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  ipAddress: string;
  device: string;
  details: string;
}

export interface ModuleDefinition {
  id: TabKey;
  label: string;
  description: string;
  category: 'Eksekutif' | 'Operasional Pabrik' | 'Logistik & Inventori' | 'Keuangan & Pengadaan' | 'Sistem';
  colorBadge: string;
}

export const SYSTEM_MODULES: ModuleDefinition[] = [
  {
    id: 'dashboard',
    label: 'Dashboard Eksekutif',
    description: 'Ringkasan KPI throughput pabrik, antrian order, status mesin, dan alert keterlambatan.',
    category: 'Eksekutif',
    colorBadge: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'orders',
    label: 'Order & Antrian',
    description: 'Penerimaan order PO klien (GGRM, Sampoerna, dll), ukuran pisau rajangan, alokasi mesin, dan tenggat waktu.',
    category: 'Operasional Pabrik',
    colorBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: 'production',
    label: 'Pengerjaan & QC Mutu',
    description: 'Monitoring pengerjaan batch, parameter rendemen prima, debu siklon, dan kadar air.',
    category: 'Operasional Pabrik',
    colorBadge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    id: 'machines',
    label: 'Mesin & Evaluasi Keterlambatan',
    description: 'Daftar armada mesin rotary/guillotine, input kapasitas kg/jam, dan delay evaluation engine.',
    category: 'Operasional Pabrik',
    colorBadge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    id: 'spareparts',
    label: 'Sparepart & Maintenance',
    description: 'Manajemen suku cadang, pelacak jam pakai pisau/bearing, history kerusakan mesin, dan permohonan part.',
    category: 'Operasional Pabrik',
    colorBadge: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    id: 'inventory',
    label: 'Stock In / Out',
    description: 'Monitoring stok gudang bahan baku cengkeh basah/kering, rajang prima, debu siklon, dan gagang.',
    category: 'Logistik & Inventori',
    colorBadge: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  {
    id: 'shipments',
    label: 'Monitoring Pengiriman',
    description: 'Penerbitan Surat Jalan (DO), tracking ekspedisi armada truk box, dan tanda terima BAST klien.',
    category: 'Logistik & Inventori',
    colorBadge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
  {
    id: 'procurement',
    label: 'Pengadaan & Pembelian (MRP)',
    description: 'Kalkulasi kebutuhan bahan baku dari order masuk, PO ke kelompok tani cengkeh, dan update harga beli.',
    category: 'Keuangan & Pengadaan',
    colorBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: 'finance',
    label: 'Laporan Keuangan & HPP',
    description: 'Laba Rugi, Neraca, HPP per kg, integrasi payroll HRIS, jurnal umum, dan Corporate Health Check Direksi.',
    category: 'Keuangan & Pengadaan',
    colorBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: 'analytics',
    label: 'Analisis Mendalam',
    description: 'Eksplorasi mendalam korelasi rendemen vs debu, tren efisiensi OEE mesin, dan produktivitas.',
    category: 'Eksekutif',
    colorBadge: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  {
    id: 'users',
    label: 'Akses Pengguna & Audit Log',
    description: 'Pengelolaan matriks hak akses pengguna per modul oleh Super Admin dan audit trail log in / log out.',
    category: 'Sistem',
    colorBadge: 'bg-rose-50 text-rose-700 border-rose-200',
  },
];
