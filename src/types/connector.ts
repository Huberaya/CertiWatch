import { CertificationStandard, VerificationAnomaly, VerificationOutcome } from './certificate';

export interface ProviderOfficialData {
  certificateNumber: string;
  holderLegalName: string;
  status: 'VALID' | 'SUSPENDED' | 'REVOKED' | 'EXPIRED' | 'UNKNOWN';
  standard: CertificationStandard;
  issueDate: string;
  expiryDate: string;
  certifiedProducts: string[];
  certifiedSites: string[];
  geographicalScope: string[];
  publicRegistryUrl: string;
  sourceType: 'OFFICIAL_REST_API' | 'PUBLIC_DATABASE_LOOKUP' | 'AUTHORIZED_BULK_FEED' | 'CERTIFIER_VERIFICATION_PORTAL';
  rateLimitStatus?: string;
  legalNotice?: string;
}

export interface VerificationRequest {
  certificateNumber: string;
  supplierLegalName: string;
  standard: CertificationStandard;
  documentExpiryDate?: string;
  documentProducts?: string[];
  documentSites?: string[];
}

export interface VerificationResponse {
  outcome: VerificationOutcome;
  confidenceScore: number;
  confidenceReasons: string[];
  anomalies: VerificationAnomaly[];
  officialData?: ProviderOfficialData;
  officialRegistryUrl: string;
  verifiedAt: string;
  providerCode: string;
  providerName: string;
}

export type CircuitBreakerState = 'CLOSED' | 'HALF_OPEN' | 'OPEN';

export interface CertificationProviderMetadata {
  id: string;
  code: string;
  name: string;
  standards: CertificationStandard[];
  officialDomain: string;
  publicSearchUrl: string;
  apiAvailability: 'OFFICIAL_PUBLIC_API' | 'PARTNER_API_KEY_REQUIRED' | 'PUBLIC_REGISTRY_OPEN' | 'MANUAL_PORTAL_ONLY';
  rateLimitPolicy: string;
  legalTermsSummary: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'MAINTENANCE';
  lastHealthCheck: string;
  avgResponseMs: number;
  circuitBreakerState?: CircuitBreakerState;
  consecutiveFailures?: number;
  monthlyRequestsCount?: number;
  monthlyQuota?: number;
  uptimePercentage?: number;
  ethicalScrapingPolicy?: string;
  userAgentUsed?: string;
}

export interface OrchestrationConfig {
  frequency: 'HOURLY' | 'EVERY_6_HOURS' | 'DAILY' | 'WEEKLY';
  concurrency: number;
  enableCircuitBreaker: boolean;
  cacheTtlHours: number;
  autoTriggerErpBlockOnRevocation: boolean;
  lastRunTimestamp: string;
  nextScheduledRun: string;
}

export interface OrchestratorRunLog {
  id: string;
  tenantId: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  totalCertsAudited: number;
  matchesCount: number;
  mismatchesCount: number;
  revocationsDetected: number;
  rateLimitHits: number;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  summary: string;
}
