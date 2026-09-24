export type CertificateStatus =
  | 'VALID'
  | 'EXPIRING_SOON'
  | 'EXPIRED'
  | 'SUSPENDED'
  | 'REVOKED'
  | 'NOT_FOUND'
  | 'UNDER_REVIEW'
  | 'MISMATCH'
  | 'UNKNOWN';

export type CertificationStandard =
  | 'GOTS'
  | 'FSC'
  | 'PEFC'
  | 'OEKO_TEX_100'
  | 'OEKO_TEX_STEP'
  | 'ECOCERT_BIO'
  | 'FAIRTRADE'
  | 'GRS'
  | 'ISO_14001';

export type VerificationOutcome = 'MATCH' | 'MISMATCH' | 'NOT_FOUND' | 'REGISTRY_UNAVAILABLE' | 'PENDING';

export interface CertificateScope {
  geographicalRegions: string[];
  productCategories: string[];
  coveredProducts: string[];
  coveredFacilities: string[];
  excludedOperations?: string[];
}

export interface VerificationAnomaly {
  field: 'LEGAL_NAME' | 'EXPIRY_DATE' | 'CERTIFICATE_NUMBER' | 'PRODUCT_SCOPE' | 'FACILITY_LOCATION' | 'STATUS';
  documentValue: string;
  officialValue: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  description: string;
}

export interface OfficialRegistrySnapshot {
  providerCode: string;
  checkedAt: string;
  officialStatus: CertificateStatus;
  officialHolderName: string;
  officialExpiryDate: string;
  officialScopeSummary?: string;
  registryUrl?: string;
}

export interface Certificate {
  id: string;
  tenantId: string;
  supplierId: string;
  supplierName: string;
  certificationStandard: CertificationStandard;
  standardLabel: string;
  certificationBody: string; // e.g. "Control Union", "Ecocert SA", "Bureau Veritas", "SGS"
  certificateNumber: string; // e.g. "CU-849301-GOTS-2024"
  issueDate: string;
  expiryDate: string;
  status: CertificateStatus;
  scope: CertificateScope;
  officialRegistryUrl?: string;
  officialRegistrySnapshot?: OfficialRegistrySnapshot;
  lastVerifiedAt?: string;
  nextVerificationScheduledAt?: string;
  verificationOutcome: VerificationOutcome;
  confidenceScore: number; // 0 to 100
  confidenceReasons: string[];
  anomalies: VerificationAnomaly[];
  originalDocumentName?: string;
  fileSizeBytes?: number;
  uploadedAt: string;
  uploadedByUserId: string;
  rawOcrTextSnippet?: string;
  notes?: string;
}
