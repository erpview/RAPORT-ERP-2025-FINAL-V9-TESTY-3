import React from 'react';
import { Link } from 'react-router-dom';

const ReviewAddCard: React.FC = () => {
  return (
    <div className="sf-card p-6 bg-white mt-6">
      <div className="flex flex-col items-center text-center">
        <p className="text-[#2c3b67] text-lg mb-6">
          Zaloguj się lub zarejestruj, żeby zobaczyć wszystkie recenzje
        </p>
        <div className="flex gap-4">
          <Link
            to="/login"
            className="sf-button-primary inline-flex justify-center"
          >
            Logowanie
          </Link>
          <Link
            to="/admin/register"
            className="sf-button-secondary inline-flex justify-center"
          >
            Rejestracja
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ReviewAddCard;
