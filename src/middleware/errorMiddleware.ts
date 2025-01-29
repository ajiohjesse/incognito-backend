import { PublicError } from '@/utils/error';
import { sendResponse } from '@/utils/response';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

const notFoundHandler: RequestHandler = (_req, res) => {
  sendResponse(res, {
    type: 'error',
    statusCode: StatusCodes.NOT_FOUND,
    message: 'Resource not found',
  });
};

const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next
) => {
  if (error instanceof PublicError) {
    sendResponse(response, {
      type: 'error',
      statusCode: error.statusCode,
      message: error.message,
      data: error.data,
    });
  } else {
    console.error('Unhandled Error: --> ', error);
    sendResponse(response, {
      type: 'error',
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
    });
  }
};

export const errorMiddleware = [notFoundHandler, errorHandler];
