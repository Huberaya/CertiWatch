import React, { useState } from 'react';
import { AuditLogEntry, AuditActionCategory } from '../../types/audit';
import { History, Filter, Download, UserCheck, Shield, Bot, Search } from 'lucide-react';

interface AuditTrailViewProps {
  logs: AuditLogEntry[];
  searchQuery: string;
}

export function AuditTrailView({ logs, searchQuery }: AuditTrailViewProps) {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.entityReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.actionCategory.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = filterCategory === 'ALL' || l.actionCategory === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `certiwatch_audit_trail_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <span>Journal d’Audit Immuable ({filteredLogs.length} événements)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Historique cryptographiquement horodaté pour audits internes, certificateurs et compliance légale
          </p>
        </div>

        <button
          onClick={handleExportJson}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Exporter le Registre d'Audit (JSON)</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-semibold text-slate-400">Catégorie d'action :</span>
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-emerald-500"
        >
          <option value="ALL">Toutes les actions</option>
          <option value="CERTIFICATE_STATUS_CHANGED">Changement de statut certificat</option>
          <option value="ALERT_RESOLVED">Résolution d'alerte</option>
          <option value="SYSTEM_SYNC">Synchronisation registre officiel</option>
          <option value="SUPPLIER_CREATED">Création de fournisseur</option>
          <option value="ERP_ORDER_BLOCKED">Blocage commande ERP</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Horodatage (UTC)</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entité Cible</th>
                <th className="py-3 px-4">Auteur / Source</th>
                <th className="py-3 px-4">Détails de l'Événement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('fr-FR')}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-200 border border-slate-700">
                      {log.actionCategory}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                    {log.entityReference}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-sans">
                      {log.source === 'AUTOMATED_SYNC' ? (
                        <Bot className="w-3.5 h-3.5 text-cyan-400" />
                      ) : (
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      <span className="text-slate-200">{log.userName}</span>
                      <span className="text-[10px] text-slate-500">({log.userRole})</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-sans text-slate-300">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
