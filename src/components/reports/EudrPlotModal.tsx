import React, { useState } from 'react';
import {
  Trees,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldAlert,
  Globe2,
  FileCheck,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { EudrPlotDeclaration, EudrCommodityType, EudrComplianceStatus } from '../../types/report';
import { appStore } from '../../db/store';

interface EudrPlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  plot?: EudrPlotDeclaration | null;
  onSaved?: () => void;
}

export function EudrPlotModal({ isOpen, onClose, plot, onSaved }: EudrPlotModalProps) {
  const suppliers = appStore.getTenantSuppliers();

  const [supplierId, setSupplierId] = useState(plot?.supplierId || (suppliers[0]?.id ?? ''));
  const [commodity, setCommodity] = useState<EudrCommodityType>(plot?.commodity || 'COCOA');
  const [countryOfProduction, setCountryOfProduction] = useState(
    plot?.countryOfProduction || 'Pérou (San Martín)'
  );
  const [plotReference, setPlotReference] = useState(plot?.plotReference || 'PER-LOT-2026-');
  const [hasGpsCoordinates, setHasGpsCoordinates] = useState(plot?.hasGpsCoordinates ?? true);
  const [gpsPolygonOrPoint, setGpsPolygonOrPoint] = useState(
    plot?.gpsPolygonOrPoint || '-8.18721, -76.51442 (Polygone 12.4 ha)'
  );
  const [deforestationCutoffDateMet, setDeforestationCutoffDateMet] = useState(
    plot?.deforestationCutoffDateMet ?? true
  );
  const [legalityVerified, setLegalityVerified] = useState(plot?.legalityVerified ?? true);
  const [tracesNtDdsReference, setTracesNtDdsReference] = useState(
    plot?.tracesNtDdsReference || 'DDS-EUDR-2026-EU-'
  );
  const [riskAssessment, setRiskAssessment] = useState<'NEGLIGIBLE' | 'STANDARD' | 'HIGH'>(
    plot?.riskAssessment || 'STANDARD'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Determine status automatically based on EUDR rules
    let status: EudrComplianceStatus = 'COMPLIANT';
    if (!deforestationCutoffDateMet) {
      status = 'NON_COMPLIANT_BLOCKED';
    } else if (!hasGpsCoordinates || !legalityVerified) {
      status = 'WARNING_DATA_MISSING';
    }

    if (plot) {
      appStore.updateEudrPlot(plot.id, {
        supplierId,
        commodity,
        countryOfProduction,
        plotReference,
        hasGpsCoordinates,
        gpsPolygonOrPoint,
        deforestationCutoffDateMet,
        legalityVerified,
        tracesNtDdsReference: tracesNtDdsReference.trim() ? tracesNtDdsReference : undefined,
        status,
        riskAssessment,
      });
    } else {
      appStore.addEudrPlot({
        supplierId,
        commodity,
        countryOfProduction,
        plotReference,
        hasGpsCoordinates,
        gpsPolygonOrPoint,
        deforestationCutoffDateMet,
        legalityVerified,
        tracesNtDdsReference: tracesNtDdsReference.trim() ? tracesNtDdsReference : undefined,
        status,
        riskAssessment,
      });
    }

    if (onSaved) onSaved();
    onClose();
  };

  const commodityLabels: Record<EudrCommodityType, { label: string; icon: string }> = {
    WOOD_TIMBER: { label: 'Bois & Grumes (Timber)', icon: '🪵' },
    PAPER_PACKAGING: { label: 'Papier & Carton (Packaging)', icon: '📦' },
    COCOA: { label: 'Cacao & Dérivés', icon: '🍫' },
    COFFEE: { label: 'Café Vert / Torréfié', icon: '☕' },
    RUBBER: { label: 'Caoutchouc Naturel', icon: '🚗' },
    SOY: { label: 'Soja & Farines', icon: '🌱' },
    PALM_OIL: { label: 'Huile de Palme & Fractions', icon: '🌴' },
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={plot ? 'Modifier la Parcelle EUDR' : 'Déclarer une Parcelle EUDR (Zéro Déforestation)'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-slate-300 flex items-start gap-2.5">
          <Trees className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-emerald-300">Règlement Européen (UE) 2023/1115 (EUDR)</span>
            <p className="mt-0.5 text-slate-400">
              Chaque parcelle de production doit fournir des coordonnées GPS précises (polygone pour les parcelles &gt; 4 ha) et garantir l'absence de déforestation après le 31 décembre 2020.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Supplier */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Fournisseur Responsable</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              required
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.legalName} ({s.country})
                </option>
              ))}
            </select>
          </div>

          {/* Commodity */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Matière Première / Commodité</label>
            <select
              value={commodity}
              onChange={(e) => setCommodity(e.target.value as EudrCommodityType)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              {Object.entries(commodityLabels).map(([code, { label, icon }]) => (
                <option key={code} value={code}>
                  {icon} {label}
                </option>
              ))}
            </select>
          </div>

          {/* Country */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Pays / Région de Production</label>
            <input
              type="text"
              value={countryOfProduction}
              onChange={(e) => setCountryOfProduction(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              placeholder="ex: Pérou (San Martín / Tocache)"
              required
            />
          </div>

          {/* Reference */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Référence Parcelle / Concession / Lot
            </label>
            <input
              type="text"
              value={plotReference}
              onChange={(e) => setPlotReference(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
              required
            />
          </div>
        </div>

        {/* GPS Coordinates */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Géolocalisation & Polygone GPS
            </span>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={hasGpsCoordinates}
                onChange={(e) => setHasGpsCoordinates(e.target.checked)}
                className="rounded border-slate-700 text-emerald-500 focus:ring-0"
              />
              <span>Coordonnées GPS complètes & vérifiées</span>
            </label>
          </div>

          <div className="space-y-1">
            <input
              type="text"
              value={gpsPolygonOrPoint}
              onChange={(e) => setGpsPolygonOrPoint(e.target.value)}
              disabled={!hasGpsCoordinates}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-mono disabled:opacity-50"
              placeholder="ex: -8.18721, -76.51442 (Polygone 14.8 ha)"
            />
            <p className="text-[11px] text-slate-500">
              Format requis : Coordonnées WGS84 décimales. Polygone fermé obligatoire pour toute exploitation &gt; 4 hectares.
            </p>
          </div>
        </div>

        {/* Criteria checkboxes */}
        <div className="space-y-2.5">
          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={deforestationCutoffDateMet}
              onChange={(e) => setDeforestationCutoffDateMet(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-0"
            />
            <div className="text-xs">
              <span className="font-semibold text-slate-200">
                Garantie Zéro Déforestation post-31 décembre 2020
              </span>
              <p className="text-slate-400 mt-0.5">
                La parcelle n'a subi aucune déforestation ni dégradation forestière après la date butoir fixée par l'Union Européenne (vérification satellite).
              </p>
            </div>
          </label>

          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={legalityVerified}
              onChange={(e) => setLegalityVerified(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-0"
            />
            <div className="text-xs">
              <span className="font-semibold text-slate-200">
                Conformité Légale du Pays Producteur
              </span>
              <p className="text-slate-400 mt-0.5">
                Droit foncier, respect des droits des communautés autochtones et réglementations environnementales locales validées.
              </p>
            </div>
          </label>
        </div>

        {/* TRACES NT and Risk */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Numéro Déclaration TRACES-NT (DDS)
            </label>
            <input
              type="text"
              value={tracesNtDdsReference}
              onChange={(e) => setTracesNtDdsReference(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
              placeholder="ex: DDS-EUDR-2026-PE-098842"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Niveau de Risque Pays (Benchmark UE)
            </label>
            <select
              value={riskAssessment}
              onChange={(e) =>
                setRiskAssessment(e.target.value as 'NEGLIGIBLE' | 'STANDARD' | 'HIGH')
              }
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="NEGLIGIBLE">Faible Risque (Procédure Simplifiée)</option>
              <option value="STANDARD">Risque Standard (Diligence Complète)</option>
              <option value="HIGH">Haut Risque (Contrôles Renforcés)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm flex items-center gap-1.5 transition-colors"
          >
            <FileCheck className="w-4 h-4" />
            {plot ? 'Enregistrer les modifications' : 'Créer la déclaration EUDR'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
