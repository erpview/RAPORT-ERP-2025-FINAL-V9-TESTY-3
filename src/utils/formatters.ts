export const formatPhone = (phone: string): string => {
  if (!phone) return 'Nie podano';
  const cleaned = phone.replace(/\D/g, '');
  return `+48 ${cleaned.slice(0,3)} ${cleaned.slice(3,6)} ${cleaned.slice(6)}`;
};