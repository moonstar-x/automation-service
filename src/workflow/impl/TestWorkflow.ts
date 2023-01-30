import { Workflow } from '../Workflow';
import { Application } from './../../Application';
import { CronTrigger } from './../triggers/CronTrigger';

export class TestWorkflow extends Workflow<void> {
  constructor(application: Application, trigger: CronTrigger) {
    super(application, trigger, {
      name: 'TestWorkflow',
      description: 'A testing workflow.'
    });
  }

  public async run(): Promise<void> {
    console.log('Testing workflow...');
  }
}
