import { getUserByFingerprint } from '@/services/userService';
import { sendResponse } from '@/utils/response';
import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

export const authMiddleware: RequestHandler = async (req, res, next) => {
  const userId = req.cookies.userId;
  const deviceFingerprintHeader = req.headers['x-device-fingerprint'];

  if (!deviceFingerprintHeader) {
    sendResponse(res, {
      type: 'error',
      statusCode: StatusCodes.UNAUTHORIZED,
      message: 'Unauthorized',
    });
    return;
  }

  const deviceFingerprint =
    typeof deviceFingerprintHeader === 'string'
      ? deviceFingerprintHeader
      : deviceFingerprintHeader[0];

  const user = await getUserByFingerprint(deviceFingerprint);
  if (!user) {
    sendResponse(res, {
      type: 'error',
      statusCode: StatusCodes.UNAUTHORIZED,
      message: 'Account not found',
    });
    return;
  }
  res.locals.userId = user.id;
  res.locals.deviceFingerprint = user.deviceFingerprint;
  next();
  return;
};
