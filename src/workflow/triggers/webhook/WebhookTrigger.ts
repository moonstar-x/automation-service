import { Express, Request, Response } from 'express';
import HttpStatus from 'http-status-codes';
import { createSuccessResponse } from './../../../express/response';
import { onlySupportedMethods, jsonBodyRequired } from './../../../express/middleware/route';
import { verifySecret } from './../../../express/middleware/secret';
import { Trigger } from '../../Trigger';

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

  public init(): void {
    this.app.route(`/webhooks/${this.id}`)
      .post(verifySecret(this.options.needsSecret), jsonBodyRequired(this.options.needsPayload), (req: Request, res: Response) => {
        this.emit('trigger', req.body as T);
        res.status(HttpStatus.OK).send(createSuccessResponse());
      })
      .all(onlySupportedMethods('POST'));
  }
}
