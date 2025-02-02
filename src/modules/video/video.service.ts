import { Video } from '@prisma/client';
import { File, IVideoPayload } from './video.interface';
import { processVideoUpload } from './video.utils';
import { JwtPayload } from 'jsonwebtoken';
import redis from '../../clients/redis';

import { prisma } from '../../database/database';
import logger from '../../logger/logger';

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
      } = await processVideoUpload(
         file.buffer,
         file.originalname,
         process.env.MINIO_BUCKET_NAME as string
      );

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

   await redis.setex(cacheKey, 1800, JSON.stringify(result));

   return result;
};

const getVideoById = async (deviceKey: string, videoId: string) => {
   // Getting the current timestamp in seconds
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
      await redis.setex(cacheKey, 1800, JSON.stringify(video)); // Cache for .5 hour
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
         await redis.setex(cacheKey, 1800, JSON.stringify(updatedVideo)); // Cache for .5 hour
      }
   }

   return video;
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

      return {
         videoId,
         likeCount: updatedVideo.likeCount,
         isLiked: true,
      };
   });
};

export const VideoService = {
   uploadVideo,
   getAllVideos,
   getVideoById,
   toggleVideoLike,
};
