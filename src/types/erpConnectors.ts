export type ErpSystemType = 'SAP_S4HANA' | 'COUPA' | 'IVALUA' | 'CELONIS_EMS';

export interface SapODataConfig {
  endpointUrl: string;
  sapClient: string; // e.g. "100"
  authType: 'OAUTH2_CLIENT_CREDENTIALS' | 'X509_MTLS' | 'BASIC';
  clientId: string;
  clientSecret: string;
  serviceName: string; // e.g. "API_PURCHASEORDER_PROCESS_SRV"
  entitySet: string; // e.g. "A_PurchaseOrderItem"
  blockingField: string; // e.g. "PurchasingHoldBlock"
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  lastPingMs: number;
}

export interface CoupaRestConfig {
  instanceUrl: string;
  apiVersion: string; // e.g. "v34"
  clientId: string;
  clientSecret: string;
  scopes: string[];
  customFieldsMapping: {
    statusField: string; // e.g. "c_certiwatch_status"
    scoreField: string; // e.g. "c_compliance_score"
    proofHashField: string; // e.g. "c_merkle_proof"
  };
  approvalEscalationEnabled: boolean;
  complianceOfficerEmail: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  lastPingMs: number;
}

export interface CelonisEmsConfig {
  teamUrl: string;
  apiToken: string;
  actionFlowWebhookUrl: string;
  detectMaverickBuying: boolean;
  autoQuarantineThresholdEur: number;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  lastPingMs: number;
}

export interface ErpSyncLog {
  id: string;
  timestamp: string;
  erpSystem: ErpSystemType;
  direction: 'INBOUND' | 'OUTBOUND';
  operation: string;
  documentRef: string;
  status: 'SUCCESS' | 'BLOCKED' | 'ERROR';
  durationMs: number;
  details: string;
  payloadSummary?: any;
}
