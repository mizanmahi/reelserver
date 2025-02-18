import { Video } from '@prisma/client';
import { File, IVideoPayload } from './video.interface';
import { processVideoUpload } from './video.utils';
import { JwtPayload } from 'jsonwebtoken';
import redis from '../../clients/redis';

import { prisma } from '../../database/database';
import logger from '../../logger/logger';
import HttpError from '../../errorHandlers/HttpError';

const uploadVideo = async (
   file: File,
   payload: IVideoPayload,
   user: JwtPayload
): Promise<Video> => {
   const { title, description } = payload;
   console.log({ file });

   try {
      // Process video and thumbnail
      const {
         compressedVideoUrl: videoUrl,
         thumbnailUrl,
         metadata,
      } = await processVideoUpload(file.buffer, file.originalname);

      // const videoMetaData = await getVideoMetadata(file.buffer);

      console.log('Video URL:', videoUrl);
      console.log('Thumbnail URL:', thumbnailUrl);

      // Store video metadata in the database
      const videoRecord = await prisma.video.create({
         data: {
            title,
            description,
            videoUrl,
            thumbnail: thumbnailUrl,
            uploaderId: user.id,
            metadata: JSON.stringify(metadata.format),
         },
      });

      // const keys = await redis.keys('videos:*'); // less effective
      // if (keys.length > 0) {
      //    await redis.del(...keys);
      // }

      // await redis.incr('videos:version'); // super effective
      try {
         await redis.incr('videos:version');
         console.log('Cache version incremented successfully');
      } catch (error) {
         console.error('Failed to increment cache version:', error);
      }

      return videoRecord;
   } catch (error) {
      logger.error('Video upload failed:', error);
      throw new Error(`Failed to upload video: ${(error as Error).message}`);
   }
};

const getAllVideos = async (query: Record<string, unknown>) => {
   const page = parseInt(query.page as string) || 1;
   const limit = parseInt(query.limit as string) || 10;
   const skip = (page - 1) * limit;

   // const cacheKey = `videos:${page}:${limit}`;

   const version = (await redis.get('videos:version')) || 1;
   console.log({ nextAllCall: version });
   const cacheKey = `videos:v${version}:${page}:${limit}`;
   const cachedVideos = await redis.get(cacheKey);

   if (cachedVideos) {
      console.log('cache hit');
      return JSON.parse(cachedVideos);
   }

   const videos = await prisma.video.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
         uploader: {
            select: {
               name: true,
               email: true,
            },
         },
      },
   });

   const total = await prisma.video.count();

   const result = {
      meta: {
         page,
         limit,
         total,
      },
      data: videos,
   };

   await redis.setex(cacheKey, 60, JSON.stringify(result));

   return result;
};

