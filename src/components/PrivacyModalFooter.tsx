import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface PrivacyModalFooterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModalFooter: React.FC<PrivacyModalFooterProps> = ({ isOpen, onClose }) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 shadow-lg"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Polityka Prywatności</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="prose prose-sm max-w-none">
          <p style={{ textAlign: 'justify', fontSize: '12px' }}>
          <p>POLITYKA PRYWATNOŚCI<br />(obowiązuje od 25 maja 2018 r.)</p>
<p><strong>I. Postanowienia ogólne</strong><br /><strong>II. Cel i zakres zbierania danych</strong><br /><strong>III. Podstawa przetwarzania danych</strong><br /><strong>IV. Prawo kontroli, dostępu do treści swoich danych oraz ich poprawiania</strong><br /><strong>V. Pliki „Cookies”</strong><br /><strong>VI. Postanowienia końcowe</strong></p>
<p><strong>I. POSTANOWIENIA OGÓLNE</strong><br />1. Administratorem danych osobowych zbieranych za pośrednictwem Serwisu www.raport-erp.pl jest Patrycjusz Jaworski wykonujący działalność gospodarczą pod firmą ERP-VIEW.PL PATRYCJUSZ JAWORSKI wpisaną do Centralnej Ewidencji i Informacji o Działalności Gospodarczej Rzeczypospolitej Polskiej prowadzonej przez ministra właściwego do spraw gospodarki, adres miejsca wykonywania działalności oraz adres do doręczeń: ul. Dzielna 25/17, 54-152 Wrocław, NIP: 8942457040, REGON: 020881427, adres poczty elektronicznej (e-mail): p.jaworski@erp-view.pl, zwany dalej "Administratorem" i będący jednocześnie Usługodawcą.<br />2. Wszelkie wyrazy lub wyrażenia pisane w treści niniejszej Polityki Prywatności z dużej litery należy rozumieć zgodnie z ich definicją zawartą w Regulaminie Serwisu www.raport-erp.pl.</p>
<p><strong>II. CEL I ZAKRES ZBIERANIA DANYCH</strong><br />1. Dane osobowe będą przetwarzane w celu kontaktowania się z Usługobiorcą, do celów informacyjnych, księgowych oraz innych czynności związanych z aktywnością Usługobiorcy w Serwisie www.raport-erp.pl, a także marketingu bezpośredniego dotyczącego własnych usług, realizowanego w formie tradycyjnej (papierowo), stanowiącym tzw. prawnie uzasadniony interes przedsiębiorcy. Dane w tych celach przetwarzane będą na podstawie art. 6 ust. 1 lit. b), c) i f) Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 roku w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO).<br />2. Po wyrażeniu odrębnej zgody, na podstawie art. 6 ust. 1 lit. a) RODO dane mogą być przetwarzane również w celu przesyłania informacji handlowych drogą elektroniczną lub wykonywania telefonicznych połączeń w celu marketingu bezpośredniego – odpowiednio w związku z art. 10 ust. 2 Ustawy z dnia 18 lipca 2002 roku o świadczeniu usług drogą elektroniczną lub art. 172 ust. 1 Ustawy z dnia 16 lipca 2004 roku – Prawo Telekomunikacyjne, w tym kierowanych w wyniku profilowania, o ile użytkownik wyraził stosowną zgodę.<br />3. Dane osobowe przetwarzane w celach związanych z realizacją usług będą przetwarzane przez okres niezbędny do realizacji usług, po czym dane podlegające archiwizacji będą przechowywane przez okres właściwy dla przedawnienia roszczeń, tj. 10 lat. Dane osobowe przetwarzane w celach marketingowych objętych oświadczeniem zgody będą przetwarzane do czasu odwołania zgody.<br />4. W przypadku stwierdzenia, że przetwarzanie danych osobowych narusza przepisy RODO, osoba, której dane dotyczą, ma prawo wnieść skargę do Generalnego Inspektora Ochrony Danych Osobowych (od 25 maja 2018 roku – Prezesa Urzędu Ochrony Danych Osobowych).<br />5. Podanie danych osobowych jest dobrowolne, jednak podanie oznaczonych danych osobowych jest warunkiem zamówienia usługi, natomiast konsekwencją ich niepodania będzie brak możliwości zamówienia usługi w Serwisie.<br />6. Dane osobowe będą przetwarzane także w sposób zautomatyzowany w formie profilowania, o ile użytkownik wyrazi na to zgodę na podstawie art. 6 ust. 1 lit. a) RODO. Konsekwencją profilowania będzie przypisanie danej osobie profilu w celu podejmowania dotyczących jej decyzji bądź analizy lub przewidywania jej preferencji, zachowań i postaw.<br />7. Administrator dokłada szczególnej staranności w celu ochrony interesów osób, których dane dotyczą, a w szczególności zapewnia, że zbierane przez niego dane są:<br />a) przetwarzane zgodnie z prawem, <br />b) zbierane dla oznaczonych, zgodnych z prawem celów i niepoddawane dalszemu przetwarzaniu niezgodnemu z tymi celami,<br />c) merytorycznie poprawne i adekwatne w stosunku do celów, w jakich są przetwarzane oraz przechowywane w postaci umożliwiającej identyfikację osób, których dotyczą, nie dłużej niż jest to niezbędne do osiągnięcia celu przetwarzania.</p>
<p><strong>III. PRAWO KONTROLI, DOSTĘPU DO TREŚCI SWOICH DANYCH ORAZ ICH POPRAWIANIA</strong><br />1. Osoba, której dane dotyczą, ma prawo dostępu do treści swoich danych osobowych oraz prawo ich sprostowania, usunięcia, ograniczenia przetwarzania, prawo do przenoszenia danych, prawo wniesienia sprzeciwu, prawo do cofnięcia zgody w dowolnym momencie bez wpływu na zgodność z prawem przetwarzania, którego dokonano na podstawie zgody przed jej cofnięciem.<br />2. W celu realizacji uprawnień, o których mowa w pkt 1 można wysłać stosowną wiadomość e-mail na adres: p.jaworski@erp-view.pl.</p>
<p><strong>IV. PLIKI "COOKIES"</strong><br />1. Serwis Usługodawcy używa plików „cookies”. Brak zmiany po stronie Usługobiorcy ustawień przeglądarki jest równoznaczny z wyrażeniem zgody na ich użycie.<br />2. Instalacja plików „cookies” jest konieczna do prawidłowego świadczenia usług w Serwisie. W plikach „cookies" znajdują się informacje niezbędne do prawidłowego funkcjonowania Serwisu, w szczególności tych wymagających autoryzacji.<br />3. W ramach Serwisu stosowane są trzy rodzaje plików „cookies”: „sesyjne”, „stałe” oraz analityczne.<br />a) „Cookies” „sesyjne” są plikami tymczasowymi, które przechowywane są w urządzeniu końcowym Usługobiorcy do czasu wylogowania (opuszczenia Serwisu).<br />b) „Stałe” pliki „cookies” przechowywane są w urządzeniu końcowym Usługobiorcy przez czas określony w parametrach plików „cookies” lub do czasu ich usunięcia przez Użytkownika.<br />c) „Cookies” „analityczne” umożliwiają lepsze poznanie sposobu interakcji Usługobiorcy w zakresie zawartości Serwisu, lepiej zorganizować jego układ. “Analityczne” „cookies” gromadzą informacje o sposobie korzystania z Serwisu przez Usługobiorców, typie strony, z jakiej Usługobiorca został przekierowany, oraz liczbie odwiedzin i czasie wizyty Usługobiorcy na stronie serwisu. Informacje te nie rejestrują konkretnych danych osobowych Usługobiorcy, lecz służą do opracowania statystyk korzystania z Serwisu. <br />4. Użytkownik ma prawo zadecydowania w zakresie dostępu plików „cookies” do swojego komputera poprzez ich uprzedni wybór w oknie swojej przeglądarki. Szczegółowe informacje o możliwości i sposobach obsługi plików „cookies” dostępne są w ustawieniach oprogramowania (przeglądarki internetowej).</p>
<p><strong>V. POSTANOWIENIA KOŃCOWE</strong><br />1. Administrator stosuje środki techniczne i organizacyjne zapewniające ochronę przetwarzanych danych osobowych odpowiednią do zagrożeń oraz kategorii danych objętych ochroną, a w szczególności zabezpiecza dane przed ich udostępnieniem osobom nieupoważnionym, zabraniem przez osobę nieuprawnioną, przetwarzaniem z naruszeniem obowiązujących przepisów oraz zmianą, utratą, uszkodzeniem lub zniszczeniem.<br />2. Usługodawca udostępnia odpowiednie środki techniczne zapobiegające pozyskiwaniu i modyfikowaniu przez osoby nieuprawnione, danych osobowych przesyłanych drogą elektroniczną.<br />3. W sprawach nieuregulowanych niniejszą Polityką Prywatności stosuje się odpowiednio postanowienia Regulaminu Serwisu www.raport-erp.pl, przepisy Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 roku w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO) oraz inne właściwe przepisy prawa polskiego.<br />4. Postanowienia niniejszej Polityki Prywatności wchodzą w życie z dniem 25 maja 2018 roku.</p>
          </p>
        </div>
      </div>
    </div>
  );
};
