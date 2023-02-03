// V1 Client

export interface TwitterClientV1Credentials {
  appKey: string
  appSecret: string
}

export interface OAuthV1Tokens {
  accessToken: string
  accessSecret: string
}

export interface V1CustomTweetOptions {
  mediaId?: string | string[]
  place?: {
    lat: number
    long: number
  }
}

// V2 Client

export interface TwitterClientV2Credentials {
  clientId: string
  clientSecret: string
  bearerToken: string
}

export interface OAuthV2Tokens {
  accessToken: string
  refreshToken: string
}

export interface V2CustomTweetOptions {
  mediaId?: string | string[]
  placeId?: string
}
