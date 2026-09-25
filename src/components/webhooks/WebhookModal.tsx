import React, { useState } from 'react';
import {
  Radio,
  CheckCircle2,
  AlertTriangle,
  Key,
  Globe2,
  ShieldCheck,
  RotateCw,
  Plus,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { WebhookEndpoint, WebhookEventType } from '../../types/webhook';
import { appStore } from '../../db/store';

interface WebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  webhook?: WebhookEndpoint | null;
  onSaved?: () => void;
}

export function WebhookModal({ isOpen, onClose, webhook, onSaved }: WebhookModalProps) {
  const [name, setName] = useState(webhook?.name || 'SAP S/4HANA - Gate Entrepôt');
  const [url, setUrl] = useState(webhook?.url || 'https://sap-gateway.enterprise.corp/api/v1/certiwatch');
  const [secret, setSecret] = useState(
    webhook?.secret ||
      'whsec_' + Array.from({ length: 28 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  );
  const [selectedEvents, setSelectedEvents] = useState<WebhookEventType[]>(
    webhook?.events || ['CERTIFICATE_REVOKED', 'SUPPLIER_BLOCKED', 'EUDR_NON_COMPLIANT']
  );
  const [status, setStatus] = useState<'ACTIVE' | 'DISABLED'>(
    webhook?.status === 'DISABLED' ? 'DISABLED' : 'ACTIVE'
  );

  const availableEvents: Array<{ event: WebhookEventType; label: string; desc: string }> = [
    {
      event: 'CERTIFICATE_REVOKED',
      label: 'Certificat Révoqué',
      desc: 'Déclenché immédiatement lorsqu’un organisme (Ecocert, FSC, GOTS) invalide une certification.',
    },
    {
      event: 'CERTIFICATE_EXPIRED',
      label: 'Certificat Expiré (J-0)',
      desc: 'Émis à l’échéance de la date de fin de validité sans renouvellement validé.',
    },
    {
      event: 'SUPPLIER_BLOCKED',
      label: 'Fournisseur Bloqué ERP',
      desc: 'Blocage strict de toute passation de commande d’achat sur ce tiers.',
    },
    {
      event: 'EUDR_NON_COMPLIANT',
      label: 'Infraction EUDR Déforestation',
      desc: 'Parcelle manquante, polygone non conforme ou déforestation satellite post-2020.',
    },
    {
      event: 'DEROGATION_EXPIRED',
      label: 'Dérogation Temporaire Expirée',
      desc: 'Fin du délai de grâce des 90 jours sans justificatif d’audit valide.',
    },
    {
      event: 'ORDER_CHECK_FAILED',
      label: 'Contrôle Commande Rejeté',
      desc: 'Tentative de commande ERP sur une matière non couverte par la matrice.',
    },
    {
      event: 'CERTIFICATE_RENEWED',
      label: 'Certificat Renouvelé & Conforme',
      desc: 'Déblocage automatique et mise à jour de la date de péremption dans l’ERP.',
    },
  ];

  const toggleEvent = (ev: WebhookEventType) => {
    setSelectedEvents((prev) =>
      prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev]
    );
  };

  const handleGenerateSecret = () => {
    setSecret(
      'whsec_' + Array.from({ length: 28 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim() || selectedEvents.length === 0) return;

    if (webhook) {
      appStore.updateWebhook(webhook.id, {
        name,
        url,
        secret,
        events: selectedEvents,
        status,
      });
    } else {
      appStore.addWebhook({
        name,
        url,
        secret,
        events: selectedEvents,
        status,
      });
    }

    if (onSaved) onSaved();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={webhook ? 'Modifier le Webhook ERP' : 'Enregistrer un Nouveau Webhook Sortant (EventBus)'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-slate-300 flex items-start gap-2.5">
          <Radio className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-indigo-300">
              Notification Événementielle en Temps Réel (Webhook Push)
            </span>
            <p className="mt-0.5 text-slate-400">
              Chaque payload est sécurisé par signature HMAC SHA-256 dans l'en-tête{' '}
              <code className="text-indigo-300 font-mono">X-CertiWatch-Signature</code>. En cas
              d'échec (timeout ou erreur HTTP 5xx), le message est routé vers la Dead Letter Queue
              (DLQ) pour rejeu automatique.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Nom du Récepteur ERP</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: SAP S/4HANA Production - Entrepôt Rungis"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">URL du Webhook (HTTPS requis)</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://votre-erp.entreprise.corp/api/certiwatch/webhook"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Clé Secrète de Signature HMAC</label>
              <button
                type="button"
                onClick={handleGenerateSecret}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <RotateCw className="w-3 h-3" />
                Régénérer
              </button>
            </div>
            <input
              type="text"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
              required
            />
          </div>
        </div>

        {/* Events multi-select */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Événements Déclencheurs ({selectedEvents.length} sélectionnés)
          </span>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {availableEvents.map(({ event, label, desc }) => {
              const isChecked = selectedEvents.includes(event);

              return (
                <label
                  key={event}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                    isChecked
                      ? 'bg-indigo-950/30 border-indigo-500/40 text-slate-200'
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleEvent(event)}
                    className="mt-0.5 rounded border-slate-700 text-indigo-500 focus:ring-0"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-white">{label}</span>
                    <span className="text-[10px] font-mono text-indigo-400 block">{event}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>
                  </div>
                </label>
              );
            })}
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
            type="submit"
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-600/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            {webhook ? 'Enregistrer les modifications' : 'Activer le Webhook'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
