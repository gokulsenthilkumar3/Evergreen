import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'warning';
  onClose: () => void;
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3200);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast-notification toast-${type}`}>
      <span className="toast-icon">
        {type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️'}
      </span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>✕</button>
    </div>
  );
}
