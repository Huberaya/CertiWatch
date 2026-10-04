import React, { useState, useEffect } from 'react';
import {
  History,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Ban,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { erpConnectorService } from '../../services/erpConnectorService';
import { ErpSyncLog, ErpSystemType } from '../../types/erpConnectors';

export function ErpSyncLogsPanel() {
  const [logs, setLogs] = useState<ErpSyncLog[]>(erpConnectorService.getSyncLogs());
  const [systemFilter, setSystemFilter] = useState<'ALL' | ErpSystemType>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/erp/sync-logs');
      const data = await res.json();
      if (data?.logs) {
        setLogs(data.logs);
      } else {
        setLogs(erpConnectorService.getSyncLogs());
      }
    } catch {
      setLogs(erpConnectorService.getSyncLogs());
    } finally {
      setTimeout(() => setIsRefreshing(false), 300);
    }
  };

  const filteredLogs = logs.filter((l) => systemFilter === 'ALL' || l.erpSystem === systemFilter);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            Journal des Flux Bidirectionnels ERP (Audit Trail)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Historique complet des requêtes entrantes/sortantes échangées avec SAP S/4HANA, Coupa et Celonis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter */}
          <select
            value={systemFilter}
            onChange={(e) => setSystemFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">Tous les systèmes ERP</option>
            <option value="SAP_S4HANA">SAP S/4HANA</option>
            <option value="COUPA">Coupa Procurement</option>
            <option value="CELONIS_EMS">Celonis EMS</option>
          </select>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase text-[10px]">
            <tr>
              <th className="py-2.5 px-3">Date &amp; Heure</th>
              <th className="py-2.5 px-3">Système ERP</th>
              <th className="py-2.5 px-3">Sens</th>
              <th className="py-2.5 px-3">Opération</th>
              <th className="py-2.5 px-3">Réf. Document</th>
              <th className="py-2.5 px-3">Statut</th>
              <th className="py-2.5 px-3">Détails</th>
              <th className="py-2.5 px-3">Latence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 font-mono">
            {filteredLogs.map((log) => {
              const statusBadge =
                log.status === 'SUCCESS'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : log.status === 'BLOCKED'
                  ? 'bg-red-500/10 text-red-400 border-red-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20';

              const systemColor =
                log.erpSystem === 'SAP_S4HANA'
                  ? 'text-blue-400'
                  : log.erpSystem === 'COUPA'
                  ? 'text-orange-400'
                  : 'text-cyan-400';

              return (
                <tr key={log.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className={`py-2.5 px-3 font-bold ${systemColor}`}>{log.erpSystem}</td>
                  <td className="py-2.5 px-3">
                    <span className="flex items-center gap-1 text-[11px] text-slate-300">
                      {log.direction === 'INBOUND' ? (
                        <>
                          <ArrowDownLeft className="w-3.5 h-3.5 text-cyan-400" /> Entrant
                        </>
                      ) : (
                        <>
                          <ArrowUpRight className="w-3.5 h-3.5 text-purple-400" /> Sortant
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-white font-semibold">{log.operation}</td>
                  <td className="py-2.5 px-3 text-cyan-300">{log.documentRef}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadge}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-300 text-[11px] max-w-xs truncate">
                    {log.details}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">{log.durationMs} ms</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
