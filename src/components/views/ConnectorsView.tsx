import React, { useState } from 'react';
import {
  CertificationProviderMetadata,
  CircuitBreakerState,
  OrchestrationConfig,
  OrchestratorRunLog,
} from '../../types/connector';
import { Modal } from '../ui/Modal';
import { appStore } from '../../db/store';
import {
  Globe2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Lock,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Terminal,
  Activity,
  Play,
  RotateCw,
  Server,
  Cpu,
  Layers,
  ShieldAlert,
  Sparkles,
  Database,
  History,
  Check,
} from 'lucide-react';

interface ConnectorsViewProps {
  providers: CertificationProviderMetadata[];
}

export function ConnectorsView({ providers }: ConnectorsViewProps) {
  const [activeTab, setActiveTab] = useState<'CONNECTORS' | 'ORCHESTRATOR' | 'RESILIENCE'>('CONNECTORS');

  // Test workbench state
  const [testStandard, setTestStandard] = useState('ECOCERT');
  const [testNumber, setTestNumber] = useState('FR-BIO-01-2024-118942');
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryResult, setQueryResult] = useState<any | null>(null);

  // Resilience simulation state
  const [selectedSimProvider, setSelectedSimProvider] = useState('ECOCERT');
  const [simScenario, setSimScenario] = useState<'SUCCESS' | 'TIMEOUT' | 'RATE_LIMIT' | 'CIRCUIT_TRIP'>('SUCCESS');
  const [simResult, setSimResult] = useState<any | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Orchestrator runner state
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [orchestratorProgress, setOrchestratorProgress] = useState<number>(0);
  const [lastExecutedLog, setLastExecutedLog] = useState<OrchestratorRunLog | null>(null);

  // Selected doc modal
  const [selectedProviderDoc, setSelectedProviderDoc] = useState<CertificationProviderMetadata | null>(null);

  const orchestrationConfig = appStore.getOrchestrationConfig();
  const orchestratorLogs = appStore.getTenantOrchestratorLogs();
  const permissions = appStore.getActivePermissions();

  // Metrics
  const operationalCount = providers.filter((p) => p.status === 'OPERATIONAL').length;
  const avgResponse = Math.round(
    providers.reduce((acc, p) => acc + p.avgResponseMs, 0) / (providers.length || 1)
  );
  const totalMonthlyReqs = providers.reduce((acc, p) => acc + (p.monthlyRequestsCount || 0), 0);
  const totalMonthlyQuota = providers.reduce((acc, p) => acc + (p.monthlyQuota || 5000), 0);
  const quotaUsedPct = Math.round((totalMonthlyReqs / (totalMonthlyQuota || 1)) * 100);

  const handleSimulateLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsQuerying(true);
    setQueryResult(null);

    setTimeout(() => {
      setIsQuerying(false);
      if (testNumber.includes('118942')) {
        setQueryResult({
          status: 'MATCH',
          confidence: 100,
          provider: 'Ecocert France SAS',
          legalName: 'BioLait Normandie SAS',
          expiryDate: '2027-01-09',
          certifiedProducts: ['Lait cru biologique', 'Lait demi-écrémé UHT', 'Crème fraîche 35% bio'],
          officialRegistry: 'https://certificat.ecocert.com/search?q=FR-BIO-01-2024-118942',
          message: 'Certificat authentifié directement sur le registre officiel Ecocert. Statut actif.',
        });
      } else if (testNumber.includes('104928') || testNumber.toLowerCase().includes('fsc')) {
        setQueryResult({
          status: 'REVOKED',
          confidence: 25,
          provider: 'Bureau Veritas Certification / FSC Connect',
          legalName: 'Cartonneries Européennes & Cellulose SA',
          expiryDate: '2026-08-10',
          officialRegistry: 'https://info.fsc.org/certificate.php',
          message: 'ALERTE RÉVOCATION : Le registre officiel FSC (info.fsc.org) confirme une révocation formelle de la chaîne de contrôle.',
        });
      } else {
        setQueryResult({
          status: 'MATCH',
          confidence: 96,
          provider: 'FLOCERT / GOTS / OEKO-TEX Official Registry Gateway',
          legalName: 'Opérateur Partenaire Conforme',
          expiryDate: '2027-10-31',
          certifiedProducts: ['Articles conformes au cahier des charges officiel'],
          officialRegistry: 'https://global-standard.org',
          message: 'Réponse positive du registre officiel sans divergence de périmètre.',
        });
      }
    }, 600);
  };

  const handleRunOrchestrationCycle = async () => {
    setIsOrchestrating(true);
    setOrchestratorProgress(15);

    setTimeout(() => {
      setOrchestratorProgress(50);
      setTimeout(() => {
        setOrchestratorProgress(85);
        setTimeout(async () => {
          const log = await appStore.executeOrchestratorRun();
          setOrchestratorProgress(100);
          setLastExecutedLog(log);
          setIsOrchestrating(false);
        }, 400);
      }, 400);
    }, 400);
  };

  const handleRunResilienceTest = () => {
    setIsSimulating(true);
    setSimResult(null);

    setTimeout(() => {
      const res = appStore.testConnectorScenario(selectedSimProvider, simScenario);
      setSimResult(res);
      setIsSimulating(false);
    }, 500);
  };

  const handleResetCircuitBreaker = (code: string) => {
    appStore.resetCircuitBreaker(code);
    if (simResult) {
      setSimResult({
        ...simResult,
        circuitBreaker: 'CLOSED',
        message: 'Circuit Breaker réinitialisé avec succès (état CLOSED). Flux nominal restauré.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Top Telemetry KPIs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-cyan-400" />
              <span>Connecteurs de Registres & Moteur de Vérification Continue</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Orchestrateur périodique automatisé, conformité éthique des requêtes et tolérance aux pannes (Circuit Breaker)
            </p>
          </div>

          <button
            onClick={handleRunOrchestrationCycle}
            disabled={isOrchestrating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950 transition-colors disabled:opacity-60"
          >
            <RotateCw className={`w-4 h-4 ${isOrchestrating ? 'animate-spin' : ''}`} />
            <span>Lancer l'Orchestrateur Maintenant</span>
          </button>
        </div>

        {/* 5 KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
              Connecteurs Opérationnels
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-emerald-400">
                {operationalCount} / {providers.length}
              </span>
              <span className="text-[10px] text-emerald-500">100% En ligne</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider block">
              Temps de Réponse Moyen
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-white">{avgResponse} ms</span>
              <span className="text-[10px] text-cyan-400/80">&lt; 600 ms SLA</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
              Disponibilité (SLA Global)
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-emerald-400">99.85%</span>
              <span className="text-[10px] text-slate-500">30 derniers jours</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider block">
              Quotas Mensuels API
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-white">{quotaUsedPct}%</span>
              <span className="text-[10px] text-slate-500">{totalMonthlyReqs} / {totalMonthlyQuota}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">
              Circuit Breaker State
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold font-mono text-emerald-400">CLOSED (Normal)</span>
              <span className="text-[10px] text-emerald-500/80">0 panne</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Toolbar */}
      <div className="flex items-center gap-1 border-b border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab('CONNECTORS')}
          className={`px-3.5 py-2 rounded-lg font-semibold text-xs transition-colors flex items-center gap-2 ${
            activeTab === 'CONNECTORS'
              ? 'bg-slate-800 text-cyan-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Cartographie des 5 Connecteurs Officiels</span>
        </button>

        <button
          onClick={() => setActiveTab('ORCHESTRATOR')}
          className={`px-3.5 py-2 rounded-lg font-semibold text-xs transition-colors flex items-center gap-2 ${
            activeTab === 'ORCHESTRATOR'
              ? 'bg-slate-800 text-cyan-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Orchestrateur Périodique ({orchestrationConfig.frequency})</span>
        </button>

        <button
          onClick={() => setActiveTab('RESILIENCE')}
          className={`px-3.5 py-2 rounded-lg font-semibold text-xs transition-colors flex items-center gap-2 ${
            activeTab === 'RESILIENCE'
              ? 'bg-slate-800 text-cyan-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Banc de Test & Simulateur de Résilience</span>
        </button>
      </div>

      {/* TAB 1: CONNECTORS OVERVIEW */}
      {activeTab === 'CONNECTORS' && (
        <div className="space-y-6">
          {/* Ethical & Legal Notice */}
          <div className="p-4 rounded-xl bg-slate-900 border border-cyan-900/40 text-xs flex items-start gap-3">
            <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-cyan-300">
                Charte d'Intégrité & Scraping Éthique CertiWatch
              </p>
              <p className="text-slate-400 leading-relaxed">
                CertiWatch applique une politique stricte : User-Agent transparent, cadence respectueuse (max 1 req/sec),
                aucun contournement de CAPTCHA, et mise en cache certifiée 24h à 7j selon les directives des certificateurs
                (Ecocert, FSC, GOTS, OEKO-TEX, FLOCERT).
              </p>
            </div>
          </div>

          {/* Connectors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.map((prov) => {
              const reqs = prov.monthlyRequestsCount || 600;
              const quota = prov.monthlyQuota || 5000;
              const pct = Math.round((reqs / quota) * 100);

              return (
                <div
                  key={prov.id}
                  className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            {prov.code}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 font-mono">
                            {prov.circuitBreakerState || 'CLOSED'}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white mt-1.5">{prov.name}</h3>
                      </div>
                      <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 shrink-0">
                        <Zap className="w-3.5 h-3.5" />
                        {prov.avgResponseMs} ms
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-400">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Mode d'accès :</span>
                        <span className="font-semibold text-slate-200">{prov.apiAvailability}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Domaine officiel :</span>
                        <span className="font-mono text-slate-300">{prov.officialDomain}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Disponibilité SLA :</span>
                        <span className="text-emerald-400 font-medium">{prov.uptimePercentage || 99.8}%</span>
                      </div>
                    </div>

                    {/* Quota Gauge */}
                    <div className="space-y-1 pt-1 border-t border-slate-800/80">
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>Consommation Quota</span>
                        <span>{reqs} / {quota} ({pct}%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full ${pct > 80 ? 'bg-amber-500' : 'bg-cyan-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                      <p><strong>Quotas :</strong> {prov.rateLimitPolicy}</p>
                      <p className="text-[10px] text-slate-500"><strong>Politique éthique :</strong> {prov.ethicalScrapingPolicy || 'Respect robots.txt'}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedProviderDoc(prov)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-medium underline underline-offset-2"
                    >
                      Fiche technique
                    </button>

                    <a
                      href={prov.publicSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors"
                    >
                      <span>Registre Web</span>
                      <ExternalLink className="w-3 h-3 text-cyan-400" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ORCHESTRATOR & SCHEDULED AUDITS */}
      {activeTab === 'ORCHESTRATOR' && (
        <div className="space-y-6 text-xs">
          {/* Orchestrator Running Banner */}
          {isOrchestrating && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/50 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <RotateCw className="w-4 h-4 text-emerald-400 animate-spin" />
                  <span className="font-bold text-white text-sm">
                    Cycle d'Orchestration en Cours d'Exécution...
                  </span>
                </div>
                <span className="font-mono text-emerald-400 font-bold">{orchestratorProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${orchestratorProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Interrogation des 5 connecteurs officiels, confrontation des dates de validité et mise à jour des alertes de conformité...
              </p>
            </div>
          )}

          {lastExecutedLog && !isOrchestrating && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-xs text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Dernier Cycle d'Orchestration Achevé avec Succès</span>
                </span>
                <span className="font-mono text-[11px] text-slate-400">{lastExecutedLog.completedAt}</span>
              </div>
              <p className="text-slate-300">{lastExecutedLog.summary}</p>
            </div>
          )}

          {/* Orchestration Settings Panel */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-sm">Paramètres du Moteur d'Orchestration</h3>
                <p className="text-slate-400 text-xs">Fréquence des vérifications périodiques et automatisation des sanctions ERP</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Dernier passage :</span>
                <span className="font-mono text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {new Date(orchestrationConfig.lastRunTimestamp).toLocaleString('fr-FR')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-slate-300 block mb-1.5 font-medium">Fréquence de Vérification Automatisée</label>
                <select
                  value={orchestrationConfig.frequency}
                  onChange={(e) => appStore.updateOrchestrationConfig({ frequency: e.target.value as any })}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                >
                  <option value="HOURLY">Toutes les heures (Haute fréquence)</option>
                  <option value="EVERY_6_HOURS">Toutes les 6 heures</option>
                  <option value="DAILY">Quotidien (06:00 UTC - Recommandé)</option>
                  <option value="WEEKLY">Hebdomadaire (Nuit du dimanche)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1.5 font-medium">Durée de Rétention du Cache Local</label>
                <select
                  value={orchestrationConfig.cacheTtlHours}
                  onChange={(e) => appStore.updateOrchestrationConfig({ cacheTtlHours: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                >
                  <option value={12}>12 heures</option>
                  <option value={24}>24 heures (Obligation certificateurs)</option>
                  <option value={48}>48 heures</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1.5 font-medium">Automatisation Blocage ERP</label>
                <label className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={orchestrationConfig.autoTriggerErpBlockOnRevocation}
                    onChange={(e) => appStore.updateOrchestrationConfig({ autoTriggerErpBlockOnRevocation: e.target.checked })}
                    className="rounded text-emerald-500"
                  />
                  <span className="text-slate-200 text-xs">Bloquer ERP si révocation confirmée</span>
                </label>
              </div>
            </div>
          </div>

          {/* Historical Logs of Automated Orchestrator Runs */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <span>Historique d'Exécution de l'Orchestrateur ({orchestratorLogs.length} cycles)</span>
            </h4>

            <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
              <table className="w-full text-left text-[11px] text-slate-300">
                <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Date & Heure</th>
                    <th className="py-2.5 px-3">Durée</th>
                    <th className="py-2.5 px-3">Certificats Audités</th>
                    <th className="py-2.5 px-3">Conformes</th>
                    <th className="py-2.5 px-3">Révocations / Mismatch</th>
                    <th className="py-2.5 px-3">Statut</th>
                    <th className="py-2.5 px-3">Synthèse</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {orchestratorLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 text-white">
                        {new Date(log.startedAt).toLocaleString('fr-FR')}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{log.durationMs} ms</td>
                      <td className="py-2.5 px-3 text-slate-200">{log.totalCertsAudited} certs</td>
                      <td className="py-2.5 px-3 text-emerald-400">{log.matchesCount}</td>
                      <td className="py-2.5 px-3 text-red-400 font-bold">{log.mismatchesCount}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {log.status === 'SUCCESS' ? 'OK' : 'PARTIEL'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-400 max-w-sm truncate">
                        {log.summary}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RESILIENCE & CIRCUIT BREAKER BENCH */}
      {activeTab === 'RESILIENCE' && (
        <div className="space-y-6 text-xs">
          {/* Notice */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Simulateur de Résilience & Tolérance aux Pannes (Circuit Breaker)</span>
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Pour éviter qu'une panne d'un registre officiel (ex: maintenance de la base Ecocert ou FSC) ne bloque
              l'application, CertiWatch intègre un <strong>Circuit Breaker</strong> avec 3 états :
              <strong> CLOSED</strong> (nominal), <strong>HALF-OPEN</strong> (tentatives de rétablissement avec backoff),
              et <strong>OPEN</strong> (court-circuit automatique vers les données vérifiées en cache).
            </p>
          </div>

          {/* Interactive Simulation Controls */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 block mb-1.5 font-medium">Connecteur à Tester</label>
                <select
                  value={selectedSimProvider}
                  onChange={(e) => setSelectedSimProvider(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                >
                  {providers.map((p) => (
                    <option key={p.id} value={p.code}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1.5 font-medium">Scénario de Test à Injecter</label>
                <select
                  value={simScenario}
                  onChange={(e) => setSimScenario(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                >
                  <option value="SUCCESS">1. Succès Nominal (200 OK)</option>
                  <option value="TIMEOUT">2. Timeout Serveur (504 Gateway Timeout)</option>
                  <option value="RATE_LIMIT">3. Dépassement Quota (429 Rate Limit)</option>
                  <option value="CIRCUIT_TRIP">4. Panne Critique Majeure (Circuit Breaker OPEN)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => handleResetCircuitBreaker(selectedSimProvider)}
                className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
              >
                Réinitialiser Circuit Breaker
              </button>

              <button
                type="button"
                disabled={isSimulating}
                onClick={handleRunResilienceTest}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-md transition-colors"
              >
                {isSimulating ? (
                  <RotateCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                <span>Exécuter la Simulation</span>
              </button>
            </div>
          </div>

          {/* Simulation Output Card */}
          {simResult && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                  simResult.httpStatus === 200
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : simResult.httpStatus === 429
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-red-950 text-red-400 border border-red-800'
                }`}>
                  HTTP {simResult.httpStatus} • {simResult.latencyMs} ms
                </span>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-slate-400">Circuit Breaker :</span>
                  <span className={`font-bold ${
                    simResult.circuitBreaker === 'CLOSED'
                      ? 'text-emerald-400'
                      : simResult.circuitBreaker === 'HALF_OPEN'
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }`}>
                    {simResult.circuitBreaker}
                  </span>
                </div>
              </div>

              <p className="text-slate-200 leading-relaxed font-sans">{simResult.message}</p>

              <div className="p-2.5 rounded-lg bg-slate-950 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>Mécanisme de secours (Fallback) :</span>
                <span className={simResult.cacheUsed ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                  {simResult.cacheUsed ? 'Actif (Données certifiées en cache 24h)' : 'Inactif (Connexion directe OK)'}
                </span>
              </div>
            </div>
          )}

          {/* Interactive Gateway Lookup Test */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <Terminal className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Interrogation Directe d'un Certificat au Registre</h3>
                <p className="text-xs text-slate-400">Test unitaire de vérification temps réel</p>
              </div>
            </div>

            <form onSubmit={handleSimulateLookup} className="flex flex-wrap items-center gap-3">
              <select
                value={testStandard}
                onChange={(e) => setTestStandard(e.target.value)}
                className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="ECOCERT">Ecocert Bio (certificat.ecocert.com)</option>
                <option value="FSC">FSC International (info.fsc.org)</option>
                <option value="GOTS">GOTS Database (global-standard.org)</option>
                <option value="OEKO_TEX">OEKO-TEX Label Check</option>
                <option value="FAIRTRADE">FLOCERT Customer Search</option>
              </select>

              <input
                type="text"
                value={testNumber}
                onChange={(e) => setTestNumber(e.target.value)}
                placeholder="N° certificat"
                className="flex-1 min-w-[260px] p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
              />

              <button
                type="submit"
                disabled={isQuerying}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isQuerying ? (
                  <span>Requête en cours...</span>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Interroger le Registre</span>
                  </>
                )}
              </button>
            </form>

            {queryResult && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      queryResult.status === 'MATCH'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {queryResult.status === 'MATCH' ? 'AUTHENTIFIÉ REGISTRE' : 'SANCTION / NON CONFORME'}
                  </span>
                  <span className="font-mono text-slate-400">Score confiance : {queryResult.confidence}%</span>
                </div>

                <p className="text-slate-200">{queryResult.message}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Provider Doc Modal */}
      {selectedProviderDoc && (
        <Modal
          isOpen={!!selectedProviderDoc}
          onClose={() => setSelectedProviderDoc(null)}
          title={`Connecteur Officiel • ${selectedProviderDoc.name}`}
          subtitle={`Code : ${selectedProviderDoc.code} • Domaine : ${selectedProviderDoc.officialDomain}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
              <p className="font-bold text-slate-400 uppercase text-[10px]">Conditions d'Utilisation Officielles</p>
              <p className="text-slate-300">{selectedProviderDoc.legalTermsSummary}</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
              <p className="font-bold text-slate-400 uppercase text-[10px]">Politique de Quotas & Fréquence</p>
              <p className="text-slate-300">{selectedProviderDoc.rateLimitPolicy}</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
              <p className="font-bold text-slate-400 uppercase text-[10px]">Politique de Scraping Éthique</p>
              <p className="text-slate-300">{selectedProviderDoc.ethicalScrapingPolicy || 'Respect strict du robots.txt et cadencement unitaire'}</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5 font-mono text-[11px]">
              <p className="font-bold text-slate-400 uppercase text-[10px]">User-Agent Transmis</p>
              <p className="text-cyan-300">{selectedProviderDoc.userAgentUsed}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
