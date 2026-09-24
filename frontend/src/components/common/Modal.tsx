import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'lg'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />
      <div className={`relative w-full ${maxWidthClasses[maxWidth]} bg-white dark:bg-[#0c2a33] border border-line rounded-3xl shadow-2xl p-6 overflow-hidden z-10 max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between pb-4 border-b border-line shrink-0">
          <h3 id="modal-title" className="font-serif font-semibold text-xl text-deep">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-mid hover:text-deep hover:bg-line transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto pt-4 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
