import { sendPaginatedResponse, sendResponse } from '@/utils/response';
import rateLimit from 'express-rate-limit';
import { StatusCodes } from 'http-status-codes';

export const globalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 250, // Limit each IP to 250 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.info(`Rate limit exceeded for ip: ${req.ip}`);

    sendResponse(res, {
      type: 'error',
      statusCode: StatusCodes.TOO_MANY_REQUESTS,
      message: 'Rate limit exceeded',
    });

    sendPaginatedResponse(res, {
      message: 'Success',
      data: {
        items: [],
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 0,
      },
    });
  },
});
