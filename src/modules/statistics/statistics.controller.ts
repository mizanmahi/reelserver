import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { StatisticService } from './statistics.service';

const myProfileStatistics = catchAsync(async (req: Request, res: Response) => {
   const result = await StatisticService.myProfileStatistics(
      req.user,
      req.query
   );
   sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Statistics retrieved successfully',
      data: result,
   });
});

export const StatisticsController = {
   myProfileStatistics,
};
