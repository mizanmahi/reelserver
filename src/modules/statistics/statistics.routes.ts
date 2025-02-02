import express from 'express';
import { auth } from '../../middlewares/auth';
import { StatisticsController } from './statistics.controller';

const router = express.Router();

router.get('/', auth, StatisticsController.getUserProfileStats);

export const statisticsRoutes = router;
