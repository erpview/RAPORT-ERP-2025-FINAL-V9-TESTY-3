import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { LinkedInAuthButton } from './LinkedInAuthButton';
import { AlertCircle } from 'lucide-react';

interface LinkedInAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LinkedInAuthModal: React.FC<LinkedInAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = () => {
    setError(null);
    onSuccess?.();
    onClose();
  };

  const handleError = (error: Error) => {
    setError('Wystąpił błąd podczas logowania przez LinkedIn. Spróbuj ponownie później.');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
    >
      <div className="p-6 space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-[#1d1d1f]">
            Zaloguj się, aby dodać ocenę
          </h2>
          <p className="text-[15px] text-gray-600">
            Zaloguj się, aby móc ocenić system ERP i podzielić się swoimi doświadczeniami.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 text-red-700 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <a href="/login" className="sf-button-primary inline-flex justify-center">
            Logowanie
          </a>
          <a href="/admin/register" className="sf-button-secondary inline-flex justify-center">
            Rejestracja
          </a>
          <LinkedInAuthButton
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Logując się, akceptujesz naszą{' '}
            <a href="/polityka-prywatnosci" className="text-[#007AFF] hover:underline" target="_blank" rel="noopener noreferrer">
              politykę prywatności
            </a>
          </p>
        </div>
      </div>
    </Modal>
  );
};
