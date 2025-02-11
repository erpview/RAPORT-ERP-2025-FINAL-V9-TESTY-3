import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, LogIn } from 'lucide-react';

export const PendingAccount: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex flex-col items-center">
          <AlertCircle className="h-16 w-16 text-[#0066CC] mb-4" />
          <h2 className="text-[32px] font-semibold text-[#1d1d1f]">
            Konto oczekuje na zatwierdzenie
          </h2>
        </div>
        <div className="mt-4">
          <p className="text-[17px] text-[#86868b] mb-4">
            Twoje konto zostało utworzone, ale oczekuje na zatwierdzenie przez administratora.
            Zostaniesz powiadomiony emailem, gdy Twoje konto zostanie zatwierdzone.
          </p>
          <p className="text-[17px] text-[#86868b]">
            Jeśli masz pytania, skontaktuj się z nami poprzez formularz kontaktowy.
          </p>
        </div>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#2c3b67] text-white text-[15px] font-medium rounded-lg hover:bg-[#2c3b67]/90 transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Strona główna
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PendingAccount;
