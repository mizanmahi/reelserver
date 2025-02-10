import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { FollowsService } from './follows.service';

const toggleFollow = catchAsync(async (req: Request, res: Response) => {
   const { followsId } = req.params;
   const { isFollowed } = await FollowsService.toggleFollow(
      req.user,
      followsId
   );
   sendResponse(res, {
      statusCode: 201,
      success: true,
      message: `${isFollowed ? 'Followed' : 'un-followed'} successfully`,
      data: null,
   });
});

export const FollowsController = {
   toggleFollow,
};
