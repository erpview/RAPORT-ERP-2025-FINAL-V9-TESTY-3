import { BLOCKED_DOMAINS } from '../constants/domains';

export const validateBusinessEmail = (email: string): boolean => {
  if (!email) return false;

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;

  // Check if domain is not in blocked list
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain || BLOCKED_DOMAINS.includes(domain)) return false;

  return true;
};

export const validateNIP = (nip: string): boolean => {
  // Remove any non-digit characters
  const cleanNIP = nip.replace(/[^0-9]/g, '');
  
  // Check if NIP has exactly 10 digits
  if (cleanNIP.length !== 10) return false;

  // Weights for NIP validation
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  
  // Calculate checksum
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += parseInt(cleanNIP[i]) * weights[i];
  }
  
  // Get check digit
  const checkDigit = sum % 11;
  
  // If checkDigit is 10, the NIP is invalid
  if (checkDigit === 10) return false;
  
  // Compare check digit with the last digit of NIP
  return checkDigit === parseInt(cleanNIP[9]);
};

export const validatePolishPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const nationalNumber = cleanPhone.replace(/^(48)?/, '');
  return nationalNumber.length === 9 && /^[4-9]/.test(nationalNumber);
};