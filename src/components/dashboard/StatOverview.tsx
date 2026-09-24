import React from 'react';
import {
  Building2,
  FileCheck2,
  CheckCircle2,
  Clock,
  XCircle,
  Ban,
  ShieldAlert,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { MetricCard } from '../ui/MetricCard';
import { Certificate } from '../../types/certificate';
import { Supplier } from '../../types/supplier';

interface StatOverviewProps {
  suppliers: Supplier[];
  certificates: Certificate[];
  onFilterStatus?: (status: string | null) => void;
  selectedFilter?: string | null;
}

export function StatOverview({
  suppliers,
  certificates,
  onFilterStatus,
  selectedFilter,
}: StatOverviewProps) {
  const totalSuppliers = suppliers.length;
  const totalCerts = certificates.length;

  const validCerts = certificates.filter((c) => c.status === 'VALID').length;
  const expiring60Certs = certificates.filter((c) => c.status === 'EXPIRING_SOON').length;
  const expiredCerts = certificates.filter((c) => c.status === 'EXPIRED').length;
  const suspendedCerts = certificates.filter((c) => c.status === 'SUSPENDED').length;
  const revokedCerts = certificates.filter((c) => c.status === 'REVOKED').length;
  const mismatchCerts = certificates.filter(
    (c) => c.status === 'MISMATCH' || c.verificationOutcome === 'MISMATCH'
  ).length;

  const complianceRate =
    totalCerts > 0 ? Math.round((validCerts / totalCerts) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Top Banner: Health & Compliance Index */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Indice de Conformité Fournisseurs
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {complianceRate}% CONFORME
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Surveillance continue en temps réel contre les registres officiels (Ecocert, FSC, GOTS, OEKO-TEX, Fairtrade).
              Détection automatique des expirations, suspensions et révocations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Fournisseurs Actifs
            </p>
            <p className="text-xl font-bold text-white mt-0.5 font-mono">
              {suppliers.filter((s) => s.status === 'ACTIVE').length} / {totalSuppliers}
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Commandes Bloquées (ERP)
            </p>
            <p className="text-xl font-bold text-rose-400 mt-0.5 font-mono">
              {suppliers.filter((s) => s.status === 'BLOCKED').length}
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Key Performance Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <MetricCard
          title="Fournisseurs"
          value={totalSuppliers}
          subtitle="Base active"
          icon={Building2}
          tone="default"
        />

        <MetricCard
          title="Total Certificats"
          value={totalCerts}
          subtitle="Sous monitoring"
          icon={FileCheck2}
          tone="cyan"
          active={selectedFilter === 'ALL'}
          onClick={() => onFilterStatus && onFilterStatus(selectedFilter === 'ALL' ? null : 'ALL')}
        />

        <MetricCard
          title="Valides"
          value={validCerts}
          subtitle="Conformes"
          icon={CheckCircle2}
          tone="success"
          active={selectedFilter === 'VALID'}
          onClick={() => onFilterStatus && onFilterStatus(selectedFilter === 'VALID' ? null : 'VALID')}
        />

        <MetricCard
          title="Expire < 60j"
          value={expiring60Certs}
          subtitle="Action requise"
          icon={Clock}
          tone="warning"
          active={selectedFilter === 'EXPIRING_SOON'}
          onClick={() =>
            onFilterStatus && onFilterStatus(selectedFilter === 'EXPIRING_SOON' ? null : 'EXPIRING_SOON')
          }
        />

        <MetricCard
          title="Expirés"
          value={expiredCerts}
          subtitle="Non renouvelés"
          icon={XCircle}
          tone="danger"
          active={selectedFilter === 'EXPIRED'}
          onClick={() =>
            onFilterStatus && onFilterStatus(selectedFilter === 'EXPIRED' ? null : 'EXPIRED')
          }
        />

        <MetricCard
          title="Suspendus"
          value={suspendedCerts}
          subtitle="Audit certificateur"
          icon={Ban}
          tone="purple"
          active={selectedFilter === 'SUSPENDED'}
          onClick={() =>
            onFilterStatus && onFilterStatus(selectedFilter === 'SUSPENDED' ? null : 'SUSPENDED')
          }
        />

        <MetricCard
          title="Révoqués"
          value={revokedCerts}
          subtitle="Sanctions fermes"
          icon={ShieldAlert}
          tone="danger"
          active={selectedFilter === 'REVOKED'}
          onClick={() =>
            onFilterStatus && onFilterStatus(selectedFilter === 'REVOKED' ? null : 'REVOKED')
          }
        />

        <MetricCard
          title="Anomalies"
          value={mismatchCerts}
          subtitle="Divergence doc/web"
          icon={AlertTriangle}
          tone="warning"
          active={selectedFilter === 'MISMATCH'}
          onClick={() =>
            onFilterStatus && onFilterStatus(selectedFilter === 'MISMATCH' ? null : 'MISMATCH')
          }
        />
      </div>
    </div>
  );
}
