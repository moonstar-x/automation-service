import { HttpError } from './errors';

export interface Response {
  message: string
  description: string
}

export const createErrorResponse = (error: HttpError): Response => {
  return {
    message: error.message,
    description: error.name
  };
};

export const createSuccessResponse = () => {
  return {
    message: 'Your request has been received.',
    description: 'A workflow has started on the automation service.'
  };
};
