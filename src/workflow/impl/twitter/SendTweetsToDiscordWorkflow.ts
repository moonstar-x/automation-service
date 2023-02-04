import { TweetV2SingleStreamResult } from 'twitter-api-v2';
import { Workflow } from '../../Workflow';
import { Application } from './../../../Application';
import { TwitterTrigger } from './../../triggers/TwitterTrigger';
import * as DiscordWebhook from '../../../clients/discordWebhook';
import { config } from '../../../config';

export class SendTweetsToDiscordWorkflow extends Workflow<TweetV2SingleStreamResult> {
  private discordWebhookClient: DiscordWebhook.Client;

  constructor(application: Application) {
    super(application, new TwitterTrigger(config.custom.twitter.bearer_token, ['moonstar_x99']), {
      name: 'SendTweetsToDiscordWorkflow',
      description: 'Send @moonstar_x99 tweets on Discord'
    });

    this.discordWebhookClient = new DiscordWebhook.Client(config.custom.discord_webhooks.twitter);
  }

  public async run(payload: TweetV2SingleStreamResult): Promise<void> {
    const { id: tweetId } = payload.data;
    const tweetUrl = `https://twitter.com/moonstar_x99/status/${tweetId}`;

    await this.discordWebhookClient.send({
      content: tweetUrl
    });
  }
}