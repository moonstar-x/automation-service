import util from 'util';
import { Workflow } from '../../Workflow';
import { Application, ApplicationEvents } from '../../../Application';
import { ApplicationEventTrigger } from '../../triggers/ApplicationEventTrigger';
import * as DiscordWebhook from '../../../clients/discordWebhook';
import { discord_webhooks } from '../../../../config/config.json';

const EMBED_COLOR = 16731212;
const MAX_ERROR_STACK_SIZE = 1000;

type TriggerPayload = ApplicationEvents['workflowError'];

export class HandleErrorWorkflow extends Workflow<TriggerPayload> {
  private discordWebhookClient: DiscordWebhook.Client;

  constructor(application: Application) {
    super(application, new ApplicationEventTrigger(application, 'workflowError'), {
      name: 'HandleErrorWorkflow',
      description: 'Send workflow error notifications on Discord'
    });

    this.discordWebhookClient = new DiscordWebhook.Client(discord_webhooks.automation_service);
  }

  public async run([workflow, error]: TriggerPayload): Promise<void> {
    if (workflow.metadata.name === this.metadata.name) {
      return; // Avoid an infinite loop.
    }

    const errorStackString = util.format(error);
    const errorStackText = errorStackString.length < MAX_ERROR_STACK_SIZE ? errorStackString : `${errorStackString.slice(0, MAX_ERROR_STACK_SIZE)} [...]`;

    await this.discordWebhookClient.send({
      embeds: [{
        title: `[${workflow.metadata.name}]: An error has occurred on workflow execution.`,
        description: workflow.metadata.description,
        color: EMBED_COLOR,
        fields: [{
          name: 'Error Stack',
          value: `\`\`\`${errorStackText}\`\`\``
        }]
      }]
    });
  }
}
