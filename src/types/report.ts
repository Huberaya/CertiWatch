export type CsrdEsrsStandard = 'ESRS_E4_BIODIVERSITY' | 'ESRS_S2_WORKERS' | 'ESRS_G1_CONDUCT';

export type EudrCommodityType =
  | 'WOOD_TIMBER'
  | 'PAPER_PACKAGING'
  | 'COCOA'
  | 'COFFEE'
  | 'RUBBER'
  | 'SOY'
  | 'PALM_OIL';

export type EudrComplianceStatus = 'COMPLIANT' | 'WARNING_DATA_MISSING' | 'NON_COMPLIANT_BLOCKED';

export interface EudrPlotDeclaration {
  id: string;
  supplierId: string;
  commodity: EudrCommodityType;
  countryOfProduction: string;
  plotReference: string;
  hasGpsCoordinates: boolean;
  gpsPolygonOrPoint: string;
  deforestationCutoffDateMet: boolean; // Must be post-31 Dec 2020 zero deforestation
  legalityVerified: boolean;
  tracesNtDdsReference?: string;
  status: EudrComplianceStatus;
  riskAssessment: 'NEGLIGIBLE' | 'STANDARD' | 'HIGH';
  verifiedAt: string;
}

export interface CsrdEsrsScorecard {
  esrsE4BiodiversityCoverage: number; // 0-100%
  esrsS2SocialAuditedCoverage: number; // 0-100%
  esrsG1ConductCoverage: number; // 0-100%
  overallEsgAlignmentScore: number; // 0-100
  totalSuppliersInScope: number;
  coveredSuppliersCount: number;
  criticalGapsCount: number;
}

export interface OfficialAuditPackConfig {
  reportTitle: string;
  fiscalYear: string;
  periodStart: string;
  periodEnd: string;
  leadAuditor: string;
  auditBody: string; // e.g. "KPMG Audits", "PwC ESG Assurance", "EY France", "Interne CSR"
  tenantId: string;
  includeCertificatesDetails: boolean;
  includeCryptoProofSeal: boolean;
  includeEudrAnnexes: boolean;
  includeCapaRemediation: boolean;
}

export interface GeneratedAuditPack {
  id: string;
  referenceNumber: string; // e.g. AUDIT-2026-CW-0491
  generatedAt: string;
  config: OfficialAuditPackConfig;
  executiveSummary: {
    totalSuppliersAudited: number;
    overallComplianceRate: number;
    activeCertificatesCount: number;
    expiredRevokedCount: number;
    derogationsApprovedCount: number;
    unresolvedCriticalAlertsCount: number;
  };
  cryptoSeal: {
    blockNumber: number;
    sealHash: string;
    previousHash: string;
    algorithm: string;
    verifiedIntegrity: boolean;
  };
  standardsSummary: Array<{
    standard: string;
    validCount: number;
    expiredCount: number;
    coveragePercent: number;
  }>;
  eudrSummary: {
    totalPlotsDeclared: number;
    gpsVerifiedRate: number;
    eudrComplianceRate: number;
    highRiskOriginsCount: number;
  };
}

export interface SupplierPortalSession {
  supplierId: string;
  supplierName: string;
  accessToken: string;
  contactEmail: string;
  lastAccessDate?: string;
  declarationStatus: 'SUBMITTED' | 'IN_REVIEW' | 'PENDING_UPLOAD';
  uploadedDocumentsCount: number;
}
