import { z } from 'zod';

const PHONE_REGEX = /^[6-9]\d{9}$/; // Standard 10-digit Indian mobile number

export const customerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  phone: z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val === '' || PHONE_REGEX.test(val), {
      message: 'Please enter a valid 10-digit mobile number',
    })
    .optional()
    .or(z.literal('')),
  village: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  credit_limit: z.coerce.number().nonnegative('Credit limit must be a positive number').default(0),
});

export type CustomerFormInput = z.infer<typeof customerSchema>;
