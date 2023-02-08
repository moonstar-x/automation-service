/* eslint-disable max-len */
import { Workflow } from '../../Workflow';
import { Application } from './../../../Application';
import { CronTrigger } from './../../triggers/CronTrigger';
import * as Npm from '../../../clients/npm';
import * as DiscordWebhook from '../../../clients/discordWebhook';
import { levelDatabaseService } from '../../../services/LevelDatabaseService';
import { config } from '../../../config';

const EMBED_COLOR = 14777974;

export class NpmStatsWorkflow extends Workflow<void> {
  private npmClient: Npm.Client;
  private discordWebhookClient: DiscordWebhook.Client;

  constructor(application: Application) {
    super(application, new CronTrigger('0 20 * * 0'), {
      name: 'NpmStatsWorkflow',
      description: 'Send weekly NPM package stats on Discord'
    });

    this.npmClient = new Npm.Client();
    this.discordWebhookClient = new DiscordWebhook.Client(config.custom.discord_webhooks.npm_stats);
  }

  public async run(): Promise<void> {
    const packagesInfo = await this.npmClient.getMultiplePackagesInfo(config.custom.npm.packages);
    const packagesDownloads = await Promise.all(config.custom.npm.packages.map((pkg) => this.npmClient.getDownloadsInPeriodForPackage(pkg, 'last-week')));
    const downloadsByPackage = packagesDownloads.reduce((acc, download) => {
      acc[download.package] = download;
      return acc;
    }, {} as Record<string, Npm.Types.NpmPackageDownloads>);
    const downloadComparisonByPackage = await this.getDownloadsComparison(downloadsByPackage);
    
    await this.discordWebhookClient.send(this.createPayload(packagesInfo, downloadsByPackage, downloadComparisonByPackage));
    await this.persistCurrentDownloads(downloadsByPackage);
  }

  private async getDownloadsComparison(currentDownloads: Record<string, Npm.Types.NpmPackageDownloads>): Promise<Record<string, number>> {
    const previousDownloads = (await levelDatabaseService.get<Record<string, number>>('npm:downloads')) ?? {};

    return Object.fromEntries(Object.entries(currentDownloads).map(([pkg, { downloads }]) => {
      return [pkg, downloads - (previousDownloads[pkg] ?? 0)];
    }));
  }

  private async persistCurrentDownloads(currentDownloads: Record<string, Npm.Types.NpmPackageDownloads>): Promise<void> {
    const downloadsToSave = Object.fromEntries(Object.entries(currentDownloads).map(([pkg, { downloads }]) => {
      return [pkg, downloads];
    }));

    await levelDatabaseService.set('npm:downloads', downloadsToSave);
  }

  private createPayload(packagesInfo: Record<string, Npm.Types.PackageInfo>, downloadsByPackage: Record<string, Npm.Types.NpmPackageDownloads>, downloadComparison: Record<string, number>): DiscordWebhook.Types.WebhookPayload {
    const fields: DiscordWebhook.Types.EmbedField[] = Object.entries(packagesInfo).map(([pkg, info]) => {
      const downloads: Npm.Types.NpmPackageDownloads = downloadsByPackage[pkg];
      const deltaDownloads: number = downloadComparison[pkg];

      const overallScore = `${Math.floor(info.score.final * 100)}%`;
      const qualityScore = `${Math.floor(info.score.detail.quality * 100)}%`;
      const popularityScore = `${Math.floor(info.score.detail.popularity * 100)}%`;
      const maintenanceScore = `${Math.floor(info.score.detail.maintenance * 100)}%`;

      const deltaString = deltaDownloads < 0 ? `${deltaDownloads} 📉` : (deltaDownloads > 0 ? `+${deltaDownloads} 📈` : 'Unchanged 💤');

      return {
        name: `${info.collected.metadata.name}@${info.collected.metadata.version}`,
        value: `
• This Week: **${downloads.downloads}**
• Delta: **${deltaString}**
• Score: **${overallScore}** [Q: **${qualityScore}** P: **${popularityScore}** M: **${maintenanceScore}**]
• [Package Link](${info.collected.metadata.links.npm})
`
      };
    });
    
    return {
      embeds: [{
        color: EMBED_COLOR,
        author: {
          name: 'NPM Stats for moonstar-x',
          url: 'https://www.npmjs.com/~moonstar-x',
          icon_url: 'https://avatars.githubusercontent.com/u/14969195?v=4'
        },
        title: 'NPM package downloads for this week',
        description: "Here's a summary of my packages downloads for this week.",
        footer: {
          text: "This notification has been triggered by moonstar-x's automation service. It is set to run every Sunday at night."
        },
        fields: [
          ...fields,
          { name: 'Scores', value: 'Package score is separated by three criteria **Q**uality, **P**opularity and **M**aintenance. Overall score is the average of the three.' }
        ]
      }]
    };
  }
}
