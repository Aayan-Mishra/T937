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


export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    // Check for cookie changes, e.g., after Spotify redirect
    const checkCookie = () => setIsSpotifyConnected(getSpotifyCookie());
    checkCookie();
    // Re-check when the page becomes visible, in case of redirects
    document.addEventListener('visibilitychange', checkCookie);
    return () => document.removeEventListener('visibilitychange', checkCookie);
  }, []);

  if (loading || !user) {
    // AuthProvider shows a loading skeleton, so we can return null here
    return null;
  }

  return <MusicPlayerPage user={user} isSpotifyConnected={isSpotifyConnected} />;
}
