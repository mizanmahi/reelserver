import express from 'express';
import { auth } from '../../middlewares/auth';
import { FollowsController } from './follows.controller';

const router = express.Router();

router.post('/follow/:targetUserId', auth, FollowsController.follow);
router.post('/unfollow/:targetUserId', auth, FollowsController.unfollow);

export const followsRoutes = router;
