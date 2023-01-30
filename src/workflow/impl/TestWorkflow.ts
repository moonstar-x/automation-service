import { Workflow } from '../Workflow';
import { Application } from './../../Application';
import { CronTrigger } from './../triggers/CronTrigger';

export class TestWorkflow extends Workflow<void> {
  constructor(application: Application) {
    super(application, new CronTrigger('* * * * *'), {
      name: 'TestWorkflow',
      description: 'Testing workflow'
    });
  }

  public async run(): Promise<void> {
    console.log('Testing workflow...');
    throw new Error('Hello.');
  }
}
