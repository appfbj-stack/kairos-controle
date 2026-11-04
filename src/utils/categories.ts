import { Zap, Wrench, Flame, Droplets, Package } from 'lucide-react';
import React from 'react';
import { EngineeringCategory } from '../types/inventory';

export interface CategoryMeta {
  key: EngineeringCategory | 'todos';
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  badgeBg: string;
  description: string;
}

export const CATEGORIES: Record<EngineeringCategory | 'todos', CategoryMeta> = {
  todos: {
    key: 'todos',
    label: 'Todos os Materiais',
    shortLabel: 'Geral',
    icon: Package,
    color: '#94a3b8',
    borderColor: 'border-slate-700',
    bgColor: 'bg-slate-800',
    textColor: 'text-slate-100',
    badgeBg: 'bg-slate-700/50',
    description: 'Visão unificada de todos os itens do almoxarifado',
  },
  eletrica: {
    key: 'eletrica',
    label: 'Engenharia Elétrica',
    shortLabel: 'Elétrica',
    icon: Zap,
    color: '#eab308',
    borderColor: 'border-yellow-500/30',
    bgColor: 'bg-yellow-500/10',
    textColor: 'text-yellow-400',
    badgeBg: 'bg-yellow-500/20 text-yellow-300',
    description: 'Cabos, fios, disjuntores, conectores, eletrodutos e automação',
  },
  mecanica: {
    key: 'mecanica',
    label: 'Engenharia Mecânica',
    shortLabel: 'Mecânica',
    icon: Wrench,
    color: '#60a5fa',
    borderColor: 'border-blue-500/30',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-400',
    badgeBg: 'bg-blue-500/20 text-blue-300',
    description: 'Fixadores, rolamentos, parafusos 8.8, graxas, correias e peças',
  },
  solda: {
    key: 'solda',
    label: 'Soldagem & Caldeiraria',
    shortLabel: 'Solda',
    icon: Flame,
    color: '#f97316',
    borderColor: 'border-orange-500/30',
    bgColor: 'bg-orange-500/10',
    textColor: 'text-orange-400',
    badgeBg: 'bg-orange-500/20 text-orange-300',
    description: 'Eletrodos 6013/7018, bicos MIG/TIG, discos de corte, abrasivos',
  },
  encanador: {
    key: 'encanador',
    label: 'Hidráulica & Encanador',
    shortLabel: 'Hidráulica',
    icon: Droplets,
    color: '#38bdf8',
    borderColor: 'border-sky-500/30',
    bgColor: 'bg-sky-500/10',
    textColor: 'text-sky-400',
    badgeBg: 'bg-sky-500/20 text-sky-300',
    description: 'Tubulações PVC/PPR, válvulas, registros, conexões e vedações',
  },
  geral: {
    key: 'geral',
    label: 'Geral & EPIs',
    shortLabel: 'Geral',
    icon: Package,
    color: '#a855f7',
    borderColor: 'border-purple-500/30',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-400',
    badgeBg: 'bg-purple-500/20 text-purple-300',
    description: 'Itens de uso compartilhado, sinalização e insumos gerais',
  },
};
