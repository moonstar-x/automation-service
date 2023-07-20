import { TweetV2SingleStreamResult } from 'twitter-api-v2';
import { Workflow } from '@workflow/Workflow';
import { Application } from '@application/Application';
import * as DiscordWebhook from '@clients/discordWebhook';
import { config } from '@config/config';

export class SendTweetsToDiscordWorkflow extends Workflow<TweetV2SingleStreamResult> {
  private discordWebhookClient: DiscordWebhook.Client;

  constructor(application: Application) {
    super(application, application.twitterTriggerManager!.createTrigger(['moonstar_x99']), {
      name: 'SendTweetsToDiscordWorkflow',
      description: 'Send @moonstar_x99 tweets on Discord'
    });

    this.discordWebhookClient = new DiscordWebhook.Client(config.custom.discord_webhooks.twitter);
  }

  public async run(payload: TweetV2SingleStreamResult): Promise<void> {
    const sentByMoonstar = payload.matching_rules.find((rule) => rule.tag === 'moonstar_x99');
    if (!sentByMoonstar) {
      return;
    }

    const { id: tweetId } = payload.data;
    const tweetUrl = `https://twitter.com/moonstar_x99/status/${tweetId}`;

    await this.discordWebhookClient.send({
      content: tweetUrl
    });
  }
}
