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
import Modals from '../components/Modals';

import {
  INITIAL_BATCHES,
  INITIAL_INVENTORY,
  INITIAL_MACHINES,
  INITIAL_MUTATIONS,
  INITIAL_ORDERS,
  INITIAL_SHIPMENTS,
} from '../lib/initial-data';
import { INITIAL_HRIS_PAYROLL_DATA } from '../lib/hris-integration';
import { HRISPayrollAllocation } from '../lib/financial-types';
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
  const [hrisPayroll, setHrisPayroll] = useState<HRISPayrollAllocation>(INITIAL_HRIS_PAYROLL_DATA);

  // Modal State
  const [activeModal, setActiveModal] = useState<string | null>(null);
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

    // Update Inventory: Add Finished Goods & Byproduct Dust
    setInventory((prev) =>
      prev.map((item) => {
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
    // Dynamically calculate latest overtime from order workload
    const rushOrders = orders.filter((o) => o.priority === 'Tinggi (Rush)' || o.priority === 'Ekspor Prioritas');
    const overtimeHoursCalculated = 20 + rushOrders.length * 8;
    const additionalOvertimeCost = overtimeHoursCalculated * 65000;

    setHrisPayroll((prev) => ({
      ...prev,
      overtimeDirectLabor: 3910000 + additionalOvertimeCost,
      totalPayrollExpense: prev.directLaborTotal + 3910000 + additionalOvertimeCost + prev.indirectLaborTotal + prev.administrativeTotal + prev.bpjsCompanyTotal,
      syncTimestamp: new Date().toLocaleString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB',
    }));
  };

  const handleResetData = () => {
    if (confirm('Muat ulang seluruh data simulasi ke setelan awal?')) {
      setOrders(INITIAL_ORDERS);
      setMachines(INITIAL_MACHINES);
      setBatches(INITIAL_BATCHES);
      setInventory(INITIAL_INVENTORY);
      setMutations(INITIAL_MUTATIONS);
      setShipments(INITIAL_SHIPMENTS);
      setHrisPayroll(INITIAL_HRIS_PAYROLL_DATA);
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

        {activeTab === 'finance' && (
          <FinancialModule
            orders={orders}
            batches={batches}
            inventory={inventory}
            shipments={shipments}
            hrisPayroll={hrisPayroll}
            onSyncHRIS={handleSyncHRIS}
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
        selectedOrderForBatch={selectedOrderForBatch}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <p>
          CloveERP &middot; Sistem Terpadu Perajangan Cengkeh, HRIS Payroll &amp; Laporan Keuangan Akuntansi &middot; Siap Deploy di Vercel
        </p>
      </footer>
    </div>
  );
}
