export interface Image {
  size: 'small' | 'medium' | 'large' | 'extralarge' | 'mega' | ''
  '#text': string
}

export interface User {
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
  image: Image[]
  registered: {
    unixtime: string
    '#text': number
  },
  country: string
  gender: string
  url: string
  type: 'user'
}

export interface AlbumInChart {
  artist: {
    mbid: string
    '#text': string
  },
  mbid: string
  url: string
  name: string
  '@attr': {
    rank: string
  }
  playcount: string
}

export interface AlbumChart {
  album: AlbumInChart[]
  '@attr': {
    from: string
    user: string
    to: string
  }
}

export interface ArtistInChart {
  mbid: string
  url: string
  name: string
  '@attr': {
    rank: string
  }
  playcount: string
}

export interface ArtistChart {
  artist: ArtistInChart[]
  '@attr': {
    from: string
    user: string
    to: string
  }
}

export interface TrackInChart {
  artist: {
    mbid: string
    '#text': string
  },
  image: Image[]
  mbid: string
  url: string
  name: string
  '@attr': {
    rank: string
  }
  playcount: string
}

export interface TrackChart {
  track: TrackInChart[]
  '@attr': {
    from: string
    user: string
    to: string
  }
}
