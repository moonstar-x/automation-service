import { Application } from '../Application';
import { Trigger } from './Trigger';
import { Logger } from './../utils/logging';

export interface WorkflowMetadata {
  name: string
  description: string
}

export abstract class Workflow<T> {
  private application: Application;
  private trigger: Trigger<T>;
  protected logger: Logger;
  private _metadata: WorkflowMetadata;

  constructor(application: Application, trigger: Trigger<T>, metadata: WorkflowMetadata) {
    this.application = application;
    this.trigger = trigger;
    this._metadata = metadata;
    this.logger = new Logger(metadata.name);
  }

  public setup(): void {
    this.trigger.init();
    this.trigger.on('trigger', (payload?: T) => this.execute(payload));
  }

  public async execute(payload?: T): Promise<void> {
    try {
      this.logger.debug('Workflow has been triggered with the following payload:', payload);
      this.logger.info('Workflow is now running...');
      this.application.emit('workflowStart', this);

      await this.run(payload);
      
      this.logger.info('Workflow has finished running.');
      this.application.emit('workflowFinish', this);
    } catch (error) {
      this.logger.error('An error has occurred when running the workflow.', error);
      this.application.emit('workflowError', this, error as Error);
    }
  }

  public abstract run(payload?: T): Promise<void>

  get metadata() {
    return this._metadata;
  }
}
