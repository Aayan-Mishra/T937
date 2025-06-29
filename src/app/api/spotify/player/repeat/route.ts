import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function PUT(request: Request) {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('spotify_access_token')?.value;

    if (!accessToken) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('device_id');
    const state = searchParams.get('state');

    if (!deviceId || !state) {
        return NextResponse.json({ error: 'Device ID and state are required' }, { status: 400 });
    }
    
    if (!['track', 'context', 'off'].includes(state)) {
        return NextResponse.json({ error: 'Invalid repeat state' }, { status: 400 });
    }

    try {
        const response = await fetch(`https://api.spotify.com/v1/me/player/repeat?state=${state}&device_id=${deviceId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Spotify repeat API Error:', errorData);
            return NextResponse.json({ error: 'Failed to set repeat mode', details: errorData }, { status: response.status });
        }
        
        return new NextResponse(null, { status: 204 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to set repeat mode' }, { status: 500 });
    }
}
