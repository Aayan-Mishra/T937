import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('Spotify auth error:', error);
    return NextResponse.redirect(new URL('/?error=spotify_login_failed', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?error=missing_code', request.url));
  }
  
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:9002/api/auth/callback/spotify';
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Missing Spotify credentials in environment variables');
    return NextResponse.redirect(new URL('/?error=configuration_error', request.url));
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Spotify token error:', data);
    return NextResponse.redirect(new URL(`/?error=${data.error_description || 'token_exchange_failed'}`, request.url));
  }

  const { access_token, refresh_token, expires_in } = data;

  const responseRedirect = NextResponse.redirect(new URL('/', request.url));

  responseRedirect.cookies.set('spotify_access_token', access_token, {
    secure: process.env.NODE_ENV === 'production',
    maxAge: expires_in, // expires_in is in seconds
    path: '/',
  });

  responseRedirect.cookies.set('spotify_refresh_token', refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  return responseRedirect;
}
