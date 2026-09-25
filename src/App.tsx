import React, { useState, useEffect } from 'react';
import { appStore } from './db/store';
import { Sidebar, NavigationTab } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { DashboardView } from './components/views/DashboardView';
import { SuppliersView } from './components/views/SuppliersView';
import { CertificatesView } from './components/views/CertificatesView';
import { AlertsView } from './components/views/AlertsView';
import { ConnectorsView } from './components/views/ConnectorsView';
import { MatrixView } from './components/views/MatrixView';
import { IntegrationsView } from './components/views/IntegrationsView';
import { AuditTrailView } from './components/views/AuditTrailView';
import { ReportsView } from './components/views/ReportsView';
import { CopilotView } from './components/views/CopilotView';
import { ComplianceSecurityView } from './components/views/ComplianceSecurityView';
import { SettingsView } from './components/views/SettingsView';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';

export default function App() {
  const [, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = appStore.subscribe(() => {
      setTick((t) => t + 1);
    });
    return () => unsubscribe();
  }, []);

  const state = appStore.getState();
  const suppliers = appStore.getTenantSuppliers();
  const certificates = appStore.getTenantCertificates();
  const alerts = appStore.getTenantAlerts();
  const matrixRules = appStore.getTenantMatrixRules();
  const auditLogs = appStore.getTenantAuditLogs();
  const providers = appStore.getProviders();

  const openAlertsCount = alerts.filter(
    (a) => a.status === 'OPEN' || a.status === 'IN_PROGRESS'
  ).length;

  const tabTitles: Record<NavigationTab, string> = {
    dashboard: 'Tableau de Bord Exécutif & Monitoring',
    suppliers: 'Gestion des Fournisseurs',
    certificates: 'Répertoire Central des Certifications',
    alerts: 'Centre de Traitement des Alertes',
    connectors: 'Connecteurs & Registres Officiels',
    matrix: 'Matrice de Conformité Achats',
    integrations: 'Intégrations ERP & Blocage Commandes',
    audit: 'Journal d’Audit Trail',
    reports: 'Rapports Réglementaires CSRD, Conformité EUDR & Packs d’Audit',
    copilot: 'Copilot d’IA Décisionnelle & Intelligence Achats',
    compliance: 'Mode PWA Déconnecté, RGPD & Sécurité SOC 2 Type II',
    settings: 'Paramètres & Quotas Multi-Tenant',
  };

  const handleSelectSupplierFromAnywhere = (supplierId: string) => {
    setSelectedSupplierId(supplierId);
    setActiveTab('suppliers');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100 antialiased selection:bg-emerald-500 selection:text-slate-950">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(t) => {
          setActiveTab(t);
          if (t !== 'suppliers') setSelectedSupplierId(null);
        }}
        openAlertsCount={openAlertsCount}
        isSyncing={state.isAutoSyncing}
        onTriggerSync={() => appStore.runContinuousVerificationSync()}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          currentTabName={tabTitles[activeTab]}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-950/60">
          <div className="max-w-7xl mx-auto pb-12">
            {activeTab === 'dashboard' && (
              <DashboardView
                suppliers={suppliers}
                certificates={certificates}
                alerts={alerts}
                providers={providers}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onSelectSupplier={handleSelectSupplierFromAnywhere}
              />
            )}

            {activeTab === 'suppliers' && (
              <SuppliersView
                suppliers={suppliers}
                certificates={certificates}
                searchQuery={searchQuery}
                selectedSupplierId={selectedSupplierId}
                onClearSelectedSupplier={() => setSelectedSupplierId(null)}
                onNavigateToUploadCert={(supplierId) => {
                  setActiveTab('certificates');
                }}
              />
            )}

            {activeTab === 'certificates' && (
              <CertificatesView
                certificates={certificates}
                suppliers={suppliers}
                searchQuery={searchQuery}
              />
            )}

            {activeTab === 'alerts' && (
              <AlertsView alerts={alerts} searchQuery={searchQuery} />
            )}

            {activeTab === 'connectors' && (
              <ConnectorsView providers={providers} />
            )}

            {activeTab === 'matrix' && (
              <MatrixView rules={matrixRules} />
            )}

            {activeTab === 'integrations' && (
              <IntegrationsView suppliers={suppliers} certificates={certificates} />
            )}

            {activeTab === 'audit' && (
              <AuditTrailView logs={auditLogs} searchQuery={searchQuery} />
            )}

            {activeTab === 'reports' && <ReportsView />}

            {activeTab === 'copilot' && (
              <CopilotView onNavigateTab={(tab) => setActiveTab(tab)} />
            )}

            {activeTab === 'compliance' && <ComplianceSecurityView />}

            {activeTab === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      <OfflineIndicator />
    </div>
  );
}
