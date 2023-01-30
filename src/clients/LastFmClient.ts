import axios, { AxiosInstance } from 'axios';

const API_URL = 'https://ws.audioscrobbler.com/2.0';

export interface LastFmImage {
  size: 'small' | 'medium' | 'large' | 'extralarge'
  '#test': string
}

export interface LastFmUser {
  name: string
  age: string
  subscriber: string
  realname: string
  bootstrap: string
  playcount: string
  artist_count: string
  playlists: string
  track_count: string
  album_count: string
  image: LastFmImage[]
  registered: {
    unixtime: string
    '#text': number
  },
  country: string
  gender: string
  url: string
  type: 'user'
}

export interface LastFmAlbum {
  artist: {
    mbid: string
    '#test': string
  },
  mbid: string
  url: string
  name: string
  '@attr': {
    rank: string
  }
  playcount: string
}

export interface LastFmAlbumChart {
  album: LastFmAlbum[]
  '@attr': {
    from: string
    user: string
    to: string
  }
}

export interface LastFmArtist {
  mbid: string
  url: string
  name: string
  '@attr': {
    rank: string
  }
  playcount: string
}

export interface LastFmArtistChart {
  artist: LastFmArtist[]
  '@attr': {
    from: string
    user: string
    to: string
  }
}

export interface LastFmTrack {
  artist: {
    mbid: string
    '#test': string
  },
  image: LastFmImage[]
  mbid: string
  url: string
  name: string
  '@attr': {
    rank: string
  }
  playcount: string
}

export interface LastFmTrackChart {
  track: LastFmTrack[]
  '@attr': {
    from: string
    user: string
    to: string
  }
}

export class LastFmClient {
  private rest: AxiosInstance;
  private baseParams: Record<string, string>;

  constructor(apiKey: string) {
    this.rest = axios.create({
      baseURL: API_URL
    });
    this.baseParams = {
      api_key: apiKey,
      format: 'json'
    };
  }

  async getProfile(user: string): Promise<LastFmUser> {
    const response = await this.rest.get('', {
      params: {
        ...this.baseParams,
        method: 'user.getinfo',
        user
      }
    });

    return response.data.user;
  }

  async getWeeklyAlbumChart(user: string): Promise<LastFmAlbumChart> {
    const response = await this.rest.get('', {
      params: {
        ...this.baseParams,
        method: 'user.getWeeklyAlbumChart',
        user
      }
    });

    return response.data.weeklyalbumchart;
  }

  async getWeeklyArtistChart(user: string): Promise<LastFmArtistChart> {
    const response = await this.rest.get('', {
      params: {
        ...this.baseParams,
        method: 'user.getWeeklyArtistChart',
        user
      }
    });

    return response.data.weeklyartistchart;
  }

  async getWeeklyTrackChart(user: string): Promise<LastFmTrackChart> {
    const response = await this.rest.get('', {
      params: {
        ...this.baseParams,
        method: 'user.getWeeklyTrackChart',
        user
      }
    });

    return response.data.weeklytrackchart;
  }
}
