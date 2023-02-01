/* eslint-disable max-len */
import axios, { AxiosInstance } from 'axios';

const ALL_METRICS = ['visitors', 'pageviews', 'bounce_rate', 'visit_duration', 'events', 'visits'] as const;

export type PlausibleMetricKey = typeof ALL_METRICS[number];

export interface PlausibleMetricValue {
  value: number
  change: number
}

export type PlausibleStats = {
  [k in PlausibleMetricKey]: PlausibleMetricValue;
};

export type PlausibleBreakdown<P extends string> = {
  [k in PlausibleMetricKey]: number | null
} & {
  [k in P]: string
}

export interface PlausibleFullBreakdown {
  top_pages: PlausibleBreakdown<'page'>[]
  top_sources: PlausibleBreakdown<'source'>[]
  top_countries: PlausibleBreakdown<'country'>[]
  top_devices: PlausibleBreakdown<'device'>[]
}

export class PlausibleClient {
  private rest: AxiosInstance;

  constructor(baseUrl: string, apiKey: string) {
    this.rest = axios.create({
      baseURL: `${baseUrl}/api/v1`,
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });
  }

  public async getWeeklyAggregateStats(siteId: string): Promise<PlausibleStats> {
    const response = await this.rest.get('/stats/aggregate', {
      params: {
        site_id: siteId,
        period: '7d',
        metrics: ALL_METRICS.join(','),
        compare: 'previous_period'
      }
    });

    return response.data.results;
  }

  public async getWeeklyBreakdown(siteId: string, limit: number = 10): Promise<PlausibleFullBreakdown> {
    const pageBreakdown = await this.getWeeklyBreakdownByProperty<'page'>(siteId, 'event:page', limit);
    const sourceBreakdown = await this.getWeeklyBreakdownByProperty<'source'>(siteId, 'visit:source', limit);
    const countryBreakdown = await this.getWeeklyBreakdownByProperty<'country'>(siteId, 'visit:country', limit);
    const deviceBreakdown = await this.getWeeklyBreakdownByProperty<'device'>(siteId, 'visit:device', limit);

    return {
      top_pages: pageBreakdown,
      top_sources: sourceBreakdown,
      top_countries: countryBreakdown,
      top_devices: deviceBreakdown
    };
  }

  public async getWeeklyBreakdownByProperty<P extends string>(siteId: string, property: string, limit: number = 10): Promise<PlausibleBreakdown<P>[]> {
    const response = await this.rest.get('/stats/breakdown', {
      params: {
        site_id: siteId,
        period: '7d',
        metrics: ALL_METRICS.join(','),
        limit,
        property
      }
    });

    return response.data.results;
  }
}
