export interface FormData {
  companyName: string;
  employees: string;
  industry: string;
  modules: string[];
  moduleUsers: Record<string, number>;
  systemVersion: string;
  currentSystem: string;
  timeline: string;
  budget: string;
  requirements: string;
  contactPerson: string;
  email: string;
  phone: string;
  nip: string;
  position: string;
  decisionDate: string;
  implementationDate: string;
  businessAnswers: Record<string, boolean | null>;
  privacyAccepted: boolean;
  marketingAccepted: boolean;
}