import React, { useState, useEffect } from 'react';
import {
  Radar,
  CloudRain,
  Anchor,
  DollarSign,
  AlertTriangle,
  ShieldCheck,
  TrendingDown,
  Activity,
  Download,
  CheckCircle2,
  Sliders,
  ExternalLink,
  Layers,
  ArrowUpRight,
  Sparkles,
  Zap,
  Globe2,
  Clock,
  Compass,
} from 'lucide-react';
import { riskStore } from '../../db/riskStore';
import {
  EarlyWarningAlert,
  SupplierFinancialHealth,
  SupplyChainStressTestScenario,
  SupplyChainResilienceMetrics,
} from '../../types/riskEarlyWarning';
import { appStore } from '../../db/store';

export function PredictiveRiskView() {
  const [metrics, setMetrics] = useState<SupplyChainResilienceMetrics>(riskStore.getResilienceMetrics());
  const [alerts, setAlerts] = useState<EarlyWarningAlert[]>(riskStore.getAlerts());
  const [financialHealth, setFinancialHealth] = useState<SupplierFinancialHealth[]>(riskStore.getFinancialHealth());
  const [scenarios, setScenarios] = useState<SupplyChainStressTestScenario[]>(riskStore.getScenarios());
  const [activeTab, setActiveTab] = useState<'ALERTS' | 'FINANCIAL' | 'STRESS_TEST' | 'CONTINUITY'>('ALERTS');
  const [notification, setNotification] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<SupplyChainStressTestScenario>(riskStore.getScenarios()[0]);

  useEffect(() => {
    return riskStore.subscribe(() => {
      setMetrics(riskStore.getResilienceMetrics());
      setAlerts(riskStore.getAlerts());
      setFinancialHealth(riskStore.getFinancialHealth());
      setScenarios(riskStore.getScenarios());
    });
  }, []);

  const activeTenant = appStore.getActiveTenant();

  const handleAcknowledgeAlert = (id: string, title: string) => {
    riskStore.acknowledgeAlert(id);
    setNotification(`Plan d'atténuation engagé pour : "${title}".`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleResolveAlert = (id: string) => {
    riskStore.resolveAlert(id);
    setNotification(`Alerte clôturée et risque contenu avec succès.`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Hero Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-950/70 via-slate-900 to-indigo-950/50 border border-sky-500/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <Radar className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Chantier 17 : IA Prédictive des Risques &amp; Veille Météo / Géopolitique
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono">
                Copernicus &bull; AIS Maritime Satellite
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                Stress-Testing Industriel
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Détection anticipée des ruptures de chaîne logistique pour <strong>{activeTenant.name}</strong> : stress hydrique des cultures, blocages portuaires, santé financière (Altman Z-Score) et simulation de plans de contingence.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/api/risks/contingency-plan/export"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-slate-950 font-bold text-xs transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter Plan PCA (HTML)</span>
          </a>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-sky-950/40 border border-sky-500/30 text-sky-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Indice Global de Résilience</span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-sky-400">
              {metrics.globalResilienceScore}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Capacité d'absorption face aux chocs d'approvisionnement.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Alertes Précoces Actives</span>
            <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
              {metrics.criticalAlertsCount} Critiques
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">
              {metrics.activeAlertsCount}
            </span>
            <span className="text-xs text-slate-400">événements sous veille</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Météo extrême, congestion maritime et fragilité BFR.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Dépenses Achats Exposées</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">
              {(metrics.totalSpendAtRiskEur / 1000000).toFixed(1)} M€
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Montant des commandes ouvertes directement sous surveillance.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Buffer de Sécurité Opérationnel</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-400">
              {metrics.averageLeadTimeBufferDays}
            </span>
            <span className="text-xs text-slate-400">jours de couverture</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Stocks tampons et flexibilité des commandes SAP / Coupa.
          </p>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('ALERTS')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'ALERTS'
              ? 'bg-sky-600 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Radar className="w-4 h-4" />
          <span>Radar des Alertes Précoces ({alerts.filter((a) => a.status !== 'CONTAINED_RESOLVED').length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('FINANCIAL')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'FINANCIAL'
              ? 'bg-sky-600 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Santé Financière &bull; Altman Z-Score ({financialHealth.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('STRESS_TEST')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'STRESS_TEST'
              ? 'bg-sky-600 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Simulateur de Stress-Testing ({scenarios.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CONTINUITY')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'CONTINUITY'
              ? 'bg-sky-600 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Plan de Continuité &bull; PCA</span>
        </button>
      </div>

      {/* TAB 1: Live Early Warning Alerts */}
      {activeTab === 'ALERTS' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Flux d'Alertes Temps Réel (Climat, Géopolitique &amp; Choke-Points)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Algorithme d'analyse croisée des flux d'imagerie satellite Copernicus, positions AIS et dépêches logistiques.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded bg-slate-800 text-sky-400 font-mono font-bold">
                  {alerts.filter((a) => a.status === 'MITIGATION_IN_PROGRESS').length} en cours de remédiation
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border transition space-y-3 ${
                    alert.severity === 'CRITICAL_BLACK_SWAN'
                      ? 'bg-rose-950/30 border-rose-500/40'
                      : alert.severity === 'HIGH_ALERT'
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] text-slate-500">{alert.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          alert.severity === 'CRITICAL_BLACK_SWAN'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : alert.severity === 'HIGH_ALERT'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        }`}
                      >
                        {alert.severity.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-semibold text-slate-300">
                        {alert.affectedCountry} &bull; {alert.affectedRegion}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-400">
                        Retard estimé : <strong className="text-rose-400 font-mono">+{alert.predictedLeadTimeDelayDays} jours</strong>
                      </span>
                      <span className="text-slate-400">
                        Probabilité : <strong className="text-sky-400 font-mono">{alert.probabilityScorePercent}%</strong>
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-sm">{alert.title}</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {alert.summaryDescription}
                    </p>
                  </div>

                  {/* Impacted suppliers & spend */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Fournisseur &amp; Matière Exposée</span>
                      <div className="space-y-1 mt-1">
                        {alert.affectedSuppliers.map((sup, idx) => (
                          <div key={idx} className="flex justify-between items-center text-slate-300">
                            <span className="font-bold text-white">{sup.supplierName}</span>
                            <span className="font-mono text-amber-300">
                              {(sup.spendAtRiskEur / 1000000).toFixed(2)} M€ ({sup.exposedCommodity})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Mitigation Recommandée (Plan IA)</span>
                      <p className="text-slate-300 mt-1 text-[11px] leading-relaxed">
                        {alert.recommendedMitigation}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <div>
                      Source : <strong className="text-white">{alert.source}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      {alert.status === 'ACTIVE_WARNING' && (
                        <button
                          type="button"
                          onClick={() => handleAcknowledgeAlert(alert.id, alert.title)}
                          className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-slate-950 font-bold text-xs transition"
                        >
                          Engager la Mitigation
                        </button>
                      )}
                      {alert.status === 'MITIGATION_IN_PROGRESS' && (
                        <button
                          type="button"
                          onClick={() => handleResolveAlert(alert.id)}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition"
                        >
                          Marquer Contenu / Résolu
                        </button>
                      )}
                      {alert.status === 'CONTAINED_RESOLVED' && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                          ✓ Risque Neutralisé
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Supplier Financial Health & Altman Z-Score */}
      {activeTab === 'FINANCIAL' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-amber-400" />
                  <span>Modèle Prédictif d'Insolvabilité &amp; Altman Z-Score</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Évaluation prévisionnelle de solvabilité à 12 mois pour anticiper les défauts de paiement et arrêts d'usines.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-emerald-400 font-bold">&gt; 2.99 Safe</span>
                <span className="text-amber-400 font-bold">1.81 - 2.99 Zone Grise</span>
                <span className="text-rose-400 font-bold">&lt; 1.81 Risque de Faillite</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Fournisseur</th>
                    <th className="py-3 px-4">Pays</th>
                    <th className="py-3 px-4 text-center">Altman Z-Score</th>
                    <th className="py-3 px-4 text-center">Zone de Risque</th>
                    <th className="py-3 px-4 text-right">DSO (Crédit Client)</th>
                    <th className="py-3 px-4 text-right">Ratio Fonds de Roulement</th>
                    <th className="py-3 px-4 text-center">Notation Agence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {financialHealth.map((item) => (
                    <tr key={item.supplierId} className="hover:bg-slate-800/20 transition">
                      <td className="py-3 px-4 font-bold text-white">{item.supplierName}</td>
                      <td className="py-3 px-4 text-slate-400">{item.country}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-sm">
                        <span
                          className={
                            item.altmanZScore >= 2.99
                              ? 'text-emerald-400'
                              : item.altmanZScore >= 1.81
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }
                        >
                          {item.altmanZScore.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.distressRiskLabel === 'SAFE'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {item.distressRiskLabel === 'SAFE' ? 'Sain & Pérenne' : 'Vigilance (Zone Grise)'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold">
                        <span className={item.daysSalesOutstanding > 60 ? 'text-amber-400' : 'text-slate-200'}>
                          {item.daysSalesOutstanding} jours
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-200">
                        {item.workingCapitalRatio}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-white">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-xs">
                          {item.creditRatingAgencyScore}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Stress-Testing Simulator */}
      {activeTab === 'STRESS_TEST' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
            <div className="pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-sky-400" />
                <span>Simulateur de Chocs &amp; Stress-Testing Industriel</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulez l'impact financier et opérationnel de crises majeures sur votre chaîne d'approvisionnement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {scenarios.map((scen) => (
                <div
                  key={scen.id}
                  onClick={() => setSelectedScenario(scen)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedScenario.id === scen.id
                      ? 'bg-slate-950 border-sky-500/60 shadow-lg shadow-sky-950/20'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-2">
                    <span>{scen.id}</span>
                    <span className="text-sky-400 font-bold">{scen.contingencyReadinessScore}/100 Préparé</span>
                  </div>
                  <h4 className="font-bold text-white text-xs leading-snug">{scen.name}</h4>
                  <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center text-[11px]">
                    <span className="text-rose-400 font-bold font-mono">
                      +{(scen.totalFinancialImpactEur / 1000).toFixed(0)} k€
                    </span>
                    <span className="text-slate-400 font-mono">+{scen.simulatedLeadTimeInflationDays} jours</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Scenario Details & Impact Breakdown */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] text-sky-400 uppercase tracking-wider font-bold">
                    Scénario de Crise Actif
                  </span>
                  <h4 className="font-bold text-white text-base mt-0.5">{selectedScenario.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{selectedScenario.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded bg-slate-800 text-sky-400 text-xs font-mono font-bold">
                    Buffer Recommandé : {selectedScenario.recommendedBufferStockWeeks} semaines
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Hausse des Délais de Transit</span>
                  <span className="text-rose-400 font-bold text-base font-mono">
                    +{selectedScenario.simulatedLeadTimeInflationDays} jours
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Surcoût Logistique &amp; Fret</span>
                  <span className="text-amber-400 font-bold text-base font-mono">
                    +{selectedScenario.simulatedCostIncreasePercent} %
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Impact Financier Estimé</span>
                  <span className="text-white font-bold text-base font-mono">
                    {(selectedScenario.totalFinancialImpactEur / 1000).toFixed(0)} k€
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Références SKU Exposées</span>
                  <span className="text-sky-400 font-bold text-base font-mono">
                    {selectedScenario.impactedSkuCount} SKUs
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-sky-950/20 border border-sky-500/30 text-xs text-sky-200 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Plan de Contingence Pré-Activé :</span>
                  <p className="mt-0.5 text-slate-300">
                    Fournisseur alternatif qualifié disponible en base &bull; Augmentation automatique du stock de sécurité de <strong>{selectedScenario.recommendedBufferStockWeeks} semaines</strong> sur les composants critiques &bull; Reroutage logistique simulé sans rupture de chaîne de production.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Business Continuity Plan (PCA) */}
      {activeTab === 'CONTINUITY' && (
        <div className="space-y-6 text-xs">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-sky-400" />
                <span>Plan de Continuité d’Activité Supply Chain (PCA Institutionnel)</span>
              </h4>
              <p className="text-slate-400 text-xs mt-0.5">
                Dispositif de bascule automatique et protocoles d'approvisionnement en situation de crise.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-sky-400" />
                  <span>Protocole 1 : Sourcing Multi-Bassin &amp; Clauses de Secours</span>
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Dual-sourcing systématique sur 100% des matières premières stratégiques (lait bio, fèves de cacao, café arabica, packaging carton). Aucun fournisseur unique n'excède 65% des volumes totaux.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-sky-400" />
                  <span>Protocole 2 : Stocks Stratégiques Tampons (Buffer Stock)</span>
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Maintien d'un volant de sécurité minimum de 16,5 jours de production réparti sur 3 plateformes logistiques centrales régionales (Le Havre, Lyon Saint-Exupéry, Anvers).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-sky-400" />
                  <span>Protocole 3 : Reroutage Logistique &amp; Report Modal Express</span>
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Contrats-cadres d'urgence avec les opérateurs ferroviaires (ferroutage Trans-Eurasien) et transporteurs routiers HVO100 pour contourner tout blocage portuaire en moins de 48 heures.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-sky-400" />
                  <span>Protocole 4 : Reverse Factoring &amp; Soutien de Trésorerie Tier 1</span>
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Ligne de crédit d'affacturage inversé de 5 M€ activable pour protéger les partenaires stratégiques présentant une dégradation temporaire de leur Altman Z-Score lors des hausses de coûts d'énergie.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
