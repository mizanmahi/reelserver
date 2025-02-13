import { JwtPayload } from 'jsonwebtoken';
import { prisma } from '../../database/database';

const commentOnComment = async (
   commentId: string,
   payload: { content: string },
   authUser: JwtPayload
) => {
   console.log(commentId, authUser, payload);

   const parentComment = await prisma.comment.findUniqueOrThrow({
      where: { id: commentId },
   });

   if (!parentComment.videoId) {
      throw new Error('Parent comment does not belong to a video');
   }

   return await prisma.comment.create({
      data: {
         content: payload.content,
         userId: authUser.id,
         parentCommentId: commentId,
         videoId: parentComment.videoId,
      },
   });
};
const likeAComment = async () => {};

export const CommentService = {
   commentOnComment,
   likeAComment,
};
