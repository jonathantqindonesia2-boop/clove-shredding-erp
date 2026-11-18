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
  AlertTriangle,
} from 'lucide-react';

export type TabKey =
  | 'dashboard'
  | 'orders'
  | 'production'
  | 'machines'
  | 'inventory'
  | 'shipments'
  | 'analytics';

interface TabNavigationProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  orderCount: number;
  delayCount: number;
  batchCount: number;
  machineCount: number;
}

export default function TabNavigation({
  activeTab,
  onSelectTab,
  orderCount,
  delayCount,
  batchCount,
  machineCount,
}: TabNavigationProps) {
  const tabs = [
    {
      id: 'dashboard' as TabKey,
      label: 'Dashboard Eksekutif',
      icon: LayoutDashboard,
      badge: delayCount > 0 ? `${delayCount} Delay` : null,
      badgeColor: 'bg-rose-100 text-rose-700',
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
  ];

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
