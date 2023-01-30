import { Workflow } from '../Workflow';
import { Application } from './../../Application';
import { WebhookTrigger } from './../triggers/webhook/WebhookTrigger';

interface TriggerPayload {
  error: string
}

export class ErrorWorkflow extends Workflow<TriggerPayload> {
  constructor(application: Application, trigger: WebhookTrigger<TriggerPayload>) {
    super(application, trigger, {
      name: 'ErrorWorkflow',
      description: 'A workflow that throws an error.'
    });
  }

  public async run(payload?: TriggerPayload): Promise<void> {
    console.log(payload);
    throw new Error('Oops...');
  }
}
