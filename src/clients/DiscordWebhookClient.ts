import axios from 'axios';
export interface EmbedFooter {
  text: string
  icon_url?: string
}

export interface EmbedImage {
  url: string
}

export interface EmbedProvider {
  name?: string
  url?: string
}

export interface EmbedAuthor {
  name: string
  url?: string
  icon_url?: string
}

export interface EmbedField {
  name: string
  value: string
  inline?: boolean
}

export interface DiscordEmbed {
  title?: string
  description?: string
  url?: string
  timestamp?: string
  color?: number
  footer?: EmbedFooter
  image?: EmbedImage
  thumbnail?: EmbedImage
  author?: EmbedAuthor
  fields?: EmbedField[]
}

export interface DiscordWebhookPayload {
  content?: string
  embeds?: DiscordEmbed[]
}

export const EMBED_COLORS: Record<string, number> = {
  purple: 5652156,
  orange: 15905382,
  default: 5652156
};

export const DEFAULT_FOOTER: EmbedFooter = {
  text: "This notification has been triggered by moonstar-x's automation service.",
  icon_url: 'https://avatars.githubusercontent.com/u/14969195?v=4'
};

export class DiscordWebhookClient {
  private webhook: string;

  constructor(webhook: string) {
    this.webhook = webhook;
  }

  public async send(payload: DiscordWebhookPayload): Promise<void> {
    this.validatePayload(payload);

    const completePayload: DiscordWebhookPayload = payload.embeds ?
      {
        ...payload,
        embeds: payload.embeds.map((embed) => ({
          ...embed,
          color: embed.color ?? EMBED_COLORS.default,
          footer: embed.footer ?? DEFAULT_FOOTER
        }))
      } :
      payload;

    await axios.post(this.webhook, completePayload);
  }

  private validatePayload(payload: DiscordWebhookPayload) {
    if (!payload.content && !payload.embeds) {
      throw new Error('Payload should have either content and/or embeds.');
    }
  }
}
