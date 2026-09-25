import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Copy,
  RefreshCw,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { copilotService } from '../../services/copilotService';
import { ContractClauseAnalysis } from '../../types/ai';
import { SEED_CONTRACT_ANALYSES } from '../../db/aiSeedData';

interface ClauseAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ClauseAnalysisModal({ isOpen, onClose }: ClauseAnalysisModalProps) {
  const [contractText, setContractText] = useState(
    `Article 14 - Respect des Normes Environnementales et Sociales
Le Fournisseur s'engage à respecter les principes fondamentaux de l'OIT et les réglementations applicables dans son pays d'implantation.
En matière de durabilité, le Fournisseur déclare que ses produits proviennent de sources légales. Le Fournisseur maintiendra en vigueur les certifications nécessaires à la commercialisation des biens commandés. En cas de non-respect, le Donneur d'Ordre pourra demander des explications sous un délai raisonnable.`
  );
  const [documentTitle, setDocumentTitle] = useState('Contrat d’Approvisionnement - Clauses RSE v2');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ContractClauseAnalysis | null>(
    SEED_CONTRACT_ANALYSES[0]
  );
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await copilotService.analyzeContractClauses(contractText, documentTitle);
      setAnalysisResult(res);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyWording = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Analyseur Sémantique IA de Clauses Contractuelles RSE"
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Input Text Form */}
        <div className="space-y-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Texte du Contrat ou Projet d'Avenant Fournisseur
            </span>
            <span className="text-[11px] text-slate-400">
              Analyse de conformité CSRD ESRS S2 & Règlement Déforestation EUDR
            </span>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              placeholder="Titre de la clause ou du contrat..."
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
            <textarea
              rows={4}
              value={contractText}
              onChange={(e) => setContractText(e.target.value)}
              placeholder="Collez ici les clauses contractuelles RSE, environnementales ou relatives aux certifications..."
              className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || !contractText.trim()}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyse IA en cours...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Lancer l'Audit Sémantique IA
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results view */}
        {analysisResult && (
          <div className="space-y-5">
            {/* Header score card */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Évaluation Globale de Vulnérabilité Juridique
                </span>
                <h4 className="text-base font-extrabold text-white mt-0.5">
                  {analysisResult.documentTitle}
                </h4>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  {analysisResult.csrdCsdddReadiness}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase block">Score de Solidité</span>
                  <span
                    className={`text-2xl font-black ${
                      analysisResult.score >= 80
                        ? 'text-emerald-400'
                        : analysisResult.score >= 60
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {analysisResult.score}/100
                  </span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    analysisResult.complianceRating === 'STRONG'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {analysisResult.complianceRating === 'STRONG' ? 'CONFORME' : 'VULNÉRABILITÉS DÉTECTÉES'}
                </span>
              </div>
            </div>

            {/* Extracted Clauses with Recommended Wording */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Détail des Clauses Analysées & Formulations Recommandées
              </span>

              <div className="space-y-3">
                {analysisResult.extractedClauses.map((clause, idx) => {
                  const isConforme = clause.verdict === 'CONFORME';
                  const isAmbigu = clause.verdict === 'AMBIGU';

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{clause.topic}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isConforme
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : isAmbigu
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {clause.verdict}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-400">
                        "{clause.textExcerpt}"
                      </div>

                      <div className="text-xs text-amber-300/90 flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{clause.riskExplanation}</span>
                      </div>

                      {clause.recommendedWording && (
                        <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-300">
                            <span>Formulation Recommandée (Prête à insérer) :</span>
                            <button
                              type="button"
                              onClick={() => handleCopyWording(clause.recommendedWording, idx)}
                              className="text-xs text-emerald-400 hover:text-emerald-200 flex items-center gap-1 font-normal"
                            >
                              <Copy className="w-3 h-3" />
                              {copiedIndex === idx ? 'Copié !' : 'Copier'}
                            </button>
                          </div>
                          <p className="text-xs text-slate-200 font-sans">
                            {clause.recommendedWording}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Remediation Action Plan */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Feuille de Route Corrective (CAPA Juridique)
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300 pl-4 list-disc">
                {analysisResult.remediationRoadmap.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

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
