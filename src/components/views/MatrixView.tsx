import React, { useState } from 'react';
import { ComplianceMatrixRule } from '../../types/matrix';
import { CertificationStandard } from '../../types/certificate';
import { Grid3X3, Plus, ShieldCheck, AlertCircle, Ban, Check, Sliders } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { appStore } from '../../db/store';

interface MatrixViewProps {
  rules: ComplianceMatrixRule[];
}

export function MatrixView({ rules }: MatrixViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [productCat, setProductCat] = useState('');
  const [standard, setStandard] = useState<CertificationStandard>('ECOCERT_BIO');
  const [criticality, setCriticality] = useState<'STRICT_BLOCK' | 'WARNING_ONLY' | 'CONDITIONAL'>('STRICT_BLOCK');
  const [enforceAudit, setEnforceAudit] = useState(true);
  const [notes, setNotes] = useState('');

  const permissions = appStore.getActivePermissions();

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productCat) return;

    const newRule: ComplianceMatrixRule = {
      id: 'rule-' + Date.now(),
      tenantId: appStore.getState().activeTenantId,
      productCategory: productCat,
      requiredStandards: [standard],
      acceptableAlternativeStandards: [],
      criticality,
      enforceFacilityAudit: enforceAudit,
      notes: notes || 'Règle de conformité définie pour la politique RSE et approvisionnements responsables.',
      updatedAt: new Date().toISOString(),
    };

    appStore.getState().matrixRules.push(newRule);
    appStore.addAuditLog({
      actionCategory: 'MATRIX_RULE_UPDATED',
      entityType: 'MATRIX',
      entityId: newRule.id,
      entityReference: productCat,
      source: 'MANUAL_UI',
      newValue: standard,
      details: `Ajout d'une règle de matrice produit × certification : "${productCat}" exige ${standard} (${criticality})`,
    });

    setShowAddModal(false);
    setProductCat('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-teal-400" />
            <span>Matrice Produit × Certification (Compliance Rules Matrix)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Définissez les standards obligatoires par famille d'achat pour valider l'éligibilité des commandes ERP
          </p>
        </div>

        {permissions.canEditMatrix && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Règle d'Exigence</span>
          </button>
        )}
      </div>

      {/* Rules list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                    Famille d'Achat
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5">{rule.productCategory}</h3>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    rule.criticality === 'STRICT_BLOCK'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {rule.criticality === 'STRICT_BLOCK' ? 'BLOCAGE STRICT' : 'AVERTISSEMENT'}
                </span>
              </div>

              <div className="space-y-2 text-xs">
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

                {rule.acceptableAlternativeStandards.length > 0 && (
                  <div>
                    <span className="text-slate-500 text-[11px] block">Alternative Acceptée :</span>
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

                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] pt-1">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    Audit de site de production :{' '}
                    <strong className="text-slate-200">
                      {rule.enforceFacilityAudit ? 'Exigé' : 'Optionnel'}
                    </strong>
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                {rule.notes}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Rule Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Ajouter une Exigence de Conformité Produit"
          subtitle="Configuration de la politique d'approvisionnement"
          maxWidth="lg"
        >
          <form onSubmit={handleAddRule} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Famille de Produit *</label>
              <input
                type="text"
                required
                value={productCat}
                onChange={(e) => setProductCat(e.target.value)}
                placeholder="Ex : Café Biologique, Papiers d'Emballage, Soie..."
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Standard Exigé *</label>
                <select
                  value={standard}
                  onChange={(e) => setStandard(e.target.value as any)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="ECOCERT_BIO">Ecocert Bio</option>
                  <option value="GOTS">GOTS</option>
                  <option value="FSC">FSC</option>
                  <option value="OEKO_TEX_100">OEKO-TEX 100</option>
                  <option value="FAIRTRADE">Fairtrade</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Action en Cas de Non-Conformité</label>
                <select
                  value={criticality}
                  onChange={(e) => setCriticality(e.target.value as any)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="STRICT_BLOCK">Blocage Strict Commande (ERP)</option>
                  <option value="WARNING_ONLY">Avertissement Simple</option>
                  <option value="CONDITIONAL">Validation Manuelle Qualité</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="auditSite"
                checked={enforceAudit}
                onChange={(e) => setEnforceAudit(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
              />
              <label htmlFor="auditSite" className="text-slate-300 text-xs">
                Exiger que le site de fabrication soit expressément mentionné dans le périmètre
              </label>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Politique / Référence RSE</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex : Exigence politique Zéro Déforestation Danone 2030..."
                className="w-full h-20 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
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
                Sauvegarder la Règle
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
