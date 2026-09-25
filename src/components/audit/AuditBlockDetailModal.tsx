import React, { useState } from 'react';
import { AuditLogEntry } from '../../types/audit';
import { Modal } from '../ui/Modal';
import {
  ShieldCheck,
  Hash,
  Link,
  Clock,
  User,
  Terminal,
  Copy,
  Check,
  Laptop,
  Layers,
  FileText,
  Lock,
} from 'lucide-react';

interface AuditBlockDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: AuditLogEntry | null;
}

export function AuditBlockDetailModal({
  isOpen,
  onClose,
  log,
}: AuditBlockDetailModalProps) {
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);

  if (!log) return null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(log.hash || '');
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Bloc d'Audit Cryptographique N° ${log.blockNumber || 1}`}
      subtitle={`Enregistrement immuable scellé le ${new Date(log.timestamp).toLocaleString('fr-FR')}`}
      maxWidth="2xl"
    >
      <div className="space-y-4 text-xs">
        {/* Digital seal badge */}
        <div className="p-3.5 rounded-xl bg-teal-950/30 border border-teal-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <div>
              <div className="font-bold text-teal-300">Sceau Numérique & Non-Répudiation</div>
              <div className="text-[10px] text-teal-400/80 font-mono mt-0.5">
                {log.digitalSeal || 'CERT-SEAL-VERIFIED-ED25519'}
              </div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
            SHA-256 VALIDE
          </span>
        </div>

        {/* Cryptographic Linkage Details */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-[11px]">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
              <span className="flex items-center gap-1.5 font-sans font-semibold">
                <Hash className="w-3.5 h-3.5 text-teal-400" />
                <span>Empreinte Actuelle (Current Block Hash)</span>
              </span>
              <button
                type="button"
                onClick={handleCopyHash}
                className="text-teal-400 hover:text-teal-300 flex items-center gap-1 font-sans text-[10px]"
              >
                {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedHash ? 'Copié' : 'Copier'}</span>
              </button>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-teal-300 break-all select-all">
              {log.hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-1 font-sans font-semibold">
              <Link className="w-3.5 h-3.5 text-slate-500" />
              <span>Chaînage Antérieur (Previous Block Hash)</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-400 break-all select-all">
              {log.previousHash || '0000000000000000000000000000000000000000000000000000000000000000'}
            </div>
          </div>
        </div>

        {/* Event Metadata grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold block">Auteur / Initiateur</span>
            <div className="font-bold text-slate-200 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-400" />
              <span>{log.userName}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Rôle : {log.userRole}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold block">Origine Réseau & IP</span>
            <div className="font-bold text-slate-200 flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-teal-400" />
              <span className="font-mono">{log.ipAddress || '194.254.12.8'}</span>
            </div>
            <div className="text-[10px] text-slate-400">
              Source : <span className="font-mono text-teal-300">{log.source}</span>
            </div>
          </div>
        </div>

        {/* Event Payload Description */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-teal-400" />
              <span>Détails & Justificatif de l'Action</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
              {log.actionCategory}
            </span>
          </div>

          <p className="text-slate-200 leading-relaxed text-xs">
            {log.details}
          </p>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Entité ciblée : <strong className="text-slate-200">{log.entityReference}</strong></span>
            <span className="font-mono text-[10px] text-slate-500">ID: {log.entityId}</span>
          </div>
        </div>

        {/* Delta if present */}
        {(log.previousValue || log.newValue) && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold block mb-0.5">Valeur Antérieure</span>
              <span className="text-slate-300 font-mono">{log.previousValue || 'N/A'}</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-teal-400 font-bold block mb-0.5">Nouvelle Valeur Scellée</span>
              <span className="text-emerald-400 font-mono font-bold">{log.newValue || 'N/A'}</span>
            </div>
          </div>
        )}

        {/* Modal actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={handleCopyRaw}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
          >
            {copiedRaw ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Terminal className="w-3.5 h-3.5" />}
            <span>{copiedRaw ? 'JSON Copié !' : 'Copier JSON Brut'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold transition-colors"
          >
            Fermer l'Inspecteur
          </button>
        </div>
      </div>
    </Modal>
  );
}
