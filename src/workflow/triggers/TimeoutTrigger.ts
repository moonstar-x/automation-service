import { Trigger, Clearable } from '@workflow/Trigger';

export class TimeoutTrigger extends Trigger<void> implements Clearable {
  private handler: NodeJS.Timeout | null;
  private readonly timeout: number;

  constructor(timeoutSeconds: number) {
    super();
    this.handler = null;
    this.timeout = timeoutSeconds * 1000;
  }

  public async init(): Promise<void> {
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
