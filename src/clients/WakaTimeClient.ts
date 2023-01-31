import axios, { AxiosInstance } from 'axios';

const API_URL = 'https://wakatime.com/api/v1';

export interface WakaTimeEntry {
  decimal: string
  digital: string
  hours: number
  minutes: number
  name: string
  percent: number
  text: string
  total_seconds: number
}

export interface WakaTimeStats {
  best_day: {
    created_at: string
    date: string
    id: string
    modified_at: string
    text: string
    total_seconds: number
  }
  categories: WakaTimeEntry[]
  created_at: string
  daily_average: number
  daily_average_including_other_language: number
  days_including_holidays: number
  days_minus_holidays: number
  dependencies: WakaTimeEntry[]
  editors: WakaTimeEntry[]
  end: string
  holidays: number
  human_readable_daily_average: string
  human_readable_daily_average_including_other_language: string
  human_readable_range: string
  human_readable_total: string
  human_readable_total_including_other_language: string
  id: string
  is_already_updating: boolean
  is_coding_activity_visible: boolean
  is_including_today: boolean
  is_other_usage_visible: boolean
  is_stuck: boolean
  is_up_to_date: boolean
  is_up_to_date_pending_future: boolean
  languages: WakaTimeEntry[]
  machines: WakaTimeEntry[]
  modified_at: string
  operating_systems: WakaTimeEntry[]
  percent_calculated: number
  projects: WakaTimeEntry[]
  range: string
  start: string
  status: string
  timeout: number
  timezone: string
  total_seconds: number
  total_seconds_including_other_language: number
  user_id: string
  username: string
  writes_only: boolean
}


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

  public async getLastWeekStats(): Promise<WakaTimeStats | null> {
    const response = await this.rest.get('/users/current/stats/last_7_days');
    const stats: WakaTimeStats = response.data.data;

    if (!stats.best_day) {
      return null;
    }

    return stats;
  }
}
