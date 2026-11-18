import { HRISPayrollAllocation } from './financial-types';

export const INITIAL_HRIS_PAYROLL_DATA: HRISPayrollAllocation = {
  periodMonth: 'November 2026',
  totalEmployees: 28,
  directLaborTotal: 17800000, // Upah pokok operator mesin perajang (3 operator)
  overtimeDirectLabor: 3910000, // Lembur operator pemenuhan deadline rush order
  indirectLaborTotal: 28500000, // Tim teknisi pisau, maintenance mesin, QC lab, logistik gudang
  administrativeTotal: 39500000, // Manajemen pabrik, HR specialist, accounting & tax
  bpjsCompanyTotal: 8450000, // BPJS Ketenagakerjaan (JKK, JKM, JHT) & BPJS Kesehatan pabrik
  totalPayrollExpense: 98160000,
  syncTimestamp: '2026-11-18 14:00 WIB',
  sourceEndpoint: 'https://hris-core-system.vercel.app/api/payroll/export',
};

export interface HRISWorkerBreakdown {
  id: string;
  name: string;
  role: string;
  category: 'DIRECT_LABOR' | 'INDIRECT_LABOR' | 'ADMIN_OVERHEAD';
  machineAssigned?: string;
  baseSalary: number;
  overtimeHours: number;
  overtimePay: number;
  totalCost: number;
}

export const HRIS_WORKERS: HRISWorkerBreakdown[] = [
  {
    id: 'EMP-PROD-01',
    name: 'Budi Santoso',
    role: 'Senior Rotary Slicer Operator',
    category: 'DIRECT_LABOR',
    machineAssigned: 'MS-01',
    baseSalary: 6500000,
    overtimeHours: 24,
    overtimePay: 1550000,
    totalCost: 8050000,
  },
  {
    id: 'EMP-PROD-02',
    name: 'Agus Riyadi',
    role: 'Guillotine Shredder Operator',
    category: 'DIRECT_LABOR',
    machineAssigned: 'MS-02',
    baseSalary: 5800000,
    overtimeHours: 20,
    overtimePay: 1350000,
    totalCost: 7150000,
  },
  {
    id: 'EMP-PROD-03',
    name: 'Hendra Gunawan',
    role: 'Precision Cutter Operator',
    category: 'DIRECT_LABOR',
    machineAssigned: 'MS-03',
    baseSalary: 5500000,
    overtimeHours: 16,
    overtimePay: 1010000,
    totalCost: 6510000,
  },
  {
    id: 'EMP-MAINT-01',
    name: 'Slamet Riyadi & Tim',
    role: 'Teknisi Servis & Pengasahan Pisau',
    category: 'INDIRECT_LABOR',
    baseSalary: 14200000,
    overtimeHours: 10,
    overtimePay: 850000,
    totalCost: 15050000,
  },
  {
    id: 'EMP-QC-01',
    name: 'Rudi Hartono',
    role: 'Quality Assurance & Moisture Analyst',
    category: 'INDIRECT_LABOR',
    baseSalary: 7800000,
    overtimeHours: 8,
    overtimePay: 620000,
    totalCost: 8420000,
  },
  {
    id: 'EMP-WH-01',
    name: 'Joko Prabowo',
    role: 'Kepala Gudang & Silo Cengkeh',
    category: 'INDIRECT_LABOR',
    baseSalary: 6500000,
    overtimeHours: 0,
    overtimePay: 0,
    totalCost: 6500000,
  },
  {
    id: 'EMP-MGT-01',
    name: 'Andi Wijaya',
    role: 'Kepala Operasional Pabrik (VP Operations)',
    category: 'ADMIN_OVERHEAD',
    baseSalary: 25000000,
    overtimeHours: 0,
    overtimePay: 0,
    totalCost: 25000000,
  },
  {
    id: 'EMP-FIN-01',
    name: 'Dewi Lestari',
    role: 'Finance, Cost Accounting & Pajak',
    category: 'ADMIN_OVERHEAD',
    baseSalary: 14500000,
    overtimeHours: 0,
    overtimePay: 0,
    totalCost: 14500000,
  },
];
