import path from 'path';
import { Application } from '@application/Application';
import { config } from '@config/config';

const main = async () => {
  const app = new Application({
    webhookManager: {
      port: config.webhook_port
    },
    twitterTriggerManager: {
      bearerToken: config.custom.twitter?.bearer_token as string,
      enabled: config.enable_twitter_trigger
    }
  });

  await app.twitterTriggerManager?.prepare();

  await app.registerWorkflowsIn(path.join(__dirname, '../workflows'));

  await app.githubTriggerManager.start();
  await app.twitterTriggerManager?.start();
  app.webhookManager.start();
};

main();
