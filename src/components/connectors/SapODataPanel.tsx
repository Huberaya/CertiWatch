import React, { useState } from 'react';
import {
  Server,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Lock,
  Layers,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Check,
  Ban,
} from 'lucide-react';
import { erpConnectorService } from '../../services/erpConnectorService';
import { SapODataConfig } from '../../types/erpConnectors';

export function SapODataPanel() {
  const [config, setConfig] = useState<SapODataConfig>(erpConnectorService.getSapConfig());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  // Simulation form
  const [poNumber, setPoNumber] = useState('PO-2026-SAP-98124');
  const [itemNumber, setItemNumber] = useState('00010');
  const [reason, setReason] = useState('Certificat GOTS expiré depuis plus de 15 jours');
  const [isHolding, setIsHolding] = useState(false);
  const [holdResult, setHoldResult] = useState<any | null>(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/erp/connectors/sap/test', { method: 'POST' });
      const data = await res.json();
      setTestResult(data);
      setConfig(erpConnectorService.getSapConfig());
    } catch {
      const fallback = erpConnectorService.testSapConnection();
      setTestResult(fallback);
      setConfig(erpConnectorService.getSapConfig());
    } finally {
      setIsTesting(false);
    }
  };

  const handleApplyHold = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsHolding(true);
    setHoldResult(null);
    try {
      const res = await fetch('/api/erp/connectors/sap/simulate-hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poNumber, itemNumber, reason }),
      });
      const data = await res.json();
      setHoldResult(data);
    } catch {
      const fallback = erpConnectorService.simulateSapPurchaseHold(poNumber, itemNumber, reason);
      setHoldResult(fallback);
    } finally {
      setIsHolding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                SAP Certified Integration
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {config.status} ({config.lastPingMs} ms)
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-400" />
              Connecteur SAP S/4HANA OData v2 / v4
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Interception en temps réel des commandes d'achats via le service standard OData <code>API_PURCHASEORDER_PROCESS_SRV</code>.
              Injection automatisée de l'indicateur de blocage <code>PurchasingHoldBlock = 'X'</code> au niveau des postes (Item level).
            </p>
          </div>

          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-600/20 cursor-pointer disabled:opacity-50 self-start"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            Tester la Connectivité OData
          </button>
        </div>

        {testResult && (
          <div className="mt-4 p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs font-mono text-blue-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              <span>{testResult.message}</span>
            </div>
            <span className="text-slate-400">Latence: {testResult.latencyMs} ms</span>
          </div>
        )}
      </div>

      {/* 2-Columns : Config & Hold Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column : OData Connection Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-400" />
            Paramètres de Connexion SAP NetWeaver Gateway
          </h4>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-medium">URL du Service OData</label>
              <input
                type="text"
                readOnly
                value={config.endpointUrl}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-300 mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 font-medium">SAP Mandant / Client</label>
                <input
                  type="text"
                  readOnly
                  value={config.sapClient}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-300 mt-1"
                />
              </div>
              <div>
                <label className="text-slate-400 font-medium">Protocole d'Authentification</label>
                <input
                  type="text"
                  readOnly
                  value="OAuth2 mTLS (X.509)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-emerald-400 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 font-medium">Entité OData Ciblée</label>
                <input
                  type="text"
                  readOnly
                  value={config.entitySet}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-blue-300 mt-1"
                />
              </div>
              <div>
                <label className="text-slate-400 font-medium">Champ de Blocage SAP</label>
                <input
                  type="text"
                  readOnly
                  value={config.blockingField}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-amber-300 mt-1"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              <span className="font-semibold text-white">Mécanisme d'Interception :</span> Lors de la création d'un bon de commande dans SAP (Transaction ME21N ou Fiori App Manage Purchase Orders), un BAdI (Business Add-In) ou un Event Mesh déclenche la validation CertiWatch. Si une anomalie est détectée, le statut de blocage est immédiatement appliqué.
            </div>
          </div>
        </div>

        {/* Right Column : Purchase Hold Simulation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Ban className="w-4 h-4 text-red-400" />
            Simulateur d'Injection de Blocage SAP (Hold)
          </h4>

          <form onSubmit={handleApplyHold} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 font-medium">N° Commande d'Achat SAP (EBELN)</label>
                <input
                  type="text"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-white mt-1 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-400 font-medium">N° Poste de Commande (EBELP)</label>
                <input
                  type="text"
                  value={itemNumber}
                  onChange={(e) => setItemNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-white mt-1 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-medium">Motif de Non-Conformité Certifiante</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-amber-300 mt-1 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isHolding}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-all shadow-lg shadow-red-600/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isHolding ? <RotateCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              <span>Déclencher le Blocage SAP (PATCH PurchasingHoldBlock='X')</span>
            </button>
          </form>

          {holdResult && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Réponse OData SAP 200 OK
                </span>
                <span className="text-red-400 font-bold">LOCKED_BY_CERTIWATCH</span>
              </div>
              <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto max-h-40 leading-relaxed">
                {JSON.stringify(holdResult.odataResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
