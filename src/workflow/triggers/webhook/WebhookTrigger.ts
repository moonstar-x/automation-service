import { Express, Request, Response } from 'express';
import { Trigger } from '../../Trigger';

export interface WebhookTriggerOptions {
  name: string
  app: Express
}

export class WebhookTrigger extends Trigger {
  private options: WebhookTriggerOptions;

  constructor(options: WebhookTriggerOptions) {
    super();
    this.options = options;
  }

  public init(): void {
    this.options.app.post(`/webhooks/${this.options.name}`, (req: Request, res: Response) => {
      this.emit('trigger', req.body); // Type this?
      res.send('OK'); // Send with explicit code.
    });
  }

  get name() {
    return this.options.name;
  }
}
