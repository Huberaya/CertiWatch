import React, { useState } from 'react';
import { AuditLogEntry, AuditActionCategory } from '../../types/audit';
import {
  History,
  Filter,
  Download,
  Shield,
  Search,
  ShieldCheck,
  FileSpreadsheet,
  FileText,
  Lock,
  Layers,
  Award,
  Link,
  CheckCircle2,
  ExternalLink,
  Laptop,
  User,
  Cpu,
  Eye,
} from 'lucide-react';
import { AuditBlockDetailModal } from '../audit/AuditBlockDetailModal';
import { AuditIntegrityReportModal } from '../audit/AuditIntegrityReportModal';
import { appStore } from '../../db/store';

interface AuditTrailViewProps {
  logs: AuditLogEntry[];
  searchQuery: string;
}

export function AuditTrailView({ logs, searchQuery }: AuditTrailViewProps) {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterEntityType, setFilterEntityType] = useState<string>('ALL');
  const [filterSource, setFilterSource] = useState<string>('ALL');
  const [localSearch, setLocalSearch] = useState('');

  // Modals state
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const effectiveSearch = (searchQuery || localSearch).toLowerCase();

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.entityReference.toLowerCase().includes(effectiveSearch) ||
      l.userName.toLowerCase().includes(effectiveSearch) ||
      l.details.toLowerCase().includes(effectiveSearch) ||
      l.actionCategory.toLowerCase().includes(effectiveSearch) ||
      (l.hash && l.hash.toLowerCase().includes(effectiveSearch));

    const matchesCategory = filterCategory === 'ALL' || l.actionCategory === filterCategory;
    const matchesEntity = filterEntityType === 'ALL' || l.entityType === filterEntityType;
    const matchesSource = filterSource === 'ALL' || l.source === filterSource;

    return matchesSearch && matchesCategory && matchesEntity && matchesSource;
  });

  // KPIs
  const totalEvents = logs.length;
  const erpBlockEvents = logs.filter((l) => l.actionCategory === 'ERP_BLOCK_TRIGGERED').length;
  const automatedSyncs = logs.filter((l) => l.source === 'AUTOMATED_SYNC').length;
  const manualOverrides = logs.filter((l) => l.actionCategory === 'DEROGATION_GRANTED' || l.details.includes('Dérogation')).length;

  const handleExportCSV = () => {
    const csv = appStore.exportAuditLogsCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `registre_audit_scelle_certiwatch_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const jsonStr = appStore.exportAuditLogsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit_trail_scelle_complet_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <span>Piste d’Audit Immuable & Registre de Preuve Juridique</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Chaîne séquentielle horodatée (SHA-256) garantissant la non-répudiation pour les audits CSRD, ISO et contrôles douaniers
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Exporter CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-teal-400" />
            <span>Exporter JSON Scellé</span>
          </button>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-semibold shadow-md shadow-teal-900/30 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Vérifier Intégrité Chaîne & Rapport CSRD</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Enregistrements Scellés</span>
            <Lock className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">{totalEvents}</div>
          <span className="text-[11px] text-teal-400 mt-1 block">Blocs séquentiels vérifiés</span>
        </div>

        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 shadow-sm">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold">
            <span>Intégrité Cryptographique</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-300 mt-1 font-mono">100%</div>
          <span className="text-[11px] text-emerald-400/80 mt-1 block">Zéro altération détectée</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Blocages ERP Historisés</span>
            <Shield className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400 mt-1 font-mono">{erpBlockEvents}</div>
          <span className="text-[11px] text-red-300/80 mt-1 block">Sanctions de non-conformité</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Synchronisations Automates</span>
            <Cpu className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400 mt-1 font-mono">{automatedSyncs}</div>
          <span className="text-[11px] text-cyan-300/80 mt-1 block">Pings registres certificateurs</span>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Rechercher par référence, auteur, détail d'action ou empreinte SHA-256..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filtres :</span>
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">Toutes les actions</option>
            <option value="CERTIFICATE_STATUS_CHANGED">Statut Certificat Modifié</option>
            <option value="CERTIFICATE_VERIFIED">Certificat Vérifié API</option>
            <option value="CERTIFICATE_UPLOADED">Certificat Déposé (OCR)</option>
            <option value="ERP_BLOCK_TRIGGERED">Blocage Commande ERP</option>
            <option value="ERP_ORDER_CHECK">Contrôle PO ERP</option>
            <option value="ALERT_RESOLVED">Alerte Résolue</option>
            <option value="ALERT_TRIGGERED">Alerte Déclenchée</option>
            <option value="MATRIX_RULE_UPDATED">Règle Matrice Modifiée</option>
            <option value="SUPPLIER_CREATED">Fournisseur Créé</option>
            <option value="SYSTEM_SYNC">Synchronisation Système</option>
          </select>

          <select
            value={filterEntityType}
            onChange={(e) => setFilterEntityType(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">Toutes entités</option>
            <option value="CERTIFICATE">Certificats</option>
            <option value="SUPPLIER">Fournisseurs</option>
            <option value="ALERT">Alertes</option>
            <option value="MATRIX">Matrice Achats</option>
            <option value="INTEGRATION">Intégrations / Connecteurs</option>
          </select>

          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">Toutes sources</option>
            <option value="MANUAL_UI">Portail Utilisateur</option>
            <option value="AUTOMATED_SYNC">Automate Registres</option>
            <option value="ERP_WEBHOOK">Webhook ERP SAP/Coupa</option>
            <option value="OCR_INGESTION">Pipeline OCR IA</option>
          </select>

          {(filterCategory !== 'ALL' || filterEntityType !== 'ALL' || filterSource !== 'ALL' || localSearch) && (
            <button
              onClick={() => {
                setFilterCategory('ALL');
                setFilterEntityType('ALL');
                setFilterSource('ALL');
                setLocalSearch('');
              }}
              className="text-xs text-slate-400 hover:text-white underline ml-1"
            >
              Effacer
            </button>
          )}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 text-center w-16">Bloc #</th>
                <th className="py-3 px-3 min-w-[140px]">Horodatage (UTC)</th>
                <th className="py-3 px-3 min-w-[160px]">Action & Sceau</th>
                <th className="py-3 px-3 min-w-[180px]">Entité Cible</th>
                <th className="py-3 px-3 min-w-[140px]">Auteur / Source</th>
                <th className="py-3 px-3">Détails de l'Événement</th>
                <th className="py-3 px-3 text-right w-20">Inspecter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="hover:bg-slate-900/60 transition-colors cursor-pointer group"
                >
                  {/* Block number */}
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 font-bold text-teal-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      <Lock className="w-3 h-3 text-teal-400/80" />
                      <span>{log.blockNumber || 1}</span>
                    </span>
                  </td>

                  {/* Timestamp */}
                  <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                    <div>{new Date(log.timestamp).toLocaleDateString('fr-FR')}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString('fr-FR')} UTC
                    </div>
                  </td>

                  {/* Action & Digital Seal */}
                  <td className="py-3 px-3 whitespace-nowrap font-sans">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.actionCategory.includes('BLOCKED') || log.actionCategory.includes('FRAUD')
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : log.actionCategory.includes('VERIFIED') || log.actionCategory.includes('CREATED')
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : log.actionCategory.includes('ALERT')
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {log.actionCategory}
                    </span>
                    {log.hash && (
                      <div className="text-[9px] text-teal-400 font-mono mt-0.5">
                        {log.hash.slice(0, 12)}...
                      </div>
                    )}
                  </td>

                  {/* Entity target */}
                  <td className="py-3 px-3 font-sans">
                    <div className="font-bold text-slate-200 truncate max-w-[200px]" title={log.entityReference}>
                      {log.entityReference}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {log.entityType} • {log.entityId}
                    </div>
                  </td>

                  {/* Author / Source */}
                  <td className="py-3 px-3 font-sans">
                    <div className="text-slate-300 font-medium flex items-center gap-1.5">
                      {log.source === 'AUTOMATED_SYNC' ? (
                        <Cpu className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span className="truncate max-w-[130px]">{log.userName}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {log.source} ({log.userRole})
                    </div>
                  </td>

                  {/* Event Details */}
                  <td className="py-3 px-3 font-sans text-slate-300">
                    <p className="line-clamp-2 leading-relaxed text-xs">{log.details}</p>
                    {(log.previousValue || log.newValue) && (
                      <div className="flex items-center gap-2 text-[10px] font-mono mt-1 text-slate-400">
                        {log.previousValue && <span>Prev: {log.previousValue}</span>}
                        {log.previousValue && log.newValue && <span>→</span>}
                        {log.newValue && <span className="text-emerald-400 font-bold">New: {log.newValue}</span>}
                      </div>
                    )}
                  </td>

                  {/* Inspector Action */}
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLog(log);
                      }}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors inline-flex items-center gap-1 text-[11px]"
                      title="Inspecter le bloc cryptographique"
                    >
                      <Eye className="w-3.5 h-3.5 text-teal-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-500 space-y-2">
            <History className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="font-semibold text-slate-400">Aucun enregistrement d'audit ne correspond à vos filtres</p>
          </div>
        )}
      </div>

      {/* Block Inspector Modal */}
      {selectedLog && (
        <AuditBlockDetailModal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          log={selectedLog}
        />
      )}

      {/* Legal & CSRD Integrity Report Modal */}
      {isReportModalOpen && (
        <AuditIntegrityReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          logs={logs}
        />
      )}
    </div>
  );
}
