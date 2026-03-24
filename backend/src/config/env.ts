import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  JWT_SECRET: z.string().min(16),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  DATA_PROVIDER: z.enum(['json', 'prisma']).default('json'),
  DATABASE_URL: z.string().optional(),
  USERS_FILE_PATH: z.string().default('./data/users.json'),
  ACCOUNTS_FILE_PATH: z.string().default('./data/accounts.json'),
  CATEGORIES_FILE_PATH: z.string().default('./data/categories.json'),
  TRANSACTIONS_FILE_PATH: z.string().default('./data/transactions.json'),
  GOALS_FILE_PATH: z.string().default('./data/goals.json'),
}).superRefine((values, context) => {
  if (values.DATA_PROVIDER === 'prisma' && !values.DATABASE_URL?.trim()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'DATABASE_URL e obrigatoria quando DATA_PROVIDER=prisma.',
      path: ['DATABASE_URL'],
    });
  }
});

export const env = envSchema.parse(process.env);
