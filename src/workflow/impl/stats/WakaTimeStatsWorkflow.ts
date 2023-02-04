import { Workflow } from '../../Workflow';
import { Application } from './../../../Application';
import { CronTrigger } from './../../triggers/CronTrigger';
import * as WakaTime from '../../../clients/wakatime';
import * as DiscordWebhook from '../../../clients/discordWebhook';
import { config } from '../../../config';

const EMBED_COLOR = 9093342;

export class WakaTimeStatsWorkflow extends Workflow<void> {
  private wakaTimeClient: WakaTime.Client;
  private discordWebhookClient: DiscordWebhook.Client;

  constructor(application: Application) {
    super(application, new CronTrigger('0 20 * * 0'), {
      name: 'WakaTimeStatsWorkflow',
      description: 'Send weekly WakaTime coding stats on Discord'
    });

    this.wakaTimeClient = new WakaTime.Client(config.custom.wakatime.api_key);
    this.discordWebhookClient = new DiscordWebhook.Client(config.custom.discord_webhooks.wakatime_stats);
  }

  public async run(): Promise<void> {
    const stats = await this.wakaTimeClient.getLastWeekStats();
    
    if (!stats) {
      return this.discordWebhookClient.send(this.createEmptyPayload());
    }

    return this.discordWebhookClient.send(this.createStatsPayload(stats));
  }

  private createEmptyPayload(): DiscordWebhook.Types.WebhookPayload {
    return {
      embeds: [{
        color: EMBED_COLOR,
        author: {
          name: 'Coding Stats for moonstar-x',
          url: 'https://github.com/moonstar-x',
          icon_url: 'https://avatars.githubusercontent.com/u/14969195?v=4'
        },
        title: 'Coding stats for this week',
        description: `I have not coded anything during this week. Hopefully next week will be better?`,
        image: {
          url: config.custom.wakatime.images.overall_activity
        },
        footer: {
          text: "This notification has been triggered by moonstar-x's automation service. It is set to run every sunday at night."
        }
      }]
    };
  }

  private createStatsPayload(stats: WakaTime.Types.Stats): DiscordWebhook.Types.WebhookPayload {
    return {
      embeds: [
        {
          color: EMBED_COLOR,
          author: {
            name: 'Coding Stats for moonstar-x',
            url: 'https://github.com/moonstar-x',
            icon_url: 'https://avatars.githubusercontent.com/u/14969195?v=4'
          },
          title: 'Coding stats for this week',
          fields: [
            { name: 'Total time this week:', value: `**${stats.human_readable_total}**`, inline: true },
            { name: 'Daily average:', value: `**${stats.human_readable_daily_average}**`, inline: true },
            { name: 'Best day:', value: `**${stats.best_day!.date}**`, inline: true },
            { name: 'Coding time in best day:', value: `**${stats.best_day!.text}**`, inline: true }
          ],
          image: {
            url: config.custom.wakatime.images.overall_activity
          },
          footer: undefined
        },
        {
          color: EMBED_COLOR,
          author: undefined,
          fields: [{ name: 'Projects I worked on this week:', value: this.parseTimeEntries(stats.projects) }],
          image: {
            url: config.custom.wakatime.images.coding_activity
          },
          footer: undefined
        },
        {
          color: EMBED_COLOR,
          author: undefined,
          fields: [{ name: 'Languages I used this week:', value: this.parseTimeEntries(stats.languages) }],
          image: {
            url: config.custom.wakatime.images.languages
          },
          footer: undefined
        },
        {
          color: EMBED_COLOR,
          author: undefined,
          fields: [{ name: 'Editors I used this week:', value: this.parseTimeEntries(stats.editors) }],
          image: {
            url: config.custom.wakatime.images.editors
          },
          footer: {
            text: "This notification has been triggered by moonstar-x's automation service. It is set to run every sunday at night."
          }
        }
      ]
    };
  }

  private parseTimeEntries(entries: WakaTime.Types.TimeEntry[]): string {
    return entries.sort((a, b) => b.total_seconds - a.total_seconds)
      .reduce((text, item) => {
        return text.concat(`• **${item.name}** for **${item.text}**.\n`);
      }, '');
  }
}
