import React, { useState } from 'react';
import { Supplier } from '../../types/supplier';
import { Certificate } from '../../types/certificate';
import { ComplianceAlert } from '../../types/alert';
import { CertificationProviderMetadata } from '../../types/connector';
import { StatOverview } from '../dashboard/StatOverview';
import { RiskRadar } from '../dashboard/RiskRadar';
import { RecentAlertsFeed } from '../dashboard/RecentAlertsFeed';
import { RegistryStatusList } from '../dashboard/RegistryStatusList';
import { ExpirationTimeline } from '../dashboard/ExpirationTimeline';
import { CertificationDistribution } from '../dashboard/CertificationDistribution';
import { Modal } from '../ui/Modal';
import { CertificateStatusBadge, VerificationOutcomeBadge } from '../ui/Badge';
import { ExternalLink, CheckCircle, AlertTriangle, FileText } from 'lucide-react';

interface DashboardViewProps {
  suppliers: Supplier[];
  certificates: Certificate[];
  alerts: ComplianceAlert[];
  providers: CertificationProviderMetadata[];
  onNavigateTab: (tab: any) => void;
  onSelectSupplier: (supplierId: string) => void;
}

export function DashboardView({
  suppliers,
  certificates,
  alerts,
  providers,
  onNavigateTab,
  onSelectSupplier,
}: DashboardViewProps) {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string | null>(null);
  const [inspectedCertificate, setInspectedCertificate] = useState<Certificate | null>(null);

  const handleSelectCertificate = (certId: string) => {
    const cert = certificates.find((c) => c.id === certId);
    if (cert) {
      setInspectedCertificate(cert);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module A: Stat Overview & KPI Counters */}
      <StatOverview
        suppliers={suppliers}
        certificates={certificates}
        selectedFilter={selectedStatusFilter}
        onFilterStatus={(st) => {
          setSelectedStatusFilter(st);
          if (st) {
            onNavigateTab('certificates');
          }
        }}
      />

      {/* Priority Row: Risk Radar & Immediate Procurement Blockers */}
      <RiskRadar
        suppliers={suppliers}
        certificates={certificates}
        onSelectSupplier={onSelectSupplier}
        onSelectCertificate={handleSelectCertificate}
      />

      {/* Grid: Alerts Feed + Expiration Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentAlertsFeed alerts={alerts} />
        <div className="space-y-6">
          <ExpirationTimeline certificates={certificates} />
          <CertificationDistribution certificates={certificates} />
        </div>
      </div>

      {/* Bottom Row: Official Registry Connectors Status */}
      <RegistryStatusList providers={providers} />

      {/* Certificate Inspection Modal */}
      {inspectedCertificate && (
        <Modal
          isOpen={!!inspectedCertificate}
          onClose={() => setInspectedCertificate(null)}
          title={`Certificat ${inspectedCertificate.certificationStandard} • ${inspectedCertificate.certificateNumber}`}
          subtitle={`Fournisseur : ${inspectedCertificate.supplierName}`}
          maxWidth="2xl"
        >
          <div className="space-y-5">
            {/* Status header */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-2">
                <CertificateStatusBadge status={inspectedCertificate.status} />
                <VerificationOutcomeBadge outcome={inspectedCertificate.verificationOutcome} />
              </div>
              <div className="text-xs font-mono text-slate-400">
                Score de confiance :{' '}
                <span
                  className={`font-bold ${
                    inspectedCertificate.confidenceScore >= 90
                      ? 'text-emerald-400'
                      : inspectedCertificate.confidenceScore >= 70
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {inspectedCertificate.confidenceScore}%
                </span>
              </div>
            </div>

            {/* Document vs Official Registry Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Document Extracted */}
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>DONNÉES DU DOCUMENT SOUMIS</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-slate-500">Organisme :</span>{' '}
                    <span className="text-slate-200">{inspectedCertificate.certificationBody}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Numéro :</span>{' '}
                    <span className="font-mono text-slate-200">{inspectedCertificate.certificateNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Date d'effet :</span>{' '}
                    <span className="text-slate-200">{inspectedCertificate.issueDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Date d'expiration :</span>{' '}
                    <span className="font-semibold text-slate-200">{inspectedCertificate.expiryDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Fichier original :</span>{' '}
                    <span className="text-slate-400 font-mono text-[11px] truncate block">
                      {inspectedCertificate.originalDocumentName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Official Registry */}
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>DONNÉES DU REGISTRE OFFICIEL</span>
                  </div>
                  {inspectedCertificate.officialRegistryUrl && (
                    <a
                      href={inspectedCertificate.officialRegistryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px]"
                    >
                      <span>Vérifier en direct</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-slate-500">Dernière vérification :</span>{' '}
                    <span className="text-slate-200">
                      {inspectedCertificate.lastVerifiedAt
                        ? new Date(inspectedCertificate.lastVerifiedAt).toLocaleString('fr-FR')
                        : 'Jamais'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Statut officiel :</span>{' '}
                    <span className="font-semibold text-slate-200">{inspectedCertificate.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Périmètre géographique :</span>{' '}
                    <span className="text-slate-200">
                      {inspectedCertificate.scope.geographicalRegions.join(', ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Produits certifiés :</span>{' '}
                    <span className="text-slate-300">
                      {inspectedCertificate.scope.coveredProducts.join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Anomalies Detected */}
            {inspectedCertificate.anomalies.length > 0 && (
              <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/40 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-red-300">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>DIVERGENCES ET ANOMALIES DÉTECTÉES PAR CERTIWATCH</span>
                </div>
                <div className="space-y-2">
                  {inspectedCertificate.anomalies.map((a, idx) => (
                    <div key={idx} className="p-2.5 rounded bg-slate-900/90 border border-red-900/40 text-xs">
                      <p className="font-semibold text-red-300">{a.description}</p>
                      <div className="grid grid-cols-2 gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                        <div>Doc : <span className="text-slate-200">{a.documentValue}</span></div>
                        <div>Registre : <span className="text-red-300 font-semibold">{a.officialValue}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sites and Facilities covered */}
            <div className="text-xs p-3 rounded-xl bg-slate-950/40 border border-slate-800">
              <span className="font-semibold text-slate-400">Sites industriels audités & couverts :</span>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-300">
                {inspectedCertificate.scope.coveredFacilities.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
