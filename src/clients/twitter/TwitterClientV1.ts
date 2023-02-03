import { TwitterApi, SendTweetV1Params, TweetV1 } from 'twitter-api-v2';
import * as Types from './types';

export class TwitterClientV1 {
  private appCredentials: Types.TwitterClientV1Credentials;
  public client: TwitterApi | null;

  constructor(credentials: Types.TwitterClientV1Credentials) {
    this.appCredentials = credentials;
    this.client = null;
  }

  public login(userCredentials: Types.OAuthV1Tokens) {
    this.client = new TwitterApi({
      appKey: this.appCredentials.appKey,
      appSecret: this.appCredentials.appSecret,
      accessToken: userCredentials.accessToken,
      accessSecret: userCredentials.accessSecret
    });
  }

  private getClient(): TwitterApi {
    if (!this.client) {
      throw new Error('You must call client.login() in order to use this client on behalf of the user.');
    }

    return this.client;
  }

  public async getCurrentUser() {
    const client = this.getClient();
    return await client.currentUser();
  }

  public async uploadMedia(fileLocation: string) {
    const client = this.getClient();
    return await client.v1.uploadMedia(fileLocation);
  }

  public uploadMultipleMedia(fileLocations: string[]) {
    return Promise.all(fileLocations.map((fileLocation) => this.uploadMedia(fileLocation)));
  }

  public async tweet(message: string, options?: Types.V1CustomTweetOptions) {
    const client = this.getClient();

    const tweetPayload: Partial<SendTweetV1Params> = {};
    if (options?.place) {
      tweetPayload.lat = options.place.lat;
      tweetPayload.long = options.place.long;
    }
    if (options?.mediaId) {
      tweetPayload.media_ids = options.mediaId;
    }

    return await client.v1.tweet(message, tweetPayload);
  }

  public async retweet(tweetId: string): Promise<TweetV1> {
    const client = this.getClient();
    return await client.v1.post(`statuses/retweet/${tweetId}.json`);
  }
}