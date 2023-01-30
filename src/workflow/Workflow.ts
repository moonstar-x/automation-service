/* eslint-disable no-unused-vars */
import { Application } from '../Application';
import { Trigger } from './Trigger';

export abstract class Workflow<T> {
  private application: Application;
  private trigger: Trigger<T>;

  constructor(application: Application, trigger: Trigger<T>) {
    this.application = application;
    this.trigger = trigger;
  }

  public setup(): void {
    this.trigger.init();
    this.trigger.on('trigger', (payload?: T) => this.execute(payload));
  }

  public async execute(payload?: T): Promise<void> {
    try {
      this.application.emit('workflowStart', this);
      await this.run(payload);
      this.application.emit('workflowFinish', this);
    } catch (error) {
      this.application.emit('workflowError', this, error as Error);
    }
  }

  public abstract run(payload?: T): Promise<void>
}
