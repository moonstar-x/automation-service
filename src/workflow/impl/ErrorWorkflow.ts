import { Workflow } from '../Workflow';

export class ErrorWorkflow extends Workflow {
  public async run(): Promise<void> {
    throw new Error('Oops...');
  }
}
