import React, { useState } from 'react';
import { ComplianceAlert, AlertStatus, AlertSeverity, AlertType } from '../../types/alert';
import { SeverityBadge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { SupplierReminderModal } from '../alerts/SupplierReminderModal';
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
  Mail,
  Send,
  CheckCircle2,
  Layers,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface AlertsViewProps {
  alerts: ComplianceAlert[];
  searchQuery: string;
}

export function AlertsView({ alerts, searchQuery }: AlertsViewProps) {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedAlert, setSelectedAlert] = useState<ComplianceAlert | null>(null);
  const [actionComment, setActionComment] = useState('');

  // Multi-select for batch actions
  const [selectedAlertIds, setSelectedAlertIds] = useState<string[]>([]);
  const [isBatchResolving, setIsBatchResolving] = useState(false);
  const [batchComment, setBatchComment] = useState('');

  // Reminder modal state
  const [reminderAlert, setReminderAlert] = useState<ComplianceAlert | null>(null);

  const permissions = appStore.getActivePermissions();

  const filteredAlerts = alerts.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = filterSeverity === 'ALL' || a.severity === filterSeverity;
    const matchesStatus = filterStatus === 'ALL' || a.status === filterStatus;
    const matchesType = filterType === 'ALL' || a.type === filterType;

    return matchesSearch && matchesSeverity && matchesStatus && matchesType;
  });

  // KPI counters
  const totalOpen = alerts.filter((a) => a.status === 'OPEN' || a.status === 'IN_PROGRESS').length;
  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length;
  const erpBlockedCount = alerts.filter((a) => a.erpBlockedTriggered && a.status !== 'RESOLVED').length;

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedAlertIds.includes(id)) {
      setSelectedAlertIds(selectedAlertIds.filter((item) => item !== id));
    } else {
      setSelectedAlertIds([...selectedAlertIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedAlertIds.length === filteredAlerts.length) {
      setSelectedAlertIds([]);
    } else {
      setSelectedAlertIds(filteredAlerts.map((a) => a.id));
    }
  };

  const handleExecuteBatchResolve = () => {
    if (selectedAlertIds.length === 0) return;
    appStore.resolveAlertBatch(
      selectedAlertIds,
      batchComment || 'Résolution groupée validée depuis le centre d’alertes'
    );
    setSelectedAlertIds([]);
    setIsBatchResolving(false);
    setBatchComment('');
  };

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Centre d'Alertes de Conformité & Traitement ({filteredAlerts.length})</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Suivi des expirations à 30/60 jours, détection des révocations officielles, relance automatique et blocage ERP
          </p>
        </div>

        <button
          onClick={() => appStore.runContinuousVerificationSync()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
          <span>Vérifier Validité Immédiate</span>
        </button>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/80">
          <span className="text-[11px] text-slate-400 font-medium">Alertes Actives</span>
          <div className="text-xl font-bold text-white font-mono mt-0.5">{totalOpen}</div>
          <span className="text-[10px] text-amber-400">À traiter ou en cours</span>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/80">
          <span className="text-[11px] text-slate-400 font-medium">Alertes Critiques</span>
          <div className="text-xl font-bold text-red-400 font-mono mt-0.5">{criticalCount}</div>
          <span className="text-[10px] text-red-300">Révocations ou expirés</span>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/80">
          <span className="text-[11px] text-slate-400 font-medium">Blocages ERP Actifs</span>
          <div className="text-xl font-bold text-red-500 font-mono mt-0.5">{erpBlockedCount}</div>
          <span className="text-[10px] text-red-400">Commandes gelées SAP/Coupa</span>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/80">
          <span className="text-[11px] text-slate-400 font-medium">Total Archivées</span>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
            {alerts.filter((a) => a.status === 'RESOLVED').length}
          </div>
          <span className="text-[10px] text-emerald-300">Résolues & conformes</span>
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
          className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-teal-500"
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
          className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-teal-500"
        >
          <option value="ALL">Tous les statuts</option>
          <option value="OPEN">Ouvert</option>
          <option value="IN_PROGRESS">En cours</option>
          <option value="RESOLVED">Résolu</option>
          <option value="DISMISSED">Classé sans suite</option>
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-teal-500"
        >
          <option value="ALL">Tous types d'anomalies</option>
          <option value="REVOKED">Révocation Officielle</option>
          <option value="SUSPENDED">Suspension Temporaire</option>
          <option value="EXPIRED">Certificat Expiré</option>
          <option value="EXPIRY_30_DAYS">Échéance &lt; 30 Jours</option>
          <option value="EXPIRY_60_DAYS">Échéance &lt; 60 Jours</option>
          <option value="MISMATCH_OFFICIAL_REGISTRY">Discordance Registre</option>
        </select>

        {(filterSeverity !== 'ALL' || filterStatus !== 'ALL' || filterType !== 'ALL') && (
          <button
            onClick={() => {
              setFilterSeverity('ALL');
              setFilterStatus('ALL');
              setFilterType('ALL');
            }}
            className="text-xs text-slate-400 hover:text-white underline ml-auto"
          >
            Réinitialiser filtres
          </button>
        )}
      </div>

      {/* Batch actions bar if any selected */}
      {selectedAlertIds.length > 0 && (
        <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/40 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="font-bold text-teal-300">
              {selectedAlertIds.length} alerte(s) sélectionnée(s)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBatchResolving(true)}
              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Marquer comme Résolues ({selectedAlertIds.length})</span>
            </button>

            <button
              onClick={() => setSelectedAlertIds([])}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Désélectionner tout
            </button>
          </div>
        </div>
      )}

      {/* Select All Checkbox */}
      {filteredAlerts.length > 0 && (
        <div className="flex items-center justify-between px-2 text-xs text-slate-400">
          <label className="flex items-center gap-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={selectedAlertIds.length > 0 && selectedAlertIds.length === filteredAlerts.length}
              onChange={handleSelectAll}
              className="rounded border-slate-700 bg-slate-900 text-teal-500 focus:ring-teal-500"
            />
            <span>Tout sélectionner ({filteredAlerts.length})</span>
          </label>
        </div>
      )}

      {/* Alert Cards List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 rounded-xl border border-slate-800 bg-slate-900/40">
            Aucune alerte de conformité pour les filtres sélectionnés.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isSelected = selectedAlertIds.includes(alert.id);

            return (
              <div
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md ${
                  isSelected
                    ? 'border-teal-500/60 bg-teal-950/20'
                    : 'border-slate-800 bg-slate-900/80 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onClick={(e) => handleToggleSelect(alert.id, e)}
                    onChange={() => {}}
                    className="mt-1 rounded border-slate-700 bg-slate-950 text-teal-500 focus:ring-teal-500"
                  />

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

                      <span
                        className={`px-2 py-0.2 rounded text-[10px] font-semibold ${
                          alert.status === 'RESOLVED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : alert.status === 'IN_PROGRESS'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
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
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                    {new Date(alert.createdAt).toLocaleDateString('fr-FR')}
                  </span>

                  {/* Relancer Fournisseur Email Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setReminderAlert(alert);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30 transition-colors"
                    title="Envoyer un email de relance automatique"
                  >
                    <Mail className="w-3.5 h-3.5 text-teal-400" />
                    <span>Relancer par Email</span>
                  </button>

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
            );
          })
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

            {/* Quick Action: Relancer Fournisseur */}
            <div className="p-3 rounded-lg bg-teal-950/20 border border-teal-500/20 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">Relance fournisseur recommandée</div>
                <div className="text-[10px] text-slate-400">Envoyer un modèle d'email pré-rempli au contact qualité</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReminderAlert(selectedAlert);
                  setSelectedAlert(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs flex items-center gap-1 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Rédiger Relance</span>
              </button>
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
                className="w-full h-20 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500"
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

      {/* Batch Resolution Modal */}
      {isBatchResolving && (
        <Modal
          isOpen={isBatchResolving}
          onClose={() => setIsBatchResolving(false)}
          title={`Résolution Groupée (${selectedAlertIds.length} Alertes)`}
          subtitle="Validation collective de conformité"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-300">
              Vous allez marquer comme <strong>RÉSOLUES</strong> les {selectedAlertIds.length} alertes sélectionnées.
              Cette action sera enregistrée sous votre nom dans la piste d'audit.
            </p>

            <div>
              <label className="text-slate-300 font-medium block mb-1">
                Motif collectif de résolution :
              </label>
              <textarea
                value={batchComment}
                onChange={(e) => setBatchComment(e.target.value)}
                placeholder="Ex : Revue documentaire collective validée / Attestations d'audit reçues..."
                className="w-full h-20 p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsBatchResolving(false)}
                className="px-3 py-1.5 rounded text-slate-400 hover:text-white"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleExecuteBatchResolve}
                className="px-4 py-1.5 rounded bg-teal-600 hover:bg-teal-500 text-white font-bold"
              >
                Confirmer la Résolution
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Supplier Reminder Email Modal */}
      {reminderAlert && (
        <SupplierReminderModal
          isOpen={!!reminderAlert}
          onClose={() => setReminderAlert(null)}
          alert={reminderAlert}
        />
      )}
    </div>
  );
}
