import React, { useState, useEffect } from 'react';
import {
  Scale,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  Download,
  Users,
  Building,
  Lock,
  Eye,
  Plus,
  Send,
  Sparkles,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  FileText,
  BadgeAlert,
  Layers,
  HeartHandshake,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { csdddStore } from '../../db/csdddStore';
import {
  SupplierDueDiligenceRecord,
  WhistleblowingGrievance,
  SupplierCapaItem,
  VigilancePlanSummary,
  HumanRightsRiskTopic,
  CsdddRiskSeverity,
} from '../../types/csddd';
import { appStore } from '../../db/store';

export function CsdddDueDiligenceView() {
  const [summary, setSummary] = useState<VigilancePlanSummary>(csdddStore.getSummary());
  const [suppliers, setSuppliers] = useState<SupplierDueDiligenceRecord[]>(csdddStore.getSuppliers());
  const [grievances, setGrievances] = useState<WhistleblowingGrievance[]>(csdddStore.getGrievances());
  const [capas, setCapas] = useState<SupplierCapaItem[]>(csdddStore.getCapas());

  const [activeTab, setActiveTab] = useState<'RISK_MAP' | 'GRIEVANCES' | 'CAPA' | 'SUPPLIER_PORTAL'>('RISK_MAP');
  const [selectedSupplierForModal, setSelectedSupplierForModal] = useState<SupplierDueDiligenceRecord | null>(null);
  const [showNewGrievanceModal, setShowNewGrievanceModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New Grievance form state
  const [newGrvSupplierId, setNewGrvSupplierId] = useState('sup-4');
  const [newGrvTopic, setNewGrvTopic] = useState<HumanRightsRiskTopic>('CHILD_LABOUR');
  const [newGrvSeverity, setNewGrvSeverity] = useState<CsdddRiskSeverity>('HIGH');
  const [newGrvTitle, setNewGrvTitle] = useState('');
  const [newGrvDescription, setNewGrvDescription] = useState('');

  // Portal sign state
  const [portalSupplierId, setPortalSupplierId] = useState('sup-4');
  const [signatoryName, setSignatoryName] = useState('Amadou Koné');
  const [signatoryRole, setSignatoryRole] = useState('Président du Conseil d’Administration');
  const [isSigning, setIsSigning] = useState(false);

  useEffect(() => {
    return csdddStore.subscribe(() => {
      setSummary(csdddStore.getSummary());
      setSuppliers(csdddStore.getSuppliers());
      setGrievances(csdddStore.getGrievances());
      setCapas(csdddStore.getCapas());
    });
  }, []);

  const activeTenant = appStore.getActiveTenant();

  const handleCreateGrievance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGrvTitle || !newGrvDescription) return;

    const supplier = suppliers.find((s) => s.supplierId === newGrvSupplierId);

    const created = csdddStore.submitGrievance({
      supplierId: newGrvSupplierId,
      supplierName: supplier?.supplierName || 'Fournisseur',
      country: supplier?.country || 'International',
      topic: newGrvTopic,
      reporterType: 'NGO_ALERT',
      severity: newGrvSeverity,
      status: 'NEW_ALERT',
      title: newGrvTitle,
      description: newGrvDescription,
    });

    setShowNewGrievanceModal(false);
    setNewGrvTitle('');
    setNewGrvDescription('');
    setNotification(
      `Signalement éthique ${created.referenceNumber} enregistré avec succès sous scellement confidentiel.`
    );
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSignCharterInPortal = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigning(true);

    setTimeout(() => {
      const hash = csdddStore.signCharter(portalSupplierId, signatoryName, signatoryRole);
      setIsSigning(false);
      setNotification(`Charte Achats Responsables eIDAS signée avec succès (Sceau : ${hash.substring(0, 20)}...).`);
      setTimeout(() => setNotification(null), 5000);
    }, 600);
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Hero Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-950/70 via-slate-900 to-indigo-950/40 border border-teal-500/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
            <Scale className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Chantier 15 : Devoir de Vigilance (CSDDD / Loi 2017) &amp; Portail Fournisseur
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono">
                Directive UE 2024/1760
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                Signature eIDAS Certifiée
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Dispositif de vigilance pour <strong>{activeTenant.name}</strong> couvrant les atteintes aux droits humains (travail des enfants, travail forcé, conventions OIT), le canal de signalement whistleblowing et les plans de prévention partagés.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowNewGrievanceModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-semibold transition"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Nouveau Signalement</span>
          </button>

          <a
            href="/api/csddd/vigilance-plan/export"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Plan de Vigilance (HTML / CAC)</span>
          </a>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-teal-950/40 border border-teal-500/30 text-teal-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Chartes Achats Signées (eIDAS)</span>
            <ShieldCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">
              {summary.charterSignatureRatePercent} %
            </span>
            <span className="text-xs text-slate-400">({summary.totalSuppliersMonitored}/{summary.totalSuppliersMonitored})</span>
          </div>
          <p className="text-[11px] text-slate-400">
            100% des fournisseurs sous contrat ont ratifié le code de conduite.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Audits Sociaux Tiers (SMETA/SA8000)</span>
            <FileCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-teal-400">
              {summary.socialAuditCoverageRatePercent} %
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Vérifications sur site par Bureau Veritas, SGS, Intertek &amp; Afnor.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Alertes Éthiques &amp; Whistleblowing</span>
            <BadgeAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">
              {summary.openGrievancesCount}
            </span>
            <span className="text-xs text-slate-400">en cours d'investigation</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {summary.resolvedGrievancesCount} signalement(s) clos avec succès cette année.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Plans d'Actions Correctives (CAPA)</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-rose-400">
              {summary.capaRequiredCount}
            </span>
            <span className="text-xs text-slate-400">plans actifs</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Remédiations suivies avec les coopératives agricoles &amp; sous-traitants.
          </p>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('RISK_MAP')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'RISK_MAP'
              ? 'bg-teal-600 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Cartographie des Risques &bull; Tier 1 ({suppliers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('GRIEVANCES')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'GRIEVANCES'
              ? 'bg-teal-600 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Canal de Signalement &amp; Réclamations ({grievances.length})</span>
          {summary.openGrievancesCount > 0 && (
            <span className="px-1.5 py-0.2 rounded bg-rose-500 text-white text-[10px] font-bold">
              {summary.openGrievancesCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CAPA')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'CAPA'
              ? 'bg-teal-600 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Plans d'Actions Correctives ({capas.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SUPPLIER_PORTAL')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'SUPPLIER_PORTAL'
              ? 'bg-teal-600 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Portail Fournisseur &amp; Signature eIDAS</span>
        </button>
      </div>

      {/* TAB 1: Risk Mapping & Supplier Due Diligence */}
      {activeTab === 'RISK_MAP' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Cartographie des Risques Droits Humains &amp; Environnement (CSDDD Article 6)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Évaluation pondérée selon l'indice de risque pays (ITUC Global Rights Index) et les audits sociaux sur site.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded bg-slate-800 text-teal-400 font-mono font-bold">
                  {suppliers.filter((s) => s.status === 'COMPLIANT_VERIFIED').length} / {suppliers.length} Conformes
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Fournisseur</th>
                    <th className="py-3 px-4">Pays (Risque ITUC)</th>
                    <th className="py-3 px-4">Audit Social Tiers</th>
                    <th className="py-3 px-4 text-center">Score Vigilance</th>
                    <th className="py-3 px-4 text-center">Zéro Travail Enfants</th>
                    <th className="py-3 px-4 text-center">Charte eIDAS</th>
                    <th className="py-3 px-4 text-center">Statut CSDDD</th>
                    <th className="py-3 px-4 text-right">Détails</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {suppliers.map((s) => (
                    <tr key={s.supplierId} className="hover:bg-slate-800/20 transition">
                      <td className="py-3 px-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-slate-500" />
                          <span>{s.supplierName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {s.country}{' '}
                        <span
                          className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${
                            s.countryRiskIndex > 50
                              ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                              : s.countryRiskIndex > 30
                              ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {s.countryRiskIndex}/100
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-white block">
                          {s.socialAuditType.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {s.socialAuditScore}/100 &bull; {s.socialAuditBody}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-sm">
                        <span
                          className={
                            s.overallDueDiligenceScore >= 90
                              ? 'text-teal-400'
                              : s.overallDueDiligenceScore >= 75
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }
                        >
                          {s.overallDueDiligenceScore}/100
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {s.childLaborZeroToleranceVerified ? (
                          <span className="inline-flex items-center gap-1 text-teal-400 font-bold">
                            <Check className="w-3.5 h-3.5" />
                            <span>Vérifié</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>CAPA Active</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {s.charterSigned ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                            Signée eIDAS
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
                            En attente
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                            s.status === 'COMPLIANT_VERIFIED'
                              ? 'bg-teal-950 text-teal-300 border border-teal-500/30'
                              : s.status === 'CAPA_REQUIRED'
                              ? 'bg-rose-950 text-rose-300 border border-rose-500/30 animate-pulse'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {s.status === 'COMPLIANT_VERIFIED'
                            ? 'Vérifié Conforme'
                            : s.status === 'CAPA_REQUIRED'
                            ? 'CAPA Requise'
                            : 'Évaluation en cours'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedSupplierForModal(s)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                        >
                          Risques
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Whistleblowing & Grievance Mechanism */}
      {activeTab === 'GRIEVANCES' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  <span>Mécanisme d'Alerte &amp; Procédure de Réclamation (CSDDD Article 9)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Canal indépendant chiffré accessible aux travailleurs de la chaîne d'approvisionnement, syndicats et ONG.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowNewGrievanceModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Déposer un Signalement</span>
              </button>
            </div>

            <div className="space-y-3">
              {grievances.map((g) => (
                <div
                  key={g.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-xs">{g.referenceNumber}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        {g.supplierName} ({g.country})
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          g.severity === 'CRITICAL'
                            ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        Sévérité {g.severity}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        g.status === 'RESOLVED_CLOSED'
                          ? 'bg-teal-950 text-teal-300 border border-teal-500/30'
                          : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {g.status === 'RESOLVED_CLOSED' ? 'Clôturé & Remédié' : 'En Instruction'}
                    </span>
                  </div>

                  <div>
                    <h5 className="font-bold text-white text-xs">{g.title}</h5>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{g.description}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                    <div>
                      <span>Émetteur : <strong className="text-white">{g.reporterType}</strong></span>
                      <span className="mx-2">&bull;</span>
                      <span>Enquêteur désigné : <strong className="text-white">{g.assignedInvestigator}</strong></span>
                    </div>

                    {g.remediationPlanSummary && (
                      <div className="text-teal-400 font-semibold max-w-md truncate" title={g.remediationPlanSummary}>
                        Remédiation : {g.remediationPlanSummary}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Corrective Action Plans (CAPA) */}
      {activeTab === 'CAPA' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>Plans d'Actions Préventives &amp; Correctives Partagés (CAPA)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Mesures d'atténuation obligatoires convenues contractuellement avec les fournisseurs défaillants.
              </p>
            </div>

            <div className="space-y-4">
              {capas.map((capa) => (
                <div
                  key={capa.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                        {capa.supplierName} &bull; {capa.findingTopic}
                      </span>
                      <h5 className="font-bold text-white text-sm mt-0.5">{capa.title}</h5>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-mono">
                        Échéance : <strong>{capa.deadline}</strong>
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          capa.status === 'VERIFIED_CLOSED'
                            ? 'bg-teal-950 text-teal-300 border border-teal-500/30'
                            : capa.status === 'EVIDENCE_SUBMITTED'
                            ? 'bg-blue-950 text-blue-300 border border-blue-500/30'
                            : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {capa.status === 'VERIFIED_CLOSED'
                          ? 'Clôturé avec succès'
                          : capa.status === 'EVIDENCE_SUBMITTED'
                          ? 'Preuves soumises'
                          : 'En cours'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-semibold">Cause Racine Identifiée :</span>
                      <p className="text-slate-300 mt-0.5">{capa.rootCause}</p>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block font-semibold">Action Requise &amp; Moyens Déployés :</span>
                      <p className="text-slate-300 mt-0.5">{capa.requiredAction}</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Avancement de la remédiation terrain</span>
                      <span className="font-mono font-bold text-teal-400">{capa.progressPercent} %</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          capa.progressPercent === 100
                            ? 'bg-teal-400'
                            : capa.progressPercent > 70
                            ? 'bg-blue-400'
                            : 'bg-amber-400'
                        }`}
                        style={{ width: `${capa.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Supplier Self-Service Portal & eIDAS Signature */}
      {activeTab === 'SUPPLIER_PORTAL' && (
        <div className="space-y-6 text-xs">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
            <div className="pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white">
                  Portail Collaboratif Fournisseurs &amp; Signature eIDAS de la Charte RSE
                </h3>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Espace dédié où vos partenaires stratégiques déposent leurs audits sociaux et signent électroniquement leurs engagements.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form to test eIDAS signature */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span>Signature Électronique eIDAS du Code de Conduite Achats</span>
                </h4>

                <form onSubmit={handleSignCharterInPortal} className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Fournisseur Partenaire</label>
                    <select
                      value={portalSupplierId}
                      onChange={(e) => {
                        setPortalSupplierId(e.target.value);
                        const s = suppliers.find((x) => x.supplierId === e.target.value);
                        if (s?.charterSignatoryName) setSignatoryName(s.charterSignatoryName);
                      }}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                    >
                      {suppliers.map((s) => (
                        <option key={s.supplierId} value={s.supplierId}>
                          {s.supplierName} ({s.country}) {s.charterSigned ? '✓ Signé' : '⚠️ En attente'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Nom &amp; Prénom du Représentant Légal</label>
                    <input
                      type="text"
                      required
                      value={signatoryName}
                      onChange={(e) => setSignatoryName(e.target.value)}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Qualité / Fonction</label>
                    <input
                      type="text"
                      required
                      value={signatoryRole}
                      onChange={(e) => setSignatoryRole(e.target.value)}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <span className="font-bold text-white block">Clauses juridiques ratifiées :</span>
                    <p>&bull; Tolérance zéro travail des enfants et travail forcé (Conventions OIT 29, 138, 182)</p>
                    <p>&bull; Garantie d'un salaire décent et respect de la liberté syndicale</p>
                    <p>&bull; Respect des règles anti-corruption Loi Sapin II</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSigning}
                    className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isSigning ? 'Génération du sceau eIDAS...' : 'Signer & Sceller la Charte eIDAS'}</span>
                  </button>
                </form>
              </div>

              {/* Status & Proof Vault */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="font-bold text-white text-sm">Registre des Preuves Cryptographiques eIDAS</h4>
                <div className="space-y-3">
                  {suppliers.map((s) => (
                    <div
                      key={s.supplierId}
                      className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-white block">{s.supplierName}</span>
                        <span className="text-[11px] text-slate-400">
                          Signé par {s.charterSignatoryName || 'N/A'} ({s.charterSignedDate || 'Non daté'})
                        </span>
                        {s.charterEidasHash && (
                          <span className="font-mono text-[10px] text-teal-400 block truncate max-w-xs mt-0.5">
                            Hash : {s.charterEidasHash}
                          </span>
                        )}
                      </div>

                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        Certifié Valide
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Supplier Risk Details */}
      {selectedSupplierForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-left space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  Évaluation Devoir de Vigilance : {selectedSupplierForModal.supplierName}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedSupplierForModal.country} &bull; Score global : {selectedSupplierForModal.overallDueDiligenceScore}/100
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSupplierForModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-96 overflow-y-auto pr-1">
              {selectedSupplierForModal.risks.map((risk, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{risk.labelFr}</span>
                    <span
                      className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                        risk.severity === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300'
                          : risk.severity === 'HIGH'
                          ? 'bg-amber-950 text-amber-300'
                          : 'bg-emerald-950 text-emerald-300'
                      }`}
                    >
                      Sévérité {risk.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{risk.mitigationMeasure}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedSupplierForModal(null)}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Whistleblowing Grievance */}
      {showNewGrievanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-left space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">
                  Déposer une Alerte Éthique / Whistleblowing
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewGrievanceModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGrievance} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Fournisseur concerné</label>
                <select
                  value={newGrvSupplierId}
                  onChange={(e) => setNewGrvSupplierId(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                >
                  {suppliers.map((s) => (
                    <option key={s.supplierId} value={s.supplierId}>
                      {s.supplierName} ({s.country})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Thématique CSDDD</label>
                  <select
                    value={newGrvTopic}
                    onChange={(e) => setNewGrvTopic(e.target.value as HumanRightsRiskTopic)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="CHILD_LABOUR">Travail des enfants (OIT 138/182)</option>
                    <option value="FORCED_LABOUR">Travail forcé &amp; Servitude (OIT 29)</option>
                    <option value="HEALTH_AND_SAFETY">Santé &amp; Sécurité au travail</option>
                    <option value="LIVING_WAGE">Salaire décent &amp; Heures sup</option>
                    <option value="ENVIRONMENTAL_DAMAGE">Atteinte à l'environnement</option>
                    <option value="BUSINESS_ETHICS_ANTI_CORRUPTION">Corruption / Fraude</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Sévérité estimée</label>
                  <select
                    value={newGrvSeverity}
                    onChange={(e) => setNewGrvSeverity(e.target.value as CsdddRiskSeverity)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="CRITICAL">Critique (Urgence immédiate)</option>
                    <option value="HIGH">Élevée</option>
                    <option value="MEDIUM">Moyenne</option>
                    <option value="LOW">Faible</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Objet du Signalement</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Heures supplémentaires non compensées..."
                  value={newGrvTitle}
                  onChange={(e) => setNewGrvTitle(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Description Détaillée des Faits</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Précisez la date, le lieu précis, l'atelier ou la parcelle, ainsi que le nombre de personnes concernées..."
                  value={newGrvDescription}
                  onChange={(e) => setNewGrvDescription(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewGrievanceModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                >
                  Transmettre au Comité Éthique
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
