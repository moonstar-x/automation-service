import { Workflow } from '@workflow/Workflow';
import { Application } from '@application/Application';

export class TestWorkflow extends Workflow<void> {
  constructor(application: Application) {
    super(application, application.webhookManager.createTrigger('test', { needsSecret: false, needsPayload: false }), {
      name: 'TestWorkflow',
      description: 'Test'
    });
  }

  public async run(): Promise<void> {
    this.logger.info('Received call...');
  }
}
