import express from 'express';
import { auth } from '../../middlewares/auth';
import { FollowsController } from './follows.controller';

const router = express.Router();

router.post('/:followsId', auth, FollowsController.toggleFollow);

export const followsRoutes = router;
