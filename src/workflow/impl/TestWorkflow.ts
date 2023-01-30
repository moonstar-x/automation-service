import { Workflow } from '../Workflow';

interface TriggerPayload {
  name: string
}

export class TestWorkflow extends Workflow<TriggerPayload> {
  public async run(payload?: TriggerPayload): Promise<void> {
    console.log(payload);
    console.log('Testing workflow...');
  }
}
