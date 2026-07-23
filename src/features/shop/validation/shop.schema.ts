import { z } from 'zod';

// Regex Patterns
const GST_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;
const PAN_REGEX = /^[A-Z]{5}\d{4}[A-Z]{1}$/;
const UPI_REGEX = /^[\w.-]+@[\w.-]+$/;
const PIN_CODE_REGEX = /^\d{6}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/; // Standard Indian mobile phone check (10 digits starting with 6-9)

export const shopRegistrationSchema = z.object({
  // Owner Info
  owner_name: z.string().min(1, 'Owner name is required'),
  owner_phone: z.string().regex(PHONE_REGEX, 'Please enter a valid 10-digit mobile number'),
  owner_photo_url: z.string().optional(),
  owner_photo_path: z.string().optional(),

  // Shop Info
  shop_name: z.string().min(1, 'Shop name is required'),
  business_category: z.string().min(1, 'Please select a business category'),
  shop_logo_url: z.string().optional(),
  shop_logo_path: z.string().optional(),

  // Address
  door_number: z.string().optional(),
  street: z.string().optional(),
  area: z.string().optional(),
  village_town: z.string().min(1, 'Village/Town is required'),
  mandal: z.string().optional(),
  district: z.string().min(1, 'District is required'),
  state: z.string().min(1, 'State is required'),
  pin_code: z.string().regex(PIN_CODE_REGEX, 'PIN Code must be exactly 6 digits'),
  country: z.string().default('India'),

  // Business Details (Optional, with pattern checks if provided)
  gst: z.string()
    .transform(val => val.trim().toUpperCase())
    .refine(val => val === '' || GST_REGEX.test(val), {
      message: 'Please enter a valid GST Number (e.g. 22AAAAA1111A1Z1)',
    })
    .optional()
    .or(z.literal('')),
  pan: z.string()
    .transform(val => val.trim().toUpperCase())
    .refine(val => val === '' || PAN_REGEX.test(val), {
      message: 'Please enter a valid PAN (e.g. ABCDE1234F)',
    })
    .optional()
    .or(z.literal('')),
  upi_id: z.string()
    .transform(val => val.trim().toLowerCase())
    .refine(val => val === '' || UPI_REGEX.test(val), {
      message: 'Please enter a valid UPI ID (e.g. name@bank)',
    })
    .optional()
    .or(z.literal('')),
  business_email: z.string()
    .transform(val => val.trim())
    .refine(val => val === '' || z.string().email().safeParse(val).success, {
      message: 'Please enter a valid email address',
    })
    .optional()
    .or(z.literal('')),

  // Preferences
  language: z.string().default('en'),
  currency: z.string().default('INR'),
  theme: z.string().default('system'),

  // Notifications
  payment_reminder: z.boolean().default(true),
  whatsapp_reminder: z.boolean().default(true),
  sms_reminder: z.boolean().default(false),
  ai_daily_summary: z.boolean().default(true),
});

export type ShopRegistrationInput = z.infer<typeof shopRegistrationSchema>;
