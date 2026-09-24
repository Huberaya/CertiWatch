import React from 'react';
import { CalendarClock, AlertCircle, ArrowRight } from 'lucide-react';
import { Certificate } from '../../types/certificate';

interface ExpirationTimelineProps {
  certificates: Certificate[];
  onSelectHorizon?: (horizon: '30' | '60' | '90') => void;
}

export function ExpirationTimeline({ certificates, onSelectHorizon }: ExpirationTimelineProps) {
  const today = new Date('2026-09-24T00:00:00Z');

  let expiredCount = 0;
  let under30Count = 0;
  let between30And60Count = 0;
  let between60And90Count = 0;
  let beyond90Count = 0;

  certificates.forEach((c) => {
    const exp = new Date(c.expiryDate);
    const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) {
      expiredCount++;
    } else if (diffDays <= 30) {
      under30Count++;
    } else if (diffDays <= 60) {
      between30And60Count++;
    } else if (diffDays <= 90) {
      between60And90Count++;
    } else {
      beyond90Count++;
    }
  });

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <CalendarClock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Échéancier & Horizons d’Expiration</h3>
            <p className="text-xs text-slate-400">Anticipation des renouvellements annuels d'audits</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-300">Échus / Expirés</span>
            <span className="text-lg font-bold text-rose-400 font-mono">{expiredCount}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Arrêt immédiat requis</p>
        </div>

        <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300">&lt; 30 jours</span>
            <span className="text-lg font-bold text-amber-400 font-mono">{under30Count}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Dossier en urgence</p>
        </div>

        <div className="p-3 rounded-lg bg-yellow-950/20 border border-yellow-900/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-yellow-300">30 à 60 jours</span>
            <span className="text-lg font-bold text-yellow-400 font-mono">{between30And60Count}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Relance fournisseur</p>
        </div>

        <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-300">&gt; 90 jours</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">{beyond90Count}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Validité sécurisée</p>
        </div>
      </div>
    </div>
  );
}
