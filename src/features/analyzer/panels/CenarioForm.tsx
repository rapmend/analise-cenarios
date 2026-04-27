import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Cenario, CenarioAvista, CenarioParcelado, Indexador } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const INDEXADORES: Indexador[] = ['INCC', 'IGP-M', 'IPCA', 'CUB', 'Personalizado'];

const baseSchema = z.object({
  nome: z.string().min(1),
  tipo: z.enum(['avista', 'parcelado']),
  valorImovel: z.number().positive(),
  valorizAnual: z.number().min(0),
  periodoMeses: z.number().int().positive(),
  corretagem: z.number().min(0),
  ir: z.number().min(0),
  taxaDesc: z.number().min(0),
});

const avistaSchema = baseSchema.extend({ tipo: z.literal('avista') });
const parceladoSchema = baseSchema.extend({
  tipo: z.literal('parcelado'),
  indexador: z.enum(['INCC', 'IGP-M', 'IPCA', 'CUB', 'Personalizado']),
  taxaIndexador: z.number().min(0),
  tempoObra: z.number().int().positive(),
  pctEntrada: z.number().min(0).max(1),
  pctObra: z.number().min(0).max(1),
});

const cenarioSchema = z.discriminatedUnion('tipo', [avistaSchema, parceladoSchema]);
type FormValues = z.infer<typeof cenarioSchema>;

interface Props {
  cenario: Cenario;
  onChange: (c: Cenario) => void;
  onRemove?: () => void;
  canRemove?: boolean;
}

function pctVal(v: number) { return +(v * 100).toFixed(4); }
function fromPct(s: string) { return parseFloat(s.replace(',', '.')) / 100 || 0; }

function PctInput({ value, onChange, label, readOnly }: { value: number; onChange: (v: number) => void; label: string; readOnly?: boolean }) {
  return (
    <div className="space-y-1">
      <Label className="text-gray-400 text-xs">{label}</Label>
      <div className="relative">
        <Input
          type="number"
          step="0.01"
          value={pctVal(value)}
          onChange={(e) => onChange(fromPct(e.target.value))}
          readOnly={readOnly}
          className="bg-akiva-navy border-akiva-border text-white pr-7 text-sm focus:border-akiva-gold [appearance:textfield] read-only:opacity-60"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">%</span>
      </div>
    </div>
  );
}

function IntInput({ value, onChange, label, min = 1 }: { value: number; onChange: (v: number) => void; label: string; min?: number }) {
  const safeValue = Number.isFinite(value) && value >= min ? Math.round(value) : min;
  return (
    <div className="space-y-1">
      <Label className="text-gray-400 text-xs">{label}</Label>
      <Input
        type="number"
        step="1"
        min={min}
        value={safeValue}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          onChange(Number.isFinite(n) && n >= min ? n : min);
        }}
        className="bg-akiva-navy border-akiva-border text-white text-sm focus:border-akiva-gold [appearance:textfield]"
      />
    </div>
  );
}

function MoneyInput({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-gray-400 text-xs">{label}</Label>
      <div className="relative">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">R$</span>
        <Input
          type="number"
          step="1000"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="bg-akiva-navy border-akiva-border text-white pl-8 text-sm focus:border-akiva-gold [appearance:textfield]"
        />
      </div>
    </div>
  );
}

