export type AuditActionCategory =
  | 'SUPPLIER_CREATED'
  | 'SUPPLIER_MODIFIED'
  | 'SUPPLIER_STATUS_CHANGED'
  | 'CERTIFICATE_UPLOADED'
  | 'CERTIFICATE_VERIFIED'
  | 'CERTIFICATE_STATUS_CHANGED'
  | 'ALERT_TRIGGERED'
  | 'ALERT_RESOLVED'
  | 'ERP_ORDER_CHECK'
  | 'ERP_BLOCK_TRIGGERED'
  | 'MATRIX_RULE_UPDATED'
  | 'SYSTEM_SYNC'
  | 'DEROGATION_GRANTED'
  | 'SUPPLIER_REMINDER_SENT'
  | 'FRAUD_SUSPICION_FLAGGED';

export interface AuditLogEntry {
  id: string;
  tenantId: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  actionCategory: AuditActionCategory;
  entityType: 'SUPPLIER' | 'CERTIFICATE' | 'ALERT' | 'MATRIX' | 'INTEGRATION';
  entityId: string;
  entityReference: string;
  source: 'MANUAL_UI' | 'AUTOMATED_SYNC' | 'ERP_WEBHOOK' | 'OCR_INGESTION' | 'API_REST';
  previousValue?: string;
  newValue?: string;
  details: string;
  ipAddress?: string;
  hash: string;
  previousHash: string;
  blockNumber: number;
  digitalSeal: string;
}

export interface AuditChainVerificationResult {
  isChainValid: boolean;
  totalBlocksVerified: number;
  genesisBlockHash: string;
  latestBlockHash: string;
  tamperedEntriesCount: number;
  tamperedIds: string[];
  algorithm: string;
  verifiedAt: string;
}

export interface LegalComplianceReportSummary {
  tenantName: string;
  reportId: string;
  generatedAt: string;
  reportingPeriod: string;
  totalAuditedEvents: number;
  erpOrdersEvaluated: number;
  hardBlocksEnforced: number;
  derogationsAuthorized: number;
  fraudAlertsDetected: number;
  chainIntegrityStatus: 'VERIFIED_IMMUTABLE' | 'COMPROMISED';
  complianceSealSignature: string;
}
