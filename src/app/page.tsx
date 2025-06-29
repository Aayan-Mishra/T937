"use client";

import { useState, useEffect } from "react";
import { playlists as mockPlaylists } from "@/lib/mock-data";
import type { Playlist, Track } from "@/lib/types";
import { PlaylistView } from "@/components/playlist-view";
import { VinylPlayer } from "@/components/vinyl-player";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Github, Music } from "lucide-react";

export default function Home() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (isSpotifyConnected) {
      // Here you would fetch playlists from Spotify API
      setPlaylists(mockPlaylists);
      setSelectedPlaylist(mockPlaylists[0]);
      toast({
        title: "Spotify Connected!",
        description: "Your playlists have been loaded.",
      });
    } else {
      setPlaylists([]);
      setSelectedPlaylist(null);
      setCurrentTrackIndex(null);
      setIsPlaying(false);
    }
  }, [isSpotifyConnected, toast]);

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

  const handleConnectSpotify = () => {
    setIsSpotifyConnected(true);
  };

  if (!isSpotifyConnected) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
        <div className="text-center">
            <h1 className="text-6xl font-headline text-primary font-bold">T937</h1>
            <p className="mt-4 text-xl text-muted-foreground">Your vintage music player.</p>
        </div>
        <div className="mt-12 p-8 border-2 border-dashed border-primary/30 rounded-lg text-center">
          <p className="mb-4">Connect your Spotify account to begin.</p>
          <Button onClick={handleConnectSpotify} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Music className="mr-2 h-5 w-5" />
            Connect to Spotify
          </Button>
        </div>
        <footer className="absolute bottom-4 text-center text-muted-foreground">
          <p>Built for the modern nostalgist.</p>
        </footer>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen w-full p-4 lg:p-8 overflow-hidden">
      <div className="absolute inset-0 bg-background -z-10"></div>
      <div className="absolute top-4 right-4">
        <Button variant="ghost" size="icon" asChild>
          <a href="https://github.com/firebase/firebase-genkit" target="_blank" rel="noopener noreferrer" aria-label="Github repository">
            <Github className="h-6 w-6 text-accent" />
          </a>
        </Button>
      </div>
      <header className="text-center mb-8">
        <h1 className="text-4xl font-headline text-primary">T937</h1>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
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
    </main>
  );
}
