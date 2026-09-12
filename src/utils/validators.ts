/**
 * Validation utilities for iKhaya Student Living
 * Enforces strict verification for Email, South African National ID, Passport, Phone, and Credentials.
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates email format according to standard RFC 5322 regex.
 */
export function validateEmail(email: string): ValidationResult {
  const clean = (email || '').trim();
  if (!clean) {
    return { isValid: false, error: 'Email address is required.' };
  }
  // Standard email format verification
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(clean)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. name@student.ac.za or name@gmail.com).' };
  }
  return { isValid: true };
}

/**
 * Validates full legal name (at least 2 words, letters only).
 */
export function validateFullName(name: string): ValidationResult {
  const clean = (name || '').trim();
  if (!clean) {
    return { isValid: false, error: 'Full legal name is required.' };
  }
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length < 2) {
    return { isValid: false, error: 'Please enter your full legal first and last name (at least 2 words).' };
  }
  if (clean.length < 3 || clean.length > 80) {
    return { isValid: false, error: 'Name must be between 3 and 80 characters long.' };
  }
  if (!/^[A-Za-zÀ-ÿ' -]+$/.test(clean)) {
    return { isValid: false, error: 'Name can only contain alphabetic letters, spaces, hyphens, and apostrophes.' };
  }
  return { isValid: true };
}

/**
 * Validates South African 13-Digit National ID Number
 * Checks length, digits, birth date (YYMMDD), and Luhn algorithm.
 */
export function validateSouthAfricanID(idNumber: string): ValidationResult {
  const clean = (idNumber || '').replace(/[\s-]/g, '');
  if (!clean) {
    return { isValid: false, error: 'South African ID number is required.' };
  }
  if (!/^\d{13}$/.test(clean)) {
    return { isValid: false, error: 'South African ID must be exactly 13 numeric digits.' };
  }

  // Extract date components
  const month = parseInt(clean.substring(2, 4), 10);
  const day = parseInt(clean.substring(4, 6), 10);

  if (month < 1 || month > 12) {
    return { isValid: false, error: 'Invalid South African ID: month digits (3rd and 4th) must be between 01 and 12.' };
  }
  if (day < 1 || day > 31) {
    return { isValid: false, error: 'Invalid South African ID: day digits (5th and 6th) must be between 01 and 31.' };
  }

  // Luhn checksum validation
  let sumOdd = 0;
  for (let i = 0; i < 12; i += 2) {
    sumOdd += parseInt(clean[i], 10);
  }

  let evenString = '';
  for (let i = 1; i < 12; i += 2) {
    evenString += clean[i];
  }

  const evenNum = parseInt(evenString, 10) * 2;
  const evenNumStr = evenNum.toString();
  let sumEven = 0;
  for (let i = 0; i < evenNumStr.length; i++) {
    sumEven += parseInt(evenNumStr[i], 10);
  }

  const total = sumOdd + sumEven;
  const checkDigit = (10 - (total % 10)) % 10;
  const expectedCheckDigit = parseInt(clean[12], 10);

  if (checkDigit !== expectedCheckDigit) {
    return { isValid: false, error: 'Invalid South African ID number: checksum digit failed verification.' };
  }

  return { isValid: true };
}

/**
 * Validates International Passport Number
 * Typically 6 to 12 alphanumeric characters.
 */
export function validatePassportNumber(passport: string): ValidationResult {
  const clean = (passport || '').trim().toUpperCase().replace(/\s+/g, '');
  if (!clean) {
    return { isValid: false, error: 'Passport number is required.' };
  }
  if (clean.length < 6 || clean.length > 15) {
    return { isValid: false, error: 'Passport number must be between 6 and 15 alphanumeric characters.' };
  }
  if (!/^[A-Z0-9]+$/.test(clean)) {
    return { isValid: false, error: 'Passport number can only contain letters and numbers (no special symbols).' };
  }
  // Must contain at least some digits or letters, not just all zeroes
  if (/^0+$/.test(clean)) {
    return { isValid: false, error: 'Please enter a valid non-zero passport number.' };
  }
  return { isValid: true };
}

/**
 * Validates either a South African ID or Passport based on selected type
 */
export function validateIdentityDocument(idType: 'sa_id' | 'passport', value: string): ValidationResult {
  if (idType === 'sa_id') {
    return validateSouthAfricanID(value);
  } else {
    return validatePassportNumber(value);
  }
}

/**
 * Validates phone number (South African or international)
 */
export function validatePhoneNumber(phone: string): ValidationResult {
  const clean = (phone || '').trim().replace(/[\s()-]/g, '');
  if (!clean) {
    return { isValid: false, error: 'Phone number is required.' };
  }

  // South African local format: 0XXXXXXXXX (10 digits)
  const isSALocal = /^0[1-8]\d{8}$/.test(clean);
  // South African international format: +27XXXXXXXXX or 27XXXXXXXXX (11-12 digits)
  const isSAIntl = /^(\+27|27)[1-8]\d{8}$/.test(clean);
  // General international format: + followed by 8 to 15 digits
  const isIntl = /^\+?[1-9]\d{8,14}$/.test(clean);

  if (!isSALocal && !isSAIntl && !isIntl) {
    return { isValid: false, error: 'Please enter a valid contact phone number (e.g. 072 123 4567 or +27 72 123 4567).' };
  }

  return { isValid: true };
}

/**
 * Validates student number (alphanumeric, at least 4 chars)
 */
export function validateStudentNumber(studentNumber: string): ValidationResult {
  const clean = (studentNumber || '').trim().replace(/\s+/g, '');
  if (!clean) {
    return { isValid: false, error: 'Student number is required.' };
  }
  if (clean.length < 4 || clean.length > 20) {
    return { isValid: false, error: 'Student number must be between 4 and 20 characters.' };
  }
  if (!/^[A-Za-z0-9-]+$/.test(clean)) {
    return { isValid: false, error: 'Student number must contain letters, numbers, or hyphens only.' };
  }
  return { isValid: true };
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required.' };
  }
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long.' };
  }
  return { isValid: true };
}

/**
 * Deterministic hash for credential verification when email/password provider
 * is operating in local/Firestore persistence mode.
 */
export function hashPassword(password: string): string {
  let hash = 5381;
  for (let i = 0; i < password.length; i++) {
    hash = ((hash << 5) + hash) + password.charCodeAt(i);
    hash = hash & hash;
  }
  return `hash_${Math.abs(hash).toString(16)}`;
}

