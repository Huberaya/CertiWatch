export type DerogationStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL_L1'
  | 'PENDING_APPROVAL_L2'
  | 'PENDING_APPROVAL_L3'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'REVOKED';

export type DerogationRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type EidasSignatureType = 'EIDAS_ADVANCED' | 'EIDAS_QUALIFIED';
export type RgsLevel = 'RGS*' | 'RGS**';

export interface EidasSignatureRecord {
  step: number;
  signerName: string;
  signerEmail: string;
  signerRole: string;
  signedAt: string;
  signatureType: EidasSignatureType;
  rgsLevel: RgsLevel;
  certificateFingerprintSha256: string;
  padesSignatureHash: string;
  status: 'PENDING' | 'SIGNED' | 'REJECTED';
  comments?: string;
}

export interface QualityDerogation {
  id: string; // e.g. DEROG-2026-0042
  title: string;
  supplierId: string;
  supplierName: string;
  productCategory: string;
  standardTargeted: string; // e.g. GOTS, ECOCERT, FSC
  reasonCode:
    | 'TEMPORARY_RENEWAL_AUDIT_IN_PROGRESS'
    | 'FORCE_MAJEURE_SUPPLY_CHAIN'
    | 'TECHNICAL_EQUIVALENCE_APPROVED'
    | 'LABORATORY_TESTING_PENDING';
  justificationText: string;
  riskAssessment: DerogationRiskLevel;
  mitigationPlan: string;
  maxAuthorizedSpendEur: number;
  currentConsumedSpendEur: number;
  validFrom: string;
  validUntil: string;
  status: DerogationStatus;
  requiredTier: 1 | 2 | 3;
  currentTier: 1 | 2 | 3;
  signatures: EidasSignatureRecord[];
  createdAt: string;
  updatedAt: string;
  merkleLeafIndex?: number;
  merkleProofHash?: string;
}
