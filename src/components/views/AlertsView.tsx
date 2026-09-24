import React, { useState } from 'react';
import { ComplianceAlert, AlertStatus, AlertSeverity } from '../../types/alert';
import { SeverityBadge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { appStore } from '../../db/store';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Filter,
  Search,
  MessageSquare,
  Ban,
  ShieldAlert,
} from 'lucide-react';

interface AlertsViewProps {
  alerts: ComplianceAlert[];
  searchQuery: string;
}

export function AlertsView({ alerts, searchQuery }: AlertsViewProps) {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedAlert, setSelectedAlert] = useState<ComplianceAlert | null>(null);
  const [actionComment, setActionComment] = useState('');

  const filteredAlerts = alerts.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = filterSeverity === 'ALL' || a.severity === filterSeverity;
    const matchesStatus = filterStatus === 'ALL' || a.status === filterStatus;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const handleUpdateStatus = (alertId: string, newStatus: AlertStatus) => {
    appStore.updateAlertStatus(
      alertId,
      newStatus,
      actionComment || `Mise à jour du statut vers ${newStatus}`
    );
    setSelectedAlert(null);
    setActionComment('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Centre d'Alertes de Conformité ({filteredAlerts.length})</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Gestion des anomalies, expirations à 30/60 jours, suspensions et blocages de commandes ERP
          </p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-semibold text-slate-400">Filtrer par :</span>
        </div>

        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-emerald-500"
        >
          <option value="ALL">Toutes les sévérités</option>
          <option value="CRITICAL">Critique</option>
          <option value="HIGH">Élevé</option>
          <option value="MEDIUM">Moyen</option>
          <option value="LOW">Information</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-emerald-500"
        >
          <option value="ALL">Tous les statuts</option>
          <option value="OPEN">Ouvert</option>
          <option value="IN_PROGRESS">En cours</option>
          <option value="RESOLVED">Résolu</option>
          <option value="DISMISSED">Classé sans suite</option>
        </select>

        {(filterSeverity !== 'ALL' || filterStatus !== 'ALL') && (
          <button
            onClick={() => {
              setFilterSeverity('ALL');
              setFilterStatus('ALL');
            }}
            className="text-xs text-slate-400 hover:text-white underline ml-auto"
          >
            Réinitialiser filtres
          </button>
        )}
      </div>

      {/* Alert Cards List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 rounded-xl border border-slate-800 bg-slate-900/40">
            Aucune alerte de conformité pour les filtres sélectionnés.
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => setSelectedAlert(alert)}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800/50 hover:border-slate-700 transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityBadge severity={alert.severity} />
                  <span className="text-xs font-bold text-white">{alert.title}</span>
                  {alert.erpBlockedTriggered && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded text-[10px] font-bold bg-red-600/20 text-red-300 border border-red-500/30">
                      <Ban className="w-3 h-3 text-red-400" />
                      Blocage ERP Actif
                    </span>
                  )}
                  <span className="px-2 py-0.2 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                    {alert.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300">{alert.message}</p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                  <span>
                    Fournisseur : <strong className="text-white">{alert.supplierName}</strong>
                  </span>
                  <span>•</span>
                  <span className="font-mono text-slate-400">
                    {alert.certificationStandard} {alert.certificateNumber}
                  </span>
                  {alert.assignedToUser && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <User className="w-3 h-3 text-slate-500" />
                        Assigné à : <strong className="text-slate-200">{alert.assignedToUser}</strong>
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                <span className="text-xs text-slate-500 font-mono">
                  {new Date(alert.createdAt).toLocaleDateString('fr-FR')}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAlert(alert);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                >
                  Traiter
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Process Alert Modal */}
      {selectedAlert && (
        <Modal
          isOpen={!!selectedAlert}
          onClose={() => setSelectedAlert(null)}
          title={`Traitement de l’alerte : ${selectedAlert.title}`}
          subtitle={`Fournisseur : ${selectedAlert.supplierName} • Norme : ${selectedAlert.certificationStandard}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <SeverityBadge severity={selectedAlert.severity} />
                <span className="font-mono text-slate-400">
                  Créée le {new Date(selectedAlert.createdAt).toLocaleString('fr-FR')}
                </span>
              </div>
              <p className="text-slate-200 text-xs">{selectedAlert.message}</p>
            </div>

            {/* Actions History */}
            <div>
              <p className="font-bold text-slate-400 uppercase text-[10px] mb-2">
                Journal d'audit de cette alerte
              </p>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {selectedAlert.history.length === 0 ? (
                  <p className="text-slate-500">Aucun historique d'intervention.</p>
                ) : (
                  selectedAlert.history.map((h) => (
                    <div key={h.id} className="p-2 rounded bg-slate-800/40 border border-slate-800">
                      <div className="flex justify-between text-slate-400 text-[10px]">
                        <span className="font-semibold text-slate-300">{h.performedBy}</span>
                        <span>{new Date(h.createdAt).toLocaleString('fr-FR')}</span>
                      </div>
                      <p className="text-slate-300 mt-1">{h.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Comment form */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <label className="text-slate-300 font-medium block">
                Ajouter une note ou justification :
              </label>
              <textarea
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
                placeholder="Ex : Document de renouvellement transmis au service achats / Non-conformité confirmée avec le certificateur..."
                className="w-full h-20 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => handleUpdateStatus(selectedAlert.id, 'DISMISSED')}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                Classer sans suite
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedAlert.id, 'IN_PROGRESS')}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium"
                >
                  Prendre en charge
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedAlert.id, 'RESOLVED')}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md"
                >
                  Résoudre l'alerte
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
