import express from 'express';
import { TwitterApi } from 'twitter-api-v2';
import { levelDatabaseService } from '../../../services/LevelDatabaseService';
import { config } from '../../../config';

console.warn(`This script requires you to have a special config for Twitter inside custom with the following structure:

twitter:
  api_key: string
  api_key_secret: string
  client_id: string
  client_secret: string
  bearer_token: string
  users:
    - my_account_handle

Make sure that your config has this inside custom.
`);

interface OAuthCredentials {
  accessToken: string
  refreshToken: string
}

interface VerifierForState {
  state: string
  codeVerifier: string
  user: string
}

const app = express();

const loginClient = new TwitterApi({ clientId: config.custom.twitter.client_id, clientSecret: config.custom.twitter.client_secret });
const callbackUrl = `${config.service_url}/oauth/twitter`;
const verifierCache = new Map<string, VerifierForState>();

const main = async () => {
  for (const user of config.custom.twitter.users) {
    console.log(`Checking Twitter credentials for ${user}...`);
    const storedCredentials = await levelDatabaseService.get<OAuthCredentials>(`twitter:creds:v2:${user}`);

    if (storedCredentials) {
      console.log(`Credentials found for ${user}, skipping...`);
      continue;
    }

    const { url, codeVerifier, state } = loginClient.generateOAuth2AuthLink(callbackUrl, { scope: ['tweet.read', 'users.read', 'offline.access', 'tweet.write'] });
    verifierCache.set(state, { user, state, codeVerifier });

    console.log(`Please visit as ${user} the following URL: ${url}`);
  }

  console.log('If you have logged in with all the required users you may close this script.');
};

app.get('/oauth/twitter', async (req, res) => {
  const { state, code } = req.query;
  const cached = verifierCache.get(state as string);

  if (!state || !code || !cached || !cached.codeVerifier) {
    return res.status(400).send('Denied app.');
  }

  try {
    const { accessToken, refreshToken } = await loginClient.loginWithOAuth2({
      code: code as string,
      codeVerifier: cached.codeVerifier,
      redirectUri: callbackUrl
    });

    levelDatabaseService.set(`twitter:creds:${cached.user}`, { accessToken, refreshToken });
    console.log(`Saved credentials for ${cached.user}`);
    return res.status(200).send('OK');
  } catch (error) {
    return res.status(403).send('Invalid verifier or access token.');
  }
});

app.listen(config.webhook_port, async () => {
  console.log(`HTTP server started on port ${config.webhook_port}`);
  await main();
});

