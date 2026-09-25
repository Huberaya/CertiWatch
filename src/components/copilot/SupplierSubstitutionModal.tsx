import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Globe2,
  Clock,
  Sparkles,
  TrendingDown,
  Lock,
  FileCheck,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { appStore } from '../../db/store';
import { copilotService } from '../../services/copilotService';
import { SupplierSubstitutionAnalysis, SupplierSubstituteCandidate } from '../../types/ai';

interface SupplierSubstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierId?: string | null;
}

export function SupplierSubstitutionModal({
  isOpen,
  onClose,
  supplierId: initialSupplierId,
}: SupplierSubstitutionModalProps) {
  const suppliers = appStore.getTenantSuppliers();
  const [targetSupplierId, setTargetSupplierId] = useState(
    initialSupplierId || (suppliers[0]?.id ?? '')
  );

  const [selectedCandidate, setSelectedCandidate] = useState<SupplierSubstituteCandidate | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const analysis: SupplierSubstitutionAnalysis = copilotService.findSubstitutionCandidates(targetSupplierId);
  const targetSupplier = suppliers.find((s) => s.id === targetSupplierId) || suppliers[0];

  const handleApplySubstitution = (candidate: SupplierSubstituteCandidate) => {
    setIsApplying(true);
    setSelectedCandidate(candidate);

    setTimeout(() => {
      appStore.addAuditLog({
        actionCategory: 'SUPPLIER_MODIFIED',
        entityType: 'SUPPLIER',
        entityId: candidate.supplierId,
        entityReference: `${candidate.supplierName} (Substitution de ${targetSupplier?.legalName})`,
        source: 'MANUAL_UI',
        details: `Recommandation IA appliquée : Redirection préventive des flux d'achats de "${targetSupplier?.legalName}" vers "${candidate.supplierName}" (${candidate.country}). Score d'adéquation: ${candidate.matchScore}%.`,
      });

      setIsApplying(false);
      setSuccessMessage(
        `Substitution validée dans l'ERP : "${candidate.supplierName}" est désormais le fournisseur prioritaire pour les nouvelles commandes.`
      );
      setTimeout(() => setSuccessMessage(''), 5000);
    }, 800);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Moteur d'IA : Recommandation de Substitution Fournisseur"
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Top selector */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 shrink-0">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                Fournisseur sous tension ou bloqué
              </span>
              <h4 className="text-base font-extrabold text-white">{targetSupplier?.legalName}</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {targetSupplier?.country} • Risque : {targetSupplier?.riskLevel} • Catégories :{' '}
                {targetSupplier?.productCategories.join(', ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Changer de cible :</span>
            <select
              value={targetSupplierId}
              onChange={(e) => setTargetSupplierId(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.legalName} ({s.country})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* AI Diagnosis Reasoning Card */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <Sparkles className="w-4 h-4" />
            Diagnostic & Recommandation Algorithmique
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{analysis.aiReasoning}</p>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {successMessage}
          </div>
        )}

        {/* Candidate Alternatives List */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Alternatives Compatibles Détectées ({analysis.candidates.length})
          </span>

          <div className="space-y-3">
            {analysis.candidates.map((cand, index) => {
              const isBest = index === 0;

              return (
                <div
                  key={cand.supplierId}
                  className={`p-4 rounded-xl border transition-all ${
                    isBest
                      ? 'bg-slate-900 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                          isBest
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        #{index + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-extrabold text-sm text-white">{cand.supplierName}</h5>
                          {isBest && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              RECOMMANDATION N°1
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <Globe2 className="w-3.5 h-3.5 text-slate-500" />
                          {cand.country} ({cand.countryCode}) • Délai de transition :{' '}
                          <strong className="text-slate-200">
                            {cand.estimatedTransitionDelayDays} jours
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase block">Score d'Adéquation</span>
                        <span className="text-xl font-black text-emerald-400">{cand.matchScore}%</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleApplySubstitution(cand)}
                        disabled={isApplying}
                        className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Choisir ce Fournisseur
                      </button>
                    </div>
                  </div>

                  {/* Certifications and Pros */}
                  <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] font-semibold block mb-1">
                        Certifications Actives Vérifiées :
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {cand.validCertifications.map((std, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                          >
                            ✓ {std}
                          </span>
                        ))}
                        {cand.validCertifications.length === 0 && (
                          <span className="text-slate-500 italic">Aucune certification active</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      {cand.pros.slice(0, 2).map((pro, i) => (
                        <div key={i} className="text-emerald-400 flex items-center gap-1.5 text-[11px]">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          <span>{pro}</span>
                        </div>
                      ))}
                      {cand.cautions.slice(0, 1).map((caut, i) => (
                        <div key={i} className="text-amber-400 flex items-center gap-1.5 text-[11px]">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>{caut}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
}
