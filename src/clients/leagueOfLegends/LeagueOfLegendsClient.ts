import axios, { AxiosInstance } from 'axios';
import { batchPromises } from '../../utils/promises';
import * as Types from './types';

const getApiBaseUrl = (region: Types.ApiRegion | Types.ApiMatchRegion) => {
  return `https://${region}.api.riotgames.com/lol`;
};

const DATA_DRAGON_VERSION_URL = 'https://ddragon.leagueoflegends.com/api/versions.json';

export class LeagueOfLegendsClient {
  private apiRest: AxiosInstance;
  private matchRest: AxiosInstance;

  constructor(apiKey: string, apiRegion: Types.ApiRegion, matchRegion: Types.ApiMatchRegion) {
    this.apiRest = axios.create({
      baseURL: getApiBaseUrl(apiRegion),
      headers: {
        'X-Riot-Token': apiKey
      }
    });

    this.matchRest = axios.create({
      baseURL: getApiBaseUrl(matchRegion),
      headers: {
        'X-Riot-Token': apiKey
      }
    });
  }

  public async getSummonerByName(name: string): Promise<Types.Summoner> {
    const response = await this.apiRest.get(`/summoner/v4/summoners/by-name/${name}`);
    return response.data;
  }

  public async getSummonerByPuuid(puuid: string): Promise<Types.Summoner> {
    const response = await this.apiRest.get(`/summoner/v4/summoners/by-puuid/${puuid}`);
    return response.data;
  }

  public async getMatchById(matchId: string): Promise<Types.Match> {
    const response = await this.matchRest.get(`/match/v5/matches/${matchId}`);
    return response.data;
  }

  public async getMatchesForSummonerByPuuid(puuid: string, start: number, count: number): Promise<Types.Match[]> {
    if (count < 0 || count > 100) {
      throw new RangeError('Invalid count provided, must be between 0 and 100.');
    }

    const matchIds: string[] = (await this.matchRest.get(`/match/v5/matches/by-puuid/${puuid}/ids`, {
      params: {
        start,
        count
      }
    })).data;

    const matchesPromises = matchIds.map((matchId) => {
      return () => this.getMatchById(matchId);
    });

    return batchPromises(matchesPromises, { batch: 5, interval: 1000 });
  }

  public getLastMatchesForSummonerByPuuid(puuid: string, count: number = 10): Promise<Types.Match[]> {
    return this.getMatchesForSummonerByPuuid(puuid, 0, count);
  }

  private async getLatestDataDragonVersion(): Promise<string> {
    const response = await axios.get(DATA_DRAGON_VERSION_URL);
    return response.data[0];
  }

  public async getSummonerProfileIconUrl(profileIconId: string | number): Promise<string> {
    const latestDataDragonVersion = await this.getLatestDataDragonVersion();
    return `https://ddragon.leagueoflegends.com/cdn/${latestDataDragonVersion}/img/profileicon/${profileIconId}.png`;
  }
}
