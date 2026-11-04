import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { StockItem, StockMovement, EngineeringCategory } from '../types/inventory';

const DB_NAME = 'ObraEngenhariaEstoqueDB';
const DB_VERSION = 1;

interface ObraDB extends DBSchema {
  items: {
    key: string;
    value: StockItem;
    indexes: {
      'by-category': EngineeringCategory;
      'by-code': string;
      'by-name': string;
    };
  };
  movements: {
    key: string;
    value: StockMovement;
    indexes: {
      'by-item': string;
      'by-date': string;
      'by-type': string;
      'by-category': string;
    };
  };
  settings: {
    key: string;
    value: unknown;
  };
}

// Initial seed data reflecting a real Brazilian engineering & construction site
export const INITIAL_SEEDS: StockItem[] = [
  // --- ELÉTRICA ---
  {
    id: 'ele-01',
    code: 'ELE-010',
    name: 'Cabo Flexível 2,5mm² 750V Azul (Rolo 100m)',
    category: 'eletrica',
    quantity: 6,
    minQuantity: 3,
    unit: 'rolo',
    location: 'Prateleira E-01 (Setor Elétrica)',
    unitCost: 185.0,
    barcode: '7891001002501',
    notes: 'Uso geral em circuitos monofásicos e tomadas 127V',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'ele-02',
    code: 'ELE-011',
    name: 'Cabo Flexível 4,0mm² 750V Vermelho (Rolo 100m)',
    category: 'eletrica',
    quantity: 2,
    minQuantity: 4, // Alerta de baixo estoque proposital
    unit: 'rolo',
    location: 'Prateleira E-01 (Setor Elétrica)',
    unitCost: 295.0,
    barcode: '7891001004002',
    notes: 'Circuitos de chuveiros e tomadas de força',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'ele-03',
    code: 'ELE-025',
    name: 'Disjuntor Bipolar DIN 32A Curva C',
    category: 'eletrica',
    quantity: 14,
    minQuantity: 5,
    unit: 'un',
    location: 'Gaveteiro E-04',
    unitCost: 42.5,
    barcode: '7891001003205',
    notes: 'Marca padrão Steck/Schneider',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'ele-04',
    code: 'ELE-030',
    name: 'Conector de Emenda Wago 221-413 (3 vias)',
    category: 'eletrica',
    quantity: 85,
    minQuantity: 30,
    unit: 'un',
    location: 'Gaveteiro E-02',
    unitCost: 3.2,
    barcode: '7891001002213',
    notes: 'Caixas de derivação rápida',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'ele-05',
    code: 'ELE-042',
    name: 'Eletroduto Corrugado Amarelo 3/4" (Rolo 50m)',
    category: 'eletrica',
    quantity: 1,
    minQuantity: 2,
    unit: 'rolo',
    location: 'Galpão Principal - Fundo',
    unitCost: 65.0,
    barcode: '7891001000750',
    notes: 'Passagem em alvenaria',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'ele-06',
    code: 'ELE-050',
    name: 'Fita Isolante 3M Scotch 33+ (19mm x 20m)',
    category: 'eletrica',
    quantity: 18,
    minQuantity: 10,
    unit: 'rolo',
    location: 'Gaveteiro E-01',
    unitCost: 14.8,
    barcode: '7891001033201',
    notes: 'Classe A até 750V e 105°C',
    lastUpdated: new Date().toISOString(),
  },

  // --- MECÂNICA ---
  {
    id: 'mec-01',
    code: 'MEC-101',
    name: 'Parafuso Sextavado Aço 8.8 M10 x 50mm RI (Cento)',
    category: 'mecanica',
    quantity: 4,
    minQuantity: 2,
    unit: 'caixa',
    location: 'Prateleira M-03 (Fixadores)',
    unitCost: 78.0,
    barcode: '7892002010501',
    notes: 'Acompanha porca e arruela em caixas separadas',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'mec-02',
    code: 'MEC-105',
    name: 'Porca Sextavada Autotravante M10 Aço (Cento)',
    category: 'mecanica',
    quantity: 5,
    minQuantity: 3,
    unit: 'caixa',
    location: 'Prateleira M-03 (Fixadores)',
    unitCost: 45.0,
    barcode: '7892002010002',
    notes: 'Com inserto de nylon anti-vibração',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'mec-03',
    code: 'MEC-120',
    name: 'Rolamento Rígido de Esferas 6205 DDU (Vedado)',
    category: 'mecanica',
    quantity: 0,
    minQuantity: 4, // Crítico / Zerado
    unit: 'un',
    location: 'Gaveta M-08 (Rolamentos)',
    unitCost: 38.0,
    barcode: '7892002062050',
    notes: 'Aplicação nos motores das bombas de recalque',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'mec-04',
    code: 'MEC-135',
    name: 'Graxa Azul para Rolamentos Alta Temperatura (1kg)',
    category: 'mecanica',
    quantity: 7,
    minQuantity: 2,
    unit: 'un',
    location: 'Armário de Químicos - Prateleira 1',
    unitCost: 42.0,
    barcode: '7892002001001',
    notes: 'Lítio complexo com aditivo EP',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'mec-05',
    code: 'MEC-150',
    name: 'Chumbador Parabolt 1/2" x 4.1/4" em Aço Zincado',
    category: 'mecanica',
    quantity: 40,
    minQuantity: 15,
    unit: 'un',
    location: 'Gaveteiro M-05',
    unitCost: 7.5,
    barcode: '7892002005005',
    notes: 'Fixação de bases metálicas no concreto',
    lastUpdated: new Date().toISOString(),
  },

  // --- SOLDA ---
  {
    id: 'sol-01',
    code: 'SOL-201',
    name: 'Eletrodo Revestido AWS E6013 2,50mm (Caixa 5kg)',
    category: 'solda',
    quantity: 8,
    minQuantity: 4,
    unit: 'caixa',
    location: 'Estufa de Eletrodos S-01',
    unitCost: 95.0,
    barcode: '7893003060132',
    notes: 'Serralheria leve e estruturas de suporte',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'sol-02',
    code: 'SOL-202',
    name: 'Eletrodo Revestido AWS E7018 3,25mm Baixo Hidrogênio (5kg)',
    category: 'solda',
    quantity: 1,
    minQuantity: 3, // Estoque baixo
    unit: 'caixa',
    location: 'Estufa Aquecida S-02 (120°C)',
    unitCost: 125.0,
    barcode: '7893003070183',
    notes: 'Estruturas pesadas sob inspeção de ultrassom',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'sol-03',
    code: 'SOL-215',
    name: 'Disco de Corte Fino para Inox e Aço 4.1/2" x 1.0mm',
    category: 'solda',
    quantity: 45,
    minQuantity: 20,
    unit: 'un',
    location: 'Gaveta S-04',
    unitCost: 5.8,
    barcode: '7893003004121',
    notes: 'Uso contínuo em esmerilhadeiras manuais',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'sol-04',
    code: 'SOL-218',
    name: 'Disco Flap Grão 60 Zircônio 4.1/2"',
    category: 'solda',
    quantity: 12,
    minQuantity: 10,
    unit: 'un',
    location: 'Gaveta S-04',
    unitCost: 11.5,
    barcode: '7893003006004',
    notes: 'Desbaste e acabamento pós-solda',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'sol-05',
    code: 'SOL-230',
    name: 'Bico de Contato MIG M6 1.0mm (Pacote 10un)',
    category: 'solda',
    quantity: 6,
    minQuantity: 2,
    unit: 'pacote',
    location: 'Maleta de Tochas MIG',
    unitCost: 28.0,
    barcode: '7893003000109',
    notes: 'Reposição para tochas padrão Euroconector 36KD',
    lastUpdated: new Date().toISOString(),
  },

  // --- ENCANADOR / HIDRÁULICA ---
  {
    id: 'hid-01',
    code: 'HID-301',
    name: 'Tubo PVC Soldável Marrom 25mm 3/4" (Barra 6m)',
    category: 'encanador',
    quantity: 15,
    minQuantity: 6,
    unit: 'barra',
    location: 'Rack de Tubos Externo - Viga 1',
    unitCost: 28.5,
    barcode: '7894004000253',
    notes: 'Água fria predial',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'hid-02',
    code: 'HID-305',
    name: 'Joelho 90° PVC Soldável 25mm',
    category: 'encanador',
    quantity: 62,
    minQuantity: 25,
    unit: 'un',
    location: 'Gaveteiro H-01',
    unitCost: 1.2,
    barcode: '7894004000901',
    notes: 'Conexão padrão predial',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'hid-03',
    code: 'HID-312',
    name: 'Válvula de Esfera Metal Latão 1" Rosca BSP',
    category: 'encanador',
    quantity: 3,
    minQuantity: 4, // Estoque baixo
    unit: 'un',
    location: 'Prateleira H-03 (Metais e Registros)',
    unitCost: 48.0,
    barcode: '7894004001004',
    notes: 'Bloqueio de recalque e cavaletes',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'hid-04',
    code: 'HID-320',
    name: 'Fita Veda Rosca Teflon 18mm x 50m',
    category: 'encanador',
    quantity: 16,
    minQuantity: 5,
    unit: 'rolo',
    location: 'Gaveteiro H-02',
    unitCost: 8.5,
    barcode: '7894004000508',
    notes: 'Vedação roscas NPT e BSP',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'hid-05',
    code: 'HID-330',
    name: 'Adesivo Plástico para Tubos PVC Frasco 175g com Pincel',
    category: 'encanador',
    quantity: 5,
    minQuantity: 3,
    unit: 'un',
    location: 'Armário de Químicos - Prateleira 2',
    unitCost: 19.5,
    barcode: '7894004001755',
    notes: 'Secagem rápida Tigre/Amanco',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'hid-06',
    code: 'HID-340',
    name: 'Tubo de Esgoto Série Normal PVC 100mm 4" (Barra 6m)',
    category: 'encanador',
    quantity: 0,
    minQuantity: 5, // Zerado
    unit: 'barra',
    location: 'Rack de Tubos Externo - Viga 3',
    unitCost: 64.0,
    barcode: '7894004001000',
    notes: 'Ramais de esgoto sanitário e prumadas',
    lastUpdated: new Date().toISOString(),
  },
];

