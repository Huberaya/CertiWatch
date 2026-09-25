import React, { useState } from 'react';
import { Supplier } from '../../types/supplier';
import { ComplianceMatrixRule, OrderComplianceCheckResult } from '../../types/matrix';
import { Modal } from '../ui/Modal';
import { appStore } from '../../db/store';
import {
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Terminal,
  ShieldCheck,
  ShieldAlert,
  Building,
  DollarSign,
  Globe,
  MapPin,
  FileCheck2,
  RefreshCw,
  Send,
  Lock,
} from 'lucide-react';

interface OrderSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: Supplier[];
  rules: ComplianceMatrixRule[];
}

export function OrderSimulatorModal({
  isOpen,
  onClose,
  suppliers,
  rules,
}: OrderSimulatorModalProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [selectedCategory, setSelectedCategory] = useState(rules[0]?.productCategory || 'Produits Laitiers Biologiques');
  const [orderAmount, setOrderAmount] = useState('125000');
  const [countryCode, setCountryCode] = useState('FR');
  const [facilitySite, setFacilitySite] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<OrderComplianceCheckResult | null>(null);
  const [showPayload, setShowPayload] = useState(false);
  const [derogationReason, setDerogationReason] = useState('');
  const [derogationGranted, setDerogationGranted] = useState(false);

  const permissions = appStore.getActivePermissions();
  const activeUser = appStore.getActiveUser();

  const currentSupplier = suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];

  const handleRunSimulation = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsEvaluating(true);
    setDerogationGranted(false);

    setTimeout(() => {
      const res = appStore.evaluateOrderCompliance({
        supplierId: selectedSupplierId,
        productCategory: selectedCategory,
        amountEur: Number(orderAmount) || 0,
        countryCode: countryCode || currentSupplier?.countryCode,
        facilitySite: facilitySite.trim() || undefined,
        logAudit: true,
      });

      setEvaluationResult(res);
      setIsEvaluating(false);
    }, 400);
  };

  const handleGrantDerogation = () => {
    if (!permissions.canOverrideErpBlock) {
      alert("Votre profil n'a pas l'habilitation requise pour accorder une dérogation ERP.");
      return;
    }
    if (!derogationReason.trim()) {
      alert("Veuillez renseigner le motif formel de la dérogation.");
      return;
    }

    appStore.setSupplierErpBlock(
      selectedSupplierId,
      'TEMPORARY_DEROGATION',
      `Dérogation commande accordée pour ${selectedCategory} (${orderAmount} €) par ${activeUser.name} : ${derogationReason}`
    );

    setDerogationGranted(true);
    // Re-evaluate immediately to show updated decision
    const updated = appStore.evaluateOrderCompliance({
      supplierId: selectedSupplierId,
      productCategory: selectedCategory,
      amountEur: Number(orderAmount) || 0,
      countryCode: countryCode || currentSupplier?.countryCode,
      facilitySite: facilitySite.trim() || undefined,
      logAudit: true,
    });
    setEvaluationResult(updated);
  };

  // Mock ERP Webhook Payload
  const erpPayload = evaluationResult
    ? {
        event: 'PURCHASE_ORDER_COMPLIANCE_EVALUATION',
        timestamp: evaluationResult.evaluatedAt,
        poDetails: {
          purchaseOrderId: 'PO-2026-SAP-' + Math.floor(100000 + Math.random() * 900000),
          supplierId: selectedSupplierId,
          supplierLegalName: evaluationResult.supplierName,
          category: selectedCategory,
          amountEur: Number(orderAmount),
          currency: 'EUR',
          destinationCountry: countryCode,
          facilitySiteDeclared: facilitySite || 'N/A',
        },
        decision: evaluationResult.decision,
        httpResponseCode: evaluationResult.decision === 'ALLOWED' ? 200 : 403,
        erpAction:
          evaluationResult.decision === 'ALLOWED'
            ? 'APPROVE_PURCHASE_ORDER_DISPATCH'
            : evaluationResult.decision === 'REQUIRES_APPROVAL'
            ? 'HOLD_FOR_QUALITY_APPROVAL_WORKFLOW'
            : 'HARD_BLOCK_CANCEL_PURCHASE_ORDER',
        complianceDiagnosis: {
          isCompliant: evaluationResult.isCompliant,
          reasons: evaluationResult.reasons,
          missingStandards: evaluationResult.missingStandards,
          ruleIdApplied: evaluationResult.ruleApplied?.id || 'DEFAULT_COMPLIANCE_BASELINE',
        },
        securityToken: 'sha256:hmac_' + Math.random().toString(36).substring(2, 14),
      }
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Simulateur de Contrôle Commande ERP"
      subtitle="Vérification en temps réel de l'éligibilité d'une commande d'achat (SAP, Coupa, Oracle)"
      maxWidth="3xl"
    >
      <div className="space-y-6 text-xs">
        {/* Simulator Input Form */}
        <form onSubmit={handleRunSimulation} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-inner">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-2">
              <Terminal className="w-4 h-4 text-teal-400" />
              <span>Paramètres de la Commande d'Achat Simulée</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Endpoint: /api/v1/erp/check-po</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Supplier Selection */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Fournisseur Sous Contrat *
              </label>
              <select
                value={selectedSupplierId}
                onChange={(e) => {
                  setSelectedSupplierId(e.target.value);
                  const sup = suppliers.find((s) => s.id === e.target.value);
                  if (sup?.countryCode) setCountryCode(sup.countryCode);
                }}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.legalName} ({s.countryCode} - {s.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Product Category */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Famille d'Achat / Catégorie de Produit *
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500"
              >
                {rules.map((r) => (
                  <option key={r.id} value={r.productCategory}>
                    {r.productCategory} ({r.requiredStandards.join(', ')})
                  </option>
                ))}
                <option value="Autre catégorie non répertoriée">Autre catégorie sans règle dédiée</option>
              </select>
            </div>

            {/* Order Amount */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Montant Total de la Commande (€ HT)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={orderAmount}
                  onChange={(e) => setOrderAmount(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-teal-500 pr-8"
                />
                <span className="absolute right-3 top-2.5 text-slate-500 font-bold">€</span>
              </div>
            </div>

            {/* Country and Facility */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Pays Origine (ISO)
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                  placeholder="FR, PE, TR..."
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-teal-500 text-center uppercase"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Site / Usine Déclarée
                </label>
                <input
                  type="text"
                  value={facilitySite}
                  onChange={(e) => setFacilitySite(e.target.value)}
                  placeholder="Ex : Usine Alençon..."
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isEvaluating}
              className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold transition-all shadow-md shadow-teal-900/30 flex items-center gap-2"
            >
              {isEvaluating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-white" />
              )}
              <span>{isEvaluating ? 'Évaluation en cours...' : 'Exécuter le Contrôle d’Éligibilité'}</span>
            </button>
          </div>
        </form>

        {/* Evaluation Verdict & Diagnosis */}
        {evaluationResult && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Verdict Header Banner */}
            <div
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg ${
                evaluationResult.decision === 'ALLOWED'
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : evaluationResult.decision === 'REQUIRES_APPROVAL'
                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                  : 'bg-red-950/40 border-red-500/50 text-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {evaluationResult.decision === 'ALLOWED' ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0 mt-0.5" />
                ) : evaluationResult.decision === 'REQUIRES_APPROVAL' ? (
                  <AlertTriangle className="w-7 h-7 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-7 h-7 text-red-400 shrink-0 mt-0.5" />
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold tracking-wide uppercase">
                      {evaluationResult.decision === 'ALLOWED' && 'BON À COMMANDER (ALLOWED)'}
                      {evaluationResult.decision === 'REQUIRES_APPROVAL' && 'DÉROGATION REQUISE (REQUIRES APPROVAL)'}
                      {evaluationResult.decision === 'BLOCKED' && 'BLOCAGE STRICT COMMANDE (BLOCKED)'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900/80 border border-slate-700 text-slate-300">
                      Code HTTP : {evaluationResult.decision === 'ALLOWED' ? '200 OK' : '403 Forbidden'}
                    </span>
                  </div>

                  <p className="text-xs mt-1 text-slate-300">
                    {evaluationResult.decision === 'ALLOWED' &&
                      'Toutes les exigences de certification et d’audit de site sont respectées. Commande transmissible à l’ERP.'}
                    {evaluationResult.decision === 'REQUIRES_APPROVAL' &&
                      'La commande nécessite une validation expresse ou une dérogation avant confirmation dans l’ERP.'}
                    {evaluationResult.decision === 'BLOCKED' &&
                      'Non-conformité critique ou certificat manquant. Le workflow ERP rejette automatiquement la création de commande.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPayload(!showPayload)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[11px] border border-slate-700 transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Terminal className="w-3.5 h-3.5 text-teal-400" />
                  <span>{showPayload ? 'Masquer Payload JSON' : 'Inspecter Payload Webhook'}</span>
                </button>
              </div>
            </div>

            {/* Reasons and diagnosis breakdown */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-teal-400" />
                <span>Rapport d'Analyse Détaillé & Diagnostic de Conformité</span>
              </h4>

              <div className="space-y-2">
                {evaluationResult.reasons.map((reason, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-300"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>

              {evaluationResult.missingStandards.length > 0 && (
                <div className="p-3 rounded-lg bg-red-950/20 border border-red-500/30 flex items-center justify-between">
                  <div className="text-red-300 text-xs">
                    <strong>Standards Manquants : </strong>
                    <span className="font-mono text-red-200">
                      {evaluationResult.missingStandards.join(', ')}
                    </span>
                  </div>
                  <span className="text-[10px] text-red-400 font-semibold uppercase">Action requise</span>
                </div>
              )}
            </div>

            {/* Temporary Derogation Box if Blocked or Requires Approval */}
            {evaluationResult.decision !== 'ALLOWED' && (
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Procédure de Dérogation Qualité / Achat Responsable</span>
                  </span>
                  {derogationGranted && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[10px]">
                      ✓ Dérogation Accordée
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400">
                  En tant que gestionnaire habilité, vous pouvez autoriser exceptionnellement la commande avec inscription obligatoire du motif dans la piste d'audit immuable.
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={derogationReason}
                    onChange={(e) => setDerogationReason(e.target.value)}
                    placeholder="Ex : Dérogation approuvée par Direction Achats - Fournisseur de substitution en cours de qualification..."
                    className="flex-1 p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleGrantDerogation}
                    className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-colors shrink-0 flex items-center gap-1"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Accorder Dérogation</span>
                  </button>
                </div>
              </div>
            )}

            {/* JSON Payload Inspector */}
            {showPayload && erpPayload && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-2">
                <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
                  <span>Simulated Webhook Request / Response (HTTP {erpPayload.httpResponseCode})</span>
                  <span className="text-[10px] text-emerald-400">HMAC-SHA256 SIGNED</span>
                </div>
                <pre className="text-teal-300 overflow-x-auto p-2 bg-slate-900/60 rounded">
                  {JSON.stringify(erpPayload, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Modal footer */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Fermer le Simulateur
          </button>
        </div>
      </div>
    </Modal>
  );
}
