import { Workflow } from '../Workflow';
import { Application, ApplicationEvents } from './../../Application';
import { ApplicationEventTrigger } from './../triggers/ApplicationEventTrigger';

type TriggerPayload = ApplicationEvents['workflowError'];

export class HandleErrorWorkflow extends Workflow<TriggerPayload> {
  constructor(application: Application, trigger: ApplicationEventTrigger<'workflowError'>) {
    super(application, trigger, {
      name: 'HandleErrorWorkflow',
      description: 'A workflow that notifies a Discord channel when any other workflow fails.'
    });
  }

  public async run([workflow, error]: TriggerPayload): Promise<void> {
    this.logger.warn(`Workflow ${workflow.metadata.name} has errored!`, error);
    // TODO: Implement Discord sending capabilities.
  }
}
