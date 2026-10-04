export type DnsRecordType = 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'CAA' | 'MX' | 'NS';

export type DnsRecordStatus = 'ACTIVE_RESOLVED' | 'PROPAGATING' | 'MISMATCH' | 'ERROR';

export interface DnsRecord {
  id: string;
  name: string; // e.g. "app", "@", "_dmarc"
  fullDomain: string; // e.g. "app.certiwatch.io"
  type: DnsRecordType;
  value: string; // e.g. "216.239.32.21" or "ghs.googlehosted.com."
  ttl: number; // seconds, e.g. 300 or 3600
  status: DnsRecordStatus;
  purpose: string;
  dnssecValidated: boolean;
  lastCheckedAt: string;
}

export interface SslTlsCertificateInfo {
  domain: string;
  issuer: string; // e.g. "Google Trust Services LLC (GTS CA 1D4)" or "Let's Encrypt"
  subjectAlternativeNames: string[];
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  autoRenewEnabled: boolean;
  tlsVersion: 'TLS 1.3' | 'TLS 1.2';
  cipherSuite: string;
  hstsEnabled: boolean;
  hstsMaxAgeSeconds: number;
  ocspStapling: boolean;
  alpnProtocols: string[]; // ['h2', 'http/1.1']
  qualysGrade: 'A+' | 'A';
}

export interface CustomDomainMapping {
  id: string;
  tenantId: string;
  tenantName: string;
  customHostname: string; // e.g. "compliance.danone.com"
  targetCname: string; // "cname.certiwatch.io"
  status: 'PROVISIONING' | 'DNS_VERIFIED' | 'SSL_ACTIVE' | 'FAILED';
  sslStatus: 'PENDING' | 'ISSUED' | 'FAILED';
  verificationToken: string;
  createdAt: string;
  lastVerifiedAt?: string;
}

export interface InfraTopologyNode {
  id: string;
  name: string;
  type: 'EDGE_CDN' | 'WAF_ARMOR' | 'LOAD_BALANCER' | 'COMPUTE_RUN' | 'DATABASE_NEON' | 'STORAGE_VAULT';
  region: string;
  provider: string; // "Google Cloud", "Neon", "Cloudflare"
  status: 'OPERATIONAL' | 'DEGRADED' | 'MAINTENANCE';
  latencyMs: number;
  uptimePercent: number;
  activeInstances?: number;
  complianceCert: string; // e.g. "ISO 27001 / SOC 2 / SecNumCloud"
}
