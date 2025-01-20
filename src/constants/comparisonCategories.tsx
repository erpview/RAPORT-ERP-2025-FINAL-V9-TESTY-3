import { 
  Building2, 
  Cloud, 
  Boxes, 
  Globe, 
  Shield, 
  ChartBar, 
  Clock, 
  Briefcase, 
  Languages, 
  HeadphonesIcon, 
  GraduationCap, 
  Settings, 
  RefreshCcw, 
  UserCheck, 
  Lock, 
  FileCheck, 
  HardDrive, 
  BarChart3,
  Laptop2,
  Server,
  GitMerge
} from 'lucide-react';
import { System } from '../types/system';

interface ComparisonItem {
  id: string;
  label: string;
  description: string;
  getValue: (system: System) => string;
}

interface ComparisonCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  items: ComparisonItem[];
}

const CUSTOMIZATION_LEVEL_LABELS: Record<string, string> = {
  'Low': 'Niski',
  'Medium': 'Średni',
  'High': 'Wysoki'
};

const UPDATE_FREQUENCY_LABELS: Record<string, string> = {
  'Monthly': 'Co miesiąc',
  'Quarterly': 'Co kwartał',
  'Semi-annually': 'Co pół roku',
  'Annually': 'Co rok',
  'No-data': 'Brak danych',
  'When-client-ask': 'Zgodnie z potrzebami klienta',
  'Regular': 'Regularnie',
  'Regular-and-when-client-ask': 'Regularnie i zgodnie z potrzebami klienta'
};

const PRICING_MODEL_LABELS: Record<string, string> = {
  'subscription': 'Subskrypcja',
  'perpetual': 'Licencja wieczysta',
  'user-based': 'Opłata za użytkownika'
};

