import { Workflow } from '@workflow/Workflow';
import { Application } from '@application/Application';
import * as DiscordWebhook from '@clients/discordWebhook';
import { config } from '@config/config';

const EMBED_COLOR = 15048717;

type NotificationType = 'PlaybackStart' | 'PlaybackStop' | 'PlaybackError' | 'TranscodeChange' | 'BufferWarning' | 'UpdateAvailable' | 'DatabaseCorruption';

interface ServerData {
  name: string
  platform: string
  version: string
}

interface UserData {
  name: string
  image: string
  device: string
  ip: string
  platform: string
  secure: '1' | '0'
  relayed: '1' | '0'
}

interface MediaData {
  title: string
  library: string
  poster: string
  background: string
  transcode: string
}

interface StreamData {
  user: UserData
  media: MediaData
}

interface UpdateData {
  version: string
  changelog: string
}

interface TriggerPayload {
  tracker: boolean
  notificationType: NotificationType
  plexUrl: string
  server: ServerData
  stream: StreamData
  update: {
    plex: UpdateData,
    tautulli: UpdateData
  }
}

export class TautulliNotificationsWorkflow extends Workflow<TriggerPayload> {
  private readonly discordTrackerWebhookClient: DiscordWebhook.Client;
  private readonly discordStatusWebhookClient: DiscordWebhook.Client;

  constructor(application: Application) {
    super(application, application.webhookManager.createTrigger('tautulli', { needsSecret: true }), {
      name: 'TautulliNotificationsWorkflow',
      description: 'Send Tautulli notifications on Discord'
    });

    this.discordTrackerWebhookClient = new DiscordWebhook.Client(config.custom.discord_webhooks.plex_tracker);
    this.discordStatusWebhookClient = new DiscordWebhook.Client(config.custom.discord_webhooks.plex_status);
  }

  public async run(payload: TriggerPayload): Promise<void> {
    const discordWebhookPayload = this.createPayload(payload);
    if (!discordWebhookPayload) {
      return;
    }

    if (payload.tracker) {
      return this.discordTrackerWebhookClient.send(discordWebhookPayload);
    }

    return this.discordStatusWebhookClient.send(discordWebhookPayload);
  }

  private createPayload(payload: TriggerPayload): DiscordWebhook.Types.WebhookPayload | null {
    const embed: DiscordWebhook.Types.Embed = {
      url: payload.plexUrl,
      color: EMBED_COLOR,
      footer: {
        text: `${payload.server.name} on ${payload.server.platform} - v${payload.server.version}`
      }
    };

    const playbackAuthor: DiscordWebhook.Types.EmbedAuthor = {
      name: payload.stream.user.name,
      icon_url: payload.stream.user.image
    };
    const playbackImages = {
      image: {
        url: payload.stream.media.background
      },
      thumbnail: {
        url: payload.stream.media.poster
      }
    };
    const playbackFields: DiscordWebhook.Types.EmbedField[] = [
      { name: 'Library', value: payload.stream.media.library, inline: true },
      { name: 'Transcode Decision', value: payload.stream.media.transcode, inline: true },
      { name: 'Device', value: payload.stream.user.device, inline: true },
      { name: 'Platform', value: payload.stream.user.platform, inline: true },
      { name: 'IP', value: payload.stream.user.ip, inline: true },
      { name: 'Secure', value: payload.stream.user.secure === '1' ? '✅' : '❌', inline: true },
      { name: 'Relayed', value: payload.stream.user.relayed === '1' ? '✅' : '❌', inline: true }
    ];

    if (payload.notificationType === 'PlaybackStart') {
      return {
        embeds: [{
          ...embed,
          ...playbackImages,
          title: `🟢 ${payload.stream.user.name} has started playing ${payload.stream.media.title}.`,
          author: playbackAuthor,
          fields: playbackFields
        }]
      };
    }

    if (payload.notificationType === 'PlaybackStop') {
      return {
        embeds: [{
          ...embed,
          ...playbackImages,
          title: `🔴 ${payload.stream.user.name} has stopped playing ${payload.stream.media.title}.`,
          author: playbackAuthor,
          fields: playbackFields
        }]
      };
    }

    if (payload.notificationType === 'PlaybackError') {
      return {
        embeds: [{
          ...embed,
          ...playbackImages,
          title: `⚠ ${payload.stream.user.name} has ran into an error while playing ${payload.stream.media.title}.`,
          author: playbackAuthor,
          fields: playbackFields
        }]
      };
    }

    if (payload.notificationType === 'TranscodeChange') {
      return {
        embeds: [{
          ...embed,
          ...playbackImages,
          title: `🔄 ${payload.stream.user.name} has changed the transcoding decision for ${payload.stream.media.title} to ${payload.stream.media.transcode}.`,
          author: playbackAuthor,
          fields: playbackFields
        }]
      };
    }

    if (payload.notificationType === 'BufferWarning') {
      return {
        embeds: [{
          ...embed,
          ...playbackImages,
          title: `🐌 ${payload.stream.user.name} has received a buffer warning while watching ${payload.stream.media.title}.`,
          author: playbackAuthor,
          fields: playbackFields
        }]
      };
    }

    if (payload.notificationType === 'UpdateAvailable') {
      return {
        embeds: [{
          ...embed,
          title: '🎬 A new update for Plex or Tautulli is available.',
          fields: [
            { name: 'Plex Version', value: payload.update.plex.version },
            { name: 'Plex Changelog', value: `\`\`\` ${payload.update.plex.changelog} \`\`\`` },
            { name: 'Tautulli Version', value: payload.update.tautulli.version },
            { name: 'Tautulli Changelog', value: `\`\`\` ${payload.update.tautulli.changelog} \`\`\`` }
          ]
        }]
      };
    }

    if (payload.notificationType === 'DatabaseCorruption') {
      return {
        embeds: [{
          ...embed,
          title: "❗ Tautulli's database has been corrupted!",
          description: 'Please head over to Tautulli and inspect the database.'
        }]
      };
    }

    return null;
  }
}
