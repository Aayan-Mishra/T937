
"use client";

import type { Track } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume1, Volume2, VolumeX, Repeat } from "lucide-react";
import Image from 'next/image';

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
  onLoopToggle
}: VinylPlayerProps) {
  
  const VolumeIcon = () => {
    if (volume === 0) return <VolumeX className="text-accent" />;
    if (volume < 50) return <Volume1 className="text-accent" />;
    return <Volume2 className="text-accent" />;
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div 
        className="relative w-80 h-80 md:w-96 md:h-96"
      >
        <div className={`relative w-full h-full rounded-full shadow-2xl overflow-hidden transition-transform duration-300 ${isPlaying ? 'animate-spin-slow' : ''}`}>
            <Image
                src={track?.albumArt || "https://placehold.co/400x400/111111/111111.png"}
                alt={track?.album || "Vinyl Record"}
                fill
                sizes="(max-width: 768px) 320px, 384px"
                className={`object-cover rounded-full transition-opacity duration-500 ease-in-out`}
                data-ai-hint="album cover"
            />
            <div className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background border border-neutral-400 z-10"></div>
        </div>
      </div>

      <Card className="w-full max-w-md mt-8 bg-transparent border-none shadow-none">
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
