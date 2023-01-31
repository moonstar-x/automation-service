import { Application } from './Application';
import * as Workflows from './workflow/impl';
import { webhook_port } from '../config/config.json';

const main = async () => {
  const app = new Application({
    webhookManager: {
      port: webhook_port
    }
  });

  app.registerWorkflows([
    new Workflows.HandleErrorWorkflow(app),

    new Workflows.OmbiRequestsWorkflow(app),
    new Workflows.TautulliNotificationsWorkflow(app),

    new Workflows.LastFmStatsWorkflow(app),
    new Workflows.NpmStatsWorkflow(app)
  ]);

  app.webhookManager.start();
};

main();
