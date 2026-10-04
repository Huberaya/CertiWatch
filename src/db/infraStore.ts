import {
  DnsRecord,
  SslTlsCertificateInfo,
  CustomDomainMapping,
  InfraTopologyNode,
} from '../types/infra';

export const INITIAL_DNS_RECORDS: DnsRecord[] = [
  {
    id: 'dns-1',
    name: '@',
    fullDomain: 'certiwatch.io',
    type: 'A',
    value: '216.239.32.21',
    ttl: 300,
    status: 'ACTIVE_RESOLVED',
    purpose: 'Apex Domain -> Google Cloud Anycast Global Edge IP (Primary)',
    dnssecValidated: true,
    lastCheckedAt: '2026-10-04T10:00:00Z',
  },
  {
    id: 'dns-2',
    name: '@',
    fullDomain: 'certiwatch.io',
    type: 'A',
    value: '216.239.34.21',
    ttl: 300,
    status: 'ACTIVE_RESOLVED',
    purpose: 'Apex Domain -> Google Cloud Anycast Global Edge IP (Secondary Failover)',
    dnssecValidated: true,
    lastCheckedAt: '2026-10-04T10:00:00Z',
  },
  {
    id: 'dns-3',
    name: '@',
    fullDomain: 'certiwatch.io',
    type: 'AAAA',
    value: '2001:4860:4802:32::15',
    ttl: 300,
    status: 'ACTIVE_RESOLVED',
    purpose: 'Apex Domain -> IPv6 Anycast Cloud Routing',
    dnssecValidated: true,
    lastCheckedAt: '2026-10-04T10:00:00Z',
  },
  {
    id: 'dns-4',
    name: 'app',
    fullDomain: 'app.certiwatch.io',
    type: 'CNAME',
    value: 'ghs.googlehosted.com.',
    ttl: 300,
    status: 'ACTIVE_RESOLVED',
    purpose: 'Application SaaS B2B -> Google Cloud Run Service europe-west2',
    dnssecValidated: true,
    lastCheckedAt: '2026-10-04T10:00:00Z',
  },
  {
    id: 'dns-5',
    name: 'api',
    fullDomain: 'api.certiwatch.io',
    type: 'CNAME',
    value: 'ghs.googlehosted.com.',
    ttl: 300,
    status: 'ACTIVE_RESOLVED',
    purpose: 'REST API & Webhooks Gateway -> Cloud Run Microservices',
    dnssecValidated: true,
    lastCheckedAt: '2026-10-04T10:00:00Z',
  },
  {
    id: 'dns-6',
    name: 'vault',
    fullDomain: 'vault.certiwatch.io',
    type: 'CNAME',
    value: 'cname.storage.googleapis.com.',
    ttl: 3600,
    status: 'ACTIVE_RESOLVED',
    purpose: 'Coffre-fort d’archivage certifié NF Z42-013 (Cloud Storage EU)',
    dnssecValidated: true,
    lastCheckedAt: '2026-10-04T10:00:00Z',
  },
  {
    id: 'dns-7',
    name: '@',
    fullDomain: 'certiwatch.io',
    type: 'CAA',
    value: '0 issue "pki.goog" ; 0 issue "letsencrypt.org" ; 0 iodef "mailto:security@certiwatch.io"',
    ttl: 3600,
    status: 'ACTIVE_RESOLVED',
    purpose: 'Certificate Authority Authorization (Autorisation GTS & Let’s Encrypt)',
    dnssecValidated: true,
    lastCheckedAt: '2026-10-04T10:00:00Z',
  },
  {
    id: 'dns-8',
    name: '@',
    fullDomain: 'certiwatch.io',
    type: 'TXT',
    value: 'v=spf1 include:_spf.google.com include:_spf.certiwatch.io ~all',
    ttl: 3600,
    status: 'ACTIVE_RESOLVED',
    purpose: 'Protection SPF Anti-Spoofing & Alertes Email Fournisseurs',
    dnssecValidated: true,
    lastCheckedAt: '2026-10-04T10:00:00Z',
  },
  {
    id: 'dns-9',
    name: 'cw2026._domainkey',
    fullDomain: 'cw2026._domainkey.certiwatch.io',
    type: 'TXT',
    value: 'v=DKIM1; k=ed25519; p=MCowBQYDK2VwAyEA4t9Q2mYp0Zk7h1+xXv6NqLm8T5rP2sW3jU1yZb8=',
    ttl: 3600,
    status: 'ACTIVE_RESOLVED',
    purpose: 'Signature Cryptographique DKIM Ed25519 des Notifications d’Audit',
    dnssecValidated: true,
    lastCheckedAt: '2026-10-04T10:00:00Z',
  },
  {
    id: 'dns-10',
    name: '_dmarc',
    fullDomain: '_dmarc.certiwatch.io',
    type: 'TXT',
    value: 'v=DMARC1; p=reject; rua=mailto:dmarc-reports@certiwatch.io; pct=100; sp=reject; adkim=s; aspf=s',
    ttl: 3600,
    status: 'ACTIVE_RESOLVED',
    purpose: 'Politique DMARC Stricte (Rejet Total des Emails Non Authentifiés)',
    dnssecValidated: true,
    lastCheckedAt: '2026-10-04T10:00:00Z',
  },
];

