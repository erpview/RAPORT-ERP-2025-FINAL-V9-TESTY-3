import React from 'react';
import { 
  Calculator, 
  GitBranch, 
  Server, 
  Cloud, 
  GitMerge, 
  DollarSign, 
  Building2,
  Key,
  Database,
  Search,
  FileStack,
  Link2,
  GraduationCap,
  HeadphonesIcon,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CostArticle: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <article className="prose max-w-none">
      <p className="text-[17px] leading-relaxed text-[#1d1d1f] mb-8">
        Wdrożenie systemu ERP (Enterprise Resource Planning) to poważna inwestycja, której koszty mogą się różnić w zależności od wielu czynników. Systemy ERP, które wspierają zarządzanie kluczowymi procesami biznesowymi, są dziś niezbędne zarówno dla dużych przedsiębiorstw, jak i mniejszych firm. Jednak każda firma, planując wdrożenie ERP, musi dokładnie przeanalizować swój budżet, aby efektywnie zarządzać kosztami związanymi z implementacją. Poniżej przedstawiamy kluczowe elementy, które składają się na koszt wdrożenia ERP oraz porównanie różnych modeli rozliczeń.
      </p>

      <h3 className="text-[24px] font-semibold text-[#1d1d1f] mt-12 mb-4 flex items-center gap-2">
        <Calculator className="w-6 h-6 text-[#2c3b67]" />
        Co składa się na koszt systemu ERP?
      </h3>

      <p className="text-[17px] leading-relaxed text-[#1d1d1f] mb-6">
        Całkowity koszt wdrożenia ERP obejmuje liczne składowe, takie jak:
      </p>

      <div className="space-y-6">
        <div className="sf-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <Key className="w-6 h-6 text-[#2c3b67]" />
            <h4 className="text-[19px] font-semibold text-[#1d1d1f]">
              Licencje oprogramowania ERP
            </h4>
          </div>
          <p className="text-[15px] text-[#1d1d1f]">
            Licencje mogą mieć formę jednorazowych opłat za licencje wieczyste lub opłat w modelu subskrypcyjnym. Subskrypcja, często stosowana w systemach ERP w chmurze, pozwala na rozłożenie kosztów w czasie, co jest korzystne dla firm o ograniczonym budżecie.
          </p>
        </div>

        <div className="sf-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <Server className="w-6 h-6 text-[#2c3b67]" />
            <h4 className="text-[19px] font-semibold text-[#1d1d1f]">
              Infrastruktura IT
            </h4>
          </div>
          <p className="text-[15px] text-[#1d1d1f]">
            Dla wdrożeń on-premise firma musi zapewnić odpowiednią infrastrukturę IT, co może oznaczać konieczność zakupu serwerów, urządzeń sieciowych czy urządzeń mobilnych. W przypadku chmury koszty infrastruktury są niższe, jednak pojawiają się opłaty związane z dostosowaniem do wymagań chmurowych i zapewnieniem odpowiedniego łącza internetowego.
          </p>
        </div>

        <div className="sf-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <Search className="w-6 h-6 text-[#2c3b67]" />
            <h4 className="text-[19px] font-semibold text-[#1d1d1f]">
              Analiza przedwdrożeniowa
            </h4>
          </div>
          <p className="text-[15px] text-[#1d1d1f]">
            Przeprowadzenie analizy przedwdrożeniowej pozwala zidentyfikować specyficzne potrzeby firmy i dostosować system ERP do jej wymagań. Proces ten obejmuje przygotowanie dokumentacji wdrożeniowej oraz określenie zakresu i harmonogramu projektu.
          </p>
        </div>

        <div className="sf-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <Database className="w-6 h-6 text-[#2c3b67]" />
            <h4 className="text-[19px] font-semibold text-[#1d1d1f]">
              Migracja danych
            </h4>
          </div>
          <p className="text-[15px] text-[#1d1d1f]">
            Przeniesienie danych do nowego systemu ERP jest kluczowym krokiem i może generować znaczące koszty. Proces migracji wymaga nie tylko czasu, ale także specjalistycznych narzędzi i zasobów, aby zapewnić spójność danych.
          </p>
        </div>

        <div className="sf-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <Link2 className="w-6 h-6 text-[#2c3b67]" />
            <h4 className="text-[19px] font-semibold text-[#1d1d1f]">
              Integracja z innymi systemami
            </h4>
          </div>
          <p className="text-[15px] text-[#1d1d1f]">
            ERP często wymaga integracji z innymi aplikacjami, takimi jak CRM czy narzędzia e-commerce. Koszty integracji mogą się różnić w zależności od złożoności systemu i liczby podłączonych aplikacji.
          </p>
        </div>

        <div className="sf-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <GraduationCap className="w-6 h-6 text-[#2c3b67]" />
            <h4 className="text-[19px] font-semibold text-[#1d1d1f]">
              Szkolenia dla użytkowników
            </h4>
          </div>
          <p className="text-[15px] text-[#1d1d1f]">
            Aby wdrożenie ERP było skuteczne, konieczne jest przeszkolenie pracowników. Koszty szkoleń obejmują zarówno edukację zespołu IT, który zarządza systemem, jak i użytkowników końcowych, aby mogli efektywnie korzystać z ERP w codziennych zadaniach.
          </p>
        </div>

        <div className="sf-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <HeadphonesIcon className="w-6 h-6 text-[#2c3b67]" />
            <h4 className="text-[19px] font-semibold text-[#1d1d1f]">
              Wsparcie techniczne i serwis
            </h4>
          </div>
          <p className="text-[15px] text-[#1d1d1f]">
            Po wdrożeniu ERP firma zazwyczaj korzysta ze wsparcia serwisowego dostawcy. Koszty wsparcia mogą obejmować pomoc techniczną, umowy serwisowe oraz bieżące aktualizacje.
          </p>
        </div>
      </div>

      <h3 className="text-[24px] font-semibold text-[#1d1d1f] mt-12 mb-4 flex items-center gap-2">
        <AlertCircle className="w-6 h-6 text-[#2c3b67]" />
        Ukryte koszty wdrożenia ERP
      </h3>

      <p className="text-[17px] leading-relaxed text-[#1d1d1f] mb-6">
        Przy planowaniu budżetu wdrożenia ERP warto uwzględnić także mniej oczywiste koszty, takie jak:
      </p>

      <ul className="list-disc list-inside space-y-2 mb-8">
        <li className="text-[17px] text-[#1d1d1f]">
          <strong>Aktualizacje oprogramowania i sprzętu:</strong> Nowe wymagania mogą oznaczać konieczność modernizacji infrastruktury IT.
        </li>
        <li className="text-[17px] text-[#1d1d1f]">
          <strong>Koszty nadgodzin dla pracowników:</strong> Wdrożenie ERP angażuje zasoby wewnętrzne, co może wymagać dodatkowych godzin pracy.
        </li>
        <li className="text-[17px] text-[#1d1d1f]">
          <strong>Kopie zapasowe i przechowywanie danych:</strong> Systemy lokalne wymagają uwzględnienia kopii zapasowych, natomiast systemy chmurowe często zawierają przestrzeń na dane, ale mogą wymagać dodatkowych opłat za większe pojemności.
        </li>
        <li className="text-[17px] text-[#1d1d1f]">
          <strong>Straty w produktywności:</strong> Pierwsze dni po uruchomieniu ERP mogą być trudne dla zespołu, co wpłynie na wydajność operacyjną.
        </li>
      </ul>

      <figure className="mb-12">
        <img 
          src="https://erp-view.pl/images/artykuly/zdjecia/ukryte-koszty-wdrozenia-erp.png"
          alt="Ukryte koszty wdrożenia systemu ERP - infografika"
          className="w-full h-auto rounded-2xl shadow-sm border border-[#d2d2d7]/30"
        />
        <figcaption className="mt-3 text-center text-[15px] text-[#86868b]">
          Ukryte koszty wdrożenia systemu ERP, które należy uwzględnić w budżecie
        </figcaption>
      </figure>

      <h3 className="text-[24px] font-semibold text-[#1d1d1f] mt-12 mb-4 flex items-center gap-2">
        <GitBranch className="w-6 h-6 text-[#2c3b67]" />
        Modele wdrożenia ERP i ich koszty
      </h3>

      <p className="text-[17px] leading-relaxed text-[#1d1d1f] mb-6">
        Wybór modelu wdrożenia ERP ma duży wpływ na ostateczne koszty. Poniżej przedstawiamy trzy główne modele wdrożenia ERP oraz ich charakterystykę.
      </p>

      <div className="space-y-6 mb-8">
        <div className="sf-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <Server className="w-6 h-6 text-[#2c3b67]" />
            <h4 className="text-[19px] font-semibold text-[#1d1d1f]">
              1. Model on-premise
            </h4>
          </div>
          <p className="text-[15px] text-[#1d1d1f]">
            W modelu on-premise system ERP jest instalowany na serwerach wewnętrznych firmy, co zapewnia pełną kontrolę nad systemem i danymi. Taki model wymaga jednak znacznych nakładów finansowych na infrastrukturę i licencje. Koszty wdrożenia on-premise są wyższe na początku, jednak w dłuższej perspektywie firma może obniżyć koszty związane z opłatami subskrypcyjnymi.
          </p>
        </div>

        <div className="sf-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <Cloud className="w-6 h-6 text-[#2c3b67]" />
            <h4 className="text-[19px] font-semibold text-[#1d1d1f]">
              2. Model chmurowy (SaaS)
            </h4>
          </div>
          <p className="text-[15px] text-[#1d1d1f]">
            ERP w chmurze jest hostowane przez dostawcę i dostępne w modelu subskrypcyjnym, co pozwala firmie uniknąć kosztów infrastruktury. Koszty początkowe są niższe, a opłaty rozłożone w czasie, co czyni chmurę atrakcyjną opcją dla małych i średnich przedsiębiorstw. Subskrypcja obejmuje także bieżące wsparcie i aktualizacje, co eliminuje konieczność inwestowania w dodatkowe zasoby IT.
          </p>
        </div>

        <div className="sf-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <GitMerge className="w-6 h-6 text-[#2c3b67]" />
            <h4 className="text-[19px] font-semibold text-[#1d1d1f]">
              3. Model hybrydowy
            </h4>
          </div>
          <p className="text-[15px] text-[#1d1d1f]">
            Model hybrydowy łączy elementy infrastruktury lokalnej i chmurowej, umożliwiając firmie zachowanie kontroli nad danymi krytycznymi oraz jednocześnie korzystanie z elastyczności chmury. Koszty wdrożenia hybrydowego są bardziej złożone, ponieważ obejmują zarówno infrastrukturę lokalną, jak i opłaty chmurowe. Firma musi również ponieść dodatkowe koszty integracji i zarządzania bezpieczeństwem, aby zapewnić spójne funkcjonowanie obu części systemu.
          </p>
        </div>
      </div>

      <h4 className="text-[19px] font-semibold text-[#1d1d1f] mt-8 mb-4">
        Koszty modelu hybrydowego obejmują:
      </h4>

      <div className="space-y-4 mb-8">
        <div className="sf-card p-4">
          <div className="flex items-center gap-3">
            <Server className="w-5 h-5 text-[#2c3b67] flex-shrink-0" />
            <div>
              <strong className="text-[15px] text-[#1d1d1f]">Infrastruktura IT:</strong>
              <p className="text-[15px] text-[#1d1d1f]">Nakłady na serwery lokalne i połączenie z usługami chmurowymi.</p>
            </div>
          </div>
        </div>

        <div className="sf-card p-4">
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-[#2c3b67] flex-shrink-0" />
            <div>
              <strong className="text-[15px] text-[#1d1d1f]">Licencje i subskrypcje:</strong>
              <p className="text-[15px] text-[#1d1d1f]">Opłaty jednorazowe za moduły on-premise i subskrypcje za usługi w chmurze.</p>
            </div>
          </div>
        </div>

        <div className="sf-card p-4">
          <div className="flex items-center gap-3">
            <Link2 className="w-5 h-5 text-[#2c3b67] flex-shrink-0" />
            <div>
              <strong className="text-[15px] text-[#1d1d1f]">Integracja i zarządzanie:</strong>
              <p className="text-[15px] text-[#1d1d1f]">Narzędzia umożliwiające spójne działanie systemu ERP między infrastrukturą lokalną a chmurą.</p>
            </div>
          </div>
        </div>

        <div className="sf-card p-4">
          <div className="flex items-center gap-3">
            <FileStack className="w-5 h-5 text-[#2c3b67] flex-shrink-0" />
            <div>
              <strong className="text-[15px] text-[#1d1d1f]">Bezpieczeństwo i zgodność:</strong>
              <p className="text-[15px] text-[#1d1d1f]">Dodatkowe mechanizmy ochrony danych w obu środowiskach.</p>
            </div>
          </div>
        </div>

        <div className="sf-card p-4">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-5 h-5 text-[#2c3b67] flex-shrink-0" />
            <div>
              <strong className="text-[15px] text-[#1d1d1f]">Szkolenia i wsparcie techniczne:</strong>
              <p className="text-[15px] text-[#1d1d1f]">Szkolenia dla działu IT i użytkowników, aby efektywnie zarządzać systemem hybrydowym.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="sf-card p-6 bg-[#F5F5F7] mb-8">
        <h3 className="text-[24px] font-semibold text-[#1d1d1f] mb-4 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-[#2c3b67]" />
          Jak oszacować budżet na wdrożenie ERP?
        </h3>
        <p className="text-[17px] leading-relaxed text-[#1d1d1f] mb-6">
          Według Gartnera średni budżet technologiczny wynosi około 5,49% rocznych przychodów firmy, co oznacza wzrost w porównaniu z 4,25% w 2020 roku. W przypadku ERP często przyjmuje się, że koszt wdrożenia wynosi od 1% do 3% rocznych przychodów przedsiębiorstwa.
        </p>
        <Link 
          to="/" 
          onClick={scrollToTop}
          className="sf-button-primary inline-flex items-center text-[17px]"
        >
          Skorzystaj z kalkulatora ERP
          <ArrowRight className="w-5 h-5 ml-2" />
        </Link>
      </div>

      <div className="sf-card p-6 bg-[#F5F5F7]">
        <h3 className="text-[24px] font-semibold text-[#1d1d1f] mb-4">
          Podsumowanie
        </h3>
        <p className="text-[17px] leading-relaxed text-[#1d1d1f] mb-6">
          Koszt wdrożenia ERP zależy od wielu czynników, takich jak model licencjonowania, liczba użytkowników, integracje i specyficzne potrzeby firmy. Model subskrypcyjny w chmurze jest często korzystny dla firm z ograniczonym budżetem, podczas gdy model on-premise i hybrydowy mogą być bardziej odpowiednie dla firm wymagających pełnej kontroli nad systemem i danymi.
        </p>
        <p className="text-[17px] leading-relaxed text-[#1d1d1f]">
          Analiza przedwdrożeniowa, uwzględnienie ukrytych kosztów oraz konsultacje z doświadczonym partnerem wdrożeniowym pozwolą precyzyjnie zaplanować i kontrolować budżet ERP, minimalizując ryzyko niespodziewanych wydatków.
        </p>
      </div>
    </article>
  );
};

export default CostArticle;