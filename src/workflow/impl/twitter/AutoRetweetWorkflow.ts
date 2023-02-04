import { TweetV2SingleStreamResult } from 'twitter-api-v2';
import { Workflow } from '../../Workflow';
import { Application } from './../../../Application';
import { TwitterTrigger } from './../../triggers/TwitterTrigger';
import * as Twitter from '../../../clients/twitter';
import { levelDatabaseService } from '../../../services/LevelDatabaseService';
import { config } from '../../../config';

export class AutoRetweetWorkflow extends Workflow<TweetV2SingleStreamResult> {
  private twitterClient: Twitter.ClientV1;

  constructor(application: Application) {
    super(application, new TwitterTrigger(config.custom.twitter.bearer_token, ['greencoast_dev']), {
      name: 'AutoRetweetWorkflow',
      description: 'Retweet @Greencoast_Dev on @moonstar_x99'
    });

    this.twitterClient = new Twitter.ClientV1({
      appKey: config.custom.twitter.api_key,
      appSecret: config.custom.twitter.api_key_secret
    });
  }

  public override async setup(): Promise<void> {
    await super.setup();
    const username = 'moonstar_x99';
    const credentials = await levelDatabaseService.get<Twitter.Types.OAuthV1Tokens>(`twitter:creds:v1:${username}`);

    if (!credentials) {
      throw new Error(`Twitter credentials for ${username} were not found. You may need to use the oauth/twitter/twitter-v1.ts script.`);
    }

    await this.twitterClient.login(credentials);
  }

  public async run(payload: TweetV2SingleStreamResult): Promise<void> {
    const { id: tweetId } = payload.data;
    await this.twitterClient.retweet(tweetId);
  }
}
