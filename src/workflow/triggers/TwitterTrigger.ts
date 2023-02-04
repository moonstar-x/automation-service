import { TwitterApi, TweetStream, TweetV2SingleStreamResult, ETwitterStreamEvent } from 'twitter-api-v2';
import { Logger } from '../../utils/logging';
import { Trigger, Clearable } from '../Trigger';

export class TwitterTrigger extends Trigger<TweetV2SingleStreamResult> implements Clearable {
  private client: TwitterApi;
  private stream: TweetStream<TweetV2SingleStreamResult> | null;
  private usernamesToFollow: string[];
  private logger: Logger;
  private streamValue: string;

  constructor(bearerToken: string, usernamesToFollow: string[]) {
    super();
    
    if (!usernamesToFollow.length) {
      throw new Error('At least one user needs to be followed.');
    }

    this.client = new TwitterApi(bearerToken);
    this.stream = null;
    this.usernamesToFollow = usernamesToFollow;
    this.logger = new Logger('TwitterTrigger');

    this.streamValue = this.usernamesToFollow.map((username) => `from:${username}`).join(' ');
  }

  public async init(): Promise<void> {
    const currentRules = (await this.client.v2.streamRules()).data ?? [];
    const ruleForThisTrigger = currentRules.find((rule) => rule.tag === this.streamValue);

    if (!ruleForThisTrigger) {
      this.logger.debug('No rules found applicable for this trigger.');

      const setRules = await this.client.v2.updateStreamRules({
        add: [
          { value: this.streamValue, tag: this.streamValue }
        ]
      });
  
      this.logger.debug('Added the following rules:', setRules);
    }

    this.stream = await this.client.v2.searchStream({
      'user.fields': ['id', 'username'],
      'tweet.fields': ['id', 'text', 'author_id'],
      autoConnect: true
    });
    this.registerStreamEvents();
  }

  private registerStreamEvents() {
    if (!this.stream) {
      return;
    }

    this.stream.on(ETwitterStreamEvent.Data, (data) => {
      if (data.matching_rules.some((rule) => rule.tag === this.streamValue)) {
        this.emit('trigger', data);
      }
    });

    this.stream.on(ETwitterStreamEvent.DataError, (error) => {
      this.logger.error(error);
    });

    this.stream.on(ETwitterStreamEvent.TweetParseError, (error) => {
      this.logger.error(error);
    });

    this.stream.on(ETwitterStreamEvent.ConnectionError, (error) => {
      this.logger.error(error);
      this.clear();
    });

    this.stream.on(ETwitterStreamEvent.ConnectError, (error) => {
      this.logger.error(error);
      this.clear();
    });

    this.stream.on(ETwitterStreamEvent.ConnectionClosed, () => {
      this.logger.warn('Stream connection has closed.');
    });

    this.stream.on(ETwitterStreamEvent.ConnectionLost, () => {
      this.logger.warn('Stream connection has been lost.');
    });
  }

  public clear(): void {
    this.stream?.close();
    this.stream = null;
  }
}
