import axios, { AxiosInstance } from 'axios';
import { batchPromises } from '../utils/promises';

export type LeagueOfLegendsApiRegion = 'br1' | 'eun1' | 'euw1' | 'jp1' | 'kr' | 'la1' | 'la2' | 'na1' | 'oc1' | 'pbe1' | 'ph2' | 'ru' | 'sg2' | 'th2' | 'tr1' | 'tw2' | 'vn1';
export type LeagueOfLegendsApiMatchRegion = 'americas' | 'europe' | 'asia' | 'sea';

const getApiBaseUrl = (region: LeagueOfLegendsApiRegion | LeagueOfLegendsApiMatchRegion) => {
  return `https://${region}.api.riotgames.com/lol`;
};

export interface LeagueOfLegendsSummoner {
  id: string
  accountId: string
  puuid: string
  name: string
  profileIconId: number
  revisionDate: number
  summonerLevel: number
}

export interface LeagueOfLegendsMatchMetadata {
  dataVersion: string
  matchId: string
  participants: string[]
}

export interface LeagueOfLegendsMatchParticipantPerksStats {
  defense: number
  flex: number
  offense: number
}

export interface LeagueOfLegendsMatchParticipantPerksStyleSelection {
  perk: number
  var1: number
  var2: number
  var3: number
}

export interface LeagueOfLegendsMatchParticipantPerksStyle {
  description: string
  selections: LeagueOfLegendsMatchParticipantPerksStyleSelection[]
  style: number
}

export interface LeagueOfLegendsMatchParticipantPerks {
  statPerks: LeagueOfLegendsMatchParticipantPerksStats
  styles: LeagueOfLegendsMatchParticipantPerksStyle[]
}

export interface LeagueOfLegendsMatchParticipant {
  assists: number
  baronKills: number
  bountyLevel: number
  champExperience: number
  champLevel: number
  championId: number
  championName: string
  championTransform: number
  consumablesPurchased: number
  damageDealtToBuildings: number
  damageDealtToObjectives: number
  damageDealtToTurrets: number
  damageSelfMitigated: number
  deaths: number
  detectorWardsPlaced: number
  doubleKills: number
  dragonKills: number
  firstBloodAssist: boolean
  firstBloodKill: boolean
  firstTowerAssist: boolean
  firstTowerKill: boolean
  gameEndedInEarlySurrender: boolean
  gameEndedInSurrender: boolean
  goldEarned: number
  goldSpent: number
  individualPosition: string
  inhibitorKills: number
  inhibitorTakedowns: number
  inhibitorsLost: number
  item0: number
  item1: number
  item2: number
  item3: number
  item4: number
  item5: number
  item6: number
  itemsPurchased: number
  killingSprees: number
  kills: number
  lane: string
  largestCriticalStrike: number
  largestKillingSpree: number
  largestMultiKill: number
  longestTimeSpentLiving: number
  magicDamageDealt: number
  magicDamageDealtToChampions: number
  magicDamageTaken: number
  neutralMinionsKilled: number
  nexusKills: number
  nexusTakedowns: number
  nexusLost: number
  objectivesStolen: number
  objectivesStolenAssists: number
  participantId: number
  pentaKills: number
  perks: LeagueOfLegendsMatchParticipantPerks
  physicalDamageDealt: number
  physicalDamageDealtToChampions: number
  physicalDamageTaken: number
  profileIcon: number
  puuid: string
  quadraKills: number
  riotIdName: string
  riotIdTagline: string
  role: string
  sightWardsBoughtInGame: number
  spell1Casts: number
  spell2Casts: number
  spell3Casts: number
  spell4Casts: number
  summoner1Casts: number
  summoner1Id: number
  summoner2Casts: number
  summoner2Id: number
  summonerId: string
  summonerLevel: number
  summonerName: string
  teamEarlySurrendered: boolean
  teamId: number
  teamPosition: string
  timeCCingOthers: number
  timePlayed: number
  totalDamageDealt: number
  totalDamageDealtToChampions: number
  totalDamageShieldedOnTeammates: number
  totalDamageTaken: number
  totalHeal: number
  totalHealsOnTeammates: number
  totalMinionsKilled: number
  totalTimeCCDealt: number
  totalTimeSpentDead: number
  totalUnitsHealed: number
  tripleKills: number
  trueDamageDealt: number
  trueDamageDealtToChampions: number
  trueDamageTaken: number
  turretKills: number
  turretTakedowns: number
  turretsLost: number
  unrealKills: number
  visionScore: number
  visionWardsBoughtInGame: number
  wardsKilled: number
  wardsPlaced: number
  win: boolean
}

export interface LeagueOfLegendsMatchBan {
  championId: number
  pickTurn: number
}

export interface LeagueOfLegendsMatchObjective {
  first: boolean
  kills: number
}

export interface LeagueOfLegendsMatchObjectives {
  baron: LeagueOfLegendsMatchObjective
  champion: LeagueOfLegendsMatchObjective
  dragon: LeagueOfLegendsMatchObjective
  inhibitor: LeagueOfLegendsMatchObjective
  riftHerald: LeagueOfLegendsMatchObjective
  tower: LeagueOfLegendsMatchObjective
}

export interface LeagueOfLegendsMatchTeam {
  bans: LeagueOfLegendsMatchBan[]
  objectives: LeagueOfLegendsMatchObjectives
  teamId: number
  win: boolean
}

export interface LeagueOfLegendsMatchInfo {
  gameCreation: number
  gameDuration: number
  gameEndTimestamp: number
  gameId: number
  gameMode: string
  gameName: string
  gameStartTimestamp: number
  gameType: string
  gameVersion: string
  mapId: number
  participants: LeagueOfLegendsMatchParticipant[]
  platformId: string
  queueId: number
  teams: LeagueOfLegendsMatchTeam[]
  tournamentCode: string
}

export interface LeagueOfLegendsMatch {
  metadata: LeagueOfLegendsMatchMetadata
  info: LeagueOfLegendsMatchInfo
}

export class LeagueOfLegendsClient {
  private apiRest: AxiosInstance;
  private matchRest: AxiosInstance;

  constructor(apiKey: string, apiRegion: LeagueOfLegendsApiRegion, matchRegion: LeagueOfLegendsApiMatchRegion) {
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

  public async getSummonerByName(name: string): Promise<LeagueOfLegendsSummoner> {
    const response = await this.apiRest.get(`/summoner/v4/summoners/by-name/${name}`);
    return response.data;
  }

  public async getSummonerByPuuid(puuid: string): Promise<LeagueOfLegendsSummoner> {
    const response = await this.apiRest.get(`/summoner/v4/summoners/by-puuid/${puuid}`);
    return response.data;
  }

  public async getMatchById(matchId: string): Promise<LeagueOfLegendsMatch> {
    const response = await this.matchRest.get(`/match/v5/matches/${matchId}`);
    return response.data;
  }

  public async getMatchesForSummonerByPuuid(puuid: string, start: number, count: number): Promise<LeagueOfLegendsMatch[]> {
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

  public getLastMatchesForSummonerByPuuid(puuid: string, count: number = 10): Promise<LeagueOfLegendsMatch[]> {
    return this.getMatchesForSummonerByPuuid(puuid, 0, count);
  }
}
