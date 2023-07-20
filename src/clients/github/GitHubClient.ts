import { sameArrays } from '@utils/array';
import axios, { AxiosInstance } from 'axios';
import * as Types from './types';

const API_URL = 'https://api.github.com';

export class GitHubClient {
  private rest: AxiosInstance;

  constructor(token: string) {
    this.rest = axios.create({
      baseURL: API_URL,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });
  }

  public async getRepoData(repo: string): Promise<Types.RepoData> {
    const response = await this.rest.get(`/repos/${repo}`);
    return response.data;
  }

  public async getWeeklyCommitCountForRepo(repo: string): Promise<Types.RepoCommitCount> {
    const response = await this.rest.get(`/repos/${repo}/stats/participation`);
    return response.data;
  }

  public async getTopReferralSourcesForRepo(repo: string): Promise<Types.RepoReferrerSource[]> {
    const response = await this.rest.get(`/repos/${repo}/traffic/popular/referrers`);
    return response.data;
  }

  public async getWeeklyClonesForRepo(repo: string): Promise<Types.RepoClones> {
    const response = await this.rest.get(`/repos/${repo}/traffic/clones`, {
      params: {
        per: 'week'
      }
    });

    return response.data;
  }

  public async getWeeklyPageViewsForRepo(repo: string): Promise<Types.RepoPageViews> {
    const response = await this.rest.get(`/repos/${repo}/traffic/views`, {
      params: {
        per: 'week'
      }
    });

    return response.data;
  }

  public async postWebhookForRepo(repo: string, url: string, events: Types.WebhookEventName[]): Promise<void> {
    const webhooks = (await this.rest.get(`/repos/${repo}/hooks`)).data;

    const webhookToOverwrite = webhooks.find((hook: any) => {
      return hook.config?.url === url &&
        hook.config?.content_type === 'json' &&
        hook.config?.insecure_ssl === '1';
    });

    if (!webhookToOverwrite) {
      return await this.rest.post(`/repos/${repo}/hooks`, {
        name: 'web',
        config: {
          url,
          content_type: 'json',
          insecure_ssl: '1'
        },
        events,
        active: true
      });
    }

    if (!sameArrays(webhookToOverwrite.events, events)) {
      return await this.rest.patch(`/repos/${repo}/hooks/${webhookToOverwrite.id}`, {
        events
      });
    }
  }
}
