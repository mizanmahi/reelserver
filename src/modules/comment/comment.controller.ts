import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CommentService } from './comment.service';

const commentOnComment = catchAsync(async (req: Request, res: Response) => {
   const { commentId } = req.params;
   const result = await CommentService.commentOnComment(
      commentId,
      req.body,
      req.user
   );
   sendResponse(res, {
      statusCode: 201,
      success: true,
      message: `Replied successfully`,
      data: result,
   });
});

export const CommentController = {
   commentOnComment,
};
