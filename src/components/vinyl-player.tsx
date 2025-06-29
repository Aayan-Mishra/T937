
"use client";

import type { Track } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume1, Volume2, VolumeX, Repeat } from "lucide-react";
import Image from 'next/image';
import YouTube from 'react-youtube';

interface VinylPlayerProps {
  track: Track | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  volume: number;
  onVolumeChange: (volume: number[]) => void;
  fallbackUI?: React.ReactNode;
  progress: number;
  duration: number;
  onSeek: (time: number[]) => void;
  isLooping: boolean;
  onLoopToggle: () => void;
  playbackSource: 'spotify' | 'youtube';
  youtubeVideoId: string | null;
  onYoutubePlayerReady: (event: any) => void;
  onYoutubePlayerStateChange: (event: any) => void;
}

const formatTime = (ms: number) => {
    if (isNaN(ms) || ms < 0) return '0:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export function VinylPlayer({
  track,
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  volume,
  onVolumeChange,
  fallbackUI,
  progress,
  duration,
  onSeek,
  isLooping,
  onLoopToggle,
  playbackSource,
  youtubeVideoId,
  onYoutubePlayerReady,
  onYoutubePlayerStateChange
}: VinylPlayerProps) {
  
  const VolumeIcon = () => {
    if (volume === 0) return <VolumeX className="text-accent" />;
    if (volume < 50) return <Volume1 className="text-accent" />;
    return <Volume2 className="text-accent" />;
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="relative w-full aspect-square max-w-md rounded-lg shadow-2xl overflow-hidden mb-8">
        {playbackSource === 'youtube' && youtubeVideoId ? (
          <>
             <YouTube
                videoId={youtubeVideoId}
                opts={{
                    playerVars: {
                      autoplay: 1,
                      controls: 0,
                      modestbranding: 1,
                    },
                }}
                onReady={onYoutubePlayerReady}
                onStateChange={onYoutubePlayerStateChange}
                className="absolute inset-0 w-full h-full"
                iframeClassName="absolute inset-0 w-full h-full"
             />
             <div className="absolute inset-0 bg-black/20" />
          </>
        ) : (
          <Image
              key={track?.id || 'placeholder'}
              src={track?.albumArt || "https://placehold.co/400x400/111111/111111.png"}
              alt={track?.album || "Album Art"}
              fill
              sizes="(max-width: 768px) 80vw, 448px"
              className={`object-cover animate-fade-in`}
              data-ai-hint="album cover"
          />
        )}
      </div>

      <Card className="w-full max-w-md bg-transparent border-none shadow-none">
        <CardHeader className="text-center min-h-[90px] p-4">
          <CardTitle className="text-3xl font-headline text-primary truncate">{track?.title || "Select a song"}</CardTitle>
          <CardDescription className="text-lg text-muted-foreground truncate">{track?.artist || "to start playing"}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-2">
            {track && (
              <div className="w-full max-w-sm px-2">
                  <Slider
                      value={[progress]}
                      max={duration}
                      step={1000}
                      onValueChange={onSeek}
                      disabled={!track}
                      aria-label="Song progress"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{formatTime(progress)}</span>
                      <span>{formatTime(duration)}</span>
                  </div>
              </div>
            )}
            <div className="flex items-center gap-4 mt-2">
              {fallbackUI || (
                <>
                  <Button variant="ghost" size="icon" onClick={onPrev} disabled={!track} aria-label="Previous track">
                    <SkipBack className="w-8 h-8 text-accent" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-16 h-16" onClick={onPlayPause} disabled={!track} aria-label={isPlaying ? 'Pause' : 'Play'}>
                    {isPlaying ? <Pause className="w-12 h-12 text-primary fill-primary" /> : <Play className="w-12 h-12 text-primary fill-primary" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={onNext} disabled={!track} aria-label="Next track">
                    <SkipForward className="w-8 h-8 text-accent" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={onLoopToggle} disabled={!track} aria-label="Toggle loop">
                    <Repeat className={`w-6 h-6 ${isLooping ? 'text-primary' : 'text-accent'}`} />
                  </Button>
                </>
              )}
            </div>
        </CardContent>
        <CardFooter className="flex items-center gap-4 justify-center mt-2">
          <VolumeIcon />
          <Slider
            value={[volume]}
            max={100}
            step={1}
            onValueChange={onVolumeChange}
            className="w-[150px]"
            disabled={!track}
            aria-label="Volume control"
          />
        </CardFooter>
      </Card>
    </div>
  );
}
