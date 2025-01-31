import express from 'express';
import { auth } from '../../middlewares/auth';
import { AnalyticsController } from './analytics.controller';

const router = express.Router();

router.get(
    "/",
    auth,
    AnalyticsController.myProfileAnalytics
);

export const analyticsRoutes = router;