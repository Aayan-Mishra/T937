import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { Playlist } from '@/lib/types';

async function fetchFromSpotify(url: string, accessToken: string) {
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });
    if (!response.ok) {
        console.error('Spotify API Error:', await response.text());
        const error = new Error(`Spotify API request failed: ${response.statusText}`);
        (error as any).status = response.status;
        throw error;
    }
    return response.json();
}

export async function GET() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('spotify_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const playlistsData = await fetchFromSpotify('https://api.spotify.com/v1/me/playlists?limit=50', accessToken);

    const playlists: Playlist[] = playlistsData.items.map((playlist: any) => ({
        id: playlist.id,
        name: playlist.name,
        description: playlist.description || 'No description',
        tracks: [], // Initially empty
        tracksHref: playlist.tracks.href,
        coverArt: playlist.images?.[0]?.url || 'https://placehold.co/300x300.png',
    }));
    
    return NextResponse.json(playlists);

  } catch (error: any) {
    if ((error as any).status === 401) {
        // Token likely expired
        return NextResponse.json({ error: 'Spotify token expired' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Failed to fetch playlists' }, { status: 500 });
  }
}
