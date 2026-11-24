'use client';

import React, { useState } from 'react';
import { AppUser } from '../lib/auth-types';
import { KeyRound, Lock, LogIn, ShieldCheck, UserCheck, Users, X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: AppUser[];
  currentUser: AppUser;
  onSelectLoginUser: (user: AppUser) => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  users,
  currentUser,
  onSelectLoginUser,
}: LoginModalProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser.id);
  const [password, setPassword] = useState('******');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetUser = users.find((u) => u.id === selectedUserId);
    if (targetUser) {
      if (targetUser.status !== 'ACTIVE') {
        alert(`Akun ${targetUser.username} sedang berstatus ${targetUser.status}! Tidak dapat login.`);
        return;
      }
      onSelectLoginUser(targetUser);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Beralih Akun &amp; Sesi Login</h3>
              <p className="text-xs text-slate-500">Pilih profil pengguna untuk menguji izin modul</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="font-semibold text-slate-700 block mb-1 text-xs">Pilih Pengguna / Role:</label>
            <div className="space-y-2 max-h-60 overflow-y-auto p-1">
              {users.map((u) => {
                const isSelected = u.id === selectedUserId;
                const isCurrentlyActive = u.id === currentUser.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUserId(u.id)}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50/70 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-9 w-9 rounded-full ${u.avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}
                      >
                        {u.avatarText}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <span>{u.name}</span>
                          {isCurrentlyActive && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800">
                              Sesi Aktif
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          <strong className="font-mono text-purple-700">@{u.username}</strong> &middot; {u.roleLabel}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block">{u.allowedModules.length} Modul</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {u.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1 text-xs">Kata Sandi (Simulasi)</label>
            <div className="relative">
              <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Setiap login terekam otomatis dalam tabel Audit Log keamanan sistem.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-md transition active:scale-95"
            >
              <LogIn className="h-4 w-4" />
              <span>Masuk Sekarang</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
