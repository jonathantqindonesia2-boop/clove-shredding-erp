import { BatchQC, Machine, Order, QCStatus } from './types';

export interface YieldMetrics {
  rendemenPercent: number;
  dustPercent: number;
  stemPercent: number;
  lossPercent: number;
  qcStatus: QCStatus;
}

export function calculateYieldMetrics(
  rawKg: number,
  cleanKg: number,
  dustKg: number,
  stemKg: number,
  moisturePercent: number
): YieldMetrics {
  if (rawKg <= 0) {
    return {
      rendemenPercent: 0,
      dustPercent: 0,
      stemPercent: 0,
      lossPercent: 0,
      qcStatus: 'Ditolak',
    };
  }

  const rendemen = Number(((cleanKg / rawKg) * 100).toFixed(2));
  const dust = Number(((dustKg / rawKg) * 100).toFixed(2));
  const stem = Number(((stemKg / rawKg) * 100).toFixed(2));
  const loss = Number(Math.max(0, 100 - (rendemen + dust + stem)).toFixed(2));

  let qcStatus: QCStatus = 'Lolos Prima';

  if (moisturePercent < 10.5 || moisturePercent > 13.8) {
    qcStatus = 'Koreksi Kelembaban';
  } else if (rendemen >= 88.0 && dust <= 6.5) {
    qcStatus = 'Lolos Prima';
  } else if (rendemen >= 84.0 && dust <= 8.5) {
    qcStatus = 'Toleransi';
  } else {
    qcStatus = 'Ditolak';
  }

  return {
    rendemenPercent: rendemen,
    dustPercent: dust,
    stemPercent: stem,
    lossPercent: loss,
    qcStatus,
  };
}

export interface DelayEvaluation {
  remainingKg: number;
  hoursNeeded: number;
  projectedCompletion: string;
  isDelayed: boolean;
  varianceHours: number; // Positif = Ahead of time, Negatif = Delay
  varianceDisplay: string;
  recommendation: string;
}

export function evaluateOrderDelay(
  order: Order,
  machine?: Machine,
  referenceDate: Date = new Date()
): DelayEvaluation {
  const remainingKg = Math.max(0, order.quantityKg - order.processedKg);
  
  if (remainingKg === 0) {
    return {
      remainingKg: 0,
      hoursNeeded: 0,
      projectedCompletion: 'Sudah Selesai',
      isDelayed: false,
      varianceHours: 0,
      varianceDisplay: 'Selesai 100%',
      recommendation: 'Order telah selesai diproduksi. Siap masuk proses packaging dan QC final.',
    };
  }

  const capacity = machine ? machine.capacityKgPerHour : 250;
  const efficiency = machine ? machine.efficiencyPercent / 100 : 0.9;
  const effectiveCapacity = Math.max(10, capacity * efficiency);

  const hoursNeeded = Number((remainingKg / effectiveCapacity).toFixed(1));
  
  const projectedTimeMs = referenceDate.getTime() + hoursNeeded * 60 * 60 * 1000;
  const projectedDate = new Date(projectedTimeMs);

  const deadlineDate = new Date(order.deadline);
  const diffHours = Number(((deadlineDate.getTime() - projectedDate.getTime()) / (1000 * 60 * 60)).toFixed(1));

  const isDelayed = diffHours < 0;
  const varianceHours = diffHours;

  let varianceDisplay = '';
  let recommendation = '';

  if (isDelayed) {
    const absDiff = Math.abs(diffHours);
    varianceDisplay = `Terlambat ${absDiff} Jam`;
    if (absDiff > 12) {
      recommendation = `KRITIS: Potensi keterlambatan ${absDiff} jam! Tambahkan mesin tambahan ke antrian atau alokasikan shift lembur 24 jam.`;
    } else {
      recommendation = `PERINGATAN: Estimasi mundur ${absDiff} jam dari deadline. Tingkatkan kapasitas mesin menjadi minimal ${Math.ceil(remainingKg / Math.max(1, (deadlineDate.getTime() - referenceDate.getTime()) / 3600000))} kg/jam.`;
    }
  } else {
    varianceDisplay = `Tepat Waktu (+${diffHours} Jam Surplus)`;
    recommendation = `Jadwal aman dengan buffer waktu ${diffHours} jam sebelum deadline.`;
  }

  return {
    remainingKg,
    hoursNeeded,
    projectedCompletion: projectedDate.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }),
    isDelayed,
    varianceHours,
    varianceDisplay,
    recommendation,
  };
}
