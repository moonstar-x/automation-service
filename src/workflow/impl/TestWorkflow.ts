import { TweetV2SingleStreamResult } from 'twitter-api-v2';
import { Workflow } from '../Workflow';
import { Application } from './../../Application';
import { TwitterTrigger } from './../triggers/TwitterTrigger';
import { twitter } from '../../../config/config.json';

export class TestWorkflow extends Workflow<TweetV2SingleStreamResult> {
  constructor(application: Application) {
    super(application, new TwitterTrigger(twitter.bearer_token, ['moonstar_x99']), {
      name: 'TestWorkflow',
      description: 'Testing stuff'
    });
  }

  public async run(payload: TweetV2SingleStreamResult): Promise<void> {
    console.log(payload);
  }
}
