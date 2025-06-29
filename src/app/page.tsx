import { cookies } from 'next/headers';
import { MusicPlayerPage } from '@/components/music-player-page';

export default function Home() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('spotify_access_token');
  const isLoggedIn = !!accessToken;

  return <MusicPlayerPage isLoggedIn={isLoggedIn} />;
}
