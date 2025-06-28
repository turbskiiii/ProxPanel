import { z } from 'zod';

const envSchema = z.object({
  // Database
  DB_HOST: z.string().min(1, 'DB_HOST is required'),
  DB_PORT: z
    .string()
    .regex(/^\d+$/, 'DB_PORT must be a number')
    .default('3306'),
  DB_USER: z.string().min(1, 'DB_USER is required'),
  DB_PASSWORD: z.string().min(1, 'DB_PASSWORD is required'),
  DB_NAME: z.string().min(1, 'DB_NAME is required'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),

  // Proxmox
  PROXMOX_HOST: z.string().min(1, 'PROXMOX_HOST is required'),
  PROXMOX_PORT: z
    .string()
    .regex(/^\d+$/, 'PROXMOX_PORT must be a number')
    .default('8006'),
  PROXMOX_USERNAME: z.string().min(1, 'PROXMOX_USERNAME is required'),
  PROXMOX_PASSWORD: z.string().min(1, 'PROXMOX_PASSWORD is required'),
  PROXMOX_REALM: z.string().default('pam'),

  // Application
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  APP_URL: z
    .string()
    .url('APP_URL must be a valid URL')
    .default('http://localhost:3000'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE: z.string().default('./logs/app.log'),
  SECURITY_LOG_FILE: z.string().default('./logs/security.log'),
  AUDIT_LOG_FILE: z.string().default('./logs/audit.log'),

  // Email (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().regex(/^\d+$/).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),

  // Rate limiting
  RATE_LIMIT_MAX: z.string().regex(/^\d+$/).default('100'),
  RATE_LIMIT_WINDOW: z.string().regex(/^\d+$/).default('900000'),
});

export type Env = z.infer<typeof envSchema>;

let validatedEnv: Env;

export function validateEnv(): Env {
  if (validatedEnv) {
    return validatedEnv;
  }

  try {
    validatedEnv = envSchema.parse(process.env);
    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .map(e => `${e.path.join('.')}: ${e.message}`)
        .join('\n');
      throw new Error(`Environment validation failed:\n${missingVars}`);
    }
    throw error;
  }
}

export function getEnv(): Env {
  if (!validatedEnv) {
    throw new Error('Environment not validated. Call validateEnv() first.');
  }
  return validatedEnv;
}
