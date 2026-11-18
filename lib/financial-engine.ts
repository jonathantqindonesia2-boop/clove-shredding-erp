import { BatchQC, InventoryItem, Machine, Order, Shipment } from './types';
import {
  BalanceSheetStatement,
  ChartOfAccount,
  HRISPayrollAllocation,
  JournalEntry,
  ProfitAndLossStatement,
} from './financial-types';

export const FACTORY_COA: ChartOfAccount[] = [
  { code: '1001', name: 'Kas & Rekening Operasional Bank', category: 'ASSET', normalBalance: 'DEBIT' },
  { code: '1100', name: 'Piutang Usaha Klien Rokok Kretek', category: 'ASSET', normalBalance: 'DEBIT' },
  { code: '1201', name: 'Persediaan Bahan Baku Bunga Cengkeh', category: 'ASSET', normalBalance: 'DEBIT' },
  { code: '1202', name: 'Persediaan Cengkeh Rajang Jadi (FG)', category: 'ASSET', normalBalance: 'DEBIT' },
  { code: '1203', name: 'Persediaan Hasil Samping (Debu & Gagang)', category: 'ASSET', normalBalance: 'DEBIT' },
  { code: '1501', name: 'Mesin Perajang Rotary & Sistem Siklon', category: 'ASSET', normalBalance: 'DEBIT' },
  { code: '1502', name: 'Armada Truk Ekspedisi Pendingin', category: 'ASSET', normalBalance: 'DEBIT' },
  { code: '1599', name: 'Akumulasi Penyusutan Aset Tetap', category: 'ASSET', normalBalance: 'CREDIT' },
  { code: '2101', name: 'Hutang Usaha Petani & Pengepul Cengkeh', category: 'LIABILITY', normalBalance: 'CREDIT' },
  { code: '2102', name: 'Hutang Gaji & Lembur Karyawan (HRIS)', category: 'LIABILITY', normalBalance: 'CREDIT' },
  { code: '2103', name: 'Hutang Pajak PPh & PPN', category: 'LIABILITY', normalBalance: 'CREDIT' },
  { code: '3001', name: 'Modal Disetor Pemegang Saham', category: 'EQUITY', normalBalance: 'CREDIT' },
  { code: '3101', name: 'Laba Ditahan (Retained Earnings)', category: 'EQUITY', normalBalance: 'CREDIT' },
  { code: '4101', name: 'Pendapatan Penjualan Cengkeh Rajang Prima', category: 'REVENUE', normalBalance: 'CREDIT' },
  { code: '4102', name: 'Pendapatan Penjualan Debu Siklon (Dupa)', category: 'REVENUE', normalBalance: 'CREDIT' },
  { code: '4103', name: 'Pendapatan Penjualan Gagang Sortir (Atsiri)', category: 'REVENUE', normalBalance: 'CREDIT' },
  { code: '5101', name: 'Beban Pokok: Pemakaian Bahan Baku Cengkeh', category: 'COGS', normalBalance: 'DEBIT' },
  { code: '5102', name: 'Beban Pokok: Upah Tenaga Kerja Langsung (HRIS)', category: 'COGS', normalBalance: 'DEBIT' },
  { code: '5103', name: 'Beban Pokok: Listrik & Daya Mesin Perajang', category: 'COGS', normalBalance: 'DEBIT' },
  { code: '5104', name: 'Beban Pokok: Asah & Penggantian Pisau', category: 'COGS', normalBalance: 'DEBIT' },
  { code: '5105', name: 'Beban Pokok: Kemasan Sak Goni & Plastik', category: 'COGS', normalBalance: 'DEBIT' },
  { code: '5106', name: 'Beban Pokok: Penyusutan Mesin Pabrik', category: 'COGS', normalBalance: 'DEBIT' },
  { code: '6101', name: 'Beban Logistik, Bahan Bakar Truk & Tol', category: 'EXPENSE', normalBalance: 'DEBIT' },
  { code: '6102', name: 'Beban Gaji Manajemen & Administrasi (HRIS)', category: 'EXPENSE', normalBalance: 'DEBIT' },
  { code: '6103', name: 'Beban Operasional Kantor & Pemeliharaan', category: 'EXPENSE', normalBalance: 'DEBIT' },
];

