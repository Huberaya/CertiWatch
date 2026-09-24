import React from 'react';
import { CertificateStatus, VerificationOutcome } from '../../types/certificate';
import { SupplierRiskLevel, SupplierStatus } from '../../types/supplier';
import { AlertSeverity } from '../../types/alert';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ShieldAlert,
  Search,
  FileQuestion,
  HelpCircle,
  Ban,
} from 'lucide-react';

interface BadgeProps {
  children?: React.ReactNode;
  className?: string;
}

export function CertificateStatusBadge({ status }: { status: CertificateStatus }) {
  switch (status) {
    case 'VALID':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          Valide
        </span>
      );
    case 'EXPIRING_SOON':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          Expire bientôt
        </span>
      );
    case 'EXPIRED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <XCircle className="w-3.5 h-3.5 text-rose-400" />
          Expiré
        </span>
      );
    case 'SUSPENDED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
          <Ban className="w-3.5 h-3.5 text-purple-400" />
          Suspendu
        </span>
      );
    case 'REVOKED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-red-600/15 text-red-300 border border-red-500/30">
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          Révoqué
        </span>
      );
    case 'MISMATCH':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
          Anomalie Registre
        </span>
      );
    case 'NOT_FOUND':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          Introuvable
        </span>
      );
    case 'UNDER_REVIEW':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
          <FileQuestion className="w-3.5 h-3.5 text-blue-400" />
          En revue
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          Non vérifié
        </span>
      );
  }
}

export function RiskBadge({ level }: { level: SupplierRiskLevel }) {
  switch (level) {
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
          Risque Critique
        </span>
      );
    case 'HIGH':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/30">
          Risque Élevé
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
          Risque Modéré
        </span>
      );
    case 'LOW':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Risque Faible
        </span>
      );
  }
}

export function SupplierStatusBadge({ status }: { status: SupplierStatus }) {
  switch (status) {
    case 'ACTIVE':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Conforme / Actif
        </span>
      );
    case 'BLOCKED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-500/15 text-red-300 border border-red-500/30">
          <Ban className="w-3 h-3 text-red-400" />
          Bloqué Achats (ERP)
        </span>
      );
    case 'ON_HOLD':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
          <Clock className="w-3 h-3 text-amber-400" />
          En attente de régularisation
        </span>
      );
    case 'ARCHIVED':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
          Archivé
        </span>
      );
  }
}

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  switch (severity) {
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40">
          CRITIQUE
        </span>
      );
    case 'HIGH':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/30">
          ÉLEVÉ
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/25">
          MOYEN
        </span>
      );
    case 'LOW':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-700 text-slate-300">
          INFO
        </span>
      );
  }
}

export function VerificationOutcomeBadge({ outcome }: { outcome: VerificationOutcome }) {
  switch (outcome) {
    case 'MATCH':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          100% Concordance Registre
        </span>
      );
    case 'MISMATCH':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-500/15 text-red-300 border border-red-500/30">
          <AlertTriangle className="w-3 h-3 text-red-400" />
          Divergence Registre
        </span>
      );
    case 'NOT_FOUND':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-700/60 text-slate-300 border border-slate-600">
          <Search className="w-3 h-3 text-slate-400" />
          Non répertorié
        </span>
      );
    case 'REGISTRY_UNAVAILABLE':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Clock className="w-3 h-3 text-amber-400" />
          Registre indisponible
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-400">
          Non vérifié
        </span>
      );
  }
}
