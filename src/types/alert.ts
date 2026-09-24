export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type AlertStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED';
export type AlertType =
  | 'EXPIRY_60_DAYS'
  | 'EXPIRY_30_DAYS'
  | 'EXPIRED'
  | 'SUSPENDED'
  | 'REVOKED'
  | 'MISMATCH_OFFICIAL_REGISTRY'
  | 'SCOPE_UNAUTHORIZED_PRODUCT'
  | 'REGISTRY_NOT_FOUND'
  | 'REGISTRY_OFFLINE';

export interface AlertAction {
  id: string;
  performedBy: string;
  actionType: 'ASSIGNED' | 'COMMENTED' | 'DOCUMENT_REQUESTED' | 'STATUS_CHANGED' | 'RESOLVED';
  comment?: string;
  createdAt: string;
}

export interface ComplianceAlert {
  id: string;
  tenantId: string;
  certificateId: string;
  supplierId: string;
  supplierName: string;
  certificationStandard: string;
  certificateNumber: string;
  type: AlertType;
  title: string;
  message: string;
  severity: AlertSeverity;
  status: AlertStatus;
  assignedToUser?: string;
  erpBlockedTriggered: boolean;
  history: AlertAction[];
  createdAt: string;
  updatedAt: string;
}
