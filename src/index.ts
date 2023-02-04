import path from 'path';
import { Application } from './Application';
import { config } from './config';

const main = async () => {
  const app = new Application({
    webhookManager: {
      port: config.webhook_port
    }
  });

  await app.registerWorkflowsIn(path.join(__dirname, './workflow/impl'));

  app.githubTriggerManager.start();
  app.webhookManager.start();
};

main();
