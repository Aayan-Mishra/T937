
"use client";

import type { Track } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume1, Volume2, VolumeX } from "lucide-react";
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
}

export function VinylPlayer({
  track,
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  volume,
  onVolumeChange,
  fallbackUI
}: VinylPlayerProps) {
  
  const VolumeIcon = () => {
    if (volume === 0) return <VolumeX className="text-accent" />;
    if (volume < 50) return <Volume1 className="text-accent" />;
    return <Volume2 className="text-accent" />;
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div 
        className="relative w-80 h-80 md:w-96 md:h-96 transition-all duration-500"
        style={{ animation: isPlaying ? 'shadow-pulse 2s infinite' : 'none' }}
      >
        <div className={`relative w-full h-full rounded-full shadow-2xl overflow-hidden transition-transform duration-300 ${isPlaying ? 'animate-spin-slow' : ''}`}>
            {/* Black vinyl background */}
            <div className="absolute inset-0 w-full h-full bg-neutral-900"></div>
            {/* Album art image */}
            <Image
                src={track?.albumArt || "https://placehold.co/400x400.png"}
                alt={track?.album || "Vinyl Record"}
                fill
                sizes="(max-width: 768px) 320px, 384px"
                className={`object-cover transition-opacity duration-500 ease-in-out ${track ? 'opacity-100' : 'opacity-0'}`}
                data-ai-hint="album cover"
            />
             {/* Spindle hole */}
            <div className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background border border-neutral-400 z-10"></div>
        </div>
      </div>

      <Card className="w-full max-w-md mt-8 bg-transparent border-none shadow-none">
        <CardHeader className="text-center min-h-[90px]">
          <CardTitle className="text-3xl font-headline text-primary">{track?.title || "Select a song"}</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">{track?.artist || "to start playing"}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 min-h-[80px]">
          {fallbackUI || (
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onPrev} disabled={!track} aria-label="Previous track">
                <SkipBack className="w-8 h-8 text-accent" />
              </Button>
              <Button variant="ghost" size="icon" className="w-16 h-16" onClick={onPlayPause} disabled={!track} aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? <Pause className="w-12 h-12 text-primary fill-primary" /> : <Play className="w-12 h-12 text-primary fill-primary" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={onNext} disabled={!track} aria-label="Next track">
                <SkipForward className="w-8 h-8 text-accent" />
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center gap-4 justify-center">
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
