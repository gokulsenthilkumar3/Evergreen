// @polsia:user-owned — zod contract for the waitlist resource. Client-importable: no server-only imports.
import { z } from 'zod';

export const WAITLIST_ROLES = ['mill', 'trader', 'factory', 'brand'] as const;
export type WaitlistRole = (typeof WAITLIST_ROLES)[number];

export const WaitlistSignupCreate = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  role: z.enum(WAITLIST_ROLES, { message: 'Please select your role' }),
  whatsapp: z
    .string()
    .min(10, 'WhatsApp number must be at least 10 digits')
    .max(15)
    .regex(/^\+?[0-9\s\-()]+$/, 'Enter a valid WhatsApp number'),
  email: z.string().email('Enter a valid email address'),
  locale: z.enum(['en', 'ta']).default('en'),
});

export const WaitlistSignupItem = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  whatsapp: z.string(),
  email: z.string(),
  locale: z.string(),
  createdAt: z.string(),
});

export const WaitlistSignupList = z.object({
  items: z.array(WaitlistSignupItem),
});

export type WaitlistSignupCreate = z.infer<typeof WaitlistSignupCreate>;
export type WaitlistSignupItem = z.infer<typeof WaitlistSignupItem>;
export type WaitlistSignupList = z.infer<typeof WaitlistSignupList>;
