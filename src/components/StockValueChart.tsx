import React, { useState } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';
import { PieChart as ChartIcon, ChevronDown, ChevronUp, DollarSign, ArrowRight } from 'lucide-react';
import { StockItem, EngineeringCategory } from '../types/inventory';
import { CATEGORIES } from '../utils/categories';

interface StockValueChartProps {
  items: StockItem[];
  selectedCategory: EngineeringCategory | 'todos';
  onSelectCategory: (category: EngineeringCategory | 'todos') => void;
}

interface ChartSliceData {
  category: EngineeringCategory;
  name: string;
  value: number;
  itemsCount: number;
  percentage: number;
  color: string;
}

// Custom Tooltip component for dark industrial theme
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data: ChartSliceData = payload[0].payload;
    const catMeta = CATEGORIES[data.category] || CATEGORIES.geral;
    const Icon = catMeta.icon;

    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1 z-50">
        <div className="flex items-center gap-1.5 font-bold text-white mb-1">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <Icon className="w-3.5 h-3.5 text-amber-400" />
          <span>{data.name}</span>
        </div>
        <div className="text-slate-300 flex justify-between gap-4">
          <span>Valor em Estoque:</span>
          <strong className="text-emerald-400 font-mono">
            R$ {data.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
        </div>
        <div className="text-slate-400 flex justify-between gap-4">
          <span>Participação:</span>
          <strong className="text-amber-400">{data.percentage.toFixed(1)}%</strong>
        </div>
        <div className="text-slate-400 flex justify-between gap-4">
          <span>Total de Itens:</span>
          <span className="text-white font-medium">{data.itemsCount} tipos</span>
        </div>
      </div>
    );
  }
  return null;
};

