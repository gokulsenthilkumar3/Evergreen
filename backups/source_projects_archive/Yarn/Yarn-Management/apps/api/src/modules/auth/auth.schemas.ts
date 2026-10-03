import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  location: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional(),
});
