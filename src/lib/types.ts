export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  albumArt: string;
}

export interface Playlist {
  id:string;
  name: string;
  description: string;
  tracks: Track[];
}
