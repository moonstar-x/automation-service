import { Workflow } from '@workflow/Workflow';
import { Application } from '@application/Application';
import * as DiscordWebhook from '@clients/discordWebhook';
import { ExpiringCache } from '@utils/cache';
import { config } from '@config/config';

const EMBED_COLOR = 5989555;
const CACHE_TTL = 1000 * 60 * 10; // 10 Minutes

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
  private readonly cache: ExpiringCache<string, boolean>;
  private readonly discordWebhookClient: DiscordWebhook.Client;

  constructor(application: Application) {
    super(application, application.webhookManager.createTrigger('nextcloud'), {
      name: 'NextcloudActivityWorkflow',
      description: 'Send Nextcloud activity on Discord'
    });

    this.cache = new ExpiringCache(CACHE_TTL);
    this.discordWebhookClient = new DiscordWebhook.Client(config.custom.discord_webhooks.nextcloud_activity);
  }

  public async run(payload: WebhookPayload): Promise<void> {
    const cacheKey = this.createCacheKeyForPayload(payload);

    if (!this.cache.has(cacheKey)) {
      await this.discordWebhookClient.send(this.createPayload(payload));
    }

    this.cache.set(cacheKey, true);
  }

  private createCacheKeyForPayload(payload: WebhookPayload): string {
    return `${payload.workflowFile.displayText}-${payload.workflowFile.url}`;
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
