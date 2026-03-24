import { Response } from 'express';

import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import {
  createGoalSchema,
  updateGoalSchema,
} from './goals.schemas';
import {
  createNewGoal,
  deleteGoal,
  listGoals,
  updateGoal,
} from './goals.service';

function getParamId(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value ?? '';
}

export async function listGoalsController(req: AuthenticatedRequest, res: Response) {
  const goals = await listGoals(req.userId as string);

  return res.status(200).json({
    data: goals,
    message: 'Metas carregadas com sucesso.',
  });
}

export async function createGoalController(req: AuthenticatedRequest, res: Response) {
  const data = createGoalSchema.parse(req.body);
  const goal = await createNewGoal(req.userId as string, data);

  return res.status(201).json({
    data: goal,
    message: 'Meta criada com sucesso.',
  });
}

export async function updateGoalController(req: AuthenticatedRequest, res: Response) {
  const data = updateGoalSchema.parse(req.body);
  const goal = await updateGoal(req.userId as string, getParamId(req.params.id), data);

  return res.status(200).json({
    data: goal,
    message: 'Meta atualizada com sucesso.',
  });
}

export async function deleteGoalController(req: AuthenticatedRequest, res: Response) {
  const goal = await deleteGoal(req.userId as string, getParamId(req.params.id));

  return res.status(200).json({
    data: goal,
    message: 'Meta removida com sucesso.',
  });
}
