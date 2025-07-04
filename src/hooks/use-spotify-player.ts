
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any; // Using 'any' as official types are not available
  }
}

interface PlaybackError {
  message: string;
}

export type PlayerError = { type: 'initialization' | 'authentication' | 'account', message: string };

interface SpotifyPlayer {
  _options: {
    name: string;
    getOAuthToken: (cb: (token: string) => void) => void;
    volume: number;
  };
  connect: () => Promise<boolean>;
  disconnect: () => void;
  addListener: (event: string, callback: (payload: any) => void) => void;
  removeListener: (event: string) => void;
  getCurrentState: () => Promise<Spotify.PlaybackState | null>;
  getVolume: () => Promise<number>;
  setVolume: (volume: number) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  togglePlay: () => Promise<void>;
  seek: (position_ms: number) => Promise<void>;
  previousTrack: () => Promise<void>;
  nextTrack: () => Promise<void>;
}

interface PlayOptions {
    uris: string[];
    offset?: { position: number };
}

export function useSpotifyPlayer(accessToken: string | null) {
  const playerRef = useRef<SpotifyPlayer | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [playerState, setPlayerState] = useState<Spotify.PlaybackState | null>(null);
  const [error, setError] = useState<PlayerError | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer: SpotifyPlayer = new window.Spotify.Player({
        name: 'T937 Web Player',
        getOAuthToken: (cb: (token: string) => void) => {
          if (accessToken) {
            cb(accessToken);
          }
        },
        volume: 0.5,
      });

      playerRef.current = spotifyPlayer;

      spotifyPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
        setDeviceId(device_id);
      });

      spotifyPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        console.warn('Device ID has gone offline', device_id);
        setDeviceId(null);
      });

      spotifyPlayer.addListener('player_state_changed', (state: Spotify.PlaybackState | null) => {
        if (!state) {
            setPlayerState(null);
            setIsActive(false);
            return;
        }
        setPlayerState(state);
        setIsActive(true);
      });

      spotifyPlayer.addListener('initialization_error', ({ message }: PlaybackError) => {
        console.error('Initialization Error:', message);
        setError({ type: 'initialization', message: 'Failed to initialize player. Please refresh.'});
      });
      spotifyPlayer.addListener('authentication_error', ({ message }: PlaybackError) => {
        console.error('Authentication Error:', message);
        setError({ type: 'authentication', message: 'Authentication failed. Please reconnect Spotify.'});
      });
      spotifyPlayer.addListener('account_error', ({ message }: PlaybackError) => {
        console.error('Account Error:', message);
        setError({ type: 'account', message: 'Spotify Premium is required for playback.'});
      });
      
      spotifyPlayer.connect();
    };

    return () => {
        playerRef.current?.disconnect();
        if (script.parentNode) {
            script.parentNode.removeChild(script);
        }
    }
  }, [accessToken]);

  const play = useCallback(async ({ uris, offset }: PlayOptions) => {
    if (!deviceId || !accessToken) {
      setError({ type: 'initialization', message: "Player is not ready."});
      return;
    }

    try {
      setError(null);
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        body: JSON.stringify({ uris, offset }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
    } catch (e) {
      console.error(e);
      setError({ type: 'initialization', message: "Could not start playback."});
    }
  }, [deviceId, accessToken]);

  const setRepeat = useCallback(async (state: 'track' | 'context' | 'off') => {
      if (!deviceId) return;
      try {
        await fetch(`/api/spotify/player/repeat?device_id=${deviceId}&state=${state}`, {
            method: 'PUT',
        });
      } catch (e) {
        console.error("Failed to set repeat mode", e);
      }
  }, [deviceId]);

  const togglePlay = useCallback(() => playerRef.current?.togglePlay(), []);
  const nextTrack = useCallback(() => playerRef.current?.nextTrack(), []);
  const previousTrack = useCallback(() => playerRef.current?.previousTrack(), []);
  const seek = useCallback((position_ms: number) => playerRef.current?.seek(position_ms), []);
  const setVolume = useCallback((volume: number) => playerRef.current?.setVolume(volume / 100), []);

  const currentTrack = playerState?.track_window.current_track;
  const isPlaying = playerState ? !playerState.paused : false;

  return {
    play,
    togglePlay,
    nextTrack,
    previousTrack,
    seek,
    setVolume,
    setRepeat,
    currentTrack,
    isPlaying,
    playerState,
    error,
    deviceId
  };
}
