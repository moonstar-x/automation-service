import { Express, Request, Response } from 'express';
import HttpStatus from 'http-status-codes';
import { createSuccessResponse } from './../../../express/response';
import { onlySupportedMethods, jsonBodyRequired } from './../../../express/middleware/route';
import { Trigger } from '../../Trigger';

export interface WebhookTriggerOptions {
  name: string
  app: Express
  needsPayload?: boolean
}

export class WebhookTrigger extends Trigger {
  private options: WebhookTriggerOptions;

  constructor(options: WebhookTriggerOptions) {
    super();
    this.options = options;
  }

  public init(): void {
    this.options.app.route(`/webhooks/${this.options.name}`)
      .post(jsonBodyRequired(this.options.needsPayload ?? true), (req: Request, res: Response) => {
        this.emit('trigger', req.body); // TODO: Type this?
        res.status(HttpStatus.OK).send(createSuccessResponse());
      })
      .all(onlySupportedMethods('POST'));
  }

  get name() {
    return this.options.name;
  }
}
