import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Camera, 
  CameraOff, 
  Search, 
  Barcode, 
  ArrowRight,
  CheckCircle2,
  HardHat
} from 'lucide-react';
import { StockItem } from '../types/inventory';
import { CATEGORIES } from '../utils/categories';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: StockItem[];
  onSelectItem: (item: StockItem) => void;
  displayItem?: StockItem | null; // If viewing a specific item's barcode
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  items,
  onSelectItem,
  displayItem,
}) => {
  if (!isOpen) return null;

  const [inputCode, setInputCode] = useState('');
  const [matchedItem, setMatchedItem] = useState<StockItem | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // If in display mode for an item, lock to it
  useEffect(() => {
    if (displayItem) {
      setMatchedItem(displayItem);
    }
  }, [displayItem]);

  // Handle camera start/stop
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: unknown) {
      setCameraError('Permissão de câmera negada ou câmera não encontrada. Utilize a busca manual pelo código de barras ou leitor USB.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Search logic on input code
  useEffect(() => {
    if (!inputCode.trim()) {
      if (!displayItem) setMatchedItem(null);
      return;
    }

    const cleanInput = inputCode.trim().toLowerCase();
    const found = items.find(
      (item) =>
        (item.barcode && item.barcode.toLowerCase() === cleanInput) ||
        item.code.toLowerCase() === cleanInput ||
        item.name.toLowerCase().includes(cleanInput)
    );

    if (found) {
      setMatchedItem(found);
    } else {
      setMatchedItem(null);
    }
  }, [inputCode, items, displayItem]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Barcode className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              {displayItem ? 'Código de Barras do Item' : 'Leitor de Código de Barras / SKU'}
            </h2>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* Display Mode: Render Visual Barcode */}
          {displayItem && (
            <div className="text-center p-4 rounded-xl bg-white text-slate-950 flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Almoxarifado Obra - Etiqueta Física
              </span>
              <h3 className="font-extrabold text-sm text-slate-900 mt-1 max-w-xs truncate">
                {displayItem.name}
              </h3>
              <p className="text-xs font-mono font-bold text-slate-700 mb-2">
                {displayItem.code}
              </p>

              {/* Synthetic Barcode lines representation */}
              <div className="flex items-end justify-center gap-0.5 h-16 w-64 my-1">
                {Array.from({ length: 48 }).map((_, i) => {
                  const heights = [100, 80, 95, 75, 100, 85, 90, 100];
                  const widths = [2, 3, 1, 4, 2, 1, 3, 2];
                  return (
                    <div
                      key={i}
                      style={{
                        height: `${heights[i % heights.length]}%`,
                        width: `${widths[i % widths.length]}px`,
                      }}
                      className="bg-slate-950"
                    />
                  );
                })}
              </div>

              <div className="font-mono text-sm tracking-widest font-black text-slate-900 mt-1">
                {displayItem.barcode || displayItem.code}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Local: {displayItem.location}
              </div>
            </div>
          )}

          {/* Scanner Mode */}
          {!displayItem && (
            <>
              {/* Camera viewfinder */}
              <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center">
                {cameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {/* Targeting reticle */}
                    <div className="absolute inset-x-8 inset-y-6 border-2 border-dashed border-amber-400 rounded-lg pointer-events-none flex items-center justify-center">
                      <span className="text-[10px] font-bold text-amber-300 bg-slate-950/80 px-2 py-0.5 rounded">
                        Alinhe o código de barras
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4 text-slate-400">
                    <Camera className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs">Câmera desativada</p>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Ativar Câmera da Obra</span>
                    </button>
                  </div>
                )}
              </div>

              {cameraActive && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 mx-auto"
                  >
                    <CameraOff className="w-3.5 h-3.5" />
                    <span>Desativar Câmera</span>
                  </button>
                </div>
              )}

              {cameraError && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                  {cameraError}
                </div>
              )}

              {/* Manual Barcode / SKU input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Digite ou Escaneie com leitor USB / Bluetooth:
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Ex: 7891001002501 ou ELE-010"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    autoFocus
                  />
                </div>
              </div>
            </>
          )}

          {/* Matched Item Card */}
          {matchedItem && (
            <div className="p-3.5 rounded-xl bg-slate-800/90 border border-emerald-500/50 shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Material Localizado
                </span>
                <span className="text-xs font-mono font-bold text-slate-300">
                  {matchedItem.code}
                </span>
              </div>

              <h4 className="font-bold text-sm text-white">{matchedItem.name}</h4>

              <div className="flex items-center justify-between text-xs text-slate-300 pt-1 border-t border-slate-700">
                <span>
                  Disponível: <strong className="text-amber-400 text-sm">{matchedItem.quantity} {matchedItem.unit}</strong>
                </span>
                <span>{matchedItem.location}</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  onSelectItem(matchedItem);
                  onClose();
                }}
                className="w-full mt-2 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <span>Selecionar para Movimentar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {inputCode.trim() && !matchedItem && (
            <div className="text-center py-2 text-xs text-slate-400">
              Nenhum material cadastrado com o código "{inputCode}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
