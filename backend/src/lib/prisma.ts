import { PrismaClient } from '@prisma/client';

import { env } from '../config/env';

let prismaClient: PrismaClient | null = null;

export function isPrismaProvider() {
  return env.DATA_PROVIDER === 'prisma';
}

export function getPrismaClient() {
  if (!isPrismaProvider()) {
    throw new Error('O Prisma foi requisitado sem DATA_PROVIDER=prisma.');
  }

  if (!prismaClient) {
    prismaClient = new PrismaClient();
  }

  return prismaClient;
}

export async function disconnectPrisma() {
  if (!prismaClient) {
    return;
  }

  await prismaClient.$disconnect();
  prismaClient = null;
}

export function toDateTimeString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

export function toDateOnlyString(value: Date | string) {
  return toDateTimeString(value).slice(0, 10);
}

export function toNumber(value: unknown) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    return Number(value);
  }

  if (
    value
    && typeof value === 'object'
    && 'toNumber' in value
    && typeof (value as { toNumber: () => number }).toNumber === 'function'
  ) {
    return (value as { toNumber: () => number }).toNumber();
  }

  return Number(value ?? 0);
}
