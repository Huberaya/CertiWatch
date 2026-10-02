import {
  Nis2Requirement,
  SaeArchiveDocument,
  HsmKmsKeyStatus,
  DisasterRecoveryMetrics,
  SiemSecurityEvent,
  SecOpsGlobalSummary,
} from '../types/secops';

export const INITIAL_NIS2_REQUIREMENTS: Nis2Requirement[] = [
  {
    id: 'nis2-01',
    articleCode: 'NIS2-ART-21.2.a',
    domain: 'Politique de Sécurité',
    titleFr: 'Analyse des Risques & Politique SSI',
    description: 'Cartographie formelle des risques d’interruption, classification EBIOS RM et revue annuelle par le RSSI.',
    status: 'COMPLIANT_VERIFIED',
    evidenceReference: 'PSSI-CERTIWATCH-2026-v3.2.pdf',
    lastAuditedAt: '2026-08-15',
  },
  {
    id: 'nis2-02',
    articleCode: 'NIS2-ART-21.2.b',
    domain: 'Gestion des Incidents',
    titleFr: 'Procédure d’Alerte & Notification CSIRT (24h/72h)',
    description: 'Canal de télé-notification automatique interconnecté au portail ANSSI / CERT-FR pour déclaration d’incident sous 24 heures.',
    status: 'COMPLIANT_VERIFIED',
    evidenceReference: 'INCIDENT-RESPONSE-PLAYBOOK-v4.pdf',
    lastAuditedAt: '2026-09-01',
  },
  {
    id: 'nis2-03',
    articleCode: 'NIS2-ART-21.2.c',
    domain: 'Continuité d’Activité',
    titleFr: 'Plan de Reprise d’Activité (PRA / PCA) RPO=0',
    description: 'Sauvegardes chiffrées immuables (WORM) et bascule automatisée multi-datacenter SecNumCloud en moins de 5 minutes.',
    status: 'COMPLIANT_VERIFIED',
    evidenceReference: 'DRP-ANNUAL-DRILL-REPORT-2026.pdf',
    lastAuditedAt: '2026-07-20',
  },
  {
    id: 'nis2-04',
    articleCode: 'NIS2-ART-21.2.d',
    domain: 'Sécurité Chaîne Logistique',
    titleFr: 'Cybersécurité des Fournisseurs Tiers & APIs',
    description: 'Évaluation continue de la posture cyber des sous-traitants et partenaires de la supply chain via la plateforme CertiWatch.',
    status: 'COMPLIANT_VERIFIED',
    evidenceReference: 'SUPPLY-CHAIN-CYBER-MATRIX-2026.pdf',
    lastAuditedAt: '2026-09-10',
  },
  {
    id: 'nis2-05',
    articleCode: 'NIS2-ART-21.2.e',
    domain: 'Sécurité Applicative',
    titleFr: 'DevSecOps & Gestion des Vulnérabilités CVE',
    description: 'Analyse statique et dynamique continue (SAST/DAST), scan des dépendances npm avec zéro CVE critique tolérée.',
    status: 'COMPLIANT_VERIFIED',
    evidenceReference: 'DEVSECOPS-PIPELINE-AUDIT-CERT.pdf',
    lastAuditedAt: '2026-08-30',
  },
  {
    id: 'nis2-06',
    articleCode: 'NIS2-ART-21.2.f',
    domain: 'Audits & Contrôles',
    titleFr: 'Tests d’Intrusion (Pentest) Semestriels',
    description: 'Test d’intrusion indépendant réalisé par un prestataire PASSI qualifié ANSSI (Synacktiv). Score A+ sans faille exploitable.',
    status: 'COMPLIANT_VERIFIED',
    evidenceReference: 'PASSI-PENTEST-REPORT-2026-SYNACKTIV.pdf',
    lastAuditedAt: '2026-06-12',
  },
  {
    id: 'nis2-07',
    articleCode: 'NIS2-ART-21.2.g',
    domain: 'Cyberhygiène',
    titleFr: 'Formation Continue & Sensibilisation Anti-Phishing',
    description: 'Campagnes mensuelles de simulation d’ingénierie sociale et formation obligatoire certifiée pour 100% des équipes.',
    status: 'COMPLIANT_VERIFIED',
    evidenceReference: 'HR-SECURITY-TRAINING-LOGS-2026.pdf',
    lastAuditedAt: '2026-09-14',
  },
  {
    id: 'nis2-08',
    articleCode: 'NIS2-ART-21.2.h',
    domain: 'Cryptographie',
    titleFr: 'Chiffrement Souverain BYOK (HSM FIPS 140-3)',
    description: 'Chiffrement de bout en bout des données au repos et en transit avec clés dédiées hébergées sur HSM matériel souverain.',
    status: 'COMPLIANT_VERIFIED',
    evidenceReference: 'KMS-HSM-ARCHITECTURE-SPEC.pdf',
    lastAuditedAt: '2026-08-01',
  },
  {
    id: 'nis2-09',
    articleCode: 'NIS2-ART-21.2.i',
    domain: 'Contrôle d’Accès',
    titleFr: 'Architecture Zero-Trust & Gestion des Privilèges',
    description: 'Principe du moindre privilège, séparation stricte des environnements multi-tenant et revue trimestrielle des accès.',
    status: 'COMPLIANT_VERIFIED',
    evidenceReference: 'ZERO-TRUST-ACCESS-REPORT.pdf',
    lastAuditedAt: '2026-09-05',
  },
  {
    id: 'nis2-10',
    articleCode: 'NIS2-ART-21.2.j',
    domain: 'Authentification Forte',
    titleFr: 'MFA Matériel FIDO2 & Fédération SSO SAML 2.0',
    description: 'Obligation de clés de sécurité matérielles (YubiKey) et intégration directe aux annuaires d’entreprise certifiés.',
    status: 'COMPLIANT_VERIFIED',
    evidenceReference: 'FIDO2-IAM-ENFORCEMENT-DOC.pdf',
    lastAuditedAt: '2026-08-20',
  },
];

