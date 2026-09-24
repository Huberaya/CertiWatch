import React from 'react';
import { appStore } from '../../db/store';
import { ROLE_PERMISSIONS } from '../../types/tenant';
import { Settings, Shield, CreditCard, Users, Check, X, Building2, HardDrive } from 'lucide-react';

export function SettingsView() {
  const activeTenant = appStore.getActiveTenant();
  const certsCount = appStore.getTenantCertificates().length;
  const suppliersCount = appStore.getTenantSuppliers().length;

  const costPerCert = 2.25; // Mid-market standard
  const estimatedMonthlyCost = Math.round(certsCount * costPerCert);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-400" />
          <span>Paramètres SaaS, Quotas & Tarification Commerciale</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Gestion multi-tenant, consommation des quotas et modèle économique de l'abonnement
        </p>
      </div>

      {/* Subscription & Pricing Overview */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Formule Active : Plan {activeTenant.tier}</h3>
                <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ACTIF
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Facturation mensuelle basée sur le volume de certificats surveillés en continu (2,25 € / cert / mois)
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-400">Facturation estimée en cours :</p>
            <p className="text-xl font-bold text-white font-mono">{estimatedMonthlyCost} € <span className="text-xs text-slate-400 font-sans">HT / mois</span></p>
          </div>
        </div>

        {/* Quota cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Certificats Surveillés</span>
              <span className="font-mono text-white font-bold">{certsCount} / {activeTenant.maxCertificatesAllowed}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${(certsCount / activeTenant.maxCertificatesAllowed) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Fournisseurs Référencés</span>
              <span className="font-mono text-white font-bold">{suppliersCount} / {activeTenant.maxSuppliersAllowed}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500"
                style={{ width: `${(suppliersCount / activeTenant.maxSuppliersAllowed) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Vérifications Automatiques</span>
              <span className="font-mono text-emerald-400 font-bold">Illimitées (24/7)</span>
            </div>
            <p className="text-[11px] text-slate-500">Fréquence quotidienne à 06:00 UTC</p>
          </div>
        </div>
      </div>

      {/* RBAC Matrix Review */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Shield className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Matrice des Permissions RBAC (Contrôle d'Accès par Rôle)</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Fonctionnalité / Action</th>
                <th className="py-2.5 px-3">ADMIN</th>
                <th className="py-2.5 px-3">QUALITY_MANAGER</th>
                <th className="py-2.5 px-3">PROCUREMENT_MANAGER</th>
                <th className="py-2.5 px-3">AUDITOR</th>
                <th className="py-2.5 px-3">VIEWER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {[
                { label: 'Création / Édition Fournisseurs', key: 'canCreateSupplier' },
                { label: 'Dépôt / Upload Certificats', key: 'canUploadCertificate' },
                { label: 'Traitement des Alertes de Conformité', key: 'canResolveAlerts' },
                { label: 'Configuration Matrice Produit', key: 'canEditMatrix' },
                { label: 'Gestion des Utilisateurs & Quotas', key: 'canManageUsers' },
                { label: 'Déblocage Manuel Commandes ERP', key: 'canOverrideErpBlock' },
                { label: 'Export Certifié Audit Trail', key: 'canExportAudit' },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/20">
                  <td className="py-2 px-3 font-medium text-white">{row.label}</td>
                  {(['ADMIN', 'QUALITY_MANAGER', 'PROCUREMENT_MANAGER', 'AUDITOR', 'VIEWER'] as const).map((r) => {
                    const hasPerm = (ROLE_PERMISSIONS[r] as any)[row.key];
                    return (
                      <td key={r} className="py-2 px-3">
                        {hasPerm ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <X className="w-4 h-4 text-slate-600" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
