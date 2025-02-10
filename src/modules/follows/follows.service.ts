import { JwtPayload } from 'jsonwebtoken';
import { prisma } from '../../database/database';
import HttpError from '../../errorHandlers/HttpError';

const follow = async (authUser: JwtPayload, targetUserId: string) => {
   const [user, targetUser] = await prisma.$transaction([
      prisma.user.findUnique({ where: { id: authUser.id } }),
      prisma.user.findUnique({ where: { id: targetUserId } }),
   ]);

   if (authUser.id === targetUserId) {
      throw new HttpError(400, 'You cannot follow yourself');
   }

   if (!user) throw new HttpError(404, 'User not found');
   if (!targetUser)
      throw new HttpError(404, `User with id: ${targetUserId} not found`);

   const existingFollow = await prisma.follows.findUnique({
      where: {
         followingId_followedById: {
            followingId: targetUserId,
            followedById: authUser.id,
         },
      },
   });

   if (existingFollow) {
      throw new HttpError(400, 'You are already following this user');
   }

   await prisma.follows.create({
      data: {
         followedById: authUser.id,
         followingId: targetUserId,
      },
   });

   return {
      message: 'Followed successfully',
      isFollowed: true,
   };
};

const unfollow = async (authUser: JwtPayload, targetUserId: string) => {
   const [user, targetUser] = await prisma.$transaction([
      prisma.user.findUnique({ where: { id: authUser.id } }),
      prisma.user.findUnique({ where: { id: targetUserId } }),
   ]);

   if (authUser.id === targetUserId) {
      throw new HttpError(400, 'You cannot unfollow yourself');
   }

   if (!user) throw new HttpError(404, 'User not found');
   if (!targetUser)
      throw new HttpError(404, `User with id: ${targetUserId} not found`);

   const existingFollow = await prisma.follows.findUnique({
      where: {
         followingId_followedById: {
            followingId: targetUserId,
            followedById: authUser.id,
         },
      },
   });

   if (!existingFollow) {
      throw new HttpError(400, 'You are not following this user');
   }

   await prisma.follows.delete({
      where: {
         followingId_followedById: {
            followingId: targetUserId,
            followedById: authUser.id,
         },
      },
   });

   return {
      message: 'Un-followed successfully',
      isFollowed: false,
   };
};

export const FollowsService = {
   follow,
   unfollow,
};
