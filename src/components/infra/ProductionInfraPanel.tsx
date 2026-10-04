import React, { useState, useEffect } from 'react';
import {
  Globe,
  Server,
  Shield,
  ShieldCheck,
  Lock,
  Cpu,
  Database,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Download,
  Terminal,
  Activity,
  Layers,
  Sparkles,
  Zap,
  ArrowRight,
  Clock,
  Key,
} from 'lucide-react';
import { DnsRecord, SslTlsCertificateInfo, CustomDomainMapping, InfraTopologyNode } from '../../types/infra';
import { infraStore } from '../../db/infraStore';

export function ProductionInfraPanel() {
  const [activeTab, setActiveTab] = useState<'topology' | 'dns' | 'ssl' | 'custom_domains' | 'iac'>('topology');
  const [dnsRecords, setDnsRecords] = useState<DnsRecord[]>([]);
  const [sslInfo, setSslInfo] = useState<SslTlsCertificateInfo | null>(null);
  const [customDomains, setCustomDomains] = useState<CustomDomainMapping[]>([]);
  const [nodes, setNodes] = useState<InfraTopologyNode[]>([]);
  const [testingRecordId, setTestingRecordId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; latencyMs: number; value: string } | null>(null);

  // New custom domain form
  const [showAddDomainModal, setShowAddDomainModal] = useState(false);
  const [newHostname, setNewHostname] = useState('');
  const [selectedTenantName, setSelectedTenantName] = useState('Danone Quality & Sourcing');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Selected IaC file
  const [selectedIacFile, setSelectedIacFile] = useState<'docker' | 'cloudrun' | 'nginx' | 'terraform' | 'zone'>('terraform');

  const refreshData = () => {
    setDnsRecords(infraStore.getDnsRecords());
    setSslInfo(infraStore.getSslInfo());
    setCustomDomains(infraStore.getCustomDomains());
    setNodes(infraStore.getTopology());
  };

  useEffect(() => {
    refreshData();
    const unsub = infraStore.subscribe(refreshData);
    return () => unsub();
  }, []);

  const handleTestDns = (record: DnsRecord) => {
    setTestingRecordId(record.id);
    setTestResult(null);

    setTimeout(() => {
      const res = infraStore.testDnsResolution(record.id);
      setTestResult({
        id: record.id,
        latencyMs: res.latencyMs,
        value: res.valueResolved,
      });
      setTestingRecordId(null);
    }, 600);
  };

  const handleCreateCustomDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHostname.trim()) return;

    infraStore.addCustomDomain(
      'tenant_active',
      selectedTenantName,
      newHostname.trim()
    );

    setNewHostname('');
    setShowAddDomainModal(false);
  };

  const handleDeleteCustomDomain = (id: string) => {
    infraStore.removeCustomDomain(id);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const iacCodeSnippets = {
    terraform: `# Terraform Google Cloud Run & Cloud DNS
resource "google_dns_managed_zone" "certiwatch_zone" {
  name        = "certiwatch-zone-public"
  dns_name    = "certiwatch.io."
  visibility  = "public"
  dnssec_config {
    state         = "on"
    non_existence = "nsec3"
  }
}

resource "google_dns_record_set" "app_cname" {
  name         = "app.certiwatch.io."
  managed_zone = google_dns_managed_zone.certiwatch_zone.name
  type         = "CNAME"
  ttl          = 300
  rrdatas      = ["ghs.googlehosted.com."]
}

resource "google_certificate_manager_certificate" "wildcard_cert" {
  name        = "certiwatch-wildcard-cert"
  managed {
    domains = ["certiwatch.io", "*.certiwatch.io"]
  }
}`,
    docker: `# Multi-stage hardened production Dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000
RUN adduser --system --uid 1001 certiwatch
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
USER certiwatch
EXPOSE 3000
HEALTHCHECK CMD wget --spider http://127.0.0.1:3000/api/neon/health || exit 1
CMD ["node", "--loader", "tsx", "server.ts"]`,
    cloudrun: `apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: certiwatch-enterprise-app
  annotations:
    run.googleapis.com/ingress: all
    run.googleapis.com/custom-domains: 'app.certiwatch.io,api.certiwatch.io'
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: '1'
        autoscaling.knative.dev/maxScale: '100'
        run.googleapis.com/startup-cpu-boost: 'true'
    spec:
      containerConcurrency: 80
      containers:
        - image: europe-west2-docker.pkg.dev/certiwatch-prod/app:latest
          resources: { limits: { cpu: '2000m', memory: '1Gi' } }`,
    nginx: `server {
    listen 443 ssl http2;
    server_name app.certiwatch.io;
    ssl_protocols TLSv1.3 TLSv1.2;
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_stapling on;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
    }
}`,
    zone: `$ORIGIN certiwatch.io.
$TTL 300
@   IN  SOA ns-cloud-c1.googledomains.com. cloud-dns-admin.google.com. (2026100401 21600 3600 1209600 300)
@   IN  A     216.239.32.21
@   IN  A     216.239.34.21
@   IN  AAAA  2001:4860:4802:32::15
app IN  CNAME ghs.googlehosted.com.
api IN  CNAME ghs.googlehosted.com.
@   IN  CAA   0 issue "pki.goog"
@   IN  TXT   "v=spf1 include:_spf.google.com ~all"
_dmarc IN TXT "v=DMARC1; p=reject; pct=100;"`,
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Infrastructure Haute Disponibilité (SLA 99.98%)
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                <Globe className="w-3 h-3 text-cyan-400" />
                certiwatch.io
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                <Lock className="w-3 h-3 text-emerald-400" />
                DNSSEC & HSTS Preload
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-400" />
              Chantier : Infrastructure de Production, Domaine & DNS
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Architecture multi-zone européenne (Londres & Paris) déployée sur Google Cloud Run, Cloud DNS 
              autoritaire NSEC3, reverse-proxy NGINX TLS 1.3, et passerelle de domaines personnalisés white-label.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddDomainModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Associer un Domaine White-Label
            </button>
          </div>
        </div>

        {/* Global Infra Health Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/60">
            <div className="text-xs text-slate-400 font-medium">Domaine Primaire</div>
            <div className="text-lg font-bold text-white mt-1 font-mono truncate">app.certiwatch.io</div>
            <div className="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1">
              <Check className="w-3 h-3" /> Anycast 216.239.32.21
            </div>
          </div>
          <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/60">
            <div className="text-xs text-slate-400 font-medium">Chiffrement TLS & SSL</div>
            <div className="text-lg font-bold text-emerald-400 mt-1 font-mono">TLS 1.3 (Grade A+)</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Renouvellement auto dans 57j</div>
          </div>
          <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/60">
            <div className="text-xs text-slate-400 font-medium">Zone Cloud DNS</div>
            <div className="text-lg font-bold text-indigo-400 mt-1 font-mono">10 Enregistrements</div>
            <div className="text-[11px] text-slate-400 mt-0.5">DNSSEC Actif / RFC 1035</div>
          </div>
          <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/60">
            <div className="text-xs text-slate-400 font-medium">Domaines White-Label</div>
            <div className="text-lg font-bold text-purple-400 mt-1 font-mono">
              {customDomains.length} Actifs
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Danone, Kering, Biocoop</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('topology')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'topology'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          1. Architecture & Topologie Cloud (5 Nœuds)
        </button>

        <button
          onClick={() => setActiveTab('dns')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'dns'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Globe className="w-4 h-4" />
          2. Matrice DNS & Diagnostics ({dnsRecords.length})
        </button>

        <button
          onClick={() => setActiveTab('ssl')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'ssl'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Lock className="w-4 h-4" />
          3. Certificats SSL / TLS 1.3
        </button>

        <button
          onClick={() => setActiveTab('custom_domains')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'custom_domains'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          4. Domaines White-Label ({customDomains.length})
        </button>

        <button
          onClick={() => setActiveTab('iac')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'iac'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Terminal className="w-4 h-4" />
          5. Fichiers Infrastructure as Code (IaC)
        </button>
      </div>

      {/* Tab 1 : Topology */}
      {activeTab === 'topology' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>
                Flux opérationnel : <strong>Anycast Edge CDN</strong> ➔ <strong>Cloud Armor WAF</strong> ➔ <strong>Google Cloud Run</strong> ➔ <strong>Neon PostgreSQL & Vault AES-256</strong>
              </span>
            </div>
            <span className="text-emerald-400 font-mono font-bold">Latency Global &lt; 30ms</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nodes.map((node, i) => (
              <div
                key={node.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all space-y-4 relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight">{node.name}</h4>
                      <p className="text-xs text-slate-400">{node.provider}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {node.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Région Cloud</span>
                    <span className="text-white font-medium">{node.region}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Disponibilité (Uptime)</span>
                    <span className="text-emerald-400 font-mono font-bold">{node.uptimePercent}%</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Latence constatée</span>
                    <span className="text-cyan-400 font-mono font-bold">{node.latencyMs} ms</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">{node.complianceCert}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2 : DNS Matrix */}
      {activeTab === 'dns' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Zone DNS autoritaire publique <code>certiwatch.io.</code> hébergée sur Google Cloud DNS avec signature DNSSEC NSEC3.
            </p>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>TTL par défaut : 300s (5 min)</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Nom / Hôte</th>
                    <th className="py-3 px-4">Valeur Cible</th>
                    <th className="py-3 px-4">TTL</th>
                    <th className="py-3 px-4">DNSSEC</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4 text-right">Diagnostic Live</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {dnsRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {rec.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-white">{rec.name}</td>
                      <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={rec.value}>
                        {rec.value}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{rec.ttl}s</td>
                      <td className="py-3 px-4">
                        {rec.dnssecValidated ? (
                          <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                            <Check className="w-3 h-3" /> Validé
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-sans">
                        <button
                          onClick={() => handleTestDns(rec)}
                          disabled={testingRecordId === rec.id}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {testingRecordId === rec.id ? (
                            <RefreshCw className="w-3 h-3 animate-spin inline" />
                          ) : (
                            'Tester Résolution'
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {testResult && (
            <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 text-xs text-slate-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Résolution confirmée pour <strong>{dnsRecords.find((r) => r.id === testResult.id)?.fullDomain}</strong> : valeur renvoyée <code>{testResult.value}</code>
                </span>
              </div>
              <span className="text-cyan-400 font-mono font-bold">Temps de réponse : {testResult.latencyMs} ms</span>
            </div>
          )}
        </div>
      )}

      {/* Tab 3 : SSL Certificate */}
      {activeTab === 'ssl' && sslInfo && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-emerald-400 uppercase font-bold tracking-wider">
                  Certificat X.509 Managé Cloud
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">{sslInfo.domain}</h3>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-4 h-4" /> Qualys SSL Labs Grade {sslInfo.qualysGrade}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400">Autorité de Certification (Émetteur)</span>
                <p className="text-white font-medium">{sslInfo.issuer}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400">Protocole & Suite de Chiffrement</span>
                <p className="text-emerald-400 font-mono font-semibold">{sslInfo.tlsVersion} — {sslInfo.cipherSuite}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400">Période de Validité</span>
                <p className="text-slate-300 font-mono">{sslInfo.validFrom.split('T')[0]} ➔ {sslInfo.validTo.split('T')[0]}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400">Renouvellement Automatique</span>
                <p className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Actif (dans {sslInfo.daysRemaining} jours via ACME Google Trust)
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400">Strict-Transport-Security (HSTS)</span>
                <p className="text-cyan-400 font-mono">max-age={sslInfo.hstsMaxAgeSeconds}s (Preload éligible)</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400">Fonctionnalités Avancées</span>
                <p className="text-slate-300">OCSP Stapling (Oui) · ALPN: {sslInfo.alpnProtocols.join(', ')}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 font-medium">Noms Alternatifs du Sujet (SANs inclus) :</span>
              <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                {sslInfo.subjectAlternativeNames.map((san) => (
                  <span key={san} className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
                    {san}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Security Compliance Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              Conformité ANSSI & Chiffrement
            </h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="font-semibold text-white flex items-center justify-between">
                  <span>PFS (Perfect Forward Secrecy)</span>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-[11px] text-slate-400">Échange de clés éphémères X25519 pour chaque session TLS.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="font-semibold text-white flex items-center justify-between">
                  <span>Désactivation TLS 1.0 & 1.1</span>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-[11px] text-slate-400">Rejet des chiffrements obsolètes (CBC, 3DES, RC4).</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="font-semibold text-white flex items-center justify-between">
                  <span>En-tête HSTS Preload</span>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-[11px] text-slate-400">Forçage HTTPS matériel dans tous les navigateurs modernes.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4 : Custom Domains (White-Label) */}
      {activeTab === 'custom_domains' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Permet aux clients grands comptes (Danone, Kering, Biocoop) d'accéder au portail avec leur propre nom de domaine d'entreprise.
            </p>
            <button
              onClick={() => setShowAddDomainModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Nouveau Domaine
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {customDomains.map((cd) => (
              <div
                key={cd.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all space-y-4 relative"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-mono text-indigo-400 font-bold uppercase">{cd.tenantName}</span>
                    <h4 className="text-sm font-bold text-white font-mono mt-0.5">{cd.customHostname}</h4>
                  </div>
                  <button
                    onClick={() => handleDeleteCustomDomain(cd.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors p-1"
                    title="Dissocier"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Cible CNAME</span>
                    <span className="text-slate-200 font-mono">{cd.targetCname}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Statut DNS</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> {cd.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Certificat TLS</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> {cd.sslStatus}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span className="truncate">Token : {cd.verificationToken}</span>
                  <button
                    onClick={() => handleCopy(cd.verificationToken, cd.id)}
                    className="text-indigo-400 hover:text-indigo-300 shrink-0 ml-2"
                  >
                    {copiedText === cd.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5 : Infrastructure as Code */}
      {activeTab === 'iac' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            {[
              { id: 'terraform', label: 'Terraform (main.tf)', icon: Terminal },
              { id: 'cloudrun', label: 'Cloud Run (service.yaml)', icon: Cpu },
              { id: 'docker', label: 'Dockerfile (Alpine)', icon: Server },
              { id: 'nginx', label: 'NGINX (nginx.conf)', icon: Shield },
              { id: 'zone', label: 'Zone DNS (RFC 1035)', icon: Globe },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedIacFile(f.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedIacFile === f.id
                    ? 'bg-slate-800 text-indigo-400 border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <f.icon className="w-3.5 h-3.5" />
                {f.label}
              </button>
            ))}
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 relative">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800/80">
              <span className="text-xs font-mono text-slate-400">
                Fichier de configuration prêt pour déploiement production
              </span>
              <button
                onClick={() => handleCopy(iacCodeSnippets[selectedIacFile], selectedIacFile)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
              >
                {copiedText === selectedIacFile ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Copié !
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copier le code
                  </>
                )}
              </button>
            </div>
            <pre className="text-xs font-mono text-slate-300 overflow-x-auto max-h-96 leading-relaxed">
              {iacCodeSnippets[selectedIacFile]}
            </pre>
          </div>
        </div>
      )}

      {/* Modal: Add Custom White-label Domain */}
      {showAddDomainModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-400" />
                Ajouter un Domaine Personnalisé (White-Label)
              </h3>
              <button
                onClick={() => setShowAddDomainModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomDomain} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Organisation / Tenant</label>
                <select
                  value={selectedTenantName}
                  onChange={(e) => setSelectedTenantName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Danone Quality & Sourcing">Danone Quality & Sourcing</option>
                  <option value="Kering Supply Chain Luxury">Kering Supply Chain Luxury</option>
                  <option value="Biocoop Réseau France">Biocoop Réseau France</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Nom d'hôte FQDN souhaité</label>
                <input
                  type="text"
                  placeholder="ex: compliance.mon-entreprise.com"
                  value={newHostname}
                  onChange={(e) => setNewHostname(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 space-y-1.5">
                <div className="font-semibold flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5" /> Instruction DNS Registrar
                </div>
                <p className="text-[11px] text-slate-400">
                  Après création, créez un enregistrement <code>CNAME</code> chez votre registrar pointant vers{' '}
                  <strong className="text-white font-mono">cname.certiwatch.io</strong>. Le certificat TLS 1.3 sera émis automatiquement sous 15 minutes.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddDomainModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  Valider & Provisionner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
