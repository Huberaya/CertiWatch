import { UserRole } from './tenant';

export type SsoProtocol = 'SAML_2_0' | 'OIDC' | 'CLERK_NATIVE';

export type IdpProvider = 'OKTA' | 'AZURE_AD' | 'GOOGLE_WORKSPACE' | 'PING_IDENTITY' | 'CLERK';

export interface SamlConfiguration {
  enabled: boolean;
  provider: IdpProvider;
  entityId: string; // SP Entity ID
  acsUrl: string; // Assertion Consumer Service URL
  singleLogoutUrl: string;
  idpMetadataUrl?: string;
  idpMetadataXml?: string;
  enforceForDomain?: string; // e.g. "groupe-gema.com" or "saint-gobain.com"
  autoProvisionUsers: boolean;
  defaultRole: UserRole;
  verifiedAt?: string;
}

export interface ScimConfiguration {
  enabled: boolean;
  endpointUrl: string;
  bearerToken: string;
  tokenExpiresAt: string;
  syncFrequencyMinutes: number;
  lastSyncAt?: string;
  totalSyncedUsers: number;
  autoDeactivateOnDeprovision: boolean;
}

export interface MfaPolicy {
  enforceAllUsers: boolean;
  enforceRoles: UserRole[]; // e.g. ['ADMIN', 'BUYER', 'COMPLIANCE_OFFICER']
  allowedMethods: ('TOTP' | 'FIDO2_PASSKEY' | 'SMS_OTP')[];
  gracePeriodDays: number;
}

export interface EnterpriseSession {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: UserRole;
  ipAddress: string;
  location: string;
  device: string;
  browser: string;
  isCurrent: boolean;
  loginAt: string;
  lastActiveAt: string;
  authMethod: 'SAML_OKTA' | 'CLERK_SSO' | 'PASSKEY_FIDO2' | 'PASSWORD_2FA';
}
