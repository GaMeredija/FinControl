import { Response } from 'express';

import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { getReportSummary } from './reports.service';

export async function getReportSummaryController(req: AuthenticatedRequest, res: Response) {
  const report = await getReportSummary(req.userId as string);

  return res.status(200).json({
    data: report,
    message: 'Relatorios carregados com sucesso.',
  });
}