let dbPromise: Promise<IDBPDatabase<ObraDB>> | null = null;

export async function getDb(): Promise<IDBPDatabase<ObraDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ObraDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Items Store
        if (!db.objectStoreNames.contains('items')) {
          const itemStore = db.createObjectStore('items', { keyPath: 'id' });
          itemStore.createIndex('by-category', 'category');
          itemStore.createIndex('by-code', 'code');
          itemStore.createIndex('by-name', 'name');
        }

        // Movements Store
        if (!db.objectStoreNames.contains('movements')) {
          const moveStore = db.createObjectStore('movements', { keyPath: 'id' });
          moveStore.createIndex('by-item', 'itemId');
          moveStore.createIndex('by-date', 'date');
          moveStore.createIndex('by-type', 'type');
          moveStore.createIndex('by-category', 'category');
        }

        // Settings Store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      },
    });
  }

  const db = await dbPromise;

  // Check if DB is initialized with seed data
  const count = await db.count('items');
  if (count === 0) {
    console.log('[IndexedDB] Initializing empty database with engineering presets...');
    const tx = db.transaction(['items', 'movements'], 'readwrite');
    for (const seed of INITIAL_SEEDS) {
      await tx.objectStore('items').put(seed);
    }
    // Also add a sample initial movement for context
    const sampleMovement: StockMovement = {
      id: 'mov-initial-01',
      itemId: 'ele-01',
      itemName: 'Cabo Flexível 2,5mm² 750V Azul (Rolo 100m)',
      itemCode: 'ELE-010',
      category: 'eletrica',
      type: 'entrada',
      quantity: 6,
      previousQuantity: 0,
      newQuantity: 6,
      responsible: 'Almoxarife Chefe - NF 84920',
      workFront: 'Recepção e Triagem Geral',
      date: new Date(Date.now() - 3600000 * 5).toISOString(),
      notes: 'Carga inicial conferida no almoxarifado',
    };
    await tx.objectStore('movements').put(sampleMovement);
    await tx.done;
  }

  return db;
}

