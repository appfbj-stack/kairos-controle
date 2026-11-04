import React from 'react';
import { CATEGORIES } from '../utils/categories';
import { EngineeringCategory, StockItem } from '../types/inventory';

interface CategoryNavProps {
  selectedCategory: EngineeringCategory | 'todos';
  onSelectCategory: (cat: EngineeringCategory | 'todos') => void;
  items: StockItem[];
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  selectedCategory,
  onSelectCategory,
  items,
}) => {
  const categoryKeys: (EngineeringCategory | 'todos')[] = [
    'todos',
    'eletrica',
    'mecanica',
    'solda',
    'encanador',
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-thin scrollbar-thumb-slate-700">
      {categoryKeys.map((catKey) => {
        const cat = CATEGORIES[catKey];
        const Icon = cat.icon;
        const isSelected = selectedCategory === catKey;

        // Count items in this category
        const catItems = catKey === 'todos' 
          ? items 
          : items.filter((i) => i.category === catKey);
        
        const count = catItems.length;
        const alertCount = catItems.filter((i) => i.quantity <= i.minQuantity).length;

        return (
          <button
            key={catKey}
            onClick={() => onSelectCategory(catKey)}
            type="button"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 border ${
              isSelected
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/10'
                : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700/80'
            }`}
          >
            <Icon
              className={`w-4 h-4 shrink-0 ${
                isSelected ? 'text-slate-950' : cat.textColor
              }`}
            />
            <span>{cat.shortLabel}</span>

            {/* Total count badge */}
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                isSelected
                  ? 'bg-slate-950/20 text-slate-950'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {count}
            </span>

            {/* Alert badge if any item in this category is below minimum */}
            {alertCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold animate-pulse ${
                  isSelected
                    ? 'bg-rose-950 text-white'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
                title={`${alertCount} itens com estoque baixo nesta especialidade`}
              >
                {alertCount} ⚠
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
