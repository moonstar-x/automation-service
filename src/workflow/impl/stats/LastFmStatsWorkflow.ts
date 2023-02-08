/* eslint-disable max-len */
import { Workflow } from '../../Workflow';
import { Application } from './../../../Application';
import { CronTrigger } from './../../triggers/CronTrigger';
import * as LastFm from '../../../clients/lastfm';
import * as DiscordWebhook from '../../../clients/discordWebhook';
import { config } from '../../../config';

const EMBED_COLOR = 13963271;
const MAX_ITEMS = 10;

export class LastFmStatsWorkflow extends Workflow<void> {
  private lastFmClient: LastFm.Client;
  private discordWebhookClient: DiscordWebhook.Client;

  constructor(application: Application) {
    super(application, new CronTrigger('0 20 * * 0'), {
      name: 'LastFmStatsWorkflow',
      description: 'Send weekly LastFM stats on Discord'
    });

    this.lastFmClient = new LastFm.Client(config.custom.last_fm.api_key);
    this.discordWebhookClient = new DiscordWebhook.Client(config.custom.discord_webhooks.last_fm_stats);
  }

  public async run(): Promise<void> {
    const profile = await this.lastFmClient.getProfile(config.custom.last_fm.user);
    const albums = (await this.lastFmClient.getWeeklyAlbumChart(config.custom.last_fm.user)).album;
    const artists = (await this.lastFmClient.getWeeklyArtistChart(config.custom.last_fm.user)).artist;
    const tracks = (await this.lastFmClient.getWeeklyTrackChart(config.custom.last_fm.user)).track;

    const baseEmbed: DiscordWebhook.Types.Embed = {
      color: EMBED_COLOR,
      author: {
        name: 'Music Listening Stats for moonstar-x',
        url: 'https://www.last.fm/user/moonstar-x',
        icon_url: 'https://avatars.githubusercontent.com/u/14969195?v=4'
      },
      title: 'Music listening stats for this week',
      footer: {
        text: "This notification has been triggered by moonstar-x's automation service. It is set to run every Sunday at night."
      }
    };

    if (!albums.length || !artists.length || !tracks.length) {
      return this.discordWebhookClient.send(this.createNoScrobblesPayload(baseEmbed, profile));
    }

    const slicedAlbums = albums.slice(0, MAX_ITEMS);
    const slicedArtists = artists.slice(0, MAX_ITEMS);
    const slicedTracks = tracks.slice(0, MAX_ITEMS);

    const topArtistUrl = await this.lastFmClient.getArtistImageByLastFmPageUrl(slicedArtists[0].url);
    if (topArtistUrl) {
      baseEmbed.thumbnail = {
        url: topArtistUrl
      };
    }

    return this.discordWebhookClient.send(this.createStatsPayload(baseEmbed, profile, slicedAlbums, slicedArtists, slicedTracks));
  }

  private createNoScrobblesPayload(baseEmbed: DiscordWebhook.Types.Embed, profile: LastFm.Types.User): DiscordWebhook.Types.WebhookPayload {
    return {
      embeds: [{
        ...baseEmbed,
        description: `So far, I have listened to **${profile.playcount}** songs ever since I've started tracking them on Last.FM.
        
        I have not scrobbled any songs this week. I may have forgotten to scrobble them since Apple Music doesn't allow automatic scrobbles.`
      }]
    };
  }

  private createStatsPayload(baseEmbed: DiscordWebhook.Types.Embed, profile: LastFm.Types.User, albums: LastFm.Types.AlbumInChart[], artists: LastFm.Types.ArtistInChart[], tracks: LastFm.Types.TrackInChart[]): DiscordWebhook.Types.WebhookPayload {
    const parsedArtists = artists.reduce((text, artist) => {
      return text.concat(`• **${artist.name}** with **${artist.playcount}** songs played.\n`);
    }, '');
    
    const parsedAlbums = albums.reduce((text, album) => {
      return text.concat(`• **${album.name}** by **${album.artist['#text']}** with **${album.playcount}** songs played.\n`);
    }, '');
    
    const parsedTracks = tracks.reduce((text, track) => {
      return text.concat(`• **${track.name}** by **${track.artist['#text']}** which has been played **${track.playcount}** times.\n`);
    }, '');

    return {
      embeds: [{
        ...baseEmbed,
        description: `So far, I have listened to **${profile.playcount}** songs ever since I've started tracking them on Last.FM.`,
        fields: [
          { name: `Top ${artists.length} artists this week:`, value: parsedArtists },
          { name: `Top ${albums.length} albums this week:`, value: parsedAlbums },
          { name: `Top ${tracks.length} tracks this week:`, value: parsedTracks }
        ]
      }]
    };
  }
}
