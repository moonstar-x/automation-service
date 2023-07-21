import { Request, Response, NextFunction } from 'express';
import { MethodNotAllowedError, ResourceNotFoundError, BadRequestError } from '@express/errors';

type HTTP_METHODS = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD';

export const onlySupportedMethods = (...methods: HTTP_METHODS[]) => {
  return (_: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Methods', `${methods.join(' ')} OPTIONS`);
    next(new MethodNotAllowedError());
  };
};

export const routeNotFound = (_req: Request, _res: Response, next: NextFunction) => {
  next(new ResourceNotFoundError('This route is not handled by the server.'));
};

export const jsonBodyRequired = (required: boolean) => (req: Request, _res: Response, next: NextFunction) => {
  if (!required) {
    next();
    return;
  }

  if (!req.body || Object.keys(req.body).length < 1) {
    next(new BadRequestError('A JSON body is required.'));
    return;
  }

  next();
};
