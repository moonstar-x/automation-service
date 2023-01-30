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

export class DiscordWebhookClient {
  private webhook: string;

  constructor(webhook: string) {
    this.webhook = webhook;
  }

  public async send(payload: DiscordWebhookPayload): Promise<void> {
    this.validatePayload(payload);
    await axios.post(this.webhook, payload);
  }

  private validatePayload(payload: DiscordWebhookPayload) {
    if (!payload.content && !payload.embeds) {
      throw new Error('Payload should have either content and/or embeds.');
    }
  }
}
