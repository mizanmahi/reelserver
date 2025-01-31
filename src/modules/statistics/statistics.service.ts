import { JwtPayload } from 'jsonwebtoken';
import { prisma } from '../../database/database';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const myProfileStatistics = async (
   authUser: JwtPayload,
   query: Record<string, unknown>
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
   const { startDate, endDate } = query;
   const id = authUser.id;

   const whereCondition = {
      uploadedBy: id,
      createdAt: {
         gte: startDate ? new Date(startDate as string) : undefined,
         lte: endDate ? new Date(endDate as string) : undefined,
      },
   };

   const [videoStats, likeStats] = await Promise.all([
      prisma.video.aggregate({
         where: whereCondition,
         _sum: { viewCount: true },
         _count: { _all: true },
      }),
      prisma.engagement.count({
         where: { video: whereCondition },
      }),
   ]);

   return {
      totalViews: videoStats._sum.viewCount || 0,
      totalLikes: likeStats || 0,
      totalUploads: videoStats._count._all || 0,
   };
};

export const StatisticService = {
   myProfileStatistics,
};
