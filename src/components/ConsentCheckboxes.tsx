import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';

interface ConsentCheckboxesProps {
  privacyAccepted: boolean;
  marketingAccepted: boolean;
  onChange: (name: string, value: boolean) => void;
}

export const ConsentCheckboxes: React.FC<ConsentCheckboxesProps> = ({
  privacyAccepted,
  marketingAccepted,
  onChange
}) => {
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Info className="w-6 h-6 text-[#2c3b67]" />
        <h3 className="text-[21px] font-semibold text-[#1d1d1f]">
          Wymagane zgody
        </h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <input
              type="checkbox"
              id="privacy-consent"
              checked={privacyAccepted}
              onChange={(e) => onChange('privacyAccepted', e.target.checked)}
              className="sf-checkbox"
              required
            />
          </div>
          <div>
            <label htmlFor="privacy-consent" className="text-[15px] text-[#1d1d1f] cursor-pointer">
              Zapoznałem się z <button 
                onClick={(e) => {
                  e.preventDefault();
                  setIsPrivacyModalOpen(true);
                }}
                className="text-blue-600 hover:underline"
              >
                informacją o administratorze i przetwarzaniu danych
              </button>. *
            </label>
            <p className="mt-1 text-[13px] text-[#86868b]">
              Twoje dane są bezpieczne i będą udostępnione partnerom raportu i portalu ERP-VIEW.PL.
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="marketing"
              name="marketingAccepted"
              type="checkbox"
              checked={marketingAccepted}
              onChange={(e) => onChange('marketingAccepted', e.target.checked)}
              required
              className="sf-checkbox"
            />
          </div>
          <div className="ml-3">
            <label htmlFor="marketing" className="text-[15px] text-[#1d1d1f] cursor-pointer">
            Zgadzam się na otrzymywanie "informacji handlowych" w rozumieniu ustawy z dnia 18 lipca 2002 r. o świadczeniu usług drogą elektroniczną od Partnerów RAPORTU ERP oraz portalu ERP-VIEW.PL. *
            </label>
            <p className="mt-1 text-[13px] text-[#86868b]">
              Możesz zrezygnować w każdej chwili.
            </p>
          </div>
        </div>
      </div>
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </div>
  );
};