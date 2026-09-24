import React, { useState } from 'react';
import {
  Supplier,
  SupplierTier,
  SpendCriticality,
  ErpBlockStatus,
  SupplierAuditRecord,
} from '../../types/supplier';
import { Certificate } from '../../types/certificate';
import { Modal } from '../ui/Modal';
import { SupplierStatusBadge, RiskBadge, CertificateStatusBadge } from '../ui/Badge';
import { SupplierRiskScorecard } from './SupplierRiskScorecard';
import { appStore } from '../../db/store';
import {
  Building2,
  FileCheck2,
  TrendingUp,
  History,
  ShieldAlert,
  Ban,
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Save,
  X,
  Plus,
  AlertTriangle,
  UserCheck,
  Tag,
  ShieldCheck,
  FileText,
} from 'lucide-react';

interface SupplierDetailModalProps {
  supplier: Supplier | null;
  certificates: Certificate[];
  isOpen: boolean;
  onClose: () => void;
  onNavigateToUploadCert?: (supplierId: string) => void;
}

export function SupplierDetailModal({
  supplier,
  certificates,
  isOpen,
  onClose,
  onNavigateToUploadCert,
}: SupplierDetailModalProps) {
  if (!supplier) return null;

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CERTS' | 'RISK' | 'AUDITS' | 'ERP'>('OVERVIEW');
  const [isEditing, setIsEditing] = useState(false);

  // Edit form states
  const [legalName, setLegalName] = useState(supplier.legalName);
  const [tradeName, setTradeName] = useState(supplier.tradeName || '');
  const [country, setCountry] = useState(supplier.country);
  const [countryCode, setCountryCode] = useState(supplier.countryCode);
  const [address, setAddress] = useState(supplier.address);
  const [contactName, setContactName] = useState(supplier.contactName);
  const [contactEmail, setContactEmail] = useState(supplier.contactEmail);
  const [contactPhone, setContactPhone] = useState(supplier.contactPhone);
  const [productCategories, setProductCategories] = useState(supplier.productCategories.join(', '));
  const [tier, setTier] = useState<SupplierTier>(supplier.tier || 'TIER_1');
  const [spendCriticality, setSpendCriticality] = useState<SpendCriticality>(supplier.spendCriticality || 'STANDARD');

  // ERP Block action states
  const [erpBlockReason, setErpBlockReason] = useState('');
  const [derogationDays, setDerogationDays] = useState(30);
  const [derogationJustification, setDerogationJustification] = useState('');

  // New Audit form state
  const [showAddAuditForm, setShowAddAuditForm] = useState(false);
  const [auditDate, setAuditDate] = useState(new Date().toISOString().split('T')[0]);
  const [auditorName, setAuditorName] = useState('');
  const [auditType, setAuditType] = useState<SupplierAuditRecord['auditType']>('ON_SITE_ANNUAL');
  const [auditScore, setAuditScore] = useState(85);
  const [auditConclusion, setAuditConclusion] = useState<SupplierAuditRecord['conclusion']>('COMPLIANT');
  const [auditCapaStatus, setAuditCapaStatus] = useState<SupplierAuditRecord['capaStatus']>('COMPLETED');
  const [auditNotes, setAuditNotes] = useState('');

  const permissions = appStore.getActivePermissions();
  const supplierCerts = certificates.filter((c) => c.supplierId === supplier.id);

  const handleSaveProfile = () => {
    appStore.updateSupplier(supplier.id, {
      legalName,
      tradeName: tradeName || undefined,
      country,
      countryCode: countryCode.toUpperCase(),
      address,
      contactName,
      contactEmail,
      contactPhone,
      productCategories: productCategories.split(',').map((c) => c.trim()).filter(Boolean),
      tier,
      spendCriticality,
    });
    setIsEditing(false);
  };

  const handleRecalculateRisk = () => {
    const { multiFactorRisk, riskLevel } = appStore.calculateSupplierRisk(supplier, supplierCerts);
    appStore.updateSupplier(supplier.id, {
      multiFactorRisk,
      riskLevel,
    });
  };

  const handleToggleErpBlock = (newStatus: ErpBlockStatus) => {
    if (!permissions.canOverrideErpBlock) {
      alert("Votre rôle n'a pas les permissions requises pour modifier le blocage ERP.");
      return;
    }

    if (newStatus === 'BLOCKED' && !erpBlockReason) {
      alert('Veuillez renseigner un motif de blocage obligatoire.');
      return;
    }

    if (newStatus === 'TEMPORARY_DEROGATION' && !derogationJustification) {
      alert('Veuillez renseigner une justification pour la dérogation temporaire.');
      return;
    }

    appStore.setSupplierErpBlock(
      supplier.id,
      newStatus,
      erpBlockReason,
      derogationJustification,
      derogationDays
    );
    setErpBlockReason('');
    setDerogationJustification('');
  };

  const handleSaveAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditorName) return;

    appStore.addSupplierAuditRecord(supplier.id, {
      date: auditDate,
      auditorName,
      auditType,
      score: auditScore,
      conclusion: auditConclusion,
      capaStatus: auditCapaStatus,
      notes: auditNotes || 'Audit de conformité standard',
    });

    setShowAddAuditForm(false);
    setAuditorName('');
    setAuditNotes('');
  };

  const erpStatus = supplier.erpConfig?.blockStatus || (supplier.status === 'BLOCKED' ? 'BLOCKED' : 'ALLOWED');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={supplier.legalName}
      subtitle={`ID: ${supplier.internalId} • SIRET/TVA: ${supplier.businessRegistrationNumber} • Pays: ${supplier.country}`}
      maxWidth="3xl"
    >
      <div className="space-y-5 text-xs">
        {/* Top Status Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <SupplierStatusBadge status={supplier.status} />
            <RiskBadge level={supplier.riskLevel} />
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
              {supplier.tier || 'TIER_1'}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-cyan-300 border border-slate-700">
              {supplier.spendCriticality || 'STANDARD'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {permissions.canEditSupplier && !isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Modifier la fiche</span>
              </button>
            )}
            {isEditing && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Enregistrer</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-800 pb-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'OVERVIEW'
                ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Vue 360° & Identité</span>
          </button>

          <button
            onClick={() => setActiveTab('CERTS')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'CERTS'
                ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Certifications ({supplierCerts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('RISK')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'RISK'
                ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Scoring Multi-Facteurs</span>
          </button>

          <button
            onClick={() => setActiveTab('AUDITS')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'AUDITS'
                ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audits & CAPA ({supplier.auditHistory?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('ERP')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'ERP'
                ? 'bg-slate-800 text-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Gouvernance ERP ({erpStatus === 'BLOCKED' ? 'Bloqué' : 'Actif'})</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-4">
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div>
                  <label className="text-slate-400 block mb-1">Raison Sociale</label>
                  <input
                    type="text"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Nom Commercial</label>
                  <input
                    type="text"
                    value={tradeName}
                    onChange={(e) => setTradeName(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Pays</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Code Pays (ISO)</label>
                  <input
                    type="text"
                    value={countryCode}
                    maxLength={2}
                    onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-slate-400 block mb-1">Adresse Siège</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Contact Référent</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Email Contact</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Rang Fournisseur (Tier)</label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value as SupplierTier)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="TIER_1">Tier 1 - Fournisseur Direct</option>
                    <option value="TIER_2">Tier 2 - Sous-traitant / Transformateur</option>
                    <option value="TIER_3">Tier 3 - Producteur / Matière Première</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Criticité Achat</label>
                  <select
                    value={spendCriticality}
                    onChange={(e) => setSpendCriticality(e.target.value as SpendCriticality)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="STRATEGIC">Stratégique (Volume critique)</option>
                    <option value="MAJOR">Majeur</option>
                    <option value="STANDARD">Standard</option>
                    <option value="SPOT">Ponctuel / Spot</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-slate-400 block mb-1">Catégories de Produits (séparées par virgules)</label>
                  <input
                    type="text"
                    value={productCategories}
                    onChange={(e) => setProductCategories(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Identité Juridique & Localisation
                    </span>
                    <div className="space-y-1">
                      <p className="text-white font-medium text-sm">{supplier.legalName}</p>
                      {supplier.tradeName && (
                        <p className="text-slate-400 italic">« {supplier.tradeName} »</p>
                      )}
                      <p className="text-slate-400 flex items-center gap-1.5 pt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{supplier.address}, {supplier.country} ({supplier.countryCode})</span>
                      </p>
                      <p className="text-slate-400 font-mono text-[11px] pt-1">
                        N° Registre / SIRET / TVA : <span className="text-slate-200">{supplier.businessRegistrationNumber}</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Positionnement Achats & Criticité
                    </span>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Rang de la Supply Chain :</span>
                        <span className="font-semibold text-white">{supplier.tier || 'TIER_1'} (Direct)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Criticité Dépenses :</span>
                        <span className="font-semibold text-cyan-300">{supplier.spendCriticality || 'STANDARD'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Identifiant ERP Lié :</span>
                        <span className="font-mono text-slate-300">{supplier.erpConfig?.erpVendorNumber || supplier.internalId}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Dernier Audit Enregistré :</span>
                        <span className="text-slate-300">{new Date(supplier.updatedAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Multiple Contacts Directory */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Contacts Référents (Achats, Qualité, RSE)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{supplier.contactName}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                          Principal
                        </span>
                      </div>
                      <a
                        href={`mailto:${supplier.contactEmail}`}
                        className="text-slate-400 hover:text-cyan-400 text-[11px] flex items-center gap-1.5 truncate"
                      >
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate">{supplier.contactEmail}</span>
                      </a>
                      {supplier.contactPhone && (
                        <p className="text-slate-400 text-[11px] flex items-center gap-1.5">
                          <Phone className="w-3 h-3 shrink-0" />
                          <span>{supplier.contactPhone}</span>
                        </p>
                      )}
                    </div>

                    {supplier.additionalContacts?.map((contact) => (
                      <div key={contact.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs">{contact.name}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {contact.role}
                          </span>
                        </div>
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-slate-400 hover:text-cyan-400 text-[11px] flex items-center gap-1.5 truncate"
                        >
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate">{contact.email}</span>
                        </a>
                        {contact.phone && (
                          <p className="text-slate-400 text-[11px] flex items-center gap-1.5">
                            <Phone className="w-3 h-3 shrink-0" />
                            <span>{contact.phone}</span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scope & Products */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Périmètre des Produits Achetés
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {supplier.productCategories.map((cat, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-xs bg-slate-900 text-slate-200 border border-slate-800 flex items-center gap-1.5"
                      >
                        <Tag className="w-3 h-3 text-cyan-400" />
                        <span>{cat}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CERTIFICATES */}
        {activeTab === 'CERTS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-200 text-xs">
                  Certifications Déposées ({supplierCerts.length})
                </h4>
                <p className="text-[11px] text-slate-400">
                  Surveillance continue de validité et confrontation automatique aux registres
                </p>
              </div>

              {onNavigateToUploadCert && permissions.canUploadCertificate && (
                <button
                  type="button"
                  onClick={() => onNavigateToUploadCert(supplier.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Attacher un Certificat</span>
                </button>
              )}
            </div>

            {supplierCerts.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <FileCheck2 className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-slate-300 font-medium">Aucun certificat rattaché à ce fournisseur</p>
                <p className="text-slate-500 text-[11px]">
                  Déposez un certificat pour activer la vérification continue auprès des certificateurs officiels.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {supplierCerts.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3 hover:border-slate-700 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CertificateStatusBadge status={cert.status} />
                          <span className="font-bold text-white text-sm">{cert.standardLabel}</span>
                        </div>
                        <p className="text-slate-400 font-mono text-[11px]">
                          N° de Certificat : <span className="text-white">{cert.certificateNumber}</span> • Organisme : {cert.certificationBody}
                        </p>
                      </div>

                      {cert.officialRegistryUrl && (
                        <a
                          href={cert.officialRegistryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium w-fit"
                        >
                          <span>Registre Officiel</span>
                          <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                        </a>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Date d'émission</span>
                        <span className="font-mono text-slate-300">{cert.issueDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Date d'échéance</span>
                        <span className={`font-mono font-bold ${
                          cert.status === 'EXPIRED' ? 'text-red-400' : cert.status === 'EXPIRING_SOON' ? 'text-amber-400' : 'text-slate-300'
                        }`}>
                          {cert.expiryDate}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Score de Concordance</span>
                        <span className="font-mono text-emerald-400 font-bold">{cert.confidenceScore}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Dernier Contrôle API</span>
                        <span className="text-slate-300">
                          {cert.lastVerifiedAt ? new Date(cert.lastVerifiedAt).toLocaleDateString('fr-FR') : 'Non vérifié'}
                        </span>
                      </div>
                    </div>

                    {/* Covered scope */}
                    {cert.scope && (
                      <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] space-y-1">
                        <span className="font-semibold text-slate-400 block text-[10px] uppercase">
                          Produits et Installations Couverts :
                        </span>
                        <p className="text-slate-300">
                          {cert.scope.coveredProducts?.join(', ') || 'Tous produits conformes au standard'}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: RISK SCORECARD */}
        {activeTab === 'RISK' && (
          <SupplierRiskScorecard
            supplier={supplier}
            certificates={supplierCerts}
            onTriggerRecalculate={handleRecalculateRisk}
            onNavigateToCertificates={() => setActiveTab('CERTS')}
          />
        )}

        {/* TAB 4: AUDITS & CAPA */}
        {activeTab === 'AUDITS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-200 text-xs">
                  Traçabilité des Audits & Plans d'Actions Correctifs (CAPA)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Historique des contrôles sur site, audits documentaires et suivi des non-conformités
                </p>
              </div>

              {permissions.canEditSupplier && (
                <button
                  type="button"
                  onClick={() => setShowAddAuditForm(!showAddAuditForm)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Consigner un Audit</span>
                </button>
              )}
            </div>

            {/* Log new audit form */}
            {showAddAuditForm && (
              <form onSubmit={handleSaveAudit} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h5 className="font-bold text-white text-xs">Consigner un nouveau rapport d'audit</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Date de l'audit</label>
                    <input
                      type="date"
                      required
                      value={auditDate}
                      onChange={(e) => setAuditDate(e.target.value)}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Organisme / Auditeur</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Bureau Veritas, SGS..."
                      value={auditorName}
                      onChange={(e) => setAuditorName(e.target.value)}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Type d'Audit</label>
                    <select
                      value={auditType}
                      onChange={(e) => setAuditType(e.target.value as any)}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                    >
                      <option value="ON_SITE_ANNUAL">Audit Annuel sur Site</option>
                      <option value="DOCUMENTARY_AUDIT">Audit Documentaire</option>
                      <option value="UNANNOUNCED_INSPECTION">Inspection Inopinée</option>
                      <option value="THIRD_PARTY_AUDIT">Audit Tiers Certificateur</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Score d'Audit (0 - 100)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={auditScore}
                      onChange={(e) => setAuditScore(Number(e.target.value))}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Conclusion</label>
                    <select
                      value={auditConclusion}
                      onChange={(e) => setAuditConclusion(e.target.value as any)}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                    >
                      <option value="COMPLIANT">Conforme (Sans réserve)</option>
                      <option value="MINOR_FINDINGS">Remarques Mineures</option>
                      <option value="MAJOR_NON_CONFORMITY">Non-Conformité Majeure</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Statut Plan d'Action (CAPA)</label>
                    <select
                      value={auditCapaStatus}
                      onChange={(e) => setAuditCapaStatus(e.target.value as any)}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                    >
                      <option value="COMPLETED">Traité / Clôturé</option>
                      <option value="IN_PROGRESS">En cours d'exécution</option>
                      <option value="OVERDUE">En retard</option>
                      <option value="NOT_APPLICABLE">Sans objet</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Synthèse et Remarques</label>
                  <textarea
                    rows={2}
                    value={auditNotes}
                    onChange={(e) => setAuditNotes(e.target.value)}
                    placeholder="Synthèse des points de contrôle, échantillons prélevés..."
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAuditForm(false)}
                    className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                  >
                    Enregistrer l'Audit
                  </button>
                </div>
              </form>
            )}

            {/* Audit List */}
            {(!supplier.auditHistory || supplier.auditHistory.length === 0) ? (
              <div className="p-8 text-center rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <History className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-slate-300 font-medium">Aucun audit archivé</p>
                <p className="text-slate-500 text-[11px]">
                  Enregistrez les résultats des visites qualité usine et revues documentaires.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {supplier.auditHistory.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rec.conclusion === 'COMPLIANT'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : rec.conclusion === 'MINOR_FINDINGS'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}>
                          {rec.conclusion === 'COMPLIANT'
                            ? 'Conforme'
                            : rec.conclusion === 'MINOR_FINDINGS'
                            ? 'Remarques Mineures'
                            : 'Non-Conformité Majeure'}
                        </span>
                        <span className="font-semibold text-white text-xs">{rec.auditorName}</span>
                        <span className="text-slate-400 text-[11px] font-mono">({rec.auditType})</span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="font-mono text-slate-400">{rec.date}</span>
                        <span className="font-mono font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          Score : {rec.score}/100
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-300 text-xs leading-relaxed">{rec.notes}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <span>Plan d'action (CAPA) :</span>
                        <span className={`font-semibold ${
                          rec.capaStatus === 'COMPLETED'
                            ? 'text-emerald-400'
                            : rec.capaStatus === 'IN_PROGRESS'
                            ? 'text-amber-400'
                            : rec.capaStatus === 'OVERDUE'
                            ? 'text-red-400'
                            : 'text-slate-400'
                        }`}>
                          {rec.capaStatus === 'COMPLETED'
                            ? 'Clôturé'
                            : rec.capaStatus === 'IN_PROGRESS'
                            ? 'En cours'
                            : rec.capaStatus === 'OVERDUE'
                            ? 'En retard'
                            : 'Sans objet'}
                        </span>
                      </div>

                      {rec.nextScheduledDate && (
                        <span className="text-slate-400">
                          Prochain audit : <strong className="text-slate-200">{rec.nextScheduledDate}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: ERP GOVERNANCE */}
        {activeTab === 'ERP' && (
          <div className="space-y-4">
            {/* Status card */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              erpStatus === 'BLOCKED'
                ? 'bg-red-950/40 border-red-800/80 text-red-300'
                : erpStatus === 'TEMPORARY_DEROGATION'
                ? 'bg-amber-950/40 border-amber-800/80 text-amber-300'
                : 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-950/80 border border-current/20 flex items-center justify-center shrink-0">
                  {erpStatus === 'BLOCKED' ? (
                    <Ban className="w-6 h-6 text-red-400" />
                  ) : erpStatus === 'TEMPORARY_DEROGATION' ? (
                    <Clock className="w-6 h-6 text-amber-400" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">
                    {erpStatus === 'BLOCKED'
                      ? "COMMANDES D'ACHATS BLOQUÉES DANS L'ERP"
                      : erpStatus === 'TEMPORARY_DEROGATION'
                      ? 'DÉROGATION TEMPORAIRE ACCORDÉE'
                      : 'APPROVISIONNEMENTS ET COMMANDES AUTORISÉS'}
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Connecteur synchronisé : SAP S/4HANA (ID Fournisseur : {supplier.erpConfig?.erpVendorNumber || supplier.internalId})
                  </p>
                </div>
              </div>
            </div>

            {supplier.erpBlockedReason && (
              <div className="p-3 rounded-lg bg-red-950/30 border border-red-900/40 text-red-300 text-xs">
                <strong>Motif du blocage actif :</strong> {supplier.erpBlockedReason}
              </div>
            )}

            {supplier.erpConfig?.derogationExpiresAt && (
              <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-900/40 text-amber-300 text-xs space-y-1">
                <p>
                  <strong>Dérogation expire le :</strong> {supplier.erpConfig.derogationExpiresAt}
                </p>
                {supplier.erpConfig.derogationJustification && (
                  <p>
                    <strong>Justification :</strong> {supplier.erpConfig.derogationJustification}
                  </p>
                )}
              </div>
            )}

            {/* Actions panel */}
            {permissions.canOverrideErpBlock && (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3.5">
                <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                  Pilotage du Blocage d'Achat (SAP / Oracle)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Immediate Block */}
                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2.5">
                    <span className="font-bold text-red-400 text-xs block">
                      Déclencher un Blocage Immédiat
                    </span>
                    <input
                      type="text"
                      placeholder="Motif obligatoire (ex: Non-conformité majeure)"
                      value={erpBlockReason}
                      onChange={(e) => setErpBlockReason(e.target.value)}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleToggleErpBlock('BLOCKED')}
                      className="w-full py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Bloquer Commandes ERP</span>
                    </button>
                  </div>

                  {/* Temporary Derogation or Release */}
                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2.5">
                    {erpStatus === 'BLOCKED' ? (
                      <>
                        <span className="font-bold text-amber-400 text-xs block">
                          Accorder une Dérogation Temporaire
                        </span>
                        <div className="flex gap-2">
                          <select
                            value={derogationDays}
                            onChange={(e) => setDerogationDays(Number(e.target.value))}
                            className="p-2 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs"
                          >
                            <option value={15}>15 jours</option>
                            <option value={30}>30 jours</option>
                            <option value={60}>60 jours</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Justification d'urgence..."
                            value={derogationJustification}
                            onChange={(e) => setDerogationJustification(e.target.value)}
                            className="flex-1 p-2 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleErpBlock('TEMPORARY_DEROGATION')}
                          className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold transition-colors"
                        >
                          Valider la Dérogation
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="font-bold text-emerald-400 text-xs block">
                          Autoriser Pleinement les Commandes
                        </span>
                        <p className="text-slate-400 text-[11px]">
                          Lève toute restriction ou dérogation en cours pour ce fournisseur.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleToggleErpBlock('ALLOWED')}
                          className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Lever Restriction / Tout Autoriser</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
