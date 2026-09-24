import { CertificationStandard } from './certificate';

export interface ComplianceMatrixRule {
  id: string;
  tenantId: string;
  productCategory: string; // e.g. "Coton Biologique", "Bois & Emballages", "Café & Cacao"
  requiredStandards: CertificationStandard[];
  acceptableAlternativeStandards: CertificationStandard[];
  criticality: 'STRICT_BLOCK' | 'WARNING_ONLY' | 'CONDITIONAL';
  applicableCountries?: string[]; // Empty for all
  enforceFacilityAudit: boolean;
  notes: string;
  updatedAt: string;
}
