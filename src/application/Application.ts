import { EventEmitter } from 'events';
import { Workflow } from '@workflow/Workflow';
import { Logger } from '@utils/logging';
import { ExpressServer, ExpressServerOptions } from '@express/server';
import { OAuthManager } from '@oauth/manager';
import { WebhookManager } from '@workflow/triggers/WebhookTrigger';
import { GitHubTriggerManager } from '@workflow/triggers/GitHubTrigger';
import { TwitterTriggerManager, TwitterTriggerManagerOptions } from '@workflow/triggers/TwitterTrigger';
import { getAllFilesRecursive } from '@utils/filesystem';
import { config } from '@config/config';

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
  httpServerOptions: ExpressServerOptions
  twitterTriggerManager?: TwitterTriggerManagerOptions
}

export class Application extends EventEmitter {
  private workflows: Map<string, Workflow<unknown>>;
  private logger: Logger;

  public readonly httpServer: ExpressServer;
  public readonly oauthManager: OAuthManager;
  public readonly webhookManager: WebhookManager;
  public readonly githubTriggerManager: GitHubTriggerManager;
  public readonly twitterTriggerManager: TwitterTriggerManager | null;

  constructor(options: ApplicationOptions) {
    super();
    this.workflows = new Map<string, Workflow<unknown>>();
    this.logger = new Logger('Application');
    this.httpServer = new ExpressServer(options.httpServerOptions);
    this.oauthManager = new OAuthManager(this.httpServer.getApp());

    this.webhookManager = new WebhookManager(this.httpServer.getApp());
    this.githubTriggerManager = new GitHubTriggerManager(this.webhookManager.createTrigger('github'));
    this.twitterTriggerManager = options.twitterTriggerManager ? new TwitterTriggerManager(options.twitterTriggerManager) : null;

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

    if (config.disabled_workflows.includes(workflow.metadata.name)) {
      this.logger.warn(`Workflow ${workflow.metadata.name} is disabled.`);
      return;
    }

    await workflow.setup();
    this.workflows.set(workflow.metadata.name, workflow);
    this.emit('workflowRegistered', workflow);
  }

  public async registerWorkflows(workflows: Workflow<unknown>[]): Promise<void> {
    for (const workflow of workflows) {
      await this.registerWorkflow(workflow);
    }
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
