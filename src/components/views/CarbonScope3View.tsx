import React, { useState, useEffect } from 'react';
import {
  Flame,
  Leaf,
  TrendingDown,
  Globe,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Download,
  Percent,
  Layers,
  Sparkles,
  BarChart3,
  Factory,
  Truck,
  RotateCcw,
  Zap,
  Target,
  FileCheck,
  ShieldCheck,
  ExternalLink,
  Info,
} from 'lucide-react';
import { carbonStore } from '../../db/carbonStore';
import {
  CsrdEsrsE1Metrics,
  SupplierCarbonProfile,
  DecarbonizationLever,
  NetZeroTrajectoryDataPoint,
} from '../../types/carbon';
import { appStore } from '../../db/store';

export function CarbonScope3View() {
  const [metrics, setMetrics] = useState<CsrdEsrsE1Metrics>(carbonStore.getMetrics());
  const [suppliers, setSuppliers] = useState<SupplierCarbonProfile[]>(carbonStore.getSuppliers());
  const [levers, setLevers] = useState<DecarbonizationLever[]>(carbonStore.getLevers());
  const [trajectory, setTrajectory] = useState<NetZeroTrajectoryDataPoint[]>(carbonStore.getTrajectory());
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SUPPLIERS' | 'SIMULATOR' | 'CSRD'>('OVERVIEW');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    return carbonStore.subscribe(() => {
      setMetrics(carbonStore.getMetrics());
      setSuppliers(carbonStore.getSuppliers());
      setLevers(carbonStore.getLevers());
      setTrajectory(carbonStore.getTrajectory());
    });
  }, []);

  const leversSummary = carbonStore.getActiveLeversSummary();
  const activeTenant = appStore.getActiveTenant();

  const handleToggleLever = (id: string, title: string) => {
    carbonStore.toggleLever(id);
    const updated = carbonStore.getLevers().find((l) => l.id === id);
    const status = updated?.activeInSimulation ? 'activé' : 'désactivé';
    setNotification(`Levier "${title}" ${status} dans la trajectoire de simulation.`);
    setTimeout(() => setNotification(null), 3500);
  };

  const filteredSuppliers = suppliers.filter((s) => {
    if (filterPriority === 'ALL') return true;
    return s.priorityForEngagement === filterPriority;
  });

  return (
    <div className="space-y-6 text-slate-200">
      {/* Hero Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/50 border border-emerald-500/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Leaf className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Chantier 14 : Empreinte Carbone Scope 3 &amp; Trajectoire Net-Zero
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                CSRD ESRS E1 &bull; GHG Protocol
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                SBTi 1.5°C Validé
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Comptabilisation des émissions de la chaîne de valeur amont pour <strong>{activeTenant.name}</strong>, ratios monétaires et physiques Base Carbone ADEME &bull; Ecoinvent 3.10, et simulateur de trajectoire 2030 / 2050.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/api/carbon/esrs-e1-export?format=html"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Rapport ESRS E1 (HTML / CAC)</span>
          </a>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Emissions */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Émissions Totales GES</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
              -20.6% vs 2020
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">
              {metrics.totalGhgEmissionsTco2e.toLocaleString('fr-FR')}
            </span>
            <span className="text-xs text-slate-400">tCO₂e</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Dont Scopes 1 + 2 : <strong>{metrics.grossScope1Tco2e + metrics.grossScope2MarketBasedTco2e} tCO₂e</strong>
          </p>
        </div>

        {/* Scope 3 Dominance */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Part du Scope 3 Amont</span>
            <Factory className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-400">97.6 %</span>
            <span className="text-xs text-slate-400">
              ({metrics.grossScope3UpstreamTco2e.toLocaleString('fr-FR')} t)
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            72% concentrés sur les achats de matières agricoles &amp; packaging.
          </p>
        </div>

        {/* Carbon Intensity */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Intensité Carbone Économique</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">
              {metrics.ghgIntensityPerTurnoverTco2ePerMillionEur}
            </span>
            <span className="text-xs text-slate-400">tCO₂e / M€ CA</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Trajectoire alignée pour passer sous 45 tCO₂e/M€ à horizon 2030.
          </p>
        </div>

        {/* Internal Carbon Price */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Prix Fantôme du Carbone</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">
              {metrics.internalCarbonPriceEurPerTonne} €
            </span>
            <span className="text-xs text-slate-400">/ tonne CO₂e</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Appliqué dans les arbitrages d'appels d'offres et matrice d'achats.
          </p>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'OVERVIEW'
              ? 'bg-emerald-600 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Ventilation Scope 3 (GHG Protocol)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SUPPLIERS')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'SUPPLIERS'
              ? 'bg-emerald-600 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Factory className="w-4 h-4" />
          <span>Scorecard Fournisseurs Tier 1 ({suppliers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SIMULATOR')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'SIMULATOR'
              ? 'bg-emerald-600 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Simulateur Trajectoire &amp; Leviers 2030</span>
          <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 text-[10px] border border-emerald-500/30">
            {leversSummary.activeCount} actifs
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CSRD')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'CSRD'
              ? 'bg-emerald-600 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Gouvernance ESRS E1 &amp; OTI</span>
        </button>
      </div>

      {/* TAB 1: Scope 3 Breakdown Overview */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Répartition des 15 Catégories du Scope 3 (GHG Protocol Corporate Standard)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Basée sur 78.5% de données primaires déclarées et auditées sur le portail fournisseur CertiWatch.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded bg-slate-800 text-emerald-400 font-mono font-bold">
                  Total Scope 3 : {(metrics.grossScope3UpstreamTco2e + metrics.grossScope3DownstreamTco2e).toLocaleString('fr-FR')} tCO₂e
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Catégorie Scope 3</th>
                    <th className="py-3 px-4 text-right">Émissions (tCO₂e)</th>
                    <th className="py-3 px-4 text-center">Part (%)</th>
                    <th className="py-3 px-4">Qualité Données</th>
                    <th className="py-3 px-4 text-right">Données Primaires</th>
                    <th className="py-3 px-4 text-right">Évolution N-1</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {metrics.scope3Categories.map((cat, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/20 transition">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-white block">{cat.labelFr}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{cat.category}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">
                        {cat.emissionsTco2e.toLocaleString('fr-FR')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 font-bold">
                          <span className="text-emerald-400">{cat.percentageOfScope3} %</span>
                          <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${Math.min(100, cat.percentageOfScope3 * 1.3)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            cat.dataQualityTier === 'TIER_1_PRIMARY'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                              : cat.dataQualityTier === 'TIER_2_HYBRID'
                              ? 'bg-blue-950 text-blue-300 border border-blue-500/30'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {cat.dataQualityTier === 'TIER_1_PRIMARY'
                            ? 'Tier 1 (Primaire)'
                            : cat.dataQualityTier === 'TIER_2_HYBRID'
                            ? 'Tier 2 (Hybride)'
                            : 'Tier 3 (Monétaire ADEME)'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-400 font-bold">
                        {cat.primaryDataPercentage} %
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold">
                        <span
                          className={cat.yoyVariationPercent < 0 ? 'text-emerald-400' : 'text-rose-400'}
                        >
                          {cat.yoyVariationPercent > 0 ? `+${cat.yoyVariationPercent}` : cat.yoyVariationPercent} %
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Suppliers Carbon Scorecard */}
      {activeTab === 'SUPPLIERS' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Scorecard Carbone &amp; Engagement Fournisseurs Tier 1</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Suivi des bilans GES, des engagements SBTi et des intensités d'émissions allouées aux achats.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Priorité d'action :</span>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200"
                >
                  <option value="ALL">Tous les fournisseurs</option>
                  <option value="HIGH_PRIORITY">Priorité Haute</option>
                  <option value="MEDIUM_PRIORITY">Priorité Moyenne</option>
                  <option value="MONITORED">Sous Contrôle</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Fournisseur</th>
                    <th className="py-3 px-4">Pays &bull; Catégorie</th>
                    <th className="py-3 px-4 text-right">Dépenses Annuelles</th>
                    <th className="py-3 px-4 text-right">Émissions Allouées</th>
                    <th className="py-3 px-4 text-right">Intensité (kg/€)</th>
                    <th className="py-3 px-4 text-center">SBTi 1.5°C</th>
                    <th className="py-3 px-4 text-center">Score CDP</th>
                    <th className="py-3 px-4 text-right">Énergie Renouvelable</th>
                    <th className="py-3 px-4">Levier Principal de Décarbonation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredSuppliers.map((s) => (
                    <tr key={s.supplierId} className="hover:bg-slate-800/20 transition">
                      <td className="py-3 px-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span>{s.supplierName}</span>
                          {s.priorityForEngagement === 'HIGH_PRIORITY' && (
                            <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-500/30 text-[9px] font-bold">
                              Priorité Haute
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {s.country} &bull; <span className="text-slate-300">{s.productCategory}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-200">
                        {(s.annualSpendEur / 1000000).toFixed(1)} M€
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">
                        {s.totalAllocatedTco2e.toLocaleString('fr-FR')} t
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        <span
                          className={
                            s.carbonIntensityKgPerEuro > 0.8
                              ? 'text-rose-400'
                              : s.carbonIntensityKgPerEuro > 0.5
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }
                        >
                          {s.carbonIntensityKgPerEuro.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.sbtiStatus === 'TARGET_VALIDATED_1_5C'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                              : s.sbtiStatus === 'COMMITTED_1_5C'
                              ? 'bg-blue-950 text-blue-300 border border-blue-500/30'
                              : s.sbtiStatus === 'COMMITTED_WELL_BELOW_2C'
                              ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {s.sbtiStatus === 'TARGET_VALIDATED_1_5C'
                            ? 'Validé 1.5°C'
                            : s.sbtiStatus === 'COMMITTED_1_5C'
                            ? 'Engagé 1.5°C'
                            : s.sbtiStatus === 'COMMITTED_WELL_BELOW_2C'
                            ? 'Engagé <2°C'
                            : 'Non engagé'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold font-mono">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            s.cdpScore === 'A' || s.cdpScore === 'A_MINUS'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : s.cdpScore === 'B' || s.cdpScore === 'B_MINUS'
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {s.cdpScore === 'NOT_REPORTING' ? 'N/A' : s.cdpScore.replace('_MINUS', '-')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-400">
                        {s.renewableEnergyPercent} %
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-[11px] max-w-xs truncate" title={s.keyDecarbonizationLever}>
                        {s.keyDecarbonizationLever}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Net-Zero Trajectory & Interactive Levers Simulator */}
      {activeTab === 'SIMULATOR' && (
        <div className="space-y-6">
          {/* Active levers summary bar */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-white text-sm">
                  {leversSummary.activeCount} leviers de réduction simulés
                </span>
                <p className="text-slate-400 text-[11px]">
                  Impact cumulé direct sur la projection des émissions Scope 3 horizon 2030.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div>
                <span className="text-slate-400 text-[10px] block">Réduction Simulée</span>
                <span className="text-base font-extrabold text-emerald-400">
                  - {leversSummary.totalReductionTco2e.toLocaleString('fr-FR')} tCO₂e / an
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Investissement Requis</span>
                <span className="text-base font-bold text-white">
                  {(leversSummary.totalCapexEur / 1000).toFixed(0)} k€
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Coût d'Abattement Moyen</span>
                <span className="text-base font-bold text-emerald-300">
                  {leversSummary.avgAbatementCost} € / t
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Levers Selection */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white">
                Catalogue des Leviers d'Atténuation Disponibles (Fournisseurs &amp; Achats)
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Cochez ou décochez les leviers pour recalculer en temps réel l'alignement sur la trajectoire SBTi 1.5°C.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {levers.map((lever) => (
                <div
                  key={lever.id}
                  onClick={() => handleToggleLever(lever.id, lever.title)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    lever.activeInSimulation
                      ? 'bg-slate-950 border-emerald-500/50 shadow-md shadow-emerald-950/20'
                      : 'bg-slate-950/50 border-slate-800 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={lever.activeInSimulation}
                        onChange={() => {}} // handled by div
                        className="mt-1 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                      />
                      <div>
                        <h5 className="font-bold text-white text-xs">{lever.title}</h5>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          {lever.description}
                        </p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shrink-0 font-mono">
                      - {lever.potentialReductionTco2e} t
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
                    <span>
                      Coût d'abattement : <strong className="text-white">{lever.costPerTco2eEur} € / t</strong>
                    </span>
                    <span>
                      Délai : <strong className="text-white">{lever.implementationTimeframeMonths} mois</strong>
                    </span>
                    <span
                      className={`font-semibold ${
                        lever.feasibility === 'HIGH'
                          ? 'text-emerald-400'
                          : lever.feasibility === 'MEDIUM'
                          ? 'text-amber-400'
                          : 'text-indigo-400'
                      }`}
                    >
                      Faisabilité {lever.feasibility === 'HIGH' ? 'Élevée' : lever.feasibility === 'MEDIUM' ? 'Moyenne' : 'Complexe'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Net-Zero Trajectory Milestone Progress */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-400" />
                  <span>Jalons de la Trajectoire Net-Zero 1.5°C SBTi (2020 &rarr; 2050)</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Comparaison entre la trajectoire théorique de l'Accord de Paris et la projection recalculée avec vos leviers actifs.
                </p>
              </div>

              <span className="px-3 py-1 rounded bg-slate-800 text-emerald-400 text-xs font-mono font-bold">
                Cible 2030 : -42% &bull; Net-Zero 2050 : -92%
              </span>
            </div>

            <div className="space-y-3">
              {trajectory.map((point) => {
                const isCurrent = point.year === 2026;
                const isMilestone = point.year === 2030 || point.year === 2050;

                return (
                  <div
                    key={point.year}
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                      isCurrent
                        ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm'
                        : isMilestone
                        ? 'bg-slate-950 border-slate-700'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 w-36 shrink-0">
                      <span className={`font-mono font-bold text-sm ${isCurrent ? 'text-emerald-400' : 'text-white'}`}>
                        {point.year}
                      </span>
                      {isCurrent && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                          Actuel
                        </span>
                      )}
                      {point.year === 2030 && (
                        <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                          Cible 2030
                        </span>
                      )}
                      {point.year === 2050 && (
                        <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                          Net-Zero
                        </span>
                      )}
                    </div>

                    <div className="flex-1 w-full space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">
                          Projection : <strong className="text-white font-mono">{point.projectedEmissionsTco2e.toLocaleString('fr-FR')} tCO₂e</strong>
                        </span>
                        <span className="text-slate-400">
                          Cible 1.5°C : <span className="font-mono text-emerald-400">{point.target1_5cPathTco2e.toLocaleString('fr-FR')} tCO₂e</span>
                        </span>
                        <span className="font-mono font-bold text-emerald-400">
                          - {point.achievedReductionPercent} %
                        </span>
                      </div>

                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCurrent
                              ? 'bg-emerald-400'
                              : isMilestone
                              ? 'bg-blue-400'
                              : 'bg-emerald-600'
                          }`}
                          style={{ width: `${Math.min(100, point.achievedReductionPercent * 1.05)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CSRD ESRS E1 Governance & Verification */}
      {activeTab === 'CSRD' && (
        <div className="space-y-6 text-xs">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <span>Exigences Réglementaires de Divulgation CSRD (Directive UE 2022/2464)</span>
              </h4>
              <p className="text-slate-400 text-xs mt-0.5">
                Dossier de preuves pour le commissaire aux comptes (CAC) et l'organisme tiers indépendant (OTI).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>ESRS E1-6 &bull; Déclaration des Émissions Brutes Scopes 1, 2, 3</span>
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Comptabilisation exhaustive conforme au GHG Protocol Corporate Value Chain (Scope 3) Standard, avec publication séparée des émissions directes et indirectes de la chaîne d'approvisionnement.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>ESRS E1-4 &bull; Cibles Temporelles &amp; Alignement SBTi</span>
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Objectifs scientifiques de réduction à 2030 (-42% en valeur absolue) et neutralité 2050 validés par l'initiative Science Based Targets (SBTi) sans recours à la compensation carbone pour l'atteinte des cibles intermédiaires.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>ESRS E1-8 &bull; Tarification Interne du Carbone</span>
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Application systématique d'un prix fantôme (Shadow Price) de <strong>100 € par tonne de CO₂e</strong> dans les matrices de décision achats pour valoriser les fournisseurs vertueux lors du calcul du coût total d'acquisition (TCO).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>ESRS E1-7 &bull; Crédits Carbone &amp; Séquestration</span>
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  1 200 tCO₂e de crédits carbone certifiés (Gold Standard et Label Bas-Carbone) retirés des registres officiels, strictement cantonnés à la contribution pour le climat hors objectifs de réduction directe de la chaîne de valeur.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
