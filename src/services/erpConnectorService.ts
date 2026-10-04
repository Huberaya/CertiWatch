import {
  SapODataConfig,
  CoupaRestConfig,
  CelonisEmsConfig,
  ErpSyncLog,
  ErpSystemType,
} from '../types/erpConnectors';

class ErpConnectorService {
  private sapConfig: SapODataConfig = {
    endpointUrl: 'https://s4hana-gateway.enterprise.corp:44300/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV',
    sapClient: '100',
    authType: 'OAUTH2_CLIENT_CREDENTIALS',
    clientId: 'cw_sap_oauth_client_8912',
    clientSecret: '••••••••••••••••••••••••••••••••',
    serviceName: 'API_PURCHASEORDER_PROCESS_SRV',
    entitySet: 'A_PurchaseOrderItem',
    blockingField: 'PurchasingHoldBlock',
    status: 'CONNECTED',
    lastPingMs: 38,
  };

  private coupaConfig: CoupaRestConfig = {
    instanceUrl: 'https://enterprise.coupahost.com/api',
    apiVersion: 'v34',
    clientId: 'coupa_app_certiwatch_live',
    clientSecret: '••••••••••••••••••••••••••••••••',
    scopes: ['core.purchase_orders.read', 'core.purchase_orders.write', 'core.approval_chains.write'],
    customFieldsMapping: {
      statusField: 'c_certiwatch_status',
      scoreField: 'c_compliance_score',
      proofHashField: 'c_merkle_proof',
    },
    approvalEscalationEnabled: true,
    complianceOfficerEmail: 'compliance-officer@enterprise.corp',
    status: 'CONNECTED',
    lastPingMs: 64,
  };

  private celonisConfig: CelonisEmsConfig = {
    teamUrl: 'https://enterprise.eu-2.celonis.cloud/process-mining/api/v1',
    apiToken: '••••••••••••••••••••••••••••••••',
    actionFlowWebhookUrl: 'https://enterprise.eu-2.celonis.cloud/action-flows/webhook/cw_ingest_8819',
    detectMaverickBuying: true,
    autoQuarantineThresholdEur: 50000,
    status: 'CONNECTED',
    lastPingMs: 92,
  };

  private syncLogs: ErpSyncLog[] = [
    {
      id: 'sync-log-01',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      erpSystem: 'SAP_S4HANA',
      direction: 'INBOUND',
      operation: 'INTERCEPT_PO_CREATION',
      documentRef: 'PO-2026-SAP-98124',
      status: 'SUCCESS',
      durationMs: 38,
      details: 'Commande SAP analysée avec succès. Toutes certifications valides.',
      payloadSummary: { poNumber: 'PO-2026-SAP-98124', supplier: 'sup-1', status: 'ALLOWED' },
    },
    {
      id: 'sync-log-02',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      erpSystem: 'SAP_S4HANA',
      direction: 'OUTBOUND',
      operation: 'APPLY_PURCHASING_HOLD',
      documentRef: 'PO-2026-SAP-94112',
      status: 'BLOCKED',
      durationMs: 44,
      details: 'Blocage SAP appliqué sur le poste 00010 : Certificat GOTS expiré.',
      payloadSummary: { field: 'PurchasingHoldBlock', value: 'X', reason: 'CERT_EXPIRED' },
    },
    {
      id: 'sync-log-03',
      timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      erpSystem: 'COUPA',
      direction: 'OUTBOUND',
      operation: 'INJECT_APPROVAL_STEP',
      documentRef: 'REQ-COUPA-44810',
      status: 'SUCCESS',
      durationMs: 72,
      details: 'Étape d’approbation Responsable RSE injectée dans Coupa Approval Chain.',
      payloadSummary: { approver: 'compliance-officer@enterprise.corp', rule: 'CERT_EXPIRING_30D' },
    },
    {
      id: 'sync-log-04',
      timestamp: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
      erpSystem: 'CELONIS_EMS',
      direction: 'OUTBOUND',
      operation: 'FLAG_MAVERICK_BUYING',
      documentRef: 'INV-2026-00912',
      status: 'BLOCKED',
      durationMs: 110,
      details: 'Alerte Maverick Buying émise dans Celonis : Fournisseur non certifié sans bon de commande préalable.',
      payloadSummary: { amountEur: 68500, riskScore: 84 },
    },
  ];

  public getSapConfig(): SapODataConfig {
    return { ...this.sapConfig };
  }

  public updateSapConfig(patch: Partial<SapODataConfig>): SapODataConfig {
    this.sapConfig = { ...this.sapConfig, ...patch };
    return { ...this.sapConfig };
  }

  public getCoupaConfig(): CoupaRestConfig {
    return { ...this.coupaConfig };
  }

  public updateCoupaConfig(patch: Partial<CoupaRestConfig>): CoupaRestConfig {
    this.coupaConfig = { ...this.coupaConfig, ...patch };
    return { ...this.coupaConfig };
  }

