import { Workflow } from '../Workflow';
import { Application } from './../../Application';
import { TimeoutTrigger } from './../triggers/TimeoutTrigger';
import { levelDatabaseService } from '../../services/LevelDatabaseService';
import * as Twitter from '../../clients/twitter';
import { twitter } from '../../../config/config.json';

export class TestWorkflow extends Workflow<void> {
  private twitterClient: Twitter.ClientV1;

  constructor(application: Application) {
    super(application, new TimeoutTrigger(5), {
      name: 'TestWorkflow',
      description: 'Testing stuff'
    });

    this.twitterClient = new Twitter.ClientV1({
      appKey: twitter.api_key,
      appSecret: twitter.api_key_secret
    });
  }

  public override async setup(): Promise<void> {
    await super.setup();

    const username = 'moonstar_x99';
    const credentials = await levelDatabaseService.get<Twitter.Types.OAuthV1Tokens>(`twitter:creds:v1:${username}`);

    if (!credentials) {
      throw new Error(`No credentials found for Twitter account ${username}`);
    }

    this.twitterClient.login(credentials);
  }

  public async run(): Promise<void> {
    await this.twitterClient.tweet('Testing stuff', {
      place: {
        lat: -82.8628,
        long: 135.0000
      }
    });
  }
}
