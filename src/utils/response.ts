import { type Response } from 'express';
import { StatusCodes } from 'http-status-codes';

type ResponseType = 'success' | 'error';
type ResponseData = Record<string, unknown> | null;

interface ApiResponse<T extends ResponseData> {
  type: ResponseType;
  statusCode: StatusCodes;
  message: string;
  data?: T;
}

interface ApiPaginatedResponse<T> {
  message: string;
  data: {
    items: T[];
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export function sendResponse<T extends ResponseData>(
  response: Response,
  { type, statusCode, message, data }: ApiResponse<T>
): void {
  response.status(statusCode).json({
    success: type === 'success',
    statusCode,
    message,
    data: data ?? null,
  });
}

export function sendPaginatedResponse<T>(
  response: Response,
  { data, message }: ApiPaginatedResponse<T>
) {
  response.status(StatusCodes.OK).json({
    success: true,
    statusCode: StatusCodes.OK,
    message,
    data,
  });
}

export function setUserCookie(response: Response, userId: string) {
  response.cookie('_incognito', userId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    expires: new Date('2099-12-31T23:59:59.000Z'),
  });
}

export function clearUserCookie(response: Response) {
  response.clearCookie('_incognito');
}
