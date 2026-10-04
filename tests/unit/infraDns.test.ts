import { describe, it, expect } from 'vitest';
import { infraStore, INITIAL_DNS_RECORDS, INITIAL_SSL_CERTIFICATE } from '../../src/db/infraStore';

describe('Chantier Infrastructure de Production, Domaine & DNS', () => {
  it('should verify Apex A records contain valid IPv4 addresses', () => {
    const aRecords = infraStore.getDnsRecords().filter((r) => r.type === 'A');
    expect(aRecords.length).toBeGreaterThanOrEqual(2);

    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    aRecords.forEach((record) => {
      expect(record.value).toMatch(ipv4Regex);
      expect(record.status).toBe('ACTIVE_RESOLVED');
    });
  });

  it('should verify AAAA record contains valid IPv6 address', () => {
    const aaaaRecords = infraStore.getDnsRecords().filter((r) => r.type === 'AAAA');
    expect(aaaaRecords.length).toBeGreaterThan(0);

    const ipv6Regex = /^([0-9a-fA-F]{0,4}:){1,7}[0-9a-fA-F]{0,4}$/;
    aaaaRecords.forEach((record) => {
      expect(record.value).toMatch(ipv6Regex);
    });
  });

  it('should verify CNAME records for app and api point to Google Hosted domain', () => {
    const cnames = infraStore.getDnsRecords().filter((r) => r.type === 'CNAME');
    const appCname = cnames.find((c) => c.name === 'app');
    const apiCname = cnames.find((c) => c.name === 'api');

    expect(appCname).toBeDefined();
    expect(appCname?.value).toBe('ghs.googlehosted.com.');
    expect(apiCname).toBeDefined();
    expect(apiCname?.value).toBe('ghs.googlehosted.com.');
  });

  it('should enforce strict email security with SPF and DMARC p=reject policy', () => {
    const txtRecords = infraStore.getDnsRecords().filter((r) => r.type === 'TXT');
    const spf = txtRecords.find((r) => r.value.startsWith('v=spf1'));
    const dmarc = txtRecords.find((r) => r.name === '_dmarc');

    expect(spf).toBeDefined();
    expect(spf?.value).toContain('~all');

    expect(dmarc).toBeDefined();
    expect(dmarc?.value).toContain('v=DMARC1');
    expect(dmarc?.value).toContain('p=reject');
    expect(dmarc?.value).toContain('pct=100');
  });

  it('should verify CAA records restrict certificate issuance to GTS and Let’s Encrypt', () => {
    const caaRecord = infraStore.getDnsRecords().find((r) => r.type === 'CAA');
    expect(caaRecord).toBeDefined();
    expect(caaRecord?.value).toContain('pki.goog');
    expect(caaRecord?.value).toContain('letsencrypt.org');
    expect(caaRecord?.value).toContain('mailto:security@certiwatch.io');
  });

  it('should verify SSL/TLS certificate is TLS 1.3 with HSTS >= 1 year and Qualys A+ rating', () => {
    const ssl = infraStore.getSslInfo();
    expect(ssl.tlsVersion).toBe('TLS 1.3');
    expect(ssl.hstsEnabled).toBe(true);
    expect(ssl.hstsMaxAgeSeconds).toBeGreaterThanOrEqual(31536000); // 1 year minimum
    expect(ssl.qualysGrade).toBe('A+');
    expect(ssl.daysRemaining).toBeGreaterThan(0);
    expect(ssl.autoRenewEnabled).toBe(true);
    expect(ssl.subjectAlternativeNames).toContain('app.certiwatch.io');
    expect(ssl.subjectAlternativeNames).toContain('api.certiwatch.io');
  });

  it('should allow adding and removing custom white-label tenant domains', () => {
    const created = infraStore.addCustomDomain(
      'tenant-test',
      'Test Enterprise',
      'compliance.test-corp.com'
    );

    expect(created.customHostname).toBe('compliance.test-corp.com');
    expect(created.targetCname).toBe('cname.certiwatch.io');
    expect(created.verificationToken).toMatch(/^cw-verify-/);

    const domains = infraStore.getCustomDomains();
    expect(domains.some((d) => d.id === created.id)).toBe(true);

    infraStore.removeCustomDomain(created.id);
    const afterDelete = infraStore.getCustomDomains();
    expect(afterDelete.some((d) => d.id === created.id)).toBe(false);
  });
});
