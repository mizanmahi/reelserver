import express from 'express';
import { auth } from '../../middlewares/auth';
import { CommentController } from './comment.controller';

const router = express.Router();

router.post('/:commentId/replies', auth, CommentController.commentOnComment);
// router.get('/:commentId/replies', FollowsController.unfollow);

export const commentRoutes = router;
