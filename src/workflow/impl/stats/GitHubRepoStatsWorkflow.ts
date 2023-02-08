/* eslint-disable max-len */
import { Workflow } from '../../Workflow';
import { Application } from './../../../Application';
import { CronTrigger } from './../../triggers/CronTrigger';
import * as GitHub from '../../../clients/github';
import * as DiscordWebhook from '../../../clients/discordWebhook';
import { levelDatabaseService } from '../../../services/LevelDatabaseService';
import { splitArrayByCount } from './../../../utils/array';
import { config } from '../../../config';

const EMBED_COLOR = 12559067;
const TOP_REFERRER_COUNT = 3;

interface CompleteRepoData {
  data: GitHub.Types.RepoData;
  commitCount: GitHub.Types.RepoCommitCount;
  topReferrals: GitHub.Types.RepoReferrerSource[];
  clones: GitHub.Types.RepoClones;
  views: GitHub.Types.RepoPageViews;
}

interface ReducedRepoData {
  description: string
  forks: number
  stars: number
  watchers: number
  commits: number
  referrers: GitHub.Types.RepoReferrerSource[]
  clones: {
    total: number
    unique: number
  },
  views: {
    total: number
    unique: number
  }
}

export class GitHubRepoStatsWorkflow extends Workflow<void> {
  private gitHubClient: GitHub.Client;
  private discordWebhookClient: DiscordWebhook.Client;

  constructor(application: Application) {
    super(application, new CronTrigger('0 20 * * 0'), {
      name: 'GitHubRepoStatsWorkflow',
      description: 'Send weekly GitHub insight reports on Discord'
    });

    this.gitHubClient = new GitHub.Client(config.custom.github.token);
    this.discordWebhookClient = new DiscordWebhook.Client(config.custom.discord_webhooks.github_stats);
  }

  public async run(): Promise<void> {
    const currentDataByRepo: Record<string, ReducedRepoData> = Object.fromEntries(await Promise.all(config.custom.github.stats_repos.map(async (repo) => {
      return [repo, this.reduceCompleteRepoData(await this.getCompleteRepoData(repo))];
    })));
    const storedDataByRepo = (await levelDatabaseService.get<Record<string, Partial<ReducedRepoData>>>('github:stats')) ?? {};
    const comparedStatsByRepo = this.getStatsComparison(storedDataByRepo, currentDataByRepo);

    await this.discordWebhookClient.send(this.getDiscordPayload(currentDataByRepo, comparedStatsByRepo));
    await levelDatabaseService.set('github:stats', currentDataByRepo);
  }

  private async getCompleteRepoData(repo: string): Promise<CompleteRepoData> {
    return {
      data: await this.gitHubClient.getRepoData(repo),
      commitCount: await this.gitHubClient.getWeeklyCommitCountForRepo(repo),
      topReferrals: await this.gitHubClient.getTopReferralSourcesForRepo(repo),
      clones: await this.gitHubClient.getWeeklyClonesForRepo(repo),
      views: await this.gitHubClient.getWeeklyPageViewsForRepo(repo)
    };
  }

  private reduceCompleteRepoData(repoData: CompleteRepoData): ReducedRepoData {
    return {
      description: repoData.data.description,
      forks: repoData.data.forks_count,
      stars: repoData.data.stargazers_count,
      watchers: repoData.data.subscribers_count,
      commits: repoData.commitCount.all.reduce((sum, cur) => sum + cur, 0),
      referrers: repoData.topReferrals.sort((a, b) => b.count - a .count).slice(0, TOP_REFERRER_COUNT),
      clones: {
        total: repoData.clones.count,
        unique: repoData.clones.uniques
      },
      views: {
        total: repoData.views.count,
        unique: repoData.views.uniques
      }
    };
  }

