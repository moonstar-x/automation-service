import { TweetV2SingleStreamResult } from 'twitter-api-v2';
import { Workflow } from '@workflow/Workflow';
import { Application } from '@application/Application';
import * as Twitter from '@clients/twitter';
import { levelDatabaseService } from '@services/LevelDatabaseService';
import { config } from '@config/config';

export class AutoRetweetWorkflow extends Workflow<TweetV2SingleStreamResult> {
  private twitterClient: Twitter.ClientV1;

  constructor(application: Application) {
    super(application, application.twitterTriggerManager!.createTrigger(['greencoast_dev']), {
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
    const sentByGreencoast = payload.matching_rules.find((rule) => rule.tag === 'greencoast_dev');
    if (!sentByGreencoast) {
      return;
    }

    const { id: tweetId } = payload.data;
    await this.twitterClient.retweet(tweetId);
  }
}
