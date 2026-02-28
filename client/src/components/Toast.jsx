import { useState, useEffect, useCallback } from 'react';

let toastId = 0;

// Global toast state — simple approach without a heavy library
const listeners = new Set();
let toasts = [];

const notify = (message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    const toast = { id, message, type, duration };
    toasts = [...toasts, toast];
    listeners.forEach((l) => l(toasts));

    setTimeout(() => {
        toasts = toasts.filter((t) => t.id !== id);
        listeners.forEach((l) => l(toasts));
    }, duration);

    return id;
};

export const toast = {
    success: (msg, duration) => notify(msg, 'success', duration),
    error: (msg, duration) => notify(msg, 'error', duration),
    info: (msg, duration) => notify(msg, 'info', duration),
};

const ToastContainer = () => {
    const [currentToasts, setCurrentToasts] = useState([]);

    useEffect(() => {
        listeners.add(setCurrentToasts);
        return () => listeners.delete(setCurrentToasts);
    }, []);

    const dismiss = useCallback((id) => {
        toasts = toasts.filter((t) => t.id !== id);
        listeners.forEach((l) => l(toasts));
    }, []);

    if (currentToasts.length === 0) return null;

    return (
        <div className="toast-container" id="toast-container">
            {currentToasts.map((t) => (
                <div
                    key={t.id}
                    className={`toast ${t.type}`}
                    onClick={() => dismiss(t.id)}
                    role="alert"
                >
                    <span>
                        {t.type === 'success' && '✓'}
                        {t.type === 'error' && '✕'}
                        {t.type === 'info' && 'ℹ'}
                    </span>
                    {t.message}
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
