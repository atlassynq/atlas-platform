// src/pages/EventDetails.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  ArrowLeft,
  Trash2,
  Pencil,
  Users,
} from 'lucide-react';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import type { EventFormData } from '../components/EventEditalModal';
import EventEditModal from '../components/EventEditalModal';
import Skeleton from '../components/ui/Skeleton';
import { toast } from 'sonner';
import { api } from '../services/api';
import type { Event } from '../types/api';
import { getErrorMessage } from '../lib/errorMessages';

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get<Event>(`/events/${id}`)
      .then((data) => {
        setEvent(data);
        setLoading(false);
      })
      .catch((err) => {
        setFetchError(getErrorMessage(err));
        setLoading(false);
      });
  }, [id]);

  const toDatetimeLocal = (iso: string) => iso?.slice(0, 16) ?? '';

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const handleSaveEdit = async (data: EventFormData) => {
    if (!id) return;
    setSavingEdit(true);
    setError('');

    try {
      let updated: Event;

      if (data.coverPhoto instanceof File) {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('startTime', new Date(data.startTime).toISOString());
        formData.append('endTime', new Date(data.endTime).toISOString());
        formData.append('latitude', String(data.latitude));
        formData.append('longitude', String(data.longitude));
        formData.append('coverPhoto', data.coverPhoto);
        updated = await api.patchFormData<Event>(`/events/${id}`, formData);
      } else {
        updated = await api.patch<Event>(`/events/${id}`, {
          title: data.title,
          description: data.description || undefined,
          startTime: new Date(data.startTime).toISOString(),
          endTime: new Date(data.endTime).toISOString(),
          latitude: data.latitude,
          longitude: data.longitude,
        });
      }

      setEvent(updated);
      setEditOpen(false);
      toast.success('Evento atualizado com sucesso!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!id) return;
    setDeleting(true);
    setError('');

    try {
      await api.delete(`/events/${id}`);
      setConfirmOpen(false);
      toast.success('Evento deletado com sucesso.');
      navigate('/events');
    } catch (err) {
      toast.error(getErrorMessage(err));
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 rounded-2xl bg-[#090909] border border-white/5 p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-52" />
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-white/5 space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-[#090909] border border-white/5 p-5 space-y-3">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-3 w-40" />
            </div>
            <div className="rounded-2xl bg-[#090909] border border-white/5 p-5 space-y-2">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (fetchError && !event) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-gray-300 hover:bg-white/5"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <p className="text-sm text-red-400">{fetchError}</p>
        </div>
      </div>
    );
  }

  if (!event) return null;

  const eventFormData: EventFormData = {
    title: event.title,
    description: event.description ?? '',
    startTime: toDatetimeLocal(event.startTime),
    endTime: toDatetimeLocal(event.endTime),
    latitude: event.latitude,
    longitude: event.longitude,
    coverPhoto: event.coverPhoto,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-gray-300 hover:bg-white/5"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Detalhes do evento
            </p>
            <h1 className="text-xl md:text-2xl font-semibold text-white">
              {event.title}
            </h1>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium border border-white/10 text-gray-200 hover:bg-white/5"
          >
            <Pencil size={16} />
            Editar
          </button>
          <Button
            type="button"
            variant="secondary"
            className="bg-red-600/10! border-red-500/30! text-red-400 hover:bg-red-600/20! inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 size={16} />
            Deletar
          </Button>
        </div>
      </div>

      {/* Card principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Info principal */}
        <div className="lg:col-span-2 rounded-2xl bg-[#090909] border border-white/5 p-6 space-y-5">
          {event.coverPhoto && (
            <img
              src={event.coverPhoto}
              alt={event.title}
              className="w-full h-48 object-cover rounded-xl"
            />
          )}

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Evento ativo
            </span>
            {event._count && (
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                <Users size={13} />
                {event._count.confirmations} confirmação
                {event._count.confirmations !== 1 ? 'ões' : ''}
              </span>
            )}
          </div>

          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-start gap-3">
              <Calendar size={18} className="mt-0.5 text-[#FF4B8A]" />
              <div>
                <p className="font-medium text-white">Data e horário</p>
                <p className="text-gray-300 mt-0.5">
                  Início: {formatDate(event.startTime)}
                </p>
                <p className="text-gray-300 mt-0.5">
                  Fim: {formatDate(event.endTime)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin size={18} className="mt-0.5 text-[#FF4B8A]" />
              <div>
                <p className="font-medium text-white">Localização</p>
                <p className="text-gray-300 mt-0.5">
                  Lat {event.latitude.toFixed(6)} / Lon{' '}
                  {event.longitude.toFixed(6)}
                </p>
              </div>
            </div>
          </div>

          {event.description && (
            <div className="pt-4 border-t border-white/5">
              <p className="text-sm font-medium text-white mb-2">Descrição</p>
              <p className="text-sm text-gray-300 leading-relaxed">
                {event.description}
              </p>
            </div>
          )}
        </div>

        {/* Card lateral */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#090909] border border-white/5 p-5 space-y-3">
            <p className="text-sm font-medium text-white">Ações rápidas</p>
            <p className="text-xs text-gray-400">
              Use estas ações para manter os eventos do Atlas sempre atualizados.
            </p>
            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={() => setEditOpen(true)}
                className="text-xs text-[#FF4B8A] hover:underline text-left"
              >
                Editar detalhes do evento
              </button>
              <button
                onClick={() => setConfirmOpen(true)}
                className="text-xs text-red-400 hover:underline text-left"
              >
                Deletar evento
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-[#090909] border border-white/5 p-5 space-y-2 text-xs text-gray-400">
            <p className="font-medium text-white text-sm">Criado por</p>
            <p>
              {event.creator.firstName} {event.creator.lastName}
            </p>
            <p className="text-gray-500 text-[11px]">
              ID: {event.id.slice(0, 8)}...
            </p>
          </div>

          <div className="rounded-2xl bg-[#090909] border border-white/5 p-5 space-y-2 text-xs text-gray-400">
            <p className="font-medium text-white text-sm">
              Sobre eventos do Atlas
            </p>
            <p>
              Alterações aqui refletem diretamente no app Atlas para todos os
              usuários. Use com cuidado em eventos já ativos.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de edição */}
      <EventEditModal
        open={editOpen}
        initialData={eventFormData}
        loading={savingEdit}
        onClose={() => setEditOpen(false)}
        onSave={handleSaveEdit}
      />

      {/* Pop-up de confirmação */}
      <ConfirmDialog
        open={confirmOpen}
        title="Deletar evento"
        description="Tem certeza que deseja deletar este evento? Essa ação não pode ser desfeita e o evento vai sumir do app Atlas."
        confirmLabel="Deletar evento"
        cancelLabel="Cancelar"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

export default EventDetails;
