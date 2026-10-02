import {
  SamlConfiguration,
  ScimConfiguration,
  MfaPolicy,
  EnterpriseSession,
} from '../types/iam';
import { UserRole } from '../types/tenant';

const defaultSaml: SamlConfiguration = {
  enabled: true,
  provider: 'OKTA',
  entityId: 'urn:certiwatch:sp:tenant_alpha',
  acsUrl: 'https://ais-dev-5uyzcrd6log7r474rmwavj-531644593121.europe-west2.run.app/api/auth/saml/callback',
  singleLogoutUrl: 'https://ais-dev-5uyzcrd6log7r474rmwavj-531644593121.europe-west2.run.app/api/auth/saml/logout',
  idpMetadataUrl: 'https://dev-820491.okta.com/app/exk48201/sso/saml/metadata',
  enforceForDomain: 'groupe-gema.com',
  autoProvisionUsers: true,
  defaultRole: 'PROCUREMENT_MANAGER',
  verifiedAt: '2026-09-28T14:30:00Z',
};

const defaultScim: ScimConfiguration = {
  enabled: true,
  endpointUrl: 'https://ais-dev-5uyzcrd6log7r474rmwavj-531644593121.europe-west2.run.app/api/scim/v2',
  bearerToken: 'scim_token_live_sec_89df210ca38491bb819c90a1',
  tokenExpiresAt: '2027-09-30T00:00:00Z',
  syncFrequencyMinutes: 15,
  lastSyncAt: '2026-09-30T06:15:00Z',
  totalSyncedUsers: 48,
  autoDeactivateOnDeprovision: true,
};

const defaultMfa: MfaPolicy = {
  enforceAllUsers: false,
  enforceRoles: ['ADMIN', 'PROCUREMENT_MANAGER', 'QUALITY_MANAGER'],
  allowedMethods: ['TOTP', 'FIDO2_PASSKEY'],
  gracePeriodDays: 7,
};

const initialSessions: EnterpriseSession[] = [
  {
    id: 'sess_live_01',
    userId: 'u_admin_01',
    userName: 'Claire Delacroix',
    userEmail: 'claire.delacroix@certiwatch.io',
    role: 'ADMIN',
    ipAddress: '194.254.120.45',
    location: 'Paris, France (Fibre Orange Enterprise)',
    device: 'MacBook Pro 16" (macOS Sequoia)',
    browser: 'Chrome 129.0',
    isCurrent: true,
    loginAt: '2026-09-30T07:12:00Z',
    lastActiveAt: 'À l’instant',
    authMethod: 'CLERK_SSO',
  },
  {
    id: 'sess_live_02',
    userId: 'u_comp_02',
    userName: 'Marc Lemoine',
    userEmail: 'marc.lemoine@certiwatch.io',
    role: 'QUALITY_MANAGER',
    ipAddress: '82.65.14.92',
    location: 'Lyon, France',
    device: 'ThinkPad X1 Carbon (Ubuntu 24.04)',
    browser: 'Firefox 130.0',
    isCurrent: false,
    loginAt: '2026-09-30T06:45:00Z',
    lastActiveAt: 'Il y a 14 min',
    authMethod: 'SAML_OKTA',
  },
  {
    id: 'sess_live_03',
    userId: 'u_buyer_03',
    userName: 'Sophie Bernard',
    userEmail: 'sophie.bernard@certiwatch.io',
    role: 'PROCUREMENT_MANAGER',
    ipAddress: '213.186.33.5',
    location: 'Bordeaux, France',
    device: 'Dell XPS 15 (Windows 11 Enterprise)',
    browser: 'Edge 128.0',
    isCurrent: false,
    loginAt: '2026-09-30T05:30:00Z',
    lastActiveAt: 'Il y a 48 min',
    authMethod: 'PASSKEY_FIDO2',
  },
];

class IamStore {
  private saml: SamlConfiguration = defaultSaml;
  private scim: ScimConfiguration = defaultScim;
  private mfa: MfaPolicy = defaultMfa;
  private sessions: EnterpriseSession[] = initialSessions;
  private listeners: Set<() => void> = new Set();

  public subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public getSaml(): SamlConfiguration {
    return { ...this.saml };
  }

  public updateSaml(update: Partial<SamlConfiguration>) {
    this.saml = { ...this.saml, ...update };
    this.notify();
  }

  public getScim(): ScimConfiguration {
    return { ...this.scim };
  }

  public updateScim(update: Partial<ScimConfiguration>) {
    this.scim = { ...this.scim, ...update };
    this.notify();
  }

  public generateNewScimToken(): string {
    const newToken =
      'scim_token_live_sec_' +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    this.scim.bearerToken = newToken;
    this.scim.tokenExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    this.notify();
    return newToken;
  }

  public getMfa(): MfaPolicy {
    return { ...this.mfa };
  }

  public updateMfa(update: Partial<MfaPolicy>) {
    this.mfa = { ...this.mfa, ...update };
    this.notify();
  }

  public getSessions(): EnterpriseSession[] {
    return [...this.sessions];
  }

  public revokeSession(sessionId: string) {
    this.sessions = this.sessions.filter((s) => s.id !== sessionId);
    this.notify();
  }

  public revokeAllOtherSessions() {
    this.sessions = this.sessions.filter((s) => s.isCurrent);
    this.notify();
  }
}

export const iamStore = new IamStore();
