/* eslint-disable max-lines */
/* eslint-disable max-statements */
/* eslint-disable max-len */
import { Workflow, WorkflowMetadata } from '../../Workflow';
import { Application } from './../../../Application';
import { Trigger } from '../../Trigger';
import { CronTrigger } from './../../triggers/CronTrigger';
import * as LeagueOfLegends from '../../../clients/leagueOfLegends';
import * as DiscordWebhook from '../../../clients/discordWebhook';
import { levelDatabaseService } from '../../../services/LevelDatabaseService';
import { config } from '../../../config';

const DEFAULT_EMBED_COLOR = 16775840;
const EMBED_COLOR_DEFEAT = 16729157;
const EMBED_COLOR_VICTORY = 5832543;

interface WorkflowOptions {
  summonerPuuid: string
  discordWebhook: string
  nameInDb: string
  trigger: Trigger<void>
  matchesToFetch: number
  sendEmpty: boolean
}

class LeagueOfLegendsStatsWorkflow extends Workflow<void> {
  private options: WorkflowOptions;
  private leagueOfLegendsClient: LeagueOfLegends.Client;
  private discordWebhookClient: DiscordWebhook.Client;

  constructor(application: Application, metadata: WorkflowMetadata, options: WorkflowOptions) {
    super(application, options.trigger, metadata);
    this.options = options;

    this.leagueOfLegendsClient = new LeagueOfLegends.Client(config.custom.league_of_legends.api_key, 'euw1', 'europe');
    this.discordWebhookClient = new DiscordWebhook.Client(options.discordWebhook);
  }

  public async run(): Promise<void> {
    const summoner = await this.leagueOfLegendsClient.getSummonerByPuuid(this.options.summonerPuuid);
    const lastMatches = await this.leagueOfLegendsClient.getLastMatchesForSummonerByPuuid(this.options.summonerPuuid, this.options.matchesToFetch);
    const profileIconUrl = await this.leagueOfLegendsClient.getSummonerProfileIconUrl(summoner.profileIconId);

    const storedMatchIds = await levelDatabaseService.get<string[]>(this.options.nameInDb);
    const newMatches = lastMatches.filter((match) => !storedMatchIds?.includes(match.metadata.matchId));

    if (!newMatches.length) {
      if (this.options.sendEmpty) {
        await this.discordWebhookClient.send(this.createEmptyPayload(summoner, profileIconUrl));
      }

      return;
    }

    const matchesPayload = this.createMatchesPayload(summoner, newMatches, profileIconUrl);
    const matchesSummaryPayload = this.createMatchesSummaryPayload(summoner, newMatches);

    if (matchesSummaryPayload) {
      this.updateFooterInWebhookPayload(matchesSummaryPayload);
      await this.discordWebhookClient.send(matchesPayload);
      await this.discordWebhookClient.send(matchesSummaryPayload);
    } else {
      this.updateFooterInWebhookPayload(matchesPayload);
      await this.discordWebhookClient.send(matchesPayload);
    }

    const matchIdsToStore = lastMatches.map((match) => match.metadata.matchId);
    await levelDatabaseService.set(this.options.nameInDb, matchIdsToStore);
  }

  private createEmptyPayload(summoner: LeagueOfLegends.Types.Summoner, profileIconUrl: string): DiscordWebhook.Types.WebhookPayload {
    return {
      embeds: [{
        color: DEFAULT_EMBED_COLOR,
        author: {
          name: `Check ${summoner.name} on op.gg`,
          url: this.getOpGgUrl(summoner.name),
          icon_url: profileIconUrl
        },
        title: `League of Legends Stats for ${summoner.name}`,
        description: `${summoner.name} has not played any new games since last time. There are no stats to show.`,
        footer: {
          text: "This notification has been triggered by moonstar-x's automation service."
        },
        thumbnail: {
          url: profileIconUrl
        }
      }]
    };
  }

