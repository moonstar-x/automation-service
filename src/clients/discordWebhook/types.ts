export interface EmbedFooter {
  text: string
  icon_url?: string
}

export interface EmbedImage {
  url: string
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

export interface Embed {
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

export interface WebhookPayload {
  content?: string
  embeds?: Embed[]
}
