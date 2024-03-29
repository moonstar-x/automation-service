import * as GitHub from '@clients/github';
import { WebhookTrigger } from '@workflow/triggers/WebhookTrigger';
import { Trigger } from '@workflow/Trigger';

export class GitHubTrigger extends Trigger<GitHub.Types.WebhookEvent> {
  private readonly webhookTrigger: WebhookTrigger<GitHub.Types.WebhookEvent>;
  private readonly client: GitHub.Client;
  private readonly repos: string[];
  private readonly events: GitHub.Types.WebhookEventName[];

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
      if (!data || !('repository' in data)) {
        return;
      }

      if (this.repos.some((repo) => data.repository?.full_name === repo)) {
        this.emit('trigger', data);
      }
    });
  }
}

export class GitHubTriggerManager {
  private readonly webhookTrigger: WebhookTrigger<GitHub.Types.WebhookEvent>;

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
