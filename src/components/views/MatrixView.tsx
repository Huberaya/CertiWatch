import React, { useState } from 'react';
import { ComplianceMatrixRule } from '../../types/matrix';
import { CertificationStandard } from '../../types/certificate';
import {
  Grid3X3,
  Plus,
  ShieldCheck,
  AlertCircle,
  Ban,
  Check,
  Sliders,
  Play,
  FileSpreadsheet,
  Layers,
  Search,
  Filter,
  Globe,
  Trash2,
  Edit,
  DollarSign,
  AlertTriangle,
  Table,
} from 'lucide-react';
import { MatrixRuleModal } from '../matrix/MatrixRuleModal';
import { OrderSimulatorModal } from '../matrix/OrderSimulatorModal';
import { SupplierMatrixHeatmap } from '../matrix/SupplierMatrixHeatmap';
import { appStore } from '../../db/store';

interface MatrixViewProps {
  rules: ComplianceMatrixRule[];
}

export function MatrixView({ rules }: MatrixViewProps) {
  const [activeTab, setActiveTab] = useState<'RULES' | 'SIMULATOR' | 'HEATMAP'>('RULES');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCriticality, setFilterCriticality] = useState<string>('ALL');
  const [filterStandard, setFilterStandard] = useState<string>('ALL');

  // Modals state
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [ruleToEdit, setRuleToEdit] = useState<ComplianceMatrixRule | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  const permissions = appStore.getActivePermissions();
  const suppliers = appStore.getTenantSuppliers();
  const certificates = appStore.getTenantCertificates();
  const summaries = appStore.getSupplierMatrixComplianceSummaries();

  // KPIs
  const totalRules = rules.length;
  const strictBlockRules = rules.filter((r) => r.criticality === 'STRICT_BLOCK').length;
  const conditionalRules = rules.filter((r) => r.criticality === 'CONDITIONAL').length;
  const fullyCompliantSuppliers = summaries.filter((s) => s.status === 'FULLY_COMPLIANT').length;
  const complianceRate = suppliers.length > 0 ? Math.round((fullyCompliantSuppliers / suppliers.length) * 100) : 100;

  // Filter rules
  const filteredRules = rules.filter((rule) => {
    const matchesSearch =
      rule.productCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.requiredStandards.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCrit = filterCriticality === 'ALL' || rule.criticality === filterCriticality;
    const matchesStd =
      filterStandard === 'ALL' ||
      rule.requiredStandards.includes(filterStandard as CertificationStandard) ||
      rule.acceptableAlternativeStandards.includes(filterStandard as CertificationStandard);

    return matchesSearch && matchesCrit && matchesStd;
  });

  const handleExportCSV = () => {
    const csv = appStore.exportMatrixRulesCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `matrice_conformite_certiwatch_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteRule = (id: string, name: string) => {
    if (confirm(`Confirmez-vous la suppression de la règle de conformité pour "${name}" ?`)) {
      appStore.deleteMatrixRule(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-teal-400" />
            <span>Matrice de Conformité Achats & Moteur de Décision ERP</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Règles d'exigences par famille de produits, alternatives tolérées, blocage automatique des bons de commande
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
            onClick={() => setIsSimulatorOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-semibold shadow-md shadow-teal-900/30 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Simulateur Commande ERP</span>
          </button>

          {permissions.canEditMatrix && (
            <button
              onClick={() => {
                setRuleToEdit(null);
                setIsRuleModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle Règle</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow-sm">
          <span className="text-slate-400 text-xs font-medium">Règles Définies</span>
          <div className="text-2xl font-bold text-white mt-1 font-mono">{totalRules}</div>
          <span className="text-[11px] text-teal-400 mt-1 block">Familles d’achats encadrées</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow-sm">
          <span className="text-slate-400 text-xs font-medium">Blocage Strict ERP</span>
          <div className="text-2xl font-bold text-red-400 mt-1 font-mono">{strictBlockRules}</div>
          <span className="text-[11px] text-red-300/80 mt-1 block">Rejet automatique de PO</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow-sm">
          <span className="text-slate-400 text-xs font-medium">Validation Dérogatoire</span>
          <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">{conditionalRules}</div>
          <span className="text-[11px] text-amber-300/80 mt-1 block">Contrôle qualité requis</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow-sm">
          <span className="text-slate-400 text-xs font-medium">Taux Conformité Global</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{complianceRate}%</div>
          <span className="text-[11px] text-emerald-300/80 mt-1 block">
            {fullyCompliantSuppliers} / {suppliers.length} fournisseurs conformes
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('RULES')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'RULES'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Matrice des Exigences Produit ({filteredRules.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('HEATMAP')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'HEATMAP'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>Heatmap & Couverture Fournisseurs</span>
        </button>

        <button
          onClick={() => setIsSimulatorOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900 transition-all ml-auto"
        >
          <Play className="w-3.5 h-3.5 text-teal-400 fill-teal-400" />
          <span>Lancer Simulateur ERP</span>
        </button>
      </div>

      {/* Tab 1: Rules List */}
      {activeTab === 'RULES' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par famille produit, standard ou mot-clé..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>Criticité :</span>
              </div>
              <select
                value={filterCriticality}
                onChange={(e) => setFilterCriticality(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-teal-500"
              >
                <option value="ALL">Toutes criticités</option>
                <option value="STRICT_BLOCK">Blocage Strict (ERP)</option>
                <option value="CONDITIONAL">Conditionnel (Dérogation)</option>
                <option value="WARNING_ONLY">Avertissement Simple</option>
              </select>

              <select
                value={filterStandard}
                onChange={(e) => setFilterStandard(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-teal-500"
              >
                <option value="ALL">Tous standards</option>
                <option value="ECOCERT_BIO">Ecocert Bio</option>
                <option value="GOTS">GOTS</option>
                <option value="FSC">FSC</option>
                <option value="OEKO_TEX_100">OEKO-TEX 100</option>
                <option value="FAIRTRADE">Fairtrade</option>
              </select>
            </div>
          </div>

          {/* Rules Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRules.map((rule) => (
              <div
                key={rule.id}
                className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg relative group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                        Famille d'Achat
                      </span>
                      <h3 className="text-sm font-bold text-white mt-0.5">{rule.productCategory}</h3>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${
                        rule.criticality === 'STRICT_BLOCK'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : rule.criticality === 'CONDITIONAL'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {rule.criticality === 'STRICT_BLOCK'
                        ? 'BLOCAGE STRICT'
                        : rule.criticality === 'CONDITIONAL'
                        ? 'DÉROGATION QUALITÉ'
                        : 'AVERTISSEMENT'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {/* Required Standards */}
                    <div>
                      <span className="text-slate-500 text-[11px] block">Standard(s) Obligatoire(s) :</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {rule.requiredStandards.map((std, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold border border-emerald-500/20 text-[11px]"
                          >
                            {std}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Alternatives */}
                    {rule.acceptableAlternativeStandards.length > 0 && (
                      <div>
                        <span className="text-slate-500 text-[11px] block">Alternative(s) Autorisée(s) :</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {rule.acceptableAlternativeStandards.map((alt, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700 text-[11px]"
                            >
                              {alt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Conditions */}
                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span>
                          Périmètre géographique :{' '}
                          <strong className="text-slate-200">
                            {rule.countryCondition === 'ALL_COUNTRIES'
                              ? 'Tous pays'
                              : rule.countryCondition === 'NON_EU_ONLY'
                              ? 'Hors Union Européenne'
                              : `Pays cibles : ${(rule.applicableCountries || []).join(', ')}`}
                          </strong>
                        </span>
                      </div>

                      {rule.volumeThreshold?.enabled && (
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span>
                            Seuil d'exigence :{' '}
                            <strong className="text-slate-200 font-mono">
                              &gt; {rule.volumeThreshold.minAnnualSpendEur.toLocaleString()} € / an
                            </strong>
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>
                          Audit du site usine :{' '}
                          <strong className="text-slate-200">
                            {rule.enforceFacilityAudit ? 'Exigé dans certificat' : 'Non requis'}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {rule.notes && (
                      <p className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 mt-2">
                        {rule.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card footer actions */}
                <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-800/80 text-[10px] text-slate-500">
                  <span>Modifié le {new Date(rule.updatedAt).toLocaleDateString('fr-FR')}</span>

                  {permissions.canEditMatrix && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setRuleToEdit(rule);
                          setIsRuleModalOpen(true);
                        }}
                        className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        title="Modifier la règle"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id, rule.productCategory)}
                        className="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                        title="Supprimer la règle"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredRules.length === 0 && (
            <div className="p-8 rounded-xl border border-slate-800 bg-slate-900/40 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">Aucune règle de conformité correspondante</p>
              <p className="text-xs text-slate-500">
                Ajustez vos filtres de recherche ou créez une nouvelle exigence par catégorie.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Supplier Matrix Heatmap */}
      {activeTab === 'HEATMAP' && (
        <SupplierMatrixHeatmap
          suppliers={suppliers}
          rules={rules}
          certificates={certificates}
          summaries={summaries}
        />
      )}

      {/* Rule Add/Edit Modal */}
      {isRuleModalOpen && (
        <MatrixRuleModal
          isOpen={isRuleModalOpen}
          onClose={() => {
            setIsRuleModalOpen(false);
            setRuleToEdit(null);
          }}
          ruleToEdit={ruleToEdit}
        />
      )}

      {/* Order Simulator Modal */}
      {isSimulatorOpen && (
        <OrderSimulatorModal
          isOpen={isSimulatorOpen}
          onClose={() => setIsSimulatorOpen(false)}
          suppliers={suppliers}
          rules={rules}
        />
      )}
    </div>
  );
}
