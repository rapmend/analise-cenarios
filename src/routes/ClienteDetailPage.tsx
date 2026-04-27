import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import AppShell from '@/components/AppShell';
import EstudoFormDialog from '@/features/estudos/EstudoFormDialog';
import { Button } from '@/components/ui/button';
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import type { Estudo } from '@/types';

export default function ClienteDetailPage() {
  const { clienteId } = useParams<{ clienteId: string }>();
  const { clientes, estudosByCliente, loadClientes, loadEstudos, addEstudo, removeEstudo } = useAppStore();
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Estudo | undefined>();

  useEffect(() => {
    loadClientes();
    if (clienteId) loadEstudos(clienteId);
  }, [clienteId, loadClientes, loadEstudos]);

  const cliente = clientes.find((c) => c.id === clienteId);
  const estudos = clienteId ? (estudosByCliente[clienteId] ?? []) : [];

  const handleSave = (nome: string) => {
    if (!clienteId) return;
    if (editing) {
      // rename: done via updateEstudo in analyzer, not here for now
    } else {
      const e = addEstudo(clienteId, nome);
      navigate(`/clientes/${clienteId}/estudos/${e.id}`);
    }
    setEditing(undefined);
  };

  if (!cliente) {
    return (
      <AppShell breadcrumbs={[{ label: 'Clientes', href: '/clientes' }]}>
        <p className="text-gray-400">Cliente não encontrado.</p>
      </AppShell>
    );
  }

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Clientes', href: '/clientes' },
        { label: cliente.nome },
      ]}
    >
      <div className="space-y-6">
        {/* Client header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-akiva-blue flex items-center justify-center flex-shrink-0 px-2">
            <span className={`font-serif text-akiva-gold font-semibold leading-none text-center ${
              cliente.iniciais.length <= 3 ? 'text-xl' :
              cliente.iniciais.length <= 5 ? 'text-base' :
              cliente.iniciais.length <= 8 ? 'text-xs' : 'text-[10px]'
            }`}>{cliente.iniciais}</span>
          </div>
          <div>
            <h1 className="font-serif text-akiva-gold text-3xl font-medium">{cliente.nome}</h1>
            <p className="text-gray-400 text-sm">Cliente desde {new Date(cliente.criadoEm).toLocaleDateString('pt-BR')}</p>
          </div>
          <div className="ml-auto">
            <Button
              onClick={() => { setEditing(undefined); setDialogOpen(true); }}
              className="bg-akiva-gold text-akiva-navy hover:bg-akiva-gold-muted font-semibold"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Novo Estudo
            </Button>
          </div>
        </div>

        {/* Studies list */}
        <div>
          <h2 className="text-white font-medium mb-3">Estudos</h2>
          {estudos.length === 0 ? (
            <div className="border border-akiva-border rounded-lg p-10 text-center">
              <p className="text-gray-500 text-sm">Nenhum estudo cadastrado.</p>
              <p className="text-gray-600 text-xs mt-1">Crie um estudo para iniciar a análise de cenários.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {estudos.map((e) => (
                <div
                  key={e.id}
                  onClick={() => navigate(`/clientes/${clienteId}/estudos/${e.id}`)}
                  className="bg-akiva-surface border border-akiva-border rounded-lg px-5 py-4 cursor-pointer hover:border-akiva-gold/40 transition-colors group flex items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{e.nome}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {e.cenarios.length} {e.cenarios.length === 1 ? 'cenário' : 'cenários'} ·
                      Emissão {new Date(e.dataEmissao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div
                    className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(ev) => ev.stopPropagation()}
                  >
                    <button
                      onClick={() => { if (confirm(`Excluir estudo "${e.nome}"?`)) removeEstudo(e.id, e.clienteId); }}
                      className="p-1.5 text-gray-400 hover:text-red-400 transition-colors rounded"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <svg className="h-4 w-4 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <EstudoFormDialog
        open={dialogOpen}
        nome={editing?.nome}
        onClose={() => { setDialogOpen(false); setEditing(undefined); }}
        onSave={handleSave}
      />
    </AppShell>
  );
}
