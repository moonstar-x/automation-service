import { TwitterApi, TwitterApiOAuth2Init, ApiResponseError, IParsedOAuth2TokenResult, PlaceV1, SendTweetV2Params } from 'twitter-api-v2';
import { Logger } from '@utils/logging';
import * as Types from './types';

export class TwitterClientV2 {
  private appCredentials: TwitterApiOAuth2Init;
  private appClient: TwitterApi;
  public userClient: TwitterApi | null;
  private logger: Logger;

  constructor(credentials: Types.TwitterClientV2Credentials) {
    this.appCredentials = {
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret
    };

    this.appClient = new TwitterApi(credentials.bearerToken);
    this.userClient = null;

    this.logger = new Logger('TwitterClientV2');
  }

  public async login(username: string, userCredentials: Types.OAuthV2Tokens, onTokenRefreshed: (token: IParsedOAuth2TokenResult) => void) {
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
    const token = await refreshClient.refreshOAuth2Token(userCredentials.refreshToken);

    this.logger.info(`Twitter credentials for ${username} have been refreshed.`);
    onTokenRefreshed(token);

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

  public async getGeoPlaceByCoordinates(lat: number, long: number): Promise<PlaceV1 | undefined> {
    const response = await this.appClient.v1.geoReverseGeoCode({ lat, long });
    return response.result.places[0];
  }

  public async tweet(message: string, options?: Types.V2CustomTweetOptions) {
    const client = this.getUserClient();

    const tweetPayload: Partial<SendTweetV2Params> = {};
    if (options?.placeId) {
      tweetPayload.geo = {
        place_id: options.placeId
      };
    }
    if (options?.mediaId) {
      tweetPayload.media = {
        media_ids: Array.isArray(options.mediaId) ? options.mediaId : [options.mediaId]
      };
    }

    const response = await client.v2.tweet(message, tweetPayload);
    return response.data;
  }

  public async retweet(tweetId: string) {
    const client = this.getUserClient();
    const currentUser = await this.getCurrentUser();

    const response = await client.v2.retweet(currentUser.id, tweetId);
    return response.data;
  }
}
