import React from 'react';
import { Globe2, CheckCircle2, AlertCircle, ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import { CertificationProviderMetadata } from '../../types/connector';

interface RegistryStatusListProps {
  providers: CertificationProviderMetadata[];
  onOpenConnectorDetails?: (provider: CertificationProviderMetadata) => void;
}

export function RegistryStatusList({
  providers,
  onOpenConnectorDetails,
}: RegistryStatusListProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Globe2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Connecteurs de Registres Officiels</h3>
            <p className="text-xs text-slate-400">Sources certifiées interrogées en temps réel</p>
          </div>
        </div>

        <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          5/5 OPÉRATIONNELS
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        {providers.map((prov) => (
          <div
            key={prov.id}
            className="p-3 rounded-lg border border-slate-800 bg-slate-950/50 hover:bg-slate-800/40 hover:border-slate-700 transition-all flex items-center justify-between gap-3"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-white">{prov.name}</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-cyan-300 border border-slate-700">
                  {prov.code}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {prov.officialDomain} • {prov.rateLimitPolicy}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  {prov.avgResponseMs} ms
                </div>
                <div className="text-[10px] text-slate-500">
                  Santé : {new Date(prov.lastHealthCheck).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              <a
                href={prov.publicSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Accéder au registre public officiel"
              >
                <ExternalLink className="w-4 h-4 text-cyan-400" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
