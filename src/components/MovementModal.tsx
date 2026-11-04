import React, { useState } from 'react';
import { 
  X, 
  ArrowDownRight, 
  ArrowUpRight, 
  RotateCcw, 
  SlidersHorizontal,
  HardHat,
  MapPin,
  Check
} from 'lucide-react';
import { StockItem, MovementType } from '../types/inventory';
import { CATEGORIES } from '../utils/categories';

interface MovementModalProps {
  item: StockItem | null;
  initialType?: MovementType;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: {
    itemId: string;
    type: MovementType;
    quantity: number;
    responsible: string;
    workFront: string;
    notes?: string;
  }) => Promise<void>;
}

const COMMON_RESPONSIBLES = [
  'Mestre de Obra',
  'Eletricista Chefe',
  'Encanador Líder',
  'Soldador Encarregado',
  'Engenheiro Residente',
  'Equipe de Montagem',
  'NF / Fornecedor',
];

const COMMON_WORK_FRONTS = [
  'Subestação Elétrica',
  'Quadro de Distribuição Geral (QDG)',
  'Rede de Tubulação Principal',
  'Bancada de Solda e Corte',
  'Galpão de Máquinas',
  'Prédio Administrativo',
  'Cavalete de Entrada de Água',
  'Torre de Refrigeração',
];

export const MovementModal: React.FC<MovementModalProps> = ({
  item,
  initialType = 'saida',
  isOpen,
  onClose,
  onSubmit,
}) => {
  if (!isOpen || !item) return null;

  const [type, setType] = useState<MovementType>(initialType);
  const [quantity, setQuantity] = useState<number>(1);
  const [responsible, setResponsible] = useState<string>('');
  const [workFront, setWorkFront] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const catMeta = CATEGORIES[item.category] || CATEGORIES.geral;

  // Calculate resulting quantity
  let previewNewQty = item.quantity;
  if (type === 'saida') {
    previewNewQty = Math.max(0, item.quantity - quantity);
  } else if (type === 'entrada' || type === 'devolucao') {
    previewNewQty = item.quantity + quantity;
  } else if (type === 'ajuste') {
    previewNewQty = quantity;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (quantity <= 0 && type !== 'ajuste') {
      setErrorMsg('A quantidade deve ser maior que zero.');
      return;
    }

    if (type === 'saida' && quantity > item.quantity) {
      setErrorMsg(`Estoque insuficiente! Disponível atualmente: ${item.quantity} ${item.unit}.`);
      return;
    }

    if (!responsible.trim()) {
      setErrorMsg('Informe o nome do responsável ou documento.');
      return;
    }

    if (!workFront.trim() && (type === 'saida' || type === 'devolucao')) {
      setErrorMsg('Informe a frente de obra / local de destino.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        itemId: item.id,
        type,
        quantity,
        responsible: responsible.trim(),
        workFront: workFront.trim() || 'Almoxarifado Central',
        notes: notes.trim(),
      });
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao registrar movimentação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Movimentação de Estoque
            </span>
            <h2 className="text-base sm:text-lg font-extrabold text-white leading-tight">
              {item.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono text-slate-400">{item.code}</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-300">
                Atual: <strong className="text-white">{item.quantity} {item.unit}</strong>
              </span>
            </div>
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
          {/* Movement Type Switcher */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tipo de Movimentação
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('saida')}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                  type === 'saida'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500 shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <ArrowDownRight className="w-4 h-4 text-rose-400" />
                <span>Saída (Obra)</span>
              </button>

              <button
                type="button"
                onClick={() => setType('entrada')}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                  type === 'entrada'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                <span>Entrada (NF)</span>
              </button>

              <button
                type="button"
                onClick={() => setType('devolucao')}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                  type === 'devolucao'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500 shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <RotateCcw className="w-4 h-4 text-sky-400" />
                <span>Devolução</span>
              </button>
            </div>
          </div>

          {/* Quantity Input with quick increments */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Quantidade ({item.unit})
              </label>
              <span className="text-[11px] text-slate-400">
                Novo saldo previsto: <strong className="text-amber-400">{previewNewQty} {item.unit}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={type === 'ajuste' ? 0 : 1}
                max={type === 'saida' ? item.quantity : 999999}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-base font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
              <div className="flex items-center gap-1">
                {[1, 5, 10].map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setQuantity((prev) => (type === 'saida' ? Math.min(item.quantity, prev + step) : prev + step))}
                    className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
                  >
                    +{step}
                  </button>
                ))}
                {type === 'saida' && item.quantity > 0 && (
                  <button
                    type="button"
                    onClick={() => setQuantity(item.quantity)}
                    className="px-2.5 py-2 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-bold border border-amber-500/30 transition"
                  >
                    Tudo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Responsible */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Responsável / Quem Retirou ou Entregou *
            </label>
            <div className="relative">
              <HardHat className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Ex: Carlos (Eletricista), Mestre Souza, NF 84920"
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
            {/* Quick chips */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {COMMON_RESPONSIBLES.slice(0, 4).map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setResponsible(name)}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Work Front / Frente de Serviço */}
          {(type === 'saida' || type === 'devolucao') && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Frente de Obra / Local de Aplicação *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Ex: Subestação, Galpão A, Tubulação Externa"
                  value={workFront}
                  onChange={(e) => setWorkFront(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              {/* Quick chips */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {COMMON_WORK_FRONTS.slice(0, 4).map((wf) => (
                  <button
                    key={wf}
                    type="button"
                    onClick={() => setWorkFront(wf)}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  >
                    {wf}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Observações Adicionais (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Material reservado para montagem do transformador..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
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
              <span>{isSubmitting ? 'Gravando...' : 'Confirmar Movimentação'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
