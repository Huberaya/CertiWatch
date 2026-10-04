import { Pool } from '@neondatabase/serverless';
import { createNeonPool } from './index';

export interface NeonTableStats {
  tenants: number;
  users: number;
  suppliers: number;
  certificates: number;
  auditLogs: number;
  matrixRules: number;
  eudrDeclarations: number;
  webhookEndpoints: number;
  fieldAudits: number;
  totalRows: number;
  databaseSizeMb: number | null;
}

export const DDL_STATEMENTS = `
CREATE TABLE IF NOT EXISTS tenants (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(64) NOT NULL UNIQUE,
  plan VARCHAR(32) NOT NULL DEFAULT 'ENTERPRISE',
  max_suppliers INTEGER NOT NULL DEFAULT 500,
  max_certificates INTEGER NOT NULL DEFAULT 2000,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  clerk_id VARCHAR(128) UNIQUE,
  tenant_id VARCHAR(64) REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'ADMIN',
  department VARCHAR(128),
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS suppliers (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) REFERENCES tenants(id) ON DELETE CASCADE,
  legal_name VARCHAR(255) NOT NULL,
  trade_name VARCHAR(255),
  siret VARCHAR(32),
  vat_number VARCHAR(64),
  country VARCHAR(128) NOT NULL,
  country_code VARCHAR(8) NOT NULL,
  address TEXT NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(64),
  tier INTEGER NOT NULL DEFAULT 1,
  spend_criticality VARCHAR(16) NOT NULL DEFAULT 'HIGH',
  product_categories JSONB DEFAULT '[]'::jsonb,
  erp_block_status VARCHAR(32) NOT NULL DEFAULT 'ALLOWED',
  erp_block_reason TEXT,
  derogation_justification TEXT,
  derogation_days INTEGER,
  derogation_expires_at TIMESTAMPTZ,
  multi_factor_risk INTEGER NOT NULL DEFAULT 20,
  risk_level VARCHAR(16) NOT NULL DEFAULT 'LOW',
  eudr_compliance_status VARCHAR(32) NOT NULL DEFAULT 'PENDING_GEO',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS certificates (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) REFERENCES tenants(id) ON DELETE CASCADE,
  supplier_id VARCHAR(64) REFERENCES suppliers(id) ON DELETE CASCADE,
  standard VARCHAR(32) NOT NULL,
  standard_label VARCHAR(128) NOT NULL,
  certificate_number VARCHAR(128) NOT NULL,
  license_number VARCHAR(128),
  certification_body VARCHAR(255) NOT NULL,
  issue_date VARCHAR(32) NOT NULL,
  expiry_date VARCHAR(32) NOT NULL,
  audit_date VARCHAR(32),
  status VARCHAR(32) NOT NULL DEFAULT 'VALID',
  integrity_score INTEGER NOT NULL DEFAULT 95,
  scope_categories JSONB DEFAULT '[]'::jsonb,
  certified_sites JSONB DEFAULT '[]'::jsonb,
  pdf_storage_url TEXT,
  ocr_extracted_data JSONB,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) REFERENCES tenants(id) ON DELETE CASCADE,
  action VARCHAR(64) NOT NULL,
  category VARCHAR(64) NOT NULL,
  description TEXT NOT NULL,
  performed_by VARCHAR(255) NOT NULL,
  user_role VARCHAR(32) NOT NULL,
  hash VARCHAR(128) NOT NULL,
  previous_hash VARCHAR(128) NOT NULL,
  block_height INTEGER NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS matrix_rules (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) REFERENCES tenants(id) ON DELETE CASCADE,
  product_category VARCHAR(255) NOT NULL,
  target_country VARCHAR(16),
  required_standards JSONB NOT NULL,
  min_integrity_score INTEGER NOT NULL DEFAULT 80,
  auto_block_on_expiration BOOLEAN NOT NULL DEFAULT true,
  max_derogation_days INTEGER NOT NULL DEFAULT 90,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS eudr_declarations (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) REFERENCES tenants(id) ON DELETE CASCADE,
  supplier_id VARCHAR(64) REFERENCES suppliers(id) ON DELETE CASCADE,
  country_of_production VARCHAR(128) NOT NULL,
  commodity VARCHAR(128) NOT NULL,
  dds_reference VARCHAR(128) NOT NULL,
  land_plots_count INTEGER NOT NULL DEFAULT 1,
  total_area_hectares REAL NOT NULL,
  traces_reference VARCHAR(128),
  cutoff_date VARCHAR(32) NOT NULL,
  polygon_coordinates_wgs84 JSONB NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'VERIFIED_SAT',
  declared_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  target_url TEXT NOT NULL,
  secret_key VARCHAR(128) NOT NULL,
  events JSONB NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  failure_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS field_audits (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) REFERENCES tenants(id) ON DELETE CASCADE,
  supplier_id VARCHAR(64) REFERENCES suppliers(id) ON DELETE CASCADE,
  facility_name VARCHAR(255) NOT NULL,
  auditor_name VARCHAR(255) NOT NULL,
  audit_date VARCHAR(32) NOT NULL,
  location_coordinates JSONB,
  overall_score INTEGER NOT NULL,
  conclusion VARCHAR(32) NOT NULL,
  capa_required BOOLEAN NOT NULL DEFAULT false,
  findings JSONB,
  status VARCHAR(32) NOT NULL DEFAULT 'SYNCED',
  synced_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_suppliers_tenant ON suppliers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_certificates_supplier ON certificates(supplier_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_hash ON audit_logs(hash);
CREATE INDEX IF NOT EXISTS idx_eudr_supplier ON eudr_declarations(supplier_id);
`;

