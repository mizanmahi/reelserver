import { JwtPayload } from 'jsonwebtoken';
import { prisma } from '../../database/database';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getUserProfileStats = async (authUser: JwtPayload): Promise<any> => {
   const id = authUser.id;

   try {
      // Fetch user with their videos and calculate statistics
      const user = await prisma.user.findUnique({
         where: { id },
         include: {
            videos: {
               select: {
                  id: true,
                  title: true,
                  viewCount: true,
                  likeCount: true,
               },
            },
         },
      });

      if (!user) {
         throw new Error('User not found.');
      }

      // Calculate statistics using Prisma aggregation
      const videoStats = await prisma.video.aggregate({
         where: { uploaderId: id },
         _sum: {
            viewCount: true,
            likeCount: true,
         },
         _count: {
            id: true,
         },
      });

      const totalVideos = videoStats._count.id;
      const totalViews = videoStats._sum.viewCount || 0;
      const totalLikes = videoStats._sum.likeCount || 0;

      // Find the most popular video
      const mostPopularVideo = await prisma.video.findFirst({
         where: { uploaderId: id },
         orderBy: { viewCount: 'desc' },
         select: {
            id: true,
            videoUrl: true,
            thumbnail: true,
            title: true,
            viewCount: true,
            likeCount: true,
         },
      });

      // Calculate engagement rate
      const engagementRate =
         totalViews > 0 ? (totalLikes / totalViews) * 100 : 0;

      // Optional: Additional statistics
      const averageViews = totalVideos > 0 ? totalViews / totalVideos : 0;
      const totalEngagements = totalViews + totalLikes;

      // Fetch engagement breakdown (optional)
      const engagementBreakdown = await prisma.video.findMany({
         where: { uploaderId: id },
         select: {
            id: true,
            title: true,
            viewCount: true,
            likeCount: true,
            videoUrl: true,
         },
      });

      // Fetch top 5 most popular videos
      const topVideos = await prisma.video.findMany({
         where: { uploaderId: id },
         orderBy: { viewCount: 'desc' },
         take: 3,
         select: {
            id: true,
            title: true,
            viewCount: true,
            likeCount: true,
            videoUrl: true,
         },
      });

      // user info
      const profile = await prisma.user.findUniqueOrThrow({
         where: {
            id,
         },
         include: {
            following: {
               include: {
                  followedBy: {
                     select: {
                        id: true,
                        name: true,
                     },
                  },
               },
            },
            followedBy: {
               include: {
                  following: {
                     select: {
                        id: true,
                        name: true,
                     },
                  },
               },
            },
         },
      });

      // const followers = await prisma.follows.findMany({
      //    where: {
      //       followingId: id,
      //    },
      //    include: {
      //       followedBy: true,
      //    },
      // });

      // const followedUsers = await prisma.follows.findMany({
      //    where: {
      //       followedById: id,
      //    },
      //    include: {
      //       following: true,
      //    },
      // });

      console.log(profile);

      const statistics = {
         totalVideos,
         totalViews,
         totalLikes,
         mostPopularVideo: mostPopularVideo
            ? {
                 id: mostPopularVideo.id,
                 videoUrl: mostPopularVideo.videoUrl,
                 thumbnail: mostPopularVideo.thumbnail,
                 title: mostPopularVideo.title,
                 viewCount: mostPopularVideo.viewCount,
                 likeCount: mostPopularVideo.likeCount,
              }
            : null,
         engagementRate: engagementRate.toFixed(2) + '%', // Format as percentage
         averageViews,
         totalEngagements,
         engagementBreakdown,
         topVideos,
         // profile: { ...profile, followers, followedUsers },
         profile: { ...profile },
      };

      return statistics;
   } catch (error) {
      console.error('Error fetching profile statistics:', error);
      throw new Error('Failed to fetch profile statistics.');
   }
};

export const StatisticService = {
   getUserProfileStats,
};
