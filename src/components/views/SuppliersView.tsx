import React, { useState } from 'react';
import {
  Supplier,
  SupplierRiskLevel,
  SupplierStatus,
  SupplierTier,
  SpendCriticality,
} from '../../types/supplier';
import { Certificate } from '../../types/certificate';
import { SupplierStatusBadge, RiskBadge, CertificateStatusBadge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { SupplierDetailModal } from '../suppliers/SupplierDetailModal';
import { SupplierImportModal } from '../suppliers/SupplierImportModal';
import { appStore } from '../../db/store';
import {
  Building2,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Ban,
  FileCheck2,
  Upload,
  Download,
  RotateCw,
  LayoutGrid,
  List,
  CheckSquare,
  Square,
  TrendingUp,
  Tag,
  ShieldAlert,
  Clock,
  Sparkles,
  Send,
  CheckCircle2,
} from 'lucide-react';

interface SuppliersViewProps {
  suppliers: Supplier[];
  certificates: Certificate[];
  searchQuery: string;
  selectedSupplierId?: string | null;
  onClearSelectedSupplier?: () => void;
  onNavigateToUploadCert?: (supplierId: string) => void;
}

export function SuppliersView({
  suppliers,
  certificates,
  searchQuery,
  selectedSupplierId,
  onClearSelectedSupplier,
  onNavigateToUploadCert,
}: SuppliersViewProps) {
  const [activeSupplier, setActiveSupplier] = useState<Supplier | null>(
    selectedSupplierId ? suppliers.find((s) => s.id === selectedSupplierId) || null : null
  );

  // Sync if external selectedSupplierId changes
  React.useEffect(() => {
    if (selectedSupplierId) {
      const found = suppliers.find((s) => s.id === selectedSupplierId);
      if (found) setActiveSupplier(found);
    }
  }, [selectedSupplierId, suppliers]);

  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterTier, setFilterTier] = useState<string>('ALL');
  const [filterCriticality, setFilterCriticality] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'RISK_DESC' | 'RISK_ASC' | 'NAME_ASC' | 'CERTS_DESC'>('RISK_DESC');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);

  // Bulk selection
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<Set<string>>(new Set());
  const [bulkEmailSuccess, setBulkEmailSuccess] = useState<string | null>(null);

  // Form state for new supplier
  const [newLegalName, setNewLegalName] = useState('');
  const [newTradeName, setNewTradeName] = useState('');
  const [newCountry, setNewCountry] = useState('France');
  const [newCountryCode, setNewCountryCode] = useState('FR');
  const [newAddress, setNewAddress] = useState('');
  const [newRegNumber, setNewRegNumber] = useState('');
  const [newInternalId, setNewInternalId] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newCategories, setNewCategories] = useState('Coton, Textile');
  const [newTier, setNewTier] = useState<SupplierTier>('TIER_1');
  const [newCriticality, setNewCriticality] = useState<SpendCriticality>('STRATEGIC');

  const permissions = appStore.getActivePermissions();

  // Top KPI Metrics
  const totalCount = suppliers.length;
  const activeCount = suppliers.filter((s) => s.status === 'ACTIVE').length;
  const blockedCount = suppliers.filter((s) => s.status === 'BLOCKED').length;
  const highRiskCount = suppliers.filter((s) => s.riskLevel === 'CRITICAL' || s.riskLevel === 'HIGH').length;
  const tier1Count = suppliers.filter((s) => !s.tier || s.tier === 'TIER_1').length;

  // Filter & Search logic
  const filteredSuppliers = suppliers
    .filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        s.legalName.toLowerCase().includes(q) ||
        (s.tradeName && s.tradeName.toLowerCase().includes(q)) ||
        s.businessRegistrationNumber.toLowerCase().includes(q) ||
        s.internalId.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        s.productCategories.some((cat) => cat.toLowerCase().includes(q));

      const matchesRisk = filterRisk === 'ALL' || s.riskLevel === filterRisk;
      const matchesStatus = filterStatus === 'ALL' || s.status === filterStatus;
      const matchesTier = filterTier === 'ALL' || (s.tier || 'TIER_1') === filterTier;
      const matchesCriticality = filterCriticality === 'ALL' || (s.spendCriticality || 'STANDARD') === filterCriticality;

      return matchesSearch && matchesRisk && matchesStatus && matchesTier && matchesCriticality;
    })
    .sort((a, b) => {
      const scoreA = a.multiFactorRisk?.overallScore ?? (a.riskLevel === 'CRITICAL' ? 85 : a.riskLevel === 'HIGH' ? 65 : a.riskLevel === 'MEDIUM' ? 40 : 10);
      const scoreB = b.multiFactorRisk?.overallScore ?? (b.riskLevel === 'CRITICAL' ? 85 : b.riskLevel === 'HIGH' ? 65 : b.riskLevel === 'MEDIUM' ? 40 : 10);

      if (sortBy === 'RISK_DESC') return scoreB - scoreA;
      if (sortBy === 'RISK_ASC') return scoreA - scoreB;
      if (sortBy === 'NAME_ASC') return a.legalName.localeCompare(b.legalName);
      if (sortBy === 'CERTS_DESC') return (b.totalCertificatesCount || 0) - (a.totalCertificatesCount || 0);
      return 0;
    });

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLegalName) return;

    appStore.addSupplier({
      legalName: newLegalName,
      tradeName: newTradeName || undefined,
      country: newCountry,
      countryCode: newCountryCode.toUpperCase(),
      address: newAddress || '10 Avenue de l’Industrie',
      businessRegistrationNumber: newRegNumber || 'FR ' + Math.floor(Math.random() * 900000000 + 100000000),
      internalId: newInternalId || 'SUP-' + Math.floor(Math.random() * 9000 + 1000),
      contactName: newContactName || 'Responsable Qualité',
      contactEmail: newContactEmail || 'contact@fournisseur.com',
      contactPhone: newContactPhone || '+33 1 00 00 00 00',
      productCategories: newCategories.split(',').map((c) => c.trim()).filter(Boolean),
      status: 'ACTIVE',
      riskLevel: 'LOW',
      tier: newTier,
      spendCriticality: newCriticality,
    });

    setShowAddModal(false);
    setNewLegalName('');
    setNewTradeName('');
  };

  const handleRecalculateAll = () => {
    setIsRecalculating(true);
    setTimeout(() => {
      appStore.recalculateAllSuppliersRisk();
      setIsRecalculating(false);
    }, 450);
  };

  const handleExportCSV = () => {
    const csvContent = appStore.exportSuppliersCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `fournisseurs_certiwatch_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSelectSupplier = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedSupplierIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedSupplierIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedSupplierIds.size === filteredSuppliers.length) {
      setSelectedSupplierIds(new Set());
    } else {
      setSelectedSupplierIds(new Set(filteredSuppliers.map((s) => s.id)));
    }
  };

  const handleBulkRemindExpiring = () => {
    const count = selectedSupplierIds.size;
    setBulkEmailSuccess(`${count} relance(s) de renouvellement envoyée(s) aux responsables qualité des fournisseurs sélectionnés.`);
    setTimeout(() => setBulkEmailSuccess(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Strategic KPI Stats */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <span>Répertoire & Gouvernance Fournisseurs</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cartographie 360°, calcul continu des scores de risque multi-facteurs et synchronisation de blocage ERP
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              title="Exporter le catalogue filtré au format CSV"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Exporter CSV</span>
            </button>

            <button
              onClick={handleRecalculateAll}
              disabled={isRecalculating}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              title="Recalculer les scores de risque sur tous les fournisseurs"
            >
              <RotateCw className={`w-3.5 h-3.5 text-emerald-400 ${isRecalculating ? 'animate-spin' : ''}`} />
              <span>Recalculer Risques</span>
            </button>

            {permissions.canCreateSupplier && (
              <>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-semibold transition-colors shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Importer CSV / Excel</span>
                </button>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouveau Fournisseur</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* 5 KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
              Total Fournisseurs
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-white">{totalCount}</span>
              <span className="text-[10px] text-slate-500">Sous surveillance</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">
              Conformes & Actifs
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-emerald-400">{activeCount}</span>
              <span className="text-[10px] text-emerald-500/80">Commandes OK</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] text-red-400 font-semibold uppercase tracking-wider block">
              Bloqués ERP
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-red-400">{blockedCount}</span>
              <span className="text-[10px] text-red-500/80">Achat interdit</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider block">
              Risque Élevé / Critique
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-amber-400">{highRiskCount}</span>
              <span className="text-[10px] text-amber-500/80">Score &gt; 50/100</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider block">
              Fournisseurs Tier 1
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-cyan-400">{tier1Count}</span>
              <span className="text-[10px] text-cyan-500/80">Rang Direct</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk action feedback notification */}
      {bulkEmailSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{bulkEmailSuccess}</span>
          </div>
          <button onClick={() => setBulkEmailSuccess(null)} className="text-emerald-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Filter and View Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-slate-400 font-semibold pr-1">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>Filtres :</span>
          </div>

          {/* Risk Level Filter */}
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Tous les risques</option>
            <option value="CRITICAL">Risque Critique (&gt;75)</option>
            <option value="HIGH">Risque Élevé (&gt;50)</option>
            <option value="MEDIUM">Risque Modéré</option>
            <option value="LOW">Risque Faible</option>
          </select>

          {/* ERP Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Tous les statuts ERP</option>
            <option value="ACTIVE">Conforme (Autorisé)</option>
            <option value="BLOCKED">Bloqué Achats (ERP)</option>
            <option value="ON_HOLD">Dérogation / En attente</option>
          </select>

          {/* Tier Filter */}
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Tous les rangs (Tiers)</option>
            <option value="TIER_1">Tier 1 - Direct</option>
            <option value="TIER_2">Tier 2 - Sous-traitant</option>
            <option value="TIER_3">Tier 3 - Matière</option>
          </select>

          {/* Criticality Filter */}
          <select
            value={filterCriticality}
            onChange={(e) => setFilterCriticality(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Toutes criticités</option>
            <option value="STRATEGIC">Stratégique</option>
            <option value="MAJOR">Majeur</option>
            <option value="STANDARD">Standard</option>
            <option value="SPOT">Ponctuel</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-cyan-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500 font-medium"
          >
            <option value="RISK_DESC">Tri : Score Risque (Décroissant)</option>
            <option value="RISK_ASC">Tri : Score Risque (Croissant)</option>
            <option value="NAME_ASC">Tri : Nom (A - Z)</option>
            <option value="CERTS_DESC">Tri : Nb Certificats</option>
          </select>

          {(filterRisk !== 'ALL' || filterStatus !== 'ALL' || filterTier !== 'ALL' || filterCriticality !== 'ALL') && (
            <button
              onClick={() => {
                setFilterRisk('ALL');
                setFilterStatus('ALL');
                setFilterTier('ALL');
                setFilterCriticality('ALL');
              }}
              className="text-xs text-slate-400 hover:text-white underline"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* View Switch Mode: Grid vs Table */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewMode('GRID')}
            className={`p-1.5 rounded transition-colors ${
              viewMode === 'GRID' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
            }`}
            title="Affichage Cartes 360°"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('TABLE')}
            className={`p-1.5 rounded transition-colors ${
              viewMode === 'TABLE' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
            }`}
            title="Affichage Tableur Dense"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bulk selection bar if items selected */}
      {selectedSupplierIds.size > 0 && (
        <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/80 flex items-center justify-between text-xs text-cyan-200">
          <div className="flex items-center gap-2">
            <span className="font-bold">{selectedSupplierIds.size}</span>
            <span>fournisseur(s) sélectionné(s)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkRemindExpiring}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Relancer par email (échéances proches)</span>
            </button>
            <button
              onClick={() => setSelectedSupplierIds(new Set())}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              Désélectionner tout
            </button>
          </div>
        </div>
      )}

      {/* VIEW MODE 1: GRID VIEW (Rich 360° Cards) */}
      {viewMode === 'GRID' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((supplier) => {
            const supplierCerts = certificates.filter((c) => c.supplierId === supplier.id);
            const isSelected = selectedSupplierIds.has(supplier.id);
            const score = supplier.multiFactorRisk?.overallScore ?? (supplier.riskLevel === 'CRITICAL' ? 85 : supplier.riskLevel === 'HIGH' ? 65 : supplier.riskLevel === 'MEDIUM' ? 40 : 10);

            return (
              <div
                key={supplier.id}
                onClick={() => setActiveSupplier(supplier)}
                className={`p-5 rounded-xl border bg-slate-900/80 hover:bg-slate-800/50 transition-all cursor-pointer shadow-md flex flex-col justify-between group ${
                  isSelected ? 'border-cyan-500 bg-cyan-950/10' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  {/* Top card header with ID, Country, Checkbox & Risk score */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <button
                        type="button"
                        onClick={(e) => toggleSelectSupplier(supplier.id, e)}
                        className="mt-0.5 text-slate-500 hover:text-white"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400 font-mono">
                            {supplier.internalId}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                            {supplier.countryCode}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800/80 text-cyan-300 font-mono">
                            {supplier.tier || 'TIER_1'}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white mt-1 group-hover:text-emerald-400 transition-colors">
                          {supplier.legalName}
                        </h3>
                        {supplier.tradeName && (
                          <p className="text-xs text-slate-400">« {supplier.tradeName} »</p>
                        )}
                      </div>
                    </div>

                    {/* Multi-factor Score Badge */}
                    <div className="text-right shrink-0">
                      <div className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${
                        score >= 75
                          ? 'bg-red-950/80 border-red-800 text-red-400'
                          : score >= 50
                          ? 'bg-amber-950/80 border-amber-800 text-amber-400'
                          : score >= 25
                          ? 'bg-yellow-950/80 border-yellow-800 text-yellow-400'
                          : 'bg-emerald-950/80 border-emerald-800 text-emerald-400'
                      }`}>
                        Score {score}/100
                      </div>
                    </div>
                  </div>

                  {/* Location & Contact snippet */}
                  <div className="space-y-1.5 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{supplier.country} • {supplier.address}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{supplier.contactEmail}</span>
                    </div>
                  </div>

                  {/* Product Categories */}
                  <div className="flex flex-wrap gap-1">
                    {supplier.productCategories.map((cat, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[10px] bg-slate-800/80 text-slate-300 border border-slate-700/60"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>

                  {/* ERP Block banner if applicable */}
                  {supplier.status === 'BLOCKED' && (
                    <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-900/50 text-[11px] text-red-300 flex items-start gap-2">
                      <Ban className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Commande bloquée dans l'ERP</p>
                        <p className="text-[10px] text-red-400/90 leading-tight">
                          {supplier.erpBlockedReason || 'Certificat non conforme ou révoqué'}
                        </p>
                      </div>
                    </div>
                  )}

                  {supplier.erpConfig?.blockStatus === 'TEMPORARY_DEROGATION' && (
                    <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-900/50 text-[11px] text-amber-300 flex items-start gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Dérogation ERP temporaire</p>
                        <p className="text-[10px] text-amber-400/90 leading-tight">
                          Jusqu'au {supplier.erpConfig.derogationExpiresAt}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom footer: Status badge & Certificate counter */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <SupplierStatusBadge status={supplier.status} />
                  <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                    <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{supplierCerts.length} cert(s)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: TABLE VIEW (Dense Procurement Officer Grid) */}
      {viewMode === 'TABLE' && (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
          <table className="w-full text-left text-slate-300 text-xs">
            <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedSupplierIds.size === filteredSuppliers.length && filteredSuppliers.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="py-3 px-3">Fournisseur & Raison Sociale</th>
                <th className="py-3 px-3">Identifiant & Pays</th>
                <th className="py-3 px-3">Score Risque</th>
                <th className="py-3 px-3">Statut Achats / ERP</th>
                <th className="py-3 px-3">Tier & Criticité</th>
                <th className="py-3 px-3">Certificats</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredSuppliers.map((supplier) => {
                const supplierCerts = certificates.filter((c) => c.supplierId === supplier.id);
                const isSelected = selectedSupplierIds.has(supplier.id);
                const score = supplier.multiFactorRisk?.overallScore ?? (supplier.riskLevel === 'CRITICAL' ? 85 : supplier.riskLevel === 'HIGH' ? 65 : supplier.riskLevel === 'MEDIUM' ? 40 : 10);

                return (
                  <tr
                    key={supplier.id}
                    onClick={() => setActiveSupplier(supplier)}
                    className={`hover:bg-slate-900/60 cursor-pointer transition-colors ${
                      isSelected ? 'bg-cyan-950/20' : ''
                    }`}
                  >
                    <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          const next = new Set(selectedSupplierIds);
                          if (next.has(supplier.id)) next.delete(supplier.id);
                          else next.add(supplier.id);
                          setSelectedSupplierIds(next);
                        }}
                      />
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{supplier.legalName}</div>
                      {supplier.tradeName && (
                        <div className="text-[11px] text-slate-400 italic">« {supplier.tradeName} »</div>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      <div>{supplier.internalId}</div>
                      <div className="text-slate-500">{supplier.country} ({supplier.countryCode})</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${
                        score >= 75
                          ? 'bg-red-950/80 border-red-800 text-red-400'
                          : score >= 50
                          ? 'bg-amber-950/80 border-amber-800 text-amber-400'
                          : score >= 25
                          ? 'bg-yellow-950/80 border-yellow-800 text-yellow-400'
                          : 'bg-emerald-950/80 border-emerald-800 text-emerald-400'
                      }`}>
                        {score}/100
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <SupplierStatusBadge status={supplier.status} />
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-xs text-slate-200">{supplier.tier || 'TIER_1'}</div>
                      <div className="text-[10px] text-cyan-400">{supplier.spendCriticality || 'STANDARD'}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      <span className="text-white font-bold">{supplierCerts.length}</span> cert(s)
                    </td>
                    <td className="py-3 px-3 text-[11px]">
                      <div className="text-slate-300 font-medium">{supplier.contactName}</div>
                      <div className="text-slate-500 truncate max-w-36">{supplier.contactEmail}</div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSupplier(supplier);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                      >
                        Fiche 360°
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Exhaustive Supplier 360° Profile Modal */}
      {activeSupplier && (
        <SupplierDetailModal
          isOpen={!!activeSupplier}
          supplier={activeSupplier}
          certificates={certificates}
          onClose={() => {
            setActiveSupplier(null);
            if (onClearSelectedSupplier) onClearSelectedSupplier();
          }}
          onNavigateToUploadCert={onNavigateToUploadCert}
        />
      )}

      {/* CSV / Excel Batch Import Modal */}
      {showImportModal && (
        <SupplierImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
        />
      )}

      {/* Add Supplier Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Ajouter un Fournisseur"
          subtitle="Enregistrement dans la base sous surveillance continue"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateSupplier} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Raison Sociale *</label>
                <input
                  type="text"
                  required
                  value={newLegalName}
                  onChange={(e) => setNewLegalName(e.target.value)}
                  placeholder="Ex : BioTextile Mills SA"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Nom Commercial</label>
                <input
                  type="text"
                  value={newTradeName}
                  onChange={(e) => setNewTradeName(e.target.value)}
                  placeholder="Ex : BioTextile"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Pays</label>
                <input
                  type="text"
                  value={newCountry}
                  onChange={(e) => setNewCountry(e.target.value)}
                  placeholder="France"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Code Pays (ISO)</label>
                <input
                  type="text"
                  value={newCountryCode}
                  onChange={(e) => setNewCountryCode(e.target.value.toUpperCase())}
                  placeholder="FR"
                  maxLength={2}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Rang Supply Chain (Tier)</label>
                <select
                  value={newTier}
                  onChange={(e) => setNewTier(e.target.value as SupplierTier)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="TIER_1">Tier 1 - Fournisseur Direct</option>
                  <option value="TIER_2">Tier 2 - Sous-traitant</option>
                  <option value="TIER_3">Tier 3 - Producteur / Matière</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Criticité Achat</label>
                <select
                  value={newCriticality}
                  onChange={(e) => setNewCriticality(e.target.value as SpendCriticality)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="STRATEGIC">Stratégique</option>
                  <option value="MAJOR">Majeur</option>
                  <option value="STANDARD">Standard</option>
                  <option value="SPOT">Spot</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">N° d'enregistrement / SIRET / DUNS</label>
              <input
                type="text"
                value={newRegNumber}
                onChange={(e) => setNewRegNumber(e.target.value)}
                placeholder="Ex : FR 89 231 490 220"
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Email Contact</label>
                <input
                  type="email"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  placeholder="qualite@fournisseur.com"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Téléphone</label>
                <input
                  type="text"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  placeholder="+33 1 42 00 00 00"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Catégories de Produits (séparées par virgules)</label>
              <input
                type="text"
                value={newCategories}
                onChange={(e) => setNewCategories(e.target.value)}
                placeholder="Coton bio, Fils, Teinture"
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors shadow-md"
              >
                Enregistrer le Fournisseur
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
