import React from 'react';
import {
  LayoutDashboard,
  Building2,
  FileCheck2,
  AlertTriangle,
  Globe2,
  Grid3X3,
  Cpu,
  History,
  Settings,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Award,
  Bot,
  Smartphone,
  CreditCard,
  Leaf,
  Scale,
  QrCode,
  Radar,
  Shield,
} from 'lucide-react';
import { appStore } from '../../db/store';

export type NavigationTab =
  | 'dashboard'
  | 'suppliers'
  | 'certificates'
  | 'alerts'
  | 'connectors'
  | 'matrix'
  | 'integrations'
  | 'audit'
  | 'reports'
  | 'carbon'
  | 'csddd'
  | 'dpp'
  | 'risks'
  | 'secops'
  | 'copilot'
  | 'compliance'
  | 'billing'
  | 'settings';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  openAlertsCount: number;
  isSyncing: boolean;
  onTriggerSync: () => void;
}

export function Sidebar({
  activeTab,
  onTabChange,
  openAlertsCount,
  isSyncing,
  onTriggerSync,
}: SidebarProps) {
  const activeTenant = appStore.getActiveTenant();
  const certsCount = appStore.getTenantCertificates().length;
  const maxCerts = activeTenant.maxCertificatesAllowed;
  const usagePercent = Math.min(100, Math.round((certsCount / maxCerts) * 100));

  const navItems = [
    {
      id: 'dashboard' as NavigationTab,
      label: 'Tableau de Bord',
      icon: LayoutDashboard,
      description: 'Vue d’ensemble & KPIs',
    },
    {
      id: 'suppliers' as NavigationTab,
      label: 'Fournisseurs',
      icon: Building2,
      description: 'Répertoire & Risques',
    },
    {
      id: 'certificates' as NavigationTab,
      label: 'Certificats',
      icon: FileCheck2,
      description: 'Dépôt & Validité',
    },
    {
      id: 'alerts' as NavigationTab,
      label: 'Centre d’Alertes',
      icon: AlertTriangle,
      description: 'Actions urgentes',
      badge: openAlertsCount > 0 ? openAlertsCount : undefined,
    },
    {
      id: 'connectors' as NavigationTab,
      label: 'Registres Officiels',
      icon: Globe2,
      description: 'Connecteurs & Sources',
    },
    {
      id: 'matrix' as NavigationTab,
      label: 'Matrice de Conformité',
      icon: Grid3X3,
      description: 'Produits × Standards',
    },
    {
      id: 'integrations' as NavigationTab,
      label: 'ERP & Automatisation',
      icon: Cpu,
      description: 'Blocage commandes & API',
    },
    {
      id: 'audit' as NavigationTab,
      label: 'Audit Trail',
      icon: History,
      description: 'Traçabilité immuable',
    },
    {
      id: 'reports' as NavigationTab,
      label: 'Rapports & CSRD',
      icon: Award,
      description: 'EUDR & Packs CAC',
    },
    {
      id: 'carbon' as NavigationTab,
      label: 'Carbone Scope 3 & Net-Zero',
      icon: Leaf,
      description: 'ESRS E1 & Trajectoire 1.5°C',
    },
    {
      id: 'csddd' as NavigationTab,
      label: 'Devoir de Vigilance CSDDD',
      icon: Scale,
      description: 'Droits humains & Whistleblowing',
    },
    {
      id: 'dpp' as NavigationTab,
      label: 'Passeport Digital DPP',
      icon: QrCode,
      description: 'ESPR 2024 & GS1 Digital Link',
    },
    {
      id: 'risks' as NavigationTab,
      label: 'IA Risques & Stress-Testing',
      icon: Radar,
      description: 'Veille météo & Altman Z-Score',
    },
    {
      id: 'secops' as NavigationTab,
      label: 'Souveraineté, NIS 2 & SAE',
      icon: Shield,
      description: 'SecNumCloud & NF Z42-013',
    },
    {
      id: 'copilot' as NavigationTab,
      label: 'Copilot IA & Décision',
      icon: Bot,
      description: 'Substitution & Clauses',
    },
    {
      id: 'compliance' as NavigationTab,
      label: 'PWA, RGPD & SOC 2',
      icon: Smartphone,
      description: 'Audits terrain & Sécurité',
    },
    {
      id: 'billing' as NavigationTab,
      label: 'Facturation & Abonnements',
      icon: CreditCard,
      description: 'Stripe Billing & Quotas',
    },
    {
      id: 'settings' as NavigationTab,
      label: 'Configuration & SaaS',
      icon: Settings,
      description: 'Entreprise & Quotas',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      {/* Brand header */}
      <div>
        <div className="h-16 px-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">
                Certi<span className="text-emerald-400">Watch</span>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[130px]">
              Compliance & Procurement
            </p>
          </div>
        </div>

        {/* Tenant selector banner (clickable to billing) */}
        <div className="px-3 py-3 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 px-2">
            <span className="font-medium text-[11px] uppercase tracking-wider text-slate-500">
              Tenant Actif
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
              {activeTenant.tier}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onTabChange('billing')}
            className="w-full text-left px-2 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/40 transition group"
            title="Gérer le plan d'abonnement & les quotas Stripe"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 transition truncate">{activeTenant.name}</span>
              <CreditCard className="w-3 h-3 text-slate-500 group-hover:text-emerald-400" />
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
              <span>{certsCount} certificats</span>
              <span className="font-mono text-emerald-400">{usagePercent}% quota</span>
            </div>
            <div className="w-full h-1 bg-slate-700 rounded-full mt-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  usagePercent > 85 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  />
                  <span className="text-left font-medium">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer controls & continuous sync */}
      <div className="p-3 border-t border-slate-800 space-y-2.5 bg-slate-950/30">
        <button
          onClick={onTriggerSync}
          disabled={isSyncing}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all hover:border-slate-600 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Synchronisation...' : 'Vérifier les Registres'}</span>
        </button>

        <div className="px-2 py-1.5 flex items-center justify-between text-[11px] text-slate-500">
          <span>Surveillance continue</span>
          <span className="flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            24/7 ACTIF
          </span>
        </div>
      </div>
    </aside>
  );
}