export default function CenarioForm({ cenario, onChange, onRemove, canRemove }: Props) {
  const { register, watch, control, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(cenarioSchema) as never,
    defaultValues: cenario as FormValues,
    mode: 'onChange',
  });

  const tipo = watch('tipo');
  const pctEntrada = tipo === 'parcelado' ? ((watch as (k: string) => unknown)('pctEntrada') as number ?? 0.20) : 0;
  const pctObra = tipo === 'parcelado' ? ((watch as (k: string) => unknown)('pctObra') as number ?? 0.40) : 0;
  const pctChaves = Math.max(0, 1 - pctEntrada - pctObra);

  useEffect(() => {
    const sub = watch((values) => {
      if (values.nome !== undefined) {
        onChange({ ...cenario, ...values, id: cenario.id } as Cenario);
      }
    });
    return () => sub.unsubscribe();
  }, [watch, cenario, onChange]);

  const handleTipoChange = (v: 'avista' | 'parcelado') => {
    if (v === cenario.tipo) return;
    if (v === 'avista') {
      const base: CenarioAvista = { id: cenario.id, nome: cenario.nome, tipo: 'avista', valorImovel: cenario.valorImovel, valorizAnual: cenario.valorizAnual, periodoMeses: cenario.periodoMeses, corretagem: cenario.corretagem, ir: cenario.ir, taxaDesc: cenario.taxaDesc };
      onChange(base);
    } else {
      const base: CenarioParcelado = { id: cenario.id, nome: cenario.nome, tipo: 'parcelado', valorImovel: cenario.valorImovel, valorizAnual: cenario.valorizAnual, periodoMeses: cenario.periodoMeses, corretagem: cenario.corretagem, ir: cenario.ir, taxaDesc: 0.08, indexador: 'INCC', taxaIndexador: 0.005, tempoObra: 24, pctEntrada: 0.20, pctObra: 0.40 };
      onChange(base);
    }
  };

  const row2 = 'grid grid-cols-2 gap-3';
  const row3 = 'grid grid-cols-3 gap-3';

  const watchNum = (key: string) => (watch as (k: string) => unknown)(key) as number ?? 0;

  return (
    <div className="bg-akiva-surface border border-akiva-border rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Input
          {...register('nome')}
          placeholder="Nome do cenario"
          className="bg-akiva-navy border-akiva-border text-white font-medium text-sm focus:border-akiva-gold flex-1"
        />
        <Controller
          name="tipo"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={(v) => { field.onChange(v); handleTipoChange(v as 'avista' | 'parcelado'); }}>
              <SelectTrigger className="bg-akiva-navy border-akiva-border text-white text-sm w-36 focus:border-akiva-gold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-akiva-surface border-akiva-border text-white">
                <SelectItem value="avista">A Vista</SelectItem>
                <SelectItem value="parcelado">Parcelado</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {canRemove && (
          <button onClick={onRemove} className="text-gray-500 hover:text-red-400 transition-colors p-1 text-xs">
            x
          </button>
        )}
      </div>

      <Separator className="bg-akiva-border" />

      <div className={row2}>
        <MoneyInput
          label="Valor do Imovel"
          value={watch('valorImovel')}
          onChange={(v) => { setValue('valorImovel', v, { shouldDirty: true }); onChange({ ...cenario, valorImovel: v } as Cenario); }}
        />
        <PctInput
          label="Valorizacao Anual"
          value={watch('valorizAnual')}
          onChange={(v) => { setValue('valorizAnual', v, { shouldDirty: true }); onChange({ ...cenario, valorizAnual: v } as Cenario); }}
        />
      </div>
      <div className={row3}>
        <IntInput
          label="Periodo (meses)"
          value={watch('periodoMeses')}
          onChange={(v) => { setValue('periodoMeses', v, { shouldDirty: true }); onChange({ ...cenario, periodoMeses: v } as Cenario); }}
        />
        <PctInput label="Corretagem" value={watch('corretagem')} onChange={(v) => { setValue('corretagem', v); onChange({ ...cenario, corretagem: v } as Cenario); }} />
        <PctInput label="IR sobre Lucro" value={watch('ir')} onChange={(v) => { setValue('ir', v); onChange({ ...cenario, ir: v } as Cenario); }} />
      </div>
      <PctInput
        label={tipo === 'avista' ? 'Desconto a Vista' : 'Desconto Parcelado'}
        value={watch('taxaDesc')}
        onChange={(v) => { setValue('taxaDesc', v); onChange({ ...cenario, taxaDesc: v } as Cenario); }}
      />

      {tipo === 'parcelado' && (
        <>
          <Separator className="bg-akiva-border" />
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Financiamento</p>
          <div className={row2}>
            <Controller
              name={'indexador' as never}
              control={control}
              render={({ field }) => (
                <div className="space-y-1">
                  <Label className="text-gray-400 text-xs">Indexador</Label>
                  <Select
                    value={String(field.value ?? 'INCC')}
                    onValueChange={(v) => {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (field.onChange as any)(v);
                      onChange({ ...cenario, indexador: v as Indexador } as CenarioParcelado);
                    }}
                  >
                    <SelectTrigger className="bg-akiva-navy border-akiva-border text-white text-sm focus:border-akiva-gold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-akiva-surface border-akiva-border text-white">
                      {INDEXADORES.map((idx) => <SelectItem key={idx} value={idx}>{idx}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />
            <PctInput
              label="Taxa Indexador projetada (mensal)"
              value={watchNum('taxaIndexador')}
              onChange={(v) => { (setValue as (k: string, v: unknown) => void)('taxaIndexador', v); onChange({ ...cenario, taxaIndexador: v } as CenarioParcelado); }}
            />
          </div>
          <IntInput
            label="Tempo de Obra (meses)"
            value={watchNum('tempoObra')}
            onChange={(v) => {
              (setValue as (k: string, val: unknown, opts?: unknown) => void)('tempoObra', v, { shouldDirty: true });
              onChange({ ...cenario, tempoObra: v } as CenarioParcelado);
            }}
          />
          <div className={row3}>
            <PctInput
              label="Entrada"
              value={watchNum('pctEntrada')}
              onChange={(v) => { (setValue as (k: string, v: unknown) => void)('pctEntrada', v); onChange({ ...cenario, pctEntrada: v } as CenarioParcelado); }}
            />
            <PctInput
              label="Durante a Obra"
              value={watchNum('pctObra')}
              onChange={(v) => { (setValue as (k: string, v: unknown) => void)('pctObra', v); onChange({ ...cenario, pctObra: v } as CenarioParcelado); }}
            />
            <PctInput
              label="Nas Chaves (calculado)"
              value={pctChaves}
              onChange={() => {}}
              readOnly
            />
          </div>
        </>
      )}
      {errors.nome && <p className="text-red-400 text-xs">{errors.nome.message}</p>}
    </div>
  );
}
