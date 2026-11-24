'use client';

import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Edit2,
  Filter,
  KeyRound,
  Lock,
  LogIn,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { AppUser, AuditActionType, AuditLogEntry, SYSTEM_MODULES, UserRole, UserStatus } from '../lib/auth-types';
import { ROLE_DEFAULT_MODULES } from '../lib/auth-data';
import { TabKey } from './TabNavigation';

interface UserAccessModuleProps {
  currentUser: AppUser;
  users: AppUser[];
  auditLogs: AuditLogEntry[];
  onUpdateUserModules: (userId: string, newModules: TabKey[]) => void;
  onUpdateUserStatus: (userId: string, status: UserStatus) => void;
  onAddUser: (user: Omit<AppUser, 'id' | 'createdAt' | 'lastLoginAt' | 'lastLoginIp'>) => void;
  onSwitchUser: (user: AppUser) => void;
  onAddAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
}

export default function UserAccessModule({
  currentUser,
  users,
  auditLogs,
  onUpdateUserModules,
  onUpdateUserStatus,
  onAddUser,
  onSwitchUser,
  onAddAuditLog,
}: UserAccessModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'audit' | 'roles'>('matrix');
  const [searchUser, setSearchUser] = useState('');
  const [searchAudit, setSearchAudit] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modal States
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<AppUser | null>(null);

  // New user form state
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('PLANT_MANAGER');
  const [newDepartment, setNewDepartment] = useState('Plant Operations');
  const [selectedNewModules, setSelectedNewModules] = useState<TabKey[]>(ROLE_DEFAULT_MODULES['PLANT_MANAGER']);

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  // Toggle single module permission
  const handleToggleModule = (user: AppUser, moduleId: TabKey) => {
    if (!isSuperAdmin) {
      alert('Hanya Super Admin yang diizinkan mengubah konfigurasi hak akses modul!');
      return;
    }

    const currentModules = user.allowedModules;
    let updatedModules: TabKey[];
    if (currentModules.includes(moduleId)) {
      // Prevent superadmin from locking themselves out of users module
      if (user.id === currentUser.id && moduleId === 'users') {
        alert('Super Admin tidak boleh mencabut akses modul Akses & Audit Log dari dirinya sendiri!');
        return;
      }
      updatedModules = currentModules.filter((m) => m !== moduleId);
    } else {
      updatedModules = [...currentModules, moduleId];
    }

    onUpdateUserModules(user.id, updatedModules);
    onAddAuditLog({
      userId: currentUser.id,
      username: currentUser.username,
      name: currentUser.name,
      role: currentUser.role,
      roleLabel: currentUser.roleLabel,
      action: 'PERMISSION_CHANGED',
      status: 'SUCCESS',
      ipAddress: '192.168.1.10',
      device: 'Console / Web UI',
      details: `Hak akses modul ${moduleId} untuk user ${user.username} (${user.name}) ${
        currentModules.includes(moduleId) ? 'DICABUT' : 'DIBERIKAN'
      } oleh Super Admin.`,
    });
  };

  // Reset module to default role preset
  const handleResetToRoleDefault = (user: AppUser) => {
    if (!isSuperAdmin) return;
    const defaults = ROLE_DEFAULT_MODULES[user.role] || ['dashboard'];
    onUpdateUserModules(user.id, defaults);
    onAddAuditLog({
      userId: currentUser.id,
      username: currentUser.username,
      name: currentUser.name,
      role: currentUser.role,
      roleLabel: currentUser.roleLabel,
      action: 'PERMISSION_CHANGED',
      status: 'SUCCESS',
      ipAddress: '192.168.1.10',
      device: 'Console / Web UI',
      details: `Hak akses user ${user.username} di-reset ke konfigurasi default role ${user.roleLabel}.`,
    });
  };

  // Toggle user status (ACTIVE / SUSPENDED)
  const handleToggleStatus = (user: AppUser) => {
    if (!isSuperAdmin) return;
    if (user.id === currentUser.id) {
      alert('Tidak dapat menonaktifkan akun Super Admin Anda sendiri yang sedang aktif!');
      return;
    }

    const newStatus: UserStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    onUpdateUserStatus(user.id, newStatus);
    onAddAuditLog({
      userId: currentUser.id,
      username: currentUser.username,
      name: currentUser.name,
      role: currentUser.role,
      roleLabel: currentUser.roleLabel,
      action: 'STATUS_CHANGED',
      status: newStatus === 'ACTIVE' ? 'SUCCESS' : 'WARNING',
      ipAddress: '192.168.1.10',
      device: 'Console / Web UI',
      details: `Status akun ${user.username} diubah menjadi ${newStatus}.`,
    });
  };

  // Handle Create User
  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newName.trim() || !newEmail.trim()) {
      alert('Mohon isi seluruh field wajib!');
      return;
    }

    const roleLabels: Record<UserRole, string> = {
      SUPER_ADMIN: 'Super Administrator',
      DIREKSI: 'Direktur Utama / Board',
      PLANT_MANAGER: 'Plant & Operations Manager',
      QC_SUPERVISOR: 'QC & QA Supervisor',
      WAREHOUSE_LEAD: 'Kepala Gudang & Logistik',
      MAINTENANCE_LEAD: 'Lead Technician & Maintenance',
      PURCHASING_OFFICER: 'Purchasing & MRP Specialist',
      FINANCE_ACCOUNTING: 'Finance & Accounting Lead',
    };

    const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-amber-600', 'bg-teal-600'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const initials = newName
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('');

    onAddUser({
      username: newUsername.toLowerCase().trim(),
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      roleLabel: roleLabels[newRole],
      department: newDepartment.trim(),
      status: 'ACTIVE',
      avatarBg: randomColor,
      avatarText: initials || 'US',
      allowedModules: selectedNewModules,
    });

    onAddAuditLog({
      userId: currentUser.id,
      username: currentUser.username,
      name: currentUser.name,
      role: currentUser.role,
      roleLabel: currentUser.roleLabel,
      action: 'USER_CREATED',
      status: 'SUCCESS',
      ipAddress: '192.168.1.10',
      device: 'Console / Web UI',
      details: `User baru dibuat: ${newUsername} (${newName}) dengan role ${roleLabels[newRole]}.`,
    });

    setIsAddUserModalOpen(false);
    // Reset form
    setNewUsername('');
    setNewName('');
    setNewEmail('');
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.username.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.department.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.roleLabel.toLowerCase().includes(searchUser.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  // Filtered Audit Logs
  const filteredLogs = auditLogs.filter((log) => {
    const matchSearch =
      log.username.toLowerCase().includes(searchAudit.toLowerCase()) ||
      log.name.toLowerCase().includes(searchAudit.toLowerCase()) ||
      log.details.toLowerCase().includes(searchAudit.toLowerCase()) ||
      log.ipAddress.includes(searchAudit);
    const matchAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchSearch && matchAction;
  });

  // Export Audit Log CSV
  const handleExportAuditCSV = () => {
    let csv = 'ID Log,Waktu,Username,Nama Pengguna,Role,Aksi,Status,IP Address,Device,Keterangan\n';
    filteredLogs.forEach((l) => {
      csv += `"${l.id}","${l.timestamp}","${l.username}","${l.name}","${l.roleLabel}","${l.action}","${l.status}","${l.ipAddress}","${l.device}","${l.details.replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_log_akses_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const getActionBadge = (action: AuditActionType, status: string) => {
    switch (action) {
      case 'LOGIN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <LogIn className="h-3 w-3" /> Log In
          </span>
        );
      case 'LOGOUT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <LogOut className="h-3 w-3" /> Log Out
          </span>
        );
      case 'ACCESS_DENIED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
            <AlertOctagon className="h-3 w-3" /> Akses Ditolak
          </span>
        );
      case 'PERMISSION_CHANGED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
            <Sliders className="h-3 w-3" /> Ubah Izin Modul
          </span>
        );
      case 'USER_CREATED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <UserPlus className="h-3 w-3" /> User Baru
          </span>
        );
      case 'STATUS_CHANGED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="h-3 w-3" /> Status Akun
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">
            {action}
          </span>
        );
    }
  };

  // Metrics
  const activeCount = users.filter((u) => u.status === 'ACTIVE').length;
  const loginCount = auditLogs.filter((l) => l.action === 'LOGIN').length;
  const warningCount = auditLogs.filter((l) => l.action === 'ACCESS_DENIED').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
                Super Admin Access Control &amp; RBAC Suite
              </span>
              <span className="text-xs text-slate-400">
                Sesi Anda: <strong className="text-white">{currentUser.name}</strong> ({currentUser.roleLabel})
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Pengelolaan Hak Akses Pengguna &amp; Audit Log
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Kontrol penuh matriks izin per modul pabrik, monitoring aktivitas login &amp; logout, serta deteksi
              pelanggaran akses secara transparan dan audit-ready.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {isSuperAdmin && (
              <button
                onClick={() => {
                  setSelectedNewModules(ROLE_DEFAULT_MODULES[newRole]);
                  setIsAddUserModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-md active:scale-95"
              >
                <UserPlus className="h-4 w-4" />
                <span>+ Tambah Pengguna</span>
              </button>
            )}

            <button
              onClick={handleExportAuditCSV}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl transition border border-slate-700 active:scale-95"
            >
              <Download className="h-4 w-4" />
              <span>Export Audit Log</span>
            </button>
          </div>
        </div>

        {/* 4 Security KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/60 rounded-2xl p-4">
            <span className="text-[11px] text-slate-400 block mb-1">Total Pengguna Terdaftar</span>
            <div className="text-xl sm:text-2xl font-bold text-white">{users.length} Akun</div>
            <span className="text-[10px] text-purple-300 mt-1 block">8 Role Spesifik Pabrik</span>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/60 rounded-2xl p-4">
            <span className="text-[11px] text-slate-400 block mb-1">Pengguna Aktif</span>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400">
              {activeCount} / {users.length}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">100% Terverifikasi</span>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/60 rounded-2xl p-4">
            <span className="text-[11px] text-slate-400 block mb-1">Total Log In Tercatat</span>
            <div className="text-xl sm:text-2xl font-bold text-cyan-400">{loginCount} Sesi</div>
            <span className="text-[10px] text-slate-400 mt-1 block">Terekam IP &amp; Device</span>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/60 rounded-2xl p-4">
            <span className="text-[11px] text-slate-400 block mb-1">Peringatan Akses Ditolak</span>
            <div className="text-xl sm:text-2xl font-bold text-rose-400">{warningCount} Percobaan</div>
            <span className="text-[10px] text-rose-300 mt-1 block">Diblokir Sistem RBAC</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex overflow-x-auto gap-1 text-xs">
        <button
          onClick={() => setActiveSubTab('matrix')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap transition ${
            activeSubTab === 'matrix'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Shield className="h-4 w-4" />
          <span>Matriks Hak Akses Modul (RBAC)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('audit')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap transition ${
            activeSubTab === 'audit'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Audit Log Log In &amp; Log Out</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 text-purple-800 font-bold">
            {auditLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('roles')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap transition ${
            activeSubTab === 'roles'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <KeyRound className="h-4 w-4" />
          <span>Standar Role &amp; Kebijakan Keamanan</span>
        </button>
      </div>

      {/* SUB-TAB 1: MATRIKS HAK AKSES PER MODUL */}
      {activeSubTab === 'matrix' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Matriks Hak Akses Pengguna ke Seluruh Modul ERP</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  Live Toggle
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Super Admin dapat mengaktifkan atau mencabut akses ke setiap modul dengan mengeklik ikon centang secara
                langsung.
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama / username..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 w-48"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="ALL">Semua Role</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="DIREKSI">Direksi</option>
                <option value="PLANT_MANAGER">Plant Manager</option>
                <option value="QC_SUPERVISOR">QC Supervisor</option>
                <option value="WAREHOUSE_LEAD">Warehouse Lead</option>
                <option value="MAINTENANCE_LEAD">Maintenance Lead</option>
                <option value="PURCHASING_OFFICER">Purchasing Officer</option>
                <option value="FINANCE_ACCOUNTING">Finance &amp; Accounting</option>
              </select>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3.5 sticky left-0 bg-slate-50 z-10 min-w-[200px]">Pengguna &amp; Role</th>
                  <th className="p-3.5 min-w-[90px] text-center">Status</th>
                  {SYSTEM_MODULES.map((mod) => (
                    <th key={mod.id} className="p-2.5 text-center min-w-[95px] max-w-[110px]" title={mod.description}>
                      <span className="block truncate font-semibold text-[11px] text-slate-800">{mod.label}</span>
                      <span className="text-[9px] text-slate-400 block font-normal">{mod.category}</span>
                    </th>
                  ))}
                  <th className="p-3.5 text-center min-w-[120px]">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => {
                  const isCurrent = user.id === currentUser.id;
                  return (
                    <tr key={user.id} className={`hover:bg-purple-50/30 transition ${isCurrent ? 'bg-purple-50/20' : ''}`}>
                      {/* User Info Sticky Column */}
                      <td className="p-3.5 sticky left-0 bg-white z-10 border-r border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`h-8 w-8 rounded-full ${user.avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}
                          >
                            {user.avatarText}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {isCurrent && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-700">
                                  Anda
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                              <span>@{user.username}</span>
                              <span>&middot;</span>
                              <span className="text-slate-600 font-sans">{user.roleLabel}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          disabled={!isSuperAdmin || isCurrent}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition ${
                            user.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          } ${!isSuperAdmin || isCurrent ? 'cursor-default' : 'cursor-pointer'}`}
                          title="Klik untuk ubah status akun"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          ></span>
                          <span>{user.status}</span>
                        </button>
                      </td>

                      {/* Module Checkbox Columns */}
                      {SYSTEM_MODULES.map((mod) => {
                        const hasAccess = user.allowedModules.includes(mod.id);
                        return (
                          <td key={mod.id} className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleModule(user, mod.id)}
                              disabled={!isSuperAdmin}
                              title={
                                !isSuperAdmin
                                  ? 'Hanya Super Admin yang dapat mengubah izin'
                                  : `Klik untuk ${hasAccess ? 'mencabut' : 'memberikan'} akses modul ${mod.label}`
                              }
                              className={`h-7 w-7 rounded-lg inline-flex items-center justify-center transition ${
                                hasAccess
                                  ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-2xs hover:scale-105'
                                  : 'bg-slate-100 text-slate-300 hover:bg-slate-200 hover:text-slate-500'
                              } ${!isSuperAdmin ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                            >
                              {hasAccess ? <Check className="h-4 w-4 stroke-[3]" /> : <X className="h-3.5 w-3.5" />}
                            </button>
                          </td>
                        );
                      })}

                      {/* Quick Action */}
                      <td className="p-3 text-center whitespace-nowrap space-x-1">
                        <button
                          onClick={() => onSwitchUser(user)}
                          title="Beralih dan uji coba login sebagai pengguna ini"
                          className="px-2 py-1 rounded-lg text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition"
                        >
                          Login Uji
                        </button>

                        {isSuperAdmin && (
                          <button
                            onClick={() => handleResetToRoleDefault(user)}
                            title="Reset hak akses modul ke preset bawaan role"
                            className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition"
                          >
                            Reset Role
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 pt-2 gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-md bg-emerald-500 inline-block"></span>
                <span>Diizinkan Akses Penuh</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-md bg-slate-200 inline-block"></span>
                <span>Akses Ditolak (Restricted)</span>
              </span>
            </div>
            <span>
              Menampilkan <strong>{filteredUsers.length}</strong> dari <strong>{users.length}</strong> pengguna
            </span>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: AUDIT LOG LOG IN & LOG OUT */}
      {activeSubTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Catatan Audit Log In, Log Out &amp; Aktivitas Keamanan</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
                  Immutable Trail
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Pencatatan real-time seluruh aktivitas otentikasi sesi, alamat IP, perangkat, serta riwayat perubahan hak
                akses.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari user / IP / detail..."
                  value={searchAudit}
                  onChange={(e) => setSearchAudit(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 w-52"
                />
              </div>

              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="ALL">Semua Aktivitas</option>
                <option value="LOGIN">Hanya Log In</option>
                <option value="LOGOUT">Hanya Log Out</option>
                <option value="ACCESS_DENIED">Akses Ditolak (Warning)</option>
                <option value="PERMISSION_CHANGED">Perubahan Hak Akses</option>
                <option value="USER_CREATED">Pembuatan Pengguna</option>
                <option value="STATUS_CHANGED">Perubahan Status Akun</option>
              </select>

              <button
                onClick={handleExportAuditCSV}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Unduh CSV</span>
              </button>
            </div>
          </div>

          {/* Log Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3 min-w-[140px]">Waktu &amp; Tanggal</th>
                  <th className="p-3 min-w-[170px]">Pengguna</th>
                  <th className="p-3 min-w-[120px]">Aktivitas</th>
                  <th className="p-3 min-w-[110px]">Alamat IP</th>
                  <th className="p-3 min-w-[140px]">Perangkat / Browser</th>
                  <th className="p-3">Keterangan Audit Trail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3 text-slate-600 text-[11px] whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-3 font-sans">
                      <div className="font-semibold text-slate-900">{log.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        @{log.username} &middot; <span className="font-sans text-[10px]">{log.roleLabel}</span>
                      </div>
                    </td>
                    <td className="p-3 font-sans whitespace-nowrap">{getActionBadge(log.action, log.status)}</td>
                    <td className="p-3 text-slate-700 text-[11px]">{log.ipAddress}</td>
                    <td className="p-3 text-slate-600 font-sans text-[11px]">{log.device}</td>
                    <td className="p-3 font-sans text-slate-800 text-[11px] leading-relaxed max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-xs text-slate-400 text-right">
            Menampilkan {filteredLogs.length} dari total {auditLogs.length} rekaman audit keamanan
          </div>
        </div>
      )}

      {/* SUB-TAB 3: STANDAR ROLE & KEBIJAKAN KEAMANAN */}
      {activeSubTab === 'roles' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Standarisasi Role RBAC &amp; Kebijakan Keamanan Pabrik Cengkeh
            </h3>
            <p className="text-xs text-slate-500">
              Prinsip hak akses minimal (Least Privilege Principle) untuk melindungi integritas laporan keuangan dan mutu
              pabrik.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-purple-200 bg-purple-50/30 space-y-3">
              <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
                <ShieldCheck className="h-5 w-5 text-purple-600" />
                <span>Super Administrator (`SUPER_ADMIN`)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pemegang kendali tertinggi sistem IT dan keamanan. Memiliki akses ke seluruh modul tanpa batas, termasuk
                pengaturan hak akses user, pengelolaan database, audit log, dan ekspor kepatuhan.
              </p>
              <div className="text-[11px] font-semibold text-purple-800 bg-purple-100/60 p-2.5 rounded-xl">
                Akses Bawaan: 11 Modul Lengkap (Termasuk Modul Akses &amp; Audit Log).
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-indigo-200 bg-indigo-50/30 space-y-3">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                <Shield className="h-5 w-5 text-indigo-600" />
                <span>Direksi &amp; Dewan Komisaris (`DIREKSI`)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Manajemen puncak eksekutif. Berhak mengakses Dashboard Eksekutif, Laporan Keuangan, Corporate Health
                Check, Analisis Laba Rugi, Pengadaan Bahan, serta memantau audit log transparansi.
              </p>
              <div className="text-[11px] font-semibold text-indigo-800 bg-indigo-100/60 p-2.5 rounded-xl">
                Akses Bawaan: Dashboard, Laporan Keuangan, Pengadaan, Analisis, Audit Log.
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-teal-200 bg-teal-50/30 space-y-3">
              <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
                <Sliders className="h-5 w-5 text-teal-600" />
                <span>Plant &amp; Production Manager (`PLANT_MANAGER`)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Penanggung jawab operasional lantai pabrik. Mengawasi antrian order masuk, pengerjaan QC batch, kapasitas
                dan evaluasi delay mesin, perawatan sparepart, dan logistik pengiriman.
              </p>
              <div className="text-[11px] font-semibold text-teal-800 bg-teal-100/60 p-2.5 rounded-xl">
                Akses Bawaan: Dashboard, Order, Produksi, Mesin, Sparepart, Stok, Pengiriman, Analitik.
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/30 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <CheckCircle2 className="h-5 w-5 text-amber-600" />
                <span>Quality Assurance &amp; QC Supervisor (`QC_SUPERVISOR`)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pengawal mutu cengkeh rajang prima, kadar debu siklon (&le;6.5%), dan kadar air (11.5%–13%). Menginput data
                inspeksi laboratorium per batch dan memonitor parameter keterlambatan.
              </p>
              <div className="text-[11px] font-semibold text-amber-800 bg-amber-100/60 p-2.5 rounded-xl">
                Akses Bawaan: Dashboard, Pengerjaan &amp; QC Mutu, Order, Mesin, Analisis.
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/30 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <Lock className="h-5 w-5 text-emerald-600" />
                <span>Finance &amp; Accounting Lead (`FINANCE_ACCOUNTING`)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Penata buku besar manufaktur, sinkronisasi payroll HRIS tenaga kerja, analisis biaya per kg (HPP), dan
                laporan Neraca / P&amp;L komprehensif. Tidak dapat mengedit data QC batch langsung.
              </p>
              <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/60 p-2.5 rounded-xl">
                Akses Bawaan: Laporan Keuangan, Pengadaan &amp; Pembelian, Dashboard, Analitik.
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-purple-200 bg-purple-50/30 space-y-3">
              <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
                <KeyRound className="h-5 w-5 text-purple-600" />
                <span>Maintenance &amp; Engineering Lead (`MAINTENANCE_LEAD`)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pemelihara keandalan mesin rotary &amp; guillotine. Mencatat permohonan part, mengupdate tracker jam aus
                pisau, dan mencatat log history kerusakan mesin ke dalam sistem CMMS.
              </p>
              <div className="text-[11px] font-semibold text-purple-800 bg-purple-100/60 p-2.5 rounded-xl">
                Akses Bawaan: Mesin &amp; Evaluasi Keterlambatan, Sparepart &amp; Maintenance, Produksi.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH PENGGUNA BARU */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Tambah Pengguna Baru</h3>
                  <p className="text-xs text-slate-500">Konfigurasi akun dan hak akses modul sistem ERP</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Username (Login ID) *</label>
                  <input
                    type="text"
                    required
                    placeholder="mis. qc_staff_01"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nama Lengkap &amp; Gelar *</label>
                  <input
                    type="text"
                    required
                    placeholder="mis. Bambang Wijaya, S.T."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email Perusahaan *</label>
                  <input
                    type="email"
                    required
                    placeholder="bambang@rajangcengkeh.co.id"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Departemen / Divisi</label>
                  <input
                    type="text"
                    placeholder="mis. Quality Control"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1 text-xs">Role Otoritas</label>
                <select
                  value={newRole}
                  onChange={(e) => {
                    const r = e.target.value as UserRole;
                    setNewRole(r);
                    setSelectedNewModules(ROLE_DEFAULT_MODULES[r] || ['dashboard']);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="SUPER_ADMIN">Super Administrator (Akses Penuh)</option>
                  <option value="DIREKSI">Direktur Utama / Board</option>
                  <option value="PLANT_MANAGER">Plant &amp; Production Manager</option>
                  <option value="QC_SUPERVISOR">QC &amp; QA Supervisor</option>
                  <option value="WAREHOUSE_LEAD">Kepala Gudang &amp; Logistik</option>
                  <option value="MAINTENANCE_LEAD">Lead Technician &amp; Maintenance</option>
                  <option value="PURCHASING_OFFICER">Purchasing &amp; MRP Specialist</option>
                  <option value="FINANCE_ACCOUNTING">Finance &amp; Accounting Lead</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold text-slate-700 block text-xs">Pilih Hak Akses Modul:</label>
                  <button
                    type="button"
                    onClick={() => setSelectedNewModules(ROLE_DEFAULT_MODULES[newRole] || ['dashboard'])}
                    className="text-[11px] text-purple-600 hover:underline"
                  >
                    Pakai Preset Role
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50/50">
                  {SYSTEM_MODULES.map((mod) => {
                    const isChecked = selectedNewModules.includes(mod.id);
                    return (
                      <label
                        key={mod.id}
                        className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer border transition ${
                          isChecked ? 'bg-purple-50 border-purple-300 text-purple-900 font-medium' : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedNewModules((prev) => [...prev, mod.id]);
                            } else {
                              setSelectedNewModules((prev) => prev.filter((m) => m !== mod.id));
                            }
                          }}
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span className="truncate">{mod.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-md transition"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
