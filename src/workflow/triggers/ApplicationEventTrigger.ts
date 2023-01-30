import { Application, ApplicationEvents } from '../../Application';
import { Trigger } from '../Trigger';

export class ApplicationEventTrigger<T extends keyof ApplicationEvents> extends Trigger<ApplicationEvents[T]> {
  private application: Application;
  private event: T;

  constructor(application: Application, event: T) {
    super();
    this.application = application;
    this.event = event;
  }

  public init(): void {
    this.application.on(this.event, (...args: ApplicationEvents[T]) => this.emit('trigger', args));
  }
}
