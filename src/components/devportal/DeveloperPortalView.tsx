import React, { useState } from 'react';
import {
  Code2,
  Terminal,
  Download,
  Copy,
  Check,
  Play,
  Key,
  Shield,
  ShieldCheck,
  Globe,
  FileJson,
  Layers,
  Send,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Search,
} from 'lucide-react';
import { OPENAPI_ENDPOINTS, OPENAPI_V3_DOCUMENT } from '../../data/openApiSpec';
import { ApiEndpoint, CodeLanguage } from '../../types/openapi';
import { generateCodeSnippets } from '../../services/snippetGenerator';

export function DeveloperPortalView() {
  const [activeTab, setActiveTab] = useState<'explorer' | 'snippets' | 'webhooks_sec' | 'errors' | 'raw_spec'>('explorer');
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>(OPENAPI_ENDPOINTS[0].id);
  const [apiKey, setApiKey] = useState('cw_live_sk_8f92a10b4829ec7193bd720194aa82');
  const [selectedLang, setSelectedLang] = useState<CodeLanguage>('curl');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Sandbox state
  const [isExecuting, setIsExecuting] = useState(false);
  const [sandboxResponse, setSandboxResponse] = useState<any>(null);
  const [customRequestBody, setCustomRequestBody] = useState<string>('');

  // Selected endpoint
  const selectedEndpoint = OPENAPI_ENDPOINTS.find((e) => e.id === selectedEndpointId) || OPENAPI_ENDPOINTS[0];

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');
  const filteredEndpoints = OPENAPI_ENDPOINTS.filter(
    (e) =>
      e.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectEndpoint = (endpoint: ApiEndpoint) => {
    setSelectedEndpointId(endpoint.id);
    setSandboxResponse(null);
    if (endpoint.requestBodyExample) {
      setCustomRequestBody(JSON.stringify(endpoint.requestBodyExample, null, 2));
    } else {
      setCustomRequestBody('');
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExecuteSandbox = async () => {
    setIsExecuting(true);
    setSandboxResponse(null);

    const startTime = performance.now();

    try {
      let bodyData: any = undefined;
      if (customRequestBody.trim()) {
        try {
          bodyData = JSON.parse(customRequestBody);
        } catch (e) {
          bodyData = selectedEndpoint.requestBodyExample;
        }
      }

      // Route through local dev proxy
      const cleanPath = selectedEndpoint.path.replace('{id}', 'cert-1').replace('{gs1DigitalLink}', '01036000291452');
      const fetchOpts: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
      };

      if (bodyData && (selectedEndpoint.method === 'POST' || selectedEndpoint.method === 'PUT')) {
        fetchOpts.body = JSON.stringify(bodyData);
      }

      const res = await fetch(cleanPath, fetchOpts);
      const data = await res.json();
      const elapsed = Math.round(performance.now() - startTime);

      setSandboxResponse({
        status: res.status,
        statusText: res.statusText,
        durationMs: elapsed,
        data,
      });
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - startTime);
      // Fallback to documented response example
      setSandboxResponse({
        status: 200,
        statusText: 'OK (Mocked Sandbox Execution)',
        durationMs: elapsed || 18,
        data: selectedEndpoint.responseExamples[0]?.body,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const snippets = generateCodeSnippets(selectedEndpoint, apiKey, customRequestBody);
  const activeSnippet = snippets.find((s) => s.language === selectedLang) || snippets[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Code2 className="w-3.5 h-3.5" />
                Portail Développeur Public
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                OpenAPI 3.0.3
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                v1.4.2
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              Chantier : Portail Développeur Public & Spécification OpenAPI 3.0
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Documentation d'intégration interactive pour directions informatiques et intégrateurs ERP (SAP S/4HANA, Coupa, Ivalua, Celonis).
              Génération de snippets multi-langages, sandbox live et validation HMAC-SHA256.
            </p>
          </div>

          {/* Quick Downloads */}
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/openapi.json"
              download="certiwatch-openapi.json"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              openapi.json
            </a>
            <a
              href="/openapi.yaml"
              download="certiwatch-openapi.yaml"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              openapi.yaml
            </a>
            <a
              href="/certiwatch-postman-collection.json"
              download="certiwatch-postman-collection.json"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border border-orange-500/30 transition-colors"
            >
              <FileJson className="w-3.5 h-3.5" />
              Postman Collection
            </a>
          </div>
        </div>

        {/* Global API Key Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Key className="w-4 h-4 text-amber-400" />
            <span className="font-semibold">Clé d'API Active pour les Tests :</span>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500 w-72"
            />
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Base URL : <code className="text-white font-mono">https://api.certiwatch.io/v1</code></span>
            <span>Auth : <code className="text-emerald-400 font-mono">X-API-Key</code> ou <code className="text-purple-400 font-mono">Bearer JWT</code></span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('explorer')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'explorer'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Play className="w-4 h-4" />
          1. Explorateur d'API &amp; Sandbox Live
        </button>

        <button
          onClick={() => setActiveTab('snippets')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'snippets'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Code2 className="w-4 h-4" />
          2. Générateur de Code (5 Langages)
        </button>

        <button
          onClick={() => setActiveTab('webhooks_sec')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'webhooks_sec'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          3. Sécurité Webhooks &amp; HMAC-SHA256
        </button>

        <button
          onClick={() => setActiveTab('errors')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'errors'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          4. Codes d'Erreurs &amp; RFC 7807
        </button>

        <button
          onClick={() => setActiveTab('raw_spec')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'raw_spec'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileJson className="w-4 h-4" />
          5. Spécification Brute OpenAPI 3.0
        </button>
      </div>

      {/* Tab 1 : Explorer & Sandbox */}
      {activeTab === 'explorer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar : Endpoints List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Filtrer les endpoints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredEndpoints.map((ep) => {
                const isSelected = ep.id === selectedEndpoint.id;
                const methodColor =
                  ep.method === 'GET'
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    : ep.method === 'POST'
                    ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
                    : 'text-amber-400 bg-amber-500/10 border-amber-500/20';

                return (
                  <button
                    key={ep.id}
                    onClick={() => handleSelectEndpoint(ep)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/90 border-cyan-500/40 shadow-lg'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${methodColor}`}>
                        {ep.method}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 truncate">{ep.path}</span>
                    </div>
                    <div className="text-xs font-semibold text-white truncate">{ep.summary}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>{ep.tag}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Main : Endpoint Inspector & Sandbox Runner */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${
                      selectedEndpoint.method === 'GET'
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
                    }`}
                  >
                    {selectedEndpoint.method}
                  </span>
                  <span className="text-sm font-mono font-bold text-white">{selectedEndpoint.path}</span>
                </div>
                <h3 className="text-base font-bold text-white mt-1.5">{selectedEndpoint.summary}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedEndpoint.description}</p>
              </div>

              <button
                onClick={handleExecuteSandbox}
                disabled={isExecuting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950 transition-all shadow-lg shadow-cyan-600/20 cursor-pointer disabled:opacity-50 self-start"
              >
                {isExecuting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
                <span>Exécuter (Live Sandbox)</span>
              </button>
            </div>

            {/* Parameters & Body Inputs */}
            {selectedEndpoint.requestBodyExample && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Corps de la Requête (JSON Payload)</label>
                  <button
                    onClick={() =>
                      setCustomRequestBody(JSON.stringify(selectedEndpoint.requestBodyExample, null, 2))
                    }
                    className="text-[11px] text-cyan-400 hover:text-cyan-300"
                  >
                    Réinitialiser exemple
                  </button>
                </div>
                <textarea
                  rows={8}
                  value={customRequestBody || JSON.stringify(selectedEndpoint.requestBodyExample, null, 2)}
                  onChange={(e) => setCustomRequestBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
              </div>
            )}

            {/* Response Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>Réponse du Serveur (HTTP Response)</span>
                </h4>
                {sandboxResponse && (
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        sandboxResponse.status < 300
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {sandboxResponse.status} {sandboxResponse.statusText}
                    </span>
                    <span className="text-slate-400">{sandboxResponse.durationMs} ms</span>
                  </div>
                )}
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs overflow-x-auto max-h-80 text-slate-300 leading-relaxed">
                {sandboxResponse ? (
                  <pre>{JSON.stringify(sandboxResponse.data, null, 2)}</pre>
                ) : (
                  <div className="text-slate-500 italic py-6 text-center">
                    Cliquez sur "Exécuter (Live Sandbox)" pour lancer une requête en direct contre l'API CertiWatch.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2 : Code Snippets */}
      {activeTab === 'snippets' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase font-bold tracking-wider">
                Intégration Directe dans votre Système
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Snippets de Code Prêts pour la Production
              </h3>
              <p className="text-xs text-slate-400">
                Génération instantanée pour l'endpoint <code>{selectedEndpoint.path}</code> ({selectedEndpoint.summary}).
              </p>
            </div>

            {/* Language Picker */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              {snippets.map((snip) => (
                <button
                  key={snip.language}
                  onClick={() => setSelectedLang(snip.language)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedLang === snip.language
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {snip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Code Viewer */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 relative">
            <button
              onClick={() => handleCopy(activeSnippet.code, 'snippet')}
              className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
            >
              {copiedKey === 'snippet' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copié !
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copier le code
                </>
              )}
            </button>
            <pre className="text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-[500px] pt-2">
              {activeSnippet.code}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 3 : Webhook Security */}
      {activeTab === 'webhooks_sec' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Validation Cryptographique des Webhooks Sortants
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pour chaque événement transmis à votre ERP (révocation de certification, blocage de commande),
              CertiWatch inclut un en-tête <code className="text-emerald-400">X-CertiWatch-Signature: sha256=...</code> calculé avec votre clé secrète partagée.
            </p>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-semibold text-white">1. En-têtes HTTP Reçus</span>
                <pre className="font-mono text-[11px] text-cyan-400 mt-1">
                  X-CertiWatch-Signature: sha256=9f82a10b48...{'\n'}
                  X-CertiWatch-Event: certificate.expired{'\n'}
                  Content-Type: application/json
                </pre>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-semibold text-white">2. Comparaison en Temps Constant</span>
                <p className="text-slate-400 text-[11px]">
                  Utilisez toujours une fonction de comparaison en temps constant (ex. <code>crypto.timingSafeEqual</code>) pour vous prémunir contre les attaques temporelles (*timing attacks*).
                </p>
              </div>
            </div>
          </div>

          {/* Code verification implementation */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              Exemple de Vérification Node.js / Express
            </h4>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
              <pre>{`const crypto = require('crypto');

function verifyCertiWatchWebhook(req, secretKey) {
  const signature = req.headers['x-certiwatch-signature'];
  if (!signature) return false;

  const rawBody = JSON.stringify(req.body);
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secretKey)
    .update(rawBody)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}`}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4 : RFC 7807 Errors */}
      {activeTab === 'errors' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Conformité aux Erreurs Standardisées (RFC 7807 Problem Details)</h3>
            <p className="text-xs text-slate-400 mt-1">
              Toutes les erreurs renvoyées par l'API respectent la spécification RFC 7807 avec le type MIME <code>application/problem+json</code>.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Code HTTP</th>
                  <th className="py-3 px-4">Type RFC 7807</th>
                  <th className="py-3 px-4">Titre &amp; Description</th>
                  <th className="py-3 px-4">Action Recommandée</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                <tr>
                  <td className="py-3 px-4 text-emerald-400 font-bold">200 / 201</td>
                  <td className="py-3 px-4 text-slate-400">urn:certiwatch:status:ok</td>
                  <td className="py-3 px-4 text-white font-sans">Opération réussie.</td>
                  <td className="py-3 px-4 text-slate-400 font-sans">Traiter le résultat.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-amber-400 font-bold">400 Bad Request</td>
                  <td className="py-3 px-4 text-slate-400">urn:certiwatch:error:invalid_params</td>
                  <td className="py-3 px-4 text-white font-sans">Format JSON ou paramètres requis manquants.</td>
                  <td className="py-3 px-4 text-slate-400 font-sans">Vérifier le schéma selon openapi.json.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-red-400 font-bold">401 Unauthorized</td>
                  <td className="py-3 px-4 text-slate-400">urn:certiwatch:error:missing_api_key</td>
                  <td className="py-3 px-4 text-white font-sans">Clé d'API absente ou jeton JWT expiré.</td>
                  <td className="py-3 px-4 text-slate-400 font-sans">Injecter l'en-tête X-API-Key.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-purple-400 font-bold">403 Forbidden</td>
                  <td className="py-3 px-4 text-slate-400">urn:certiwatch:error:matrix_blocked</td>
                  <td className="py-3 px-4 text-white font-sans">Bon de commande d'achat bloqué par la matrice.</td>
                  <td className="py-3 px-4 text-slate-400 font-sans">Consulter la liste des normes manquantes.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-cyan-400 font-bold">429 Too Many Requests</td>
                  <td className="py-3 px-4 text-slate-400">urn:certiwatch:error:rate_limit_exceeded</td>
                  <td className="py-3 px-4 text-white font-sans">Dépassement du quota (100 req/s par organisation).</td>
                  <td className="py-3 px-4 text-slate-400 font-sans">Appliquer un backoff exponentiel.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5 : Raw Spec */}
      {activeTab === 'raw_spec' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Document OpenAPI 3.0.3 Formaté</h3>
              <p className="text-xs text-slate-400">Compatible avec Swagger UI, Stoplight, Redoc et Postman.</p>
            </div>
            <button
              onClick={() => handleCopy(JSON.stringify(OPENAPI_V3_DOCUMENT, null, 2), 'raw_spec')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              {copiedKey === 'raw_spec' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              Copier JSON
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-cyan-300 max-h-[500px] overflow-y-auto leading-relaxed">
            <pre>{JSON.stringify(OPENAPI_V3_DOCUMENT, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
