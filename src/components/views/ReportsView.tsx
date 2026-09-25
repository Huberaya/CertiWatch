import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  Trees,
  Award,
  Download,
  Printer,
  Plus,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  MapPin,
  Globe2,
  Lock,
  Layers,
  Sparkles,
  Info,
  Calendar,
  FileCheck,
  ChevronRight,
} from 'lucide-react';
import { appStore } from '../../db/store';
import { RegulatoryReportModal } from '../reports/RegulatoryReportModal';
import { EudrPlotModal } from '../reports/EudrPlotModal';
import { SupplierPortalModal } from '../portal/SupplierPortalModal';
import { GeneratedAuditPack, EudrPlotDeclaration, EudrCommodityType } from '../../types/report';

export function ReportsView() {
  const [activeTab, setActiveTab] = useState<'csrd' | 'eudr' | 'audit_packs'>('csrd');
  const [searchQuery, setSearchQuery] = useState('');
  const [commodityFilter, setCommodityFilter] = useState<string>('ALL');

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedAuditPack, setSelectedAuditPack] = useState<GeneratedAuditPack | null>(null);

  const [isPlotModalOpen, setIsPlotModalOpen] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState<EudrPlotDeclaration | null>(null);

  const [isPortalModalOpen, setIsPortalModalOpen] = useState(false);
  const [portalSupplierId, setPortalSupplierId] = useState<string | null>(null);

  const activeTenant = appStore.getActiveTenant();
  const suppliers = appStore.getTenantSuppliers();
  const certificates = appStore.getTenantCertificates();
  const eudrPlots = appStore.getTenantEudrPlots();
  const auditPacks = appStore.getTenantAuditPacks();
  const csrdScorecard = appStore.calculateCsrdEsrsScorecard();

  // EUDR summary stats
  const totalPlots = eudrPlots.length;
  const gpsVerifiedPlots = eudrPlots.filter((p) => p.hasGpsCoordinates).length;
  const compliantPlots = eudrPlots.filter((p) => p.status === 'COMPLIANT').length;
  const highRiskPlots = eudrPlots.filter((p) => p.riskAssessment === 'HIGH').length;
  const gpsRate = totalPlots > 0 ? Math.round((gpsVerifiedPlots / totalPlots) * 100) : 100;
  const eudrRate = totalPlots > 0 ? Math.round((compliantPlots / totalPlots) * 100) : 100;

  // Filtered plots
  const filteredPlots = eudrPlots.filter((plot) => {
    const supplier = suppliers.find((s) => s.id === plot.supplierId);
    const matchesSearch =
      plot.plotReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plot.countryOfProduction.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier?.legalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plot.commodity.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCommodity = commodityFilter === 'ALL' || plot.commodity === commodityFilter;

    return matchesSearch && matchesCommodity;
  });

  const commodityIcons: Record<EudrCommodityType, string> = {
    WOOD_TIMBER: '🪵',
    PAPER_PACKAGING: '📦',
    COCOA: '🍫',
    COFFEE: '☕',
    RUBBER: '🚗',
    SOY: '🌱',
    PALM_OIL: '🌴',
  };

  const handleOpenPackDetail = (pack: GeneratedAuditPack) => {
    setSelectedAuditPack(pack);
    setIsReportModalOpen(true);
  };

  const handleCreateNewPack = () => {
    setSelectedAuditPack(null);
    setIsReportModalOpen(true);
  };

  const handleCreateNewPlot = () => {
    setSelectedPlot(null);
    setIsPlotModalOpen(true);
  };

  const handleEditPlot = (plot: EudrPlotDeclaration) => {
    setSelectedPlot(plot);
    setIsPlotModalOpen(true);
  };

  const handleDeletePlot = (plotId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette déclaration de parcelle EUDR ?')) {
      appStore.deleteEudrPlot(plotId);
    }
  };

  const handleOpenPortalForSupplier = (sId: string) => {
    setPortalSupplierId(sId);
    setIsPortalModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white tracking-tight">
              Rapports Réglementaires CSRD & Conformité EUDR
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              CHANTIER 7
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pilotage des obligations extra-financières (CSRD ESRS), Due Diligence Zéro Déforestation (EUDR 2023/1115) et génération des packs d'audit opposables aux CAC.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleOpenPortalForSupplier(suppliers[0]?.id || '')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-700"
          >
            <ExternalLink className="w-4 h-4 text-emerald-400" />
            Portail Extranet Fournisseur
          </button>

          <button
            type="button"
            onClick={handleCreateNewPlot}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-700"
          >
            <Trees className="w-4 h-4 text-emerald-400" />
            Déclarer une Parcelle EUDR
          </button>

          <button
            type="button"
            onClick={handleCreateNewPack}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/10"
          >
            <FileCheck className="w-4 h-4" />
            Générer Pack d'Audit CAC
          </button>
        </div>
      </div>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1 : CSRD Overall */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Score Alignement CSRD</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {csrdScorecard.overallEsgAlignmentScore}%
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
            <span>Conforme Directive 2022/2464</span>
          </div>
        </div>

        {/* KPI 2 : ESRS E4 Biodiversity */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>ESRS E4 (Biodiversité / Forêts)</span>
            <Trees className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 tracking-tight">
            {csrdScorecard.esrsE4BiodiversityCoverage}%
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            FSC, PEFC & Certifications Bio
          </div>
        </div>

        {/* KPI 3 : EUDR Zero Deforestation */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Conformité EUDR (Parcelles)</span>
            <MapPin className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-black text-white tracking-tight">{eudrRate}%</div>
          <div className="mt-2 text-[11px] text-emerald-400">
            {gpsRate}% polygones GPS certifiés
          </div>
        </div>

        {/* KPI 4 : Audit Packs */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Packs d'Audit Opposables</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white tracking-tight">{auditPacks.length}</div>
          <div className="mt-2 text-[11px] text-slate-400">
            Sceau SHA-256 certifié pour CAC
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('csrd')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'csrd'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          1. Tableau de Bord CSRD (ESRS E4, S2, G1)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('eudr')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'eudr'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Trees className="w-4 h-4" />
          2. Règlement Déforestation UE (EUDR 2023/1115) ({totalPlots})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit_packs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'audit_packs'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          3. Packs d'Audit Officiels & Preuves Légales ({auditPacks.length})
        </button>
      </div>

      {/* Tab 1 : CSRD */}
      {activeTab === 'csrd' && (
        <div className="space-y-6">
          {/* ESRS Pillars Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* ESRS E4 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ESRS E4
                </span>
                <span className="text-xs text-slate-400">Environnement</span>
              </div>
              <h4 className="text-base font-bold text-white">Biodiversité & Écosystèmes</h4>
              <p className="text-xs text-slate-400">
                Couverture des achats en matières certifiées durables (FSC, PEFC, Bio Ecocert).
              </p>
              <div className="pt-2">
                <div className="flex justify-between text-xs mb-1.5 font-bold">
                  <span className="text-slate-300">Taux de conformité</span>
                  <span className="text-emerald-400">{csrdScorecard.esrsE4BiodiversityCoverage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${csrdScorecard.esrsE4BiodiversityCoverage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* ESRS S2 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  ESRS S2
                </span>
                <span className="text-xs text-slate-400">Social</span>
              </div>
              <h4 className="text-base font-bold text-white">Travailleurs de la Chaîne de Valeur</h4>
              <p className="text-xs text-slate-400">
                Audits sociaux, rémunération équitable, conventions OIT (Fairtrade, GOTS, SA8000).
              </p>
              <div className="pt-2">
                <div className="flex justify-between text-xs mb-1.5 font-bold">
                  <span className="text-slate-300">Taux de conformité</span>
                  <span className="text-blue-400">{csrdScorecard.esrsS2SocialAuditedCoverage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${csrdScorecard.esrsS2SocialAuditedCoverage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* ESRS G1 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  ESRS G1
                </span>
                <span className="text-xs text-slate-400">Gouvernance</span>
              </div>
              <h4 className="text-base font-bold text-white">Conduite des Affaires & Devoir de Vigilance</h4>
              <p className="text-xs text-slate-400">
                Blocage automatique ERP des tiers non conformes, prévention anti-corruption ISO 37001.
              </p>
              <div className="pt-2">
                <div className="flex justify-between text-xs mb-1.5 font-bold">
                  <span className="text-slate-300">Taux de conformité</span>
                  <span className="text-purple-400">{csrdScorecard.esrsG1ConductCoverage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-purple-500 transition-all duration-500"
                    style={{ width: `${csrdScorecard.esrsG1ConductCoverage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Supplier Regulatory Exposure Table */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Matrice d'Exposition Réglementaire des Fournisseurs aux Audits CAC
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Évaluation continue du panel pour le rapport extra-financier de l'entité {activeTenant.name}.
                </p>
              </div>

              <span className="text-xs text-slate-400 font-mono">
                {suppliers.length} fournisseurs dans le périmètre d'audit
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Fournisseur</th>
                    <th className="p-3">Pays / Origine</th>
                    <th className="p-3">Catégories d'Achats</th>
                    <th className="p-3">Statut ERP & Bloquage</th>
                    <th className="p-3">Alignement CSRD</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
                  {suppliers.map((s) => {
                    const sCerts = certificates.filter((c) => c.supplierId === s.id);
                    const hasValidCerts = sCerts.some((c) => c.status === 'VALID');
                    const isBlocked = s.erpConfig?.blockStatus === 'BLOCKED';

                    return (
                      <tr key={s.id} className="hover:bg-slate-800/40">
                        <td className="p-3">
                          <div className="font-bold text-white">{s.legalName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">ID: {s.internalId}</div>
                        </td>
                        <td className="p-3">
                          <span className="text-slate-300 font-medium">
                            {s.country} ({s.countryCode})
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {s.productCategories.map((cat, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isBlocked
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {isBlocked ? 'BLOCAGE COMMANDES' : 'AUTORISÉ ERP'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              hasValidCerts && !isBlocked
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {hasValidCerts && !isBlocked ? 'CONFORME ESRS' : 'ACTION REQUISE'}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => handleOpenPortalForSupplier(s.id)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3 text-emerald-400" />
                            Extranet
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2 : EUDR */}
      {activeTab === 'eudr' && (
        <div className="space-y-6">
          {/* EUDR Info Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-950/40 via-slate-900 to-slate-900 border border-teal-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 shrink-0">
                <Trees className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  Règlement Européen Zéro Déforestation (EUDR 2023/1115)
                </h4>
                <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                  Obligation de diligence raisonnée sur 7 commodités stratégiques. Toute livraison en UE
                  exige la géolocalisation exacte des parcelles (polygones WGS84) et la preuve d'absence de
                  déforestation après le 31 décembre 2020.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreateNewPlot}
              className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center gap-2 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              Ajouter une Parcelle
            </button>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par référence, pays ou fournisseur..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Commodité :</span>
              <select
                value={commodityFilter}
                onChange={(e) => setCommodityFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              >
                <option value="ALL">Toutes les commodités</option>
                <option value="COCOA">Cacao</option>
                <option value="WOOD_TIMBER">Bois & Forêts</option>
                <option value="PAPER_PACKAGING">Papier / Carton</option>
                <option value="SOY">Soja</option>
                <option value="COFFEE">Café</option>
                <option value="RUBBER">Caoutchouc</option>
                <option value="PALM_OIL">Huile de Palme</option>
              </select>
            </div>
          </div>

          {/* Plots Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3.5">Matière / Commodité</th>
                  <th className="p-3.5">Fournisseur & Origine</th>
                  <th className="p-3.5">Réf. Parcelle / Concession</th>
                  <th className="p-3.5">Géolocalisation GPS</th>
                  <th className="p-3.5">Post-2020 Zéro Déforestation</th>
                  <th className="p-3.5">TRACES-NT DDS</th>
                  <th className="p-3.5">Statut EUDR</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredPlots.map((plot) => {
                  const supplier = suppliers.find((s) => s.id === plot.supplierId);
                  const isCompliant = plot.status === 'COMPLIANT';
                  const isBlocked = plot.status === 'NON_COMPLIANT_BLOCKED';

                  return (
                    <tr key={plot.id} className="hover:bg-slate-800/40">
                      <td className="p-3.5 font-bold text-white">
                        <span className="mr-1.5">{commodityIcons[plot.commodity] || '🌱'}</span>
                        {plot.commodity}
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-200">
                          {supplier?.legalName || 'Fournisseur Inconnu'}
                        </div>
                        <div className="text-[11px] text-slate-400">{plot.countryOfProduction}</div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-300 font-medium">
                        {plot.plotReference}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <MapPin
                            className={`w-3.5 h-3.5 shrink-0 ${
                              plot.hasGpsCoordinates ? 'text-teal-400' : 'text-rose-400'
                            }`}
                          />
                          <span
                            className={`text-[11px] truncate max-w-[170px] ${
                              plot.hasGpsCoordinates ? 'text-slate-300' : 'text-rose-400 font-semibold'
                            }`}
                          >
                            {plot.gpsPolygonOrPoint}
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        {plot.deforestationCutoffDateMet ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" />
                            Validé Satellite
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 w-fit">
                            <XCircle className="w-3 h-3" />
                            Alerte Déforestation
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-400">
                        {plot.tracesNtDdsReference || (
                          <span className="text-slate-500 italic">En attente</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isCompliant
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : isBlocked
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {isCompliant
                            ? 'CONFORME EUDR'
                            : isBlocked
                            ? 'BLOQUÉ DÉFORESTATION'
                            : 'DONNÉES MANQUANTES'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEditPlot(plot)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors"
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePlot(plot.id)}
                            className="px-2 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-[11px] font-medium transition-colors"
                          >
                            Suppr.
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredPlots.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                      Aucune parcelle trouvée pour cette recherche.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3 : Audit Packs */}
      {activeTab === 'audit_packs' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Registre des Packs d'Audit Scellés Cryptographiquement (SHA-256)
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Chaque rapport consolide l'ensemble des données d'achats, certificats et audits fournisseurs pour remise aux commissaires aux comptes.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCreateNewPack}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/10 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Nouveau Pack d'Audit Officiel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {auditPacks.map((pack) => (
              <div
                key={pack.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors shadow-xl"
              >
                <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {pack.referenceNumber}
                    </span>
                    <h4 className="text-base font-bold text-white mt-1.5">{pack.config.reportTitle}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Exercice : <strong className="text-slate-200">{pack.config.fiscalYear}</strong> • Destinataire : {pack.config.auditBody}
                    </p>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                    SCELLÉ SHA-256
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-center">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Conformité</span>
                    <span className="text-base font-black text-emerald-400">
                      {pack.executiveSummary.overallComplianceRate}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Fournisseurs</span>
                    <span className="text-base font-black text-white">
                      {pack.executiveSummary.totalSuppliersAudited}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Bloc Audit</span>
                    <span className="text-base font-black text-slate-300">
                      #{pack.cryptoSeal.blockNumber}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 font-mono text-[10px] text-slate-500 truncate">
                  <span>Empreinte SHA-256 : </span>
                  <span className="text-emerald-400/80">{pack.cryptoSeal.sealHash}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Par {pack.config.leadAuditor}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleOpenPackDetail(pack)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Consulter & Imprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <RegulatoryReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        pack={selectedAuditPack}
        onPackCreated={(pack) => {
          setSelectedAuditPack(pack);
        }}
      />

      <EudrPlotModal
        isOpen={isPlotModalOpen}
        onClose={() => setIsPlotModalOpen(false)}
        plot={selectedPlot}
      />

      <SupplierPortalModal
        isOpen={isPortalModalOpen}
        onClose={() => setIsPortalModalOpen(false)}
        supplierId={portalSupplierId}
      />
    </div>
  );
}
