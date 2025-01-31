import express from 'express';
import { VideoController } from './video.controller';
import multerUpload from '../../middlewares/upload';
import { parseBody } from '../../middlewares/parseBody';
import { auth } from '../../middlewares/auth';

const router = express.Router();

router.post(
   '/upload',
   auth,
   multerUpload.single('video'),
   parseBody,
   VideoController.uploadVideo
);
router.get('/', VideoController.getAllVideos);
router.get('/:id', VideoController.getVideoById);

router.post('/:id', auth, VideoController.toggleVideoLike);

export const videoRoutes = router;
