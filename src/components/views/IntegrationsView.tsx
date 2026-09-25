import React, { useState } from 'react';
import { Supplier } from '../../types/supplier';
import { Certificate } from '../../types/certificate';
import {
  Cpu,
  Radio,
  Terminal,
  Code2,
  Play,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Clock,
  ShieldCheck,
  Send,
  Plus,
  RotateCw,
  Copy,
  Trash2,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { appStore } from '../../db/store';
import { WebhookModal } from '../webhooks/WebhookModal';
import { WebhookSimulatorModal } from '../webhooks/WebhookSimulatorModal';
import {
  WebhookEndpoint,
  WebhookDeliveryLog,
  DeadLetterQueueItem,
  ApiDocEndpoint,
} from '../../types/webhook';
import { SEED_API_DOCUMENTATION } from '../../db/webhookSeedData';

interface IntegrationsViewProps {
  suppliers: Supplier[];
  certificates: Certificate[];
}

export function IntegrationsView({ suppliers, certificates }: IntegrationsViewProps) {
  const [activeTab, setActiveTab] = useState<'simulator' | 'webhooks' | 'dlq' | 'api_docs'>('simulator');

  // Modals state
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookEndpoint | null>(null);

  const [isSimulatorModalOpen, setIsSimulatorModalOpen] = useState(false);
  const [simulatorEndpointId, setSimulatorEndpointId] = useState<string | null>(null);

  // Store data
  const webhooks = appStore.getTenantWebhooks();
  const webhookLogs = appStore.getTenantWebhookLogs();
  const dlqItems = appStore.getDeadLetterQueue();

  // ERP PO Simulator State
  const [simSupplierId, setSimSupplierId] = useState(suppliers[0]?.id || '');
  const [simCategory, setSimCategory] = useState('Lait biologique');
  const [simPoAmount, setSimPoAmount] = useState('145000');
  const [simResult, setSimResult] = useState<any | null>(null);

  // API Explorer State
  const [selectedApiIndex, setSelectedApiIndex] = useState(0);
  const [apiTestResponse, setApiTestResponse] = useState<any | null>(null);
  const [isCallingApi, setIsCallingApi] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  // DLQ Replay feedback
  const [replaySuccessMessage, setReplaySuccessMessage] = useState('');

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

  const handleOpenEditWebhook = (wh: WebhookEndpoint) => {
    setSelectedWebhook(wh);
    setIsWebhookModalOpen(true);
  };

  const handleOpenNewWebhook = () => {
    setSelectedWebhook(null);
    setIsWebhookModalOpen(true);
  };

  const handleDeleteWebhook = (id: string) => {
    if (confirm('Supprimer ce webhook sortant ?')) {
      appStore.deleteWebhook(id);
    }
  };

  const handleOpenSimulator = (epId?: string) => {
    setSimulatorEndpointId(epId || webhooks[0]?.id || null);
    setIsSimulatorModalOpen(true);
  };

  const handleReplaySingleDlq = (id: string) => {
    appStore.replayDlqItem(id);
    setReplaySuccessMessage('Message rejoué avec succès vers le récepteur ERP (HTTP 200 OK).');
    setTimeout(() => setReplaySuccessMessage(''), 4000);
  };

  const handleReplayAll = () => {
    const count = appStore.replayAllDlq();
    setReplaySuccessMessage(`${count} message(s) en file d'attente rejoués avec succès.`);
    setTimeout(() => setReplaySuccessMessage(''), 4000);
  };

  const handleDiscardDlq = (id: string) => {
    appStore.discardDlqItem(id);
  };

  const currentApiDoc: ApiDocEndpoint = SEED_API_DOCUMENTATION[selectedApiIndex];

  const generateCurlCommand = (doc: ApiDocEndpoint) => {
    const headersStr = Object.entries(doc.headers)
      .map(([k, v]) => `-H "${k}: ${v}"`)
      .join(' ');
    const bodyStr = doc.requestBody ? `-d '${JSON.stringify(doc.requestBody)}'` : '';
    return `curl -X ${doc.method} "https://api.certiwatch.enterprise${doc.path}" \\\n  ${headersStr} ${bodyStr}`;
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(generateCurlCommand(currentApiDoc));
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleTestApiCall = () => {
    setIsCallingApi(true);
    setTimeout(() => {
      setApiTestResponse(currentApiDoc.responseSample);
      setIsCallingApi(false);
    }, 400);
  };

  const pendingDlqCount = dlqItems.filter((i) => i.status === 'PENDING_RETRY').length;

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Cpu className="w-6 h-6 text-indigo-400" />
              <span>Intégrations ERP, EventBus & Console Développeur</span>
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              CHANTIER 9
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gating temps réel des bons de commandes ERP (SAP S/4HANA, Coupa, NetSuite), webhooks signés HMAC, Dead Letter Queue (DLQ) et API OpenAPI.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleOpenSimulator()}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-700"
          >
            <Send className="w-4 h-4 text-indigo-400" />
            Simuler Émission Webhook
          </button>

          <button
            type="button"
            onClick={handleOpenNewWebhook}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            Ajouter un Webhook ERP
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('simulator')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'simulator'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Cpu className="w-4 h-4" />
          1. Gating Commandes & Simulateur ERP
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('webhooks')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'webhooks'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Radio className="w-4 h-4" />
          2. Webhooks Sortants & EventBus ({webhooks.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dlq')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'dlq'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <RotateCw className="w-4 h-4" />
          3. File d'Attente DLQ ({pendingDlqCount} en attente)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('api_docs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'api_docs'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Terminal className="w-4 h-4" />
          4. Console Développeur & API OpenAPI
        </button>
      </div>

      {/* Tab 1 : ERP Simulator */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-indigo-900/40 bg-gradient-to-b from-indigo-950/20 via-slate-900 to-slate-900 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <Play className="w-4 h-4 fill-indigo-400 text-indigo-400" />
                Simulateur de Passation de Commande d'Achat (SAP S/4HANA & Coupa Gating)
              </span>
              <span className="text-[11px] text-slate-400">Interception à la création de commande</span>
            </div>

            <form onSubmit={handleSimulateErpCheck} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Fournisseur Donneur</label>
                <select
                  value={simSupplierId}
                  onChange={(e) => setSimSupplierId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.legalName} ({s.country})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Catégorie d'Achat</label>
                <input
                  type="text"
                  value={simCategory}
                  onChange={(e) => setSimCategory(e.target.value)}
                  placeholder="ex: Lait biologique, Cacao, Soja..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Montant Commande (€ HT)</label>
                <input
                  type="number"
                  value={simPoAmount}
                  onChange={(e) => setSimPoAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-indigo-950"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Tester l'Autorisation ERP
                </button>
              </div>
            </form>

            {/* Verdict Box */}
            {simResult && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-2 animate-fade-in ${
                  simResult.decision === 'ALLOWED'
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                    : simResult.decision === 'REQUIRES_APPROVAL'
                    ? 'bg-amber-950/20 border-amber-500/40 text-amber-300'
                    : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <div className="flex items-center gap-2">
                    {simResult.decision === 'ALLOWED' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Ban className="w-5 h-5 text-rose-400" />
                    )}
                    <span className="text-sm font-extrabold tracking-tight">
                      {simResult.actionTaken}
                    </span>
                  </div>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-black/40 border border-current">
                    HTTP {simResult.status} ({simResult.code})
                  </span>
                </div>

                <p className="text-xs text-slate-300 pl-7">{simResult.reason}</p>

                {simResult.missingStandards && simResult.missingStandards.length > 0 && (
                  <div className="pl-7 pt-1 flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-semibold">Certifications manquantes :</span>
                    <div className="flex gap-1">
                      {simResult.missingStandards.map((std: string, idx: number) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-mono">
                          {std}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Connectors status grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">SAP S/4HANA</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                  CONNECTÉ
                </span>
              </div>
              <p className="text-[11px] text-slate-400">OData API v4 & BAdI d'interception des flux MM</p>
              <div className="text-[10px] text-slate-500 font-mono">Dernier heartbeat: il y a 2 min</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Coupa Procurement</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                  CONNECTÉ
                </span>
              </div>
              <p className="text-[11px] text-slate-400">REST API v34 avec synchronisation des statuts tiers</p>
              <div className="text-[10px] text-slate-500 font-mono">Dernier heartbeat: il y a 5 min</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Oracle NetSuite</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">
                  ATTENTION
                </span>
              </div>
              <p className="text-[11px] text-slate-400">SuiteTalk Web Services (1 timeout récent)</p>
              <div className="text-[10px] text-amber-400/80 font-mono">Dernier timeout: HTTP 504</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Ivalua / Dynamics</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                  CONNECTÉ
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Webhooks bidirectionnels signés HMAC</p>
              <div className="text-[10px] text-slate-500 font-mono">Dernier heartbeat: il y a 1 min</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2 : Outbound Webhooks */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">
                Webhooks Sortants Événementiels (EventBus Asynchrone)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Chaque événement déclencheur émet un payload HTTP POST sécurisé par signature HMAC SHA-256
                vers vos serveurs d'intégration.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenNewWebhook}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition-colors shrink-0 shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              Nouveau Webhook ERP
            </button>
          </div>

          {/* Webhook Endpoints Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {webhooks.map((wh) => (
              <div
                key={wh.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-400 border border-indigo-800">
                      ID: {wh.id}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5">{wh.name}</h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      wh.status === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {wh.status}
                  </span>
                </div>

                <div className="text-xs text-slate-400 font-mono truncate" title={wh.url}>
                  {wh.url}
                </div>

                <div className="space-y-1 text-xs">
                  <span className="text-[11px] font-semibold text-slate-500 block">
                    Événements ({wh.events.length}) :
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {wh.events.map((ev, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-indigo-300"
                      >
                        {ev}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => handleOpenSimulator(wh.id)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Tester
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditWebhook(wh)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteWebhook(wh.id)}
                      className="p-1 rounded hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Deliveries Table */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Historique Récent des Livraisons Webhook
              </h4>
              <span className="text-xs text-slate-400 font-mono">
                {webhookLogs.length} événements enregistrés
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Horodatage</th>
                    <th className="p-3">Destinataire ERP</th>
                    <th className="p-3">Événement Déclenché</th>
                    <th className="p-3">Statut HTTP</th>
                    <th className="p-3">Latence</th>
                    <th className="p-3">Signature HMAC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/60 font-mono">
                  {webhookLogs.map((log) => {
                    const isSuccess = log.status === 'SUCCESS';

                    return (
                      <tr key={log.id} className="hover:bg-slate-800/40">
                        <td className="p-3 text-slate-400">
                          {new Date(log.timestamp).toLocaleTimeString('fr-FR')}
                        </td>
                        <td className="p-3 font-sans font-semibold text-white">
                          {log.endpointName}
                        </td>
                        <td className="p-3 text-indigo-400 font-semibold">{log.event}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isSuccess
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            HTTP {log.statusCode}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">{log.durationMs}ms</td>
                        <td className="p-3 text-slate-500 truncate max-w-[180px]">
                          {log.signature}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3 : DLQ */}
      {activeTab === 'dlq' && (
        <div className="space-y-6">
          {replaySuccessMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {replaySuccessMessage}
            </div>
          )}

          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <RotateCw className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Dead Letter Queue (File d'Attente des Échecs de Livraison)
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                En cas d'indisponibilité de votre ERP (HTTP 504, 429 ou réseau), les messages sont
                préservés avec politique d'exponential backoff pour garantir qu'aucune révocation de
                certificat ne soit perdue.
              </p>
            </div>

            <button
              type="button"
              onClick={handleReplayAll}
              disabled={pendingDlqCount === 0}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50 shrink-0"
            >
              <RotateCw className="w-4 h-4" />
              Rejouer Tout ({pendingDlqCount})
            </button>
          </div>

          <div className="space-y-3">
            {dlqItems.map((item) => {
              const isPending = item.status === 'PENDING_RETRY';

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border space-y-3 transition-colors ${
                    isPending
                      ? 'bg-slate-900 border-amber-500/30'
                      : 'bg-slate-900/50 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-400 border border-amber-800">
                          ID: {item.id}
                        </span>
                        <h4 className="text-sm font-bold text-white">{item.webhookName}</h4>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{item.targetUrl}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-mono text-slate-400">
                        Tentative : <strong>{item.attemptCount} / {item.maxAttempts}</strong>
                      </span>

                      {isPending && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleReplaySingleDlq(item.id)}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            Rejouer
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDiscardDlq(item.id)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 text-xs font-medium transition-colors"
                          >
                            Abandonner
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1.5">
                    <div className="text-rose-400 flex items-center gap-1.5 font-mono text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.lastError}</span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono truncate">
                      Payload : {JSON.stringify(item.payload)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4 : API Docs */}
      {activeTab === 'api_docs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Endpoint selection menu */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Endpoints REST Disponibles
            </span>

            <div className="space-y-2">
              {SEED_API_DOCUMENTATION.map((doc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedApiIndex(idx);
                    setApiTestResponse(null);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedApiIndex === idx
                      ? 'bg-slate-900 border-indigo-500/50 shadow-lg'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black font-mono ${
                        doc.method === 'GET'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {doc.method}
                    </span>
                    <span className="text-xs font-mono text-slate-300 font-bold">{doc.path}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{doc.summary}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Request & Response Explorer */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-black font-mono ${
                        currentApiDoc.method === 'GET'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {currentApiDoc.method}
                    </span>
                    <h3 className="text-base font-bold text-white font-mono">{currentApiDoc.path}</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{currentApiDoc.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyCurl}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
                  >
                    <Copy className="w-3.5 h-3.5 text-indigo-400" />
                    {copiedCurl ? 'CURL Copié !' : 'Copier cURL'}
                  </button>

                  <button
                    type="button"
                    onClick={handleTestApiCall}
                    disabled={isCallingApi}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-600/20"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    {isCallingApi ? 'Exécution...' : 'Tester Endpoint'}
                  </button>
                </div>
              </div>

              {/* Headers and body */}
              <div className="space-y-3">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    En-têtes Requis (Headers)
                  </span>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                    {Object.entries(currentApiDoc.headers).map(([k, v]) => (
                      <div key={k}>
                        <span className="text-indigo-400">{k}:</span> {v}
                      </div>
                    ))}
                  </div>
                </div>

                {currentApiDoc.requestBody && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Corps de la Requête (JSON Body)
                    </span>
                    <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                      {JSON.stringify(currentApiDoc.requestBody, null, 2)}
                    </pre>
                  </div>
                )}

                {/* API Response Display */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Réponse JSON (Code 200 OK)
                  </span>
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-60">
                    {JSON.stringify(apiTestResponse || currentApiDoc.responseSample, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <WebhookModal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
        webhook={selectedWebhook}
      />

      <WebhookSimulatorModal
        isOpen={isSimulatorModalOpen}
        onClose={() => setIsSimulatorModalOpen(false)}
        selectedEndpointId={simulatorEndpointId}
      />
    </div>
  );
}
