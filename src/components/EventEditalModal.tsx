// src/components/EventEditModal.tsx
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { MapPin, Pencil } from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import LocationPicker from './LocationPicker';
import type { LocationResult } from './LocationPicker';

export interface EventFormData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  latitude: number | '';
  longitude: number | '';
  address?: string;
  coverPhoto?: File | string | null;
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
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);

  useEffect(() => {
    setForm(initialData);
    setCoverFile(null);
    setShowMapPicker(false);
  }, [initialData]);

  if (!open || !form) return null;

  const toDatetimeLocal = (iso: string) => {
    if (!iso) return '';
    return iso.slice(0, 16);
  };

  const handleLocationSelect = (result: LocationResult) => {
    setForm({
      ...form,
      latitude: result.latitude,
      longitude: result.longitude,
      address: result.address,
    });
    setShowMapPicker(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({ ...form, coverPhoto: coverFile ?? form.coverPhoto });
  };

  const initialCoords: [number, number] | undefined =
    form.latitude !== '' && form.longitude !== ''
      ? [form.longitude as number, form.latitude as number]
      : undefined;

  const locationLabel =
    form.address ||
    (form.latitude !== '' && form.longitude !== ''
      ? `${(form.latitude as number).toFixed(6)}, ${(form.longitude as number).toFixed(6)}`
      : null);

  return (
    <Modal open={open} onClose={onClose} title="Editar evento">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Título */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-200">Nome</label>
          <input
            required
            className="w-full h-10 px-3 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#6F3AFF] focus:ring-2 focus:ring-[#6F3AFF]/20"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        {/* Datas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-200">Início</label>
            <input
              type="datetime-local"
              required
              className="w-full h-10 px-3 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#6F3AFF] focus:ring-2 focus:ring-[#6F3AFF]/20"
              value={toDatetimeLocal(form.startTime)}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-200">Fim</label>
            <input
              type="datetime-local"
              required
              className="w-full h-10 px-3 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#6F3AFF] focus:ring-2 focus:ring-[#6F3AFF]/20"
              value={toDatetimeLocal(form.endTime)}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
          </div>
        </div>

        {/* Localização */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-200">
              Localização
            </label>
            {!showMapPicker && (
              <button
                type="button"
                onClick={() => setShowMapPicker(true)}
                className="inline-flex items-center gap-1 text-xs text-[#FF4B8A] hover:underline"
              >
                <Pencil size={11} />
                Alterar localização
              </button>
            )}
          </div>

          {showMapPicker ? (
            <>
              <LocationPicker
                initialCoords={initialCoords}
                onLocationSelect={handleLocationSelect}
              />
              <button
                type="button"
                onClick={() => setShowMapPicker(false)}
                className="text-xs text-gray-500 hover:text-gray-300"
              >
                ← Cancelar alteração
              </button>
            </>
          ) : locationLabel ? (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
              <MapPin size={15} className="text-[#FF4B8A] mt-0.5 shrink-0" />
              <p className="text-sm text-gray-200 truncate">{locationLabel}</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowMapPicker(true)}
              className="w-full py-3 rounded-xl border border-dashed border-white/20 text-xs text-gray-400 hover:border-[#FF4B8A]/40 hover:text-gray-300 transition-colors"
            >
              + Selecionar localização no mapa
            </button>
          )}
        </div>

        {/* Foto de capa */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-200">
            Foto de capa{' '}
            <span className="text-gray-500">(opcional)</span>
          </label>
          <input
            type="file"
            accept="image/*"
            className="w-full text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-white/10 file:text-gray-200 hover:file:bg-white/20"
            onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
          />
          {typeof form.coverPhoto === 'string' && form.coverPhoto && !coverFile && (
            <p className="text-[11px] text-gray-500 truncate">
              Atual: {form.coverPhoto}
            </p>
          )}
        </div>

        {/* Descrição */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-200">Descrição</label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#6F3AFF] focus:ring-2 focus:ring-[#6F3AFF]/20 resize-none"
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