export const StockValueChart: React.FC<StockValueChartProps> = ({
  items,
  selectedCategory,
  onSelectCategory,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Group items by category and compute total monetary value
  const categoryTotals: Record<
    EngineeringCategory,
    { value: number; count: number }
  > = {
    eletrica: { value: 0, count: 0 },
    mecanica: { value: 0, count: 0 },
    solda: { value: 0, count: 0 },
    encanador: { value: 0, count: 0 },
    geral: { value: 0, count: 0 },
  };

  let grandTotal = 0;

  items.forEach((item) => {
    const val = (item.unitCost || 0) * Math.max(0, item.quantity);
    if (categoryTotals[item.category]) {
      categoryTotals[item.category].value += val;
      categoryTotals[item.category].count += 1;
    }
    grandTotal += val;
  });

  // Category color mapping
  const categoryColors: Record<EngineeringCategory, string> = {
    eletrica: '#eab308', // Amber/Yellow
    mecanica: '#3b82f6', // Steel Blue
    solda: '#f97316',    // Flame Orange
    encanador: '#0ea5e9', // Sky/Cyan Blue
    geral: '#a855f7',    // Purple
  };

  const chartData: ChartSliceData[] = (
    ['eletrica', 'mecanica', 'solda', 'encanador'] as EngineeringCategory[]
  )
    .map((catKey) => {
      const cat = CATEGORIES[catKey];
      const total = categoryTotals[catKey].value;
      const count = categoryTotals[catKey].count;
      const percentage = grandTotal > 0 ? (total / grandTotal) * 100 : 0;

      return {
        category: catKey,
        name: cat.shortLabel,
        value: total,
        itemsCount: count,
        percentage,
        color: categoryColors[catKey],
      };
    })
    .filter((entry) => entry.value > 0 || entry.itemsCount > 0);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden mb-5 transition-all">
      {/* Header bar with toggle */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 select-none border-b border-slate-800/60"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <ChartIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <span>Distribuição de Valor por Categoria</span>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                Total: R$ {grandTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 hidden xs:block">
              Gráfico de pizza com o valor monetário imobilizado em cada frente de engenharia
            </p>
          </div>
        </div>

        <button
          type="button"
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label={isExpanded ? 'Recolher gráfico' : 'Expandir gráfico'}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Collapsible Chart Body */}
      {isExpanded && (
        <div className="p-4 sm:p-5">
          {grandTotal === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              <p>Nenhum item com custo estimado cadastrado no momento.</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Adicione o "Custo Unitário Estimado (R$)" nos itens para calcular a distribuição.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Pie Chart Display (Recharts) */}
              <div className="md:col-span-5 h-64 sm:h-72 w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      onClick={(entry: any) => {
                        const targetCat = entry?.category || entry?.payload?.category;
                        if (targetCat) {
                          onSelectCategory(targetCat === selectedCategory ? 'todos' : targetCat);
                        }
                      }}
                      cursor="pointer"
                    >
                      {chartData.map((entry, index) => {
                        const isHovered = activeIndex === index;
                        const isSelected = selectedCategory === entry.category;
                        const hasCategoryFilter = selectedCategory !== 'todos';

                        let opacity = 1;
                        if (activeIndex !== undefined) {
                          opacity = isHovered ? 1 : 0.5;
                        } else if (hasCategoryFilter) {
                          opacity = isSelected ? 1 : 0.45;
                        }

                        return (
                          <Cell
                            key={`cell-${entry.category}`}
                            fill={entry.color}
                            stroke={isSelected ? '#ffffff' : '#0f172a'}
                            strokeWidth={isSelected ? 3 : 2}
                            opacity={opacity}
                            className="transition-all duration-200"
                          />
                        );
                      })}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center Badge in donut hole */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                    Total
                  </span>
                  <span className="text-sm font-black text-white font-mono">
                    R$ {(grandTotal / 1000).toFixed(1)}k
                  </span>
                  <span className="text-[9px] text-emerald-400 font-bold">
                    100%
                  </span>
                </div>
              </div>

              {/* Right Side: Category Breakdown Cards with Progress Bars */}
              <div className="md:col-span-7 space-y-2.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Detalhamento por Disciplina</span>
                  <span className="text-[10px] text-slate-500 lowercase">clique para filtrar na tabela</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {chartData.map((slice, index) => {
                    const catMeta = CATEGORIES[slice.category];
                    const Icon = catMeta.icon;
                    const isSelected = selectedCategory === slice.category;
                    const isHovered = activeIndex === index;

                    return (
                      <button
                        key={slice.category}
                        type="button"
                        onClick={() =>
                          onSelectCategory(isSelected ? 'todos' : slice.category)
                        }
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(undefined)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                          isSelected
                            ? 'bg-slate-800 border-amber-500 shadow-md ring-1 ring-amber-500/40'
                            : isHovered
                            ? 'bg-slate-800/80 border-slate-600'
                            : 'bg-slate-800/30 hover:bg-slate-800/60 border-slate-700/60'
                        }`}
                      >
                        {/* Top indicator color strip */}
                        <div
                          className="absolute top-0 left-0 bottom-0 w-1"
                          style={{ backgroundColor: slice.color }}
                        />

                        <div className="pl-1">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              <Icon className={`w-3.5 h-3.5 ${catMeta.textColor}`} />
                              <span>{catMeta.label}</span>
                            </span>
                            <span className="text-[11px] font-bold text-amber-400">
                              {slice.percentage.toFixed(1)}%
                            </span>
                          </div>

                          <div className="flex items-baseline justify-between text-xs mt-1">
                            <span className="font-mono font-extrabold text-emerald-400 text-sm">
                              R$ {slice.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {slice.itemsCount} {slice.itemsCount === 1 ? 'item' : 'itens'}
                            </span>
                          </div>

                          {/* Mini Progress Bar */}
                          <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2 overflow-hidden border border-slate-800">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(100, Math.max(3, slice.percentage))}%`,
                                backgroundColor: slice.color,
                              }}
                            />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Reset filter option if filtered */}
                {selectedCategory !== 'todos' && (
                  <div className="pt-1 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => onSelectCategory('todos')}
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <span>Mostrar todas as categorias</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
