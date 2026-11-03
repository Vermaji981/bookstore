import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    const newToast = { id, message, type };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="toast-container" aria-live="polite">
        {toasts.map((toast) => {
          let icon = <CheckCircle2 size={18} color="#10b981" />;
          let borderColor = '#10b981';
          let bgColor = '#f0fdf4';
          let textColor = '#166534';

          if (toast.type === 'error') {
            icon = <AlertCircle size={18} color="#ef4444" />;
            borderColor = '#ef4444';
            bgColor = '#fef2f2';
            textColor = '#991b1b';
          } else if (toast.type === 'warning') {
            icon = <AlertTriangle size={18} color="#f59e0b" />;
            borderColor = '#f59e0b';
            bgColor = '#fffbeb';
            textColor = '#92400e';
          } else if (toast.type === 'info') {
            icon = <Info size={18} color="#3b82f6" />;
            borderColor = '#3b82f6';
            bgColor = '#eff6ff';
            textColor = '#1e40af';
          }

          return (
            <div
              key={toast.id}
              className="toast-item animate-slide-up"
              style={{
                borderLeft: `4px solid ${borderColor}`,
                backgroundColor: bgColor,
                color: textColor,
              }}
            >
              <div style={{ flexShrink: 0, marginTop: '2px' }}>{icon}</div>
              <div style={{ flex: 1, fontSize: '0.88rem', fontWeight: 500, lineHeight: 1.4 }}>
                {toast.message}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="toast-close-btn"
                aria-label="Close notification"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: (msg) => console.log('Toast:', msg),
      removeToast: () => {},
    };
  }
  return context;
};

