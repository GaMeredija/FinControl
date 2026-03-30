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
}, z.number().positive('Informe um valor alvo maior que zero.'));

export const createGoalSchema = z.object({
  title: z.string().trim().min(2, 'Informe um título válido.').max(100),
  mode: z.enum(['saving', 'limit']),
  targetAmount: amountSchema,
});

export const updateGoalSchema = createGoalSchema;

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
