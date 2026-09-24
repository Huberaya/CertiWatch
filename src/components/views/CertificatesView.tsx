import React, { useState } from 'react';
import { Certificate, CertificateStatus, CertificationStandard, VerificationOutcome } from '../../types/certificate';
import { Supplier } from '../../types/supplier';
import { CertificateStatusBadge, VerificationOutcomeBadge } from '../ui/Badge';
import { CertificateOcrUploadModal } from '../certificates/CertificateOcrUploadModal';
import { CertificateInspectionDrawer } from '../certificates/CertificateInspectionDrawer';
import { appStore } from '../../db/store';
import {
  FileCheck2,
  Plus,
  Filter,
  ExternalLink,
  ShieldAlert,
  Search,
  CheckCircle,
  AlertTriangle,
  FileText,
  Clock,
  RefreshCw,
  Upload,
  Download,
  LayoutGrid,
  List,
  Sparkles,
  ShieldCheck,
  Building2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface CertificatesViewProps {
  certificates: Certificate[];
  suppliers: Supplier[];
  searchQuery: string;
}

export function CertificatesView({
  certificates,
  suppliers,
  searchQuery,
}: CertificatesViewProps) {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterStandard, setFilterStandard] = useState<string>('ALL');
  const [filterOutcome, setFilterOutcome] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'EXPIRY_ASC' | 'CONFIDENCE_DESC' | 'SUPPLIER_ASC' | 'STANDARD_ASC'>('EXPIRY_ASC');
  const [viewMode, setViewMode] = useState<'TABLE' | 'GRID'>('TABLE');

  // Modals state
  const [inspectedCert, setInspectedCert] = useState<Certificate | null>(null);
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  const permissions = appStore.getActivePermissions();

  // Top KPI Metrics
  const totalCerts = certificates.length;
  const validCerts = certificates.filter((c) => c.status === 'VALID').length;
  const expiringSoonCerts = certificates.filter((c) => c.status === 'EXPIRING_SOON').length;
  const criticalCerts = certificates.filter((c) => ['EXPIRED', 'SUSPENDED', 'REVOKED'].includes(c.status)).length;
  const matchRate = totalCerts > 0
    ? Math.round((certificates.filter((c) => c.verificationOutcome === 'MATCH').length / totalCerts) * 100)
    : 100;

  // Filter & Search logic
  const filteredCertificates = certificates
    .filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        c.certificateNumber.toLowerCase().includes(q) ||
        c.supplierName.toLowerCase().includes(q) ||
        c.certificationStandard.toLowerCase().includes(q) ||
        c.certificationBody.toLowerCase().includes(q) ||
        (c.scope?.coveredProducts && c.scope.coveredProducts.some((p) => p.toLowerCase().includes(q)));

      const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
      const matchesStandard = filterStandard === 'ALL' || c.certificationStandard === filterStandard;
      const matchesOutcome = filterOutcome === 'ALL' || c.verificationOutcome === filterOutcome;

      return matchesSearch && matchesStatus && matchesStandard && matchesOutcome;
    })
    .sort((a, b) => {
      if (sortBy === 'EXPIRY_ASC') {
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      }
      if (sortBy === 'CONFIDENCE_DESC') {
        return b.confidenceScore - a.confidenceScore;
      }
      if (sortBy === 'SUPPLIER_ASC') {
        return a.supplierName.localeCompare(b.supplierName);
      }
      if (sortBy === 'STANDARD_ASC') {
        return a.standardLabel.localeCompare(b.standardLabel);
      }
      return 0;
    });

  const handleSyncAllRegistries = () => {
    setIsSyncingAll(true);
    appStore.runContinuousVerificationSync();
    setTimeout(() => {
      setIsSyncingAll(false);
    }, 900);
  };

  const handleExportCSV = () => {
    const csvContent = appStore.exportCertificatesCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `certificats_certiwatch_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-cyan-400" />
              <span>Répertoire Central des Certifications</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ingestion OCR/IA, contrôle des concordances et confrontation continue aux registres officiels
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              title="Exporter les certificats en CSV"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Exporter CSV</span>
            </button>

            <button
              onClick={handleSyncAllRegistries}
              disabled={isSyncingAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              title="Interroger tous les registres certificateurs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncingAll ? 'animate-spin' : ''}`} />
              <span>Vérifier Tous les Registres</span>
            </button>

            {permissions.canUploadCertificate && (
              <button
                onClick={() => setShowOcrModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Déposer Certificat (OCR / IA)</span>
              </button>
            )}
          </div>
        </div>

        {/* 5 Strategic KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
              Total Certificats
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-white">{totalCerts}</span>
              <span className="text-[10px] text-slate-500">Sous surveillance</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">
              Valides & Conformes
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-emerald-400">{validCerts}</span>
              <span className="text-[10px] text-emerald-500/80">Conformité OK</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider block">
              Expire sous 60j
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-amber-400">{expiringSoonCerts}</span>
              <span className="text-[10px] text-amber-500/80">Renouvellement requis</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] text-red-400 font-semibold uppercase tracking-wider block">
              Critiques / Révocations
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-red-400">{criticalCerts}</span>
              <span className="text-[10px] text-red-500/80">Achat à bloquer</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider block">
              Taux de Concordance
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-cyan-400">{matchRate}%</span>
              <span className="text-[10px] text-cyan-500/80">Confrontation API</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and View Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-slate-400 font-semibold pr-1">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>Filtres :</span>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="VALID">Valide</option>
            <option value="EXPIRING_SOON">Expire bientôt (&lt;60j)</option>
            <option value="EXPIRED">Expiré</option>
            <option value="SUSPENDED">Suspendu</option>
            <option value="REVOKED">Révoqué</option>
            <option value="MISMATCH">Divergence Registre</option>
          </select>

          {/* Standard Filter */}
          <select
            value={filterStandard}
            onChange={(e) => setFilterStandard(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Tous les standards</option>
            <option value="ECOCERT_BIO">Ecocert Bio</option>
            <option value="GOTS">GOTS</option>
            <option value="FSC">FSC</option>
            <option value="OEKO_TEX_100">OEKO-TEX 100</option>
            <option value="OEKO_TEX_STEP">OEKO-TEX STeP</option>
            <option value="FAIRTRADE">Fairtrade</option>
            <option value="PEFC">PEFC</option>
            <option value="ISO_14001">ISO 14001</option>
          </select>

          {/* Verification Outcome */}
          <select
            value={filterOutcome}
            onChange={(e) => setFilterOutcome(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Toutes concordances</option>
            <option value="MATCH">Concordance Validée (MATCH)</option>
            <option value="MISMATCH">Divergence / Anomalie (MISMATCH)</option>
            <option value="NOT_FOUND">Non Trouvé au Registre</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-cyan-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500 font-medium"
          >
            <option value="EXPIRY_ASC">Tri : Échéance la plus proche</option>
            <option value="CONFIDENCE_DESC">Tri : Score de confiance décroissant</option>
            <option value="SUPPLIER_ASC">Tri : Fournisseur (A - Z)</option>
            <option value="STANDARD_ASC">Tri : Standard (A - Z)</option>
          </select>

          {(filterStatus !== 'ALL' || filterStandard !== 'ALL' || filterOutcome !== 'ALL') && (
            <button
              onClick={() => {
                setFilterStatus('ALL');
                setFilterStandard('ALL');
                setFilterOutcome('ALL');
              }}
              className="text-xs text-slate-400 hover:text-white underline"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewMode('TABLE')}
            className={`p-1.5 rounded transition-colors ${
              viewMode === 'TABLE' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
            }`}
            title="Affichage Tableau Central"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('GRID')}
            className={`p-1.5 rounded transition-colors ${
              viewMode === 'GRID' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
            }`}
            title="Affichage Cartes"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: CENTRAL TABLE VIEW */}
      {viewMode === 'TABLE' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Fournisseur Titulaire</th>
                  <th className="py-3 px-4">Standard & N° Certificat</th>
                  <th className="py-3 px-4">Organisme Certificateur</th>
                  <th className="py-3 px-4">Date d'Échéance</th>
                  <th className="py-3 px-4">Statut Validité</th>
                  <th className="py-3 px-4">Confrontation Registre</th>
                  <th className="py-3 px-4">Confiance</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredCertificates.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                      Aucun certificat ne correspond aux critères de recherche.
                    </td>
                  </tr>
                ) : (
                  filteredCertificates.map((cert) => (
                    <tr
                      key={cert.id}
                      className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                      onClick={() => setInspectedCert(cert)}
                    >
                      <td className="py-3.5 px-4 font-sans">
                        <p className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                          {cert.supplierName}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-200 font-sans">{cert.standardLabel}</p>
                        <p className="text-[11px] text-cyan-300 font-mono">{cert.certificateNumber}</p>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 font-sans text-xs">
                        {cert.certificationBody}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`font-mono font-medium ${
                          cert.status === 'EXPIRED'
                            ? 'text-red-400 font-bold'
                            : cert.status === 'EXPIRING_SOON'
                            ? 'text-amber-400 font-bold'
                            : 'text-slate-200'
                        }`}>
                          {cert.expiryDate}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-sans">
                        <CertificateStatusBadge status={cert.status} />
                      </td>

                      <td className="py-3.5 px-4 font-sans">
                        <VerificationOutcomeBadge outcome={cert.verificationOutcome} />
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span
                          className={
                            cert.confidenceScore >= 90
                              ? 'text-emerald-400'
                              : cert.confidenceScore >= 70
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }
                        >
                          {cert.confidenceScore}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-sans">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {cert.officialRegistryUrl && (
                            <a
                              href={cert.officialRegistryUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                              title="Consulter le registre public officiel"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                            </a>
                          )}

                          <button
                            onClick={() => setInspectedCert(cert)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors"
                          >
                            Inspecter
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: GRID CARDS */}
      {viewMode === 'GRID' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCertificates.map((cert) => (
            <div
              key={cert.id}
              onClick={() => setInspectedCert(cert)}
              className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800/60 hover:border-slate-700 transition-all cursor-pointer shadow-md flex flex-col justify-between group space-y-3"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                      {cert.certificationStandard}
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {cert.standardLabel}
                    </h3>
                  </div>
                  <div className="font-mono text-xs font-bold text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {cert.confidenceScore}% Match
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[10px]">Titulaire :</span>
                    <span className="font-semibold text-white">{cert.supplierName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[10px]">N° Licence / Cert :</span>
                    <span className="font-mono text-cyan-300">{cert.certificateNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[10px]">Échéance :</span>
                    <span className={`font-mono font-bold ${
                      cert.status === 'EXPIRED' ? 'text-red-400' : cert.status === 'EXPIRING_SOON' ? 'text-amber-400' : 'text-slate-200'
                    }`}>
                      {cert.expiryDate}
                    </span>
                  </div>
                </div>

                {/* Scope snippet */}
                {cert.scope?.coveredProducts && (
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {cert.scope.coveredProducts.slice(0, 2).map((prod, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/80">
                        {prod}
                      </span>
                    ))}
                    {cert.scope.coveredProducts.length > 2 && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-800/60 text-slate-400">
                        +{cert.scope.coveredProducts.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {/* Anomalies alert banner if any */}
                {cert.anomalies && cert.anomalies.length > 0 && (
                  <div className="p-2 rounded bg-red-950/40 border border-red-900/60 text-red-300 text-[11px] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span className="truncate">{cert.anomalies[0].description}</span>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <CertificateStatusBadge status={cert.status} />
                <VerificationOutcomeBadge outcome={cert.verificationOutcome} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* OCR & AI Ingestion Upload Modal */}
      {showOcrModal && (
        <CertificateOcrUploadModal
          isOpen={showOcrModal}
          onClose={() => setShowOcrModal(false)}
          suppliers={suppliers}
        />
      )}

      {/* Comprehensive Certificate Inspection Drawer / Modal */}
      {inspectedCert && (
        <CertificateInspectionDrawer
          isOpen={!!inspectedCert}
          certificate={inspectedCert}
          onClose={() => setInspectedCert(null)}
        />
      )}
    </div>
  );
}
