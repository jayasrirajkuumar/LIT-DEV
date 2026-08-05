import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message) => {
    setToast({ message, id: Date.now() });
  }, []);

  useEffect(() => {
    const handleToast = (event) => {
      if (event.detail?.message) {
        showToast(event.detail.message);
      }
    };

    window.addEventListener("lit-toast", handleToast);
    return () => window.removeEventListener("lit-toast", handleToast);
  }, [showToast]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            className="fixed right-4 top-[calc(var(--lit-nav-height)+1rem)] z-[2500] max-w-[calc(100vw-2rem)] break-words rounded-xl border border-slate-200 bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-xl sm:right-5"
            initial={{ opacity: 0, y: -12, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -12, x: 20 }}
            role="status"
            aria-live="polite"
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

export default ToastProvider;
