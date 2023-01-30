/* eslint-disable no-redeclare */
/* eslint-disable no-unused-vars */
import { EventEmitter } from 'events';
import { Workflow } from './workflow/Workflow';
import { WebhookManager, WebhookManagerOptions } from './workflow/triggers/webhook/WebhookManager';

interface ApplicationEvents {
  workflowStart: [Workflow<any>]
  workflowFinish: [Workflow<any>]
  workflowError: [Workflow<any>, Error]
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
  private _webhookManager: WebhookManager;

  constructor(options: ApplicationOptions) {
    super();
    this._webhookManager = new WebhookManager(options.webhookManager);
    this.registerEvents();
  }

  private registerEvents() {
    this.on('workflowStart', () => console.log('started'));
    this.on('workflowFinish', () => console.log('ended'));
    this.on('workflowError', () => console.log('error'));
  }

  public registerWorkflow(workflow: Workflow<any>): void {
    workflow.setup();
  }

  public registerWorkflows(workflows: Workflow<any>[]): void {
    workflows.map((workflow) => this.registerWorkflow(workflow));
  }

  get webhookManager() {
    return this._webhookManager;
  }
}
