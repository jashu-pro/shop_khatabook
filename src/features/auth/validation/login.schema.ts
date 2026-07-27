import type { LoginInput } from '../types';

export const validateLogin = (input: LoginInput): { isValid: boolean; errors: Partial<Record<keyof LoginInput, string>> } => {
  const errors: Partial<Record<keyof LoginInput, string>> = {};

  if (!input.email || !input.email.includes('@')) {
    errors.email = 'Please enter a valid email address';
  }

  if (input.password && input.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
