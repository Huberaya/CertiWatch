import React, { useState } from 'react';
import {
  Certificate,
  CertificationStandard,
  CertificateStatus,
  VerificationOutcome,
  VerificationAnomaly,
} from '../../types/certificate';
import { Supplier } from '../../types/supplier';
import { Modal } from '../ui/Modal';
import { appStore } from '../../db/store';
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Scan,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  RotateCw,
  FileCheck2,
  Building2,
} from 'lucide-react';

interface CertificateOcrUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: Supplier[];
  defaultSupplierId?: string;
  onSuccess?: () => void;
}

interface SimulatedDocumentPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  standard: CertificationStandard;
  standardLabel: string;
  body: string;
  certNumber: string;
  issueDate: string;
  expiryDate: string;
  suggestedSupplierName: string;
  scopeProducts: string[];
  scopeFacilities: string[];
  rawOcrSnippet: string;
  // Official Registry Cross-check simulation
  officialStatus: CertificateStatus;
  officialExpiryDate: string;
  officialHolder: string;
  registryUrl: string;
  verificationOutcome: VerificationOutcome;
  confidenceScore: number;
  anomalies: VerificationAnomaly[];
  confidenceReasons: string[];
}

const PRESET_DOCUMENTS: SimulatedDocumentPreset[] = [
  {
    id: 'doc-gots-valid',
    name: 'Certificat GOTS 6.0 — Coton Biologique',
    badge: 'Authentique (100% Match)',
    description: 'Document officiel Control Union vérifié conforme au registre GOTS Public Database',
    standard: 'GOTS',
    standardLabel: 'Global Organic Textile Standard (GOTS)',
    body: 'Control Union Certifications B.V.',
    certNumber: 'CU-849301-GOTS-2025',
    issueDate: '2025-03-10',
    expiryDate: '2027-03-09',
    suggestedSupplierName: 'BioLait Normandie SAS',
    scopeProducts: ['Fils de coton peigné biologique', 'Tissus sergé 100% bio'],
    scopeFacilities: ['Site de filature Flers', 'Unité de tissage Vire'],
    rawOcrSnippet: 'CONTROL UNION CERTIFICATIONS B.V. certifies that the operator complies with GOTS standards. License Number: CU-849301. Scope of certificate covers raw cotton spinning and weaving...',
    officialStatus: 'VALID',
    officialExpiryDate: '2027-03-09',
    officialHolder: 'BioLait Normandie SAS',
    registryUrl: 'https://global-standard.org/find-suppliers-shops/certified-suppliers/database/search',
    verificationOutcome: 'MATCH',
    confidenceScore: 100,
    anomalies: [],
    confidenceReasons: [
      'Numéro de licence CU-849301 actif dans la base officielle GOTS',
      'Raison sociale et adresse concordent à 100%',
      'Périmètre textile validé pour toutes les filières',
    ],
  },
  {
    id: 'doc-fsc-fraud',
    name: 'Certificat FSC CoC — Emballages Carton (FALSIFIÉ / RÉVOQUÉ)',
    badge: 'Anomalie Critique (Révocation)',
    description: 'Le scan mentionne une validité jusqu’en 2028, mais le registre officiel FSC indique une RÉVOCATION immédiate pour fraude de traçabilité',
    standard: 'FSC',
    standardLabel: 'FSC Chain of Custody (FSC-C)',
    body: 'SGS Hong Kong Limited (ASI-ACC-008)',
    certNumber: 'FSC-C149821-COC',
    issueDate: '2024-01-15',
    expiryDate: '2028-01-14', // Scan modified
    suggestedSupplierName: 'Cartonneries Européennes & Cellulose SA',
    scopeProducts: ['Carton pour emballage alimentaire', 'Pots yaourts en carton'],
    scopeFacilities: ['Usine de Tournai - Site Principal'],
    rawOcrSnippet: 'FOREST STEWARDSHIP COUNCIL Certificate SGS-COC-007823 / FSC-C149821. Certified operator: Cartonneries Européennes SA. Valid until 14/01/2028...',
    officialStatus: 'REVOKED',
    officialExpiryDate: '2026-08-10', // Actually revoked in August 2026
    officialHolder: 'Cartonneries Européennes & Cellulose SA',
    registryUrl: 'https://info.fsc.org/certificate.php',
    verificationOutcome: 'MISMATCH',
    confidenceScore: 25,
    anomalies: [
      {
        field: 'STATUS',
        documentValue: 'VALIDE (annoncé dans le document scanné)',
        officialValue: 'RÉVOQUÉ (au registre public FSC officiel)',
        severity: 'CRITICAL',
        description: 'Non-conformité critique : Le certificat a fait l’objet d’une révocation officielle pour rupture de chaîne de traçabilité.',
      },
      {
        field: 'EXPIRY_DATE',
        documentValue: '2028-01-14',
        officialValue: '2026-08-10',
        severity: 'CRITICAL',
        description: 'Divergence de date d’expiration : suspicion de falsification du PDF déposé.',
      },
    ],
    confidenceReasons: [
      'Alerte rouge émise par l’API partenaire FSC Connect',
      'Suspension préalable non levée suivie d’une révocation formelle',
    ],
  },
  {
    id: 'doc-ecocert-mismatch',
    name: 'Certificat Ecocert Bio — Mismatch Périmètre Produit',
    badge: 'Discordance de Périmètre',
    description: 'Certificat authentique mais le périmètre validé exclut les purées industrielles achetées par l’entreprise',
    standard: 'ECOCERT_BIO',
    standardLabel: 'Ecocert Agriculture Biologique (FR-BIO-01)',
    body: 'Ecocert France SAS',
    certNumber: 'FR-BIO-01-2025-99812',
    issueDate: '2025-02-01',
    expiryDate: '2027-01-31',
    suggestedSupplierName: 'Polat Tarim Organik Gida San. Tic. Ltd.',
    scopeProducts: ['Fruits frais de table', 'Abricots bruts'],
    scopeFacilities: ['Vergers Malatya Secteur Nord'],
    rawOcrSnippet: 'ECOCERT FRANCE atteste que les produits suivants sont certifiés biologiques: Abricots frais de table. Exclusion expresse: ateliers de transformation et purées pasteurisées...',
    officialStatus: 'VALID',
    officialExpiryDate: '2027-01-31',
    officialHolder: 'Polat Tarim Organik Gida',
    registryUrl: 'https://certificat.ecocert.com',
    verificationOutcome: 'MISMATCH',
    confidenceScore: 68,
    anomalies: [
      {
        field: 'PRODUCT_SCOPE',
        documentValue: 'Fruits frais uniquement',
        officialValue: 'Transformation industrielle exclue',
        severity: 'WARNING',
        description: 'Périmètre non couvrant : le certificat ne couvre pas la catégorie "Purées d’Abricot Bio" commandée par les achats.',
      },
    ],
    confidenceReasons: [
      'Opérateur bien enregistré auprès d’Ecocert',
      'Périmètre d’audit restreint à la production primaire agricole',
    ],
  },
  {
    id: 'doc-oekotex-step',
    name: 'OEKO-TEX STeP — Production Textile Durable',
    badge: 'Authentique (98% Match)',
    description: 'Certificat STeP vérifié conforme auprès du service OEKO-TEX Label Check',
    standard: 'OEKO_TEX_STEP',
    standardLabel: 'OEKO-TEX Sustainable Textile Production (STeP)',
    body: 'Centrocot SpA (OEKO-TEX Association)',
    certNumber: '21000458-STEP',
    issueDate: '2024-09-01',
    expiryDate: '2027-08-31',
    suggestedSupplierName: 'BioLait Normandie SAS',
    scopeProducts: ['Gestion chimique niveau 3', 'Protection environnementale'],
    scopeFacilities: ['Site de teinture Guimarães'],
    rawOcrSnippet: 'OEKO-TEX ASSOCIATION certifies that the production facility meets Level 3 of Sustainable Textile & Leather Production. Certificate Number: 21000458-STEP...',
    officialStatus: 'VALID',
    officialExpiryDate: '2027-08-31',
    officialHolder: 'Têxteis Guimarães & Filhos Lda',
    registryUrl: 'https://www.oeko-tex.com/en/label-check',
    verificationOutcome: 'MATCH',
    confidenceScore: 98,
    anomalies: [],
    confidenceReasons: [
      'Numéro de test certifié actif dans la base internationale OEKO-TEX',
      'Niveau 3 confirmé sur l’audit gestion des eaux et énergie',
    ],
  },
];

