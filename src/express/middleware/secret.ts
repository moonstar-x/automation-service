import { Request, Response, NextFunction } from 'express';
import { UnauthorizedRequestError } from '../errors';
import { config } from '../../config';

export const verifySecret = (required: boolean) => (req: Request, _res: Response, next: NextFunction) => {
  if (!required) {
    next();
    return;
  }

  const [type, secret] = req.headers.authorization?.split(' ') ??
    (req.headers['access-token'] as string)?.split(' ') ??
    [null, null];

  if (type !== 'Bearer' || secret !== config.webhook_secret) {
    next(new UnauthorizedRequestError());
    return;
  }

  next();
};
