import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, X } from 'lucide-react';
import { toast } from 'sonner';
import Button from '../components/ui/Button';
import { api } from '../services/api';
import type { LoginResponse } from '../types/api';
import { getErrorMessage } from '../lib/errorMessages';

const WHATSAPP_NUMBER =
  import.meta.env.VITE_ATLAS_SUPPORT_WHATSAPP || '5581XXXXXXXXX';


function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [contactOpen, setContactOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState(
    'João...não estou conseguindo logar no Atlas Admin, poderia checar para mim?'
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { token, user } = await api.post<LoginResponse>(
        '/auth/login',
        { email, password },
        { requiresAuth: false }
      );
      localStorage.setItem('atlas_admin_token', token);
      localStorage.setItem('atlas_admin_email', user.email);
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
      setLoading(false);
    }
  };

  const handleSendWhatsApp = () => {
    if (!contactMessage.trim()) return;

    const text = `Admin Atlas:%0A${encodeURIComponent(contactMessage)}%0A%0AEmail: ${encodeURIComponent(
      email || 'não informado'
    )}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;

    window.open(url, '_blank');
    setContactOpen(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="/logos/logo-atlas.png"
              alt="Atlas Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white">Atlas Admin</h1>
            <p className="text-gray-400 mt-2">
              Acesso exclusivo para super administradores
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#0d0d0d] rounded-2xl p-8 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <div className="relative">
                <Mail
                  size={20}
                  className="absolute left-4 top-[18px] text-gray-500 pointer-events-none"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-14 pl-12 pr-4 bg-black/50 border border-white/10 rounded-xl text-white text-base placeholder-gray-500 focus:outline-none focus:border-[#6F3AFF] focus:ring-2 focus:ring-[#6F3AFF]/30"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-4 top-[18px] text-gray-500 pointer-events-none"
                />
                <input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-14 pl-12 pr-4 bg-black/50 border border-white/10 rounded-xl text-white text-base placeholder-gray-500 focus:outline-none focus:border-[#6F3AFF] focus:ring-2 focus:ring-[#6F3AFF]/30"
                />
              </div>
            </div>

            {/* Botão */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              className="!mt-6 h-14"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Problemas?{' '}
            <button
              type="button"
              onClick={() => setContactOpen(true)}
              className="text-[#FF4B8A] cursor-pointer hover:underline"
            >
              Contato
            </button>
          </p>
        </div>
      </div>

      {/* Modal de contato */}
      {contactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#0d0d0d] border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">
                Falar com o suporte
              </h2>
              <button
                onClick={() => setContactOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-400">
              A mensagem será aberta no seu WhatsApp para você enviar.
            </p>

            <textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#6F3AFF] focus:ring-2 focus:ring-[#6F3AFF]/30 resize-none"
              placeholder="João...não estou conseguindo logar no Atlas Admin, poderia checar para mim?"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setContactOpen(false)}
                className="px-3 py-2 text-xs rounded-xl text-gray-300 hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-[#FF8A3C] via-[#FF4B8A] to-[#6F3AFF] text-white hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                Abrir WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