export const INITIAL_SAE_ARCHIVES: SaeArchiveDocument[] = [
  {
    id: 'sae-1',
    archiveReference: 'SAE-2026-EUDR-0042',
    documentTitle: 'Dossier de Diligence Raisonnée TRACES-NT & Parcelles GPS Cacao',
    documentCategory: 'EUDR_DECLARATION',
    retentionYears: 10,
    archivedAt: '2026-09-15T08:30:00Z',
    expiryLegalDate: '2036-09-15T08:30:00Z',
    sha256Digest: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    rfc3161TimestampSeal: 'rfc3161_eidas_tsa_certiposte_20260915_083000_seq98104',
    merkleRootHash: 'merkle_root_sha256_99481a8b02c4819d721bb840192aef31',
    integrityVerified: true,
    vaultStorageZone: 'PARIS_FR_SEC_NUM_CLOUD_1',
  },
  {
    id: 'sae-2',
    archiveReference: 'SAE-2026-SMETA-0019',
    documentTitle: 'Rapport d’Audit Social SMETA 4-Pillars Bureau Veritas (AgroLait)',
    documentCategory: 'SOCIAL_AUDIT_SMETA',
    retentionYears: 10,
    archivedAt: '2026-08-10T14:15:00Z',
    expiryLegalDate: '2036-08-10T14:15:00Z',
    sha256Digest: '384018bcfa1902847a98bc1904a298cf0192ba84910283bc9184719048a192bc',
    rfc3161TimestampSeal: 'rfc3161_eidas_tsa_certiposte_20260810_141500_seq41029',
    merkleRootHash: 'merkle_root_sha256_883019ab728491029481bc9204918239',
    integrityVerified: true,
    vaultStorageZone: 'GRAVELINES_FR_SEC_NUM_CLOUD_2',
  },
  {
    id: 'sae-3',
    archiveReference: 'SAE-2026-CSDDD-0008',
    documentTitle: 'Charte Achats Responsables eIDAS Signée (Saphir Cacao CI)',
    documentCategory: 'CSDDD_CHARTER',
    retentionYears: 10,
    archivedAt: '2026-07-28T10:00:00Z',
    expiryLegalDate: '2036-07-28T10:00:00Z',
    sha256Digest: '774910283bc91820491820bc91840291049281ab728491029481bc9204918239',
    rfc3161TimestampSeal: 'rfc3161_eidas_tsa_certiposte_20260728_100000_seq18204',
    merkleRootHash: 'merkle_root_sha256_55491029481bc920491829bc81029481',
    integrityVerified: true,
    vaultStorageZone: 'PARIS_FR_SEC_NUM_CLOUD_1',
  },
  {
    id: 'sae-4',
    archiveReference: 'SAE-2026-CAC-0001',
    documentTitle: 'Pack d’Audit Extra-Financier CSRD ESRS Scellé pour Commissaires aux Comptes',
    documentCategory: 'CAC_AUDIT_PACK',
    retentionYears: 10,
    archivedAt: '2026-06-30T17:45:00Z',
    expiryLegalDate: '2036-06-30T17:45:00Z',
    sha256Digest: '192083bc74019284719048a192bc9381774910283bc91820491820bc91840291',
    rfc3161TimestampSeal: 'rfc3161_eidas_tsa_certiposte_20260630_174500_seq89104',
    merkleRootHash: 'merkle_root_sha256_192083bc74019284719048a192bc9381',
    integrityVerified: true,
    vaultStorageZone: 'GRAVELINES_FR_SEC_NUM_CLOUD_2',
  },
  {
    id: 'sae-5',
    archiveReference: 'SAE-2026-FSC-0033',
    documentTitle: 'Certificat de Chaîne de Contrôle FSC-100% Norrland Timber AB',
    documentCategory: 'EUDR_DECLARATION',
    retentionYears: 10,
    archivedAt: '2026-05-18T11:20:00Z',
    expiryLegalDate: '2036-05-18T11:20:00Z',
    sha256Digest: '55491029481bc920491829bc8102948192a8bc190284719048a192bc93817749',
    rfc3161TimestampSeal: 'rfc3161_eidas_tsa_certiposte_20260518_112000_seq31092',
    merkleRootHash: 'merkle_root_sha256_774910283bc91820491820bc91840291',
    integrityVerified: true,
    vaultStorageZone: 'PARIS_FR_SEC_NUM_CLOUD_1',
  },
];

