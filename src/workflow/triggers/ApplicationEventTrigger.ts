import { Application, ApplicationEvents } from '@application/Application';
import { Trigger } from '@workflow/Trigger';

export class ApplicationEventTrigger<T extends keyof ApplicationEvents> extends Trigger<ApplicationEvents[T]> {
  private readonly application: Application;
  private readonly event: T;

  constructor(application: Application, event: T) {
    super();
    this.application = application;
    this.event = event;
  }

  public async init(): Promise<void> {
    this.application.on(this.event, (...args: ApplicationEvents[T]) => this.emit('trigger', args));
  }
}
