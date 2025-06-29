"use client";

import { useState } from "react";
import type { Playlist, Track } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Music2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlaylistViewProps {
  playlists: Playlist[];
  selectedPlaylist: Playlist | null;
  currentTrackIndex: number | null;
  onSelectPlaylist: (playlist: Playlist) => void;
  onSelectTrack: (trackIndex: number) => void;
  isPlaying: boolean;
  isLoading?: boolean;
  onFetchTracks: (playlistId: string) => Promise<void>;
}

export function PlaylistView({
  playlists,
  selectedPlaylist,
  currentTrackIndex,
  onSelectPlaylist,
  onSelectTrack,
  isPlaying,
  isLoading = false,
  onFetchTracks,
}: PlaylistViewProps) {
  const [loadingTracks, setLoadingTracks] = useState<Set<string>>(new Set());

  const handleAccordionTriggerClick = (playlist: Playlist) => {
    onSelectPlaylist(playlist);
    if (playlist.tracks.length === 0) {
      setLoadingTracks(prev => new Set(prev).add(playlist.id));
      onFetchTracks(playlist.id).finally(() => {
        setLoadingTracks(prev => {
          const newSet = new Set(prev);
          newSet.delete(playlist.id);
          return newSet;
        });
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="h-full w-full bg-transparent border-2 border-primary/20 shadow-lg backdrop-blur-sm rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">Loading Playlists...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4 pr-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (playlists.length === 0) {
     return (
      <Card className="h-full w-full bg-transparent border-2 border-dashed border-primary/20 shadow-lg backdrop-blur-sm rounded-lg flex items-center justify-center">
        <div className="text-center p-4">
            <CardTitle className="text-2xl font-headline text-primary">No Playlists Found</CardTitle>
            <p className="text-muted-foreground mt-2">Could not find any playlists in your Spotify account.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full w-full bg-transparent border-2 border-primary/20 shadow-lg backdrop-blur-sm rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Your Playlists</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[70vh] pr-4">
          <Accordion type="single" collapsible value={selectedPlaylist?.id}>
            {playlists.map((playlist) => (
              <AccordionItem value={playlist.id} key={playlist.id}>
                <AccordionTrigger
                  className="text-lg font-headline hover:text-primary"
                  onClick={() => handleAccordionTriggerClick(playlist)}
                >
                  {playlist.name}
                </AccordionTrigger>
                <AccordionContent>
                  {loadingTracks.has(playlist.id) ? (
                    <div className="space-y-2 p-3">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-2/3" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  ) : (
                    <ul>
                      {playlist.tracks.length === 0 && !loadingTracks.has(playlist.id) ? (
                        <li className="p-3 text-muted-foreground italic">
                          This playlist appears to be empty.
                        </li>
                      ) : (
                        playlist.tracks.map((track, index) => (
                          <li key={track.id}>
                            <button
                              onClick={() => onSelectTrack(index)}
                              className={cn(
                                "w-full text-left p-3 rounded-md transition-colors duration-200 flex items-center gap-4",
                                selectedPlaylist?.id === playlist.id && currentTrackIndex === index
                                  ? "bg-primary/20 text-foreground font-semibold"
                                  : "hover:bg-primary/10"
                              )}
                            >
                              <Music2 size={20} className={cn("text-muted-foreground", selectedPlaylist?.id === playlist.id && currentTrackIndex === index && isPlaying && "text-accent animate-pulse")} />
                              <div className="flex-grow">
                                <p className="font-semibold">{track.title}</p>
                                <p className="text-sm text-muted-foreground">{track.artist}</p>
                              </div>
                              <p className="ml-auto text-sm text-muted-foreground">{track.duration}</p>
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
