import { Workflow } from '@workflow/Workflow';
import { Application } from '@application/Application';
import { CronTrigger } from '@workflow/triggers/CronTrigger';
import * as Plausible from '@clients/plausible';
import * as DiscordWebhook from '@clients/discordWebhook';
import { config } from '@config/config';

const EMBED_COLOR = 5787884;
const MAX_ITEMS_PER_BREAKDOWN = 5;

interface SiteStats {
  aggregate: Plausible.Types.Stats
  breakdown: Plausible.Types.FullBreakdown
}

export class PlausibleStatsWorkflow extends Workflow<void> {
  private plausibleClient: Plausible.Client;
  private discordWebhookClient: DiscordWebhook.Client;

  constructor(application: Application) {
    super(application, new CronTrigger('30 23 * * *'), {
      name: 'PlausibleStatsWorkflow',
      description: 'Send daily Plausible website analytics on Discord'
    });

    this.plausibleClient = new Plausible.Client(config.custom.plausible.base_url, config.custom.plausible.api_key);
    this.discordWebhookClient = new DiscordWebhook.Client(config.custom.discord_webhooks.plausible_stats);
  }

  public async run(): Promise<void> {
    const siteStats: Record<string, SiteStats> = Object.fromEntries(await Promise.all(config.custom.plausible.sites.map(async (site) => {
      return [site, {
        aggregate: await this.plausibleClient.getDailyAggregateStats(site),
        breakdown: await this.plausibleClient.getDailyBreakdown(site)
      }];
    })));

    await this.discordWebhookClient.send(this.createPayload(siteStats));
  }

  private createPayload(siteStats: Record<string, SiteStats>): DiscordWebhook.Types.WebhookPayload {
    const embeds: DiscordWebhook.Types.Embed[] = Object.entries(siteStats).map(([site, stats]) => {
      const topPagesText = stats.breakdown.top_pages.slice(0, MAX_ITEMS_PER_BREAKDOWN).reduce((text, pageBreakdown) => {
        return text.concat(`• ${pageBreakdown.page} - Visits: **${pageBreakdown.visits ?? 0}** - Visitors: **${pageBreakdown.visitors ?? 0}**\n`);
      }, '') || 'N/A';

      const topSourcesText = stats.breakdown.top_sources.slice(0, MAX_ITEMS_PER_BREAKDOWN).reduce((text, sourceBreakdown) => {
        return text.concat(`• ${sourceBreakdown.source} - Visits: **${sourceBreakdown.visits ?? 0}** - Visitors: **${sourceBreakdown.visitors ?? 0}**\n`);
      }, '') || 'N/A';

      const topCountriesText = stats.breakdown.top_countries.slice(0, MAX_ITEMS_PER_BREAKDOWN).reduce((text, countryBreakdown) => {
        return text.concat(`• :flag_${countryBreakdown.country.toLowerCase()}: - Visits: **${countryBreakdown.visits ?? 0}** - Visitors: **${countryBreakdown.visitors ?? 0}**\n`);
      }, '') || 'N/A';

      const topDevicesText = stats.breakdown.top_devices.slice(0, MAX_ITEMS_PER_BREAKDOWN).reduce((text, deviceBreakdown) => {
        return text.concat(`• ${deviceBreakdown.device} - Visits: **${deviceBreakdown.visits ?? 0}** - Visitors: **${deviceBreakdown.visitors ?? 0}**\n`);
      }, '') || 'N/A';

      return {
        color: EMBED_COLOR,
        author: undefined,
        footer: undefined,
        fields: [
          { name: 'Site URL', value: `[${site}](https://${site})`, inline: false },

          { name: 'Visits', value: `**${stats.aggregate.visits.value}** (${this.getDeltaString(stats.aggregate.visits.change)})`, inline: true },
          { name: 'Visitors', value: `**${stats.aggregate.visitors.value}** (${this.getDeltaString(stats.aggregate.visitors.change)})`, inline: true },
          { name: 'Visit Duration', value: `**${stats.aggregate.visit_duration.value}s** (${this.getDeltaString(stats.aggregate.visit_duration.change)})`, inline: true },

          { name: 'Bounce Rate', value: `**${stats.aggregate.bounce_rate.value}%** (${this.getDeltaString(stats.aggregate.bounce_rate.change)})`, inline: true },
          { name: 'Page Views', value: `**${stats.aggregate.pageviews.value}** (${this.getDeltaString(stats.aggregate.pageviews.change)})`, inline: true },

          { name: 'Top Pages', value: topPagesText, inline: false },
          { name: 'Top Sources', value: topSourcesText, inline: false },
          { name: 'Top Countries', value: topCountriesText, inline: false },
          { name: 'Top Devices', value: topDevicesText, inline: false }
        ]
      };
    });

    embeds[0] = {
      ...embeds[0],
      author: {
        name: 'Plausible Analytics for moonstar-x',
        url: 'https://analytics.moonstar-x.dev/',
        icon_url: 'https://avatars.githubusercontent.com/u/14969195?v=4'
      },
      title: "Today's analytics for my websites",
      description: "Here's a summary of my websites' analytics for today."
    };
    embeds[embeds.length - 1].footer = {
      text: "This notification has been triggered by moonstar-x's automation service. It is set to run everyday at night."
    };

    return {
      embeds
    };
  }

  private getDeltaString(delta: number): string {
    return delta < 0 ? `${delta}% 📉` : (delta > 0 ? `+${delta}% 📈` : '0% 💤');
  }
}
