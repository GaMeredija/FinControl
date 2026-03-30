import { compare, hash } from 'bcryptjs';

import { AppError } from '../../errors/app-error';
import { signAccessToken } from '../../lib/jwt';
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
} from '../../repositories/user.repository';
import { LoginInput, RegisterInput, UpdateProfileInput } from './auth.schemas';

function sanitizeUser(user: {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function register(data: RegisterInput) {
  const existingUser = await findUserByEmail(data.email);

  if (existingUser) {
    throw new AppError(409, 'Este email já está em uso.', 'EMAIL_ALREADY_IN_USE');
  }

  const passwordHash = await hash(data.password, 10);

  const user = await createUser({
    name: data.name,
    email: data.email,
    passwordHash,
  });

  const token = signAccessToken(user.id, user.email);

  return {
    user: sanitizeUser(user),
    token,
  };
}

export async function login(data: LoginInput) {
  const user = await findUserByEmail(data.email);

  if (!user) {
    throw new AppError(401, 'Email ou senha inválidos.', 'INVALID_CREDENTIALS');
  }

  const isPasswordValid = await compare(data.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError(401, 'Email ou senha inválidos.', 'INVALID_CREDENTIALS');
  }

  const token = signAccessToken(user.id, user.email);

  return {
    user: sanitizeUser(user),
    token,
  };
}

export async function getProfile(userId: string) {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError(404, 'Usuário não encontrado.', 'USER_NOT_FOUND');
  }

  return sanitizeUser(user);
}

export async function updateProfile(userId: string, data: UpdateProfileInput) {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError(404, 'Usuário não encontrado.', 'USER_NOT_FOUND');
  }

  const normalizedNewPassword = data.newPassword?.trim() || undefined;
  const normalizedCurrentPassword = data.currentPassword?.trim() || undefined;
  const isEmailChanging = user.email !== data.email;
  const isPasswordChanging = Boolean(normalizedNewPassword);

  if (isEmailChanging || isPasswordChanging) {
    const isCurrentPasswordValid = Boolean(normalizedCurrentPassword)
      && await compare(normalizedCurrentPassword as string, user.passwordHash);

    if (!isCurrentPasswordValid) {
      throw new AppError(401, 'Senha atual inválida.', 'INVALID_CURRENT_PASSWORD');
    }
  }

  if (isEmailChanging) {
    const existingUser = await findUserByEmail(data.email);

    if (existingUser && existingUser.id !== user.id) {
      throw new AppError(409, 'Este email já está em uso.', 'EMAIL_ALREADY_IN_USE');
    }
  }

  const updatedUser = await updateUser(user.id, {
    name: data.name,
    email: data.email,
    ...(isPasswordChanging ? { passwordHash: await hash(normalizedNewPassword as string, 10) } : {}),
  });

  if (!updatedUser) {
    throw new AppError(404, 'Usuário não encontrado.', 'USER_NOT_FOUND');
  }

  return {
    user: sanitizeUser(updatedUser),
    token: signAccessToken(updatedUser.id, updatedUser.email),
  };
}
