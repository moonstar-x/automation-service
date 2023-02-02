export type ApiRegion = 'br1' | 'eun1' | 'euw1' | 'jp1' | 'kr' | 'la1' | 'la2' | 'na1' | 'oc1' | 'pbe1' | 'ph2' | 'ru' | 'sg2' | 'th2' | 'tr1' | 'tw2' | 'vn1';
export type ApiMatchRegion = 'americas' | 'europe' | 'asia' | 'sea';

export interface Summoner {
  id: string
  accountId: string
  puuid: string
  name: string
  profileIconId: number
  revisionDate: number
  summonerLevel: number
}

export interface MatchMetadata {
  dataVersion: string
  matchId: string
  participants: string[]
}

export interface MatchParticipantPerksStats {
  defense: number
  flex: number
  offense: number
}

export interface MatchParticipantPerksStyleSelection {
  perk: number
  var1: number
  var2: number
  var3: number
}

export interface MatchParticipantPerksStyle {
  description: string
  selections: MatchParticipantPerksStyleSelection[]
  style: number
}

export interface MatchParticipantPerks {
  statPerks: MatchParticipantPerksStats
  styles: MatchParticipantPerksStyle[]
}

export interface MatchParticipant {
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
  perks: MatchParticipantPerks
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

export interface MatchBan {
  championId: number
  pickTurn: number
}

export interface MatchObjective {
  first: boolean
  kills: number
}

export interface MatchObjectives {
  baron: MatchObjective
  champion: MatchObjective
  dragon: MatchObjective
  inhibitor: MatchObjective
  riftHerald: MatchObjective
  tower: MatchObjective
}

export interface MatchTeam {
  bans: MatchBan[]
  objectives: MatchObjectives
  teamId: number
  win: boolean
}

export interface MatchInfo {
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
  participants: MatchParticipant[]
  platformId: string
  queueId: number
  teams: MatchTeam[]
  tournamentCode: string
}

export interface Match {
  metadata: MatchMetadata
  info: MatchInfo
}
