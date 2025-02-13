import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CommentService } from './comment.service';

const commentOnPost = catchAsync(async (req: Request, res: Response) => {
   const { postId } = req.params;
   await CommentService.commentOnPost(req.user, postId);
   sendResponse(res, {
      statusCode: 201,
      success: true,
      message: `Commented successfully`,
      data: null,
   });
});

export const CommentController = {
   commentOnPost,
};
