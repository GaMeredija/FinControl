import { Request, Response } from 'express';

import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { getProfile, login, register, updateProfile } from './auth.service';
import { loginSchema, registerSchema, updateProfileSchema } from './auth.schemas';

export async function registerController(req: Request, res: Response) {
  const data = registerSchema.parse(req.body);
  const result = await register(data);

  return res.status(201).json({
    data: result,
    message: 'Usuario cadastrado com sucesso.',
  });
}

export async function loginController(req: Request, res: Response) {
  const data = loginSchema.parse(req.body);
  const result = await login(data);

  return res.status(200).json({
    data: result,
    message: 'Login realizado com sucesso.',
  });
}

export async function meController(req: AuthenticatedRequest, res: Response) {
  const profile = await getProfile(req.userId as string);

  return res.status(200).json({
    data: profile,
    message: 'Perfil carregado com sucesso.',
  });
}

export async function updateProfileController(req: AuthenticatedRequest, res: Response) {
  const data = updateProfileSchema.parse(req.body);
  const result = await updateProfile(req.userId as string, data);

  return res.status(200).json({
    data: result,
    message: 'Perfil atualizado com sucesso.',
  });
}
