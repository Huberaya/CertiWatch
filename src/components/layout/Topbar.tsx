import React, { useState } from 'react';
import {
  Building,
  UserCheck,
  Search,
  RotateCcw,
  Shield,
  ChevronDown,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { appStore } from '../../db/store';
import { UserRole } from '../../types/tenant';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

interface TopbarProps {
  currentTabName: string;
  onOpenSearch?: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function Topbar({
  currentTabName,
  onOpenSearch,
  searchQuery,
  onSearchChange,
}: TopbarProps) {
  const activeTenant = appStore.getActiveTenant();
  const activeUser = appStore.getActiveUser();
  const allTenants = appStore.getState().tenants;
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'ADMIN', label: 'Administrateur', desc: 'Contrôle complet & configuration SaaS' },
    { role: 'QUALITY_MANAGER', label: 'Responsable Qualité', desc: 'Gestion certifications, OCR & anomalies' },
    { role: 'PROCUREMENT_MANAGER', label: 'Responsable Achats', desc: 'Fournisseurs & déblocage commandes ERP' },
    { role: 'AUDITOR', label: 'Auditeur Interne', desc: 'Lecture intégrale, exports & Audit Trail' },
    { role: 'VIEWER', label: 'Lecteur Simple', desc: 'Consultation restreinte' },
  ];

  return (
    <header className="h-16 px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-4 sticky top-0 z-30 backdrop-blur-md">
      {/* Current page title & date indicator */}
      <div className="flex items-center gap-4 min-w-max">
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>{currentTabName}</span>
          </h1>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-mono text-slate-400">
              <Calendar className="w-3 h-3 text-slate-500" />
              24 Septembre 2026
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-mono text-[10px]">
              Vérification quotidienne planifiée 06:00 UTC
            </span>
          </div>
        </div>
      </div>

      {/* Global search input */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher fournisseur, N° certificat, norme (GOTS, FSC, Ecocert)..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all"
          />
        </div>
      </div>

      {/* Action switches: Multi-Tenant & RBAC simulation */}
      <div className="flex items-center gap-3">
        {/* Tenant Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setShowTenantDropdown(!showTenantDropdown);
              setShowRoleDropdown(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 transition-colors"
          >
            <Building className="w-3.5 h-3.5 text-cyan-400" />
            <span className="max-w-[130px] truncate">{activeTenant.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showTenantDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Changer d'Entreprise (Multi-Tenant)
              </div>
              {allTenants.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    appStore.setActiveTenant(t.id);
                    setShowTenantDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800/70 transition-colors ${
                    t.id === activeTenant.id ? 'text-emerald-400 font-semibold bg-emerald-500/10' : 'text-slate-300'
                  }`}
                >
                  <div className="truncate pr-2">
                    <p className="truncate font-medium">{t.name}</p>
                    <p className="text-[10px] text-slate-500">{t.industry}</p>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 text-slate-400">
                    {t.tier}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Role Switcher (RBAC Tester) */}
        <div className="relative">
          <button
            onClick={() => {
              setShowRoleDropdown(!showRoleDropdown);
              setShowTenantDropdown(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="max-w-[120px] truncate">{activeUser.role}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Tester un Rôle (RBAC Matrix)
              </div>
              {roles.map((r) => (
                <button
                  key={r.role}
                  onClick={() => {
                    appStore.setActiveRole(r.role);
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-800/70 transition-colors ${
                    r.role === activeUser.role ? 'text-amber-400 font-semibold bg-amber-500/10' : 'text-slate-300'
                  }`}
                >
                  <div className="font-semibold">{r.label} ({r.role})</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{r.desc}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* PWA Install Button */}
        <PWAInstallButton />

        {/* User preview */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800 text-xs">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold text-xs">
            {activeUser.name.charAt(0)}
          </div>
          <div className="hidden xl:block">
            <p className="text-xs font-medium text-slate-200 leading-tight">{activeUser.name}</p>
            <p className="text-[10px] text-slate-400">{activeUser.department}</p>
          </div>
        </div>

        {/* Reset Demo button */}
        <button
          onClick={() => {
            if (confirm('Réinitialiser la base de démonstration CertiWatch avec les données officielles de test ?')) {
              appStore.resetDemoData();
            }
          }}
          title="Réinitialiser le jeu de données de test"
          className="p-2 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
