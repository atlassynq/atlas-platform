import { useState } from 'react';
import { Calendar, MapPin } from 'lucide-react';

type EventCreateForm = {
  title: string;
  description: string;
  place: string;
  address: string;
  date: string;
  capacity: number | '';
};

const initialForm: EventCreateForm = {
  title: '',
  description: '',
  place: '',
  address: '',
  date: '',
  capacity: '',
};

function EventCreate() {
  const [form, setForm] = useState<EventCreateForm>(initialForm);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'capacity' ? (value === '' ? '' : Number(value)) : value,
    }));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('criar evento', form);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            Novo evento
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Preencha os detalhes do evento que será exibido no app Atlas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-2 rounded-2xl bg-[#090909] border border-white/5 p-6 space-y-4"
        >
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-300">
              Título do evento
            </label>
            <input
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="Ex: Meetup de Devs Recife"
              className="w-full h-10 px-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#6F3AFF] focus:ring-2 focus:ring-[#6F3AFF]/30"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-300">
              Descrição
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Fale um pouco sobre o evento..."
              className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#6F3AFF] focus:ring-2 focus:ring-[#6F3AFF]/30 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-300">
                Local (nome do lugar)
              </label>
              <input
                name="place"
                type="text"
                value={form.place}
                onChange={handleChange}
                placeholder="Ex: Portomídia"
                className="w-full h-10 px-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#6F3AFF] focus:ring-2 focus:ring-[#6F3AFF]/30"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-300">
                Capacidade (opcional)
              </label>
              <input
                name="capacity"
                type="number"
                min={1}
                value={form.capacity}
                onChange={handleChange}
                placeholder="Ex: 80"
                className="w-full h-10 px-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#6F3AFF] focus:ring-2 focus:ring-[#6F3AFF]/30"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-300">
              Data e horário
            </label>
            <input
              name="date"
              type="datetime-local"
              value={form.date}
              onChange={handleChange}
              className="w-full h-10 px-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#6F3AFF] focus:ring-2 focus:ring-[#6F3AFF]/30"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                         bg-gradient-to-r from-[#FF8A3C] via-[#FF4B8A] to-[#6F3AFF]
                         text-white shadow-lg shadow-[#6F3AFF]/40
                         hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              Criar evento
            </button>
          </div>
        </form>

        {/* Preview */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#090909] border border-white/5 p-5 space-y-3">
            <p className="text-sm font-medium text-white">Preview no Atlas</p>
            <p className="text-xs text-gray-400">
              É assim que o evento tende a aparecer na lista e nos detalhes
              para os usuários.
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
                <Calendar size={14} className="text-[#FF4B8A]" />
                <span>{formatDateLabel(form.date)}</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <MapPin size={14} className="text-[#FF4B8A]" />
                <span className="truncate">
                  {form.place || 'Defina o local'} ·{' '}
                  {form.address || 'Endereço do evento'}
                </span>
              </div>

              {form.description && (
                <p className="mt-2 text-xs text-gray-400 line-clamp-3">
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
