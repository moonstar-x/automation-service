import axios, { AxiosInstance } from 'axios';
import * as Types from './types';

const API_URL = 'https://wakatime.com/api/v1';

export class WakaTimeClient {
  private rest: AxiosInstance;

  constructor(apiKey: string) {
    this.rest = axios.create({
      baseURL: API_URL,
      headers: {
        Authorization: `Basic ${apiKey}`
      }
    });
  }

  public async getLastWeekStats(): Promise<Types.Stats | null> {
    const response = await this.rest.get('/users/current/stats/last_7_days');
    const stats: Types.Stats = response.data.data;

    if (!stats.best_day) {
      return null;
    }

    return stats;
  }
}
