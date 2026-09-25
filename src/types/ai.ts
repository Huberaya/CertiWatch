export type CopilotRole = 'user' | 'assistant' | 'system';

export interface CopilotActionSuggestion {
  type: 'NAVIGATE_TAB' | 'SIMULATE_ORDER' | 'OPEN_SUPPLIER' | 'TRIGGER_REMINDER';
  label: string;
  payload: Record<string, any>;
}

export interface CopilotMessage {
  id: string;
  role: CopilotRole;
  content: string;
  timestamp: string;
  actionSuggestions?: CopilotActionSuggestion[];
  isStreaming?: boolean;
}

export interface SupplierSubstituteCandidate {
  supplierId: string;
  supplierName: string;
  country: string;
  countryCode: string;
  matchScore: number; // 0 to 100%
  riskScore: number; // multi-factor 0-100
  erpBlockStatus: 'ALLOWED' | 'BLOCKED' | 'TEMPORARY_DEROGATION';
  validCertifications: string[];
  productCategories: string[];
  pros: string[];
  cautions: string[];
  annualCapacity?: string;
  estimatedTransitionDelayDays: number;
}

export interface SupplierSubstitutionAnalysis {
  blockedOrRiskSupplierId: string;
  blockedSupplierName: string;
  productCategory: string;
  reasonForSubstitution: string;
  candidates: SupplierSubstituteCandidate[];
  aiReasoning: string;
  generatedAt: string;
}

export interface ContractClauseAnalysis {
  id: string;
  documentTitle: string;
  complianceRating: 'STRONG' | 'MODERATE_RISK' | 'HIGH_VULNERABILITY';
  score: number; // 0 to 100
  extractedClauses: Array<{
    topic: string;
    textExcerpt: string;
    verdict: 'CONFORME' | 'AMBIGU' | 'NON_CONFORME';
    riskExplanation: string;
    recommendedWording: string;
  }>;
  csrdCsdddReadiness: string;
  remediationRoadmap: string[];
  analyzedAt: string;
}

export interface RegulatoryWatchItem {
  id: string;
  standardOrLaw: string; // e.g. "GOTS v7.0", "EUDR Déforestation", "CSDDD 2024/1760", "FSC-STD-40-004"
  title: string;
  effectiveDate: string;
  status: 'UPCOMING' | 'IN_FORCE' | 'DRAFT';
  impactSeverity: 'CRITICAL' | 'MAJOR' | 'MODERATE';
  summary: string;
  affectedPurchasingCategories: string[];
  affectedSuppliersCount: number;
  recommendedActionPlan: string;
}
