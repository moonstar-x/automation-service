/* eslint-disable no-undef */
import { Trigger, Clearable } from '../Trigger';

export class IntervalTrigger extends Trigger<void> implements Clearable {
  private handler: NodeJS.Timer | null;
  private interval: number;

  constructor(intervalSeconds: number) {
    super();
    this.handler = null;
    this.interval = intervalSeconds * 1000;
  }

  public init(): void {
    if (this.handler) {
      return;
    }

    this.handler = setInterval(() => {
      this.emit('trigger');
    }, this.interval);
  }

  public clear(): void {
    if (!this.handler) {
      return;
    }

    clearInterval(this.handler);
    this.handler = null;
  }
}
