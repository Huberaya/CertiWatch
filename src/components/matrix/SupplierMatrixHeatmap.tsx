import React from 'react';
import { Supplier } from '../../types/supplier';
import { ComplianceMatrixRule, SupplierMatrixComplianceSummary } from '../../types/matrix';
import { Certificate } from '../../types/certificate';
import { CheckCircle2, XCircle, AlertTriangle, Minus, HelpCircle, ShieldCheck } from 'lucide-react';

interface SupplierMatrixHeatmapProps {
  suppliers: Supplier[];
  rules: ComplianceMatrixRule[];
  certificates: Certificate[];
  summaries: SupplierMatrixComplianceSummary[];
}

export function SupplierMatrixHeatmap({
  suppliers,
  rules,
  certificates,
  summaries,
}: SupplierMatrixHeatmapProps) {
  // Compute category coverage for each supplier
  const checkSupplierCategory = (supplierId: string, rule: ComplianceMatrixRule) => {
    const validCerts = certificates.filter(
      (c) => c.supplierId === supplierId && c.status === 'VALID'
    );
    const supplier = suppliers.find((s) => s.id === supplierId);
    if (!supplier) return { status: 'NOT_CONCERNED', label: 'Non concerné' };

    const allowed = [...rule.requiredStandards, ...rule.acceptableAlternativeStandards];
    const matchingCert = validCerts.find((c) => allowed.includes(c.certificationStandard));

    const isRevoked = certificates.some(
      (c) => c.supplierId === supplierId && c.status === 'REVOKED'
    );

    if (isRevoked) {
      return { status: 'REVOKED', label: 'Révocation critique' };
    }

    if (matchingCert) {
      return {
        status: 'COMPLIANT',
        label: `${matchingCert.standardLabel} (Valide)`,
        certNumber: matchingCert.certificateNumber,
      };
    }

    const hasExpiredOrExpiring = certificates.find(
      (c) =>
        c.supplierId === supplierId &&
        allowed.includes(c.certificationStandard) &&
        (c.status === 'EXPIRED' || c.status === 'EXPIRING_SOON')
    );

    if (hasExpiredOrExpiring) {
      return {
        status: hasExpiredOrExpiring.status === 'EXPIRED' ? 'EXPIRED' : 'EXPIRING',
        label: `${hasExpiredOrExpiring.standardLabel} (${hasExpiredOrExpiring.status})`,
      };
    }

    return {
      status: 'MISSING',
      label: `Requis : ${rule.requiredStandards.join(', ')}`,
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Matrice Croisée Fournisseurs × Familles d'Achat</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit de couverture en temps réel des exigences de certification pour chaque fournisseur actif
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Conforme</span>
          </span>
          <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Échéance / Dérogation</span>
          </span>
          <span className="flex items-center gap-1.5 text-red-400 font-semibold">
            <XCircle className="w-3.5 h-3.5" />
            <span>Non-conforme / Révocation</span>
          </span>
        </div>
      </div>

      {/* Heatmap Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-300 font-semibold">
              <th className="p-3.5 sticky left-0 z-10 bg-slate-900 min-w-[220px]">
                Fournisseur Sous Contrat
              </th>
              <th className="p-3 text-center min-w-[110px]">Statut Global</th>
              {rules.map((rule) => (
                <th key={rule.id} className="p-3 min-w-[180px] max-w-[240px]">
                  <div className="font-bold text-slate-200">{rule.productCategory}</div>
                  <div className="text-[10px] text-teal-400 font-mono mt-0.5">
                    {rule.requiredStandards.join(', ')}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {suppliers.map((sup) => {
              const summary = summaries.find((s) => s.supplierId === sup.id);

              return (
                <tr key={sup.id} className="hover:bg-slate-900/40 transition-colors">
                  {/* Supplier info column */}
                  <td className="p-3.5 sticky left-0 z-10 bg-slate-950 hover:bg-slate-900/90 transition-colors">
                    <div className="font-bold text-slate-100">{sup.legalName}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono">{sup.countryCode}</span>
                      <span>•</span>
                      <span>{sup.tier || 'TIER_1'}</span>
                      {sup.status === 'BLOCKED' && (
                        <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/30 font-bold text-[9px]">
                          ERP BLOQUÉ
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Summary Status */}
                  <td className="p-3 text-center">
                    {summary?.status === 'FULLY_COMPLIANT' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        100% Conforme
                      </span>
                    )}
                    {summary?.status === 'PARTIALLY_COMPLIANT' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Partiel
                      </span>
                    )}
                    {summary?.status === 'CRITICAL_NON_COMPLIANT' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                        À Risque
                      </span>
                    )}
                  </td>

                  {/* Cell for each rule */}
                  {rules.map((rule) => {
                    const result = checkSupplierCategory(sup.id, rule);

                    return (
                      <td key={rule.id} className="p-2.5">
                        {result.status === 'COMPLIANT' && (
                          <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                              <div className="font-semibold leading-tight">{result.label}</div>
                              {result.certNumber && (
                                <div className="text-[10px] text-emerald-400/80 font-mono">
                                  {result.certNumber}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {result.status === 'EXPIRING' && (
                          <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-300 text-[11px] flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <div className="font-semibold leading-tight">{result.label}</div>
                              <div className="text-[10px] text-amber-400/80">Sous 30/60j</div>
                            </div>
                          </div>
                        )}

                        {(result.status === 'EXPIRED' || result.status === 'REVOKED') && (
                          <div className="p-2 rounded-lg bg-red-950/30 border border-red-500/30 text-red-300 text-[11px] flex items-start gap-1.5">
                            <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                            <div>
                              <div className="font-semibold leading-tight">{result.label}</div>
                              <div className="text-[10px] text-red-400 font-bold uppercase">
                                {result.status === 'REVOKED' ? 'Bloqué ERP' : 'Expiré'}
                              </div>
                            </div>
                          </div>
                        )}

                        {result.status === 'MISSING' && (
                          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-500 text-[11px] flex items-start gap-1.5">
                            <Minus className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
                            <div>
                              <div className="text-[10px] text-slate-400">Non couvert</div>
                              <div className="text-[9px] text-slate-500 font-mono">
                                {result.label}
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
