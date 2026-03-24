import { Response } from 'express';

import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import {
  createTransactionSchema,
  listTransactionsQuerySchema,
  updateTransactionSchema,
} from './transactions.schemas';
import {
  createNewTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction,
} from './transactions.service';

function getParamId(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value ?? '';
}

export async function listTransactionsController(req: AuthenticatedRequest, res: Response) {
  const query = listTransactionsQuerySchema.parse(req.query);
  const transactions = await listTransactions(req.userId as string, query);

  return res.status(200).json({
    data: transactions,
    message: 'Lancamentos carregados com sucesso.',
  });
}

export async function createTransactionController(req: AuthenticatedRequest, res: Response) {
  const data = createTransactionSchema.parse(req.body);
  const transaction = await createNewTransaction(req.userId as string, data);

  return res.status(201).json({
    data: transaction,
    message: 'Lancamento criado com sucesso.',
  });
}

export async function updateTransactionController(req: AuthenticatedRequest, res: Response) {
  const data = updateTransactionSchema.parse(req.body);
  const transaction = await updateTransaction(req.userId as string, getParamId(req.params.id), data);

  return res.status(200).json({
    data: transaction,
    message: 'Lancamento atualizado com sucesso.',
  });
}

export async function deleteTransactionController(req: AuthenticatedRequest, res: Response) {
  const transaction = await deleteTransaction(req.userId as string, getParamId(req.params.id));

  return res.status(200).json({
    data: transaction,
    message: 'Lancamento removido com sucesso.',
  });
}
