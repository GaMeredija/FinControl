import { randomUUID } from 'node:crypto';
import path from 'node:path';

import { env } from '../config/env';
import {
  getPrismaClient,
  isPrismaProvider,
  toDateTimeString,
} from '../lib/prisma';
import { readJsonFile, writeJsonFile } from './json-file.repository';

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
};

const usersFilePath = path.resolve(process.cwd(), env.USERS_FILE_PATH);

async function readUsers() {
  return readJsonFile<StoredUser[]>(usersFilePath);
}

async function writeUsers(users: StoredUser[]) {
  await writeJsonFile(usersFilePath, users);
}

function mapPrismaUser(user: {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    passwordHash: user.passwordHash,
    createdAt: toDateTimeString(user.createdAt),
    updatedAt: toDateTimeString(user.updatedAt),
  } satisfies StoredUser;
}

export async function findUserByEmail(email: string) {
  if (isPrismaProvider()) {
    const user = await getPrismaClient().user.findUnique({
      where: { email },
    });

    return user ? mapPrismaUser(user) : null;
  }

  const users = await readUsers();
  return users.find((user) => user.email === email) ?? null;
}

export async function findUserById(id: string) {
  if (isPrismaProvider()) {
    const user = await getPrismaClient().user.findUnique({
      where: { id },
    });

    return user ? mapPrismaUser(user) : null;
  }

  const users = await readUsers();
  return users.find((user) => user.id === id) ?? null;
}

export async function createUser(data: Omit<StoredUser, 'id' | 'createdAt' | 'updatedAt'>) {
  if (isPrismaProvider()) {
    const user = await getPrismaClient().user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
      },
    });

    return mapPrismaUser(user);
  }

  const users = await readUsers();
  const now = new Date().toISOString();

  const user: StoredUser = {
    id: randomUUID(),
    name: data.name,
    email: data.email,
    passwordHash: data.passwordHash,
    createdAt: now,
    updatedAt: now,
  };

  users.push(user);
  await writeUsers(users);

  return user;
}

export async function updateUser(
  id: string,
  data: Partial<Pick<StoredUser, 'name' | 'email' | 'passwordHash'>>,
) {
  if (isPrismaProvider()) {
    const existingUser = await getPrismaClient().user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingUser) {
      return null;
    }

    const updatedUser = await getPrismaClient().user.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.email ? { email: data.email } : {}),
        ...(data.passwordHash ? { passwordHash: data.passwordHash } : {}),
      },
    });

    return mapPrismaUser(updatedUser);
  }

  const users = await readUsers();
  const index = users.findIndex((user) => user.id === id);

  if (index === -1) {
    return null;
  }

  const currentUser = users[index];
  const updatedUser: StoredUser = {
    ...currentUser,
    ...data,
    updatedAt: new Date().toISOString(),
  };

  users[index] = updatedUser;
  await writeUsers(users);

  return updatedUser;
}
