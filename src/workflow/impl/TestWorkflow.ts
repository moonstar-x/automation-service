import { Workflow } from '../Workflow';
import { Application } from './../../Application';
import { TimeoutTrigger } from './../triggers/TimeoutTrigger';

export class TestWorkflow extends Workflow<void> {
  constructor(application: Application) {
    super(application, new TimeoutTrigger(5), {
      name: 'TestWorkflow',
      description: 'Testing stuff'
    });
  }

  public async run(): Promise<void> {
    this.logger.info('');
  }
}
