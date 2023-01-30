import { Request, Response, NextFunction } from 'express';
import HttpStatus from 'http-status-codes';
import { Logger } from '../../utils/logging';
import { HttpError, InternalServerError } from '../errors';
import { createErrorResponse } from './../response';

export const handleError = (logger: Logger) => (error: Error, _: Request, res: Response, next: NextFunction) => {
  const httpError: HttpError = error instanceof HttpError ? error : new InternalServerError(error.message);

  if (httpError.statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
    logger.error(error);
  }

  res.status(httpError.statusCode).send(createErrorResponse(httpError));
  next();
};