export function generateFinancialStatements(
  orders: Order[],
  batches: BatchQC[],
  inventory: InventoryItem[],
  shipments: Shipment[],
  hrisPayroll: HRISPayrollAllocation
): {
  pnl: ProfitAndLossStatement;
  balanceSheet: BalanceSheetStatement;
  journalEntries: JournalEntry[];
  unitCostPerKg: number;
  averageSellingPricePerKg: number;
} {
  // 1. REVENUE CALCULATION
  const pricePerCutSize: Record<string, number> = {
    '0.4mm': 155000,
    '0.6mm': 145000,
    '0.8mm': 138000,
    '1.0mm': 132000,
    '1.2mm': 128000,
  };

  // Hitung penjualan dari order yang telah diproses/terkirim
  let cloveCleanSales = 0;
  let totalProcessedKg = 0;

  orders.forEach((o) => {
    const rate = pricePerCutSize[o.cutSize] || 140000;
    const billedKg = Math.max(o.processedKg, o.status === 'Selesai' ? o.quantityKg : 0);
    cloveCleanSales += billedKg * rate;
    totalProcessedKg += billedKg;
  });

  // Penjualan Byproduct
  const totalDustKg = batches.reduce((sum, b) => sum + b.dustKg, 0);
  const totalStemKg = batches.reduce((sum, b) => sum + b.stemKg, 0);
  const dustByproductSales = totalDustKg * 24000; // Rp 24.000 / kg
  const stemByproductSales = totalStemKg * 18000; // Rp 18.000 / kg

  const totalRevenue = cloveCleanSales + dustByproductSales + stemByproductSales;

  // 2. COGS (HPP) CALCULATION
  const totalRawInputKg = batches.reduce((sum, b) => sum + b.rawInputKg, 0);
  const rawMaterialPricePerKg = 104000; // Harga beli cengkeh utuh kering
  const directMaterialsCost = totalRawInputKg * rawMaterialPricePerKg;

  // Direct Labor dari Integrasi HRIS
  const directLaborCost = hrisPayroll.directLaborTotal + hrisPayroll.overtimeDirectLabor;

  // Factory Overhead (BOP)
  const powerElectricity = Math.round(totalRawInputKg * 850); // Listrik 3-phase perajangan
  const bladeMaintenance = Math.round(totalRawInputKg * 620); // Konsumsi pisau perajang
  const packagingSupplies = Math.round((totalProcessedKg / 50) * 8500); // Karung goni per 50kg
  const depreciationMachines = 12500000; // Depresiasi mesin bulanan
  const totalOverhead = powerElectricity + bladeMaintenance + packagingSupplies + depreciationMachines;

  const totalCOGS = directMaterialsCost + directLaborCost + totalOverhead;
  const grossProfit = totalRevenue - totalCOGS;
  const grossMarginPercent = totalRevenue > 0 ? Number(((grossProfit / totalRevenue) * 100).toFixed(2)) : 0;

  // 3. OPERATING EXPENSES (OPEX)
  const deliveryAndLogistics = shipments.length * 3750000; // BBM, supir, tol ekspedisi
  const administrativeSalaries = hrisPayroll.administrativeTotal + hrisPayroll.indirectLaborTotal;
  const officeAndGeneralSupplies = 8200000;
  const totalOpex = deliveryAndLogistics + administrativeSalaries + officeAndGeneralSupplies;

  const operatingIncome = grossProfit - totalOpex;
  const taxExpense = operatingIncome > 0 ? Math.round(operatingIncome * 0.22) : 0; // PPh Badan 22%
  const netIncome = operatingIncome - taxExpense;
  const netMarginPercent = totalRevenue > 0 ? Number(((netIncome / totalRevenue) * 100).toFixed(2)) : 0;

  const pnl: ProfitAndLossStatement = {
    period: 'November 2026 (MTD)',
    revenue: {
      cloveCleanSales,
      dustByproductSales,
      stemByproductSales,
      totalRevenue,
    },
    cogs: {
      rawMaterialBeginning: 1850000000,
      rawMaterialPurchases: directMaterialsCost * 1.2,
      rawMaterialEnding: 1650000000,
      directMaterialsCost,
      directLaborCost,
      factoryOverhead: {
        powerElectricity,
        bladeMaintenance,
        packagingSupplies,
        depreciationMachines,
        totalOverhead,
      },
      totalCOGS,
    },
    grossProfit,
    grossMarginPercent,
    operatingExpenses: {
      deliveryAndLogistics,
      administrativeSalaries,
      officeAndGeneralSupplies,
      totalOpex,
    },
    operatingIncome,
    taxExpense,
    netIncome,
    netMarginPercent,
  };

  // 4. BALANCE SHEET
  const rawStock = inventory.find((i) => i.category === 'RAW_MATERIAL')?.currentStockKg || 25000;
  const fgStock = inventory.find((i) => i.category === 'FINISHED_GOODS')?.currentStockKg || 10000;
  const dustStock = inventory.find((i) => i.category === 'BYPRODUCT_DUST')?.currentStockKg || 2500;

  const rawMaterialInventory = rawStock * rawMaterialPricePerKg;
  const finishedGoodsInventory = fgStock * 118000; // Dinilai berdasarkan biaya HPP
  const byproductInventory = dustStock * 24000;

  const cashAndBank = 1250000000 + netIncome * 0.45;
  const accountsReceivable = totalRevenue * 0.35; // 35% penjualan tempo 30 hari
  const totalCurrentAssets =
    cashAndBank + accountsReceivable + rawMaterialInventory + finishedGoodsInventory + byproductInventory;

  const shreddingMachinery = 650000000; // Nilai perolehan 4 mesin rajang & siklon
  const transportVehicles = 420000000; // Truk box ekspedisi
  const accumulatedDepreciation = 145000000;
  const netFixedAssets = shreddingMachinery + transportVehicles - accumulatedDepreciation;
  const totalAssets = totalCurrentAssets + netFixedAssets;

  const accountsPayableSuppliers = directMaterialsCost * 0.4; // Hutang ke petani cengkeh tempo
  const accruedPayrollHRIS = hrisPayroll.totalPayrollExpense * 0.5; // Akrual gaji berjalan
  const taxPayable = taxExpense;
  const totalCurrentLiabilities = accountsPayableSuppliers + accruedPayrollHRIS + taxPayable;
  const totalLiabilities = totalCurrentLiabilities;

  const shareCapital = 3500000000;
  const retainedEarnings = totalAssets - totalLiabilities - shareCapital - netIncome;
  const totalEquity = shareCapital + retainedEarnings + netIncome;

  const balanceSheet: BalanceSheetStatement = {
    asOfDate: '18 November 2026',
    assets: {
      currentAssets: {
        cashAndBank,
        accountsReceivable,
        rawMaterialInventory,
        finishedGoodsInventory,
        byproductInventory,
        totalCurrentAssets,
      },
      fixedAssets: {
        shreddingMachinery,
        transportVehicles,
        accumulatedDepreciation,
        netFixedAssets,
      },
      totalAssets,
    },
    liabilities: {
      currentLiabilities: {
        accountsPayableSuppliers,
        accruedPayrollHRIS,
        taxPayable,
        totalCurrentLiabilities,
      },
      totalLiabilities,
    },
    equity: {
      shareCapital,
      retainedEarnings,
      currentPeriodEarnings: netIncome,
      totalEquity,
    },
    isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 1,
  };

  // 5. AUTOMATED DOUBLE-ENTRY JOURNAL ENTRIES
  const journalEntries: JournalEntry[] = [
    {
      id: 'JRN-2026-11-001',
      date: '2026-11-18 08:30',
      referenceNumber: 'BATCH-PROD-MS01',
      description: 'Pengakuan Biaya Pemakaian Bahan Baku Cengkeh Kering Batch 1 & 2',
      sourceModule: 'OPERASIONAL_PERAJANGAN',
      items: [
        { accountCode: '5101', accountName: 'Beban Pokok: Pemakaian Bahan Baku Cengkeh', debit: directMaterialsCost, credit: 0 },
        { accountCode: '1201', accountName: 'Persediaan Bahan Baku Bunga Cengkeh', debit: 0, credit: directMaterialsCost },
      ],
    },
    {
      id: 'JRN-2026-11-002',
      date: '2026-11-18 10:00',
      referenceNumber: 'HRIS-PAYROLL-NOV',
      description: 'Pembebanan Biaya Gaji Tenaga Kerja Langsung Operator & Manajemen Pabrik (Sinkronisasi HRIS)',
      sourceModule: 'HRIS_PAYROLL',
      items: [
        { accountCode: '5102', accountName: 'Beban Pokok: Upah Tenaga Kerja Langsung (HRIS)', debit: directLaborCost, credit: 0 },
        { accountCode: '6102', accountName: 'Beban Gaji Manajemen & Administrasi (HRIS)', debit: administrativeSalaries, credit: 0 },
        { accountCode: '2102', accountName: 'Hutang Gaji & Lembur Karyawan (HRIS)', debit: 0, credit: directLaborCost + administrativeSalaries },
      ],
    },
    {
      id: 'JRN-2026-11-003',
      date: '2026-11-18 11:30',
      referenceNumber: 'DO-2026-11-094',
      description: 'Pengiriman Cengkeh Rajang Super ke PT Gudang Garam Tbk & Penerbitan Tagihan Piutang',
      sourceModule: 'LOGISTIK_PENGIRIMAN',
      items: [
        { accountCode: '1100', accountName: 'Piutang Usaha Klien Rokok Kretek', debit: cloveCleanSales * 0.6, credit: 0 },
        { accountCode: '4101', accountName: 'Pendapatan Penjualan Cengkeh Rajang Prima', debit: 0, credit: cloveCleanSales * 0.6 },
      ],
    },
    {
      id: 'JRN-2026-11-004',
      date: '2026-11-18 12:45',
      referenceNumber: 'BYP-SALE-088',
      description: 'Penerimaan Kas dari Penjualan Debu Siklon ke Industri Dupa Aromaterapi',
      sourceModule: 'GUDANG_INVENTORI',
      items: [
        { accountCode: '1001', accountName: 'Kas & Rekening Operasional Bank', debit: dustByproductSales, credit: 0 },
        { accountCode: '4102', accountName: 'Pendapatan Penjualan Debu Siklon (Dupa)', debit: 0, credit: dustByproductSales },
      ],
    },
  ];

  const unitCostPerKg = totalProcessedKg > 0 ? Math.round(totalCOGS / totalProcessedKg) : 118000;
  const averageSellingPricePerKg = totalProcessedKg > 0 ? Math.round(cloveCleanSales / totalProcessedKg) : 142000;

  return {
    pnl,
    balanceSheet,
    journalEntries,
    unitCostPerKg,
    averageSellingPricePerKg,
  };
}
