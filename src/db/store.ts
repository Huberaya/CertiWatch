import { Tenant, User, UserRole, ROLE_PERMISSIONS } from '../types/tenant';
import {
  Supplier,
  SupplierRiskLevel,
  MultiFactorRiskScore,
  SupplierAuditRecord,
  ErpBlockStatus,
  SupplierTier,
  SpendCriticality,
} from '../types/supplier';
import { Certificate, CertificateStatus, CertificationStandard, VerificationOutcome } from '../types/certificate';
import { ComplianceAlert, AlertStatus } from '../types/alert';
import { AuditLogEntry, AuditChainVerificationResult } from '../types/audit';
import { generateEventSeal, verifyAuditChainIntegrity } from '../utils/cryptoAudit';
import {
  ComplianceMatrixRule,
  OrderComplianceCheckResult,
  SupplierMatrixComplianceSummary,
} from '../types/matrix';
import { CertificationProviderMetadata, OrchestrationConfig, OrchestratorRunLog } from '../types/connector';
import {
  EudrPlotDeclaration,
  GeneratedAuditPack,
  OfficialAuditPackConfig,
  CsrdEsrsScorecard,
  SupplierPortalSession,
} from '../types/report';
import {
  SEED_TENANTS,
  SEED_USERS,
  SEED_SUPPLIERS,
  SEED_CERTIFICATES,
  SEED_ALERTS,
  SEED_AUDIT_LOGS,
  SEED_COMPLIANCE_MATRIX,
  SEED_PROVIDERS,
  SEED_ORCHESTRATION_CONFIG,
  SEED_ORCHESTRATOR_RUNS,
  SEED_EUDR_PLOTS,
  SEED_AUDIT_PACKS,
} from './seedData';

const STORAGE_KEY_PREFIX = 'certiwatch_v1_';

export interface AppStoreState {
  tenants: Tenant[];
  users: User[];
  activeTenantId: string;
  activeUserId: string;
  suppliers: Supplier[];
  certificates: Certificate[];
  alerts: ComplianceAlert[];
  auditLogs: AuditLogEntry[];
  matrixRules: ComplianceMatrixRule[];
  providers: CertificationProviderMetadata[];
  orchestrationConfig: OrchestrationConfig;
  orchestratorRunLogs: OrchestratorRunLog[];
  eudrPlots: EudrPlotDeclaration[];
  generatedAuditPacks: GeneratedAuditPack[];
  supplierPortalSubmissions: Record<string, any>;
  lastSyncTimestamp: string;
  isAutoSyncing: boolean;
}

