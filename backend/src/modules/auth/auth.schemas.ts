import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(3, 'Informe um nome válido.'),
  email: z.string().trim().email('Informe um email válido.').toLowerCase(),
  password: z
    .string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres.')
    .max(64, 'A senha deve ter no máximo 64 caracteres.'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Informe um email válido.').toLowerCase(),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
});

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(3, 'Informe um nome válido.'),
    email: z.string().trim().email('Informe um email válido.').toLowerCase(),
    currentPassword: z.string().trim().optional(),
    newPassword: z
      .string()
      .trim()
      .min(6, 'A nova senha deve ter no mínimo 6 caracteres.')
      .max(64, 'A nova senha deve ter no máximo 64 caracteres.')
      .optional()
      .or(z.literal('')),
  })
  .superRefine((data, context) => {
    const hasNewPassword = Boolean(data.newPassword);
    const hasCurrentPassword = Boolean(data.currentPassword);

    if (hasNewPassword && !hasCurrentPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Informe a senha atual para definir uma nova senha.',
        path: ['currentPassword'],
      });
    }
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
