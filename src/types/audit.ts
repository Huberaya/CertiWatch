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
  | 'SYSTEM_SYNC';

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
}
