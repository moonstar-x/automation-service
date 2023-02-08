import { Workflow } from '../../Workflow';
import { Application } from '../../../Application';
import * as DiscordWebhook from '../../../clients/discordWebhook';
import { config } from '../../../config';

type BuildResult = 'SUCCESS' | 'FAILURE' | 'ABORTED' | 'UNSTABLE';

interface WebhookPayload {
  build_number: string
  result: BuildResult
  url: string
  job: string
}

const EMBED_COLORS: Record<BuildResult, number> = {
  SUCCESS: 448160,
  FAILURE: 15681391,
  ABORTED: 473932,
  UNSTABLE: 16765286
};
const DEFAULT_EMBED_COLOR = 7764205;

export class JenkinsNotificationWorkflow extends Workflow<WebhookPayload> {
  private discordWebhookClient: DiscordWebhook.Client;

  constructor(application: Application) {
    super(application, application.webhookManager.createTrigger('jenkins'), {
      name: 'JenkinsNotificationWorkflow',
      description: 'Send Jenkins build notifications on Discord'
    });

    this.discordWebhookClient = new DiscordWebhook.Client(config.custom.discord_webhooks.jenkins_builds);
  }

  public async run(payload: WebhookPayload): Promise<void> {
    await this.discordWebhookClient.send(this.createPayload(payload));
  }

  private createPayload(payload: WebhookPayload): DiscordWebhook.Types.WebhookPayload {
    return {
      embeds: [{
        color: EMBED_COLORS[payload.result] ?? DEFAULT_EMBED_COLOR,
        title: `[${payload.job}] - Build #${payload.build_number} ${payload.result}`,
        url: payload.url
      }]
    };
  }
}

/*
Jenkins Post-Build Script:

def post = new URL("$WEBHOOK_URL/webhooks/jenkins")>
def payload = [
  build_number: "$BUILD_NUMBER",
  result: "$BUILD_RESULT",
  url: "$BUILD_URL",
  job: "$JOB_NAME"
];
def message = groovy.json.JsonOutput.toJson(payload);

post.setRequestMethod("POST")
post.setDoOutput(true)
post.setRequestProperty("Content-Type", "application/json")
post.getOutputStream().write(message.getBytes("UTF-8"));

def postRC = post.getResponseCode();
println(postRC);
if(postRC.equals(200)) {
    println(post.getInputStream().getText());
}
*/
