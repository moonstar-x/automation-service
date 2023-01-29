import { EventEmitter } from 'events';
import type { Workflow } from './workflow/Workflow';

export class Application extends EventEmitter {
  public async registerWorkflow(workflow: Workflow): Promise<void> {
    await workflow.setup();
  }

  public registerWorkflows(workflows: Workflow[]): Promise<void[]> {
    return Promise.all(workflows.map((workflow) => this.registerWorkflow(workflow)));
  }
}
