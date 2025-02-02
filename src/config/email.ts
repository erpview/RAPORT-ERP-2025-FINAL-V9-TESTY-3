// Log environment variables availability in production
if (import.meta.env.PROD) {
  console.log('EmailJS Config Status:', {
    hasServiceId: !!import.meta.env.VITE_EMAIL_SERVICE_ID,
    hasTemplateId: !!import.meta.env.VITE_EMAIL_TEMPLATE_ID,
    hasRegistrationTemplateId: !!import.meta.env.VITE_EMAIL_REGISTRATION_TEMPLATE_ID,
    hasApprovalTemplateId: !!import.meta.env.VITE_EMAIL_APPROVAL_TEMPLATE_ID,
    hasApprovalDetailsTemplateId: !!import.meta.env.VITE_EMAIL_APPROVAL_DETAILS_TEMPLATE_ID,
    hasCompanyUpdateTemplateId: !!import.meta.env.VITE_EMAIL_COMPANY_UPDATE_TEMPLATE_ID,
    hasPublicKey: !!import.meta.env.VITE_EMAIL_PUBLIC_KEY
  });
}

export const emailConfig = {
  serviceId: import.meta.env.VITE_EMAIL_SERVICE_ID,
  templateId: import.meta.env.VITE_EMAIL_TEMPLATE_ID,
  registrationTemplateId: import.meta.env.VITE_EMAIL_REGISTRATION_TEMPLATE_ID,
  approvalTemplateId: import.meta.env.VITE_EMAIL_APPROVAL_TEMPLATE_ID,
  approvalDetailsTemplateId: import.meta.env.VITE_EMAIL_APPROVAL_DETAILS_TEMPLATE_ID,
  companyUpdateTemplateId: import.meta.env.VITE_EMAIL_COMPANY_UPDATE_TEMPLATE_ID,
  publicKey: import.meta.env.VITE_EMAIL_PUBLIC_KEY
};