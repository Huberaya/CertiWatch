import { DistributedTrace, TelemetrySpan, RegistryHealthStatus, SreAlertRule } from '../types/telemetry';

class TelemetryService {
  private traces: DistributedTrace[] = [];
  private requestCount = 142850;
  private errorCount = 42;
  private blockedOrdersCount = 284;
  private alertRules: SreAlertRule[] = [
    {
      id: 'alert-p95-latency',
      name: 'Latence p95 API Achats > 250ms',
      metric: 'http_request_duration_seconds{quantile="0.95"}',
      operator: '>',
      threshold: 0.25,
      durationSeconds: 120,
      severity: 'WARNING',
      status: 'OK',
      targetChannels: ['SLACK', 'PAGERDUTY'],
    },
    {
      id: 'alert-error-rate',
      name: 'Taux d’erreur HTTP 5xx > 1%',
      metric: 'rate(http_requests_total{status=~"5.."}[5m])',
      operator: '>',
      threshold: 0.01,
      durationSeconds: 60,
      severity: 'CRITICAL',
      status: 'OK',
      targetChannels: ['PAGERDUTY', 'OPSGENIE', 'SLACK'],
    },
    {
      id: 'alert-registry-outage',
      name: 'Indisponibilité Registre Officiel (Ecocert / GOTS)',
      metric: 'certiwatch_connector_health_status',
      operator: '==',
      threshold: 0,
      durationSeconds: 300,
      severity: 'WARNING',
      status: 'OK',
      targetChannels: ['SLACK'],
    },
    {
      id: 'alert-merkle-tampering',
      name: 'Tentative d’Altération Détectée (Merkle Chain Tampering)',
      metric: 'certiwatch_merkle_tamper_attempts_total',
      operator: '>',
      threshold: 0,
      durationSeconds: 0,
      severity: 'CRITICAL',
      status: 'OK',
      targetChannels: ['PAGERDUTY', 'SLACK', 'WEBHOOK'],
    },
  ];

  private registryStatuses: RegistryHealthStatus[] = [
    {
      registryCode: 'ecocert',
      name: 'Ecocert Bio Portal API (FR/EU)',
      url: 'https://certificat.ecocert.com/api/v2',
      status: 'OPERATIONAL',
      latencyMs: 142,
      uptimePercentage: 99.96,
      lastCheckedAt: new Date().toISOString(),
      sslValidUntil: '2027-02-15',
    },
    {
      registryCode: 'gots',
      name: 'Global Organic Textile Standard (GOTS Database)',
      url: 'https://global-standard.org/public-database',
      status: 'OPERATIONAL',
      latencyMs: 188,
      uptimePercentage: 99.89,
      lastCheckedAt: new Date().toISOString(),
      sslValidUntil: '2026-12-10',
    },
    {
      registryCode: 'fsc',
      name: 'Forest Stewardship Council (FSC Certificate Search)',
      url: 'https://info.fsc.org/api/v1',
      status: 'OPERATIONAL',
      latencyMs: 215,
      uptimePercentage: 99.92,
      lastCheckedAt: new Date().toISOString(),
      sslValidUntil: '2027-05-20',
    },
    {
      registryCode: 'oeko_tex',
      name: 'OEKO-TEX Label Check REST Gateway',
      url: 'https://www.oeko-tex.com/en/label-check/api',
      status: 'OPERATIONAL',
      latencyMs: 165,
      uptimePercentage: 99.94,
      lastCheckedAt: new Date().toISOString(),
      sslValidUntil: '2027-01-30',
    },
    {
      registryCode: 'fairtrade',
      name: 'Fairtrade FLOCERT Customer Portal',
      url: 'https://flocert.net/api/v1/certificates',
      status: 'OPERATIONAL',
      latencyMs: 198,
      uptimePercentage: 99.85,
      lastCheckedAt: new Date().toISOString(),
      sslValidUntil: '2026-11-28',
    },
  ];

  constructor() {
    this.seedTraces();
  }

  private generateId(len: number): string {
    const chars = '0123456789abcdef';
    let res = '';
    for (let i = 0; i < len; i++) {
      res += chars[Math.floor(Math.random() * chars.length)];
    }
    return res;
  }

