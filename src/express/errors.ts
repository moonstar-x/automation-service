import HttpStatus from 'http-status-codes';

export class HttpError extends Error {
  private readonly _statusCode: number;
  private readonly _description: string;

  constructor(message: string, statusCode: number, description: string) {
    super(message);
    this.name = this.constructor.name;
    this._statusCode = statusCode;
    this._description = description;
  }

  get statusCode(): number {
    return this._statusCode;
  }

  get description(): string {
    return this._description;
  }
}

export class InternalServerError extends HttpError {
  constructor(message?: string) {
    super(message ?? 'An unknown error occurred.', HttpStatus.INTERNAL_SERVER_ERROR, 'Something unexpected happened when handling your request.');
  }
}

export class ResourceNotFoundError extends HttpError {
  constructor(message: string) {
    super(message, HttpStatus.NOT_FOUND, 'The requested resource was not found by the server.');
  }
}

export class UnauthorizedRequestError extends HttpError {
  constructor(message?: string) {
    super(message ?? 'A bearer token is required to access this endpoint.', HttpStatus.UNAUTHORIZED, 'Please check that you have passed the correct bearer token inside the Authentication header.');
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST, 'The server could not handle your request. Please verify that your request is correct.');
  }
}

export class MethodNotAllowedError extends HttpError {
  constructor(message?: string) {
    super(message ?? 'The server could not handle the request on this endpoint with this method.', HttpStatus.METHOD_NOT_ALLOWED, 'Check the response headers for a list of supported methods on this endpoint.');
  }
}