export async function initNeonTables(): Promise<{ success: boolean; message: string; tablesCount?: number }> {
  const pool = createNeonPool();
  if (!pool) {
    return {
      success: false,
      message: 'Base Neon non configurée. Veuillez renseigner DATABASE_URL dans votre fichier .env',
    };
  }

  const client = await pool.connect();
  try {
    await client.query(DDL_STATEMENTS);
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    return {
      success: true,
      message: 'Schéma PostgreSQL 9 tables initialisé avec succès sur Neon !',
      tablesCount: tablesRes.rowCount || 0,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Erreur d'initialisation Neon DDL: ${error.message}`,
    };
  } finally {
    client.release();
  }
}

export async function getNeonTableStats(): Promise<NeonTableStats | null> {
  const pool = createNeonPool();
  if (!pool) return null;

  const client = await pool.connect();
  try {
    const q = async (table: string): Promise<number> => {
      try {
        const res = await client.query(`SELECT count(*)::int as c FROM ${table}`);
        return res.rows[0]?.c || 0;
      } catch {
        return 0;
      }
    };

    const tenants = await q('tenants');
    const users = await q('users');
    const suppliers = await q('suppliers');
    const certificates = await q('certificates');
    const auditLogs = await q('audit_logs');
    const matrixRules = await q('matrix_rules');
    const eudrDeclarations = await q('eudr_declarations');
    const webhookEndpoints = await q('webhook_endpoints');
    const fieldAudits = await q('field_audits');

    let databaseSizeMb: number | null = null;
    try {
      const sizeRes = await client.query(`SELECT pg_database_size(current_database())::bigint as bytes`);
      databaseSizeMb = Math.round((Number(sizeRes.rows[0]?.bytes) / (1024 * 1024)) * 100) / 100;
    } catch {
      databaseSizeMb = null;
    }

    const totalRows =
      tenants +
      users +
      suppliers +
      certificates +
      auditLogs +
      matrixRules +
      eudrDeclarations +
      webhookEndpoints +
      fieldAudits;

    return {
      tenants,
      users,
      suppliers,
      certificates,
      auditLogs,
      matrixRules,
      eudrDeclarations,
      webhookEndpoints,
      fieldAudits,
      totalRows,
      databaseSizeMb,
    };
  } finally {
    client.release();
  }
}

