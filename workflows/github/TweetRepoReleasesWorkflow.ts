import { Workflow, WorkflowMetadata } from '@workflow/Workflow';
import { Application } from '@application/Application';
import * as GitHub from '@clients/github';
import * as Twitter from '@clients/twitter';
import { config } from '@config/config';
import { TwitterOAuthStrategy } from '@oauth/strategies';

interface WorkflowOptions {
  repos: string[]
  twitterUsername: string
}

class TweetRepoReleasesWorkflow extends Workflow<GitHub.Types.WebhookEvent> {
  private options: WorkflowOptions;
  private twitterClient: Twitter.ClientV2;

  constructor(application: Application, metadata: WorkflowMetadata, options: WorkflowOptions) {
    super(
      application,
      application.githubTriggerManager.createTrigger(config.custom.github.token, options.repos, config.custom.github.events_superset),
      metadata
    );

    this.options = options;

    this.twitterClient = new Twitter.ClientV2({
      clientId: config.custom.twitter.client_id,
      clientSecret: config.custom.twitter.client_secret
    });
  }

  public async preRun(): Promise<void> {
    const oauthStrategy = this.application.oauthManager.getStrategy('twitter') as TwitterOAuthStrategy;

    const { twitterUsername: username } = this.options;
    const credentials = await oauthStrategy.getStoredCredentialsForUser(username);

    if (!credentials) {
      throw new Error(`Twitter credentials for ${username} were not found. You may need to authenticate by GET requesting: ${oauthStrategy.getAuthEndpoint()}`);
    }

    await this.twitterClient.login(username, credentials, async (token) => {
      await oauthStrategy.setStoredCredentialsForUser(username, {
        accessToken: token.accessToken,
        refreshToken: token.refreshToken
      });
    });
  }

  public async run(payload: GitHub.Types.WebhookEvent): Promise<void> {
    if (!('action' in payload) || payload.action !== 'created' || !('release' in payload)) {
      return;
    }

    await this.preRun();

    const message = `🎉 Version ${payload.release.name} has been released for ${payload.repository.full_name}. Check it out here: ${payload.release.html_url}`;
    const releaseTweet = await this.twitterClient.tweet(message);
    await this.twitterClient.reply(releaseTweet.id, Twitter.ClientV2.truncateMessage(payload.release.body));
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
