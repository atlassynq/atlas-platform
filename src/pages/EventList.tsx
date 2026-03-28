import { useState, useMemo, useEffect } from 'react';
import { Calendar, MapPin, Clock, PlusCircle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import Skeleton from '../components/ui/Skeleton';
import { api } from '../services/api';
import type { Event } from '../types/api';
import { getErrorMessage } from '../lib/errorMessages';

type StatusFilter = 'all' | 'ativo' | 'futuro' | 'finalizado';
type DateFilter = 'all' | '7days' | '30days';

function getEventStatus(event: Event): 'ativo' | 'futuro' | 'finalizado' {
  const now = new Date();
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);
  if (end < now) return 'finalizado';
  if (start > now) return 'futuro';
  return 'ativo';
}

function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Event[]>('/events/my-events')
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(getErrorMessage(err));
        setLoading(false);
      });
  }, []);

  const filteredEvents = useMemo(() => {
    const now = new Date();
    const limit7 = new Date();
    limit7.setDate(now.getDate() + 7);
    const limit30 = new Date();
    limit30.setDate(now.getDate() + 30);

    return events.filter((event) => {
      const normalized = (search || '').toLowerCase();
      const matchesSearch =
        !normalized || event.title.toLowerCase().includes(normalized);

      const status = getEventStatus(event);
      const matchesStatus =
        statusFilter === 'all' ? true : status === statusFilter;

      const eventDate = new Date(event.startTime);
      let matchesDate = true;
      if (dateFilter === '7days') {
        matchesDate = eventDate >= now && eventDate <= limit7;
      } else if (dateFilter === '30days') {
        matchesDate = eventDate >= now && eventDate <= limit30;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [events, search, statusFilter, dateFilter]);

  const formatDateLabel = (iso: string) =>
    new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

  const statusBadge = (event: Event) => {
    const status = getEventStatus(event);
    if (status === 'ativo')
      return {
        label: 'Ativo',
        className:
          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
      };
    if (status === 'futuro')
      return {
        label: 'Em breve',
        className: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
      };
    return {
      label: 'Finalizado',
      className: 'bg-gray-500/10 text-gray-300 border border-gray-500/30',
    };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>

        <div className="rounded-2xl bg-[#090909] border border-white/5 px-4 md:px-5 py-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex-1">
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>

        <div className="rounded-2xl bg-[#090909] border border-white/5 p-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-white/5 last:border-0 pb-3 last:pb-0"
            >
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <div className="w-full md:w-1/3 flex flex-col gap-2">
                <Skeleton className="h-3 w-28 self-start md:self-end" />
                <Skeleton className="h-3 w-24 self-start md:self-end" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            Eventos
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Veja e gerencie os eventos que aparecem para os usuários no app Atlas.
          </p>
        </div>

        <Link
          to="/events/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                     bg-gradient-to-r from-[#FF8A3C] via-[#FF4B8A] to-[#6F3AFF]
                     text-white shadow-lg shadow-[#6F3AFF]/40
                     hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          <PlusCircle size={18} />
          <span>Novo evento</span>
        </Link>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl bg-[#090909] border border-white/5 px-4 md:px-5 py-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        {/* Busca */}
        <div className="flex-1">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Buscar por nome do evento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#6F3AFF] focus:ring-2 focus:ring-[#6F3AFF]/30"
            />
          </div>
        </div>

        {/* Selects */}
        <div className="flex flex-wrap gap-2 md:gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="h-10 px-3 bg-black/40 border border-white/10 rounded-xl text-xs md:text-sm text-white focus:outline-none focus:border-[#6F3AFF] focus:ring-2 focus:ring-[#6F3AFF]/30"
          >
            <option value="all">Todos os status</option>
            <option value="ativo">Ativos</option>
            <option value="futuro">Em breve</option>
            <option value="finalizado">Finalizados</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateFilter)}
            className="h-10 px-3 bg-black/40 border border-white/10 rounded-xl text-xs md:text-sm text-white focus:outline-none focus:border-[#6F3AFF] focus:ring-2 focus:ring-[#6F3AFF]/30"
          >
            <option value="all">Todas as datas</option>
            <option value="7days">Próx. 7 dias</option>
            <option value="30days">Próx. 30 dias</option>
          </select>
        </div>
      </div>

      {/* Lista */}
      <div className="rounded-2xl bg-[#090909] border border-white/5 overflow-hidden">
        {/* Cabeçalho desktop */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium text-gray-400 border-b border-white/5">
          <span className="col-span-5">Evento</span>
          <span className="col-span-3">Início</span>
          <span className="col-span-2">Local</span>
          <span className="col-span-2 text-right">Status</span>
        </div>

        <div className="divide-y divide-white/5">
          {filteredEvents.map((event) => {
            const badge = statusBadge(event);
            return (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="block px-4 md:px-6 py-4 hover:bg-white/5 transition-colors"
              >
                {/* Mobile */}
                <div className="flex flex-col gap-3 md:hidden">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white">
                      {event.title}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar size={14} />
                    <span>{formatDateLabel(event.startTime)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <MapPin size={14} />
                    <span className="truncate">
                      {event.latitude.toFixed(4)},{' '}
                      {event.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>

                {/* Desktop */}
                <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-5">
                    <p className="text-sm font-medium text-white">
                      {event.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Fim: {formatDateLabel(event.endTime)}
                    </p>
                  </div>

                  <div className="col-span-3 flex items-center gap-2 text-sm text-gray-300">
                    <Clock size={14} className="text-[#FF4B8A]" />
                    <span>{formatDateLabel(event.startTime)}</span>
                  </div>

                  <div className="col-span-2 flex items-center gap-2 text-sm text-gray-300">
                    <MapPin size={14} className="text-[#FF4B8A]" />
                    <span className="text-xs">
                      {event.latitude.toFixed(3)},{' '}
                      {event.longitude.toFixed(3)}
                    </span>
                  </div>

                  <div className="col-span-2 flex justify-end">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}

          {filteredEvents.length === 0 && !loading && (
            <div className="px-6 py-10 text-center text-sm text-gray-400">
              Nenhum evento encontrado com os filtros atuais.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventList;
