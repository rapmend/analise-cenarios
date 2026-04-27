import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import AppShell from '@/components/AppShell';
import ClienteFormDialog from '@/features/clientes/ClienteFormDialog';
import { Button } from '@/components/ui/button';
import { PlusIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import type { Cliente } from '@/types';

export default function ClientesListPage() {
  const { clientes, loadClientes, addCliente, updateCliente, removeCliente } = useAppStore();
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | undefined>();

  useEffect(() => { loadClientes(); }, [loadClientes]);

  const handleSave = (nome: string, iniciais: string) => {
    if (editing) {
      updateCliente(editing.id, { nome, iniciais });
    } else {
      addCliente(nome, iniciais);
    }
    setEditing(undefined);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-akiva-gold text-3xl font-medium">Clientes</h1>
            <p className="text-gray-400 text-sm mt-1">Gerenciamento de clientes e estudos</p>
          </div>
          <Button
            onClick={() => { setEditing(undefined); setDialogOpen(true); }}
            className="bg-akiva-gold text-akiva-navy hover:bg-akiva-gold-muted font-semibold"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>

        {clientes.length === 0 ? (
          <div className="border border-akiva-border rounded-lg p-12 text-center">
            <p className="text-gray-500 text-sm">Nenhum cliente cadastrado ainda.</p>
            <p className="text-gray-600 text-xs mt-1">Clique em "Novo Cliente" para começar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientes.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/clientes/${c.id}`)}
                className="bg-akiva-surface border border-akiva-border rounded-lg p-5 cursor-pointer hover:border-akiva-gold/40 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-akiva-blue flex items-center justify-center flex-shrink-0 px-1.5">
                    <span className={`font-serif text-akiva-gold font-semibold leading-none text-center ${
                      c.iniciais.length <= 3 ? 'text-lg' :
                      c.iniciais.length <= 5 ? 'text-sm' :
                      c.iniciais.length <= 8 ? 'text-[11px]' : 'text-[9px]'
                    }`}>{c.iniciais}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{c.nome}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      Criado em {new Date(c.criadoEm).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => { setEditing(c); setDialogOpen(true); }}
                      className="p-1.5 text-gray-400 hover:text-akiva-gold transition-colors rounded"
                    >
                      <Pencil1Icon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => { if (confirm(`Excluir cliente "${c.nome}"?`)) removeCliente(c.id); }}
                      className="p-1.5 text-gray-400 hover:text-red-400 transition-colors rounded"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ClienteFormDialog
        open={dialogOpen}
        cliente={editing}
        onClose={() => { setDialogOpen(false); setEditing(undefined); }}
        onSave={handleSave}
      />
    </AppShell>
  );
}
