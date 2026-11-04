import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Search, 
  ArrowDownRight, 
  ArrowUpRight, 
  RotateCcw, 
  SlidersHorizontal,
  Calendar,
  User,
  MapPin,
  Clock
} from 'lucide-react';
import { StockMovement, MovementType, EngineeringCategory } from '../types/inventory';
import { CATEGORIES } from '../utils/categories';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  movements: StockMovement[];
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  movements,
}) => {
  if (!isOpen) return null;

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<MovementType | 'todas'>('todas');
  const [categoryFilter, setCategoryFilter] = useState<EngineeringCategory | 'todas'>('todas');

  const filteredMovements = movements.filter((mov) => {
    if (typeFilter !== 'todas' && mov.type !== typeFilter) return false;
    if (categoryFilter !== 'todas' && mov.category !== categoryFilter) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = mov.itemName.toLowerCase().includes(term);
      const matchCode = mov.itemCode.toLowerCase().includes(term);
      const matchResp = mov.responsible.toLowerCase().includes(term);
      const matchWf = mov.workFront.toLowerCase().includes(term);
      if (!matchName && !matchCode && !matchResp && !matchWf) return false;
    }

    return true;
  });

  const exportCsv = () => {
    const headers = [
      'Data/Hora',
      'Tipo de Movimento',
      'Código',
      'Nome do Material',
      'Especialidade',
      'Quantidade Movimentada',
      'Saldo Anterior',
      'Saldo Resultante',
      'Responsável / Documento',
      'Frente de Obra / Destino',
      'Observações',
    ];

    const rows = filteredMovements.map((m) => [
      new Date(m.date).toLocaleString('pt-BR'),
      m.type.toUpperCase(),
      m.itemCode,
      `"${m.itemName.replace(/"/g, '""')}"`,
      m.category.toUpperCase(),
      m.quantity,
      m.previousQuantity,
      m.newQuantity,
      `"${m.responsible.replace(/"/g, '""')}"`,
      `"${m.workFront.replace(/"/g, '""')}"`,
      `"${(m.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      '\uFEFF' + // UTF-8 BOM for Excel
      [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `historico-almoxarifado-obra-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col overflow-hidden my-4">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/70">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>Histórico de Movimentações da Obra</span>
            </h2>
            <p className="text-xs text-slate-400">
              Auditoria de retiradas, entradas e devoluções salvas no IndexedDB
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCsv}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition active:scale-95 cursor-pointer"
              title="Exportar para planilha Excel / CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-800 bg-slate-950/40 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por material, código, operador ou frente de obra..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Type selector */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as MovementType | 'todas')}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="todas">Todos os Tipos</option>
              <option value="saida">Apenas Saídas (Obra)</option>
              <option value="entrada">Apenas Entradas (NF)</option>
              <option value="devolucao">Apenas Devoluções</option>
              <option value="ajuste">Apenas Ajustes</option>
            </select>

            {/* Category selector */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as EngineeringCategory | 'todas')}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="todas">Todas as Especialidades</option>
              <option value="eletrica">Elétrica</option>
              <option value="mecanica">Mecânica</option>
              <option value="solda">Solda</option>
              <option value="encanador">Hidráulica</option>
            </select>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Exibindo <strong>{filteredMovements.length}</strong> de {movements.length} registros
            </span>
          </div>
        </div>

        {/* Movements List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-700">
          {filteredMovements.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-sm">Nenhuma movimentação encontrada com os filtros selecionados.</p>
            </div>
          ) : (
            filteredMovements.map((mov) => {
              const cat = CATEGORIES[mov.category] || CATEGORIES.geral;
              const isSaida = mov.type === 'saida';
              const isEntrada = mov.type === 'entrada';
              const isDevolucao = mov.type === 'devolucao';

              return (
                <div
                  key={mov.id}
                  className="p-3 sm:p-3.5 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800/60 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  {/* Left: Type icon & item info */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${
                        isSaida
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          : isEntrada
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : isDevolucao
                          ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                          : 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                      }`}
                    >
                      {isSaida && <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />}
                      {isEntrada && <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />}
                      {isDevolucao && <RotateCcw className="w-4 h-4 stroke-[2.5]" />}
                      {!isSaida && !isEntrada && !isDevolucao && (
                        <SlidersHorizontal className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            isSaida
                              ? 'bg-rose-500/20 text-rose-300'
                              : isEntrada
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : isDevolucao
                              ? 'bg-sky-500/20 text-sky-300'
                              : 'bg-purple-500/20 text-purple-300'
                          }`}
                        >
                          {mov.type.toUpperCase()}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {mov.itemCode}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {cat.shortLabel}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-white mt-1">
                        {mov.itemName}
                      </h4>

                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1 text-slate-300">
                          <User className="w-3.5 h-3.5 text-amber-400" />
                          <span>{mov.responsible}</span>
                        </span>
                        <span className="flex items-center gap-1 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-sky-400" />
                          <span>{mov.workFront}</span>
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{new Date(mov.date).toLocaleString('pt-BR')}</span>
                        </span>
                      </div>

                      {mov.notes && (
                        <p className="mt-1 text-[11px] text-slate-400 italic">
                          "{mov.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Quantity impact */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800 shrink-0">
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`text-lg font-black ${
                          isSaida
                            ? 'text-rose-400'
                            : isEntrada || isDevolucao
                            ? 'text-emerald-400'
                            : 'text-purple-400'
                        }`}
                      >
                        {isSaida ? '-' : '+'}{mov.quantity}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Saldo: {mov.previousQuantity} → <strong className="text-white">{mov.newQuantity}</strong>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
