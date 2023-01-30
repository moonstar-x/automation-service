import { Workflow } from '../Workflow';
import { Application } from './../../Application';
import { WebhookTrigger } from './../triggers/webhook/WebhookTrigger';
interface TriggerPayload {
  name: string
}

export class TestWorkflow extends Workflow<TriggerPayload> {
  constructor(application: Application, trigger: WebhookTrigger<TriggerPayload>) {
    super(application, trigger, {
      name: 'TestWorkflow',
      description: 'A testing workflow.'
    });
  }

  public async run(payload?: TriggerPayload): Promise<void> {
    console.log(payload);
    console.log('Testing workflow...');
  }
}