  private createMatchesPayload(summoner: LeagueOfLegends.Types.Summoner, matches: LeagueOfLegends.Types.Match[], profileIconUrl: string): DiscordWebhook.Types.WebhookPayload {
    const matchEmbeds: DiscordWebhook.Types.Embed[] = matches.map((match) => this.createEmbedForMatch(match));

    const firstEmbed = {
      title: `League of Legends Stats for ${summoner.name} of their last ${matchEmbeds.length} games`,
      description: `Here's a breakdown of the last ${matchEmbeds.length} games that ${summoner.name} has played until now.`,
      color: DEFAULT_EMBED_COLOR,
      author: {
        name: `Check ${summoner.name} on op.gg`,
        url: this.getOpGgUrl(summoner.name),
        icon_url: profileIconUrl
      },
      thumbnail: {
        url: profileIconUrl
      },
      footer: undefined
    };

    return {
      embeds: [
        firstEmbed,
        ...matchEmbeds
      ]
    };
  }

  private createEmbedForMatch(match: LeagueOfLegends.Types.Match): DiscordWebhook.Types.Embed {
    const participant = match.info.participants.find((p) => p.puuid === this.options.summonerPuuid)!;
    const formattedKdas = this.getFormattedMatchKdas(match.info.participants, participant);

    const matchResultEmoji = participant.win ? '✅' : '❌';
    const participantLane = participant.lane !== 'NONE' ? ` in ${participant.lane.toLowerCase()} lane` : '';
    const participantRole = match.info.gameMode !== 'ARAM' ? ` ${participant.role}${participantLane}` : '';
    const formattedTitle = `${matchResultEmoji} ${match.info.gameMode} as ${participant.championName}[Lv. ${participant.champLevel}] ${formattedKdas.participant}${participantRole}`;

    const formattedGold = `Earned: **${participant.goldEarned}**\nSpent: **${participant.goldSpent}**`;
    const formattedDamages = this.getFormattedParticipantDamageByEntity(participant);
    const formattedHealed = `Total Healed: **${participant.totalHeal}**\nSelf Mitigated: **${participant.damageSelfMitigated}**\nShielded on Teammates: **${participant.totalDamageShieldedOnTeammates}**`;
    const formattedKillingSprees = `Count: **${participant.killingSprees}**\nLargest: **${participant.largestKillingSpree}**`;
    const formattedMultiKills = `Double: **${participant.doubleKills}**\nTriple: **${participant.tripleKills}**\nQuadra: **${participant.quadraKills}**\nPenta: **${participant.pentaKills}**`;
    const formattedVision = match.info.gameMode !== 'ARAM' ? `Wards Placed: **${participant.wardsPlaced}**\nWards Destroyed: **${participant.wardsKilled}**\nScore: **${participant.visionScore}**` : 'N/A';

    return {
      author: undefined,
      footer: undefined,
      color: participant.win ? EMBED_COLOR_VICTORY : EMBED_COLOR_DEFEAT,
      title: formattedTitle,
      fields: [
        { name: 'Match Result', value: `${formattedKdas.participantTeam} vs. ${formattedKdas.enemyTeam}`, inline: true },
        { name: 'Duration', value: this.getFormattedDuration(match.info.gameDuration), inline: true },
        { name: 'Date', value: this.getFormattedDate(new Date(match.info.gameStartTimestamp)), inline: true },

        { name: 'Gold', value: formattedGold, inline: true },
        { name: 'Longest Live', value: this.getFormattedDuration(participant.longestTimeSpentLiving), inline: true },
        { name: 'Minions Killed', value: `${participant.totalMinionsKilled}`, inline: true },

        { name: 'Damage Dealt', value: formattedDamages.total, inline: true },
        { name: 'Damage Dealt to Champions', value: formattedDamages.champions, inline: true },
        { name: 'Damage Taken', value: formattedDamages.taken, inline: true },

        { name: 'Damage Healed', value: formattedHealed, inline: true },
        { name: 'Killing Sprees', value: formattedKillingSprees, inline: true },
        { name: 'Multi Kills', value: formattedMultiKills, inline: true },

        { name: 'Turrets', value: this.getFormattedObjectives(participant.turretTakedowns, participant.turretsLost), inline: true },
        { name: 'Inhibitors', value: this.getFormattedObjectives(participant.inhibitorTakedowns, participant.inhibitorsLost), inline: true },
        { name: 'Vision', value: formattedVision, inline: true }
      ]
    };
  }

