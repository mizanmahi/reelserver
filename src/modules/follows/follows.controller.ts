import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { FollowsService } from './follows.service';

const follow = catchAsync(async (req: Request, res: Response) => {
   const { targetUserId } = req.params;
   await FollowsService.follow(req.user, targetUserId);
   sendResponse(res, {
      statusCode: 201,
      success: true,
      message: `Followed successfully`,
      data: null,
   });
});

const unfollow = catchAsync(async (req: Request, res: Response) => {
   const { targetUserId } = req.params;
   await FollowsService.unfollow(req.user, targetUserId);
   sendResponse(res, {
      statusCode: 201,
      success: true,
      message: `Un-followed successfully`,
      data: null,
   });
});

export const FollowsController = {
   follow,
   unfollow,
};
