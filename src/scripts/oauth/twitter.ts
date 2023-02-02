import express from 'express';
import session from 'express-session';
import { TwitterApi } from 'twitter-api-v2';
import { levelDatabaseService } from '../../services/LevelDatabaseService';
import { service_url, webhook_port, twitter } from '../../../config/config.json';

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
app.use(session({
  secret: 'super secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: 'auto'
  }
}));

const loginClient = new TwitterApi({ clientId: twitter.client_id, clientSecret: twitter.client_secret });
const callbackUrl = `${service_url}/oauth/twitter`;
const verifierCache = new Map<string, VerifierForState>();

const main = async () => {
  for (const user of twitter.users) {
    console.log(`Checking Twitter credentials for ${user}...`);
    const storedCredentials = await levelDatabaseService.get<OAuthCredentials>(`twitter:creds:${user}`);

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

app.listen(webhook_port, async () => {
  console.log(`HTTP server started on port ${webhook_port}`);
  await main();
});

