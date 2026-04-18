import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';

const ToastContext = createContext(null);

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const toastMeta = {
  success: {
    icon: CheckCircle2,
    label: 'Success',
  },
  error: {
    icon: AlertCircle,
    label: 'Error',
  },
  warning: {
    icon: TriangleAlert,
    label: 'Warning',
  },
  info: {
    icon: Info,
    label: 'Info',
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialogs, setDialogs] = useState([]);
  const toastTimeoutsRef = useRef(new Map());
  const dialogResolversRef = useRef(new Map());

  useEffect(() => (
    () => {
      toastTimeoutsRef.current.forEach(clearTimeout);
      dialogResolversRef.current.forEach((resolve) => resolve(null));
      toastTimeoutsRef.current.clear();
      dialogResolversRef.current.clear();
    }
  ), []);

  const dismissToast = (id) => {
    const timeout = toastTimeoutsRef.current.get(id);

    if (timeout) {
      clearTimeout(timeout);
      toastTimeoutsRef.current.delete(id);
    }

    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  };

  const showToast = ({
    title,
    message,
    variant = 'info',
    duration,
  }) => {
    const id = createId('toast');
    const timeoutDuration = duration ?? (variant === 'success' ? 3200 : 4200);

    setToasts((currentToasts) => [
      ...currentToasts,
      { id, title, message, variant },
    ]);

    if (timeoutDuration > 0) {
      const timeout = setTimeout(() => dismissToast(id), timeoutDuration);
      toastTimeoutsRef.current.set(id, timeout);
    }

    return id;
  };

  const resolveDialog = (id, result) => {
    const resolve = dialogResolversRef.current.get(id);

    dialogResolversRef.current.delete(id);
    setDialogs((currentDialogs) => currentDialogs.filter((dialog) => dialog.id !== id));

    if (resolve) {
      resolve(result);
    }
  };

  const updateDialogValue = (id, value) => {
    setDialogs((currentDialogs) => currentDialogs.map((dialog) => (
      dialog.id === id ? { ...dialog, inputValue: value } : dialog
    )));
  };

  const showConfirm = ({
    title = 'Confirm Action',
    message = '',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    confirmTone = 'primary',
  }) => new Promise((resolve) => {
    const id = createId('dialog');

    dialogResolversRef.current.set(id, resolve);
    setDialogs((currentDialogs) => [
      ...currentDialogs,
      {
        id,
        type: 'confirm',
        title,
        message,
        confirmLabel,
        cancelLabel,
        confirmTone,
      },
    ]);
  });

  const showPrompt = ({
    title = 'Enter Details',
    message = '',
    placeholder = '',
    confirmLabel = 'Save',
    cancelLabel = 'Cancel',
    confirmTone = 'primary',
    required = false,
    defaultValue = '',
    multiline = true,
  }) => new Promise((resolve) => {
    const id = createId('dialog');

    dialogResolversRef.current.set(id, resolve);
    setDialogs((currentDialogs) => [
      ...currentDialogs,
      {
        id,
        type: 'prompt',
        title,
        message,
        placeholder,
        confirmLabel,
        cancelLabel,
        confirmTone,
        required,
        inputValue: defaultValue,
        multiline,
      },
    ]);
  });

  const value = {
    showToast,
    showConfirm,
    showPrompt,
    dismissToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {dialogs.length > 0 && (
        <div className="toast-dialog-layer">
          <div
            className="toast-dialog-backdrop"
            onClick={() => resolveDialog(dialogs[dialogs.length - 1].id, null)}
            aria-hidden="true"
          />
          {dialogs.map((dialog) => {
            const isPrompt = dialog.type === 'prompt';
            const promptValue = dialog.inputValue ?? '';
            const isPromptDisabled = isPrompt && dialog.required && !promptValue.trim();

            return (
              <div key={dialog.id} className="toast-dialog-shell">
                <div className="toast-dialog-card" role="dialog" aria-modal="true" aria-label={dialog.title}>
                  <div className="toast-dialog-header">
                    <div>
                      <div className="toast-dialog-eyebrow">Action Required</div>
                      <div className="toast-dialog-title">{dialog.title}</div>
                    </div>
                    <button
                      type="button"
                      className="toast-close-button"
                      onClick={() => resolveDialog(dialog.id, null)}
                      aria-label="Dismiss message"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {dialog.message && (
                    <div className="toast-dialog-message">{dialog.message}</div>
                  )}

                  {isPrompt && (
                    dialog.multiline ? (
                      <textarea
                        className="toast-dialog-input"
                        value={promptValue}
                        onChange={(event) => updateDialogValue(dialog.id, event.target.value)}
                        placeholder={dialog.placeholder}
                        rows={3}
                      />
                    ) : (
                      <input
                        className="toast-dialog-input"
                        value={promptValue}
                        onChange={(event) => updateDialogValue(dialog.id, event.target.value)}
                        placeholder={dialog.placeholder}
                        type="text"
                      />
                    )
                  )}

                  <div className="toast-dialog-actions">
                    <button
                      type="button"
                      className="toast-button toast-button-secondary"
                      onClick={() => resolveDialog(dialog.id, null)}
                    >
                      {dialog.cancelLabel}
                    </button>
                    <button
                      type="button"
                      className={`toast-button toast-button-${dialog.confirmTone}`}
                      disabled={isPromptDisabled}
                      onClick={() => resolveDialog(dialog.id, isPrompt ? promptValue : true)}
                    >
                      {dialog.confirmLabel}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="toast-viewport" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => {
          const meta = toastMeta[toast.variant] || toastMeta.info;
          const Icon = meta.icon;

          return (
            <div key={toast.id} className={`toast-card toast-card-${toast.variant}`} role="status">
              <div className="toast-card-icon">
                <Icon size={18} />
              </div>
              <div className="toast-card-content">
                <div className="toast-card-label">{toast.title || meta.label}</div>
                {toast.message && <div className="toast-card-message">{toast.message}</div>}
              </div>
              <button
                type="button"
                className="toast-close-button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Close notification"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider.');
  }

  return context;
}
