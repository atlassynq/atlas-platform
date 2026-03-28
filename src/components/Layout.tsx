import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, LayoutDashboard, LogOut } from 'lucide-react';
import { toast } from 'sonner';

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('atlas_admin_token');
    toast.success('Você saiu do painel Atlas Admin.');
    setTimeout(() => navigate('/login'), 400);
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-[#050505] border-r border-white/10">
        <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl overflow-hidden">
            <img
              src="/logos/logo-atlas.png"
              alt="Atlas Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm text-gray-400">Super Admin</p>
            <h1 className="text-lg font-semibold">Atlas Admin</h1>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
              isActive('/dashboard')
                ? 'bg-gradient-to-r from-[#FF8A3C]/20 via-[#FF4B8A]/20 to-[#6F3AFF]/20 text-white'
                : 'text-gray-400 hover:bg-white/5'
            }`}
          >
            <span className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
              <LayoutDashboard size={18} className="text-[#FF4B8A]" />
            </span>
            <span>Visão geral</span>
          </Link>

          <Link
            to="/events"
            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
              isActive('/events')
                ? 'bg-gradient-to-r from-[#FF8A3C]/20 via-[#FF4B8A]/20 to-[#6F3AFF]/20 text-white'
                : 'text-gray-400 hover:bg-white/5'
            }`}
          >
            <span className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
              <Calendar size={18} className="text-[#FF4B8A]" />
            </span>
            <span>Eventos</span>
          </Link>
        </nav>

        <div className="px-4 pb-5 pt-2 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 transition-colors"
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 min-w-0 bg-gradient-to-b from-black via-[#050505] to-black">
        {/* Topbar em mobile */}
        <header className="md:hidden px-4 py-3 border-b border-white/10 flex items-center justify-between bg-black/80 backdrop-blur">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl overflow-hidden">
              <img
                src="/logos/logo-atlas.png"
                alt="Atlas Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-semibold text-sm">Atlas Admin</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <LogOut size={18} />
          </button>
        </header>

        <div className="px-4 md:px-8 py-6 md:py-8">
          <Outlet />
        </div>
      </main>

    </div>
  );
}

export default Layout;
