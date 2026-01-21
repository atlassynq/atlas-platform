
type ToastType = 'success' | 'error';

interface ToastProps {
  open: boolean;
  message: string;
  type?: ToastType;
}

function Toast({ open, message, type = 'success' }: ToastProps) {
  if (!open) return null;

  const base =
    'fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl text-sm shadow-lg flex items-center gap-2';
  const variants =
    type === 'success'
      ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-200'
      : 'bg-red-500/15 border border-red-500/40 text-red-200';

  return (
    <div className={`${base} ${variants}`}>
      <span className="w-2 h-2 rounded-full bg-current" />
      <span>{message}</span>
    </div>
  );
}

export default Toast;
