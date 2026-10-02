import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  real,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- Multi-Tenant SaaS Organizations ---
export const tenants = pgTable('tenants', {
  id: varchar('id', { length: 64 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 64 }).notNull().unique(),
  plan: varchar('plan', { length: 32 }).notNull().default('ENTERPRISE'),
  maxSuppliers: integer('max_suppliers').notNull().default(500),
  maxCertificates: integer('max_certificates').notNull().default(2000),
  features: jsonb('features').$type<string[]>().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Users (Clerk Auth Integration) ---
export const users = pgTable('users', {
  id: varchar('id', { length: 64 }).primaryKey(),
  clerkId: varchar('clerk_id', { length: 128 }).unique(), // Clerk user ID: user_2...
  tenantId: varchar('tenant_id', { length: 64 })
    .references(() => tenants.id)
    .notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 32 }).notNull().default('ADMIN'), // ADMIN, COMPLIANCE_OFFICER, BUYER, EXTERNAL_AUDITOR
  department: varchar('department', { length: 128 }),
  avatarUrl: text('avatar_url'),
  isActive: boolean('is_active').notNull().default(true),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Suppliers 360° ---
export const suppliers = pgTable('suppliers', {
  id: varchar('id', { length: 64 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 64 })
    .references(() => tenants.id)
    .notNull(),
  legalName: varchar('legal_name', { length: 255 }).notNull(),
  tradeName: varchar('trade_name', { length: 255 }),
  siret: varchar('siret', { length: 32 }),
  vatNumber: varchar('vat_number', { length: 64 }),
  country: varchar('country', { length: 128 }).notNull(),
  countryCode: varchar('country_code', { length: 8 }).notNull(),
  address: text('address').notNull(),
  contactName: varchar('contact_name', { length: 255 }).notNull(),
  contactEmail: varchar('contact_email', { length: 255 }).notNull(),
  contactPhone: varchar('contact_phone', { length: 64 }),
  tier: integer('tier').notNull().default(1),
  spendCriticality: varchar('spend_criticality', { length: 16 }).notNull().default('HIGH'),
  productCategories: jsonb('product_categories').$type<string[]>().default([]),
  erpBlockStatus: varchar('erp_block_status', { length: 32 }).notNull().default('ALLOWED'),
  erpBlockReason: text('erp_block_reason'),
  derogationJustification: text('derogation_justification'),
  derogationDays: integer('derogation_days'),
  derogationExpiresAt: timestamp('derogation_expires_at', { withTimezone: true }),
  multiFactorRisk: integer('multi_factor_risk').notNull().default(20),
  riskLevel: varchar('risk_level', { length: 16 }).notNull().default('LOW'),
  eudrComplianceStatus: varchar('eudr_compliance_status', { length: 32 }).notNull().default('PENDING_GEO'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Certificates & Sustainability Labels ---
export const certificates = pgTable('certificates', {
  id: varchar('id', { length: 64 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 64 })
    .references(() => tenants.id)
    .notNull(),
  supplierId: varchar('supplier_id', { length: 64 })
    .references(() => suppliers.id)
    .notNull(),
  standard: varchar('standard', { length: 32 }).notNull(), // GOTS, FSC, ECOCERT, OEKO_TEX, FAIRTRADE
  standardLabel: varchar('standard_label', { length: 128 }).notNull(),
  certificateNumber: varchar('certificate_number', { length: 128 }).notNull(),
  licenseNumber: varchar('license_number', { length: 128 }),
  certificationBody: varchar('certification_body', { length: 255 }).notNull(),
  issueDate: varchar('issue_date', { length: 32 }).notNull(),
  expiryDate: varchar('expiry_date', { length: 32 }).notNull(),
  auditDate: varchar('audit_date', { length: 32 }),
  status: varchar('status', { length: 32 }).notNull().default('VALID'),
  integrityScore: integer('integrity_score').notNull().default(95),
  scopeCategories: jsonb('scope_categories').$type<string[]>().default([]),
  certifiedSites: jsonb('certified_sites').$type<string[]>().default([]),
  pdfStorageUrl: text('pdf_storage_url'),
  ocrExtractedData: jsonb('ocr_extracted_data'),
  lastVerifiedAt: timestamp('last_verified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Cryptographic SHA-256 Audit Trail ---
export const auditLogs = pgTable('audit_logs', {
  id: varchar('id', { length: 64 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 64 })
    .references(() => tenants.id)
    .notNull(),
  action: varchar('action', { length: 64 }).notNull(),
  category: varchar('category', { length: 64 }).notNull(),
  description: text('description').notNull(),
  performedBy: varchar('performed_by', { length: 255 }).notNull(),
  userRole: varchar('user_role', { length: 32 }).notNull(),
  hash: varchar('hash', { length: 128 }).notNull(),
  previousHash: varchar('previous_hash', { length: 128 }).notNull(),
  blockHeight: integer('block_height').notNull(),
  metadata: jsonb('metadata'),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),
});

// --- Purchasing Compliance Matrix Rules ---
export const matrixRules = pgTable('matrix_rules', {
  id: varchar('id', { length: 64 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 64 })
    .references(() => tenants.id)
    .notNull(),
  productCategory: varchar('product_category', { length: 255 }).notNull(),
  targetCountry: varchar('target_country', { length: 16 }),
  requiredStandards: jsonb('required_standards').$type<string[]>().notNull(),
  minIntegrityScore: integer('min_integrity_score').notNull().default(80),
  autoBlockOnExpiration: boolean('auto_block_on_expiration').notNull().default(true),
  maxDerogationDays: integer('max_derogation_days').notNull().default(90),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- EUDR 2023/1115 Deforestation Declarations ---
export const eudrDeclarations = pgTable('eudr_declarations', {
  id: varchar('id', { length: 64 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 64 })
    .references(() => tenants.id)
    .notNull(),
  supplierId: varchar('supplier_id', { length: 64 })
    .references(() => suppliers.id)
    .notNull(),
  countryOfProduction: varchar('country_of_production', { length: 128 }).notNull(),
  commodity: varchar('commodity', { length: 128 }).notNull(),
  ddsReference: varchar('dds_reference', { length: 128 }).notNull(),
  landPlotsCount: integer('land_plots_count').notNull().default(1),
  totalAreaHectares: real('total_area_hectares').notNull(),
  tracesReference: varchar('traces_reference', { length: 128 }),
  deforestationFreeCutoffDate: varchar('cutoff_date', { length: 32 }).notNull(),
  polygonCoordinatesWgs84: jsonb('polygon_coordinates_wgs84').notNull(),
  status: varchar('status', { length: 32 }).notNull().default('VERIFIED_SAT'),
  declaredAt: timestamp('declared_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Webhooks & ERP Outbound Integrations ---
export const webhookEndpoints = pgTable('webhook_endpoints', {
  id: varchar('id', { length: 64 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 64 })
    .references(() => tenants.id)
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  targetUrl: text('target_url').notNull(),
  secretKey: varchar('secret_key', { length: 128 }).notNull(),
  events: jsonb('events').$type<string[]>().notNull(),
  active: boolean('active').notNull().default(true),
  failureCount: integer('failure_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- PWA Offline Field Audits ---
export const fieldAudits = pgTable('field_audits', {
  id: varchar('id', { length: 64 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 64 })
    .references(() => tenants.id)
    .notNull(),
  supplierId: varchar('supplier_id', { length: 64 })
    .references(() => suppliers.id)
    .notNull(),
  facilityName: varchar('facility_name', { length: 255 }).notNull(),
  auditorName: varchar('auditor_name', { length: 255 }).notNull(),
  auditDate: varchar('audit_date', { length: 32 }).notNull(),
  locationCoordinates: jsonb('location_coordinates'),
  overallScore: integer('overall_score').notNull(),
  conclusion: varchar('conclusion', { length: 32 }).notNull(),
  capaRequired: boolean('capa_required').notNull().default(false),
  findings: jsonb('findings'),
  status: varchar('status', { length: 32 }).notNull().default('SYNCED'),
  syncedAt: timestamp('synced_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Drizzle Relations ---
export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  suppliers: many(suppliers),
  certificates: many(certificates),
  auditLogs: many(auditLogs),
  matrixRules: many(matrixRules),
  eudrDeclarations: many(eudrDeclarations),
}));

export const suppliersRelations = relations(suppliers, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [suppliers.tenantId],
    references: [tenants.id],
  }),
  certificates: many(certificates),
  eudrDeclarations: many(eudrDeclarations),
  fieldAudits: many(fieldAudits),
}));

export const certificatesRelations = relations(certificates, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [certificates.supplierId],
    references: [suppliers.id],
  }),
  tenant: one(tenants, {
    fields: [certificates.tenantId],
    references: [tenants.id],
  }),
}));
