import { Workflow } from '../Workflow';
import { Application } from './../../Application';

interface TriggerPayload {
  error: string
}

export class ErrorWorkflow extends Workflow<TriggerPayload> {
  constructor(application: Application) {
    super(application, application.webhookManager.createTrigger('error'), {
      name: 'ErrorWorkflow',
      description: 'A workflow that throws an error.'
    });
  }

  public async run(payload?: TriggerPayload): Promise<void> {
    console.log(payload);
    throw new Error('Oops...');
  }
}
