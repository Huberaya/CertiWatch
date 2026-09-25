import React, { useState } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Camera,
  ShieldCheck,
  WifiOff,
  Wifi,
  Sparkles,
  Lock,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { appStore } from '../../db/store';
import { FacilityType, FieldAuditReport } from '../../types/compliance';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

interface FieldAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function FieldAuditModal({ isOpen, onClose, onSaved }: FieldAuditModalProps) {
  const isOnline = useOnlineStatus();
  const suppliers = appStore.getTenantSuppliers();
  const activeUser = appStore.getActiveUser();

  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [auditorName, setAuditorName] = useState(activeUser?.name || 'Auditeur Qualité Terrain');
  const [auditDate, setAuditDate] = useState(new Date().toISOString().split('T')[0]);
  const [locationGps, setLocationGps] = useState('-8.18721, -76.51442 (Pérou)');
  const [facilityType, setFacilityType] = useState<FacilityType>('FARM_COOPERATIVE');
  const [childLaborFree, setChildLaborFree] = useState(true);
  const [safeConditions, setSafeConditions] = useState(true);
  const [fairWage, setFairWage] = useState(true);
  const [environmentalScore, setEnvironmentalScore] = useState(92);
  const [photosCount, setPhotosCount] = useState(4);
  const [notes, setNotes] = useState(
    'Contrôle complet des registres de présence, entretiens confidentiels avec le personnel et inspection visuelle des équipements de protection individuelle (EPI). Conforme aux conventions fondamentales de l’OIT.'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successReport, setSuccessReport] = useState<FieldAuditReport | null>(null);

  const targetSupplier = suppliers.find((s) => s.id === supplierId) || suppliers[0];

  const handleDetectGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationGps(
            `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)} (Précision ±${Math.round(pos.coords.accuracy)}m)`
          );
        },
        () => {
          setLocationGps('48.85661, 2.35222 (Paris, France - Position Réseau)');
        }
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const syncStatus = isOnline ? 'SYNCED_CLOUD' : 'LOCAL_OFFLINE';

      const report = appStore.addFieldAudit({
        supplierId,
        supplierName: targetSupplier?.legalName || 'Fournisseur',
        auditorName,
        auditDate: new Date(auditDate).toISOString(),
        locationGps,
        facilityType,
        standardsAudited: ['SA8000', 'EUDR_DEFORESTATION', 'OIT_138_182'],
        childLaborFreeVerified: childLaborFree,
        safeWorkingConditionsVerified: safeConditions,
        fairWageVerified: fairWage,
        environmentalComplianceScore: Number(environmentalScore),
        evidencePhotosCount: Number(photosCount),
        notes,
        syncStatus,
      });

      setIsSubmitting(false);
      setSuccessReport(report);
      if (onSaved) onSaved();

      setTimeout(() => {
        setSuccessReport(null);
        onClose();
      }, 2500);
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Saisie d’Audit Terrain (PWA Mobile & Déconnecté)"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Connectivity Status Banner */}
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            isOnline
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-emerald-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-amber-400" />
            )}
            <span>
              {isOnline
                ? 'Connexion Réseau Active : Synchronisation Cloud Directe'
                : 'Mode Hors-Ligne (PWA) : Sauvegarde locale dans l’appareil'}
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase font-bold">
            {isOnline ? 'CLOUD CONNECTED' : 'OFFLINE BUFFER'}
          </span>
        </div>

        {/* Success Alert */}
        {successReport && (
          <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Rapport d'audit terrain scellé avec succès ! Sceau SHA-256 : {successReport.cryptoHash.substring(0, 16)}...
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Fournisseur Audité</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.legalName} ({s.country})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Type d'Installation</label>
            <select
              value={facilityType}
              onChange={(e) => setFacilityType(e.target.value as FacilityType)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="FARM_COOPERATIVE">Coopérative Agricole / Plantation</option>
              <option value="FACTORY_MILL">Usine de Transformation / Filature</option>
              <option value="WAREHOUSE">Entrepôt Logistique / Stockage</option>
              <option value="FORESTRY_PLOT">Parcelle Forestière / Concession</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Nom de l'Auditeur</label>
            <input
              type="text"
              value={auditorName}
              onChange={(e) => setAuditorName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Date de l'Audit</label>
            <input
              type="date"
              value={auditDate}
              onChange={(e) => setAuditDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
        </div>

        {/* GPS Coordinates with auto-detect */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">Coordonnées GPS du Site (WGS84)</label>
            <button
              type="button"
              onClick={handleDetectGps}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              <MapPin className="w-3 h-3" />
              Relever GPS actuel
            </button>
          </div>
          <input
            type="text"
            value={locationGps}
            onChange={(e) => setLocationGps(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            required
          />
        </div>

        {/* Checkpoints */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <span className="text-xs font-bold text-white uppercase tracking-wider block">
            Points de Contrôle Fondamentaux RSE & OIT
          </span>

          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={childLaborFree}
                onChange={(e) => setChildLaborFree(e.target.checked)}
                className="rounded border-slate-700 text-emerald-500 focus:ring-0"
              />
              <span>Zéro travail des enfants vérifié sur place (Conventions OIT 138 & 182)</span>
            </label>

            <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={safeConditions}
                onChange={(e) => setSafeConditions(e.target.checked)}
                className="rounded border-slate-700 text-emerald-500 focus:ring-0"
              />
              <span>Santé et sécurité au travail : EPI portés et issues de secours dégagées</span>
            </label>

            <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={fairWage}
                onChange={(e) => setFairWage(e.target.checked)}
                className="rounded border-slate-700 text-emerald-500 focus:ring-0"
              />
              <span>Respect du salaire décent et paiement des heures supplémentaires</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Score Environnemental Observé (/100)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={environmentalScore}
              onChange={(e) => setEnvironmentalScore(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              Photos & Pièces Jointes Terrain
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={20}
                value={photosCount}
                onChange={(e) => setPhotosCount(Number(e.target.value))}
                className="w-20 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <span className="text-xs text-slate-400">clichés géoréférencés enregistrés</span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Observations & Conclusions de l'Auditeur</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <ClipboardCheck className="w-4 h-4" />
            {isSubmitting ? 'Scellement Cryptographique...' : "Valider l'Audit Terrain"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
