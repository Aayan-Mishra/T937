
"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter } from 'next/navigation';
import type { User } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { Playlist, Track } from "@/lib/types";
import { PlaylistView } from "@/components/playlist-view";
import { VinylPlayer } from "@/components/vinyl-player";
import { Button } from "@/components/ui/button";
import { Github, LogOut, Music, Youtube } from "lucide-react";
import { useSpotifyPlayer } from "@/hooks/use-spotify-player";
import { useToast } from "@/hooks/use-toast";

const MusicPet = ({ isPlaying }: { isPlaying: boolean }) => {
  return (
    <div className="absolute bottom-5 left-5 z-20 group" title="T-937's little helper!">
      <style jsx>{`
            .head {
                animation: ${isPlaying ? 'head-bob 0.8s ease-in-out infinite' : 'none'};
                transform-origin: bottom center;
            }
            .body {
                 animation: ${isPlaying ? 'body-bob 0.8s ease-in-out infinite' : 'none'};
            }
        `}</style>
      <svg
        width="80"
        height="80"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <g className="body">
          <path d="M30 95C30 86.7157 36.7157 80 45 80H55C63.2843 80 70 86.7157 70 95V95H30V95Z" fill="hsl(var(--secondary))" stroke="hsl(var(--foreground))" strokeWidth="3"/>
          <rect x="38" y="85" width="24" height="5" rx="2.5" fill="hsl(var(--accent))" />
        </g>
        <g className="head">
            <circle cx="50" cy="55" r="25" fill="hsl(var(--secondary))" stroke="hsl(var(--foreground))" strokeWidth="3" />
            <circle cx="42" cy="55" r="3" fill="hsl(var(--foreground))" />
            <circle cx="58" cy="55" r="3" fill="hsl(var(--foreground))" />
            <path d="M 45 65 Q 50 72 55 65" stroke="hsl(var(--foreground))" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M49,30 L40,20" stroke="hsl(var(--foreground))" strokeWidth="3" strokeLinecap="round" />
            <path d="M51,30 L60,20" stroke="hsl(var(--foreground))" strokeWidth="3" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
};

export function MusicPlayerPage({ user, isSpotifyConnected: initialIsSpotifyConnected, accessToken }: { user: User, isSpotifyConnected: boolean, accessToken: string | null }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(initialIsSpotifyConnected);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(true);
  
  const [playbackSource, setPlaybackSource] = useState<'spotify' | 'youtube'>('spotify');
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isLooping, setIsLooping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const youtubePlayerRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { 
    play: spotifyPlay, 
    togglePlay: spotifyTogglePlay, 
    nextTrack: sdkNextTrack,
    previousTrack: sdkPrevTrack,
    setVolume: sdkSetVolume,
    seek: sdkSeek,
    setRepeat: sdkSetRepeat,
    playerState: sdkPlayerState,
    currentTrack: sdkCurrentTrack, 
    isPlaying: sdkIsPlaying,
    error: sdkError,
    deviceId
  } = useSpotifyPlayer(accessToken);

  const isPremiumRequiredError = sdkError?.type === 'account';

  useEffect(() => {
    if (sdkError && sdkError.type !== 'account') {
      toast({
        variant: "destructive",
        title: "Playback Error",
        description: sdkError.message,
      });
    }
  }, [sdkError, toast]);
  
  useEffect(() => {
    if (playbackSource === 'spotify') {
      setIsPlaying(sdkIsPlaying);
      if (sdkPlayerState) {
        setProgress(sdkPlayerState.position);
        setDuration(sdkPlayerState.duration);
        setIsLooping(sdkPlayerState.repeat_mode === 1); // 1 is for track repeat
      }
    }
  }, [sdkIsPlaying, playbackSource, sdkPlayerState]);

  useEffect(() => {
    if (playbackSource === 'spotify' && sdkCurrentTrack) {
        setCurrentTrack({
          id: sdkCurrentTrack.id!,
          uri: sdkCurrentTrack.uri,
          title: sdkCurrentTrack.name,
          artist: sdkCurrentTrack.artists.map(a => a.name).join(', '),
          album: sdkCurrentTrack.album.name,
          duration: sdkCurrentTrack.duration_ms,
          albumArt: sdkCurrentTrack.album.images?.[0]?.url || 'https://placehold.co/300x300.png',
        });
    }
  }, [sdkCurrentTrack, playbackSource]);

  useEffect(() => {
    if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
    }
    if (isPlaying) {
        progressIntervalRef.current = setInterval(() => {
            if (playbackSource === 'spotify' && sdkPlayerState) {
                setProgress(prev => prev + 1000 > sdkPlayerState.duration ? sdkPlayerState.duration : prev + 1000);
            } else if (playbackSource === 'youtube' && youtubePlayerRef.current) {
                const newProgress = youtubePlayerRef.current.getCurrentTime() * 1000;
                setProgress(newProgress);
            }
        }, 1000);
    }
    return () => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
        }
    };
  }, [isPlaying, playbackSource, sdkPlayerState]);

  const currentTrackIndex = useMemo(() => {
      if (!currentTrack || !selectedPlaylist) return null;
      const index = selectedPlaylist.tracks.findIndex(t => t.id === currentTrack.id);
      return index > -1 ? index : null;
  }, [currentTrack, selectedPlaylist]);

  useEffect(() => {
    setIsSpotifyConnected(initialIsSpotifyConnected);
  }, [initialIsSpotifyConnected]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!accessToken) {
        setIsLoadingPlaylists(false);
        return;
      }
      setIsLoadingPlaylists(true);
      try {
        const response = await fetch('/api/spotify/playlists');
        if (!response.ok) {
          if (response.status === 401) {
            setIsSpotifyConnected(false);
            document.cookie = 'spotify_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            document.cookie = 'spotify_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          }
          throw new Error('Failed to fetch playlists');
        }
        const data: Playlist[] = await response.json();
        setPlaylists(data);
      } catch (error) {
        console.error(error);
        setPlaylists([]);
      } finally {
        setIsLoadingPlaylists(false);
      }
    };

    if (isSpotifyConnected) {
      fetchPlaylists();
    } else {
      setPlaylists([]);
      setSelectedPlaylist(null);
      setIsLoadingPlaylists(false);
    }
  }, [isSpotifyConnected, accessToken]);
  
  const handleLogout = async () => {
    await signOut(auth);
    document.cookie = 'spotify_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'spotify_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
  };

  const handleSelectPlaylist = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
  };

  const fetchTracksForPlaylist = async (playlistId: string): Promise<void> => {
    const playlistIndex = playlists.findIndex(p => p.id === playlistId);
    if (playlistIndex === -1 || playlists[playlistIndex].tracks.length > 0) {
      return;
    }

    try {
      const response = await fetch(`/api/spotify/playlists/${playlistId}/tracks`);
      if (!response.ok) throw new Error(`Failed to fetch tracks for ${playlistId}`);
      const tracks: Track[] = await response.json();

      setPlaylists(prevPlaylists => {
        const newPlaylists = [...prevPlaylists];
        newPlaylists[playlistIndex].tracks = tracks;
        return newPlaylists;
      });

      if (selectedPlaylist?.id === playlistId) {
        setSelectedPlaylist(prev => prev ? { ...prev, tracks } : null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleYoutubeSearch = useCallback(async (track: Track) => {
      setCurrentTrack(track);
      setDuration(track.duration);
      setProgress(0);
      try {
        const response = await fetch(`/api/youtube/search?query=${encodeURIComponent(`${track.title} ${track.artist}`)}`);
        if (!response.ok) throw new Error('YouTube search failed');
        const data = await response.json();
        setYoutubeVideoId(data.videoId);
      } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'YouTube Search Failed',
            description: 'Could not find a matching video on YouTube.'
        });
      }
  }, [toast]);

  const handleSelectTrack = useCallback((trackIndex: number) => {
    if (!selectedPlaylist) return;
    const trackToPlay = selectedPlaylist.tracks[trackIndex];
    
    if (playbackSource === 'spotify') {
        if (trackToPlay.id === sdkCurrentTrack?.id) {
            spotifyTogglePlay();
        } else {
            const trackUris = selectedPlaylist.tracks.map(t => t.uri);
            spotifyPlay({ uris: trackUris, offset: { position: trackIndex }});
        }
    } else {
        handleYoutubeSearch(trackToPlay);
    }
  }, [selectedPlaylist, playbackSource, sdkCurrentTrack, spotifyTogglePlay, spotifyPlay, handleYoutubeSearch]);
  
  const handleTogglePlay = useCallback(() => {
    if (playbackSource === 'spotify') {
      spotifyTogglePlay();
    } else if (youtubePlayerRef.current) {
      const playerState = youtubePlayerRef.current.getPlayerState();
      if (playerState === 1) { // 1 === playing
        youtubePlayerRef.current.pauseVideo();
      } else {
        youtubePlayerRef.current.playVideo();
      }
    }
  }, [playbackSource, spotifyTogglePlay]);

  const handleNextTrack = useCallback(() => {
    if (playbackSource === 'spotify') {
        sdkNextTrack();
    } else {
        if (!selectedPlaylist || currentTrackIndex === null) return;
        const nextIndex = (currentTrackIndex + 1) % selectedPlaylist.tracks.length;
        handleYoutubeSearch(selectedPlaylist.tracks[nextIndex]);
    }
  }, [playbackSource, sdkNextTrack, selectedPlaylist, currentTrackIndex, handleYoutubeSearch]);

  const handlePrevTrack = useCallback(() => {
    if (playbackSource === 'spotify') {
        sdkPrevTrack();
    } else {
        if (!selectedPlaylist || currentTrackIndex === null) return;
        const prevIndex = (currentTrackIndex - 1 + selectedPlaylist.tracks.length) % selectedPlaylist.tracks.length;
        handleYoutubeSearch(selectedPlaylist.tracks[prevIndex]);
    }
  }, [playbackSource, sdkPrevTrack, selectedPlaylist, currentTrackIndex, handleYoutubeSearch]);

  const handleSeek = useCallback((newProgress: number[]) => {
      const newTime = newProgress[0];
      setProgress(newTime);
      if (playbackSource === 'spotify') {
          sdkSeek(newTime);
      } else if (youtubePlayerRef.current) {
          youtubePlayerRef.current.seekTo(newTime / 1000, true);
      }
  }, [playbackSource, sdkSeek]);

  const handleLoopToggle = useCallback(() => {
      const newLoopState = !isLooping;
      setIsLooping(newLoopState);
      if (playbackSource === 'spotify') {
          sdkSetRepeat(newLoopState ? 'track' : 'off');
      }
  }, [isLooping, playbackSource, sdkSetRepeat]);


  const handleVolumeChange = useCallback((newVolume: number[]) => {
    setVolume(newVolume[0]);
    if (playbackSource === 'spotify') {
        sdkSetVolume(newVolume[0]);
    } else if (youtubePlayerRef.current) {
        youtubePlayerRef.current.setVolume(newVolume[0]);
    }
  }, [playbackSource, sdkSetVolume]);

  const handleYoutubeFallback = useCallback(() => {
    setPlaybackSource('youtube');
    if (currentTrack) {
        handleYoutubeSearch(currentTrack);
    }
  }, [currentTrack, handleYoutubeSearch]);

  const onYoutubePlayerReady = (event: any) => {
    youtubePlayerRef.current = event.target;
    handleVolumeChange([volume]);
  };
  
  const onYoutubePlayerStateChange = (event: any) => {
    // YouTube Player States: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
    if (event.data === 1) { // Playing
        setIsPlaying(true);
        setDuration(youtubePlayerRef.current.getDuration() * 1000);
    } else { // Paused, ended, etc.
        setIsPlaying(false);
    }
    if (event.data === 0) { // On ended, play next track or loop
        if (isLooping) {
            youtubePlayerRef.current.seekTo(0);
            youtubePlayerRef.current.playVideo();
        } else {
            handleNextTrack();
        }
    }
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

  const renderYoutubeFallback = () => (
    <div className="flex flex-col items-center justify-center text-center p-4">
        <h3 className="text-xl font-headline text-primary">Spotify Premium Required</h3>
        <p className="text-muted-foreground mt-2 mb-4">Playback via Spotify requires a Premium account.</p>
        <Button onClick={handleYoutubeFallback}>
            <Youtube className="mr-2 h-5 w-5" />
            Fallback to YouTube
        </Button>
    </div>
  )

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
        <>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 flex-grow">
          <div className="lg:col-span-3 flex items-center justify-center p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-primary/10">
            <VinylPlayer
              track={currentTrack}
              isPlaying={isPlaying}
              onPlayPause={handleTogglePlay}
              onNext={handleNextTrack}
              onPrev={handlePrevTrack}
              volume={volume}
              onVolumeChange={handleVolumeChange}
              fallbackUI={isPremiumRequiredError && playbackSource === 'spotify' ? renderYoutubeFallback() : undefined}
              progress={progress}
              duration={duration}
              onSeek={handleSeek}
              isLooping={isLooping}
              onLoopToggle={handleLoopToggle}
              playbackSource={playbackSource}
              youtubeVideoId={youtubeVideoId}
              onYoutubePlayerReady={onYoutubePlayerReady}
              onYoutubePlayerStateChange={onYoutubePlayerStateChange}
            />
          </div>
          <div className="lg:col-span-2 h-full">
            <PlaylistView
              playlists={playlists}
              selectedPlaylist={selectedPlaylist}
              currentTrackIndex={currentTrackIndex}
              onSelectPlaylist={handleSelectPlaylist}
              onSelectTrack={handleSelectTrack}
              onFetchTracks={fetchTracksForPlaylist}
              isPlaying={isPlaying}
              isLoading={isLoadingPlaylists}
            />
          </div>
        </div>
        <MusicPet isPlaying={isPlaying} />
        </>
      )}
    </main>
  );
}
