import React, { useState, useEffect } from 'react';
import {
  Activity,
  Layers,
  ShieldCheck,
  AlertTriangle,
  Bell,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Clock,
  Cpu,
  Server,
  Terminal,
  Copy,
  Check,
  Play,
  Zap,
  Globe,
  Radio,
  FileText,
  BarChart3,
  Network,
} from 'lucide-react';
import { DistributedTrace, SreAlertRule, RegistryHealthStatus } from '../../types/telemetry';
import { telemetryService } from '../../services/telemetryService';

export function ObservabilityApmPanel() {
  const [subTab, setSubTab] = useState<'metrics' | 'traces' | 'registries' | 'alerts' | 'raw_metrics'>('metrics');
  const [traces, setTraces] = useState<DistributedTrace[]>(telemetryService.getTraces());
  const [selectedTraceId, setSelectedTraceId] = useState<string>(traces[0]?.traceId || '');
  const [alertRules, setAlertRules] = useState<SreAlertRule[]>(telemetryService.getAlertRules());
  const [registries, setRegistries] = useState<RegistryHealthStatus[]>(telemetryService.getRegistryStatuses());
  const [metrics, setMetrics] = useState(telemetryService.getSystemMetrics());
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Poll metrics every 10s
  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics(telemetryService.getSystemMetrics());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [resTraces, resAlerts, resRegs] = await Promise.all([
        fetch('/api/telemetry/traces').then((r) => r.json()).catch(() => null),
        fetch('/api/telemetry/alerts').then((r) => r.json()).catch(() => null),
        fetch('/api/telemetry/registries').then((r) => r.json()).catch(() => null),
      ]);

      if (resTraces?.traces) setTraces(resTraces.traces);
      if (resAlerts?.rules) setAlertRules(resAlerts.rules);
      if (resRegs?.registries) setRegistries(resRegs.registries);
      setMetrics(telemetryService.getSystemMetrics());
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  const handleToggleAlert = async (ruleId: string) => {
    try {
      const res = await fetch(`/api/telemetry/alerts/${ruleId}/toggle`, { method: 'POST' });
      const data = await res.json();
      if (data?.rules) {
        setAlertRules(data.rules);
      } else {
        telemetryService.triggerTestAlert(ruleId);
        setAlertRules([...telemetryService.getAlertRules()]);
      }
    } catch {
      telemetryService.triggerTestAlert(ruleId);
      setAlertRules([...telemetryService.getAlertRules()]);
    }
  };

  const selectedTrace = traces.find((t) => t.traceId === selectedTraceId) || traces[0];

  const handleCopyMetrics = () => {
    navigator.clipboard.writeText(telemetryService.generatePrometheusMetrics());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Activity className="w-3.5 h-3.5" />
                Observabilité &amp; APM SRE
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" /> SLA 99.98%
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                OpenTelemetry + Prometheus
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Chantier : Observabilité, Métriques APM &amp; Alerting SRE
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Supervision continue des flux de validation ERP, traçage distribué W3C TraceContext, sondes de disponibilité des registres et règles de notification SRE (PagerDuty, Slack).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
            <a
              href="/metrics"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              /metrics Prometheus
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
            </a>
          </div>
        </div>

        {/* Global KPI Strip */}
        <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Requêtes Traitées</div>
            <div className="text-lg font-bold text-white font-mono mt-0.5">
              {metrics.requestsTotal.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <span>+45 req/s</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Taux d'Erreur (5xx)</div>
            <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
              {metrics.errorRatePercent}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Seuil critique: 1.0%</div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Latence p50</div>
            <div className="text-lg font-bold text-cyan-400 font-mono mt-0.5">
              {metrics.p50LatencyMs} ms
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Médiane ERP</div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Latence p95</div>
            <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">
              {metrics.p95LatencyMs} ms
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Objectif: &lt; 250ms</div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Mémoire RSS</div>
            <div className="text-lg font-bold text-purple-400 font-mono mt-0.5">
              {metrics.rssMb} MB
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Heap: {metrics.heapUsedMb} MB</div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Disponibilité Process</div>
            <div className="text-lg font-bold text-white font-mono mt-0.5">
              {Math.floor(metrics.uptimeSeconds / 3600)}h {Math.floor((metrics.uptimeSeconds % 3600) / 60)}m
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Node.js v22 LTS</div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setSubTab('metrics')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            subTab === 'metrics'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          1. Métriques &amp; Télémétrie Live
        </button>

        <button
          onClick={() => setSubTab('traces')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            subTab === 'traces'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Network className="w-4 h-4" />
          2. Traces Distribuées OpenTelemetry
        </button>

        <button
          onClick={() => setSubTab('registries')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            subTab === 'registries'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Globe className="w-4 h-4" />
          3. État des Registres &amp; Sondes SLA
        </button>

        <button
          onClick={() => setSubTab('alerts')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            subTab === 'alerts'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Bell className="w-4 h-4" />
          4. Gestionnaire d'Alertes SRE
        </button>

        <button
          onClick={() => setSubTab('raw_metrics')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            subTab === 'raw_metrics'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          5. Export OpenMetrics (/metrics)
        </button>
      </div>

      {/* Tab 1 : Metrics Dashboard */}
      {subTab === 'metrics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card: Throughput & HTTP Codes */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Distribution des Codes HTTP (24h)
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Total: {metrics.requestsTotal}</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  200 OK (Autorisé &amp; Requêtes)
                </span>
                <span className="font-mono text-emerald-400 font-bold">98.1 %</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: '98.1%' }} />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                  403 Forbidden (Commandes Bloquées)
                </span>
                <span className="font-mono text-purple-400 font-bold">1.8 %</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                <div className="bg-purple-400 h-full rounded-full" style={{ width: '1.8%' }} />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  5xx Erreurs Serveur
                </span>
                <span className="font-mono text-red-400 font-bold">0.03 %</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                <div className="bg-red-400 h-full rounded-full" style={{ width: '0.3%' }} />
              </div>
            </div>
          </div>

          {/* Card: Latency Quantiles */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Quantiles de Latence (Histogram)
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Prometheus Summary</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">p50 (50% des requêtes)</span>
                <span className="font-mono text-white font-bold">{metrics.p50LatencyMs} ms</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                <div className="bg-cyan-400 h-full rounded-full" style={{ width: '20%' }} />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">p95 (95% des requêtes)</span>
                <span className="font-mono text-amber-400 font-bold">{metrics.p95LatencyMs} ms</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: '42%' }} />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">p99 (Pire 1% sous charge)</span>
                <span className="font-mono text-purple-400 font-bold">{metrics.p99LatencyMs} ms</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                <div className="bg-purple-400 h-full rounded-full" style={{ width: '70%' }} />
              </div>
            </div>
          </div>

          {/* Card: Runtime Probes & Kubernetes */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                Sondes Kubernetes / Cloud Run
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                ACTIVE
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Liveness Probe</div>
                  <div className="text-[11px] text-slate-400 font-mono">GET /api/health/live</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  HTTP 200 UP
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Readiness Probe</div>
                  <div className="text-[11px] text-slate-400 font-mono">GET /api/health/ready</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  READY (DB+Vault)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2 : OpenTelemetry Distributed Tracing */}
      {subTab === 'traces' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Traces List */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Traces Récentes Capturées
            </h3>
            <div className="space-y-2">
              {traces.map((tr) => (
                <button
                  key={tr.traceId}
                  onClick={() => setSelectedTraceId(tr.traceId)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedTrace.traceId === tr.traceId
                      ? 'bg-slate-800/90 border-amber-500/40 shadow-lg'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white font-mono">{tr.rootSpanName}</span>
                    <span className="text-xs font-mono font-bold text-amber-400">{tr.totalDurationMs} ms</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 truncate">
                    TraceID: {tr.traceId.slice(0, 16)}...
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span>{tr.serviceName}</span>
                    <span>{tr.spans.length} Spans</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Trace Gantt Waterfall */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-amber-400 uppercase font-bold">
                  Trace Waterfall Gantt
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedTrace.rootSpanName}</h3>
                <div className="text-xs font-mono text-slate-400 mt-0.5">
                  TraceID: <span className="text-white">{selectedTrace.traceId}</span> · Durée Totale:{' '}
                  <span className="text-amber-400 font-bold">{selectedTrace.totalDurationMs} ms</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                STATUS: {selectedTrace.status}
              </span>
            </div>

            {/* Waterfall Gantt Bars */}
            <div className="space-y-3">
              {selectedTrace.spans.map((span) => {
                const totalDur = Math.max(selectedTrace.totalDurationMs, 1);
                const leftPercent = (span.startTimeMs / totalDur) * 100;
                const widthPercent = Math.max((span.durationMs! / totalDur) * 100, 4);

                const kindBadge =
                  span.kind === 'SERVER'
                    ? 'bg-blue-500/20 text-blue-400'
                    : span.kind === 'CLIENT'
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'bg-emerald-500/20 text-emerald-400';

                return (
                  <div key={span.spanId} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${kindBadge}`}>
                          {span.kind}
                        </span>
                        <span className="font-semibold text-white font-mono">{span.name}</span>
                      </div>
                      <span className="font-mono text-slate-300 font-bold">{span.durationMs} ms</span>
                    </div>

                    {/* Gantt Bar */}
                    <div className="w-full bg-slate-900 rounded-full h-2 relative overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all"
                        style={{
                          marginLeft: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                        }}
                      />
                    </div>

                    {/* Span Attributes Accordion */}
                    <div className="pt-1 flex flex-wrap gap-2 text-[10px] font-mono text-slate-400">
                      {Object.entries(span.attributes).map(([k, v]) => (
                        <span key={k} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-500">{k}:</span>{' '}
                          <span className="text-slate-200">{String(v)}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3 : Official Registries */}
      {subTab === 'registries' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Sondes de Disponibilité des Registres Officiels</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Surveillance continue de la connectivité API et de la validité des certificats TLS des registres de conformité.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {registries.map((reg) => (
              <div key={reg.registryCode} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {reg.status}
                  </span>
                  <span className="text-xs font-mono text-slate-400 font-semibold">{reg.uptimePercentage}% Uptime</span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{reg.name}</h4>
                  <div className="text-[11px] font-mono text-slate-500 truncate mt-0.5">{reg.url}</div>
                </div>

                <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Latence TLS :</span>
                    <div className="font-mono text-amber-400 font-bold">{reg.latencyMs} ms</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Certificat SSL :</span>
                    <div className="font-mono text-slate-300">Jusqu'au {reg.sslValidUntil}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4 : SRE Alert Rules */}
      {subTab === 'alerts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Règles d'Alerte SRE &amp; Canaux d'Escalade</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Déclenchement automatique des astreintes via PagerDuty, Opsgenie, webhooks Slack lors du franchissement de seuils.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {alertRules.map((rule) => {
              const isFiring = rule.status === 'FIRING';
              return (
                <div
                  key={rule.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isFiring
                      ? 'bg-red-950/30 border-red-500/40 shadow-lg'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            isFiring
                              ? 'bg-red-500 text-white animate-pulse'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {rule.status}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rule.severity === 'CRITICAL'
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {rule.severity}
                        </span>
                        <h4 className="text-sm font-bold text-white">{rule.name}</h4>
                      </div>
                      <div className="text-xs font-mono text-slate-400">
                        Condition: <code className="text-cyan-400">{rule.metric} {rule.operator} {rule.threshold}</code> (pendant {rule.durationSeconds}s)
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[11px] text-slate-500">Canaux notifiés :</span>
                        {rule.targetChannels.map((c) => (
                          <span
                            key={c}
                            className="px-2 py-0.2 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 font-mono"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleAlert(rule.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer self-start sm:self-center ${
                        isFiring
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                          : 'bg-red-500/10 hover:bg-red-500/20 text-red-300 border-red-500/30'
                      }`}
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>{isFiring ? 'Résoudre Alerte (Ack)' : 'Simuler Déclenchement (Test)'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 5 : Raw OpenMetrics Text */}
      {subTab === 'raw_metrics' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Flux OpenMetrics Prometheus Brut</h3>
              <p className="text-xs text-slate-400">
                Accessible publiquement sur <code className="text-amber-400">GET /metrics</code> pour scraping par Prometheus, VictoriaMetrics ou Datadog Agent.
              </p>
            </div>
            <button
              onClick={handleCopyMetrics}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              Copier les métriques
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-amber-300 max-h-[500px] overflow-y-auto leading-relaxed">
            <pre>{telemetryService.generatePrometheusMetrics()}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
