import { Express, Request, Response, NextFunction } from 'express';
import { TwitterApi } from 'twitter-api-v2';
import { UnauthorizedRequestError } from '@express/errors';
import { AbstractOAuthStrategy } from '@oauth/strategy';
import { Logger } from '@utils/logging';
import { config } from '@config/config';

const OAUTH_SCOPES = ['tweet.read', 'users.read', 'offline.access', 'tweet.write'];

interface OAuthCredentials {
  accessToken: string
  refreshToken?: string
}

interface VerifierForState {
  state: string
  codeVerifier: string
  user: string
}

export class TwitterOAuthStrategy extends AbstractOAuthStrategy<OAuthCredentials> {
  private readonly logger: Logger;
  private readonly loginClient: TwitterApi | null;
  private readonly verifierCache: Map<string, VerifierForState>;

  constructor(app: Express) {
    super(app);

    this.logger = new Logger('TwitterOAuthStrategy');
    this.verifierCache = new Map();

    this.loginClient = this.isEnabled() ? new TwitterApi({
      clientId: config.custom.twitter.client_id,
      clientSecret: config.custom.twitter.client_secret
    }) : null;
  }

  public override getName(): string {
    return 'twitter';
  }

  protected override isEnabled(): boolean {
    return !!config.custom.twitter && !!config.custom.twitter.client_id && !!config.custom.twitter.client_secret;
  }

  protected override isRequestingUserValid(user?: string): boolean {
    if (!this.isEnabled() || !user) {
      return false;
    }

    return config.custom.twitter.users.includes(user);
  }

  protected override getStoredCredentialsKeyForUser(userId: string): string {
    return `twitter:creds:v2:${userId}`;
  }

  protected override async handleInitialOAuthRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { user } = req.query as Record<string, string>;
    if (!this.isRequestingUserValid(user)) {
      return next(new UnauthorizedRequestError(`You are not authorized to authenticate against this service.`));
    }

    this.logger.info(`Received authentication request for user ${user}.`);

    const { url, codeVerifier, state } = this.loginClient!.generateOAuth2AuthLink(this.getCallbackUrl(), {
      scope: OAUTH_SCOPES
    });

    this.verifierCache.set(state, { user, state, codeVerifier });

    this.logger.info(`Redirecting ${user} to the login URL: ${url}`);
    return res.redirect(url);
  }

  protected override async handleCallbackOAuthRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { state, code } = req.query;
    const cached = this.verifierCache.get(state as string);

    if (!state || !code || !cached?.codeVerifier) {
      return next(new UnauthorizedRequestError('Authentication attempt was denied.'));
    }

    this.logger.info(`Received authentication callback request for user ${cached.user}.`);

    try {
      const { accessToken, refreshToken } = await this.loginClient!.loginWithOAuth2({
        code: code as string,
        codeVerifier: cached.codeVerifier,
        redirectUri: this.getCallbackUrl()
      });

      this.logger.info(`Successfully saved credentials for user ${cached.user}.`);
      await this.setStoredCredentialsForUser(cached.user, { accessToken, refreshToken });

      res.status(200).send('OK');
    } catch (error) {
      this.logger.error(`Could not save credentials for user ${cached.user}.`, error);
      next(new UnauthorizedRequestError('Invalid verifier or access token.'));
    }
  }
}
