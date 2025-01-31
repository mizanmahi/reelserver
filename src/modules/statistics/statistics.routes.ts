import express from 'express';
import { auth } from '../../middlewares/auth';
import { StatisticsController } from './statistics.controller';

const router = express.Router();

router.get('/', auth, StatisticsController.myProfileStatistics);

export const statisticsRoutes = router;
