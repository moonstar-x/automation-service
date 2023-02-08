/* eslint-disable max-len */
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

  public async getAggregateStats(siteId: string, period: string): Promise<Types.Stats> {
    const response = await this.rest.get('/stats/aggregate', {
      params: {
        site_id: siteId,
        period,
        metrics: Types.ALL_METRICS.join(','),
        compare: 'previous_period'
      }
    });

    return response.data.results;
  }

  public getMonthlyAggregateStats(siteId: string): Promise<Types.Stats> {
    return this.getAggregateStats(siteId, 'month');
  }

  public getWeeklyAggregateStats(siteId: string): Promise<Types.Stats> {
    return this.getAggregateStats(siteId, '7d');
  }

  public getDailyAggregateStats(siteId: string): Promise<Types.Stats> {
    return this.getAggregateStats(siteId, 'day');
  }

  public async getBreakdownByProperty<P extends string>(siteId: string, property: string, period: string, limit: number = 10): Promise<Types.Breakdown<P>[]> {
    const response = await this.rest.get('/stats/breakdown', {
      params: {
        site_id: siteId,
        period,
        metrics: Types.ALL_METRICS.join(','),
        limit,
        property
      }
    });

    return response.data.results;
  }

  public async getBreakdown(siteId: string, period: string, limit: number = 10): Promise<Types.FullBreakdown> {
    const pageBreakdown = await this.getBreakdownByProperty<'page'>(siteId, 'event:page', period, limit);
    const sourceBreakdown = await this.getBreakdownByProperty<'source'>(siteId, 'visit:source', period, limit);
    const countryBreakdown = await this.getBreakdownByProperty<'country'>(siteId, 'visit:country', period, limit);
    const deviceBreakdown = await this.getBreakdownByProperty<'device'>(siteId, 'visit:device', period, limit);

    return {
      top_pages: pageBreakdown,
      top_sources: sourceBreakdown,
      top_countries: countryBreakdown,
      top_devices: deviceBreakdown
    };
  }

  public getMonthlyBreakdown(siteId: string, limit: number = 10): Promise<Types.FullBreakdown> {
    return this.getBreakdown(siteId, 'month', limit);
  }

  public getWeeklyBreakdown(siteId: string, limit: number = 10): Promise<Types.FullBreakdown> {
    return this.getBreakdown(siteId, '7d', limit);
  }

  public getDailyBreakdown(siteId: string, limit: number = 10): Promise<Types.FullBreakdown> {
    return this.getBreakdown(siteId, 'day', limit);
  }
}
