import { JwtPayload } from 'jsonwebtoken';
import { prisma } from '../../database/database';
import HttpError from '../../errorHandlers/HttpError';

const toggleFollow = async (authUser: JwtPayload, followsId: string) => {
   console.log({ authUser, followsId });

   const [user, followsUser] = await prisma.$transaction([
      prisma.user.findUnique({ where: { id: authUser.id } }),
      prisma.user.findUnique({ where: { id: followsId } }),
   ]);

   if (!user) throw new HttpError(404, 'User not found');
   if (!followsUser)
      throw new HttpError(404, `User with id: ${followsId} not found`);

   const existingFollow = await prisma.follows.findUnique({
      where: {
         followingId_followedById: {
            followingId: followsId,
            followedById: authUser.id,
         },
      },
   });

   if (existingFollow) {
      await prisma.follows.delete({
         where: {
            followingId_followedById: {
               followingId: followsId,
               followedById: authUser.id,
            },
         },
      });

      return {
         message: 'Un-followed successfully',
         isFollowed: false,
      };
   } else {
      await prisma.follows.create({
         data: {
            followedById: authUser.id,
            followingId: followsId,
         },
      });

      return {
         message: 'Followed successfully',
         isFollowed: true,
      };
   }
};

export const FollowsService = {
   toggleFollow,
};