  private seedTraces() {
    const trace1Id = this.generateId(32);
    const rootSpanId = this.generateId(16);
    const matrixSpanId = this.generateId(16);
    const dbSpanId = this.generateId(16);
    const sealSpanId = this.generateId(16);

    const trace1: DistributedTrace = {
      traceId: trace1Id,
      rootSpanName: 'POST /api/v1/matrix/simulate',
      startTime: new Date(Date.now() - 45000).toISOString(),
      totalDurationMs: 42,
      status: 'OK',
      serviceName: 'certiwatch-erp-gateway',
      spans: [
        {
          traceId: trace1Id,
          spanId: rootSpanId,
          name: 'HTTP POST /api/v1/matrix/simulate',
          kind: 'SERVER',
          startTimeMs: 0,
          endTimeMs: 42,
          durationMs: 42,
          status: 'OK',
          attributes: {
            'http.method': 'POST',
            'http.route': '/api/v1/matrix/simulate',
            'http.status_code': 200,
            'client.erp': 'SAP S/4HANA',
            'tenant.id': 'tenant_alpha',
          },
          events: [{ name: 'request_headers_parsed', timestamp: 2 }],
        },
        {
          traceId: trace1Id,
          spanId: matrixSpanId,
          parentSpanId: rootSpanId,
          name: 'compliance.matrix_evaluator',
          kind: 'INTERNAL',
          startTimeMs: 3,
          endTimeMs: 25,
          durationMs: 22,
          status: 'OK',
          attributes: {
            'order.po_number': 'PO-2026-SAP-98124',
            'order.amount_eur': 142500,
            'rules_evaluated': 4,
            'decision': 'ALLOWED',
          },
          events: [{ name: 'ruleset_matched', timestamp: 8 }],
        },
        {
          traceId: trace1Id,
          spanId: dbSpanId,
          parentSpanId: matrixSpanId,
          name: 'db.query neon_postgres.certificates',
          kind: 'CLIENT',
          startTimeMs: 5,
          endTimeMs: 18,
          durationMs: 13,
          status: 'OK',
          attributes: {
            'db.system': 'postgresql',
            'db.name': 'certiwatch_production',
            'db.statement': 'SELECT * FROM certificates WHERE supplier_id = $1 AND status = $2',
            'db.rows_returned': 3,
          },
          events: [],
        },
        {
          traceId: trace1Id,
          spanId: sealSpanId,
          parentSpanId: rootSpanId,
          name: 'crypto.merkle_leaf_seal',
          kind: 'INTERNAL',
          startTimeMs: 26,
          endTimeMs: 40,
          durationMs: 14,
          status: 'OK',
          attributes: {
            'crypto.algorithm': 'SHA-256',
            'merkle.block_index': 15,
            'rfc3161_timestamp': true,
          },
          events: [{ name: 'hash_appended_to_chain', timestamp: 35 }],
        },
      ],
    };

    // Trace 2 : OCR Ingestion
    const trace2Id = this.generateId(32);
    const root2SpanId = this.generateId(16);
    const geminiSpanId = this.generateId(16);

    const trace2: DistributedTrace = {
      traceId: trace2Id,
      rootSpanName: 'POST /api/v1/ocr/extract',
      startTime: new Date(Date.now() - 120000).toISOString(),
      totalDurationMs: 680,
      status: 'OK',
      serviceName: 'certiwatch-ai-engine',
      spans: [
        {
          traceId: trace2Id,
          spanId: root2SpanId,
          name: 'HTTP POST /api/v1/ocr/extract',
          kind: 'SERVER',
          startTimeMs: 0,
          endTimeMs: 680,
          durationMs: 680,
          status: 'OK',
          attributes: {
            'file.type': 'application/pdf',
            'file.size_bytes': 489210,
          },
          events: [{ name: 'file_buffered', timestamp: 12 }],
        },
        {
          traceId: trace2Id,
          spanId: geminiSpanId,
          parentSpanId: root2SpanId,
          name: 'ai.gemini_multimodal_vision',
          kind: 'CLIENT',
          startTimeMs: 15,
          endTimeMs: 650,
          durationMs: 635,
          status: 'OK',
          attributes: {
            'gen_ai.system': 'Google Gemini',
            'gen_ai.model': 'gemini-2.5-flash',
            'confidence_score': 98.4,
          },
          events: [{ name: 'fields_extracted', timestamp: 620 }],
        },
      ],
    };

    this.traces = [trace1, trace2];
  }

  public recordRequest(isError: boolean = false, isBlocked: boolean = false) {
    this.requestCount++;
    if (isError) this.errorCount++;
    if (isBlocked) this.blockedOrdersCount++;
  }

  public getTraces(): DistributedTrace[] {
    return this.traces;
  }

  public getAlertRules(): SreAlertRule[] {
    return this.alertRules;
  }

