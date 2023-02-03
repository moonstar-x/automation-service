import { Application } from '../Application';
import { Trigger } from './Trigger';
import { Logger } from './../utils/logging';
import { createExecutionTimer } from '../utils/time';

export interface WorkflowMetadata {
  name: string
  description: string
}

export abstract class Workflow<T> {
  protected application: Application;
  protected trigger: Trigger<T>;
  protected logger: Logger;
  public readonly metadata: WorkflowMetadata;

  constructor(application: Application, trigger: Trigger<T>, metadata: WorkflowMetadata) {
    this.application = application;
    this.trigger = trigger;
    this.metadata = metadata;
    this.logger = new Logger(metadata.name);
  }

  public async setup(): Promise<void> {
    await this.trigger.init();
    this.trigger.on('trigger', (payload?: T) => this.execute(payload));
  }

  public async execute(payload?: T): Promise<void> {
    try {
      this.logger.debug('Workflow has been triggered with the following payload:', payload);
      this.logger.info('Workflow is now running...');
      this.application.emit('workflowStart', this);

      const timer = createExecutionTimer();
      await this.run(payload);
      const executionDuration = timer();
      
      this.logger.info(`Workflow has finished running. (Execution took ${executionDuration.formattedDuration})`);
      this.application.emit('workflowFinish', this);
    } catch (error) {
      this.logger.error('An error has occurred when running the workflow.', error);
      this.application.emit('workflowError', this, error as Error);
    }
  }

  public abstract run(payload?: T): Promise<void>
}