// ----------------- CRUD ITEMS -----------------

export async function getAllItems(): Promise<StockItem[]> {
  const db = await getDb();
  return db.getAll('items');
}

export async function getItemById(id: string): Promise<StockItem | undefined> {
  const db = await getDb();
  return db.get('items', id);
}

export async function saveItem(item: StockItem): Promise<void> {
  const db = await getDb();
  const existing = await db.get('items', item.id);
  const now = new Date().toISOString();

  await db.put('items', {
    ...item,
    lastUpdated: now,
  });

  // If new item or quantity changed directly via edit, record adjustment
  if (!existing) {
    const initialMovement: StockMovement = {
      id: 'mov-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      itemId: item.id,
      itemName: item.name,
      itemCode: item.code,
      category: item.category,
      type: 'entrada',
      quantity: item.quantity,
      previousQuantity: 0,
      newQuantity: item.quantity,
      responsible: 'Cadastro Inicial',
      workFront: 'Almoxarifado Central',
      date: now,
      notes: 'Item cadastrado no sistema',
    };
    await db.put('movements', initialMovement);
  } else if (existing.quantity !== item.quantity) {
    const diff = item.quantity - existing.quantity;
    const adjustMovement: StockMovement = {
      id: 'mov-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      itemId: item.id,
      itemName: item.name,
      itemCode: item.code,
      category: item.category,
      type: 'ajuste',
      quantity: Math.abs(diff),
      previousQuantity: existing.quantity,
      newQuantity: item.quantity,
      responsible: 'Inventário / Correção',
      workFront: 'Conferência Física',
      date: now,
      notes: diff > 0 ? `Ajuste para mais (+${diff})` : `Ajuste para menos (${diff})`,
    };
    await db.put('movements', adjustMovement);
  }
}

