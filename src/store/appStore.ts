import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { Cliente, Estudo, Cenario } from '@/types';
import {
  listClientes,
  saveCliente,
  deleteCliente,
  listEstudos,
  saveEstudo,
  deleteEstudo,
  initStorage,
} from '@/lib/storage';
import { CENARIOS_INICIAIS, DEFAULT_TAXA_VPL } from '@/lib/calc';

interface AppState {
  clientes: Cliente[];
  estudosByCliente: Record<string, Estudo[]>;

  // Actions
  loadClientes: () => void;
  addCliente: (nome: string, iniciais: string) => Cliente;
  updateCliente: (id: string, patch: Partial<Pick<Cliente, 'nome' | 'iniciais'>>) => void;
  removeCliente: (id: string) => void;

  loadEstudos: (clienteId: string) => void;
  addEstudo: (clienteId: string, nome: string) => Estudo;
  updateEstudo: (estudo: Estudo) => void;
  removeEstudo: (id: string, clienteId: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  clientes: [],
  estudosByCliente: {},

  loadClientes: () => {
    initStorage();
    set({ clientes: listClientes() });
  },

  addCliente: (nome, iniciais) => {
    const now = new Date().toISOString();
    const c: Cliente = { id: nanoid(), nome, iniciais, criadoEm: now, atualizadoEm: now };
    saveCliente(c);
    set((s) => ({ clientes: [...s.clientes, c] }));
    return c;
  },

  updateCliente: (id, patch) => {
    const clientes = get().clientes.map((c) => {
      if (c.id !== id) return c;
      const updated = { ...c, ...patch, atualizadoEm: new Date().toISOString() };
      saveCliente(updated);
      return updated;
    });
    set({ clientes });
  },

  removeCliente: (id) => {
    deleteCliente(id);
    set((s) => ({
      clientes: s.clientes.filter((c) => c.id !== id),
      estudosByCliente: Object.fromEntries(
        Object.entries(s.estudosByCliente).filter(([k]) => k !== id)
      ),
    }));
  },

  loadEstudos: (clienteId) => {
    const estudos = listEstudos(clienteId);
    set((s) => ({ estudosByCliente: { ...s.estudosByCliente, [clienteId]: estudos } }));
  },

  addEstudo: (clienteId, nome) => {
    const now = new Date().toISOString();
    const e: Estudo = {
      id: nanoid(),
      clienteId,
      nome,
      dataEmissao: now.slice(0, 10),
      taxaDescontoVPL: DEFAULT_TAXA_VPL,
      cenarios: CENARIOS_INICIAIS.map((c) => ({ ...c, id: nanoid() })),
      criadoEm: now,
      atualizadoEm: now,
    };
    saveEstudo(e);
    set((s) => ({
      estudosByCliente: {
        ...s.estudosByCliente,
        [clienteId]: [...(s.estudosByCliente[clienteId] ?? []), e],
      },
    }));
    return e;
  },

  updateEstudo: (estudo) => {
    const updated = { ...estudo, atualizadoEm: new Date().toISOString() };
    saveEstudo(updated);
    set((s) => ({
      estudosByCliente: {
        ...s.estudosByCliente,
        [estudo.clienteId]: (s.estudosByCliente[estudo.clienteId] ?? []).map((e) =>
          e.id === estudo.id ? updated : e
        ),
      },
    }));
  },

  removeEstudo: (id, clienteId) => {
    deleteEstudo(id);
    set((s) => ({
      estudosByCliente: {
        ...s.estudosByCliente,
        [clienteId]: (s.estudosByCliente[clienteId] ?? []).filter((e) => e.id !== id),
      },
    }));
  },
}));

export function addCenario(estudo: Estudo, cenario: Cenario): Estudo {
  return { ...estudo, cenarios: [...estudo.cenarios, cenario] };
}

export function updateCenario(estudo: Estudo, cenario: Cenario): Estudo {
  return { ...estudo, cenarios: estudo.cenarios.map((c) => (c.id === cenario.id ? cenario : c)) };
}

export function removeCenario(estudo: Estudo, id: string): Estudo {
  return { ...estudo, cenarios: estudo.cenarios.filter((c) => c.id !== id) };
}
