import React from 'react';
import { CheckCircle2, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleClose = () => {
    onClose();
  };

  const handleCostClick = () => {
    onClose();
    navigate('/koszt-wdrozenia-erp');
    window.scrollTo(0, 0);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black/30" onClick={handleClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-xl">
        <div className="p-8 text-center">
          <div className="mb-6 flex justify-center">
            <CheckCircle2 className="w-16 h-16 text-[#32D74B]" />
          </div>
          
          <h2 className="text-2xl font-semibold mb-4 text-[#1d1d1f]">
            Dziękujemy za wypełnienie formularza
          </h2>
          
          <p className="text-[#424245] mb-6">
            Nasz zespół prześle Twoje zapytanie do partnerów raportu ERP, którzy skontaktują się z Tobą w ciągu 24 godzin.
          </p>

          <div className="flex flex-col gap-3">
            <a
              href="https://www.erp-view.pl"
              target="_blank"
              rel="noopener noreferrer"
              className="sf-button-primary w-full justify-center"
              onClick={handleClose}
            >
              Sprawdź informacje z rynku ERP
              <ExternalLink className="w-5 h-5 ml-2" />
            </a>
            
            <button
              onClick={handleClose}
              className="sf-button-primary w-full justify-center"
            >
              Zamknij
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};