import express, { Express } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { logRequests } from '@express/middleware/logging';
import { routeNotFound } from '@express/middleware/route';
import { handleError } from '@express/middleware/error';
import { Logger } from '@utils/logging';

export interface ExpressServerOptions {
  port: number
}

export class ExpressServer {
  private options: ExpressServerOptions;
  private app: Express;
  private logger: Logger;

  constructor(options: ExpressServerOptions) {
    this.options = options;
    this.app = express();
    this.logger = new Logger('ExpressServer');
    this.registerMiddleware();
  }

  public getApp(): Express {
    return this.app;
  }

  private registerMiddleware() {
    this.app.use(bodyParser.json());
    this.app.use(cors());
    this.app.use(logRequests(this.logger));
    this.app.options('*', cors());
  }

  private registerLastMiddleware() {
    this.app.all('*', routeNotFound);
    this.app.use(handleError(this.logger));
  }

  public start() {
    this.registerLastMiddleware();

    this.app.listen(this.options.port, () => {
      this.logger.info(`HTTP service has started on port ${this.options.port}.`);
    });
  }
}
