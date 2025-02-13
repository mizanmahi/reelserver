import { JwtPayload } from 'jsonwebtoken';

const commentOnPost = async (authUser: JwtPayload, postId: string) => {
   console.log({ authUser, postId });
};
const commentOnComment = async () => {};
const likeAComment = async () => {};

export const CommentService = {
   commentOnPost,
   commentOnComment,
   likeAComment,
};
