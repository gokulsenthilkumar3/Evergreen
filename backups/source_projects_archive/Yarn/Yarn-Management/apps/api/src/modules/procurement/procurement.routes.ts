import { Router } from 'express';
import { poRouter } from './po.routes';
import { rfqRouter } from './rfq.routes';
import { grnRouter } from './grn.routes';

export const procurementRouter = Router();

procurementRouter.use('/purchase-orders', poRouter);
procurementRouter.use('/rfqs', rfqRouter);
procurementRouter.use('/grns', grnRouter);
