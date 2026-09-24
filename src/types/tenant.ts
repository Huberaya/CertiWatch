export type UserRole = 'ADMIN' | 'QUALITY_MANAGER' | 'PROCUREMENT_MANAGER' | 'AUDITOR' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  department: string;
  tenantId: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  industry: 'AGRI_FOOD' | 'LUXURY_TEXTILE' | 'RETAIL' | 'MANUFACTURING';
  logo?: string;
  monitoredCertificatesCount: number;
  maxCertificatesAllowed: number;
  maxSuppliersAllowed: number;
  tier: 'STARTER' | 'BUSINESS' | 'ENTERPRISE';
  pricePerCertMonthly: number;
  createdAt: string;
}

export interface RolePermissions {
  canCreateSupplier: boolean;
  canEditSupplier: boolean;
  canDeleteSupplier: boolean;
  canUploadCertificate: boolean;
  canVerifyCertificate: boolean;
  canManageAlerts: boolean;
  canEditMatrix: boolean;
  canManageTenant: boolean;
  canExportAuditTrail: boolean;
  canOverrideErpBlock: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  ADMIN: {
    canCreateSupplier: true,
    canEditSupplier: true,
    canDeleteSupplier: true,
    canUploadCertificate: true,
    canVerifyCertificate: true,
    canManageAlerts: true,
    canEditMatrix: true,
    canManageTenant: true,
    canExportAuditTrail: true,
    canOverrideErpBlock: true,
  },
  QUALITY_MANAGER: {
    canCreateSupplier: true,
    canEditSupplier: true,
    canDeleteSupplier: false,
    canUploadCertificate: true,
    canVerifyCertificate: true,
    canManageAlerts: true,
    canEditMatrix: true,
    canManageTenant: false,
    canExportAuditTrail: true,
    canOverrideErpBlock: false,
  },
  PROCUREMENT_MANAGER: {
    canCreateSupplier: true,
    canEditSupplier: true,
    canDeleteSupplier: false,
    canUploadCertificate: false,
    canVerifyCertificate: false,
    canManageAlerts: true,
    canEditMatrix: false,
    canManageTenant: false,
    canExportAuditTrail: false,
    canOverrideErpBlock: true,
  },
  AUDITOR: {
    canCreateSupplier: false,
    canEditSupplier: false,
    canDeleteSupplier: false,
    canUploadCertificate: false,
    canVerifyCertificate: false,
    canManageAlerts: false,
    canEditMatrix: false,
    canManageTenant: false,
    canExportAuditTrail: true,
    canOverrideErpBlock: false,
  },
  VIEWER: {
    canCreateSupplier: false,
    canEditSupplier: false,
    canDeleteSupplier: false,
    canUploadCertificate: false,
    canVerifyCertificate: false,
    canManageAlerts: false,
    canEditMatrix: false,
    canManageTenant: false,
    canExportAuditTrail: false,
    canOverrideErpBlock: false,
  },
};
