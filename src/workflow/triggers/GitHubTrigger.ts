import * as GitHub from '../../clients/github';
import { WebhookTrigger } from './WebhookTrigger';
import { Trigger } from '../Trigger';

export class GitHubTrigger extends Trigger<GitHub.Types.EventPayload> {
  private client: GitHub.Client;
  private repos: string[];
  private events: GitHub.Types.WebhookEvent[];
  private url: string;

  constructor(githubClientToken: string, repos: string[], events: GitHub.Types.WebhookEvent[], url: string) {
    super();
    this.client = new GitHub.Client(githubClientToken);
    this.repos = repos;
    this.events = events;
    this.url = url;
  }

  public async init(): Promise<void> {
    await Promise.all(this.repos.map(async (repo) => {
      await this.client.postWebhookForRepo(repo, this.url, this.events);
    }));
  }
}

export class GitHubTriggerManager {
  private webhookTrigger: WebhookTrigger<GitHub.Types.EventPayload>;

  constructor(webhookTrigger: WebhookTrigger<GitHub.Types.EventPayload>) {
    this.webhookTrigger = webhookTrigger;
  }

  public async start(): Promise<void> {
    await this.webhookTrigger.init();
  }

  public createTrigger(githubClientToken: string, repos: string[], events: GitHub.Types.WebhookEvent[]): GitHubTrigger {
    const trigger = new GitHubTrigger(githubClientToken, repos, events, this.webhookTrigger.getUrl());

    this.webhookTrigger.on('trigger', (data) => {
      trigger.emit('trigger', data);
    });

    return trigger;
  }
}
