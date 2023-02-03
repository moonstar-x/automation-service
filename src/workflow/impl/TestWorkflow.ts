import { Workflow } from '../Workflow';
import { Application } from './../../Application';
import * as GitHub from '../../clients/github';
import { github } from '../../../config/config.json';

export class TestWorkflow extends Workflow<GitHub.Types.WebhookEvent> {
  constructor(application: Application) {
    super(application, application.githubTriggerManager.createTrigger(github.token, github.repos, ['check_suite']), {
      name: 'TestWorkflow',
      description: 'Testing stuff'
    });
  }

  public async run(payload: GitHub.Types.WebhookEvent): Promise<void> {
    console.log(payload);
  }
}
