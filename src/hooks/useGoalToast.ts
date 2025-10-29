import { useEffect } from 'react';

interface ToastEvent extends CustomEvent {
  detail: {
    success: boolean;
    message: string;
  };
}

export function useGoalToast() {
  useEffect(() => {
    const handleGoalUpdate = (event: Event) => {
      const customEvent = event as ToastEvent;
      const { success, message } = customEvent.detail;

      // Criar elemento de toast
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        font-weight: 500;
        font-size: 14px;
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        max-width: 400px;
        word-wrap: break-word;
      `;

      if (success) {
        toast.style.backgroundColor = '#10b981';
        toast.style.color = '#ffffff';
      } else {
        toast.style.backgroundColor = '#ef4444';
        toast.style.color = '#ffffff';
      }

      toast.textContent = message;

      // Adicionar animação
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }
      `;
      if (!document.head.querySelector('style[data-toast-animation]')) {
        style.setAttribute('data-toast-animation', 'true');
        document.head.appendChild(style);
      }

      document.body.appendChild(toast);

      // Remover após 3 segundos
      setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 3000);
    };

    window.addEventListener('goalUpdated', handleGoalUpdate);
    return () => {
      window.removeEventListener('goalUpdated', handleGoalUpdate);
    };
  }, []);
}