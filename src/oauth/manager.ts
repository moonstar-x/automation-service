import { Express } from 'express';
import { AbstractOAuthStrategy } from '@oauth/strategy';
import * as strategyConstructors from '@oauth/strategies';

export class OAuthManager {
  private readonly app: Express;
  private readonly strategies: Map<string, AbstractOAuthStrategy<unknown>>;

  constructor(app: Express) {
    this.app = app;
    this.strategies = new Map();

    this.initialize();
  }

  private initialize(): void {
    Object.values(strategyConstructors).forEach((Strategy) => {
      const strategy = new Strategy(this.app);

      if (this.strategies.has(strategy.getName())) {
        throw new Error(`Duplicate OAuth strategy ${strategy.getName()} detected. Strategy names must be unique.`);
      }

      strategy.initialize();
      this.strategies.set(strategy.getName(), strategy);
    });
  }

  public getStrategy(key: string): AbstractOAuthStrategy<unknown> | null {
    return this.strategies.get(key) ?? null;
  }
}
