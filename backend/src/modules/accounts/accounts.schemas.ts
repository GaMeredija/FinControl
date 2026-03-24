import { z } from 'zod';

export const accountTypeSchema = z.enum([
  'checking',
  'savings',
  'cash',
  'credit_card',
  'investment',
]);

const amountSchema = z.preprocess((value) => {
  if (typeof value === 'string') {
    const normalized = value.trim().replace(',', '.');
    if (normalized.length === 0) {
      return 0;
    }

    return Number(normalized);
  }

  return value;
}, z.number().finite('Informe um valor numerico valido.'));

export const createAccountSchema = z.object({
  name: z.string().trim().min(2, 'Informe um nome valido para a conta.').max(60),
  type: accountTypeSchema,
  initialBalance: amountSchema.default(0),
});

export const updateAccountSchema = createAccountSchema;

export const listAccountsQuerySchema = z.object({
  includeInactive: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value === 'true'),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type ListAccountsQuery = z.infer<typeof listAccountsQuerySchema>;

