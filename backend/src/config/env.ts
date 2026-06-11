import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(4000),
  API_PUBLIC_URL: z.string().url().default('http://localhost:4000'),
  WEB_PUBLIC_URL: z.string().url().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(24, 'JWT_SECRET doit contenir au moins 24 caractères'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173,http://localhost:8080'),
  TMDB_API_TOKEN: z.string().optional(),
  TMDB_CACHE_TTL_MINUTES: z.coerce.number().default(1440),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GITHUB_CALLBACK_URL: z.string().optional()
});

export const env = envSchema.parse(process.env);
export const corsOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim());
