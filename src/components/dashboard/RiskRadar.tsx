import React from 'react';
import { AlertOctagon, ShieldAlert, ArrowRight, Ban, ExternalLink } from 'lucide-react';
import { Supplier } from '../../types/supplier';
import { Certificate } from '../../types/certificate';
import { CertificateStatusBadge } from '../ui/Badge';

interface RiskRadarProps {
  suppliers: Supplier[];
  certificates: Certificate[];
  onSelectSupplier: (supplierId: string) => void;
  onSelectCertificate: (certId: string) => void;
}

export function RiskRadar({
  suppliers,
  certificates,
  onSelectSupplier,
  onSelectCertificate,
}: RiskRadarProps) {
  // Find critical items: Revoked, Suspended, or Mismatched
  const criticalCerts = certificates.filter((c) =>
    ['REVOKED', 'SUSPENDED', 'MISMATCH'].includes(c.status)
  );

  const blockedSuppliers = suppliers.filter((s) => s.status === 'BLOCKED');

  return (
    <div className="rounded-xl border border-red-950/60 bg-gradient-to-b from-red-950/20 via-slate-900 to-slate-900 p-5 shadow-lg">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Radar des Risques & Blocages Achats</span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                {criticalCerts.length + blockedSuppliers.length} RISQUES CRITIQUES
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Certifications révoquées, suspendues ou non concordantes avec les registres officiels
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {criticalCerts.length === 0 && blockedSuppliers.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 border border-slate-800/80 rounded-lg bg-slate-950/30">
            Aucun risque critique détecté sur la base fournisseur active.
          </div>
        ) : (
          criticalCerts.map((cert) => {
            const supplier = suppliers.find((s) => s.id === cert.supplierId);
            return (
              <div
                key={cert.id}
                className="p-3.5 rounded-lg border border-red-900/40 bg-slate-950/70 hover:border-red-700/60 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CertificateStatusBadge status={cert.status} />
                    <span className="text-xs font-bold text-white tracking-wide">
                      {cert.standardLabel}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      N° {cert.certificateNumber}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">
                    Fournisseur :{' '}
                    <button
                      onClick={() => onSelectSupplier(cert.supplierId)}
                      className="font-semibold text-white hover:text-emerald-400 underline decoration-slate-600 underline-offset-2"
                    >
                      {cert.supplierName}
                    </button>
                    {supplier && ` (${supplier.country})`}
                  </p>

                  {cert.anomalies.length > 0 && (
                    <div className="text-[11px] text-red-300 bg-red-950/40 px-2.5 py-1 rounded border border-red-900/40 mt-1.5">
                      <strong>Anomalie officielle :</strong> {cert.anomalies[0].description}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {cert.officialRegistryUrl && (
                    <a
                      href={cert.officialRegistryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
                      title="Vérifier sur le registre officiel de l'organisme"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Source Officielle</span>
                    </a>
                  )}

                  <button
                    onClick={() => onSelectCertificate(cert.id)}
                    className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-1.5 border border-red-500/30 transition-colors"
                  >
                    <span>Inspecter</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
