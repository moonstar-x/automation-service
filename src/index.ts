import path from 'path';
import { Application } from '@application/Application';
import { config } from '@config/config';

const main = async () => {
  const app = new Application({
    httpServerOptions: {
      port: config.http_port
    },
    twitterTriggerManager: {
      bearerToken: config.custom.twitter?.bearer_token as string,
      enabled: config.enable_twitter_trigger
    }
  });

  await app.twitterTriggerManager?.prepare();

  await app.registerWorkflowsIn(path.join(path.join(process.cwd(), 'workflows')));

  await app.githubTriggerManager.start();
  await app.twitterTriggerManager?.start();
  app.httpServer.start();
};

main();
