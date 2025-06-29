import { NextResponse } from 'next/server';
import querystring from 'querystring';

export async function GET() {
  const scope = [
    'playlist-read-private',
    'playlist-read-collaborative',
    'user-modify-playback-state',
    'user-read-playback-state',
    'user-read-currently-playing',
    'streaming',
    'user-read-email',
    'user-read-private'
  ].join(' ');

  const redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:9002/api/auth/callback/spotify';
  const clientId = process.env.SPOTIFY_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json({ error: 'Spotify Client ID not configured' }, { status: 500 });
  }
  
  const queryParams = querystring.stringify({
    response_type: 'code',
    client_id: clientId,
    scope: scope,
    redirect_uri: redirectUri,
  });

  return NextResponse.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
}
