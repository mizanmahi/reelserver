import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { AnalyticsService } from './analytics.service';

const myProfileAnalytics = catchAsync(async (req: Request, res: Response) => {

    const result = await AnalyticsService.myProfileAnalytics(req.user, req.query);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Analytics retrive successfully',
        data: result
    })
});


export const AnalyticsController = {
    myProfileAnalytics
};