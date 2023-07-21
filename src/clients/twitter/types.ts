export interface TwitterClientV2Credentials {
  clientId: string
  clientSecret: string
  bearerToken?: string
}

export interface OAuthV2Tokens {
  accessToken: string
  refreshToken?: string
}
