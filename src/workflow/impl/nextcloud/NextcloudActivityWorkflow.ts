import { Workflow } from '../../Workflow';
import { Application } from '../../../Application';
import * as DiscordWebhook from '../../../clients/discordWebhook';
import { config } from '../../../config';

const EMBED_COLOR = 5989555;

interface WebhookPayload {
  eventType: string
  eventName: string
  node: {
    id: number
    storage: {
      cache: string | null
      scanner: object
      watcher: string | null
      propagator: string | null
      updater: object
    }
    path: string
    internalPath: string
    modifiedTime: number
    mimeType: string
    size: number
    Etag: string
    permissions: number
    isUpdateable: boolean
    isDeletable: boolean
    isShareable: boolean
  },
  workflowFile: {
    displayText: string
    url: string
  }
}

export class NextcloudActivityWorkflow extends Workflow<WebhookPayload> {
  private discordWebhookClient: DiscordWebhook.Client;

  constructor(application: Application) {
    super(application, application.webhookManager.createTrigger('nextcloud'), {
      name: 'NextcloudActivityWorkflow',
      description: 'Send Nextcloud activity on Discord'
    });

    this.discordWebhookClient = new DiscordWebhook.Client(config.custom.discord_webhooks.nextcloud_activity);
  }

  public async run(payload: WebhookPayload): Promise<void> {
    await this.discordWebhookClient.send(this.createPayload(payload));
  }

  private createPayload(payload: WebhookPayload): DiscordWebhook.Types.WebhookPayload {
    return {
      embeds: [{
        color: EMBED_COLOR,
        title: payload.workflowFile.displayText,
        url: payload.workflowFile.url
      }]
    };
  }
}
