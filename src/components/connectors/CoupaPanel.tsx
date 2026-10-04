import React, { useState } from 'react';
import {
  Workflow,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Lock,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Check,
  UserCheck,
} from 'lucide-react';
import { erpConnectorService } from '../../services/erpConnectorService';
import { CoupaRestConfig } from '../../types/erpConnectors';

export function CoupaPanel() {
  const [config, setConfig] = useState<CoupaRestConfig>(erpConnectorService.getCoupaConfig());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  // Approval route injection simulation
  const [requisitionId, setRequisitionId] = useState('REQ-COUPA-44810');
  const [officerEmail, setOfficerEmail] = useState(config.complianceOfficerEmail);
  const [isInjecting, setIsInjecting] = useState(false);
  const [injectResult, setInjectResult] = useState<any | null>(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/erp/connectors/coupa/test', { method: 'POST' });
      const data = await res.json();
      setTestResult(data);
      setConfig(erpConnectorService.getCoupaConfig());
    } catch {
      const fallback = erpConnectorService.testCoupaConnection();
      setTestResult(fallback);
      setConfig(erpConnectorService.getCoupaConfig());
    } finally {
      setIsTesting(false);
    }
  };

  const handleSimulateApprovalRoute = (e: React.FormEvent) => {
    e.preventDefault();
    setIsInjecting(true);
    setInjectResult(null);

    setTimeout(() => {
      setInjectResult({
        success: true,
        requisitionId,
        approverAdded: officerEmail,
        approvalPosition: 2,
        triggerReason: 'Certificat fournisseur expirant dans moins de 30 jours (Règle Coupa CW-ESCALATE-01)',
        updatedApprovalChain: [
          { step: 1, role: 'Cost Center Manager', status: 'APPROVED' },
          { step: 2, role: 'Compliance Officer (CertiWatch Injected)', email: officerEmail, status: 'PENDING_APPROVAL' },
          { step: 3, role: 'Procurement Director', status: 'QUEUED' },
        ],
      });
      setIsInjecting(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">
                Coupa Certified App
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {config.status} ({config.lastPingMs} ms)
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Workflow className="w-5 h-5 text-orange-400" />
              Connecteur Coupa Procurement REST API (v34)
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Synchronisation bidirectionnelle avec les réquisitions d'achat Coupa.
              Mise à jour des champs personnalisés de conformité et injection dynamique d'approbateurs de conformité dans le circuit de validation (*Approval Chains*).
            </p>
          </div>

          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white transition-all shadow-lg shadow-orange-600/20 cursor-pointer disabled:opacity-50 self-start"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            Tester le Token OAuth2 Coupa
          </button>
        </div>

        {testResult && (
          <div className="mt-4 p-3.5 rounded-xl bg-orange-950/40 border border-orange-500/30 text-xs font-mono text-orange-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-orange-400" />
              <span>{testResult.message}</span>
            </div>
            <span className="text-slate-400">Scopes: {testResult.scopesGranted?.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Grid : Config & Workflow Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column : Coupa Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-orange-400" />
            Paramètres d'Intégration Instance Coupa
          </h4>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-medium">URL de l'Instance Coupa</label>
              <input
                type="text"
                readOnly
                value={config.instanceUrl}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-300 mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 font-medium">Version de l'API REST</label>
                <input
                  type="text"
                  readOnly
                  value={`Coupa REST API ${config.apiVersion}`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-300 mt-1"
                />
              </div>
              <div>
                <label className="text-slate-400 font-medium">OAuth2 Client ID</label>
                <input
                  type="text"
                  readOnly
                  value={config.clientId}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-orange-300 mt-1"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <span className="text-slate-400 font-semibold">Champs Personnalisés Synchronisés (*Custom Fields*) :</span>
              <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  <div className="text-[10px] text-slate-500">Statut</div>
                  <div className="text-orange-300 truncate">{config.customFieldsMapping.statusField}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  <div className="text-[10px] text-slate-500">Score ESG</div>
                  <div className="text-emerald-300 truncate">{config.customFieldsMapping.scoreField}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  <div className="text-[10px] text-slate-500">Hash Audit</div>
                  <div className="text-cyan-300 truncate">{config.customFieldsMapping.proofHashField}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column : Dynamic Approval Chain Modifier */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            Injection Dynamique d'Approbation Coupa (Escalade)
          </h4>

          <form onSubmit={handleSimulateApprovalRoute} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-medium">N° de Réquisition Coupa</label>
              <input
                type="text"
                value={requisitionId}
                onChange={(e) => setRequisitionId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-white mt-1 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium">Email du Responsable Conformité / RSE</label>
              <input
                type="email"
                value={officerEmail}
                onChange={(e) => setOfficerEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-emerald-300 mt-1 focus:border-orange-500"
              />
            </div>

            <button
              type="submit"
              disabled={isInjecting}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white transition-all shadow-lg shadow-orange-600/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isInjecting ? <RotateCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              <span>Tester l'Injection dans l'Approval Chain Coupa</span>
            </button>
          </form>

          {injectResult && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5 font-mono">
                  <Check className="w-4 h-4" /> Workflow Coupa Mis à Jour
                </span>
                <span className="text-slate-400 font-mono">Position : {injectResult.approvalPosition}</span>
              </div>

              <div className="space-y-1.5">
                {injectResult.updatedApprovalChain.map((step: any) => (
                  <div
                    key={step.step}
                    className={`p-2 rounded-lg text-xs font-mono flex items-center justify-between border ${
                      step.status === 'PENDING_APPROVAL'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>
                      {step.step}. {step.role}
                    </span>
                    <span className="text-[10px] uppercase font-bold">{step.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
