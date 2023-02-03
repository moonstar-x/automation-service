/* eslint-disable max-len */
import * as GitHub from '../../clients/github';
import { WebhookTrigger } from './WebhookTrigger';
import { Trigger } from '../Trigger';

export class GitHubTrigger extends Trigger<GitHub.Types.WebhookEvent> {
  private webhookTrigger: WebhookTrigger<GitHub.Types.WebhookEvent>;
  private client: GitHub.Client;
  private repos: string[];
  private events: GitHub.Types.WebhookEventName[];

  constructor(webhookTrigger: WebhookTrigger<GitHub.Types.WebhookEvent>, githubClientToken: string, repos: string[], events: GitHub.Types.WebhookEventName[]) {
    super();
    this.webhookTrigger = webhookTrigger;
    this.client = new GitHub.Client(githubClientToken);
    this.repos = repos;
    this.events = events;
  }

  public async init(): Promise<void> {
    await Promise.all(this.repos.map(async (repo) => {
      await this.client.postWebhookForRepo(repo, this.webhookTrigger.getUrl(), this.events);
    }));

    this.webhookTrigger.on('trigger', (data) => {
      if (!data || !('action' in data)) {
        return;
      }

      if (this.events.some((event) => data.action === event)) {
        console.log(data);
      }
      this.emit('trigger', data);
    });
  }
}

export class GitHubTriggerManager {
  private webhookTrigger: WebhookTrigger<GitHub.Types.WebhookEvent>;

  constructor(webhookTrigger: WebhookTrigger<GitHub.Types.WebhookEvent>) {
    this.webhookTrigger = webhookTrigger;
  }

  public async start(): Promise<void> {
    await this.webhookTrigger.init();
  }

  public createTrigger(githubClientToken: string, repos: string[], events: GitHub.Types.WebhookEventName[]): GitHubTrigger {
    return new GitHubTrigger(this.webhookTrigger, githubClientToken, repos, events);
  }
}
