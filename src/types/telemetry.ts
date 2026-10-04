export type SpanStatus = 'OK' | 'ERROR' | 'UNSET';

export interface SpanEvent {
  name: string;
  timestamp: number;
  attributes?: Record<string, string | number | boolean>;
}

export interface TelemetrySpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  kind: 'SERVER' | 'CLIENT' | 'INTERNAL';
  startTimeMs: number;
  endTimeMs?: number;
  durationMs?: number;
  status: SpanStatus;
  errorMessage?: string;
  attributes: Record<string, string | number | boolean>;
  events: SpanEvent[];
}

export interface DistributedTrace {
  traceId: string;
  rootSpanName: string;
  startTime: string;
  totalDurationMs: number;
  status: SpanStatus;
  serviceName: string;
  spans: TelemetrySpan[];
}

export interface RegistryHealthStatus {
  registryCode: string;
  name: string;
  url: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE';
  latencyMs: number;
  uptimePercentage: number;
  lastCheckedAt: string;
  sslValidUntil: string;
}

export interface SreAlertRule {
  id: string;
  name: string;
  metric: string;
  operator: '>' | '<' | '==';
  threshold: number;
  durationSeconds: number;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  status: 'OK' | 'FIRING';
  lastTriggeredAt?: string;
  targetChannels: ('SLACK' | 'PAGERDUTY' | 'OPSGENIE' | 'WEBHOOK')[];
}
