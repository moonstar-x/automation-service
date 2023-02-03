import path from 'path';
import { Application } from './Application';
import { validateConfig, BaseConfig } from './utils/config';
import config from '../config/config.json';

const main = async () => {
  validateConfig(config as unknown as BaseConfig);

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
