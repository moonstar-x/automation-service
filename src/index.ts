import { Application } from './Application';
import * as WorkflowImpl from './workflow/impl';
import * as Triggers from './workflow/triggers';
import { webhook_port } from '../config/config.json';

const main = async () => {
  const app = new Application({
    webhookManager: {
      port: webhook_port
    }
  });

  app.registerWorkflows([
    new WorkflowImpl.TestWorkflow(app, new Triggers.CronTrigger('* * * * *')),
    new WorkflowImpl.HandleErrorWorkflow(app, new Triggers.ApplicationEventTrigger(app, 'workflowError')),
    new WorkflowImpl.ErrorWorkflow(app, app.webhookManager.createTrigger('error'))
  ]);

  app.webhookManager.start();
};

main();
