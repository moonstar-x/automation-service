import express from 'express';
import session from 'express-session';
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
  accessSecret: string
}

interface VerifierForState {
  user: string
  oauthToken: string
  oauthTokenSecret: string
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

const loginClient = new TwitterApi({ appKey: config.custom.twitter.api_key, appSecret: config.custom.twitter.api_key_secret });
const callbackUrl = `${config.service_url}/oauth/twitter`;
const verifierCache = new Map<string, VerifierForState>();

const main = async () => {
  for (const user of config.custom.twitter.users) {
    console.log(`Checking Twitter credentials for ${user}...`);
    const storedCredentials = await levelDatabaseService.get<OAuthCredentials>(`twitter:creds:v1:${user}`);

    if (storedCredentials) {
      console.log(`Credentials found for ${user}, skipping...`);
      continue;
    }

    const { url, oauth_token, oauth_token_secret } = await loginClient.generateAuthLink(callbackUrl);
    verifierCache.set(oauth_token, {
      user,
      oauthToken: oauth_token,
      oauthTokenSecret: oauth_token_secret
    });

    console.log(`Please visit as ${user} the following URL: ${url}`);
  }

  console.log('If you have logged in with all the required users you may close this script.');
};

app.get('/oauth/twitter', async (req, res) => {
  const { oauth_token, oauth_verifier } = req.query;
  const cached = verifierCache.get(oauth_token as string);

  if (!oauth_token || !oauth_verifier || !cached || !cached.oauthTokenSecret) {
    return res.status(400).send('Denied app.');
  }

  try {
    const client = new TwitterApi({
      appKey: config.custom.twitter.api_key,
      appSecret: config.custom.twitter.api_key_secret,
      accessToken: oauth_token as string,
      accessSecret: cached.oauthTokenSecret as string
    });

    const { accessToken, accessSecret } = await client.login(oauth_verifier as string);

    levelDatabaseService.set(`twitter:creds:v1:${cached.user}`, { accessToken, accessSecret });
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

