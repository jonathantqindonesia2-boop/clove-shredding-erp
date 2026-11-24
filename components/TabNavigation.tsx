'use client';

import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Sparkles,
  Gauge,
  Boxes,
  Truck,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Wrench,
  ShieldCheck,
  Orbit,
} from 'lucide-react';

export type TabKey =
  | 'dashboard'
  | 'procurement'
  | 'finance'
  | 'orders'
  | 'production'
  | 'machines'
  | 'spareparts'
  | 'inventory'
  | 'shipments'
  | 'analytics'
  | 'ims'
  | 'users';

interface TabNavigationProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  orderCount: number;
  delayCount: number;
  batchCount: number;
  machineCount: number;
  poCount: number;
  criticalPartsCount?: number;
  allowedModules?: TabKey[];
}

export default function TabNavigation({
  activeTab,
  onSelectTab,
  orderCount,
  delayCount,
  batchCount,
  machineCount,
  poCount,
  criticalPartsCount = 0,
  allowedModules,
}: TabNavigationProps) {
  const allTabs = [
    {
      id: 'dashboard' as TabKey,
      label: 'Dashboard Eksekutif',
      icon: LayoutDashboard,
      badge: delayCount > 0 ? `${delayCount} Delay` : null,
      badgeColor: 'bg-rose-100 text-rose-700',
    },
    {
      id: 'procurement' as TabKey,
      label: 'Pengadaan & Pembelian (MRP)',
      icon: ShoppingCart,
      badge: `${poCount} PO`,
      badgeColor: 'bg-teal-100 text-teal-800 font-bold',
    },
    {
      id: 'finance' as TabKey,
      label: 'Laporan Keuangan & HPP',
      icon: DollarSign,
      badge: 'HRIS Synced',
      badgeColor: 'bg-emerald-100 text-emerald-800 font-bold',
    },
    {
      id: 'orders' as TabKey,
      label: 'Order & Antrian',
      icon: ClipboardList,
      badge: `${orderCount}`,
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'production' as TabKey,
      label: 'Pengerjaan & QC Mutu',
      icon: Sparkles,
      badge: `${batchCount} Batch`,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'machines' as TabKey,
      label: 'Mesin & Evaluasi Keterlambatan',
      icon: Gauge,
      badge: delayCount > 0 ? `Alert` : `${machineCount} Unit`,
      badgeColor: delayCount > 0 ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-slate-100 text-slate-700',
    },
    {
      id: 'spareparts' as TabKey,
      label: 'Sparepart & Maintenance',
      icon: Wrench,
      badge: criticalPartsCount > 0 ? `${criticalPartsCount} Kritis` : null,
      badgeColor: 'bg-rose-100 text-rose-800 font-bold animate-pulse',
    },
    {
      id: 'inventory' as TabKey,
      label: 'Stock In / Out',
      icon: Boxes,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'shipments' as TabKey,
      label: 'Monitoring Pengiriman',
      icon: Truck,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'analytics' as TabKey,
      label: 'Analisis Mendalam',
      icon: TrendingUp,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'ims' as TabKey,
      label: 'Manajemen Mutu (IMS 360°)',
      icon: Orbit,
      badge: 'ISO 9001',
      badgeColor: 'bg-blue-100 text-blue-800 font-bold',
    },
    {
      id: 'users' as TabKey,
      label: 'Akses & Audit Log',
      icon: ShieldCheck,
      badge: 'RBAC',
      badgeColor: 'bg-purple-100 text-purple-800 font-bold',
    },
  ];

  // Filter tabs according to current user's permitted modules
  const tabs = allowedModules && allowedModules.length > 0
    ? allTabs.filter((t) => allowedModules.includes(t.id))
    : allTabs;

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-2 overflow-x-auto py-2.5 no-scrollbar" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${tab.badgeColor}`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
