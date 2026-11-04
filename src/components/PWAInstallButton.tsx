import React, { useState } from 'react';
import { Download, Smartphone, Share2, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed in standalone mode, suppress
  if (isInstalled) {
    return (
      <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        App Instalado
      </div>
    );
  }

  return (
    <>
      {isInstallable && (
        <button
          onClick={install}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95 transition-all shadow-md shadow-amber-500/10 cursor-pointer"
          title="Instalar como aplicativo no seu dispositivo"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Instalar App</span>
        </button>
      )}

      {isIOS && !isInstallable && (
        <button
          onClick={() => setShowIOSGuide(true)}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 active:scale-95 transition-all cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span>Instalar no iPhone</span>
        </button>
      )}

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Instalar no iOS (Safari)</h3>
                <p className="text-xs text-slate-400">Use o app offline na obra</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="p-1.5 rounded bg-slate-700 text-amber-400 shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <div className="text-xs leading-relaxed">
                  1. Toque no botão de <strong>Compartilhar</strong> (ícone com quadrado e seta para cima) na barra inferior do Safari.
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="p-1.5 rounded bg-slate-700 text-amber-400 shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div className="text-xs leading-relaxed">
                  2. Role as opções e selecione <strong>Adicionar à Tela de Início</strong>.
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="p-1.5 rounded bg-emerald-500/20 text-emerald-400 shrink-0 font-bold text-xs">
                  ✓
                </div>
                <div className="text-xs leading-relaxed">
                  Pronto! O aplicativo funcionará mesmo quando você estiver sem internet no canteiro de obras.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 text-sm transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
