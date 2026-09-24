import React, { useState } from 'react';
import { Supplier, SupplierTier, SpendCriticality } from '../../types/supplier';
import { Modal } from '../ui/Modal';
import { appStore } from '../../db/store';
import {
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Download,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface SupplierImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: () => void;
}

interface ParsedSupplierRow {
  rowNum: number;
  legalName: string;
  tradeName?: string;
  country: string;
  countryCode: string;
  address: string;
  internalId: string;
  businessRegistrationNumber: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  productCategories: string[];
  tier?: SupplierTier;
  spendCriticality?: SpendCriticality;
  validationStatus: 'VALID' | 'DUPLICATE' | 'ERROR';
  duplicateMatchName?: string;
  errorMessage?: string;
}

export function SupplierImportModal({ isOpen, onClose, onImportSuccess }: SupplierImportModalProps) {
  const [duplicateStrategy, setDuplicateStrategy] = useState<'SKIP_EXISTING' | 'UPDATE_EXISTING' | 'CREATE_COPY'>('SKIP_EXISTING');
  const [parsedRows, setParsedRows] = useState<ParsedSupplierRow[]>([]);
  const [importSummary, setImportSummary] = useState<{
    totalRead: number;
    imported: number;
    updated: number;
    skipped: number;
    duplicatesFound: number;
    errors: number;
  } | null>(null);

  const existingSuppliers = appStore.getTenantSuppliers();

  // Validate raw rows against existing tenant database for collisions
  const validateAndSetRows = (
    rawRows: Array<{
      legalName: string;
      tradeName?: string;
      country?: string;
      countryCode?: string;
      address?: string;
      internalId?: string;
      businessRegistrationNumber?: string;
      contactName?: string;
      contactEmail?: string;
      contactPhone?: string;
      productCategories?: string[] | string;
      tier?: SupplierTier;
      spendCriticality?: SpendCriticality;
    }>
  ) => {
    const validated: ParsedSupplierRow[] = rawRows.map((r, idx) => {
      const rowNum = idx + 1;
      const legalName = (r.legalName || '').trim();
      const internalId = (r.internalId || '').trim();
      const regNumber = (r.businessRegistrationNumber || '').trim();
      const country = (r.country || 'France').trim();
      const countryCode = (r.countryCode || 'FR').toUpperCase().slice(0, 2);

      let categories: string[] = [];
      if (Array.isArray(r.productCategories)) {
        categories = r.productCategories;
      } else if (typeof r.productCategories === 'string') {
        categories = r.productCategories.split(';').map((c) => c.trim()).filter(Boolean);
      }

      // Check required fields
      if (!legalName) {
        return {
          rowNum,
          legalName: 'Ligne vide',
          country,
          countryCode,
          address: '',
          internalId,
          businessRegistrationNumber: regNumber,
          contactName: '',
          contactEmail: '',
          contactPhone: '',
          productCategories: [],
          validationStatus: 'ERROR',
          errorMessage: 'Raison sociale obligatoire manquante',
        };
      }

      // Check duplicates against current tenant
      const dup = existingSuppliers.find((s) => {
        if (internalId && s.internalId.toLowerCase() === internalId.toLowerCase()) return true;
        if (regNumber && s.businessRegistrationNumber.toLowerCase() === regNumber.toLowerCase()) return true;
        if (s.legalName.toLowerCase() === legalName.toLowerCase()) return true;
        return false;
      });

      if (dup) {
        return {
          rowNum,
          legalName,
          tradeName: r.tradeName,
          country,
          countryCode,
          address: r.address || 'Adresse à confirmer',
          internalId: internalId || dup.internalId,
          businessRegistrationNumber: regNumber || dup.businessRegistrationNumber,
          contactName: r.contactName || 'Contact Approvisionnement',
          contactEmail: r.contactEmail || 'contact@fournisseur.com',
          contactPhone: r.contactPhone || '+33 1 00 00 00 00',
          productCategories: categories.length > 0 ? categories : ['Général'],
          tier: r.tier || 'TIER_1',
          spendCriticality: r.spendCriticality || 'STANDARD',
          validationStatus: 'DUPLICATE',
          duplicateMatchName: dup.legalName,
        };
      }

      return {
        rowNum,
        legalName,
        tradeName: r.tradeName,
        country,
        countryCode,
        address: r.address || 'Adresse à confirmer',
        internalId: internalId || 'SUP-' + Math.floor(Math.random() * 9000 + 1000),
        businessRegistrationNumber: regNumber || 'FR ' + Math.floor(Math.random() * 900000000 + 100000000),
        contactName: r.contactName || 'Responsable Approvisionnement',
        contactEmail: r.contactEmail || 'contact@fournisseur.com',
        contactPhone: r.contactPhone || '+33 1 00 00 00 00',
        productCategories: categories.length > 0 ? categories : ['Matières Premières'],
        tier: r.tier || 'TIER_1',
        spendCriticality: r.spendCriticality || 'STANDARD',
        validationStatus: 'VALID',
      };
    });

    setParsedRows(validated);
    setImportSummary(null);
  };

  // Sample batch loader for fast testing
  const loadSampleDataset = () => {
    const samples = [
      {
        legalName: 'BioLait Normandie SAS', // Will collide with existing seed supplier!
        internalId: 'SUP-FR-1042',
        businessRegistrationNumber: 'FR 84 412 876 201',
        country: 'France',
        countryCode: 'FR',
        address: '12 Route des Bocages, 61100 Flers',
        contactName: 'Thierry Duval',
        contactEmail: 't.duval@biolait-normandie.fr',
        contactPhone: '+33 2 33 65 44 10',
        productCategories: ['Lait Bio', 'Beurre Pasteurisé Bio'],
        tier: 'TIER_1' as const,
        spendCriticality: 'STRATEGIC' as const,
      },
      {
        legalName: 'Nordic Agro-Packaging OY',
        internalId: 'SUP-FI-8812',
        businessRegistrationNumber: 'FI 2398411-9',
        country: 'Finlande',
        countryCode: 'FI',
        address: 'Metsäkatu 14, 00100 Helsinki',
        contactName: 'Eero Lehtinen',
        contactEmail: 'eero@nordic-agropack.fi',
        contactPhone: '+358 9 412 00 90',
        productCategories: ['Emballages PEFC', 'Cartons Kraft Recyclés'],
        tier: 'TIER_1' as const,
        spendCriticality: 'MAJOR' as const,
      },
      {
        legalName: 'Cooperativa Agrícola del Valle Verde',
        internalId: 'SUP-CO-4109',
        businessRegistrationNumber: 'NIT 900.321.442-1',
        country: 'Colombie',
        countryCode: 'CO',
        address: 'Carrera 7 #45-12, Medellín, Antioquia',
        contactName: 'Mateo Osorio',
        contactEmail: 'm.osorio@valleverde.co',
        contactPhone: '+57 4 380 9100',
        productCategories: ['Café Équitable Bio', 'Cacao Criollo'],
        tier: 'TIER_2' as const,
        spendCriticality: 'MAJOR' as const,
      },
      {
        legalName: 'Filature Méditerranéenne de Coton',
        internalId: 'SUP-GR-6022',
        businessRegistrationNumber: 'EL 998812345',
        country: 'Grèce',
        countryCode: 'GR',
        address: 'Plateia Dimokratias 5, 41221 Larissa',
        contactName: 'Dimitris Kostas',
        contactEmail: 'kostas@filature-med.gr',
        contactPhone: '+30 2410 554 120',
        productCategories: ['Fils de Coton GOTS', 'Toiles Écologiques'],
        tier: 'TIER_2' as const,
        spendCriticality: 'STANDARD' as const,
      },
    ];

    validateAndSetRows(samples);
  };

  // CSV File parser
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (file.name.endsWith('.json')) {
          const json = JSON.parse(text);
          if (Array.isArray(json)) {
            validateAndSetRows(json);
            return;
          }
        }

        // Parse CSV
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length <= 1) return;

        // Auto detect delimiter
        const firstLine = lines[0];
        const delimiter = firstLine.includes(';') ? ';' : ',';
        const headers = firstLine.split(delimiter).map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase());

        const rows: any[] = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const cols = line.split(delimiter).map((c) => c.trim().replace(/^"|"$/g, ''));
          const rowObj: any = {};
          headers.forEach((h, idx) => {
            const val = cols[idx] || '';
            if (h.includes('nom') || h.includes('raison') || h.includes('name')) rowObj.legalName = val;
            else if (h.includes('interne') || h.includes('id') || h.includes('code')) rowObj.internalId = val;
            else if (h.includes('tva') || h.includes('siret') || h.includes('tax') || h.includes('reg'))
              rowObj.businessRegistrationNumber = val;
            else if (h.includes('pays') || h.includes('country')) rowObj.country = val;
            else if (h.includes('email') || h.includes('courriel')) rowObj.contactEmail = val;
            else if (h.includes('contact') || h.includes('responsable')) rowObj.contactName = val;
            else if (h.includes('tel') || h.includes('phone')) rowObj.contactPhone = val;
            else if (h.includes('adresse') || h.includes('address')) rowObj.address = val;
            else if (h.includes('cat') || h.includes('produit')) rowObj.productCategories = val;
          });
          if (rowObj.legalName) {
            rows.push(rowObj);
          }
        }

        validateAndSetRows(rows);
      } catch (err) {
        console.error('Error parsing file:', err);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      'Raison Sociale;Identifiant Interne;SIRET ou TVA;Pays;Code Pays;Adresse;Contact;Email;Telephone;Categories Produits;Tier;Criticite\n' +
      'Exemple Fournisseur SAS;SUP-FR-9901;FR 12 345 678 901;France;FR;10 Rue de la Paix, 75001 Paris;Jean Dupont;qualite@exemple.fr;+33 1 40 00 00 00;Coton Bio; Packaging;TIER_1;STRATEGIC\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'modele_import_fournisseurs_certiwatch.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExecuteImport = () => {
    if (parsedRows.length === 0) return;

    const result = appStore.batchImportSuppliers(
      parsedRows.map((r) => ({
        legalName: r.legalName,
        tradeName: r.tradeName,
        country: r.country,
        countryCode: r.countryCode,
        address: r.address,
        internalId: r.internalId,
        businessRegistrationNumber: r.businessRegistrationNumber,
        contactName: r.contactName,
        contactEmail: r.contactEmail,
        contactPhone: r.contactPhone,
        productCategories: r.productCategories,
        tier: r.tier,
        spendCriticality: r.spendCriticality,
      })),
      duplicateStrategy
    );

    setImportSummary({
      totalRead: result.totalRead,
      imported: result.imported,
      updated: result.updated,
      skipped: result.skipped,
      duplicatesFound: result.duplicatesFound,
      errors: result.errors,
    });

    if (onImportSuccess) onImportSuccess();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import en Masse & Détection de Doublons Fournisseurs"
      subtitle="Intégration de répertoires d'achats avec validation préalable et déduplication"
      maxWidth="3xl"
    >
      <div className="space-y-6 text-xs">
        {/* Step 1: Upload or Load Sample */}
        {!importSummary && (
          <>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200">Importer un fichier CSV ou JSON</h4>
                  <p className="text-slate-400 text-[11px]">
                    Colonnes reconnues : Raison sociale, SIRET/TVA, Pays, ID Interne, Catégories
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Modèle CSV</span>
                </button>

                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer shadow-md transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Sélectionner fichier</span>
                  <input
                    type="file"
                    accept=".csv,.txt,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Quick Demo Dataset trigger */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/40 text-[11px] text-cyan-300">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Tester immédiatement avec un jeu de 4 fournisseurs (dont 1 doublon détecté)</span>
              </div>
              <button
                type="button"
                onClick={loadSampleDataset}
                className="px-2.5 py-1 rounded bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 text-cyan-200 font-semibold transition-colors"
              >
                Charger le jeu d'essai
              </button>
            </div>

            {/* Deduplication Strategy Settings */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <label className="block font-bold text-slate-300 uppercase tracking-wide text-[10px]">
                Stratégie de résolution en cas de collision / doublon :
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label className={`p-2.5 rounded-lg border cursor-pointer flex items-start gap-2 transition-all ${
                  duplicateStrategy === 'SKIP_EXISTING'
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="dupStrategy"
                    checked={duplicateStrategy === 'SKIP_EXISTING'}
                    onChange={() => setDuplicateStrategy('SKIP_EXISTING')}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="font-semibold block text-xs">Ignorer les doublons</span>
                    <span className="text-[10px] text-slate-400">Conserve la fiche existante sans modification</span>
                  </div>
                </label>

                <label className={`p-2.5 rounded-lg border cursor-pointer flex items-start gap-2 transition-all ${
                  duplicateStrategy === 'UPDATE_EXISTING'
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="dupStrategy"
                    checked={duplicateStrategy === 'UPDATE_EXISTING'}
                    onChange={() => setDuplicateStrategy('UPDATE_EXISTING')}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="font-semibold block text-xs">Mettre à jour existant</span>
                    <span className="text-[10px] text-slate-400">Enrichit les contacts et catégories</span>
                  </div>
                </label>

                <label className={`p-2.5 rounded-lg border cursor-pointer flex items-start gap-2 transition-all ${
                  duplicateStrategy === 'CREATE_COPY'
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="dupStrategy"
                    checked={duplicateStrategy === 'CREATE_COPY'}
                    onChange={() => setDuplicateStrategy('CREATE_COPY')}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="font-semibold block text-xs">Créer une copie</span>
                    <span className="text-[10px] text-slate-400">Attribue un nouvel identifiant interne</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Pre-validation Preview Table */}
            {parsedRows.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-300 text-xs">
                    Prévisualisation avant injection ({parsedRows.length} lignes)
                  </h4>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-emerald-400 font-medium">
                      ✓ {parsedRows.filter((r) => r.validationStatus === 'VALID').length} Nouveaux
                    </span>
                    <span className="text-amber-400 font-medium">
                      ⚠ {parsedRows.filter((r) => r.validationStatus === 'DUPLICATE').length} Doublons
                    </span>
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950">
                  <table className="w-full text-left text-slate-300 text-[11px]">
                    <thead className="bg-slate-900/80 sticky top-0 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="py-2 px-3">Statut</th>
                        <th className="py-2 px-3">Raison Sociale</th>
                        <th className="py-2 px-3">ID Interne</th>
                        <th className="py-2 px-3">N° TVA / SIRET</th>
                        <th className="py-2 px-3">Pays</th>
                        <th className="py-2 px-3">Catégories</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {parsedRows.map((row) => (
                        <tr key={row.rowNum} className="hover:bg-slate-900/40">
                          <td className="py-2 px-3 whitespace-nowrap">
                            {row.validationStatus === 'VALID' && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px]">
                                Nouveau
                              </span>
                            )}
                            {row.validationStatus === 'DUPLICATE' && (
                              <span
                                title={`Collision avec : ${row.duplicateMatchName}`}
                                className="px-1.5 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-400 text-[10px]"
                              >
                                Doublon ({row.duplicateMatchName})
                              </span>
                            )}
                            {row.validationStatus === 'ERROR' && (
                              <span className="px-1.5 py-0.5 rounded bg-red-950 border border-red-800 text-red-400 text-[10px]">
                                Erreur
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 font-sans font-medium text-white">{row.legalName}</td>
                          <td className="py-2 px-3 text-slate-400">{row.internalId}</td>
                          <td className="py-2 px-3 text-slate-400">{row.businessRegistrationNumber}</td>
                          <td className="py-2 px-3 text-slate-300 font-sans">{row.country} ({row.countryCode})</td>
                          <td className="py-2 px-3 font-sans text-slate-400 truncate max-w-36">
                            {row.productCategories.join(', ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Step 2: Post-Import Summary Report */}
        {importSummary && (
          <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-5 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Import par lot exécuté avec succès</h3>
              <p className="text-slate-400 text-xs">
                Les dossiers fournisseurs ont été injectés dans le système de surveillance continue.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Fournisseurs Créés</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">{importSummary.imported}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Fiches Mises à Jour</span>
                <span className="text-lg font-bold text-cyan-400 font-mono">{importSummary.updated}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Doublons Ignorés</span>
                <span className="text-lg font-bold text-amber-400 font-mono">{importSummary.skipped}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Lignes Lues</span>
                <span className="text-lg font-bold text-slate-200 font-mono">{importSummary.totalRead}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
            >
              Fermer et Consulter le Répertoire
            </button>
          </div>
        )}

        {/* Footer actions */}
        {!importSummary && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                setParsedRows([]);
                setImportSummary(null);
                onClose();
              }}
              className="px-3.5 py-2 rounded-lg text-slate-400 hover:text-white"
            >
              Annuler
            </button>

            <button
              type="button"
              disabled={parsedRows.length === 0}
              onClick={handleExecuteImport}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md ${
                parsedRows.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Play className="w-4 h-4" />
              <span>Valider et Importer ({parsedRows.length} fournisseurs)</span>
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
