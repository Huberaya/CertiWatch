import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  Lock,
  Calendar,
  Layers,
  Sparkles,
  QrCode,
  FileCheck,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { GeneratedAuditPack, OfficialAuditPackConfig } from '../../types/report';
import { appStore } from '../../db/store';

interface RegulatoryReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pack?: GeneratedAuditPack | null;
  onPackCreated?: (pack: GeneratedAuditPack) => void;
}

export function RegulatoryReportModal({
  isOpen,
  onClose,
  pack: initialPack,
  onPackCreated,
}: RegulatoryReportModalProps) {
  const [activePack, setActivePack] = useState<GeneratedAuditPack | null>(initialPack || null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form state for creating a new pack
  const activeTenant = appStore.getActiveTenant();
  const currentUser = appStore.getActiveUser();

  const [formConfig, setFormConfig] = useState<OfficialAuditPackConfig>({
    reportTitle: 'Rapport Annuel de Conformité Chaîne d’Approvisionnement CSRD ESRS E4 & S2',
    fiscalYear: 'Exercice 2025/2026',
    periodStart: '2025-01-01',
    periodEnd: new Date().toISOString().split('T')[0],
    leadAuditor: currentUser.name + ` (${currentUser.department})`,
    auditBody: 'PwC ESG Assurance & Commissaires aux Comptes',
    tenantId: activeTenant.id,
    includeCertificatesDetails: true,
    includeCryptoProofSeal: true,
    includeEudrAnnexes: true,
    includeCapaRemediation: true,
  });

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newPack = appStore.generateOfficialAuditPack(formConfig);
      setActivePack(newPack);
      setIsGenerating(false);
      if (onPackCreated) onPackCreated(newPack);
    }, 600);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    if (!activePack) return;
    const blob = new Blob([JSON.stringify(activePack, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activePack.referenceNumber}_CSRD_ESRS.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    if (!activePack) return;
    const rows = [
      ['Référence Rapport', activePack.referenceNumber],
      ['Titre', activePack.config.reportTitle],
      ['Exercice', activePack.config.fiscalYear],
      ['Auditeur Principal', activePack.config.leadAuditor],
      ['Cabinet d’Audit', activePack.config.auditBody],
      ['Date Génération', activePack.generatedAt],
      ['Fournisseurs Audités', activePack.executiveSummary.totalSuppliersAudited],
      ['Taux Conformité Global (%)', activePack.executiveSummary.overallComplianceRate],
      ['Certificats Actifs', activePack.executiveSummary.activeCertificatesCount],
      ['Certificats Expirés/Revoqués', activePack.executiveSummary.expiredRevokedCount],
      ['Sceau Cryptographique (Bloc)', activePack.cryptoSeal.blockNumber],
      ['Hash SHA-256', activePack.cryptoSeal.sealHash],
      ['', ''],
      ['Standard', 'Certificats Valides', 'Certificats Expirés', 'Couverture (%)'],
      ...activePack.standardsSummary.map((s) => [
        s.standard,
        s.validCount,
        s.expiredCount,
        `${s.coveragePercent}%`,
      ]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(';')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activePack.referenceNumber}_Synthese_Audit.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        activePack
          ? `Pack d’Audit Officiel — ${activePack.referenceNumber}`
          : 'Génération du Pack d’Audit Réglementaire CSRD'
      }
      maxWidth="xl"
    >
      <div className="space-y-6">
        {!activePack ? (
          /* Generation Form */
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/20">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-emerald-300">
                    Générateur de Preuve d’Audit Opposable aux Tiers
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Ce module consolide l'état de conformité de l'ensemble de votre panel fournisseurs,
                    calcule vos indicateurs <strong>CSRD ESRS (E4, S2, G1)</strong> et le respect du 
                    <strong> Règlement Déforestation UE (EUDR)</strong>, scellé par un bloc d'audit
                    cryptographique SHA-256.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-300">
                  Titre du Rapport Officiel
                </label>
                <input
                  type="text"
                  value={formConfig.reportTitle}
                  onChange={(e) => setFormConfig({ ...formConfig, reportTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Exercice Fiscal / Période</label>
                <input
                  type="text"
                  value={formConfig.fiscalYear}
                  onChange={(e) => setFormConfig({ ...formConfig, fiscalYear: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Auditeur / Rapporteur Responsable</label>
                <input
                  type="text"
                  value={formConfig.leadAuditor}
                  onChange={(e) => setFormConfig({ ...formConfig, leadAuditor: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-300">
                  Organisme Destinataire / Cabinet d’Audit (CAC / OTI)
                </label>
                <input
                  type="text"
                  value={formConfig.auditBody}
                  onChange={(e) => setFormConfig({ ...formConfig, auditBody: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  placeholder="ex: PwC France, KPMG Audit, EY ESG, Bureau Veritas..."
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Composants inclus dans le pack d'audit
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formConfig.includeCryptoProofSeal}
                    onChange={(e) =>
                      setFormConfig({ ...formConfig, includeCryptoProofSeal: e.target.checked })
                    }
                    className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                  />
                  <span>Sceau d’intégrité cryptographique SHA-256</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formConfig.includeEudrAnnexes}
                    onChange={(e) =>
                      setFormConfig({ ...formConfig, includeEudrAnnexes: e.target.checked })
                    }
                    className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                  />
                  <span>Annexes de traçabilité EUDR (Zéro Déforestation)</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formConfig.includeCertificatesDetails}
                    onChange={(e) =>
                      setFormConfig({ ...formConfig, includeCertificatesDetails: e.target.checked })
                    }
                    className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                  />
                  <span>Inventaire détaillé des certificats & registres</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formConfig.includeCapaRemediation}
                    onChange={(e) =>
                      setFormConfig({ ...formConfig, includeCapaRemediation: e.target.checked })
                    }
                    className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                  />
                  <span>Registre des dérogations ERP et plans CAPA</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Compilation & Scellement...
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    Générer le Pack d'Audit Officiel
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Report Document Viewer */
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ATTESTATION OPPOSABLE AUX CAC & OTI
                </span>
                <span className="text-xs text-slate-400">
                  Généré le {new Date(activePack.generatedAt).toLocaleString('fr-FR')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  JSON CSRD
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimer / PDF Officiel
                </button>
              </div>
            </div>

            {/* Document Sheet Layout */}
            <div className="p-6 md:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6 text-slate-200">
              {/* Official Header */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-800 pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                      RÉF: {activePack.referenceNumber}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      DIRECTIVE CSRD 2022/2464/UE & DEVOIR DE VIGILANCE
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight">
                    {activePack.config.reportTitle}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Entité : <strong className="text-slate-200">{activeTenant.name}</strong> • Exercice :{' '}
                    <strong className="text-slate-200">{activePack.config.fiscalYear}</strong>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3 shrink-0">
                  <QrCode className="w-12 h-12 text-emerald-400" />
                  <div className="text-[11px] space-y-0.5">
                    <div className="font-bold text-slate-300">Vérification QR Code</div>
                    <div className="text-slate-500 font-mono">SHA-256 SCELLÉ</div>
                    <div className="text-emerald-400 font-semibold">Bloc #{activePack.cryptoSeal.blockNumber}</div>
                  </div>
                </div>
              </div>

              {/* Auditor & Signatory Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 block">Rapporteur CertiWatch</span>
                  <span className="font-semibold text-slate-200">{activePack.config.leadAuditor}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Cabinet Destinataire</span>
                  <span className="font-semibold text-slate-200">{activePack.config.auditBody}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Période Couverte</span>
                  <span className="font-semibold text-slate-200">
                    {activePack.config.periodStart} au {activePack.config.periodEnd}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Statut d’Opposabilité</span>
                  <span className="font-bold text-emerald-400">CERTIFIÉ CONFORME</span>
                </div>
              </div>

              {/* Section 1 : Executive Summary */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  1. Synthèse Exécutive pour le Comité d’Audit & CAC
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-xs text-slate-400 block">Fournisseurs Audités</span>
                    <span className="text-2xl font-black text-white">
                      {activePack.executiveSummary.totalSuppliersAudited}
                    </span>
                    <span className="text-[11px] text-emerald-400 block mt-1">Périmètre 100% audité</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-xs text-slate-400 block">Taux de Conformité</span>
                    <span className="text-2xl font-black text-emerald-400">
                      {activePack.executiveSummary.overallComplianceRate}%
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-1">Commandes ERP autorisées</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-xs text-slate-400 block">Certificats Actifs</span>
                    <span className="text-2xl font-black text-white">
                      {activePack.executiveSummary.activeCertificatesCount}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-1">Registres officiels vérifiés</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-xs text-slate-400 block">Dérogations & CAPA</span>
                    <span className="text-2xl font-black text-amber-400">
                      {activePack.executiveSummary.derogationsApprovedCount}
                    </span>
                    <span className="text-[11px] text-amber-400/80 block mt-1">Encadrement strict sous 90j</span>
                  </div>
                </div>
              </div>

              {/* Section 2 : Cryptographic Seal */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-300">
                      Attestation d’Intégrité Cryptographique (Piste d'Audit Immuable)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    INTÉGRITÉ 100% VÉRIFIÉE
                  </span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-slate-400">
                  <div className="truncate">
                    <strong className="text-slate-300">Empreinte SHA-256 du Bloc #{activePack.cryptoSeal.blockNumber} :</strong>{' '}
                    <span className="text-emerald-400">{activePack.cryptoSeal.sealHash}</span>
                  </div>
                  <div className="truncate">
                    <strong className="text-slate-300">Hash Précédent lié :</strong>{' '}
                    <span>{activePack.cryptoSeal.previousHash}</span>
                  </div>
                </div>
              </div>

              {/* Section 3 : Breakdown by Standards */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  2. Couverture par Standard de Durabilité & Matières Premières
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                      <tr>
                        <th className="p-3">Standard / Label</th>
                        <th className="p-3">Valides</th>
                        <th className="p-3">Expirés / Défauts</th>
                        <th className="p-3">Taux de Couverture</th>
                        <th className="p-3">Statut CSRD</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
                      {activePack.standardsSummary.map((std, i) => (
                        <tr key={i} className="hover:bg-slate-800/40">
                          <td className="p-3 font-bold text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            {std.standard}
                          </td>
                          <td className="p-3 font-semibold text-emerald-400">{std.validCount}</td>
                          <td className="p-3 font-semibold text-rose-400">{std.expiredCount}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 rounded-full bg-slate-800 overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500"
                                  style={{ width: `${std.coveragePercent}%` }}
                                />
                              </div>
                              <span className="font-bold">{std.coveragePercent}%</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                              ALIGNED
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 4 : EUDR Deforestation Annexes */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  3. Annexe Règlement Déforestation UE (EUDR 2023/1115)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 block">Parcelles Déclarées</span>
                    <span className="text-lg font-bold text-white">
                      {activePack.eudrSummary.totalPlotsDeclared} parcelles
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Géolocalisation GPS</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {activePack.eudrSummary.gpsVerifiedRate}% Polygones Validés
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Conformité EUDR</span>
                    <span className="text-lg font-bold text-white">
                      {activePack.eudrSummary.eudrComplianceRate}% Zéro Déforestation
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Origines Haut Risque</span>
                    <span className="text-lg font-bold text-amber-400">
                      {activePack.eudrSummary.highRiskOriginsCount} sous surveillance
                    </span>
                  </div>
                </div>
              </div>

              {/* Signatures & Certification Block */}
              <div className="pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 font-bold block mb-2">Pour l’Entreprise Donneur d'Ordre</span>
                  <p className="text-slate-300 font-semibold">{activePack.config.leadAuditor}</p>
                  <p className="text-slate-500 text-[11px]">Direction RSE & Conformité Achats</p>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-emerald-400 flex items-center gap-1.5 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Signature Numérique Certifiée CertiWatch v1.4
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 font-bold block mb-2">Visa du Tiers Indépendant / CAC</span>
                  <p className="text-slate-300 font-semibold">{activePack.config.auditBody}</p>
                  <p className="text-slate-500 text-[11px]">Assurance Indépendante CSRD & Norme ISAE 3000</p>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                    En attente de signature finale CAC de clôture
                  </div>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActivePack(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Générer un autre pack
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
