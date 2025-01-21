import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export const RegistrationSuccess: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="sf-card p-8 text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-[#0066CC]" />
          </div>
          
          <h1 className="text-2xl font-semibold text-[#1d1d1f]">
            Rejestracja zakończona pomyślnie!
          </h1>
          
          <p className="text-[17px] text-[#86868b]">
            Twoje konto zostało utworzone i oczekuje na zatwierdzenie przez administratora.
            Po zatwierdzeniu otrzymasz wiadomość email z dalszymi instrukcjami.
          </p>

          <div className="pt-4">
            <Link
              to="/"
              className="sf-button-primary w-full justify-center"
            >
              Powrót do strony głównej
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
