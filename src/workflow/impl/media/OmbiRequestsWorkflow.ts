import { Workflow } from '../../Workflow';
import { Application } from '../../../Application';
import { DiscordWebhookClient, EMBED_COLORS } from '../../../clients/DiscordWebhookClient';
import { discord_webhooks } from '../../../../config/config.json';

interface TriggerPayload {

}

export class OmbiRequestsWorkflow extends Workflow<TriggerPayload> {
  private discordWebhookClient: DiscordWebhookClient;

  constructor(application: Application) {
    super(application, application.webhookManager.createTrigger('ombi'), {
      name: 'OmbiRequestsWorkflow',
      description: 'Send Ombi notifications on Discord'
    });

    this.discordWebhookClient = new DiscordWebhookClient(discord_webhooks.ombi_requests);
  }

  public async run(payload: TriggerPayload): Promise<void> {
    await this.discordWebhookClient.send({});
  }
}
