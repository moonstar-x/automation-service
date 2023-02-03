import { EventEmitter } from 'events';
import { Workflow } from './workflow/Workflow';
import { Logger } from './utils/logging';
import { WebhookManager, WebhookManagerOptions } from './workflow/triggers/WebhookTrigger';
import { GitHubTriggerManager } from './workflow/triggers/GitHubTrigger';
import { getAllFilesRecursive } from './utils/filesystem';

export interface ApplicationEvents {
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
  public readonly webhookManager: WebhookManager;
  public readonly githubTriggerManager: GitHubTriggerManager;

  constructor(options: ApplicationOptions) {
    super();
    this.workflows = new Map<string, Workflow<unknown>>();
    this.logger = new Logger('Application');
    this.webhookManager = new WebhookManager(options.webhookManager);
    this.githubTriggerManager = new GitHubTriggerManager(this.webhookManager.createTrigger('github'));
    this.registerEvents();
  }

  private registerEvents(): void {
    this.on('workflowRegistered', (workflow: Workflow<unknown>) => {
      this.logger.info(`Workflow ${workflow.metadata.name} has been registered.`);
    });
  }

  public async registerWorkflow(workflow: Workflow<unknown>): Promise<void> {
    if (this.workflows.has(workflow.metadata.name)) {
      throw new Error(`Workflow ${workflow.metadata.name} has already been registered.`);
    }

    await workflow.setup();
    this.workflows.set(workflow.metadata.name, workflow);
    this.emit('workflowRegistered', workflow);
  }

  public async registerWorkflows(workflows: Workflow<unknown>[]): Promise<void[]> {
    return Promise.all(workflows.map((workflow) => this.registerWorkflow(workflow)));
  }

  public async registerWorkflowsIn(absoluteDirectory: string): Promise<void> {
    const files = getAllFilesRecursive(absoluteDirectory).filter((file) => file.match(/(\.ts)|(\.js)$/));

    const workflows: Workflow<unknown>[] = (await Promise.all(files.map(async (file) => {
      const imported: Record<string, ObjectConstructor> = await import(file);

      return Object.values(imported)
        .filter((ImportedConstructor: ObjectConstructor) => {
          return ImportedConstructor.prototype instanceof Workflow;
        })
        .map((ImportedWorkflow: ObjectConstructor) => {
          return new ImportedWorkflow(this) as Workflow<unknown>;
        });
    }))).flat(1);

    await this.registerWorkflows(workflows);
  }
}
