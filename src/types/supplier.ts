export type SupplierRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type SupplierStatus = 'ACTIVE' | 'ON_HOLD' | 'BLOCKED' | 'ARCHIVED';

export type SupplierTier = 'TIER_1' | 'TIER_2' | 'TIER_3';
export type SpendCriticality = 'STRATEGIC' | 'MAJOR' | 'STANDARD' | 'SPOT';

export interface SupplierContact {
  id: string;
  role: 'QUALITY' | 'COMMERCIAL' | 'CSR' | 'EXECUTIVE';
  name: string;
  email: string;
  phone?: string;
  isPrimary: boolean;
}

export type AuditConclusion = 'COMPLIANT' | 'MINOR_FINDINGS' | 'MAJOR_NON_CONFORMITY';
export type CapaStatus = 'COMPLETED' | 'IN_PROGRESS' | 'OVERDUE' | 'NOT_APPLICABLE';

export interface SupplierAuditRecord {
  id: string;
  date: string;
  auditorName: string;
  auditType: 'ON_SITE_ANNUAL' | 'DOCUMENTARY_AUDIT' | 'UNANNOUNCED_INSPECTION' | 'THIRD_PARTY_AUDIT';
  score: number; // 0 - 100
  conclusion: AuditConclusion;
  capaStatus: CapaStatus;
  notes: string;
  nextScheduledDate?: string;
}

export interface MultiFactorRiskScore {
  overallScore: number; // 0 to 100 (0 = parfait/aucun risque, 100 = risque maximal)
  expirationScore: number; // 0 to 30
  revocationScore: number; // 0 to 40
  countryRiskScore: number; // 0 to 15
  coverageRiskScore: number; // 0 to 15
  riskFactors: string[];
  recommendedActions: string[];
  lastCalculatedAt: string;
}

export type ErpBlockStatus = 'ALLOWED' | 'BLOCKED' | 'TEMPORARY_DEROGATION';

export interface SupplierErpConfig {
  erpSystem: 'SAP S/4HANA' | 'Oracle NetSuite' | 'Microsoft Dynamics 365' | 'Coupa Procurement' | 'Generic ERP';
  erpVendorNumber: string;
  blockStatus: ErpBlockStatus;
  blockedReason?: string;
  blockedAt?: string;
  blockedBy?: string;
  derogationExpiresAt?: string;
  derogationJustification?: string;
}

export interface Supplier {
  id: string;
  tenantId: string;
  legalName: string;
  tradeName?: string;
  country: string;
  countryCode: string; // ISO 2-letter code e.g. FR, PT, IN, TR
  address: string;
  internalId: string; // e.g. SUP-2024-0089
  businessRegistrationNumber: string; // SIRET / VAT / Tax ID / DUNS
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  additionalContacts?: SupplierContact[];
  productCategories: string[]; // e.g. ["Coton Bio", "Fils & Tissus", "Teinture"]
  status: SupplierStatus;
  riskLevel: SupplierRiskLevel;
  tier?: SupplierTier;
  spendCriticality?: SpendCriticality;
  multiFactorRisk?: MultiFactorRiskScore;
  auditHistory?: SupplierAuditRecord[];
  erpConfig?: SupplierErpConfig;
  totalCertificatesCount?: number;
  validCertificatesCount?: number;
  criticalIssuesCount?: number;
  erpBlockedReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
