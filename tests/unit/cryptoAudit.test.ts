import { describe, it, expect } from 'vitest';
import {
  computeSha256Digest,
  generateEventSeal,
  verifyAuditChainIntegrity,
} from '../../src/utils/cryptoAudit';
import { AuditLogEntry } from '../../src/types/audit';

describe('Chantier 8 & 18 : CryptoAudit SHA-256 & Merkle Chain Integrity', () => {
  it('should compute deterministic 64-character hex digests', () => {
    const input = 'CertiWatch-Supplier-Audit-Danone-2026';
    const hash1 = computeSha256Digest(input);
    const hash2 = computeSha256Digest(input);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
    expect(hash1).toMatch(/^[0-9a-f]{64}$/);
  });

  it('should produce distinct hashes for different inputs (avalanche effect)', () => {
    const hashA = computeSha256Digest('GOTS-Valid-2026');
    const hashB = computeSha256Digest('GOTS-Valid-2027');

    expect(hashA).not.toBe(hashB);
  });

  it('should generate valid digital event seal format', () => {
    const sealData = {
      tenantId: 'tenant-danone-global',
      timestamp: '2026-10-04T08:00:00Z',
      actionCategory: 'CERTIFICATE_VERIFIED',
      entityId: 'cert-12345',
      previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
      details: 'Audit Ecocert validé sans non-conformité majeure',
    };

    const result = generateEventSeal(sealData);

    expect(result.hash).toHaveLength(64);
    expect(result.digitalSeal).toMatch(/^CERT-SEAL-[0-9A-F]{16}-ED25519-AUTH$/);
  });

  it('should verify an empty audit chain as valid', () => {
    const result = verifyAuditChainIntegrity([]);

    expect(result.isChainValid).toBe(true);
    expect(result.totalBlocksVerified).toBe(0);
    expect(result.tamperedEntriesCount).toBe(0);
  });

  it('should verify a valid sequential audit chain', () => {
    const block1Data = {
      tenantId: 'tenant-danone-global',
      timestamp: '2026-10-01T10:00:00Z',
      actionCategory: 'SUPPLIER_CREATED',
      entityId: 'sup-1',
      previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
      details: 'Fournisseur Coopérative Cacao Bio créé',
    };
    const seal1 = generateEventSeal(block1Data);

    const log1: AuditLogEntry = {
      id: 'log-1',
      tenantId: block1Data.tenantId,
      timestamp: block1Data.timestamp,
      userId: 'usr-1',
      userName: 'Alice Compliance',
      userRole: 'COMPLIANCE_OFFICER',
      actionCategory: 'SUPPLIER_CREATED',
      entityType: 'SUPPLIER',
      entityId: block1Data.entityId,
      entityReference: 'Coop Cacao Bio',
      source: 'MANUAL_UI',
      details: block1Data.details,
      hash: seal1.hash,
      previousHash: block1Data.previousHash,
      blockNumber: 1,
      digitalSeal: seal1.digitalSeal,
    };

    const block2Data = {
      tenantId: 'tenant-danone-global',
      timestamp: '2026-10-02T14:30:00Z',
      actionCategory: 'CERTIFICATE_VERIFIED',
      entityId: 'cert-1',
      previousHash: seal1.hash,
      details: 'Certificat Fairtrade vérifié via API officielle',
    };
    const seal2 = generateEventSeal(block2Data);

    const log2: AuditLogEntry = {
      id: 'log-2',
      tenantId: block2Data.tenantId,
      timestamp: block2Data.timestamp,
      userId: 'usr-2',
      userName: 'Système Orchestrateur',
      userRole: 'SYSTEM',
      actionCategory: 'CERTIFICATE_VERIFIED',
      entityType: 'CERTIFICATE',
      entityId: block2Data.entityId,
      entityReference: 'FLO-ID-4421',
      source: 'AUTOMATED_SYNC',
      details: block2Data.details,
      hash: seal2.hash,
      previousHash: block2Data.previousHash,
      blockNumber: 2,
      digitalSeal: seal2.digitalSeal,
    };

    const verification = verifyAuditChainIntegrity([log1, log2]);
    expect(verification.isChainValid).toBe(true);
    expect(verification.totalBlocksVerified).toBe(2);
    expect(verification.tamperedEntriesCount).toBe(0);
    expect(verification.latestBlockHash).toBe(seal2.hash);
  });

  it('should detect tampering if an audit log detail or hash has been altered', () => {
    const block1Data = {
      tenantId: 'tenant-danone-global',
      timestamp: '2026-10-01T10:00:00Z',
      actionCategory: 'SUPPLIER_CREATED',
      entityId: 'sup-1',
      previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
      details: 'Fournisseur Coopérative Cacao Bio créé',
    };
    const seal1 = generateEventSeal(block1Data);

    const log1: AuditLogEntry = {
      id: 'log-1',
      tenantId: block1Data.tenantId,
      timestamp: block1Data.timestamp,
      userId: 'usr-1',
      userName: 'Alice Compliance',
      userRole: 'COMPLIANCE_OFFICER',
      actionCategory: 'SUPPLIER_CREATED',
      entityType: 'SUPPLIER',
      entityId: block1Data.entityId,
      entityReference: 'Coop Cacao Bio',
      source: 'MANUAL_UI',
      details: 'Contenu frauduleusement modifié a posteriori sans recalcul du hash', // TAMPERED!
      hash: seal1.hash,
      previousHash: block1Data.previousHash,
      blockNumber: 1,
      digitalSeal: seal1.digitalSeal,
    };

    const verification = verifyAuditChainIntegrity([log1]);
    expect(verification.isChainValid).toBe(false);
    expect(verification.tamperedEntriesCount).toBe(1);
    expect(verification.tamperedIds).toContain('log-1');
  });
});
