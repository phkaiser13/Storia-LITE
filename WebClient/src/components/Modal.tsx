import React, { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const modalRoot = document.getElementById('modal-root');

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !modalRoot) {
    return null;
  }

  return createPortal(
    <div 
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-50 flex justify-center items-center p-4 animate-fade-in" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-light-glass dark:bg-dark-glass backdrop-blur-2xl rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] animate-modal-enter border border-light-border dark:border-dark-border" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-light-border dark:border-dark-border">
          <h3 id="modal-title" className="text-xl font-heading font-semibold text-light-text dark:text-dark-text">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-600 dark:hover:text-white rounded-full p-1.5 transition-colors duration-200"
            aria-label="Fechar modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="flex-grow p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    modalRoot
  );
};

export default Modal;