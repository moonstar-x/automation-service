import { Application } from '../Application';
import { Trigger } from './Trigger';

export abstract class Workflow {
  private application: Application;
  private trigger: Trigger;

  constructor(application: Application, trigger: Trigger) {
    this.application = application;
    this.trigger = trigger;
  }

  public setup(): void {
    this.trigger.init();
    this.trigger.on('trigger', () => this.execute());
  }

  public async execute(): Promise<void> {
    try {
      this.application.emit('workflowStart', this);
      await this.run();
      this.application.emit('workflowFinish', this);
    } catch (error) {
      this.application.emit('workflowError', this, error as Error);
    }
  }

  public abstract run(): Promise<void>
}
