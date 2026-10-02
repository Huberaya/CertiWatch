import React, { useState, useEffect } from 'react';
import {
  Shield,
  Key,
  Users,
  Lock,
  Copy,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Laptop,
  Globe,
  Radio,
  Sparkles,
  UserCheck,
  UserX,
  FileCode,
  ShieldAlert,
  Sliders,
} from 'lucide-react';
import { iamStore } from '../../db/iamStore';
import {
  SamlConfiguration,
  ScimConfiguration,
  MfaPolicy,
  EnterpriseSession,
  IdpProvider,
} from '../../types/iam';
import { UserRole } from '../../types/tenant';
import { useCertiWatchClerk } from '../../lib/clerk';

export function EnterpriseIamPanel() {
  const [activeSubTab, setActiveSubTab] = useState<'OVERVIEW' | 'SAML' | 'SCIM' | 'MFA' | 'SESSIONS'>('OVERVIEW');
  const [saml, setSaml] = useState<SamlConfiguration>(iamStore.getSaml());
  const [scim, setScim] = useState<ScimConfiguration>(iamStore.getScim());
  const [mfa, setMfa] = useState<MfaPolicy>(iamStore.getMfa());
  const [sessions, setSessions] = useState<EnterpriseSession[]>(iamStore.getSessions());

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [isSimulatingScim, setIsSimulatingScim] = useState(false);
  const [simulatedUserEmail, setSimulatedUserEmail] = useState('julien.bernard@groupe-gema.com');
  const [scimLog, setScimLog] = useState<string | null>(null);

  const { isConfigured: isClerkActive, openConfigModal } = useCertiWatchClerk();

  useEffect(() => {
    const unsub = iamStore.subscribe(() => {
      setSaml(iamStore.getSaml());
      setScim(iamStore.getScim());
      setMfa(iamStore.getMfa());
      setSessions(iamStore.getSessions());
    });
    return () => {
      unsub();
    };
  }, []);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleSaveSaml = (e: React.FormEvent) => {
    e.preventDefault();
    iamStore.updateSaml(saml);
    setSaveSuccess('Configuration SAML 2.0 mise à jour avec succès.');
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handleSaveMfa = (e: React.FormEvent) => {
    e.preventDefault();
    iamStore.updateMfa(mfa);
    setSaveSuccess('Politique MFA / 2FA enregistrée.');
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handleRotateScimToken = () => {
    const newToken = iamStore.generateNewScimToken();
    setSaveSuccess('Nouveau Bearer Token SCIM 2.0 généré et activé.');
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handleSimulateScimProvisioning = async () => {
    setIsSimulatingScim(true);
    setScimLog(null);
    try {
      const res = await fetch('/api/scim/v2/Users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/scim+json',
          Authorization: `Bearer ${scim.bearerToken}`,
        },
        body: JSON.stringify({
          schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
          userName: simulatedUserEmail,
          name: { formatted: 'Julien Bernard' },
          emails: [{ value: simulatedUserEmail, primary: true }],
          roles: [{ value: 'BUYER' }],
          department: 'Direction Achats & Supply Chain',
        }),
      });
      const data = await res.json();
      setScimLog(
        `✓ [SCIM 201 Created] Utilisateur synchronisé avec succès depuis l'annuaire d'entreprise Okta/Azure ID: ${data.id} (${data.userName})`
      );
      iamStore.updateScim({
        totalSyncedUsers: scim.totalSyncedUsers + 1,
        lastSyncAt: new Date().toISOString(),
      });
    } catch (err: any) {
      setScimLog(`✗ Erreur de simulation SCIM: ${err.message}`);
    } finally {
      setIsSimulatingScim(false);
    }
  };

  const handleRevokeSession = (sessionId: string) => {
    iamStore.revokeSession(sessionId);
    setSaveSuccess('Session d’entreprise révoquée immédiatement.');
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handleRevokeAllOtherSessions = () => {
    iamStore.revokeAllOtherSessions();
    setSaveSuccess('Toutes les autres sessions d’entreprise ont été fermées.');
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-950/60 via-slate-900 to-indigo-950/40 border border-violet-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Chantier 12 : Enterprise IAM, SAML 2.0 &amp; SCIM 2.0 (Clerk SSO)
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Enterprise Tier
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Fédération d'identité pour Microsoft Entra ID (Azure AD), Okta, Google Workspace avec synchronisation SCIM RFC 7644.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openConfigModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Statut Clerk IAM</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Sub-tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveSubTab('OVERVIEW')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'OVERVIEW'
              ? 'bg-violet-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Vue d'ensemble IAM</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('SAML')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'SAML'
              ? 'bg-violet-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>SAML 2.0 (Okta / Azure)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('SCIM')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'SCIM'
              ? 'bg-violet-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Provisioning SCIM 2.0</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('MFA')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'MFA'
              ? 'bg-violet-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Politique MFA &amp; Passkeys</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('SESSIONS')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'SESSIONS'
              ? 'bg-violet-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>Sessions Actives ({sessions.length})</span>
        </button>
      </div>

      {/* Sub-Tab 1: Overview */}
      {activeSubTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Fournisseur d'Identité</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-xl font-bold text-white flex items-center gap-2">
              <span>{saml.provider}</span>
              <span className="text-xs text-violet-400 font-mono">SAML 2.0 + Clerk</span>
            </p>
            <p className="text-[11px] text-slate-400">
              Domaine restreint : <code className="text-violet-300 font-semibold">{saml.enforceForDomain}</code>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Utilisateurs Provisionnés SCIM</span>
              <Users className="w-4 h-4 text-violet-400" />
            </div>
            <p className="text-xl font-bold text-emerald-400">{scim.totalSyncedUsers} collaborateurs</p>
            <p className="text-[11px] text-slate-400">
              Synchronisation continue toutes les {scim.syncFrequencyMinutes} minutes.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Gouvernance MFA / 2FA</span>
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl font-bold text-white">{mfa.enforceRoles.length} Rôles Obligatoires</p>
            <p className="text-[11px] text-slate-400">
              Passkeys FIDO2 &amp; Authentificateurs TOTP obligatoires pour Administrateurs et Acheteurs.
            </p>
          </div>

          {/* Quick Info Block */}
          <div className="col-span-full p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <h4 className="font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Conformité SOC 2 Type II (Trust Service Criteria CC6.1 &amp; CC6.2)</span>
            </h4>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              L'architecture IAM de CertiWatch sépare rigoureusement les sessions par locataire (tenant isolation), valide les signatures cryptographiques X.509 des assertions SAML et révoque instantanément les droits d'accès via le webhook SCIM lors du départ d'un collaborateur (dé-provisioning immédiat).
            </p>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: SAML 2.0 Configuration */}
      {activeSubTab === 'SAML' && (
        <form onSubmit={handleSaveSaml} className="space-y-4">
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="font-bold text-white text-sm">Paramètres Service Provider (SP) CertiWatch</h4>
                <p className="text-slate-400 text-[11px]">
                  Renseignez ces métadonnées dans votre console Okta, Azure Entra ID ou Google Admin.
                </p>
              </div>
              <a
                href="/api/auth/saml/metadata"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
              >
                <FileCode className="w-3.5 h-3.5 text-violet-400" />
                <span>Télécharger SP Metadata XML</span>
              </a>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  SP Entity ID / Audience URI
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={saml.entityId}
                    className="flex-1 p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(saml.entityId, 'entityId')}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  >
                    {copiedField === 'entityId' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Assertion Consumer Service (ACS) URL (HTTP-POST)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={saml.acsUrl}
                    className="flex-1 p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(saml.acsUrl, 'acsUrl')}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  >
                    {copiedField === 'acsUrl' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Fournisseur d'Identité (IdP)
                  </label>
                  <select
                    value={saml.provider}
                    onChange={(e) => setSaml({ ...saml, provider: e.target.value as IdpProvider })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs"
                  >
                    <option value="OKTA">Okta Enterprise</option>
                    <option value="AZURE_AD">Microsoft Entra ID (Azure AD)</option>
                    <option value="GOOGLE_WORKSPACE">Google Workspace SAML</option>
                    <option value="PING_IDENTITY">Ping Identity / PingFederate</option>
                    <option value="CLERK">Clerk Native SSO</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Restreindre au domaine de messagerie
                  </label>
                  <input
                    type="text"
                    value={saml.enforceForDomain || ''}
                    onChange={(e) => setSaml({ ...saml, enforceForDomain: e.target.value })}
                    placeholder="ex: groupe-gema.com ou saint-gobain.com"
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  URL des Métadonnées IdP (XML Endpoint)
                </label>
                <input
                  type="url"
                  value={saml.idpMetadataUrl || ''}
                  onChange={(e) => setSaml({ ...saml, idpMetadataUrl: e.target.value })}
                  placeholder="https://your-domain.okta.com/app/.../sso/saml/metadata"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs font-mono"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saml.autoProvisionUsers}
                    onChange={(e) => setSaml({ ...saml, autoProvisionUsers: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-950 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-slate-300">
                    Just-in-Time (JIT) Provisioning automatique lors de la première connexion
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition"
              >
                Enregistrer la Configuration SAML
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Sub-Tab 3: SCIM 2.0 Provisioning */}
      {activeSubTab === 'SCIM' && (
        <div className="space-y-4 text-xs">
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="font-bold text-white text-sm">Passerelle de Synchronisation Annuaire SCIM 2.0</h4>
                <p className="text-slate-400 text-[11px]">
                  Protocole RFC 7644 pour la création, mise à jour et révocation automatique des accès.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                RFC 7643 / 7644 Conforme
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  SCIM 2.0 Base URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={scim.endpointUrl}
                    className="flex-1 p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(scim.endpointUrl, 'scimUrl')}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  >
                    {copiedField === 'scimUrl' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  OAuth Bearer Secret Token
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    readOnly
                    value={scim.bearerToken}
                    className="flex-1 p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(scim.bearerToken, 'scimToken')}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  >
                    {copiedField === 'scimToken' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleRotateScimToken}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center gap-1"
                    title="Régénérer le token"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Régénérer</span>
                  </button>
                </div>
              </div>

              {/* Simulator */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h5 className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Simulateur d'événement SCIM (Test de synchronisation)</span>
                </h5>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={simulatedUserEmail}
                    onChange={(e) => setSimulatedUserEmail(e.target.value)}
                    placeholder="email.utilisateur@entreprise.com"
                    className="flex-1 p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleSimulateScimProvisioning}
                    disabled={isSimulatingScim}
                    className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingScim ? 'animate-spin' : ''}`} />
                    <span>Déclencher Provisioning</span>
                  </button>
                </div>
                {scimLog && (
                  <p className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-400">
                    {scimLog}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: MFA & Passkeys Policy */}
      {activeSubTab === 'MFA' && (
        <form onSubmit={handleSaveMfa} className="space-y-4 text-xs">
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <h4 className="font-bold text-white text-sm">Gouvernance Multi-Facteurs (2FA / MFA)</h4>
              <p className="text-slate-400 text-[11px]">
                Exigence de sécurité pour les rôles habilités aux blocages ERP et dérogations d'achats.
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mfa.enforceAllUsers}
                  onChange={(e) => setMfa({ ...mfa, enforceAllUsers: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-violet-600 focus:ring-violet-500"
                />
                <span className="font-bold text-white">
                  Exiger l'authentification 2FA pour absolument TOUS les utilisateurs de l'organisation
                </span>
              </label>

              <div className="pt-2">
                <span className="block text-[11px] font-bold text-slate-400 mb-2">
                  Rôles soumis à l'obligation 2FA stricte :
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['ADMIN', 'QUALITY_MANAGER', 'PROCUREMENT_MANAGER', 'AUDITOR'] as UserRole[]).map(
                    (role) => {
                      const isChecked = mfa.enforceRoles.includes(role);
                      return (
                        <label
                          key={role}
                          className={`p-2.5 rounded-lg border cursor-pointer flex items-center gap-2 transition ${
                            isChecked
                              ? 'bg-violet-950/40 border-violet-500/40 text-violet-200'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setMfa({ ...mfa, enforceRoles: [...mfa.enforceRoles, role] });
                              } else {
                                setMfa({
                                  ...mfa,
                                  enforceRoles: mfa.enforceRoles.filter((r) => r !== role),
                                });
                              }
                            }}
                            className="rounded border-slate-700 bg-slate-900 text-violet-600"
                          />
                          <span className="font-mono text-[11px]">{role}</span>
                        </label>
                      );
                    }
                  )}
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Période de grâce d'enrôlement pour les nouveaux collaborateurs (jours)
                </label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={mfa.gracePeriodDays}
                  onChange={(e) => setMfa({ ...mfa, gracePeriodDays: parseInt(e.target.value) || 0 })}
                  className="w-32 p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition"
              >
                Appliquer la Politique 2FA
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Sub-Tab 5: Active Sessions Monitor */}
      {activeSubTab === 'SESSIONS' && (
        <div className="space-y-4 text-xs">
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h4 className="font-bold text-white text-sm">Gestion des Sessions d'Entreprise</h4>
                <p className="text-slate-400 text-[11px]">
                  Contrôlez les connexions actives et révoquez immédiatement les jetons suspects.
                </p>
              </div>

              {sessions.length > 1 && (
                <button
                  type="button"
                  onClick={handleRevokeAllOtherSessions}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>Révoquer toutes les autres sessions</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className={`p-3.5 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 transition ${
                    sess.isCurrent
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
                      <Laptop className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{sess.userName}</span>
                        <span className="font-mono text-[10px] text-slate-400">({sess.userEmail})</span>
                        {sess.isCurrent && (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                            Session Actuelle
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                          {sess.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3 text-slate-500" />
                          <span>{sess.location}</span>
                        </span>
                        <span className="font-mono text-slate-500">{sess.ipAddress}</span>
                        <span>&bull;</span>
                        <span>{sess.device}</span>
                        <span>&bull;</span>
                        <span>{sess.browser}</span>
                        <span>&bull;</span>
                        <span className="text-violet-300 font-semibold">{sess.authMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <span className="text-[11px] text-slate-400 mr-2">{sess.lastActiveAt}</span>
                    {!sess.isCurrent && (
                      <button
                        type="button"
                        onClick={() => handleRevokeSession(sess.id)}
                        className="px-2.5 py-1 rounded bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-[11px] font-semibold transition"
                      >
                        Révoquer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
