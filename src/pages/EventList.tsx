import { useState, useMemo, useEffect } from 'react';
import { Calendar, MapPin, Clock, PlusCircle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import Skeleton from '../components/ui/Skeleton';

const mockEvents = [
  { id: '1', title: 'Meetup de Devs Recife', date: '2026-01-15T19:30:00Z', place: 'Portomídia', address: 'Recife Antigo, Recife - PE', status: 'ativo' },
  { id: '2', title: 'Rolê de networking Atlas', date: '2026-01-16T20:00:00Z', place: 'Bar Central', address: 'Boa Vista, Recife - PE', status: 'ativo' },
  { id: '3', title: 'Sunset na praia', date: '2026-01-18T16:00:00Z', place: 'Praia de Boa Viagem', address: 'Boa Viagem, Recife - PE', status: 'rascunho' },
];

type StatusFilter = 'all' | 'ativo' | 'rascunho';
type DateFilter = 'all' | '7days' | '30days';

function EventList() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredEvents = useMemo(() => {
    const now = new Date();
    const limit7 = new Date();
    limit7.setDate(now.getDate() + 7);
    const limit30 = new Date();
    limit30.setDate(now.getDate() + 30);

    return mockEvents.filter((event) => {
      const normalized = (search || '').toLowerCase();
      const matchesSearch =
        !normalized ||
        event.title.toLowerCase().includes(normalized) ||
        event.place.toLowerCase().includes(normalized) ||
        event.address.toLowerCase().includes(normalized);

      const matchesStatus =
        statusFilter === 'all' ? true : event.status === statusFilter;

      const eventDate = new Date(event.date);
      let matchesDate = true;
      if (dateFilter === '7days') {
        matchesDate = eventDate >= now && eventDate <= limit7;
      } else if (dateFilter === '30days') {
        matchesDate = eventDate >= now && eventDate <= limit30;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [search, statusFilter, dateFilter]);

  const formatDateLabel = (iso: string) =>
    new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>

        {/* Filtros */}
        <div className="rounded-2xl bg-[#090909] border border-white/5 px-4 md:px-5 py-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex-1">
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>

        {/* Lista skeleton */}
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
              placeholder="Buscar por nome, local ou endereço..."
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
            <option value="rascunho">Rascunhos</option>
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

      {/* Lista (usa filteredEvents) */}
      <div className="rounded-2xl bg-[#090909] border border-white/5 overflow-hidden">
        {/* Cabeçalho desktop */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium text-gray-400 border-b border-white/5">
          <span className="col-span-5">Evento</span>
          <span className="col-span-3">Data</span>
          <span className="col-span-2">Local</span>
          <span className="col-span-2 text-right">Status</span>
        </div>

        <div className="divide-y divide-white/5">
          {filteredEvents.map((event) => (
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
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                      event.status === 'ativo'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-gray-500/10 text-gray-300 border border-gray-500/30'
                    }`}
                  >
                    {event.status === 'ativo' ? 'Ativo' : 'Rascunho'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Calendar size={14} />
                  <span>{formatDateLabel(event.date)}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <MapPin size={14} />
                  <span className="truncate">
                    {event.place} · {event.address}
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
                    {event.address}
                  </p>
                </div>

                <div className="col-span-3 flex items-center gap-2 text-sm text-gray-300">
                  <Clock size={14} className="text-[#FF4B8A]" />
                  <span>{formatDateLabel(event.date)}</span>
                </div>

                <div className="col-span-2 flex items-center gap-2 text-sm text-gray-300">
                  <MapPin size={14} className="text-[#FF4B8A]" />
                  <span>{event.place}</span>
                </div>

                <div className="col-span-2 flex justify-end">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                      event.status === 'ativo'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-gray-500/10 text-gray-300 border border-gray-500/30'
                    }`}
                  >
                    {event.status === 'ativo' ? 'Ativo' : 'Rascunho'}
                  </span>
                </div>
              </div>
            </Link>
          ))}

          {filteredEvents.length === 0 && (
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
