import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  fullWidth?: boolean;
}

function Button({
  children,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = `px-6 py-3.5 rounded-xl font-semibold transition-all duration-200 
    flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
    ${className}`;

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-[#FF8A3C] via-[#FF4B8A] to-[#7B2CFF] text-white ' +
      'hover:shadow-xl hover:shadow-[#7B2CFF]/40 hover:scale-[1.02] active:scale-[0.98]',
    secondary:
      'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20',
    ghost: 'text-gray-300 hover:bg-white/5',
  };


  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={20} className="animate-spin" />}
      {children}
    </button>
  );
}

export default Button;
