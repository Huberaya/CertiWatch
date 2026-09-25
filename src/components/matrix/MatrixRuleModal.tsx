import React, { useState, useEffect } from 'react';
import { ComplianceMatrixRule, CountryScopeCondition } from '../../types/matrix';
import { CertificationStandard } from '../../types/certificate';
import { Modal } from '../ui/Modal';
import { appStore } from '../../db/store';
import { ShieldAlert, Plus, Trash2, Check, AlertCircle, HelpCircle } from 'lucide-react';

interface MatrixRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  ruleToEdit?: ComplianceMatrixRule | null;
}

const AVAILABLE_STANDARDS: { value: CertificationStandard; label: string; desc: string }[] = [
  { value: 'ECOCERT_BIO', label: 'Ecocert Bio (CE 2018/848)', desc: 'Agriculture biologique européenne' },
  { value: 'GOTS', label: 'GOTS (Global Organic Textile)', desc: 'Textile biologique et critères sociaux' },
  { value: 'FSC', label: 'FSC (Forest Stewardship Council)', desc: 'Gestion forestière et traçabilité papier/carton' },
  { value: 'OEKO_TEX_100', label: 'OEKO-TEX Standard 100', desc: 'Innocuité chimique et sécurité textile' },
  { value: 'FAIRTRADE', label: 'Fairtrade / Max Havelaar', desc: 'Commerce équitable et revenu décent' },
];

