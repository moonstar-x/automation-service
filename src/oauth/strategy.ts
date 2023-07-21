import { Express, Request, Response, NextFunction } from 'express';
import { onlySupportedMethods } from '@express/middleware/route';
import { levelDatabaseService } from '@services/LevelDatabaseService';
import { config } from '@config/config';

export abstract class AbstractOAuthStrategy<Credentials> {
  private readonly app: Express;

  constructor(app: Express) {
    this.app = app;
  }

  public initialize(): void {
    if (!this.isEnabled()) {
      return;
    }

    this.app.route(this.getAuthEndpoint())
      .get(this.handleInitialOAuthRequest.bind(this))
      .all(onlySupportedMethods('GET'));

    this.app.route(this.getBaseEndpoint())
      .get(this.handleCallbackOAuthRequest.bind(this))
      .all(onlySupportedMethods('GET'));
  }

  public getAuthEndpoint(): string {
    return `${this.getBaseEndpoint()}/auth`;
  }

  private getBaseEndpoint(): string {
    return `/oauth/${this.getName()}`;
  }

  public getCallbackUrl(): string {
    return `${config.service_url}${this.getBaseEndpoint()}`;
  }

  public async getStoredCredentialsForUser(userId: string): Promise<Credentials | null> {
    if (!this.isEnabled()) {
      return null;
    }

    return await levelDatabaseService.get<Credentials>(this.getStoredCredentialsKeyForUser(userId));
  }

  public async setStoredCredentialsForUser(userId: string, credentials: Credentials): Promise<void> {
    if (this.isEnabled()) {
      await levelDatabaseService.set(this.getStoredCredentialsKeyForUser(userId), credentials);
    }
  }

  public abstract getName(): string

  protected abstract isEnabled(): boolean
  protected abstract isRequestingUserValid(user?: string): boolean
  protected abstract getStoredCredentialsKeyForUser(userId: string): string

  protected abstract handleInitialOAuthRequest(req: Request, res: Response, next: NextFunction): void
  protected abstract handleCallbackOAuthRequest(req: Request, res: Response, next: NextFunction): void
}
