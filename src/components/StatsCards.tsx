import React from 'react';
import { Package, AlertTriangle, ArrowUpDown, DollarSign, CheckCircle2 } from 'lucide-react';
import { InventoryStats } from '../types/inventory';

interface StatsCardsProps {
  stats: InventoryStats;
  selectedFilter: string;
  onFilterAlerts: () => void;
  onFilterAll: () => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  stats,
  selectedFilter,
  onFilterAlerts,
  onFilterAll,
}) => {
  const isAlertFilterActive = selectedFilter === 'baixo' || selectedFilter === 'zerado';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-4 sm:mb-6">
      {/* Total Items */}
      <button
        onClick={onFilterAll}
        type="button"
        className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all cursor-pointer ${
          selectedFilter === 'todos_status'
            ? 'bg-slate-800/90 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
            : 'bg-slate-800/40 hover:bg-slate-800/70 border-slate-700/60'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">Total de Materiais</span>
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl sm:text-2xl font-black text-white">{stats.totalItems}</span>
          <span className="text-xs text-slate-400">tipos</span>
        </div>
        <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400">
          <CheckCircle2 className="w-3 h-3" />
          <span>Almoxarifado Ativo</span>
        </div>
      </button>

      {/* Stock Alerts (Low or Zero) */}
      <button
        onClick={onFilterAlerts}
        type="button"
        className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
          isAlertFilterActive
            ? 'bg-rose-950/40 border-rose-500 shadow-md ring-1 ring-rose-500/40'
            : stats.lowStockItems + stats.zeroStockItems > 0
            ? 'bg-rose-950/20 hover:bg-rose-950/35 border-rose-500/30'
            : 'bg-slate-800/40 border-slate-700/60'
        }`}
      >
        {stats.zeroStockItems > 0 && (
          <span className="absolute top-0 right-0 w-2 h-2 rounded-bl bg-rose-500"></span>
        )}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-rose-300">Atenção / Reposição</span>
          <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl sm:text-2xl font-black text-rose-400">
            {stats.lowStockItems + stats.zeroStockItems}
          </span>
          <span className="text-xs text-rose-300/80">críticos</span>
        </div>
        <div className="mt-1 text-[11px] text-rose-400/90 truncate">
          {stats.zeroStockItems > 0
            ? `${stats.zeroStockItems} zerados, ${stats.lowStockItems} abaixo do mín.`
            : stats.lowStockItems > 0
            ? `${stats.lowStockItems} itens perto do fim`
            : 'Estoque 100% abastecido'}
        </div>
      </button>

      {/* Today Movements */}
      <div className="p-3.5 sm:p-4 rounded-xl border bg-slate-800/40 border-slate-700/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">Movimentações Hoje</span>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <ArrowUpDown className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl sm:text-2xl font-black text-amber-400">{stats.todayMovements}</span>
          <span className="text-xs text-slate-400">registros</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400 truncate">
          Entradas, saídas e devoluções
        </div>
      </div>

      {/* Estimated Value */}
      <div className="p-3.5 sm:p-4 rounded-xl border bg-slate-800/40 border-slate-700/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">Valor em Estoque</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl sm:text-2xl font-black text-emerald-400">
            R$ {stats.estimatedValue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400 truncate">
          Base estimada de custos
        </div>
      </div>
    </div>
  );
};
