import { CronJob } from 'cron';
import { Trigger } from '../Trigger';

export class CronTrigger extends Trigger<void> {
  private cron: CronJob;

  constructor(cronExpression: string) {
    super();
    this.cron = new CronJob(cronExpression, () => this.emit('trigger'));
  }

  public init(): void {
    this.cron.start();
  }
}
