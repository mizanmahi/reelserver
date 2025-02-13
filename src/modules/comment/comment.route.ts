import express from 'express';
import { auth } from '../../middlewares/auth';
import { CommentController } from './comment.controller';

const router = express.Router();

router.post('/:postId', auth, CommentController.commentOnPost);
// router.post('/:parentId', auth, FollowsController.unfollow);
// router.post('/like/:commentId', FollowsController.unfollow);

export const commentRoutes = router;
