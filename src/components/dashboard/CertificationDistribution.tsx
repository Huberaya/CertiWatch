import React from 'react';
import { Layers, PieChart } from 'lucide-react';
import { Certificate, CertificationStandard } from '../../types/certificate';

interface CertificationDistributionProps {
  certificates: Certificate[];
}

export function CertificationDistribution({ certificates }: CertificationDistributionProps) {
  const standards: { code: CertificationStandard; label: string; color: string }[] = [
    { code: 'ECOCERT_BIO', label: 'Ecocert Bio (FR/TR/PE)', color: 'bg-emerald-500' },
    { code: 'GOTS', label: 'GOTS (Coton bio)', color: 'bg-teal-400' },
    { code: 'FSC', label: 'FSC (Bois & Carton)', color: 'bg-green-600' },
    { code: 'OEKO_TEX_100', label: 'OEKO-TEX Std 100', color: 'bg-cyan-500' },
    { code: 'FAIRTRADE', label: 'Fairtrade / FLOCERT', color: 'bg-amber-500' },
  ];

  const total = certificates.length;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Répartition par Standard de Certification</h3>
            <p className="text-xs text-slate-400">Ventilation du portefeuille de certificats</p>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {standards.map((s) => {
          const count = certificates.filter(
            (c) => c.certificationStandard === s.code
          ).length;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <div key={s.code} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-300">{s.label}</span>
                <span className="font-mono text-slate-400">
                  {count} ({pct}%)
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${s.color} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
