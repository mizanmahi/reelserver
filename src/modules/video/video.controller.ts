import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import { VideoService } from './video.service';
import catchAsync from '../../utils/catchAsync';

const uploadVideo = catchAsync(async (req: Request, res: Response) => {
   const { file } = req;

   if (!file) throw new Error('Video file is required');

   console.log('user: ', req.user);

   const result = await VideoService.uploadVideo(file, req.body, req.user);
   sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Video uploaded successfully!',
      data: result,
   });
});

const getAllVideos = catchAsync(async (req: Request, res: Response) => {
   const result = await VideoService.getAllVideos(req.query);
   sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Video retrieved successfully',
      data: result,
   });
});

const generateDeviceKey = (req: Request) => {
   const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
   const userAgent = req.headers['user-agent'];
   return `device:${ip}:${userAgent}`;
};

const getVideoById = catchAsync(async (req: Request, res: Response) => {
   const {
      params: { id, userId },
   } = req;

   const deviceKey = generateDeviceKey(req);
   console.log('User id in controller:', userId);

   const result = await VideoService.getVideoById(deviceKey, id, userId);
   sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Video retrieved successfully',
      data: result,
   });
});

const toggleVideoLike = catchAsync(async (req: Request, res: Response) => {
   const { id } = req.params;

   const result = await VideoService.toggleVideoLike(id, req.user);

   const { isLiked, ...data } = result;

   sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `You have ${isLiked ? 'liked' : 'unliked'} the video`,
      data,
   });
});

const commentOnVideo = catchAsync(async (req: Request, res: Response) => {
   const { id } = req.params;

   const result = await VideoService.commentOnVideo(id, req.body, req.user);

   sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Commented successfully`,
      data: result,
   });
});
const getAllCommentOfAVideo = catchAsync(
   async (req: Request, res: Response) => {
      const { id } = req.params;

      const { data, meta } = await VideoService.getAllCommentOfAVideo(
         id,
         req.query
      );

      sendResponse(res, {
         statusCode: 200,
         success: true,
         message: `Comment fetched successfully`,
         meta: meta,
         data: data,
      });
   }
);
const getCommentReplies = catchAsync(async (req: Request, res: Response) => {
   const { parentCommentId } = req.params;
   console.log('comes here');

   const { data, meta } = await VideoService.getCommentReplies(
      parentCommentId,
      req.query
   );

   sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Comment fetched successfully`,
      meta: meta,
      data: data,
   });
});

export const VideoController = {
   uploadVideo,
   getAllVideos,
   getVideoById,
   toggleVideoLike,
   commentOnVideo,
   getAllCommentOfAVideo,
   getCommentReplies,
};