  private createMatchesSummaryPayload(summoner: LeagueOfLegends.Types.Summoner, matches: LeagueOfLegends.Types.Match[]): DiscordWebhook.Types.WebhookPayload | null {
    const rivalChampionCounts = this.getRivalChampionCount(matches);
    const formattedRivalChampionCounts = Object.keys(rivalChampionCounts).length ?
      Object.entries(rivalChampionCounts)
        .reduce((text, [champion, frequency]) => {
          return text.concat(`${champion}: **${frequency}**\n`);
        }, '') :
      null;

    const fields: DiscordWebhook.Types.EmbedField[] = [];
    if (formattedRivalChampionCounts) {
      fields.push({ name: 'Rival Champions Fought', value: formattedRivalChampionCounts, inline: true });
    }

    if (!fields.length) {
      return null;
    }

    return {
      embeds: [{
        title: `Summary of ${summoner.name}'s previously posted ${matches.length} games`,
        description: `Here's a composite summary of the last ${matches.length} games posted previously.`,
        color: DEFAULT_EMBED_COLOR,
        author: undefined,
        footer: undefined,
        fields
      }]
    };
  }

  private getRivalChampionCount(matches: LeagueOfLegends.Types.Match[]): Record<string, number> {
    return matches.reduce((rivalFrequency, match) => {
      if (match.info.gameMode === 'ARAM') {
        return rivalFrequency;
      }
      
      const participant = match.info.participants.find((p) => p.puuid === this.options.summonerPuuid)!;
      if (participant.lane === 'NONE') {
        return rivalFrequency;
      }

      const rivals = match.info.participants.filter((r) => r.teamId !== participant.teamId && r.lane === participant.lane);
      if (!rivals.length) {
        return rivalFrequency;
      }

      for (const rival of rivals) {
        const { championName: rivalChampion } = rival;
        rivalFrequency[rivalChampion] = (rivalFrequency[rivalChampion] ?? 0) + 1;
      }

      return rivalFrequency;
    }, {} as Record<string, number>);
  }

  private getFormattedObjectives(destroyed: number, lost: number): string {
    return `Destroyed: **${destroyed}**\nLost: **${lost}**`;
  }

  private getFormattedParticipantDamageByEntity(participant: LeagueOfLegends.Types.MatchParticipant) {
    return {
      total: this.getFormattedDamage(participant.totalDamageDealt, participant.magicDamageDealt, participant.physicalDamageDealt, participant.trueDamageDealt),
      champions: this.getFormattedDamage(participant.totalDamageDealtToChampions, participant.magicDamageDealtToChampions, participant.physicalDamageDealtToChampions, participant.trueDamageDealtToChampions),
      taken: this.getFormattedDamage(participant.totalDamageTaken, participant.magicDamageTaken, participant.physicalDamageTaken, participant.trueDamageTaken)
    };
  }

  private getFormattedDamage(totalDamage: number, magicDamage: number, physicalDamage: number, trueDamage: number): string {
    return `Total: **${totalDamage}**\nMagic: **${magicDamage}**\nPhysical: **${physicalDamage}**\nTrue: **${trueDamage}**`;
  }

  private getFormattedMatchKdas(participants: LeagueOfLegends.Types.MatchParticipant[], participant: LeagueOfLegends.Types.MatchParticipant) {
    const kdaByTeam = participants.reduce((result, cur) => {
      const teamKda = cur.teamId === participant.teamId ? result.participantTeam : result.enemyTeam;

      teamKda.kills += cur.kills;
      teamKda.deaths += cur.deaths;
      teamKda.assists += cur.assists;

      return result;
    }, {
      participantTeam: { kills: 0, deaths: 0, assists: 0 },
      enemyTeam: { kills: 0, deaths: 0, assists: 0 }
    });

    return {
      participant: `(${participant.kills}/${participant.deaths}/${participant.assists})`,
      participantTeam: `(${kdaByTeam.participantTeam.kills}/${kdaByTeam.participantTeam.deaths}/${kdaByTeam.participantTeam.assists})`,
      enemyTeam: `(${kdaByTeam.enemyTeam.kills}/${kdaByTeam.enemyTeam.deaths}/${kdaByTeam.enemyTeam.assists})`
    };
  }

