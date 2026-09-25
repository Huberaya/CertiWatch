import React, { useState } from 'react';
import { Download, Smartphone, CheckCircle2, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export function PWAInstallButton() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed in standalone mode, suppress button
  if (isInstalled) {
    return (
      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-400">
        <CheckCircle2 className="w-3.5 h-3.5" />
        PWA Installée
      </span>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-950 hover:from-emerald-500 hover:to-teal-500 transition cursor-pointer"
        title="Installer l'application CertiWatch sur votre appareil pour une utilisation hors-ligne"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Installer l'App PWA</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Installer sur iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-left space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  Installer CertiWatch sur iPhone / iPad
                </h4>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                    1
                  </span>
                  <span>
                    Appuyez sur le bouton <strong>Partager</strong> (icône carrée avec flèche vers le
                    haut) dans la barre de Safari.
                  </span>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                    2
                  </span>
                  <span>
                    Faites défiler vers le bas et sélectionnez <strong>Sur l'écran d'accueil</strong>.
                  </span>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                    3
                  </span>
                  <span>
                    Validez en appuyant sur <strong>Ajouter</strong> en haut à droite.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors"
              >
                Compris
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback direct installation prompt for desktop / other browsers
  return (
    <button
      type="button"
      onClick={() => {
        alert(
          "Pour installer CertiWatch sur votre bureau ou mobile :\nDans Chrome ou Edge, cliquez sur l'icône d'installation dans la barre d'adresse (à droite de l'URL) ou dans le menu ⋮ > 'Installer CertiWatch'."
        );
      }}
      className="hidden sm:flex items-center gap-1.5 rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition"
    >
      <Download className="w-3.5 h-3.5 text-emerald-400" />
      <span>Mode PWA Déconnecté</span>
    </button>
  );
}
