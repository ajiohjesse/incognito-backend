import 'express';

declare global {
  namespace Express {
    interface Locals {
      userId: string;
      deviceFingerprint: string;
      username: string;
    }
  }
}
