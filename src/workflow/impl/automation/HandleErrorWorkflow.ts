import util from 'util';
import { Workflow } from '../../Workflow';
import { Application, ApplicationEvents } from '../../../Application';
import { ApplicationEventTrigger } from '../../triggers/ApplicationEventTrigger';
import { DiscordWebhookClient } from '../../../clients/DiscordWebhookClient';
import { discord_webhooks } from '../../../../config/config.json';

const EMBED_COLOR = 16731212;

type TriggerPayload = ApplicationEvents['workflowError'];

export class HandleErrorWorkflow extends Workflow<TriggerPayload> {
  private discordWebhookClient: DiscordWebhookClient;

  constructor(application: Application) {
    super(application, new ApplicationEventTrigger(application, 'workflowError'), {
      name: 'HandleErrorWorkflow',
      description: 'Send workflow error notifications on Discord'
    });

    this.discordWebhookClient = new DiscordWebhookClient(discord_webhooks.automation_service);
  }

  public async run([workflow, error]: TriggerPayload): Promise<void> {
    if (workflow.metadata.name === this.metadata.name) {
      return; // Avoid an infinite loop.
    }

    await this.discordWebhookClient.send({
      embeds: [{
        title: `[${workflow.metadata.name}]: An error has occurred on workflow execution.`,
        description: workflow.metadata.description,
        color: EMBED_COLOR,
        fields: [{
          name: 'Error Stack',
          value: `\`\`\`${util.format(error)}\`\`\``
        }]
      }]
    });
  }
}
