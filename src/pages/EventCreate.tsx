import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../services/api';
import type { Event } from '../types/api';
import { getErrorMessage } from '../lib/errorMessages';
import LocationPicker from '../components/LocationPicker';
import type { LocationResult } from '../components/LocationPicker';

type EventCreateForm = {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
};

const initialForm: EventCreateForm = {
  title: '',
  description: '',
  startTime: '',
  endTime: '',
};

function EventCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState<EventCreateForm>(initialForm);
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
  const [showPicker, setShowPicker] = useState(true);
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (result: LocationResult) => {
    setSelectedLocation(result);
    setShowPicker(false);
  };

  const formatDateLabel = (value: string) => {
    if (!value) return 'Defina data e horário';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLocation) {
      toast.error('Selecione a localização do evento no mapa.');
      return;
    }

    setLoading(true);

    try {
      const startISO = new Date(form.startTime).toISOString();
      const endISO = new Date(form.endTime).toISOString();

      if (coverPhoto) {
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('description', form.description);
        formData.append('startTime', startISO);
        formData.append('endTime', endISO);
        formData.append('latitude', String(selectedLocation.latitude));
        formData.append('longitude', String(selectedLocation.longitude));
        formData.append('coverPhoto', coverPhoto);
        await api.postFormData<Event>('/events', formData);
      } else {
        await api.post<Event>('/events', {
          title: form.title,
          description: form.description || undefined,
          startTime: startISO,
          endTime: endISO,
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
        });
      }

      toast.success('Evento criado com sucesso!');
      navigate('/events');
    } catch (err) {
      toast.error(getErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-semibold text-white">
          Novo evento
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Preencha os detalhes do evento que será exibido no app Atlas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-2 rounded-2xl bg-[#090909] border border-white/5 p-6 space-y-5"
        >
          {/* Título */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-300">
              Título do evento
            </label>
            <input
              name="title"
              type="text"
              required
              value={form.title}
              onChange={handleChange}
              placeholder="Ex: Meetup de Devs Recife"
              className="w-full h-10 px-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#6F3AFF] focus:ring-2 focus:ring-[#6F3AFF]/30"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-300">
              Descrição <span className="text-gray-500">(opcional)</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Fale um pouco sobre o evento..."
              className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#6F3AFF] focus:ring-2 focus:ring-[#6F3AFF]/30 resize-none"
            />
          </div>

          {/* Datas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-300">Início</label>
              <input
                name="startTime"
                type="datetime-local"
                required
                value={form.startTime}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#6F3AFF] focus:ring-2 focus:ring-[#6F3AFF]/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-300">Fim</label>
              <input
                name="endTime"
                type="datetime-local"
                required
                value={form.endTime}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#6F3AFF] focus:ring-2 focus:ring-[#6F3AFF]/30"
              />
            </div>
          </div>

          {/* Localização */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-300">
                Localização
              </label>
              {selectedLocation && !showPicker && (
                <button
                  type="button"
                  onClick={() => setShowPicker(true)}
                  className="inline-flex items-center gap-1 text-xs text-[#FF4B8A] hover:underline"
                >
                  <Pencil size={11} />
                  Alterar localização
                </button>
              )}
            </div>

            {/* Card de localização confirmada */}
            {selectedLocation && !showPicker ? (
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <MapPin size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">
                    {selectedLocation.address}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedLocation.latitude.toFixed(6)},{' '}
                    {selectedLocation.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
            ) : (
              <LocationPicker onLocationSelect={handleLocationSelect} />
            )}
          </div>

          {/* Foto de capa */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-300">
              Foto de capa <span className="text-gray-500">(opcional)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverPhoto(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-white/10 file:text-gray-200 hover:file:bg-white/20"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                         bg-gradient-to-r from-[#FF8A3C] via-[#FF4B8A] to-[#6F3AFF]
                         text-white shadow-lg shadow-[#6F3AFF]/40
                         hover:scale-[1.02] active:scale-[0.98] transition-transform
                         disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? 'Criando...' : 'Criar evento'}
            </button>
          </div>
        </form>

        {/* Preview */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#090909] border border-white/5 p-5 space-y-3">
            <p className="text-sm font-medium text-white">Preview no Atlas</p>
            <p className="text-xs text-gray-400">
              É assim que o evento tende a aparecer para os usuários.
            </p>

            <div className="mt-3 rounded-xl border border-white/5 bg-black/40 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-white truncate">
                  {form.title || 'Título do evento'}
                </h3>
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Ativo
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Calendar size={14} className="text-[#FF4B8A] shrink-0" />
                <span>
                  {form.startTime
                    ? `${formatDateLabel(form.startTime)} → ${formatDateLabel(form.endTime) || '?'}`
                    : 'Defina início e fim'}
                </span>
              </div>

              <div className="flex items-start gap-2 text-xs text-gray-400">
                <MapPin size={14} className="text-[#FF4B8A] shrink-0 mt-0.5" />
                <span className="line-clamp-2">
                  {selectedLocation
                    ? selectedLocation.address
                    : 'Selecione a localização no mapa'}
                </span>
              </div>

              {form.description && (
                <p className="text-xs text-gray-400 line-clamp-3">
                  {form.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventCreate;
