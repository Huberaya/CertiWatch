import { CertificationStandard } from './certificate';

export type CountryScopeCondition = 'ALL_COUNTRIES' | 'NON_EU_ONLY' | 'SPECIFIC_COUNTRIES';

export interface VolumeThresholdCondition {
  enabled: boolean;
  minAnnualSpendEur: number;
}

export interface ComplianceMatrixRule {
  id: string;
  tenantId: string;
  productCategory: string; // e.g. "Coton Biologique", "Bois & Emballages", "Café & Cacao"
  requiredStandards: CertificationStandard[];
  acceptableAlternativeStandards: CertificationStandard[];
  criticality: 'STRICT_BLOCK' | 'WARNING_ONLY' | 'CONDITIONAL';
  countryCondition: CountryScopeCondition;
  applicableCountries?: string[]; // ISO codes if SPECIFIC_COUNTRIES
  volumeThreshold?: VolumeThresholdCondition;
  enforceFacilityAudit: boolean;
  notes: string;
  updatedAt: string;
}

export interface OrderComplianceCheckResult {
  isCompliant: boolean;
  decision: 'ALLOWED' | 'BLOCKED' | 'REQUIRES_APPROVAL';
  reasons: string[];
  ruleApplied?: ComplianceMatrixRule;
  missingStandards: CertificationStandard[];
  uncoveredProducts: string[];
  supplierName: string;
  evaluatedAt: string;
}

export interface SupplierMatrixComplianceSummary {
  supplierId: string;
  supplierName: string;
  compliantCategories: string[];
  nonCompliantCategories: string[];
  missingStandards: CertificationStandard[];
  status: 'FULLY_COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'CRITICAL_NON_COMPLIANT';
}
