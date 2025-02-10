import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.routes';
import { videoRoutes } from '../modules/video/video.routes';
import { statisticsRoutes } from '../modules/statistics/statistics.routes';
import { followsRoutes } from '../modules/follows/follows.route';

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
      path: '/follows',
      route: followsRoutes,
   },
   {
      path: '/statistics',
      route: statisticsRoutes,
   },
];

appRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
