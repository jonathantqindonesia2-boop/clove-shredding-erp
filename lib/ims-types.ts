import { TabKey } from '../components/TabNavigation';

// ==========================================
// 1. PESTEL & STAKEHOLDER PORTAL (Klausul 4)
// ==========================================
export type PestelCategory = 'Politik' | 'Ekonomi' | 'Sosial' | 'Teknologi' | 'Lingkungan' | 'Hukum';
export type IssueType = 'Risiko' | 'Peluang';
export type IssueImpact = 'Tinggi' | 'Sedang' | 'Rendah';

export interface PestelIssue {
  id: string;
  category: PestelCategory;
  title: string;
  type: IssueType;
  impact: IssueImpact;
  description: string;
  strategicAction: string;
  affectedClauses: string[];
  owner: string;
}

export interface StakeholderExpectation {
  id: string;
  stakeholder: string;
  category: 'Klien Industri' | 'Pemasok Petani' | 'Regulator / Pemerintah' | 'Karyawan Pabrik' | 'Masyarakat Sekitar' | 'Direksi & Investor';
  needsAndExpectations: string;
  qualityImpact: string;
  complianceMonitoring: string;
  satisfactionRating: number; // 1-5
}

// ==========================================
// 2. EXECUTIVE & QUALITY POLICY (Klausul 5 & 9.3)
// ==========================================
export interface QualityPolicy {
  vision: string;
  mission: string[];
  policyStatement: string;
  approvedBy: string;
  approvedDate: string;
  nextReviewDate: string;
  coreCommitments: { title: string; target: string; clause: string }[];
}

export interface ManagementReviewAgenda {
  id: string;
  title: string;
  period: string;
  status: 'Completed' | 'Scheduled' | 'In Progress';
  chairperson: string;
  keyOutputs: string[];
}

// ==========================================
// 3. RISK REGISTER & OKR (Klausul 6)
// ==========================================
export type RiskLevel = 'Extreme' | 'High' | 'Medium' | 'Low';

export interface QualityRisk {
  id: string;
  code: string;
  title: string;
  category: 'Kualitas Produk' | 'Operasional Mesin' | 'Rantai Pasok' | 'K3 & Lingkungan' | 'Kepatuhan Regulasi';
  department: string;
  likelihood: number; // 1-5
  impact: number;     // 1-5
  riskScore: number;  // likelihood * impact
  level: RiskLevel;
  existingControls: string;
  actionPlan: string;
  targetResidualScore: number;
  residualLevel: RiskLevel;
  owner: string;
  status: 'Open' | 'Mitigated' | 'Closed';
}

export interface QualityOKR {
  id: string;
  code: string;
  objective: string;
  keyResults: {
    metric: string;
    target: number;
    current: number;
    unit: string;
    status: 'On Track' | 'At Risk' | 'Achieved';
  }[];
  clauseRef: string;
  quarter: string;
  department: string;
  progressPct: number;
}

// ==========================================
// 4. SKILL MATRIX & TRAINING (Klausul 7.2 & 7.3)
// ==========================================
export interface EmployeeSkillRecord {
  employeeId: string;
  name: string;
  position: string;
  department: string;
  skills: {
    skillName: string;
    requiredLevel: number; // 1-4
    actualLevel: number;   // 1-4
    gap: number;           // required - actual
  }[];
  overallCompetencyPct: number;
  certifications: string[];
}

export interface TrainingProgram {
  id: string;
  title: string;
  trainer: string;
  targetAudience: string;
  scheduleDate: string;
  durationHours: number;
  status: 'Completed' | 'Scheduled' | 'Ongoing';
  attendanceCount: number;
  effectivenessScore: number; // out of 100
}

// ==========================================
// 5. E-DOCUMENT MANAGEMENT SYSTEM (Klausul 7.5)
// ==========================================
export type DocumentCategory = 'SOP' | 'Instruksi Kerja (IK)' | 'Formulir QC' | 'Manual Mutu' | 'Spesifikasi Bahan';

export interface ControlledDocument {
  id: string;
  docNumber: string;
  title: string;
  category: DocumentCategory;
  version: string;
  effectiveDate: string;
  reviewDate: string;
  status: 'Effective' | 'Under Review' | 'Draft' | 'Superseded';
  preparedBy: string;
  approvedBy: string;
  downloadUrl?: string;
  clauseRef: string;
}

// ==========================================
// 6. E-AUDIT & CUSTOMER FEEDBACK (Klausul 9.1.2 & 9.2)
// ==========================================
export type AuditFindingType = 'Major' | 'Minor' | 'Opportunity for Improvement (OFI)';

export interface InternalAuditRecord {
  id: string;
  auditNumber: string;
  scope: string;
  auditDate: string;
  leadAuditor: string;
  auditedDepartment: string;
  clausesCovered: string[];
  findingsCount: {
    major: number;
    minor: number;
    ofi: number;
  };
  status: 'Closed' | 'In Follow-Up' | 'Open';
}

export interface CustomerFeedbackRecord {
  id: string;
  clientName: string;
  date: string;
  aspectRated: 'Kualitas Rajangan Prima' | 'Kadar Debu & Abu' | 'Ketepatan Waktu (OTIF)' | 'Respons Layanan';
  rating: number; // 1-5
  feedbackText: string;
  followUpStatus: 'Resolved' | 'Under Review' | 'No Action Needed';
}

// ==========================================
// 7. CAPA DIGITAL (Klausul 10.2)
// ==========================================
export type CapaSource = 'Inspeksi QC Batch' | 'Kerusakan Mesin' | 'Temuan Audit Internal' | 'Komplain Pelanggan';
export type RootCause6M = 'Man (SDM)' | 'Machine (Mesin)' | 'Method (Metode)' | 'Material (Bahan)' | 'Measurement (Pengukuran)' | 'Milieu (Lingkungan)';
export type CapaStatus = 'Open' | 'In Progress' | 'Overdue' | 'Closed';

export interface CapaRecord {
  id: string;
  capaNumber: string;
  source: CapaSource;
  sourceRefId?: string; // Batch ID or Machine ID or Audit ID
  issueTitle: string;
  department: string;
  nonconformanceDetails: string;
  immediateCorrection: string;
  rootCauseCategory: RootCause6M;
  rootCauseAnalysis: string; // 5-Whys summary
  correctiveAction: string;
  preventiveAction: string;
  assignedTo: string;
  targetDate: string;
  completionDate?: string;
  status: CapaStatus;
  effectivenessVerified: boolean;
  verifiedBy?: string;
}

// ==========================================
// 8. IMS 360° CONSOLIDATED METRICS
// ==========================================
export interface Ims360Summary {
  overallHealthScore: number; // out of 100
  complianceGrade: 'A - Excellent' | 'B - Good' | 'C - Needs Improvement';
  pdcaScores: {
    plan: number;  // Klausul 4, 5, 6
    do: number;    // Klausul 7, 8
    check: number; // Klausul 9
    act: number;   // Klausul 10
  };
  openCapaCount: number;
  overdueCapaCount: number;
  highRisksCount: number;
  effectiveDocsCount: number;
  auditFindingsOpen: number;
  averageCustomerCsat: number;
}
