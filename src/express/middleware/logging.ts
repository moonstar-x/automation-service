import { Request, Response, NextFunction } from 'express';
import onFinished from 'on-finished';
import { Logger } from '../../utils/logging';

export const logRequests = (logger: Logger) => (req: Request, res: Response, next: NextFunction) => {
  onFinished(res, (_, res) => {
    const message = `${req.method}:${req.originalUrl} ${res.statusCode} (${req.ip})`;

    if (res.statusCode < 400) {
      return logger.info(message);
    }
    if (res.statusCode < 500) {
      return logger.warn(message);
    }

    return logger.error(message);
  });

  next();
};
