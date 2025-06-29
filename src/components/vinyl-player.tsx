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
}

export function VinylPlayer({
  track,
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  volume,
  onVolumeChange
}: VinylPlayerProps) {
  
  const VolumeIcon = () => {
    if (volume === 0) return <VolumeX className="text-accent" />;
    if (volume < 50) return <Volume1 className="text-accent" />;
    return <Volume2 className="text-accent" />;
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="relative w-80 h-80 md:w-96 md:h-96">
        <Image
          src="https://placehold.co/400x400.png"
          alt="Vinyl record base"
          width={400}
          height={400}
          className="absolute inset-0 z-0"
          data-ai-hint="vinyl record"
        />
        <div className={`absolute inset-0 w-full h-full p-10 transition-transform duration-300 ${isPlaying ? 'animate-spin-slow' : ''}`}>
          <Image
            src={track?.albumArt || "https://placehold.co/300x300.png"}
            alt={track?.album || "Album art"}
            width={300}
            height={300}
            className="rounded-full shadow-2xl"
            data-ai-hint="album cover"
          />
        </div>
      </div>

      <Card className="w-full max-w-md mt-8 bg-transparent border-none shadow-none">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary">{track?.title || "Select a song"}</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">{track?.artist || "to start playing"}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
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
