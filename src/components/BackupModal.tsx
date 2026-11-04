import React, { useState, useRef } from 'react';
import { 
  X, 
  Database, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  Printer, 
  RotateCcw,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { StockItem } from '../types/inventory';
import { exportDatabaseToJson, importDatabaseFromJson, resetDatabaseToDefaults } from '../db/indexedDB';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: StockItem[];
  onRefreshData: () => Promise<void>;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  items,
  onRefreshData,
}) => {
  if (!isOpen) return null;

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Export full JSON database
  const handleExportJson = async () => {
    try {
      const json = await exportDatabaseToJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-almoxarifado-obra-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setFeedbackMsg({ type: 'success', text: 'Backup completo exportado com sucesso!' });
    } catch (err: unknown) {
      setFeedbackMsg({ type: 'error', text: 'Erro ao exportar backup: ' + (err instanceof Error ? err.message : '') });
    }
  };

  // Import JSON backup
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const result = await importDatabaseFromJson(text);
      await onRefreshData();
      setFeedbackMsg({
        type: 'success',
        text: `Backup restaurado com sucesso! ${result.itemsCount} materiais e ${result.movementsCount} movimentações carregadas no IndexedDB.`,
      });
    } catch (err: unknown) {
      setFeedbackMsg({
        type: 'error',
        text: 'Falha ao restaurar: Arquivo inválido ou corrompido.',
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Export Inventory Snapshot to CSV (Excel)
  const handleExportInventoryCsv = () => {
    const headers = [
      'Código',
      'Material / Descrição',
      'Especialidade',
      'Quantidade Atual',
      'Unidade',
      'Estoque Mínimo',
      'Status',
      'Localização no Almoxarifado',
      'Custo Unitário (R$)',
      'Valor Total em Estoque (R$)',
      'Código de Barras / EAN',
      'Última Atualização',
    ];

    const rows = items.map((item) => {
      const status = item.quantity <= 0 ? 'ZERADO' : item.quantity <= item.minQuantity ? 'ESTOQUE BAIXO' : 'OK';
      const totalVal = (item.unitCost || 0) * item.quantity;

      return [
        item.code,
        `"${item.name.replace(/"/g, '""')}"`,
        item.category.toUpperCase(),
        item.quantity,
        item.unit,
        item.minQuantity,
        status,
        `"${item.location.replace(/"/g, '""')}"`,
        (item.unitCost || 0).toFixed(2),
        totalVal.toFixed(2),
        item.barcode || '',
        new Date(item.lastUpdated).toLocaleDateString('pt-BR'),
      ];
    });

    const csvContent =
      '\uFEFF' +
      [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventario-estoque-obra-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setFeedbackMsg({ type: 'success', text: 'Planilha de inventário CSV gerada para download.' });
  };

  // Print Inventory Sheet
  const handlePrint = () => {
    window.print();
  };

  // Reset to defaults
  const handleResetDefaults = async () => {
    try {
      await resetDatabaseToDefaults();
      await onRefreshData();
      setIsResetConfirmOpen(false);
      setFeedbackMsg({ type: 'success', text: 'Banco de dados restaurado com os itens padrão de engenharia!' });
    } catch (err: unknown) {
      setFeedbackMsg({ type: 'error', text: 'Erro ao restaurar padrões.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Relatórios, Backup & IndexedDB
              </h2>
              <p className="text-xs text-slate-400">
                Gestão e segurança dos dados locais da obra
              </p>
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

        <div className="p-4 sm:p-6 space-y-4">
          {feedbackMsg && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2 text-xs ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              }`}
            >
              {feedbackMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          {/* Action grid */}
          <div className="space-y-3">
            {/* Export CSV Planilha */}
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/70 flex items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Planilha de Inventário (Excel / CSV)</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Gera arquivo compatível com Excel com todos os saldos e valores.
                </p>
              </div>
              <button
                onClick={handleExportInventoryCsv}
                type="button"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition active:scale-95 shrink-0 cursor-pointer"
              >
                Baixar Planilha
              </button>
            </div>

            {/* Print Sheet for Physical Counting */}
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/70 flex items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-sky-400" />
                  <span>Imprimir Folha de Contagem Física</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Formato limpo para prancheta de conferência no almoxarifado.
                </p>
              </div>
              <button
                onClick={handlePrint}
                type="button"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition active:scale-95 shrink-0 cursor-pointer"
              >
                Imprimir
              </button>
            </div>

            {/* Export JSON Backup */}
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/70 flex items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Backup Completo (Arquivo JSON)</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Salva todo o banco IndexedDB (itens + histórico de saídas/entradas).
                </p>
              </div>
              <button
                onClick={handleExportJson}
                type="button"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 transition active:scale-95 shrink-0 cursor-pointer"
              >
                Exportar JSON
              </button>
            </div>

            {/* Import JSON Backup */}
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/70 flex items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-purple-400" />
                  <span>Restaurar Backup</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Carregar um arquivo JSON de backup feito anteriormente.
                </p>
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json,application/json"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 transition active:scale-95 shrink-0 cursor-pointer"
                >
                  Selecionar Arquivo
                </button>
              </div>
            </div>

            {/* Reset Defaults */}
            <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-rose-300 flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4 text-rose-400" />
                    <span>Restaurar Materiais Padrão</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Recarrega os materiais pré-configurados de elétrica, mecânica, solda e hidráulica.
                  </p>
                </div>
                {!isResetConfirmOpen ? (
                  <button
                    onClick={() => setIsResetConfirmOpen(true)}
                    type="button"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition active:scale-95 shrink-0 cursor-pointer"
                  >
                    Restaurar
                  </button>
                ) : null}
              </div>

              {isResetConfirmOpen && (
                <div className="mt-3 p-3 rounded-lg bg-rose-950/60 border border-rose-500/50 space-y-2">
                  <p className="text-xs text-rose-200 font-medium">
                    Tem certeza? Isso irá substituir todos os dados atuais pelos itens de demonstração da obra.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetDefaults}
                      type="button"
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition active:scale-95 cursor-pointer"
                    >
                      Sim, Restaurar Padrões
                    </button>
                    <button
                      onClick={() => setIsResetConfirmOpen(false)}
                      type="button"
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
