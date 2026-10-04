import { describe, it, expect } from 'vitest';
import { VaultStorageService } from '../../src/services/vaultStorage';

describe('Chantier 18 : SecNumCloud Vault Storage & NF Z42-013 Legal Archiving', () => {
  it('should upload document with AES-256-GCM encryption and 64-char SHA-256 fingerprint', async () => {
    const doc = await VaultStorageService.uploadCertificatePdf(
      'tenant-danone-global',
      'cert-gots-4421',
      { name: 'audit_gots_2026.pdf', size: 1048576 }
    );

    expect(doc.id).toMatch(/^doc_/);
    expect(doc.encryption).toBe('AES-256-GCM');
    expect(doc.sha256Hash).toHaveLength(64);
    expect(doc.storageBucket).toBe('certiwatch-enterprise-vault-eu-west');
    expect(doc.storageUri).toContain('tenant-danone-global/certificates/cert-gots-4421_audit_gots_2026.pdf');
    expect(doc.contentType).toBe('application/pdf');
  });

  it('should generate short-lived presigned URLs with tamper-resistant HMAC signature', () => {
    const uri = 'gs://certiwatch-enterprise-vault-eu-west/tenant-1/certificates/cert-1.pdf';
    const presignedUrl = VaultStorageService.getPresignedDownloadUrl(uri, 15);

    expect(presignedUrl).toContain('https://storage.googleapis.com/');
    expect(presignedUrl).toContain('expires=');
    expect(presignedUrl).toContain('signature=sig_hmac_');
  });
});
