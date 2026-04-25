import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Cliente } from '@/types';

interface Props {
  open: boolean;
  cliente?: Cliente;
  onClose: () => void;
  onSave: (nome: string, iniciais: string) => void;
}

function toIniciais(nome: string): string {
  return nome
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export default function ClienteFormDialog({ open, cliente, onClose, onSave }: Props) {
  const [nome, setNome] = useState('');
  const [iniciais, setIniciais] = useState('');

  useEffect(() => {
    if (open) {
      setNome(cliente?.nome ?? '');
      setIniciais(cliente?.iniciais ?? '');
    }
  }, [open, cliente]);

  const handleNomeChange = (v: string) => {
    setNome(v);
    if (!cliente) setIniciais(toIniciais(v));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    onSave(nome.trim(), iniciais.trim() || toIniciais(nome));
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-akiva-surface border-akiva-border text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-akiva-gold text-xl">
            {cliente ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-gray-300 text-sm">Nome do cliente</Label>
            <Input
              autoFocus
              value={nome}
              onChange={(e) => handleNomeChange(e.target.value)}
              placeholder="Ex: João Silva"
              className="bg-akiva-navy border-akiva-border text-white placeholder:text-gray-500 focus:border-akiva-gold"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-gray-300 text-sm">Iniciais (exibidas no avatar)</Label>
            <Input
              value={iniciais}
              onChange={(e) => setIniciais(e.target.value.toUpperCase().slice(0, 3))}
              placeholder="Ex: JS"
              maxLength={3}
              className="bg-akiva-navy border-akiva-border text-white placeholder:text-gray-500 focus:border-akiva-gold uppercase"
            />
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!nome.trim()}
              className="bg-akiva-gold text-akiva-navy hover:bg-akiva-gold-muted font-semibold"
            >
              {cliente ? 'Salvar' : 'Criar Cliente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
