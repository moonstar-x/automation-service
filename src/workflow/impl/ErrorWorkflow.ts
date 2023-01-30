import { Workflow } from '../Workflow';

interface TriggerPayload {
  error: string
}

export class ErrorWorkflow extends Workflow<TriggerPayload> {
  public async run(payload?: TriggerPayload): Promise<void> {
    console.log(payload);
    throw new Error('Oops...');
  }
}
