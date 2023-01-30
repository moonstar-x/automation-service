/* eslint-disable no-redeclare */
/* eslint-disable no-unused-vars */
import { EventEmitter } from 'events';
import { Workflow } from './workflow/Workflow';
import { Logger } from './utils/logging';
import { WebhookManager, WebhookManagerOptions } from './workflow/triggers/webhook/WebhookManager';

interface ApplicationEvents {
  workflowRegistered: [Workflow<unknown>]
  workflowStart: [Workflow<unknown>]
  workflowFinish: [Workflow<unknown>]
  workflowError: [Workflow<unknown>, Error]
}

export declare interface Application {
  on<K extends keyof ApplicationEvents>(event: K, listener: (...args: ApplicationEvents[K]) => void): this
  once<K extends keyof ApplicationEvents>(event: K, listener: (...args: ApplicationEvents[K]) => void): this
  emit<K extends keyof ApplicationEvents>(event: K, ...args: ApplicationEvents[K]): boolean
  off<K extends keyof ApplicationEvents>(event: K, listener: (...args: ApplicationEvents[K]) => void): this
  removeAllListeners<K extends keyof ApplicationEvents>(event?: K): this
}

export interface ApplicationOptions {
  webhookManager: WebhookManagerOptions
}

export class Application extends EventEmitter {
  private workflows: Map<string, Workflow<unknown>>;
  private logger: Logger;
  private _webhookManager: WebhookManager;

  constructor(options: ApplicationOptions) {
    super();
    this.workflows = new Map<string, Workflow<unknown>>();
    this.logger = new Logger('Application');
    this._webhookManager = new WebhookManager(options.webhookManager);
    this.registerEvents();
  }

  private registerEvents(): void {
    this.on('workflowRegistered', (workflow: Workflow<unknown>) => {
      this.logger.info(`Workflow ${workflow.metadata.name} has been registered.`);
    });
  }

  public registerWorkflow(workflow: Workflow<unknown>): void {
    if (this.workflows.has(workflow.metadata.name)) {
      throw new Error(`Workflow ${workflow.metadata.name} has already been registered.`);
    }

    workflow.setup();
    this.workflows.set(workflow.metadata.name, workflow);
    this.emit('workflowRegistered', workflow);
  }

  public registerWorkflows(workflows: Workflow<unknown>[]): void {
    workflows.map((workflow) => this.registerWorkflow(workflow));
  }

  get webhookManager() {
    return this._webhookManager;
  }
}
