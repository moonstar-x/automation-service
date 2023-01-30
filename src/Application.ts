import { EventEmitter } from 'events';
import type { Workflow } from './workflow/Workflow';
import { WebhookManager, WebhookManagerOptions } from './workflow/triggers/webhook/WebhookManager';

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

  public registerWorkflow(workflow: Workflow): void {
    workflow.setup();
  }

  public registerWorkflows(workflows: Workflow[]): void {
    workflows.map((workflow) => this.registerWorkflow(workflow));
  }

  get webhookManager() {
    return this._webhookManager;
  }
}
