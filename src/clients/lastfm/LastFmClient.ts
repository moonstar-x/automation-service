import axios, { AxiosInstance } from 'axios';
import * as Cheerio from 'cheerio';
import * as Types from './types';

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

  async getProfile(user: string): Promise<Types.User> {
    const response = await this.rest.get('/', {
      params: {
        ...this.baseParams,
        method: 'user.getinfo',
        user
      }
    });

    return response.data.user;
  }

  async getWeeklyAlbumChart(user: string): Promise<Types.AlbumChart> {
    const response = await this.rest.get('/', {
      params: {
        ...this.baseParams,
        method: 'user.getWeeklyAlbumChart',
        user
      }
    });

    return response.data.weeklyalbumchart;
  }

  async getWeeklyArtistChart(user: string): Promise<Types.ArtistChart> {
    const response = await this.rest.get('/', {
      params: {
        ...this.baseParams,
        method: 'user.getWeeklyArtistChart',
        user
      }
    });

    return response.data.weeklyartistchart;
  }

  async getWeeklyTrackChart(user: string): Promise<Types.TrackChart> {
    const response = await this.rest.get('/', {
      params: {
        ...this.baseParams,
        method: 'user.getWeeklyTrackChart',
        user
      }
    });

    return response.data.weeklytrackchart;
  }

  async getArtistImageByLastFmPageUrl(lastFmPageUrl: string): Promise<string | null> {
    const response = await axios.get(lastFmPageUrl);
    const $ = Cheerio.load(response.data);

    return $('.header-new-background-image')[0]?.attribs?.content ?? null;
  }
}
