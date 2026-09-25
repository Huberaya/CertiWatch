import React, { useState } from 'react';
import {
  ExternalLink,
  ShieldCheck,
  Building2,
  FileCheck,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Download,
  Copy,
  QrCode,
  Award,
  Globe2,
  Trees,
  Lock,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Supplier } from '../../types/supplier';
import { Certificate, CertificationStandard } from '../../types/certificate';
import { appStore } from '../../db/store';

interface SupplierPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierId?: string | null;
}

export function SupplierPortalModal({
  isOpen,
  onClose,
  supplierId: initialSupplierId,
}: SupplierPortalModalProps) {
  const suppliers = appStore.getTenantSuppliers();
  const allCerts = appStore.getTenantCertificates();
  const activeTenant = appStore.getActiveTenant();

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(
    initialSupplierId || (suppliers[0]?.id ?? '')
  );
  const [activeTab, setActiveTab] = useState<'certificates' | 'declaration' | 'badge'>('certificates');

  const supplier = suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];
  const supplierCerts = allCerts.filter((c) => c.supplierId === supplier?.id);

  // Declaration form state
  const existingSubmission = appStore.getState().supplierPortalSubmissions?.[supplier?.id || ''];
  const [signatoryName, setSignatoryName] = useState(
    existingSubmission?.signatoryName || supplier?.contactName || 'Carlos Valdivia'
  );
  const [signatoryRole, setSignatoryRole] = useState(
    existingSubmission?.signatoryRole || 'Directeur Qualité & RSE'
  );
  const [childLaborFree, setChildLaborFree] = useState(
    existingSubmission?.childLaborFree ?? true
  );
  const [livingWageCompliant, setLivingWageCompliant] = useState(
    existingSubmission?.livingWageCompliant ?? true
  );
  const [deforestationFreeCommitment, setDeforestationFreeCommitment] = useState(
    existingSubmission?.deforestationFreeCommitment ?? true
  );
  const [co2Scope12Declared, setCo2Scope12Declared] = useState(
    existingSubmission?.co2Scope12Declared ?? true
  );
  const [comments, setComments] = useState(
    existingSubmission?.comments ||
      'Tous nos sites de production sont audités selon les normes internationales. Les nouveaux certificats 2026 sont joints.'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Upload simulation state
  const [simulatedUploadName, setSimulatedUploadName] = useState('');
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');
  const [copiedBadge, setCopiedBadge] = useState(false);

  const handleSimulatedUpload = (std: CertificationStandard) => {
    setSimulatedUploadName(std);
    setTimeout(() => {
      setUploadSuccessMessage(
        `Nouveau certificat ${std} téléversé avec succès. Transmis pour vérification OCR et contrôle de validité.`
      );
      setSimulatedUploadName('');
      setTimeout(() => setUploadSuccessMessage(''), 4000);
    }, 1200);
  };

  const handleDeclarationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier) return;

    setIsSubmitting(true);
    setTimeout(() => {
      appStore.submitSupplierPortalDeclaration(supplier.id, {
        signatoryName,
        signatoryRole,
        childLaborFree,
        livingWageCompliant,
        deforestationFreeCommitment,
        co2Scope12Declared,
        comments,
        renewedCertificatesAttached: supplierCerts.map((c) => ({
          standard: c.certificationStandard,
          certNumber: c.certificateNumber,
        })),
      });

      setIsSubmitting(false);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 4000);
    }, 700);
  };

  const handleCopyWidget = () => {
    const code = `<div data-certiwatch-badge="${supplier?.id}" data-status="VERIFIED"></div>\n<script src="https://certiwatch.enterprise/embed.js" async></script>`;
    navigator.clipboard.writeText(code);
    setCopiedBadge(true);
    setTimeout(() => setCopiedBadge(false), 2500);
  };

  if (!supplier) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Portail Partenaire Fournisseur — Extranet Sécurisé"
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Top Supplier Selector & Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">{supplier.legalName}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ESPACE EXTRANET SÉCURISÉ
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Donneur d'ordre : <strong className="text-slate-200">{activeTenant.name}</strong> • Contact : {supplier.contactEmail}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Changer de fournisseur :</span>
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.legalName} ({s.country})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('certificates')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'certificates'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            1. Certifications & Téléversement ({supplierCerts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('declaration')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'declaration'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            2. Auto-Déclaration RSE & Devoir de Vigilance
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('badge')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'badge'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            3. Mon Badge de Conformité
          </button>
        </div>

        {/* Tab 1 : Certificates */}
        {activeTab === 'certificates' && (
          <div className="space-y-4">
            {uploadSuccessMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {uploadSuccessMessage}
              </div>
            )}

            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>
                Retrouvez ci-dessous l'état de validité des certifications exigées par{' '}
                <strong>{activeTenant.name}</strong>.
              </span>
              <span className="text-slate-500">Mise à jour en temps réel</span>
            </div>

            <div className="space-y-3">
              {supplierCerts.map((cert) => {
                const isValid = cert.status === 'VALID';
                const isExpired = cert.status === 'EXPIRED';

                return (
                  <div
                    key={cert.id}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          isValid
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {isValid ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{cert.certificationStandard}</span>
                          <span className="text-xs font-mono text-slate-400">
                            N° {cert.certificateNumber}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Organisme : {cert.certificationBody} • Valide jusqu'au{' '}
                          <strong className={isValid ? 'text-slate-200' : 'text-rose-400'}>
                            {cert.expiryDate}
                          </strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          isValid
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : isExpired
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {isValid ? 'CONFORME' : isExpired ? 'EXPIRÉ — ACTION REQUISE' : cert.status}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleSimulatedUpload(cert.certificationStandard)}
                        disabled={simulatedUploadName === cert.certificationStandard}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
                        {simulatedUploadName === cert.certificationStandard ? 'Traitement OCR...' : 'Déposer Renouvellement'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Upload Drag-and-drop zone */}
            <div className="p-6 rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/40 text-center space-y-2 hover:border-emerald-500/50 transition-colors cursor-pointer">
              <UploadCloud className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="text-sm font-bold text-slate-200">
                Déposer un nouveau document ou audit
              </div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Glissez-déposez vos certificats au format PDF, PNG ou JPG. Notre moteur OCR analysera
                instantanément le numéro de licence et la date d'échéance.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2 : CSRD Self Declaration */}
        {activeTab === 'declaration' && (
          <form onSubmit={handleDeclarationSubmit} className="space-y-5">
            {submitSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Votre auto-déclaration RSE et Devoir de Vigilance a été enregistrée avec succès.
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-slate-300 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-emerald-300">
                  Questionnaire Annuel de Diligence Raisonnable (CSRD ESRS S2 & G1)
                </span>
                <p className="text-slate-400 mt-0.5">
                  Conformément aux exigences légales européennes (Directives CSRD 2022/2464 et CSDDD 2024/1760),
                  cette déclaration engage la responsabilité juridique de votre entreprise.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={childLaborFree}
                  onChange={(e) => setChildLaborFree(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-0"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-200">
                    Interdiction absolue du travail des enfants et du travail forcé
                  </span>
                  <p className="text-slate-400 mt-0.5">
                    Engagement formel de respect des Conventions 138 et 182 de l'Organisation Internationale du Travail (OIT) sur l'ensemble de nos sites et sous-traitants.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={livingWageCompliant}
                  onChange={(e) => setLivingWageCompliant(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-0"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-200">
                    Rémunération décente et santé & sécurité des collaborateurs
                  </span>
                  <p className="text-slate-400 mt-0.5">
                    Garantie d'un salaire décent conforme ou supérieur aux minima légaux nationaux et respect des équipements de protection individuelle (EPI).
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={deforestationFreeCommitment}
                  onChange={(e) => setDeforestationFreeCommitment(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-0"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-200">
                    Engagement Zéro Déforestation (Règlement EUDR 2023/1115)
                  </span>
                  <p className="text-slate-400 mt-0.5">
                    Certification que les matières premières fournies ne proviennent d'aucune zone déboisée ou dégradée après le 31 décembre 2020.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={co2Scope12Declared}
                  onChange={(e) => setCo2Scope12Declared(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-0"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-200">
                    Transparence Carbone (Bilan GES Scope 1 & 2)
                  </span>
                  <p className="text-slate-400 mt-0.5">
                    Mise à disposition des facteurs d'émissions carbones pour le calcul de l'empreinte Scope 3 achats du client donneur d'ordre.
                  </p>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Nom du Signataire</label>
                <input
                  type="text"
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Fonction / Titre</label>
                <input
                  type="text"
                  value={signatoryRole}
                  onChange={(e) => setSignatoryRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Commentaires complémentaires / Précisions sur les plans d'action
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Enregistrement de la déclaration...
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    Valider & Signer Électroniquement
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 3 : Trust Badge */}
        {activeTab === 'badge' && (
          <div className="space-y-5">
            <div className="text-xs text-slate-400">
              En tant que fournisseur conforme sur la plateforme <strong>CertiWatch</strong>, vous pouvez
              afficher ce badge sur votre site internet, vos bons de livraison et vos réponses aux appels d'offres.
            </div>

            {/* Visual Badge Card */}
            <div className="max-w-md mx-auto p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40 border-2 border-emerald-500/40 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />

              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-black text-sm tracking-tight text-white">
                      Certi<span className="text-emerald-400">Watch</span>
                    </div>
                    <div className="text-[10px] text-slate-400">SUPPLIER VERIFIED TRUST</div>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  STATUT CONFORME
                </span>
              </div>

              <div className="py-4 space-y-2">
                <div className="text-xs text-slate-400">FOURNISSEUR HOMOLOGUÉ</div>
                <h4 className="text-lg font-black text-white">{supplier.legalName}</h4>
                <div className="text-xs text-slate-300 flex items-center gap-2">
                  <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
                  {supplier.country} ({supplier.countryCode}) • SIRET/ID: {supplier.internalId}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Certifications Actives Vérifiées
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {supplierCerts
                    .filter((c) => c.status === 'VALID')
                    .map((c) => (
                      <span
                        key={c.id}
                        className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-semibold"
                      >
                        ✓ {c.certificationStandard}
                      </span>
                    ))}
                  {supplierCerts.filter((c) => c.status === 'VALID').length === 0 && (
                    <span className="text-xs text-amber-400">En cours de renouvellement</span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5 font-mono">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  ID: CW-{supplier.id.toUpperCase()}
                </div>
                <div>Émis en 2026</div>
              </div>
            </div>

            {/* Actions for Badge */}
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyWidget}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-700"
              >
                <Copy className="w-4 h-4 text-emerald-400" />
                {copiedBadge ? 'Code Widget Copié !' : 'Copier le code Widget HTML'}
              </button>

              <button
                type="button"
                onClick={() => {
                  alert("Badge officiel téléchargé au format SVG haute résolution pour insertion dans vos supports commerciaux.");
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Télécharger le Badge (SVG / PNG)
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Fermer l'Espace Fournisseur
          </button>
        </div>
      </div>
    </Modal>
  );
}
