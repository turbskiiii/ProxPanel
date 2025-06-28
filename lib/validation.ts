import { z } from 'zod';

export const vpsConfigSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(50)
    .regex(
      /^[a-zA-Z0-9-_]+$/,
      'Name can only contain letters, numbers, hyphens, and underscores'
    ),
  template: z.string().min(1),
  cpu: z.number().min(1).max(16),
  memory: z.number().min(512).max(32768), // MB
  disk: z.number().min(10).max(1000), // GB
  node: z.string().optional(),
  ostype: z.string().optional(),
});

export function validateVPSConfig(data: any) {
  return vpsConfigSchema.safeParse(data);
}

export const userRegistrationSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),
});

export function validateUserRegistration(data: any) {
  return userRegistrationSchema.safeParse(data);
}

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export function validateLogin(data: any) {
  return loginSchema.safeParse(data);
}
