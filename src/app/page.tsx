'use client';

import { MusicPlayerPage } from '@/components/music-player-page';
import { useAuth } from '@/context/auth-context';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function getSpotifyCookie() {
    if (typeof window === 'undefined') {
        return false;
    }
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('spotify_access_token='))
        ?.split('=')[1];
    return !!cookieValue;
}

function getSpotifyAccessToken() {
    if (typeof window === 'undefined') return null;
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('spotify_access_token='))
        ?.split('=')[1];
    return cookieValue || null;
}


export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [accessToken, setAccessToken] = useState<string|null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    const connected = getSpotifyCookie();
    setIsSpotifyConnected(connected);
    if (connected) {
        setAccessToken(getSpotifyAccessToken());
    } else {
        setAccessToken(null);
    }
  }, []);

  if (loading || !user) {
    return null;
  }

  return <MusicPlayerPage user={user} isSpotifyConnected={isSpotifyConnected} accessToken={accessToken} />;
}
