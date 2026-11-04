import React, { useState, useEffect } from 'react';
import { X, Check, Sparkles, MapPin, Barcode } from 'lucide-react';
import { StockItem, EngineeringCategory, UnitType } from '../types/inventory';
import { CATEGORIES } from '../utils/categories';

interface ItemModalProps {
  item: StockItem | null; // null means create mode
  defaultCategory?: EngineeringCategory | 'todos';
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: StockItem) => Promise<void>;
}

const UNITS: { value: UnitType; label: string }[] = [
  { value: 'un', label: 'un (Unidade)' },
  { value: 'barra', label: 'barra (Barra 6m / 12m)' },
  { value: 'm', label: 'm (Metro)' },
  { value: 'rolo', label: 'rolo (Rolo 50m / 100m)' },
  { value: 'caixa', label: 'caixa (Caixa / Cento)' },
  { value: 'kg', label: 'kg (Quilograma)' },
  { value: 'l', label: 'l (Litro / Frasco)' },
  { value: 'pacote', label: 'pacote (Pacote)' },
  { value: 'par', label: 'par (Par)' },
  { value: 'peca', label: 'peça (Peça)' },
];

export const ItemModal: React.FC<ItemModalProps> = ({
  item,
  defaultCategory = 'eletrica',
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [category, setCategory] = useState<EngineeringCategory>(
    item ? item.category : defaultCategory === 'todos' ? 'eletrica' : defaultCategory
  );
  const [code, setCode] = useState(item ? item.code : '');
  const [name, setName] = useState(item ? item.name : '');
  const [quantity, setQuantity] = useState<number>(item ? item.quantity : 1);
  const [minQuantity, setMinQuantity] = useState<number>(item ? item.minQuantity : 5);
  const [unit, setUnit] = useState<UnitType>(item ? item.unit : 'un');
  const [location, setLocation] = useState(item ? item.location : '');
  const [unitCost, setUnitCost] = useState<string>(item?.unitCost ? String(item.unitCost) : '');
  const [barcode, setBarcode] = useState(item?.barcode || '');
  const [notes, setNotes] = useState(item?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-generate a clean code if empty when category changes
  useEffect(() => {
    if (!item && !code) {
      const prefix = category === 'eletrica' ? 'ELE' : category === 'mecanica' ? 'MEC' : category === 'solda' ? 'SOL' : category === 'encanador' ? 'HID' : 'GER';
      const randomNum = Math.floor(100 + Math.random() * 900);
      setCode(`${prefix}-${randomNum}`);
    }
  }, [category, item, code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('O nome do material é obrigatório.');
      return;
    }

    if (!code.trim()) {
      setErrorMsg('O código/SKU do item é obrigatório.');
      return;
    }

    setIsSubmitting(true);
    try {
      const itemToSave: StockItem = {
        id: item ? item.id : 'item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        code: code.trim().toUpperCase(),
        name: name.trim(),
        category,
        quantity: Math.max(0, quantity),
        minQuantity: Math.max(0, minQuantity),
        unit,
        location: location.trim() || 'Almoxarifado Geral',
        unitCost: unitCost ? parseFloat(unitCost) : undefined,
        barcode: barcode.trim() || undefined,
        notes: notes.trim() || undefined,
        lastUpdated: new Date().toISOString(),
      };

      await onSave(itemToSave);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao salvar material.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateRandomBarcode = () => {
    const randomEan = '789' + Math.floor(1000000000 + Math.random() * 9000000000);
    setBarcode(randomEan);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              {item ? 'Editar Material' : 'Cadastrar Novo Material'}
            </h2>
            <p className="text-xs text-slate-400">
              Controle de estoque para a obra
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* Discipline / Category Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Especialidade / Disciplina de Engenharia *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['eletrica', 'mecanica', 'solda', 'encanador'] as EngineeringCategory[]).map((catKey) => {
                const cat = CATEGORIES[catKey];
                const Icon = cat.icon;
                const isSelected = category === catKey;

                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCategory(catKey)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                        : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : cat.textColor}`} />
                    <span className="truncate">{cat.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome do Material / Especificação *
              </label>
              <input
                type="text"
                placeholder="Ex: Cabo Flexível 2.5mm² 750V Azul"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Código / SKU *
              </label>
              <input
                type="text"
                placeholder="ELE-010"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
          </div>

          {/* Quantities & Unit */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Qtd. Atual *
              </label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Estoque Mínimo *
              </label>
              <input
                type="number"
                min="0"
                value={minQuantity}
                onChange={(e) => setMinQuantity(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                title="Quando o estoque atingir ou for menor que este valor, um alerta será exibido"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Unidade *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitType)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location & Unit Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Localização no Almoxarifado
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Ex: Prateleira E-03, Box Hidráulica"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Custo Unitário Estimado (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 45.90"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Barcode / QR Code */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Código de Barras / EAN (Opcional)
              </label>
              <button
                type="button"
                onClick={generateRandomBarcode}
                className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Gerar Código</span>
              </button>
            </div>
            <div className="relative">
              <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Ex: 7891001002501"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Observações Técnicas / Aplicação
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Utilizar preferencialmente no circuito secundário do galpão de manutenção..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95 transition cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Salvando...' : 'Salvar Material'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
