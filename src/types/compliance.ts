export type FacilityType =
  | 'FARM_COOPERATIVE'
  | 'FACTORY_MILL'
  | 'WAREHOUSE'
  | 'FORESTRY_PLOT';

export interface FieldAuditReport {
  id: string;
  tenantId: string;
  supplierId: string;
  supplierName: string;
  auditorName: string;
  auditDate: string;
  locationGps: string;
  facilityType: FacilityType;
  standardsAudited: string[];
  childLaborFreeVerified: boolean;
  safeWorkingConditionsVerified: boolean;
  fairWageVerified: boolean;
  environmentalComplianceScore: number; // 0 to 100
  evidencePhotosCount: number;
  notes: string;
  syncStatus: 'LOCAL_OFFLINE' | 'SYNCED_CLOUD';
  cryptoHash: string;
}

export type GdprLegalBasis =
  | 'CSRD_LEGAL_OBLIGATION'
  | 'CONTRACT_PERFORMANCE'
  | 'EXPLICIT_CONSENT';

export type GdprRecordStatus =
  | 'ACTIVE'
  | 'ANONYMIZED_RIGHT_TO_FORGET'
  | 'RETENTION_EXPIRED';

export interface GdprDataSubject {
  id: string;
  tenantId: string;
  fullName: string;
  role: string;
  company: string;
  email: string;
  personalDataCategories: string[];
  legalBasis: GdprLegalBasis;
  consentDate: string;
  retentionExpiryDate: string;
  status: GdprRecordStatus;
  lastConsentVerifiedAt: string;
  anonymizedAt?: string;
  anonymizationProofHash?: string;
}

export type Soc2Category =
  | 'SECURITY'
  | 'AVAILABILITY'
  | 'PROCESSING_INTEGRITY'
  | 'CONFIDENTIALITY'
  | 'PRIVACY';

export interface Soc2Control {
  id: string;
  category: Soc2Category;
  controlId: string; // e.g. "CC6.1", "CC6.6", "CC6.7", "A1.2"
  title: string;
  description: string;
  status: 'COMPLIANT' | 'NEEDS_REVIEW' | 'EXCEPTION';
  evidence: string;
  frequency: 'CONTINUOUS_AUTOMATED' | 'QUARTERLY' | 'ANNUAL';
  lastAuditedAt: string;
}
