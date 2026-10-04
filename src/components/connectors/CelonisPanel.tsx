import React, { useState } from 'react';
import {
  Network,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Lock,
  Terminal,
  ExternalLink,
  ShieldAlert,
  Check,
  Zap,
} from 'lucide-react';
import { erpConnectorService } from '../../services/erpConnectorService';
import { CelonisEmsConfig } from '../../types/erpConnectors';

export function CelonisPanel() {
  const [config, setConfig] = useState<CelonisEmsConfig>(erpConnectorService.getCelonisConfig());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  const [simInvoiceRef, setSimInvoiceRef] = useState('INV-2026-FR-9812');
  const [simSpendEur, setSimSpendEur] = useState('74200');
  const [isSimulatingLeak, setIsSimulatingLeak] = useState(false);
  const [leakResult, setLeakResult] = useState<any | null>(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/erp/connectors/celonis/test', { method: 'POST' });
      const data = await res.json();
      setTestResult(data);
      setConfig(erpConnectorService.getCelonisConfig());
    } catch {
      const fallback = erpConnectorService.testCelonisConnection();
      setTestResult(fallback);
      setConfig(erpConnectorService.getCelonisConfig());
    } finally {
      setIsTesting(false);
    }
  };

  const handleSimulateMaverickLeak = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulatingLeak(true);
    setLeakResult(null);

    setTimeout(() => {
      setLeakResult({
        detected: true,
        category: 'MAVERICK_BUYING_NON_CERTIFIED',
        invoiceRef: simInvoiceRef,
        amountEur: Number(simSpendEur),
        quarantined: Number(simSpendEur) >= config.autoQuarantineThresholdEur,
        celonisActionFlowTriggered: true,
        rootCauseSummary:
          'Facture émise sans bon de commande préalable approuvé par la matrice de conformité. Risque RSE critique (standard GOTS absent).',
        recommendedRemediation:
          'Mise en quarantaine automatique du paiement dans SAP FI-AP (Blocage de paiement R). Demande de régularisation fournisseur.',
      });
      setIsSimulatingLeak(false);
    }, 450);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Celonis Process Mining &amp; EMS
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {config.status} ({config.lastPingMs} ms)
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Network className="w-5 h-5 text-cyan-400" />
              Connecteur Celonis EMS &amp; Ivalua Process Intelligence
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Détection continue des fuites de dépenses hors-process (*Maverick Buying*) et des contournements de conformité fournisseurs.
              Déclenchement d'actions automatiques de mise en quarantaine dans SAP / Coupa via les <em>Celonis Action Flows</em>.
            </p>
          </div>

          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950 transition-all shadow-lg shadow-cyan-600/20 cursor-pointer disabled:opacity-50 self-start"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            Tester le Webhook Action Flow
          </button>
        </div>

        {testResult && (
          <div className="mt-4 p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>{testResult.message}</span>
            </div>
            <span className="text-slate-400">Latence: {testResult.latencyMs} ms</span>
          </div>
        )}
      </div>

      {/* Grid : Config & Maverick Detector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column : Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            Paramètres du Hub Celonis EMS
          </h4>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-medium">URL de l'Équipe Celonis Cloud</label>
              <input
                type="text"
                readOnly
                value={config.teamUrl}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-300 mt-1"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium">URL Webhook Action Flow</label>
              <input
                type="text"
                readOnly
                value={config.actionFlowWebhookUrl}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-cyan-300 mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold">Détection Maverick</span>
                <div className="text-emerald-400 font-mono font-bold">ACTIVE</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold">Seuil de Quarantaine</span>
                <div className="text-amber-400 font-mono font-bold">50 000 € HT</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column : Maverick Simulator */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Simulateur de Détection Maverick Buying (Spend Leak)
          </h4>

          <form onSubmit={handleSimulateMaverickLeak} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 font-medium">Réf. Facture / Engagement</label>
                <input
                  type="text"
                  value={simInvoiceRef}
                  onChange={(e) => setSimInvoiceRef(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-white mt-1 focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-slate-400 font-medium">Montant (€ HT)</label>
                <input
                  type="number"
                  value={simSpendEur}
                  onChange={(e) => setSimSpendEur(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-white mt-1 focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSimulatingLeak}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-slate-950 transition-all shadow-lg shadow-amber-600/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSimulatingLeak ? <RotateCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              <span>Simuler Détection Process Mining Celonis</span>
            </button>
          </form>

          {leakResult && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between font-mono">
                <span className="text-amber-400 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Fuite Détectée par Celonis EMS
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    leakResult.quarantined ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {leakResult.quarantined ? 'QUARANTAINE AUTOMATIQUE ACTIVE' : 'ALERTE SIMPLE'}
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">{leakResult.rootCauseSummary}</p>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-cyan-300 font-mono">
                {leakResult.recommendedRemediation}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
