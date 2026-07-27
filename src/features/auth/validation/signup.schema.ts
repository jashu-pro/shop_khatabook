import type { SignupInput } from '../types';

export const validateSignup = (input: SignupInput): { isValid: boolean; errors: Partial<Record<keyof SignupInput, string>> } => {
  const errors: Partial<Record<keyof SignupInput, string>> = {};

  if (!input.fullName || input.fullName.trim().length < 2) {
    errors.fullName = 'Full Name must be at least 2 characters';
  }

  if (!input.email || !input.email.includes('@')) {
    errors.email = 'Please enter a valid email address';
  }

  if (input.password && input.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (input.confirmPassword && input.password !== input.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
