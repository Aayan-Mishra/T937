
"use client";

import { useState } from "react";
import type { Track } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume1, Volume2, VolumeX, Repeat, Download } from "lucide-react";
import Image from 'next/image';
import YouTube from 'react-youtube';
import { useToast } from "@/hooks/use-toast";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

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
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (format: 'mp3' | 'mp4') => {
    if (!youtubeVideoId) {
        toast({
            variant: 'destructive',
            title: 'Download Unavailable',
            description: 'A YouTube video is required for download. Please use the YouTube playback fallback first.',
        });
        return;
    }

    setIsDownloading(true);
    try {
        const response = await fetch('/api/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ youtubeVideoId, format }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to get download link.');
        }
        
        if (data.downloadUrl) {
            window.open(data.downloadUrl, '_blank');
        } else {
            throw new Error('No download URL received from server.');
        }

    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Download Failed',
            description: error.message,
        });
    } finally {
        setIsDownloading(false);
    }
  };
  
  const VolumeIcon = () => {
    if (volume === 0) return <VolumeX className="text-accent" />;
    if (volume < 50) return <Volume1 className="text-accent" />;
    return <Volume2 className="text-accent" />;
  };
  
  return (
    <div className="flex flex-col items-center justify-start w-full h-full pt-8">
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
                   <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={!track || isDownloading || playbackSource !== 'youtube'} aria-label="Download track">
                                <Download className="w-6 h-6 text-accent" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleDownload('mp3')} disabled={isDownloading}>
                                {isDownloading ? 'Preparing...' : 'Download MP3'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload('mp4')} disabled={isDownloading}>
                                {isDownloading ? 'Preparing...' : 'Download MP4'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
