import React, { useState } from 'react';
import { Linkedin, Facebook, Twitter } from 'lucide-react';
import { PrivacyModalFooter } from './PrivacyModalFooter';
import { RegulaminModalFooter } from './RegulaminModalFooter';

export const Footer: React.FC = () => {
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isRegulaminModalOpen, setIsRegulaminModalOpen] = useState(false);

  return (
    <>
      <footer className="bg-[#F5F5F7] border-t border-[#d2d2d7]/30 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col items-center space-y-4">
            <p className="text-[15px] text-[#86868b]">
              <a 
                href="https://www.erp-view.pl" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#0066CC] hover:underline"
              >
                ERP-VIEW.PL
              </a>
              {' '}| Portal rozwiązań IT w biznesie | {' '}
              <button 
                onClick={() => setIsPrivacyModalOpen(true)}
                className="text-[#0066CC] hover:underline"
              >
                Polityka prywatności
              </button>
              {' '}| {' '}
              <button 
                onClick={() => setIsRegulaminModalOpen(true)}
                className="text-[#0066CC] hover:underline"
              >
                Regulamin
              </button>
            </p>
            
            <div className="flex items-center space-x-6">
              <a
                href="https://www.linkedin.com/company/erp-view-pl"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#86868b] hover:text-[#0066CC] transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://www.facebook.com/erpviewpl"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#86868b] hover:text-[#0066CC] transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://x.com/erpview"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#86868b] hover:text-[#0066CC] transition-colors duration-200"
                aria-label="X (Twitter)"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
      <PrivacyModalFooter 
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
      <RegulaminModalFooter 
        isOpen={isRegulaminModalOpen}
        onClose={() => setIsRegulaminModalOpen(false)}
      />
    </>
  );
};