  public getCelonisConfig(): CelonisEmsConfig {
    return { ...this.celonisConfig };
  }

  public updateCelonisConfig(patch: Partial<CelonisEmsConfig>): CelonisEmsConfig {
    this.celonisConfig = { ...this.celonisConfig, ...patch };
    return { ...this.celonisConfig };
  }

  public getSyncLogs(): ErpSyncLog[] {
    return [...this.syncLogs];
  }

  public testSapConnection(): { success: boolean; latencyMs: number; message: string; odataMetadataLoaded: boolean } {
    const latency = Math.floor(Math.random() * 20) + 30;
    this.sapConfig.lastPingMs = latency;
    this.sapConfig.status = 'CONNECTED';

    this.addSyncLog({
      erpSystem: 'SAP_S4HANA',
      direction: 'OUTBOUND',
      operation: 'TEST_ODATA_METADATA_PING',
      documentRef: 'SERVICE_METADATA',
      status: 'SUCCESS',
      durationMs: latency,
      details: 'Connexion OData v2/v4 établie avec le serveur SAP S/4HANA (HTTP 200 OK).',
    });

    return {
      success: true,
      latencyMs: latency,
      message: 'Service SAP OData API_PURCHASEORDER_PROCESS_SRV interrogé et opérationnel.',
      odataMetadataLoaded: true,
    };
  }

  public simulateSapPurchaseHold(poNumber: string, itemNumber: string, reason: string): { success: boolean; odataResponse: any } {
    const duration = Math.floor(Math.random() * 25) + 35;
    const log: ErpSyncLog = {
      id: `sync-log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      erpSystem: 'SAP_S4HANA',
      direction: 'OUTBOUND',
      operation: 'PATCH_A_PurchaseOrderItem',
      documentRef: `${poNumber}/${itemNumber}`,
      status: 'BLOCKED',
      durationMs: duration,
      details: `Indicateur de blocage PurchasingHoldBlock='X' injecté dans SAP S/4HANA. Motif : ${reason}`,
      payloadSummary: {
        PurchaseOrder: poNumber,
        PurchaseOrderItem: itemNumber,
        PurchasingHoldBlock: 'X',
        DeletionIndicator: '',
        ReasonCode: 'CERTIWATCH_NON_COMPLIANT',
      },
    };

    this.addSyncLog(log);

    return {
      success: true,
      odataResponse: {
        d: {
          PurchaseOrder: poNumber,
          PurchaseOrderItem: itemNumber,
          PurchasingHoldBlock: 'X',
          Status: 'LOCKED_BY_CERTIWATCH',
          UpdatedAt: new Date().toISOString(),
          SapMessage: 'Poste de commande bloqué pour non-conformité certifiante (SAP Message CW014).',
        },
      },
    };
  }

  public testCoupaConnection(): { success: boolean; latencyMs: number; message: string; scopesGranted: string[] } {
    const latency = Math.floor(Math.random() * 25) + 50;
    this.coupaConfig.lastPingMs = latency;
    this.coupaConfig.status = 'CONNECTED';

    this.addSyncLog({
      erpSystem: 'COUPA',
      direction: 'OUTBOUND',
      operation: 'TEST_OAUTH2_TOKEN_PING',
      documentRef: 'TOKEN_GRANT',
      status: 'SUCCESS',
      durationMs: latency,
      details: 'Jeton OAuth2 Coupa Procurement renouvelé avec succès.',
    });

    return {
      success: true,
      latencyMs: latency,
      message: 'Connexion Coupa REST API v34 active. Scopes de gestion des commandes validés.',
      scopesGranted: this.coupaConfig.scopes,
    };
  }

  public testCelonisConnection(): { success: boolean; latencyMs: number; message: string; actionFlowReady: boolean } {
    const latency = Math.floor(Math.random() * 30) + 70;
    this.celonisConfig.lastPingMs = latency;
    this.celonisConfig.status = 'CONNECTED';

    this.addSyncLog({
      erpSystem: 'CELONIS_EMS',
      direction: 'OUTBOUND',
      operation: 'PING_ACTION_FLOW_WEBHOOK',
      documentRef: 'ACTION_FLOW_01',
      status: 'SUCCESS',
      durationMs: latency,
      details: 'Action Flow Celonis EMS joint avec succès.',
    });

    return {
      success: true,
      latencyMs: latency,
      message: 'Webhook Celonis Action Flow opérationnel. Traitement des anomalies Maverick Buying actif.',
      actionFlowReady: true,
    };
  }

  private addSyncLog(log: Omit<ErpSyncLog, 'id' | 'timestamp'> & { id?: string; timestamp?: string }) {
    const fullLog: ErpSyncLog = {
      id: log.id || `sync-log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: log.timestamp || new Date().toISOString(),
      ...log,
    };
    this.syncLogs.unshift(fullLog);
    if (this.syncLogs.length > 50) {
      this.syncLogs = this.syncLogs.slice(0, 50);
    }
  }
}

export const erpConnectorService = new ErpConnectorService();
