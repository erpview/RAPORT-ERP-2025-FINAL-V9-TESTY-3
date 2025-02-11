import React from 'react';
import { X } from 'lucide-react';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  persistent?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth,
  size = 'md',
  className = '',
  persistent = false
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !persistent) {
      onClose();
    }
  };

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-5xl'
  };

  // Use maxWidth prop if provided, otherwise use size class
  const widthClass = maxWidth || sizeClasses[size];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/30" onClick={handleBackdropClick} />
        
        <div 
          className={`relative w-full ${widthClass} ${className} bg-white rounded-2xl shadow-xl overflow-hidden`}
          role="dialog"
          aria-modal="true"
        >
          {title && (
            <div className="sticky top-0 flex items-center justify-between p-6 pb-4 bg-white border-b border-gray-200 rounded-t-2xl">
              <h2 className="text-lg font-medium text-gray-900">{title}</h2>
              {!persistent && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Zamknij"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>
          )}
          {!title && !persistent && (
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 z-10"
              aria-label="Zamknij"
            >
              <X className="w-6 h-6" />
            </button>
          )}
          <div className="custom-scrollbar max-h-[calc(100vh-8rem)] overflow-y-auto rounded-b-2xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
