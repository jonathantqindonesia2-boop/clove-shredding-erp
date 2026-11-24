'use client';

import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Cpu,
  Download,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Filter,
  FolderOpen,
  Gauge,
  Globe2,
  GraduationCap,
  HelpCircle,
  Layers,
  Orbit,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Star,
  TrendingUp,
  UserCheck,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import {
  CapaRecord,
  ControlledDocument,
  CustomerFeedbackRecord,
  EmployeeSkillRecord,
  InternalAuditRecord,
  ManagementReviewAgenda,
  PestelIssue,
  QualityOKR,
  QualityPolicy,
  QualityRisk,
  RootCause6M,
  StakeholderExpectation,
  TrainingProgram,
} from '../lib/ims-types';
import {
  INITIAL_CAPAS,
  INITIAL_CONTROLLED_DOCS,
  INITIAL_CUSTOMER_FEEDBACK,
  INITIAL_EMPLOYEE_SKILLS,
  INITIAL_INTERNAL_AUDITS,
  INITIAL_MANAGEMENT_REVIEWS,
  INITIAL_PESTEL_ISSUES,
  INITIAL_QUALITY_OKRS,
  INITIAL_QUALITY_POLICY,
  INITIAL_QUALITY_RISKS,
  INITIAL_STAKEHOLDERS,
  INITIAL_TRAININGS,
} from '../lib/ims-data';

interface ImsModuleProps {
  onNotify?: (message: string) => void;
}

