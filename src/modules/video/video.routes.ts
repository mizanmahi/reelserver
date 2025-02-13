import express from 'express';
import { VideoController } from './video.controller';
import multerUpload from '../../middlewares/fileUploader';
import { parseBody } from '../../middlewares/parseBody';
import { auth } from '../../middlewares/auth';
import validate from '../../middlewares/validateRequest';
import { VideoValidationSchemas } from './video.validation';

const router = express.Router();

router.post(
   '/upload',
   auth,
   multerUpload.single('reelVideo'),
   parseBody,
   VideoController.uploadVideo
);
router.get('/', VideoController.getAllVideos);
router.get('/:id', VideoController.getVideoById);
router.get('/:id/comments', VideoController.getAllCommentOfAVideo);
router.get('/:id/:userId', VideoController.getVideoById);
router.post('/:id', auth, VideoController.toggleVideoLike);
router.post(
   '/:id/comments',
   validate(VideoValidationSchemas.videoCommentSchema),
   auth,
   VideoController.commentOnVideo
);

export const videoRoutes = router;
