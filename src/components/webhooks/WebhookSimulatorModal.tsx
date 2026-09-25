import React, { useState } from 'react';
import {
  Send,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Code2,
  Lock,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { WebhookEndpoint, WebhookEventType, WebhookDeliveryLog } from '../../types/webhook';
import { appStore } from '../../db/store';

interface WebhookSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEndpointId?: string | null;
}

export function WebhookSimulatorModal({
  isOpen,
  onClose,
  selectedEndpointId: initialEndpointId,
}: WebhookSimulatorModalProps) {
  const webhooks = appStore.getTenantWebhooks();
  const [endpointId, setEndpointId] = useState(initialEndpointId || (webhooks[0]?.id ?? ''));
  const [eventType, setEventType] = useState<WebhookEventType>('CERTIFICATE_REVOKED');
  const [customPayload, setCustomPayload] = useState(
    JSON.stringify(
      {
        event: 'CERTIFICATE_REVOKED',
        timestamp: new Date().toISOString(),
        tenant: 'Danone Quality & Sourcing',
        data: {
          supplierId: 'sup-danone-02',
          supplierName: 'Agrícola Andina del Cacao S.A.C.',
          standard: 'GOTS',
          certificateNumber: 'CU-849301-GOTS-2024',
          revocationReason: 'Audit de contrôle défavorable par Ecocert',
          erpActionRequired: 'BLOCK_GOODS_RECEIPT',
        },
      },
      null,
      2
    )
  );

  const [isSending, setIsSending] = useState(false);
  const [deliveryResult, setDeliveryResult] = useState<WebhookDeliveryLog | null>(null);

  const targetEndpoint = webhooks.find((w) => w.id === endpointId) || webhooks[0];

  const handleDispatch = () => {
    setIsSending(true);
    setDeliveryResult(null);

    setTimeout(() => {
      let parsed = undefined;
      try {
        parsed = JSON.parse(customPayload);
      } catch (e) {
        console.warn('Invalid custom JSON payload, using default');
      }

      const log = appStore.simulateWebhookDispatch(targetEndpoint?.id || '', eventType, parsed);
      setDeliveryResult(log);
      setIsSending(false);
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Simulateur d’Émission Webhook ERP (HMAC SHA-256)"
      maxWidth="lg"
    >
      <div className="space-y-5">
        <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-slate-300 flex items-start gap-2.5">
          <Send className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-indigo-300">
              Test d'Intégration & Validation de Signature HMAC
            </span>
            <p className="mt-0.5 text-slate-400">
              Déclenchez manuellement un événement pour tester la réception par vos passerelles SAP
              S/4HANA, Coupa ou NetSuite. Le payload est signé cryptographiquement.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Endpoint Destinataire</label>
            <select
              value={endpointId}
              onChange={(e) => setEndpointId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {webhooks.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Type d'Événement</label>
            <select
              value={eventType}
              onChange={(e) => {
                const newEv = e.target.value as WebhookEventType;
                setEventType(newEv);
                try {
                  const obj = JSON.parse(customPayload);
                  obj.event = newEv;
                  setCustomPayload(JSON.stringify(obj, null, 2));
                } catch (err) {}
              }}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="CERTIFICATE_REVOKED">CERTIFICATE_REVOKED</option>
              <option value="CERTIFICATE_EXPIRED">CERTIFICATE_EXPIRED</option>
              <option value="SUPPLIER_BLOCKED">SUPPLIER_BLOCKED</option>
              <option value="EUDR_NON_COMPLIANT">EUDR_NON_COMPLIANT</option>
              <option value="DEROGATION_EXPIRED">DEROGATION_EXPIRED</option>
              <option value="ORDER_CHECK_FAILED">ORDER_CHECK_FAILED</option>
              <option value="CERTIFICATE_RENEWED">CERTIFICATE_RENEWED</option>
            </select>
          </div>
        </div>

        {/* Payload editor */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Corps du Message JSON (Payload)</span>
            <span className="text-[10px] text-slate-500 font-mono">Format standardisé RFC 8259</span>
          </label>
          <textarea
            rows={6}
            value={customPayload}
            onChange={(e) => setCustomPayload(e.target.value)}
            className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleDispatch}
            disabled={isSending}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50 shadow-lg shadow-indigo-600/20"
          >
            {isSending ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                Émission & Signature...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Déclencher l'Émission Webhook
              </>
            )}
          </button>
        </div>

        {/* Delivery Response Card */}
        {deliveryResult && (
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Livraison Confirmée avec Succès (HTTP 200 OK)
              </span>
              <span className="text-xs font-mono text-slate-400">
                Latence : {deliveryResult.durationMs}ms
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono space-y-1 text-slate-300">
              <div className="text-slate-500">
                <strong>En-têtes HTTP envoyés :</strong>
              </div>
              <div>POST {targetEndpoint?.url}</div>
              <div className="text-indigo-400">
                X-CertiWatch-Event: {deliveryResult.event}
              </div>
              <div className="truncate text-emerald-400">
                X-CertiWatch-Signature: {deliveryResult.signature}
              </div>
              <div className="text-slate-400">
                X-CertiWatch-Delivery: {deliveryResult.id}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
}
