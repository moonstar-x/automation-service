import axios from 'axios';
import * as Types from './types';

export const DEFAULT_EMBED_COLOR = 12710396;
export const DEFAULT_FOOTER: Types.EmbedFooter = {
  text: "This notification has been triggered by moonstar-x's automation service."
};
export const DEFAULT_AUTHOR: Types.EmbedAuthor = {
  name: "moonstar-x's Automation Service",
  url: 'https://github.com/moonstar-x/automation-service',
  icon_url: 'https://avatars.githubusercontent.com/u/14969195?v=4'
};

export class DiscordWebhookClient {
  private readonly webhook: string;

  constructor(webhook: string) {
    this.webhook = webhook;
  }

  public async send(payload: Types.WebhookPayload): Promise<void> {
    this.validatePayload(payload);

    const completePayload: Types.WebhookPayload = payload.embeds ?
      {
        ...payload,
        embeds: payload.embeds.map((embed) => ({
          ...embed,
          color: embed.hasOwnProperty('color') ? embed.color : DEFAULT_EMBED_COLOR,
          author: embed.hasOwnProperty('author') ? embed.author : DEFAULT_AUTHOR,
          footer: embed.hasOwnProperty('footer') ? embed.footer : DEFAULT_FOOTER
        }))
      } :
      payload;

    await axios.post(this.webhook, completePayload);
  }

  private validatePayload(payload: Types.WebhookPayload) {
    if (!payload.content && !payload.embeds) {
      throw new Error('Payload should have either content and/or embeds.');
    }
  }
}
