import type { Cliente, Estudo } from '@/types';
import { ClienteSchema, EstudoSchema, MetaSchema, SCHEMA_VERSION } from './schema';
import { KEYS } from './keys';

function get<T>(key: string, schema: { safeParse: (v: unknown) => { success: boolean; data?: T } }): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const result = schema.safeParse(JSON.parse(raw));
    if (!result.success) { console.warn('[storage] invalid data at', key); return null; }
    return result.data!;
  } catch (e) {
    console.warn('[storage] error reading', key, e);
    return null;
  }
}

function set(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (e) { console.error('[storage] error writing', key, e); }
}

function del(key: string): void {
  localStorage.removeItem(key);
}

export function initStorage(): void {
  const meta = get(KEYS.meta, MetaSchema);
  if (!meta) {
    set(KEYS.meta, { schemaVersion: SCHEMA_VERSION });
  }
}

// Clientes
export function listClienteIds(): string[] {
  const raw = localStorage.getItem(KEYS.clienteIds);
  try { return raw ? (JSON.parse(raw) as string[]) : []; }
  catch { return []; }
}

export function getCliente(id: string): Cliente | null {
  return get(KEYS.cliente(id), ClienteSchema);
}

export function saveCliente(c: Cliente): void {
  const ids = listClienteIds();
  if (!ids.includes(c.id)) {
    ids.push(c.id);
    set(KEYS.clienteIds, ids);
  }
  set(KEYS.cliente(c.id), c);
}

export function deleteCliente(id: string): void {
  // Cascade estudos
  const estudoIds = listEstudoIds(id);
  estudoIds.forEach((eid) => deleteEstudo(eid));
  del(KEYS.estudoIds(id));
  del(KEYS.cliente(id));
  const ids = listClienteIds().filter((i) => i !== id);
  set(KEYS.clienteIds, ids);
}

export function listClientes(): Cliente[] {
  return listClienteIds()
    .map(getCliente)
    .filter((c): c is Cliente => c !== null);
}

// Estudos
export function listEstudoIds(clienteId: string): string[] {
  const raw = localStorage.getItem(KEYS.estudoIds(clienteId));
  try { return raw ? (JSON.parse(raw) as string[]) : []; }
  catch { return []; }
}

export function getEstudo(id: string): Estudo | null {
  return get(KEYS.estudo(id), EstudoSchema);
}

export function saveEstudo(e: Estudo): void {
  const ids = listEstudoIds(e.clienteId);
  if (!ids.includes(e.id)) {
    ids.push(e.id);
    set(KEYS.estudoIds(e.clienteId), ids);
  }
  set(KEYS.estudo(e.id), e);
}

export function deleteEstudo(id: string): void {
  const e = getEstudo(id);
  if (e) {
    const ids = listEstudoIds(e.clienteId).filter((i) => i !== id);
    set(KEYS.estudoIds(e.clienteId), ids);
  }
  del(KEYS.estudo(id));
}

export function listEstudos(clienteId: string): Estudo[] {
  return listEstudoIds(clienteId)
    .map(getEstudo)
    .filter((e): e is Estudo => e !== null);
}
