export interface Track {
  id: string;
  uri: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  albumArt: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  tracks: Track[];
  tracksHref: string;
  coverArt: string;
}
