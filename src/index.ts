import path from 'path';
import { Application } from './Application';
import { webhook_port } from '../config/config.json';

const main = async () => {
  const app = new Application({
    webhookManager: {
      port: webhook_port
    }
  });

  await app.registerWorkflowsIn(path.join(__dirname, './workflow/impl'));

  app.githubTriggerManager.start();
  app.webhookManager.start();
};

main();
