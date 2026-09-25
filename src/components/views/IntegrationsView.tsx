import React, { useState } from 'react';
import { Supplier } from '../../types/supplier';
import { Certificate } from '../../types/certificate';
import { Cpu, Ban, CheckCircle2, ShieldAlert, ArrowRight, Play, Terminal, Code2 } from 'lucide-react';
import { appStore } from '../../db/store';

interface IntegrationsViewProps {
  suppliers: Supplier[];
  certificates: Certificate[];
}

export function IntegrationsView({ suppliers, certificates }: IntegrationsViewProps) {
  // Simulator state
  const [simSupplierId, setSimSupplierId] = useState(suppliers[0]?.id || '');
  const [simCategory, setSimCategory] = useState('Lait biologique');
  const [simPoAmount, setSimPoAmount] = useState('145000');
  const [simResult, setSimResult] = useState<any | null>(null);

  const handleSimulateErpCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const supplier = suppliers.find((s) => s.id === simSupplierId) || suppliers[0];
    if (!supplier) return;

    const evaluation = appStore.evaluateOrderCompliance({
      supplierId: supplier.id,
      productCategory: simCategory,
      amountEur: Number(simPoAmount) || 0,
      logAudit: true,
    });

    setSimResult({
      decision: evaluation.decision,
      code: evaluation.decision === 'ALLOWED' ? 'OK_COMPLIANT' : 'ERR_COMPLIANCE_HARD_BLOCK',
      status: evaluation.decision === 'ALLOWED' ? 200 : 403,
      reason: evaluation.reasons.join(' | '),
      actionTaken:
        evaluation.decision === 'ALLOWED'
          ? 'COMMANDE D’ACHAT APPROUVÉE DANS L’ERP (SAP/Coupa)'
          : evaluation.decision === 'REQUIRES_APPROVAL'
          ? 'COMMANDE EN SUSPENS - DÉROGATION QUALITÉ REQUISE'
          : 'COMMANDE D’ACHAT REJETÉE AUTOMATIQUEMENT DANS L’ERP (SAP/Coupa/Ivalua)',
      supplierStatus: supplier.status,
      missingStandards: evaluation.missingStandards,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-400" />
          <span>Intégrations ERP & Blocage Automatisé des Commandes</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Connecteurs certifiés pour SAP S/4HANA, Coupa, Ivalua, Oracle NetSuite et Microsoft Dynamics
        </p>
      </div>

      {/* Simulator Section */}
      <div className="p-5 rounded-xl border border-indigo-900/40 bg-gradient-to-b from-indigo-950/20 via-slate-900 to-slate-900 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Play className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Simulateur de Contrôle Pré-Commande ERP</h3>
              <p className="text-xs text-slate-400">
                Simule l’appel API exécuté par un acheteur ou un workflow P2P lors de la validation d’un bon de commande
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSimulateErpCheck} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-slate-300 font-medium block mb-1">Fournisseur</label>
            <select
              value={simSupplierId}
              onChange={(e) => setSimSupplierId(e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.legalName} ({s.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">Ligne de Produit Commandée</label>
            <input
              type="text"
              value={simCategory}
              onChange={(e) => setSimCategory(e.target.value)}
              placeholder="Ex : Coton bio, Emballage carton..."
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">Montant Bon de Commande (€ HT)</label>
            <input
              type="number"
              value={simPoAmount}
              onChange={(e) => setSimPoAmount(e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors flex items-center justify-center gap-2 shadow-md shadow-indigo-950"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Évaluer Commande</span>
            </button>
          </div>
        </form>

        {simResult && (
          <div
            className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in ${
              simResult.decision === 'AUTHORIZED'
                ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                : 'bg-rose-950/30 border-rose-800/50 text-rose-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`font-bold px-2 py-0.5 rounded text-[11px] font-mono ${
                  simResult.decision === 'AUTHORIZED'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-600/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                DÉCISION CERTIWATCH : {simResult.decision} (Code {simResult.code})
              </span>
              <span className="font-mono text-slate-400">HTTP {simResult.status}</span>
            </div>

            <p className="font-semibold text-white">{simResult.actionTaken}</p>
            <p className="text-slate-300 text-[11px]">{simResult.reason}</p>
          </div>
        )}
      </div>

      {/* API Reference Mockup */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-3 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">API REST & Webhooks CertiWatch</h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-400">OpenAPI 3.1 Spécifiée</span>
        </div>

        <div className="space-y-2 text-slate-300 font-mono text-[11px]">
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-emerald-400 font-bold mr-2">POST</span>
              <span>/api/v1/compliance/check-order</span>
            </div>
            <span className="text-slate-500">Contrôle de validation pré-achat</span>
          </div>

          <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-cyan-400 font-bold mr-2">GET</span>
              <span>/api/v1/suppliers/{'{id}'}/compliance-status</span>
            </div>
            <span className="text-slate-500">Statut temps réel du fournisseur</span>
          </div>

          <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-amber-400 font-bold mr-2">WEBHOOK</span>
              <span>certificate.revoked / certificate.expired</span>
            </div>
            <span className="text-slate-500">Déclencheur immédiat de blocage ERP</span>
          </div>
        </div>
      </div>
    </div>
  );
}
