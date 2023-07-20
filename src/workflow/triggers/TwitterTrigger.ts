import { TwitterApi, TweetStream, TweetV2SingleStreamResult, ETwitterStreamEvent } from 'twitter-api-v2';
import { Logger } from '@utils/logging';
import { Trigger } from '@workflow/Trigger';

export class TwitterTrigger extends Trigger<TweetV2SingleStreamResult> {
  private client: TwitterApi;
  private logger: Logger;
  public readonly usernamesToFollow: string[];
  private enabled: boolean;

  constructor(client: TwitterApi, enabled: boolean, usernamesToFollow: string[]) {
    super();

    if (!usernamesToFollow.length) {
      throw new Error('At least one user needs to be followed.');
    }

    this.client = client;
    this.logger = new Logger('TwitterTrigger');
    this.usernamesToFollow = usernamesToFollow;
    this.enabled = enabled;
  }

  public async init(): Promise<void> {
    if (!this.enabled) {
      throw new Error('Tried to create a TwitterTrigger when its manager is disabled.');
    }

    const currentRules = (await this.client.v2.streamRules()).data ?? [];
    const rulesForThisTrigger = currentRules.filter((rule) => this.usernamesToFollow.includes(rule.tag!));

    if (rulesForThisTrigger.length !== this.usernamesToFollow.length) {
      this.logger.debug('Some rules for this trigger are missing.');

      const missingUsernames = this.usernamesToFollow.filter((username) => !rulesForThisTrigger.find((rule) => rule.tag === username));

      const setRules = await this.client.v2.updateStreamRules({
        add: missingUsernames.map((username) => {
          return { value: `from:${username}`, tag: username };
        })
      });

      this.logger.debug('Added the following rules:', setRules);
    }
  }
}

export interface TwitterTriggerManagerOptions {
  bearerToken: string
  enabled?: boolean
}

export class TwitterTriggerManager {
  private client: TwitterApi;
  private stream: TweetStream<TweetV2SingleStreamResult> | null;
  private logger: Logger;
  private triggers: TwitterTrigger[];
  private enabled: boolean;

  constructor(options: TwitterTriggerManagerOptions) {
    this.client = new TwitterApi(options.bearerToken);
    this.stream = null;
    this.logger = new Logger('TwitterTriggerManager');
    this.triggers = [];
    this.enabled = options.enabled ?? true;
  }

  public async prepare(): Promise<void> {
    if (!this.enabled) {
      return;
    }

    const currentRules = (await this.client.v2.streamRules()).data ?? [];
    const currentRuleIds = currentRules.map((rule) => rule.id);

    if (currentRuleIds.length) {
      await this.client.v2.updateStreamRules({
        delete: {
          ids: currentRuleIds
        }
      });

      this.logger.debug('Cleared stream rules.');
    }
  }

  public async start(): Promise<void> {
    if (!this.enabled) {
      return;
    }

    this.stream = await this.client.v2.searchStream({
      'user.fields': ['id', 'username'],
      'tweet.fields': ['id', 'text', 'author_id'],
      autoConnect: true
    });
    this.registerStreamEvents();
  }

  public createTrigger(usernamesToFollow: string[]): TwitterTrigger {
    const trigger = new TwitterTrigger(this.client, this.enabled, usernamesToFollow);
    this.triggers.push(trigger);
    return trigger;
  }

  private registerStreamEvents() {
    if (!this.stream) {
      return;
    }

    this.stream.on(ETwitterStreamEvent.Data, (data) => {
      for (const trigger of this.triggers) {
        if (data.matching_rules.some((rule) => trigger.usernamesToFollow.includes(rule.tag))) {
          trigger.emit('trigger', data);
        }
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
    if (this.stream) {
      this.stream.close();
      this.stream = null;
    }
  }
}
