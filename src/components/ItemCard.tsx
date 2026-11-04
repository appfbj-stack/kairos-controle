import React from 'react';
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  RotateCcw, 
  MapPin, 
  Edit2, 
  Trash2, 
  AlertTriangle,
  Barcode
} from 'lucide-react';
import { StockItem } from '../types/inventory';
import { CATEGORIES } from '../utils/categories';

interface ItemCardProps {
  item: StockItem;
  onMovement: (item: StockItem, type: 'saida' | 'entrada' | 'devolucao') => void;
  onEdit: (item: StockItem) => void;
  onDelete: (item: StockItem) => void;
  onShowBarcode: (item: StockItem) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onMovement,
  onEdit,
  onDelete,
  onShowBarcode,
}) => {
  const catMeta = CATEGORIES[item.category] || CATEGORIES.geral;
  const Icon = catMeta.icon;

  const isZero = item.quantity <= 0;
  const isLow = !isZero && item.quantity <= item.minQuantity;
  const isOk = item.quantity > item.minQuantity;

  return (
    <div
      className={`rounded-xl border transition-all duration-200 flex flex-col justify-between overflow-hidden relative ${
        isZero
          ? 'bg-rose-950/20 border-rose-500/50 shadow-sm shadow-rose-950/40'
          : isLow
          ? 'bg-amber-950/20 border-amber-500/50 shadow-sm shadow-amber-950/30'
          : 'bg-slate-800/40 hover:bg-slate-800/70 border-slate-700/80 hover:border-slate-600'
      }`}
    >
      {/* Top indicator bar */}
      <div
        className={`h-1 w-full ${
          isZero ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
        }`}
      />

      <div className="p-3.5 sm:p-4 flex-1 flex flex-col">
        {/* Category & Status Badges */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${catMeta.bgColor} ${catMeta.textColor} ${catMeta.borderColor}`}
            >
              <Icon className="w-3 h-3" />
              <span>{catMeta.shortLabel}</span>
            </span>
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              {item.code}
            </span>
          </div>

          {/* Health status pill */}
          <div>
            {isZero ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                ZERADO
              </span>
            ) : isLow ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <AlertTriangle className="w-3 h-3" />
                ESTOQUE BAIXO
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                OK
              </span>
            )}
          </div>
        </div>

        {/* Item Title */}
        <h3 className="font-bold text-sm sm:text-base text-white tracking-tight mb-2 line-clamp-2 leading-snug">
          {item.name}
        </h3>

        {/* Stock Level Counter */}
        <div className="mt-auto py-2.5 px-3 rounded-xl bg-slate-900/60 border border-slate-800/80 mb-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
              Disponível
            </div>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-2xl sm:text-3xl font-black tracking-tight ${
                  isZero
                    ? 'text-rose-400'
                    : isLow
                    ? 'text-amber-400'
                    : 'text-white'
                }`}
              >
                {item.quantity}
              </span>
              <span className="text-xs font-semibold text-slate-300">
                {item.unit}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-slate-400">Estoque Mínimo</div>
            <div className="text-xs font-semibold text-slate-300">
              {item.minQuantity} {item.unit}
            </div>
            {item.unitCost ? (
              <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                R$ {item.unitCost.toFixed(2)}/un
              </div>
            ) : null}
          </div>
        </div>

        {/* Location & Barcode details */}
        <div className="space-y-1 mb-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{item.location || 'Local não definido'}</span>
          </div>
          {item.barcode && (
            <button
              onClick={() => onShowBarcode(item)}
              type="button"
              className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-[11px] font-mono cursor-pointer transition"
              title="Clique para ver código de barras"
            >
              <Barcode className="w-3.5 h-3.5 text-slate-500" />
              <span>{item.barcode}</span>
            </button>
          )}
          {item.notes && (
            <p className="text-[11px] text-slate-400 italic line-clamp-1">
              "{item.notes}"
            </p>
          )}
        </div>
      </div>

      {/* Actions footer */}
      <div className="p-2 sm:p-2.5 bg-slate-900/80 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1">
          {/* Quick Saída button (Main action on site) */}
          <button
            onClick={() => onMovement(item, 'saida')}
            type="button"
            disabled={item.quantity <= 0}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer ${
              item.quantity > 0
                ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                : 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500 border border-slate-700'
            }`}
            title="Registrar retirada de material para obra"
          >
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-400 stroke-[2.5]" />
            <span>Saída</span>
          </button>

          {/* Quick Entrada button */}
          <button
            onClick={() => onMovement(item, 'entrada')}
            type="button"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition active:scale-95 cursor-pointer"
            title="Registrar entrada de material (compra/NF)"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
            <span>Entrada</span>
          </button>

          {/* Devolução button */}
          <button
            onClick={() => onMovement(item, 'devolucao')}
            type="button"
            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition active:scale-95 cursor-pointer hidden sm:inline-flex"
            title="Devolução de sobra de obra para o estoque"
          >
            <RotateCcw className="w-3 h-3 text-sky-400" />
            <span>Devolver</span>
          </button>
        </div>

        {/* Edit and Delete actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(item)}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition active:scale-95 cursor-pointer"
            title="Editar item"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(item)}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition active:scale-95 cursor-pointer"
            title="Excluir item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