  public triggerTestAlert(ruleId: string): boolean {
    const rule = this.alertRules.find((r) => r.id === ruleId);
    if (!rule) return false;
    rule.status = rule.status === 'OK' ? 'FIRING' : 'OK';
    rule.lastTriggeredAt = new Date().toISOString();
    return true;
  }

  public getRegistryStatuses(): RegistryHealthStatus[] {
    return this.registryStatuses;
  }

  public getSystemMetrics() {
    const memUsage = process.memoryUsage();
    return {
      requestsTotal: this.requestCount,
      errorsTotal: this.errorCount,
      blockedOrdersTotal: this.blockedOrdersCount,
      errorRatePercent: Number(((this.errorCount / Math.max(1, this.requestCount)) * 100).toFixed(3)),
      p50LatencyMs: 18,
      p95LatencyMs: 42,
      p99LatencyMs: 115,
      activeTenants: 3,
      heapUsedMb: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(memUsage.heapTotal / 1024 / 1024),
      rssMb: Math.round(memUsage.rss / 1024 / 1024),
      uptimeSeconds: Math.round(process.uptime()),
    };
  }

  public generatePrometheusMetrics(): string {
    const metrics = this.getSystemMetrics();
    const now = Date.now();

    return `# HELP http_requests_total Nombre total de requetes HTTP traitees par CertiWatch
# TYPE http_requests_total counter
http_requests_total{method="POST",route="/api/v1/matrix/simulate",status="200"} ${metrics.requestsTotal - metrics.errorsTotal - metrics.blockedOrdersTotal}
http_requests_total{method="POST",route="/api/v1/matrix/simulate",status="403"} ${metrics.blockedOrdersTotal}
http_requests_total{method="GET",route="/api/v1/suppliers",status="200"} 24190
http_requests_total{method="GET",route="/api/v1/certificates/verify",status="200"} 38450
http_requests_total{method="POST",route="/api/v1/ocr/extract",status="200"} 8910
http_requests_total{method="ALL",route="all",status="500"} ${metrics.errorsTotal}

# HELP http_request_duration_seconds Quantiles de temps de reponse en secondes
# TYPE http_request_duration_seconds summary
http_request_duration_seconds{quantile="0.5"} ${(metrics.p50LatencyMs / 1000).toFixed(4)}
http_request_duration_seconds{quantile="0.95"} ${(metrics.p95LatencyMs / 1000).toFixed(4)}
http_request_duration_seconds{quantile="0.99"} ${(metrics.p99LatencyMs / 1000).toFixed(4)}

# HELP certiwatch_active_tenants Nombre d'organisations clientes actives sur la plateforme
# TYPE certiwatch_active_tenants gauge
certiwatch_active_tenants ${metrics.activeTenants}

# HELP certiwatch_certificates_total Total des certifications suivies par statut
# TYPE certiwatch_certificates_total gauge
certiwatch_certificates_total{status="VALID"} 14
certiwatch_certificates_total{status="EXPIRING_SOON"} 2
certiwatch_certificates_total{status="EXPIRED"} 1
certiwatch_certificates_total{status="REVOKED"} 1

# HELP certiwatch_erp_blocked_orders_total Commandes d'achats bloquees par la matrice
# TYPE certiwatch_erp_blocked_orders_total counter
certiwatch_erp_blocked_orders_total ${metrics.blockedOrdersTotal}

# HELP certiwatch_connector_health_status Disponibilite des connecteurs de registres (1=UP, 0=DOWN)
# TYPE certiwatch_connector_health_status gauge
certiwatch_connector_health_status{registry="ecocert"} 1
certiwatch_connector_health_status{registry="gots"} 1
certiwatch_connector_health_status{registry="fsc"} 1
certiwatch_connector_health_status{registry="oeko_tex"} 1
certiwatch_connector_health_status{registry="fairtrade"} 1

# HELP certiwatch_merkle_chain_height Hauteur de la chaine de scellement cryptographique
# TYPE certiwatch_merkle_chain_height gauge
certiwatch_merkle_chain_height 15

# HELP certiwatch_process_resident_memory_bytes Memoire RSS allouee au runtime Node.js
# TYPE certiwatch_process_resident_memory_bytes gauge
certiwatch_process_resident_memory_bytes ${metrics.rssMb * 1024 * 1024}

# HELP certiwatch_uptime_seconds Duree de disponibilite du processus en secondes
# TYPE certiwatch_uptime_seconds counter
certiwatch_uptime_seconds ${metrics.uptimeSeconds}
`;
  }
}

export const telemetryService = new TelemetryService();
