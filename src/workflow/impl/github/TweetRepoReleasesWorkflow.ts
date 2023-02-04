import { Workflow, WorkflowMetadata } from '../../Workflow';
import { Application } from './../../../Application';
import * as GitHub from '../../../clients/github';
import * as Twitter from '../../../clients/twitter';
import { levelDatabaseService } from '../../../services/LevelDatabaseService';
import { config } from '../../../config';

interface WorkflowOptions {
  repos: string[]
  twitterUsername: string
}

class TweetRepoReleasesWorkflow extends Workflow<GitHub.Types.WebhookEvent> {
  private options: WorkflowOptions;
  private twitterClient: Twitter.ClientV1;

  constructor(application: Application, metadata: WorkflowMetadata, options: WorkflowOptions) {
    super(
      application,
      application.githubTriggerManager.createTrigger(config.custom.github.token, options.repos, config.custom.github.events_superset),
      metadata
    );

    this.options = options;

    this.twitterClient = new Twitter.ClientV1({
      appKey: config.custom.twitter.api_key,
      appSecret: config.custom.twitter.api_key_secret
    });
  }

  public override async setup(): Promise<void> {
    await super.setup();
    const { twitterUsername: username } = this.options;
    const credentials = await levelDatabaseService.get<Twitter.Types.OAuthV1Tokens>(`twitter:creds:v1:${username}`);

    if (!credentials) {
      throw new Error(`Twitter credentials for ${username} were not found. You may need to use the oauth/twitter/twitter-v1.ts script.`);
    }

    await this.twitterClient.login(credentials);
  }

  public async run(payload: GitHub.Types.WebhookEvent): Promise<void> {
    if (!('action' in payload) || payload.action !== 'created' || !('release' in payload)) {
      return;
    }

    const message = `🎉 Version ${payload.release.name} has been released for ${payload.repository.full_name}. Check it out here: ${payload.release.html_url}`;
    const releaseTweet = await this.twitterClient.tweet(message);
    await this.twitterClient.reply(Twitter.ClientV1.truncateMessage(payload.release.body), releaseTweet.id_str);
  }
}

export class MoonstarTweetRepoReleasesWorkflow extends TweetRepoReleasesWorkflow {
  constructor(application: Application) {
    super(application, {
      name: 'MoonstarTweetRepoReleasesWorkflow',
      description: 'Tweet of new moonstar-x releases on GitHub to @moonstar_x99'
    }, {
      repos: config.custom.github.release_repos['moonstar-x'],
      twitterUsername: 'moonstar_x99'
    });
  }
}

export class GreencoastStudiosTweetRepoReleasesWorkflow extends TweetRepoReleasesWorkflow {
  constructor(application: Application) {
    super(application, {
      name: 'GreencoastStudiosTweetRepoReleasesWorkflow',
      description: 'Tweet of new greencoast-studios releases on GitHub to @greencoast_dev'
    }, {
      repos: config.custom.github.release_repos['greencoast-studios'],
      twitterUsername: 'greencoast_dev'
    });
  }
}
