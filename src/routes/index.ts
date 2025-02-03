import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.routes';
import { videoRoutes } from '../modules/video/video.routes';
import { statisticsRoutes } from '../modules/statistics/statistics.routes';

const router = Router();

const appRoutes = [
   {
      path: '/video',
      route: videoRoutes,
   },
   {
      path: '/auth',
      route: authRoutes,
   },
   {
      path: '/statistics',
      route: statisticsRoutes,
   },
];

appRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
