import { TwitterApi, TwitterApiOAuth2Init, ApiResponseError, IParsedOAuth2TokenResult } from 'twitter-api-v2';
import { Logger } from '@utils/logging';
import * as Types from './types';

const MAX_TWEET_SIZE = 270;

export class TwitterClientV2 {
  private readonly appCredentials: TwitterApiOAuth2Init;
  private readonly logger: Logger;
  private userClient: TwitterApi | null;

  constructor(credentials: Types.TwitterClientV2Credentials) {
    this.appCredentials = {
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret
    };

    this.userClient = null;

    this.logger = new Logger('TwitterClientV2');
  }

  public async login(username: string, userCredentials: Types.OAuthV2Tokens, onTokenRefreshed: (token: IParsedOAuth2TokenResult) => Promise<void>) {
    this.userClient = new TwitterApi(userCredentials.accessToken);

    try {
      return await this.userClient.v2.me();
    } catch (error) {
      if (!(error instanceof ApiResponseError)) {
        throw error;
      }

      if (error.code !== 401 && error.code !== 403) {
        throw error;
      }
    }

    this.logger.warn(`Twitter credentials for ${username} may be expired. Refreshing...`);

    const refreshClient = new TwitterApi(this.appCredentials);
    const token = await refreshClient.refreshOAuth2Token(userCredentials.refreshToken!);

    this.logger.info(`Twitter credentials for ${username} have been refreshed.`);
    await onTokenRefreshed(token);

    this.userClient = new TwitterApi(token.accessToken);
    return this.userClient.v2.me();
  }

  private getUserClient(): TwitterApi {
    if (!this.userClient) {
      throw new Error('You must call client.login() in order to use this client on behalf of the user.');
    }

    return this.userClient;
  }

  public async getCurrentUser() {
    const client = this.getUserClient();
    const user = await client.v2.me();
    return user.data;
  }

  public async tweet(message: string) {
    const client = this.getUserClient();
    const response = await client.v2.tweet(message);
    return response.data;
  }

  public async reply(tweetId: string, message: string) {
    const client = this.getUserClient();
    const response = await client.v2.reply(message, tweetId);
    return response.data;
  }

  public async retweet(tweetId: string) {
    const client = this.getUserClient();
    const currentUser = await this.getCurrentUser();

    const response = await client.v2.retweet(currentUser.id, tweetId);
    return response.data;
  }

  public static truncateMessage(message: string): string {
    return message.length < MAX_TWEET_SIZE ? message : `${message.slice(0, MAX_TWEET_SIZE)} (...)`;
  }
}
