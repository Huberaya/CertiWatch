export type HumanRightsRiskTopic =
  | 'CHILD_LABOUR' // Conventions OIT 138 & 182
  | 'FORCED_LABOUR' // Conventions OIT 29 & 105
  | 'FREEDOM_OF_ASSOCIATION' // Conventions OIT 87 & 98
  | 'HEALTH_AND_SAFETY' // Conditions physiques, EPI, sécurité usine
  | 'LIVING_WAGE' // Salaire vital décent vs SMIC local
  | 'DISCRIMINATION_HARASSMENT' // Égalité professionnelle & dignité
  | 'INDIGENOUS_PEOPLES_RIGHTS' // Consentement préalable libre & éclairé (FPIC)
  | 'ENVIRONMENTAL_DAMAGE' // Pollution des cours d'eau & dégradation des sols
  | 'BUSINESS_ETHICS_ANTI_CORRUPTION'; // Loi Sapin II & FCPA

export type CsdddRiskSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type CsdddRiskProbability = 'HIGH' | 'MEDIUM' | 'LOW';

export type SupplierDueDiligenceStatus =
  | 'COMPLIANT_VERIFIED' // Vigilance complète, charte signée, audit valide
  | 'IN_PROGRESS_ASSESSMENT' // Auto-évaluation en cours d'analyse
  | 'CAPA_REQUIRED' // Écart constaté, plan de remédiation en cours
  | 'NON_COMPLIANT_HIGH_RISK'; // Risque sévère non résolu, blocage ERP recommandé

export type SocialAuditStandard =
  | 'SMETA_4_PILLARS'
  | 'SA8000'
  | 'BSCI'
  | 'FAIRTRADE_USA'
  | 'ECOVADIS_GOLD'
  | 'NONE';

export interface EvaluatedRiskItem {
  topic: HumanRightsRiskTopic;
  labelFr: string;
  severity: CsdddRiskSeverity;
  probability: CsdddRiskProbability;
  riskScore: number; // 1 to 100
  mitigationMeasure: string;
  isCompliant: boolean;
}

export interface SupplierDueDiligenceRecord {
  supplierId: string;
  supplierName: string;
  country: string;
  countryRiskIndex: number; // 0 (sûr) à 100 (risque extrême selon ITUC & UNICEF)
  tier: 1 | 2;
  spendCriticality: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: SupplierDueDiligenceStatus;
  overallDueDiligenceScore: number; // 0 to 100
  // Audit social & preuves
  socialAuditType: SocialAuditStandard;
  socialAuditScore: number;
  socialAuditDate: string;
  socialAuditExpiryDate: string;
  socialAuditBody: string; // e.g. "Bureau Veritas", "SGS", "Intertek", "Afnor"
  // Charte Achats Responsables eIDAS
  charterSigned: boolean;
  charterSignedDate?: string;
  charterSignatoryName?: string;
  charterSignatoryRole?: string;
  charterEidasHash?: string;
  // Évaluations spécifiques
  childLaborZeroToleranceVerified: boolean;
  forcedLaborRiskFreeVerified: boolean;
  livingWageAssessed: boolean;
  activeCapaCount: number;
  grievancesCount: number;
  risks: EvaluatedRiskItem[];
}

export type GrievanceReporterType =
  | 'ANONYMOUS_WORKER'
  | 'TRADE_UNION_DELEGATE'
  | 'LOCAL_COMMUNITY'
  | 'NGO_ALERT'
  | 'INTERNAL_AUDITOR';

export type GrievanceStatus =
  | 'NEW_ALERT'
  | 'INVESTIGATION_UNDERWAY'
  | 'CAPA_IN_REMEDIATION'
  | 'RESOLVED_CLOSED'
  | 'DISMISSED';

export interface WhistleblowingGrievance {
  id: string;
  referenceNumber: string; // e.g. "VIGILANCE-GRV-2026-018"
  supplierId: string;
  supplierName: string;
  country: string;
  topic: HumanRightsRiskTopic;
  reporterType: GrievanceReporterType;
  reportedAt: string;
  severity: CsdddRiskSeverity;
  status: GrievanceStatus;
  title: string;
  description: string;
  evidenceFilesCount: number;
  assignedInvestigator: string;
  remediationPlanSummary?: string;
  resolvedAt?: string;
}

export interface SupplierCapaItem {
  id: string;
  supplierId: string;
  supplierName: string;
  title: string;
  findingTopic: HumanRightsRiskTopic;
  severity: CsdddRiskSeverity;
  rootCause: string;
  requiredAction: string;
  assignedManager: string;
  deadline: string;
  status: 'OPEN' | 'EVIDENCE_SUBMITTED' | 'VERIFIED_CLOSED';
  progressPercent: number;
  proofDocumentUri?: string;
}

export interface VigilancePlanSummary {
  reportingYear: number;
  totalSuppliersMonitored: number;
  compliantSuppliersCount: number;
  inProgressCount: number;
  capaRequiredCount: number;
  highRiskCount: number;
  charterSignatureRatePercent: number;
  socialAuditCoverageRatePercent: number;
  openGrievancesCount: number;
  resolvedGrievancesCount: number;
  legalBasis: 'DIRECTIVE_UE_2024_1760_CSDDD' | 'LOI_FRANCAISE_DEVOIR_VIGILANCE_2017';
}
