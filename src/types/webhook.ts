export type WebhookEventType =
  | 'CERTIFICATE_REVOKED'
  | 'CERTIFICATE_EXPIRED'
  | 'CERTIFICATE_RENEWED'
  | 'SUPPLIER_BLOCKED'
  | 'SUPPLIER_UNBLOCKED'
  | 'DEROGATION_EXPIRED'
  | 'EUDR_NON_COMPLIANT'
  | 'ORDER_CHECK_FAILED';

export interface WebhookEndpoint {
  id: string;
  tenantId: string;
  name: string;
  url: string;
  secret: string; // e.g. "whsec_..."
  events: WebhookEventType[];
  status: 'ACTIVE' | 'DISABLED' | 'FAILING';
  failureCount: number;
  lastSuccessAt?: string;
  lastFailureAt?: string;
  createdAt: string;
}

export interface WebhookDeliveryLog {
  id: string;
  endpointId: string;
  endpointName: string;
  event: WebhookEventType;
  payload: Record<string, any>;
  signature: string; // HMAC SHA-256 header format: "sha256=..."
  statusCode: number;
  durationMs: number;
  timestamp: string;
  retryCount: number;
  status: 'SUCCESS' | 'FAILED' | 'RETRYING' | 'DLQ_ABANDONED';
  errorMessage?: string;
}

export interface DeadLetterQueueItem {
  id: string;
  webhookId: string;
  webhookName: string;
  targetUrl: string;
  event: WebhookEventType;
  attemptCount: number;
  maxAttempts: number;
  firstFailedAt: string;
  lastFailedAt: string;
  nextRetryAt?: string;
  payload: Record<string, any>;
  lastError: string;
  status: 'PENDING_RETRY' | 'REPLAYED' | 'DISCARDED';
}

export interface ApiDocEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  summary: string;
  category: 'ERP Orders' | 'Suppliers' | 'Certificates' | 'EUDR' | 'Webhooks';
  description: string;
  headers: Record<string, string>;
  queryParams?: Record<string, string>;
  requestBody?: Record<string, any>;
  responseSample: Record<string, any>;
}
