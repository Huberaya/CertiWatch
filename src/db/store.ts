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
import { Certificate, CertificateStatus, VerificationOutcome } from '../types/certificate';
import { ComplianceAlert, AlertStatus } from '../types/alert';
import { AuditLogEntry } from '../types/audit';
import { ComplianceMatrixRule } from '../types/matrix';
import { CertificationProviderMetadata, OrchestrationConfig, OrchestratorRunLog } from '../types/connector';
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
  public addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'tenantId' | 'userId' | 'userName' | 'userRole'>) {
    const user = this.getActiveUser();
    const newEntry: AuditLogEntry = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      tenantId: this.state.activeTenantId,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      ...entry,
    };
    this.state.auditLogs.unshift(newEntry);
    this.saveState();
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
      lastSyncTimestamp: new Date().toISOString(),
      isAutoSyncing: false,
    };
    this.saveState();
  }
}

export const appStore = new Store();
