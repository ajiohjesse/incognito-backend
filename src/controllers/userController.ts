import * as userService from '@/services/userService';
import { RequestValidator } from '@/utils/requestValidator';
import { sendResponse } from '@/utils/response';
import {
  createUserSchema,
  type UserDetailsDTO,
  type UserHandshakeDTO,
} from '@/validators/userValidators';
import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

export const getUser: RequestHandler = async (req, res) => {
  const user = await userService.getUserById(res.locals.userId);
  if (!user) {
    sendResponse(res, {
      type: 'error',
      statusCode: StatusCodes.NOT_FOUND,
      message: 'User not found',
    });
    return;
  }
  sendResponse<UserDetailsDTO>(res, {
    type: 'success',
    statusCode: StatusCodes.OK,
    message: 'User details',
    data: user,
  });
};

export const createUser: RequestHandler = async (req, res, next) => {
  const { deviceFingerprint, publicKey } = RequestValidator.validateBody(
    req.body,
    createUserSchema
  );

  const user = await userService.getUserByFingerprint(deviceFingerprint);
  if (user) {
    sendResponse<UserDetailsDTO>(res, {
      type: 'success',
      statusCode: StatusCodes.OK,
      message: 'User details',
      data: user,
    });

    return;
  }

  const createdUser = await userService.createUser({
    deviceFingerprint,
    publicKey,
  });

  return sendResponse<UserDetailsDTO>(res, {
    type: 'success',
    statusCode: StatusCodes.OK,
    message: 'User details',
    data: createdUser,
  });
};

export const handshake: RequestHandler = async (req, res, next) => {
  const id = req.params.id as string;
  const user = await userService.getUserById(id);
  if (!user) {
    sendResponse(res, {
      type: 'error',
      statusCode: StatusCodes.NOT_FOUND,
      message: 'User not found',
    });
    return;
  }
  sendResponse<UserHandshakeDTO>(res, {
    type: 'success',
    statusCode: StatusCodes.OK,
    message: 'User details',
    data: {
      id: user.id,
      publicKey: user.publicKey,
      username: user.username,
    },
  });
};