export function MatrixRuleModal({ isOpen, onClose, ruleToEdit }: MatrixRuleModalProps) {
  const [productCategory, setProductCategory] = useState('');
  const [requiredStandards, setRequiredStandards] = useState<CertificationStandard[]>(['ECOCERT_BIO']);
  const [acceptableAlternatives, setAcceptableAlternatives] = useState<CertificationStandard[]>([]);
  const [criticality, setCriticality] = useState<'STRICT_BLOCK' | 'WARNING_ONLY' | 'CONDITIONAL'>('STRICT_BLOCK');
  const [countryCondition, setCountryCondition] = useState<CountryScopeCondition>('ALL_COUNTRIES');
  const [applicableCountriesStr, setApplicableCountriesStr] = useState('PE, TR, IN, CN');
  const [volumeThresholdEnabled, setVolumeThresholdEnabled] = useState(false);
  const [minAnnualSpendEur, setMinAnnualSpendEur] = useState(50000);
  const [enforceFacilityAudit, setEnforceFacilityAudit] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (ruleToEdit) {
      setProductCategory(ruleToEdit.productCategory);
      setRequiredStandards(ruleToEdit.requiredStandards);
      setAcceptableAlternatives(ruleToEdit.acceptableAlternativeStandards || []);
      setCriticality(ruleToEdit.criticality);
      setCountryCondition(ruleToEdit.countryCondition || 'ALL_COUNTRIES');
      setApplicableCountriesStr((ruleToEdit.applicableCountries || []).join(', '));
      setVolumeThresholdEnabled(ruleToEdit.volumeThreshold?.enabled || false);
      setMinAnnualSpendEur(ruleToEdit.volumeThreshold?.minAnnualSpendEur || 50000);
      setEnforceFacilityAudit(ruleToEdit.enforceFacilityAudit);
      setNotes(ruleToEdit.notes || '');
    } else {
      setProductCategory('');
      setRequiredStandards(['ECOCERT_BIO']);
      setAcceptableAlternatives([]);
      setCriticality('STRICT_BLOCK');
      setCountryCondition('ALL_COUNTRIES');
      setApplicableCountriesStr('PE, TR, IN, CN');
      setVolumeThresholdEnabled(false);
      setMinAnnualSpendEur(50000);
      setEnforceFacilityAudit(true);
      setNotes('');
    }
  }, [ruleToEdit, isOpen]);

  const handleToggleRequired = (std: CertificationStandard) => {
    if (requiredStandards.includes(std)) {
      if (requiredStandards.length > 1) {
        setRequiredStandards(requiredStandards.filter((s) => s !== std));
      }
    } else {
      setRequiredStandards([...requiredStandards, std]);
      setAcceptableAlternatives(acceptableAlternatives.filter((s) => s !== std));
    }
  };

  const handleToggleAlternative = (std: CertificationStandard) => {
    if (acceptableAlternatives.includes(std)) {
      setAcceptableAlternatives(acceptableAlternatives.filter((s) => s !== std));
    } else {
      setAcceptableAlternatives([...acceptableAlternatives, std]);
      setRequiredStandards(requiredStandards.filter((s) => s !== std));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productCategory.trim()) return;

    const applicableCountries = countryCondition === 'SPECIFIC_COUNTRIES'
      ? applicableCountriesStr.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean)
      : undefined;

    if (ruleToEdit) {
      appStore.updateMatrixRule(ruleToEdit.id, {
        productCategory: productCategory.trim(),
        requiredStandards,
        acceptableAlternativeStandards: acceptableAlternatives,
        criticality,
        countryCondition,
        applicableCountries,
        volumeThreshold: {
          enabled: volumeThresholdEnabled,
          minAnnualSpendEur: Number(minAnnualSpendEur),
        },
        enforceFacilityAudit,
        notes: notes.trim(),
      });
    } else {
      appStore.addMatrixRule({
        productCategory: productCategory.trim(),
        requiredStandards,
        acceptableAlternativeStandards: acceptableAlternatives,
        criticality,
        countryCondition,
        applicableCountries,
        volumeThreshold: {
          enabled: volumeThresholdEnabled,
          minAnnualSpendEur: Number(minAnnualSpendEur),
        },
        enforceFacilityAudit,
        notes: notes.trim() || 'Règle configurée pour le contrôle d’éligibilité des approvisionnements responsables.',
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={ruleToEdit ? 'Modifier la Règle d’Exigence' : 'Nouvelle Règle d’Exigence Produit'}
      subtitle="Politique d'approvisionnement responsable & blocage de commandes ERP"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        {/* Product Category */}
        <div>
          <label className="text-slate-300 font-semibold block mb-1">
            Famille d'Achat / Catégorie de Produit <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={productCategory}
            onChange={(e) => setProductCategory(e.target.value)}
            placeholder="Ex : Coton Biologique Peigné, Lait & Produits Laitiers, Emballages Carton..."
            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Required Standards selection */}
        <div>
          <label className="text-slate-300 font-semibold block mb-1.5">
            Standards & Certifications Obligatoires <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {AVAILABLE_STANDARDS.map((std) => {
              const isRequired = requiredStandards.includes(std.value);
              const isAlt = acceptableAlternatives.includes(std.value);

              return (
                <div
                  key={std.value}
                  className={`p-2.5 rounded-lg border transition-all ${
                    isRequired
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                      : isAlt
                      ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-bold text-slate-200">{std.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{std.desc}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => handleToggleRequired(std.value)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        isRequired
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {isRequired ? '✓ Requis' : '+ Requis'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleAlternative(std.value)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        isAlt
                          ? 'bg-cyan-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {isAlt ? '✓ Alternative' : '+ Alternative'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Criticality & Impact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Conséquence en cas de non-conformité
            </label>
            <select
              value={criticality}
              onChange={(e) => setCriticality(e.target.value as any)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="STRICT_BLOCK">Blocage Strict Commande (Rejet ERP 403)</option>
              <option value="CONDITIONAL">Conditionnel (Validation Manuelle Dérogation)</option>
              <option value="WARNING_ONLY">Avertissement Simple (Sans blocage de PO)</option>
            </select>
            <p className="text-[10px] text-slate-500 mt-1">
              {criticality === 'STRICT_BLOCK' && 'Toute tentative de PO dans SAP/Coupa sera rejetée automatiquement.'}
              {criticality === 'CONDITIONAL' && 'La commande est mise en attente d’approbation par le service Achats/RSE.'}
              {criticality === 'WARNING_ONLY' && 'La commande est autorisée avec alerte de non-conformité archivée.'}
            </p>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Périmètre Géographique d'Application
            </label>
            <select
              value={countryCondition}
              onChange={(e) => setCountryCondition(e.target.value as any)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="ALL_COUNTRIES">Tous les pays d’origine (Global)</option>
              <option value="NON_EU_ONLY">Pays Hors Union Européenne uniquement</option>
              <option value="SPECIFIC_COUNTRIES">Liste de pays spécifiques (ISO-2)</option>
            </select>
          </div>
        </div>

        {/* Specific countries if applicable */}
        {countryCondition === 'SPECIFIC_COUNTRIES' && (
          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Codes Pays Visés (Séparés par des virgules)
            </label>
            <input
              type="text"
              value={applicableCountriesStr}
              onChange={(e) => setApplicableCountriesStr(e.target.value)}
              placeholder="PE, TR, IN, CN, VN..."
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
            />
          </div>
        )}

        {/* Volume threshold & Facility Audit */}
        <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="volEnabled"
                checked={volumeThresholdEnabled}
                onChange={(e) => setVolumeThresholdEnabled(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-teal-500 focus:ring-teal-500"
              />
              <label htmlFor="volEnabled" className="text-slate-200 font-medium cursor-pointer">
                Activer un seuil de spend annuel minimum
              </label>
            </div>
            {volumeThresholdEnabled && (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={minAnnualSpendEur}
                  onChange={(e) => setMinAnnualSpendEur(Number(e.target.value))}
                  className="w-28 p-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-right font-mono"
                />
                <span className="text-slate-400 font-semibold">€ / an</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
            <input
              type="checkbox"
              id="enforceFacility"
              checked={enforceFacilityAudit}
              onChange={(e) => setEnforceFacilityAudit(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-teal-500 focus:ring-teal-500"
            />
            <label htmlFor="enforceFacility" className="text-slate-200 cursor-pointer">
              Exiger la validation expresse du <strong>site/usine de fabrication</strong> dans le certificat
            </label>
          </div>
        </div>

        {/* Policy notes */}
        <div>
          <label className="text-slate-300 font-semibold block mb-1">
            Fondement RSE / Référence Réglementaire
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Ex : Exigence issue du règlement européen CE 2018/848 et de la charte Achats Responsables 2026..."
            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold transition-colors shadow-lg shadow-teal-900/30 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>{ruleToEdit ? 'Enregistrer les Modifications' : 'Créer la Règle'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
