import { sendResponse } from '@/utils/response';
import { type RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

export const healthRoute: RequestHandler = (_, res) => {
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    message: 'Server is running',
    type: 'success',
  });
};
