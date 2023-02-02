import { Workflow } from '../Workflow';
import { Application } from './../../Application';
import { TimeoutTrigger } from './../triggers/TimeoutTrigger';
import * as GitHub from '../../clients/github';
import { github } from '../../../config/config.json';

export class TestWorkflow extends Workflow<void> {
  private githubClient: GitHub.Client;

  constructor(application: Application) {
    super(application, new TimeoutTrigger(5), {
      name: 'TestWorkflow',
      description: 'Testing stuff'
    });

    this.githubClient = new GitHub.Client(github.token);
  }

  public async run(): Promise<void> {
    console.log(await this.githubClient.getWeeklyPageViewsForRepo('moonstar-x/discord-tts-bot'));
  }
}