export default function ImsModule({ onNotify }: ImsModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<
    'ims-overview' | 'risk-okr' | 'capa' | 'audit-feedback' | 'edms' | 'skills-pestel'
  >('ims-overview');

  // Interactive States
  const [capas, setCapas] = useState<CapaRecord[]>(INITIAL_CAPAS);
  const [risks, setRisks] = useState<QualityRisk[]>(INITIAL_QUALITY_RISKS);
  const [docs, setDocs] = useState<ControlledDocument[]>(INITIAL_CONTROLLED_DOCS);
  const [okrs, setOkrs] = useState<QualityOKR[]>(INITIAL_QUALITY_OKRS);
  const [feedbacks, setFeedbacks] = useState<CustomerFeedbackRecord[]>(INITIAL_CUSTOMER_FEEDBACK);
  const [audits, setAudits] = useState<InternalAuditRecord[]>(INITIAL_INTERNAL_AUDITS);
  const [skills, setSkills] = useState<EmployeeSkillRecord[]>(INITIAL_EMPLOYEE_SKILLS);
  const [pestel, setPestel] = useState<PestelIssue[]>(INITIAL_PESTEL_ISSUES);
  const [stakeholders, setStakeholders] = useState<StakeholderExpectation[]>(INITIAL_STAKEHOLDERS);

  // Filters
  const [capaFilter, setCapaFilter] = useState<string>('ALL');
  const [riskCategoryFilter, setRiskCategoryFilter] = useState<string>('ALL');
  const [docCategoryFilter, setDocCategoryFilter] = useState<string>('ALL');

  // Modal States
  const [isAddCapaModalOpen, setIsAddCapaModalOpen] = useState(false);
  const [selectedCapaDetail, setSelectedCapaDetail] = useState<CapaRecord | null>(null);

  // New CAPA Form
  const [newCapaTitle, setNewCapaTitle] = useState('');
  const [newCapaSource, setNewCapaSource] = useState<'Inspeksi QC Batch' | 'Kerusakan Mesin' | 'Temuan Audit Internal' | 'Komplain Pelanggan'>('Inspeksi QC Batch');
  const [newCapaDept, setNewCapaDept] = useState('Produksi & Maintenance');
  const [newCapaDetails, setNewCapaDetails] = useState('');
  const [newCapaImmediate, setNewCapaImmediate] = useState('');
  const [newCapaRootCause, setNewCapaRootCause] = useState<RootCause6M>('Machine (Mesin)');
  const [newCapa5Why, setNewCapa5Why] = useState('');
  const [newCapaCorrective, setNewCapaCorrective] = useState('');
  const [newCapaPreventive, setNewCapaPreventive] = useState('');
  const [newCapaAssignee, setNewCapaAssignee] = useState('Yusuf Alamsyah (Maintenance)');

  // Handlers
  const handleCreateCapaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCapaTitle.trim() || !newCapaDetails.trim()) {
      alert('Mohon isi judul dan detail ketidaksesuaian!');
      return;
    }

    const newId = `CAPA-2026-${String(capas.length + 1).padStart(3, '0')}`;
    const newRecord: CapaRecord = {
      id: newId,
      capaNumber: `CAPA-${new Date().toISOString().slice(0, 7)}-${String(capas.length + 1).padStart(2, '0')}`,
      source: newCapaSource,
      issueTitle: newCapaTitle.trim(),
      department: newCapaDept,
      nonconformanceDetails: newCapaDetails.trim(),
      immediateCorrection: newCapaImmediate.trim() || 'Tindakan penahanan sementara produk.',
      rootCauseCategory: newCapaRootCause,
      rootCauseAnalysis: newCapa5Why.trim() || 'Analisis 5-Why dalam proses verifikasi tim teknis.',
      correctiveAction: newCapaCorrective.trim() || 'Perbaikan segera pada akar masalah.',
      preventiveAction: newCapaPreventive.trim() || 'Pembaruan instruksi kerja dan pengawasan berkala.',
      assignedTo: newCapaAssignee,
      targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      status: 'Open',
      effectivenessVerified: false,
    };

    setCapas((prev) => [newRecord, ...prev]);
    setIsAddCapaModalOpen(false);
    // Reset Form
    setNewCapaTitle('');
    setNewCapaDetails('');
    setNewCapaImmediate('');
    setNewCapa5Why('');
    setNewCapaCorrective('');
    setNewCapaPreventive('');

    if (onNotify) {
      onNotify(`Tiket ${newRecord.capaNumber} berhasil diterbitkan dan masuk ke alur investigasi CAPA.`);
    }
  };

  const handleCloseCapa = (capaId: string) => {
    setCapas((prev) =>
      prev.map((c) =>
        c.id === capaId
          ? {
              ...c,
              status: 'Closed',
              completionDate: new Date().toISOString().slice(0, 10),
              effectivenessVerified: true,
              verifiedBy: 'Ratna Kusuma, S.Si. (QC Lead Auditor)',
            }
          : c
      )
    );
    setSelectedCapaDetail(null);
  };

  // Metrics
  const openCapas = capas.filter((c) => c.status !== 'Closed').length;
  const closedCapas = capas.filter((c) => c.status === 'Closed').length;
  const highRisks = risks.filter((r) => r.level === 'High' || r.level === 'Extreme').length;
  const avgCsat = (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(2);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1.5">
                <Orbit className="h-3.5 w-3.5 text-blue-400" />
                ISO 9001:2026 Digital Quality Management System (IMS 360°)
              </span>
              <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                Klausul 4 s/d 10 Terintegrasi
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Sistem Manajemen Mutu Terintegrasi Pabrik Cengkeh
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Integrasi siklus PDCA penuh: Analisis PESTEL &amp; Stakeholder, Kebijakan Mutu Digital, Manajemen Risiko
              5x5, E-Document SOP, E-Audit Internal, dan CAPA 6M terhubung mesin &amp; QC laboratorium.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsAddCapaModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-md active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>+ Buat Tiket CAPA</span>
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl transition border border-slate-700 active:scale-95"
            >
              <Download className="h-4 w-4" />
              <span>Cetak Paket Mutu (PDF)</span>
            </button>
          </div>
        </div>

        {/* 4 Executive Quality KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/60 rounded-2xl p-4">
            <span className="text-[11px] text-slate-400 block mb-1">Health Score Sistem Mutu</span>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400">94.2%</div>
            <span className="text-[10px] text-emerald-300 mt-1 block">Grade A - Sangat Patuh</span>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/60 rounded-2xl p-4">
            <span className="text-[11px] text-slate-400 block mb-1">Rendemen Prima Rata-rata</span>
            <div className="text-xl sm:text-2xl font-bold text-white">90.5%</div>
            <span className="text-[10px] text-blue-300 mt-1 block">Melampaui Target 90.0%</span>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/60 rounded-2xl p-4">
            <span className="text-[11px] text-slate-400 block mb-1">Indeks Kepuasan Klien (CSAT)</span>
            <div className="text-xl sm:text-2xl font-bold text-amber-400">{avgCsat} / 5.0</div>
            <span className="text-[10px] text-slate-300 mt-1 block">Gudang Garam, Sampoerna, Djarum</span>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/60 rounded-2xl p-4">
            <span className="text-[11px] text-slate-400 block mb-1">Status Tiket CAPA 6M</span>
            <div className="text-xl sm:text-2xl font-bold text-cyan-400">
              {closedCapas} / {capas.length} Selesai
            </div>
            <span className="text-[10px] text-slate-300 mt-1 block">{openCapas} Dalam Tindakan</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex overflow-x-auto gap-1 text-xs">
        <button
          onClick={() => setActiveSubTab('ims-overview')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap transition ${
            activeSubTab === 'ims-overview'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Orbit className="h-4 w-4" />
          <span>IMS 360° Hub &amp; Klausul ISO</span>
        </button>

        <button
          onClick={() => setActiveSubTab('risk-okr')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap transition ${
            activeSubTab === 'risk-okr'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          <span>Risk Register 5x5 &amp; OKR (Klausul 6)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('capa')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap transition ${
            activeSubTab === 'capa'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wrench className="h-4 w-4" />
          <span>CAPA Digital &amp; Analisis 6M (Klausul 10.2)</span>
          {openCapas > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
              {openCapas}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('audit-feedback')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap transition ${
            activeSubTab === 'audit-feedback'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ClipboardCheck className="h-4 w-4" />
          <span>E-Audit &amp; Kepuasan Pelanggan (Klausul 9)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('edms')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap transition ${
            activeSubTab === 'edms'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FolderOpen className="h-4 w-4" />
          <span>E-Document SOP (Klausul 7.5)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('skills-pestel')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap transition ${
            activeSubTab === 'skills-pestel'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          <span>Skill Matrix &amp; PESTEL (Klausul 4 &amp; 7)</span>
        </button>
      </div>

      {/* SUB-TAB 1: IMS 360° OVERVIEW & KEPATUHAN KLAUSUL */}
      {activeSubTab === 'ims-overview' && (
        <div className="space-y-6">
          {/* PDCA 4 Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">PLAN (Perencanaan)</span>
                <span className="text-slate-400 font-mono text-[11px]">Klausul 4, 5, 6</span>
              </div>
              <div className="text-xl font-bold text-slate-900">96.0% Patuh</div>
              <p className="text-xs text-slate-500">
                PESTEL terpetakan, Kebijakan Mutu disahkan Direksi, 5 Risiko di-mitigasi dengan residual rendah.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">DO (Pelaksanaan)</span>
                <span className="text-slate-400 font-mono text-[11px]">Klausul 7, 8</span>
              </div>
              <div className="text-xl font-bold text-slate-900">94.5% Patuh</div>
              <p className="text-xs text-slate-500">
                Skill Matrix operator mesin 92% kompeten, 5 SOP/IK terkendali aktif, kontrol produksi batch presisi.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md">CHECK (Pemeriksaan)</span>
                <span className="text-slate-400 font-mono text-[11px]">Klausul 9</span>
              </div>
              <div className="text-xl font-bold text-slate-900">95.0% Patuh</div>
              <p className="text-xs text-slate-500">
                Audit internal semester 1 tuntas, skor kepuasan pabrikan rokok 4.85/5.0, inspeksi rendemen lolos standar.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md">ACT (Peningkatan)</span>
                <span className="text-slate-400 font-mono text-[11px]">Klausul 10</span>
              </div>
              <div className="text-xl font-bold text-slate-900">91.5% Patuh</div>
              <p className="text-xs text-slate-500">
                CAPA 6M aktif menyelesaikan isu debu siklon dan getaran bearing mesin, zero keterlambatan overdue.
              </p>
            </div>
          </div>

          {/* Matrix Klausul ISO 9001:2026 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">Status Kepatuhan Klausul ISO 9001:2026</h3>
                <p className="text-xs text-slate-500">Pemetaan bukti digital dan integrasi operasional pabrik perajangan cengkeh</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Status: Audit Ready
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-blue-900">Klausul 4: Konteks &amp; Stakeholder</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-[11px] text-slate-600">
                  PESTEL 6 dimensi agribisnis dan ekspektasi pabrikan kretek terpetakan lengkap.
                </p>
                <div className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md inline-block">
                  Bukti: Portal Stakeholder &amp; PESTEL
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-blue-900">Klausul 5: Kepemimpinan &amp; Kebijakan</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-[11px] text-slate-600">
                  Kebijakan Mutu disahkan Direksi; Tinjauan Manajemen berkala dipimpin Direktur Utama.
                </p>
                <div className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md inline-block">
                  Bukti: E-Policy &amp; Risalah RTM
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-blue-900">Klausul 6: Risiko &amp; Sasaran Mutu</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-[11px] text-slate-600">
                  Risk Register 5x5 terhubung delay mesin; OKR rendemen cengkeh &ge; 90% tercapai.
                </p>
                <div className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md inline-block">
                  Bukti: Heatmap 5x5 &amp; Dashboard OKR
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-blue-900">Klausul 7: Kompetensi &amp; E-Doc</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-[11px] text-slate-600">
                  Skill matrix operator mesin &amp; analis lab QC; EDMS SOP terkendali versi v4.0.
                </p>
                <div className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md inline-block">
                  Bukti: Skill Matrix &amp; E-Document SOP
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-blue-900">Klausul 8: Operasional &amp; Kontrol Mutu</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-[11px] text-slate-600">
                  QC per batch rendemen prima &ge; 88%, debu &le; 6.5%, kadar air 12%, Surat Jalan terbit otomatis.
                </p>
                <div className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md inline-block">
                  Bukti: Modul Produksi &amp; Surat Jalan
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-blue-900">Klausul 9 &amp; 10: Audit &amp; CAPA 6M</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-[11px] text-slate-600">
                  Audit internal terlaksana; seluruh temuan dianalisis metode 6M &amp; 5-Why dengan verifikasi efektivitas.
                </p>
                <div className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md inline-block">
                  Bukti: Laporan Audit &amp; Tiket CAPA
                </div>
              </div>
            </div>
          </div>

          {/* Kebijakan Mutu Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/60 pb-3">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-700" />
                <h3 className="text-sm font-bold text-blue-950">Kebijakan Mutu Digital PT Industri Rajang Cengkeh Prima</h3>
              </div>
              <span className="text-[11px] font-semibold text-blue-800">
                Disahkan oleh: {INITIAL_QUALITY_POLICY.approvedBy}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed italic bg-white/70 p-4 rounded-xl border border-blue-100">
              &ldquo;{INITIAL_QUALITY_POLICY.policyStatement}&rdquo;
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {INITIAL_QUALITY_POLICY.coreCommitments.map((c, idx) => (
                <div key={idx} className="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
                  <span className="text-[10px] font-bold text-blue-600 block">{c.clause}</span>
                  <span className="font-bold text-slate-900 block mt-0.5">{c.title}</span>
                  <span className="text-slate-600 text-[11px] block mt-1">{c.target}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: RISK REGISTER 5X5 & OKR */}
      {activeSubTab === 'risk-okr' && (
        <div className="space-y-6">
          {/* OKR Sasaran Mutu Pabrik */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">Objectives &amp; Key Results (OKR) Sasaran Mutu Pabrik</h3>
                <p className="text-xs text-slate-500">Target terukur pemenuhan klausul 6.2 ISO 9001:2026 triwulan berjalan</p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                Q4 2026
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {okrs.map((okr) => (
                <div key={okr.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-blue-700">{okr.code}</span>
                    <span className="text-slate-500 text-[11px]">{okr.clauseRef}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs leading-snug">{okr.objective}</h4>

                  <div className="space-y-2 pt-2 border-t border-slate-200/60">
                    {okr.keyResults.map((kr, idx) => (
                      <div key={idx} className="text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-600">{kr.metric}</span>
                          <span className="font-bold text-slate-900">
                            {kr.current} / {kr.target} {kr.unit}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              kr.status === 'Achieved' ? 'bg-emerald-500' : 'bg-blue-500'
                            }`}
                            style={{
                              width: `${Math.min(100, (kr.current / (kr.target || 1)) * 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-400">Pencapaian OKR:</span>
                    <span className="font-bold text-emerald-600">{okr.progressPct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Register Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">Risk Register Mutu &amp; Matriks Residual Risk 5x5</h3>
                <p className="text-xs text-slate-500">Evaluasi kemungkinan (Likelihood) x dampak (Impact) serta efektivitas mitigasi</p>
              </div>

              <select
                value={riskCategoryFilter}
                onChange={(e) => setRiskCategoryFilter(e.target.value)}
                className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Semua Kategori Risiko</option>
                <option value="Kualitas Produk">Kualitas Produk</option>
                <option value="Operasional Mesin">Operasional Mesin</option>
                <option value="Rantai Pasok">Rantai Pasok</option>
                <option value="K3 & Lingkungan">K3 &amp; Lingkungan</option>
              </select>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Kode &amp; Risiko Mutu</th>
                    <th className="p-3">Departemen</th>
                    <th className="p-3 text-center">L x I (Skor Awal)</th>
                    <th className="p-3">Rencana Pengendalian &amp; Mitigasi</th>
                    <th className="p-3 text-center">Residual Level</th>
                    <th className="p-3">Penanggung Jawab</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {risks
                    .filter((r) => riskCategoryFilter === 'ALL' || r.category === riskCategoryFilter)
                    .map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/60 transition">
                        <td className="p-3">
                          <span className="font-mono font-bold text-blue-700 block">{r.code}</span>
                          <span className="font-semibold text-slate-900 block mt-0.5">{r.title}</span>
                          <span className="text-[10px] text-slate-400">{r.category}</span>
                        </td>
                        <td className="p-3 text-slate-600">{r.department}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              r.level === 'High'
                                ? 'bg-rose-100 text-rose-800'
                                : r.level === 'Medium'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {r.likelihood} x {r.impact} = {r.riskScore} ({r.level})
                          </span>
                        </td>
                        <td className="p-3 text-slate-700 max-w-xs leading-relaxed">{r.actionPlan}</td>
                        <td className="p-3 text-center">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {r.targetResidualScore} ({r.residualLevel})
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 font-medium">{r.owner}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: CAPA DIGITAL & ANALISIS 6M */}
      {activeSubTab === 'capa' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Daftar Tindakan Korektif &amp; Pencegahan (CAPA Digital)
                </h3>
                <p className="text-xs text-slate-500">
                  Tindakan sistematis atas ketidaksesuaian batch, keausan mesin, temuan audit, dan komplain buyer
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={capaFilter}
                  onChange={(e) => setCapaFilter(e.target.value)}
                  className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Semua Status CAPA</option>
                  <option value="Open">Open (Baru)</option>
                  <option value="In Progress">In Progress (Berjalan)</option>
                  <option value="Closed">Closed (Selesai)</option>
                </select>

                <button
                  onClick={() => setIsAddCapaModalOpen(true)}
                  className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition shadow-xs active:scale-95"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ Buat CAPA</span>
                </button>
              </div>
            </div>

            {/* CAPA Cards */}
            <div className="space-y-3">
              {capas
                .filter((c) => capaFilter === 'ALL' || c.status === capaFilter)
                .map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl border border-slate-200 hover:border-blue-300 transition bg-white shadow-2xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-blue-700">{c.capaNumber}</span>
                        <span className="text-slate-300">&middot;</span>
                        <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                          Sumber: {c.source} {c.sourceRefId && `(${c.sourceRefId})`}
                        </span>
                        <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                          Akar 6M: {c.rootCauseCategory}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            c.status === 'Closed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.status === 'In Progress'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {c.status}
                        </span>
                        {c.status !== 'Closed' && (
                          <button
                            onClick={() => handleCloseCapa(c.id)}
                            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition"
                          >
                            Verifikasi &amp; Tutup CAPA
                          </button>
                        )}
                      </div>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900">{c.issueTitle}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{c.nonconformanceDetails}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 text-xs border border-slate-100">
                      <div>
                        <strong className="text-slate-700 block mb-0.5">Analisis Akar Masalah (5-Whys):</strong>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{c.rootCauseAnalysis}</p>
                      </div>
                      <div>
                        <strong className="text-slate-700 block mb-0.5">Tindakan Korektif:</strong>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{c.correctiveAction}</p>
                      </div>
                      <div>
                        <strong className="text-slate-700 block mb-0.5">Tindakan Pencegahan Berulang:</strong>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{c.preventiveAction}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>
                        PIC: <strong className="text-slate-700">{c.assignedTo}</strong> &middot; Target:{' '}
                        {c.targetDate}
                      </span>
                      {c.effectivenessVerified && (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Efektivitas Terverifikasi: {c.verifiedBy}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: E-AUDIT INTERNAL & KEPUASAN PELANGGAN */}
      {activeSubTab === 'audit-feedback' && (
        <div className="space-y-6">
          {/* Feedback Pelanggan Pabrik Rokok */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Kepuasan &amp; Feedback Pelanggan Industri Kretek (Klausul 9.1.2)
                </h3>
                <p className="text-xs text-slate-500">
                  Evaluasi kinerja mutu dari pabrikan rokok kretek nasional terkemuka
                </p>
              </div>
              <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-xl text-xs font-bold">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span>Rata-rata Rating: {avgCsat} / 5.0</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedbacks.map((f) => (
                <div key={f.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{f.clientName}</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < f.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md inline-block">
                    Aspek: {f.aspectRated}
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed italic">&ldquo;{f.feedbackText}&rdquo;</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/50">
                    <span>Tanggal: {f.date}</span>
                    <span className="text-emerald-600 font-semibold">{f.followUpStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Mutu Internal */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Riwayat &amp; Temuan Audit Mutu Internal (Klausul 9.2)
              </h3>
              <p className="text-xs text-slate-500">
                Pemeriksaan kepatuhan proses pengolahan cengkeh terhadap standar ISO 9001:2026
              </p>
            </div>

            <div className="space-y-3">
              {audits.map((a) => (
                <div key={a.id} className="p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-blue-700">{a.auditNumber}</span>
                      <span className="text-slate-400">&middot;</span>
                      <span className="text-xs font-semibold text-slate-900">{a.scope}</span>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {a.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span>Auditee: <strong>{a.auditedDepartment}</strong></span>
                    <span>Lead Auditor: <strong>{a.leadAuditor}</strong></span>
                    <span>Tanggal: <strong>{a.auditDate}</strong></span>
                  </div>

                  <div className="flex items-center gap-2 pt-1 text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-semibold text-[11px]">
                      Major: {a.findingsCount.major}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold text-[11px]">
                      Minor: {a.findingsCount.minor}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-[11px]">
                      Peluang Peningkatan (OFI): {a.findingsCount.ofi}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: E-DOCUMENT MANAGEMENT SYSTEM */}
      {activeSubTab === 'edms' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  E-Document Management System (EDMS - Klausul 7.5)
                </h3>
                <p className="text-xs text-slate-500">
                  Daftar induk dokumen mutu terkendali: SOP, Instruksi Kerja, Manual Mutu, dan Formulir Pengujian
                </p>
              </div>

              <select
                value={docCategoryFilter}
                onChange={(e) => setDocCategoryFilter(e.target.value)}
                className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Semua Kategori Dokumen</option>
                <option value="SOP">SOP (Standar Operasional)</option>
                <option value="Instruksi Kerja (IK)">Instruksi Kerja (IK)</option>
                <option value="Manual Mutu">Manual Mutu</option>
              </select>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">No. Dokumen &amp; Judul</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3 text-center">Versi</th>
                    <th className="p-3">Tanggal Berlaku</th>
                    <th className="p-3">Klausul Ref</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3">Disetujui Oleh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {docs
                    .filter((d) => docCategoryFilter === 'ALL' || d.category === docCategoryFilter)
                    .map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/60 transition">
                        <td className="p-3">
                          <span className="font-mono font-bold text-blue-700 block">{d.docNumber}</span>
                          <span className="font-semibold text-slate-900 block mt-0.5">{d.title}</span>
                        </td>
                        <td className="p-3 text-slate-600 font-medium">{d.category}</td>
                        <td className="p-3 text-center font-mono font-bold text-slate-800">{d.version}</td>
                        <td className="p-3 text-slate-600">{d.effectiveDate}</td>
                        <td className="p-3 text-blue-700 font-medium">{d.clauseRef}</td>
                        <td className="p-3 text-center">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {d.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700 font-medium">{d.approvedBy}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: SKILL MATRIX & PESTEL */}
      {activeSubTab === 'skills-pestel' && (
        <div className="space-y-6">
          {/* Skill Matrix Karyawan */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Digital Skill Matrix &amp; Kompetensi Karyawan (Klausul 7.2)
              </h3>
              <p className="text-xs text-slate-500">
                Pemetaan keahlian teknis operator mesin rotary, asah pisau, analis QC, dan staf gudang
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skills.map((s) => (
                <div key={s.employeeId} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{s.name}</h4>
                      <p className="text-[11px] text-slate-500">{s.position} &middot; {s.department}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Kompetensi: {s.overallCompetencyPct}%
                    </span>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200/60">
                    {s.skills.map((sk, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 truncate max-w-[220px]">{sk.skillName}</span>
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          <span className="font-bold text-slate-800">Lv {sk.actualLevel}</span>
                          <span className="text-slate-400">/ Lv {sk.requiredLevel}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block mb-1">Sertifikasi &amp; Lisensi:</span>
                    <div className="flex flex-wrap gap-1">
                      {s.certifications.map((c, i) => (
                        <span key={i} className="text-[10px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PESTEL 6 Dimensi Agribisnis */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Analisis Konteks Eksternal &amp; Internal PESTEL (Klausul 4.1)
              </h3>
              <p className="text-xs text-slate-500">
                Pemantauan faktor makro yang memengaruhi mutu dan kelangsungan industri perajangan cengkeh
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {pestel.map((p) => (
                <div key={p.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">{p.category}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.type === 'Peluang' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {p.type}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs leading-snug">{p.title}</h4>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{p.description}</p>
                  <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                    Aksi: <strong>{p.strategicAction}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL BUAT CAPA BARU */}
      {isAddCapaModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Buat Tiket CAPA Digital</h3>
                  <p className="text-xs text-slate-500">Corrective and Preventive Action - Klausul 10.2 ISO 9001:2026</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddCapaModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCapaSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Judul Ketidaksesuaian / Isu Mutu *</label>
                <input
                  type="text"
                  required
                  placeholder="mis. Persentase debu siklon batch BAT-003 melampaui batas 6.5%"
                  value={newCapaTitle}
                  onChange={(e) => setNewCapaTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Sumber Masalah</label>
                  <select
                    value={newCapaSource}
                    onChange={(e) => setNewCapaSource(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Inspeksi QC Batch">Inspeksi QC Batch</option>
                    <option value="Kerusakan Mesin">Kerusakan Mesin</option>
                    <option value="Temuan Audit Internal">Temuan Audit Internal</option>
                    <option value="Komplain Pelanggan">Komplain Pelanggan</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kategori Akar Masalah 6M</label>
                  <select
                    value={newCapaRootCause}
                    onChange={(e) => setNewCapaRootCause(e.target.value as RootCause6M)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 font-semibold text-purple-700"
                  >
                    <option value="Machine (Mesin)">Machine (Mesin &amp; Pisau)</option>
                    <option value="Man (SDM)">Man (SDM &amp; Operator)</option>
                    <option value="Method (Metode)">Method (Metode &amp; SOP)</option>
                    <option value="Material (Bahan)">Material (Bahan Mentah Cengkeh)</option>
                    <option value="Measurement (Pengukuran)">Measurement (Alat Ukur / Moisture)</option>
                    <option value="Milieu (Lingkungan)">Milieu (Lingkungan &amp; Siklon)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Rincian Masalah / Non-Conformance Details *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Jelaskan temuan fakta di lapangan, nilai terukur, dan deviasi terhadap standar mutu..."
                  value={newCapaDetails}
                  onChange={(e) => setNewCapaDetails(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Analisis Akar Masalah (5-Whys Method)</label>
                <textarea
                  rows={2}
                  placeholder="Why 1 -> Why 2 -> Why 3: Telusuri hingga ke penyebab fundamental sistemik..."
                  value={newCapa5Why}
                  onChange={(e) => setNewCapa5Why(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tindakan Korektif (Perbaikan)</label>
                  <input
                    type="text"
                    placeholder="mis. Asah dan ganti pisau rotary cadangan"
                    value={newCapaCorrective}
                    onChange={(e) => setNewCapaCorrective(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tindakan Pencegahan (Preventive)</label>
                  <input
                    type="text"
                    placeholder="mis. Pasang alarm jam aus di layar operator"
                    value={newCapaPreventive}
                    onChange={(e) => setNewCapaPreventive(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddCapaModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md transition active:scale-95"
                >
                  Terbitkan CAPA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
