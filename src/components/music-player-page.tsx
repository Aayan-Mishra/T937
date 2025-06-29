"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import type { User } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { playlists as mockPlaylists } from "@/lib/mock-data";
import type { Playlist, Track } from "@/lib/types";
import { PlaylistView } from "@/components/playlist-view";
import { VinylPlayer } from "@/components/vinyl-player";
import { Button } from "@/components/ui/button";
import { Github, LogOut, Music } from "lucide-react";

export function MusicPlayerPage({ user, isSpotifyConnected: initialIsSpotifyConnected }: { user: User, isSpotifyConnected: boolean }) {
  const router = useRouter();
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(initialIsSpotifyConnected);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  
  useEffect(() => {
    setIsSpotifyConnected(initialIsSpotifyConnected);
  }, [initialIsSpotifyConnected]);

  useEffect(() => {
    if (isSpotifyConnected) {
      // TODO: Fetch playlists from Spotify API instead of using mock data
      setPlaylists(mockPlaylists);
      if (mockPlaylists.length > 0) {
        setSelectedPlaylist(mockPlaylists[0]);
      }
    } else {
      setPlaylists([]);
      setSelectedPlaylist(null);
      setCurrentTrackIndex(null);
      setIsPlaying(false);
    }
  }, [isSpotifyConnected]);
  
  const handleLogout = async () => {
    await signOut(auth);
    // Also clear spotify cookies
    document.cookie = 'spotify_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'spotify_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
  };

  const currentTrack: Track | null = selectedPlaylist && currentTrackIndex !== null
    ? selectedPlaylist.tracks[currentTrackIndex]
    : null;

  const handleSelectPlaylist = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setCurrentTrackIndex(0);
    setIsPlaying(true);
  };

  const handleSelectTrack = (trackIndex: number) => {
    if (selectedPlaylist) {
      if(selectedPlaylist.tracks[trackIndex].id === currentTrack?.id) {
        setIsPlaying(!isPlaying);
      } else {
        setCurrentTrackIndex(trackIndex);
        setIsPlaying(true);
      }
    }
  };

  const handlePlayPause = () => {
    if (currentTrack) {
      setIsPlaying(!isPlaying);
    }
  };
  
  const handleNextTrack = () => {
    if (selectedPlaylist && currentTrackIndex !== null) {
      const nextTrackIndex = (currentTrackIndex + 1) % selectedPlaylist.tracks.length;
      setCurrentTrackIndex(nextTrackIndex);
      setIsPlaying(true);
    }
  };

  const handlePrevTrack = () => {
    if (selectedPlaylist && currentTrackIndex !== null) {
      const prevTrackIndex = (currentTrackIndex - 1 + selectedPlaylist.tracks.length) % selectedPlaylist.tracks.length;
      setCurrentTrackIndex(prevTrackIndex);
      setIsPlaying(true);
    }
  };
  
  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0]);
  };

  const renderSpotifyConnect = () => (
     <div className="flex flex-col items-center justify-center flex-grow">
        <div className="text-center">
            <h2 className="text-3xl font-headline text-primary font-bold">Connect to Spotify</h2>
            <p className="mt-2 text-lg text-muted-foreground">Link your Spotify account to listen to your playlists.</p>
        </div>
        <div className="mt-8 p-8 border-2 border-dashed border-primary/30 rounded-lg text-center">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <a href="/api/auth/login/spotify">
              <Music className="mr-2 h-5 w-5" />
              Connect to Spotify
            </a>
          </Button>
        </div>
      </div>
  );

  return (
    <main className="relative min-h-screen w-full p-4 lg:p-8 flex flex-col">
      <div className="absolute inset-0 bg-background -z-10"></div>
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
            <LogOut className="h-6 w-6 text-accent" />
        </Button>
        <Button variant="ghost" size="icon" asChild>
          <a href="https://github.com/firebase/firebase-genkit" target="_blank" rel="noopener noreferrer" aria-label="Github repository">
            <Github className="h-6 w-6 text-accent" />
          </a>
        </Button>
      </div>
      <header className="text-center mb-8">
        <h1 className="text-4xl font-headline text-primary">T937</h1>
      </header>

      {!isSpotifyConnected ? renderSpotifyConnect() : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow">
          <div className="flex items-center justify-center">
            <VinylPlayer
              track={currentTrack}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onNext={handleNextTrack}
              onPrev={handlePrevTrack}
              volume={volume}
              onVolumeChange={handleVolumeChange}
            />
          </div>
          <div className="h-full">
            <PlaylistView
              playlists={playlists}
              selectedPlaylist={selectedPlaylist}
              currentTrackIndex={currentTrackIndex}
              onSelectPlaylist={handleSelectPlaylist}
              onSelectTrack={handleSelectTrack}
              isPlaying={isPlaying}
            />
          </div>
        </div>
      )}
    </main>
  );
}
