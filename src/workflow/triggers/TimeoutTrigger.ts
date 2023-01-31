/* eslint-disable no-undef */
import { Trigger, Clearable } from '../Trigger';

export class TimeoutTrigger extends Trigger<void> implements Clearable {
  private handler: NodeJS.Timeout | null;
  private timeout: number;

  constructor(timeoutSeconds: number) {
    super();
    this.handler = null;
    this.timeout = timeoutSeconds * 1000;
  }

  public init(): void {
    if (this.handler) {
      return;
    }

    this.handler = setTimeout(() => {
      this.emit('trigger');
    }, this.timeout);
  }

  public clear(): void {
    if (!this.handler) {
      return;
    }

    clearTimeout(this.handler);
    this.handler = null;
  }
}
