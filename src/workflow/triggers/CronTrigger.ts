import { CronJob } from 'cron';
import { Trigger } from '../Trigger';

export class CronTrigger extends Trigger<void> {
  private cron: CronJob;

  constructor(cronExpression: string) {
    super();
    this.cron = new CronJob(cronExpression, () => this.emit('trigger'));
  }

  public async init(): Promise<void> {
    this.cron.start();
  }
}
