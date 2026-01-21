// src/components/EventEditModal.tsx
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';

export interface EventFormData {
  title: string;
  description: string;
  place: string;
  address: string;
  dateRange: string;
  capacity?: number;
  status: 'ativo' | 'rascunho';
}

interface EventEditModalProps {
  open: boolean;
  initialData: EventFormData | null;
  loading?: boolean;
  onClose: () => void;
  onSave: (data: EventFormData) => void;
}

function EventEditModal({
  open,
  initialData,
  loading,
  onClose,
  onSave,
}: EventEditModalProps) {
  const [form, setForm] = useState<EventFormData | null>(initialData);

  useEffect(() => {
    setForm(initialData);
  }, [initialData]);

  if (!open || !form) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Modal open={open} onClose={onClose} title="Editar evento">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-200">Nome</label>
          <input
            className="w-full h-10 px-3 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        {/* Data e local */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-200">Quando</label>
            <input
              className="w-full h-10 px-3 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20"
              value={form.dateRange}
              onChange={(e) => setForm({ ...form, dateRange: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-200">Local</label>
            <input
              className="w-full h-10 px-3 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20"
              value={form.place}
              onChange={(e) => setForm({ ...form, place: e.target.value })}
            />
          </div>
        </div>

        {/* Endereço */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-200">Endereço</label>
          <input
            className="w-full h-10 px-3 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>

        {/* Capacidade + status */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-200">
              Capacidade
            </label>
            <input
              type="number"
              min={1}
              className="w-full h-10 px-3 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20"
              value={form.capacity ?? ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  capacity: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-200">Status</label>
            <select
              className="w-full h-10 px-3 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20"
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as EventFormData['status'] })
              }
            >
              <option value="ativo">Ativo</option>
              <option value="rascunho">Rascunho</option>
            </select>
          </div>
        </div>

        {/* Descrição */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-200">
            Descrição
          </label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 resize-none"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* Ações */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/5 border border-white/10"
          >
            Cancelar
          </button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="px-4 py-2 text-sm"
          >
            Salvar alterações
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default EventEditModal;
