// src/pages/EventDetails.tsx
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  Trash2,
  Pencil,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import type { EventFormData } from '../components/EventEditalModal';
import EventEditModal from '../components/EventEditalModal';
import Skeleton from '../components/ui/Skeleton';

const mockEvent = {
  id: '1',
  title: 'Meetup de Devs Recife',
  description:
    'Encontro da comunidade de devs para networking, talks e cerveja gelada.',
  dateRange: 'Hoje · 19:30 – 22:00',
  place: 'Portomídia',
  address: 'Recife Antigo, Recife - PE',
  status: 'ativo' as 'ativo' | 'rascunho',
  capacity: 80,
};

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const eventData: EventFormData = {
    title: mockEvent.title,
    description: mockEvent.description,
    place: mockEvent.place,
    address: mockEvent.address,
    dateRange: mockEvent.dateRange,
    capacity: mockEvent.capacity,
    status: mockEvent.status,
  };

  const handleOpenEdit = () => {
    setEditOpen(true);
  };

  const handleSaveEdit = (data: EventFormData) => {
    setSavingEdit(true);

    setTimeout(() => {
      console.log('atualizar evento', id, data);
      setSavingEdit(false);
      setEditOpen(false);
    }, 800);
  };

  const handleDeleteClick = () => {
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    setDeleting(true);

    setTimeout(() => {
      console.log('deletar evento', id);
      setDeleting(false);
      setConfirmOpen(false);
      navigate('/events');
    }, 800);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
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

        {/* Cards skeleton */}
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
              {mockEvent.title}
            </h1>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleOpenEdit}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium border border-white/10 text-gray-200 hover:bg-white/5"
          >
            <Pencil size={16} />
            Editar
          </button>
          <Button
            type="button"
            variant="secondary"
            className="!bg-red-600/10 !border-red-500/30 text-red-400 hover:!bg-red-600/20 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm"
            onClick={handleDeleteClick}
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
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                mockEvent.status === 'ativo'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-gray-500/10 text-gray-300 border border-gray-500/30'
              }`}
            >
              {mockEvent.status === 'ativo' ? 'Ativo no app' : 'Rascunho'}
            </span>
            {mockEvent.capacity && (
              <span className="text-xs text-gray-400">
                Capacidade: {mockEvent.capacity} pessoas
              </span>
            )}
          </div>

          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-start gap-3">
              <Calendar size={18} className="mt-0.5 text-[#FF4B8A]" />
              <div>
                <p className="font-medium text-white">Data e horário</p>
                <p className="text-gray-300 mt-0.5">{mockEvent.dateRange}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin size={18} className="mt-0.5 text-[#FF4B8A]" />
              <div>
                <p className="font-medium text-white">Local</p>
                <p className="text-gray-300 mt-0.5">{mockEvent.place}</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {mockEvent.address}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <p className="text-sm font-medium text-white mb-2">Descrição</p>
            <p className="text-sm text-gray-300 leading-relaxed">
              {mockEvent.description}
            </p>
          </div>
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
                onClick={handleOpenEdit}
                className="text-xs text-[#FF4B8A] hover:underline text-left"
              >
                Editar detalhes do evento
              </button>
              <button
                onClick={handleDeleteClick}
                className="text-xs text-red-400 hover:underline text-left"
              >
                Deletar evento
              </button>
            </div>
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
        initialData={eventData}
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
