import { Workflow } from '../Workflow';

export class TestWorkflow extends Workflow {
  public async run(): Promise<void> {
    console.log('Testing workflow...');
  }
}
