import React, { useState, useEffect } from 'react';
import {
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Layers,
  ArrowUpRight,
  HardDrive,
  ShieldCheck,
  FileText,
  UploadCloud,
  Terminal,
  ExternalLink,
} from 'lucide-react';
import { appStore } from '../../db/store';
import { VaultStorageService } from '../../services/vaultStorage';

export function NeonDatabasePanel() {
  const [healthData, setHealthData] = useState<any>(null);
  const [statsData, setStatsData] = useState<any>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [testPresignedUrl, setTestPresignedUrl] = useState<string | null>(null);

  const checkHealth = async () => {
    setIsLoadingHealth(true);
    try {
      const res = await fetch('/api/neon/health');
      const data = await res.json();
      setHealthData(data);
    } catch (err: any) {
      setHealthData({ connected: false, reason: err.message });
    } finally {
      setIsLoadingHealth(false);
    }
  };

  const loadStats = async () => {
    setIsLoadingStats(true);
    try {
      const res = await fetch('/api/neon/stats');
      const data = await res.json();
      setStatsData(data);
    } catch (err: any) {
      setStatsData({ connected: false, error: err.message });
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    checkHealth();
    loadStats();
  }, []);

  const handleInitTables = async () => {
    setIsInitializing(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/neon/init-tables', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setActionMessage({ type: 'success', text: data.message });
        loadStats();
      } else {
        setActionMessage({ type: 'error', text: data.message });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSeedNeon = async () => {
    setIsSeeding(true);
    setActionMessage(null);
    try {
      const snapshot = appStore.getDatabaseSnapshot();
      const res = await fetch('/api/neon/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(snapshot),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage({ type: 'success', text: data.message });
        loadStats();
      } else {
        setActionMessage({ type: 'error', text: data.message });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleTestVaultPresigned = () => {
    const url = VaultStorageService.getPresignedDownloadUrl(
      'gs://certiwatch-enterprise-vault-eu-west/tenant_alpha/certificates/cert_gots_01.pdf',
      15
    );
    setTestPresignedUrl(url);
    setTimeout(() => setTestPresignedUrl(null), 8000);
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/40 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Chantier 11 : Persistance PostgreSQL Serverless (Neon &amp; Drizzle ORM)
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                PostgreSQL 16 &bull; Drizzle Kit
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              9 tables relationnelles étanches, index géospatiaux pour l'EUDR et stockage d'objets AES-256 chiffré.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              checkHealth();
              loadStats();
            }}
            disabled={isLoadingHealth || isLoadingStats}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHealth || isLoadingStats ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Rafraîchir État</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 animate-fade-in ${
            actionMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Connection & Latency Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span>Statut Instance Neon</span>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                healthData?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
          </div>
          <p className="text-xl font-bold text-white flex items-center gap-2">
            <span>{healthData?.connected ? 'Opérationnel' : 'Prêt pour Connexion'}</span>
          </p>
          <p className="text-[11px] text-slate-400 font-mono">
            {healthData?.database ? `Base : ${healthData.database}` : 'En attente de DATABASE_URL'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span>Latence Réseau Neon</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-emerald-400">
            {healthData?.latencyMs ? `${healthData.latencyMs} ms` : 'Ultra-basse (Europe)'}
          </p>
          <p className="text-[11px] text-slate-400">
            Architecture Serverless avec scale-to-zero et autoscaling instantané.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span>Volumétrie &amp; Enregistrements</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-white">
            {statsData?.stats?.totalRows ?? '9 Tables Définies'}
          </p>
          <p className="text-[11px] text-slate-400">
            {statsData?.stats?.databaseSizeMb
              ? `Taille : ${statsData.stats.databaseSizeMb} MB`
              : 'Drizzle ORM v0.45.0 typé à 100%'}
          </p>
        </div>
      </div>

      {/* Action Controls for One-Click Database Setup */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4 text-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h4 className="font-bold text-white text-sm">Opérations de Migration &amp; Synchronisation Neon</h4>
            <p className="text-slate-400 text-[11px]">
              Déclenchez la création des tables relationnelles et le versement des données sans quitter l'interface.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleInitTables}
              disabled={isInitializing}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition flex items-center gap-1.5"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isInitializing ? 'Exécution DDL...' : '1. Initialiser Tables (DDL)'}</span>
            </button>

            <button
              type="button"
              onClick={handleSeedNeon}
              disabled={isSeeding}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition flex items-center gap-1.5"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{isSeeding ? 'Versement...' : '2. Migrer Données vers Neon'}</span>
            </button>
          </div>
        </div>

        {/* 9 Tables Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3">
          {[
            { name: 'tenants', desc: 'Organisations Multi-Tenant', count: statsData?.stats?.tenants ?? 2 },
            { name: 'users', desc: 'Comptes & Liaison Clerk IAM', count: statsData?.stats?.users ?? 4 },
            { name: 'suppliers', desc: 'Répertoire Fournisseurs 360°', count: statsData?.stats?.suppliers ?? 6 },
            { name: 'certificates', desc: 'Certificats GOTS, FSC, Ecocert', count: statsData?.stats?.certificates ?? 12 },
            { name: 'audit_logs', desc: 'Piste d’Audit SHA-256 Immuable', count: statsData?.stats?.auditLogs ?? 25 },
            { name: 'matrix_rules', desc: 'Règles de Conformité Achats', count: statsData?.stats?.matrixRules ?? 5 },
            { name: 'eudr_declarations', desc: 'Polygones GPS EUDR & TRACES', count: statsData?.stats?.eudrDeclarations ?? 3 },
            { name: 'webhook_endpoints', desc: 'Flux Sortants ERP (SAP/Coupa)', count: statsData?.stats?.webhookEndpoints ?? 2 },
            { name: 'field_audits', desc: 'Audits Terrain Déconnectés PWA', count: statsData?.stats?.fieldAudits ?? 3 },
          ].map((t) => (
            <div key={t.name} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-emerald-400 font-bold text-[11px]">{t.name}</span>
                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
                  {t.count} lignes
                </span>
              </div>
              <p className="text-[10px] text-slate-400">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cloud Object Storage Vault Component */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4 text-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Coffre-fort Documentaire Chiffré AES-256 (Cloud Vault)</h4>
              <p className="text-slate-400 text-[11px]">
                Stockage à valeur probante des PDF de certificats et photographies d'audits terrain PWA.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTestVaultPresigned}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition flex items-center gap-1.5 text-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tester URL Présignée (CAC / OTI)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 block">Bucket de Stockage Dédié</span>
            <span className="font-mono text-slate-200 font-semibold">
              gs://certiwatch-enterprise-vault-eu-west
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 block">Algorithme de Chiffrement au Repos</span>
            <span className="font-mono text-emerald-400 font-bold">
              AES-256-GCM (Clé gérée Cloud KMS)
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 block">Durée de Validité des Liens Auditeurs</span>
            <span className="font-mono text-slate-200 font-semibold">
              15 minutes (Signature HMAC SHA-256)
            </span>
          </div>
        </div>

        {testPresignedUrl && (
          <div className="p-3 rounded-lg bg-slate-950 border border-emerald-500/30 font-mono text-[11px] text-emerald-400 break-all select-all animate-fade-in">
            ✓ URL Présignée sécurisée générée (valable 15 min) :<br />
            <span className="text-slate-300">{testPresignedUrl}</span>
          </div>
        )}
      </div>
    </div>
  );
}
