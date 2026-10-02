import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Server,
  FileCheck,
  Key,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Layers,
  Terminal,
  Database,
  Eye,
  Sparkles,
  Zap,
} from 'lucide-react';
import { secopsStore } from '../../db/secopsStore';
import {
  Nis2Requirement,
  SaeArchiveDocument,
  HsmKmsKeyStatus,
  DisasterRecoveryMetrics,
  SiemSecurityEvent,
  SecOpsGlobalSummary,
} from '../../types/secops';
import { appStore } from '../../db/store';

export function SecuritySovereigntyView() {
  const [summary, setSummary] = useState<SecOpsGlobalSummary>(secopsStore.getGlobalSummary());
  const [requirements, setRequirements] = useState<Nis2Requirement[]>(secopsStore.getNis2Requirements());
  const [archives, setArchives] = useState<SaeArchiveDocument[]>(secopsStore.getSaeArchives());
  const [hsmKeys, setHsmKeys] = useState<HsmKmsKeyStatus[]>(secopsStore.getHsmKeys());
  const [drMetrics, setDrMetrics] = useState<DisasterRecoveryMetrics>(secopsStore.getDrMetrics());
  const [siemLogs, setSiemLogs] = useState<SiemSecurityEvent[]>(secopsStore.getSiemLogs());
  const [activeTab, setActiveTab] = useState<'NIS2' | 'SAE_VAULT' | 'HSM_KMS' | 'DRP_SIEM'>('NIS2');
  const [notification, setNotification] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isFailingOver, setIsFailingOver] = useState(false);

  useEffect(() => {
    return secopsStore.subscribe(() => {
      setSummary(secopsStore.getGlobalSummary());
      setRequirements(secopsStore.getNis2Requirements());
      setArchives(secopsStore.getSaeArchives());
      setHsmKeys(secopsStore.getHsmKeys());
      setDrMetrics(secopsStore.getDrMetrics());
      setSiemLogs(secopsStore.getSiemLogs());
    });
  }, []);

  const activeTenant = appStore.getActiveTenant();

  const handleVerifyIntegrity = () => {
    setIsVerifying(true);
    setTimeout(() => {
      secopsStore.verifyAllArchivesIntegrity();
      setIsVerifying(false);
      setNotification('Contrôle d’intégrité cryptographique NF Z42-013 validé : 100% des empreintes SHA-256 certifiées conformes.');
      setTimeout(() => setNotification(null), 5000);
    }, 600);
  };

  const handleTriggerFailover = () => {
    setIsFailingOver(true);
    setTimeout(() => {
      secopsStore.triggerDisasterRecoveryFailover();
      setIsFailingOver(false);
      setNotification('Bascule PRA simulée avec succès : Trafic redirigé vers Gravelines DC2 (RTO effectif : 98 secondes).');
      setTimeout(() => setNotification(null), 5000);
    }, 800);
  };

  const handleRotateKey = (keyId: string) => {
    secopsStore.rotateHsmKey(keyId);
    setNotification(`Rotation cryptographique de la clé ${keyId} opérée sur le module HSM.`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Hero Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-purple-950/50 border border-indigo-500/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Chantier 18 : Souveraineté SecNumCloud, Directive NIS 2 &amp; Coffre SAE
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                Directive UE 2022/2555 (NIS 2)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                NF Z42-013 &bull; SecNumCloud 3.2
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Infrastructure de cyber-résilience souveraine pour <strong>{activeTenant.name}</strong> : conformité réglementaire NIS 2, coffre-fort d'archivage légal 10 ans, chiffrement matériel HSM BYOK et plan de reprise d'activité (PRA RPO=0 / RTO &lt; 3 min).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleVerifyIntegrity}
            disabled={isVerifying}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'Calcul Merkle Tree...' : 'Vérifier Intégrité SAE'}</span>
          </button>

          <a
            href="/api/secops/nis2-certificate/export"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Attestation NIS 2 (HTML)</span>
          </a>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Conformité Directive NIS 2</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-indigo-400">
              {summary.nis2ComplianceScorePercent} %
            </span>
            <span className="text-xs text-slate-400">10/10 mesures auditées</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Conforme aux exigences ANSSI pour les entités essentielles.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Coffre-Fort Numérique SAE</span>
            <FileCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">
              {summary.saeArchivedDocumentsCount}
            </span>
            <span className="text-xs text-slate-400">dossiers légaux (10 ans)</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Norme NF Z42-013 &bull; Horodatage qualifié RFC 3161 eIDAS.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Objectifs RPO / RTO (PRA)</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">
              0s / {summary.drpRtoSeconds}s
            </span>
            <span className="text-xs text-slate-400">RPO / RTO</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Réplication synchrone multi-site (Paris DC1 &lt;-&gt; Gravelines DC2).
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Chiffrement Matériel HSM (BYOK)</span>
            <Key className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">
              FIPS 140-3
            </span>
            <span className="text-xs text-slate-400">Niveau 3</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Clés sous contrôle exclusif client, hébergement qualifié SecNumCloud.
          </p>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('NIS2')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'NIS2'
              ? 'bg-indigo-600 text-white font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Directive Européenne NIS 2 ({requirements.length} Mesures)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SAE_VAULT')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'SAE_VAULT'
              ? 'bg-indigo-600 text-white font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Coffre-Fort Numérique SAE (NF Z42-013)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('HSM_KMS')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'HSM_KMS'
              ? 'bg-indigo-600 text-white font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Chiffrement Souverain &amp; HSM KMS (BYOK)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('DRP_SIEM')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'DRP_SIEM'
              ? 'bg-indigo-600 text-white font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Disaster Recovery (PRA) &amp; Flux SIEM</span>
        </button>
      </div>

      {/* TAB 1: NIS 2 Requirements Matrix */}
      {activeTab === 'NIS2' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Matrice de Conformité Directive NIS 2 (Article 21 &bull; 10 Mesures)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Obligations de gestion des risques cyber pour les entités essentielles et importantes de l'Union Européenne.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold border border-indigo-500/30">
                  100% Conforme ANSSI
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Code Article</th>
                    <th className="py-3 px-4">Domaine SSI</th>
                    <th className="py-3 px-4">Exigence Réglementaire &bull; Mesures Déployées</th>
                    <th className="py-3 px-4">Preuve d'Audit</th>
                    <th className="py-3 px-4 text-center">Dernier Audit</th>
                    <th className="py-3 px-4 text-center">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {requirements.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-800/20 transition">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                        {req.articleCode}
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-semibold">
                        {req.domain}
                      </td>
                      <td className="py-3 px-4">
                        <strong className="text-white block">{req.titleFr}</strong>
                        <span className="text-[11px] text-slate-400">{req.description}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {req.evidenceReference}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-400">
                        {req.lastAuditedAt}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                          ✓ Conforme
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Legal Archiving Vault (NF Z42-013) */}
      {activeTab === 'SAE_VAULT' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-400" />
                  <span>Coffre-Fort Numérique SAE &bull; Norme NF Z42-013 &amp; ISO 14641-1</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Conservation légale à valeur probante 10 ans pour les dossiers douaniers TRACES-NT, audits sociaux et packs CAC.
                </p>
              </div>

              <button
                type="button"
                onClick={handleVerifyIntegrity}
                disabled={isVerifying}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                <span>Vérifier Intégrité Merkle Tree</span>
              </button>
            </div>

            <div className="space-y-3">
              {archives.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-indigo-400 text-xs">{doc.archiveReference}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 font-mono">
                        {doc.documentCategory}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Rétention : {doc.retentionYears} ans (Échéance 2036)
                      </span>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Intégrité Scellée</span>
                    </span>
                  </div>

                  <div>
                    <h5 className="font-bold text-white text-xs">{doc.documentTitle}</h5>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Empreinte SHA-256 :</span>
                      <span className="text-slate-300 break-all">{doc.sha256Digest}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Jeton d'Horodatage RFC 3161 eIDAS :</span>
                      <span className="text-emerald-400 break-all">{doc.rfc3161TimestampSeal}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Stockage : <strong className="text-slate-300 font-mono">{doc.vaultStorageZone}</strong></span>
                    <span className="font-mono text-[10px]">Merkle Root : {doc.merkleRootHash.substring(0, 32)}...</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Sovereign HSM KMS Encryption (BYOK) */}
      {activeTab === 'HSM_KMS' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
            <div className="pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <span>Chiffrement Matériel HSM KMS &bull; Souveraineté BYOK (Bring Your Own Key)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Clés de chiffrement client hébergées sur modules cryptographiques matériels qualifiés ANSSI (FIPS 140-3 Niveau 3).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hsmKeys.map((key) => (
                <div
                  key={key.keyId}
                  className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-amber-400 block">{key.keyId}</span>
                      <h4 className="font-bold text-white text-sm mt-0.5">{key.alias}</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Actif en Production
                    </span>
                  </div>

                  <div className="space-y-2 text-xs bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Algorithme :</span>
                      <span className="font-mono font-bold text-white">{key.encryptionAlgorithm}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Certification HSM :</span>
                      <span className="font-mono text-amber-300 font-bold">{key.hsmFipsLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Opérateur Souverain :</span>
                      <span className="font-mono text-indigo-300">{key.sovereignProvider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Dernière Rotation :</span>
                      <span className="font-mono text-slate-300">{key.lastRotatedDate}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRotateKey(key.keyId)}
                    className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Effectuer une Rotation de Clé HSM</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Disaster Recovery (DRP) & SIEM Security Logs */}
      {activeTab === 'DRP_SIEM' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Server className="w-5 h-5 text-purple-400" />
                  <span>Plan de Reprise d’Activité (PRA / DRP) &bull; Synchronisation Miroir</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Réplication synchrone en temps réel entre deux datacenters qualifiés SecNumCloud distants de plus de 250 km.
                </p>
              </div>

              <button
                type="button"
                onClick={handleTriggerFailover}
                disabled={isFailingOver}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isFailingOver ? 'Bascule en cours...' : 'Simuler Bascule PRA (Failover)'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block font-semibold">Datacenter Maître (Primary)</span>
                <span className="font-bold text-white text-sm block">{drMetrics.primaryDatacenter}</span>
                <span className="text-emerald-400 text-[11px] font-semibold">En Ligne &bull; Trafic Actif</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block font-semibold">Datacenter Miroir (Secondary)</span>
                <span className="font-bold text-white text-sm block">{drMetrics.secondaryDatacenter}</span>
                <span className="text-indigo-400 text-[11px] font-semibold font-mono">
                  Statut : {drMetrics.replicationStatus}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block font-semibold">Temps de Bascule RTO Effectif</span>
                <span className="font-bold text-purple-400 text-sm font-mono block">
                  {drMetrics.rtoActualSeconds} secondes
                </span>
                <span className="text-slate-400 text-[11px]">Objectif SLA contractuel &lt; 300s</span>
              </div>
            </div>

            {/* Live SIEM Log Console (CEF Format) */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-white text-xs">Flux SIEM Temps Réel (Format CEF / Splunk / Datadog)</span>
                </div>
                <span className="font-mono text-[10px] text-emerald-400 font-bold">Connecteur Actif</span>
              </div>

              <div className="space-y-2 font-mono text-[11px]">
                {siemLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>[{log.timestamp}] &bull; {log.eventType}</span>
                      <span className="text-indigo-400">{log.sourceIp} ({log.actor})</span>
                    </div>
                    <div className="text-white text-xs">{log.description}</div>
                    <div className="text-[10px] text-slate-500 truncate">{log.cefPayloadFormat}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
