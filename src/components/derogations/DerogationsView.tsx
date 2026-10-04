import React, { useState } from 'react';
import {
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Ban,
  ShieldCheck,
  Plus,
  RotateCw,
  Search,
  Filter,
  ExternalLink,
  ChevronRight,
  FileText,
  UserCheck,
  KeyRound,
  Lock,
  Layers,
  Sparkles,
  Play,
  Check,
  X,
  CreditCard,
  Building2,
} from 'lucide-react';
import { QualityDerogation, EidasSignatureRecord, DerogationRiskLevel } from '../../types/derogation';
import { derogationService } from '../../services/derogationService';
import { appStore } from '../../db/store';

export function DerogationsView() {
  const [derogations, setDerogations] = useState<QualityDerogation[]>(derogationService.getAllDerogations());
  const [activeSubTab, setActiveSubTab] = useState<'register' | 'signing' | 'create' | 'simulator'>('register');
  const [selectedDerogId, setSelectedDerogId] = useState<string>(derogations[0]?.id || '');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Signer form state
  const [signerName, setSignerName] = useState('Claire Vasseur');
  const [signerRole, setSignerRole] = useState('Responsable Qualité Filière');
  const [signerComments, setSignerComments] = useState('Conformité technique et plan d’atténuation validés sous eIDAS.');
  const [isSigning, setIsSigning] = useState(false);
  const [signSuccessMessage, setSignSuccessMessage] = useState('');

  // Create form state
  const suppliers = appStore.getTenantSuppliers();
  const [newTitle, setNewTitle] = useState('');
  const [newSupplierId, setNewSupplierId] = useState(suppliers[0]?.id || 'sup-1');
  const [newCategory, setNewCategory] = useState('Textiles Biologiques & Coton');
  const [newStandard, setNewStandard] = useState('GOTS');
  const [newReason, setNewReason] = useState<QualityDerogation['reasonCode']>('TEMPORARY_RENEWAL_AUDIT_IN_PROGRESS');
  const [newJustification, setNewJustification] = useState('');
  const [newRisk, setNewRisk] = useState<DerogationRiskLevel>('MEDIUM');
  const [newMitigation, setNewMitigation] = useState('');
  const [newMaxSpend, setNewMaxSpend] = useState('75000');
  const [newValidDays, setNewValidDays] = useState('60');
  const [createSuccess, setCreateSuccess] = useState(false);

  // Simulator state
  const [simPoAmount, setSimPoAmount] = useState('45000');
  const [simResult, setSimResult] = useState<any | null>(null);

  const selectedDerogation = derogations.find((d) => d.id === selectedDerogId) || derogations[0];

  const handleRefresh = () => {
    setDerogations([...derogationService.getAllDerogations()]);
  };

  const handleSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDerogation) return;

    setIsSigning(true);
    setSignSuccessMessage('');

    setTimeout(() => {
      const res = derogationService.signDerogation(selectedDerogation.id, {
        name: signerName,
        email: `${signerName.toLowerCase().replace(' ', '.')}@enterprise.corp`,
        role: signerRole,
        comments: signerComments,
      });

      setIsSigning(false);
      if (res.success) {
        setSignSuccessMessage(res.message);
        setDerogations([...derogationService.getAllDerogations()]);
      }
    }, 600);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === newSupplierId);
    const created = derogationService.createDerogation({
      title: newTitle || `Dérogation Qualité - ${newStandard} (${sup?.legalName || 'Fournisseur'})`,
      supplierId: newSupplierId,
      supplierName: sup?.legalName || 'Fournisseur Partenaire',
      productCategory: newCategory,
      standardTargeted: newStandard,
      reasonCode: newReason,
      justificationText: newJustification,
      riskAssessment: newRisk,
      mitigationPlan: newMitigation,
      maxAuthorizedSpendEur: Number(newMaxSpend) || 50000,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + Number(newValidDays) * 86400000).toISOString().split('T')[0],
    });

    setDerogations([...derogationService.getAllDerogations()]);
    setSelectedDerogId(created.id);
    setCreateSuccess(true);
    setTimeout(() => {
      setCreateSuccess(false);
      setActiveSubTab('signing');
    }, 1200);
  };

  const handleTestSimulator = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === selectedDerogation?.supplierId) || suppliers[0];
    const amount = Number(simPoAmount) || 0;

    const evaluation = appStore.evaluateOrderCompliance({
      supplierId: sup.id,
      productCategory: selectedDerogation?.productCategory || 'Textiles Biologiques & Coton',
      amountEur: amount,
      logAudit: true,
    });

    setSimResult(evaluation);
  };

  const filteredDerogations = derogations.filter((d) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PENDING') return d.status.startsWith('PENDING');
    return d.status === statusFilter;
  });

  const activeCount = derogations.filter((d) => d.status === 'APPROVED').length;
  const pendingCount = derogations.filter((d) => d.status.startsWith('PENDING')).length;
  const totalSpendCap = derogations.reduce((acc, d) => acc + d.maxAuthorizedSpendEur, 0);
  const totalConsumedSpend = derogations.reduce((acc, d) => acc + d.currentConsumedSpendEur, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                Règlement eIDAS (UE) N°910/2014 &amp; RGS**
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                Signatures PAdES Horodatées RFC 3161
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-400" />
              Chantier : Moteur de Dérogations Qualité &amp; Workflows eIDAS
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Encadrement formel et traçabilité des exceptions de conformité achats. Approbation multi-niveaux hiérarchique avec certificats électroniques qualifiés et levée automatique des blocages ERP sous plafond budgétaire strict.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('create')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nouvelle Demande de Dérogation
            </button>
          </div>
        </div>

        {/* Global KPIs */}
        <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Dérogations Actives</div>
            <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">{activeCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Blocage ERP levé sous plafond</div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">En Attente de Visa eIDAS</div>
            <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">{pendingCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Circuits d'approbation en cours</div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Dépenses Sous Dérogation</div>
            <div className="text-lg font-bold text-cyan-400 font-mono mt-0.5">
              {totalConsumedSpend.toLocaleString()} €
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Sur {totalSpendCap.toLocaleString()} € autorisés</div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Preuve Juridique &amp; SAE</div>
            <div className="text-lg font-bold text-white font-mono mt-0.5">PAdES-LTV</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Scellement SHA-256 + Merkle</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('register')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'register'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          1. Registre des Dérogations ({derogations.length})
        </button>

        <button
          onClick={() => setActiveSubTab('signing')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'signing'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          2. Bordereau de Signature eIDAS / RGS**
        </button>

        <button
          onClick={() => setActiveSubTab('create')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'create'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Plus className="w-4 h-4" />
          3. Nouvelle Demande de Dérogation
        </button>

        <button
          onClick={() => setActiveSubTab('simulator')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'simulator'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Play className="w-4 h-4" />
          4. Simulateur de Gating ERP avec Dérogation
        </button>
      </div>

      {/* Tab 1 : Register */}
      {activeSubTab === 'register' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="APPROVED">Approuvées &amp; Actives</option>
                <option value="PENDING">En attente de visa</option>
                <option value="REVOKED">Révoquées</option>
              </select>
            </div>

            <span className="text-xs text-slate-400 font-mono">
              {filteredDerogations.length} dérogation(s) répertoriée(s)
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredDerogations.map((derog) => {
              const isApproved = derog.status === 'APPROVED';
              const isPending = derog.status.startsWith('PENDING');
              const percentConsumed = Math.min(
                100,
                Math.round((derog.currentConsumedSpendEur / Math.max(1, derog.maxAuthorizedSpendEur)) * 100)
              );

              return (
                <div
                  key={derog.id}
                  onClick={() => {
                    setSelectedDerogId(derog.id);
                    setActiveSubTab('signing');
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    selectedDerogation.id === derog.id
                      ? 'bg-slate-900/90 border-emerald-500/50 shadow-xl'
                      : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-400">{derog.id}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            isApproved
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : isPending
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}
                        >
                          {derog.status}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                          Palier {derog.currentTier} / {derog.requiredTier}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                          Standard: {derog.standardTargeted}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white">{derog.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-1">{derog.justificationText}</p>

                      <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                        <span>Fournisseur: <strong className="text-slate-300">{derog.supplierName}</strong></span>
                        <span>Validité: <strong className="text-slate-300">Jusqu'au {derog.validUntil}</strong></span>
                      </div>
                    </div>

                    {/* Spend Cap Progress */}
                    <div className="lg:w-64 space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800 shrink-0">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Plafond Consommé</span>
                        <span className="font-mono font-bold text-white">
                          {derog.currentConsumedSpendEur.toLocaleString()} € / {derog.maxAuthorizedSpendEur.toLocaleString()} €
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            percentConsumed > 80 ? 'bg-amber-400' : 'bg-emerald-400'
                          }`}
                          style={{ width: `${percentConsumed}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-right font-mono text-slate-500">
                        {percentConsumed}% du quota engagé
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2 : Electronic Signing Console */}
      {activeSubTab === 'signing' && selectedDerogation && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Document Preview (Left) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400">
                  BORDEREAU DÉROGATOIRE QUALITÉ eIDAS
                </span>
                <span className="text-xs font-mono text-slate-400">Réf : {selectedDerogation.id}</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">{selectedDerogation.title}</h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500">Fournisseur :</span>
                  <div className="font-semibold text-white mt-0.5">{selectedDerogation.supplierName}</div>
                </div>
                <div>
                  <span className="text-slate-500">Catégorie d'Achats :</span>
                  <div className="font-semibold text-white mt-0.5">{selectedDerogation.productCategory}</div>
                </div>
                <div>
                  <span className="text-slate-500">Standard Dérogé :</span>
                  <div className="font-bold text-amber-400 font-mono mt-0.5">{selectedDerogation.standardTargeted}</div>
                </div>
                <div>
                  <span className="text-slate-500">Plafond Financier Ferme :</span>
                  <div className="font-bold text-emerald-400 font-mono mt-0.5">
                    {selectedDerogation.maxAuthorizedSpendEur.toLocaleString()} € HT
                  </div>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-1">Motif Réglementaire &amp; Justification :</span>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 leading-relaxed">
                  {selectedDerogation.justificationText}
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-1">Plan de Maîtrise des Risques &amp; Atténuation :</span>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 leading-relaxed">
                  {selectedDerogation.mitigationPlan}
                </div>
              </div>

              {selectedDerogation.merkleProofHash && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-[11px] font-mono text-emerald-300">
                  <div className="font-bold mb-0.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Scellement d'Audit Cryptographique (Merkle Leaf #{selectedDerogation.merkleLeafIndex})
                  </div>
                  <div className="truncate text-slate-400">Empreinte SHA-256 : {selectedDerogation.merkleProofHash}</div>
                </div>
              )}
            </div>
          </div>

          {/* Workflow & Sign Action (Right) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Signature Chain Steps */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                Circuit d'Approbation Hiérarchique eIDAS
              </h4>

              <div className="space-y-3">
                {selectedDerogation.signatures.map((sig) => {
                  const isSigned = sig.status === 'SIGNED';
                  return (
                    <div
                      key={sig.step}
                      className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                        isSigned
                          ? 'bg-emerald-950/20 border-emerald-500/30'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                              isSigned ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {sig.step}
                          </span>
                          <span className="font-bold text-white">{sig.signerRole}</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            isSigned ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {sig.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400">
                        {sig.signerName} ({sig.signerEmail})
                      </div>

                      {isSigned && (
                        <div className="pt-2 border-t border-slate-800/60 font-mono text-[10px] text-slate-400 space-y-0.5">
                          <div className="text-emerald-400 font-semibold">
                            Signé le {new Date(sig.signedAt).toLocaleDateString()} sous visa {sig.rgsLevel} ({sig.signatureType})
                          </div>
                          <div className="truncate">Certificat : {sig.certificateFingerprintSha256.slice(0, 24)}...</div>
                          <div className="italic font-sans text-slate-300 mt-1">"{sig.comments}"</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Signature Form (if pending) */}
            {selectedDerogation.status.startsWith('PENDING') && (
              <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-5 space-y-4 shadow-xl">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                  Apposer un Visa Électronique eIDAS
                </h4>

                <form onSubmit={handleSign} className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 font-medium">Nom du Signataire Qualifié</label>
                    <input
                      type="text"
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-medium text-white mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-medium">Fonction / Rôle Hiérarchique</label>
                    <input
                      type="text"
                      value={signerRole}
                      onChange={(e) => setSignerRole(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-medium text-white mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-medium">Commentaire de Validation</label>
                    <textarea
                      rows={2}
                      value={signerComments}
                      onChange={(e) => setSignerComments(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 mt-1"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSigning}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSigning ? (
                      <RotateCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>Apposer Signature Électronique Qualifiée eIDAS</span>
                  </button>
                </form>

                {signSuccessMessage && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{signSuccessMessage}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3 : Create Derogation Form */}
      {activeSubTab === 'create' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-4xl mx-auto space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              Création d'une Demande de Dérogation Formelle
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Remplissez les éléments justificatifs. Le circuit d'approbation et le niveau de signature eIDAS requis seront automatiquement déterminés en fonction du montant et de la criticité.
            </p>
          </div>

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-400 font-medium">Titre de la Dérogation</label>
              <input
                type="text"
                required
                placeholder="ex: Dérogation Coton Bio - Attente Certificat GOTS définitif"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white mt-1 focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 font-medium">Fournisseur Concerné</label>
                <select
                  value={newSupplierId}
                  onChange={(e) => setNewSupplierId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white mt-1 focus:border-emerald-500"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.legalName} ({s.country})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-medium">Catégorie de Produits</label>
                <input
                  type="text"
                  required
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white mt-1 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-slate-400 font-medium">Standard Dérogé</label>
                <select
                  value={newStandard}
                  onChange={(e) => setNewStandard(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white mt-1 focus:border-emerald-500 font-mono"
                >
                  <option value="GOTS">GOTS (Textiles)</option>
                  <option value="ECOCERT">ECOCERT (Bio)</option>
                  <option value="FSC">FSC (Bois/Forêts)</option>
                  <option value="OEKO_TEX">OEKO-TEX (Innocuité)</option>
                  <option value="FAIRTRADE">FAIRTRADE (Commerce équitable)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-medium">Plafond Budgétaire (€ HT)</label>
                <input
                  type="number"
                  required
                  value={newMaxSpend}
                  onChange={(e) => setNewMaxSpend(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-emerald-400 mt-1 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium">Durée de Validité (Jours)</label>
                <input
                  type="number"
                  max={90}
                  value={newValidDays}
                  onChange={(e) => setNewValidDays(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-white mt-1 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-medium">Justification Complète</label>
              <textarea
                rows={3}
                required
                placeholder="Détaillez le contexte industriel, les éléments d'audit provisoires et la raison de la demande..."
                value={newJustification}
                onChange={(e) => setNewJustification(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 mt-1 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium">Plan d'Atténuation des Risques</label>
              <textarea
                rows={2}
                required
                placeholder="Mesures de contrôle compensatoires (tests laboratoires en réception, audit renforcé...)"
                value={newMitigation}
                onChange={(e) => setNewMitigation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 mt-1 focus:border-emerald-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Soumettre la Dérogation dans le Circuit d'Approbation</span>
              </button>
            </div>
          </form>

          {createSuccess && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Demande créée avec succès ! Redirection vers la console de signature...</span>
            </div>
          )}
        </div>
      )}

      {/* Tab 4 : Simulator */}
      {activeSubTab === 'simulator' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-4xl mx-auto space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Play className="w-5 h-5 text-emerald-400" />
              Simulateur d'Évaluation de Commande ERP avec Dérogation
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Vérifiez en temps réel comment la matrice d'achats interprète une commande passée sur un fournisseur dont le certificat est expiré mais couvert par une dérogation active.
            </p>
          </div>

          <form onSubmit={handleTestSimulator} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Dérogation Active Sélectionnée</label>
              <input
                type="text"
                readOnly
                value={`${selectedDerogation.id} (${selectedDerogation.supplierName})`}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-300"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Montant de la Commande (€ HT)</label>
              <input
                type="number"
                value={simPoAmount}
                onChange={(e) => setSimPoAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-emerald-400"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                <span>Évaluer la Décision ERP</span>
              </button>
            </div>
          </form>

          {simResult && (
            <div
              className={`p-4 rounded-xl border space-y-2 text-xs font-mono ${
                simResult.decision === 'ALLOWED'
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-red-950/20 border-red-500/40 text-red-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-2">
                  {simResult.decision === 'ALLOWED' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Ban className="w-4 h-4 text-red-400" />
                  )}
                  DÉCISION MATRICE ERP : {simResult.decision}
                </span>
                <span className="text-slate-400">Statut HTTP: {simResult.decision === 'ALLOWED' ? '200 OK' : '403 FORBIDDEN'}</span>
              </div>

              <div className="space-y-1 font-sans text-slate-300 text-[11px] pt-1 border-t border-slate-800">
                {simResult.reasons.map((r: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-slate-500">•</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
