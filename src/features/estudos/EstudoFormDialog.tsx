import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  open: boolean;
  nome?: string;
  onClose: () => void;
  onSave: (nome: string) => void;
}

export default function EstudoFormDialog({ open, nome: initialNome, onClose, onSave }: Props) {
  const [nome, setNome] = useState('');

  useEffect(() => {
    if (open) setNome(initialNome ?? '');
  }, [open, initialNome]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    onSave(nome.trim());
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-akiva-surface border-akiva-border text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-akiva-gold text-xl">
            {initialNome ? 'Renomear Estudo' : 'Novo Estudo'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-gray-300 text-sm">Nome do estudo</Label>
            <Input
              autoFocus
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Apartamento Centro — 2025"
              className="bg-akiva-navy border-akiva-border text-white placeholder:text-gray-500 focus:border-akiva-gold"
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
              {initialNome ? 'Salvar' : 'Criar Estudo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
