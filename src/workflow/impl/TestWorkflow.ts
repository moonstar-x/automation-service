import { Workflow } from '../Workflow';
import { Application } from './../../Application';
import { TimeoutTrigger } from './../triggers/TimeoutTrigger';
import { PlausibleClient } from '../../clients/PlausibleClient';
import { plausible } from '../../../config/config.json';

export class TestWorkflow extends Workflow<void> {
  private plausibleClient: PlausibleClient;

  constructor(application: Application) {
    super(application, new TimeoutTrigger(5), {
      name: 'TestWorkflow',
      description: 'Testing stuff'
    });

    this.plausibleClient = new PlausibleClient(plausible.base_url, plausible.api_key);
  }

  public async run(): Promise<void> {
    console.log(JSON.stringify(await this.plausibleClient.getWeeklyAggregateStats('moonstar-x.dev'), null, 2));
  }
}