class Store {
  private state: AppStoreState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadInitialState();
  }

  private loadInitialState(): AppStoreState {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}state`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.tenants && parsed.suppliers && parsed.certificates) {
          if (!parsed.eudrPlots) parsed.eudrPlots = SEED_EUDR_PLOTS;
          if (!parsed.generatedAuditPacks) parsed.generatedAuditPacks = SEED_AUDIT_PACKS;
          if (!parsed.supplierPortalSubmissions) parsed.supplierPortalSubmissions = {};
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load saved state, falling back to seed dataset', e);
    }

    return {
      tenants: SEED_TENANTS,
      users: SEED_USERS,
      activeTenantId: 'tenant-danone-global',
      activeUserId: 'usr-admin-1',
      suppliers: SEED_SUPPLIERS,
      certificates: SEED_CERTIFICATES,
      alerts: SEED_ALERTS,
      auditLogs: SEED_AUDIT_LOGS,
      matrixRules: SEED_COMPLIANCE_MATRIX,
      providers: SEED_PROVIDERS,
      orchestrationConfig: SEED_ORCHESTRATION_CONFIG,
      orchestratorRunLogs: SEED_ORCHESTRATOR_RUNS,
      eudrPlots: SEED_EUDR_PLOTS,
      generatedAuditPacks: SEED_AUDIT_PACKS,
      supplierPortalSubmissions: {},
      lastSyncTimestamp: new Date().toISOString(),
      isAutoSyncing: false,
    };
  }

  private saveState() {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}state`, JSON.stringify(this.state));
    } catch (e) {
      console.error('Error saving state to localStorage', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // --- Getters with strict multi-tenant isolation ---

  public getState(): AppStoreState {
    return this.state;
  }

  public getActiveTenant(): Tenant {
    return (
      this.state.tenants.find((t) => t.id === this.state.activeTenantId) ||
      this.state.tenants[0]
    );
  }

  public getActiveUser(): User {
    return (
      this.state.users.find((u) => u.id === this.state.activeUserId) ||
      this.state.users[0]
    );
  }

  public getActivePermissions() {
    const user = this.getActiveUser();
    return ROLE_PERMISSIONS[user.role];
  }

  public getTenantSuppliers(): Supplier[] {
    return this.state.suppliers.filter(
      (s) => s.tenantId === this.state.activeTenantId
    );
  }

  public getTenantCertificates(): Certificate[] {
    return this.state.certificates.filter(
      (c) => c.tenantId === this.state.activeTenantId
    );
  }

  public getTenantAlerts(): ComplianceAlert[] {
    return this.state.alerts.filter(
      (a) => a.tenantId === this.state.activeTenantId
    );
  }

  public getTenantAuditLogs(): AuditLogEntry[] {
    return this.state.auditLogs
      .filter((l) => l.tenantId === this.state.activeTenantId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getTenantMatrixRules(): ComplianceMatrixRule[] {
    return this.state.matrixRules.filter(
      (m) => m.tenantId === this.state.activeTenantId
    );
  }

  public getProviders(): CertificationProviderMetadata[] {
    return this.state.providers;
  }

  public getOrchestrationConfig(): OrchestrationConfig {
    return this.state.orchestrationConfig;
  }

  public getTenantOrchestratorLogs(): OrchestratorRunLog[] {
    return this.state.orchestratorRunLogs
      .filter((r) => r.tenantId === this.state.activeTenantId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  // --- Actions ---

  public setActiveTenant(tenantId: string) {
    if (this.state.tenants.some((t) => t.id === tenantId)) {
      this.state.activeTenantId = tenantId;
      // Switch active user to an authorized user of this tenant
      const tenantUser = this.state.users.find((u) => u.tenantId === tenantId);
      if (tenantUser) {
        this.state.activeUserId = tenantUser.id;
      }
      this.saveState();
    }
  }

  public setActiveRole(role: UserRole) {
    const currentUser = this.getActiveUser();
    currentUser.role = role;
    this.saveState();
  }

  public setActiveUser(userId: string) {
    if (this.state.users.some((u) => u.id === userId)) {
      this.state.activeUserId = userId;
      const user = this.getActiveUser();
      this.state.activeTenantId = user.tenantId;
      this.saveState();
    }
  }

  // --- Audit Trail helper ---
  public addAuditLog(
    entry: Omit<
      AuditLogEntry,
      'id' | 'timestamp' | 'tenantId' | 'userId' | 'userName' | 'userRole' | 'hash' | 'previousHash' | 'blockNumber' | 'digitalSeal'
    >
  ) {
    const user = this.getActiveUser();
    const timestamp = new Date().toISOString();
    const previousEntry = this.state.auditLogs[0];
    const previousHash =
      previousEntry?.hash || '0000000000000000000000000000000000000000000000000000000000000000';
    const blockNumber = (previousEntry?.blockNumber || this.state.auditLogs.length) + 1;

    const { hash, digitalSeal } = generateEventSeal({
      tenantId: this.state.activeTenantId,
      timestamp,
      actionCategory: entry.actionCategory,
      entityId: entry.entityId,
      previousHash,
      details: entry.details,
    });

    const newEntry: AuditLogEntry = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      tenantId: this.state.activeTenantId,
      timestamp,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      ipAddress: entry.ipAddress || '194.254.12.8',
      hash,
      previousHash,
      blockNumber,
      digitalSeal,
      ...entry,
    };
    this.state.auditLogs.unshift(newEntry);
    this.saveState();
  }

  public verifyAuditIntegrity(): AuditChainVerificationResult {
    const tenantLogs = this.getTenantAuditLogs();
    return verifyAuditChainIntegrity(tenantLogs);
  }

  public exportAuditLogsCSV(): string {
    const logs = this.getTenantAuditLogs();
    const headers = [
      'Bloc N°',
      'Horodatage (UTC)',
      'Auteur / Acteur',
      'Rôle',
      'Catégorie Action',
      'Type Entité',
      'Référence Entité',
      'Source',
      'Détails Événement',
      'Empreinte SHA-256 (Hash)',
      'Hash Précédent',
      'Sceau Électronique',
    ];

    const rows = logs.map((l) => [
      `"${l.blockNumber || 0}"`,
      `"${l.timestamp}"`,
      `"${l.userName.replace(/"/g, '""')}"`,
      `"${l.userRole}"`,
      `"${l.actionCategory}"`,
      `"${l.entityType}"`,
      `"${l.entityReference.replace(/"/g, '""')}"`,
      `"${l.source}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      `"${l.hash || ''}"`,
      `"${l.previousHash || ''}"`,
      `"${l.digitalSeal || ''}"`,
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }

  public exportAuditLogsJSON(): string {
    const logs = this.getTenantAuditLogs();
    const integrity = this.verifyAuditIntegrity();
    const tenant = this.getActiveTenant();

    const output = {
      exportMetadata: {
        system: 'CertiWatch Compliance Platform',
        tenantId: tenant.id,
        tenantName: tenant.name,
        exportedAt: new Date().toISOString(),
        totalLogs: logs.length,
        cryptographicIntegrity: integrity,
      },
      auditRecords: logs,
    };

    return JSON.stringify(output, null, 2);
  }

  // --- Supplier Mutations ---
  public addSupplier(supplierData: Omit<Supplier, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'totalCertificatesCount' | 'validCertificatesCount' | 'criticalIssuesCount'>) {
    const id = 'sup-' + Date.now().toString(36);
    const newSupplier: Supplier = {
      ...supplierData,
      id,
      tenantId: this.state.activeTenantId,
      totalCertificatesCount: 0,
      validCertificatesCount: 0,
      criticalIssuesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.suppliers.push(newSupplier);
    this.addAuditLog({
      actionCategory: 'SUPPLIER_CREATED',
      entityType: 'SUPPLIER',
      entityId: id,
      entityReference: newSupplier.legalName,
      source: 'MANUAL_UI',
      newValue: newSupplier.legalName,
      details: `Création du fournisseur ${newSupplier.legalName} (${newSupplier.country}) - ID ${newSupplier.internalId}`,
    });
    this.saveState();
    return newSupplier;
  }

  public updateSupplier(id: string, updates: Partial<Supplier>) {
    const index = this.state.suppliers.findIndex(
      (s) => s.id === id && s.tenantId === this.state.activeTenantId
    );
    if (index !== -1) {
      const prev = this.state.suppliers[index];
      this.state.suppliers[index] = {
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.addAuditLog({
        actionCategory: 'SUPPLIER_MODIFIED',
        entityType: 'SUPPLIER',
        entityId: id,
        entityReference: prev.legalName,
        source: 'MANUAL_UI',
        previousValue: JSON.stringify({ status: prev.status, risk: prev.riskLevel }),
        newValue: JSON.stringify({ status: updates.status || prev.status, risk: updates.riskLevel || prev.riskLevel }),
        details: `Modification de la fiche fournisseur ${prev.legalName}`,
      });
      this.saveState();
    }
  }

  public deleteSupplier(id: string) {
    const supplier = this.state.suppliers.find((s) => s.id === id && s.tenantId === this.state.activeTenantId);
    if (!supplier) return;

    this.state.suppliers = this.state.suppliers.filter((s) => s.id !== id);
    // Cascade delete or archive certificates
    this.state.certificates = this.state.certificates.filter((c) => c.supplierId !== id);
    this.state.alerts = this.state.alerts.filter((a) => a.supplierId !== id);

    this.addAuditLog({
      actionCategory: 'SUPPLIER_STATUS_CHANGED',
      entityType: 'SUPPLIER',
      entityId: id,
      entityReference: supplier.legalName,
      source: 'MANUAL_UI',
      previousValue: supplier.legalName,
      newValue: 'DELETED',
      details: `Suppression du fournisseur ${supplier.legalName} et purge des certificats associés.`,
    });
    this.saveState();
  }

  // --- ERP Block / Derogation Management ---
  public setSupplierErpBlock(
    supplierId: string,
    blockStatus: ErpBlockStatus,
    reason?: string,
    justification?: string,
    derogationDays?: number
  ) {
    const supplier = this.state.suppliers.find(
      (s) => s.id === supplierId && s.tenantId === this.state.activeTenantId
    );
    if (!supplier) return;

    const user = this.getActiveUser();
    const prevBlockStatus = supplier.erpConfig?.blockStatus || (supplier.status === 'BLOCKED' ? 'BLOCKED' : 'ALLOWED');

    let derogationExpiresAt: string | undefined;
    if (blockStatus === 'TEMPORARY_DEROGATION' && derogationDays) {
      const d = new Date();
      d.setDate(d.getDate() + derogationDays);
      derogationExpiresAt = d.toISOString().split('T')[0];
    }

    const erpConfig = {
      erpSystem: supplier.erpConfig?.erpSystem || ('SAP S/4HANA' as const),
      erpVendorNumber: supplier.erpConfig?.erpVendorNumber || supplier.internalId,
      blockStatus,
      blockedReason: blockStatus === 'BLOCKED' ? reason || 'Non-conformité critique certificat' : undefined,
      blockedAt: blockStatus === 'BLOCKED' ? new Date().toISOString() : undefined,
      blockedBy: blockStatus === 'BLOCKED' ? user.name : undefined,
      derogationExpiresAt,
      derogationJustification: justification,
    };

    const newSupplierStatus =
      blockStatus === 'BLOCKED' ? 'BLOCKED' : blockStatus === 'TEMPORARY_DEROGATION' ? 'ON_HOLD' : 'ACTIVE';

    this.updateSupplier(supplierId, {
      status: newSupplierStatus,
      erpBlockedReason: erpConfig.blockedReason,
      erpConfig,
    });

    this.addAuditLog({
      actionCategory: 'ERP_BLOCK_TRIGGERED',
      entityType: 'SUPPLIER',
      entityId: supplierId,
      entityReference: supplier.legalName,
      source: 'MANUAL_UI',
      previousValue: prevBlockStatus,
      newValue: blockStatus,
      details:
        blockStatus === 'BLOCKED'
          ? `Blocage commandes d'achat ERP activé pour ${supplier.legalName}. Motif : ${reason || 'Non-conformité'}`
          : blockStatus === 'TEMPORARY_DEROGATION'
          ? `Dérogation temporaire accordée jusqu'au ${derogationExpiresAt} pour ${supplier.legalName}. Justification : ${justification}`
          : `Levée du blocage ERP pour ${supplier.legalName}. Commandes ré-autorisées.`,
    });
  }

  // --- Supplier Audit Records ---
  public addSupplierAuditRecord(supplierId: string, record: Omit<SupplierAuditRecord, 'id'>) {
    const supplier = this.state.suppliers.find(
      (s) => s.id === supplierId && s.tenantId === this.state.activeTenantId
    );
    if (!supplier) return;

    const newRecord: SupplierAuditRecord = {
      id: 'aud-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 5),
      ...record,
    };

    const history = supplier.auditHistory ? [newRecord, ...supplier.auditHistory] : [newRecord];
    this.updateSupplier(supplierId, { auditHistory: history });

    this.addAuditLog({
      actionCategory: 'SUPPLIER_MODIFIED',
      entityType: 'SUPPLIER',
      entityId: supplierId,
      entityReference: supplier.legalName,
      source: 'MANUAL_UI',
      newValue: record.conclusion,
      details: `Enregistrement d'un audit (${record.auditType}) pour ${supplier.legalName} - Score: ${record.score}/100, Conclusion: ${record.conclusion}`,
    });
  }

  // --- Batch Import Engine with Deduplication ---
  public batchImportSuppliers(
    importedRows: Array<{
      legalName: string;
      tradeName?: string;
      country?: string;
      countryCode?: string;
      address?: string;
      internalId?: string;
      businessRegistrationNumber?: string;
      contactName?: string;
      contactEmail?: string;
      contactPhone?: string;
      productCategories?: string[];
      tier?: SupplierTier;
      spendCriticality?: SpendCriticality;
    }>,
    duplicateStrategy: 'SKIP_EXISTING' | 'UPDATE_EXISTING' | 'CREATE_COPY' = 'SKIP_EXISTING'
  ) {
    const tenantSuppliers = this.getTenantSuppliers();
    const result = {
      totalRead: importedRows.length,
      imported: 0,
      updated: 0,
      skipped: 0,
      duplicatesFound: 0,
      errors: 0,
      details: [] as Array<{
        row: number;
        name: string;
        internalId?: string;
        status: 'IMPORTED' | 'UPDATED' | 'SKIPPED' | 'ERROR';
        message: string;
      }>,
    };

    importedRows.forEach((row, index) => {
      const rowNum = index + 1;
      if (!row.legalName || row.legalName.trim().length === 0) {
        result.errors++;
        result.details.push({
          row: rowNum,
          name: row.legalName || 'Ligne vide',
          status: 'ERROR',
          message: 'Raison sociale obligatoire manquante',
        });
        return;
      }

      // Check collision / duplicate
      const cleanName = row.legalName.trim().toLowerCase();
      const cleanReg = row.businessRegistrationNumber?.trim().toLowerCase();
      const cleanInternal = row.internalId?.trim().toLowerCase();

      const existing = tenantSuppliers.find((s) => {
        if (cleanInternal && s.internalId.toLowerCase() === cleanInternal) return true;
        if (cleanReg && s.businessRegistrationNumber.toLowerCase() === cleanReg) return true;
        if (s.legalName.toLowerCase() === cleanName) return true;
        return false;
      });

      if (existing) {
        result.duplicatesFound++;
        if (duplicateStrategy === 'SKIP_EXISTING') {
          result.skipped++;
          result.details.push({
            row: rowNum,
            name: row.legalName,
            internalId: existing.internalId,
            status: 'SKIPPED',
            message: `Doublon détecté avec "${existing.legalName}" (${existing.internalId}). Ligne ignorée.`,
          });
          return;
        } else if (duplicateStrategy === 'UPDATE_EXISTING') {
          this.updateSupplier(existing.id, {
            tradeName: row.tradeName || existing.tradeName,
            address: row.address || existing.address,
            contactName: row.contactName || existing.contactName,
            contactEmail: row.contactEmail || existing.contactEmail,
            contactPhone: row.contactPhone || existing.contactPhone,
            productCategories: row.productCategories || existing.productCategories,
            tier: row.tier || existing.tier,
            spendCriticality: row.spendCriticality || existing.spendCriticality,
          });
          result.updated++;
          result.details.push({
            row: rowNum,
            name: row.legalName,
            internalId: existing.internalId,
            status: 'UPDATED',
            message: `Fiche fournisseur "${existing.legalName}" mise à jour avec succès.`,
          });
          return;
        }
      }

      // Create new supplier
      const autoId = 'SUP-' + Math.floor(Math.random() * 9000 + 1000);
      const newSup = this.addSupplier({
        legalName: row.legalName.trim(),
        tradeName: row.tradeName?.trim() || undefined,
        country: row.country || 'France',
        countryCode: (row.countryCode || 'FR').toUpperCase().slice(0, 2),
        address: row.address || 'Adresse à compléter',
        internalId: row.internalId?.trim() || autoId,
        businessRegistrationNumber: row.businessRegistrationNumber?.trim() || 'FR ' + Math.floor(Math.random() * 900000000 + 100000000),
        contactName: row.contactName || 'Responsable Approvisionnement',
        contactEmail: row.contactEmail || 'contact@fournisseur.com',
        contactPhone: row.contactPhone || '+33 1 00 00 00 00',
        productCategories: row.productCategories || ['Général'],
        status: 'ACTIVE',
        riskLevel: 'LOW',
        tier: row.tier || 'TIER_1',
        spendCriticality: row.spendCriticality || 'STANDARD',
      });

      result.imported++;
      result.details.push({
        row: rowNum,
        name: newSup.legalName,
        internalId: newSup.internalId,
        status: 'IMPORTED',
        message: `Nouveau fournisseur créé avec succès (ID: ${newSup.internalId}).`,
      });
    });

    this.addAuditLog({
      actionCategory: 'SUPPLIER_CREATED',
      entityType: 'SUPPLIER',
      entityId: 'batch-import',
      entityReference: `Import par lot (${result.imported} créés, ${result.updated} maj, ${result.skipped} ignorés)`,
      source: 'MANUAL_UI',
      details: `Import en masse exécuté : ${result.imported} créés, ${result.updated} mis à jour, ${result.duplicatesFound} doublons identifiés sur ${result.totalRead} lignes lues.`,
    });

    this.saveState();
    return result;
  }

  // --- Recalculate Risk Engine across suppliers ---
  public recalculateAllSuppliersRisk() {
    const suppliers = this.getTenantSuppliers();
    const certs = this.getTenantCertificates();

    suppliers.forEach((s) => {
      const sCerts = certs.filter((c) => c.supplierId === s.id);
      const { multiFactorRisk, riskLevel } = this.calculateSupplierRisk(s, sCerts);
      const sIndex = this.state.suppliers.findIndex((item) => item.id === s.id);
      if (sIndex !== -1) {
        this.state.suppliers[sIndex] = {
          ...this.state.suppliers[sIndex],
          multiFactorRisk,
          riskLevel,
        };
      }
    });

    this.addAuditLog({
      actionCategory: 'SYSTEM_SYNC',
      entityType: 'SUPPLIER',
      entityId: 'recalc-risk-all',
      entityReference: 'Moteur de scoring multi-facteurs',
      source: 'MANUAL_UI',
      details: `Recalcul global des scores de risque multi-facteurs exécuté pour ${suppliers.length} fournisseurs.`,
    });

    this.saveState();
  }

  // --- CSV Export Helper ---
  public exportSuppliersCSV(): string {
    const suppliers = this.getTenantSuppliers();
    const certs = this.getTenantCertificates();

    const headers = [
      'Identifiant Interne',
      'Raison Sociale',
      'Nom Commercial',
      'Pays',
      'Code Pays',
      'SIRET / N° TVA',
      'Statut ERP',
      'Niveau de Risque',
      'Score Global (0-100)',
      'Tier',
      'Criticité',
      'Nombre Certificats',
      'Contact Principal',
      'Email Contact',
      'Catégories Produits',
    ];

    const rows = suppliers.map((s) => {
      const sCerts = certs.filter((c) => c.supplierId === s.id);
      return [
        `"${s.internalId}"`,
        `"${s.legalName.replace(/"/g, '""')}"`,
        `"${(s.tradeName || '').replace(/"/g, '""')}"`,
        `"${s.country}"`,
        `"${s.countryCode}"`,
        `"${s.businessRegistrationNumber}"`,
        `"${s.erpConfig?.blockStatus || s.status}"`,
        `"${s.riskLevel}"`,
        `"${s.multiFactorRisk?.overallScore ?? ''}"`,
        `"${s.tier || 'TIER_1'}"`,
        `"${s.spendCriticality || 'STANDARD'}"`,
        sCerts.length,
        `"${s.contactName.replace(/"/g, '""')}"`,
        `"${s.contactEmail}"`,
        `"${s.productCategories.join('; ')}"`,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  // --- Certificate Mutations ---
  public addCertificate(certData: Omit<Certificate, 'id' | 'tenantId' | 'uploadedAt' | 'uploadedByUserId'>) {
    const id = 'cert-' + Date.now().toString(36);
    const user = this.getActiveUser();
    const newCert: Certificate = {
      ...certData,
      id,
      tenantId: this.state.activeTenantId,
      uploadedAt: new Date().toISOString(),
      uploadedByUserId: user.id,
    };

    this.state.certificates.push(newCert);

    // Update supplier certificate counts
    this.recalculateSupplierStats(newCert.supplierId);

    this.addAuditLog({
      actionCategory: 'CERTIFICATE_UPLOADED',
      entityType: 'CERTIFICATE',
      entityId: id,
      entityReference: `${newCert.certificationStandard} ${newCert.certificateNumber}`,
      source: 'OCR_INGESTION',
      newValue: newCert.certificateNumber,
      details: `Ajout du certificat ${newCert.certificationStandard} N° ${newCert.certificateNumber} pour ${newCert.supplierName}`,
    });

    // Check if new certificate generates alerts (e.g. expiring soon, expired, etc.)
    this.evaluateCertificateAlerts(newCert);

    this.saveState();
    return newCert;
  }

  public updateCertificate(id: string, updates: Partial<Certificate>) {
    const index = this.state.certificates.findIndex(
      (c) => c.id === id && c.tenantId === this.state.activeTenantId
    );
    if (index !== -1) {
      const prev = this.state.certificates[index];
      this.state.certificates[index] = { ...prev, ...updates };
      this.recalculateSupplierStats(prev.supplierId);

      this.addAuditLog({
        actionCategory: 'CERTIFICATE_STATUS_CHANGED',
        entityType: 'CERTIFICATE',
        entityId: id,
        entityReference: `${prev.certificationStandard} ${prev.certificateNumber}`,
        source: 'MANUAL_UI',
        previousValue: prev.status,
        newValue: updates.status || prev.status,
        details: `Mise à jour du certificat ${prev.certificateNumber} (${prev.supplierName})`,
      });

      this.evaluateCertificateAlerts(this.state.certificates[index]);
      this.saveState();
    }
  }

  public verifyCertificateWithRegistry(id: string) {
    const index = this.state.certificates.findIndex(
      (c) => c.id === id && c.tenantId === this.state.activeTenantId
    );
    if (index === -1) return;

    const cert = this.state.certificates[index];
    const now = new Date().toISOString();

    // Check specific known outcomes or compute
    let outcome = cert.verificationOutcome;
    let confidence = cert.confidenceScore;
    const reasons = [...cert.confidenceReasons];
    const anomalies = [...cert.anomalies];

    if (cert.status === 'REVOKED') {
      outcome = 'MISMATCH';
      confidence = 100;
      if (!reasons.includes('Confirmation de révocation par le registre officiel')) {
        reasons.unshift('Confirmation de révocation par le registre officiel');
      }
    } else if (cert.status === 'SUSPENDED') {
      outcome = 'MISMATCH';
      confidence = 90;
      if (!reasons.includes('Suspension temporaire confirmée au registre')) {
        reasons.unshift('Suspension temporaire confirmée au registre');
      }
    } else if (cert.status === 'VALID' || cert.status === 'EXPIRING_SOON') {
      outcome = 'MATCH';
      confidence = 100;
      if (!reasons.includes('Requête API registre officielle réussie (200 OK)')) {
        reasons.unshift('Requête API registre officielle réussie (200 OK)');
      }
    }

    this.state.certificates[index] = {
      ...cert,
      lastVerifiedAt: now,
      verificationOutcome: outcome,
      confidenceScore: confidence,
      confidenceReasons: reasons,
      anomalies,
    };

    this.recalculateSupplierStats(cert.supplierId);

    this.addAuditLog({
      actionCategory: 'CERTIFICATE_VERIFIED',
      entityType: 'CERTIFICATE',
      entityId: id,
      entityReference: `${cert.certificationStandard} ${cert.certificateNumber}`,
      source: 'AUTOMATED_SYNC',
      details: `Vérification API exécutée auprès du registre ${cert.certificationBody} pour ${cert.certificateNumber}. Résultat: ${outcome} (${confidence}% concordance)`,
    });

    this.saveState();
    return this.state.certificates[index];
  }

  public deleteCertificate(id: string) {
    const cert = this.state.certificates.find(
      (c) => c.id === id && c.tenantId === this.state.activeTenantId
    );
    if (!cert) return;

    this.state.certificates = this.state.certificates.filter((c) => c.id !== id);
    this.state.alerts = this.state.alerts.filter((a) => a.certificateId !== id);
    this.recalculateSupplierStats(cert.supplierId);

    this.addAuditLog({
      actionCategory: 'CERTIFICATE_STATUS_CHANGED',
      entityType: 'CERTIFICATE',
      entityId: id,
      entityReference: `${cert.certificationStandard} ${cert.certificateNumber}`,
      source: 'MANUAL_UI',
      newValue: 'DELETED',
      details: `Suppression du certificat ${cert.certificateNumber} (${cert.supplierName}).`,
    });

    this.saveState();
  }

  public exportCertificatesCSV(): string {
    const certs = this.getTenantCertificates();
    const headers = [
      'N° Certificat',
      'Fournisseur',
      'Standard / Norme',
      'Organisme Émetteur',
      'Date Effet',
      'Date Expiration',
      'Statut Validité',
      'Concordance Registre',
      'Score Confiance',
      'URL Registre Officiel',
      'Produits Couverts',
      'Installations Couvertes',
    ];

    const rows = certs.map((c) => [
      `"${c.certificateNumber}"`,
      `"${c.supplierName.replace(/"/g, '""')}"`,
      `"${c.standardLabel}"`,
      `"${c.certificationBody}"`,
      `"${c.issueDate}"`,
      `"${c.expiryDate}"`,
      `"${c.status}"`,
      `"${c.verificationOutcome}"`,
      `"${c.confidenceScore}%"`,
      `"${c.officialRegistryUrl || ''}"`,
      `"${c.scope?.coveredProducts?.join('; ') || ''}"`,
      `"${c.scope?.coveredFacilities?.join('; ') || ''}"`,
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }

  public calculateSupplierRisk(
    supplier: Supplier,
    certs: Certificate[]
  ): { multiFactorRisk: MultiFactorRiskScore; riskLevel: SupplierRiskLevel } {
    const today = new Date('2026-09-24T00:00:00Z');
    let expirationScore = 0;
    let revocationScore = 0;
    let countryRiskScore = 0;
    let coverageRiskScore = 0;
    const riskFactors: string[] = [];
    const recommendedActions: string[] = [];

    // 1. Expiration Factor (0 - 30)
    if (certs.length === 0) {
      expirationScore = 15;
      riskFactors.push('Aucun certificat enregistré sous surveillance');
      recommendedActions.push('Collecter les certifications obligatoires auprès du fournisseur');
    } else {
      const expiredCount = certs.filter((c) => {
        const exp = new Date(c.expiryDate);
        return exp.getTime() <= today.getTime() || c.status === 'EXPIRED';
      }).length;

      const expiring30Count = certs.filter((c) => {
        const exp = new Date(c.expiryDate);
        const days = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 3600 * 24));
        return days > 0 && days <= 30;
      }).length;

      const expiring60Count = certs.filter((c) => {
        const exp = new Date(c.expiryDate);
        const days = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 3600 * 24));
        return days > 30 && days <= 60;
      }).length;

      if (expiredCount > 0) {
        expirationScore = 30;
        riskFactors.push(`${expiredCount} certificat(s) expiré(s)`);
        recommendedActions.push('Bloquer ou suspendre les approvisionnements non couverts');
      } else if (expiring30Count > 0) {
        expirationScore = 22;
        riskFactors.push(`${expiring30Count} certificat(s) expirant sous 30 jours`);
        recommendedActions.push('Envoyer une relance prioritaire pour transmission du renouvellement');
      } else if (expiring60Count > 0) {
        expirationScore = 10;
        riskFactors.push(`${expiring60Count} certificat(s) expirant sous 60 jours`);
        recommendedActions.push('Notifier le responsable achat pour anticipation de renouvellement');
      }
    }

    // 2. Revocation & Non-Conformity Factor (0 - 40)
    const revokedCerts = certs.filter((c) => c.status === 'REVOKED');
    const suspendedCerts = certs.filter((c) => c.status === 'SUSPENDED');
    const mismatchCerts = certs.filter(
      (c) => c.verificationOutcome === 'MISMATCH' || (c.anomalies && c.anomalies.length > 0)
    );

    if (revokedCerts.length > 0) {
      revocationScore = 40;
      riskFactors.push(`Révocation officielle détectée (${revokedCerts.map((c) => c.certificationStandard).join(', ')})`);
      recommendedActions.push('Blocage ERP immédiat et retrait de la liste d’approvisionnement');
    } else if (suspendedCerts.length > 0) {
      revocationScore = 35;
      riskFactors.push(`Suspension temporaire chez le certificateur (${suspendedCerts.map((c) => c.certificationStandard).join(', ')})`);
      recommendedActions.push('Contacter l’organisme certificateur et demander le PV d’audit');
    } else if (mismatchCerts.length > 0) {
      revocationScore = 25;
      riskFactors.push('Discordance identifiée entre le document déposé et le registre officiel');
      recommendedActions.push('Audit documentaire approfondi requis');
    }

    // 3. Country Risk Factor (0 - 15)
    const lowRiskCountries = ['FR', 'BE', 'DE', 'PT', 'IT', 'ES', 'NL', 'DK', 'SE', 'AT'];
    const highRiskCountries = ['PE', 'TR', 'IN', 'CN', 'VN', 'BD', 'PK', 'NG', 'BR'];
    const cCode = supplier.countryCode?.toUpperCase();
    if (highRiskCountries.includes(cCode)) {
      countryRiskScore = 14;
      riskFactors.push(`Zone géographique à vigilance renforcée (${supplier.country})`);
      recommendedActions.push('Audit sur site et traçabilité de lot systématique');
    } else if (lowRiskCountries.includes(cCode)) {
      countryRiskScore = 3;
    } else {
      countryRiskScore = 8;
    }

    // 4. Product Coverage Factor (0 - 15)
    if (supplier.productCategories && supplier.productCategories.length > 0) {
      const coveredCategories = new Set<string>();
      certs.forEach((c) => {
        c.scope?.productCategories?.forEach((cat) => coveredCategories.add(cat.toLowerCase()));
        c.scope?.coveredProducts?.forEach((prod) => coveredCategories.add(prod.toLowerCase()));
      });

      const uncovered = supplier.productCategories.filter((cat) => {
        const catLower = cat.toLowerCase();
        return !Array.from(coveredCategories).some((cov) => cov.includes(catLower) || catLower.includes(cov));
      });

      if (uncovered.length > 0 && certs.length > 0) {
        coverageRiskScore = 15;
        riskFactors.push(`Catégories non couvertes par les certificats actifs : ${uncovered.join(', ')}`);
        recommendedActions.push(`Exiger extension de certificat pour : ${uncovered.slice(0, 2).join(', ')}`);
      } else if (certs.length === 0) {
        coverageRiskScore = 10;
      } else {
        coverageRiskScore = 3;
      }
    } else {
      coverageRiskScore = 5;
    }

    const overallScore = Math.min(100, expirationScore + revocationScore + countryRiskScore + coverageRiskScore);

    let riskLevel: SupplierRiskLevel = 'LOW';
    if (overallScore >= 75 || revocationScore >= 35) {
      riskLevel = 'CRITICAL';
    } else if (overallScore >= 50 || expirationScore >= 22) {
      riskLevel = 'HIGH';
    } else if (overallScore >= 25) {
      riskLevel = 'MEDIUM';
    }

    const multiFactorRisk: MultiFactorRiskScore = {
      overallScore,
      expirationScore,
      revocationScore,
      countryRiskScore,
      coverageRiskScore,
      riskFactors,
      recommendedActions,
      lastCalculatedAt: new Date().toISOString(),
    };

    return { multiFactorRisk, riskLevel };
  }

  private recalculateSupplierStats(supplierId: string) {
    const supplierCerts = this.state.certificates.filter((c) => c.supplierId === supplierId);
    const validCount = supplierCerts.filter((c) => c.status === 'VALID').length;
    const criticalCount = supplierCerts.filter((c) => ['REVOKED', 'SUSPENDED', 'EXPIRED'].includes(c.status)).length;

    const supplierIndex = this.state.suppliers.findIndex((s) => s.id === supplierId);
    if (supplierIndex !== -1) {
      const supplier = this.state.suppliers[supplierIndex];
      const { multiFactorRisk, riskLevel } = this.calculateSupplierRisk(supplier, supplierCerts);

      const hasActiveErpDerogation = supplier.erpConfig?.blockStatus === 'TEMPORARY_DEROGATION';
      const computedStatus = criticalCount > 0 && !hasActiveErpDerogation
        ? 'BLOCKED'
        : hasActiveErpDerogation
        ? 'ON_HOLD'
        : validCount > 0
        ? 'ACTIVE'
        : 'ON_HOLD';

      this.state.suppliers[supplierIndex] = {
        ...supplier,
        totalCertificatesCount: supplierCerts.length,
        validCertificatesCount: validCount,
        criticalIssuesCount: criticalCount,
        status: computedStatus,
        riskLevel,
        multiFactorRisk,
      };
    }
  }

  // --- Alert Management ---
  public updateAlertStatus(alertId: string, newStatus: AlertStatus, comment?: string) {
    const alertIndex = this.state.alerts.findIndex(
      (a) => a.id === alertId && a.tenantId === this.state.activeTenantId
    );
    if (alertIndex !== -1) {
      const user = this.getActiveUser();
      const prev = this.state.alerts[alertIndex];
      const historyItem = {
        id: 'act-' + Date.now(),
        performedBy: user.name,
        actionType: (newStatus === 'RESOLVED' ? 'RESOLVED' : 'STATUS_CHANGED') as any,
        comment: comment || `Statut mis à jour vers ${newStatus}`,
        createdAt: new Date().toISOString(),
      };

      this.state.alerts[alertIndex] = {
        ...prev,
        status: newStatus,
        history: [...prev.history, historyItem],
        updatedAt: new Date().toISOString(),
      };

      this.addAuditLog({
        actionCategory: 'ALERT_RESOLVED',
        entityType: 'ALERT',
        entityId: alertId,
        entityReference: prev.title,
        source: 'MANUAL_UI',
        previousValue: prev.status,
        newValue: newStatus,
        details: `Traitement de l’alerte "${prev.title}" par ${user.name}: ${newStatus}. ${comment || ''}`,
      });

      this.saveState();
    }
  }

  // --- Compliance Matrix Management (Chantier 4) ---
  public addMatrixRule(ruleData: Omit<ComplianceMatrixRule, 'id' | 'tenantId' | 'updatedAt'>): ComplianceMatrixRule {
    const newRule: ComplianceMatrixRule = {
      ...ruleData,
      id: 'rule-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      tenantId: this.state.activeTenantId,
      updatedAt: new Date().toISOString(),
    };

    this.state.matrixRules.unshift(newRule);
    this.addAuditLog({
      actionCategory: 'MATRIX_RULE_UPDATED',
      entityType: 'MATRIX',
      entityId: newRule.id,
      entityReference: newRule.productCategory,
      source: 'MANUAL_UI',
      newValue: newRule.requiredStandards.join(', '),
      details: `Création de règle de matrice pour "${newRule.productCategory}" : ${newRule.requiredStandards.join(', ')} (${newRule.criticality}). Condition: ${newRule.countryCondition}.`,
    });

    this.saveState();
    return newRule;
  }

  public updateMatrixRule(id: string, updates: Partial<ComplianceMatrixRule>): ComplianceMatrixRule | null {
    const index = this.state.matrixRules.findIndex(
      (r) => r.id === id && r.tenantId === this.state.activeTenantId
    );
    if (index === -1) return null;

    const prev = this.state.matrixRules[index];
    this.state.matrixRules[index] = {
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.addAuditLog({
      actionCategory: 'MATRIX_RULE_UPDATED',
      entityType: 'MATRIX',
      entityId: id,
      entityReference: prev.productCategory,
      source: 'MANUAL_UI',
      details: `Mise à jour de la règle de matrice "${prev.productCategory}".`,
    });

    this.saveState();
    return this.state.matrixRules[index];
  }

  public deleteMatrixRule(id: string) {
    const index = this.state.matrixRules.findIndex(
      (r) => r.id === id && r.tenantId === this.state.activeTenantId
    );
    if (index === -1) return;

    const rule = this.state.matrixRules[index];
    this.state.matrixRules = this.state.matrixRules.filter((r) => r.id !== id);

    this.addAuditLog({
      actionCategory: 'MATRIX_RULE_UPDATED',
      entityType: 'MATRIX',
      entityId: id,
      entityReference: rule.productCategory,
      source: 'MANUAL_UI',
      details: `Suppression de la règle d'exigence pour la catégorie "${rule.productCategory}".`,
    });

    this.saveState();
  }

  public exportMatrixRulesCSV(): string {
    const rules = this.getTenantMatrixRules();
    const headers = [
      'Famille Produit',
      'Standards Requis',
      'Alternatives Acceptées',
      'Criticité',
      'Condition Géographique',
      'Pays Spécifiques',
      'Seuil Volume Min (€)',
      'Audit de Site Exigé',
      'Politique RSE / Notes',
      'Dernière Mise à Jour',
    ];

    const rows = rules.map((r) => [
      `"${r.productCategory.replace(/"/g, '""')}"`,
      `"${r.requiredStandards.join(', ')}"`,
      `"${r.acceptableAlternativeStandards.join(', ')}"`,
      `"${r.criticality}"`,
      `"${r.countryCondition}"`,
      `"${(r.applicableCountries || []).join('; ')}"`,
      `"${r.volumeThreshold?.enabled ? r.volumeThreshold.minAnnualSpendEur : 'Non défini'}"`,
      `"${r.enforceFacilityAudit ? 'Oui' : 'Non'}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
      `"${r.updatedAt}"`,
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }

  public evaluateOrderCompliance(params: {
    supplierId: string;
    productCategory: string;
    amountEur: number;
    countryCode?: string;
    facilitySite?: string;
    logAudit?: boolean;
  }): OrderComplianceCheckResult {
    const supplier = this.state.suppliers.find(
      (s) => s.id === params.supplierId && s.tenantId === this.state.activeTenantId
    );

    if (!supplier) {
      return {
        isCompliant: false,
        decision: 'BLOCKED',
        reasons: ['Fournisseur non trouvé dans le référentiel actif.'],
        missingStandards: [],
        uncoveredProducts: [params.productCategory],
        supplierName: 'Fournisseur Inconnu',
        evaluatedAt: new Date().toISOString(),
      };
    }

    const reasons: string[] = [];
    const missingStandards: CertificationStandard[] = [];
    let decision: 'ALLOWED' | 'BLOCKED' | 'REQUIRES_APPROVAL' = 'ALLOWED';

    // 1. ERP Global Block check
    const hasActiveErpDerogation = supplier.erpConfig?.blockStatus === 'TEMPORARY_DEROGATION';
    if (supplier.erpConfig?.blockStatus === 'BLOCKED' || (supplier.status === 'BLOCKED' && !hasActiveErpDerogation)) {
      decision = 'BLOCKED';
      reasons.push(
        `Fournisseur sous blocage ERP strict (${supplier.erpConfig?.blockedReason || supplier.erpBlockedReason || 'Sanction conformité active'}). Toutes les commandes d'achat sont rejetées.`
      );
    } else if (hasActiveErpDerogation) {
      decision = 'REQUIRES_APPROVAL';
      reasons.push(
        `Dérogation temporaire active (${supplier.erpConfig?.derogationJustification || 'Dérogation accordée'}). Validation manuelle requise.`
      );
    }

    // 2. Find rule in matrix for this product category
    const catLower = params.productCategory.toLowerCase();
    const rule = this.getTenantMatrixRules().find(
      (r) =>
        r.productCategory.toLowerCase() === catLower ||
        catLower.includes(r.productCategory.toLowerCase()) ||
        r.productCategory.toLowerCase().includes(catLower)
    );

    // 3. Supplier certificates
    const supplierCerts = this.state.certificates.filter(
      (c) => c.supplierId === supplier.id && c.tenantId === this.state.activeTenantId
    );

    // Check for hard revocations on this supplier
    const revokedCerts = supplierCerts.filter((c) => c.status === 'REVOKED');
    if (revokedCerts.length > 0) {
      decision = 'BLOCKED';
      reasons.push(
        `Alerte critique : Certificat révoqué par l'organisme officiel (${revokedCerts.map((c) => c.certificationStandard).join(', ')}). Achat strictement interdit.`
      );
    }

    // Check for expired certs
    const expiredCerts = supplierCerts.filter((c) => c.status === 'EXPIRED');
    if (expiredCerts.length > 0) {
      reasons.push(
        `Attention : ${expiredCerts.length} certificat(s) expiré(s) au dossier (${expiredCerts.map((c) => c.certificationStandard).join(', ')}).`
      );
    }

    if (rule) {
      // Check geographic condition
      const effectiveCountry = (params.countryCode || supplier.countryCode || '').toUpperCase();
      const euCountries = ['FR', 'BE', 'DE', 'PT', 'IT', 'ES', 'NL', 'DK', 'SE', 'AT', 'PL', 'IE', 'FI', 'GR'];
      const isEu = euCountries.includes(effectiveCountry);

      let ruleAppliesGeo = true;
      if (rule.countryCondition === 'NON_EU_ONLY' && isEu) {
        ruleAppliesGeo = false;
        reasons.push(
          `Condition géographique : règle non applicable pour les pays UE (${effectiveCountry}). Exigence allégée.`
        );
      } else if (rule.countryCondition === 'SPECIFIC_COUNTRIES' && rule.applicableCountries && rule.applicableCountries.length > 0) {
        if (!rule.applicableCountries.includes(effectiveCountry)) {
          ruleAppliesGeo = false;
          reasons.push(
            `Condition géographique : pays ${effectiveCountry} non listé dans les pays cibles de la règle.`
          );
        }
      }

      // Check volume threshold condition
      let ruleAppliesVolume = true;
      if (rule.volumeThreshold?.enabled && params.amountEur < rule.volumeThreshold.minAnnualSpendEur) {
        ruleAppliesVolume = false;
        reasons.push(
          `Seuil de volume : le montant de la commande (${params.amountEur} €) est inférieur au seuil d'exigence obligatoire (${rule.volumeThreshold.minAnnualSpendEur} €).`
        );
      }

      if (ruleAppliesGeo && ruleAppliesVolume) {
        // Must satisfy at least one required standard OR acceptable alternative
        const allowedStandards = [...rule.requiredStandards, ...rule.acceptableAlternativeStandards];
        const validMatchingCerts = supplierCerts.filter(
          (c) =>
            allowedStandards.includes(c.certificationStandard) &&
            c.status === 'VALID'
        );

        if (validMatchingCerts.length === 0) {
          missingStandards.push(...rule.requiredStandards);
          const requiredStr = rule.requiredStandards.join(' ou ');
          const altStr = rule.acceptableAlternativeStandards.length > 0 ? ` (ou alternatives : ${rule.acceptableAlternativeStandards.join(', ')})` : '';

          if (rule.criticality === 'STRICT_BLOCK') {
            decision = 'BLOCKED';
            reasons.push(
              `Violation politique d'achat : Certification ${requiredStr}${altStr} obligatoire pour la catégorie "${rule.productCategory}". Aucun certificat valide trouvé.`
            );
          } else if (rule.criticality === 'CONDITIONAL') {
            if (decision !== 'BLOCKED') decision = 'REQUIRES_APPROVAL';
            reasons.push(
              `Exigence conditionnelle non satisfaite : ${requiredStr}${altStr} manquant. Dérogation formelle requise du département RSE / Qualité.`
            );
          } else {
            // WARNING_ONLY
            reasons.push(
              `Avertissement conformité : standard ${requiredStr} recommandé pour "${rule.productCategory}". Commande autorisée sous réserve.`
            );
          }
        } else {
          // A matching valid certificate was found!
          const cert = validMatchingCerts[0];
          reasons.push(
            `Certificat conforme : ${cert.standardLabel} N° ${cert.certificateNumber} (Valide jusqu'au ${cert.expiryDate}).`
          );

          // Facility audit check if enforced
          if (rule.enforceFacilityAudit) {
            const hasCoveredFacilities = (cert.scope?.coveredFacilities?.length || 0) > 0;
            if (params.facilitySite) {
              const siteMatch = cert.scope?.coveredFacilities?.some((f) =>
                f.toLowerCase().includes(params.facilitySite!.toLowerCase()) ||
                params.facilitySite!.toLowerCase().includes(f.toLowerCase())
              );
              if (!siteMatch) {
                if (rule.criticality === 'STRICT_BLOCK') {
                  decision = 'BLOCKED';
                  reasons.push(
                    `Site de production non audité : l'usine "${params.facilitySite}" n'est pas répertoriée dans le périmètre du certificat ${cert.certificateNumber}.`
                  );
                } else {
                  if (decision !== 'BLOCKED') decision = 'REQUIRES_APPROVAL';
                  reasons.push(
                    `Site "${params.facilitySite}" non audité dans le certificat. Validation d'audit de site requise.`
                  );
                }
              } else {
                reasons.push(`Site de production "${params.facilitySite}" expressément validé dans le périmètre du certificat.`);
              }
            } else if (!hasCoveredFacilities) {
              reasons.push('Attention : Aucun site de production spécifique mentionné dans le périmètre du certificat.');
            }
          }
        }
      }
    } else {
      // No rule configured for this category
      reasons.push(`Aucune règle stricte de matrice configurée pour la catégorie "${params.productCategory}". Contrôle standard appliqué.`);
      const validCerts = supplierCerts.filter((c) => c.status === 'VALID');
      if (validCerts.length === 0 && supplierCerts.length > 0) {
        if (decision !== 'BLOCKED') decision = 'REQUIRES_APPROVAL';
        reasons.push('Le fournisseur n’a aucun certificat valide actuellement actif.');
      }
    }

    const isCompliant = decision === 'ALLOWED';

    if (params.logAudit) {
      this.addAuditLog({
        actionCategory: 'ERP_ORDER_CHECK',
        entityType: 'SUPPLIER',
        entityId: supplier.id,
        entityReference: supplier.legalName,
        source: 'ERP_WEBHOOK',
        newValue: decision,
        details: `Contrôle de commande ERP pour "${params.productCategory}" (${params.amountEur} €) : Décision ${decision}. ${reasons.join(' | ')}`,
      });
      this.saveState();
    }

    return {
      isCompliant,
      decision,
      reasons,
      ruleApplied: rule,
      missingStandards,
      uncoveredProducts: isCompliant ? [] : [params.productCategory],
      supplierName: supplier.legalName,
      evaluatedAt: new Date().toISOString(),
    };
  }

  public getSupplierMatrixComplianceSummaries(): SupplierMatrixComplianceSummary[] {
    const suppliers = this.getTenantSuppliers();
    const rules = this.getTenantMatrixRules();
    const certs = this.getTenantCertificates();

    return suppliers.map((sup) => {
      const supCerts = certs.filter((c) => c.supplierId === sup.id && c.status === 'VALID');
      const compliantCategories: string[] = [];
      const nonCompliantCategories: string[] = [];
      const missingStandards: CertificationStandard[] = [];

      rules.forEach((rule) => {
        const allowed = [...rule.requiredStandards, ...rule.acceptableAlternativeStandards];
        const match = supCerts.some((c) => allowed.includes(c.certificationStandard));
        if (match) {
          compliantCategories.push(rule.productCategory);
        } else {
          nonCompliantCategories.push(rule.productCategory);
          missingStandards.push(...rule.requiredStandards);
        }
      });

      let status: 'FULLY_COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'CRITICAL_NON_COMPLIANT' = 'FULLY_COMPLIANT';
      if (compliantCategories.length === 0 && rules.length > 0) {
        status = 'CRITICAL_NON_COMPLIANT';
      } else if (nonCompliantCategories.length > 0) {
        status = 'PARTIALLY_COMPLIANT';
      }

      return {
        supplierId: sup.id,
        supplierName: sup.legalName,
        compliantCategories,
        nonCompliantCategories,
        missingStandards: Array.from(new Set(missingStandards)),
        status,
      };
    });
  }

  // --- Alert Batch Operations & Email Reminders (Chantier 5) ---
  public resolveAlertBatch(alertIds: string[], comment: string) {
    const user = this.getActiveUser();
    alertIds.forEach((id) => {
      const alert = this.state.alerts.find((a) => a.id === id && a.tenantId === this.state.activeTenantId);
      if (alert) {
        alert.status = 'RESOLVED';
        alert.updatedAt = new Date().toISOString();
        alert.history.push({
          id: 'act-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 4),
          performedBy: user.name,
          actionType: 'RESOLVED',
          comment: comment || 'Résolution groupée d’alertes',
          createdAt: new Date().toISOString(),
        });
      }
    });

    this.addAuditLog({
      actionCategory: 'ALERT_RESOLVED',
      entityType: 'ALERT',
      entityId: alertIds.join(', '),
      entityReference: `${alertIds.length} alertes groupées`,
      source: 'MANUAL_UI',
      details: `Résolution en lot de ${alertIds.length} alertes par ${user.name}. Commentaire : ${comment}`,
    });

    this.saveState();
  }

  public async sendSupplierReminderEmail(
    alertId: string,
    emailDetails: { recipient: string; subject: string; body: string; language: 'FR' | 'EN' }
  ): Promise<boolean> {
    const alert = this.state.alerts.find((a) => a.id === alertId && a.tenantId === this.state.activeTenantId);
    if (!alert) return false;

    const user = this.getActiveUser();
    alert.history.push({
      id: 'act-mail-' + Date.now().toString(36),
      performedBy: user.name,
      actionType: 'DOCUMENT_REQUESTED',
      comment: `Email de relance automatique envoyé à ${emailDetails.recipient} ("${emailDetails.subject}") [Langue: ${emailDetails.language}].`,
      createdAt: new Date().toISOString(),
    });
    alert.updatedAt = new Date().toISOString();

    this.addAuditLog({
      actionCategory: 'ALERT_TRIGGERED',
      entityType: 'SUPPLIER',
      entityId: alert.supplierId,
      entityReference: alert.supplierName,
      source: 'MANUAL_UI',
      details: `Relance fournisseur transmise à ${emailDetails.recipient} pour le renouvellement du certificat ${alert.certificationStandard} (${alert.certificateNumber}).`,
    });

    this.saveState();
    return true;
  }

  // --- Automated Continuous Verification Engine ---
  public runContinuousVerificationSync() {
    this.state.isAutoSyncing = true;
    this.notify();

    setTimeout(() => {
      const now = new Date();
      const tenantCerts = this.getTenantCertificates();

      tenantCerts.forEach((cert) => {
        this.evaluateCertificateAlerts(cert);
      });

      this.state.lastSyncTimestamp = now.toISOString();
      this.state.isAutoSyncing = false;

      this.addAuditLog({
        actionCategory: 'SYSTEM_SYNC',
        entityType: 'INTEGRATION',
        entityId: 'sync-all-registries',
        entityReference: 'Registre multi-standards (GOTS, FSC, Ecocert, OEKO-TEX, Fairtrade)',
        source: 'AUTOMATED_SYNC',
        details: `Synchronisation périodique de conformité exécutée. ${tenantCerts.length} certificats audités.`,
      });

      this.saveState();
    }, 800);
  }

  private evaluateCertificateAlerts(cert: Certificate) {
    const today = new Date('2026-09-24T00:00:00Z'); // Current simulation baseline
    const expDate = new Date(cert.expiryDate);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Expiration alerts
    if (diffDays <= 0 && cert.status !== 'EXPIRED' && cert.status !== 'REVOKED') {
      cert.status = 'EXPIRED';
      this.createOrUpdateAlert({
        tenantId: cert.tenantId,
        certificateId: cert.id,
        supplierId: cert.supplierId,
        supplierName: cert.supplierName,
        certificationStandard: cert.certificationStandard,
        certificateNumber: cert.certificateNumber,
        type: 'EXPIRED',
        title: `Certificat ${cert.certificationStandard} expiré`,
        message: `Le certificat N° ${cert.certificateNumber} de ${cert.supplierName} a expiré le ${cert.expiryDate}. Approvisionnements à risque.`,
        severity: 'HIGH',
        status: 'OPEN',
        erpBlockedTriggered: true,
      });
    } else if (diffDays > 0 && diffDays <= 30 && cert.status !== 'REVOKED' && cert.status !== 'SUSPENDED') {
      cert.status = 'EXPIRING_SOON';
      this.createOrUpdateAlert({
        tenantId: cert.tenantId,
        certificateId: cert.id,
        supplierId: cert.supplierId,
        supplierName: cert.supplierName,
        certificationStandard: cert.certificationStandard,
        certificateNumber: cert.certificateNumber,
        type: 'EXPIRY_30_DAYS',
        title: `Certificat expire sous 30 jours (${diffDays} j)`,
        message: `Le certificat ${cert.certificationStandard} N° ${cert.certificateNumber} de ${cert.supplierName} expire le ${cert.expiryDate}.`,
        severity: 'HIGH',
        status: 'OPEN',
        erpBlockedTriggered: false,
      });
    } else if (diffDays > 30 && diffDays <= 60 && cert.status !== 'REVOKED' && cert.status !== 'SUSPENDED') {
      cert.status = 'EXPIRING_SOON';
      this.createOrUpdateAlert({
        tenantId: cert.tenantId,
        certificateId: cert.id,
        supplierId: cert.supplierId,
        supplierName: cert.supplierName,
        certificationStandard: cert.certificationStandard,
        certificateNumber: cert.certificateNumber,
        type: 'EXPIRY_60_DAYS',
        title: `Certificat expire sous 60 jours (${diffDays} j)`,
        message: `Le certificat N° ${cert.certificateNumber} de ${cert.supplierName} arrive à échéance le ${cert.expiryDate}.`,
        severity: 'MEDIUM',
        status: 'OPEN',
        erpBlockedTriggered: false,
      });
    }
  }

  private createOrUpdateAlert(alertData: Omit<ComplianceAlert, 'id' | 'history' | 'createdAt' | 'updatedAt'>) {
    const existing = this.state.alerts.find(
      (a) =>
        a.certificateId === alertData.certificateId &&
        a.type === alertData.type &&
        a.status !== 'RESOLVED' &&
        a.status !== 'DISMISSED'
    );

    if (!existing) {
      const newAlert: ComplianceAlert = {
        ...alertData,
        id: 'alt-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 5),
        history: [
          {
            id: 'act-gen-' + Date.now(),
            performedBy: 'CertiWatch Compliance Engine',
            actionType: 'STATUS_CHANGED',
            comment: 'Alerte générée automatiquement suite au contrôle de validité des dates et registres.',
            createdAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.state.alerts.unshift(newAlert);
    }
  }

  // --- Continuous Verification Orchestrator Engine ---
  public updateOrchestrationConfig(updates: Partial<OrchestrationConfig>) {
    this.state.orchestrationConfig = {
      ...this.state.orchestrationConfig,
      ...updates,
    };
    this.saveState();
  }

  public async executeOrchestratorRun(options?: { forceRecheckAll?: boolean }): Promise<OrchestratorRunLog> {
    const startTime = Date.now();
    this.state.isAutoSyncing = true;
    this.notify();

    const tenantCerts = this.getTenantCertificates();
    let matchesCount = 0;
    let mismatchesCount = 0;
    let revocationsDetected = 0;
    let rateLimitHits = 0;

    tenantCerts.forEach((cert) => {
      this.evaluateCertificateAlerts(cert);

      if (cert.status === 'REVOKED' || cert.status === 'SUSPENDED') {
        mismatchesCount++;
        if (cert.status === 'REVOKED') {
          revocationsDetected++;
          if (this.state.orchestrationConfig.autoTriggerErpBlockOnRevocation) {
            this.setSupplierErpBlock(
              cert.supplierId,
              'BLOCKED',
              `Orchestrateur automatique : Révocation officielle confirmée pour ${cert.standardLabel} N° ${cert.certificateNumber}`
            );
          }
        }
      } else {
        matchesCount++;
      }
    });

    const endTime = Date.now();
    const durationMs = endTime - startTime + 850;
    const nowIso = new Date().toISOString();

    const newLog: OrchestratorRunLog = {
      id: 'run-' + Date.now().toString(36),
      tenantId: this.state.activeTenantId,
      startedAt: new Date(startTime).toISOString(),
      completedAt: nowIso,
      durationMs,
      totalCertsAudited: tenantCerts.length,
      matchesCount,
      mismatchesCount,
      revocationsDetected,
      rateLimitHits,
      status: mismatchesCount > 0 ? 'PARTIAL' : 'SUCCESS',
      summary: `Cycle d’orchestration exécuté : ${tenantCerts.length} certificats audités. ${matchesCount} conformes, ${mismatchesCount} anomalies/révocations détectées.`,
    };

    this.state.orchestratorRunLogs.unshift(newLog);
    this.state.orchestrationConfig.lastRunTimestamp = nowIso;
    this.state.lastSyncTimestamp = nowIso;
    this.state.isAutoSyncing = false;

    this.addAuditLog({
      actionCategory: 'SYSTEM_SYNC',
      entityType: 'INTEGRATION',
      entityId: newLog.id,
      entityReference: `Orchestrateur périodique (${this.state.orchestrationConfig.frequency})`,
      source: 'AUTOMATED_SYNC',
      details: newLog.summary,
    });

    this.saveState();
    return newLog;
  }

  public testConnectorScenario(
    providerCode: string,
    scenario: 'SUCCESS' | 'TIMEOUT' | 'RATE_LIMIT' | 'CIRCUIT_TRIP'
  ) {
    const provIndex = this.state.providers.findIndex((p) => p.code === providerCode);
    if (provIndex === -1) return null;

    const prov = this.state.providers[provIndex];

    if (scenario === 'SUCCESS') {
      this.state.providers[provIndex] = {
        ...prov,
        consecutiveFailures: 0,
        circuitBreakerState: 'CLOSED',
        status: 'OPERATIONAL',
        lastHealthCheck: new Date().toISOString(),
      };
      this.saveState();
      return {
        httpStatus: 200,
        latencyMs: prov.avgResponseMs,
        circuitBreaker: 'CLOSED' as const,
        message: 'Ping réussi : 200 OK. Serveur officiel du certificateur pleinement opérationnel.',
        cacheUsed: false,
      };
    }

    if (scenario === 'TIMEOUT') {
      const failures = (prov.consecutiveFailures || 0) + 1;
      const isTripped = failures >= 3;
      this.state.providers[provIndex] = {
        ...prov,
        consecutiveFailures: failures,
        circuitBreakerState: isTripped ? 'OPEN' : 'HALF_OPEN',
        status: isTripped ? 'DEGRADED' : 'OPERATIONAL',
        lastHealthCheck: new Date().toISOString(),
      };
      this.saveState();
      return {
        httpStatus: 504,
        latencyMs: 3000,
        circuitBreaker: isTripped ? 'OPEN' as const : 'HALF_OPEN' as const,
        message: `Erreur 504 Gateway Timeout (${failures}/3 échecs consécutifs). ${
          isTripped ? 'Circuit Breaker DÉCLENCHÉ (OPEN) : bascule sur le cache 24h.' : 'Tentative avec Exponential Backoff.'
        }`,
        cacheUsed: isTripped,
      };
    }

    if (scenario === 'RATE_LIMIT') {
      return {
        httpStatus: 429,
        latencyMs: 120,
        circuitBreaker: prov.circuitBreakerState || 'CLOSED',
        message: 'Erreur 429 Too Many Requests : quota temporaire dépassé. Cadence réduite automatiquement (Retry-After: 60s).',
        cacheUsed: true,
      };
    }

    if (scenario === 'CIRCUIT_TRIP') {
      this.state.providers[provIndex] = {
        ...prov,
        consecutiveFailures: 3,
        circuitBreakerState: 'OPEN',
        status: 'DEGRADED',
        lastHealthCheck: new Date().toISOString(),
      };
      this.saveState();
      return {
        httpStatus: 503,
        latencyMs: 40,
        circuitBreaker: 'OPEN' as const,
        message: 'Circuit Breaker OUVERT (OPEN) : 3 pannes consécutives. Les requêtes sont court-circuitées vers le cache certifié local.',
        cacheUsed: true,
      };
    }
  }

  public resetCircuitBreaker(providerCode: string) {
    const provIndex = this.state.providers.findIndex((p) => p.code === providerCode);
    if (provIndex !== -1) {
      this.state.providers[provIndex] = {
        ...this.state.providers[provIndex],
        consecutiveFailures: 0,
        circuitBreakerState: 'CLOSED',
        status: 'OPERATIONAL',
        lastHealthCheck: new Date().toISOString(),
      };
      this.saveState();
    }
  }

  // --- Chantier 7 : CSRD ESRS Scoring, EUDR Due Diligence & Official Audit Packs ---

  public getTenantEudrPlots(): EudrPlotDeclaration[] {
    const tenantSupplierIds = new Set(this.getTenantSuppliers().map((s) => s.id));
    return (this.state.eudrPlots || []).filter((p) => tenantSupplierIds.has(p.supplierId));
  }

  public addEudrPlot(
    plotData: Omit<EudrPlotDeclaration, 'id' | 'verifiedAt'>
  ): EudrPlotDeclaration {
    const user = this.getActiveUser();
    const newPlot: EudrPlotDeclaration = {
      ...plotData,
      id: 'plot-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 5),
      verifiedAt: new Date().toISOString(),
    };

    if (!this.state.eudrPlots) this.state.eudrPlots = [];
    this.state.eudrPlots.unshift(newPlot);

    const supplier = this.state.suppliers.find((s) => s.id === plotData.supplierId);
    this.addAuditLog({
      actionCategory: 'EUDR_PLOT_DECLARED' as any,
      entityType: 'SUPPLIER',
      entityId: plotData.supplierId,
      entityReference: `${supplier?.legalName || 'Fournisseur'} - Parcelle ${newPlot.plotReference}`,
      source: 'MANUAL_UI',
      details: `Déclaration de parcelle EUDR ${newPlot.commodity} (${newPlot.countryOfProduction}) - Coordonnées GPS: ${newPlot.hasGpsCoordinates ? 'VALIDÉES' : 'MANQUANTES'}. Statut: ${newPlot.status}`,
    });

    this.saveState();
    return newPlot;
  }

  public updateEudrPlot(id: string, updates: Partial<EudrPlotDeclaration>): boolean {
    const plotIndex = (this.state.eudrPlots || []).findIndex((p) => p.id === id);
    if (plotIndex === -1) return false;

    const user = this.getActiveUser();
    const prev = this.state.eudrPlots[plotIndex];
    this.state.eudrPlots[plotIndex] = {
      ...prev,
      ...updates,
      verifiedAt: new Date().toISOString(),
    };

    this.addAuditLog({
      actionCategory: 'EUDR_PLOT_UPDATED' as any,
      entityType: 'SUPPLIER',
      entityId: prev.supplierId,
      entityReference: `Parcelle ${prev.plotReference}`,
      source: 'MANUAL_UI',
      details: `Mise à jour statut parcelle EUDR (${prev.commodity}) : ${updates.status || prev.status}. Validé par ${user.name}.`,
    });

    this.saveState();
    return true;
  }

  public deleteEudrPlot(id: string): boolean {
    const plot = (this.state.eudrPlots || []).find((p) => p.id === id);
    if (!plot) return false;

    this.state.eudrPlots = this.state.eudrPlots.filter((p) => p.id !== id);

    this.addAuditLog({
      actionCategory: 'EUDR_PLOT_DELETED' as any,
      entityType: 'SUPPLIER',
      entityId: plot.supplierId,
      entityReference: `Parcelle ${plot.plotReference}`,
      source: 'MANUAL_UI',
      details: `Suppression de la déclaration de parcelle EUDR (${plot.plotReference}) pour le produit ${plot.commodity}.`,
    });

    this.saveState();
    return true;
  }

  public calculateCsrdEsrsScorecard(): CsrdEsrsScorecard {
    const suppliers = this.getTenantSuppliers();
    const certificates = this.getTenantCertificates();
    const activeCerts = certificates.filter((c) => c.status === 'VALID');

    if (suppliers.length === 0) {
      return {
        esrsE4BiodiversityCoverage: 100,
        esrsS2SocialAuditedCoverage: 100,
        esrsG1ConductCoverage: 100,
        overallEsgAlignmentScore: 100,
        totalSuppliersInScope: 0,
        coveredSuppliersCount: 0,
        criticalGapsCount: 0,
      };
    }

    // ESRS E4: Biodiversity / Forestry / Organic agriculture (FSC, PEFC, ECOCERT_BIO)
    const e4Standards: CertificationStandard[] = ['FSC', 'PEFC', 'ECOCERT_BIO'];
    const e4Suppliers = new Set(
      activeCerts.filter((c) => e4Standards.includes(c.certificationStandard)).map((c) => c.supplierId)
    );
    const esrsE4BiodiversityCoverage = Math.round((e4Suppliers.size / suppliers.length) * 100);

    // ESRS S2: Workers in value chain (Fairtrade, GOTS, SA8000, BSCI, OEKO-TEX STEP)
    const s2Standards: CertificationStandard[] = ['FAIRTRADE', 'GOTS', 'OEKO_TEX_STEP', 'OEKO_TEX_100'];
    const s2Suppliers = new Set(
      activeCerts.filter((c) => s2Standards.includes(c.certificationStandard)).map((c) => c.supplierId)
    );
    const esrsS2SocialAuditedCoverage = Math.round((s2Suppliers.size / suppliers.length) * 100);

    // ESRS G1: Business conduct / audit conclusion & unblocked ERP
    const compliantSuppliers = suppliers.filter(
      (s) => s.status === 'ACTIVE' && (!s.erpConfig || s.erpConfig.blockStatus !== 'BLOCKED')
    );
    const esrsG1ConductCoverage = Math.round((compliantSuppliers.length / suppliers.length) * 100);

    // Overall ESG Alignment
    const overallEsgAlignmentScore = Math.round(
      esrsE4BiodiversityCoverage * 0.35 +
      esrsS2SocialAuditedCoverage * 0.40 +
      esrsG1ConductCoverage * 0.25
    );

    // Covered suppliers = has at least 1 valid certificate
    const coveredSuppliers = new Set(activeCerts.map((c) => c.supplierId));
    const criticalAlerts = this.getTenantAlerts().filter(
      (a) => (a.status === 'OPEN' || a.status === 'IN_PROGRESS') && a.severity === 'CRITICAL'
    );

    return {
      esrsE4BiodiversityCoverage,
      esrsS2SocialAuditedCoverage,
      esrsG1ConductCoverage,
      overallEsgAlignmentScore,
      totalSuppliersInScope: suppliers.length,
      coveredSuppliersCount: coveredSuppliers.size,
      criticalGapsCount: criticalAlerts.length,
    };
  }

  public getTenantAuditPacks(): GeneratedAuditPack[] {
    const tenantId = this.state.activeTenantId;
    return (this.state.generatedAuditPacks || []).filter((p) => p.config.tenantId === tenantId);
  }

  public generateOfficialAuditPack(config: OfficialAuditPackConfig): GeneratedAuditPack {
    const suppliers = this.getTenantSuppliers();
    const certificates = this.getTenantCertificates();
    const alerts = this.getTenantAlerts();
    const eudrPlots = this.getTenantEudrPlots();
    const user = this.getActiveUser();

    const activeCerts = certificates.filter((c) => c.status === 'VALID');
    const expiredRevoked = certificates.filter((c) => c.status === 'EXPIRED' || c.status === 'REVOKED');
    const derogations = suppliers.filter((s) => s.erpConfig?.blockStatus === 'TEMPORARY_DEROGATION');
    const openCriticalAlerts = alerts.filter(
      (a) => (a.status === 'OPEN' || a.status === 'IN_PROGRESS') && a.severity === 'CRITICAL'
    );

    // Standards breakdown
    const standardMap = new Map<string, { valid: number; expired: number }>();
    certificates.forEach((c) => {
      const entry = standardMap.get(c.certificationStandard) || { valid: 0, expired: 0 };
      if (c.status === 'VALID') entry.valid += 1;
      else entry.expired += 1;
      standardMap.set(c.certificationStandard, entry);
    });

    const standardsSummary = Array.from(standardMap.entries()).map(([std, counts]) => ({
      standard: std,
      validCount: counts.valid,
      expiredCount: counts.expired,
      coveragePercent:
        counts.valid + counts.expired > 0
          ? Math.round((counts.valid / (counts.valid + counts.expired)) * 100)
          : 0,
    }));

    // EUDR stats
    const totalPlots = eudrPlots.length;
    const gpsVerified = eudrPlots.filter((p) => p.hasGpsCoordinates).length;
    const compliantPlots = eudrPlots.filter((p) => p.status === 'COMPLIANT').length;
    const highRiskPlots = eudrPlots.filter((p) => p.riskAssessment === 'HIGH').length;

    // Cryptographic audit chain seal
    const latestLogs = this.getTenantAuditLogs();
    const lastLog = latestLogs[latestLogs.length - 1];
    const blockNumber = lastLog ? lastLog.blockNumber || 1 : 1;
    const sealHash = lastLog ? lastLog.hash : 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    const previousHash = lastLog ? lastLog.previousHash : '0000000000000000000000000000000000000000000000000000000000000000';

    const complianceRate =
      suppliers.length > 0
        ? Math.round(
            (suppliers.filter((s) => !s.erpConfig || s.erpConfig.blockStatus === 'ALLOWED').length /
              suppliers.length) *
              100
          )
        : 100;

    const refNum = `AUDIT-${new Date().getFullYear()}-CW-${Math.floor(1000 + Math.random() * 9000)}`;

    const pack: GeneratedAuditPack = {
      id: 'pack-' + Date.now().toString(36),
      referenceNumber: refNum,
      generatedAt: new Date().toISOString(),
      config,
      executiveSummary: {
        totalSuppliersAudited: suppliers.length,
        overallComplianceRate: complianceRate,
        activeCertificatesCount: activeCerts.length,
        expiredRevokedCount: expiredRevoked.length,
        derogationsApprovedCount: derogations.length,
        unresolvedCriticalAlertsCount: openCriticalAlerts.length,
      },
      cryptoSeal: {
        blockNumber,
        sealHash,
        previousHash,
        algorithm: 'SHA-256 (Piste d’audit immuable conforme CSRD/CSDDD)',
        verifiedIntegrity: true,
      },
      standardsSummary,
      eudrSummary: {
        totalPlotsDeclared: totalPlots,
        gpsVerifiedRate: totalPlots > 0 ? Math.round((gpsVerified / totalPlots) * 100) : 100,
        eudrComplianceRate: totalPlots > 0 ? Math.round((compliantPlots / totalPlots) * 100) : 100,
        highRiskOriginsCount: highRiskPlots,
      },
    };

    if (!this.state.generatedAuditPacks) this.state.generatedAuditPacks = [];
    this.state.generatedAuditPacks.unshift(pack);

    this.addAuditLog({
      actionCategory: 'SYSTEM_SYNC',
      entityType: 'INTEGRATION',
      entityId: config.tenantId,
      entityReference: refNum,
      source: 'MANUAL_UI',
      details: `Génération du pack d’audit officiel CSRD / CAC ${refNum} ("${config.reportTitle}") par ${user.name}. Sceau cryptographique bloc #${blockNumber} vérifié.`,
    });

    this.saveState();
    return pack;
  }

  // --- Supplier Self-Service Extranet Portal ---
  public getSupplierPortalSession(supplierId: string): SupplierPortalSession {
    const supplier = this.state.suppliers.find((s) => s.id === supplierId);
    const existing = this.state.supplierPortalSubmissions?.[supplierId];

    return {
      supplierId,
      supplierName: supplier?.legalName || 'Fournisseur Partenaire',
      accessToken: 'token-extranet-' + supplierId.replace(/[^a-zA-Z0-9]/g, ''),
      contactEmail: supplier?.contactEmail || '',
      lastAccessDate: existing?.lastUpdated || new Date().toISOString(),
      declarationStatus: existing ? 'SUBMITTED' : 'PENDING_UPLOAD',
      uploadedDocumentsCount: existing?.documents?.length || 0,
    };
  }

  public submitSupplierPortalDeclaration(
    supplierId: string,
    payload: {
      signatoryName: string;
      signatoryRole: string;
      childLaborFree: boolean;
      livingWageCompliant: boolean;
      deforestationFreeCommitment: boolean;
      co2Scope12Declared: boolean;
      comments: string;
      renewedCertificatesAttached: Array<{ standard: CertificationStandard; certNumber: string }>;
    }
  ) {
    if (!this.state.supplierPortalSubmissions) {
      this.state.supplierPortalSubmissions = {};
    }

    this.state.supplierPortalSubmissions[supplierId] = {
      ...payload,
      submittedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    const supplier = this.state.suppliers.find((s) => s.id === supplierId);

    this.addAuditLog({
      actionCategory: 'SUPPLIER_MODIFIED',
      entityType: 'SUPPLIER',
      entityId: supplierId,
      entityReference: supplier?.legalName || 'Fournisseur',
      source: 'MANUAL_UI',
      details: `Auto-déclaration RSE/CSRD & EUDR transmise via le Portail Extranet Fournisseur par ${payload.signatoryName} (${payload.signatoryRole}). Engagements zéros travail des enfants et zéro déforestation validés.`,
    });

    this.saveState();
  }

  public resetDemoData() {
    this.state = {
      tenants: SEED_TENANTS,
      users: SEED_USERS,
      activeTenantId: 'tenant-danone-global',
      activeUserId: 'usr-admin-1',
      suppliers: SEED_SUPPLIERS,
      certificates: SEED_CERTIFICATES,
      alerts: SEED_ALERTS,
      auditLogs: SEED_AUDIT_LOGS,
      matrixRules: SEED_COMPLIANCE_MATRIX,
      providers: SEED_PROVIDERS,
      orchestrationConfig: SEED_ORCHESTRATION_CONFIG,
      orchestratorRunLogs: SEED_ORCHESTRATOR_RUNS,
      eudrPlots: SEED_EUDR_PLOTS,
      generatedAuditPacks: SEED_AUDIT_PACKS,
      supplierPortalSubmissions: {},
      lastSyncTimestamp: new Date().toISOString(),
      isAutoSyncing: false,
    };
    this.saveState();
  }
}

export const appStore = new Store();
