export type EngineeringCategory = 'eletrica' | 'mecanica' | 'solda' | 'encanador' | 'geral';

export type MovementType = 'saida' | 'entrada' | 'devolucao' | 'ajuste';

export type UnitType = 'un' | 'm' | 'kg' | 'barra' | 'caixa' | 'rolo' | 'l' | 'par' | 'pacote' | 'peca';

export interface StockItem {
  id: string;
  code: string;
  name: string;
  category: EngineeringCategory;
  quantity: number;
  minQuantity: number;
  unit: UnitType;
  location: string;
  notes?: string;
  unitCost?: number;
  barcode?: string;
  lastUpdated: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  itemCode: string;
  category: EngineeringCategory;
  type: MovementType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  responsible: string; // Ex: Mestre Carlos, Soldador Silva, Eletricista Marcos
  workFront: string;   // Ex: Subestação, Galpão A, Tubulação Externa, Tubo de recalque
  date: string;        // ISO timestamp
  notes?: string;
}

export interface InventoryStats {
  totalItems: number;
  lowStockItems: number;
  zeroStockItems: number;
  todayMovements: number;
  estimatedValue: number;
  byCategory: Record<EngineeringCategory, number>;
}
