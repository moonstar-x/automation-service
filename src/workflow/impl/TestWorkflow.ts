import { Workflow } from '../Workflow';
import { Application } from './../../Application';
import * as GitHub from '../../clients/github';
import { github } from '../../../config/config.json';

export class TestWorkflow extends Workflow<GitHub.Types.EventPayload> {
  constructor(application: Application) {
    super(application, application.githubTriggerManager.createTrigger(github.token, ['moonstar-x/webframes'], ['branch_protection_rule']), {
      name: 'TestWorkflow',
      description: 'Testing stuff'
    });
  }

  public async run(payload: GitHub.Types.EventPayload): Promise<void> {
    console.log(payload);
  }
}
