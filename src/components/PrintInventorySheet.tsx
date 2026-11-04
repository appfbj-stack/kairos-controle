import React from 'react';
import { StockItem } from '../types/inventory';
import { CATEGORIES } from '../utils/categories';
import { ENV } from '../config/env';

interface PrintInventorySheetProps {
  items: StockItem[];
}

export const PrintInventorySheet: React.FC<PrintInventorySheetProps> = ({ items }) => {
  return (
    <div className="hidden print:block text-black bg-white p-6 font-sans">
      {/* Print Header */}
      <div className="border-b-2 border-black pb-4 mb-4 flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wider">
            Folha de Conferência Física - {ENV.appName}
          </h1>
          <p className="text-xs text-gray-700 mt-1">
            {ENV.obraName} • Elétrica • Mecânica • Soldagem • Hidráulica
          </p>
        </div>
        <div className="text-right text-xs">
          <div><strong>Data da Impressão:</strong> {new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR')}</div>
          <div><strong>Total de Itens:</strong> {items.length}</div>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b-2 border-black bg-gray-100">
            <th className="py-1.5 px-2 text-left font-bold w-20">CÓDIGO</th>
            <th className="py-1.5 px-2 text-left font-bold">MATERIAL / DESCRIÇÃO</th>
            <th className="py-1.5 px-2 text-left font-bold w-24">DISCIPLINA</th>
            <th className="py-1.5 px-2 text-left font-bold w-24">LOCAL</th>
            <th className="py-1.5 px-2 text-right font-bold w-20">SALDO SISTEMA</th>
            <th className="py-1.5 px-2 text-center font-bold w-24">CONTAGEM REAL</th>
            <th className="py-1.5 px-2 text-center font-bold w-16">CONF.</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr
              key={item.id}
              className={`border-b border-gray-300 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
            >
              <td className="py-2 px-2 font-mono font-bold">{item.code}</td>
              <td className="py-2 px-2">
                <div className="font-semibold">{item.name}</div>
                {item.notes && <div className="text-[10px] text-gray-500 italic">{item.notes}</div>}
              </td>
              <td className="py-2 px-2 capitalize">
                {CATEGORIES[item.category]?.shortLabel || item.category}
              </td>
              <td className="py-2 px-2 text-gray-600">{item.location}</td>
              <td className="py-2 px-2 text-right font-bold">
                {item.quantity} {item.unit}
              </td>
              <td className="py-2 px-2 text-center font-mono">
                [ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ]
              </td>
              <td className="py-2 px-2 text-center font-mono">
                ( &nbsp; )
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Signatures */}
      <div className="mt-12 pt-4 border-t border-gray-400 grid grid-cols-2 gap-8 text-xs text-center">
        <div>
          <div className="border-t border-black w-3/4 mx-auto pt-1 mb-1">
            <strong>Assinatura do Almoxarife Responsável</strong>
          </div>
          <div className="text-gray-600">Nome Legível: _______________________________</div>
        </div>
        <div>
          <div className="border-t border-black w-3/4 mx-auto pt-1 mb-1">
            <strong>Visto do Engenheiro / Mestre de Obra</strong>
          </div>
          <div className="text-gray-600">CREA / Matrícula: ___________________________</div>
        </div>
      </div>
    </div>
  );
};
