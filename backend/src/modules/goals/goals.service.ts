import { AppError } from '../../errors/app-error';
import {
  createGoal,
  deleteStoredGoal,
  findGoalById,
  listGoalsByUser,
  updateStoredGoal,
} from '../../repositories/goal.repository';
import { CreateGoalInput, UpdateGoalInput } from './goals.schemas';

function sanitizeGoal(goal: {
  id: string;
  userId: string;
  title: string;
  mode: string;
  targetAmount: number;
  createdAt: string;
  updatedAt: string;
}) {
  return {
    id: goal.id,
    userId: goal.userId,
    title: goal.title,
    mode: goal.mode,
    targetAmount: goal.targetAmount,
    createdAt: goal.createdAt,
    updatedAt: goal.updatedAt,
  };
}

function ensureGoalOwnership(userId: string, goalUserId: string) {
  if (userId !== goalUserId) {
    throw new AppError(404, 'Meta não encontrada.', 'GOAL_NOT_FOUND');
  }
}

export async function listGoals(userId: string) {
  const goals = await listGoalsByUser(userId);

  return goals
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .map(sanitizeGoal);
}

export async function createNewGoal(userId: string, data: CreateGoalInput) {
  const goal = await createGoal({
    userId,
    title: data.title,
    mode: data.mode,
    targetAmount: Number(data.targetAmount.toFixed(2)),
  });

  return sanitizeGoal(goal);
}

export async function updateGoal(userId: string, goalId: string, data: UpdateGoalInput) {
  const existingGoal = await findGoalById(goalId);

  if (!existingGoal) {
    throw new AppError(404, 'Meta não encontrada.', 'GOAL_NOT_FOUND');
  }

  ensureGoalOwnership(userId, existingGoal.userId);

  const updatedGoal = await updateStoredGoal(goalId, (goal) => ({
    ...goal,
    title: data.title,
    mode: data.mode,
    targetAmount: Number(data.targetAmount.toFixed(2)),
    updatedAt: new Date().toISOString(),
  }));

  if (!updatedGoal) {
    throw new AppError(404, 'Meta não encontrada.', 'GOAL_NOT_FOUND');
  }

  return sanitizeGoal(updatedGoal);
}

export async function deleteGoal(userId: string, goalId: string) {
  const existingGoal = await findGoalById(goalId);

  if (!existingGoal) {
    throw new AppError(404, 'Meta não encontrada.', 'GOAL_NOT_FOUND');
  }

  ensureGoalOwnership(userId, existingGoal.userId);

  const removed = await deleteStoredGoal(goalId);

  if (!removed) {
    throw new AppError(404, 'Meta não encontrada.', 'GOAL_NOT_FOUND');
  }

  return sanitizeGoal(existingGoal);
}
