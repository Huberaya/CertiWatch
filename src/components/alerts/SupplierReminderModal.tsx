import React, { useState, useEffect } from 'react';
import { ComplianceAlert } from '../../types/alert';
import { Supplier } from '../../types/supplier';
import { Certificate } from '../../types/certificate';
import { Modal } from '../ui/Modal';
import { appStore } from '../../db/store';
import {
  Send,
  Mail,
  CheckCircle2,
  Clock,
  FileCheck2,
  AlertTriangle,
  Languages,
  ShieldAlert,
  Copy,
  Check,
} from 'lucide-react';

interface SupplierReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: ComplianceAlert | null;
}

export function SupplierReminderModal({
  isOpen,
  onClose,
  alert,
}: SupplierReminderModalProps) {
  const [language, setLanguage] = useState<'FR' | 'EN'>('FR');
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const suppliers = appStore.getTenantSuppliers();
  const certificates = appStore.getTenantCertificates();

  const currentSupplier = alert ? suppliers.find((s) => s.id === alert.supplierId) : null;
  const currentCert = alert ? certificates.find((c) => c.id === alert.certificateId) : null;

  useEffect(() => {
    if (!alert) return;

    const defaultEmail =
      currentSupplier?.additionalContacts?.find((c) => c.role === 'QUALITY' || c.isPrimary)?.email ||
      currentSupplier?.contactEmail ||
      'conformite@fournisseur.com';

    setRecipient(defaultEmail);
    setIsSent(false);

    if (language === 'FR') {
      setSubject(
        `[URGENT / CONFORMITÉ] Renouvellement de votre certificat ${alert.certificationStandard} (N° ${alert.certificateNumber}) - Plateforme CertiWatch`
      );
      setBody(
        `Madame, Monsieur,

Dans le cadre du suivi continu de notre politique d'achats responsables et de notre référencement fournisseur, nous constatons que votre certificat ${alert.certificationStandard} (N° ${alert.certificateNumber}) arrive à échéance ou fait l'objet d'une non-conformité :

• Fournisseur : ${alert.supplierName}
• Standard : ${alert.certificationStandard}
• N° de certificat : ${alert.certificateNumber}
• Motif d'alerte : ${alert.title}
• Date limite de mise en conformité : sous 10 jours ouvrés

Afin d'éviter tout blocage automatique de vos commandes d'achat (PO) dans notre ERP (SAP/Coupa), nous vous invitons à déposer immédiatement votre nouveau certificat valide ou votre attestation d'audit sur notre portail sécurisé :

👉 Lien de dépôt rapide : https://certiwatch.enterprise.io/upload?token=${alert.id}&tenant=${alert.tenantId}

En cas de suspension ou de renouvellement en cours auprès de votre organisme certificateur, merci de nous transmettre le rapport d'audit d'étape par retour de courriel.

Cordialement,
Le Département Conformité Achats & RSE`
      );
    } else {
      setSubject(
        `[URGENT / COMPLIANCE] Action Required: Renewal of your ${alert.certificationStandard} Certificate (No. ${alert.certificateNumber}) - CertiWatch`
      );
      setBody(
        `Dear Supplier Partner,

As part of our continuous supply chain compliance and ESG governance process, our monitoring system has flagged an issue with your ${alert.certificationStandard} certificate (No. ${alert.certificateNumber}):

• Supplier Legal Name: ${alert.supplierName}
• Certification Standard: ${alert.certificationStandard}
• Certificate Reference: ${alert.certificateNumber}
• Notice Type: ${alert.title}
• Required Deadline: within 10 business days

To prevent any automated purchase order (PO) freeze within our ERP systems (SAP/Coupa), please upload your newly issued certificate or audit renewal report immediately:

👉 Secure Upload Portal: https://certiwatch.enterprise.io/upload?token=${alert.id}&tenant=${alert.tenantId}

Should you have any questions or if an audit is currently underway, please reply directly with your audit schedule.

Best regards,
Procurement Compliance & ESG Governance Team`
      );
    }
  }, [alert, language, isOpen]);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alert || !recipient.trim()) return;

    setIsSending(true);
    await appStore.sendSupplierReminderEmail(alert.id, {
      recipient: recipient.trim(),
      subject: subject.trim(),
      body: body.trim(),
      language,
    });

    setIsSending(false);
    setIsSent(true);

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(`${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!alert) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Relance Automatique Fournisseur par Email"
      subtitle="Notification formelle d'expiration de certificat ou discordance de conformité"
      maxWidth="2xl"
    >
      <form onSubmit={handleSendEmail} className="space-y-4 text-xs">
        {/* Banner with alert summary */}
        <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-amber-300">
              {alert.title} — {alert.supplierName}
            </div>
            <div className="text-[11px] text-amber-400/80 mt-0.5">
              Certificat {alert.certificationStandard} N° {alert.certificateNumber}. Cet envoi sera tracé dans l'historique de l'alerte et l'audit trail.
            </div>
          </div>
        </div>

        {/* Language & Recipient selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Destinataire (Email Fournisseur) *
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
              <input
                type="email"
                required
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="contact.qualite@fournisseur.com"
                className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Langue du Modèle
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLanguage('FR')}
                className={`flex-1 py-2 px-3 rounded-lg font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                  language === 'FR'
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>🇫🇷 Français</span>
              </button>
              <button
                type="button"
                onClick={() => setLanguage('EN')}
                className={`flex-1 py-2 px-3 rounded-lg font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                  language === 'EN'
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>🇬🇧 English</span>
              </button>
            </div>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="text-slate-300 font-semibold block mb-1">
            Objet du Courriel *
          </label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Body */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-slate-300 font-semibold">
              Corps du Message Pré-rempli (Modifiable) *
            </label>
            <button
              type="button"
              onClick={handleCopyBody}
              className="text-[10px] text-slate-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copié !' : 'Copier texte'}</span>
            </button>
          </div>
          <textarea
            required
            rows={10}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500 font-mono text-[11px] leading-relaxed"
          />
        </div>

        {/* Action footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Horodatage et signature automatique dans l'audit trail</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSending || isSent}
              className={`px-5 py-2 rounded-lg font-bold transition-all shadow-md flex items-center gap-2 ${
                isSent
                  ? 'bg-emerald-600 text-white'
                  : 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-900/30'
              }`}
            >
              {isSent ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Relance Envoyée !</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{isSending ? 'Transmission en cours...' : 'Transmettre la Relance'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
