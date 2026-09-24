import React from 'react';
import { Supplier, MultiFactorRiskScore } from '../../types/supplier';
import { Certificate } from '../../types/certificate';
import { RiskBadge } from '../ui/Badge';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  Globe2,
  Layers,
  CheckCircle2,
  TrendingUp,
  FileWarning,
} from 'lucide-react';

interface SupplierRiskScorecardProps {
  supplier: Supplier;
  certificates?: Certificate[];
  onTriggerRecalculate?: () => void;
  onNavigateToCertificates?: () => void;
}

export function SupplierRiskScorecard({
  supplier,
  certificates = [],
  onTriggerRecalculate,
  onNavigateToCertificates,
}: SupplierRiskScorecardProps) {
  const risk = supplier.multiFactorRisk || {
    overallScore: supplier.riskLevel === 'CRITICAL' ? 85 : supplier.riskLevel === 'HIGH' ? 65 : supplier.riskLevel === 'MEDIUM' ? 40 : 10,
    expirationScore: supplier.riskLevel === 'CRITICAL' ? 25 : 5,
    revocationScore: supplier.riskLevel === 'CRITICAL' ? 40 : 0,
    countryRiskScore: ['PE', 'TR', 'IN', 'CN'].includes(supplier.countryCode) ? 14 : 4,
    coverageRiskScore: 6,
    riskFactors: supplier.erpBlockedReason ? [supplier.erpBlockedReason] : ['Surveillance continue active'],
    recommendedActions: ['Maintenir le contrôle continu des dates et des registres officiels'],
    lastCalculatedAt: supplier.updatedAt,
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-red-400 bg-red-950/60 border-red-800/80';
    if (score >= 50) return 'text-amber-400 bg-amber-950/60 border-amber-800/80';
    if (score >= 25) return 'text-yellow-400 bg-yellow-950/60 border-yellow-800/80';
    return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80';
  };

  const getBarColor = (score: number, max: number) => {
    const ratio = score / max;
    if (ratio >= 0.7) return 'bg-red-500';
    if (ratio >= 0.4) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-5">
      {/* Top Banner: Overall Score & Risk Level */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${getScoreColor(risk.overallScore)}`}>
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-xl bg-slate-950/70 border border-current/20 flex flex-col items-center justify-center font-mono">
            <span className="text-2xl font-black">{risk.overallScore}</span>
            <span className="text-[9px] uppercase tracking-wider text-slate-400">/ 100</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm tracking-tight text-white">Score de Risque Multi-Facteurs</h3>
              <RiskBadge level={supplier.riskLevel} />
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Évaluation algorithmique continue selon 4 dimensions critiques de conformité
            </p>
          </div>
        </div>

        {onTriggerRecalculate && (
          <button
            onClick={onTriggerRecalculate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>Recalculer le score</span>
          </button>
        )}
      </div>

      {/* 4 Risk Dimension Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* 1. Expiration Risk */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Proximité d'Échéance</span>
            </span>
            <span className="font-mono text-slate-200 font-bold">{risk.expirationScore} / 30 pts</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getBarColor(risk.expirationScore, 30)}`}
              style={{ width: `${(risk.expirationScore / 30) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Pondération des certificats expirés, expirant sous 30 jours (&lt;30j) ou sous 60 jours.
          </p>
        </div>

        {/* 2. Revocation & Non-conformity Risk */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>Suspension & Révocation</span>
            </span>
            <span className="font-mono text-slate-200 font-bold">{risk.revocationScore} / 40 pts</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getBarColor(risk.revocationScore, 40)}`}
              style={{ width: `${(risk.revocationScore / 40) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Statut officiel aux registres certificateurs (GOTS, Ecocert, FSC, OEKO-TEX, Fairtrade).
          </p>
        </div>

        {/* 3. Geographic & Supply Chain Risk */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Risque Géographique & CSRD</span>
            </span>
            <span className="font-mono text-slate-200 font-bold">{risk.countryRiskScore} / 15 pts</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getBarColor(risk.countryRiskScore, 15)}`}
              style={{ width: `${(risk.countryRiskScore / 15) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Indice de vigilance pays ({supplier.countryCode}) et contraintes de traçabilité d'origine.
          </p>
        </div>

        {/* 4. Product Coverage Scope */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>Couverture du Périmètre Produit</span>
            </span>
            <span className="font-mono text-slate-200 font-bold">{risk.coverageRiskScore} / 15 pts</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getBarColor(risk.coverageRiskScore, 15)}`}
              style={{ width: `${(risk.coverageRiskScore / 15) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Adéquation entre les catégories de produits achetées et le scope d'audit des certificats.
          </p>
        </div>
      </div>

      {/* Identified Risk Factors */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <FileWarning className="w-4 h-4 text-amber-400" />
          <span>Facteurs Déterminants Identifiés</span>
        </h4>

        {risk.riskFactors && risk.riskFactors.length > 0 ? (
          <ul className="space-y-1.5">
            {risk.riskFactors.map((factor, idx) => (
              <li
                key={idx}
                className="text-xs text-slate-300 flex items-start gap-2 bg-slate-950/50 p-2 rounded-lg border border-slate-800/80"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Aucun facteur aggravant détecté. Dossier fournisseur sous contrôle optimal.</span>
          </p>
        )}
      </div>

      {/* Recommended Actions */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Actions de Remédiation Recommandées</span>
        </h4>

        <div className="space-y-2">
          {risk.recommendedActions?.map((action, idx) => (
            <div
              key={idx}
              className="text-xs text-slate-200 flex items-center justify-between gap-3 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800"
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>{action}</span>
              </div>
              {onNavigateToCertificates && (
                <button
                  onClick={onNavigateToCertificates}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] shrink-0 font-medium transition-colors"
                >
                  Voir certificats
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
