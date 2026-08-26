import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type, message, options = {}) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const duration = options.duration !== undefined ? options.duration : 4000;
    const action = options.action || null; // { label: string, onClick: () => void }

    const newToast = { id, type, message, action };

    setToasts((prev) => [...prev.slice(-4), newToast]); // keep max 5 toasts

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  const toast = {
    success: (msg, opts) => addToast('success', msg, opts),
    error: (msg, opts) => addToast('error', msg, opts),
    info: (msg, opts) => addToast('info', msg, opts),
    warning: (msg, opts) => addToast('warning', msg, opts),
    remove: removeToast
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-[120] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((t) => {
            const isSuccess = t.type === 'success';
            const isError = t.type === 'error';
            const isWarning = t.type === 'warning';
            const isInfo = t.type === 'info';

            const borderColor = isSuccess
              ? 'border-brand-gold/40'
              : isError
              ? 'border-red-500/40'
              : isWarning
              ? 'border-amber-500/40'
              : 'border-cyan-500/40';

            const bgGlow = isSuccess
              ? 'shadow-[0_8px_30px_rgba(212,175,55,0.25)]'
              : isError
              ? 'shadow-[0_8px_30px_rgba(239,68,68,0.25)]'
              : isWarning
              ? 'shadow-[0_8px_30px_rgba(245,158,11,0.25)]'
              : 'shadow-[0_8px_30px_rgba(6,182,212,0.25)]';

            const icon = isSuccess ? '✦' : isError ? '✕' : isWarning ? '⚠' : 'ℹ';
            const iconBg = isSuccess
              ? 'bg-brand-gold text-black'
              : isError
              ? 'bg-red-500 text-white'
              : isWarning
              ? 'bg-amber-500 text-black'
              : 'bg-cyan-500 text-black';

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 25, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.95 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className={`pointer-events-auto flex items-start gap-3.5 p-4 rounded-2xl bg-[#141418]/95 backdrop-blur-2xl border ${borderColor} ${bgGlow} text-white`}
              >
                <div className={`w-6 h-6 rounded-full ${iconBg} flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 shadow-sm`}>
                  {icon}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-sans font-medium text-white/95 leading-relaxed">
                    {t.message}
                  </p>
                  {t.action && (
                    <button
                      onClick={() => {
                        t.action.onClick?.();
                        removeToast(t.id);
                      }}
                      className="mt-2 text-[11px] font-mono font-bold uppercase tracking-wider text-brand-gold hover:text-amber-300 transition-colors underline underline-offset-2"
                    >
                      {t.action.label} →
                    </button>
                  )}
                </div>

                <button
                  onClick={() => removeToast(t.id)}
                  className="text-white/40 hover:text-white text-sm transition-colors flex-shrink-0 p-0.5"
                  aria-label="Dismiss notification"
                >
                  ✕
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback safe dummy object if rendered outside provider
    return {
      success: (msg) => console.log('Toast:', msg),
      error: (msg) => console.error('Toast:', msg),
      info: (msg) => console.log('Toast:', msg),
      warning: (msg) => console.warn('Toast:', msg),
      remove: () => {}
    };
  }
  return ctx;
}
