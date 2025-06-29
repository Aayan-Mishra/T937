import type { Playlist } from './types';

export const playlists: Playlist[] = [
  {
    id: 'p1',
    name: 'Vintage Vibes',
    description: 'Classic hits from the 60s and 70s.',
    tracks: [
      { id: 't1', title: 'Bohemian Rhapsody', artist: 'Queen', album: 'A Night at the Opera', duration: '5:55', albumArt: 'https://placehold.co/300x300.png' },
      { id: 't2', title: 'Stairway to Heaven', artist: 'Led Zeppelin', album: 'Led Zeppelin IV', duration: '8:02', albumArt: 'https://placehold.co/300x300.png' },
      { id: 't3', title: 'Hotel California', artist: 'Eagles', album: 'Hotel California', duration: '6:30', albumArt: 'https://placehold.co/300x300.png' },
      { id: 't4', title: 'Like a Rolling Stone', artist: 'Bob Dylan', album: 'Highway 61 Revisited', duration: '6:13', albumArt: 'https://placehold.co/300x300.png' },
    ],
  },
  {
    id: 'p2',
    name: '80s Power Ballads',
    description: 'Epic love songs and rock anthems.',
    tracks: [
      { id: 't5', title: 'Total Eclipse of the Heart', artist: 'Bonnie Tyler', album: 'Faster Than the Speed of Night', duration: '4:29', albumArt: 'https://placehold.co/300x300.png' },
      { id: 't6', title: 'Every Breath You Take', artist: 'The Police', album: 'Synchronicity', duration: '4:13', albumArt: 'https://placehold.co/300x300.png' },
      { id: 't7', title: 'With or Without You', artist: 'U2', album: 'The Joshua Tree', duration: '4:56', albumArt: 'https://placehold.co/300x300.png' },
    ],
  },
  {
    id: 'p3',
    name: 'Acoustic Gold',
    description: 'Stripped-back versions of timeless songs.',
    tracks: [
      { id: 't8', title: 'Yesterday', artist: 'The Beatles', album: 'Help!', duration: '2:05', albumArt: 'https://placehold.co/300x300.png' },
      { id: 't9', title: 'Tears in Heaven', artist: 'Eric Clapton', album: 'Unplugged', duration: '4:36', albumArt: 'https://placehold.co/300x300.png' },
      { id: 't10', title: 'Hallelujah', artist: 'Jeff Buckley', album: 'Grace', duration: '6:53', albumArt: 'https://placehold.co/300x300.png' },
      { id: 't11', title: 'Fast Car', artist: 'Tracy Chapman', album: 'Tracy Chapman', duration: '4:58', albumArt: 'https://placehold.co/300x300.png' },
    ],
  },
];
