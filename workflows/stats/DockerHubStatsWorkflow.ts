import { Workflow } from '@workflow/Workflow';
import { Application } from '@application/Application';
import { CronTrigger } from '@workflow/triggers/CronTrigger';
import * as DockerHub from '@clients/dockerhub';
import * as DiscordWebhook from '@clients/discordWebhook';
import { levelDatabaseService } from '@services/LevelDatabaseService';
import { config } from '@config/config';

const EMBED_COLOR = 899053;

interface ImageStats {
  stars: number
  pulls: number
}

export class DockerHubStatsWorkflow extends Workflow<void> {
  private readonly dockerHubClient: DockerHub.Client;
  private readonly discordWebhookClient: DiscordWebhook.Client;

  constructor(application: Application) {
    super(application, new CronTrigger('0 20 * * 0'), {
      name: 'DockerHubStatsWorkflow',
      description: 'Send weekly Docker Hub image stats on Discord'
    });

    this.dockerHubClient = new DockerHub.Client();
    this.discordWebhookClient = new DiscordWebhook.Client(config.custom.discord_webhooks.docker_hub_stats);
  }

  public async run(): Promise<void> {
    const statsByImage: Record<string, ImageStats> = Object.fromEntries(await Promise.all(config.custom.docker_hub.repos.map(async ({ owner, image }) => {
      const info: DockerHub.Types.RepoData = await this.dockerHubClient.getRepoData(owner, image);

      return [`${owner}/${image}`, {
        stars: info.star_count,
        pulls: info.pull_count
      }];
    })));
    const statsComparisonByImage = await this.getStatsComparison(statsByImage);

    await this.discordWebhookClient.send(this.createPayload(statsByImage, statsComparisonByImage));
    await levelDatabaseService.set('dockerhub:stats', statsByImage);
  }

  private async getStatsComparison(statsByImage: Record<string, ImageStats>): Promise<Record<string, ImageStats>> {
    const storedStats = await levelDatabaseService.get<Record<string, ImageStats>>('dockerhub:stats') ?? {};

    return Object.fromEntries(Object.entries(statsByImage).map(([image, stats]) => {
      const stored = storedStats[image] ?? {
        pulls: 0,
        stars: 0
      };

      return [image, {
        stars: stats.stars - stored.stars,
        pulls: stats.pulls - stored.pulls
      }];
    }));
  }

  private createPayload(statsByImage: Record<string, ImageStats>, statsComparisonByImage: Record<string, ImageStats>): DiscordWebhook.Types.WebhookPayload {
    const fields: DiscordWebhook.Types.EmbedField[] = Object.entries(statsByImage).map(([image, stats]) => {
      const deltaStats: ImageStats = statsComparisonByImage[image];

      return {
        name: image,
        value: `
• Pulls This Week: **${stats.pulls}**
• Pulls Delta: **${this.getStatsDeltaString(deltaStats.pulls)}**

• Stars This Week: **${stats.stars}**
• Stars Delta: **${this.getStatsDeltaString(deltaStats.stars)}**
        `
      };
    });

    return {
      embeds: [{
        color: EMBED_COLOR,
        author: {
          name: 'Docker Hub Stats for moonstar-x',
          url: 'https://fleet.moonstar-x.dev/?key=1:moonstarx',
          icon_url: 'https://avatars.githubusercontent.com/u/14969195?v=4'
        },
        title: 'Docker Hub image stats for this week',
        description: "Here's a summary of my image pulls and stars for this week.",
        footer: {
          text: "This notification has been triggered by moonstar-x's automation service. It is set to run every Sunday at night."
        },
        fields
      }]
    };
  }

  private getStatsDeltaString(delta: number): string {
    return delta < 0 ? `${delta} 📉` : (delta > 0 ? `+${delta} 📈` : 'Unchanged 💤');
  }
}
