
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { Track } from '@/lib/types';

export async function GET(request: Request) {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('spotify_access_token')?.value;

    if (!accessToken) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const type = 'track';
    const limit = 20; // Limit to 20 results

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const spotifyApiUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`;

    try {
        const response = await fetch(spotifyApiUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Spotify Search API Error:', errorData);
            return NextResponse.json({ error: 'Failed to search Spotify', details: errorData }, { status: response.status });
        }

        const data = await response.json();
        const tracks: Track[] = data.tracks.items.map((track: any) => {
            if (!track || !track.id) return null;
            return {
                id: track.id,
                uri: track.uri,
                title: track.name,
                artist: track.artists.map((a: any) => a.name).join(', '),
                album: track.album.name,
                duration: track.duration_ms,
                albumArt: track.album.images?.[0]?.url || 'https://placehold.co/300x300.png',
            };
        }).filter(Boolean);

        return NextResponse.json(tracks);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to search tracks' }, { status: 500 });
    }
}