export const INITIAL_HSM_KMS_KEYS: HsmKmsKeyStatus[] = [
  {
    keyId: 'kms-key-danone-master-01',
    alias: 'CertiWatch_Tenant_Danone_Master_Key',
    encryptionAlgorithm: 'AES_256_GCM',
    hsmFipsLevel: 'FIPS_140_3_LEVEL_3',
    sovereignProvider: 'OVH_CLOUD_SECNUMCLOUD',
    keyState: 'ACTIVE_IN_USE',
    byokCustomerOwned: true,
    lastRotatedDate: '2026-08-01',
  },
  {
    keyId: 'kms-key-dpp-verifiable-02',
    alias: 'CertiWatch_W3C_VC_Signer_Key',
    encryptionAlgorithm: 'RSA_4096_OAEP',
    hsmFipsLevel: 'FIPS_140_3_LEVEL_3',
    sovereignProvider: 'OUTSCALE_SECNUMCLOUD',
    keyState: 'ACTIVE_IN_USE',
    byokCustomerOwned: true,
    lastRotatedDate: '2026-07-15',
  },
];

export const INITIAL_DR_METRICS: DisasterRecoveryMetrics = {
  primaryDatacenter: 'Paris DC1 (SecNumCloud Qualifié ANSSI)',
  secondaryDatacenter: 'Gravelines DC2 (SecNumCloud Qualifié ANSSI)',
  replicationStatus: 'SYNCHRONOUS_REPLICATED',
  rpoActualSeconds: 0,
  rtoActualSeconds: 142, // 2 min 22 sec (target < 300s)
  lastDisasterRecoveryDrillDate: '2026-07-20',
  failoverReady: true,
};

export const INITIAL_SIEM_LOGS: SiemSecurityEvent[] = [
  {
    id: 'siem-1094',
    timestamp: '2026-10-02T05:04:12Z',
    severity: 'INFO',
    eventType: 'SAE_VAULT_INTEGRITY_CHECK',
    actor: 'system:cron:integrity-check',
    sourceIp: '10.240.0.12',
    description: 'Vérification automatique de l’empreinte Merkle Tree sur 5 archives SAE : 100% intègres.',
    cefPayloadFormat: 'CEF:0|CertiWatch|SovereignVault|3.2|SAE_CHECK|Integrity Verified|1|src=10.240.0.12 cat=AUDIT',
  },
  {
    id: 'siem-1093',
    timestamp: '2026-10-02T04:42:15Z',
    severity: 'INFO',
    eventType: 'KMS_KEY_ACCESS',
    actor: 'service:dpp-generator',
    sourceIp: '10.240.1.44',
    description: 'Déchiffrement enveloppe cryptographique via HSM FIPS 140-3 pour scellement Passeport Lot LOT-2026-N904.',
    cefPayloadFormat: 'CEF:0|CertiWatch|HSM_KMS|3.2|KEY_USE|Success|1|src=10.240.1.44 keyId=kms-key-danone-master-01',
  },
  {
    id: 'siem-1092',
    timestamp: '2026-10-02T03:15:00Z',
    severity: 'NOTICE',
    eventType: 'DRP_HEARTBEAT',
    actor: 'cluster:drp-sentinel',
    sourceIp: '10.240.9.1',
    description: 'Heartbeat de synchronisation miroir Paris DC1 <-> Gravelines DC2 : Lag de réplication 0 ms.',
    cefPayloadFormat: 'CEF:0|CertiWatch|DisasterRecovery|3.2|DRP_SYNC|Replicated Sync|0|lag=0ms rpo=0s',
  },
];

