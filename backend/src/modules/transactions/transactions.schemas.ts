import { z } from 'zod';

const amountSchema = z.preprocess((value) => {
  if (typeof value === 'string') {
    const normalized = value.trim().replace(',', '.');
    if (!normalized) {
      return 0;
    }

    return Number(normalized);
  }

  return value;
}, z.number().positive('Informe um valor maior que zero.'));

const transactionDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe uma data valida no formato YYYY-MM-DD.');

export const createTransactionSchema = z.object({
  description: z.string().trim().min(2, 'Informe uma descricao valida.').max(120),
  kind: z.enum(['income', 'expense']),
  amount: amountSchema,
  accountId: z.string().trim().min(1, 'Selecione uma conta.'),
  categoryId: z.string().trim().min(1, 'Selecione uma categoria.'),
  transactionDate: transactionDateSchema,
  notes: z.string().trim().max(250).optional().default(''),
});

export const updateTransactionSchema = createTransactionSchema;

export const listTransactionsQuerySchema = z.object({
  kind: z.enum(['income', 'expense', 'all']).optional().default('all'),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;