  private getStatsComparison(oldStats: Record<string, Partial<ReducedRepoData>>, newStats: Record<string, ReducedRepoData>): Record<string, ReducedRepoData> {
    return Object.fromEntries(Object.entries(newStats).map(([repo, newStatsForRepo]) => {
      const oldStatsForRepo = oldStats[repo];

      return [repo, {
        description: newStatsForRepo.description,
        forks: newStatsForRepo.forks - (oldStatsForRepo?.forks ?? 0),
        stars: newStatsForRepo.stars - (oldStatsForRepo?.stars ?? 0),
        watchers: newStatsForRepo.watchers - (oldStatsForRepo?.watchers ?? 0),
        commits: newStatsForRepo.commits - (oldStatsForRepo?.commits ?? 0),
        referrers: newStatsForRepo.referrers,
        clones: {
          total: newStatsForRepo.clones.total - (oldStatsForRepo?.clones?.total ?? 0),
          unique: newStatsForRepo.clones.unique - (oldStatsForRepo?.clones?.unique ?? 0)
        },
        views: {
          total: newStatsForRepo.views.total - (oldStatsForRepo?.views?.total ?? 0),
          unique: newStatsForRepo.views.unique - (oldStatsForRepo?.views?.unique ?? 0)
        }
      }];
    }));
  }

  private getDiscordPayload(currentStats: Record<string, ReducedRepoData>, statsComparison: Record<string, ReducedRepoData>): DiscordWebhook.Types.WebhookPayload {
    const splitStats = splitArrayByCount(Object.entries(currentStats), 2);
    let repoIndex = 0;

    const embeds: DiscordWebhook.Types.Embed[] = splitStats.map((split) => {
      const fieldsByRepo: DiscordWebhook.Types.EmbedField[] = split.map(([repo, current]) => {
        repoIndex++;
        const delta = statsComparison[repo];
        const referrersText = current.referrers.length > 0 ?
          current.referrers.reduce((text, cur, idx) => {
            return text.concat(`${idx + 1}. **${cur.referrer}** - Visits: **${cur.count}** [Unique: **${cur.uniques}**]\n`);
          }, '') :
          'N/A';

        return [
          { name: `${repoIndex}. Repo: ${repo}`, value: current.description, inline: false },
          { name: 'Forks', value: this.getFieldString(current.forks, delta.forks), inline: true },
          { name: 'Stars', value: this.getFieldString(current.stars, delta.stars), inline: true },
          { name: 'Watchers', value: this.getFieldString(current.watchers, delta.watchers), inline: true },
          { name: 'Commits', value: this.getFieldString(current.commits, delta.commits), inline: true },
          { name: 'Total Clones', value: this.getFieldString(current.clones.total, delta.clones.total), inline: true },
          { name: 'Unique Clones', value: this.getFieldString(current.clones.unique, delta.clones.unique), inline: true },
          { name: 'Total Views', value: this.getFieldString(current.views.total, delta.views.total), inline: true },
          { name: 'Unique Views', value: this.getFieldString(current.views.unique, delta.views.unique), inline: true },
          { name: 'Top Referrers', value: referrersText, inline: false }
        ];
      }).flat(1);


      return {
        color: EMBED_COLOR,
        author: undefined,
        footer: undefined,
        fields: [...fieldsByRepo]
      };
    });

    embeds[0] = {
      ...embeds[0],
      title: 'GitHub insights for this week',
      description: "Here's a summary of my some insights from my GitHub project repos.",
      author: {
        name: 'GitHub Stats for moonstar-x',
        url: 'https://github.com/moonstar-x',
        icon_url: 'https://avatars.githubusercontent.com/u/14969195?v=4'
      }
    };
    embeds[embeds.length - 1].footer = {
      text: "This notification has been triggered by moonstar-x's automation service. It is set to run every Sunday at night."
    };

    return {
      embeds
    };
  }

  private getFieldString(currentValue: number, deltaValue: number): string {
    return `This Week: **${currentValue}**\nDelta: **${this.getDeltaString(deltaValue)}**`;
  }

  private getDeltaString(delta: number): string {
    return delta < 0 ? `${delta} 📉` : (delta > 0 ? `+${delta} 📈` : 'Unchanged 💤');
  }
}
