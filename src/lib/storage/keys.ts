export const KEYS = {
  meta: 'akiva:meta',
  clienteIds: 'akiva:clientes',
  cliente: (id: string) => `akiva:cliente:${id}`,
  estudoIds: (clienteId: string) => `akiva:estudos:${clienteId}`,
  estudo: (id: string) => `akiva:estudo:${id}`,
} as const;
