import { Router } from 'express';

import { ensureAuthenticated } from '../../middlewares/auth.middleware';
import { getReportSummaryController } from './reports.controller';

export const reportsRoutes = Router();

reportsRoutes.use(ensureAuthenticated);

reportsRoutes.get('/summary', getReportSummaryController);
