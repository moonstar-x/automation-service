import { TweetV2SingleStreamResult } from 'twitter-api-v2';
import { TwitterOAuthStrategy } from '@oauth/strategies';
import { Workflow } from '@workflow/Workflow';
import { Application } from '@application/Application';
import * as Twitter from '@clients/twitter';
import { config } from '@config/config';

export class AutoRetweetWorkflow extends Workflow<TweetV2SingleStreamResult> {
  private twitterClient: Twitter.ClientV2;

  constructor(application: Application) {
    super(application, application.twitterTriggerManager!.createTrigger(['greencoast_dev']), {
      name: 'AutoRetweetWorkflow',
      description: 'Retweet @Greencoast_Dev on @moonstar_x99'
    });

    this.twitterClient = new Twitter.ClientV2({
      clientId: config.custom.twitter.client_id,
      clientSecret: config.custom.twitter.client_secret
    });
  }

  public async preRun(): Promise<void> {
    const oauthStrategy = this.application.oauthManager.getStrategy('twitter') as TwitterOAuthStrategy;

    const username = 'moonstar_x99';
    const credentials = await oauthStrategy.getStoredCredentialsForUser(username);

    if (!credentials) {
      throw new Error(`Twitter credentials for ${username} were not found. You may need to authenticate by GET requesting: ${oauthStrategy.getAuthEndpoint()}`);
    }

    await this.twitterClient.login(username, credentials, async (token) => {
      await oauthStrategy.setStoredCredentialsForUser(username, {
        accessToken: token.accessToken,
        refreshToken: token.refreshToken
      });
    });
  }

  public async run(payload: TweetV2SingleStreamResult): Promise<void> {
    await this.preRun();

    const sentByGreencoast = payload.matching_rules.find((rule) => rule.tag === 'greencoast_dev');
    if (!sentByGreencoast) {
      return;
    }

    const { id: tweetId } = payload.data;
    await this.twitterClient.retweet(tweetId);
  }
}
