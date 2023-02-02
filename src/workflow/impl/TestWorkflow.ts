import { Workflow } from '../Workflow';
import { Application } from './../../Application';
import { TimeoutTrigger } from './../triggers/TimeoutTrigger';
import * as DockerHub from '../../clients/dockerhub';

export class TestWorkflow extends Workflow<void> {
  private dockerHubClient: DockerHub.Client;

  constructor(application: Application) {
    super(application, new TimeoutTrigger(5), {
      name: 'TestWorkflow',
      description: 'Testing stuff'
    });

    this.dockerHubClient = new DockerHub.Client();
  }

  public async run(): Promise<void> {
    console.log(await this.dockerHubClient.getRepoData('moonstarx', 'discord-tts-bot'));
  }
}
