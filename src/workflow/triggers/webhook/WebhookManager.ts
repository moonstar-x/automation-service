import express, { Express } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { logRequests } from '../../../express/middleware/logging';
import { handleError } from '../../../express/middleware/error';
import { routeNotFound } from './../../../express/middleware/route';
import { Logger } from '../../../utils/logging';
import { WebhookTrigger, WebhookTriggerOptions } from './WebhookTrigger';

export interface WebhookManagerOptions {
  port: number
}

export class WebhookManager {
  private options: WebhookManagerOptions;
  private app: Express;
  private logger: Logger;
  private triggers: Map<string, WebhookTrigger<unknown>>;

  constructor(options: WebhookManagerOptions) {
    this.options = options;
    this.app = express();
    this.logger = new Logger('WebhookManager');
    this.triggers = new Map<string, WebhookTrigger<unknown>>();
    this.registerMiddleware();
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
      this.logger.info(`Webhook HTTP service has started on port ${this.options.port}.`);
    });
  }

  public createTrigger<T>(id: string, options: WebhookTriggerOptions = {}): WebhookTrigger<T> {
    if (this.triggers.has(id)) {
      throw new Error(`Webhook ${id} already exists.`);
    }

    const trigger = new WebhookTrigger<T>(this.app, id, options);
    this.triggers.set(id, trigger);

    return trigger;
  }
}
