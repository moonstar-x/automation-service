import { Request, Response, NextFunction } from 'express';
import HttpStatus from 'http-status-codes';
import { Logger } from '@utils/logging';
import { HttpError, InternalServerError } from '@express/errors';
import { createErrorResponse } from '@express/response';

export const handleError = (logger: Logger) => (error: Error, _: Request, res: Response, next: NextFunction) => {
  const httpError: HttpError = error instanceof HttpError ? error : new InternalServerError(error.message);

  if (httpError.statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
    logger.error(error);
  } else {
    logger.warn(error);
  }

  res.status(httpError.statusCode).send(createErrorResponse(httpError));
  next();
};
