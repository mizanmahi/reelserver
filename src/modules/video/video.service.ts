import { Video } from '@prisma/client';
import minioClient, { bucketName } from '../../utils/minioClient';
import { File, IVideoPayload } from './video.interface';
import { generateVideoThumbnail } from './video.utils';
import { JwtPayload } from 'jsonwebtoken';
import redis from '../../utils/redisClient';

import { prisma } from '../../database/database';

const uploadVideo = async (
   file: File,
   data: IVideoPayload,
   authUser: JwtPayload
): Promise<Video> => {
   const { title, description } = data;

   const videoFileName = `videos/${Date.now()}_${file.originalname}`;
   const thumbnailFileName = `thumbnails/${Date.now()}_thumbnail.png`;

   try {
      const uploadedData = await minioClient.putObject(
         bucketName,
         videoFileName,
         file.buffer
      );
      console.log('Video uploaded successfully:', uploadedData);

      const thumbnailBuffer = await generateVideoThumbnail(file.buffer);
      console.log('Thumbnail generated successfully');

      await minioClient.putObject(
         bucketName,
         thumbnailFileName,
         thumbnailBuffer
      );
      console.log('Thumbnail uploaded successfully');

      const videoPublicUrl = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${videoFileName}`;
      const thumbnailUrl = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${thumbnailFileName}`;
      console.log('Video public URL:', videoPublicUrl);

      const result = await prisma.video.create({
         data: {
            title,
            description,
            videoUrl: videoPublicUrl,
            thumbnail: thumbnailUrl,
            uploaderId: authUser.id,
         },
      });

      return result;
   } catch (error) {
      console.error('Error uploading video and thumbnail:', error);
      throw new Error('Error uploading video and thumbnail');
   }
};

const getAllVideos = async (query: Record<string, unknown>) => {
   const page = parseInt(query.page as string) || 1;
   const limit = parseInt(query.limit as string) || 10;
   const skip = (page - 1) * limit;

   const cacheKey = `videos:${page}:${limit}`;
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

   await redis.setex(cacheKey, 1800, JSON.stringify(videos));

   return videos;
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
      await redis.setex(cacheKey, 3600, JSON.stringify(video)); // Cache for 1 hour
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
         await redis.setex(cacheKey, 3600, JSON.stringify(updatedVideo)); // Cache for 1 hour
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