  private getFormattedDate(date: Date): string {
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZone: process.env.TZ ?? 'America/Guayaquil',
      hour12: true
    });
  }

  private getFormattedDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secondsMinusMinutes = seconds - minutes * 60;
    return `${minutes}:${secondsMinusMinutes}`;
  }

  private getOpGgUrl(summonerName: string): string {
    return `https://euw.op.gg/summoner/userName=${encodeURIComponent(summonerName)}`;
  }

  private updateFooterInWebhookPayload(payload: DiscordWebhook.Types.WebhookPayload): void {
    if (!payload.embeds) {
      return;
    }

    payload.embeds[payload.embeds.length - 1].footer = {
      text: "This notification has been triggered by moonstar-x's automation service."
    };
  }
}

export class PersonalLeagueOfLegendsStatsWorkflow extends LeagueOfLegendsStatsWorkflow {
  constructor(application: Application) {
    super(application, {
      name: 'PersonalLeagueOfLegendsStatsWorkflow',
      description: 'Send weekly League of Legends player stats on Discord (Personal)'
    }, {
      summonerPuuid: config.custom.league_of_legends.summoners_puuid.moonstar,
      discordWebhook: config.custom.discord_webhooks.league_of_legends_stats_personal,
      nameInDb: 'lol:stats:personal:moonstar',
      trigger: new CronTrigger('0 21 * * 0'),
      matchesToFetch: 8,
      sendEmpty: true
    });
  }
}

export class SharedMoonstarLeagueOfLegendsStatsWorkflow extends LeagueOfLegendsStatsWorkflow {
  constructor(application: Application) {
    super(application, {
      name: 'SharedMoonstarLeagueOfLegendsStatsWorkflow',
      description: 'Send daily League of Legends player stats on Discord (moonstar)'
    }, {
      summonerPuuid: config.custom.league_of_legends.summoners_puuid.moonstar,
      discordWebhook: config.custom.discord_webhooks.league_of_legends_stats_shared,
      nameInDb: 'lol:stats:shared:moonstar',
      trigger: new CronTrigger('1 21 * * *'),
      matchesToFetch: 5,
      sendEmpty: false
    });
  }
}

export class SharedMinibambuLeagueOfLegendsStatsWorkflow extends LeagueOfLegendsStatsWorkflow {
  constructor(application: Application) {
    super(application, {
      name: 'SharedMinibambuLeagueOfLegendsStatsWorkflow',
      description: 'Send daily League of Legends player stats on Discord (minibambu)'
    }, {
      summonerPuuid: config.custom.league_of_legends.summoners_puuid.minibambu,
      discordWebhook: config.custom.discord_webhooks.league_of_legends_stats_shared,
      nameInDb: 'lol:stats:shared:minibambu',
      trigger: new CronTrigger('2 21 * * *'),
      matchesToFetch: 5,
      sendEmpty: false
    });
  }
}

export class SharedLucienLeagueOfLegendsStatsWorkflow extends LeagueOfLegendsStatsWorkflow {
  constructor(application: Application) {
    super(application, {
      name: 'SharedLucienLeagueOfLegendsStatsWorkflow',
      description: 'Send daily League of Legends player stats on Discord (Lucien)'
    }, {
      summonerPuuid: config.custom.league_of_legends.summoners_puuid.lucien,
      discordWebhook: config.custom.discord_webhooks.league_of_legends_stats_shared,
      nameInDb: 'lol:stats:shared:lucien',
      trigger: new CronTrigger('3 21 * * *'),
      matchesToFetch: 5,
      sendEmpty: false
    });
  }
}