export async function deleteItem(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('items', id);
}

// ----------------- MOVEMENTS -----------------

export interface RegisterMovementParams {
  itemId: string;
  type: StockMovement['type'];
  quantity: number;
  responsible: string;
  workFront: string;
  notes?: string;
}

export async function registerMovement(params: RegisterMovementParams): Promise<StockMovement> {
  const db = await getDb();
  const tx = db.transaction(['items', 'movements'], 'readwrite');
  const itemStore = tx.objectStore('items');
  const movementStore = tx.objectStore('movements');

  const item = await itemStore.get(params.itemId);
  if (!item) {
    throw new Error(`Item não encontrado com o ID: ${params.itemId}`);
  }

  const prevQty = item.quantity;
  let newQty = prevQty;

  if (params.type === 'saida') {
    newQty = Math.max(0, prevQty - params.quantity);
  } else if (params.type === 'entrada') {
    newQty = prevQty + params.quantity;
  } else if (params.type === 'devolucao') {
    newQty = prevQty + params.quantity;
  } else if (params.type === 'ajuste') {
    newQty = params.quantity;
  }

  const now = new Date().toISOString();

  // Update item in store
  item.quantity = newQty;
  item.lastUpdated = now;
  await itemStore.put(item);

  // Create movement record
  const movement: StockMovement = {
    id: 'mov-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    itemId: item.id,
    itemName: item.name,
    itemCode: item.code,
    category: item.category,
    type: params.type,
    quantity: params.quantity,
    previousQuantity: prevQty,
    newQuantity: newQty,
    responsible: params.responsible.trim() || 'Não informado',
    workFront: params.workFront.trim() || 'Frente Geral',
    date: now,
    notes: params.notes?.trim() || undefined,
  };

  await movementStore.put(movement);
  await tx.done;

  return movement;
}

export async function getAllMovements(): Promise<StockMovement[]> {
  const db = await getDb();
  const movements = await db.getAll('movements');
  // Sort descending (most recent first)
  return movements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// ----------------- BACKUP & RESET -----------------

export async function exportDatabaseToJson(): Promise<string> {
  const db = await getDb();
  const items = await db.getAll('items');
  const movements = await db.getAll('movements');

  const exportData = {
    exportedAt: new Date().toISOString(),
    appName: 'Almoxarifado Obra - Estoque PWA',
    version: DB_VERSION,
    data: {
      items,
      movements,
    },
  };

  return JSON.stringify(exportData, null, 2);
}

export async function importDatabaseFromJson(jsonString: string): Promise<{ itemsCount: number; movementsCount: number }> {
  const parsed = JSON.parse(jsonString);
  if (!parsed.data || !Array.isArray(parsed.data.items)) {
    throw new Error('Arquivo JSON inválido para restauração de estoque.');
  }

  const db = await getDb();
  const tx = db.transaction(['items', 'movements'], 'readwrite');
  const itemStore = tx.objectStore('items');
  const moveStore = tx.objectStore('movements');

  await itemStore.clear();
  await moveStore.clear();

  for (const item of parsed.data.items) {
    await itemStore.put(item);
  }

  if (Array.isArray(parsed.data.movements)) {
    for (const mov of parsed.data.movements) {
      await moveStore.put(mov);
    }
  }

  await tx.done;

  return {
    itemsCount: parsed.data.items.length,
    movementsCount: parsed.data.movements?.length || 0,
  };
}

export async function resetDatabaseToDefaults(): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(['items', 'movements'], 'readwrite');
  const itemStore = tx.objectStore('items');
  const moveStore = tx.objectStore('movements');

  await itemStore.clear();
  await moveStore.clear();

  for (const seed of INITIAL_SEEDS) {
    await itemStore.put(seed);
  }

  const initialMovement: StockMovement = {
    id: 'mov-reset-' + Date.now(),
    itemId: 'ele-01',
    itemName: 'Cabo Flexível 2,5mm² 750V Azul (Rolo 100m)',
    itemCode: 'ELE-010',
    category: 'eletrica',
    type: 'entrada',
    quantity: 6,
    previousQuantity: 0,
    newQuantity: 6,
    responsible: 'Restauração do Sistema',
    workFront: 'Almoxarifado Central',
    date: new Date().toISOString(),
    notes: 'Banco de dados restaurado para configurações padrão da obra',
  };
  await moveStore.put(initialMovement);

  await tx.done;
}