export const categories: ComparisonCategory[] = [
  {
    id: 'general',
    title: 'Informacje ogólne',
    icon: Building2,
    items: [
      {
        id: 'vendor',
        label: 'Dostawca',
        description: 'Nazwa dostawcy systemu',
        getValue: (system) => system.vendor
      },
      {
        id: 'size',
        label: 'Wielkość firmy',
        description: 'Dla jakiej wielkości firm jest przeznaczony system',
        getValue: (system) => system.size.join(', ')
      },
      {
        id: 'pricing_model',
        label: 'Model cenowy',
        description: 'Dostępne modele licencjonowania',
        getValue: (system) => system.pricing_model?.map(model => PRICING_MODEL_LABELS[model] || model).join(', ') || 'Brak danych'
      },
      {
        id: 'implementation_time',
        label: 'Czas wdrożenia',
        description: 'Szacowany czas wdrożenia systemu',
        getValue: (system) => system.implementation_time || 'Brak danych'
      }
    ]
  },
  {
    id: 'deployment',
    title: 'Model wdrożenia',
    icon: Cloud,
    items: [
      {
        id: 'cloud',
        label: 'Chmura obliczeniowa (Cloud)',
        description: 'System dostępny przez internet, aktualizowany automatycznie',
        getValue: (system) => system.deployment_type?.includes('cloud') ? 'Tak' : 'Nie'
      },
      {
        id: 'onpremise',
        label: 'Instalacja lokalna (On-premise)',
        description: 'System zainstalowany na serwerach firmy',
        getValue: (system) => system.deployment_type?.includes('onpremise') ? 'Tak' : 'Nie'
      },
      {
        id: 'hybrid',
        label: 'Model hybrydowy',
        description: 'Połączenie rozwiązania chmurowego z lokalną instalacją',
        getValue: (system) => system.deployment_type?.includes('hybrid') ? 'Tak' : 'Nie'
      }
    ]
  },
  {
    id: 'technical',
    title: 'Aspekty techniczne',
    icon: Laptop2,
    items: [
      {
        id: 'customization_level',
        label: 'Poziom kastomizacji',
        description: 'Możliwość dostosowania systemu ERP do specyficznych potrzeb firmy',
        getValue: (system) => system.customization_level ? CUSTOMIZATION_LEVEL_LABELS[system.customization_level] : 'Brak danych'
      },
      {
        id: 'update_frequency',
        label: 'Częstotliwość aktualizacji',
        description: 'Jak często system jest aktualizowany w obszarze nowych funkcji',
        getValue: (system) => system.update_frequency ? UPDATE_FREQUENCY_LABELS[system.update_frequency] : 'Brak danych'
      },
      {
        id: 'supported_databases',
        label: 'Obsługiwane bazy danych',
        description: 'Wspierane systemy bazodanowe',
        getValue: (system) => system.supported_databases?.join(', ') || 'Brak danych'
      },
      {
        id: 'multilingual',
        label: 'Wielojęzyczność',
        description: 'Wsparcie dla wielu języków',
        getValue: (system) => system.multilingual ? 'Tak' : 'Nie'
      },
      {
        id: 'languages',
        label: 'Dostępne języki',
        description: 'Wersje językowe systemu',
        getValue: (system) => system.languages?.join(', ') || 'Brak danych'
      }
    ]
  },
  {
    id: 'basic_modules',
    title: 'Moduły podstawowe',
    icon: Boxes,
    items: [
      {
        id: 'finance',
        label: 'Finanse i księgowość',
        description: 'Zarządzanie finansami i księgowość',
        getValue: (system) => system.finance ? 'Tak' : 'Nie'
      },
      {
        id: 'hr',
        label: 'Zarządzanie zasobami ludzkimi (HR)',
        description: 'Obsługa kadr, płac, rekrutacji i szkoleń',
        getValue: (system) => system.hr ? 'Tak' : 'Nie'
      },
      {
        id: 'scm',
        label: 'Zarządzanie łańcuchem dostaw (SCM)',
        description: 'Planowanie dostaw, zarządzanie zapasami i logistyką',
        getValue: (system) => system.scm ? 'Tak' : 'Nie'
      },
      {
        id: 'production',
        label: 'Zarządzanie produkcją',
        description: 'Harmonogramowanie produkcji i kontrola jakości',
        getValue: (system) => system.production ? 'Tak' : 'Nie'
      },
      {
        id: 'crm',
        label: 'CRM',
        description: 'Zarządzanie relacjami z klientami',
        getValue: (system) => system.crm ? 'Tak' : 'Nie'
      },
      {
        id: 'warehouse',
        label: 'Zarządzanie magazynem',
        description: 'Kontrola stanów magazynowych i procesów magazynowych',
        getValue: (system) => system.warehouse ? 'Tak' : 'Nie'
      },
      {
        id: 'purchasing',
        label: 'Zakupy i zaopatrzenie',
        description: 'Zarządzanie dostawcami i zamówieniami zakupu',
        getValue: (system) => system.purchasing ? 'Tak' : 'Nie'
      }
    ]
  },
  {
    id: 'special_modules',
    title: 'Moduły specjalne',
    icon: Settings,
    items: [
      {
        id: 'project',
        label: 'Zarządzanie projektami',
        description: 'Planowanie i monitorowanie projektów',
        getValue: (system) => system.project ? 'Tak' : 'Nie'
      },
      {
        id: 'bi',
        label: 'Business Intelligence',
        description: 'Analizy biznesowe i raportowanie',
        getValue: (system) => system.bi ? 'Tak' : 'Nie'
      },
      {
        id: 'grc',
        label: 'Zarządzanie ryzykiem i zgodnością (GRC)',
        description: 'Monitorowanie zgodności i zarządzanie ryzykiem',
        getValue: (system) => system.grc ? 'Tak' : 'Nie'
      },
      {
        id: 'dam',
        label: 'Zarządzanie zasobami cyfrowymi (DAM)',
        description: 'Zarządzanie plikami cyfrowymi i mediami',
        getValue: (system) => system.dam ? 'Tak' : 'Nie'
      },
      {
        id: 'cmms',
        label: 'Zarządzanie utrzymaniem ruchu (CMMS)',
        description: 'Obsługa techniczna i konserwacja',
        getValue: (system) => system.cmms ? 'Tak' : 'Nie'
      },
      {
        id: 'plm',
        label: 'Zarządzanie cyklem życia produktu (PLM)',
        description: 'Rozwój produktów i zarządzanie innowacjami',
        getValue: (system) => system.plm ? 'Tak' : 'Nie'
      },
      {
        id: 'rental',
        label: 'Zarządzanie wynajmem',
        description: 'Obsługa wynajmu i leasingu',
        getValue: (system) => system.rental ? 'Tak' : 'Nie'
      },
      {
        id: 'ecommerce',
        label: 'E-commerce',
        description: 'Integracja z platformami sprzedażowymi',
        getValue: (system) => system.ecommerce ? 'Tak' : 'Nie'
      }
    ]
  },
  {
    id: 'connectivity',
    title: 'Łączność i integracje',
    icon: Globe,
    items: [
      {
        id: 'edi',
        label: 'EDI',
        description: 'Elektroniczna wymiana dokumentów',
        getValue: (system) => system.edi ? 'Tak' : 'Nie'
      },
      {
        id: 'iot',
        label: 'Internet rzeczy (IoT)',
        description: 'Integracja z urządzeniami IoT',
        getValue: (system) => system.iot ? 'Tak' : 'Nie'
      },
      {
        id: 'api',
        label: 'API',
        description: 'Interfejsy programistyczne',
        getValue: (system) => system.api ? 'Tak' : 'Nie'
      },
      {
        id: 'dms',
        label: 'Zarządzanie dokumentami (DMS)',
        description: 'System zarządzania dokumentami',
        getValue: (system) => system.dms ? 'Tak' : 'Nie'
      },
      {
        id: 'mobile',
        label: 'Aplikacje mobilne',
        description: 'Dostęp mobilny do systemu',
        getValue: (system) => system.mobile ? 'Tak' : 'Nie'
      },
      {
        id: 'portals',
        label: 'Portale klienta/partnera',
        description: 'Platformy samoobsługowe',
        getValue: (system) => system.portals ? 'Tak' : 'Nie'
      }
    ]
  },
  {
    id: 'support',
    title: 'Wsparcie i szkolenia',
    icon: HeadphonesIcon,
    items: [
      {
        id: 'support_options',
        label: 'Opcje wsparcia',
        description: 'Dostępne formy wsparcia technicznego',
        getValue: (system) => system.support_options?.join(', ') || 'Brak danych'
      },
      {
        id: 'training_options',
        label: 'Opcje szkoleń',
        description: 'Dostępne formy szkoleń',
        getValue: (system) => system.training_options?.join(', ') || 'Brak danych'
      }
    ]
  },
  {
    id: 'security',
    title: 'Bezpieczeństwo i zgodność',
    icon: Shield,
    items: [
      {
        id: 'security_features',
        label: 'Funkcje bezpieczeństwa',
        description: 'Dostępne mechanizmy bezpieczeństwa',
        getValue: (system) => system.security_features?.join(', ') || 'Brak danych'
      },
      {
        id: 'compliance_standards',
        label: 'Standardy zgodności',
        description: 'Zgodność z normami i standardami',
        getValue: (system) => system.compliance_standards?.join(', ') || 'Brak danych'
      },
      {
        id: 'backup_options',
        label: 'Opcje backupu',
        description: 'Dostępne opcje kopii zapasowych',
        getValue: (system) => system.backup_options?.join(', ') || 'Brak danych'
      }
    ]
  }
];

export { UPDATE_FREQUENCY_LABELS, CUSTOMIZATION_LEVEL_LABELS, PRICING_MODEL_LABELS };