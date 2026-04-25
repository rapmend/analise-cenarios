import { z } from 'zod';

export const SCHEMA_VERSION = 1;

export const ClienteSchema = z.object({
  id: z.string(),
  nome: z.string(),
  iniciais: z.string(),
  criadoEm: z.string(),
  atualizadoEm: z.string(),
});

export const CenarioAvistaSchema = z.object({
  id: z.string(),
  nome: z.string(),
  tipo: z.literal('avista'),
  valorImovel: z.number(),
  valorizAnual: z.number(),
  periodoMeses: z.number(),
  corretagem: z.number(),
  ir: z.number(),
  taxaDesc: z.number(),
});

export const CenarioParceladoSchema = z.object({
  id: z.string(),
  nome: z.string(),
  tipo: z.literal('parcelado'),
  valorImovel: z.number(),
  valorizAnual: z.number(),
  periodoMeses: z.number(),
  corretagem: z.number(),
  ir: z.number(),
  taxaDesc: z.number(),
  indexador: z.enum(['INCC', 'IGP-M', 'IPCA', 'CUB', 'Personalizado']),
  taxaIndexador: z.number(),
  tempoObra: z.number(),
  pctEntrada: z.number(),
  pctObra: z.number(),
});

export const CenarioSchema = z.discriminatedUnion('tipo', [CenarioAvistaSchema, CenarioParceladoSchema]);

export const EstudoSchema = z.object({
  id: z.string(),
  clienteId: z.string(),
  nome: z.string(),
  dataEmissao: z.string(),
  taxaDescontoVPL: z.number(),
  cenarios: z.array(CenarioSchema),
  criadoEm: z.string(),
  atualizadoEm: z.string(),
});

export const MetaSchema = z.object({
  schemaVersion: z.number(),
});
