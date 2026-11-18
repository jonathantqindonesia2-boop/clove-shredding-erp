export interface ChartOfAccount {
  code: string;
  name: string;
  category: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'COGS' | 'EXPENSE';
  normalBalance: 'DEBIT' | 'CREDIT';
}

export interface JournalEntry {
  id: string;
  date: string;
  referenceNumber: string; // e.g. BATCH-01, PO-088, PAYROLL-2026-11, DO-094
  description: string;
  sourceModule: 'OPERASIONAL_PERAJANGAN' | 'HRIS_PAYROLL' | 'LOGISTIK_PENGIRIMAN' | 'GUDANG_INVENTORI';
  items: {
    accountCode: string;
    accountName: string;
    debit: number;
    credit: number;
  }[];
}

export interface ProfitAndLossStatement {
  period: string;
  revenue: {
    cloveCleanSales: number; // Penjualan rajangan prima
    dustByproductSales: number; // Penjualan debu siklon
    stemByproductSales: number; // Penjualan gagang
    totalRevenue: number;
  };
  cogs: {
    rawMaterialBeginning: number;
    rawMaterialPurchases: number;
    rawMaterialEnding: number;
    directMaterialsCost: number; // Pemakaian cengkeh mentah
    directLaborCost: number; // Upah operator mesin perajang (DARI HRIS)
    factoryOverhead: {
      powerElectricity: number; // Listrik mesin perajang & blower
      bladeMaintenance: number; // Asah & ganti pisau
      packagingSupplies: number; // Sak goni & plastik kedap
      depreciationMachines: number; // Penyusutan mesin rajang
      totalOverhead: number;
    };
    totalCOGS: number; // HPP
  };
  grossProfit: number;
  grossMarginPercent: number;
  operatingExpenses: {
    deliveryAndLogistics: number; // Dari modul shipment (BBM, supir, tol)
    administrativeSalaries: number; // Gaji manajemen & staff (DARI HRIS)
    officeAndGeneralSupplies: number;
    totalOpex: number;
  };
  operatingIncome: number; // EBITDA
  taxExpense: number; // Estimasi PPh Badan (22%)
  netIncome: number; // Laba Bersih
  netMarginPercent: number;
}

export interface BalanceSheetStatement {
  asOfDate: string;
  assets: {
    currentAssets: {
      cashAndBank: number;
      accountsReceivable: number; // Piutang dagang pabrik rokok
      rawMaterialInventory: number; // Nilai rupiah cengkeh mentah di gudang
      finishedGoodsInventory: number; // Nilai rupiah cengkeh rajang siap kirim
      byproductInventory: number; // Nilai debu siklon & gagang
      totalCurrentAssets: number;
    };
    fixedAssets: {
      shreddingMachinery: number; // Mesin perajang & siklon
      transportVehicles: number; // Truk box ekspedisi
      accumulatedDepreciation: number;
      netFixedAssets: number;
    };
    totalAssets: number;
  };
  liabilities: {
    currentLiabilities: {
      accountsPayableSuppliers: number; // Hutang ke petani cengkeh
      accruedPayrollHRIS: number; // Hutang gaji & lembur operator (DARI HRIS)
      taxPayable: number;
      totalCurrentLiabilities: number;
    };
    totalLiabilities: number;
  };
  equity: {
    shareCapital: number; // Modal disetor
    retainedEarnings: number; // Laba ditahan
    currentPeriodEarnings: number; // Laba periode berjalan
    totalEquity: number;
  };
  isBalanced: boolean;
}

export interface HRISPayrollAllocation {
  periodMonth: string;
  totalEmployees: number;
  directLaborTotal: number; // TKL: Operator mesin (Budi, Agus, Hendra)
  overtimeDirectLabor: number; // Lembur pengerjaan rush orders
  indirectLaborTotal: number; // TKTL: Maintenance, Teknisi Pisau, QC
  administrativeTotal: number; // Gaji Direksi, HR, Accounting
  bpjsCompanyTotal: number; // BPJS Kesehatan & Ketenagakerjaan porsi pabrik
  totalPayrollExpense: number;
  syncTimestamp: string;
  sourceEndpoint: string;
}