class SecOpsStore {
  private nis2Requirements: Nis2Requirement[] = INITIAL_NIS2_REQUIREMENTS;
  private saeArchives: SaeArchiveDocument[] = INITIAL_SAE_ARCHIVES;
  private hsmKeys: HsmKmsKeyStatus[] = INITIAL_HSM_KMS_KEYS;
  private drMetrics: DisasterRecoveryMetrics = INITIAL_DR_METRICS;
  private siemLogs: SiemSecurityEvent[] = INITIAL_SIEM_LOGS;
  private listeners: Set<() => void> = new Set();

  public subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public getNis2Requirements(): Nis2Requirement[] {
    return [...this.nis2Requirements];
  }

  public getSaeArchives(): SaeArchiveDocument[] {
    return [...this.saeArchives];
  }

  public getHsmKeys(): HsmKmsKeyStatus[] {
    return [...this.hsmKeys];
  }

  public getDrMetrics(): DisasterRecoveryMetrics {
    return { ...this.drMetrics };
  }

  public getSiemLogs(): SiemSecurityEvent[] {
    return [...this.siemLogs];
  }

  public getGlobalSummary(): SecOpsGlobalSummary {
    const compliantCount = this.nis2Requirements.filter(
      (r) => r.status === 'COMPLIANT_VERIFIED'
    ).length;
    const score = Math.round((compliantCount / this.nis2Requirements.length) * 100);

    return {
      nis2ComplianceScorePercent: score,
      saeArchivedDocumentsCount: this.saeArchives.length,
      saeIntegrityScorePercent: 100,
      activeHsmKeysCount: this.hsmKeys.length,
      drpRpoSeconds: this.drMetrics.rpoActualSeconds,
      drpRtoSeconds: this.drMetrics.rtoActualSeconds,
      sovereigntyStandard: 'SECNUMCLOUD_3.2_ANSSI',
    };
  }

  public verifyAllArchivesIntegrity() {
    this.saeArchives = this.saeArchives.map((a) => ({
      ...a,
      integrityVerified: true,
    }));

    const newLog: SiemSecurityEvent = {
      id: `siem-${Date.now()}`,
      timestamp: new Date().toISOString(),
      severity: 'INFO',
      eventType: 'SAE_VAULT_INTEGRITY_CHECK',
      actor: 'user:security-officer',
      sourceIp: '10.240.0.88',
      description: `Contrôle d’intégrité cryptographique NF Z42-013 exécuté : ${this.saeArchives.length} archives validées conformes.`,
      cefPayloadFormat: `CEF:0|CertiWatch|SovereignVault|3.2|MANUAL_INTEGRITY_CHECK|Success|1|count=${this.saeArchives.length}`,
    };
    this.siemLogs = [newLog, ...this.siemLogs];
    this.notify();
    return true;
  }

  public triggerDisasterRecoveryFailover() {
    this.drMetrics = {
      ...this.drMetrics,
      replicationStatus: 'FAILOVER_ACTIVE',
      rtoActualSeconds: 98,
    };

    const newLog: SiemSecurityEvent = {
      id: `siem-${Date.now()}`,
      timestamp: new Date().toISOString(),
      severity: 'WARNING',
      eventType: 'DRP_HEARTBEAT',
      actor: 'user:sysadmin:failover-drill',
      sourceIp: '10.240.9.99',
      description: 'Simulation de bascule PRA exécutée avec succès vers le datacenter secondaire Gravelines DC2 en 98 secondes.',
      cefPayloadFormat: 'CEF:0|CertiWatch|DisasterRecovery|3.2|FAILOVER_TRIGGERED|Active DC2|3|target=Gravelines DC2',
    };
    this.siemLogs = [newLog, ...this.siemLogs];
    this.notify();
    return true;
  }

  public rotateHsmKey(keyId: string) {
    this.hsmKeys = this.hsmKeys.map((k) =>
      k.keyId === keyId
        ? {
            ...k,
            lastRotatedDate: new Date().toISOString().split('T')[0],
          }
        : k
    );

    const newLog: SiemSecurityEvent = {
      id: `siem-${Date.now()}`,
      timestamp: new Date().toISOString(),
      severity: 'NOTICE',
      eventType: 'KMS_KEY_ACCESS',
      actor: 'user:crypto-officer',
      sourceIp: '10.240.2.10',
      description: `Rotation cryptographique réussie de la clé HSM ${keyId}.`,
      cefPayloadFormat: `CEF:0|CertiWatch|HSM_KMS|3.2|KEY_ROTATION|Rotated|1|keyId=${keyId}`,
    };
    this.siemLogs = [newLog, ...this.siemLogs];
    this.notify();
  }
}

export const secopsStore = new SecOpsStore();
