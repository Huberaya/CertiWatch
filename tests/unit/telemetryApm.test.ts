import { describe, it, expect } from 'vitest';
import { telemetryService } from '../../src/services/telemetryService';

describe('Chantier A : Observabilité, Métriques APM & Alerting SRE', () => {
  it('should generate valid Prometheus / OpenMetrics compliant text format', () => {
    const rawMetrics = telemetryService.generatePrometheusMetrics();

    expect(rawMetrics).toContain('# HELP http_requests_total');
    expect(rawMetrics).toContain('# TYPE http_requests_total counter');
    expect(rawMetrics).toContain('http_requests_total{');

    expect(rawMetrics).toContain('# HELP http_request_duration_seconds');
    expect(rawMetrics).toContain('quantile="0.95"');

    expect(rawMetrics).toContain('# HELP certiwatch_connector_health_status');
    expect(rawMetrics).toContain('certiwatch_connector_health_status{registry="ecocert"} 1');

    expect(rawMetrics).toContain('certiwatch_merkle_chain_height');
    expect(rawMetrics).toContain('certiwatch_process_resident_memory_bytes');
    expect(rawMetrics).toContain('certiwatch_uptime_seconds');
  });

  it('should provide distributed traces conforming to OpenTelemetry span model', () => {
    const traces = telemetryService.getTraces();
    expect(traces.length).toBeGreaterThanOrEqual(2);

    const erpTrace = traces.find((t) => t.rootSpanName.includes('matrix/simulate'));
    expect(erpTrace).toBeDefined();
    expect(erpTrace?.spans.length).toBe(4);

    const rootSpan = erpTrace?.spans.find((s) => s.kind === 'SERVER');
    expect(rootSpan).toBeDefined();
    expect(rootSpan?.attributes['http.method']).toBe('POST');
    expect(rootSpan?.attributes['client.erp']).toBe('SAP S/4HANA');

    const dbSpan = erpTrace?.spans.find((s) => s.name.includes('db.query'));
    expect(dbSpan).toBeDefined();
    expect(dbSpan?.attributes['db.system']).toBe('postgresql');
  });

  it('should monitor and probe official external registries', () => {
    const registries = telemetryService.getRegistryStatuses();
    expect(registries.length).toBe(5);

    const ecocert = registries.find((r) => r.registryCode === 'ecocert');
    expect(ecocert?.status).toBe('OPERATIONAL');
    expect(ecocert?.uptimePercentage).toBeGreaterThanOrEqual(99.0);
    expect(ecocert?.latencyMs).toBeGreaterThan(0);
  });

  it('should manage and toggle SRE alert rules correctly', () => {
    const rules = telemetryService.getAlertRules();
    expect(rules.length).toBeGreaterThanOrEqual(4);

    const p95Rule = rules.find((r) => r.id === 'alert-p95-latency');
    expect(p95Rule).toBeDefined();
    expect(p95Rule?.status).toBe('OK');

    // Trigger test alert
    const success = telemetryService.triggerTestAlert('alert-p95-latency');
    expect(success).toBe(true);

    const updatedRule = telemetryService.getAlertRules().find((r) => r.id === 'alert-p95-latency');
    expect(updatedRule?.status).toBe('FIRING');
    expect(updatedRule?.lastTriggeredAt).toBeDefined();

    // Toggle back to OK
    telemetryService.triggerTestAlert('alert-p95-latency');
    expect(telemetryService.getAlertRules().find((r) => r.id === 'alert-p95-latency')?.status).toBe('OK');
  });
});
