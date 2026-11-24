'use client';

import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import TabNavigation, { TabKey } from '../components/TabNavigation';
import DashboardOverview from '../components/DashboardOverview';
import OrdersModule from '../components/OrdersModule';
import ProductionQCModule from '../components/ProductionQCModule';
import MachinesCapacityModule from '../components/MachinesCapacityModule';
import InventoryModule from '../components/InventoryModule';
import ShipmentModule from '../components/ShipmentModule';
import DeepDiveAnalytics from '../components/DeepDiveAnalytics';
import FinancialModule from '../components/FinancialModule';
import ProcurementModule from '../components/ProcurementModule';
import SparepartModule from '../components/SparepartModule';
import PricingModal from '../components/PricingModal';
import Modals from '../components/Modals';

import {
  DEFAULT_PRICING_CONFIG,
  INITIAL_BATCHES,
  INITIAL_INVENTORY,
  INITIAL_MACHINES,
  INITIAL_MUTATIONS,
  INITIAL_ORDERS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_SHIPMENTS,
} from '../lib/initial-data';
import {
  INITIAL_MAINTENANCE_HISTORY,
  INITIAL_PART_LIFESPAN_TRACKERS,
  INITIAL_REQUISITIONS,
  INITIAL_SPAREPART_MUTATIONS,
  INITIAL_SPAREPARTS,
  STANDARDIZED_MACHINES,
} from '../lib/sparepart-data';
import { INITIAL_HRIS_PAYROLL_DATA } from '../lib/hris-integration';
import { HRISPayrollAllocation, PricingConfig, PurchaseOrder, PurchaseStatus } from '../lib/financial-types';
import {
  MachineCodeDef,
  MaintenanceHistory,
  PartLifespanTracker,
  RequisitionStatus,
  SparePart,
  SparePartRequisition,
  SparePartStockMutation,
} from '../lib/sparepart-types';
import { BatchQC, InventoryItem, Machine, MachineStatus, Order, Shipment, ShipmentStatus, StockMutation } from '../lib/types';
import { evaluateOrderDelay } from '../lib/calculations';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');

  // Application State
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [machines, setMachines] = useState<Machine[]>(INITIAL_MACHINES);
  const [batches, setBatches] = useState<BatchQC[]>(INITIAL_BATCHES);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [mutations, setMutations] = useState<StockMutation[]>(INITIAL_MUTATIONS);
  const [shipments, setShipments] = useState<Shipment[]>(INITIAL_SHIPMENTS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING_CONFIG);
  const [hrisPayroll, setHrisPayroll] = useState<HRISPayrollAllocation>(INITIAL_HRIS_PAYROLL_DATA);

  // Sparepart & Machine Maintenance State
  const [machinesList, setMachinesList] = useState<MachineCodeDef[]>(STANDARDIZED_MACHINES);
  const [spareParts, setSpareParts] = useState<SparePart[]>(INITIAL_SPAREPARTS);
  const [lifespanTrackers, setLifespanTrackers] = useState<PartLifespanTracker[]>(INITIAL_PART_LIFESPAN_TRACKERS);
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceHistory[]>(INITIAL_MAINTENANCE_HISTORY);
  const [requisitions, setRequisitions] = useState<SparePartRequisition[]>(INITIAL_REQUISITIONS);
  const [sparePartMutations, setSparePartMutations] = useState<SparePartStockMutation[]>(INITIAL_SPAREPART_MUTATIONS);

  // Modal State
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [selectedOrderForBatch, setSelectedOrderForBatch] = useState<Order | null>(null);

  // Calculations for navigation badges
  const activeOrders = orders.filter((o) => o.status !== 'Selesai');
  const delayedOrders = activeOrders.filter((order) => {
    const machine = machines.find((m) => m.id === order.machineId);
    return evaluateOrderDelay(order, machine).isDelayed;
  });

  const totalCapacity = machines
    .filter((m) => m.status === 'Running')
    .reduce((sum, m) => sum + m.capacityKgPerHour, 0);

  const criticalPartsCount = lifespanTrackers.filter(
    (t) => t.wearCondition === 'OVERDUE_REPLACE' || t.wearCondition === 'WARNING'
  ).length;

  // Handlers
  const handleAddOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setMachines((prev) =>
      prev.map((m) =>
        m.id === newOrder.machineId
          ? { ...m, assignedOrderIds: [...m.assignedOrderIds, newOrder.id] }
          : m
      )
    );
  };

  const handleAddMachine = (newMachine: Machine) => {
    setMachines((prev) => [...prev, newMachine]);
  };

  const handleUpdateMachineCapacity = (machineId: string, newCapacity: number) => {
    setMachines((prev) =>
      prev.map((m) => (m.id === machineId ? { ...m, capacityKgPerHour: newCapacity } : m))
    );
  };

  const handleUpdateMachineStatus = (machineId: string, newStatus: MachineStatus) => {
    setMachines((prev) =>
      prev.map((m) => (m.id === machineId ? { ...m, status: newStatus } : m))
    );
  };

  const handleAddBatch = (newBatch: BatchQC) => {
    setBatches((prev) => [newBatch, ...prev]);

    // Update corresponding order processedKg
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === newBatch.orderId) {
          const newProcessed = o.processedKg + newBatch.cleanCutKg;
          const isDone = newProcessed >= o.quantityKg;
          return {
            ...o,
            processedKg: newProcessed,
            status: isDone ? 'Selesai' : o.status,
          };
        }
        return o;
      })
    );

    // Update Inventory: Add Finished Goods & Byproduct Dust, deduct raw material
    setInventory((prev) =>
      prev.map((item) => {
        if (item.category === 'RAW_MATERIAL') {
          return { ...item, currentStockKg: Math.max(0, item.currentStockKg - newBatch.rawInputKg) };
        }
        if (item.category === 'FINISHED_GOODS' && item.sku.includes('06MM')) {
          return { ...item, currentStockKg: item.currentStockKg + newBatch.cleanCutKg };
        }
        if (item.category === 'BYPRODUCT_DUST') {
          return { ...item, currentStockKg: item.currentStockKg + newBatch.dustKg };
        }
        if (item.category === 'STEMS') {
          return { ...item, currentStockKg: item.currentStockKg + newBatch.stemKg };
        }
        return item;
      })
    );

    // Record automatic stock mutation
    const newMut: StockMutation = {
      id: `MUT-${Date.now().toString().slice(-5)}`,
      date: newBatch.date,
      type: 'IN',
      itemId: 'INV-FG-01',
      itemName: `Cengkeh Rajang Hasil Batch ${newBatch.id}`,
      category: 'FINISHED_GOODS',
      quantityKg: newBatch.cleanCutKg,
      refDocument: `QC-PASS-${newBatch.id}`,
      partner: `Lantai Produksi (${newBatch.machineId})`,
      operator: newBatch.operator,
    };
    setMutations((prev) => [newMut, ...prev]);
  };

  const handleAddMutation = (newMut: StockMutation) => {
    setMutations((prev) => [newMut, ...prev]);
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === newMut.itemId) {
          const delta = newMut.type === 'IN' ? newMut.quantityKg : -newMut.quantityKg;
          return {
            ...item,
            currentStockKg: Math.max(0, item.currentStockKg + delta),
          };
        }
        return item;
      })
    );
  };

  const handleAddShipment = (newShipment: Shipment) => {
    setShipments((prev) => [newShipment, ...prev]);

    // Deduct from Finished Goods Inventory
    setInventory((prev) =>
      prev.map((item) => {
        if (item.category === 'FINISHED_GOODS') {
          return {
            ...item,
            currentStockKg: Math.max(0, item.currentStockKg - newShipment.quantityKg),
          };
        }
        return item;
      })
    );

    // Add mutation OUT log
    const mutOut: StockMutation = {
      id: `MUT-${Date.now().toString().slice(-5)}`,
      date: new Date().toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      type: 'OUT',
      itemId: 'INV-FG-01',
      itemName: newShipment.goodsDescription,
      category: 'FINISHED_GOODS',
      quantityKg: newShipment.quantityKg,
      refDocument: newShipment.doNumber,
      partner: newShipment.clientName,
      operator: `Ekspedisi (${newShipment.driverName})`,
    };
    setMutations((prev) => [mutOut, ...prev]);
  };

  // Procurement Handlers
  const handleAddPO = (newPO: PurchaseOrder) => {
    setPurchaseOrders((prev) => [newPO, ...prev]);
  };

  const handleUpdatePOStatus = (poId: string, newStatus: PurchaseStatus) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === poId ? { ...po, status: newStatus } : po))
    );
  };

  const handleReceiveGoods = (po: PurchaseOrder) => {
    // 1. Mark PO as received
    setPurchaseOrders((prev) =>
      prev.map((item) =>
        item.id === po.id
          ? { ...item, status: 'Diterima Penuh (Selesai)', receivedKg: item.quantityKg }
          : item
      )
    );

    // 2. Add raw material into inventory
    setInventory((prev) =>
      prev.map((inv) =>
        inv.category === 'RAW_MATERIAL' && inv.sku.includes('ZNZ')
          ? { ...inv, currentStockKg: inv.currentStockKg + po.quantityKg }
          : inv
      )
    );

    // 3. Log stock mutation IN
    const mutIn: StockMutation = {
      id: `MUT-${Date.now().toString().slice(-5)}`,
      date: new Date().toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      type: 'IN',
      itemId: 'INV-RAW-01',
      itemName: po.commodityType,
      category: 'RAW_MATERIAL',
      quantityKg: po.quantityKg,
      refDocument: po.poNumber,
      partner: po.supplierName,
      operator: 'Gudang Logistik (Penerimaan PO)',
    };
    setMutations((prev) => [mutIn, ...prev]);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: any) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const handleUpdateShipmentStatus = (shipmentId: string, newStatus: ShipmentStatus) => {
    setShipments((prev) =>
      prev.map((s) => (s.id === shipmentId ? { ...s, status: newStatus } : s))
    );
  };

  const handleSyncHRIS = () => {
    const rushOrders = orders.filter((o) => o.priority === 'Tinggi (Rush)' || o.priority === 'Ekspor Prioritas');
    const overtimeHoursCalculated = 20 + rushOrders.length * 8;
    const additionalOvertimeCost = overtimeHoursCalculated * 65000;

    setHrisPayroll((prev) => ({
      ...prev,
      overtimeDirectLabor: 3910000 + additionalOvertimeCost,
      totalPayrollExpense:
        prev.directLaborTotal +
        3910000 +
        additionalOvertimeCost +
        prev.indirectLaborTotal +
        prev.administrativeTotal +
        prev.bpjsCompanyTotal,
      syncTimestamp:
        new Date().toLocaleString('id-ID', {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }) + ' WIB',
    }));
  };

  const handleAddSparepartReq = (newReq: SparePartRequisition) => {
    setRequisitions((prev) => [newReq, ...prev]);
  };

  const handleUpdateRequisitionStatus = (reqId: string, newStatus: RequisitionStatus) => {
    setRequisitions((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: newStatus } : r))
    );
  };

  const handleApproveAndInstallPart = (req: SparePartRequisition) => {
    // 1. Potong stok sparepart dari gudang
    setSpareParts((prev) =>
      prev.map((p) =>
        p.partCode === req.partCode
          ? { ...p, stockQty: Math.max(0, p.stockQty - req.quantity) }
          : p
      )
    );

    // 2. Perbarui status tiket permintaan menjadi terpasang
    setRequisitions((prev) =>
      prev.map((r) =>
        r.id === req.id
          ? {
              ...r,
              status: 'Terpasang di Mesin',
              installedDate: new Date().toISOString().split('T')[0],
            }
          : r
      )
    );

    // 3. Reset tracker keausan & jam kerja part pada mesin target
    setLifespanTrackers((prev) =>
      prev.map((t) => {
        if (t.machineCode === req.machineCode && t.partCode === req.partCode) {
          return {
            ...t,
            currentRunningHours: 0,
            currentThroughputTons: 0,
            healthPercent: 100,
            wearCondition: 'PRIMA',
            recommendedAction: 'Komponen baru telah dipasang dan beroperasi optimal.',
          };
        }
        return t;
      })
    );

    // 4. Catat histori perawatan mesin secara otomatis
    const newLog: MaintenanceHistory = {
      id: `mnt-${Date.now()}`,
      logNumber: `MNT-2026-${Math.floor(Math.random() * 900) + 100}`,
      machineCode: req.machineCode,
      machineName: req.machineName,
      type: req.urgency === 'URGENT_BREAKDOWN' ? 'BREAKDOWN_REPAIR' : 'PREVENTIVE',
      date: new Date().toISOString().split('T')[0],
      downtimeHours: req.urgency === 'URGENT_BREAKDOWN' ? 2.5 : 1.0,
      issueDescription: `Penggantian sparepart: ${req.reason}`,
      actionTaken: `Pemasangan ${req.quantity} unit ${req.partName} (${req.partCode}) pada mesin ${req.machineCode}`,
      technician: req.requestedBy,
      replacedPartCode: req.partCode,
      replacedPartName: req.partName,
      replacedPartQty: req.quantity,
      totalCost: req.estimatedCost,
      status: 'Selesai',
    };
    setMaintenanceHistory((prev) => [newLog, ...prev]);

    // 5. Catat Mutasi Stock Out Gudang Sparepart (Link ke Permintaan & Mesin)
    const targetPart = spareParts.find((p) => p.partCode === req.partCode);
    const unitCost = targetPart?.unitCost || (req.quantity > 0 ? req.estimatedCost / req.quantity : 0);
    const newStockOut: SparePartStockMutation = {
      id: `spmut-${Date.now()}`,
      mutationNumber: `TRX-SP-${Math.floor(Math.random() * 9000) + 1000}`,
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      type: 'OUT_MAINTENANCE',
      partCode: req.partCode,
      partName: req.partName,
      quantity: req.quantity,
      unit: targetPart?.unit || 'Pcs',
      unitCost: unitCost,
      totalAmount: req.quantity * unitCost,
      targetMachineCode: req.machineCode,
      targetMachineName: req.machineName,
      requisitionId: req.id,
      requisitionNumber: req.reqNumber,
      maintenanceLogNumber: newLog.logNumber,
      technician: req.requestedBy,
      notes: `Pengeluaran part untuk pemasangan mesin ${req.machineCode}: ${req.reason}`,
      performedBy: 'Gudang Maintenance',
    };
    setSparePartMutations((prev) => [newStockOut, ...prev]);

    // 6. Kembalikan status mesin menjadi 'Running' jika sebelumnya dalam perbaikan/asah pisau
    setMachines((prev) =>
      prev.map((m) => {
        const isTarget =
          m.id === req.machineCode ||
          m.name.toLowerCase().includes(req.machineName.toLowerCase()) ||
          req.machineName.toLowerCase().includes(m.name.toLowerCase()) ||
          (req.machineCode === 'MCH-ROT-01' && m.id === 'MS-01') ||
          (req.machineCode === 'MCH-GUI-02' && m.id === 'MS-02') ||
          (req.machineCode === 'MCH-SLI-03' && m.id === 'MS-03') ||
          (req.machineCode === 'MCH-DRM-04' && m.id === 'MS-04');
        if (isTarget) {
          return { ...m, status: 'Running' };
        }
        return m;
      })
    );
  };

  const handleAddSparepartStockIn = (data: {
    partCode: string;
    quantity: number;
    newUnitCost: number;
    poNumber: string;
    supplierName: string;
    invoiceNumber: string;
    notes: string;
    performedBy: string;
  }) => {
    // 1. Tambah stok gudang sparepart & update harga beli terbaru sebagai dasar HPP
    setSpareParts((prev) =>
      prev.map((p) => {
        if (p.partCode === data.partCode) {
          return {
            ...p,
            stockQty: p.stockQty + data.quantity,
            unitCost: data.newUnitCost,
            supplier: data.supplierName || p.supplier,
          };
        }
        return p;
      })
    );

    const part = spareParts.find((p) => p.partCode === data.partCode);

    // 2. Catat Mutasi Stock In (Pembelian Baru)
    const inMutation: SparePartStockMutation = {
      id: `spmut-${Date.now()}`,
      mutationNumber: `TRX-SP-${Math.floor(Math.random() * 9000) + 1000}`,
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      type: 'IN_PURCHASE',
      partCode: data.partCode,
      partName: part?.partName || 'Sparepart',
      quantity: data.quantity,
      unit: part?.unit || 'Pcs',
      unitCost: data.newUnitCost,
      totalAmount: data.quantity * data.newUnitCost,
      purchasePoNumber: data.poNumber,
      supplierName: data.supplierName,
      invoiceNumber: data.invoiceNumber,
      notes: data.notes || 'Penerimaan pembelian suku cadang restock',
      performedBy: data.performedBy || 'Gudang Maintenance',
    };
    setSparePartMutations((prev) => [inMutation, ...prev]);
  };

  const handleResetData = () => {
    if (confirm('Muat ulang seluruh data simulasi ke setelan awal?')) {
      setOrders(INITIAL_ORDERS);
      setMachines(INITIAL_MACHINES);
      setBatches(INITIAL_BATCHES);
      setInventory(INITIAL_INVENTORY);
      setMutations(INITIAL_MUTATIONS);
      setShipments(INITIAL_SHIPMENTS);
      setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
      setPricing(DEFAULT_PRICING_CONFIG);
      setHrisPayroll(INITIAL_HRIS_PAYROLL_DATA);
      setMachinesList(STANDARDIZED_MACHINES);
      setSpareParts(INITIAL_SPAREPARTS);
      setLifespanTrackers(INITIAL_PART_LIFESPAN_TRACKERS);
      setMaintenanceHistory(INITIAL_MAINTENANCE_HISTORY);
      setRequisitions(INITIAL_REQUISITIONS);
      setSparePartMutations(INITIAL_SPAREPART_MUTATIONS);
    }
  };

  const handleOpenAddBatchForOrder = (order: Order) => {
    setSelectedOrderForBatch(order);
    setActiveModal('add-batch');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Header */}
      <Navbar
        totalCapacity={totalCapacity}
        activeOrdersCount={activeOrders.length}
        onOpenModal={(modal) => {
          setSelectedOrderForBatch(null);
          setActiveModal(modal);
        }}
        onOpenPricingModal={() => setIsPricingModalOpen(true)}
        onResetData={handleResetData}
      />

      {/* Tabs Navigation */}
      <TabNavigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        orderCount={orders.length}
        delayCount={delayedOrders.length}
        batchCount={batches.length}
        machineCount={machines.length}
        poCount={purchaseOrders.length}
        criticalPartsCount={criticalPartsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            orders={orders}
            machines={machines}
            batches={batches}
            shipments={shipments}
            onSelectTab={setActiveTab}
            onOpenModal={setActiveModal}
          />
        )}

        {activeTab === 'procurement' && (
          <ProcurementModule
            purchaseOrders={purchaseOrders}
            customerOrders={orders}
            inventory={inventory}
            onOpenAddPO={() => setActiveModal('add-po')}
            onUpdatePOStatus={handleUpdatePOStatus}
            onReceiveGoods={handleReceiveGoods}
          />
        )}

        {activeTab === 'finance' && (
          <FinancialModule
            orders={orders}
            batches={batches}
            inventory={inventory}
            shipments={shipments}
            hrisPayroll={hrisPayroll}
            pricing={pricing}
            purchaseOrders={purchaseOrders}
            spareParts={spareParts}
            sparePartMutations={sparePartMutations}
            machines={machines}
            onSyncHRIS={handleSyncHRIS}
            onOpenPricingModal={() => setIsPricingModalOpen(true)}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersModule
            orders={orders}
            machines={machines}
            onOpenAddOrder={() => setActiveModal('add-order')}
            onOpenAddBatchForOrder={handleOpenAddBatchForOrder}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}

        {activeTab === 'production' && (
          <ProductionQCModule
            batches={batches}
            onOpenAddBatch={() => {
              setSelectedOrderForBatch(null);
              setActiveModal('add-batch');
            }}
          />
        )}

        {activeTab === 'machines' && (
          <MachinesCapacityModule
            machines={machines}
            orders={orders}
            onUpdateMachineCapacity={handleUpdateMachineCapacity}
            onUpdateMachineStatus={handleUpdateMachineStatus}
            onOpenAddMachine={() => setActiveModal('add-machine')}
          />
        )}

        {activeTab === 'spareparts' && (
          <SparepartModule
            spareParts={spareParts}
            machines={machinesList}
            lifespanTrackers={lifespanTrackers}
            maintenanceHistory={maintenanceHistory}
            requisitions={requisitions}
            mutations={sparePartMutations}
            onOpenAddRequisition={() => setActiveModal('add-sparepart-req')}
            onOpenAddStockIn={() => setActiveModal('add-sparepart-stockin')}
            onApproveAndInstallPart={handleApproveAndInstallPart}
            onUpdateRequisitionStatus={handleUpdateRequisitionStatus}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryModule
            inventory={inventory}
            mutations={mutations}
            onOpenAddMutation={() => setActiveModal('add-mutation')}
          />
        )}

        {activeTab === 'shipments' && (
          <ShipmentModule
            shipments={shipments}
            onOpenAddShipment={() => setActiveModal('add-shipment')}
            onUpdateShipmentStatus={handleUpdateShipmentStatus}
          />
        )}

        {activeTab === 'analytics' && (
          <DeepDiveAnalytics batches={batches} machines={machines} orders={orders} />
        )}
      </main>

      {/* Global Modals */}
      <Modals
        activeModal={activeModal}
        onClose={() => {
          setActiveModal(null);
          setSelectedOrderForBatch(null);
        }}
        machines={machines}
        orders={orders}
        inventory={inventory}
        onAddOrder={handleAddOrder}
        onAddMachine={handleAddMachine}
        onAddBatch={handleAddBatch}
        onAddMutation={handleAddMutation}
        onAddShipment={handleAddShipment}
        onAddPO={handleAddPO}
        selectedOrderForBatch={selectedOrderForBatch}
        spareParts={spareParts}
        machineCodeDefs={machinesList}
        onAddSparepartReq={handleAddSparepartReq}
        onAddSparepartStockIn={handleAddSparepartStockIn}
      />

      {/* Dynamic Pricing Configuration Modal */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        pricing={pricing}
        onSavePricing={setPricing}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <p>
          CloveERP &middot; Sistem Terpadu Perajangan Cengkeh, Pengadaan Bahan Baku (MRP), HRIS Payroll &amp; Keuangan &middot; Siap Deploy di Vercel
        </p>
      </footer>
    </div>
  );
}
