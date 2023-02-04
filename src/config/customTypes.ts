import * as GitHub from '../clients/github';

export interface CustomConfig {
  discord_webhooks: {
    automation_service: string
    ombi_requests: string
    plex_tracker: string
    plex_status: string
    last_fm_stats: string
    npm_stats: string
    wakatime_stats: string
    github_stats: string
    league_of_legends_stats_personal: string
    league_of_legends_stats_shared: string
  }
  last_fm: {
    api_key: string
    user: string
  }
  npm: {
    packages: string[]
  }
  wakatime: {
    api_key: string
    images: {
      overall_activity: string
      coding_activity: string
      languages: string
      editors: string
    }
  }
  github: {
    token: string
    events_superset: GitHub.Types.WebhookEventName[]
    release_repos: {
      'moonstar-x': string[]
      'greencoast-studios': string[]
    }
    stats_repos: string[]
  }
  plausible: {
    base_url: string
    api_key: string
    sites: string[]
  }
  league_of_legends: {
    api_key: string
    summoners_puuid: {
      moonstar: string
      minibambu: string
      lucien: string
    }
  }
  twitter: {
    api_key: string
    api_key_secret: string
    client_id: string
    client_secret: string
    bearer_token: string
    users: string[]
  }
}
