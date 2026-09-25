import React, { useState } from 'react';
import {
  UserX,
  AlertTriangle,
  CheckCircle2,
  Lock,
  FileCheck,
  Copy,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { appStore } from '../../db/store';
import { GdprDataSubject } from '../../types/compliance';

interface GdprErasureModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: GdprDataSubject | null;
  onAnonymized?: () => void;
}

export function GdprErasureModal({ isOpen, onClose, subject, onAnonymized }: GdprErasureModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [erasureResult, setErasureResult] = useState<{
    certificate: string;
  } | null>(null);
  const [copiedCert, setCopiedCert] = useState(false);

  if (!subject) return null;

  const handleExecuteErasure = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const res = appStore.anonymizeGdprSubject(subject.id);
      setIsProcessing(false);
      if (res.success) {
        setErasureResult({ certificate: res.certificateOfErasure });
        if (onAnonymized) onAnonymized();
      }
    }, 800);
  };

  const handleCopyCertificate = () => {
    if (erasureResult) {
      navigator.clipboard.writeText(erasureResult.certificate);
      setCopiedCert(true);
      setTimeout(() => setCopiedCert(false), 2000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Application du Droit à l’Oubli (Article 17 du RGPD)"
      maxWidth="md"
    >
      <div className="space-y-5">
        {!erasureResult ? (
          <>
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-rose-200">
                  Action Destructive & Irréversible
                </span>
                <p className="mt-0.5 text-rose-300/80 leading-relaxed">
                  L'anonymisation détruira définitivement l'ensemble des identifiants directs (nom,
                  prénom, adresse email, téléphone). Pour respecter les obligations légales CSRD et le
                  Code de Commerce, les métadonnées d'audit comptable et RSE seront conservées sous
                  forme d'empreintes chiffrées non réversibles.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5 text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider block">
                Personne Concernée Ciblée
              </span>

              <div className="flex justify-between">
                <span className="text-slate-400">Identité :</span>
                <strong className="text-white">{subject.fullName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Fonction :</span>
                <span className="text-slate-200">{subject.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Entreprise :</span>
                <span className="text-slate-200">{subject.company}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-400">Adresse Email :</span>
                <span className="text-indigo-400">{subject.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Base Légale Initiale :</span>
                <span className="text-slate-300 font-semibold">{subject.legalBasis}</span>
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
                onClick={handleExecuteErasure}
                disabled={isProcessing}
                className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <UserX className="w-4 h-4" />
                {isProcessing ? 'Destruction des données...' : "Confirmer l'Anonymisation (Art. 17)"}
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4 animate-fade-in text-center py-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-base font-extrabold text-white">
                Droit à l'Oubli Appliqué avec Succès
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Les données nominatives ont été écrasées et hachées irréversiblement. Une attestation
                d'anonymisation opposable à la CNIL a été scellée dans l'Audit Trail.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 space-y-1 text-left">
              <div className="text-[11px] text-slate-500 uppercase font-sans font-bold">
                Numéro d'Attestation Officielle CNIL / DPO :
              </div>
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>{erasureResult.certificate}</span>
                <button
                  type="button"
                  onClick={handleCopyCertificate}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedCert ? 'Copié !' : 'Copier'}
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-center">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
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