export async function seedNeonFromStore(storeSnapshot: {
  tenants: any[];
  users: any[];
  suppliers: any[];
  certificates: any[];
  auditLogs: any[];
  matrixRules: any[];
  eudrDeclarations: any[];
  webhookEndpoints: any[];
  fieldAudits: any[];
}): Promise<{ success: boolean; insertedCount: number; message: string }> {
  const pool = createNeonPool();
  if (!pool) {
    return { success: false, insertedCount: 0, message: 'Neon non configuré (DATABASE_URL manquant)' };
  }

  const client = await pool.connect();
  let inserted = 0;
  const defaultTenantId = storeSnapshot.tenants?.[0]?.id || 'tenant-danone-global';

  try {
    await client.query('BEGIN');

    // 1. Tenants
    for (const t of storeSnapshot.tenants || []) {
      await client.query(
        `INSERT INTO tenants (id, name, slug, plan, max_suppliers, max_certificates, features, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, plan = EXCLUDED.plan;`,
        [t.id, t.name, t.slug, t.plan || 'ENTERPRISE', t.maxSuppliers || 500, t.maxCertificates || 2000, JSON.stringify(t.features || [])]
      );
      inserted++;
    }

    // 2. Users
    for (const u of storeSnapshot.users || []) {
      await client.query(
        `INSERT INTO users (id, clerk_id, tenant_id, email, name, role, department, avatar_url, is_active, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, email = EXCLUDED.email;`,
        [u.id, u.clerkId || null, u.tenantId || defaultTenantId, u.email, u.name, u.role, u.department || null, u.avatarUrl || null, u.isActive ?? true]
      );
      inserted++;
    }

    // 3. Suppliers
    for (const s of storeSnapshot.suppliers || []) {
      await client.query(
        `INSERT INTO suppliers (
          id, tenant_id, legal_name, trade_name, siret, vat_number, country, country_code,
          address, contact_name, contact_email, contact_phone, tier, spend_criticality,
          product_categories, erp_block_status, erp_block_reason, derogation_justification,
          derogation_days, multi_factor_risk, risk_level, eudr_compliance_status, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18,
          $19, $20, $21, $22, NOW(), NOW()
        ) ON CONFLICT (id) DO UPDATE SET
          legal_name = EXCLUDED.legal_name,
          erp_block_status = EXCLUDED.erp_block_status,
          multi_factor_risk = EXCLUDED.multi_factor_risk,
          risk_level = EXCLUDED.risk_level;`,
        [
          s.id,
          s.tenantId || defaultTenantId,
          s.legalName,
          s.tradeName || null,
          s.siret || null,
          s.vatNumber || null,
          s.country,
          s.countryCode,
          s.address,
          s.contactName,
          s.contactEmail,
          s.contactPhone || null,
          typeof s.tier === 'number' ? s.tier : (parseInt(String(s.tier || '1').replace(/\D/g, '')) || 1),
          s.spendCriticality || 'HIGH',
          JSON.stringify(s.productCategories || []),
          s.erpBlockStatus || 'ALLOWED',
          s.erpBlockReason || null,
          s.derogationJustification || null,
          typeof s.derogationDays === 'number' ? s.derogationDays : null,
          typeof s.multiFactorRisk === 'number' ? s.multiFactorRisk : (s.multiFactorRisk?.overallScore ?? 20),
          s.riskLevel || 'LOW',
          s.eudrComplianceStatus || 'PENDING_GEO',
        ]
      );
      inserted++;
    }

    // 4. Certificates
    for (const c of storeSnapshot.certificates || []) {
      await client.query(
        `INSERT INTO certificates (
          id, tenant_id, supplier_id, standard, standard_label, certificate_number,
          license_number, certification_body, issue_date, expiry_date, audit_date,
          status, integrity_score, scope_categories, certified_sites, pdf_storage_url,
          ocr_extracted_data, last_verified_at, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11,
          $12, $13, $14, $15, $16,
          $17, NOW(), NOW(), NOW()
        ) ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          integrity_score = EXCLUDED.integrity_score;`,
        [
          c.id,
          c.tenantId || defaultTenantId,
          c.supplierId,
          c.certificationStandard || c.standard || 'GOTS',
          c.standardLabel || c.certificationStandard || 'Certification Standard',
          c.certificateNumber,
          c.licenseNumber || null,
          c.certificationBody,
          c.issueDate,
          c.expiryDate,
          c.auditDate || null,
          c.status || 'VALID',
          c.confidenceScore ?? c.integrityScore ?? 95,
          JSON.stringify(c.scope?.productCategories || c.scopeCategories || []),
          JSON.stringify(c.scope?.coveredFacilities || c.certifiedSites || []),
          c.pdfStorageUrl || `https://storage.googleapis.com/certiwatch-vault/${c.id}.pdf`,
          JSON.stringify(c.ocrExtractedData || {}),
        ]
      );
      inserted++;
    }

    // 5. Audit logs
    for (const a of storeSnapshot.auditLogs || []) {
      await client.query(
        `INSERT INTO audit_logs (
          id, tenant_id, action, category, description, performed_by, user_role,
          hash, previous_hash, block_height, metadata, timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        ON CONFLICT (id) DO NOTHING;`,
        [
          a.id,
          a.tenantId || defaultTenantId,
          a.actionCategory || a.action || 'SYSTEM_EVENT',
          a.entityType || a.category || 'SYSTEM',
          a.details || a.description || 'Audit log event',
          a.userName || a.performedBy || 'System',
          a.userRole || 'ADMIN',
          a.hash || 'hash_placeholder',
          a.previousHash || '0',
          a.blockNumber || a.blockHeight || 1,
          JSON.stringify(a.metadata || {}),
        ]
      );
      inserted++;
    }

    // 6. Matrix Rules
    for (const m of storeSnapshot.matrixRules || []) {
      await client.query(
        `INSERT INTO matrix_rules (
          id, tenant_id, product_category, target_country, required_standards,
          min_integrity_score, auto_block_on_expiration, max_derogation_days, active, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        ON CONFLICT (id) DO UPDATE SET active = EXCLUDED.active;`,
        [
          m.id,
          m.tenantId || defaultTenantId,
          m.productCategory,
          m.targetCountry || null,
          JSON.stringify(m.requiredStandards || []),
          m.minIntegrityScore || 80,
          m.autoBlockOnExpiration ?? true,
          m.maxDerogationDays || 90,
          m.active ?? true,
        ]
      );
      inserted++;
    }

    // 7. EUDR Declarations
    for (const e of storeSnapshot.eudrDeclarations || []) {
      await client.query(
        `INSERT INTO eudr_declarations (
          id, tenant_id, supplier_id, country_of_production, commodity, dds_reference,
          land_plots_count, total_area_hectares, traces_reference, cutoff_date,
          polygon_coordinates_wgs84, status, declared_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
        ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;`,
        [
          e.id,
          e.tenantId || defaultTenantId,
          e.supplierId,
          e.countryOfProduction || 'France',
          e.commodity || 'COCOA',
          e.tracesNtDdsReference || e.ddsReference || e.plotReference || 'DDS-2026-EUDR-001',
          e.landPlotsCount || 1,
          e.totalAreaHectares || 12.5,
          e.tracesReference || e.tracesNtDdsReference || null,
          e.deforestationFreeCutoffDate || '2020-12-31',
          JSON.stringify(e.polygonCoordinatesWgs84 || (e.gpsPolygonOrPoint ? [{ point: e.gpsPolygonOrPoint }] : [])),
          e.status || 'VERIFIED_SAT',
        ]
      );
      inserted++;
    }

    // 8. Webhook Endpoints
    for (const w of storeSnapshot.webhookEndpoints || []) {
      await client.query(
        `INSERT INTO webhook_endpoints (
          id, tenant_id, name, target_url, secret_key, events, active, failure_count, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        ON CONFLICT (id) DO UPDATE SET active = EXCLUDED.active;`,
        [
          w.id,
          w.tenantId || defaultTenantId,
          w.name,
          w.url || w.targetUrl || 'https://api.erp.internal/webhooks',
          w.secret || w.secretKey || 'whsec_secret_default',
          JSON.stringify(w.events || []),
          w.status === 'ACTIVE' || w.active === true,
          w.failureCount || 0,
        ]
      );
      inserted++;
    }

    await client.query('COMMIT');
    return {
      success: true,
      insertedCount: inserted,
      message: `Synchronisation réussie : ${inserted} enregistrements insérés/mis à jour dans Neon PostgreSQL !`,
    };
  } catch (error: any) {
    await client.query('ROLLBACK');
    return {
      success: false,
      insertedCount: inserted,
      message: `Erreur lors de la synchronisation Neon: ${error.message}`,
    };
  } finally {
    client.release();
  }
}
