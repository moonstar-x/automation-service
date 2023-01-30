import axios, { AxiosInstance } from 'axios';

const API_URL = 'https://ws.audioscrobbler.com/2.0';

export class LastFmClient {
  private rest: AxiosInstance;
  private baseParams: Record<string, string>;

  constructor(apiKey: string) {
    this.rest = axios.create({
      baseURL: API_URL
    });
    this.baseParams = {
      api_key: apiKey,
      format: 'json'
    };
  }

  getProfile(user: string) {
    return this.rest.get('', {
      params: {
        ...this.baseParams,
        method: 'user.getinfo',
        user
      }
    });
  }

  getWeeklyAlbumChart(user: string) {
    return this.rest.get('', {
      params: {
        ...this.baseParams,
        method: 'user.getWeeklyAlbumChart',
        user
      }
    });
  }

  getWeeklyArtistChart(user: string) {
    return this.rest.get('', {
      params: {
        ...this.baseParams,
        method: 'user.getWeeklyArtistChart',
        user
      }
    });
  }

  getWeeklyTrackChart(user: string) {
    return this.rest.get('', {
      params: {
        ...this.baseParams,
        method: 'user.getWeeklyTrackChart',
        user
      }
    });
  }
}
