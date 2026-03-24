import { Response } from 'express';

import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import {
  createAccountSchema,
  listAccountsQuerySchema,
  updateAccountSchema,
} from './accounts.schemas';
import {
  createNewAccount,
  inactivateAccount,
  listAccounts,
  updateAccount,
} from './accounts.service';

function getParamId(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value ?? '';
}

export async function listAccountsController(req: AuthenticatedRequest, res: Response) {
  const query = listAccountsQuerySchema.parse(req.query);
  const accounts = await listAccounts(req.userId as string, query);

  return res.status(200).json({
    data: accounts,
    message: 'Contas carregadas com sucesso.',
  });
}

export async function createAccountController(req: AuthenticatedRequest, res: Response) {
  const data = createAccountSchema.parse(req.body);
  const account = await createNewAccount(req.userId as string, data);

  return res.status(201).json({
    data: account,
    message: 'Conta criada com sucesso.',
  });
}

export async function updateAccountController(req: AuthenticatedRequest, res: Response) {
  const data = updateAccountSchema.parse(req.body);
  const account = await updateAccount(req.userId as string, getParamId(req.params.id), data);

  return res.status(200).json({
    data: account,
    message: 'Conta atualizada com sucesso.',
  });
}

export async function inactivateAccountController(req: AuthenticatedRequest, res: Response) {
  const account = await inactivateAccount(
    req.userId as string,
    getParamId(req.params.id),
  );

  return res.status(200).json({
    data: account,
    message: 'Conta inativada com sucesso.',
  });
}
