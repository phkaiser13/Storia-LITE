
import React, { useEffect } from 'react';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const typeStyles = {
    success: {
      bg: "bg-green-500 dark:bg-green-600",
      icon: <FiCheckCircle className="h-6 w-6 mr-3" />,
    },
    error: {
      bg: "bg-red-500 dark:bg-red-600",
      icon: <FiXCircle className="h-6 w-6 mr-3" />,
    },
  };

  return (
    <div 
      className={`fixed bottom-5 right-5 p-4 rounded-xl shadow-2xl text-white flex items-center z-[100] transition-all duration-300 transform animate-slide-in ${typeStyles[type].bg}`}
      role="alert"
      aria-live="assertive"
    >
      {typeStyles[type].icon}
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-black/20 transition-colors" aria-label="Fechar notificação">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
      </button>
    </div>
  );
};

export default Notification;
