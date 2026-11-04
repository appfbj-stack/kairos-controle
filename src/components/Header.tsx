import React from 'react';
import { 
  HardHat, 
  Wifi, 
  WifiOff, 
  Plus, 
  History, 
  FileSpreadsheet, 
  QrCode,
  Layers
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface HeaderProps {
  onOpenNewItem: () => void;
  onOpenHistory: () => void;
  onOpenBackup: () => void;
  onOpenScanner: () => void;
  itemsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewItem,
  onOpenHistory,
  onOpenBackup,
  onOpenScanner,
  itemsCount,
}) => {
  const isOnline = useOnlineStatus();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      {/* Top micro alert when offline */}
      {!isOnline && (
        <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-1 text-xs text-amber-300 font-medium flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5 shrink-0 animate-pulse" />
          <span>Modo Offline Ativo: Todas as movimentações estão sendo gravadas localmente no seu dispositivo via IndexedDB.</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="relative">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-400/30">
                <HardHat className="w-6 h-6 text-slate-950 stroke-[2.2]" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
                  Almoxarifado Obra
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    PWA
                  </span>
                </h1>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 hidden xs:block">
                Elétrica • Mecânica • Solda • Encanador
              </p>
            </div>
          </div>

          {/* Actions & PWA button */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Online/Offline status pill */}
            <div 
              className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                isOnline 
                  ? 'bg-slate-800/80 text-slate-300 border-slate-700' 
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}
              title={isOnline ? 'Online (IndexedDB Local)' : 'Offline (IndexedDB Operacional)'}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Online / IndexedDB</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>Offline / IndexedDB</span>
                </>
              )}
            </div>

            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Barcode scanner button */}
            <button
              onClick={onOpenScanner}
              type="button"
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
              title="Escanear Código de Barras / QR"
            >
              <QrCode className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Escanear</span>
            </button>

            {/* History of movements */}
            <button
              onClick={onOpenHistory}
              type="button"
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
              title="Histórico de Movimentações"
            >
              <History className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">Histórico</span>
            </button>

            {/* Backup & Sheets */}
            <button
              onClick={onOpenBackup}
              type="button"
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
              title="Backup, Relatórios e Impressão"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Relatórios</span>
            </button>

            {/* Add new item */}
            <button
              onClick={onOpenNewItem}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95 transition shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden xs:inline">Novo Item</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
