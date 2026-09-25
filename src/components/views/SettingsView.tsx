import React, { useState } from 'react';
import { appStore } from '../../db/store';
import { UserRole, ROLE_PERMISSIONS } from '../../types/tenant';
import {
  Settings,
  Shield,
  CreditCard,
  Users,
  Check,
  X,
  Building2,
  HardDrive,
  Key,
  Webhook,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  Send,
  Lock,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

export function SettingsView() {
  const activeTenant = appStore.getActiveTenant();
  const activeUser = appStore.getActiveUser();
  const allTenants = appStore.getState().tenants;
  const allUsers = appStore.getState().users;

  const certsCount = appStore.getTenantCertificates().length;
  const suppliersCount = appStore.getTenantSuppliers().length;

  const costPerCert = activeTenant.pricePerCertMonthly || 2.2;
  const estimatedMonthlyCost = Math.round(certsCount * costPerCert);

  // API Key & Webhook state
  const [apiKey, setApiKey] = useState('cw_live_sk_8f92a10b4829ec7193bd720194aa82');
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://erp-gateway.danone.com/api/v1/compliance/webhooks');
  const [webhookSecret, setWebhookSecret] = useState('whsec_hmac_sha256_883019ab7284');
  const [isPingingWebhook, setIsPingingWebhook] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRotateKey = () => {
    if (confirm('Êtes-vous sûr de vouloir régénérer cette clé d’API ? L’ancienne clé sera immédiatement révoquée.')) {
      const newKey = 'cw_live_sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      setApiKey(newKey);
    }
  };

  const handleTestWebhookPing = () => {
    setIsPingingWebhook(true);
    setPingResult(null);

    setTimeout(() => {
      setIsPingingWebhook(false);
      setPingResult('HTTP 200 OK — Handshake validé avec le serveur ERP cible (Latence: 42ms)');
    }, 700);
  };

  const handleResetData = () => {
    if (confirm('Attention : Voulez-vous réinitialiser toutes les données de démonstration à leur état initial ?')) {
      appStore.resetDemoData();
      alert('Toutes les données ont été réinitialisées.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-teal-400" />
            <span>Gouvernance Multi-Tenant, Sécurité RBAC & Paramètres</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Gestion des organisations étanches, contrôle d'accès par rôle, clés d'API et webhooks ERP
          </p>
        </div>

        <button
          onClick={handleResetData}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-300 text-xs font-semibold border border-slate-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Réinitialiser Données Démo</span>
        </button>
      </div>

      {/* Tenant Switcher & Quotas */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Organisation Active : {activeTenant.name}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  PLAN {activeTenant.tier}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Chaque organisation dispose d'une étanchéité stricte de ses fournisseurs, certificats et matrices
              </p>
            </div>
          </div>

          {/* Tenant Switch Selector */}
          <div className="flex items-center gap-2 self-stretch sm:self-center">
            <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Changer d'organisation :</span>
            <select
              value={activeTenant.id}
              onChange={(e) => appStore.setActiveTenant(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-teal-500 font-semibold"
            >
              {allTenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.tier})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quota Consumption Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Certificats Surveillés</span>
              <span className="font-mono text-white font-bold">{certsCount} / {activeTenant.maxCertificatesAllowed}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500"
                style={{ width: `${Math.min(100, (certsCount / activeTenant.maxCertificatesAllowed) * 100)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 flex justify-between">
              <span>Facturation : {costPerCert} € / cert / mois</span>
              <span className="font-bold text-teal-400">{estimatedMonthlyCost} € / mois</span>
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
                style={{ width: `${Math.min(100, (suppliersCount / activeTenant.maxSuppliersAllowed) * 100)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500">
              Surveillance continue 24/7 incluse
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Intégrations & Registres</span>
              <span className="font-mono text-emerald-400 font-bold">5 / 5 Connecteurs</span>
            </div>
            <p className="text-[10px] text-slate-400">
              GOTS, FSC, Ecocert, OEKO-TEX et Fairtrade actifs
            </p>
          </div>
        </div>
      </div>

      {/* User & Role Impersonation (RBAC testing) */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Profil Acteur & Rôle RBAC : {activeUser.name}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {activeUser.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulez la session d'un acheteur, gestionnaire qualité ou auditeur pour vérifier la restriction des permissions
              </p>
            </div>
          </div>

          {/* User switcher */}
          <div className="flex items-center gap-2 self-stretch sm:self-center">
            <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Changer de profil :</span>
            <select
              value={activeUser.id}
              onChange={(e) => appStore.setActiveUser(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-teal-500 font-semibold"
            >
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Current permissions summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {[
            { label: 'Créer Fournisseurs', key: 'canCreateSupplier' },
            { label: 'Upload Certificats', key: 'canUploadCertificate' },
            { label: 'Résoudre Alertes', key: 'canResolveAlerts' },
            { label: 'Modifier Matrice', key: 'canEditMatrix' },
            { label: 'Gérer Utilisateurs', key: 'canManageUsers' },
            { label: 'Déblocage ERP', key: 'canOverrideErpBlock' },
            { label: 'Export Audit', key: 'canExportAudit' },
          ].map((item) => {
            const hasPerm = (ROLE_PERMISSIONS[activeUser.role] as any)[item.key];
            return (
              <div
                key={item.key}
                className={`p-2.5 rounded-lg border flex items-center justify-between text-[11px] ${
                  hasPerm
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-950/40 border-slate-800 text-slate-500'
                }`}
              >
                <span>{item.label}</span>
                {hasPerm ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* API Keys & ERP Webhooks Security */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Key className="w-5 h-5 text-teal-400" />
          <h3 className="text-sm font-bold text-white">Clés d'API & Sécurité des Webhooks ERP</h3>
        </div>

        <div className="space-y-4 text-xs">
          {/* Secret API Key */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Clé d'API Secrète (Intégration SAP S/4HANA / Coupa / Oracle)
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  readOnly
                  value={apiKey}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-teal-300 font-mono text-xs pr-20"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-2 px-2 py-1 text-slate-400 hover:text-white"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyApiKey}
                className="px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1 font-semibold"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey ? 'Copié' : 'Copier'}</span>
              </button>

              <button
                type="button"
                onClick={handleRotateKey}
                className="px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1 font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Régénérer</span>
              </button>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Permet d’invoquer les endpoints <code>POST /api/v1/erp/check-po</code> avec authentification Bearer.
            </span>
          </div>

          {/* Webhook Configuration */}
          <div className="pt-2 border-t border-slate-800/80 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  URL Endpoint Webhook ERP (Sortant)
                </label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Secret de Signature HMAC (SHA-256)
                </label>
                <input
                  type="text"
                  readOnly
                  value={webhookSecret}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="text-[10px] text-slate-400">
                Événements déclencheurs : <code>PO_CHECK</code>, <code>CERTIFICATE_REVOCATION</code>, <code>ERP_BLOCK_TRIGGERED</code>
              </div>

              <button
                type="button"
                onClick={handleTestWebhookPing}
                disabled={isPingingWebhook}
                className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold transition-colors flex items-center gap-1.5 shadow-md shadow-teal-900/30"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isPingingWebhook ? 'Ping en cours...' : 'Tester le Webhook'}</span>
              </button>
            </div>

            {pingResult && (
              <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{pingResult}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RBAC Matrix Review */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Shield className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Matrice Officielle des Permissions RBAC</h3>
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
