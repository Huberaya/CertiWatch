import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white shadow-2xl animate-bounce">
      <WifiOff className="w-4 h-4 shrink-0 text-amber-200" />
      <div>
        <span>Mode Hors-Ligne Actif</span>
        <span className="text-amber-200 block text-[10px] font-normal">
          Les audits terrain et modifications sont stockés localement et seront synchronisés automatiquement au retour du réseau.
        </span>
      </div>
    </div>
  );
}
