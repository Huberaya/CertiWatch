import React, { createContext, useContext, useState } from 'react';
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
  useAuth,
} from '@clerk/clerk-react';
import { Shield, Key, ExternalLink, CheckCircle2, User, Sparkles } from 'lucide-react';

const CLERK_PUBLISHABLE_KEY =
  (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined) || '';

export const isClerkConfigured = Boolean(
  CLERK_PUBLISHABLE_KEY && CLERK_PUBLISHABLE_KEY.startsWith('pk_')
);

interface ClerkContextValue {
  isConfigured: boolean;
  publishableKey: string;
  openConfigModal: () => void;
}

const ClerkContext = createContext<ClerkContextValue>({
  isConfigured: isClerkConfigured,
  publishableKey: CLERK_PUBLISHABLE_KEY,
  openConfigModal: () => {},
});

export function useCertiWatchClerk() {
  return useContext(ClerkContext);
}

export function ClerkAppProvider({ children }: { children: React.ReactNode }) {
  const [showConfigModal, setShowConfigModal] = useState(false);

  const contextValue: ClerkContextValue = {
    isConfigured: isClerkConfigured,
    publishableKey: CLERK_PUBLISHABLE_KEY,
    openConfigModal: () => setShowConfigModal(true),
  };

  const content = (
    <ClerkContext.Provider value={contextValue}>
      {children}
      {showConfigModal && (
        <ClerkSetupModal onClose={() => setShowConfigModal(false)} />
      )}
    </ClerkContext.Provider>
  );

  if (isClerkConfigured) {
    return (
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        {content}
      </ClerkProvider>
    );
  }

  return content;
}

export function ClerkAuthHeaderWidget() {
  const { isConfigured, openConfigModal } = useCertiWatchClerk();

  if (isConfigured) {
    return (
      <div className="flex items-center gap-2">
        <SignedIn>
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <UserButton afterSignOutUrl="/" />
            <ClerkUserIdentityBadge />
          </div>
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition shadow-sm"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Connexion Clerk</span>
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={openConfigModal}
      className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-violet-950/40 border border-violet-500/30 text-violet-300 hover:bg-violet-900/40 text-[11px] font-semibold transition"
      title="Clerk Auth & IAM intégré — Cliquez pour voir la configuration"
    >
      <Shield className="w-3.5 h-3.5 text-violet-400" />
      <span>Clerk &amp; Neon Prêts</span>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
    </button>
  );
}

function ClerkUserIdentityBadge() {
  const { user } = useUser();
  if (!user) return null;
  return (
    <div className="hidden lg:block text-left text-[11px] leading-tight">
      <p className="font-semibold text-slate-200">{user.fullName || user.primaryEmailAddress?.emailAddress}</p>
      <p className="text-[10px] text-violet-400 font-mono">Clerk SSO Active</p>
    </div>
  );
}

export function ClerkSetupModal({ onClose }: { onClose: () => void }) {
  const [copiedKey, setCopiedKey] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-left space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Intégration Neon PostgreSQL &amp; Clerk IAM
              </h3>
              <p className="text-xs text-slate-400">
                Architecture Enterprise prête pour la mise en production
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Neon Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Base de données : Neon Serverless PostgreSQL</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                Drizzle ORM 0.45+
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Le schéma PostgreSQL Drizzle complet (9 tables relationnelles : <code>tenants</code>, <code>users</code>, <code>suppliers</code>, <code>certificates</code>, <code>audit_logs</code>, <code>matrix_rules</code>, <code>eudr_declarations</code>, <code>webhooks</code>, <code>field_audits</code>) est généré et prêt pour la migration instantanée.
            </p>
            <div className="p-2.5 rounded-lg bg-slate-900 font-mono text-[11px] text-slate-400 break-all select-all">
              DATABASE_URL=postgresql://[user]:[password]@[endpoint].neon.tech/neondb?sslmode=require
            </div>
          </div>

          {/* Clerk Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-violet-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-violet-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span>Authentification &amp; SSO : Clerk</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-violet-950 text-violet-400 border border-violet-500/30 text-[10px] font-mono">
                @clerk/clerk-react
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Prêt pour l’authentification d’entreprise : connexion Google Workspace, Microsoft Entra ID (Azure AD), SAML SSO, gestion des rôles RBAC et sessions multi-utilisateurs.
            </p>
            <div className="p-2.5 rounded-lg bg-slate-900 font-mono text-[11px] text-slate-400 break-all select-all">
              VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-[11px] text-slate-400 space-y-1">
            <p className="font-semibold text-slate-200">Comment activer vos clés personnelles :</p>
            <p>1. Renseignez votre <code>DATABASE_URL</code> Neon et <code>VITE_CLERK_PUBLISHABLE_KEY</code> dans votre environnement.</p>
            <p>2. Lancez <code>npx drizzle-kit push</code> pour créer les tables automatiquement sur Neon.</p>
            <p>3. CertiWatch bascule automatiquement en persistance cloud et authentification Clerk !</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition"
          >
            Compris &amp; Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
