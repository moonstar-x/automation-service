import express, { Express } from 'express';
import cors from 'cors';
import { Logger } from '../../../utils/logging';
import { logRequests } from '../../../express/middleware/logging';
import { WebhookTrigger } from './WebhookTrigger';

export interface WebhookManagerOptions {
  port: number
}

export class WebhookManager {
  private options: WebhookManagerOptions;
  private app: Express;
  private logger: Logger;
  private triggers: Map<string, WebhookTrigger>;

  constructor(options: WebhookManagerOptions) {
    this.options = options;
    this.app = express();
    this.logger = new Logger('WebhookManager');
    this.triggers = new Map<string, WebhookTrigger>();
    this.registerMiddleware();
  }

  private registerMiddleware() {
    this.app.use(cors());
    this.app.use(logRequests(this.logger));
    this.app.options('*', cors());
  }

  public start() {
    this.app.listen(this.options.port, () => {
      this.logger.info(`WebhookManager started on port ${this.options.port}`);
    });
  }

  public createTrigger(name: string): WebhookTrigger {
    if (this.triggers.has(name)) {
      throw new Error(`Webhook ${name} already exists.`);
    }

    const trigger = new WebhookTrigger({ name, app: this.app });
    this.triggers.set(name, trigger);

    return trigger;
  }
}