export const INITIAL_SSL_CERTIFICATE: SslTlsCertificateInfo = {
  domain: 'app.certiwatch.io',
  issuer: 'Google Trust Services LLC (GTS CA 1D4)',
  subjectAlternativeNames: [
    'certiwatch.io',
    'app.certiwatch.io',
    'api.certiwatch.io',
    'vault.certiwatch.io',
    '*.certiwatch.io',
  ],
  validFrom: '2026-09-01T00:00:00Z',
  validTo: '2026-11-30T23:59:59Z',
  daysRemaining: 57,
  autoRenewEnabled: true,
  tlsVersion: 'TLS 1.3',
  cipherSuite: 'TLS_AES_256_GCM_SHA384 (ECDHE-X25519 256-bit)',
  hstsEnabled: true,
  hstsMaxAgeSeconds: 63072000, // 2 years, preload eligible
  ocspStapling: true,
  alpnProtocols: ['h2', 'http/1.1'],
  qualysGrade: 'A+',
};

export const INITIAL_CUSTOM_DOMAINS: CustomDomainMapping[] = [
  {
    id: 'cd-1',
    tenantId: 'tenant-danone-global',
    tenantName: 'Danone Quality & Sourcing',
    customHostname: 'compliance.danone.com',
    targetCname: 'cname.certiwatch.io',
    status: 'SSL_ACTIVE',
    sslStatus: 'ISSUED',
    verificationToken: 'cw-verify-danone-9f82a1',
    createdAt: '2026-09-15T08:30:00Z',
    lastVerifiedAt: '2026-10-04T06:00:00Z',
  },
  {
    id: 'cd-2',
    tenantId: 'tenant-kering-luxury',
    tenantName: 'Kering Supply Chain Luxury',
    customHostname: 'esg-suppliers.kering.com',
    targetCname: 'cname.certiwatch.io',
    status: 'SSL_ACTIVE',
    sslStatus: 'ISSUED',
    verificationToken: 'cw-verify-kering-4c31e8',
    createdAt: '2026-09-20T11:15:00Z',
    lastVerifiedAt: '2026-10-04T07:30:00Z',
  },
  {
    id: 'cd-3',
    tenantId: 'tenant-biocoop-france',
    tenantName: 'Biocoop Réseau France',
    customHostname: 'fournisseurs.biocoop.fr',
    targetCname: 'cname.certiwatch.io',
    status: 'DNS_VERIFIED',
    sslStatus: 'PENDING',
    verificationToken: 'cw-verify-biocoop-7d20b4',
    createdAt: '2026-10-02T14:00:00Z',
    lastVerifiedAt: '2026-10-04T09:12:00Z',
  },
];

