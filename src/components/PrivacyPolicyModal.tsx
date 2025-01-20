import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 shadow-lg"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Informacja o przetwarzaniu danych osobowych</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="prose prose-sm max-w-none">
          <p style={{ textAlign: 'justify', fontSize: '12px' }}>
            Oświadczam, iż ukończyłem/am 16 rok życia i zgadzam się na przetwarzanie moich danych osobowych przez partnerów Usługodawcy: AXIANS IT SERVICES POLAND Sp. z o.o.ul. Postępu 21D 02-676 Warszawa NIP: 5260300641, Oracle Polska Sp. z o.o. ul. Przyokopowa 31 01-208 Warszawa NIP: 5270201490, SAS Deveho Consulting 162 Avenue Jean Jaurès - Immeuble Ambre - 69007 Lyon – FRANCE NIP: FR72513249524, BIURO PROJEKTOWANIA SYSTEMÓW CYFROWYCH Sp. z o.o. Al. Walentego Roździeńskiego 188H 40-203 Katowice NIP: 6340134346, IT.Integro Sp. z o.o. ul. Ząbkowicka 12 60-166 Poznań NIP: 7780021279, Soneta Sp. z o.o. u. J. Kustronia 44A 30-432 Kraków NIP: 6792705304, proALPHA Polska Sp. z o.o.. ul. Dąbrowskiego 12 65-021 Zielona Góra NIP: 9291734868, ANEGIS Sp. z o.o. Centrum Południe, ul. Powstańców Śląskich 17, bud. D, 53-332 Wrocław, KRS 0000472846 i NIP 8971791899, Symfonia sp. z o.o., Al. Jerozolimskie 132, 02-305 Warszawa NIP: 5262831503, Sente spółka z ograniczoną odpowiedzialnością sp. k., ul. Legnicka 51-53, NIP: 8951718379, CFI Systemy Informatyczne sp. z o.o., ul. Piotra Trębacza 18B, 31-436 Kraków, NIP: 6762260642, Streamsoft Spółka z Ograniczoną Odpowiedzialnością Sp. K., al. Wojska Polskiego 11, 65-077 Zielona Góra, 929-185-17-23, iPCC sp. z o. o., Wał Miedzeszyński 608, 03-994 Warszawa, 1132738996, Jakob Hatteland Group Management AS, Stokkastrandvegen 85, NO-5578 Nedre Vats, NIP: NO817472842, Sygnity Business Solutions Sp. z o.o., ul. Dąbrowskiego 12, 65-021 Zielona Góra, NIP: 929-009-43-26, Asseco Business Solutions S.A.ul. Konrada Wallenroda 4c 20-607 Lublin NIP: 522-26-12-717, RHO Software Balicka 164a, 30-198 Kraków NIP5691066210, SIMPLE S.A. ul. Bronisława Czecha 49/51 04-555 Warszawa, NIP 113-00-22-578, Przedsiębiorstwo Handlowo-Usługowe DIGITLAND W.Wierzba i S-ka Spółka Jawna os. Centrum A 13/33 31-925 Kraków NIP: 678-00-25-259 w celu wysyłania informacji marketingowej, handlowej oraz przedstawiania oferty handlowej poprzez wykonywanie połączeń telefonicznych. Podanie danych jest dobrowolne. Podstawą przetwarzania danych jest moja zgoda. Mam prawo wycofania zgody w dowolnym momencie. Dane osobowe będą przetwarzane do czasu odwołania zgody. Mam prawo żądania od administratora dostępu do moich danych osobowych, ich sprostowania, usunięcia lub ograniczenia przetwarzania, a także prawo wniesienia skargi do organu nadzorczego. Strona stosuje profilowanie użytkowników m.in. za pośrednictwem plików cookies, w tym analitycznych, o czym więcej w <a href="polityka-prywatnosci.html" target="_blank" rel="noopener noreferrer">Polityce Prywatności</a>
          </p>
        </div>
      </div>
    </div>
  );
};