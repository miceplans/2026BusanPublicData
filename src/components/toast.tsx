'use client';
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';

type ToastVariant = 'error' | 'success';
type ToastItem = { id: number; message: string; variant: ToastVariant };

type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'error') => {
      const id = ++idRef.current;
      setToasts((v) => [...v, { id, message, variant }]);
      setTimeout(() => {
        setToasts((v) => v.filter((t) => t.id !== id));
      }, 4000);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col-reverse items-center gap-2 px-4 sm:right-4 sm:left-auto sm:items-end"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={`motion-feedback pointer-events-auto w-full max-w-sm rounded-[10px] px-4 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,0,0,0.16)] ${
              t.variant === 'error' ? 'bg-red-700' : 'brand-gradient'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