export const INITIAL_INFRA_NODES: InfraTopologyNode[] = [
  {
    id: 'node-edge-1',
    name: 'Google Cloud Anycast Global Edge & Cloud CDN',
    type: 'EDGE_CDN',
    region: 'Europe (Paris, Francfort, Londres, Amsterdam)',
    provider: 'Google Cloud Platform',
    status: 'OPERATIONAL',
    latencyMs: 14,
    uptimePercent: 99.99,
    complianceCert: 'ISO 27001 / SOC 1-2-3 / SecNumCloud Native',
  },
  {
    id: 'node-waf-1',
    name: 'Cloud Armor Enterprise WAF (DDoS L3/L4/L7 & OWASP)',
    type: 'WAF_ARMOR',
    region: 'europe-west2 / Multi-Zone',
    provider: 'Google Cloud Platform',
    status: 'OPERATIONAL',
    latencyMs: 4,
    uptimePercent: 100.0,
    complianceCert: 'ANSSI PDIS / BSI C5 / PCI-DSS Level 1',
  },
  {
    id: 'node-run-1',
    name: 'Google Cloud Run v2 (Serverless Microservices Cluster)',
    type: 'COMPUTE_RUN',
    region: 'europe-west2 (Londres) & europe-west9 (Paris)',
    provider: 'Google Cloud Platform',
    status: 'OPERATIONAL',
    latencyMs: 22,
    uptimePercent: 99.98,
    activeInstances: 4,
    complianceCert: 'SecNumCloud Ready / GDPR Sovereign Hosting',
  },
  {
    id: 'node-db-1',
    name: 'Neon Serverless PostgreSQL (Drizzle ORM Connection Pool)',
    type: 'DATABASE_NEON',
    region: 'europe-west2 (AWS / GCP Multi-AZ)',
    provider: 'Neon Inc.',
    status: 'OPERATIONAL',
    latencyMs: 136,
    uptimePercent: 99.95,
    complianceCert: 'SOC 2 Type II / HIPAA / ISO 27001',
  },
  {
    id: 'node-vault-1',
    name: 'Coffre-fort Numérique AES-256 (NF Z42-013 Probant)',
    type: 'STORAGE_VAULT',
    region: 'europe-west9 (France, Paris)',
    provider: 'Google Cloud Storage (SecNumCloud Anchor)',
    status: 'OPERATIONAL',
    latencyMs: 28,
    uptimePercent: 99.999,
    complianceCert: 'NF Z42-013 / eIDAS Qualified Timestamping',
  },
];

class InfraStore {
  private dnsRecords: DnsRecord[] = INITIAL_DNS_RECORDS;
  private sslInfo: SslTlsCertificateInfo = INITIAL_SSL_CERTIFICATE;
  private customDomains: CustomDomainMapping[] = INITIAL_CUSTOM_DOMAINS;
  private nodes: InfraTopologyNode[] = INITIAL_INFRA_NODES;
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

  public getDnsRecords(): DnsRecord[] {
    return [...this.dnsRecords];
  }

  public getSslInfo(): SslTlsCertificateInfo {
    return { ...this.sslInfo };
  }

  public getCustomDomains(): CustomDomainMapping[] {
    return [...this.customDomains];
  }

  public getTopology(): InfraTopologyNode[] {
    return [...this.nodes];
  }

  public testDnsResolution(recordId: string): { success: boolean; latencyMs: number; valueResolved: string } {
    const record = this.dnsRecords.find((r) => r.id === recordId);
    if (!record) return { success: false, latencyMs: 0, valueResolved: 'Not found' };

    record.lastCheckedAt = new Date().toISOString();
    record.status = 'ACTIVE_RESOLVED';
    this.notify();

    return {
      success: true,
      latencyMs: Math.floor(Math.random() * 25) + 12,
      valueResolved: record.value,
    };
  }

  public addCustomDomain(tenantId: string, tenantName: string, hostname: string): CustomDomainMapping {
    const cleanHost = hostname.trim().toLowerCase();
    const token = `cw-verify-${Math.random().toString(36).substring(2, 9)}`;

    const newDomain: CustomDomainMapping = {
      id: `cd-${Date.now()}`,
      tenantId,
      tenantName,
      customHostname: cleanHost,
      targetCname: 'cname.certiwatch.io',
      status: 'DNS_VERIFIED',
      sslStatus: 'ISSUED',
      verificationToken: token,
      createdAt: new Date().toISOString(),
      lastVerifiedAt: new Date().toISOString(),
    };

    this.customDomains.push(newDomain);
    this.notify();
    return newDomain;
  }

  public removeCustomDomain(id: string) {
    this.customDomains = this.customDomains.filter((d) => d.id !== id);
    this.notify();
  }
}

export const infraStore = new InfraStore();
