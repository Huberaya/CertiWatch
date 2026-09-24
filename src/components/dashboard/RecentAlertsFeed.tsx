import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { ComplianceAlert, AlertStatus, AlertSeverity } from '../../types/alert';
import { SeverityBadge } from '../ui/Badge';
import { appStore } from '../../db/store';
import { Modal } from '../ui/Modal';

interface RecentAlertsFeedProps {
  alerts: ComplianceAlert[];
  onSelectAlert?: (alert: ComplianceAlert) => void;
}

export function RecentAlertsFeed({ alerts }: RecentAlertsFeedProps) {
  const [selectedAlert, setSelectedAlert] = useState<ComplianceAlert | null>(null);
  const [actionComment, setActionComment] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

  const handleResolve = (alertId: string, status: AlertStatus) => {
    appStore.updateAlertStatus(
      alertId,
      status,
      actionComment || `Mise à jour directe du statut vers ${status}`
    );
    setSelectedAlert(null);
    setActionComment('');
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Flux des Alertes de Conformité</h3>
              <p className="text-xs text-slate-400">Actions prioritaires requises pour les achats & qualité</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Toutes sévérités</option>
              <option value="CRITICAL">Critique uniquement</option>
              <option value="HIGH">Élevé & Critique</option>
              <option value="MEDIUM">Moyen</option>
            </select>
          </div>
        </div>

        <div className="mt-4 divide-y divide-slate-800/60 max-h-[380px] overflow-y-auto pr-1">
          {filteredAlerts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Aucune alerte active correspondant aux critères.
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className="py-3 flex items-start justify-between gap-3 group hover:bg-slate-800/30 px-2 rounded-lg transition-colors cursor-pointer"
                onClick={() => setSelectedAlert(alert)}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={alert.severity} />
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors">
                      {alert.title}
                    </span>
                    {alert.status === 'RESOLVED' && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                        Traité
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-1">{alert.message}</p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="text-slate-400 font-medium">{alert.supplierName}</span>
                    <span>•</span>
                    <span className="font-mono text-slate-400">{alert.certificateNumber}</span>
                    {alert.assignedToUser && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <User className="w-3 h-3 text-slate-500" />
                          {alert.assignedToUser}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1 pt-1">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(alert.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal for alert action */}
      {selectedAlert && (
        <Modal
          isOpen={!!selectedAlert}
          onClose={() => setSelectedAlert(null)}
          title={selectedAlert.title}
          subtitle={`Fournisseur : ${selectedAlert.supplierName} • Norme : ${selectedAlert.certificationStandard}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <SeverityBadge severity={selectedAlert.severity} />
                <span className="text-xs font-mono text-slate-400">
                  Créée le {new Date(selectedAlert.createdAt).toLocaleString('fr-FR')}
                </span>
              </div>
              <p className="text-xs text-slate-200">{selectedAlert.message}</p>
            </div>

            {/* History */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Historique des Actions
              </h4>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {selectedAlert.history.length === 0 ? (
                  <p className="text-xs text-slate-500">Aucune action enregistrée.</p>
                ) : (
                  selectedAlert.history.map((h) => (
                    <div key={h.id} className="text-xs p-2 rounded bg-slate-800/40 border border-slate-800">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-300">{h.performedBy}</span>
                        <span>{new Date(h.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-300 mt-1">{h.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Action form */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-medium text-slate-300">
                Commentaire d'action / Motif de régularisation :
              </label>
              <textarea
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
                placeholder="Ex : Document de renouvellement reçu de FLOCERT / Commande ERP débloquée après contre-analyse..."
                className="w-full h-20 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => handleResolve(selectedAlert.id, 'IN_PROGRESS')}
                className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors"
              >
                Passer en cours
              </button>
              <button
                onClick={() => handleResolve(selectedAlert.id, 'RESOLVED')}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors"
              >
                Marquer comme Résolu
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
