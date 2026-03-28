import { useState, useEffect } from 'react';
import { Calendar, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Skeleton from '../components/ui/Skeleton';
import { api } from '../services/api';
import type { Event } from '../types/api';

function Dashboard() {
  const [counts, setCounts] = useState({ ativos: 0, futuros: 0, finalizados: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Event[]>('/events/my-events')
      .then((events) => {
        const now = new Date();
        let ativos = 0;
        let futuros = 0;
        let finalizados = 0;

        for (const event of events) {
          const start = new Date(event.startTime);
          const end = new Date(event.endTime);
          if (end < now) finalizados++;
          else if (start > now) futuros++;
          else ativos++;
        }

        setCounts({ ativos, futuros, finalizados });
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            Eventos do Atlas
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Gerencie os eventos que aparecem para os usuários no app Atlas.
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

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-[#090909] border border-white/5 p-5">
          <p className="text-xs text-gray-400 mb-2">Eventos ativos</p>
          {loading ? (
            <Skeleton className="h-8 w-12" />
          ) : (
            <p className="text-2xl font-semibold text-white">{counts.ativos}</p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Sendo exibidos agora no mapa do app.
          </p>
        </div>

        <div className="rounded-2xl bg-[#090909] border border-white/5 p-5">
          <p className="text-xs text-gray-400 mb-2">Eventos futuros</p>
          {loading ? (
            <Skeleton className="h-8 w-12" />
          ) : (
            <p className="text-2xl font-semibold text-white">{counts.futuros}</p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Programados para as próximas semanas.
          </p>
        </div>

        <div className="rounded-2xl bg-[#090909] border border-white/5 p-5">
          <p className="text-xs text-gray-400 mb-2">Eventos finalizados</p>
          {loading ? (
            <Skeleton className="h-8 w-12" />
          ) : (
            <p className="text-2xl font-semibold text-white">
              {counts.finalizados}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Histórico de eventos realizados.
          </p>
        </div>
      </div>

      {/* Seção de destaque */}
      <div className="mt-4 rounded-2xl bg-[#090909] border border-white/5 p-5 flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
          <Calendar size={20} className="text-[#FF4B8A]" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white">
            Próximo evento em destaque
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Configure eventos que terão mais visibilidade no app, como
            parcerias, lançamentos e encontros oficiais.
          </p>
        </div>
        <Link
          to="/events"
          className="text-xs font-medium text-[#FF4B8A] hover:underline"
        >
          Ver lista de eventos
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
