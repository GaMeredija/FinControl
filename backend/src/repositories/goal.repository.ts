import { randomUUID } from 'node:crypto';
import path from 'node:path';

import { env } from '../config/env';
import {
  getPrismaClient,
  isPrismaProvider,
  toDateTimeString,
  toNumber,
} from '../lib/prisma';
import { readJsonFile, writeJsonFile } from './json-file.repository';

export type StoredGoal = {
  id: string;
  userId: string;
  title: string;
  mode: 'saving' | 'limit';
  targetAmount: number;
  createdAt: string;
  updatedAt: string;
};

const goalsFilePath = path.resolve(process.cwd(), env.GOALS_FILE_PATH);

async function readGoals() {
  return readJsonFile<StoredGoal[]>(goalsFilePath);
}

async function writeGoals(goals: StoredGoal[]) {
  await writeJsonFile(goalsFilePath, goals);
}

function mapPrismaGoal(goal: {
  id: string;
  userId: string;
  title: string;
  mode: string;
  targetAmount: unknown;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: goal.id,
    userId: goal.userId,
    title: goal.title,
    mode: goal.mode as StoredGoal['mode'],
    targetAmount: toNumber(goal.targetAmount),
    createdAt: toDateTimeString(goal.createdAt),
    updatedAt: toDateTimeString(goal.updatedAt),
  } satisfies StoredGoal;
}

export async function createGoal(
  data: Omit<StoredGoal, 'id' | 'createdAt' | 'updatedAt'>,
) {
  if (isPrismaProvider()) {
    const goal = await getPrismaClient().goal.create({
      data: {
        userId: data.userId,
        title: data.title,
        mode: data.mode,
        targetAmount: data.targetAmount,
      },
    });

    return mapPrismaGoal(goal);
  }

  const goals = await readGoals();
  const now = new Date().toISOString();

  const goal: StoredGoal = {
    id: randomUUID(),
    userId: data.userId,
    title: data.title,
    mode: data.mode,
    targetAmount: data.targetAmount,
    createdAt: now,
    updatedAt: now,
  };

  goals.push(goal);
  await writeGoals(goals);

  return goal;
}

export async function findGoalById(goalId: string) {
  if (isPrismaProvider()) {
    const goal = await getPrismaClient().goal.findUnique({
      where: { id: goalId },
    });

    return goal ? mapPrismaGoal(goal) : null;
  }

  const goals = await readGoals();
  return goals.find((goal) => goal.id === goalId) ?? null;
}

export async function listGoalsByUser(userId: string) {
  if (isPrismaProvider()) {
    const goals = await getPrismaClient().goal.findMany({
      where: { userId },
    });

    return goals.map(mapPrismaGoal);
  }

  const goals = await readGoals();
  return goals.filter((goal) => goal.userId === userId);
}

export async function updateStoredGoal(
  goalId: string,
  updater: (goal: StoredGoal) => StoredGoal,
) {
  if (isPrismaProvider()) {
    const existingGoal = await findGoalById(goalId);

    if (!existingGoal) {
      return null;
    }

    const updatedGoal = updater(existingGoal);
    const goal = await getPrismaClient().goal.update({
      where: { id: goalId },
      data: {
        title: updatedGoal.title,
        mode: updatedGoal.mode,
        targetAmount: updatedGoal.targetAmount,
      },
    });

    return mapPrismaGoal(goal);
  }

  const goals = await readGoals();
  const goalIndex = goals.findIndex((goal) => goal.id === goalId);

  if (goalIndex === -1) {
    return null;
  }

  const updatedGoal = updater(goals[goalIndex]);
  goals[goalIndex] = updatedGoal;

  await writeGoals(goals);

  return updatedGoal;
}

export async function deleteStoredGoal(goalId: string) {
  if (isPrismaProvider()) {
    const deletedGoal = await getPrismaClient().goal.deleteMany({
      where: { id: goalId },
    });

    return deletedGoal.count > 0;
  }

  const goals = await readGoals();
  const goalIndex = goals.findIndex((goal) => goal.id === goalId);

  if (goalIndex === -1) {
    return false;
  }

  goals.splice(goalIndex, 1);
  await writeGoals(goals);

  return true;
}
