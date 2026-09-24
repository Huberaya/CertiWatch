import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'purple' | 'cyan';
  trend?: {
    value: string;
    positive: boolean;
  };
  onClick?: () => void;
  active?: boolean;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = 'default',
  trend,
  onClick,
  active,
}: MetricCardProps) {
  const toneStyles = {
    default: 'bg-slate-900/80 border-slate-800 text-slate-100 hover:border-slate-700',
    success: 'bg-emerald-950/30 border-emerald-800/40 text-emerald-100 hover:border-emerald-600/50',
    warning: 'bg-amber-950/30 border-amber-800/40 text-amber-100 hover:border-amber-600/50',
    danger: 'bg-rose-950/30 border-rose-800/40 text-rose-100 hover:border-rose-600/50',
    purple: 'bg-purple-950/30 border-purple-800/40 text-purple-100 hover:border-purple-600/50',
    cyan: 'bg-cyan-950/30 border-cyan-800/40 text-cyan-100 hover:border-cyan-600/50',
  }[tone];

  const iconColors = {
    default: 'text-slate-400 bg-slate-800/80 border-slate-700',
    success: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    warning: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    danger: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  }[tone];

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border transition-all relative overflow-hidden backdrop-blur-sm ${toneStyles} ${
        onClick ? 'cursor-pointer hover:shadow-lg' : ''
      } ${active ? 'ring-2 ring-emerald-500' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 tracking-wide uppercase">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
            {trend && (
              <span
                className={`text-xs font-semibold ${
                  trend.positive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {trend.value}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-lg border ${iconColors}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
