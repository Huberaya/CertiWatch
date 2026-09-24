import React, { useState } from 'react';
import { Certificate } from '../../types/certificate';
import { Modal } from '../ui/Modal';
import { CertificateStatusBadge, VerificationOutcomeBadge } from '../ui/Badge';
import { appStore } from '../../db/store';
import {
  FileCheck2,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  RotateCw,
  AlertTriangle,
  Building2,
  FileText,
  MapPin,
  Tag,
  Clock,
  Ban,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

interface CertificateInspectionDrawerProps {
  certificate: Certificate | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectSupplier?: (supplierId: string) => void;
}

export function CertificateInspectionDrawer({
  certificate,
  isOpen,
  onClose,
  onSelectSupplier,
}: CertificateInspectionDrawerProps) {
  if (!certificate) return null;

  const [activeTab, setActiveTab] = useState<'CROSS_CHECK' | 'SCOPE' | 'OCR_TRACE'>('CROSS_CHECK');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifySuccessMsg, setVerifySuccessMsg] = useState<string | null>(null);

  const permissions = appStore.getActivePermissions();

  const handleLiveReverify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      appStore.verifyCertificateWithRegistry(certificate.id);
      setIsVerifying(false);
      setVerifySuccessMsg('Interrogation API exécutée avec succès auprès du registre officiel.');
      setTimeout(() => setVerifySuccessMsg(null), 3000);
    }, 600);
  };

  const handleDelete = () => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le certificat N° ${certificate.certificateNumber} ?`)) {
      appStore.deleteCertificate(certificate.id);
      onClose();
    }
  };

  const handleTriggerErpBlock = () => {
    appStore.setSupplierErpBlock(
      certificate.supplierId,
      'BLOCKED',
      `Certificat ${certificate.standardLabel} N° ${certificate.certificateNumber} non conforme ou révoqué.`
    );
    alert(`Blocage ERP déclenché pour le fournisseur ${certificate.supplierName}.`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${certificate.standardLabel} • N° ${certificate.certificateNumber}`}
      subtitle={`Titulaire : ${certificate.supplierName} • Organisme : ${certificate.certificationBody}`}
      maxWidth="3xl"
    >
      <div className="space-y-5 text-xs">
        {/* Top Header Card */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <CertificateStatusBadge status={certificate.status} />
            <VerificationOutcomeBadge outcome={certificate.verificationOutcome} />
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
              Confiance :{' '}
              <strong className={
                certificate.confidenceScore >= 90
                  ? 'text-emerald-400'
                  : certificate.confidenceScore >= 70
                  ? 'text-amber-400'
                  : 'text-red-400'
              }>
                {certificate.confidenceScore}%
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLiveReverify}
              disabled={isVerifying}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors"
              title="Interroger le registre officiel en temps réel"
            >
              <RotateCw className={`w-3.5 h-3.5 text-cyan-400 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>Vérifier API</span>
            </button>

            {certificate.officialRegistryUrl && (
              <a
                href={certificate.officialRegistryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 transition-colors font-medium"
              >
                <span>Registre Public</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {verifySuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{verifySuccessMsg}</span>
          </div>
        )}

        {/* Tab navigation */}
        <div className="flex items-center gap-1 border-b border-slate-800 pb-1">
          <button
            onClick={() => setActiveTab('CROSS_CHECK')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'CROSS_CHECK'
                ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Confrontation Document vs Registre</span>
          </button>

          <button
            onClick={() => setActiveTab('SCOPE')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'SCOPE'
                ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Périmètre & Sites Industriels</span>
          </button>

          <button
            onClick={() => setActiveTab('OCR_TRACE')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'OCR_TRACE'
                ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Extrait OCR & Traçabilité</span>
          </button>
        </div>

        {/* TAB 1: CROSS CHECK (Side-by-side comparison) */}
        {activeTab === 'CROSS_CHECK' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Document Extracted */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block border-b border-slate-800 pb-1.5">
                  Document Fournisseur (Scan PDF)
                </span>

                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Titulaire Inscrit</span>
                    <span className="font-semibold text-white">{certificate.supplierName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Numéro de Certificat</span>
                    <span className="font-mono text-cyan-300 font-bold">{certificate.certificateNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Organisme Émetteur</span>
                    <span className="text-slate-300">{certificate.certificationBody}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Date d'Effet</span>
                      <span className="font-mono text-slate-300">{certificate.issueDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Date d'Échéance Mentionnée</span>
                      <span className="font-mono font-bold text-white">{certificate.expiryDate}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Fichier Numérique</span>
                    <span className="font-mono text-slate-400">{certificate.originalDocumentName || 'Document_scan.pdf'}</span>
                  </div>
                </div>
              </div>

              {/* Official Registry Data */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Base Officielle Certificateur
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Ping : {certificate.lastVerifiedAt ? new Date(certificate.lastVerifiedAt).toLocaleDateString('fr-FR') : 'Récent'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Statut Validité Officiel</span>
                    <span className={`font-bold font-mono px-2 py-0.5 rounded text-xs inline-block ${
                      certificate.status === 'VALID'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : certificate.status === 'EXPIRING_SOON'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-red-950 text-red-400 border border-red-800'
                    }`}>
                      {certificate.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Date Limite Officielle</span>
                    <span className="font-mono text-slate-200 font-semibold">{certificate.expiryDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Justifications de Concordance</span>
                    <ul className="space-y-1 mt-1">
                      {certificate.confidenceReasons?.map((r, i) => (
                        <li key={i} className="text-emerald-400 flex items-start gap-1.5 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Anomalies Warnings if any */}
            {certificate.anomalies && certificate.anomalies.length > 0 && (
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800 space-y-2">
                <span className="font-bold text-red-300 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>Divergences Détectées par le Moteur de Rapprochement :</span>
                </span>
                <div className="space-y-1.5">
                  {certificate.anomalies.map((ano, idx) => (
                    <div key={idx} className="p-2 rounded bg-slate-950/60 border border-red-900/50 text-red-200 text-[11px] space-y-0.5">
                      <p className="font-semibold">• Champ en anomalie : {ano.field}</p>
                      <p className="text-slate-300">Document : « {ano.documentValue} » ➔ Registre officiel : « {ano.officialValue} »</p>
                      <p className="text-red-400/90 italic">{ano.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SCOPE */}
        {activeTab === 'SCOPE' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Catégories & Produits Couverts par le Certificat
              </span>

              <div className="space-y-2">
                <div>
                  <span className="text-slate-500 text-[11px] block mb-1">Produits Déclarés & Audités :</span>
                  <div className="flex flex-wrap gap-1.5">
                    {certificate.scope?.coveredProducts?.map((prod, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs flex items-center gap-1.5"
                      >
                        <Tag className="w-3 h-3 text-cyan-400" />
                        <span>{prod}</span>
                      </span>
                    )) || <span className="text-slate-400">Non spécifié</span>}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-500 text-[11px] block mb-1">Régions Géographiques Incluses :</span>
                  <p className="text-slate-300 font-medium">
                    {certificate.scope?.geographicalRegions?.join(', ') || 'Monde entier'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Sites Industriels & Installations Couvertes
              </span>
              <div className="space-y-1.5">
                {certificate.scope?.coveredFacilities?.map((fac, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs text-slate-300"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{fac}</span>
                  </div>
                )) || <span className="text-slate-400">Non renseigné</span>}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: OCR TRACE */}
        {activeTab === 'OCR_TRACE' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Extrait OCR Brut du Document Déposé
                </span>
                <span className="text-[10px] font-mono text-slate-400">Taille : {certificate.fileSizeBytes ? `${Math.round(certificate.fileSizeBytes / 1024)} KB` : '245 KB'}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 leading-relaxed max-h-48 overflow-y-auto">
                {certificate.rawOcrTextSnippet || 'Texte OCR standard extrait du document scanné.'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Métadonnées d'Audit & Dépôt
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Date de Dépôt</span>
                  <span className="text-slate-300 font-mono">{new Date(certificate.uploadedAt).toLocaleString('fr-FR')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Prochain Contrôle Automatisé</span>
                  <span className="text-slate-300 font-mono">
                    {certificate.nextVerificationScheduledAt
                      ? new Date(certificate.nextVerificationScheduledAt).toLocaleDateString('fr-FR')
                      : 'Sous 24h'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            {permissions.canDeleteSupplier && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-900 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Supprimer</span>
              </button>
            )}

            {(certificate.status === 'REVOKED' || certificate.status === 'EXPIRED') && permissions.canOverrideErpBlock && (
              <button
                type="button"
                onClick={handleTriggerErpBlock}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors shadow-sm"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Bloquer Commandes ERP</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
}
