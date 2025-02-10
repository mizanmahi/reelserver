import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { FollowsService } from './follows.service';

const toggleFollow = catchAsync(async (req: Request, res: Response) => {
   const result = await FollowsService.toggleFollow(req.user);
   sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Followed successfully',
      data: result,
   });
});

export const FollowsController = {
   toggleFollow,
};
