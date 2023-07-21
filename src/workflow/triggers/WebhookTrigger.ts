import { Express, Request, Response } from 'express';
import HttpStatus from 'http-status-codes';
import { onlySupportedMethods, jsonBodyRequired } from '@express/middleware/route';
import { verifySecret } from '@express/middleware/secret';
import { createSuccessResponse } from '@express/response';
import { Trigger } from '@workflow/Trigger';
import { config } from '@config/config';

export interface WebhookTriggerOptions {
  needsPayload?: boolean
  needsSecret?: boolean
}

export class WebhookTrigger<T> extends Trigger<T> {
  private readonly app: Express;
  public readonly id: string;
  private readonly options: Required<WebhookTriggerOptions>;

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

export class WebhookManager {
  private readonly app: Express;
  private readonly triggers: Map<string, WebhookTrigger<unknown>>;

  constructor(app: Express) {
    this.app = app;
    this.triggers = new Map<string, WebhookTrigger<unknown>>();
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
