import { Workflow } from '../../Workflow';
import { Application } from './../../../Application';
import { CronTrigger } from './../../triggers/CronTrigger';
import * as Twitter from '../../../clients/twitter';
import { levelDatabaseService } from '../../../services/LevelDatabaseService';
import { fileSystemService } from '../../../services/FileSystemService';
import { randomItemFromArray } from './../../../utils/array';
import { twitter } from '../../../../config/config.json';

export class TodayIsRobotWorkflow extends Workflow<void> {
  private twitterClient: Twitter.ClientV1;

  constructor(application: Application) {
    super(application, new CronTrigger('0 8 * * *'), {
      name: 'TodayIsRobotWorkflow',
      description: 'Tweet an image daily for @TodayIsRobot'
    });

    this.twitterClient = new Twitter.ClientV1({
      appKey: twitter.api_key,
      appSecret: twitter.api_key_secret
    });
  }

  public override async setup(): Promise<void> {
    await super.setup();
    const username = 'todayisrobot';
    const credentials = await levelDatabaseService.get<Twitter.Types.OAuthV1Tokens>(`twitter:creds:v1:${username}`);

    if (!credentials) {
      throw new Error(`Twitter credentials for ${username} were not found. You may need to use the oauth/twitter/twitter-v1.ts script.`);
    }

    await this.twitterClient.login(credentials);
  }

  public async run(): Promise<void> {
    const { files } = await fileSystemService.getDirectory().goTo('today-is-robot-assets').getFiles();
    const images = files.filter((file) => file.name.match(/(\.jpg)|(\.png)$/));

    const currentDay = new Date().getDay();
    const imagesForToday = images.filter((file) => Number(file.name.charAt(0)) === currentDay);
    const randomImage = randomItemFromArray(imagesForToday);

    const mediaId = await this.twitterClient.uploadMedia(randomImage.absolutePath);
    await this.twitterClient.tweet('', {
      media_ids: mediaId,
      lat: -82.8628,
      long: 135.000
    });
  }
}