// need to handle the liked or unliked by current user if token comes
const getVideoById = async (
   deviceKey: string,
   videoId: string,
   userId?: string
) => {
   const getCurrentTimestamp = () => Math.floor(Date.now() / 1000);
   const cacheKey = `video:${videoId}`;
   const viewCoolDown = 30 * 60; // 30 minutes in seconds

   // Check cache for video details
   const cachedVideo = await redis.get(cacheKey);
   let video;

   if (cachedVideo) {
      console.log('Cache hit for video');
      video = JSON.parse(cachedVideo);
   } else {
      video = await prisma.video.findUnique({
         where: { id: videoId },
         include: {
            uploader: {
               select: {
                  name: true,
                  email: true,
               },
            },
         },
      });

      if (!video) {
         throw new Error('Video not found!');
      }

      // Cache the video details
      // Cache for 2.5 min
   }

   // Determine if the user has liked the video
   let isLiked = false;
   console.log({ userId });
   if (userId) {
      const engagement = await prisma.engagement.findUnique({
         where: {
            videoId_userId: { videoId, userId },
         },
      });
      console.log({ engagement });
      isLiked = !!engagement;
   }

   // Get the last viewed timestamp for the device from Redis
   const lastViewedTimestamp = await redis.get(deviceKey);
   const currentTimestamp = getCurrentTimestamp();

   if (
      !lastViewedTimestamp ||
      currentTimestamp - parseInt(lastViewedTimestamp) > viewCoolDown
   ) {
      console.log('incrementing view count');
      // If the device has not viewed in the last 30 minutes, increment the view count
      await prisma.video.update({
         where: { id: videoId },
         data: {
            viewCount: video.viewCount + 1, // Increment the view count
         },
      });

      // Update the timestamp for this device in Redis
      await redis.setex(deviceKey, viewCoolDown, currentTimestamp.toString());

      const updatedVideo = await prisma.video.findUnique({
         where: { id: videoId },
         include: {
            uploader: {
               select: {
                  name: true,
               },
            },
         },
      });

      if (updatedVideo) {
         // Update the cache with the new view count
         await redis.setex(cacheKey, 60, JSON.stringify(updatedVideo));
      }
   }

   // Fetch previous and next video IDs
   const prevVideo = await prisma.video.findFirst({
      where: {
         createdAt: { lt: video.createdAt },
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
   });

   const nextVideo = await prisma.video.findFirst({
      where: {
         createdAt: { gt: video.createdAt },
      },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
   });

   const result = {
      ...video,
      prevVideoId: prevVideo?.id || null, // Include previous video ID
      nextVideoId: nextVideo?.id || null, // Include next video ID
      isLiked,
   };

   await redis.setex(cacheKey, 60, JSON.stringify(result));

   return result;
};

const toggleVideoLike = async (videoId: string, authUser: JwtPayload) => {
   return prisma.$transaction(async (tx) => {
      const existingLike = await tx.engagement.findUnique({
         where: { videoId_userId: { videoId, userId: authUser.id } },
      });

      if (existingLike) {
         // Unlike the video
         await tx.engagement.delete({
            where: { videoId_userId: { videoId, userId: authUser.id } },
         });

         const updatedVideo = await tx.video.update({
            where: { id: videoId },
            data: { likeCount: { decrement: 1 } },
            select: { likeCount: true },
         });

         const cacheKey = `video:${videoId}`;
         await redis.del(cacheKey); // Delete cache

         return {
            videoId,
            likeCount: updatedVideo.likeCount,
            isLiked: false,
         };
      }

      // Like the video
      await tx.engagement.create({
         data: { videoId, userId: authUser.id },
      });

      const updatedVideo = await tx.video.update({
         where: { id: videoId },
         data: { likeCount: { increment: 1 } },
         select: { likeCount: true },
      });
      const cacheKey = `video:${videoId}`;
      await redis.del(cacheKey); // Delete cache

      return {
         videoId,
         likeCount: updatedVideo.likeCount,
         isLiked: true,
      };
   });
};

const commentOnVideo = async (
   videoId: string,
   payload: { content: string },
   authUser: JwtPayload
) => {
   const [user, video] = await prisma.$transaction([
      prisma.user.findUnique({ where: { id: authUser.id } }),
      prisma.video.findUnique({ where: { id: videoId } }),
   ]);

   if (!user) {
      throw new HttpError(404, 'User not found');
   }

   if (!video) {
      throw new HttpError(404, 'Video not found');
   }

   const result = await prisma.comment.create({
      data: {
         content: payload.content,
         userId: authUser.id,
         videoId,
      },
   });

   return result;
};

// only the top level comments
const getAllCommentOfAVideo = async (
   videoId: string,
   query: Record<string, unknown>
) => {
   const page = parseInt(query.page as string) || 1;
   const limit = parseInt(query.limit as string) || 10;
   const skip = (page - 1) * limit;

   const where = {
      videoId,
      parentCommentId: null,
   };

   const comments = await prisma.comment.findMany({
      where,
      take: limit,
      skip,
      orderBy: {
         createdAt: 'desc',
      },
      include: {
         user: {
            select: {
               id: true,
               name: true,
            },
         },
         _count: {
            select: {
               commentLikes: true,
               parentComments: true,
            },
         },
      },
   });

   const total = await prisma.comment.count({ where });

   return {
      meta: {
         page,
         limit,
         total,
         hasNextPage: skip + limit < total,
      },
      data: comments.map((c) => ({
         ...c,
         likeCount: c._count.commentLikes,
         replyCount: c._count.parentComments,
         replies: [], // Empty array to be filled on demand
         hasMoreReplies: c._count.parentComments > 0,
      })),
   };
};

// GET /api/comments/:commentId/replies
const getCommentReplies = async (
   commentId: string,
   query: Record<string, unknown>
) => {
   const page = Number(query.page) || 1;
   const limit = Math.min(Number(query.limit) || 5, 50);
   const skip = (page - 1) * limit;

   const where = {
      parentCommentId: commentId,
   };

   const [replies, total] = await Promise.all([
      prisma.comment.findMany({
         where,
         skip,
         take: limit,
         orderBy: { createdAt: 'asc' },
         select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            user: {
               select: {
                  id: true,
                  name: true,
               },
            },
            _count: {
               select: {
                  commentLikes: true,
                  parentComments: true,
               },
            },
         },
      }),
      prisma.comment.count({ where }),
   ]);

   return {
      meta: {
         page,
         limit,
         total,
         hasNextPage: skip + limit < total,
      },
      data: replies.map((r) => ({
         ...r,
         likeCount: r._count.commentLikes,
         replyCount: r._count.parentComments,
         replies: [], // Next level replies
         hasMoreReplies: r._count.parentComments > 0,
      })),
   };
};

export const VideoService = {
   uploadVideo,
   getAllVideos,
   getVideoById,
   toggleVideoLike,
   commentOnVideo,
   getAllCommentOfAVideo,
   getCommentReplies,
};
