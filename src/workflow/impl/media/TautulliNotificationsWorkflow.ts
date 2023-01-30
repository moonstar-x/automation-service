/* eslint-disable max-statements */
import { Workflow } from '../../Workflow';
import { Application } from '../../../Application';
import { DiscordWebhookClient, DiscordWebhookPayload, DiscordEmbed, EmbedAuthor, EmbedField, EMBED_COLORS } from '../../../clients/DiscordWebhookClient';
import { discord_webhooks } from '../../../../config/config.json';

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
  secure: 'true' | 'false'
  relayed: 'true' | 'false'
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
  type: NotificationType
  plexUrl: string
  server: ServerData
  stream: StreamData
  update: {
    plex: UpdateData,
    tautulli: UpdateData
  }
}

export class TautulliNotificationsWorkflow extends Workflow<TriggerPayload> {
  private discordTrackerWebhookClient: DiscordWebhookClient;
  private discordStatusWebhookClient: DiscordWebhookClient;

  constructor(application: Application) {
    super(application, application.webhookManager.createTrigger('tautulli', { needsSecret: true }), {
      name: 'TautulliNotificationsWorkflow',
      description: 'Send Tautulli notifications on Discord'
    });

    this.discordTrackerWebhookClient = new DiscordWebhookClient(discord_webhooks.plex_tracker);
    this.discordStatusWebhookClient = new DiscordWebhookClient(discord_webhooks.plex_status);
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

  private createPayload(payload: TriggerPayload): DiscordWebhookPayload | null {
    const embed: DiscordEmbed = {
      url: payload.plexUrl,
      color: EMBED_COLORS.orange,
      footer: {
        text: `${payload.server.name} on ${payload.server.platform} - v${payload.server.version}`
      }
    };

    const playbackAuthor: EmbedAuthor = {
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
    const playbackFields: EmbedField[] = [
      { name: 'Library', value: payload.stream.media.library, inline: true },
      { name: 'Transcode Decision', value: payload.stream.media.transcode, inline: true },
      { name: 'Device', value: payload.stream.user.device, inline: true },
      { name: 'Platform', value: payload.stream.user.platform, inline: true },
      { name: 'IP', value: payload.stream.user.ip, inline: true },
      { name: 'Secure', value: payload.stream.user.secure === 'true' ? '✅' : '❌', inline: true },
      { name: 'Relayed', value: payload.stream.user.relayed === 'true' ? '✅' : '❌', inline: true }
    ];

    if (payload.type === 'PlaybackStart') {
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

    if (payload.type === 'PlaybackStop') {
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

    if (payload.type === 'PlaybackError') {
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

    if (payload.type === 'TranscodeChange') {
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

    if (payload.type === 'BufferWarning') {
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

    if (payload.type === 'UpdateAvailable') {
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


    if (payload.type === 'DatabaseCorruption') {
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
