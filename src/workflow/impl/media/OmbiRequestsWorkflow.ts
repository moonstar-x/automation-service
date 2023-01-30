import { Workflow } from '../../Workflow';
import { Application } from '../../../Application';
import { DiscordWebhookClient, DiscordWebhookPayload, DiscordEmbed, EMBED_COLORS } from '../../../clients/DiscordWebhookClient';
import { discord_webhooks } from '../../../../config/config.json';

type NotificationType = 'NewRequest' | 'RequestApproved' | 'RequestAvailable'

interface TriggerPayload {
  requestedUser: string,
  type: string,
  title: string,
  year: string,
  overview: string,
  posterImage: string,
  applicationName: string,
  applicationUrl: string,
  requestStatus: string,
  notificationType: NotificationType
}

export class OmbiRequestsWorkflow extends Workflow<TriggerPayload> {
  private discordWebhookClient: DiscordWebhookClient;

  constructor(application: Application) {
    super(application, application.webhookManager.createTrigger('ombi', { needsSecret: true }), {
      name: 'OmbiRequestsWorkflow',
      description: 'Send Ombi notifications on Discord'
    });

    this.discordWebhookClient = new DiscordWebhookClient(discord_webhooks.ombi_requests);
  }

  public async run(payload: TriggerPayload): Promise<void> {
    const discordWebhookPayload = this.createPayload(payload);
    if (!discordWebhookPayload) {
      return;
    }

    await this.discordWebhookClient.send(discordWebhookPayload);
  }

  private createPayload(payload: TriggerPayload): DiscordWebhookPayload | null {
    const embed: DiscordEmbed = {
      url: payload.applicationUrl,
      color: EMBED_COLORS.orange,
      image: {
        url: payload.posterImage
      },
      fields: [
        { name: 'Title', value: payload.title, inline: true },
        { name: 'Year', value: payload.year, inline: true },
        { name: 'Requested By', value: payload.requestedUser, inline: true },
        { name: 'Current Status', value: payload.requestStatus, inline: true },
        { name: 'Overview', value: payload.overview, inline: false }
      ]
    };

    if (payload.notificationType === 'NewRequest') {
      return {
        embeds: [{
          ...embed,
          title: `🛎️ ${payload.requestedUser} has requested for a ${payload.type.toLowerCase()}.`
        }]
      };
    }

    if (payload.notificationType === 'RequestApproved') {
      return {
        embeds: [{
          ...embed,
          title: `✅ ${payload.requestedUser}'s request for a ${payload.type.toLowerCase()} has been approved.`
        }]
      };
    }

    if (payload.notificationType === 'RequestAvailable') {
      return {
        embeds: [{
          ...embed,
          title: `🥳 ${payload.requestedUser}'s request for a ${payload.type.toLowerCase()} is now available.`
        }]
      };
    }

    return null;
  }
}
