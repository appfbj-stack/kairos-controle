/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  LayoutGrid, 
  Table as TableIcon, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Package, 
  RotateCcw,
  Sparkles,
  WifiOff
} from 'lucide-react';

import { StockItem, StockMovement, EngineeringCategory, InventoryStats } from './types/inventory';
import { 
  getAllItems, 
  saveItem, 
  deleteItem, 
  registerMovement, 
  getAllMovements, 
  RegisterMovementParams 
} from './db/indexedDB';

import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { CategoryNav } from './components/CategoryNav';
import { ItemCard } from './components/ItemCard';
import { MovementModal } from './components/MovementModal';
import { ItemModal } from './components/ItemModal';
import { HistoryModal } from './components/HistoryModal';
import { BackupModal } from './components/BackupModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { PrintInventorySheet } from './components/PrintInventorySheet';
import { StockValueChart } from './components/StockValueChart';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { CATEGORIES } from './utils/categories';

export default function App() {
  const isOnline = useOnlineStatus();

  // App State
  const [items, setItems] = useState<StockItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Views
  const [selectedCategory, setSelectedCategory] = useState<EngineeringCategory | 'todos'>('todos');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'alertas' | 'ok' | 'zerados'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'nome' | 'menor_estoque' | 'maior_estoque' | 'codigo'>('menor_estoque');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [movementModalState, setMovementModalState] = useState<{
    isOpen: boolean;
    item: StockItem | null;
    type: 'saida' | 'entrada' | 'devolucao';
  }>({
    isOpen: false,
    item: null,
    type: 'saida',
  });
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [scannerModalState, setScannerModalState] = useState<{
    isOpen: boolean;
    displayItem?: StockItem | null;
  }>({
    isOpen: false,
    displayItem: null,
  });
  const [itemToDelete, setItemToDelete] = useState<StockItem | null>(null);

  // Fetch all data from IndexedDB
  const refreshData = useCallback(async () => {
    try {
      const [loadedItems, loadedMovements] = await Promise.all([
        getAllItems(),
        getAllMovements(),
      ]);
      setItems(loadedItems);
      setMovements(loadedMovements);
    } catch (err) {
      console.error('[IndexedDB] Erro ao carregar dados:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Compute live statistics
  const stats = useMemo<InventoryStats>(() => {
    const today = new Date().toDateString();
    let lowStock = 0;
    let zeroStock = 0;
    let totalVal = 0;
    const byCat: Record<EngineeringCategory, number> = {
      eletrica: 0,
      mecanica: 0,
      solda: 0,
      encanador: 0,
      geral: 0,
    };

    items.forEach((item) => {
      if (item.quantity <= 0) {
        zeroStock++;
      } else if (item.quantity <= item.minQuantity) {
        lowStock++;
      }

      totalVal += (item.unitCost || 0) * item.quantity;
      if (byCat[item.category] !== undefined) {
        byCat[item.category]++;
      }
    });

    const todayCount = movements.filter(
      (m) => new Date(m.date).toDateString() === today
    ).length;

    return {
      totalItems: items.length,
      lowStockItems: lowStock,
      zeroStockItems: zeroStock,
      todayMovements: todayCount,
      estimatedValue: totalVal,
      byCategory: byCat,
    };
  }, [items, movements]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Category filter
        if (selectedCategory !== 'todos' && item.category !== selectedCategory) {
          return false;
        }

        // Status filter
        if (statusFilter === 'alertas' && item.quantity > item.minQuantity) {
          return false;
        }
        if (statusFilter === 'zerados' && item.quantity > 0) {
          return false;
        }
        if (statusFilter === 'ok' && item.quantity <= item.minQuantity) {
          return false;
        }

        // Search text
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchName = item.name.toLowerCase().includes(term);
          const matchCode = item.code.toLowerCase().includes(term);
          const matchLoc = item.location.toLowerCase().includes(term);
          const matchBar = item.barcode?.toLowerCase().includes(term);
          const matchNotes = item.notes?.toLowerCase().includes(term);
          if (!matchName && !matchCode && !matchLoc && !matchBar && !matchNotes) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'nome') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'codigo') {
          return a.code.localeCompare(b.code);
        }
        if (sortBy === 'menor_estoque') {
          // Put zero and low stocks first
          const ratioA = a.quantity / Math.max(1, a.minQuantity);
          const ratioB = b.quantity / Math.max(1, b.minQuantity);
          return ratioA - ratioB;
        }
        if (sortBy === 'maior_estoque') {
          return b.quantity - a.quantity;
        }
        return 0;
      });
  }, [items, selectedCategory, statusFilter, searchTerm, sortBy]);

  // Movement handler
  const handleRegisterMovement = async (params: RegisterMovementParams) => {
    await registerMovement(params);
    await refreshData();
  };

  // Item save handler
  const handleSaveItem = async (item: StockItem) => {
    await saveItem(item);
    await refreshData();
  };

  // Item delete handler
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    await deleteItem(itemToDelete.id);
    setItemToDelete(null);
    await refreshData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 print:bg-white print:text-black">
      {/* Header */}
      <Header
        itemsCount={items.length}
        onOpenNewItem={() => {
          setEditingItem(null);
          setIsNewItemModalOpen(true);
        }}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        onOpenScanner={() => setScannerModalState({ isOpen: true, displayItem: null })}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 print:hidden">
        {/* Statistics Dashboard Cards */}
        <StatsCards
          stats={stats}
          selectedFilter={statusFilter}
          onFilterAlerts={() => setStatusFilter(statusFilter === 'alertas' ? 'todos' : 'alertas')}
          onFilterAll={() => setStatusFilter('todos')}
        />

        {/* Data Visualization Section with Recharts */}
        <StockValueChart
          items={items}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Category Navigation Tabs */}
        <CategoryNav
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          items={items}
        />

        {/* Search, Filter & View Controls */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 sm:p-4 mb-5 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por nome, código (ELE-010), prateleira, código de barras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Quick Actions (Sort & View) */}
            <div className="flex items-center gap-2">
              {/* Sort selector */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-950 border border-slate-700/80 rounded-xl pl-3 pr-8 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none cursor-pointer"
                >
                  <option value="menor_estoque">Atenção / Menor Estoque</option>
                  <option value="nome">Nome (A - Z)</option>
                  <option value="codigo">Código (SKU)</option>
                  <option value="maior_estoque">Maior Quantidade</option>
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>

              {/* View toggle (Grid / Table) */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-700/80">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Visualização em Cards"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Visualização em Tabela"
                >
                  <TableIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick status filter pills */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>Status:</span>
            </span>

            <button
              onClick={() => setStatusFilter('todos')}
              type="button"
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                statusFilter === 'todos'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos ({items.length})
            </button>

            <button
              onClick={() => setStatusFilter('alertas')}
              type="button"
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                statusFilter === 'alertas'
                  ? 'bg-rose-500 text-white'
                  : 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Atenção / Reposição ({stats.lowStockItems + stats.zeroStockItems})</span>
            </button>

            <button
              onClick={() => setStatusFilter('ok')}
              type="button"
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                statusFilter === 'ok'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Estoque Normal ({items.length - (stats.lowStockItems + stats.zeroStockItems)})</span>
            </button>

            <button
              onClick={() => setStatusFilter('zerados')}
              type="button"
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                statusFilter === 'zerados'
                  ? 'bg-rose-900 text-rose-200 border border-rose-600'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              Esgotados / Zerados ({stats.zeroStockItems})
            </button>
          </div>
        </div>

        {/* Content View: Grid or Table */}
        {isLoading ? (
          <div className="text-center py-24">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-semibold text-slate-400">Carregando estoque do IndexedDB local...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-2xl border border-slate-800 bg-slate-900/40">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Nenhum material encontrado</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              Não encontramos itens com os filtros atuais. Experimente buscar outro termo ou cadastrar um novo item.
            </p>
            <div className="flex items-center justify-center gap-2">
              {(searchTerm || statusFilter !== 'todos' || selectedCategory !== 'todos') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('todos');
                    setSelectedCategory('todos');
                  }}
                  type="button"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                >
                  Limpar Filtros
                </button>
              )}
              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsNewItemModalOpen(true);
                }}
                type="button"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition"
              >
                Cadastrar Material
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onMovement={(targetItem, type) => {
                  setMovementModalState({
                    isOpen: true,
                    item: targetItem,
                    type,
                  });
                }}
                onEdit={(targetItem) => {
                  setEditingItem(targetItem);
                  setIsNewItemModalOpen(true);
                }}
                onDelete={(targetItem) => setItemToDelete(targetItem)}
                onShowBarcode={(targetItem) => {
                  setScannerModalState({
                    isOpen: true,
                    displayItem: targetItem,
                  });
                }}
              />
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-bold tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-3.5">Código / Item</th>
                    <th className="py-3 px-3">Especialidade</th>
                    <th className="py-3 px-3">Localização</th>
                    <th className="py-3 px-3 text-right">Saldo Atual</th>
                    <th className="py-3 px-3 text-right">Mínimo</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3.5 text-right">Ações Rápidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredItems.map((item) => {
                    const catMeta = CATEGORIES[item.category] || CATEGORIES.geral;
                    const isZero = item.quantity <= 0;
                    const isLow = !isZero && item.quantity <= item.minQuantity;

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-800/40 transition group"
                      >
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {item.code}
                            </span>
                            <span className="font-bold text-white text-xs sm:text-sm">
                              {item.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${catMeta.bgColor} ${catMeta.textColor} ${catMeta.borderColor}`}
                          >
                            {catMeta.shortLabel}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {item.location}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-sm">
                          <span
                            className={
                              isZero
                                ? 'text-rose-400'
                                : isLow
                                ? 'text-amber-400'
                                : 'text-white'
                            }
                          >
                            {item.quantity} {item.unit}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-slate-400">
                          {item.minQuantity} {item.unit}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {isZero ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              ZERADO
                            </span>
                          ) : isLow ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              BAIXO
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              OK
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() =>
                                setMovementModalState({
                                  isOpen: true,
                                  item,
                                  type: 'saida',
                                })
                              }
                              disabled={item.quantity <= 0}
                              className={`px-2 py-1 rounded text-xs font-bold transition cursor-pointer ${
                                item.quantity > 0
                                  ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                                  : 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
                              }`}
                            >
                              Saída
                            </button>
                            <button
                              onClick={() =>
                                setMovementModalState({
                                  isOpen: true,
                                  item,
                                  type: 'entrada',
                                })
                              }
                              className="px-2 py-1 rounded text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition cursor-pointer"
                            >
                              Entrada
                            </button>
                            <button
                              onClick={() => {
                                setEditingItem(item);
                                setIsNewItemModalOpen(true);
                              }}
                              className="px-2 py-1 rounded text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
                            >
                              Editar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button for Mobile Obra */}
      <div className="fixed bottom-4 right-4 sm:hidden z-30 flex flex-col gap-2">
        <button
          onClick={() => {
            setEditingItem(null);
            setIsNewItemModalOpen(true);
          }}
          type="button"
          className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 font-black shadow-xl shadow-amber-500/30 flex items-center justify-center active:scale-95 transition"
          title="Cadastrar Material"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>
      </div>

      {/* Print View rendered only during window.print() */}
      <PrintInventorySheet items={items} />

      {/* Modals */}
      <MovementModal
        item={movementModalState.item}
        initialType={movementModalState.type}
        isOpen={movementModalState.isOpen}
        onClose={() =>
          setMovementModalState({ isOpen: false, item: null, type: 'saida' })
        }
        onSubmit={handleRegisterMovement}
      />

      <ItemModal
        item={editingItem}
        defaultCategory={selectedCategory === 'todos' ? 'eletrica' : selectedCategory}
        isOpen={isNewItemModalOpen}
        onClose={() => {
          setIsNewItemModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        movements={movements}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        items={items}
        onRefreshData={refreshData}
      />

      <BarcodeScannerModal
        isOpen={scannerModalState.isOpen}
        displayItem={scannerModalState.displayItem}
        onClose={() => setScannerModalState({ isOpen: false, displayItem: null })}
        items={items}
        onSelectItem={(item) => {
          setMovementModalState({
            isOpen: true,
            item,
            type: 'saida',
          });
        }}
      />

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-white">Excluir Material?</h3>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Você está prestes a remover <strong>"{itemToDelete.name}"</strong> ({itemToDelete.code}) do almoxarifado. Esta ação removerá o registro do estoque local.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setItemToDelete(null)}
                type="button"
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteItem}
                type="button"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition active:scale-95"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
