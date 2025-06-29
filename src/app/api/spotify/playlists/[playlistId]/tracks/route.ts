import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { Track } from '@/lib/types';

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Number(((ms % 60000) / 1000).toFixed(0));
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

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

export async function GET(
    request: Request,
    { params }: { params: { playlistId: string } }
) {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('spotify_access_token')?.value;

    if (!accessToken) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { playlistId } = params;
    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

    try {
        const tracksData = await fetchFromSpotify(url, accessToken);

        const tracks: Track[] = tracksData.items
            .map(({ track }: any) => {
                if (!track || !track.id) return null; // Filter out local or unplayable tracks
                return {
                    id: track.id,
                    title: track.name,
                    artist: track.artists.map((a: any) => a.name).join(', '),
                    album: track.album.name,
                    duration: formatDuration(track.duration_ms),
                    albumArt: track.album.images?.[0]?.url || 'https://placehold.co/300x300.png',
                };
            })
            .filter(Boolean); // remove nulls

        return NextResponse.json(tracks);
    } catch (error: any) {
        if ((error as any).status === 401) {
            return NextResponse.json({ error: 'Spotify token expired' }, { status: 401 });
        }
        return NextResponse.json({ error: error.message || 'Failed to fetch tracks' }, { status: 500 });
    }
}
