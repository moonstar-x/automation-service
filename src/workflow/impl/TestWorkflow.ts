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

  public async run(): Promise<void> {
    const username = 'moonstar_x99';
    const credentials = await levelDatabaseService.get<Twitter.Types.OAuthV1Tokens>(`twitter:creds:v1:${username}`);

    if (!credentials) {
      throw new Error(`No credentials found for Twitter account ${username}`);
    }

    this.twitterClient.login(credentials);

    // await this.twitterClient.tweet('Testing stuff', {
    //   place: {
    //     lat: -82.8628,
    //     long: 135.0000
    //   }
    // });

    console.log(await this.twitterClient.retweet('1621180398528258048'));
  }
}
