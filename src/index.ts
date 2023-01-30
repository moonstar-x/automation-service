import { Application } from './Application';
import { TestWorkflow } from './workflow/impl/TestWorkflow';
import { ErrorWorkflow } from './workflow/impl/ErrorWorkflow';

const main = async () => {
  const app = new Application({
    webhookManager: {
      port: 4000
    }
  });

  app.registerWorkflows([
    new TestWorkflow(app, app.webhookManager.createTrigger('test')),
    new ErrorWorkflow(app, app.webhookManager.createTrigger('error'))
  ]);

  app.webhookManager.start();
};

main();