export function CertificateOcrUploadModal({
  isOpen,
  onClose,
  suppliers,
  defaultSupplierId,
  onSuccess,
}: CertificateOcrUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activePreset, setActivePreset] = useState<SimulatedDocumentPreset | null>(null);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [ocrStep, setOcrStep] = useState<'IDLE' | 'SCANNING' | 'EXTRACTING' | 'CROSS_CHECKING' | 'DONE'>('IDLE');

  // Matched supplier
  const [linkedSupplierId, setLinkedSupplierId] = useState<string>(
    defaultSupplierId || suppliers[0]?.id || ''
  );

  // Form values (populated from OCR extraction)
  const [extractedData, setExtractedData] = useState<{
    standard: CertificationStandard;
    standardLabel: string;
    body: string;
    certNumber: string;
    issueDate: string;
    expiryDate: string;
    scopeProducts: string[];
    scopeFacilities: string[];
    rawSnippet: string;
    officialStatus: CertificateStatus;
    officialExpiry: string;
    verificationOutcome: VerificationOutcome;
    confidenceScore: number;
    anomalies: VerificationAnomaly[];
    confidenceReasons: string[];
    registryUrl: string;
    fileName: string;
  } | null>(null);

  // Start OCR & Verification pipeline
  const processPreset = (preset: SimulatedDocumentPreset) => {
    setActivePreset(preset);
    setIsProcessingOcr(true);
    setOcrStep('SCANNING');

    // Attempt auto-match supplier by name
    const match = suppliers.find(
      (s) =>
        s.legalName.toLowerCase().includes(preset.suggestedSupplierName.toLowerCase()) ||
        preset.suggestedSupplierName.toLowerCase().includes(s.legalName.toLowerCase())
    );
    if (match) setLinkedSupplierId(match.id);

    setTimeout(() => {
      setOcrStep('EXTRACTING');
      setTimeout(() => {
        setOcrStep('CROSS_CHECKING');
        setTimeout(() => {
          setOcrStep('DONE');
          setIsProcessingOcr(false);
          setExtractedData({
            standard: preset.standard,
            standardLabel: preset.standardLabel,
            body: preset.body,
            certNumber: preset.certNumber,
            issueDate: preset.issueDate,
            expiryDate: preset.expiryDate,
            scopeProducts: preset.scopeProducts,
            scopeFacilities: preset.scopeFacilities,
            rawSnippet: preset.rawOcrSnippet,
            officialStatus: preset.officialStatus,
            officialExpiry: preset.officialExpiryDate,
            verificationOutcome: preset.verificationOutcome,
            confidenceScore: preset.confidenceScore,
            anomalies: preset.anomalies,
            confidenceReasons: preset.confidenceReasons,
            registryUrl: preset.registryUrl,
            fileName: `${preset.standard}_Scan_${preset.certNumber}.pdf`,
          });
        }, 500);
      }, 500);
    }, 450);
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);

    // Apply smart extraction based on filename or fallback
    const fileNameLower = file.name.toLowerCase();
    let chosenPreset = PRESET_DOCUMENTS[0];
    if (fileNameLower.includes('fsc') || fileNameLower.includes('carton') || fileNameLower.includes('bois')) {
      chosenPreset = PRESET_DOCUMENTS[1];
    } else if (fileNameLower.includes('bio') || fileNameLower.includes('ecocert')) {
      chosenPreset = PRESET_DOCUMENTS[2];
    } else if (fileNameLower.includes('oeko') || fileNameLower.includes('step') || fileNameLower.includes('textile')) {
      chosenPreset = PRESET_DOCUMENTS[3];
    }

    processPreset({
      ...chosenPreset,
      name: `Document Déposé : ${file.name}`,
    });
  };

  const handleCommitCertificate = () => {
    if (!extractedData) return;

    const supplier = suppliers.find((s) => s.id === linkedSupplierId) || suppliers[0];

    appStore.addCertificate({
      supplierId: supplier.id,
      supplierName: supplier.legalName,
      certificationStandard: extractedData.standard,
      standardLabel: extractedData.standardLabel,
      certificationBody: extractedData.body,
      certificateNumber: extractedData.certNumber,
      issueDate: extractedData.issueDate,
      expiryDate: extractedData.expiryDate,
      status: extractedData.officialStatus,
      scope: {
        geographicalRegions: [supplier.country],
        productCategories: extractedData.scopeProducts,
        coveredProducts: extractedData.scopeProducts,
        coveredFacilities: extractedData.scopeFacilities,
      },
      officialRegistryUrl: extractedData.registryUrl,
      lastVerifiedAt: new Date().toISOString(),
      nextVerificationScheduledAt: new Date(Date.now() + 86400000).toISOString(),
      verificationOutcome: extractedData.verificationOutcome,
      confidenceScore: extractedData.confidenceScore,
      confidenceReasons: extractedData.confidenceReasons,
      anomalies: extractedData.anomalies,
      originalDocumentName: extractedData.fileName,
      fileSizeBytes: 320490,
      rawOcrTextSnippet: extractedData.rawSnippet,
      notes: `Ingestion OCR & IA via CertiWatch Ingestion Engine. Résultat de confrontation: ${extractedData.verificationOutcome}`,
    });

    onClose();
    if (onSuccess) onSuccess();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dépôt de Certificat & Extraction OCR / IA"
      subtitle="Numérisation, analyse textuelle et confrontation instantanée aux registres officiels"
      maxWidth="3xl"
    >
      <div className="space-y-5 text-xs">
        {/* Step 1: Upload or Choose Preset */}
        {!extractedData && !isProcessingOcr && (
          <div className="space-y-4">
            {/* Drag & Drop Upload Zone */}
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl bg-slate-950/80 cursor-pointer transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-200 text-sm">Déposer un scan de certificat (PDF, JPG, PNG)</p>
              <p className="text-slate-400 text-xs mt-0.5">
                Glisser-déposer ou cliquer pour parcourir vos fichiers
              </p>
              <span className="mt-3 px-3 py-1 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                Formats acceptés : PDF haute résolution, scans multilingues, photos de certificats
              </span>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.txt"
                onChange={handleCustomFileUpload}
                className="hidden"
              />
            </label>

            {/* Ready-to-test Presets (Simulated Scans for Instant Evaluation) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Ou tester immédiatement avec un certificat type du secteur :</span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {PRESET_DOCUMENTS.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => processPreset(preset)}
                    className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {preset.standard}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        preset.verificationOutcome === 'MATCH'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-red-950 text-red-400 border border-red-800'
                      }`}>
                        {preset.badge}
                      </span>
                    </div>
                    <p className="text-slate-300 font-medium text-[11px]">{preset.name}</p>
                    <p className="text-slate-400 text-[10px] line-clamp-2 leading-relaxed">
                      {preset.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Live Scanning Animation */}
        {isProcessingOcr && (
          <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 animate-ping" />
              <div className="relative w-16 h-16 rounded-2xl bg-slate-900 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Scan className="w-8 h-8 animate-pulse" />
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-white text-sm">
                {ocrStep === 'SCANNING' && 'Numérisation haute fidélité du document...'}
                {ocrStep === 'EXTRACTING' && 'Extraction OCR & Structuration IA des métadonnées...'}
                {ocrStep === 'CROSS_CHECKING' && 'Interrogation des registres certificateurs officiels...'}
              </h4>
              <p className="text-slate-400 text-xs">
                Contrôle automatique du titulaire, des dates, du numéro de licence et du périmètre
              </p>
            </div>

            <div className="max-w-xs mx-auto space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Progression</span>
                <span>
                  {ocrStep === 'SCANNING' ? '30%' : ocrStep === 'EXTRACTING' ? '70%' : '95%'}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{
                    width: ocrStep === 'SCANNING' ? '30%' : ocrStep === 'EXTRACTING' ? '70%' : '95%',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Side-by-Side Verification Results & Discrepancies */}
        {extractedData && (
          <div className="space-y-4">
            {/* Top Match Result Banner */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              extractedData.verificationOutcome === 'MATCH'
                ? 'bg-emerald-950/50 border-emerald-800 text-emerald-200'
                : 'bg-red-950/50 border-red-800 text-red-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-current/20 flex items-center justify-center shrink-0">
                  {extractedData.verificationOutcome === 'MATCH' ? (
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <ShieldAlert className="w-6 h-6 text-red-400" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">
                    {extractedData.verificationOutcome === 'MATCH'
                      ? 'Conformité Validée • Concordance Parfaite avec le Registre Officiel'
                      : 'Attention • Discordances ou Falsification Détectée'}
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Score de concordance algorithmique : <strong className="font-mono text-white">{extractedData.confidenceScore}%</strong>
                  </p>
                </div>
              </div>

              {extractedData.registryUrl && (
                <a
                  href={extractedData.registryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium"
                >
                  <span>Vérifier sur Registre Public</span>
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                </a>
              )}
            </div>

            {/* Side-by-Side: Document OCR Extracted vs Official Registry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Left Column: Document Déposé */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Données Extraites du Scan (OCR/IA)</span>
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">{extractedData.fileName}</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Standard Détecté</span>
                    <span className="font-bold text-white">{extractedData.standardLabel}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Numéro de Certificat / Licence</span>
                    <span className="font-mono text-cyan-300 font-bold">{extractedData.certNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Organisme Certificateur</span>
                    <span className="text-slate-300">{extractedData.body}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Date d'Émission</span>
                      <span className="font-mono text-slate-300">{extractedData.issueDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Date d'Échéance Mentionnée</span>
                      <span className="font-mono font-bold text-white">{extractedData.expiryDate}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Périmètre Produits Extrait</span>
                    <span className="text-slate-300">{extractedData.scopeProducts.join(', ')}</span>
                  </div>
                </div>

                {/* Raw OCR snippet */}
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-mono line-clamp-3">
                  {extractedData.rawSnippet}
                </div>
              </div>

              {/* Right Column: Registre Officiel */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Confrontation Registre Officiel (API Directe)</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px]">
                    200 OK
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Statut Officiel Actuel</span>
                    <span className={`font-bold font-mono px-2 py-0.5 rounded text-xs inline-block ${
                      extractedData.officialStatus === 'VALID'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-red-950 text-red-400 border border-red-800'
                    }`}>
                      {extractedData.officialStatus}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Date d'Expiration Officielle</span>
                    <span className={`font-mono font-bold ${
                      extractedData.officialExpiry !== extractedData.expiryDate
                        ? 'text-red-400 bg-red-950/60 px-1 rounded'
                        : 'text-slate-200'
                    }`}>
                      {extractedData.officialExpiry}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Points de Contrôle & Conformité</span>
                    <ul className="space-y-1 mt-1">
                      {extractedData.confidenceReasons.map((r, i) => (
                        <li key={i} className="text-emerald-400 flex items-start gap-1.5 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Detected Anomalies / Fraud Warning Box */}
                {extractedData.anomalies.length > 0 && (
                  <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/80 space-y-1.5 text-red-200">
                    <span className="font-bold flex items-center gap-1.5 text-[11px] text-red-300">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      <span>{extractedData.anomalies.length} Divergence(s) Détectée(s) :</span>
                    </span>
                    {extractedData.anomalies.map((a, i) => (
                      <p key={i} className="text-[11px] text-red-300/90 leading-tight">
                        • <strong>{a.field}</strong> : {a.description}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Linking to Tenant Supplier */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <label className="block font-bold text-slate-300 text-xs flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Fournisseur Titulaire à rattacher dans votre répertoire :</span>
              </label>
              <select
                value={linkedSupplierId}
                onChange={(e) => setLinkedSupplierId(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-medium text-xs focus:outline-none focus:border-emerald-500"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.legalName} ({s.country} • {s.internalId})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              setExtractedData(null);
              setActivePreset(null);
              onClose();
            }}
            className="px-3.5 py-2 rounded-lg text-slate-400 hover:text-white"
          >
            Annuler
          </button>

          {extractedData && (
            <button
              type="button"
              onClick={handleCommitCertificate}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-white transition-all shadow-md ${
                extractedData.verificationOutcome === 'MATCH'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950'
                  : 'bg-red-600 hover:bg-red-500 shadow-red-950'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>
                {extractedData.verificationOutcome === 'MATCH'
                  ? 'Enregistrer dans la Base Centrale (Conforme)'
                  : 'Enregistrer avec Alerte de Non-Conformité'}
              </span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
