export type Nis2ObligationStatus = 'COMPLIANT_VERIFIED' | 'IN_REMEDIATION' | 'AUDIT_SCHEDULED';

export interface Nis2Requirement {
  id: string;
  articleCode: string; // e.g. "NIS2-ART-21.2.a"
  domain: string;
  titleFr: string;
  description: string;
  status: Nis2ObligationStatus;
  evidenceReference: string;
  lastAuditedAt: string;
}

export interface SaeArchiveDocument {
  id: string;
  archiveReference: string; // e.g. "SAE-2026-EUDR-0042"
  documentTitle: string;
  documentCategory: 'EUDR_DECLARATION' | 'SOCIAL_AUDIT_SMETA' | 'CSDDD_CHARTER' | 'CAC_AUDIT_PACK' | 'FINANCIAL_REPORT';
  retentionYears: number; // 10 years legal retention
  archivedAt: string;
  expiryLegalDate: string;
  sha256Digest: string;
  rfc3161TimestampSeal: string; // RFC 3161 Qualified eIDAS Timestamp
  merkleRootHash: string;
  integrityVerified: boolean;
  vaultStorageZone: 'PARIS_FR_SEC_NUM_CLOUD_1' | 'GRAVELINES_FR_SEC_NUM_CLOUD_2';
}

export interface HsmKmsKeyStatus {
  keyId: string;
  alias: string;
  encryptionAlgorithm: 'AES_256_GCM' | 'CHACHA20_POLY1305' | 'RSA_4096_OAEP';
  hsmFipsLevel: 'FIPS_140_3_LEVEL_3';
  sovereignProvider: 'OVH_CLOUD_SECNUMCLOUD' | 'OUTSCALE_SECNUMCLOUD' | 'INTERNAL_VAULT';
  keyState: 'ACTIVE_IN_USE' | 'ROTATED_READ_ONLY' | 'REVOKED';
  byokCustomerOwned: boolean;
  lastRotatedDate: string;
}

export interface DisasterRecoveryMetrics {
  primaryDatacenter: string; // "Paris DC1 (SecNumCloud Qualifié)"
  secondaryDatacenter: string; // "Gravelines DC2 (SecNumCloud Qualifié)"
  replicationStatus: 'SYNCHRONOUS_REPLICATED' | 'FAILOVER_ACTIVE' | 'DEGRADED';
  rpoActualSeconds: number; // 0s target
  rtoActualSeconds: number; // < 300s target (5 min)
  lastDisasterRecoveryDrillDate: string;
  failoverReady: boolean;
}

export interface SiemSecurityEvent {
  id: string;
  timestamp: string;
  severity: 'INFO' | 'NOTICE' | 'WARNING' | 'CRITICAL';
  eventType: 'KMS_KEY_ACCESS' | 'SAE_VAULT_INTEGRITY_CHECK' | 'MFA_ENTERPRISE_AUTH' | 'DRP_HEARTBEAT' | 'ANSSI_NIS2_CHECK';
  actor: string;
  sourceIp: string;
  description: string;
  cefPayloadFormat: string;
}

export interface SecOpsGlobalSummary {
  nis2ComplianceScorePercent: number; // 0-100%
  saeArchivedDocumentsCount: number;
  saeIntegrityScorePercent: number;
  activeHsmKeysCount: number;
  drpRpoSeconds: number;
  drpRtoSeconds: number;
  sovereigntyStandard: 'SECNUMCLOUD_3.2_ANSSI' | 'ISO_27001_2022' | 'NF_Z42_013_SAE';
}
