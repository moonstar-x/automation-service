import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import HttpStatus from 'http-status-codes';
import { logRequests } from '@express/middleware/logging';
import { handleError } from '@express/middleware/error';
import { routeNotFound, onlySupportedMethods, jsonBodyRequired } from '@express/middleware/route';
import { verifySecret } from '@express/middleware/secret';
import { createSuccessResponse } from '@express/response';
import { Logger } from '@utils/logging';
import { Trigger } from '@workflow/Trigger';
import { config } from '@config/config';

export interface WebhookTriggerOptions {
  needsPayload?: boolean
  needsSecret?: boolean
}

export class WebhookTrigger<T> extends Trigger<T> {
  private app: Express;
  public readonly id: string;
  private options: Required<WebhookTriggerOptions>;

  constructor(app: Express, id: string, options: WebhookTriggerOptions) {
    super();
    this.app = app;
    this.id = id;

    this.options = {
      needsPayload: options.needsPayload ?? true,
      needsSecret: options.needsSecret ?? false
    };
  }

  public async init(): Promise<void> {
    this.app.route(this.getEndpoint())
      .post(verifySecret(this.options.needsSecret), jsonBodyRequired(this.options.needsPayload), (req: Request, res: Response) => {
        this.emit('trigger', req.body as T);
        res.status(HttpStatus.OK).send(createSuccessResponse());
      })
      .all(onlySupportedMethods('POST'));
  }

  private getEndpoint(): string {
    return `/webhooks/${this.id}`;
  }

  public getUrl(): string {
    return `${config.service_url}${this.getEndpoint()}`;
  }
}

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
