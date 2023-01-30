import { Application } from './Application';
import { TestWorkflow } from './workflow/impl/TestWorkflow';
import { ErrorWorkflow } from './workflow/impl/ErrorWorkflow';
import { webhook_port } from '../config/config.json';

const main = async () => {
  const app = new Application({
    webhookManager: {
      port: webhook_port
    }
  });

  app.registerWorkflows([
    new TestWorkflow(app, app.webhookManager.createTrigger('test')),
    new ErrorWorkflow(app, app.webhookManager.createTrigger('error'))
  ]);

  app.webhookManager.start();
};

main();
