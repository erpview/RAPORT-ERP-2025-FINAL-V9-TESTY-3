import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FileText, Send } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import emailjs from '@emailjs/browser';
import { emailConfig } from '../config/email';
import { formatEmailTemplate } from '../utils/emailFormatter';
import { validateBusinessEmail } from '../utils/validators';
import FAQ from '../components/FAQ';
import { ModulesSection } from '../components/FormSections/ModulesSection';
import { BusinessQuestionsSection } from '../components/FormSections/BusinessQuestionsSection';
import { SystemVersionSection } from '../components/FormSections/SystemVersionSection';
import { ContactSection } from '../components/FormSections/ContactSection';
import { TimelineSection } from '../components/FormSections/TimelineSection';
import { CompanySection } from '../components/FormSections/CompanySection';
import { ConsentCheckboxes } from '../components/ConsentCheckboxes';
import { PrivacyPolicyModal } from '../components/PrivacyPolicyModal';
import { SuccessModal } from '../components/SuccessModal';
import { SEOHead } from '../components/seo/SEOHead';

interface FormData {
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

const initialFormData: FormData = {
  companyName: '',
  employees: '',
  industry: '',
  modules: [],
  moduleUsers: {},
  systemVersion: '',
  currentSystem: '',
  timeline: '',
  budget: '',
  requirements: '',
  contactPerson: '',
  email: '',
  phone: '',
  nip: '',
  position: '',
  decisionDate: '',
  implementationDate: '',
  businessAnswers: {},
  privacyAccepted: false,
  marketingAccepted: false
};

const Calculator: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateBusinessEmail(formData.email)) {
      toast.error('Proszę użyć służbowego adresu email');
      return;
    }

    const missingUserCounts = formData.modules.some(
      moduleId => !formData.moduleUsers[moduleId]
    );
    
    if (missingUserCounts) {
      toast.error('Proszę podać liczbę użytkowników dla wszystkich wybranych modułów');
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedData = {
        ...formData,
        businessAnswers: Object.fromEntries(
          Object.entries(formData.businessAnswers).map(([key, value]) => [key, value === null ? false : value])
        )
      };

      const templateParams = formatEmailTemplate(formattedData);

      await emailjs.send(
        emailConfig.serviceId,
        emailConfig.templateId,
        templateParams,
        emailConfig.publicKey
      );

      setIsSuccessModalOpen(true);
      setFormData(initialFormData);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Wystąpił błąd podczas wysyłania formularza. Spróbuj ponownie.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead pageIdentifier="/kalkulator" />
      <div className="min-h-screen bg-[#F5F5F7] py-12">
        <Toaster position="top-center" />
        <div className="max-w-4xl mx-auto pt-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-8">
              <FileText className="w-8 h-8 text-[#0066CC]" />
              <h1 className="text-[32px] font-semibold text-[#1d1d1f]">
                Kalkulator wdrożenia systemu ERP
              </h1>
            </div>
            <p className="text-[21px] leading-relaxed text-[#86868b] mb-4">
              Otrzymaj spersonalizowaną wycenę systemu ERP dla Twojej firmy
            </p>
            <div className="flex items-center justify-center gap-3 text-[17px] text-[#1d1d1f] bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-[#d2d2d7]/30">
              <FileText className="w-6 h-6 flex-shrink-0 text-[#2c3b67]" />
              <p className="text-left">
                Po wypełnieniu formularza Twoje dane zostaną przekazane partnerom raportu ERP, którzy przygotują dla Ciebie spersonalizowane oferty.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            <CompanySection
              companyName={formData.companyName}
              employees={formData.employees}
              industry={formData.industry}
              currentSystem={formData.currentSystem}
              onChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
            />

            <SystemVersionSection
              selectedVersion={formData.systemVersion}
              onVersionChange={(version) => setFormData(prev => ({ ...prev, systemVersion: version }))}
            />

            <ModulesSection
              selectedModules={formData.modules}
              onModuleToggle={(moduleId) => setFormData(prev => ({
                ...prev,
                modules: prev.modules.includes(moduleId)
                  ? prev.modules.filter(id => id !== moduleId)
                  : [...prev.modules, moduleId]
              }))}
              userCounts={formData.moduleUsers}
              onUserCountChange={(moduleId, count) => setFormData(prev => ({
                ...prev,
                moduleUsers: { ...prev.moduleUsers, [moduleId]: count }
              }))}
            />

            <BusinessQuestionsSection
              answers={formData.businessAnswers}
              onAnswerChange={(questionId, value) => setFormData(prev => ({
                ...prev,
                businessAnswers: { ...prev.businessAnswers, [questionId]: value }
              }))}
            />

            <TimelineSection
              decisionDate={formData.decisionDate}
              implementationDate={formData.implementationDate}
              onDateChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
            />

            <ContactSection
              contactPerson={formData.contactPerson}
              email={formData.email}
              phone={formData.phone}
              nip={formData.nip}
              position={formData.position}
              requirements={formData.requirements}
              onChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
            />

            <ConsentCheckboxes
              privacyAccepted={formData.privacyAccepted}
              marketingAccepted={formData.marketingAccepted}
              onChange={(name, value) => setFormData(prev => ({ ...prev, [name]: value }))}
            />

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="sf-button-primary flex items-center gap-2"
                style={{ backgroundColor: '#2c3b67' }}
              >
                <Send className="w-5 h-5" />
                {isSubmitting ? 'Wysyłanie...' : 'Wyślij formularz'}
              </button>
            </div>
          </form>

          <FAQ />
        </div>
      </div>

      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </>
  );
};

export default Calculator;