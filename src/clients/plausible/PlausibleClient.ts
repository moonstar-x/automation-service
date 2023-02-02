import axios, { AxiosInstance } from 'axios';
import * as Types from './types';

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

  public async getWeeklyAggregateStats(siteId: string): Promise<Types.Stats> {
    const response = await this.rest.get('/stats/aggregate', {
      params: {
        site_id: siteId,
        period: '7d',
        metrics: Types.ALL_METRICS.join(','),
        compare: 'previous_period'
      }
    });

    return response.data.results;
  }

  public async getWeeklyBreakdown(siteId: string, limit: number = 10): Promise<Types.FullBreakdown> {
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

  public async getWeeklyBreakdownByProperty<P extends string>(siteId: string, property: string, limit: number = 10): Promise<Types.Breakdown<P>[]> {
    const response = await this.rest.get('/stats/breakdown', {
      params: {
        site_id: siteId,
        period: '7d',
        metrics: Types.ALL_METRICS.join(','),
        limit,
        property
      }
    });

    return response.data.results;
  }
}
